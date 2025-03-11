import mongoose from 'mongoose'; // Import mongoose to validate ObjectId
import Order from '../../models/Order.js'; // Ensure this path is correct
import { ethers } from 'ethers';
import PDFDocument from 'pdfkit';

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId; // From auth middleware

    // Find order and verify ownership
    const order = await Order.findOne({ 
      _id: orderId,
      userId: userId // Ensure user can only access their own orders
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details.' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, blockchainPayment } = req.body;
    const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_MUMBAI_RPC);

    // Enhanced security checks
    const tx = await provider.getTransaction(blockchainPayment.transactionHash);
    const receipt = await provider.getTransactionReceipt(blockchainPayment.transactionHash);
    
    // 1. Verify transaction exists
    if (!tx || !receipt) {
      return res.status(400).json({ message: 'Invalid transaction' });
    }

    // 2. Verify transaction success
    if (receipt.status !== 1) {
      return res.status(400).json({ message: 'Transaction failed' });
    }

    // 3. Verify amount
    const expectedAmount = ethers.utils.parseEther(order.totalAmount.toString());
    if (tx.value.toString() !== expectedAmount.toString()) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    // 4. Verify recipient address
    if (tx.to.toLowerCase() !== process.env.ADMIN_WALLET_ADDRESS.toLowerCase()) {
      return res.status(400).json({ message: 'Invalid recipient address' });
    }

    // 5. Verify block confirmations
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;
    if (confirmations < 3) { // Wait for 3 block confirmations
      return res.status(400).json({ message: 'Waiting for confirmations' });
    }

    // Update order with verified payment details
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          'blockchainPayment.verified': true,
          'blockchainPayment.confirmations': confirmations,
          'blockchainPayment.verifiedAt': new Date(),
          paymentStatus: 'Verified'
        }
      },
      { new: true }
    );

    res.status(200).json({ order });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);

    // Add company logo/header
    doc.fontSize(20).text('DecorLuxe', { align: 'center' });
    doc.fontSize(16).text('Invoice', { align: 'center' });
    doc.moveDown();

    // Add order information
    doc.fontSize(12);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    // Add customer information
    doc.fontSize(14).text('Customer Information');
    doc.fontSize(12);
    doc.text(`Name: ${order.fullName}`);
    doc.text(`Email: ${order.email}`);
    doc.text(`Phone: ${order.phone}`);
    doc.moveDown();

    // Add shipping address
    doc.fontSize(14).text('Shipping Address');
    doc.fontSize(12);
    doc.text(order.address);
    doc.text(`${order.city}, ${order.state} ${order.zipCode}`);
    doc.text(order.country);
    doc.moveDown();

    // Add items table
    doc.fontSize(14).text('Order Items');
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    doc.fontSize(12);
    doc.text('Item', 50, tableTop);
    doc.text('Quantity', 300, tableTop);
    doc.text('Price', 400, tableTop);
    doc.text('Total', 500, tableTop);

    // Draw header line
    doc.moveTo(50, tableTop + 20)
       .lineTo(550, tableTop + 20)
       .stroke();

    // Add items
    let y = tableTop + 30;
    order.items.forEach(item => {
      doc.text(item.product.name, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`₹${item.product.price}`, 400, y);
      doc.text(`₹${item.product.price * item.quantity}`, 500, y);
      y += 20;
    });

    // Draw bottom line
    doc.moveTo(50, y)
       .lineTo(550, y)
       .stroke();

    // Add total
    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, { align: 'right' });

    // Add payment information if available
    if (order.blockchainPayment) {
      doc.moveDown();
      doc.fontSize(14).text('Payment Information');
      doc.fontSize(12);
      doc.text(`Transaction Hash: ${order.blockchainPayment.transactionHash}`);
      doc.text(`Network: ${order.blockchainPayment.network}`);
      doc.text(`Status: ${order.blockchainPayment.status}`);
    }

    // Add footer
    doc.fontSize(10)
       .text(
         'Thank you for shopping with DecorLuxe!',
         50,
         doc.page.height - 50,
         { align: 'center' }
       );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const userId = req.userId;
    const order = await Order.findOne({
      _id: req.params.id,
      userId: userId
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ message: 'Invoice available only for paid orders' });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);

    // Create PDF document with better margins
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });

    // Pipe the PDF to the response
    doc.pipe(res);

    // Define consistent spacing and positioning
    const pageWidth = doc.page.width;
    const leftMargin = 50;
    const rightMargin = pageWidth - 50;
    const contentWidth = rightMargin - leftMargin;

    // Add company header with proper spacing
    doc.fontSize(24).font('Helvetica-Bold')
       .text('DecorLuxe', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(16).font('Helvetica')
       .text('INVOICE', { align: 'center' });
    doc.moveDown(1);

    // Add invoice details in a structured layout
    const detailsX = leftMargin;
    const detailsWidth = contentWidth / 2;

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Invoice Details', detailsX, doc.y);
    doc.moveDown(0.5);
    
    doc.font('Helvetica').fontSize(10);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, detailsX);
    doc.text(`Order ID: ${order._id}`, detailsX);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, detailsX);
    doc.moveDown(1);

    // Customer information in a box
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Bill To', detailsX);
    doc.moveDown(0.5);
    
    doc.font('Helvetica').fontSize(10);
    doc.text(order.fullName, detailsX);
    doc.text(order.email, detailsX);
    doc.text(order.phone, detailsX);
    doc.text(order.address, detailsX);
    doc.text(`${order.city}, ${order.state} ${order.zipCode}`, detailsX);
    doc.text(order.country, detailsX);
    doc.moveDown(1);

    // Items table with proper alignment
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Order Items', detailsX);
    doc.moveDown(0.5);

    // Table headers with fixed positions
    const colWidths = {
      item: 200,
      qty: 70,
      price: 100,
      total: 100
    };

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Item', detailsX, doc.y);
    doc.text('Qty', detailsX + colWidths.item, doc.y - doc.currentLineHeight());
    doc.text('Price', detailsX + colWidths.item + colWidths.qty, doc.y - doc.currentLineHeight());
    doc.text('Total', detailsX + colWidths.item + colWidths.qty + colWidths.price, doc.y - doc.currentLineHeight());

    // Draw header line
    doc.moveTo(detailsX, doc.y + 5)
       .lineTo(rightMargin, doc.y + 5)
       .stroke();
    doc.moveDown(0.5);

    // Add items with proper alignment
    let totalAmount = 0;
    doc.font('Helvetica').fontSize(10);
    
    order.items.forEach(item => {
      const itemTotal = item.product.price * item.quantity;
      totalAmount += itemTotal;

      doc.text(item.product.name, detailsX, doc.y);
      doc.text(item.quantity.toString(), detailsX + colWidths.item, doc.y - doc.currentLineHeight());
      doc.text(`₹${item.product.price.toFixed(2)}`, detailsX + colWidths.item + colWidths.qty, doc.y - doc.currentLineHeight());
      doc.text(`₹${itemTotal.toFixed(2)}`, detailsX + colWidths.item + colWidths.qty + colWidths.price, doc.y - doc.currentLineHeight());
      doc.moveDown(0.5);
    });

    // Draw total line
    doc.moveTo(detailsX, doc.y)
       .lineTo(rightMargin, doc.y)
       .stroke();
    doc.moveDown(0.5);

    // Add total amount
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(
      `Total Amount: ₹${totalAmount.toFixed(2)}`,
      detailsX,
      doc.y,
      { align: 'right' }
    );
    doc.moveDown(1);

    // Add blockchain payment details if available
    if (order.blockchainPayment) {
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Payment Details', detailsX);
      doc.moveDown(0.5);
      
      doc.font('Helvetica').fontSize(10);
      doc.text(`Transaction Hash: ${order.blockchainPayment.transactionHash}`, detailsX);
      doc.text(`Network: ${order.blockchainPayment.network}`, detailsX);
      doc.text(`Status: ${order.blockchainPayment.status}`, detailsX);
      doc.moveDown(1);
    }

    // Add footer
    doc.font('Helvetica').fontSize(10)
       .text(
         'Thank you for shopping with DecorLuxe!',
         leftMargin,
         doc.page.height - 50,
         { align: 'center', width: contentWidth }
       );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Error generating invoice' });
  }
}; 