// middleware/auth.js – Authentication & Role Authorization Middleware for Session Auth

function isAuthenticated(req) {
  return (req.isAuthenticated && req.isAuthenticated()) || (req.session && !!req.session.user);
}

function getUserRole(req) {
  if (req.session && req.session.user_role) {
    return req.session.user_role;
  }
  if (req.user) {
    if (req.user.role) return req.user.role;
    if (req.user.businessName) return 'vendor';
    return 'customer';
  }
  return null;
}

module.exports = {
  // Ensure user is authenticated (Customer, Vendor, or Admin)
  ensureAuthenticated: (req, res, next) => {
    if (isAuthenticated(req)) {
      return next();
    }
    req.flash('error', 'Please sign in to access this page.');
    res.redirect('/signin');
  },

  // Ensure logged in user is a Customer
  ensureCustomer: (req, res, next) => {
    if (isAuthenticated(req)) {
      const role = getUserRole(req);
      if (role === 'customer') return next();
      req.flash('error', 'Access restricted to customer accounts.');
      return res.redirect('/signin');
    }
    req.flash('error', 'Please sign in as a customer.');
    res.redirect('/signin');
  },

  // Ensure logged in user is a Vendor
  ensureVendor: (req, res, next) => {
    if (isAuthenticated(req)) {
      const role = getUserRole(req);
      if (role === 'vendor') return next();
      req.flash('error', 'Access restricted to vendor accounts.');
      return res.redirect('/signin');
    }
    req.flash('error', 'Please sign in as a vendor.');
    res.redirect('/signin');
  },

  // Ensure logged in user is an Admin
  ensureAdmin: (req, res, next) => {
    if (isAuthenticated(req)) {
      const role = getUserRole(req);
      if (role === 'admin') return next();
      return res.status(403).send('Forbidden – admin only');
    }
    req.flash('error', 'Please sign in as administrator.');
    res.redirect('/signin');
  },

  // Redirect authenticated users away from auth pages (login/signup)
  forwardAuthenticated: (req, res, next) => {
    if (!isAuthenticated(req)) {
      return next();
    }
    const role = getUserRole(req);
    if (role === 'vendor') {
      return res.redirect('/vendor/dashboard');
    }
    return res.redirect('/customer/dashboard');
  }
};
