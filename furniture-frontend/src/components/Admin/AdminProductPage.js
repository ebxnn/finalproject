// src/components/AdminProductPage.js
import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import AdminSidebar from './AdminSidebar'; // Import the sidebar

// Define the base URL
const BASE_URL = 'http://localhost:5000'; // Change this to your production URL when deploying

const AdminProductPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/products`); // Use the hardcoded base URL
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Fixed Sidebar */}
      <AdminSidebar activeSection="products" setActiveSection={() => {}} /> {/* Pass active section prop */}

      {/* Main Content */}
      <div className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-center text-white mb-6">All Products</h1>
        {products.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full bg-gray-800 border border-gray-700">
              <thead className="bg-gray-900 text-gray-200">
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
              <tbody className="text-gray-300">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-700 transition duration-200">
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
        ) : (
          <p className="text-center text-gray-400">No products available</p>
        )}
      </div>
    </div>
  );
};

export default AdminProductPage;
