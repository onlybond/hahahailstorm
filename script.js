document.addEventListener("DOMContentLoaded", () => {
    const locationElement = document.querySelector(".location-and-date__location");
    const locationDate = document.querySelector(".location-and-date__location-date");
    const currentTemperatureElement = document.querySelector(".current-temperature__value");
    const currentWeatherSummaryElement = document.querySelector(".current-temperature__summary");
    const highTemperatureElement = document.querySelector(".current-stats__value:first-child");
    const lowTemperatureElement = document.querySelector(".low_temp");
    const windSpeedElement = document.querySelector(".wind_speed");
    const currentWeatherIconElement = document.querySelector(".current-temperature__icon-container");
    const humidityElement = document.querySelector(".rain");
    const weatherByHourContainer = document.querySelector(".weather-by-hour__container");
    const next5DaysContainer = document.querySelector(".next-5-days__container");

    // Replace with your API key
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    const apiUrl = "https://api.openweathermap.org/data/2.5/";

    function getWeatherData(latitude, longitude) {
        const weatherUrl = `${apiUrl}weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        fetch(weatherUrl)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const locationdate = new Date(data.dt * 1000);
                const temperature = data.main.temp;
                const weatherCondition = data.weather[0].description;
                const highTemperature = data.main.temp_max;
                const lowTemperature = data.main.temp_min;
                const weatherIcon = data.weather[0].icon;
                const windSpeed = data.wind.speed;
                const humidity = data.main.humidity;
                locationDate.innerHTML = locationdate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })
                currentWeatherIconElement.innerHTML = `<img src="icons/${weatherIcon}.svg" class="current-temperature__icon" alt="">`
                locationElement.textContent = data.name + ", " + data.sys.country;
                currentTemperatureElement.textContent = `${Math.round(temperature)}°C`;
                currentWeatherSummaryElement.textContent = weatherCondition;
                highTemperatureElement.textContent = `${Math.round(highTemperature)}°C`;
                lowTemperatureElement.textContent = `${Math.round(lowTemperature)}°C`;
                windSpeedElement.textContent = `${windSpeed} m/s`;
                humidityElement.textContent = `${humidity}%`;
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
            });
    }

    function getForecastData(latitude, longitude) {
        const forecastUrl = `${apiUrl}forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        fetch(forecastUrl)
            .then(response => response.json())
            .then(data => {
                const forecastItems = data.list;
                // Group forecast items by date
                const groupedForecast = {};
                forecastItems.forEach(item => {
                    const date = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });

                    if (!groupedForecast[date]) {
                        groupedForecast[date] = [];
                    }

                    groupedForecast[date].push(item);
                });

                // Clear previous forecast data
                next5DaysContainer.innerHTML = "";
                console.log(groupedForecast);
                // Display forecast data
                for (const date in groupedForecast) {
                    const forecastRow = document.createElement("div");
                    forecastRow.classList.add("next-5-days__row");
                    const firstItem = groupedForecast[date][0];
                    const itemday = new Date(firstItem.dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
                    const itemdate = new Date(firstItem.dt * 1000).toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
                    const temperatureHigh = firstItem.main.temp_max;
                    const weatherCondition = firstItem.weather[0].description
                    const temperatureLow = firstItem.main.temp_min;
                    const weatherIcon = firstItem.weather[0].icon;
                    const rainPercentage = firstItem.pop;
                    const windSpeed = firstItem.wind.speed;

                    forecastRow.innerHTML = `
                    <div class="next-5-days__date">${itemday}<div class="next-5-days__label">${itemdate}</div></div>
                    <div class="next-5-days__high">${Math.round(temperatureHigh)}°C<div class="next-5-days__label">High</div></div>
                    <div class="next-5-days__low">${Math.round(temperatureLow)}°C<div class="next-5-days__label">Low</div></div>
                    <div class="next-5-days__icon"><img src="icons/${weatherIcon}.svg" alt=""><div class="next-5-days__label">${weatherCondition}</div></div>
                    <div class="next-5-days__rain">${Math.round(rainPercentage * 100)}%<div class="next-5-days__label">Rain</div></div>
                    <div class="next-5-days__wind">${windSpeed} m/s<div class="next-5-days__label">Wind</div></div>
                `;
                    next5DaysContainer.appendChild(forecastRow);
                }
            })
            .catch(error => {
                console.error("Error fetching forecast data:", error);
            });
    }

    const searchInput = document.getElementById("location-input");
    const suggestionsContainer = document.querySelector(".suggestions");

    let typingTimer;
    const typingDelay = 500; // Delay in milliseconds

    searchInput.addEventListener("input", () => {
        clearTimeout(typingTimer);

        const inputValue = searchInput.value;
        if (inputValue) {
            typingTimer = setTimeout(() => {
                fetchSuggestions(inputValue);
            }, typingDelay);
        } else {
            suggestionsContainer.innerHTML = "";
        }
    });

    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            const inputValue = searchInput.value;
            if (inputValue) {
                fetchSuggestions(inputValue);
            }
        }
    });

    function fetchSuggestions(inputValue) {
        const searchUrl = `${apiUrl}weather?q=${inputValue}&appid=${apiKey}`;
        fetch(searchUrl)
            .then(response => response.json())
            .then(data => {
                suggestionsContainer.innerHTML = "";

                if (data.name) {
                    const suggestion = document.createElement("div");
                    suggestion.classList.add("suggestion");
                    suggestion.textContent = data.name;
                    suggestion.addEventListener("click", () => {
                        searchInput.value = data.name;
                        suggestionsContainer.innerHTML = "";
                        const latitude = data.coord.lat;
                        const longitude = data.coord.lon;
                        getWeatherAndForecast(latitude, longitude);
                    });
                    suggestionsContainer.appendChild(suggestion);
                }
            })
            .catch(error => {
                console.error("Error fetching suggestions:", error);
            });
    }
    function getWeatherAndForecast(latitude, longitude) {
        getWeatherData(latitude, longitude);
        getForecastData(latitude, longitude);
    }

    function successCallback(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        getWeatherData(latitude, longitude);
        getForecastData(latitude, longitude);
        // You can call additional functions here if needed
    }

    function errorCallback(error) {
        console.error("Error getting user location:", error.message);
    }

    // Get user's location and update weather data
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
});
