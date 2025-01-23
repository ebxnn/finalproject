import mongoose from 'mongoose'; // Import mongoose to validate ObjectId
import Order from '../../models/Order.js'; // Ensure this path is correct

export const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID format.' });
  }

  try {
    // Find the order by ID and populate product details
    const order = await Order.findById(orderId).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Respond with the order details
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details for order ID:', orderId, error.message);
    res.status(500).json({ message: 'Error fetching order details.', error: error.message });
  }
};
