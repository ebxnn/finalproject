import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Create a dark theme using Material-UI's ThemeProvider
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6200ea', // Accent color (purple)
    },
    background: {
      default: '#121212', // Dark background color
      paper: '#1e1e1e',   // Dark paper (background for cards)
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
});

// List of Indian States
const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttarakhand', 'Uttar Pradesh', 'West Bengal'
];

const Checkout = () => {
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India', // Default country set to India
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.warn('Please log in to access your cart.');
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          toast.warn('No items found in cart.');
        }
      } catch (error) {
        toast.error('Failed to load cart items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleValidation = () => {
    const newErrors = {};
    if (!userDetails.fullName) newErrors.fullName = 'Full name is required';
    if (!userDetails.email) newErrors.email = 'Email is required';
    if (!userDetails.phone) newErrors.phone = 'Phone number is required';
    if (!userDetails.address) newErrors.address = 'Address is required';
    if (!userDetails.city) newErrors.city = 'City is required';
    if (!userDetails.state) newErrors.state = 'State is required';
    if (!userDetails.zipCode) newErrors.zipCode = 'Zip code is required';
    if (!userDetails.country) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!handleValidation()) {
      return;
    }

    const token = localStorage.getItem('authToken');

    try {
      const orderData = { ...userDetails, items };

      const { data } = await axios.post(`${BASE_URL}/api/checkout/create`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const options = {
        key: 'rzp_test_Afc2OwMLThkxdk',
        amount: data.order.totalAmount,
        currency: 'INR',
        name: 'Your Shop',
        description: 'Test Transaction',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(`${BASE_URL}/api/checkout/verify-payment`, {
              orderId: data.order._id,
              paymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }, { headers: { Authorization: `Bearer ${token}` } });

            toast.success('Payment successful! Order placed.');
            navigate(`/order-details/${data.order._id}`);
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: userDetails.fullName,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        theme: { color: '#6200ea' }, // Purple color for the Razorpay widget
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Error processing payment.');
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="sm" style={{ padding: '20px' }}>
        <Paper elevation={3} style={{ padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '10px' }}>
          <Typography variant="h4" gutterBottom align="center" style={{ color: '#ffffff', fontWeight: 'bold' }}>
            Checkout
          </Typography>

          {loading ? (
            <Typography variant="body1" align="center" style={{ color: '#b0b0b0' }}>
              Loading cart items...
            </Typography>
          ) : (
            <>
              <Typography variant="h6" style={{ margin: '20px 0', color: '#ffffff' }}>
                Your Cart Items
              </Typography>
              <List>
                {items.length > 0 ? (
                  items.map((item) => (
                    <React.Fragment key={item._id}>
                      <ListItem style={{ padding: '10px 0' }}>
                        <ListItemText
                          primary={`${item.product.name} (x${item.quantity})`}
                          secondary={`Price: ₹${item.product.price * item.quantity}`}
                          style={{ color: '#ffffff' }}
                        />
                      </ListItem>
                      <Divider style={{ backgroundColor: '#333' }} />
                    </React.Fragment>
                  ))
                ) : (
                  <Typography variant="body1" color="textSecondary" style={{ color: '#b0b0b0' }}>
                    No items in cart.
                  </Typography>
                )}
              </List>

              <Typography variant="h6" style={{ margin: '20px 0', color: '#ffffff' }}>
                Shipping Information
              </Typography>
              <Grid container spacing={2}>
                {['fullName', 'email', 'phone', 'address', 'city', 'zipCode'].map((field) => (
                  <Grid item xs={12} sm={field === 'address' ? 12 : 6} key={field}>
                    <TextField
                      fullWidth
                      label={field.charAt(0).toUpperCase() + field.slice(1)}
                      name={field}
                      variant="outlined"
                      onChange={handleChange}
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      style={{
                        backgroundColor: '#333',
                        borderRadius: '5px',
                        color: '#ffffff',
                      }}
                      InputLabelProps={{
                        style: { color: '#b0b0b0' },
                      }}
                      InputProps={{
                        style: { color: '#ffffff' },
                      }}
                      error={Boolean(errors[field])}
                      helperText={errors[field]}
                    />
                  </Grid>
                ))}

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" style={{ backgroundColor: '#333', borderRadius: '5px' }}>
                    <InputLabel style={{ color: '#b0b0b0' }}>State</InputLabel>
                    <Select
                      label="State"
                      name="state"
                      value={userDetails.state}
                      onChange={handleChange}
                      style={{
                        backgroundColor: '#333',
                        color: '#ffffff',
                        borderRadius: '5px',
                      }}
                    >
                      {states.map((state) => (
                        <MenuItem value={state} key={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.state && <FormHelperText>{errors.state}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined" disabled>
                    <InputLabel style={{ color: '#b0b0b0' }}>Country</InputLabel>
                    <Select
                      label="Country"
                      name="country"
                      value="India"
                      style={{
                        backgroundColor: '#333',
                        color: '#ffffff',
                        borderRadius: '5px',
                      }}
                    >
                      <MenuItem value="India">India</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                style={{
                  marginTop: '20px',
                  backgroundColor: '#6200ea',
                  padding: '12px',
                  fontWeight: 'bold',
                }}
                onClick={handlePayment}
              >
                Proceed to Pay
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Checkout;
