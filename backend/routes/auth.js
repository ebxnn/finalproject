import express from 'express';
import verifyToken from '../middleware/authenticateToken.js'; // Import the middleware
import User from '../models/UserModel.js';
import Seller from '../models/SellerModel.js';

const router = express.Router();

// Fetch user profile data
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Access user ID from the decoded token
        const user = await User.findById(userId);
        const seller = await Seller.findById(userId);

        if (!user && !seller) {
            return res.status(404).json({ message: 'User not found' });
        }

        const account = user || seller; // Use user data if exists, otherwise seller
        res.status(200).json({
            id: account._id,
            email: account.email,
            firstName: account.firstName,
            lastName: account.lastName,
            role: user ? 'user' : 'seller',
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
