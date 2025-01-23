import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Signup() {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      // Send signup data and request OTP
      const response = await axios.post('http://localhost:5000/api/signup/send-otp', formData, {
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
      const response = await axios.post('http://localhost:5000/api/signup/verify-otp', { email, otp }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success("Signup complete"); // Show success toast
        // Delay navigation to allow toast to be displayed
        setTimeout(() => {
          navigate('/login'); // Redirect to login page after successful signup
        }, 2000); // 2 seconds delay
      } else {
        toast.error("Invalid OTP"); // Show error toast
      }
    } catch (error) {
      toast.error("An error occurred during OTP verification"); // Show error toast
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

export default Signup;
