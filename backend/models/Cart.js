// models/Cart.js
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1, // Quantity must be at least 1
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    unique: true, // Ensure one cart per user
  },
  items: [cartItemSchema], // Array of cart items
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
