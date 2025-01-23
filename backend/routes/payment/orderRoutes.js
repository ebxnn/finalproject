import express from 'express';
import  { getOrderDetails }  from '../../controllers/payment/orderController.js';

const router = express.Router();

// Define route for getting order details
router.get('/:orderId', getOrderDetails);

export default router;
