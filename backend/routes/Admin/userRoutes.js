// src/routes/userRoutes.js
import express from 'express';
import { getAllUsers, updateUserStatus } from '../../controllers/Admin/UserController.js'; // Adjust the path according to your project structure

const router = express.Router();

// GET all users
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

export default router;
