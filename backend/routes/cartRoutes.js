// routes/cartRoutes.js
import express from 'express';
import { addToCart, getCartItems, removeFromCart, updateCartQuantity, clearCart } from '../controllers/CartController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);  // This ensures all following routes require a valid token

// Fetch cart items
router.get('/', getCartItems);

// Add to cart
router.post('/add', addToCart);

// Remove from cart
router.delete('/:cartItemId', removeFromCart);

// Update cart quantity
router.put('/update/:cartItemId', updateCartQuantity);

router.post('/clear-cart', authMiddleware, clearCart);
export default router;
