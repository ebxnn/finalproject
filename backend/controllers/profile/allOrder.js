import Order from '../../models/Order.js'; // Order model
import mongoose from 'mongoose';
// Controller to fetch all orders for the logged-in user
// Controller to fetch all orders for the logged-in user
export const getUserOrders = async (req, res) => {
    try {
      console.log("Authenticated userId:", req.userId); // Log userId to verify it's set properly
  
      if (!req.userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
      }
  
      const orders = await Order.find({ userId: req.userId }).populate({
        path: 'items.product',
        model: 'Product',
      });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user.' });
      }
  
      res.json(orders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  