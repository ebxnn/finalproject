import mongoose from 'mongoose';
import Order from '../../models/Order.js'; // Assuming Order model is correctly imported

// Function to retrieve orders for a seller
export const getOrdersForSeller = async (req, res) => {
  try {
    const sellerId = req.userId; // Assuming userId is set by auth middleware

    // Ensure sellerId is correctly converted to an ObjectId
    const objectIdSeller = new mongoose.Types.ObjectId(sellerId);

    // Fetch orders where the sellerId matches the userId of the product inside the items array
    const orders = await Order.aggregate([
      {
        // Step 1: Lookup product details from the 'products' collection for each item
        $lookup: {
          from: "products",          // The collection containing product details
          localField: "items.product", // Field in 'orders' collection referencing the product
          foreignField: "_id",        // Field in 'products' collection corresponding to the product ID
          as: "productDetails"        // Field to store the product details for each item
        }
      },
      {
        // Step 2: Unwind product details array (since it's returned as an array, we need to extract the details)
        $unwind: "$productDetails"
      },
      {
        // Step 3: Match the seller by their userId in the product details (exclude seller's own products)
        $match: {
          "productDetails.userId": { $ne: objectIdSeller } // Exclude products that belong to the logged-in user
        }
      },
      {
        // Step 4: Group the results back to combine items and aggregate totals for the order
        $group: {
          _id: "$_id",  // Group by order ID
          fullName: { $first: "$fullName" }, // Directly fetch fullName from the Order collection
          email: { $first: "$email" }, // Directly fetch email from the Order collection
          totalAmount: { $first: "$totalAmount" },  // Include the total order amount
          paymentStatus: { $first: "$paymentStatus" },  // Include payment status
          phone: { $first: "$phone" },  // Include phone from orders collection
          address: { $first: "$address" },  // Include address from orders collection
          city: { $first: "$city" },  // Include city from orders collection
          state: { $first: "$state" },  // Include state from orders collection
          zipCode: { $first: "$zipCode" },  // Include zipCode from orders collection
          country: { $first: "$country" },  // Include country from orders collection
          items: {  // Combine all the items and product details for the order
            $push: {
              product: "$items.product",
              quantity: "$items.quantity",
              name: "$productDetails.name",
              price: "$productDetails.price",
              description: "$productDetails.description",
              image: "$productDetails.image"
            }
          }
        }
      },
      {
        // Step 5: Project the final result to include required order, user, and product details
        $project: {
          orderId: "$_id",  // Use order ID as 'orderId' for clarity
          fullName: 1,  // Include fullName directly from the order
          email: 1,  // Include email directly from the order
          phone: 1,  // Include phone from the order
          address: 1,  // Include address from the order
          city: 1,  // Include city from the order
          state: 1,  // Include state from the order
          zipCode: 1,  // Include zipCode from the order
          country: 1,  // Include country from the order
          totalAmount: 1,  // Total amount of the order
          paymentStatus: 1,  // Payment status
          items: 1,  // List of items with product details, excluding seller's products
        }
      }
    ]);

    // console.log('Fetched Orders:', orders); // Log the fetched orders for debugging

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this seller.' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Error fetching orders.', error: error.message });
  }
};
