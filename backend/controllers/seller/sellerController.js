import Seller from '../../models/SellerModel.js';  // Import Seller model

// Get Seller by ID
export const getSellerDetails = async (req, res) => {
  try {
    const sellerId = req.params.id;  // Get the seller ID from the URL parameter

    const seller = await Seller.findById(sellerId);  // Fetch seller by ID from Seller model
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json({
      firstName: seller.firstName,
      lastName: seller.lastName,
      email: seller.email,
      status: seller.status,
      role: seller.role,  // Assuming role is 'seller'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update Seller Details
export const updateSellerDetails = async (req, res) => {
  try {
    const sellerId = req.params.id;  // Get the seller ID from URL
    const { firstName, lastName, status, role } = req.body;

    // Check if the authenticated seller is trying to update their own profile
    if (sellerId !== req.userId) {
      return res.status(403).json({ message: 'You are not authorized to update this seller.' });
    }

    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { firstName, lastName, status, role },
      { new: true } // Return the updated document
    );

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json({
      message: 'Seller updated successfully',
      seller: {
        firstName: seller.firstName,
        lastName: seller.lastName,
        email: seller.email,
        status: seller.status,
        role: seller.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get the current logged-in seller details
export const getCurrentSeller = async (req, res) => {
  try {
    const sellerId = req.userId;  // Get seller ID from the authenticated user (set in authMiddleware)

    const seller = await Seller.findById(sellerId);  // Fetch the seller from the Seller model

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json({
      firstName: seller.firstName,
      lastName: seller.lastName,
      email: seller.email,
      status: seller.status,
      role: seller.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
