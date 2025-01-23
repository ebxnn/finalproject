import express from 'express';
import { addProduct, getAllProducts, deleteProduct, getProductById, updateProduct, getProductsBySeller, getProductsByCategory } from '../controllers/ProductReview.js';
import authMiddleware from '../middleware/auth.js'; // Import the middleware
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Existing routes
router.get('/seller-products', authMiddleware, getProductsBySeller);
router.post('/add', authMiddleware, upload.array('images', 5), addProduct);
router.get('/view', getAllProducts);
router.delete('/delete/:id', deleteProduct);
router.get('/:id', getProductById);
router.put('/edit/:id', updateProduct);

// New route for fetching products by category and subcategory
router.get('/category', getProductsByCategory); // This is the route you need

export default router;
