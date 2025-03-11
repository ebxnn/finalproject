import pinataSDK from '@pinata/sdk';
import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PinataService {
  constructor() {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
      throw new Error('Pinata credentials not found in environment variables');
    }

    this.pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_SECRET_KEY
    );
  }

  async generateReceiptImage(order) {
    try {
      // Create canvas
      const canvas = createCanvas(800, 1200);
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add receipt content
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(`Digital Receipt #${order._id}`, 40, 50);

      ctx.font = '18px Arial';
      ctx.fillText(`Customer: ${order.fullName}`, 40, 100);
      ctx.fillText(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 40, 130);

      // Add items
      let yPos = 180;
      ctx.font = 'bold 18px Arial';
      ctx.fillText('Items:', 40, yPos);
      yPos += 30;

      ctx.font = '16px Arial';
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const productName = item.product?.name || 'Product';
          const price = item.product?.price || 0;
          ctx.fillText(`${productName} x${item.quantity}`, 40, yPos);
          ctx.fillText(`₹${price * item.quantity}`, 600, yPos);
          yPos += 25;
        }
      }

      // Add total
      yPos += 20;
      ctx.font = 'bold 18px Arial';
      const total = order.totalAmount || 0;
      ctx.fillText(`Total: ₹${total}`, 600, yPos);

      // Add blockchain details
      if (order.blockchainPayment) {
        yPos += 40;
        ctx.font = '16px Arial';
        ctx.fillText(`Transaction Hash: ${order.blockchainPayment.transactionHash || 'N/A'}`, 40, yPos);
        yPos += 25;
        ctx.fillText(`Wallet Address: ${order.blockchainPayment.walletAddress || 'N/A'}`, 40, yPos);
      }

      // Save image temporarily
      const imagePath = path.join(__dirname, `../../temp/receipt_${order._id}.png`);
      const buffer = canvas.toBuffer('image/png');
      
      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, '../../temp'))) {
        fs.mkdirSync(path.join(__dirname, '../../temp'), { recursive: true });
      }
      
      fs.writeFileSync(imagePath, buffer);
      return imagePath;
    } catch (error) {
      console.error('Error generating receipt image:', error);
      throw error;
    }
  }

  async storeReceipt(order) {
    try {
      // Generate receipt image
      console.log('Generating receipt image...');
      const imagePath = await this.generateReceiptImage(order);
      console.log('Receipt image generated successfully');

      // Upload image to IPFS
      console.log('Uploading image to IPFS...');
      const imageResult = await this.pinata.pinFromFS(imagePath);
      console.log('Image uploaded successfully:', imageResult.IpfsHash);

      // Create metadata
      const metadata = {
        name: `Digital Receipt #${order._id}`,
        description: `Digital receipt for order ${order._id}`,
        image: `ipfs://${imageResult.IpfsHash}`,
        attributes: {
          orderId: order._id.toString(),
          customer: order.fullName || 'N/A',
          totalAmount: (order.totalAmount || 0).toString(),
          date: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
          paymentDetails: order.blockchainPayment || {},
          items: order.items?.map(item => ({
            product: item.product?.name || 'Product',
            quantity: item.quantity || 0,
            price: item.product?.price || 0
          })) || []
        }
      };

      // Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataResult = await this.pinata.pinJSONToIPFS(metadata);
      console.log('Metadata uploaded successfully:', metadataResult.IpfsHash);

      // Clean up temporary file
      fs.unlinkSync(imagePath);

      return {
        url: `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageResult.IpfsHash}`,
        ipfsHash: metadataResult.IpfsHash,
        imageIpfsHash: imageResult.IpfsHash
      };
    } catch (error) {
      console.error('Error storing receipt:', error);
      return {
        url: null,
        imageUrl: null,
        ipfsHash: null,
        imageIpfsHash: null,
        error: error.message
      };
    }
  }
}

export default new PinataService(); 