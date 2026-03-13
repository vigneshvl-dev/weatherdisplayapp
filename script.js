// ============================================================
//  Weather App - script.js
//  Uses the OpenWeatherMap Current Weather API (free tier)
//  API Docs: https://openweathermap.org/current
// ============================================================

// ⚠️  Replace the value below with YOUR own API key from:
//     https://home.openweathermap.org/api_keys
const API_KEY = "a4776569dfd2eaadc865b443c276bc22";

// Base URL for OpenWeatherMap's Current Weather endpoint
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ── DOM References ──────────────────────────────────────────
const cityInput      = document.getElementById("cityInput");
const searchBtn      = document.getElementById("searchBtn");
const weatherCard    = document.getElementById("weatherCard");
const errorCard      = document.getElementById("errorCard");
const errorMsg       = document.getElementById("errorMsg");
const loader         = document.getElementById("loader");

// Weather Card fields
const cityNameEl     = document.getElementById("cityName");
const countryNameEl  = document.getElementById("countryName");
const temperatureEl  = document.getElementById("temperature");
const conditionEl    = document.getElementById("weatherCondition");
const weatherIconEl  = document.getElementById("weatherIcon");
const humidityEl     = document.getElementById("humidity");
const windSpeedEl    = document.getElementById("windSpeed");
const feelsLikeEl    = document.getElementById("feelsLike");

// ── Get Weather by Geolocation (lat/lon) ──────────────────────
async function getWeatherByLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  showLoader();

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const { latitude: lat, longitude: lon } = position.coords;
      try {
        const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Invalid API key. Please update your API key in script.js.");
          } else {
            throw new Error(`Something went wrong (HTTP ${response.status}). Please try again.`);
          }
        }

        const data = await response.json();
        cityInput.value = data.name; // fill the search box with the resolved city
        displayWeather(data);
      } catch (error) {
        showError(error.message || "Unable to fetch weather data.");
      }
    },
    function (err) {
      showError("Location access denied. Please allow location permission and try again.");
    }
  );
}

// ── Allow pressing Enter to trigger search ──────────────────
cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});

// ── Main Function ───────────────────────────────────────────
async function getWeather() {
  const city = cityInput.value.trim();

  // Basic validation: make sure the user typed something
  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  // Show loader; hide previous results / errors
  showLoader();

  try {
    // Build the API request URL
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    // Fetch data from OpenWeatherMap
    const response = await fetch(url);

    // If the response isn't OK (e.g. 404 for unknown city, 401 for bad key)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please check the spelling and try again.");
      } else if (response.status === 401) {
        throw new Error("Invalid API key. Please update your API key in script.js.");
      } else {
        throw new Error(`Something went wrong (HTTP ${response.status}). Please try again.`);
      }
    }

    // Parse the JSON body
    const data = await response.json();

    // Render the weather data on the card
    displayWeather(data);

  } catch (error) {
    // Network error or thrown errors from above
    showError(error.message || "Unable to fetch weather data. Check your internet connection.");
  }
}

// ── Display Weather Data ────────────────────────────────────
function displayWeather(data) {
  // City & Country
  cityNameEl.textContent    = data.name;
  countryNameEl.textContent = data.sys.country;

  // Temperature (rounded to nearest integer)
  temperatureEl.textContent = Math.round(data.main.temp);

  // Weather condition text (e.g. "Clear", "Clouds", "Rain")
  conditionEl.textContent   = data.weather[0].description;

  // Extra details
  humidityEl.textContent    = `${data.main.humidity} %`;
  windSpeedEl.textContent   = `${Math.round(data.wind.speed * 3.6)} km/h`; // m/s → km/h
  feelsLikeEl.textContent   = `${Math.round(data.main.feels_like)} °C`;

  // Weather icon from OpenWeatherMap
  const iconCode            = data.weather[0].icon;
  weatherIconEl.src         = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIconEl.alt         = data.weather[0].description;

  // Show card; hide loader & error
  hideLoader();
  errorCard.style.display   = "none";
  weatherCard.style.display = "block";
}

// ── Helper: Show Error ──────────────────────────────────────
function showError(message) {
  hideLoader();
  weatherCard.style.display = "none";
  errorMsg.textContent      = message;
  errorCard.style.display   = "block";
}

// ── Helpers: Loader ─────────────────────────────────────────
function showLoader() {
  weatherCard.style.display = "none";
  errorCard.style.display   = "none";
  loader.style.display      = "block";
}

function hideLoader() {
  loader.style.display = "none";
}
