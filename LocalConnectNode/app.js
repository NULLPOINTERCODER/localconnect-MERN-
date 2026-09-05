// app.js – Main Express server entry point (MVC Architecture with EJS View Engine)
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const passport = require('passport');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const multer = require('multer');
const expressLayouts = require('express-ejs-layouts');
const { storage } = require('./cloudConfig');
const upload = multer({ storage });

// Import Middleware
const { ensureAuthenticated, ensureVendor } = require('./middleware/auth');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/localconnect';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const app = express();
app.set('trust proxy', 1);

// Configure EJS view engine & layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', false); // Disable default global layout wrapper to allow view-level inheritance

// Static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// Body parsers
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// Persistent Mongo Session Store
const sessionStore = MongoStore.create({
  mongoUrl: mongoURI,
  collectionName: 'sessions',
  ttl: 24 * 60 * 60, // 1 day TTL
});

app.use(session({
  name: 'localconnect.sid',
  secret: process.env.SESSION_SECRET || 'supersecretkeylocalconnect',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));

// Initialize Passport Authentication
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Pass globals & session state to all view templates
app.use((req, res, next) => {
  const u = req.user || (req.session ? req.session.user : null);
  const userRole = (req.session && req.session.user_role)
    || (req.user ? (req.user.role || (req.user.businessName ? 'vendor' : 'customer')) : null);
  const userId = (req.session && req.session.user_id)
    || (req.user ? (req.user._id ? req.user._id.toString() : req.user.id) : null);

  const userName = u
    ? (u.fullName || u.businessName || u.full_name || u.business_name || u.email || '')
    : null;

  res.locals.request = { path: req.path };
  res.locals.session = req.session;
  res.locals.user = u;
  res.locals.user_name = userName;
  res.locals.user_role = userRole;
  res.locals.user_id = userId;
  res.locals.unread_count = 0;
  res.locals.todays_orders = 0;
  res.locals.todays_earnings = 0;
  res.locals.avg_rating = '5.0';
  res.locals.pending_orders = 0;
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

// Import Controllers for legacy aliases
const customerController = require('./controllers/customerController');
const vendorController = require('./controllers/vendorController');
const menuController = require('./controllers/menuController');

// Mount Routers (MVC Structure)
app.use('/', require('./routes/publicRoutes'));
app.use('/', require('./routes/authRoutes'));
app.use('/customer', require('./routes/customerRoutes'));
app.use('/vendor', require('./routes/vendorRoutes'));
app.use('/api', require('./routes/api'));

// Legacy compatibility aliases
app.get('/food_restaurants', (req, res) => res.redirect('/customer/food-restaurants'));
app.get('/invoice/:orderId', ensureAuthenticated, customerController.getInvoice);
app.post('/toggle_shop_status', ensureVendor, vendorController.toggleShopStatus);
app.post('/add_item', ensureVendor, upload.single('image'), menuController.addItem);
app.post('/edit_item/:id', ensureVendor, upload.single('image'), menuController.editItem);
app.post('/toggle_item/:id', ensureVendor, menuController.toggleItem);

// 404 Not Found Handler
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

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).send(`<h2>Server Error</h2><pre>${err.message}</pre><a href="/">Go Home</a>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 LocalConnect Server running on http://localhost:${PORT}`));
