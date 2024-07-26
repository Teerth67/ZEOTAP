const sqlite3 = require('sqlite3').verbose();
const { calculateDailySummary } = require('./src/app'); // Ensure the correct path
const db = new sqlite3.Database(':memory:'); // Use an in-memory database for testing

// Setup in-memory database for tests
beforeAll((done) => {
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
        )`, done);
    });
});

// Clean up database after tests
afterAll((done) => {
    db.serialize(() => {
        db.run(`DROP TABLE IF EXISTS weather`);
        db.run(`DROP TABLE IF EXISTS summary`, done);
    });
});

test('Calculate daily weather summary correctly', (done) => {
    const now = Date.now();
    const mockWeatherData = [
        { city: 'Delhi', main: 'Clear', temp: 300, feels_like: 295, humidity: 80, wind_speed: 5, dt: now - 1000 },
        { city: 'Delhi', main: 'Clear', temp: 310, feels_like: 305, humidity: 75, wind_speed: 6, dt: now - 2000 },
        { city: 'Mumbai', main: 'Rain', temp: 295, feels_like: 290, humidity: 90, wind_speed: 7, dt: now - 3000 },
        { city: 'Mumbai', main: 'Rain', temp: 285, feels_like: 280, humidity: 85, wind_speed: 8, dt: now - 4000 },
    ];

    // Insert mock data into the database
    const stmt = db.prepare('INSERT INTO weather VALUES (?, ?, ?, ?, ?, ?, ?)');
    mockWeatherData.forEach(data => {
        stmt.run(data.city, data.main, data.temp, data.feels_like, data.humidity, data.wind_speed, data.dt);
    });
    stmt.finalize((err) => {
        if (err) return done(err);

        // Check what data is in the weather table
        db.all('SELECT * FROM weather', (err, rows) => {
            if (err) return done(err);
            console.log('Weather data in table:', rows);

            // Mock the database call in calculateDailySummary
            calculateDailySummary(db, () => {
                db.all('SELECT * FROM summary', (err, rows) => {
                    if (err) return done(err);

                    console.log('Summary data:', rows);

                    try {
                        expect(rows.length).toBe(2); // Should have summaries for two cities

                        const delhiSummary = rows.find(row => row.city === 'Delhi');
                        const mumbaiSummary = rows.find(row => row.city === 'Mumbai');

                        expect(delhiSummary).toBeDefined();
                        expect(mumbaiSummary).toBeDefined();

                        // Validate Delhi summary
                        expect(delhiSummary.avg_temp).toBeCloseTo((300 + 310) / 2, 2);
                        expect(delhiSummary.max_temp).toBe(310);
                        expect(delhiSummary.min_temp).toBe(300);
                        expect(delhiSummary.avg_humidity).toBeCloseTo((80 + 75) / 2, 2);
                        expect(delhiSummary.avg_wind_speed).toBeCloseTo((5 + 6) / 2, 2);
                        expect(delhiSummary.dominant_weather).toBe('Clear');

                        // Validate Mumbai summary
                        expect(mumbaiSummary.avg_temp).toBeCloseTo((295 + 285) / 2, 2);
                        expect(mumbaiSummary.max_temp).toBe(295);
                        expect(mumbaiSummary.min_temp).toBe(285);
                        expect(mumbaiSummary.avg_humidity).toBeCloseTo((90 + 85) / 2, 2);
                        expect(mumbaiSummary.avg_wind_speed).toBeCloseTo((7 + 8) / 2, 2);
                        expect(mumbaiSummary.dominant_weather).toBe('Rain');

                        done();
                    } catch (error) {
                        done(error);
                    }
                });
            });
        });
    });
});
