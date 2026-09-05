// controllers/apiController.js – Public & Search API Controllers
const Vendor = require('../models/Vendor');
const MenuItem = require('../models/MenuItem');
const { addClient } = require('../utils/notification');
const { geocodeAddress } = require('../utils/geocode');

exports.getNotifications = (req, res) => {
  const isAuth = (req.isAuthenticated && req.isAuthenticated()) || (req.session && req.session.user);
  if (!isAuth) {
    return res.status(401).send('Unauthorized');
  }
  addClient(req, res);
};

exports.getVendorsJson = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (err) {
    console.error('Error fetching vendors JSON:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getVendorMenuJson = async (req, res) => {
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
};

exports.searchVendors = async (req, res) => {
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
};

exports.geocode = async (req, res) => {
  const { address } = req.query;
  if (!address) return res.status(400).json({ error: 'address query required' });
  try {
    const coords = await geocodeAddress(address);
    res.json(coords);
  } catch (err) {
    console.error('Geocoding error:', err);
    res.status(500).json({ error: 'Geocoding failed' });
  }
};
