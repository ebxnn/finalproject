import PDFDocument from 'pdfkit';

class InvoiceService {
  generateInvoice(order, stream) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        doc.pipe(stream);

        // Add company logo/header
        doc.fontSize(20).text('DecorLuxe', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text('Invoice', { align: 'center' });
        doc.moveDown();

        // Order details
        doc.fontSize(12);
        doc.text(`Order ID: ${order._id}`);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
        doc.text(`Status: ${order.paymentStatus}`);
        doc.moveDown();

        // Customer details
        doc.text('Customer Information:');
        doc.text(`Name: ${order.fullName}`);
        doc.text(`Email: ${order.email}`);
        doc.text(`Phone: ${order.phone}`);
        doc.text(`Address: ${order.address}`);
        doc.text(`${order.city}, ${order.state} ${order.zipCode}`);
        doc.text(`Country: ${order.country}`);
        doc.moveDown();

        // Items table
        doc.text('Items:');
        doc.moveDown();
        order.items.forEach(item => {
          doc.text(`${item.product.name} x ${item.quantity}`);
          doc.text(`Price: ₹${item.product.price * item.quantity}`, { align: 'right' });
          doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, { align: 'right' });

        // Payment details
        if (order.blockchainPayment) {
          doc.moveDown();
          doc.fontSize(12).text('Blockchain Payment Details:');
          doc.text(`Transaction Hash: ${order.blockchainPayment.transactionHash}`);
          doc.text(`Wallet Address: ${order.blockchainPayment.walletAddress}`);
          doc.text(`Network: ${order.blockchainPayment.network}`);
        }

        // Digital receipt link
        if (order.digitalReceipt && !order.digitalReceipt.error) {
          doc.moveDown();
          doc.text('Digital Receipt:');
          doc.text(`IPFS Link: ${order.digitalReceipt.url}`);
        }

        // Footer
        doc.moveDown();
        doc.fontSize(10).text('Thank you for shopping with DecorLuxe!', { align: 'center' });

        doc.end();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new InvoiceService(); 