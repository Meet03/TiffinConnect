// backend/models/Driver.js

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleType: { type: String, required: false },
  licenseNumber: { type: String, required: false },
  deliveryRadius: { type: Number, required: false },
  currentStatus: { type: String, enum: ['available', 'on delivery', 'off duty'], default: 'available' },
  rating: { type: Number, default: 0 },
  completedDeliveries: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  currentLocation: { type: { latitude: Number, longitude: Number }, default: { latitude: 0, longitude: 0 }},
  phoneNumber: { type: String },
  profilePhoto: { type: String },
  address: { type: String } // Added address field
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
