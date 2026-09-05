// routes/vendorRoutes.js – Vendor portal & management router
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudConfig');
const upload = multer({ storage });

const vendorController = require('../controllers/vendorController');
const menuController = require('../controllers/menuController');
const offerController = require('../controllers/offerController');
const { ensureVendor } = require('../middleware/auth');

// Dashboard & Pages
router.get('/dashboard', ensureVendor, vendorController.getDashboard);
router.get('/menu', ensureVendor, vendorController.getMenu);
router.get('/orders', ensureVendor, vendorController.getOrders);
router.get('/earnings', ensureVendor, vendorController.getEarnings);
router.get('/reviews', ensureVendor, vendorController.getReviews);
router.get('/settings', ensureVendor, vendorController.getSettings);
router.get('/delivery-map', ensureVendor, vendorController.getDeliveryMap);
router.get('/notification-dashboard', ensureVendor, vendorController.getNotificationDashboard);
router.get('/notification-settings', ensureVendor, vendorController.getNotificationSettings);
router.get('/change-password', ensureVendor, vendorController.getChangePassword);

// Vendor Shop Management APIs
router.post('/orders/:orderId/status', ensureVendor, vendorController.updateOrderStatus);
router.post('/update_shop_image', ensureVendor, upload.single('shop_image'), vendorController.updateShopImage);

// Inventory / Menu Item Management APIs
router.post('/menu/add', ensureVendor, upload.single('image'), menuController.addItem);
router.put('/menu/:id', ensureVendor, upload.single('image'), menuController.editItem);
router.delete('/menu/:id', ensureVendor, menuController.deleteItem);
router.post('/menu/delete/:id', ensureVendor, menuController.deleteItem);

// Offers Management APIs
router.get('/offers/list', ensureVendor, offerController.listOffers);
router.get('/offers/get/:id', ensureVendor, offerController.getOffer);
router.post('/offers/add', ensureVendor, upload.single('image'), offerController.addOffer);
router.post('/offers/edit/:id', ensureVendor, upload.single('image'), offerController.editOffer);
router.delete('/offers/:id', ensureVendor, offerController.deleteOffer);
router.post('/offers/delete/:id', ensureVendor, offerController.deleteOffer);

module.exports = router;
