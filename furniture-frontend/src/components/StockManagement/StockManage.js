import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProfileView from './sellerProfile';
import AddProduct from './AddProduct';
import ViewProducts from './ViewProduct';
import ViewOrders from './ViewOrders';

const BASE_URL = 'https://mernstack-pro.onrender.com'; // Hardcoded base URL

const StockManagement = () => {
  const [activeView, setActiveView] = useState('add');
  const [username, setUsername] = useState('');
  const [sellerStatus, setSellerStatus] = useState('');
  const [openContactDialog, setOpenContactDialog] = useState(false); // State to control Contact Admin Dialog
  const navigate = useNavigate(); // useNavigate hook for navigation

  useEffect(() => {
    // Fetch the username from local storage or another appropriate source
    const storedUsername = localStorage.getItem('username'); // Assuming the username is stored in localStorage
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Fetch seller status to check if active
    const checkSellerStatus = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/sellersProfile/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Send token from localStorage
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch seller status');
        }

        const sellerData = await response.json();
        setSellerStatus(sellerData.status); // Set the seller's status

        if (sellerData.status !== 'active') {
          // If the seller is not active, show the Contact Admin dialog
          setOpenContactDialog(true);
        }
      } catch (error) {
        console.error('Error fetching seller status:', error);
        setOpenContactDialog(true); // If there's an error, show the Contact Admin dialog
      }
    };

    checkSellerStatus();
  }, [navigate]);

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear the authentication token
    localStorage.removeItem('username'); // Optionally clear the username
    navigate('/login'); // Redirect to login page using react-router
  };

  const handleCloseDialog = () => {
    setOpenContactDialog(false); // Close the dialog
    navigate('/login'); // Redirect to login page after closing the dialog
  };

  const theme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#121212',
        paper: '#1E1E1E',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Header (AppBar) */}
      <AppBar position="sticky" sx={{ zIndex: 1300 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Stock Management
          </Typography>

          <Button sx={{ color: 'white' }} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar (Drawer) */}
      <Drawer variant="permanent" anchor="left" sx={{ width: 240, flexShrink: 0 }}>
        <Toolbar />
        <List>
          <ListItem button onClick={() => handleViewChange('add')}>
            <ListItemText primary="Add Product" primaryTypographyProps={{ style: { color: '#ffffff' } }} />
          </ListItem>
          <ListItem button onClick={() => handleViewChange('view')}>
            <ListItemText primary="View Products" primaryTypographyProps={{ style: { color: '#ffffff' } }} />
          </ListItem>
          <ListItem button onClick={() => handleViewChange('orders')}>
            <ListItemText primary="View Orders" primaryTypographyProps={{ style: { color: '#ffffff' } }} />
          </ListItem>
          <ListItem button onClick={() => handleViewChange('profile')}>
            <ListItemText primary="Profile" primaryTypographyProps={{ style: { color: '#ffffff' } }} />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <main style={{ marginLeft: 240, padding: 20, backgroundColor: theme.palette.background.default }}>
        <Toolbar />
        {activeView === 'add' && <AddProduct baseUrl={BASE_URL} />}
        {activeView === 'view' && <ViewProducts baseUrl={BASE_URL} />}
        {activeView === 'orders' && <ViewOrders baseUrl={BASE_URL} />}
        {activeView === 'profile' && <ProfileView baseUrl={BASE_URL} />} {/* Render ProfileView when activeView is profile */}
      </main>

      {/* Contact Admin Dialog */}
      <Dialog open={openContactDialog} onClose={handleCloseDialog}>
        <DialogTitle>Account Inactive</DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            Unauthorized or Inactive. Please contact the admin for further assistance.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default StockManagement;
