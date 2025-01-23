// controllers/WishlistController.js
import Wishlist from '../models/wishlist.js';
import jwt from 'jsonwebtoken';

export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id; // Assuming user ID is extracted from token

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required.' });
  }

  try {
    // Check if the item is already in the wishlist
    const wishlistItem = await Wishlist.findOne({ user: userId, product: productId });

    if (wishlistItem) {
      return res.status(400).json({ message: 'Product is already in the wishlist.' });
    }

    // Create a new wishlist item
    const newWishlistItem = new Wishlist({
      user: userId,     // Set the user ID
      product: productId // Set the product ID
    });

    await newWishlistItem.save();

    return res.status(201).json({ message: 'Product added to wishlist.' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({ message: 'Failed to add to wishlist.' });
  }
};


// Fetch user's wishlist
// controllers/WishlistController.js
export const getWishlist = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Safely access the token
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Use user ID from decoded token

    const wishlistItems = await Wishlist.find({ user: userId }).populate('product');
    
    // Return an empty array if no items found, instead of a 404 error
    if (!wishlistItems.length) {
      return res.status(200).json([]);
    }
    
    return res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error); // Log the error
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// controllers/WishlistController.js


// Remove an item from the wishlist
export const removeFromWishlist = async (req, res) => {
  const { wishlistItemId } = req.params;
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id; // Extract user ID from the token

    // Find and delete the wishlist item
    const wishlistItem = await Wishlist.findOne({ _id: wishlistItemId, user: userId });
    
    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found.' });
    }

    await Wishlist.deleteOne({ _id: wishlistItemId, user: userId });

    return res.status(200).json({ message: 'Item removed from wishlist.' });
  } catch (error) {
    console.error('Error removing item from wishlist:', error); // Log the error
    return res.status(500).json({ message: 'Failed to remove item from wishlist.', error: error.message });
  }
};