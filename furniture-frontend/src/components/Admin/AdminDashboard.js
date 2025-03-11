// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar'; // Import the sidebar component
import 'tailwindcss/tailwind.css';

const BASE_URL = 'https://finalprojectqwq.onrender.com'; // Hardcoded base URL without api/admin

const AdminDashboard = () => {
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeSection, setActiveSection] = useState('sellers'); // Track which section is active

  useEffect(() => {
    fetchSellers();
    fetchProducts();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/sellers`); // Complete the URL with the endpoint
      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/products`); // Complete the URL with the endpoint
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'sellers':
        return (
          <div className="overflow-x-auto rounded-lg shadow-md mb-8">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 border-b">First Name</th>
                  <th className="py-3 px-4 border-b">Last Name</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Role</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-100 transition duration-200">
                    <td className="py-3 px-4 border-b">{seller.firstName}</td>
                    <td className="py-3 px-4 border-b">{seller.lastName}</td>
                    <td className="py-3 px-4 border-b">{seller.email}</td>
                    <td className="py-3 px-4 border-b">{seller.status}</td>
                    <td className="py-3 px-4 border-b">{seller.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'products':
        return (
          <div className="overflow-x-auto rounded-lg shadow-md mb-8">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 border-b">Name</th>
                  <th className="py-3 px-4 border-b">Description</th>
                  <th className="py-3 px-4 border-b">Category</th>
                  <th className="py-3 px-4 border-b">Subcategory</th>
                  <th className="py-3 px-4 border-b">Price</th>
                  <th className="py-3 px-4 border-b">Stock Quantity</th>
                  <th className="py-3 px-4 border-b">Image</th>
                  <th className="py-3 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-100 transition duration-200">
                    <td className="py-3 px-4 border-b">{product.name}</td>
                    <td className="py-3 px-4 border-b">{product.description}</td>
                    <td className="py-3 px-4 border-b">{product.category}</td>
                    <td className="py-3 px-4 border-b">{product.subcategory}</td>
                    <td className="py-3 px-4 border-b">Rs.{product.price.toFixed(2)}</td>
                    <td className="py-3 px-4 border-b">{product.stockQuantity}</td>
                    <td className="py-3 px-4 border-b">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4 border-b">{product.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <div className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
