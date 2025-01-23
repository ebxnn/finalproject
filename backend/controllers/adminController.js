import Product from '../models/ProductReviewModel.js';
import Order from '../models/Order.js';
import moment from 'moment'; // Import moment for date formatting

// Get all products (admin view)
export const getAllProductsForAdmin = async (req, res) => {
  try {
    const products = await Product.find(); // Retrieve all products
    res.status(200).json(products); // Send products to frontend
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Order analytics with revenue and orders over time
export const getOrderAnalytics = async (req, res) => {
  try {
    // Fetch all orders
    const orders = await Order.find();

    // Calculate total number of orders
    const totalOrders = orders.length;

    // Calculate total revenue
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Get the most recent orders (for example, the last 5)
    const recentOrders = orders.slice(-5);

    // Get order count by payment status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    }, {});

    // Group orders by date for "orders over time" and "revenue over time"
    const ordersByDate = orders.reduce((acc, order) => {
      const date = moment(order.createdAt).format('YYYY-MM-DD'); // Group by day
      if (!acc[date]) acc[date] = { totalOrders: 0, totalRevenue: 0 };
      acc[date].totalOrders += 1;
      acc[date].totalRevenue += order.totalAmount;
      return acc;
    }, {});

    // Format the data for frontend charts
    const revenueHistory = Object.keys(ordersByDate).map((date) => ({
      date,
      totalRevenue: ordersByDate[date].totalRevenue,
    }));

    const orderTrends = Object.keys(ordersByDate).map((date) => ({
      date,
      totalOrders: ordersByDate[date].totalOrders,
    }));

    // Send the calculated data as response
    res.status(200).json({
      totalOrders,
      totalRevenue,
      recentOrders,
      ordersByStatus,
      revenueHistory,
      orderTrends,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
