import axios from "axios";
import dotenv from "dotenv";
import Order from "../../models/Order.js"; // Order Model

dotenv.config();

/**
 * @desc Analyze Order Data and Generate Sentiment
 * @route GET /api/sentiment/analyze
 * @access Private (Admin)
 */
export const analyzeOrders = async (req, res) => {
  console.log("Controller hit with prompt:", req.body.prompt);
  try {
    const { prompt } = req.body; // Get custom prompt from frontend

    // Validate Google API key
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("Google API key is not configured");
    }

    const orders = await Order.find().populate("items.product", "name price");

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const productCounts = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.name) {
          const productName = item.product.name;
          productCounts[productName] = (productCounts[productName] || 0) + 1;
        }
      });
    });

    const mostOrderedProduct = Object.keys(productCounts).reduce(
      (a, b) => productCounts[a] > productCounts[b] ? a : b,
      "None"
    );

    // Use the custom prompt from frontend
    const analysisPrompt = `${prompt}\n\nOrder Data:\n` +
      `- Total Orders: ${totalOrders}\n` +
      `- Total Revenue: ₹${totalRevenue.toFixed(2)}\n` +
      `- Most Ordered Product: ${mostOrderedProduct}\n` +
      `- Product Distribution: ${JSON.stringify(productCounts)}`;

    // Updated Gemini API endpoint
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: analysisPrompt
            }]
          }]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response format from Gemini API");
      }

      const sentiment = response.data.candidates[0].content.parts[0].text;

      res.json({
        totalOrders,
        totalRevenue,
        mostOrderedProduct,
        sentiment: sentiment.split("\n").map(point => point.trim()).filter(Boolean),
      });

    } catch (apiError) {
      console.error("Gemini API Error:", {
        message: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status,
        endpoint: apiError.config?.url,
        requestData: apiError.config?.data
      });
      
      if (apiError.response?.status === 404) {
        throw new Error("Invalid Gemini API endpoint or model not found. Please check the model name and API version.");
      } else if (apiError.response?.status === 401) {
        throw new Error("Invalid API key. Please check your Google API key configuration.");
      } else if (apiError.response?.status === 403) {
        throw new Error("API key not authorized for Gemini API. Please enable the Gemini API in your Google Cloud Console.");
      } else {
        throw new Error(`Gemini API error: ${apiError.message}`);
      }
    }

  } catch (error) {
    console.error("Error analyzing orders:", {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: "Failed to analyze orders",
      details: error.message 
    });
  }
};
