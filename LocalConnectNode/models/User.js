// models/User.js – User schema for authentication (session‑based)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.setPassword = async function (plain) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(plain, salt);
};

UserSchema.methods.comparePassword = async function (plain) {
  return await bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
