import express from 'express';
import { searchProducts } from '../../controllers/search/searchController.js';

const router = express.Router();

router.get('/', searchProducts);

export default router;
