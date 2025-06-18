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


    // VYLEPŠENÁ FUNKCE PRO NAČTENÍ DAT Z GITHUBU
    async function fetchRepoData() {
        const username = 'Dominik-G-js';
        const repoName = 'Portfolio';
        const repoUrl = `https://api.github.com/repos/${username}/${repoName}`;
        const readmeUrl = `https://api.github.com/repos/${username}/${repoName}/readme`;
        const placeholder = document.getElementById('repo-card-placeholder');

        const headers = new Headers();
        if (typeof GITHUB_TOKEN !== 'undefined') {
            headers.append('Authorization', `token ${GITHUB_TOKEN}`);
        }

        try {
            // 1. Nejprve zkusíme načíst data o repozitáři
            const repoResponse = await fetch(repoUrl, { headers: headers });
            if (!repoResponse.ok) {
                throw new Error(`Repo fetch failed: ${repoResponse.status}`);
            }
            const repoData = await repoResponse.json();

            // 2. Poté zkusíme načíst README
            let readmeHTML = '';
            try {
                const readmeResponse = await fetch(readmeUrl, { headers: headers });
                if (readmeResponse.ok) {
                    const readmeData = await readmeResponse.json();
                    const readmeMarkdown = atob(readmeData.content);
                    readmeHTML = marked.parse(readmeMarkdown);
                } else {
                    console.warn('README.md not found or failed to load.');
                }
            } catch (readmeError) {
                console.warn('Could not process README:', readmeError);
            }
            
            // 3. Nyní sestavíme HTML s daty, která máme k dispozici
            const lastUpdated = new Date(repoData.updated_at).toLocaleDateString('cs-CZ', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            const repoCardHTML = `
                <div class="repo-header">
                    <h3><a href="${repoData.html_url}" target="_blank" rel="noopener noreferrer">${repoData.name}</a></h3>
                </div>
                <p class="repo-description">${repoData.description || 'No description provided.'}</p>
                <div class="repo-stats">
                    <div class="stat-item"><i class="devicon-star-plain"></i><span>${repoData.stargazers_count} Stars</span></div>
                    <div class="stat-item"><i class="devicon-git-plain"></i><span>${repoData.forks_count} Forks</span></div>
                    <div class="stat-item"><span style="color: ${getLanguageColor(repoData.language)}; font-size: 1.5rem;">●</span><span>${repoData.language}</span></div>
                </div>
                <div class="repo-footer">Last updated: ${lastUpdated}</div>
                
                ${readmeHTML ? `<div class="repo-readme">${readmeHTML}</div>` : ''}
            `;

            placeholder.innerHTML = repoCardHTML;

        } catch (error) {
            placeholder.innerHTML = `<p style="color: #ff8a8a;">Failed to load project data. This might be due to API rate limits or a typo in the repository name.</p>`;
            console.error('There was a problem fetching the repo data:', error);
        }
    }

    function getLanguageColor(language) {
        const colors = {"JavaScript": "#f1e05a", "HTML": "#e34c26", "CSS": "#563d7c", "Python": "#3572A5", "PHP": "#4F5D95", "Vue": "#4FC08D"};
        return colors[language] || '#cccccc';
    }

    fetchRepoData();
});
