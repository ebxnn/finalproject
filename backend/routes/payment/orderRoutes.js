import express from 'express';
import { getOrderDetails, downloadInvoice } from '../../controllers/payment/orderController.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

// Protected routes using auth middleware
router.get('/:orderId', authMiddleware, getOrderDetails);
router.get('/:id/invoice', authMiddleware, downloadInvoice);

export default router;
