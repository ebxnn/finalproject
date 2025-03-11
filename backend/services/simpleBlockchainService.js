import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class SimpleBlockchainService {
  constructor() {
    this.networkType = 'polygon-mumbai';
  }

  async recordTransaction(orderId, amount) {
    try {
      // Create a unique hash combining order details and timestamp
      const timestamp = Date.now();
      const dataToHash = `${orderId}-${amount}-${timestamp}-${process.env.HASH_SECRET}`;
      
      const hash = crypto
        .createHash('sha256')
        .update(dataToHash)
        .digest('hex');

      // Return transaction details
      return {
        hash,
        timestamp,
        status: 'confirmed',
        simulatedTransaction: true // Flag to indicate this is a simulated transaction
      };
    } catch (error) {
      console.error('Hash generation error:', error);
      return null;
    }
  }

  getTransactionUrl(hash) {
    // Return a local URL instead of Polygonscan
    return `/transaction/${hash}`;
  }
}

export default new SimpleBlockchainService(); 