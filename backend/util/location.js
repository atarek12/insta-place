const axios = require('axios');

require('dotenv/config');
const HttpError = require('../models/http-error');

const API_KEY = process.env.GOOGLE_API_KEY;

async function getCoordsForAddress(address) {

  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );
  // encodeURIComponent --> to remove non characters and white spaces

  // extract our data
  const data = response.data;

  // if address not valid
  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
      'Could not find location for the specified address.',
      422
    );
    throw error;
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAddress;
