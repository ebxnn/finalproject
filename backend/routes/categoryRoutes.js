import express from 'express';
import Product from '../models/ProductReviewModel.js';

const router = express.Router();

// Route to get products by category
router.get('/lighting', async (req, res) => {
    const { category } = req.query;

    try {
        // Find products where category matches the provided query and status is 'active'
        const products = await Product.find({ 
            category: category,
            status: 'active' // Filter for active products only
        });

        if (products.length === 0) {
            return res.status(404).json({ message: 'No active products found for the given category.' });
        }

        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching products from the database.' });
    }
});

export default router;
