// models/Customer.js – Customer schema (mirrors Flask Customer model)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CustomerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  pincode: String,
  latitude: Number,
  longitude: Number,
  homeLatitude: Number,
  homeLongitude: Number,
  currentLatitude: Number,
  currentLongitude: Number,
  createdAt: { type: Date, default: Date.now }
});

CustomerSchema.methods.setPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plain, salt);
};
CustomerSchema.methods.comparePassword = async function (plain) {
  return await bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('Customer', CustomerSchema);
