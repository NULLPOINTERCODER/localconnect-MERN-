// controllers/vendorController.js – Vendor Dashboard & Management Controllers
const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const { toFlaskVendor, toFlaskMenuItem, toFlaskOrder, getCategoryLabels } = require('../utils/formatters');
const { uploadToCloudinary } = require('../cloudConfig');

exports.getDashboard = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    const rawOrders = await Order.find({ vendor: vendorId });
    const orders = rawOrders.map(toFlaskOrder);
    const rawMenuItems = await MenuItem.find({ vendor: vendorId });
    const menu_items = rawMenuItems.map(toFlaskMenuItem);
    const labels = getCategoryLabels(vendor ? vendor.business_category : '');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrdersList = rawOrders.filter(o => o.createdAt && new Date(o.createdAt) >= today);
    const todays_orders = todaysOrdersList.length;
    const todays_earnings = todaysOrdersList
      .filter(o => o.status === 'Completed')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const pending_orders = rawOrders.filter(o => o.status === 'Pending').length;

    const ratedOrders = rawOrders.filter(o => o.reviewRating && o.reviewRating > 0);
    const avg_rating = ratedOrders.length
      ? (ratedOrders.reduce((sum, o) => sum + o.reviewRating, 0) / ratedOrders.length).toFixed(1)
      : (vendor && vendor.rating ? Number(vendor.rating).toFixed(1) : '5.0');

    res.render('vendor/vendor_dashboard', {
      vendor_profile: vendor,
      orders,
      menu_items,
      labels,
      todays_orders,
      todays_earnings,
      avg_rating,
      pending_orders,
      unread_count: 0,
    });
  } catch (err) {
    console.error('Error loading vendor dashboard:', err);
    res.status(500).send('Server Error');
  }
};

exports.getMenu = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    const menu_items = (await MenuItem.find({ vendor: vendorId })).map(toFlaskMenuItem);
    const labels = getCategoryLabels(vendor ? vendor.business_category : '');
    res.render('vendor/menu', { vendor_profile: vendor, menu_items, items: menu_items, labels });
  } catch (err) {
    console.error('Error loading vendor menu page:', err);
    res.status(500).send('Server Error');
  }
};

exports.getOrders = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    const orders = (await Order.find({ vendor: vendorId })).map(toFlaskOrder);
    const labels = getCategoryLabels(vendor ? vendor.business_category : '');
    res.render('vendor/orders', { vendor_profile: vendor, orders, labels });
  } catch (err) {
    console.error('Error loading vendor orders page:', err);
    res.status(500).send('Server Error');
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    const completedOrders = (await Order.find({ vendor: vendorId, status: 'Completed' })).map(toFlaskOrder);
    const total_earnings = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const labels = getCategoryLabels(vendor ? vendor.business_category : '');
    res.render('vendor/earnings', { vendor_profile: vendor, total_earnings, orders: completedOrders, labels });
  } catch (err) {
    console.error('Error loading vendor earnings page:', err);
    res.status(500).send('Server Error');
  }
};

exports.getReviews = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    const reviews = (await Order.find({ vendor: vendorId, reviewRating: { $exists: true } })).map(toFlaskOrder);
    const labels = getCategoryLabels(vendor ? vendor.business_category : '');
    res.render('vendor/reviews', { vendor_profile: vendor, reviews, labels });
  } catch (err) {
    console.error('Error loading vendor reviews page:', err);
    res.status(500).send('Server Error');
  }
};

exports.getSettings = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    const labels = getCategoryLabels(vendor ? vendor.business_category : '');
    res.render('vendor/settings', { vendor_profile: vendor, labels });
  } catch (err) {
    console.error('Error loading vendor settings page:', err);
    res.status(500).send('Server Error');
  }
};

exports.getDeliveryMap = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    const orders = (await Order.find({ vendor: vendorId })).map(toFlaskOrder);
    const labels = getCategoryLabels(vendor ? vendor.business_category : '');
    res.render('vendor/delivery_map', { vendor_profile: vendor, orders, labels });
  } catch (err) {
    console.error('Error loading vendor delivery map:', err);
    res.status(500).send('Server Error');
  }
};

exports.getNotificationDashboard = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    res.render('vendor/notification_dashboard', { vendor_profile: vendor, notifications: [] });
  } catch (err) {
    console.error('Error loading notification dashboard:', err);
    res.status(500).send('Server Error');
  }
};

exports.getNotificationSettings = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    res.render('vendor/notification_settings', { vendor_profile: vendor });
  } catch (err) {
    console.error('Error loading notification settings:', err);
    res.status(500).send('Server Error');
  }
};

exports.getChangePassword = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = toFlaskVendor(await Vendor.findById(vendorId));
    res.render('vendor/change_password', { vendor_profile: vendor });
  } catch (err) {
    console.error('Error loading vendor change password page:', err);
    res.status(500).send('Server Error');
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Order.findByIdAndUpdate(req.params.orderId, { status });
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

exports.toggleShopStatus = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = await Vendor.findById(vendorId);
    vendor.isOpen = !vendor.isOpen;
    await vendor.save();
    res.json({ is_open: vendor.isOpen });
  } catch (err) {
    console.error('Error toggling shop status:', err);
    res.status(500).json({ error: 'Failed to toggle shop status' });
  }
};

exports.updateShopImage = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    let finalImageUrl = null;

    if (req.file && req.file.path) {
      finalImageUrl = req.file.path;
    } else if (req.body.shop_image) {
      const imgData = req.body.shop_image;
      if (imgData.startsWith('data:image/')) {
        finalImageUrl = await uploadToCloudinary(imgData, 'localconnect_shops');
      } else {
        finalImageUrl = imgData;
      }
    }

    if (finalImageUrl) {
      vendor.shopImage = finalImageUrl;
      await vendor.save();
      return res.json({ success: true, shop_image: finalImageUrl });
    }

    return res.status(400).json({ error: 'No image provided' });
  } catch (err) {
    console.error('Error updating shop image:', err);
    res.status(500).json({ error: 'Failed to update shop image' });
  }
};
