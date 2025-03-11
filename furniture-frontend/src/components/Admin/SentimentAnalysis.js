import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaDollarSign, FaSmile, FaTrophy } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SentimentAnalysis = () => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("sentiment");
  const [customPrompt, setCustomPrompt] = useState('');

  const fetchSentiment = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Sending prompt:", customPrompt);
      
      const response = await axios.post(
        "https://mernstack-pro.onrender.com/api/sentiment/analyze",
        {
          prompt: customPrompt || "Analyze this order data and provide insights about sales performance, customer behavior, and product popularity."
        }
      );
      
      setSentimentData(response.data);
    } catch (err) {
      console.error("Error details:", err.response || err);
      const errorMessage = err.response?.data?.details || err.response?.data?.error || "Failed to fetch sentiment analysis";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
  }, []);

  const handleAnalyze = () => {
    setLoading(true);
    fetchSentiment();
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <ToastContainer />
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="ml-64 p-8 w-full">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">📊 Order Sentiment Analysis</h2>

        {/* Custom Prompt Input */}
        <div className="bg-white shadow-md p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Custom Analysis Prompt</h3>
          <textarea
            value={customPrompt}
            id="sentimentext"
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your custom analysis prompt..."
            className="w-full p-3 border rounded-md mb-3"
            rows={3}
          />
          <button
            onClick={handleAnalyze}
            id="analyze"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Analyze
          </button>
        </div>

        {loading ? (
          <p className="text-gray-700 text-lg">Loading sentiment analysis...</p>
        ) : error ? (
          <p className="text-red-500 text-lg">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Orders */}
            <div className="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
              <FaBox className="text-blue-500 text-3xl" />
              <div>
                <p className="text-gray-600">Total Orders</p>
                <h3 className="text-xl font-semibold">{sentimentData.totalOrders}</h3>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
              <FaDollarSign className="text-green-500 text-3xl" />
              <div>
                <p className="text-gray-600">Total Revenue</p>
                <h3 className="text-xl font-semibold">₹{sentimentData.totalRevenue.toFixed(2)}</h3>
              </div>
            </div>

            {/* Most Ordered Product */}
            <div className="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
              <FaTrophy className="text-yellow-500 text-3xl" />
              <div>
                <p className="text-gray-600">Most Ordered Product</p>
                <h3 className="text-xl font-semibold">{sentimentData.mostOrderedProduct}</h3>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white shadow-md p-6 rounded-lg md:col-span-3">
              <div className="flex items-center space-x-4 mb-4">
                <FaSmile className="text-purple-500 text-3xl" />
                <h3 className="text-xl font-semibold text-gray-700">Analysis Results</h3>
              </div>
              <div className="text-gray-700">
                {Array.isArray(sentimentData.sentiment) ? (
                  <ul className="list-disc pl-6">
                    {sentimentData.sentiment.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{sentimentData.sentiment}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysis;
