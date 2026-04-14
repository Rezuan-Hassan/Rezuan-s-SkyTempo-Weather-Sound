// --- CONFIGURATION ---
// Paste your actual OpenWeatherMap API key below
const apiKey = "PASTE_YOUR_OPENWEATHERMAP_API_KEY_HERE";
const defaultCity = "Dhaka"; // Fixed default city

// --- UI Element Selectors ---
const locationInput = document.getElementById('location-input');
const searchButton = document.getElementById('search-button');
const playlistLinkInput = document.getElementById('playlist-link-input');
const loadPlaylistBtn = document.getElementById('load-playlist-btn');
const ytPlayerContainer = document.getElementById('yt-player-container');
const sidebarIcons = document.querySelectorAll('.nav-icons i, .nav-icons-music i');

// --- Sidebar Interaction Logic ---
sidebarIcons.forEach(icon => {
    icon.addEventListener('click', function() {
        // Remove active class from all icons
        document.querySelectorAll('.side-nav i').forEach(nav => nav.classList.remove('active'));
        // Add active class to the clicked icon
        this.classList.add('active');
    });
});

// --- Main Weather Logic ---
async function fetchWeatherData(city) {
    if (apiKey === "PASTE_YOUR_OPENWEATHERMAP_API_KEY_HERE") {
        console.warn("API Key is missing. Using demo data.");
        updateMockWeatherData(city);
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            // Only alert if the user actively searched for something that failed
            if (city !== defaultCity) alert("Location not found. Please try a different city name.");
            return;
        }
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// Update the UI with real data
function updateUI(data) {
    if (!data) return;

    document.getElementById('current-city').innerHTML = `<i class="fas fa-location-dot"></i> ${data.name}`;
    document.getElementById('main-temp').innerText = `${Math.round(data.main.temp)}° C`;
    document.querySelector('.meta-item:nth-child(1) span').innerText = `${data.wind.speed} m/s`;
    document.querySelector('.meta-item:nth-child(2) span').innerText = `${data.main.humidity}%`;
    
    // Check if rain data exists, otherwise default to 0
    const rainVol = data.rain && data.rain['1h'] ? data.rain['1h'] : 0;
    document.querySelector('.meta-item:nth-child(3) span').innerText = `${rainVol.toFixed(2)} mm`;

    const condition = data.weather[0].main; 
    const description = data.weather[0].description;
    
    // Capitalize the first letter of the description
    const formattedDesc = description.charAt(0).toUpperCase() + description.slice(1);
    
    document.querySelector('.main-condition-text').innerText = `${condition}`;
    document.querySelector('.detailed-desc').innerText = `Current conditions: ${formattedDesc}. Dynamic weather generated via OpenWeather API.`;
    
    changeDynamicBackground(condition);
}

// Demo data fallback
function updateMockWeatherData(city) {
    document.getElementById('current-city').innerHTML = `<i class="fas fa-location-dot"></i> ${city} (Demo)`;
    document.getElementById('main-temp').innerText = `28° C`;
    document.querySelector('.meta-item:nth-child(1) span').innerText = `12 m/s`;
    document.querySelector('.meta-item:nth-child(2) span').innerText = `65%`;
    document.querySelector('.meta-item:nth-child(3) span').innerText = `0.00 mm`;
    document.querySelector('.main-condition-text').innerText = `Cloudy`;
    document.querySelector('.detailed-desc').innerText = `Please enter your API key to see live weather data for ${city}.`;
    changeDynamicBackground('Clouds');
}

// Dynamic Backgrounds
function changeDynamicBackground(weatherCondition) {
    const body = document.body;
    body.className = ''; 
    
    switch (weatherCondition.toLowerCase()) {
        case 'clear':
        case 'sunny':
            body.classList.add('weather-sunny');
            break;
        case 'rain':
        case 'drizzle':
        case 'thunderstorm':
            body.classList.add('weather-stormy');
            break;
        default:
            body.classList.add('weather-default');
    }
}

// --- Music Player Logic (Robust Iframe Method) ---
function getPlaylistIdFromLink(url) {
    const regex = /[&?]list=([^&]+)/i;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
}

loadPlaylistBtn.addEventListener('click', () => {
    const link = playlistLinkInput.value.trim();
    if (!link) return;

    const playlistId = getPlaylistIdFromLink(link);
    if (!playlistId) {
        alert("Please paste a valid YouTube Playlist Link.");
        return;
    }

    // Direct HTML iframe injection (Fixes Error 150/153 and works much better locally)
    ytPlayerContainer.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1" 
            title="Rezuan's YouTube Playlist" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
            style="border-radius: 15px;">
        </iframe>
    `;
});

// --- Event Listeners ---
searchButton.addEventListener('click', () => {
    const city = locationInput.value.trim();
    if (city) fetchWeatherData(city);
});

locationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = locationInput.value.trim();
        if (city) fetchWeatherData(city);
    }
});

// Start up
fetchWeatherData(defaultCity);
