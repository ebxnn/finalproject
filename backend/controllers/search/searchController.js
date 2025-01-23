import Product from '../../models/ProductReviewModel.js'; // Use import syntax for the Product model

// Search controller function to get similar products
export const searchProducts = async (req, res) => {
    const { query } = req.query;

    try {
        // Search for products matching the keyword in name, description, or category fields
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
            ]
        });

        res.json(products); // Send matching products back as JSON
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).json({ message: "Error fetching search results" });
    }
};
