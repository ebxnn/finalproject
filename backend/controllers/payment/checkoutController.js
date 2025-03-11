import Order from '../../models/Order.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Product from '../../models/ProductReviewModel.js';  // Ensure this path is correct
import simpleBlockchainService from '../../services/simpleBlockchainService.js';
import pinataService from '../../services/pinataService.js';
import ethers from 'ethers';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Add network configuration
const NETWORK_CONFIG = {
  chainId: 80002,
  name: 'Polygon Amoy Testnet',
  rpcUrl: 'https://polygon-amoy.drpc.org',
  currency: 'POL'
};

// Create Order
export const createOrder = async (req, res) => {
  const userId = req.userId;
  const {
    fullName,
    email,
    phone,
    address,
    city,
    state,
    zipCode,
    country,
    items,
  } = req.body;

  // Validate user input
  if (!fullName || !email || !phone || !address || !city || !state || !zipCode || !country || !items || items.length === 0) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Validate and structure items
    const validatedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.product); // Look up product by ID
      if (!product) {
        throw new Error(`Product not found for ID: ${item.product}`);
      }
      return {
        product: product._id, // Ensure we are storing the correct product ID
        quantity: item.quantity,
        price: product.price, // Capture the product price
      };
    }));

    // Calculate total amount for the order
    const totalAmount = validatedItems.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity; // Calculate total for each item
      console.log(`Item: ${item.product}, Quantity: ${item.quantity}, Item Total: ${itemTotal}`); // Log item details
      return acc + itemTotal;
    }, 0) * 100; // Amount in paise

    // Check for valid totalAmount
    if (isNaN(totalAmount) || totalAmount < 0) {
      throw new Error('Calculated total amount is invalid.');
    }

    // Create a new order
    const newOrder = new Order({
      userId,
      fullName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      items: validatedItems, // Use validated items
      totalAmount,
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Create a Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: savedOrder._id.toString(),
    });

    // Save the Razorpay order ID in the Order document
    savedOrder.razorpayOrderId = razorpayOrder.id; // Assign the Razorpay Order ID
    await savedOrder.save(); // Ensure to save the updated order

    console.log('Order created and saved with Razorpay Order ID:', savedOrder);

    // Respond with success
    res.status(201).json({
      message: 'Order created successfully.',
      order: savedOrder,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ message: 'Error creating order.', error: error.message });
  }
};

// Update the verifyPayment function
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, blockchainPayment } = req.body;

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Verify the transaction
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    
    try {
      // Get transaction receipt
      const txReceipt = await provider.getTransactionReceipt(blockchainPayment.transactionHash);
      
      if (!txReceipt) {
        return res.status(400).json({ 
          message: 'Transaction not found on blockchain'
        });
      }

      if (txReceipt.status !== 1) {
        return res.status(400).json({ 
          message: 'Transaction failed on blockchain'
        });
      }

      // Verify transaction details
      const transaction = await provider.getTransaction(blockchainPayment.transactionHash);
      
      // Verify amount
      const value = ethers.utils.formatEther(transaction.value);
      if (value !== ethers.utils.formatEther(blockchainPayment.amount)) {
        return res.status(400).json({ 
          message: 'Transaction amount mismatch'
        });
      }

      // Verify recipient
      if (transaction.to.toLowerCase() !== process.env.ADMIN_WALLET_ADDRESS.toLowerCase()) {
        return res.status(400).json({ 
          message: 'Invalid payment recipient'
        });
      }

      // Update order with verified blockchain payment details
      order.blockchainPayment = {
        walletAddress: blockchainPayment.walletAddress,
        transactionHash: blockchainPayment.transactionHash,
        amount: blockchainPayment.amount,
        network: NETWORK_CONFIG.name,
        status: 'Confirmed',
        verifiedAt: new Date()
      };
      order.paymentStatus = 'Paid';

      // Store digital receipt on IPFS
      const ipfsReceipt = await pinataService.storeReceipt(order);
      
      if (ipfsReceipt.error) {
        console.warn('Receipt generation warning:', ipfsReceipt.error);
        order.digitalReceipt = {
          error: ipfsReceipt.error,
          createdAt: new Date()
        };
      } else {
        order.digitalReceipt = {
          url: ipfsReceipt.url,
          imageUrl: ipfsReceipt.imageUrl,
          ipfsHash: ipfsReceipt.ipfsHash,
          imageIpfsHash: ipfsReceipt.imageIpfsHash,
          createdAt: new Date()
        };
      }

      await order.save();

      res.status(200).json({ 
        message: 'Payment verified successfully',
        order,
        receiptStatus: ipfsReceipt.error ? 'warning' : 'success',
        receiptError: ipfsReceipt.error
      });
    } catch (error) {
      console.error('Blockchain verification error:', error);
      res.status(400).json({ 
        message: 'Failed to verify transaction on blockchain',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      message: 'Error verifying payment',
      error: error.message 
    });
  }
};

export const getBlockchainTransactions = async (req, res) => {
  try {
    const orders = await Order.find({
      'blockchainPayment.transactionHash': { $exists: true }
    }).select('blockchainPayment totalAmount createdAt');

    res.json(orders);
  } catch (error) {
    console.error('Error fetching blockchain transactions:', error);
    res.status(500).json({ 
      message: 'Error fetching transactions',
      error: error.message 
    });
  }
};
