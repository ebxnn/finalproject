import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'https://mernstack-pro.onrender.com'; // Your backend URL

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Store any errors
  const navigate = useNavigate();

  // Fetch orders from backend
  const fetchOrders = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${BASE_URL}/api/seller-orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data); // Set fetched orders
    } catch (error) {
      setError(error.message); // Update error state with error message
      setOrders([]); // Reset orders in case of error
    } finally {
      setLoading(false); // Data fetching complete
    }
  };

  useEffect(() => {
    fetchOrders(); // Call fetch on component mount
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Navigate to Order Details
  const viewOrderDetails = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  // Orders data display
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom color="textPrimary">
        Orders
      </Typography>
      {orders.length === 0 ? (
        <Typography variant="h6" color="textSecondary">No orders found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3, padding: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Order ID</strong></TableCell>
                <TableCell><strong>Full Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Address</strong></TableCell>
                <TableCell><strong>Total Amount</strong></TableCell>
                <TableCell><strong>Payment Status</strong></TableCell>
                <TableCell><strong>Product(s)</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  {/* Order ID */}
                  <TableCell>{order.orderId}</TableCell>
                  {/* Full Name */}
                  <TableCell>
                    {order.fullName || `${order.userDetails?.[0]?.firstName} ${order.userDetails?.[0]?.lastName || ''}`}
                  </TableCell>
                  {/* Email */}
                  <TableCell>{order.email || order.userDetails?.[0]?.email || 'Not Provided'}</TableCell>
                  {/* Phone */}
                  <TableCell>{order.phone || 'Not Provided'}</TableCell>
                  {/* Address */}
                  <TableCell>{order.address || 'Not Provided'}</TableCell>
                  {/* Total Amount */}
                  <TableCell>Rs.{order.totalAmount}</TableCell>
                  {/* Payment Status */}
                  <TableCell>{order.paymentStatus}</TableCell>
                  {/* Product(s) */}
                  <TableCell>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index}>
                          {item.quantity} x {item.name || 'Unknown Product'} (${item.price}) - {item.description || 'No description'}
                        </div>
                      ))
                    ) : (
                      'No items in this order.'
                    )}
                  </TableCell>
                  {/* Actions */}
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => viewOrderDetails(order._id)}
                      sx={{ textTransform: 'none' }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ViewOrders;
