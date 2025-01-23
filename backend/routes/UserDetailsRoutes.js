import express from 'express';
import UserDetails from '../models/UserDetailsModel.js';
import User from '../models/UserModel.js';
import authMiddleware from '../middleware/auth.js'; // Import the new middleware

const router = express.Router();

// GET route to fetch user details
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId; // Use req.userId set by authMiddleware

        // Fetch user details
        const userDetails = await UserDetails.findOne({ userId });

        if (!userDetails) {
            // If user details are not found, inform the user that they need to add details
            return res.status(200).json({
                message: 'No details found. Please add your details.',
                userDetails: null
            });
        }

        return res.json(userDetails); // Send the user details if they exist
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).send('Error fetching user details.');
    }
});

// POST route to create or update user details
router.post('/', authMiddleware, async (req, res) => {
    const { fullName, address, city, district, state, phone, dateOfBirth } = req.body;

    try {
        const userId = req.userId; // Use req.userId set by authMiddleware

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) return res.status(404).send('User not found.');

        // Check if user details exist, then update or create
        const userDetails = await UserDetails.findOne({ userId });
        if (userDetails) {
            // Update existing user details
            userDetails.fullName = fullName;
            userDetails.address = address;
            userDetails.city = city;
            userDetails.district = district;
            userDetails.state = state;
            userDetails.phone = phone;
            userDetails.dateOfBirth = dateOfBirth;
            await userDetails.save();
            return res.send('User details updated successfully!');
        } else {
            // Create new user details
            const newUserDetails = new UserDetails({
                userId,
                fullName,
                address,
                city,
                district,
                state,
                phone,
                dateOfBirth,
            });
            await newUserDetails.save();
            return res.send('User details created successfully!');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to save user details.');
    }
});

export default router;
