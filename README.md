
//Used jest to test all five cases requiered
//bonus implemented


## Prerequisites

- Node.js (>=14.x)
- npm (>=6.x)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Teerth67/ZEOTAP.git
    ```

2. Navigate to the project directory:
    ```sh
    cd ZEOTAP
    ```

3. Install dependencies:
    ```sh
    npm run install-dependencies
    ```

## Scripts

- **Start the application:**
    ```sh
    npm start
    ```

- **Run tests:**
    ```sh
    npm test
    ```

    ### 1. **Architecture:**
   - The application follows a modular architecture, separating concerns into different modules such as fetching weather data (`forecast.js`) and geocoding (`geocode.js`).
   - This separation of concerns makes the application easier to maintain and test.

### 2. **Data Fetching:**
   - Uses the `postman-request` library to fetch data from the OpenWeatherMap API.
   - Data fetching is abstracted into utility functions, making it reusable and easy to mock during testing.

### 3. **Error Handling:**
   - Comprehensive error handling is implemented in the `fetchWeatherData` function to handle different scenarios like network errors and invalid API responses.
   - Appropriate error messages are returned to the callback, ensuring the calling function can handle them appropriately.

### 4. **Testing:**
   - Utilizes Jest for testing the application.
   - Mocks the `postman-request` library to simulate API responses and test the functionality without making actual network requests.
   - Test cases are written to cover different scenarios, ensuring the robustness of the application.

### 5. **Weather Parameters:**
   - Additional weather parameters such as humidity, wind speed, and feels-like temperature are supported.
   - These parameters are incorporated into the weather data aggregation logic, providing a comprehensive weather summary.

### 6. **UI Integration:**
   - The application includes a simple UI for fetching weather data based on the user's location.
   - Uses geocoding to convert user-provided addresses into latitude and longitude, enhancing the user experience.

### 7. **Code Quality:**
   - Follows best practices in Node.js development, including modularization, use of constants for configuration, and clear function definitions.
   - The code is documented to provide clarity on the functionality and usage of differe
