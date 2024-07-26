const { fetchWeatherData } = require('./src/utils/forecast');
const request = require('postman-request');

jest.mock('postman-request');

describe('Alerting Thresholds', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    test('Trigger alerts correctly based on temperature threshold', (done) => {
        const mockData = {
            weather: [{ main: 'Clear' }],
            main: { temp: 310, feels_like: 305, humidity: 50 },
            wind: { speed: 5 },
            dt: Date.now(),
            cod: 200,
        };

        request.mockImplementation((options, callback) => {
            callback(null, { body: mockData });
        });

        fetchWeatherData('Delhi', (error, data) => {
            if (error) return done(error);

            // Simulate threshold check
            if (data.temp > 30) { // Assuming 30°C is the threshold
                console.log(`ALERT! High temperature in ${data.city}: ${data.temp}°C`);
            }

            setTimeout(() => {
                expect(console.log).toHaveBeenCalledWith('ALERT! High temperature in Delhi: 36.85°C');
                done();
            }, 1000);
        });
    });
});
