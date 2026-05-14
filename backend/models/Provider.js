// backend/models/Provider.js
const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantName: { type: String, required: true },
  menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  subscriptionPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' }], // New field for subscription plans
  deliveryOptions: { type: String },
  rating: { type: Number, default: 0 },
  reviews: [{ reviewId: mongoose.Schema.Types.ObjectId, comment: String }],
  restaurantLogoURL: { type: String },
  address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Provider', providerSchema);
