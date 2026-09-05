// routes/customerRoutes.js – Customer portal router
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { ensureCustomer, ensureAuthenticated } = require('../middleware/auth');

router.get('/dashboard', ensureCustomer, customerController.getDashboard);
router.get('/food-restaurants', ensureCustomer, customerController.getCategoryPage('Food & Restaurant', 'food&rest.html'));
router.get('/garage', ensureCustomer, customerController.getCategoryPage('Garage', 'garage.html'));
router.get('/electronics', ensureCustomer, customerController.getCategoryPage('Electronics', 'electronics.html'));
router.get('/fashion', ensureCustomer, customerController.getCategoryPage('Fashion', 'fashion.html'));
router.get('/grocery', ensureCustomer, customerController.getCategoryPage('Grocery', 'grocery.html'));
router.get('/pharmacy', ensureCustomer, customerController.getCategoryPage('Pharmacy', 'pharmacy.html'));
router.get('/books', ensureCustomer, customerController.getCategoryPage('Books', 'books.html'));
router.get('/orders', ensureCustomer, customerController.getOrders);
router.get('/profile', ensureCustomer, customerController.getProfile);
router.get('/vendor/:id', ensureAuthenticated, customerController.getVendorDetails);
router.get('/change-password', ensureCustomer, customerController.getChangePassword);
router.get('/notification-settings', ensureCustomer, customerController.getNotificationSettings);

module.exports = router;
