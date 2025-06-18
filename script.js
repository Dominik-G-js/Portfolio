document.addEventListener('DOMContentLoaded', () => {
    // Stávající kód pro animace a akordeon zůstává stejný...
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
    sections.forEach(section => sectionObserver.observe(section));

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

    // FINÁLNÍ FUNKCE PRO VYGENEREOVÁNÍ INFO LIŠTY
    async function fetchInfoData() {
        const infoBar = document.getElementById('info-bar');
        if (!infoBar) return;

        // Vytvoříme vnitřní kontejner pro obsah
        infoBar.innerHTML = `<div class="info-bar-content"><p>Loading live data...</p></div>`;
        const contentWrapper = infoBar.querySelector('.info-bar-content');

        const [weatherResult, btcResult] = await Promise.allSettled([
            fetch('https://api.open-meteo.com/v1/forecast?latitude=49.83&longitude=18.28&current=temperature_2m,weather_code'),
            fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=czk')
        ]);

        let weatherHTML = '<div class="info-item"><span class="label">Počasí nedostupné</span></div>';
        if (weatherResult.status === 'fulfilled' && weatherResult.value.ok) {
            const data = await weatherResult.value.json();
            const temperature = Math.round(data.current.temperature_2m);
            const weatherIcon = getWeatherIcon(data.current.weather_code);
            weatherHTML = `<div class="info-item"><span class="label">Ostrava:</span> ${temperature}°C <span class="icon">${weatherIcon}</span></div>`;
        }

        let btcHTML = '<div class="info-item"><span class="label">BTC cena nedostupná</span></div>';
        if (btcResult.status === 'fulfilled' && btcResult.value.ok) {
            const data = await btcResult.value.json();
            const priceCzk = data.bitcoin.czk;
            const formatter = new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 });
            btcHTML = `<div class="info-item"><span class="icon" style="color:#f7931a;">₿</span> <span class="label">Bitcoin:</span> ${formatter.format(priceCzk)}</div>`;
        }
        
        // Vložíme finální HTML do vnitřního kontejneru
        contentWrapper.innerHTML = `
            ${weatherHTML}
            <div class="info-separator"></div>
            ${btcHTML}
        `;
    }

    function getWeatherIcon(code) {
        if (code === 0) return '☀️'; if (code === 1) return '🌤️'; if (code === 2) return '🌥️'; if (code === 3) return '☁️'; if (code >= 51 && code <= 67) return '🌧️'; if (code >= 71 && code <= 77) return '❄️'; if (code >= 80 && code <= 82) return '🌦️'; if (code >= 95 && code <= 99) return '⛈️'; return '🌍';
    }

    fetchInfoData();
});
