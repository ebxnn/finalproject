// routes/SellerRoutes.js
import express from 'express';
import { sendSellerSignupOtp, verifySellerSignupOtp } from '../controllers/SellerController.js';

const router = express.Router();

// Route to send OTP for seller signup
router.post('/send-otp', sendSellerSignupOtp);

// Route to verify OTP for seller signup
router.post('/verify-otp', verifySellerSignupOtp);

export default router;
