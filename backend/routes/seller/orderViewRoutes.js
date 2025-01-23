import express from 'express';
import  { getOrdersForSeller }  from '../../controllers/seller/orderView.js'; // Adjust path as necessary
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();


// Route to get all orders for the seller
router.get('/', authMiddleware, getOrdersForSeller); // Protected route to get seller's orders

export default router;
