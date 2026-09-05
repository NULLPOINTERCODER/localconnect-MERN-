// routes/api.js – API & Search Endpoints Router
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

// SSE notification stream
router.get('/notifications', apiController.getNotifications);

// JSON Vendor Listing & Search
router.get('/vendors/json', apiController.getVendorsJson);
router.get('/vendor/:id/menu', apiController.getVendorMenuJson);
router.get('/search/vendors', apiController.searchVendors);
router.get('/geocode', apiController.geocode);

module.exports = router;
