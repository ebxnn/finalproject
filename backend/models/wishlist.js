// wishlist.js (Wishlist Schema)
import mongoose from 'mongoose';
import User from './UserModel.js';
import Product from './ProductReviewModel.js';

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
