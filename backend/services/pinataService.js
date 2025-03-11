import pinataSDK from '@pinata/sdk';
import sharp from 'sharp';
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
      // Create a new SVG with receipt content
      const svgContent = `
        <svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="1200" fill="white"/>
          <style>
            .title { font: bold 24px sans-serif; }
            .normal { font: 18px sans-serif; }
            .small { font: 16px sans-serif; }
            .bold { font: bold 18px sans-serif; }
          </style>
          
          <text x="40" y="50" class="title">Digital Receipt #${order._id}</text>
          <text x="40" y="100" class="normal">Customer: ${order.fullName}</text>
          <text x="40" y="130" class="normal">Date: ${new Date(order.createdAt).toLocaleDateString()}</text>
          
          <text x="40" y="180" class="bold">Items:</text>
          ${order.items?.map((item, index) => {
            const yPos = 210 + (index * 25);
            const productName = item.product?.name || 'Product';
            const price = item.product?.price || 0;
            return `
              <text x="40" y="${yPos}" class="small">${productName} x${item.quantity}</text>
              <text x="600" y="${yPos}" class="small">₹${price * item.quantity}</text>
            `;
          }).join('') || ''}
          
          <text x="600" y="${210 + ((order.items?.length || 0) * 25) + 20}" class="bold">
            Total: ₹${order.totalAmount || 0}
          </text>
          
          ${order.blockchainPayment ? `
            <text x="40" y="${210 + ((order.items?.length || 0) * 25) + 60}" class="small">
              Transaction Hash: ${order.blockchainPayment.transactionHash || 'N/A'}
            </text>
            <text x="40" y="${210 + ((order.items?.length || 0) * 25) + 85}" class="small">
              Wallet Address: ${order.blockchainPayment.walletAddress || 'N/A'}
            </text>
          ` : ''}
        </svg>
      `;

      // Convert SVG to PNG using sharp
      const imagePath = path.join(__dirname, `../../temp/receipt_${order._id}.png`);
      
      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, '../../temp'))) {
        fs.mkdirSync(path.join(__dirname, '../../temp'), { recursive: true });
      }

      // Convert SVG to PNG and save
      await sharp(Buffer.from(svgContent))
        .png()
        .toFile(imagePath);

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

// Example image processing
async function processImage(buffer) {
  return sharp(buffer)
    .resize(800, 600)
    .jpeg({ quality: 80 })
    .toBuffer();
} 

// You might not need canvas at all for this
async function createMetadata(data) {
  return {
    name: data.name,
    description: data.description,
    image: data.imageUrl,
    attributes: data.attributes
  };
} 

async function createThumbnail(imageBuffer) {
  return sharp(imageBuffer)
    .resize(200, 200, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .toBuffer();
} 