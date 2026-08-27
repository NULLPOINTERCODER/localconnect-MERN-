// cloudConfig.js – Cloudinary and Multer‑Storage‑Cloudinary setup
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'localconnect_dev',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

/**
 * Uploads an image (either Base64 string or file buffer/path) to Cloudinary
 * @param {string} fileOrBase64 - Base64 Data URI or image URL
 * @returns {Promise<string>} Secure URL of uploaded image
 */
async function uploadToCloudinary(fileOrBase64, folder = 'localconnect_dev') {
  if (!fileOrBase64) return null;
  // If it's already a full http/https URL, return it
  if (typeof fileOrBase64 === 'string' && (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://'))) {
    return fileOrBase64;
  }
  const result = await cloudinary.uploader.upload(fileOrBase64, {
    folder,
  });
  return result.secure_url;
}

module.exports = { cloudinary, storage, uploadToCloudinary };

