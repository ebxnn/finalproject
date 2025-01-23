import React, { useState } from 'react';
import axios from 'axios';

// Hardcoded base URL without the /api part
const BASE_URL = 'http://localhost:5000'; 

const RazorpayCheckout = ({ totalAmount }) => {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      alert('Failed to load Razorpay SDK');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create an order on the backend
      const { data } = await axios.post(`${BASE_URL}/api/create-order`, {
        amount: totalAmount,
      });

      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
        amount: data.amount, // Amount in paise (from backend)
        currency: 'INR',
        name: 'Your Company Name',
        description: 'Test Transaction',
        image: 'https://your-company-logo.com/logo.png',
        order_id: data.orderId, // This is the order ID returned from the backend
        handler: function (response) {
          // Step 3: Handle successful payment here
          setPaymentStatus('Payment successful!');
          console.log(response.razorpay_payment_id);
          console.log(response.razorpay_order_id);
          console.log(response.razorpay_signature);
        },
        prefill: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      setPaymentStatus('Payment failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Total: ₹{totalAmount}</h2>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay with Razorpay'}
      </button>
      {paymentStatus && <div>{paymentStatus}</div>}
    </div>
  );
};

export default RazorpayCheckout;
