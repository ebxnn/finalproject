// src/components/AdminSidebar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate(); // Use useNavigate for programmatic navigation

  const handleLogout = () => {
    // Clear any authentication tokens or user data from local storage
    localStorage.removeItem('authToken'); // Adjust based on how you handle authentication
    toast.success('Logged out successfully!', { autoClose: 3000 }); // Show toast notification for 3 seconds
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg">
      <div className="flex justify-center items-center h-16 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">Admin</h1>
      </div>
      <nav className="mt-6">
        <ul className="space-y-4">
          {/* <li className={`px-4 py-2 rounded-lg ${activeSection === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <Link to="/admin/dashboard" onClick={() => setActiveSection('dashboard')} className="flex items-center text-white">
              Dashboard
            </Link>
          </li> */}
          <li className={`px-4 py-2 rounded-lg ${activeSection === 'products' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <Link to="/admin/products" onClick={() => setActiveSection('products')} className="flex items-center text-white">
              Products
            </Link>
          </li>
          <li className={`px-4 py-2 rounded-lg ${activeSection === 'sellers' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <Link to="/admin/sellers" onClick={() => setActiveSection('sellers')} className="flex items-center text-white">
              Sellers
            </Link>
          </li>
          <li className={`px-4 py-2 rounded-lg ${activeSection === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <Link to="/admin/users" onClick={() => setActiveSection('users')} className="flex items-center text-white">
              Users
            </Link>
          </li>
          {/* Logout Button */}
          <li className="px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer">
            <button onClick={handleLogout} className="flex items-center text-white w-full">
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
