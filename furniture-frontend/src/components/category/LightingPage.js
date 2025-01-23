import React, { useState, useEffect } from 'react';
import './Lighting.css'; // Reuse the same CSS as in ProductPage
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Hardcoded base URL
const BASE_URL = 'http://localhost:5000'; // Change this to your actual base URL

const LightingPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('default'); // State for sorting
  const [filter, setFilter] = useState('Lighting'); // State for filtering to lighting category
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem('authToken'); // Get token from local storage
    try {
      const response = await fetch(`${BASE_URL}/api/products/view?category=Lighting`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast.error('You are not authorized. Please log in.', { position: 'top-center' });
        navigate('/login'); // Redirect to login if unauthorized
        return;
      }

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log('Fetched lighting products:', data); // Debug: Check fetched data
      setProducts(data);
    } catch (error) {
      setError('Error fetching products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter products
  const sortedProducts = () => {
    let filteredProducts = products;

    // Filter logic
    if (filter !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === filter);
    }

    console.log('Filtered Products:', filteredProducts); // Debugging line

    // Sort logic
    switch (sortOrder) {
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return filteredProducts;
  };

  // Function to add product to cart
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
        navigate('/login'); // Redirect to login if unauthorized
      } else {
        toast.error('You are not authorized. Please log in.', { position: 'top-center' });
      }
    }
  };

  // Function to add product to wishlist
  const addToWishlist = async (productId) => {
    const token = localStorage.getItem('authToken'); // Get token from local storage

    try {
      // Check if the product is already in the wishlist
      const response = await axios.get(`${BASE_URL}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if the product is already in the wishlist
      const existingProduct = response.data.find(item => item.product._id === productId);
      if (existingProduct) {
        toast.info('This product is already in your wishlist.', { position: 'top-center' });
        return; // Prevent adding the product again if it's already in the wishlist
      }

      // Add the product to the wishlist if it's not already there
      const addResponse = await axios.post(`${BASE_URL}/api/wishlist`, {
        productId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(addResponse.data.message, { position: 'top-center' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('You are not authorized. Please log in.', { position: 'top-center' });
        navigate('/login'); // Redirect to login if unauthorized
      } else {
        toast.error('Error adding product to wishlist', { position: 'top-center' });
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-page">
      <ToastContainer /> {/* Toast notifications */}
      <h1 className="page-title">Lighting Collection</h1>

      {/* Sort and Filter Bar */}
      <div className="sort-filter-bar">
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="default">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>

        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="Lighting">Lighting</option>
        </select>
      </div>

      <div className="products-grid">
        {sortedProducts().map((product) => (
          <div key={product._id} className="product-card">
            <Link to={`/products/${product._id}`} className="product-link">
              <img
                src={product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://via.placeholder.com/150'}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="price">₹ {product.price}</p>
                <p className="description">{product.description}</p>
                {/* <div className="rating">
                  <span>{product.rating || 0}</span>
                  <FaStar className="star-icon" />
                </div> */}
              </div>
            </Link>
            <div className="product-actions">
              <button className="wishlist-btn" onClick={() => addToWishlist(product._id)}>
                <FaHeart /> Wishlist
              </button>
              <button id="addCart" className="cart-btn" onClick={() => addToCart(product._id)}>
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LightingPage;
