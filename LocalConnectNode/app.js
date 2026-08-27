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
app.set('trust proxy', 1);

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
    if (typeof filename === 'string') {
      if (filename.includes('http://') || filename.includes('https://')) {
        const idx = filename.indexOf('http');
        return filename.substring(idx);
      }
      if (filename.includes('data:image/')) {
        const idx = filename.indexOf('data:image/');
        return filename.substring(idx);
      }
    }
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

// Multer and Cloudinary configuration
const multer = require('multer');
const { storage, uploadToCloudinary } = require('./cloudConfig');
const upload = multer({ storage });

// Body parsers (with 50mb limit for base64 image data)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

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
    id: obj._id ? obj._id.toString() : obj.id,
    name: obj.businessName || obj.name || 'Local Vendor',
    business_name: obj.businessName || obj.name || 'Local Vendor',
    business_category: obj.businessCategory || obj.category || '',
    category: obj.businessCategory || obj.category || '',
    business_sub_category: obj.businessSubCategory || obj.subcategory || '',
    subcategory: obj.businessSubCategory || obj.subcategory || '',
    business_address: obj.businessAddress || obj.address || '',
    phone: obj.phone,
    email: obj.email,
    is_open: obj.isOpen !== undefined ? obj.isOpen : true,
    shop_image: obj.shopImage || obj.image || '',
    latitude: obj.latitude || null,
    longitude: obj.longitude || null,
    about: obj.about,
    rating: obj.rating || 4.5,
    review_count: obj.reviewCount || obj.review_count || 12,
    min_price: obj.minPrice || obj.min_price || 100,
    max_price: obj.maxPrice || obj.max_price || 500,
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

// Alias: /food_restaurants → /customer/food-restaurants (used by dashboard link)
app.get('/food_restaurants', (req, res) => res.redirect('/customer/food-restaurants'));

app.get('/customer/food-restaurants', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Food & Restaurant' })).map(toFlaskVendor);
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/food&rest.html', { 
    vendors, 
    customer, 
    customer_lat: customer ? customer.latitude : null, 
    customer_lon: customer ? customer.longitude : null 
  });
});

app.get('/customer/garage', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Garage' })).map(toFlaskVendor);
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/garage.html', { 
    vendors, 
    customer, 
    customer_lat: customer ? customer.latitude : null, 
    customer_lon: customer ? customer.longitude : null 
  });
});

app.get('/customer/electronics', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Electronics' })).map(toFlaskVendor);
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/electronics.html', { 
    vendors, 
    customer, 
    customer_lat: customer ? customer.latitude : null, 
    customer_lon: customer ? customer.longitude : null 
  });
});

app.get('/customer/fashion', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Fashion' })).map(toFlaskVendor);
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/fashion.html', { 
    vendors, 
    customer, 
    customer_lat: customer ? customer.latitude : null, 
    customer_lon: customer ? customer.longitude : null 
  });
});

app.get('/customer/grocery', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Grocery' })).map(toFlaskVendor);
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/grocery.html', { 
    vendors, 
    customer, 
    customer_lat: customer ? customer.latitude : null, 
    customer_lon: customer ? customer.longitude : null 
  });
});

app.get('/customer/pharmacy', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Pharmacy' })).map(toFlaskVendor);
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/pharmacy.html', { 
    vendors, 
    customer, 
    customer_lat: customer ? customer.latitude : null, 
    customer_lon: customer ? customer.longitude : null 
  });
});

app.get('/customer/books', async (req, res) => {
  if (!req.session.user) return res.redirect('/signin');
  const vendors = (await Vendor.find({ businessCategory: 'Books' })).map(toFlaskVendor);
  const customer = toFlaskCustomer(await Customer.findById(req.session.user_id));
  res.render('customer/books.html', { 
    vendors, 
    customer, 
    customer_lat: customer ? customer.latitude : null, 
    customer_lon: customer ? customer.longitude : null 
  });
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
  res.render('vendor/menu.html', { vendor_profile: vendor, menu_items, items: menu_items, labels });
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

// Update Vendor Shop Image (supports file upload or Base64 or Emoji)
app.post('/vendor/update_shop_image', upload.single('shop_image'), async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const vendor = await Vendor.findById(req.session.user_id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    let finalImageUrl = null;

    if (req.file && req.file.path) {
      // Direct Multer-Cloudinary file upload
      finalImageUrl = req.file.path;
    } else if (req.body.shop_image) {
      const imgData = req.body.shop_image;
      if (imgData.startsWith('data:image/')) {
        // Base64 data URL upload to Cloudinary
        finalImageUrl = await uploadToCloudinary(imgData, 'localconnect_shops');
      } else {
        // Emoji or existing URL
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
});

// ==================== MENU / INVENTORY ITEMS API ====================
// Add Item (supports both JSON Base64 and Multer file upload)
const handleAddItem = async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { name, sub_name, category, price } = req.body;
    let image_file = 'default.jpg';

    if (req.file && req.file.path) {
      image_file = req.file.path;
    } else if (req.body.image_file && req.body.image_file !== 'default.jpg') {
      if (req.body.image_file.startsWith('data:image/')) {
        image_file = await uploadToCloudinary(req.body.image_file, 'localconnect_menu');
      } else {
        image_file = req.body.image_file;
      }
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      image_file = await uploadToCloudinary(req.body.image, 'localconnect_menu');
    }

    const menuItem = new MenuItem({
      vendor: req.session.user_id,
      name,
      subName: sub_name,
      category,
      price: parseFloat(price),
      isAvailable: true,
      imageFile: image_file,
    });

    await menuItem.save();
    res.json({ success: true, item: toFlaskMenuItem(menuItem), image_file: menuItem.imageFile });
  } catch (err) {
    console.error('Error adding menu item:', err);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

app.post('/vendor/menu/add', upload.single('image'), handleAddItem);
app.post('/add_item', upload.single('image'), handleAddItem);

// Edit Item
const handleEditItem = async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const itemId = req.params.id;
    const item = await MenuItem.findOne({ _id: itemId, vendor: req.session.user_id });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { name, sub_name, category, price } = req.body;
    if (name) item.name = name;
    if (sub_name !== undefined) item.subName = sub_name;
    if (category) item.category = category;
    if (price !== undefined) item.price = parseFloat(price);

    if (req.file && req.file.path) {
      item.imageFile = req.file.path;
    } else if (req.body.image_file && req.body.image_file !== 'default.jpg') {
      if (req.body.image_file.startsWith('data:image/')) {
        item.imageFile = await uploadToCloudinary(req.body.image_file, 'localconnect_menu');
      } else {
        item.imageFile = req.body.image_file;
      }
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      item.imageFile = await uploadToCloudinary(req.body.image, 'localconnect_menu');
    }

    await item.save();
    res.json({ success: true, item: toFlaskMenuItem(item), image_file: item.imageFile });
  } catch (err) {
    console.error('Error editing menu item:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

app.put('/vendor/menu/:id', upload.single('image'), handleEditItem);
app.post('/edit_item/:id', upload.single('image'), handleEditItem);

// Delete Item
const handleDeleteItem = async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const itemId = req.params.id;
    await MenuItem.findOneAndDelete({ _id: itemId, vendor: req.session.user_id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

app.delete('/vendor/menu/:id', handleDeleteItem);
app.post('/vendor/menu/delete/:id', handleDeleteItem);

// Toggle Availability
app.post('/toggle_item/:id', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, vendor: req.session.user_id });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, is_available: item.isAvailable });
  } catch (err) {
    console.error('Error toggling item availability:', err);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
});

// ==================== OFFERS API ====================
// List Offers
app.get('/vendor/offers/list', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const offers = await Offer.find({ vendor: req.session.user_id }).sort({ createdAt: -1 });
    const formatted = offers.map(o => ({
      id: o._id,
      title: o.title,
      description: o.description,
      discount_type: o.discountType,
      discount_value: o.discountValue,
      min_order: o.minOrder,
      valid_from: o.validFrom ? o.validFrom.toISOString().split('T')[0] : '',
      valid_to: o.validTo ? o.validTo.toISOString().split('T')[0] : '',
      active: o.active,
      image: o.image || '',
    }));
    res.json({ success: true, offers: formatted });
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Get Single Offer
app.get('/vendor/offers/get/:id', async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const o = await Offer.findOne({ _id: req.params.id, vendor: req.session.user_id });
    if (!o) return res.status(404).json({ error: 'Offer not found' });
    res.json({
      id: o._id,
      title: o.title,
      description: o.description,
      discount_type: o.discountType,
      discount_value: o.discountValue,
      min_order: o.minOrder,
      valid_from: o.validFrom ? o.validFrom.toISOString().split('T')[0] : '',
      valid_to: o.validTo ? o.validTo.toISOString().split('T')[0] : '',
      active: o.active,
      image: o.image || '',
    });
  } catch (err) {
    console.error('Error getting offer:', err);
    res.status(500).json({ error: 'Failed to get offer' });
  }
});

// Add Offer
app.post('/vendor/offers/add', upload.single('image'), async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { title, description, discount_type, discount_value, min_order, valid_from, valid_to } = req.body;
    let imageUrl = null;

    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    } else if (req.body.image) {
      if (req.body.image.startsWith('data:image/')) {
        imageUrl = await uploadToCloudinary(req.body.image, 'localconnect_offers');
      } else {
        imageUrl = req.body.image;
      }
    }

    const offer = new Offer({
      vendor: req.session.user_id,
      title,
      description,
      discountType: discount_type || 'percentage',
      discountValue: parseFloat(discount_value) || 0,
      minOrder: parseFloat(min_order) || 0,
      validFrom: valid_from ? new Date(valid_from) : new Date(),
      validTo: valid_to ? new Date(valid_to) : new Date(),
      active: true,
      image: imageUrl,
    });

    await offer.save();
    res.json({ success: true, offer });
  } catch (err) {
    console.error('Error adding offer:', err);
    res.status(500).json({ error: 'Failed to add offer' });
  }
});

// Edit Offer
app.post('/vendor/offers/edit/:id', upload.single('image'), async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    const offer = await Offer.findOne({ _id: req.params.id, vendor: req.session.user_id });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    const { title, description, discount_type, discount_value, min_order, valid_from, valid_to, active } = req.body;
    if (title) offer.title = title;
    if (description !== undefined) offer.description = description;
    if (discount_type) offer.discountType = discount_type;
    if (discount_value !== undefined) offer.discountValue = parseFloat(discount_value);
    if (min_order !== undefined) offer.minOrder = parseFloat(min_order);
    if (valid_from) offer.validFrom = new Date(valid_from);
    if (valid_to) offer.validTo = new Date(valid_to);
    if (active !== undefined) offer.active = active;

    if (req.file && req.file.path) {
      offer.image = req.file.path;
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      offer.image = await uploadToCloudinary(req.body.image, 'localconnect_offers');
    }

    await offer.save();
    res.json({ success: true, offer });
  } catch (err) {
    console.error('Error editing offer:', err);
    res.status(500).json({ error: 'Failed to edit offer' });
  }
});

// Delete Offer
const handleDeleteOffer = async (req, res) => {
  if (!req.session.user || req.session.user_role !== 'vendor') return res.status(401).json({ error: 'Unauthorized' });
  try {
    await Offer.findOneAndDelete({ _id: req.params.id, vendor: req.session.user_id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting offer:', err);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
};

app.delete('/vendor/offers/:id', handleDeleteOffer);
app.post('/vendor/offers/delete/:id', handleDeleteOffer);

// API mounts
app.use('/api', require('./routes/api'));

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found | LocalConnect</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f5f6f7;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #2c3e50;
    }
    .container {
      text-align: center;
      max-width: 520px;
      width: 100%;
      background: white;
      border-radius: 24px;
      padding: 56px 40px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.08);
      border: 1px solid #eef0f2;
    }
    .icon-wrap {
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, #e8f8f0, #d4f1e3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px;
    }
    .icon-wrap svg { color: #27ae60; }
    .code {
      font-size: 5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #27ae60, #2ecc71);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 12px;
      color: #1a252f;
    }
    p {
      color: #7f8c8d;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 36px;
    }
    .btn-group { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-primary {
      background: #27ae60;
      color: white;
      box-shadow: 0 4px 15px rgba(39,174,96,0.3);
    }
    .btn-primary:hover {
      background: #219150;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(39,174,96,0.4);
    }
    .btn-outline {
      background: transparent;
      color: #27ae60;
      border: 2px solid #27ae60;
    }
    .btn-outline:hover {
      background: #e8f8f0;
      transform: translateY(-2px);
    }
    .path-hint {
      margin-top: 32px;
      padding: 10px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 0.82rem;
      color: #95a5a6;
      font-family: monospace;
      word-break: break-all;
    }
    @media (max-width: 480px) {
      .container { padding: 40px 24px; border-radius: 18px; }
      .code { font-size: 4rem; }
      h1 { font-size: 1.25rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon-wrap">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="12"/>
        <line x1="11" y1="16" x2="11.01" y2="16"/>
      </svg>
    </div>
    <div class="code">404</div>
    <h1>Page Not Found</h1>
    <p>Oops! The page you're looking for doesn't exist or may have been moved. Let's get you back on track.</p>
    <div class="btn-group">
      <a href="/" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Go Home
      </a>
      <a href="javascript:history.back()" class="btn btn-outline">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Go Back
      </a>
    </div>
    <div class="path-hint">Tried: ${req.path}</div>
  </div>
</body>
</html>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Template/Server error:', err.message);
  res.status(500).send(`<h2>Server Error</h2><pre>${err.message}</pre><a href="/">Go Home</a>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 LocalConnect Server running on http://localhost:${PORT}`));
