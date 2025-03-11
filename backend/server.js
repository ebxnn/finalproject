import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

//Authentication
import loginRoutes from './routes/loginRoutes.js';
import SignupRoutes from './routes/SignupRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
//seller
import ProductReview from './routes/ProductReview.js';
import WishlistRoutes from './routes/WishlistRoutes.js';
import SellerRoutes from './routes/SellerRoutes.js';
import auth from  './routes/auth.js';
import  verifyToken  from './middleware/authenticateToken.js';
import userDetailsRouter from './routes/UserDetailsRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import upload from './middleware/upload.js'; // Adjust the path as necessary
import path from 'path'; 
import sellerRoutes from './routes/Admin/sellerRoutes.js';
import userRoutes from './routes/Admin/userRoutes.js';
import checkoutRoutes from './routes/payment/checkoutRoutes.js';
import orderRoutes from './routes/payment/orderRoutes.js';
import searchRoutes from './routes/search/searchRoutes.js';
import allOrderRoutes from './routes/profile/allOrderRoutes.js';
import orderViewRoutes from './routes/seller/orderViewRoutes.js';
import sellerProfileRoutes from './routes/seller/sellerProfileRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js';
import adminRoute from './routes/Admin/adminRoutes.js';
import sentimentRoutes from './routes/Admin/sentimentRoutes.js';  // Update import path if needed
import chatRoutes from './routes/chatRoutes.js';

const app = express();
const port = 5000;
connectDB();



app.use(cors());



app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000', // Development
  'https://bucolic-rolypoly-0bf95e.netlify.app' // Production
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,DELETE,PATCH',
  allowedHeaders: 'Content-Type, Authorization',
};


app.use(cors(corsOptions));


const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Static folder for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Use __dirname correctly

app.use('/api/login', loginRoutes);
app.use('/api/user/signup', SignupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', ProductReview);
app.use('/api/wishlist', WishlistRoutes); //
app.use('/api/seller/signup', SellerRoutes); //
// app.use('/api/auth', auth);
app.use('/api/userDetails', userDetailsRouter);
app.use('/api/cart', cartRoutes); //z
app.use('/api/admin/sellers', sellerRoutes);
app.use('/api/admin', userRoutes); 
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/order/user-orders', allOrderRoutes); 
app.use('/api/seller-orders', orderViewRoutes)
app.use('/api/sellersProfile', sellerProfileRoutes); // Mount the seller routes
app.use('/api/category', categoryRoutes); // Mount the category routes
app.use('/api/sentiment', sentimentRoutes);  // Make sure this matches your frontend URL
app.use('/api/chat', chatRoutes);
app.use('/api/admin/analytics', adminRoute); // Mount the category routes
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
