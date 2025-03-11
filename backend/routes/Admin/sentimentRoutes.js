import express from "express";
import { analyzeOrders } from "../../controllers/Admin/sentimentController.js"; // Import Controller

const router = express.Router();

// Add console log to verify route registration
console.log("Registering sentiment routes...");

// Route for Order Sentiment Analysis
router.post("/analyze", (req, res, next) => {
  console.log("Sentiment route hit with body:", req.body);
  next();
}, analyzeOrders);

export default router;
