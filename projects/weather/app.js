document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'd72c958a0ed7ed92aab1d7b6cf2ac0d6'; // Replace with your actual API key
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const currentWeather = document.getElementById('current-weather');
    const forecast = document.getElementById('forecast');
    const errorMessage = document.getElementById('error-message');
   
    // Event listeners
    searchBtn.addEventListener('click', getWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            getWeather();
        }
    });
   
    // Main function to get weather data
    async function getWeather() {
        const city = cityInput.value.trim();
       
        if (!city) return;
       
        try {
            // Get coordinates first (required for OneCall API)
            const geoData = await getCoordinates(city);
            if (!geoData) {
                showError();
                return;
            }
           
            // Get current weather and forecast
            const weatherData = await getCurrentWeather(geoData.lat, geoData.lon);
            const forecastData = await getForecast(geoData.lat, geoData.lon);
           
            if (weatherData && forecastData) {
                displayCurrentWeather(weatherData, city);
                displayForecast(forecastData);
                hideError();
            } else {
                showError();
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            showError();
        }
    }
   
    // Get coordinates from city name
    async function getCoordinates(city) {
        try {
            const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
            const data = await response.json();
           
            if (data.length === 0) {
                return null;
            }
           
            return {
                lat: data[0].lat,
                lon: data[0].lon
            };
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    }
   
    // Get current weather data
    async function getCurrentWeather(lat, lon) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching current weather:', error);
            return null;
        }
    }
   
    // Get forecast data
    async function getForecast(lat, lon) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching forecast:', error);
            return null;
        }
    }
   
    // Display current weather
    function displayCurrentWeather(data, city) {
        document.getElementById('city-name').textContent = city;
        document.getElementById('temperature').textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
        document.getElementById('description').textContent = `Weather: ${data.weather[0].description}`;
        document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
        document.getElementById('wind-speed').textContent = `Wind: ${data.wind.speed} m/s`;
       
        // Set weather icon
        const iconCode = data.weather[0].icon;
        const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
        document.getElementById('weather-icon').innerHTML = `<img src="${iconUrl}" alt="${data.weather[0].description}">`;
       
        currentWeather.classList.remove('hidden');
    }
   
    // Display 5-day forecast
    function displayForecast(data) {
        const forecastContainer = document.getElementById('forecast-container');
        forecastContainer.innerHTML = '';
       
        // Group forecast data by day (we want one forecast per day)
        const dailyForecasts = {};
       
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
           
            // Only store one forecast per day (noon time if possible)
            if (!dailyForecasts[day] || Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[day].dt * 1000).getHours() - 12)) {
                dailyForecasts[day] = item;
            }
        });
       
        // Display only 5 days
        Object.values(dailyForecasts).slice(0, 5).forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const iconCode = item.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
           
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            forecastCard.innerHTML = `
                <div class="forecast-date">${day}</div>
                <img src="${iconUrl}" alt="${item.weather[0].description}">
                <div class="forecast-temp">${Math.round(item.main.temp)}°C</div>
                <div class="forecast-desc">${item.weather[0].description}</div>
            `;
           
            forecastContainer.appendChild(forecastCard);
        });
       
        forecast.classList.remove('hidden');
    }
   
    // Show error message
    function showError() {
        currentWeather.classList.add('hidden');
        forecast.classList.add('hidden');
        errorMessage.classList.remove('hidden');
    }
   
    // Hide error message
    function hideError() {
        errorMessage.classList.add('hidden');
    }
});