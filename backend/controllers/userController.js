// routes/auth.js
import express from 'express';
import User from '../models/UserModel.js'; // Adjust the import according to your project structure
import authenticateToken from '../middleware/authenticateToken.js'; // Import your existing middleware

const router = express.Router();

// GET User Profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
