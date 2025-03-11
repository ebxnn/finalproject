import { NFTStorage, File, Blob } from 'nft.storage';
import { createCanvas } from 'canvas';

class NFTService {
  constructor() {
    if (!process.env.NFT_STORAGE_KEY) {
      console.error('NFT_STORAGE_KEY is not set in environment variables');
      throw new Error('NFT_STORAGE_KEY is required');
    }
    
    try {
      this.storage = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });
      console.log('NFT.Storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize NFT.Storage:', error);
      throw error;
    }
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

      // Add blockchain transaction details
      if (order.blockchainPayment) {
        yPos += 40;
        ctx.font = '16px Arial';
        ctx.fillText(`Transaction Hash: ${order.blockchainPayment.transactionHash || 'N/A'}`, 40, yPos);
        yPos += 25;
        ctx.fillText(`Wallet Address: ${order.blockchainPayment.walletAddress || 'N/A'}`, 40, yPos);
      }

      // Convert canvas to buffer and create file
      const buffer = canvas.toBuffer('image/png');
      return new File([buffer], 'receipt.png', { type: 'image/png' });
    } catch (error) {
      console.error('Error generating receipt image:', error);
      throw new Error('Failed to generate receipt image');
    }
  }

  async storeReceipt(order) {
    try {
      if (!order || !order._id) {
        throw new Error('Invalid order data');
      }

      // Generate receipt image
      console.log('Generating receipt image...');
      const receiptImage = await this.generateReceiptImage(order);
      console.log('Receipt image generated successfully');

      // Create metadata
      const metadata = {
        name: `Digital Receipt #${order._id}`,
        description: `Digital receipt for order ${order._id}`,
        image: receiptImage,  // NFT.Storage expects the actual file here
        properties: {
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

      // Store using NFT.Storage
      console.log('Uploading to NFT.Storage...');
      const result = await this.storage.store(metadata);
      console.log('Upload complete. Token URI:', result.url);

      return {
        url: result.url,
        ipfsHash: result.ipnft
      };
    } catch (error) {
      console.error('Error storing receipt:', error);
      return {
        url: null,
        ipfsHash: null,
        error: error.message
      };
    }
  }
}

let nftService;
try {
  nftService = new NFTService();
  console.log('NFTService initialized successfully');
} catch (error) {
  console.error('Failed to initialize NFTService:', error);
  nftService = {
    storeReceipt: async () => ({
      url: null,
      ipfsHash: null,
      error: 'NFTService failed to initialize'
    })
  };
}

export default nftService; 