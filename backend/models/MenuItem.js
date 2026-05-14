const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  mealName: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageURL: { type: String },
  availability: { type: Boolean, default: true },
  mealType: { type: String, enum: ['vegetarian', 'vegan', 'non-vegetarian'] }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
