import express from 'express';
import { getUserOrders } from '../../controllers/profile/allOrder.js'; // Import the controller function
import  authMiddleware from '../../middleware/auth.js'; // Middleware for token verification

const router = express.Router();

// Define the route for fetching user orders
router.get('/', authMiddleware, getUserOrders); // Protect this route with token verification

export default router;
