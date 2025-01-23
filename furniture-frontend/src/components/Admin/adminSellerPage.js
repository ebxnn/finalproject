import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar'; // Ensure the path to AdminSidebar is correct

// Define the base URL
const BASE_URL = 'http://localhost:5000'; // Change this to your production URL when deploying

const AdminSellersPage = () => {
  const [sellers, setSellers] = useState([]);
  const [activeSection, setActiveSection] = useState('sellers'); // Track which section is active
  const [error, setError] = useState(null); // For error handling

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/sellers`); // Use the hardcoded base URL
      if (!response.ok) {
        throw new Error('Failed to fetch sellers');
      }
      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setError(error.message); // Set error message to display to users
    }
  };

  const updateSellerStatus = async (id, status) => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/sellers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update seller status');
      }
      fetchSellers(); // Refresh the seller list after updating
    } catch (error) {
      console.error('Error updating seller status:', error);
      setError(error.message); // Set error message to display to users
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <div className="flex-grow p-8 ml-64">
        <h1 className="text-center text-white mb-4 text-2xl font-semibold">All Sellers</h1>
        {error && <p className="text-red-500 text-center">{error}</p>} {/* Display error message if exists */}
        {sellers.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full bg-gray-800 border border-gray-700">
              <thead className="bg-gray-900 text-gray-200">
                <tr>
                  <th className="py-3 px-4 border-b">First Name</th>
                  <th className="py-3 px-4 border-b">Last Name</th>
                  <th className="py-3 px-4 border-b">Email</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  <th className="py-3 px-4 border-b">Role</th>
                  <th className="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-700 transition duration-200">
                    <td className="py-3 px-4 border-b">{seller.firstName}</td>
                    <td className="py-3 px-4 border-b">{seller.lastName}</td>
                    <td className="py-3 px-4 border-b">{seller.email}</td>
                    <td className="py-3 px-4 border-b">{seller.status}</td>
                    <td className="py-3 px-4 border-b">{seller.role}</td>
                    <td className="py-3 px-4 border-b">
                      <button
                        className={`px-4 py-1 text-white rounded ${seller.status === 'active' ? 'bg-red-500' : 'bg-green-500'}`}
                        onClick={() => updateSellerStatus(seller._id, seller.status === 'active' ? 'inactive' : 'active')}
                      >
                        {seller.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      {/* <button
                        className="ml-2 px-4 py-1 bg-blue-500 text-white rounded"
                        onClick={() => updateSellerStatus(seller._id, 'approved')}
                      >
                        Approve
                      </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-white">No sellers available</p>
        )}
      </div>
    </div>
  );
};

export default AdminSellersPage;
