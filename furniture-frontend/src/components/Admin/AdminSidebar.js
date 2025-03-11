import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully!', { autoClose: 3000 });
    navigate('/login');
  };

  const handleSentimentClick = () => {
    setActiveSection('sentiment');
    navigate('/admin/sentiment');
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg">
      <div className="flex justify-center items-center h-16 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">Admin</h1>
      </div>
      <nav className="mt-6">
        <ul className="space-y-4">
          <li className={`px-4 py-2 rounded-lg ${activeSection === 'analytics' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <Link to="/admin" onClick={() => setActiveSection('analytics')} className="flex items-center text-white">
              Analytics
            </Link>
          </li>
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
          {/* Sentiment Analysis Button */}
          <li className={`px-4 py-2 rounded-lg ${activeSection === 'sentiment' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
            <button 
              type="button"
              id="sentanalyze"
              data-testid="sentiment-button"
              onClick={handleSentimentClick}
              className="flex items-center text-white w-full text-left px-2 py-1"
            >
              Sentiment Analysis
            </button>
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
