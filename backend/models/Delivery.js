const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  deliveryTime: { type: Date },
  deliveryAddress: { type: String, required: true },
  deliveryRating: { type: Number, default: 0 },
  driverFeedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
