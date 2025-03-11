import Order from '../models/Order.js';
import PDFDocument from 'pdfkit';

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('userId', 'firstName lastName email')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const formattedOrder = {
      ...order,
      paymentDetails: {
        status: order.paymentStatus,
        blockchain: order.blockchainPayment,
        receipt: order.digitalReceipt
      },
      items: order.items.map(item => ({
        ...item,
        totalPrice: item.product.price * item.quantity
      }))
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .lean();

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ message: 'Invoice available only for paid orders' });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${order._id}.pdf`);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add company header
    doc.fontSize(20).text('DecorLuxe', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Invoice', { align: 'center' });
    doc.moveDown();

    // Add order details
    doc.fontSize(12);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    // Add customer details
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

    // Table headers
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

    // Add total
    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, { align: 'right' });

    // Add blockchain payment details if available
    if (order.blockchainPayment) {
      doc.moveDown();
      doc.fontSize(14).text('Blockchain Payment Details');
      doc.fontSize(12);
      doc.text(`Transaction Hash: ${order.blockchainPayment.transactionHash}`);
      doc.text(`Network: ${order.blockchainPayment.network}`);
      doc.text(`Status: ${order.blockchainPayment.status}`);
    }

    // Add digital receipt link if available
    if (order.digitalReceipt?.url) {
      doc.moveDown();
      doc.fontSize(12).text('Digital Receipt:');
      doc.text(`IPFS Link: ${order.digitalReceipt.url}`);
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