import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Link,
  ButtonGroup
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast } from 'react-toastify';
import ReceiptViewer from './ReceiptViewer';
import { Download, Receipt } from '@mui/icons-material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6200ea',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

const OrderDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { orderId } = useParams();
  const BASE_URL = 'https://mernstack-pro.onrender.com';

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${BASE_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrder(response.data);
      } catch (error) {
        toast.error('Failed to fetch order details');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const downloadInvoice = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${BASE_URL}/api/orders/${orderId}/invoice`, 
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download invoice');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!order) {
    return <Typography>Order not found</Typography>;
  }

  console.log('Order data:', {
    id: order._id,
    hasDigitalReceipt: !!order.digitalReceipt,
    digitalReceipt: order.digitalReceipt
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">
              Order Details
            </Typography>
            
            <ButtonGroup variant="outlined">
              <Button
                startIcon={<Download />}
                onClick={downloadInvoice}
                disabled={order.paymentStatus !== 'Paid'}
              >
                Download Invoice
              </Button>
              {order.digitalReceipt && !order.digitalReceipt.error && (
                <Button
                  startIcon={<Receipt />}
                  onClick={() => window.open(order.digitalReceipt.imageUrl, '_blank')}
                >
                  View Receipt
                </Button>
              )}
            </ButtonGroup>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Order Information</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Order ID: {order._id}</Typography>
                <Typography>Date: {new Date(order.createdAt).toLocaleDateString()}</Typography>
                <Typography>Status: {order.paymentStatus}</Typography>
                <Typography>Total Amount: ₹{order.totalAmount}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6">Shipping Information</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>{order.fullName}</Typography>
                <Typography>{order.address}</Typography>
                <Typography>{order.city}, {order.state}</Typography>
                <Typography>{order.zipCode}</Typography>
                <Typography>{order.country}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              {order.items.map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography>
                    {item.product?.name || 'Product'} x {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: ₹{item.product?.price || 0}
                  </Typography>
                </Box>
              ))}
            </Grid>

            {order.blockchainPayment && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Blockchain Payment Details
                </Typography>
                <Typography>
                  Transaction Hash: {order.blockchainPayment.transactionHash}
                </Typography>
                <Typography>
                  Wallet Address: {order.blockchainPayment.walletAddress}
                </Typography>
                <Typography>
                  Network: {order.blockchainPayment.network}
                </Typography>
              </Grid>
            )}

            {order.digitalReceipt && (
              <Grid item xs={12}>
                <ReceiptViewer receipt={order.digitalReceipt} />
              </Grid>
            )}
          </Grid>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default OrderDetails; 