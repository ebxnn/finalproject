import express from 'express';
import { getOrderAnalytics } from '../../controllers/adminController.js';

const router = express.Router();

// Route for fetching order analytics
router.get('/', getOrderAnalytics);

export default router;
