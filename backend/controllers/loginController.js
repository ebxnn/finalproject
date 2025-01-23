import User from '../models/UserModel.js';
import Seller from '../models/SellerModel.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

// Hardcode admin credentials (in production, use environment variables)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpass123';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Attempting to log in with email:', email);

    // Check if the user is admin first
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate token for admin
      const token = jwt.sign(
        { id: 'admin', email: ADMIN_EMAIL, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Admin Token:', token); // Log the token for admin login

      return res.status(200).json({
        message: 'Admin login successful',
        token,
        role: 'admin',
        redirectTo: '/admin', // Add this to let the frontend know it should redirect to admin page
      });
    }

    // Proceed with regular user or seller login
    const user = await User.findOne({ email });
    const seller = await Seller.findOne({ email });

    console.log('User found:', user);
    console.log('Seller found:', seller);

    if (!user && !seller) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const account = user || seller; // Use the found account
    const role = user ? 'user' : 'seller';

    const isMatch = await argon2.verify(account.password, password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token for regular user or seller
    const token = jwt.sign(
      { id: account._id, email: account.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('User/Seller Token:', token); // Log the token for user/seller login

    const userData = {
      id: account._id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
    };

    res.status(200).json({
      message: 'Login successful',
      token,
      role,
      account: userData,
    });

  } catch (error) {
    console.error('Login error:', error); // Log any errors that occur
    res.status(500).json({ message: 'Server error' });
  }
};
