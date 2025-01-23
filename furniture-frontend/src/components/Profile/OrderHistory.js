import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Paper, Divider, Chip, CircularProgress, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllOrders = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/order/user-orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        setError('Failed to load orders.');
        toast.error('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ backgroundColor: '#121212' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ backgroundColor: '#121212' }}>
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  const getOrderStatusSteps = (status) => {
    switch (status) {
      case 'Delivered':
        return ['Payment Pending', 'Processing', 'Dispatched', 'Delivered'];
      case 'Dispatched':
        return ['Payment Pending', 'Processing', 'Dispatched'];
      case 'Processing':
        return ['Payment Pending', 'Processing'];
      default:
        return ['Payment Pending'];
    }
  };

  return (
    <Box sx={{ padding: '40px', backgroundColor: '#121212' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: '700', color: '#fff' }}>
        Your Orders
      </Typography>
      <Divider sx={{ marginBottom: '40px', backgroundColor: '#fff' }} />

      {/* Orders List */}
      {orders.length === 0 ? (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ color: '#aaa' }}>
          No orders found.
        </Typography>
      ) : (
        orders.map((order) => (
          <Paper
            key={order._id}
            sx={{
              marginBottom: '20px',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              backgroundColor: '#1e1e1e',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
              },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: '600', color: '#fff' }}>
              Order ID: {order._id}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ color: '#bbb' }}>
              Order Date: {new Date(order.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: '700', color: '#1e88e5', marginTop: '8px' }}>
              ₹{(order.totalAmount / 100).toFixed(2)}
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
              {getOrderStatusSteps(order.status).map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '10px',
                    color: '#bbb',
                    fontWeight: 'bold',
                  }}
                >
                  {/* <Chip
                    label={step}
                    color={index === getOrderStatusSteps(order.status).length - 1 ? 'success' : 'default'}
                    sx={{
                      marginRight: '10px',
                      backgroundColor: '#333',
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  /> */}
                  {index < getOrderStatusSteps(order.status).length - 1 && (
                    <Box sx={{ flex: 1, borderBottom: '2px dashed #444', marginLeft: '10px' }} />
                  )}
                </Box>
              ))}
            </Box>

            {/* Payment Status */}
            <Box sx={{ marginTop: '20px' }}>
              <Chip
                label={order.paymentStatus || 'Pending'}
                color={order.paymentStatus === 'Paid' ? 'success' : order.paymentStatus === 'Failed' ? 'error' : 'warning'}
                sx={{
                  fontWeight: 'bold',
                  color: '#fff',
                  borderColor: '#bbb',
                  backgroundColor: order.paymentStatus === 'Paid' ? '#388e3c' : order.paymentStatus === 'Failed' ? '#f44336' : '#ff9800',
                }}
              />
            </Box>

            {/* View Order Details Button */}
            <Box sx={{ marginTop: '20px', textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/order-details/${order._id}`)}
                sx={{
                  borderRadius: '30px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  padding: '12px 30px',
                  backgroundColor: '#1e88e5',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                  },
                }}
              >
                View Order Details
              </Button>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default AllOrders;
