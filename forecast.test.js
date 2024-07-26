const request = require('postman-request');
const { fetchWeatherData } = require('./src/utils/forecast'); 

jest.mock('postman-request'); 

describe('System Setup', () => {
    test('Verify system starts and connects to OpenWeatherMap API', (done) => {
       
        const mockData = {
            weather: [{ main: 'Clear' }],
            main: { temp: 300, feels_like: 295, humidity: 80 },
            wind: { speed: 5 },
            dt: Date.now(),
            cod: 200,
            name: 'Delhi'
        };

        request.mockImplementation((options, callback) => {
            callback(null, { body: mockData });
        });

        fetchWeatherData('Delhi', (error, data) => {
            try {
                expect(error).toBeNull();
                expect(data).toBeDefined();
                expect(data.city).toBe('Delhi');
                expect(data.temp).toBeCloseTo(26.85, 2); 
                done();
            } catch (err) {
                done(err);
            }
        });
    }, 10000); // Increase timeout to 10 seconds
});
