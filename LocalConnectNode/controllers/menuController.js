// controllers/menuController.js – Menu / Inventory Item Controllers
const MenuItem = require('../models/MenuItem');
const { toFlaskMenuItem } = require('../utils/formatters');
const { uploadToCloudinary } = require('../cloudConfig');

exports.addItem = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const { name, sub_name, category, price } = req.body;
    let image_file = 'default.jpg';

    if (req.file && req.file.path) {
      image_file = req.file.path;
    } else if (req.body.image_file && req.body.image_file !== 'default.jpg') {
      if (req.body.image_file.startsWith('data:image/')) {
        image_file = await uploadToCloudinary(req.body.image_file, 'localconnect_menu');
      } else {
        image_file = req.body.image_file;
      }
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      image_file = await uploadToCloudinary(req.body.image, 'localconnect_menu');
    }

    const menuItem = new MenuItem({
      vendor: vendorId,
      name,
      subName: sub_name,
      category,
      price: parseFloat(price),
      isAvailable: true,
      imageFile: image_file,
    });

    await menuItem.save();
    res.json({ success: true, item: toFlaskMenuItem(menuItem), image_file: menuItem.imageFile });
  } catch (err) {
    console.error('Error adding menu item:', err);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

exports.editItem = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const itemId = req.params.id;
    const item = await MenuItem.findOne({ _id: itemId, vendor: vendorId });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { name, sub_name, category, price } = req.body;
    if (name) item.name = name;
    if (sub_name !== undefined) item.subName = sub_name;
    if (category) item.category = category;
    if (price !== undefined) item.price = parseFloat(price);

    if (req.file && req.file.path) {
      item.imageFile = req.file.path;
    } else if (req.body.image_file && req.body.image_file !== 'default.jpg') {
      if (req.body.image_file.startsWith('data:image/')) {
        item.imageFile = await uploadToCloudinary(req.body.image_file, 'localconnect_menu');
      } else {
        item.imageFile = req.body.image_file;
      }
    } else if (req.body.image && req.body.image.startsWith('data:image/')) {
      item.imageFile = await uploadToCloudinary(req.body.image, 'localconnect_menu');
    }

    await item.save();
    res.json({ success: true, item: toFlaskMenuItem(item), image_file: item.imageFile });
  } catch (err) {
    console.error('Error editing menu item:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const itemId = req.params.id;
    await MenuItem.findOneAndDelete({ _id: itemId, vendor: vendorId });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

exports.toggleItem = async (req, res) => {
  try {
    const vendorId = req.session.user_id || (req.user ? req.user._id : null);
    const item = await MenuItem.findOne({ _id: req.params.id, vendor: vendorId });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, is_available: item.isAvailable });
  } catch (err) {
    console.error('Error toggling item availability:', err);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
};
