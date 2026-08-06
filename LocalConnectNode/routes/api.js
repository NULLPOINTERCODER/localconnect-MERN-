// routes/api.js – API endpoints and Server‑Sent Events
const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const { addClient, broadcast } = require('../utils/notification');
const { geocodeAddress } = require('../utils/geocode');
const { ensureAuthenticated } = require('../middleware/auth');

// SSE endpoint for notifications
router.get('/notifications', (req, res) => {
  // Only authenticated users receive events (optional)
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized');
  }
  addClient(req, res);
});

// JSON list of all vendors (useful for client‑side geolocation search)
router.get('/vendors/json', async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple geocode wrapper – expects query param ?address=...
router.get('/geocode', async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address query required' });
  try {
    const coords = await geocodeAddress(address);
    res.json(coords);
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

module.exports = router;
