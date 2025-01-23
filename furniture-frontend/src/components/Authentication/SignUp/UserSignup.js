import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UserSignup() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // For step-based form
  const [email, setEmail] = useState(''); // Email for OTP submission
  const navigate = useNavigate();

  // Define base URL and endpoints
  const BASE_URL = 'http://localhost:5000';
  const SEND_OTP_ENDPOINT = '/api/user/signup/send-otp';
  const VERIFY_OTP_ENDPOINT = '/api/user/signup/verify-otp';

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Form submission for signup (Step 1)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for password match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validation for strong password (optional but recommended)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must be at least 8 characters long and contain both letters and numbers.");
      return;
    }

    try {
      // API call to send OTP
      const response = await axios.post(`${BASE_URL}${SEND_OTP_ENDPOINT}`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setEmail(formData.email); // Store email for OTP verification
        setStep(2); // Move to OTP step
        toast.success("OTP sent to your email");
      } else {
        toast.error("Signup failed, please try again.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred during signup. Please try again.");
      }
    }
  };

  // OTP submission for verification (Step 2)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      // API call to verify OTP
      const response = await axios.post(`${BASE_URL}${VERIFY_OTP_ENDPOINT}`, { email, otp }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const { token } = response.data; // Receive token from response
        localStorage.setItem('token', token); // Store token in local storage
        toast.success("Signup complete! Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred during OTP verification. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick draggable />
      <div className="left-section">
        <div className="character"></div>
      </div>
      <div className="right-section">
        <div className="form-container">
          {step === 1 ? (
            <>
              <h2>Join Our Family<br /><span>to join us today</span></h2>
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
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
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
                <button type="submit" className="signup-button">Sign Up</button>
              </form>
            </>
          ) : (
            <>
              <h2>Verify OTP</h2>
              <form onSubmit={handleOtpSubmit}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button type="submit" className="signup-button">Verify OTP</button>
              </form>
            </>
          )}
          <p className="signup-text">
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserSignup;
