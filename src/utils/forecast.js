
const request = require('postman-request');
const API_KEY = '2f234fa878ac89f9a5d71ff91e40e142';
const BASE_URL = 'http://api.openweathermap.org/data/2.5/weather';

function kelvinToCelsius(kelvin) {
    return kelvin - 273.15;
}

const fetchWeatherData = (city, callback) => {
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}`;

    request({ url: url, json: true }, (error, response) => {
        if (error) {
            return callback(`Error fetching data for ${city}: ${error}`, null);
        } else if (response.body.cod !== 200) {
            return callback(`Unable to find location for ${city}: ${response.body.message}`, null);
        } else {
            const data = response.body;
            if (!data.weather || data.weather.length === 0) {
                return callback(`No weather data found for ${city}`, null);
            } else {
                return callback(null, {
                    city: city,
                    main: data.weather[0].main,
                    temp: parseFloat(kelvinToCelsius(data.main.temp).toFixed(2)),
                    feels_like: parseFloat(kelvinToCelsius(data.main.feels_like).toFixed(2)),
                    humidity: data.main.humidity, 
                    wind_speed: data.wind.speed, 
                    dt: data.dt
                });
            }
        }
    });
};

module.exports = { fetchWeatherData, kelvinToCelsius };
