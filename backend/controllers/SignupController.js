import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import User from '../models/UserModel.js';

dotenv.config();

// Temporary storage for OTPs and user data
let otps = {};
let users = {};

// Email configuration using Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Controller to send OTP during signup
export const sendSignupOtp = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Store user data and OTP temporarily for email verification
  users[email] = { firstName, lastName, password };
  otps[email] = otp;

  // Send OTP via email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Signup OTP Code',
      text: `Your OTP code is: ${otp}`,
    });
    res.status(200).json({ message: 'OTP sent to email', email });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Controller to verify OTP and complete the signup process
export const verifySignupOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Check if the OTP is correct
  if (otps[email] && otps[email] === parseInt(otp)) {
    const user = users[email];

    // Hash the password using Argon2 before saving
    try {
      const hashedPassword = await argon2.hash(user.password);

      // Save the user in the database with default status 'active' and role 'user'
      const newUser = new User({
        firstName: user.firstName,
        lastName: user.lastName,
        email: email,
        password: hashedPassword,
        // status and role will be automatically set to 'active' and 'user' by default
      });

      await newUser.save();
      delete otps[email]; // Clear OTP after verification
      delete users[email]; // Clear temporary user data

      // Generate a JWT token
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ message: 'OTP verified, signup complete', token });
    } catch (error) {
      console.error('Error saving user:', error);
      res.status(500).json({ message: 'Error saving user to the database' });
    }
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};
