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
import { ethers } from 'ethers';

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

// Update the network configuration for Polygon Amoy Testnet
const AMOY_CHAIN_ID = 80002;
const AMOY_CHAIN_ID_HEX = '0x13882';

const AMOY_NETWORK = {
  chainId: AMOY_CHAIN_ID_HEX,
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'MATIC', // Changed from POL to MATIC
    symbol: 'MATIC',
    decimals: 18
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/']
};

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
  const [metamaskConnected, setMetamaskConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkReady, setNetworkReady] = useState(false);
  const [setupState, setSetupState] = useState('idle'); // idle, adding, switching, ready
  const [isProcessing, setIsProcessing] = useState(false);

  const BASE_URL = 'https://finalprojectqwq.onrender.com';

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

  useEffect(() => {
    console.log('Admin wallet:', process.env.REACT_APP_ADMIN_WALLET_ADDRESS);
    console.log('RPC URL:', process.env.REACT_APP_POLYGON_MUMBAI_RPC);
  }, []);

  useEffect(() => {
    // Debug log environment variables
    console.log('Environment Variables:', {
      adminWallet: process.env.REACT_APP_ADMIN_WALLET_ADDRESS,
      rpcUrl: process.env.REACT_APP_POLYGON_MUMBAI_RPC
    });
  }, []);

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const isConnected = chainId === '0x13881';
          setNetworkReady(isConnected);
          setSetupState(isConnected ? 'ready' : 'idle');
          
          if (isConnected) {
            console.log('Already on Mumbai network');
          }
        } catch (error) {
          console.error('Network check error:', error);
          setNetworkReady(false);
          setSetupState('idle');
        }
      }
    };

    checkNetwork();

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        const isConnected = chainId === '0x13881';
        setNetworkReady(isConnected);
        setSetupState(isConnected ? 'ready' : 'idle');
      });
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setMetamaskConnected(true);
        } else {
          setWalletAddress('');
          setMetamaskConnected(false);
        }
      });
    }
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

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error('Please install MetaMask to make blockchain payments');
        return false;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      setWalletAddress(accounts[0]);
      setMetamaskConnected(true);
      toast.success('Wallet connected successfully');
      return true;
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
      return false;
    }
  };

  // Add utility function for exponential backoff
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const getBackoffDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds

  const handlePayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      // Form validation
      if (!handleValidation()) {
        setIsProcessing(false);
        return;
      }

      // Check MetaMask installation
      if (!window.ethereum) {
        toast.error('Please install MetaMask');
        setIsProcessing(false);
        return;
      }

      // Connect wallet if not connected
      if (!metamaskConnected) {
        const connected = await connectWallet();
        if (!connected) {
          toast.error('Please connect your wallet first');
          setIsProcessing(false);
          return;
        }
      }

      // Create order first
      toast.info('Creating order...');
      const token = localStorage.getItem('authToken');
      
      // Calculate total amount in INR with proper price handling
      const totalAmountINR = items.reduce((total, item) => {
        // Ensure price is treated as a number and not multiplied by 100
        const itemPrice = Number(item.product.price);
        const quantity = Number(item.quantity);
        const itemTotal = itemPrice * quantity;
        
        console.log(`Item: ${item.product.name}`);
        console.log(`Price per unit: ₹${itemPrice}`);
        console.log(`Quantity: ${quantity}`);
        console.log(`Item total: ₹${itemTotal}`);
        
        return total + itemTotal;
      }, 0);

      // Format total amount for display
      const formattedTotal = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(totalAmountINR);

      console.log('Final order total:', formattedTotal);

      const orderData = { 
        ...userDetails, 
        items: items.map(item => ({
          ...item,
          price: Number(item.product.price) // Ensure price is a number
        })),
        totalAmount: totalAmountINR
      };
      
      const { data: orderResponse } = await axios.post(
        `${BASE_URL}/api/checkout/create`, 
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check if already on the correct network
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Current chainId:', currentChainId);

      if (currentChainId !== AMOY_CHAIN_ID_HEX) {
        toast.error('Please connect to the Polygon Amoy Testnet in MetaMask');
        setIsProcessing(false);
        return;
      }

      // Initialize provider with MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const adminAddress = process.env.REACT_APP_ADMIN_WALLET_ADDRESS;

      if (!adminAddress) {
        throw new Error('Admin wallet address not configured');
      }

      // Get current nonce
      const nonce = await provider.getTransactionCount(userAddress, 'latest');

      // Get current gas price with higher buffer for Polygon
      const gasPrice = (await provider.getGasPrice()).mul(150).div(100); // 50% buffer
      console.log('Adjusted gas price:', ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei');

      // Use fixed small amount for testing
      const testAmount = ethers.utils.parseEther('0.0001');

      // Prepare the transaction with higher gas limit
      const transactionRequest = {
        from: userAddress,
        to: adminAddress,
        value: testAmount,
        gasLimit: ethers.BigNumber.from('100000'), // Increased gas limit
        gasPrice: gasPrice,
        nonce: nonce,
        chainId: AMOY_CHAIN_ID,
        type: 0 // Legacy transaction type
      };

      // Check balance with the new gas calculations
      const balance = await provider.getBalance(userAddress);
      const totalCost = testAmount.add(
        transactionRequest.gasLimit.mul(transactionRequest.gasPrice)
      );

      console.log('Original order amount:', formattedTotal);
      console.log('Test transaction amount (MATIC):', ethers.utils.formatEther(testAmount));
      console.log('Balance (MATIC):', ethers.utils.formatEther(balance));
      console.log('Total cost with gas (MATIC):', ethers.utils.formatEther(totalCost));

      if (balance.lt(totalCost)) {
        toast.error('Insufficient funds for transaction and gas fees');
        setIsProcessing(false);
        return;
      }

      // Log the final transaction parameters
      console.log('Transaction parameters:', {
        from: transactionRequest.from,
        to: transactionRequest.to,
        value: ethers.utils.formatEther(transactionRequest.value) + ' MATIC',
        gasLimit: transactionRequest.gasLimit.toString(),
        gasPrice: ethers.utils.formatUnits(transactionRequest.gasPrice, 'gwei') + ' gwei',
        nonce: transactionRequest.nonce,
        chainId: transactionRequest.chainId,
        type: transactionRequest.type
      });

      toast.info('Please confirm the transaction in MetaMask...');

      // Send transaction
      const tx = await signer.sendTransaction(transactionRequest);
      console.log('Transaction submitted:', tx.hash);
      
      toast.info('Transaction submitted. Waiting for confirmation...');

      // Wait for confirmation with more blocks
      const receipt = await tx.wait(2); // Wait for 2 confirmations
      console.log('Transaction confirmed:', receipt);

      // Verify payment
      toast.info('Verifying payment...');
      const verificationResponse = await axios.post(
        `${BASE_URL}/api/checkout/verify-payment`,
        {
          orderId: orderResponse.order._id,
          blockchainPayment: {
            transactionHash: receipt.transactionHash,
            walletAddress: userAddress,
            amount: testAmount.toString(),
            network: 'Polygon Amoy Testnet',
            originalAmountINR: totalAmountINR // Send raw number
          }
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Payment verified:', verificationResponse.data);
      toast.success('Payment successful!');
      navigate(`/order-details/${orderResponse.order._id}`);

    } catch (error) {
      console.error('Transaction error:', error);
      
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else if (error.code === -32603) {
        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes('insufficient funds')) {
          toast.error('Insufficient funds for transaction and gas fees');
        } else if (errorMessage.includes('nonce')) {
          toast.error('Please reset your MetaMask account and try again');
        } else if (errorMessage.includes('underpriced')) {
          toast.error('Transaction underpriced. Trying again with higher gas price');
          // Could implement retry logic here with higher gas price
        } else if (errorMessage.includes('gas')) {
          toast.error('Gas estimation failed. Please try again');
        } else {
          toast.error('Network is congested. Please try again in a few minutes');
        }
      } else {
        toast.error('Transaction failed. Please try again');
      }
      
      console.error('Detailed error:', {
        code: error.code,
        message: error.message,
        data: error.data,
        stack: error.stack
      });
      
      setIsProcessing(false);
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
                          secondary={
                            <>
                              <Typography component="span" style={{ display: 'block', color: '#b0b0b0' }}>
                                Price per unit: {new Intl.NumberFormat('en-IN', {
                                  style: 'currency',
                                  currency: 'INR',
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }).format(Number(item.product.price))}
                              </Typography>
                              <Typography component="span" style={{ display: 'block', color: '#b0b0b0' }}>
                                Total: {new Intl.NumberFormat('en-IN', {
                                  style: 'currency',
                                  currency: 'INR',
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }).format(Number(item.product.price) * Number(item.quantity))}
                              </Typography>
                            </>
                          }
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

              {items.length > 0 && (
                <Typography variant="h6" style={{ margin: '20px 0', color: '#ffffff' }}>
                  Order Total: {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }).format(items.reduce((total, item) => 
                    total + (Number(item.product.price) * Number(item.quantity)), 0
                  ))}
                </Typography>
              )}

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

              <div className="payment-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <Button
                    onClick={connectWallet}
                    variant="contained"
                    color={metamaskConnected ? "success" : "primary"}
                    fullWidth
                  >
                    {metamaskConnected ? '✓ Wallet Connected' : 'Connect Wallet'}
                  </Button>
                </div>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handlePayment}
                  disabled={!metamaskConnected || isProcessing}
                >
                  {!metamaskConnected ? 'Connect Wallet First' : 
                   isProcessing ? 'Processing Payment...' : 
                   'Pay with MetaMask'}
                </Button>
              </div>
            </>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Checkout;
