const path = require('path');
const express = require('express');
const hbs = require('hbs');
const geocode = require('./utils/geocode');
const fetchWeatherData = require('./utils/forecast');
const cron = require('node-cron');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

const publicDirectory = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../template/template/views');
const partialPath = path.join(__dirname, '../template/template/partials');

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialPath);
app.use(express.static(publicDirectory));

// Database setup
const db = new sqlite3.Database('weather.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS weather (
        city TEXT,
        main TEXT,
        temp REAL,
        feels_like REAL,
        humidity INTEGER,
        wind_speed REAL,
        dt INTEGER
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS summary (
        city TEXT,
        avg_temp REAL,
        max_temp REAL,
        min_temp REAL,
        avg_humidity REAL,
        avg_wind_speed REAL,
        dominant_weather TEXT,
        date TEXT
    )`);
});

// Fetch and process weather data every 5 minutes
cron.schedule('*/5 * * * *', () => {
    const CITIES = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];
    CITIES.forEach(city => {
        fetchWeatherData(city, (error, data) => {
            if (!error && data) {
                storeWeatherData([data]);
                checkAlerts([data]);
            } else {
                console.error(error);
            }
        });
    });
});

// Calculate daily summary at midnight
cron.schedule('0 0 * * *', () => {
    calculateDailySummary();
    console.log('Daily summary calculated at', new Date());
});

// Store weather data in the database
function storeWeatherData(weatherData) {
    const stmt = db.prepare('INSERT INTO weather VALUES (?, ?, ?, ?, ?, ?, ?)');
    weatherData.forEach(data => {
        stmt.run(data.city, data.main, data.temp, data.feels_like, data.humidity, data.wind_speed, data.dt, (err) => {
            if (err) {
                console.error('Error inserting weather data:', err);
            }
        });
    });
    stmt.finalize();
}

// Calculate daily summary
function calculateDailySummary(db, callback) {
    db.all(`SELECT city, 
                   AVG(temp) as avg_temp, 
                   MAX(temp) as max_temp, 
                   MIN(temp) as min_temp, 
                   AVG(humidity) as avg_humidity,
                   AVG(wind_speed) as avg_wind_speed,
                   main 
            FROM weather 
            WHERE dt >= strftime('%s', 'now', '-1 day') 
            GROUP BY city`, (err, rows) => {
        if (err) {
            throw err;
        }
        
        const stmt = db.prepare('INSERT INTO summary VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        
        rows.forEach(row => {
            stmt.run(row.city, row.avg_temp, row.max_temp, row.min_temp, row.avg_humidity, row.avg_wind_speed, row.main, new Date().toISOString().split('T')[0], (err) => {
                if (err) {
                    console.error('Error inserting summary data:', err);
                }
            });
        });
        
        stmt.finalize(callback);
    });
}
// Check for temperature alerts
function checkAlerts(weatherData) {
    const alertThresholds = {
        temperature: 35,
        consecutiveCount: 2
    };
    let consecutiveHighTempCount = {};

    weatherData.forEach(data => {
        if (!consecutiveHighTempCount[data.city]) {
            consecutiveHighTempCount[data.city] = 0;
        }

        if (data.temp > alertThresholds.temperature) {
            consecutiveHighTempCount[data.city]++;
            if (consecutiveHighTempCount[data.city] >= alertThresholds.consecutiveCount) {
                console.log(`ALERT! High temperature in ${data.city}: ${data.temp}°C`);
                consecutiveHighTempCount[data.city] = 0; // Reset after alert
            }
        } else {
            consecutiveHighTempCount[data.city] = 0;
        }
    });
}

// Define routes
app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather',
        name: "Teerth"
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About me',
        name: "Teerth Mittal"
    });
});

app.get('/help', (req, res) => {
    res.render('help', {
        title: "Help",
        name: "Teerth Mittal"
    });
});

app.get('/weather', (req, res) => {
    if (!req.query.address) {
        return res.send({
            error: "Please provide an address"
        });
    }

    geocode(req.query.address, (error, data) => {
        if (error) {
            return res.send({ error });
        }

        fetchWeatherData(data.city, (error, forecastData) => {  // Correct usage of fetchWeatherData
            if (error) {
                return res.send({ error });
            }

            res.send({
                forecast: {
                    city: data.city,
                    temp: forecastData.temp,
                    feels_like: forecastData.feels_like,
                    main: forecastData.main,
                    humidity: forecastData.humidity,  // Include humidity
                    wind_speed: forecastData.wind_speed  // Include wind_speed
                },
                address: req.query.address
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});
module.exports={
    app,
   calculateDailySummary,
   storeWeatherData,
   checkAlerts
};