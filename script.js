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

    // Funkce pro načtení počasí
    async function fetchWeather() {
        const widget = document.getElementById('weather-widget');
        if (!widget) return; // Pokud widget na stránce není, nic nedělej
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
            widget.innerHTML = `<p>Weather data currently unavailable.</p>`;
            console.error('Failed to fetch weather data:', error);
        }
    }
    
    // Funkce pro načtení dat z GitHubu
    async function fetchRepoData() {
        const placeholder = document.getElementById('repo-card-placeholder');
        if (!placeholder) return; // Pokud placeholder na stránce není, nic nedělej
        const username = 'Dominik-G-js', repoName = 'Portfolio';
        const repoUrl = `https://api.github.com/repos/${username}/${repoName}`;
        const readmeUrl = `https://api.github.com/repos/${username}/${repoName}/readme`;
        const headers = new Headers();
        if (typeof GITHUB_TOKEN !== 'undefined') {
            headers.append('Authorization', `token ${GITHUB_TOKEN}`);
        }
        try {
            const [repoResponse, readmeResponse] = await Promise.all([fetch(repoUrl, { headers }), fetch(readmeUrl, { headers })]);
            if (!repoResponse.ok) throw new Error(`Repo fetch failed: ${repoResponse.status}`);
            const repoData = await repoResponse.json();
            let readmeHTML = '';
            if (readmeResponse.ok) {
                const readmeData = await readmeResponse.json();
                const readmeMarkdown = atob(readmeData.content);
                readmeHTML = marked.parse(readmeMarkdown);
            }
            const lastUpdated = new Date(repoData.updated_at).toLocaleDateString('cs-CZ', {day:'numeric',month:'long',year:'numeric'});
            placeholder.innerHTML = `<div class="repo-header"><h3><a href="${repoData.html_url}" target="_blank" rel="noopener noreferrer">${repoData.name}</a></h3></div><p class="repo-description">${repoData.description||'No description provided.'}</p><div class="repo-stats"><div class="stat-item"><i class="devicon-star-plain"></i><span>${repoData.stargazers_count} Stars</span></div><div class="stat-item"><i class="devicon-git-plain"></i><span>${repoData.forks_count} Forks</span></div><div class="stat-item"><span style="color: ${getLanguageColor(repoData.language)}; font-size: 1.5rem;">●</span><span>${repoData.language}</span></div></div><div class="repo-footer">Last updated: ${lastUpdated}</div>${readmeHTML?`<div class="repo-readme">${readmeHTML}</div>`:''}`;
        } catch (error) {
            placeholder.innerHTML = `<p style="color: #ff8a8a;">Failed to load project data from GitHub. This might be due to an invalid token or API rate limits.</p>`;
            console.error('There was a problem fetching the repo data:', error);
        }
    }

    function getWeatherIcon(code) {
        if (code === 0) return '☀️'; if (code === 1) return '🌤️'; if (code === 2) return '🌥️'; if (code === 3) return '☁️'; if (code >= 51 && code <= 67) return '🌧️'; if (code >= 71 && code <= 77) return '❄️'; if (code >= 80 && code <= 82) return '🌦️'; if (code >= 95 && code <= 99) return '⛈️'; return '🌍';
    }
    
    function getLanguageColor(language) {
        const colors = {"JavaScript":"#f1e05a","HTML":"#e34c26","CSS":"#563d7c","Python":"#3572A5","PHP":"#4F5D95","Vue":"#4FC08D"};
        return colors[language] || '#cccccc';
    }

    // Zavolání obou funkcí
    fetchWeather();
    fetchRepoData();
});
