// SubscriptionPlan.js
const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  planName: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  duration: { type: String, enum: ['weekly', 'monthly', 'yearly'], required: true }, // Plan duration
  meals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }] // Add menu item references here
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
