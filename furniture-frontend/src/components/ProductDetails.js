import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Tabs,
  Tab,
  Fade,
  Divider,
  Tooltip,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { FaCartPlus, FaHeart } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import './ProductDetails.css';

// Hardcoded base URL
const BASE_URL = 'https://mernstack-pro.onrender.com';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [value, setValue] = useState(0); // For Tabs
  const [quantity, setQuantity] = useState(1); // State for quantity

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/products/${id}`);
        setProduct(response.data);
        setSelectedImage(response.data.imageUrls[0]);
      } catch (error) {
        setError('Error fetching product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };


  
  const addToCart = async () => {
    if (!product) return;
  
    const token = localStorage.getItem('authToken');
  
    try {
      const response = await axios.post(
        `${BASE_URL}/api/cart/add`,
        {
          productId: product._id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Show a success message if the item was successfully added to the cart
      toast.success(response.data.message, { position: 'top-center' });
    } catch (error) {
      if (error.response) {
        // Unauthorized access (401 error)
        if (error.response.status === 401) {
          toast.error('You are not authorized. Please log in.', { position: 'top-center' });
        }
        // Stock validation error (400 error with custom message)
        else if (error.response.status === 400 && error.response.data.message) {
          toast.error(error.response.data.message, { position: 'top-center' });
        }
        // Other errors from the server
        else {
          toast.error('You are not authorized. Please log in.', { position: 'top-center' });
        }
      } else {
        // Network or other unexpected errors
        toast.error('Unexpected error. Please try again.', { position: 'top-center' });
      }
    }
  };
  
  // Function to add product to wishlist
  const addToWishlist = async () => {
    if (!product) return;

    const token = localStorage.getItem('authToken');

    try {
      const response = await axios.post(`${BASE_URL}/api/wishlist`, {
        productId: product._id,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.message, { position: 'top-center' });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error('You are not authorized. Please log in.', { position: 'top-center' });
      } else if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message, { position: 'top-center' });
      } else {
        toast.error('Error adding product to wishlist', { position: 'top-center' });
      }
    }
  };

  const handleQuantityChange = (event) => {
    const value = Math.min(event.target.value, product.stockQuantity); // Ensure it doesn't exceed stock quantity
    setQuantity(value);
  };

  if (loading) return <div style={{ color: 'white' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const theme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <div style={{ backgroundColor: '#000000', minHeight: '100vh', padding: '20px' }}>
        <ToastContainer />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={4}>
            {/* Left Column: Images */}
            <Grid item xs={12} md={6}>
              <Paper elevation={4} className="product-details-left" sx={{ padding: 2, backgroundColor: '#1a1a1a' }}>
                <Fade in={true} timeout={600}>
                  <img src={selectedImage} alt={product.name} className="product-main-image" />
                </Fade>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  {product.imageUrls.map((imageUrl, index) => (
                    <Tooltip title={`View Image ${index + 1}`} key={index}>
                      <IconButton onClick={() => setSelectedImage(imageUrl)}>
                        <img
                          src={imageUrl}
                          alt={`Thumbnail ${index + 1}`}
                          className={`product-thumbnail-image ${selectedImage === imageUrl ? 'selected' : ''}`}
                        />
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Right Column: Product Info */}
            <Grid item xs={12} md={6}>
              <Paper elevation={4} className="product-details-right" sx={{ padding: 2, backgroundColor: '#1a1a1a' }}>
                <Typography variant="h4" className="product-title">{product.name}</Typography>
                <Typography variant="h5" color="error" className="product-price">₹ {product.price}</Typography>
                <Typography variant="body1" className="product-description">{product.description}</Typography>

                {/* Display stock left */}
                <Typography variant="body2" className="stock-left">Stock Left: {product.stockQuantity}</Typography>

                {/* Quantity Input */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" className="quantity-label">Quantity:</Typography>
                  <input
                    type="number"
                    min="1"
                    max={product.stockQuantity} // Limit max quantity based on stock left
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="quantity-input" // Apply the CSS class
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={addToCart} sx={{ mr: 2 }}>
                    <FaCartPlus style={{ marginRight: '8px' }} /> Add to Cart
                  </Button>
                  <Button variant="outlined" onClick={addToWishlist}>
                    <FaHeart style={{ marginRight: '8px' }} /> Add to Wishlist
                  </Button>
                </Box>

                {/* Tabbed Information */}
                <Box sx={{ mt: 4 }}>
                  <Tabs value={value} onChange={handleTabChange} variant="fullWidth" textColor="inherit">
                    <Tab label="Description" />
                    <Tab label="Measurements" />
                    <Tab label="Additional Info" />
                  </Tabs>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ padding: 2 }}>
                    {value === 0 && (
                      <Typography variant="body2" className="tab-content">
                        {product.additionalDescription || 'No additional description available.'}
                      </Typography>
                    )}
                    {value === 1 && product.measurements && (
                      <Typography variant="body2" className="tab-content">
                        {`Width: ${product.measurements.width} cm`}
                        <br />
                        {`Depth: ${product.measurements.depth} cm`}
                        <br />
                        {`Height: ${product.measurements.height} cm`}
                        <br />
                        {`Weight: ${product.measurements.weight} kg`}
                      </Typography>
                    )}
                    {value === 2 && (
                      <Typography variant="body2" className="tab-content">No additional information available.</Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default ProductDetails;
