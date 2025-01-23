import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  additionalDescription: { type: String },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true },
  imageUrls: [{ type: String }],
  measurements: {
    width: { type: Number },
    height: { type: Number },
    depth: { type: Number },
    weight: { type: Number },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active',
  },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // New field for userId
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
