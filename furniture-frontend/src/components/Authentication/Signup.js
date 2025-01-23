import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; // Import your CSS file for styling

function Signup() {
  const navigate = useNavigate();

  const handleUserSignup = () => {
    navigate('/signupuser'); // Redirect to User Signup page
  };

  const handleSellerSignup = () => {
    navigate('/signupseller'); // Redirect to Seller Signup page
  };

  return (
    <div id="signup-container">
      <h2 id="signup-heading">Join Us</h2>
      <p id="signup-instruction">Choose your registration type:</p>
      <div id="signup-button-container">
        <button id="user-signup-button" className="signup-button" onClick={handleUserSignup}>
          Sign Up as User
        </button>
        <button id="seller-signup-button" className="signup-button" onClick={handleSellerSignup}>
          Sign Up as Seller
        </button>
      </div>
    </div>
  );
}

export default Signup;
