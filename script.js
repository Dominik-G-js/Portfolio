document.addEventListener('DOMContentLoaded', () => {
    // Stávající kód pro animace sekcí a akordeon zůstává stejný...
    const sections = document.querySelectorAll('.content-section');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionContent = header.nextElementSibling;
            header.classList.toggle('active');
            if (accordionContent.style.maxHeight) {
                accordionContent.style.maxHeight = null;
            } else {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
            }
        });
    });

    // NOVÁ FUNKCE PRO NAČTENÍ POČASÍ
    async function fetchWeather() {
        // Souřadnice pro Ostravu
        const lat = 49.83;
        const lon = 18.28;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
        const widget = document.getElementById('weather-widget');

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Weather data not available');
            }
            const data = await response.json();

            const temperature = Math.round(data.current.temperature_2m);
            const weatherCode = data.current.weather_code;
            const weatherIcon = getWeatherIcon(weatherCode);

            const weatherHTML = `
                <span class="weather-location">Ostrava:</span>
                <span class="weather-temp">${temperature}°C</span>
                <span class="weather-icon">${weatherIcon}</span>
            `;
            
            widget.innerHTML = weatherHTML;

        } catch (error) {
            widget.innerHTML = `<p>Weather data currently unavailable.</p>`;
            console.error('Failed to fetch weather data:', error);
        }
    }

    // Pomocná funkce, která převede kód počasí na emoji ikonku
    function getWeatherIcon(code) {
        if (code === 0) return '☀️'; // Jasno
        if (code === 1) return '🌤️'; // Převážně jasno
        if (code === 2) return '🌥️'; // Polojasno
        if (code === 3) return '☁️'; // Oblačno
        if (code >= 51 && code <= 67) return '🌧️'; // Déšť
        if (code >= 71 && code <= 77) return '❄️'; // Sněžení
        if (code >= 80 && code <= 82) return '🌦️'; // Přeháňky
        if (code >= 95 && code <= 99) return '⛈️'; // Bouřka
        return '🌍'; // Výchozí
    }

    // Zavolání nové funkce po načtení stránky
    fetchWeather();
});
