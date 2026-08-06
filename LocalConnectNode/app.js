// app.js – Main Express server entry point with Nunjucks view engine
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const nunjucks = require('nunjucks');
const flash = require('connect-flash');

// Connect to MongoDB (Atlas or local fallback)
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localconnect';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const app = express();

// Configure Nunjucks engine (Jinja2 for Node.js)
const env = nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  express: app,
  watch: false,
  noCache: true
});

// Add Flask / Jinja global helpers
env.addGlobal('url_for', (endpoint, opts) => {
  if (endpoint === 'static') {
    const filename = typeof opts === 'object' ? opts.filename : opts;
    return '/static/' + (filename || '');
  }
  const routeMap = {
    'home': '/',
    'signin': '/signin',
    'sign_in': '/signin',
    'customer_signup': '/customer/signup',
    'vendor_signup': '/vendor/signup',
    'logout': '/logout',
    'about': '/about',
    'contact': '/contact'
  };
  return routeMap[endpoint] || '/' + endpoint;
});

// Custom Nunjucks filters to match Flask/Jinja2
env.addFilter('int', val => parseInt(val, 10) || 0);
env.addFilter('float', val => parseFloat(val) || 0);
env.addFilter('round', (val, precision) => {
  const p = Math.pow(10, precision || 0);
  return Math.round(val * p) / p;
});
env.addFilter('format', (fmt, ...args) => {
  // Simple number formatting
  if (typeof args[0] === 'number') return args[0].toFixed(2);
  return String(args[0] || '');
});
env.addFilter('tojson', val => JSON.stringify(val));
env.addFilter('dump', val => JSON.stringify(val, null, 2));
env.addFilter('string', val => String(val));
env.addFilter('sum', (arr, attr) => {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce((acc, item) => acc + (attr ? (item[attr] || 0) : (item || 0)), 0);
});
env.addFilter('groupby', (arr, attr) => {
  if (!Array.isArray(arr)) return {};
  const groups = {};
  arr.forEach(item => {
    const key = item[attr] || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.entries(groups).map(([grouper, list]) => ({ grouper, list }));
});


app.set('view engine', 'html');

// Static files (serve on both / and /static prefix for full Flask URL compatibility)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session & Flash
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkeylocalconnect',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
}));
app.use(flash());

// Pass globals & flash messages to all templates
app.use((req, res, next) => {
  const u = req.session.user || null;
  const userName = u
    ? (u.fullName || u.businessName || u.full_name || u.business_name || u.email || '')
    : null;

  res.locals.request = { path: req.path };
  res.locals.session = req.session;
  res.locals.user = u;
  res.locals.user_name = userName;
  res.locals.user_role = req.session.user_role || null;
  res.locals.user_id = req.session.user_id || null;
  res.locals.unread_count = 0;
  res.locals.get_flashed_messages = (options) => {
    const errorMsg = req.flash('error');
    const successMsg = req.flash('success');
    const infoMsg = req.flash('info');
    const msgs = [];
    if (errorMsg && errorMsg.length) msgs.push(['error', errorMsg[0]]);
    if (successMsg && successMsg.length) msgs.push(['success', successMsg[0]]);
    if (infoMsg && infoMsg.length) msgs.push(['info', infoMsg[0]]);
    return msgs;
  };
  next();
});


// Import models
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Customer = require('./models/Customer');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const Offer = require('./models/Offer');

// ==================== HELPERS ====================
// Convert Mongoose Vendor doc to Flask-style template-compatible plain object
function toFlaskVendor(v) {
  if (!v) return null;
  const obj = v.toObject ? v.toObject() : v;
  return {
    ...obj,
    id: obj._id,
    business_name: obj.businessName,
    business_category: obj.businessCategory,
    business_sub_category: obj.businessSubCategory,
    business_address: obj.businessAddress,
    phone: obj.phone,
    email: obj.email,
    is_open: obj.isOpen,
    shop_image: obj.shopImage,
    latitude: obj.latitude,
    longitude: obj.longitude,
    about: obj.about,
    category_type: obj.categoryType,
    veg_nonveg: obj.vegNonveg,
    indoor_seating: obj.indoorSeating,
    outdoor_seating: obj.outdoorSeating,
    home_delivery: obj.homeDelivery,
    takeaway: obj.takeaway,
    free_wifi: obj.freeWifi,
    ac: obj.ac,
    cooler: obj.cooler,
    parking: obj.parking,
    other_amenities: obj.otherAmenities,
    opening_time: obj.openingTime,
    closing_time: obj.closingTime,
    created_at: obj.createdAt,
  };
}

// Convert Mongoose Customer doc to Flask-style template-compatible plain object
function toFlaskCustomer(c) {
  if (!c) return null;
  const obj = c.toObject ? c.toObject() : c;
  return {
    ...obj,
    id: obj._id,
    full_name: obj.fullName,
    email: obj.email,
    phone: obj.phone,
    address: obj.address,
    city: obj.city,
    state: obj.state,
    pincode: obj.pincode,
    latitude: obj.latitude,
    longitude: obj.longitude,
    home_latitude: obj.homeLatitude,
    home_longitude: obj.homeLongitude,
    current_latitude: obj.currentLatitude,
    current_longitude: obj.currentLongitude,
    created_at: obj.createdAt,
  };
}

// Convert Mongoose MenuItem doc to Flask-style object
function toFlaskMenuItem(m) {
  if (!m) return null;
  const obj = m.toObject ? m.toObject() : m;
  return {
    ...obj,
    id: obj._id,
    vendor_id: obj.vendor,
    name: obj.name,
    sub_name: obj.subName,
    category: obj.category,
    price: obj.price,
    is_available: obj.isAvailable,
    image_file: obj.imageFile,
    created_at: obj.createdAt,
  };
}

// Convert Mongoose Order doc to Flask-style object
function toFlaskOrder(o) {
  if (!o) return null;
  const obj = o.toObject ? o.toObject() : o;
  return {
    ...obj,
    id: obj._id,
    customer_id: obj.customer,
    vendor_id: obj.vendor,
    vendor_name: obj.vendorName,
    customer_name: obj.customerName,
    customer_phone: obj.customerPhone,
    items: obj.items,
    items_summary: obj.itemsSummary,
    delivery_type: obj.deliveryType,
    payment_type: obj.paymentType,
    total: obj.total,
    discount_amount: obj.discountAmount,
    offer_title: obj.offerTitle,
    status: obj.status,
    created_at: obj.createdAt,
    review_rating: obj.reviewRating,
    review_comment: obj.reviewComment,
  };
}

// ==================== PUBLIC ROUTES ====================

// Landing Page
app.get('/', (req, res) => {
  res.render('landing.html');
});

// About Page
app.get('/about', (req, res) => {
  res.render('about.html');
});

// Contact Page
app.get('/contact', (req, res) => {
  res.render('contact.html');
});

// Sign In GET & POST
app.get('/signin', (req, res) => {
  res.render('sign_in.html');
});

app.post('/signin', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    if (role === 'vendor') {
      const vendor = await Vendor.findOne({ email: username });
      if (!vendor || !(await vendor.comparePassword(password))) {
        req.flash('error', 'Invalid email or password for vendor account.');
        return res.redirect('/signin');
      }
      req.session.user = vendor;
      req.session.user_role = 'vendor';
      req.session.user_id = vendor._id;
      return res.redirect('/vendor/dashboard');
    } else {
      const customer = await Customer.findOne({ $or: [{ email: username }, { phone: username }] });
      if (!customer || !(await customer.comparePassword(password))) {
        req.flash('error', 'Invalid username or password.');
        return res.redirect('/signin');
      }
      req.session.user = customer;
      req.session.user_role = 'customer';
      req.session.user_id = customer._id;
      return res.redirect('/customer/dashboard');
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'An error occurred during sign in.');
    return res.redirect('/signin');
  }
});

// Customer Sign Up GET & POST
app.get('/customer/signup', (req, res) => {
  res.render('customer/sign_up.html');
});

app.post('/customer/signup', async (req, res) => {
  const { full_name, email, phone, password, confirm_password } = req.body;
  if (password !== confirm_password) {
    req.flash('error', 'Passwords do not match.');
    return res.redirect('/customer/signup');
  }
  try {
    const existing = await Customer.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      req.flash('error', 'An account with this email or phone already exists.');
      return res.redirect('/customer/signup');
    }
    const customer = new Customer({
      fullName: full_name,
      email,
      phone
    });
    await customer.setPassword(password);
    await customer.save();
    req.session.user = customer;
    req.session.user_role = 'customer';
    req.session.user_id = customer._id;
    return res.redirect('/customer/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create account.');
    return res.redirect('/customer/signup');
  }
});

// Vendor Sign Up GET & POST
app.get('/vendor/signup', (req, res) => {
  res.render('vendor/sign_up.html');
});

app.post('/vendor/signup', async (req, res) => {
  const { business_name, email, business_category, business_sub_category, business_address, phone, password } = req.body;
  try {
    const existing = await Vendor.findOne({ email });
    if (existing) {
      req.flash('error', 'Vendor account with this email already exists.');
      return res.redirect('/vendor/signup');
    }
    const vendor = new Vendor({
      businessName: business_name,
      email,
      businessCategory: business_category,
      businessSubCategory: business_sub_category,
      businessAddress: business_address,
      phone
    });
    await vendor.setPassword(password);
    await vendor.save();
    req.session.user = vendor;
    req.session.user_role = 'vendor';
    req.session.user_id = vendor._id;
    return res.redirect('/vendor/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to register vendor account.');
    return res.redirect('/vendor/signup');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ==================== CUSTOMER ROUTES ====================
app.get('/customer/dashboard', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'customer') {
    return res.redirect('/signin');
  }
  const vendors = (await Vendor.find()).map(toFlaskVendor);
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/index.html', { vendors, customer, user_name: customer ? customer.full_name : null });
});

app.get('/customer/food-restaurants', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Food & Restaurant' })).map(toFlaskVendor);
  res.render('customer/food&rest.html', { vendors });
});

app.get('/customer/garage', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Garage' })).map(toFlaskVendor);
  res.render('customer/garage.html', { vendors });
});

app.get('/customer/electronics', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Electronics' })).map(toFlaskVendor);
  res.render('customer/electronics.html', { vendors });
});

app.get('/customer/fashion', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Fashion' })).map(toFlaskVendor);
  res.render('customer/fashion.html', { vendors });
});

app.get('/customer/grocery', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Grocery' })).map(toFlaskVendor);
  res.render('customer/grocery.html', { vendors });
});

app.get('/customer/pharmacy', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Pharmacy' })).map(toFlaskVendor);
  res.render('customer/pharmacy.html', { vendors });
});

app.get('/customer/books', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Books' })).map(toFlaskVendor);
  res.render('customer/books.html', { vendors });
});

app.get('/customer/orders', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const rawOrders = await Order.find({ customer: req.session.user_id });
  const orders = rawOrders.map(toFlaskOrder);
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/orders.html', { orders, customer });
});

app.get('/customer/profile', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/profile.html', { customer });
});

app.get('/customer/vendor/:id', async (req, res) => {
  const vendor = toFlaskVendor(await Vendor.findById(req.params.id));
  const menu_items = (await MenuItem.find({ vendor: req.params.id })).map(toFlaskMenuItem);
  const offers = await Offer.find({ vendor: req.params.id, active: true });
  res.render('customer/viewdet.html', { vendor, menu_items, offers });
});

app.get('/customer/change-password', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  res.render('customer/change_password.html', {});
});

app.get('/customer/notification-settings', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  res.render('customer/notification_settings.html', {});
});

app.get('/invoice/:orderId', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const order = toFlaskOrder(await Order.findById(req.params.orderId));
  res.render('customer/invoice.html', { order });
});

// ==================== VENDOR ROUTES ====================
function getCategoryLabels(category) {
  const labels = {
    'Food & Restaurant': { inventory: 'Menu', icon: 'fa-utensils' },
    'Garage': { inventory: 'Services', icon: 'fa-wrench' },
    'Electronics': { inventory: 'Products', icon: 'fa-laptop' },
    'Fashion': { inventory: 'Products', icon: 'fa-tshirt' },
    'Grocery': { inventory: 'Products', icon: 'fa-shopping-basket' },
    'Pharmacy': { inventory: 'Products', icon: 'fa-pills' },
    'Books': { inventory: 'Books', icon: 'fa-book' },
  };
  return labels[category] || { inventory: 'Menu', icon: 'fa-store' };
}

app.get('/vendor/dashboard', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') {
    return res.redirect('/signin');
  }
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  const rawOrders = await Order.find({ vendor: req.session.user_id });
  const orders = rawOrders.map(toFlaskOrder);
  const rawMenuItems = await MenuItem.find({ vendor: req.session.user_id });
  const menu_items = rawMenuItems.map(toFlaskMenuItem);
  const labels = getCategoryLabels(vendor ? vendor.business_category : '');
  res.render('vendor/vendor_dashboard.html', {
    vendor_profile: vendor,
    orders,
    menu_items,
    labels,
    unread_count: 0,
  });
});

app.get('/vendor/menu', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.redirect('/signin');
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  const menu_items = (await MenuItem.find({ vendor: req.session.user_id })).map(toFlaskMenuItem);
  const labels = getCategoryLabels(vendor ? vendor.business_category : '');
  res.render('vendor/menu.html', { vendor_profile: vendor, menu_items, labels });
});

app.get('/vendor/orders', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.redirect('/signin');
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  const orders = (await Order.find({ vendor: req.session.user_id })).map(toFlaskOrder);
  const labels = getCategoryLabels(vendor ? vendor.business_category : '');
  res.render('vendor/orders.html', { vendor_profile: vendor, orders, labels });
});

app.get('/vendor/earnings', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.redirect('/signin');
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  const completedOrders = (await Order.find({ vendor: req.session.user_id, status: 'Completed' })).map(toFlaskOrder);
  const total_earnings = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const labels = getCategoryLabels(vendor ? vendor.business_category : '');
  res.render('vendor/earnings.html', { vendor_profile: vendor, total_earnings, orders: completedOrders, labels });
});

app.get('/vendor/reviews', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.redirect('/signin');
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  const reviews = (await Order.find({ vendor: req.session.user_id, reviewRating: { $exists: true } })).map(toFlaskOrder);
  const labels = getCategoryLabels(vendor ? vendor.business_category : '');
  res.render('vendor/reviews.html', { vendor_profile: vendor, reviews, labels });
});

app.get('/vendor/settings', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.redirect('/signin');
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  const labels = getCategoryLabels(vendor ? vendor.business_category : '');
  res.render('vendor/settings.html', { vendor_profile: vendor, labels });
});

app.get('/vendor/delivery-map', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.redirect('/signin');
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  const orders = (await Order.find({ vendor: req.session.user_id })).map(toFlaskOrder);
  const labels = getCategoryLabels(vendor ? vendor.business_category : '');
  res.render('vendor/delivery_map.html', { vendor_profile: vendor, orders, labels });
});

app.get('/vendor/notification-dashboard', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.redirect('/signin');
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  res.render('vendor/notification_dashboard.html', { vendor_profile: vendor, notifications: [] });
});

app.get('/vendor/notification-settings', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.redirect('/signin');
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  res.render('vendor/notification_settings.html', { vendor_profile: vendor });
});

app.get('/vendor/change-password', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.redirect('/signin');
  const vendor = toFlaskVendor(await Vendor.findById(req.session.user_id));
  res.render('vendor/change_password.html', { vendor_profile: vendor });
});

app.get('/signup/success', (req, res) => {
  res.render('success.html', {});
});

app.get('/forgot-password', (req, res) => {
  res.render('forgot_password.html', {});
});

app.get('/reset-password/:token', (req, res) => {
  res.render('reset_password.html', { token: req.params.token });
});

// ==================== VENDOR API ROUTES ====================
app.post('/vendor/orders/:orderId/status', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  const { status } = req.body;
  await Order.findByIdAndUpdate(req.params.orderId, { status });
  res.json({ success: true });
});

app.post('/toggle_shop_status', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  const vendor = await Vendor.findById(req.session.user_id);
  vendor.isOpen = !vendor.isOpen;
  await vendor.save();
  res.json({ is_open: vendor.isOpen });
});

// API mounts
app.use('/api', require('./routes/api'));

// 404 handler
app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1><a href="/">Go Home</a>');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Template/Server error:', err.message);
  res.status(500).send(`<h2>Server Error</h2><pre>${err.message}</pre><a href="/">Go Home</a>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 LocalConnect Server running on http://localhost:${PORT}`));
