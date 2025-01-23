import mongoose from 'mongoose';
import User from './UserModel.js';
import Seller from './SellerModel.js';

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Reference to User
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: false }, // Reference to Seller
  accountType: { type: String, enum: ['user', 'seller'], required: true }, // Define whether it's a user or seller account
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
