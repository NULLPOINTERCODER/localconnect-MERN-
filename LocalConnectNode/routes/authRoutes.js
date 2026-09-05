// routes/authRoutes.js – Authentication router
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuthenticated } = require('../middleware/auth');

router.get('/signin', forwardAuthenticated, authController.getSignin);
router.post('/signin', authController.postSignin);

router.get('/customer/signup', forwardAuthenticated, authController.getCustomerSignup);
router.post('/customer/signup', authController.postCustomerSignup);

router.get('/vendor/signup', forwardAuthenticated, authController.getVendorSignup);
router.post('/vendor/signup', authController.postVendorSignup);

router.get('/logout', authController.logout);

module.exports = router;
