// controllers/authController.js – Authentication Controller for Session Auth
const passport = require('passport');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

// Sign In Page
exports.getSignin = (req, res) => {
  res.render('sign_in');
};

// Sign In Process
exports.postSignin = (req, res, next) => {
  const { username, password, role } = req.body;
  const strategy = role === 'vendor' ? 'local-vendor' : 'local-customer';

  passport.authenticate(strategy, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info && info.message ? info.message : 'Invalid username or password.');
      return res.redirect('/signin');
    }

    // Regenerate session ID upon login for session fixation protection
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.logIn(user, (err) => {
        if (err) return next(err);

        const userRole = role === 'vendor' ? 'vendor' : 'customer';
        req.session.user = user;
        req.session.user_role = userRole;
        req.session.user_id = user._id ? user._id.toString() : user.id;

        req.flash('success', 'Logged in successfully!');
        const redirectUrl = userRole === 'vendor' ? '/vendor/dashboard' : '/customer/dashboard';
        return res.redirect(redirectUrl);
      });
    });
  })(req, res, next);
};

// Customer Sign Up Page
exports.getCustomerSignup = (req, res) => {
  res.render('customer/sign_up');
};

// Customer Sign Up Process
exports.postCustomerSignup = async (req, res, next) => {
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
      phone,
    });
    await customer.setPassword(password);
    await customer.save();

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.logIn(customer, (err) => {
        if (err) return next(err);
        req.session.user = customer;
        req.session.user_role = 'customer';
        req.session.user_id = customer._id.toString();
        req.flash('success', 'Customer account created successfully!');
        return res.redirect('/customer/dashboard');
      });
    });
  } catch (err) {
    console.error('Customer signup error:', err);
    req.flash('error', 'Failed to create account.');
    return res.redirect('/customer/signup');
  }
};

// Vendor Sign Up Page
exports.getVendorSignup = (req, res) => {
  res.render('vendor/sign_up');
};

// Vendor Sign Up Process
exports.postVendorSignup = async (req, res, next) => {
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
      phone,
    });
    await vendor.setPassword(password);
    await vendor.save();

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.logIn(vendor, (err) => {
        if (err) return next(err);
        req.session.user = vendor;
        req.session.user_role = 'vendor';
        req.session.user_id = vendor._id.toString();
        req.flash('success', 'Vendor account registered successfully!');
        return res.redirect('/vendor/dashboard');
      });
    });
  } catch (err) {
    console.error('Vendor signup error:', err);
    req.flash('error', 'Failed to register vendor account.');
    return res.redirect('/vendor/signup');
  }
};

// Logout Process
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) console.error('Logout error:', err);
    req.session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
      res.clearCookie('localconnect.sid');
      res.redirect('/');
    });
  });
};
