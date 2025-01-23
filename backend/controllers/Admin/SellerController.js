// controllers/sellerController.js
import Seller from '../../models/SellerModel.js';  

// Fetch all sellers
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select('-password'); // Exclude password from the response
    res.status(200).json(sellers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add more controller methods here for creating, updating, and deleting sellers as needed
export const updateSellerStatus = async (req, res) => {
    const { status } = req.body;
    try {
      const updatedSeller = await Seller.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!updatedSeller) {
        return res.status(404).send('Seller not found');
      }
      res.json(updatedSeller);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };