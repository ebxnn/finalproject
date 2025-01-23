import Razorpay from 'razorpay';
import express from 'express';

const router = express.Router();

// Initialize Razorpay with your key and secret
const razorpayInstance = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
  key_secret: 'YOUR_RAZORPAY_SECRET_KEY', // Replace with your Razorpay Secret Key
});

// Create an order endpoint
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // Amount in paise (1 INR = 100 paise)
    currency: 'INR',
    receipt: 'receipt_order_74394', // You can provide a unique receipt id
  };

  try {
    // Create an order with Razorpay
    const order = await razorpayInstance.orders.create(options);
    res.json({ orderId: order.id, amount: options.amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
