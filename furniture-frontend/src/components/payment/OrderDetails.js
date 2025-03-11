import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  Container,
  ButtonGroup,
} from '@mui/material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Timeline as TimelineIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { ethers } from 'ethers';
import { jsPDF } from 'jspdf';
import ReceiptViewer from '../order/ReceiptViewer';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const BASE_URL = 'https://finalprojectqwq.onrender.com';

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const { data } = await axios.get(`${BASE_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(data);
        
        // Set active step based on order status
        if (data.paymentStatus === 'Paid') {
          setActiveStep(2);
        }
      } catch (error) {
        toast.error('Failed to load order details.');
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const TransactionViewer = ({ transactionHash }) => {
    const [txDetails, setTxDetails] = useState(null);
    const [verificationDetails, setVerificationDetails] = useState(null);

    useEffect(() => {
      const fetchTransactionDetails = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // Fetch comprehensive transaction details
          const tx = await provider.getTransaction(transactionHash);
          const receipt = await provider.getTransactionReceipt(transactionHash);
          const block = await provider.getBlock(tx.blockNumber);
          const currentBlock = await provider.getBlockNumber();
          
          // Calculate confirmations
          const confirmations = currentBlock - tx.blockNumber;
          
          // Get gas price in USD
          const gasPriceInWei = tx.gasPrice;
          const gasUsed = receipt.gasUsed;
          const totalGasCost = gasPriceInWei.mul(gasUsed);
          
          setTxDetails({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: ethers.utils.formatEther(tx.value),
            status: receipt.status === 1 ? 'Success' : 'Failed',
            blockNumber: tx.blockNumber,
            timestamp: block.timestamp,
            confirmations,
            gasUsed: gasUsed.toString(),
            gasCost: ethers.utils.formatEther(totalGasCost),
            network: 'Mumbai Testnet',
          });
        } catch (error) {
          console.error('Error fetching transaction:', error);
        }
      };

      if (transactionHash && window.ethereum) {
        fetchTransactionDetails();
      }
    }, [transactionHash]);

    return (
      <Card sx={{ 
        mt: 2, 
        bgcolor: '#1E1E1E',
        '& .MuiTypography-root': { color: '#fff' }
      }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#6200ea' }}>
            <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#6200ea' }} />
            Transaction Details
          </Typography>
          {txDetails ? (
            <Grid container spacing={3}>
              {/* Transaction Status */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={`${txDetails.confirmations} Confirmations`}
                    color={txDetails.confirmations > 12 ? "success" : "warning"}
                    sx={{ '& .MuiChip-label': { color: '#fff' } }}
                  />
                  <Chip 
                    label={txDetails.status}
                    color={txDetails.status === 'Success' ? "success" : "error"}
                    sx={{ '& .MuiChip-label': { color: '#fff' } }}
                  />
                </Box>
              </Grid>

              {/* Transaction Hash */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Transaction Hash
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      p: 1,
                      borderRadius: 1,
                      flex: 1
                    }}
                  >
                    {txDetails.hash}
                  </Typography>
                  <Tooltip title="View on Explorer">
                    <IconButton 
                      onClick={() => window.open(
                        `https://mumbai.polygonscan.com/tx/${txDetails.hash}`,
                        '_blank'
                      )}
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      <LaunchIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              {/* Amount and Gas Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Transaction Amount
                </Typography>
                <Typography variant="h6" sx={{ color: '#6200ea', fontWeight: 'bold' }}>
                  {txDetails.value} MATIC
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Gas Used: {txDetails.gasUsed} | Gas Cost: {txDetails.gasCost} MATIC
                </Typography>
              </Grid>

              {/* Time and Block Details */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Block Information
                </Typography>
                <Typography variant="body2">
                  Block: {txDetails.blockNumber}
                </Typography>
                <Typography variant="body2">
                  Time: {new Date(txDetails.timestamp * 1000).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress color="secondary" />
              <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.6)' }}>
                Loading transaction details...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const downloadInvoice = async () => {
    try {
      setIsDownloading(true);
      const token = localStorage.getItem('authToken');
      
      console.log('Requesting invoice download...');
      const response = await axios.get(
        `${BASE_URL}/api/orders/${orderId}/invoice`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: 'application/pdf'
          },
          responseType: 'blob'
        }
      );
      
      console.log('Response received:', response);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${orderId}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      if (error.response) {
        console.error('Error response:', error.response);
        toast.error(`Failed to download invoice: ${error.response.data.message || 'Server error'}`);
      } else {
        toast.error('Failed to download invoice: Network error');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const NFTReceipt = ({ nftReceipt }) => {
    if (!nftReceipt) return null;

    return (
      <Card sx={{ mt: 3, bgcolor: '#2D2D2D' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#6200ea' }}>
            NFT Receipt
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Token ID: {nftReceipt.tokenId}
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<LaunchIcon />}
                onClick={() => window.open(
                  `https://mumbai.polygonscan.com/token/${process.env.REACT_APP_NFT_CONTRACT_ADDRESS}?a=${nftReceipt.tokenId}`,
                  '_blank'
                )}
              >
                View on Polygon Scan
              </Button>
              
              <Button
                variant="contained"
                startIcon={<LaunchIcon />}
                onClick={() => window.open(
                  `https://ipfs.io/ipfs/${nftReceipt.tokenURI.replace('ipfs://', '')}`,
                  '_blank'
                )}
              >
                View Metadata
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const ReceiptViewer = ({ receipt }) => {
    if (!receipt) return null;

    return (
      <Grid item xs={12}>
        <Card sx={{ mt: 3, bgcolor: '#2D2D2D' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#6200ea' }}>
              Digital Receipt
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                IPFS Details
              </Typography>
              <Typography variant="body2">
                Receipt Hash: {receipt.ipfsHash}
              </Typography>
              <Typography variant="body2">
                Created: {new Date(receipt.createdAt).toLocaleString()}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                {receipt.url && (
                  <Button
                    variant="contained"
                    startIcon={<LaunchIcon />}
                    onClick={() => window.open(receipt.url, '_blank')}
                  >
                    View Receipt
                  </Button>
                )}
                {receipt.imageUrl && (
                  <Button
                    variant="contained"
                    startIcon={<LaunchIcon />}
                    onClick={() => window.open(receipt.imageUrl, '_blank')}
                  >
                    View Image
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h6" color="error">Order not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ToastContainer theme="dark" />
      
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Order Details
          </Typography>
          
          <ButtonGroup variant="outlined">
            <Button
              startIcon={isDownloading ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={downloadInvoice}
              disabled={order.paymentStatus !== 'Paid' || isDownloading}
              title={
                order.paymentStatus !== 'Paid' 
                  ? 'Available after payment' 
                  : isDownloading 
                    ? 'Downloading...' 
                    : 'Download Invoice'
              }
            >
              {isDownloading ? 'Downloading...' : 'Invoice'}
            </Button>
            {order.digitalReceipt && !order.digitalReceipt.error && (
              <Button
                startIcon={<ReceiptIcon />}
                onClick={() => window.open(order.digitalReceipt.imageUrl, '_blank')}
              >
                Receipt
              </Button>
            )}
          </ButtonGroup>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Order Summary */}
        <Grid container spacing={3}>
          {/* Order Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Order Information</Typography>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography>Order ID: {order._id}</Typography>
              <Typography>Date: {new Date(order.createdAt).toLocaleDateString()}</Typography>
              <Typography>
                Status: <span style={{ color: order.paymentStatus === 'Paid' ? '#4caf50' : '#ff9800' }}>
                  {order.paymentStatus}
                </span>
              </Typography>
              <Typography>Total Amount: ₹{order.totalAmount}</Typography>
            </Box>
          </Grid>

          {/* Shipping Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Shipping Information</Typography>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              <Typography>{order.fullName}</Typography>
              <Typography>{order.address}</Typography>
              <Typography>{order.city}, {order.state} {order.zipCode}</Typography>
              <Typography>{order.country}</Typography>
              <Typography>Phone: {order.phone}</Typography>
            </Box>
          </Grid>

          {/* Order Items */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Order Items</Typography>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
              {order.items.map((item, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 1,
                  borderBottom: index < order.items.length - 1 ? '1px solid rgba(0,0,0,0.12)' : 'none'
                }}>
                  <Box>
                    <Typography variant="subtitle1">
                      {item.product?.name || 'Product'} × {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{item.product?.price || 0} each
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1">
                    ₹{(item.product?.price || 0) * item.quantity}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="h6">
                  Total: ₹{order.totalAmount}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Digital Receipt Section */}
          {order.digitalReceipt && (
            <Grid item xs={12}>
              <ReceiptViewer receipt={order.digitalReceipt} />
            </Grid>
          )}

          {/* Blockchain Payment Details */}
          {order.blockchainPayment && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Blockchain Payment Details</Typography>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography>
                  Transaction Hash: {order.blockchainPayment.transactionHash}
                </Typography>
                <Typography>
                  Wallet Address: {order.blockchainPayment.walletAddress}
                </Typography>
                <Typography>
                  Network: {order.blockchainPayment.network}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default OrderDetails;
