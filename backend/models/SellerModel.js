// models/SellerModel.js
import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, default: 'active' }, // Status field, default to active
  role: { type: String, default: 'seller' } // Role field, default to seller
});

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
