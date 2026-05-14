// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  subscriptionPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true }, // Use correct key
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null }, // Driver ID for assigned driver
  deliveryStatus: { type: String, enum: ['unassigned', 'assigned', 'completed'], default: 'unassigned' }, // Delivery status
  status: { type: String, enum: ['pending', 'assigned', 'completed'], default: 'pending' },
});

module.exports = mongoose.model('Order', orderSchema);
