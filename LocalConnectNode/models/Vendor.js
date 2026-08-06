// models/Vendor.js – Vendor schema (mirrors Flask Vendor model)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const VendorSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  businessCategory: { type: String, required: true },
  businessSubCategory: { type: String },
  businessAddress: { type: String, required: true },
  phone: { type: String, required: true },
  isOpen: { type: Boolean, default: true },
  shopImage: { type: String, default: '🏪' },
  about: { type: String },
  categoryType: { type: String },
  vegNonveg: { type: String },
  indoorSeating: { type: Boolean, default: false },
  outdoorSeating: { type: Boolean, default: false },
  homeDelivery: { type: Boolean, default: false },
  takeaway: { type: Boolean, default: false },
  freeWifi: { type: Boolean, default: false },
  ac: { type: Boolean, default: false },
  cooler: { type: Boolean, default: false },
  parking: { type: String },
  otherAmenities: { type: String },
  openingTime: { type: String },
  closingTime: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

VendorSchema.methods.setPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

VendorSchema.methods.comparePassword = async function (plain) {
  return await bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('Vendor', VendorSchema);
