// controllers/offerController.js – Vendor Offer Management Controllers
const Offer = require('../models/Offer');
const { uploadToCloudinary } = require('../cloudConfig');

exports.listOffers = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const offers = await Offer.find({ vendor: vendorId }).sort({ createdAt: -1 });
    const formatted = offers.map(o => ({
      id: o._id,
      title: o.title,
      description: o.description,
      discount_type: o.discountType,
      discount_value: o.discountValue,
      min_order: o.minOrder,
      valid_from: o.validFrom ? o.validFrom.toISOString().split('T')[0] : '',
      valid_to: o.validTo ? o.validTo.toISOString().split('T')[0] : '',
      active: o.active,
      image: o.image || '',
    }));
    res.json({ success: true, offers: formatted });
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
};

exports.getOffer = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const o = await Offer.findOne({ _id: req.params.id, vendor: vendorId });
    if (!o) return res.status(404).json({ error: 'Offer not found' });
    res.json({
      id: o._id,
      title: o.title,
      description: o.description,
      discount_type: o.discountType,
      discount_value: o.discountValue,
      min_order: o.minOrder,
      valid_from: o.validFrom ? o.validFrom.toISOString().split('T')[0] : '',
      valid_to: o.validTo ? o.validTo.toISOString().split('T')[0] : '',
      active: o.active,
      image: o.image || '',
    });
  } catch (err) {
    console.error('Error getting offer:', err);
    res.status(500).json({ error: 'Failed to get offer' });
  }
};

exports.addOffer = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const { title, description, discount_type, discount_value, min_order, valid_from, valid_to } = req.body;
    let imageUrl = null;

    if (req.file && req.file.path) {
      imageUrl = req.file.path;
    } else if (req.body.image) {
      if (req.body.image.startsWith('data:image/')) {
        imageUrl = await uploadToCloudinary(req.body.image, 'localconnect_offers');
      } else {
        imageUrl = req.body.image;
      }
    }

    const offer = new Offer({
      vendor: vendorId,
      title,
      description,
      discountType: discount_type || 'percentage',
      discountValue: parseFloat(discount_value) || 0,
      minOrder: parseFloat(min_order) || 0,
      validFrom: valid_from ? new Date(valid_from) : new Date(),
      validTo: valid_to ? new Date(valid_to) : new Date(),
      active: true,
      image: imageUrl,
    });

    await offer.save();
    res.json({ success: true, offer });
  } catch (err) {
    console.error('Error adding offer:', err);
    res.status(500).json({ error: 'Failed to add offer' });
  }
};

exports.editOffer = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const offer = await Offer.findOne({ _id: req.params.id, vendor: vendorId });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    const { title, description, discount_type, discount_value, min_order, valid_from, valid_to, active } = req.body;
    if (title) offer.title = title;
    if (description !== undefined) offer.description = description;
    if (discount_type) offer.discountType = discount_type;
    if (discount_value !== undefined) offer.discountValue = parseFloat(discount_value);
    if (min_order !== undefined) offer.minOrder = parseFloat(min_order);
    if (valid_from) offer.validFrom = new Date(valid_from);
    if (valid_to) offer.validTo = new Date(valid_to);
    if (active !== undefined) offer.active = active;

    if (req.file && req.file.path) {
      offer.image = req.file.path;
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      offer.image = await uploadToCloudinary(req.body.image, 'localconnect_offers');
    }

    await offer.save();
    res.json({ success: true, offer });
  } catch (err) {
    console.error('Error editing offer:', err);
    res.status(500).json({ error: 'Failed to edit offer' });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    await Offer.findOneAndDelete({ _id: req.params.id, vendor: vendorId });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting offer:', err);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
};
