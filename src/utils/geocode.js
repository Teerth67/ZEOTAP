const request = require('postman-request');

const geocode = (address, callback) => {
    const url = `http://api.positionstack.com/v1/forward?access_key=fadc7905228d6cc6bc175dceda07f4c9&query=${encodeURIComponent(address)}`;

    request({ url: url, json: true }, (error, response) => {
        if (error) {
            callback('Unable to connect to the geocoding service.', undefined);
        } else if (response.body.error || (response.body.data && response.body.data.length === 0)) {
            callback('Unable to find location. Try another search.', undefined);
        } else {
            const results = response.body.data[0];
            callback(undefined, {
                city: results.label,
                latitude: results.latitude,
                longitude: results.longitude
            });
        }
    });
};

module.exports = geocode;
