import express from 'express';
import { getSellerDetails, updateSellerDetails, getCurrentSeller } from '../../controllers/seller/sellerController.js';
import authMiddleware from '../../middleware/auth.js';  // Ensure you have this middleware

const router = express.Router();

// Route to get the current logged-in seller details (authenticated seller only)
router.get('/me', authMiddleware, getCurrentSeller);

// Route to get seller by ID (for admin or other users with permissions)
router.get('/:id', authMiddleware, getSellerDetails);

// Route to update seller details (only the seller or authorized user should update)
router.put('/:id', authMiddleware, updateSellerDetails);

export default router;
