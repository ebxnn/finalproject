import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Grid,
  Box,
  Paper,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { jsPDF } from 'jspdf';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const { data } = await axios.get(`${BASE_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(data);
      } catch (error) {
        toast.error('Failed to load order details.');
        console.error('Error fetching order:', error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Log order for debugging
  console.log('Order data:', order);

  // Ensure that the order is loaded before trying to access its properties
  if (!order || !order._id || !order.items) {
    return <Typography variant="body1" align="center">Loading order details...</Typography>;
  }

  // Function to download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Order Details', 20, 20);

    // Order ID
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 20, 30);

    // Customer Details
    doc.text(`Name: ${order.fullName}`, 20, 40);
    doc.text(`Email: ${order.email}`, 20, 50);
    doc.text(`Phone: ${order.phone}`, 20, 60);

    // Shipping Address
    doc.text(`Address: ${order.address}`, 20, 70);
    doc.text(`City: ${order.city}`, 20, 80);
    doc.text(`State: ${order.state}`, 20, 90);
    doc.text(`Zip Code: ${order.zipCode}`, 20, 100);
    doc.text(`Country: ${order.country}`, 20, 110);

    // Divider
    doc.setLineWidth(0.5);
    doc.line(20, 115, 190, 115);

    // Items Details
    doc.text('Items:', 20, 120);
    let yPosition = 130;
    order.items.forEach((item) => {
      if (item.product && item.product.name && item.product.price) {
        doc.text(`${item.product.name} (x${item.quantity})`, 20, yPosition);
        doc.text(`Price: ₹${(item.product.price * item.quantity) / 100}`, 20, yPosition + 10);
        yPosition += 20;
      }
    });

    // Total Amount
    doc.setFontSize(14);
    doc.text(`Total Amount: ₹${order.totalAmount / 100}`, 20, yPosition + 10);

    // Payment Status
    doc.setFontSize(12);
    doc.text(`Payment Status: ${order.paymentStatus}`, 20, yPosition + 20);
    doc.text(`Payment ID: ${order.paymentId}`, 20, yPosition + 30);
    doc.text(`Razorpay Order ID: ${order.razorpayOrderId}`, 20, yPosition + 40);

    // Order Date
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleString()}`, 20, yPosition + 50);

    // Save the PDF
    doc.save('order-details.pdf');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#121212',
        padding: '20px',
      }}
    >
      <Paper
        elevation={5}
        sx={{
          width: '100%',
          maxWidth: '1200px',
          borderRadius: '12px',
          overflow: 'hidden',
          padding: '30px',
          backgroundColor: '#333',
          color: '#fff',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#fff' }}>
          Order Details
        </Typography>
        <Divider sx={{ marginBottom: '20px', backgroundColor: '#bbb' }} />

        <Box mb={3}>
          <Typography variant="h6" color="primary">
            Order ID: {order._id}
          </Typography>
        </Box>

        <Grid container spacing={4} mb={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              Customer Details
            </Typography>
            <Typography variant="body1"><strong>Name:</strong> {order.fullName}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {order.email}</Typography>
            <Typography variant="body1"><strong>Phone:</strong> {order.phone}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom color="text.secondary">
              Shipping Address
            </Typography>
            <Typography variant="body1"><strong>Address:</strong> {order.address}</Typography>
            <Typography variant="body1"><strong>City:</strong> {order.city}</Typography>
            <Typography variant="body1"><strong>State:</strong> {order.state}</Typography>
            <Typography variant="body1"><strong>Zip Code:</strong> {order.zipCode}</Typography>
            <Typography variant="body1"><strong>Country:</strong> {order.country}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ marginY: '20px', backgroundColor: '#bbb' }} />

        <Typography variant="h6" sx={{ marginBottom: '20px', color: '#fff' }}>
          <ShoppingCartIcon fontSize="small" sx={{ marginRight: '8px' }} />
          Items in Your Order
        </Typography>

        <Grid container spacing={3}>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              item.product && item.product._id && item.product.name ? (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper
                    elevation={3}
                    sx={{
                      padding: '15px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: '#444',
                    }}
                  >
                    <Avatar
                      src={
                        item.product.imageUrls && item.product.imageUrls.length > 0
                          ? item.product.imageUrls[0]
                          : 'https://via.placeholder.com/150'
                      }
                      alt={item.product?.name || 'No image available'}
                      variant="square"
                      sx={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        objectFit: 'cover',
                      }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {item.product?.name || 'No name available'} (x{item.quantity})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price: ₹{(item.product?.price * item.quantity) / 100 || '0'}
                    </Typography>
                  </Paper>
                </Grid>
              ) : null // Skip item if product or its _id is missing
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No items available.
            </Typography>
          )}
        </Grid>

        <Box mt={4} sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="primary" sx={{ marginBottom: '10px' }}>
            <MonetizationOnIcon fontSize="small" sx={{ marginRight: '8px' }} />
            Total Amount: ₹{order.totalAmount / 100}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ marginBottom: '20px' }}>
            Payment Status: {order.paymentStatus}
          </Typography>

          <Typography variant="body1"><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</Typography>
        </Box>

        <Box display="flex" justifyContent="center" sx={{ marginTop: '30px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={downloadPDF}
            sx={{ padding: '10px 20px' }}
          >
            Download PDF
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderDetails;
