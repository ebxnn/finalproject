import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

// Define the base URL
const BASE_URL = 'https://mernstack-pro.onrender.com'; // Change this to your production URL when deploying

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/admin/users`); // Use the hardcoded base URL
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.message);
        }
    };

    const updateUserStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`${BASE_URL}/api/admin/users/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            fetchUsers(); // Refresh the user list after updating
        } catch (error) {
            console.error('Error updating user status:', error);
            setError(error.message);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100">
            <AdminSidebar activeSection="users" setActiveSection={() => {}} />
            <div className="flex-grow p-8 ml-64">
                <h1 className="text-center text-white mb-4 text-3xl">All Users</h1>
                {error && <p className="text-red-500 text-center">{error}</p>}
                {users.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg shadow-md">
                        <table className="min-w-full bg-gray-800 border border-gray-700">
                            <thead className="bg-gray-700 text-white">
                                <tr>
                                    <th className="py-3 px-4 border-b border-gray-600">First Name</th>
                                    <th className="py-3 px-4 border-b border-gray-600">Last Name</th>
                                    <th className="py-3 px-4 border-b border-gray-600">Email</th>
                                    <th className="py-3 px-4 border-b border-gray-600">Status</th>
                                    <th className="py-3 px-4 border-b border-gray-600">Role</th>
                                    <th className="py-3 px-4 border-b border-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-700 transition duration-200">
                                        <td className="py-3 px-4 border-b border-gray-600">{user.firstName}</td>
                                        <td className="py-3 px-4 border-b border-gray-600">{user.lastName}</td>
                                        <td className="py-3 px-4 border-b border-gray-600">{user.email}</td>
                                        <td className="py-3 px-4 border-b border-gray-600">{user.status}</td>
                                        <td className="py-3 px-4 border-b border-gray-600">{user.role}</td>
                                        <td className="py-3 px-4 border-b border-gray-600">
                                            <button
                                                className={`px-4 py-1 text-white rounded ${user.status === 'active' ? 'bg-red-500' : 'bg-green-500'}`}
                                                onClick={() => updateUserStatus(user._id, user.status === 'active' ? 'inactive' : 'active')}
                                            >
                                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-white">No users available</p>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
