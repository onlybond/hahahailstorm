import { API_KEY } from './config.js'
document.addEventListener("DOMContentLoaded", () => {
    const animatediv = document.querySelectorAll("div")
    const animateserchdiv = document.querySelectorAll("div:not(header)");
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
    const apiKey = API_KEY;
    const apiUrl = "https://api.openweathermap.org/data/2.5/";

    function showScrollMessage() {
        const scrollMessage = document.querySelector('.scroll-message');

        const timeline = gsap.timeline({
            defaults: { duration: 1 },
            onComplete: () => {
                // Hide the scroll message when the animation is complete
                gsap.set(scrollMessage, { opacity: 0 });
            },
        });

        timeline.to(scrollMessage, { opacity: 0 });

        ScrollTrigger.create({
            trigger: scrollMessage,
            start: 'top center',
            animation: timeline,
            toggleActions: 'play none none',
        });
    }

    // Call the function to show the scroll message
    showScrollMessage();
    function animateFadeIn(elements) {
        if (!elements || elements.length === 0) {
            console.error("No elements provided for animation.");
            return;
        }

        gsap.from(elements, {
            opacity: 0,
            y: 40,
            duration: 1,
            stagger: 0.1,
            ease: "power4.out",
        });
    }
    function getWeatherData(latitude, longitude) {
        const weatherUrl = `${apiUrl}weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        fetch(weatherUrl)
            .then(response => response.json())
            .then(data => {
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
                animateFadeIn([animateserchdiv]);
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

                // Group forecast items by date excluding today
                const groupedForecast = {};
                forecastItems.forEach(item => {
                    const date = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });

                    // Exclude today's forecast items
                    if (date !== new Date().toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })) {
                        if (!groupedForecast[date]) {
                            groupedForecast[date] = [];
                        }

                        groupedForecast[date].push(item);
                    }
                });

                // Clear previous forecast data
                next5DaysContainer.innerHTML = "";
                console.log(groupedForecast);
                // Display forecast data
                for (const date in groupedForecast) {
                    const forecastRow = document.createElement("div");
                    forecastRow.classList.add("next-5-days__row");
                    forecastRow.setAttribute("data-date", date);
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
                    <div class="next-5-days__details">
                        <div class="forecast-details__dropdown">
                            <!-- Hourly forecast details will be added here -->
                        </div>
                    </div
                `;

                    forecastRow.addEventListener("click", () => {
                        // Toggle active class on the clicked forecast row
                        forecastRow.classList.toggle("active");

                        // Toggle visibility of the forecast details dropdown
                        const forecastDetailsDropdown = forecastRow.querySelector(".forecast-details__dropdown");
                        if (forecastDetailsDropdown) {
                            forecastDetailsDropdown.classList.toggle("active");

                            // Fetch and populate hourly forecast data if the dropdown is active
                            if (forecastDetailsDropdown.classList.contains("active")) {
                                const forecastDate = forecastRow.getAttribute("data-date"); // Use data-date attribute

                                if (forecastDate) {
                                    const hourlyForecast = groupedForecast[forecastDate];

                                    if (hourlyForecast) {
                                        // Clear previous hourly forecast data
                                        forecastDetailsDropdown.innerHTML = "";
                                        console.log(hourlyForecast);
                                        // Populate hourly forecast data
                                        hourlyForecast.forEach(item => {
                                            const timeOptions = { hour: "numeric", hour12: true };
                                            const time = new Date(item.dt * 1000).toLocaleTimeString("en-US", timeOptions);
                                            const temperatureHigh = item.main.temp_max;
                                            const weatherCondition = item.weather[0].description
                                            const temperatureLow = item.main.temp_min;
                                            const weatherIcon = item.weather[0].icon;
                                            const rainPercentage = item.pop;
                                            const windSpeed = item.wind.speed;

                                            const hourlyForecastRow = document.createElement("div");
                                            hourlyForecastRow.classList.add("hourly-forecast__row");
                                            hourlyForecastRow.innerHTML = `
                                            <div class="hourly-forecast__time">${time}</div>
                                            <div class="hourly-forecast__icon"><img src="icons/${weatherIcon}.svg" alt=""></div>
                                            <div class="hourly-forecast__weatherCondition">${weatherCondition}</div>
                                            <div class="hourly-forecast__temperatureHigh">${temperatureHigh}°C</div>
                                            <div class="hourly-forecast__temperatureLow">${temperatureLow}°C</div>
                                            <div class="hourly-forecast__Humidity">${rainPercentage}%</div>
                                            <div class="hourly-forecast__windSpeed">${windSpeed} m/s</div>
                                        `;

                                            forecastDetailsDropdown.appendChild(hourlyForecastRow);
                                        });
                                    } else {
                                        console.error("Hourly forecast data not found for the selected date.");
                                    }
                                } else {
                                    console.error("Forecast date not found in data-date attribute.");
                                }
                            }
                        }
                    });




                    next5DaysContainer.appendChild(forecastRow);
                    gsap.to(forecastRow, { opacity: 0, y: 100, duration: 0 });

                    // Use ScrollTrigger for viewport-based animation
                    gsap.to(forecastRow, {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power4.out",
                        scrollTrigger: {
                            trigger: forecastRow,
                            start: "top 80%", // Adjust the starting point as needed
                        },
                    });
                }
            })
            .catch(error => {
                console.error("Error fetching forecast data:", error);
            });
    }


    const searchButton = document.querySelector(".search-btn");
    const searchInput = document.getElementById("location-input");
    const suggestionsContainer = document.querySelector(".suggestions");

    searchButton.addEventListener("click", (event) => {
        event.preventDefault();
        const inputValue = searchInput.value
        if (inputValue) {
            suggestionsContainer.innerHTML = ''
            const searchUrl = `${apiUrl}weather?q=${inputValue}&appid=${apiKey}`;
            fetch(searchUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.cod == 200) {

                        const latitude = data.coord.lat;
                        const longitude = data.coord.lon;
                        getWeatherAndForecast(latitude, longitude);
                    }
                    else if (data.cod == 404) {
                        suggestionsContainer.innerHTML = "city not found";
                    }
                    showScrollMessage();
                })
        }
    })
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
