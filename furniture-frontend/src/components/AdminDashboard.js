import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'tailwindcss/tailwind.css';

// Hardcoded base URL
const BASE_URL = 'http://localhost:5000'; // Change this to your actual base URL

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
      const response = await fetch(`${BASE_URL}/api/admin/sellers`); // Use the hardcoded base URL
      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/products`); // Use the hardcoded base URL
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
      <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg">
        <div className="flex justify-center items-center h-16 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white">Admin</h1>
        </div>
        <nav className="mt-6">
          <ul className="space-y-4">
            <li className="px-4 py-2 hover:bg-gray-700 rounded-lg">
              <Link to="#" onClick={() => setActiveSection('sellers')} className="flex items-center text-white">
                Sellers
              </Link>
            </li>
            <li className="px-4 py-2 hover:bg-gray-700 rounded-lg">
              <Link to="#" onClick={() => setActiveSection('products')} className="flex items-center text-white">
                Products
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
