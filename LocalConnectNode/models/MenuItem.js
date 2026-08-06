// models/MenuItem.js – MenuItem schema (mirrors Flask MenuItem model)
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  subName: { type: String },
  category: { type: String },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  imageFile: { type: String, default: 'default.jpg' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
