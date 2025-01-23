import express from 'express';
import { getAllProductsForAdmin } from '../controllers/adminController.js';

const router = express.Router();

router.get('/products', getAllProductsForAdmin);

export default router;
