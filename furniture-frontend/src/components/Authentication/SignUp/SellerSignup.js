import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css'; // Assuming you have a CSS file for styling
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SellerSignup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Step 1: Signup Form, Step 2: OTP Verification
  const [email, setEmail] = useState(''); // Save email for OTP verification
  const navigate = useNavigate();

  // Define base URL and endpoints
  const BASE_URL = 'http://localhost:5000';
  const SEND_OTP_ENDPOINT = '/api/seller/signup/send-otp';
  const VERIFY_OTP_ENDPOINT = '/api/seller/signup/verify-otp';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validations
    if (!validateEmail(formData.email)) {
      toast.error("Invalid email address");
      return;
    }
    
    if (!validatePassword(formData.password)) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      // Send signup data and request OTP
      const response = await axios.post(`${BASE_URL}${SEND_OTP_ENDPOINT}`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setEmail(formData.email); // Save the email for later OTP verification
        setStep(2); // Move to OTP verification step
        toast.success("OTP sent to your email");
      } else {
        toast.error("Signup failed");
      }
    } catch (error) {
      toast.error("An error occurred during signup");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}${VERIFY_OTP_ENDPOINT}`, { email, otp }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success("Signup complete");
        // Delay navigation to allow toast to be displayed
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after successful signup
        }, 2000); // 2 seconds delay
      } else {
        toast.error("Invalid OTP");
      }
    } catch (error) {
      toast.error("An error occurred during OTP verification");
    }
  };

  return (
    <div className="signup-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick={true} draggable={true} />
      <div className="left-section">
        <div className="character"></div>
      </div>
      <div className="right-section">
        <div className="form-container">
          {step === 1 ? (
            <>
              <h2>Join Our Seller Community<br /><span>to sell with us today</span></h2>
              <form className="signup-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button type="submit">Send OTP</button>
              </form>
            </>
          ) : (
            <>
              <h2>Verify Your OTP</h2>
              <form className="otp-form" onSubmit={handleOtpSubmit}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button type="submit">Verify OTP</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerSignup;
