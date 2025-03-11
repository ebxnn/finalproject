import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Grid, Paper } from '@mui/material';

const ProfileView = ({ baseUrl }) => {
  const [seller, setSeller] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [updatedSeller, setUpdatedSeller] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSellerDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://mernstack-pro.onrender.com/api/sellersProfile/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,  // Send token from localStorage
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch seller details');
        }

        const sellerData = await response.json();
        setSeller(sellerData);  // Set the fetched seller data to state
        setUpdatedSeller(sellerData);  // Set the initial data for updating
        setLoading(false);
      } catch (error) {
        console.error('Error fetching seller details:', error);
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [baseUrl]);

  const handleEditDialogOpen = () => {
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedSeller((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${baseUrl}/api/sellersProfile/${seller._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedSeller)
      });

      if (response.ok) {
        setSeller(updatedSeller); // Update local state with the new details
        setOpenEditDialog(false); // Close the dialog
      } else {
        console.error('Failed to update seller details');
      }
    } catch (error) {
      console.error('Error updating seller details:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Seller Profile</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">First Name: {seller?.firstName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Last Name: {seller?.lastName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Email: {seller?.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Status: {seller?.status}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Role: {seller?.role}</Typography>
          </Grid>
          <Grid item xs={12}>
            {/* <Button variant="contained" color="primary" onClick={handleEditDialogOpen}>
              Edit Profile
            </Button> */}
          </Grid>
        </Grid>
      )}

      {/* Edit Seller Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="firstName"
            label="First Name"
            type="text"
            fullWidth
            value={updatedSeller.firstName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="lastName"
            label="Last Name"
            type="text"
            fullWidth
            value={updatedSeller.lastName}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={updatedSeller.email}
            onChange={handleInputChange}
            disabled // Disable editing of email
          />
          <TextField
            margin="dense"
            name="status"
            label="Status"
            type="text"
            fullWidth
            value={updatedSeller.status}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="role"
            label="Role"
            type="text"
            fullWidth
            value={updatedSeller.role}
            onChange={handleInputChange}
            disabled // Disable editing of role
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProfileView;
