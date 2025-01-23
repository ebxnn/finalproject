import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './WishlistPage.css'; // Importing the CSS

// Hardcoded base URL
const BASE_URL = 'http://localhost:5000';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get(`${BASE_URL}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWishlistItems(response.data); // This will be an empty array if there are no items
      setError(null); // Reset error if the request is successful
    } catch (error) {
      // setError('Login to use Wishlist');
      toast.error('Login to use Wishlist', { position: 'top-center', autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.delete(`${BASE_URL}/api/wishlist/${wishlistItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Item removed from wishlist.', { position: 'top-center', autoClose: 3000 });
      fetchWishlist(); // Refresh the wishlist after removing an item
    } catch (error) {
      toast.error('Error removing item from wishlist.', { position: 'top-center', autoClose: 3000 });
    }
  };

  // Function to move product from wishlist to cart
  const moveToCart = async (productId) => {
    const token = localStorage.getItem('authToken');

    try {
      // Call the addToCart function
      await addToCart(productId);

      // After adding the product to the cart, remove it from the wishlist
      const wishlistItem = wishlistItems.find(item => item.product._id === productId);
      await removeFromWishlist(wishlistItem._id); // Remove the item from the wishlist after moving to cart

    } catch (error) {
      toast.error('Error moving item to cart.', { position: 'top-center', autoClose: 3000 });
    }
  };

  // Function to add product to cart (reuse your previous addToCart logic here)
  const addToCart = async (productId) => {
    const token = localStorage.getItem('authToken'); // Get token from local storage
  
    try {
      // Check if the product is already in the cart
      const response = await axios.get(`${BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Check if the product is already in the cart
      const existingProduct = response.data.find(item => item.product._id === productId);
      if (existingProduct) {
        toast.info('This product is already in your cart.', { position: 'top-center' });
        return; // Prevent adding the product again if it's already in the cart
      }
  
      // Add the product to the cart if it's not already there
      const addResponse = await axios.post(`${BASE_URL}/api/cart/add`, {
        productId,
        quantity: 1, // Assuming 1 item for simplicity
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      toast.success(addResponse.data.message, { position: 'top-center' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('You are not authorized. Please log in.', { position: 'top-center' });
      } else {
        toast.error('Error adding product to cart', { position: 'top-center' });
      }
    }
  };

  if (loading) return <div className="wishlist-loading">Loading...</div>;
  if (error) return <div className="wishlist-error">{error}</div>;

  return (
    <>
      <ToastContainer />
      <div className="wishlist-component">
        <h2 className="wishlist-title">My Wishlist</h2>
        {wishlistItems.length === 0 ? (
          <p className="wishlist-empty-msg">Your wishlist is empty.</p>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div className="wishlist-card" key={item._id}>
                <img
                  src={item.product.imageUrls[0] || 'https://via.placeholder.com/400x300.png?text=Product+Image'}
                  className="wishlist-image"
                  alt={item.product.name}
                />
                <div className="wishlist-body">
                  <h5 className="wishlist-item-name">{item.product.name}</h5>
                  <p className="wishlist-price">₹ {item.product.price}</p>
                  <div className="wishlist-btn-group">
                    <button className="wishlist-move-btn" onClick={() => moveToCart(item.product._id)}>
                      Move to Bag
                    </button>
                    <button className="wishlist-remove-btn" onClick={() => removeFromWishlist(item._id)}>
                      <FaTrash /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
