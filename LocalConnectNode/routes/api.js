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

const MenuItem = require('../models/MenuItem');

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

// Get vendor menu items for customer view
router.get('/vendor/:id/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ vendor: req.params.id });
    const formatted = items.map(m => ({
      id: m._id ? m._id.toString() : m.id,
      name: m.name,
      sub_name: m.subName || '',
      category: m.category || '',
      price: m.price,
      is_available: m.isAvailable !== undefined ? m.isAvailable : true,
      image_file: m.imageFile || 'default.jpg',
      created_at: m.createdAt,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching vendor menu:', err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

// Search vendors & matching dishes
router.get('/search/vendors', async (req, res) => {
  const query = req.query.q ? req.query.q.trim() : '';
  if (!query) return res.json([]);
  try {
    const regex = new RegExp(query, 'i');
    const matchingItems = await MenuItem.find({
      $or: [{ name: regex }, { subName: regex }, { category: regex }]
    });
    const vendorIdsFromItems = matchingItems.map(i => i.vendor);

    const vendors = await Vendor.find({
      $or: [
        { _id: { $in: vendorIdsFromItems } },
        { businessName: regex },
        { businessCategory: regex },
        { businessSubCategory: regex },
        { about: regex }
      ]
    });

    const results = vendors.map(v => {
      const vId = v._id.toString();
      const matchingDishes = matchingItems
        .filter(item => item.vendor.toString() === vId)
        .map(item => item.name);

      return {
        id: vId,
        name: v.businessName,
        category: v.businessCategory,
        subcategory: v.businessSubCategory,
        shop_image: v.shopImage || '🏪',
        rating: v.rating || 4.5,
        review_count: v.reviewCount || 0,
        min_price: v.minPrice || 100,
        max_price: v.maxPrice || 500,
        is_open: v.isOpen !== undefined ? v.isOpen : true,
        latitude: v.latitude,
        longitude: v.longitude,
        matching_dishes: matchingDishes
      };
    });

    res.json(results);
  } catch (err) {
    console.error('Error searching vendors:', err);
    res.status(500).json({ error: 'Search failed' });
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
