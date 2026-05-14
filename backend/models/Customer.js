// Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String },
  profilePicture: { type: String },
  subscriptions: [{ providerId: mongoose.Schema.Types.ObjectId, mealPlanId: mongoose.Schema.Types.ObjectId, startDate: Date, endDate: Date }],
  paymentInfo: [{ paymentId: mongoose.Schema.Types.ObjectId, paymentMethod: String }],
  favoriteProviders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }],
  address: { type: String },
  preferences: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
