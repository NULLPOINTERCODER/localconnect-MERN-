// utils/formatters.js – Document transformation & helper utilities

// Convert Mongoose Vendor doc to Flask-style template-compatible plain object
function toFlaskVendor(v) {
  if (!v) return null;
  const obj = v.toObject ? v.toObject() : v;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    name: obj.businessName || obj.name || 'Local Vendor',
    business_name: obj.businessName || obj.name || 'Local Vendor',
    business_category: obj.businessCategory || obj.category || '',
    category: obj.businessCategory || obj.category || '',
    business_sub_category: obj.businessSubCategory || obj.subcategory || '',
    subcategory: obj.businessSubCategory || obj.subcategory || '',
    business_address: obj.businessAddress || obj.address || '',
    phone: obj.phone,
    email: obj.email,
    is_open: obj.isOpen !== undefined ? obj.isOpen : true,
    shop_image: obj.shopImage || obj.image || '',
    latitude: obj.latitude || null,
    longitude: obj.longitude || null,
    about: obj.about,
    rating: obj.rating || 4.5,
    review_count: obj.reviewCount || obj.review_count || 12,
    min_price: obj.minPrice || obj.min_price || 100,
    max_price: obj.maxPrice || obj.max_price || 500,
    category_type: obj.categoryType,
    veg_nonveg: obj.vegNonveg,
    indoor_seating: obj.indoorSeating,
    outdoor_seating: obj.outdoorSeating,
    home_delivery: obj.homeDelivery,
    takeaway: obj.takeaway,
    free_wifi: obj.freeWifi,
    ac: obj.ac,
    cooler: obj.cooler,
    parking: obj.parking,
    other_amenities: obj.otherAmenities,
    opening_time: obj.openingTime,
    closing_time: obj.closingTime,
    created_at: obj.createdAt,
  };
}

// Convert Mongoose Customer doc to Flask-style template-compatible plain object
function toFlaskCustomer(c) {
  if (!c) return null;
  const obj = c.toObject ? c.toObject() : c;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    full_name: obj.fullName,
    email: obj.email,
    phone: obj.phone,
    address: obj.address,
    city: obj.city,
    state: obj.state,
    pincode: obj.pincode,
    latitude: obj.latitude,
    longitude: obj.longitude,
    home_latitude: obj.homeLatitude,
    home_longitude: obj.homeLongitude,
    current_latitude: obj.currentLatitude,
    current_longitude: obj.currentLongitude,
    created_at: obj.createdAt,
  };
}

// Convert Mongoose MenuItem doc to Flask-style object
function toFlaskMenuItem(m) {
  if (!m) return null;
  const obj = m.toObject ? m.toObject() : m;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    vendor_id: obj.vendor,
    name: obj.name,
    sub_name: obj.subName,
    category: obj.category,
    price: obj.price,
    is_available: obj.isAvailable,
    image_file: obj.imageFile,
    created_at: obj.createdAt,
  };
}

// Convert Mongoose Order doc to Flask-style object
function toFlaskOrder(o) {
  if (!o) return null;
  const obj = o.toObject ? o.toObject() : o;
  return {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    customer_id: obj.customer,
    vendor_id: obj.vendor,
    vendor_name: obj.vendorName,
    customer_name: obj.customerName,
    customer_phone: obj.customerPhone,
    items: obj.items,
    items_summary: obj.itemsSummary,
    delivery_type: obj.deliveryType,
    payment_type: obj.paymentType,
    total: obj.total,
    discount_amount: obj.discountAmount,
    offer_title: obj.offerTitle,
    status: obj.status,
    created_at: obj.createdAt,
    review_rating: obj.reviewRating,
    review_comment: obj.reviewComment,
  };
}

// Category labels and icons for vendor dashboard
function getCategoryLabels(category) {
  const labels = {
    'Food & Restaurant': { inventory: 'Menu', icon: 'fa-utensils' },
    'Garage': { inventory: 'Services', icon: 'fa-wrench' },
    'Electronics': { inventory: 'Products', icon: 'fa-laptop' },
    'Fashion': { inventory: 'Products', icon: 'fa-tshirt' },
    'Grocery': { inventory: 'Products', icon: 'fa-shopping-basket' },
    'Pharmacy': { inventory: 'Products', icon: 'fa-pills' },
    'Books': { inventory: 'Books', icon: 'fa-book' },
  };
  return labels[category] || { inventory: 'Menu', icon: 'fa-store' };
}

module.exports = {
  toFlaskVendor,
  toFlaskCustomer,
  toFlaskMenuItem,
  toFlaskOrder,
  getCategoryLabels,
};
