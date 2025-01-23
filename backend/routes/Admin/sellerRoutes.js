// routes/sellerRoutes.js
import express from 'express';
import { getAllSellers, updateSellerStatus } from '../../controllers/Admin/SellerController.js';

const router = express.Router();

// Route to get all sellers
router.get('/', getAllSellers);
router.put('/:id', updateSellerStatus);
// Add more routes here for creating, updating, and deleting sellers

export default router;
