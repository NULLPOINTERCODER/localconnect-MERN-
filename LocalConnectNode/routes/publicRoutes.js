// routes/publicRoutes.js – Public static pages router
const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getLandingPage);
router.get('/about', publicController.getAboutPage);
router.get('/contact', publicController.getContactPage);
router.get('/signup/success', publicController.getSignupSuccess);
router.get('/forgot-password', publicController.getForgotPassword);
router.get('/reset-password/:token', publicController.getResetPassword);

module.exports = router;
