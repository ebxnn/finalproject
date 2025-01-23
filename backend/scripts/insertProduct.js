import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected...');


  const newProduct = new Product({
    id : '101',
    name: 'Example Product',
    description: 'This is an example product.',
    price: 29.99,
    category: 'Furniture',
    image: 'http://example.com/image.jpg',
    stock: 100
  });


  return newProduct.save();
})
.then(product => {
  console.log('Product saved:', product);

  mongoose.connection.close();
})
.catch(err => {
  console.error('Error connecting to MongoDB or saving product:', err);
});
