const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['provider', 'customer', 'driver','admin'], required: true },
  contactNumber: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profilePictureURL: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
