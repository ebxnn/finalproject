import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

// Hardcoded base URL
const BASE_URL = 'https://mernstack-pro.onrender.com'; // Change this to your actual base URL

const ViewProducts = () => {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [updatedData, setUpdatedData] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch products specific to the seller
  const fetchProducts = async () => {
    const token = localStorage.getItem('authToken'); // Assuming the token is stored in localStorage

    try {
      const response = await fetch(`${BASE_URL}/api/products/seller-products`, { // Use the hardcoded base URL
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Include token in the Authorization header
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Unexpected data format:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // Handle the error by setting products to an empty array
    }
  };

  // Opens the dialog and initializes the data for editing
  const handleOpenEditDialog = (product) => {
    setSelectedProduct(product);
    setUpdatedData({ ...product, imageUrls: [...product.imageUrls] }); // Ensure imageUrls is copied properly
    setOpen(true);
  };

  // Closes the edit dialog
  const handleCloseEditDialog = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  // Handles changes in text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handles changes in each individual image URL
  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...updatedData.imageUrls];
    newImageUrls[index] = value;
    setUpdatedData((prevData) => ({
      ...prevData,
      imageUrls: newImageUrls,
    }));
  };

  // Adds a new image URL input field
  const handleAddImageUrlField = () => {
    setUpdatedData((prevData) => ({
      ...prevData,
      imageUrls: [...prevData.imageUrls, ''], // Add a new empty string for a new image URL field
    }));
  };

  // Handles measurement fields
  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({
      ...prevData,
      measurements: {
        ...prevData.measurements,
        [name]: value,
      },
    }));
  };

  // Updates the product
  const handleUpdateProduct = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${BASE_URL}/api/products/edit/${selectedProduct._id}`, { // Use the hardcoded base URL
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ensure token is included in PUT request
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        // Update the local state with the updated product
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === selectedProduct._id ? { ...updatedData, _id: selectedProduct._id } : product
          )
        );
        handleCloseEditDialog();
      } else {
        console.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        View Products
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Subcategory</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Images</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.description}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.subcategory}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>{product.stockQuantity}</TableCell>
              <TableCell>{product.status}</TableCell>
              <TableCell>
                {product.imageUrls.map((url, index) => (
                  <img key={index} src={url} alt="Product" style={{ width: 50, marginRight: 5 }} />
                ))}
              </TableCell>
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => handleOpenEditDialog(product)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Product Dialog */}
      <Dialog open={open} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Product Name"
                type="text"
                fullWidth
                value={updatedData.name}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={updatedData.description}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="additionalDescription"
                label="Additional Description"
                type="text"
                fullWidth
                multiline
                rows={2}
                value={updatedData.additionalDescription}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="category"
                label="Category"
                type="text"
                fullWidth
                value={updatedData.category}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="subcategory"
                label="Subcategory"
                type="text"
                fullWidth
                value={updatedData.subcategory}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="price"
                label="Price"
                type="number"
                fullWidth
                value={updatedData.price}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="stockQuantity"
                label="Stock Quantity"
                type="number"
                fullWidth
                value={updatedData.stockQuantity}
                onChange={handleInputChange}
              />

              {/* Status Dropdown */}
              <FormControl fullWidth margin="dense">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={updatedData.status || ''}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                  <MenuItem value="discontinued">Discontinued</MenuItem>
                </Select>
              </FormControl>

              {/* Measurements Fields */}
              <Typography variant="h6" gutterBottom>
                Measurements
              </Typography>
              <TextField
                margin="dense"
                name="width"
                label="Width"
                type="number"
                fullWidth
                value={updatedData.measurements?.width || ''}
                onChange={handleMeasurementChange}
              />
              <TextField
                margin="dense"
                name="height"
                label="Height"
                type="number"
                fullWidth
                value={updatedData.measurements?.height || ''}
                onChange={handleMeasurementChange}
              />
              <TextField
                margin="dense"
                name="depth"
                label="Depth"
                type="number"
                fullWidth
                value={updatedData.measurements?.depth || ''}
                onChange={handleMeasurementChange}
              />
              <TextField
                margin="dense"
                name="weight"
                label="Weight"
                type="number"
                fullWidth
                value={updatedData.measurements?.weight || ''}
                onChange={handleMeasurementChange}
              />

              {/* Separate input fields for each image URL */}
              <Typography variant="h6" gutterBottom>
                Image URLs
              </Typography>
              {updatedData.imageUrls.map((url, index) => (
                <TextField
                  key={index}
                  margin="dense"
                  label={`Image URL ${index + 1}`}
                  type="text"
                  fullWidth
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                />
              ))}
              <Button onClick={handleAddImageUrlField} color="primary" style={{ marginTop: '8px' }}>
                Add Image URL
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateProduct} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewProducts;
