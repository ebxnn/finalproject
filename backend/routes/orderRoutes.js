import express from 'express';
import { 
  getOrderById, 
  getOrders, 
  downloadInvoice,
  generateInvoice 
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Order routes
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

// Invoice routes
router.get('/:id/invoice', protect, downloadInvoice);
router.get('/:id/generate-invoice', protect, generateInvoice);

export default router; 