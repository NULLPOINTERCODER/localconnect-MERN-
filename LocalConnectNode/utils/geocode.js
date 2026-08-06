// utils/geocode.js – Simple wrapper around Google Maps Geocoding API
const axios = require('axios');

async function geocodeAddress(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const encoded = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    if (response.data.status !== 'OK') {
      throw new Error('Geocoding failed: ' + response.data.status);
    }
    const location = response.data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  } catch (err) {
    console.error('Geocode error:', err.message);
    throw err;
  }
}

module.exports = { geocodeAddress };
