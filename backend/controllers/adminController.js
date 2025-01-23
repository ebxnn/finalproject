import Product from '../models/ProductReviewModel.js';

// Get all products (admin view)
export const getAllProductsForAdmin = async (req, res) => {
  try {
    const products = await Product.find(); // Retrieve all products
    res.status(200).json(products); // Send products to frontend
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
