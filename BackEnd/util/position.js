const axios = require('axios');

const HttpError = require('../models/http-error');

const API_KEY = 'AIzaSyAI9kPkskayYti5ttrZL_UfBlL3OkMEbvs';
const API_KEY2 = 'AIzaSyA85ZTziuooIzJTPja4rLZwpy0bvWnUit8';


async function getCoordsForAddress(address) {

    const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
        )}&key=${API_KEY}`
    );

    console.log(response.data);
    const data = response.data;

    if (!data || data.status === 'ZERO_RESULTS') {
        const error = new HttpError(
            'Could not find location for the specified address.',
            422
        );
        throw error;
    }
    try {
        console.log(data.results[0]);
    } catch (err) {
        console.log(err);
    }
    const coordinates = data.results[0].geometry.location;

    return coordinates;
}

module.exports = getCoordsForAddress;
