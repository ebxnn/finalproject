import User from '../models/UserModel.js';
import Seller from '../models/SellerModel.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

// Hardcoded credentials (In production, use environment variables)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminpass123';

const DESIGNER_EMAIL = process.env.DESIGNER_EMAIL || 'designer@gmail.com';
const DESIGNER_PASSWORD = process.env.DESIGNER_PASSWORD || 'designer123';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Attempting to log in with email:', email);

    // 🔹 Check if the user is admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'admin', email: ADMIN_EMAIL, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Admin Token:', token);
      return res.status(200).json({
        message: 'Admin login successful',
        token,
        role: 'admin',
        redirectTo: '/admin',
      });
    }

    // 🔹 Check if the user is a hardcoded designer
    if (email === DESIGNER_EMAIL && password === DESIGNER_PASSWORD) {
      const token = jwt.sign(
        { id: 'designer', email: DESIGNER_EMAIL, role: 'designer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      console.log('Designer Token:', token);
      return res.status(200).json({
        message: 'Designer login successful',
        token,
        role: 'designer',
        redirectTo: '/designer',
      });
    }

    // 🔹 Proceed with regular user or seller login
    const user = await User.findOne({ email });
    const seller = await Seller.findOne({ email });

    console.log('User found:', user);
    console.log('Seller found:', seller);

    if (!user && !seller) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const account = user || seller;
    const role = user ? 'user' : 'seller';

    const isMatch = await argon2.verify(account.password, password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔹 Generate token for user or seller
    const token = jwt.sign(
      { id: account._id, email: account.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('User/Seller Token:', token);

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
      redirectTo: role === 'user' ? '/dashboard' : '/seller-dashboard',
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
