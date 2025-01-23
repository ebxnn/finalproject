// controllers/SellerController.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import Seller from '../models/SellerModel.js';

dotenv.config();

let sellerOtps = {};
let sellerUsers = {};

// Email configuration using Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Controller to send OTP during seller signup
export const sendSellerSignupOtp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if the seller already exists
  const existingSeller = await Seller.findOne({ email });
  if (existingSeller) {
    return res.status(400).json({ message: 'Seller already exists' });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Store seller data and OTP temporarily for email verification
  sellerUsers[email] = { firstName, lastName, password };
  sellerOtps[email] = otp;

  // Send OTP via email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Seller Signup OTP Code',
      text: `Your OTP code is: ${otp}`,
    });
    res.status(200).json({ message: 'OTP sent to email', email });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Controller to verify OTP and complete the seller signup process
export const verifySellerSignupOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Check if the OTP is correct
  if (sellerOtps[email] && sellerOtps[email] === parseInt(otp)) {
    const seller = sellerUsers[email];

    // Hash the password using Argon2 before saving
    try {
      const hashedPassword = await argon2.hash(seller.password);

      // Save the seller in the database
      const newSeller = new Seller({
        firstName: seller.firstName,
        lastName: seller.lastName,
        email: email,
        password: hashedPassword,
      });

      await newSeller.save();
      delete sellerOtps[email]; // Clear OTP after verification
      delete sellerUsers[email]; // Clear temporary seller data

      // Generate a JWT token (optional)
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ message: 'OTP verified, seller signup complete', token });
    } catch (error) {
      console.error('Error saving seller:', error);
      res.status(500).json({ message: 'Error saving seller to the database' });
    }
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};
