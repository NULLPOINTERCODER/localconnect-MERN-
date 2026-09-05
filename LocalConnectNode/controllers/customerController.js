// controllers/customerController.js – Customer Dashboard & Feature Handlers
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Offer = require('../models/Offer');
const { toFlaskCustomer, toFlaskVendor, toFlaskMenuItem, toFlaskOrder } = require('../utils/formatters');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.session.user_id || (req.user ? req.user._id : null);
    const vendors = (await Vendor.find()).map(toFlaskVendor);
    const customer = toFlaskCustomer(await Customer.findById(userId));
    res.render('customer/index', { vendors, customer, user_name: customer ? customer.full_name : null });
  } catch (err) {
    console.error('Error in customer dashboard:', err);
    res.status(500).send('Server Error');
  }
};

exports.getCategoryPage = (category, templateName) => async (req, res) => {
  try {
    const userId = req.session.user_id || (req.user ? req.user._id : null);
    const vendors = (await Vendor.find({ businessCategory: category })).map(toFlaskVendor);
    const customer = toFlaskCustomer(await Customer.findById(userId));
    const viewName = templateName.replace(/\.html$/, '');
    res.render(`customer/${viewName}`, {
      vendors,
      customer,
      customer_lat: customer ? customer.latitude : null,
      customer_lon: customer ? customer.longitude : null,
    });
  } catch (err) {
    console.error(`Error loading category ${category}:`, err);
    res.status(500).send('Server Error');
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.session.user_id || (req.user ? req.user._id : null);
    const rawOrders = await Order.find({ customer: userId });
    const orders = rawOrders.map(toFlaskOrder);
    const customer = toFlaskCustomer(await Customer.findById(userId));
    res.render('customer/orders', { orders, customer });
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    res.status(500).send('Server Error');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.session.user_id || (req.user ? req.user._id : null);
    const customer = toFlaskCustomer(await Customer.findById(userId));
    res.render('customer/profile', { customer });
  } catch (err) {
    console.error('Error fetching customer profile:', err);
    res.status(500).send('Server Error');
  }
};

exports.getVendorDetails = async (req, res) => {
  try {
    const vendor = toFlaskVendor(await Vendor.findById(req.params.id));
    if (!vendor) return res.redirect('/customer/dashboard');
    const menu_items = (await MenuItem.find({ vendor: req.params.id })).map(toFlaskMenuItem);
    const offers = await Offer.find({ vendor: req.params.id, active: true });
    res.render('customer/viewdet', { vendor, vendor_id: req.params.id, menu_items, offers });
  } catch (err) {
    console.error('Error loading vendor details:', err);
    res.redirect('/customer/dashboard');
  }
};

exports.getChangePassword = (req, res) => {
  res.render('customer/change_password', {});
};

exports.getNotificationSettings = (req, res) => {
  res.render('customer/notification_settings', {});
};

exports.getInvoice = async (req, res) => {
  try {
    const order = toFlaskOrder(await Order.findById(req.params.orderId));
    res.render('customer/invoice', { order });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.redirect('/customer/orders');
  }
};
