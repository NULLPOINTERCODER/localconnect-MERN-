// config/passport.js – Passport strategy configuration for multi-role session auth
const LocalStrategy = require('passport-local').Strategy;
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

module.exports = function (passport) {
  // Local Customer Strategy
  passport.use(
    'local-customer',
    new LocalStrategy(
      { usernameField: 'username', passwordField: 'password' },
      async (username, password, done) => {
        try {
          const customer = await Customer.findOne({
            $or: [{ email: username }, { phone: username }],
          });

          if (!customer) {
            return done(null, false, { message: 'Invalid email/phone or password.' });
          }

          const isMatch = await customer.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid email/phone or password.' });
          }

          return done(null, customer);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Local Vendor Strategy
  passport.use(
    'local-vendor',
    new LocalStrategy(
      { usernameField: 'username', passwordField: 'password' },
      async (username, password, done) => {
        try {
          const vendor = await Vendor.findOne({ email: username });

          if (!vendor) {
            return done(null, false, { message: 'Invalid vendor email or password.' });
          }

          const isMatch = await vendor.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid vendor email or password.' });
          }

          return done(null, vendor);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Session Serialization
  passport.serializeUser((user, done) => {
    let role = user.role;
    if (!role) {
      if (user.businessName) role = 'vendor';
      else role = 'customer';
    }
    done(null, { id: user._id ? user._id.toString() : user.id, role });
  });

  // Session Deserialization
  passport.deserializeUser(async (key, done) => {
    try {
      if (key.role === 'vendor') {
        const vendor = await Vendor.findById(key.id);
        return done(null, vendor);
      } else if (key.role === 'customer') {
        const customer = await Customer.findById(key.id);
        return done(null, customer);
      } else {
        const user = await User.findById(key.id);
        return done(null, user);
      }
    } catch (err) {
      return done(err, null);
    }
  });
};
