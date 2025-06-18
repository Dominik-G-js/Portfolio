document.addEventListener('DOMContentLoaded', () => {
    // Kód pro animace sekcí
    const sections = document.querySelectorAll('.content-section, .content-section-full');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    sections.forEach(section => sectionObserver.observe(section));

    // Kód pro akordeon
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

   
    // Funkce pro načtení počasí (zůstává stejná)
    async function fetchWeather() {
        const widget = document.getElementById('weather-widget');
        if (!widget) return;
        const lat = 49.83, lon = 18.28;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Weather data not available');
            const data = await response.json();
            const temperature = Math.round(data.current.temperature_2m);
            const weatherIcon = getWeatherIcon(data.current.weather_code);
            widget.innerHTML = `<span class="weather-location">Ostrava:</span><span class="weather-temp">${temperature}°C</span><span class="weather-icon">${weatherIcon}</span>`;
        } catch (error) {
            widget.innerHTML = `<p>Weather data unavailable.</p>`;
            console.error('Failed to fetch weather data:', error);
        }
    }
    
    // NOVÁ FUNKCE PRO NAČTENÍ CENY BITCOINU
    async function fetchBtcPrice() {
        const widget = document.getElementById('btc-price-widget');
        if (!widget) return;
        const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,czk';

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Bitcoin price data not available');
            }
            const data = await response.json();

            const priceCzk = data.bitcoin.czk;

            // Formátování čísla pro lepší čitelnost (např. 1 500 000 Kč)
            const formatter = new Intl.NumberFormat('cs-CZ', {
                style: 'currency',
                currency: 'CZK',
                maximumFractionDigits: 0 // Bez desetinných míst
            });

            const btcHTML = `
                <span class="btc-icon"><i class="devicon-bitcoin-plain"></i></span>
                <span class="btc-price">${formatter.format(priceCzk)}</span>
            `;

            widget.innerHTML = btcHTML;

        } catch (error) {
            widget.innerHTML = `<p>BTC price unavailable.</p>`;
            console.error('Failed to fetch BTC price:', error);
        }
    }

    // Pomocné funkce (zůstávají stejné)
    function getWeatherIcon(code) {
        if (code === 0) return '☀️'; if (code === 1) return '🌤️'; if (code === 2) return '🌥️'; if (code === 3) return '☁️'; if (code >= 51 && code <= 67) return '🌧️'; if (code >= 71 && code <= 77) return '❄️'; if (code >= 80 && code <= 82) return '🌦️'; if (code >= 95 && code <= 99) return '⛈️'; return '🌍';
    }
    
    // Zavolání VŠECH funkcí
    fetchWeather();
    fetchBtcPrice();
});
