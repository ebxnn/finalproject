import express from "express";
import { sendSignupOtp, verifySignupOtp } from '../controllers/SignupController.js';

// import  verifyToken  from "../middleware/authenticateToken.js";


const router = express.Router();

router.post('/send-otp', sendSignupOtp);

// Route for verifying OTP and completing signup
router.post('/verify-otp', verifySignupOtp);

// router.get('/protected-route', verifyToken, (req, res) => {
//     res.status(200).json({ message: "This is a protected route", user: req.user });
//   });

// Route for sending OTP

export default router;
