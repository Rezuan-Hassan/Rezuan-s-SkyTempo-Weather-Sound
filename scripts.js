// Functionality and Dynamic Logic

// --- CRITICAL CONFIGURATION ---
// You must get a free API key from a weather service like OpenWeatherMap.
// Replace the text below with your actual API key.
const apiKey = "81d08391553eae1bd3c05eaab792126f";
const defaultCity = "Calfin Danang"; // A custom default

// --- UI Element Selectors ---
const locationInput = document.getElementById('location-input');
const searchButton = document.getElementById('search-button');
const playlistLinkInput = document.getElementById('playlist-link-input');
const loadPlaylistBtn = document.getElementById('load-playlist-btn');
const ytPlayerPlaceholder = document.getElementById('yt-player-placeholder');

// --- Main Weather Logic ---

// Get data for a city from the API
async function fetchWeatherData(city) {
    // If you don't use a key, the site won't break, it just uses default mock data.
    if (apiKey === "PASTE_YOUR_OPENWEATHERMAP_API_KEY_HERE") {
        console.warn("API Key is missing. Using placeholder data. Check scripts.js");
        updateMockWeatherData(city);
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Location not found');
        const data = await response.ok ? await response.json() : null;
        updateUI(data);
    } catch (error) {
        alert("Location not found. Please try again.");
    }
}

// Update the dynamic elements based on real data
function updateUI(data) {
    if (!data) return;

    // 1. Current Conditions Side Panel
    document.getElementById('current-city').innerHTML = `<i class="fas fa-location-dot"></i> ${data.name}`;
    document.getElementById('main-temp').innerText = `${Math.round(data.main.temp)}° C`;
    document.querySelector('.meta-item:nth-child(1) span').innerText = `${data.wind.speed} mph`;
    document.querySelector('.meta-item:nth-child(2) span').innerText = `${data.main.humidity}%`;
    document.querySelector('.meta-item:nth-child(3) span').innerText = `${(data.rain ? data.rain['1h'] : 0).toFixed(2)} mm`;

    // 2. Main Large Dashboard
    const condition = data.weather[0].main; // e.g., 'Rain', 'Clouds', 'Clear'
    document.querySelector('.main-condition-text').innerText = `${condition} with ${data.weather[0].description}`;
    
    // 3. Dynamic Background
    changeDynamicBackground(condition);
}

// Update UI with static/mock data if no API key is present
function updateMockWeatherData(city) {
    // Use the values from your original prompt image as the mock data.
    document.getElementById('current-city').innerHTML = `<i class="fas fa-location-dot"></i> ${city} (Demo Mode)`;
    document.getElementById('main-temp').innerText = `10° C`;
    document.querySelector('.meta-item:nth-child(1) span').innerText = `19 mph`;
    document.querySelector('.meta-item:nth-child(2) span').innerText = `40%`;
    document.querySelector('.meta-item:nth-child(3) span').innerText = `1.15 mm`;
    document.querySelector('.main-condition-text').innerText = `Strom with Heavy Rain (Demo)`;
    
    changeDynamicBackground('Storm'); // Always stormy in demo
}

// Change the dynamic background of the website based on weather
function changeDynamicBackground(weatherCondition) {
    const body = document.body;
    body.className = ''; // clear all classes
    
    switch (weatherCondition.toLowerCase()) {
        case 'clear':
        case 'sunny':
            body.classList.add('weather-sunny');
            break;
        case 'rain':
        case 'drizzle':
        case 'storm':
        case 'thunderstorm':
            body.classList.add('weather-stormy');
            break;
        default:
            body.classList.add('weather-default'); // the original cloudy field
    }
}

// --- Music Player Logic (using YouTube API) ---
let ytPlayer;

// Extracts a playlist ID from a YouTube link (complex regex)
function getPlaylistIdFromLink(url) {
    const regex = /[&?]list=([^&]+)/i;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
}

// Loads the YouTube IFrame Player API. The function name *must* match this for YT to work.
window.onYouTubeIframeAPIReady = function() {
    console.log("YouTube API is ready.");
};

// Loads a playlist when the user pastes a link
loadPlaylistBtn.addEventListener('click', () => {
    const link = playlistLinkInput.value.trim();
    if (!link) return;

    const playlistId = getPlaylistIdFromLink(link);
    if (!playlistId) {
        alert("Please paste a valid YouTube Playlist Link.");
        return;
    }

    // Replace the placeholder div with the player iframe
    ytPlayerPlaceholder.innerHTML = ''; 
    ytPlayer = new YT.Player('yt-player-placeholder', {
        height: '300',
        width: '100%',
        playerVars: {
            listType: 'playlist',
            list: playlistId,
            autoplay: 1, // Optional: Start playing immediately
            modestbranding: 1, // Less visible YouTube logo
            rel: 0 // Show related videos from same playlist
        }
    });
});

// --- Event Listeners and Startup ---
searchButton.addEventListener('click', () => {
    const city = locationInput.value.trim();
    if (city) { fetchWeatherData(city); }
});

locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = locationInput.value.trim();
        if (city) { fetchWeatherData(city); }
    }
});

// Fetch initial data (either real or mock)
fetchWeatherData(defaultCity);