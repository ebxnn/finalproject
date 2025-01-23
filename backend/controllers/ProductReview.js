import Product from '../models/ProductReviewModel.js';
// Add new product
export const addProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      additionalDescription, 
      category, 
      subcategory, 
      price, 
      stockQuantity, 
      status, 
      imageUrls, 
      measurements 
    } = req.body;

    // Ensure imageUrls is an array
    const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

    // Extract userId from the JWT token
    const userId = req.userId; // Assuming userId is set in the request (see middleware below)

    // Create a new product object
    const newProduct = new Product({
      name,
      description,
      additionalDescription,
      category,
      subcategory,
      price,
      stockQuantity,
      imageUrls: urls,
      measurements, // Include measurements
      status,
      userId, // Set the userId from the token
    });

    // Save the product to the database
    await newProduct.save();

    // Respond with the created product
    return res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({
      message: "Error adding product",
      error: error.message,
    });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    // Fetch only active products
    const products = await Product.find({ status: 'active' }); // Add filter for active status

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products. Please try again later.',
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      additionalDescription, 
      category, 
      subcategory, 
      price, 
      stockQuantity, 
      imageUrls, 
      status, 
      measurements 
    } = req.body;

    // Ensure imageUrls is an array
    const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        additionalDescription,
        category,
        subcategory,
        price,
        stockQuantity,
        imageUrls: urls,
        measurements,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Failed to update product. Please try again later.',
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      error: 'Failed to delete product. Please try again later.',
    });
  }
};

export const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.userId; // Retrieve userId from the auth middleware

    // Find products where userId matches the logged-in seller's ID
    const products = await Product.find({ userId: sellerId });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products for seller:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

// Get products by category and subcategory
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.query;

    // Validate that categoryId and subcategoryId are ObjectId types
    if (!categoryId || !subcategoryId) {
      return res.status(400).json({ message: 'Category and subcategory IDs are required.' });
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(subcategoryId)) {
      return res.status(400).json({ message: 'Invalid category or subcategory ID.' });
    }

    // Query the products based on categoryId and subcategoryId
    const products = await Product.find({
      category: categoryId,   // Match category by ObjectId
      subcategory: subcategoryId, // Match subcategory by ObjectId
      status: 'active', // Only active products
    });

    // Handle case when no products are found
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this category and subcategory.' });
    }

    // Send back the list of products
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products. Please try again later.' });
  }
};