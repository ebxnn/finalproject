// wishlistRoutes.js
import express from 'express';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/WishlistController.js';
import verifyToken from '../middleware/authenticateToken.js'; // Import your token verification middleware

const router = express.Router();

// Add product to wishlist
router.post('/', verifyToken, addToWishlist);

// Get user's wishlist
router.get('/', verifyToken, getWishlist);

// Remove product from wishlist
router.delete('/:wishlistItemId', verifyToken, removeFromWishlist);

export default router;
