import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  
  items: [{ 
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
  }],
  
  totalAmount: { type: Number, required: true },
  
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed'], 
    default: 'Pending' 
  },

  paymentId: { type: String, index: true },
  razorpayOrderId: { type: String, index: true },
  
  // Simplified blockchain fields
  blockchainHash: { 
    type: String,
    sparse: true 
  },
  blockchainStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  
  // Add blockchain payment fields
  blockchainPayment: {
    walletAddress: { type: String },
    transactionHash: { type: String },
    amount: { type: String }, // in ETH/MATIC
    network: { type: String, default: 'Polygon Mumbai' },
    status: { 
      type: String, 
      enum: ['Pending', 'Confirmed', 'Failed'],
      default: 'Pending'
    }
  },

  // Replace nftReceipt with digitalReceipt
  digitalReceipt: {
    url: String,
    imageUrl: String,
    ipfsHash: String,
    error: String,
    createdAt: Date
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
