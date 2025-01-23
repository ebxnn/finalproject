import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // New status field with default
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // New role field with default
});

const User = mongoose.model('User', userSchema);

export default User;
