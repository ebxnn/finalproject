import React, { useState, useEffect } from 'react';
import './StockManagement.css';

const StockManagement = () => {
  const [activeView, setActiveView] = useState('add');
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: 0,
    stockQuantity: 0,
    imageUrls: [],
    newImageUrl: '',
    status: 'active', // Default status
  });
  const [products, setProducts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategories, setSubcategories] = useState([]);

  const categories = {
    'Living Room Furniture': [
      'Sofas',
      'Armchairs',
      'Coffee Tables',
      'TV Stands',
      'Bookcases',
      'Entertainment Centers',
      'Ottomans',
      'Recliners',
    ],
    'Bedroom Furniture': [
      'Beds',
      'Nightstands',
      'Dressers',
      'Wardrobes',
      'Bedside Tables',
      'Mattresses',
      'Bedding',
    ],
    'Dining Room Furniture': [
      'Dining Tables',
      'Dining Chairs',
      'Buffets',
      'Sideboards',
      'Bar Stools',
      'Kitchen Islands',
      'Dining Sets',
    ],
    'Office Furniture': [
      'Desks',
      'Office Chairs',
      'Bookcases',
      'Filing Cabinets',
      'Conference Tables',
      'Cubicles',
      'Standing Desks',
    ],
    'Outdoor Furniture': [
      'Patio Sets',
      'Garden Chairs',
      'Outdoor Tables',
      'Hammocks',
      'Sun Loungers',
    ],
  };

  useEffect(() => {
    if (activeView === 'view') {
      fetchProducts();
    }
  }, [activeView]);

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'view') {
      fetchProducts();
    } else {
      resetForm();
      setEditMode(false);
    }
  };

  const resetForm = () => {
    setProductData({
      name: '',
      description: '',
      category: '',
      subcategory: '',
      price: 0,
      stockQuantity: 0,
      imageUrls: [],
      newImageUrl: '',
      status: 'active',
    });
    setErrors({});
    setEditProductId(null);
    setSelectedCategory('');
    setSubcategories([]);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Product name is required';
      case 'category':
        return value ? '' : 'Please select a category';
      case 'subcategory':
        return value ? '' : 'Please select a subcategory';
      case 'price':
        return value > 0 ? '' : 'Price must be a positive number';
      case 'stockQuantity':
        return value >= 0 ? '' : 'Stock quantity cannot be negative';
      case 'status':
        return value ? '' : 'Status is required';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });

    const errorMessage = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSubcategories(categories[category] || []);
    setProductData({ ...productData, category, subcategory: '' });
  };

  const handleNewImageUrlChange = (e) => {
    setProductData({
      ...productData,
      newImageUrl: e.target.value,
    });
  };

  const handleAddImageUrl = () => {
    const { newImageUrl } = productData;
    if (newImageUrl && /^https?:\/\/.+/i.test(newImageUrl)) {
      setProductData((prevData) => ({
        ...prevData,
        imageUrls: [...prevData.imageUrls, newImageUrl],
        newImageUrl: '',
      }));
    } else {
      alert('Please enter a valid image URL');
    }
  };

  const handleRemoveImageUrl = (url) => {
    setProductData((prevData) => ({
      ...prevData,
      imageUrls: prevData.imageUrls.filter((imgUrl) => imgUrl !== url),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(productData).forEach((key) => {
      const errorMessage = validateField(key, productData[key]);
      if (errorMessage) newErrors[key] = errorMessage;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const url = editMode
      ? `http://localhost:5000/api/products/edit/${editProductId}`
      : 'http://localhost:5000/api/products/add';

    const method = editMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        alert(editMode ? 'Product updated successfully' : 'Product added successfully');
        resetForm();
        fetchProducts();
        setActiveView('view');
      } else {
        const errorData = await response.json();
        alert(`Failed to ${editMode ? 'update' : 'add'} product: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/view');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching products:', errorData.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/delete/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Product deleted successfully');
          fetchProducts();
        } else {
          const errorData = await response.json();
          alert(`Failed to delete product: ${errorData.error}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete product. Please try again later.');
      }
    }
  };

  const handleEdit = (product) => {
    setProductData(product);
    setEditMode(true);
    setEditProductId(product._id);
    setSelectedCategory(product.category);
    setSubcategories(categories[product.category] || []);
    setActiveView('add');
  };

  return (
    <div id="sm-stock-management" className="stock-management">
      <div id="sm-sidebar" className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li onClick={() => handleViewChange('add')}>Add Product</li>
          <li onClick={() => handleViewChange('view')}>View Products</li>
        </ul>
      </div>

      <div id="sm-main-content" className="main-content">
        {activeView === 'add' && (
          <form onSubmit={handleSubmit} id="sm-form-container" className="form-container">
            <h2>{editMode ? 'Edit Product' : 'Add Product'}</h2>

            {/* Product Name */}
            <div id="sm-form-group" className="form-group">
              <label id="sm-label" htmlFor="name">Product Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                required
              />
              {errors.name && <span id="sm-error" className="error">{errors.name}</span>}
            </div>

            {/* Description */}
            <div id="sm-form-group" className="form-group">
              <label id="sm-label" htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                required
              />
              {errors.description && <span id="sm-error" className="error">{errors.description}</span>}
            </div>

            {/* Category */}
            <div id="sm-form-group" className="form-group">
              <label id="sm-label" htmlFor="category">Category:</label>
              <select
                id="category"
                name="category"
                value={productData.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Select a category</option>
                {Object.keys(categories).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span id="sm-error" className="error">{errors.category}</span>}
            </div>

            {/* Subcategory */}
            <div id="sm-form-group" className="form-group">
              <label id="sm-label" htmlFor="subcategory">Subcategory:</label>
              <select
                id="subcategory"
                name="subcategory"
                value={productData.subcategory}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subcategory && <span id="sm-error" className="error">{errors.subcategory}</span>}
            </div>

            {/* Price */}
            <div id="sm-form-group" className="form-group">
              <label id="sm-label" htmlFor="price">Price:</label>
              <input
                type="number"
                id="price"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                required
              />
              {errors.price && <span id="sm-error" className="error">{errors.price}</span>}
            </div>

            {/* Stock Quantity */}
            <div id="sm-form-group" className="form-group">
              <label id="sm-label" htmlFor="stockQuantity">Stock Quantity:</label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                value={productData.stockQuantity}
                onChange={handleInputChange}
                required
              />
              {errors.stockQuantity && <span id="sm-error" className="error">{errors.stockQuantity}</span>}
            </div>

            {/* Status */}
            <div id="sm-form-group" className="form-group">
              <label id="sm-label" htmlFor="status">Status:</label>
              <select
                id="status"
                name="status"
                value={productData.status}
                onChange={handleInputChange}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <span id="sm-error" className="error">{errors.status}</span>}
            </div>

            {/* Image URLs */}
            <div id="sm-form-group" className="form-group">
              <label id="sm-label" htmlFor="newImageUrl">Image URL:</label>
              <input
                type="text"
                id="newImageUrl"
                name="newImageUrl"
                value={productData.newImageUrl}
                onChange={handleNewImageUrlChange}
              />
              <button type="button" onClick={handleAddImageUrl}>Add Image</button>
            </div>
            <div id="sm-image-preview" className="image-preview">
              {productData.imageUrls.map((url) => (
                <div key={url} className="image-container">
                  <img src={url} alt="Product" onError={(e) => e.target.src = 'fallback-image-url.jpg'} />
                  <button type="button" onClick={() => handleRemoveImageUrl(url)}>Remove</button>
                </div>
              ))}
            </div>

            <button type="submit">{editMode ? 'Update Product' : 'Add Product'}</button>
          </form>
        )}

        {activeView === 'view' && (
          <div id="sm-product-list" className="product-list">
            <h2>Products</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                  <th>Status</th>
                  <th>Images</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.description}</td>
                    <td>{product.category}</td>
                    <td>{product.subcategory}</td>
                    <td>{product.price}</td>
                    <td>{product.stockQuantity}</td>
                    <td>{product.status}</td>
                    <td>
                      {product.imageUrls.map((url) => (
                        <img key={url} src={url} alt="Product" className="product-image" onError={(e) => e.target.src = 'fallback-image-url.jpg'} />
                      ))}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(product)}>Edit</button>
                      {/* <button onClick={() => handleDelete(product._id)}>Delete</button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManagement;
