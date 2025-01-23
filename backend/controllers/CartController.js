import Cart from '../models/Cart.js';
import Product from '../models/ProductReviewModel.js';

// Add or update product in the cart
// cartController.js
export const getCartItems = async (req, res) => {
  const userId = req.userId; // Access the userId from the JWT token

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for this user.' });
    }
    return res.status(200).json(cart.items);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};


export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Product ID and valid quantity are required.' });
  }

  try {
    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if requested quantity exceeds the available stock
    if (quantity > product.stockQuantity) {
      return res.status(400).json({ message: 'Quantity exceeds available stock.' });
    }

    // Check if a cart already exists for the user
    let cart = await Cart.findOne({ user: userId });

    // If no cart exists, create a new one
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }]
      });
      await cart.save();
      return res.status(200).json({ message: 'Cart created and product added!', cart });
    }

    // If the cart exists, check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    
    // If product already in the cart, update the quantity
    if (existingItemIndex > -1) {
      // Check if the new quantity exceeds available stock
      if (cart.items[existingItemIndex].quantity + quantity > product.stockQuantity) {
        return res.status(400).json({ message: 'Cannot add more of this product. Quantity exceeds available stock.' });
      }
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // If product not in cart, add it
      cart.items.push({ product: productId, quantity });
    }

    // Save the updated cart
    await cart.save();
    return res.status(200).json({ message: 'Product added to cart successfully', cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};


// Remove an item from the cart
export const removeFromCart = async (req, res) => {
  const userId = req.userId;
  const { cartItemId } = req.params;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    // Find the index of the item to remove
    const itemIndex = cart.items.findIndex((item) => item._id.toString() === cartItemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart.' });
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);
    await cart.save();

    return res.status(200).json({ message: 'Item removed from cart.' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};


// Update the quantity of a product in the cart
export const updateCartQuantity = async (req, res) => {
  const { cartItemId } = req.params;  // Get the cart item ID from the URL parameter
  const { quantity } = req.body;  // Get the new quantity from the request body
  const userId = req.userId;  // Get the user ID from the token

  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Please provide a valid quantity.' });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    // Find the item to update by cartItemId
    const cartItem = cart.items.find(item => item._id.toString() === cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in the cart.' });
    }

    // Update the quantity of the item
    cartItem.quantity = quantity;

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ message: 'Cart item quantity updated successfully.', cart });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return res.status(500).json({ message: 'Server error, please try again later.' });
  }
};


export const clearCart = async (req, res) => {
  const userId = req.userId;

  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [] }, // Empty the cart
      { new: true } // Return the updated document
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    res.status(200).json({ message: 'Cart cleared successfully.', cart });
  } catch (error) {
    console.error('Error clearing cart:', error.message);
    res.status(500).json({ message: 'Error clearing cart.', error: error.message });
  }
};