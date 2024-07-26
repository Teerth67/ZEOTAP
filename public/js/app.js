const m1 = document.querySelector("#a1");
const m2 = document.querySelector("#a2");

const weatherForm = document.querySelector('form');
const search = document.querySelector('input');

weatherForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const location = search.value;
    m1.textContent = "Loading...";
    m2.innerHTML = "";

    fetch(`/weather?address=${encodeURIComponent(location)}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                m1.textContent = data.error;
                m2.innerHTML = "";
            } else {
                m1.textContent = `City: ${data.forecast.city}`;
                m2.innerHTML = `
                    <table border="1">
                        <tr>
                            <th>Temperature (°C)</th>
                            <th>Feels Like (°C)</th>
                            <th>Condition</th>
                            <th>Humidity (%)</th>
                            <th>Wind Speed (m/s)</th>
                        </tr>
                        <tr>
                            <td>${data.forecast.temp}</td>
                            <td>${data.forecast.feels_like}</td>
                            <td>${data.forecast.main}</td>
                            <td>${data.forecast.humidity}</td>
                            <td>${data.forecast.wind_speed}</td>
                        </tr>
                    </table>
                `;
            }
        })
        .catch((error) => {
            m1.textContent = "Unable to fetch data.";
            m2.innerHTML = "";
        });
});
