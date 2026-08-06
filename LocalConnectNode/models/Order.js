// models/Order.js – Order schema (mirrors Flask Order model)
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorName: { type: String, required: true },
  customerName: { type: String },
  customerPhone: { type: String },
  items: { type: String, required: true }, // JSON string of items
  itemsSummary: { type: String },
  deliveryType: { type: String, required: true },
  paymentType: { type: String, required: true },
  total: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  offerTitle: { type: String },
  status: { type: String, default: 'Pending' },
  orderType: { type: String },
  customerSuggestion: { type: String },
  rejectionReason: { type: String },
  deliveryLocationType: { type: String }, // 'home' or 'current'
  vendorLatitude: { type: Number },
  vendorLongitude: { type: Number },
  customerDeliveryLatitude: { type: Number },
  customerDeliveryLongitude: { type: Number },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  reviewRating: { type: Number },
  reviewComment: { type: String },
  reviewDate: { type: Date },
  preparingAt: { type: Date },
  outForDeliveryAt: { type: Date },
  readyAt: { type: Date },
  completedAt: { type: Date },
  rejectedAt: { type: Date },
  vendorResponse: { type: String },
  vendorResponseDate: { type: Date },
  responseHelpful: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
