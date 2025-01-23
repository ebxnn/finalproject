import React, { useState, useEffect } from 'react';
import './searchResult.css';
import { FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import { ToastContainer, toast } from 'react-toastify'; // Import Toast for notifications
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const SearchResultsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('default'); // State for sorting
  const [filter, setFilter] = useState('all'); // State for filtering

  const location = useLocation(); // Get the location object
  const query = new URLSearchParams(location.search).get('query'); // Get search query from URL

  // Hardcoded base URL
  const BASE_URL = 'http://localhost:5000'; // Just the base URL

  useEffect(() => {
    fetchSearchResults();
  }, [query]); // Fetch results whenever the query changes

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/search`, { // Append /api/search here
        params: { query: query }
      });
      setProducts(response.data); // Set the products returned from the search
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
      const response = await axios.post(`${BASE_URL}/api/cart`, { // Append /api/cart here
        productId,
        quantity: 1, // Assuming 1 item for simplicity
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to headers
        },
      });
      toast.success(response.data.message, { position: 'top-center' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('You are not authorized. Please log in.', { position: 'top-center' });
      } else {
        toast.error('Error adding product to cart', { position: 'top-center' });
      }
    }
  };

  // Function to add product to wishlist
  const addToWishlist = async (productId) => {
    const token = localStorage.getItem('authToken'); // Get token from local storage

    try {
      const response = await axios.post(`${BASE_URL}/api/wishlist`, { // Append /api/wishlist here
        productId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to headers
        },
      });
      toast.success(response.data.message, { position: 'top-center' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('You are not authorized. Please log in.', { position: 'top-center' });
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
      <h1 className="page-title">Search Results for "{query}"</h1>

      {/* Sort and Filter Bar */}
      <div className="sort-filter-bar">
        <select onChange={(e) => setSortOrder(e.target.value)} value={sortOrder}>
          <option value="default">Sort by</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>

        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="all">All Categories</option>
          <option value="Living Room Furniture">Living Room Furniture</option>
          <option value="Bedroom Furniture">Bedroom Furniture</option>
          <option value="Dining Room Furniture">Dining Room Furniture</option>
          <option value="Office Furniture">Office Furniture</option>
          <option value="Outdoor Furniture">Outdoor Furniture</option>
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
                <div className="rating">
                  <span>{product.rating || 0}</span>
                  <FaStar className="star-icon" />
                </div>
              </div>
            </Link>
            <div className="product-actions">
              <button className="wishlist-btn" onClick={() => addToWishlist(product._id)}>
                <FaHeart /> Wishlist
              </button>
              <button className="cart-btn" onClick={() => addToCart(product._id)}>
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;
