
const request = require('postman-request');
const { fetchWeatherData } = require('./src/utils/forecast'); 
const { kelvinToCelsius } = require('./src/utils/forecast'); 
const sqlite3 = require('sqlite3');


describe('Temperature Conversion', () => {
    test('Convert temperature from Kelvin to Celsius', () => {
        const kelvinTemp = 300;
        const celsiusTemp = kelvinToCelsius(kelvinTemp);
        expect(celsiusTemp).toBeCloseTo(26.85, 2);
    });
});

jest.mock('postman-request'); 

describe('Data Retrieval', () => {
    test('Simulate API calls and retrieve weather data correctly', (done) => {
     
        const mockData = {
            weather: [{ main: 'Clear' }],
            main: { temp: 300, feels_like: 295, humidity: 80 },
            wind: { speed: 5 },
            dt: Date.now(),
            cod: 200
        };

   
        request.mockImplementation((options, callback) => {
            callback(null, { body: mockData });
        });

        fetchWeatherData('Delhi', (error, data) => {
            expect(error).toBeNull(); 
            expect(data).toBeDefined(); 
            if (data) {
                expect(data.city).toBe('Delhi');
                expect(data.temp).toBeCloseTo(26.85, 2); 
                done();
            }
        });
    });
});