import express from 'express';
import { createOrder, verifyPayment } from '../../controllers/payment/checkoutController.js';
import  authMiddleware  from '../../middleware/auth.js';

const router = express.Router();

router.post('/create', authMiddleware, createOrder); // Endpoint for order creation
router.post('/verify-payment', authMiddleware, verifyPayment); // Endpoint for payment verification

export default router;
