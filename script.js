document.addEventListener('DOMContentLoaded', () => {
    // Stávající kód pro animace sekcí
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

    // Stávající kód pro akordeon
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

    // NOVÁ FUNKCE PRO NAČTENÍ DAT Z GITHUBU
    async function fetchRepoData() {
        const username = 'Dominik-G-js';
        const repo = 'Portfolio';
        const repoUrl = `https://api.github.com/repos/${username}/${repo}`;
        const readmeUrl = `https://api.github.com/repos/${username}/${repo}/readme`;
        const placeholder = document.getElementById('repo-card-placeholder');

        try {
            // Použijeme Promise.all pro paralelní stahování obou zdrojů
            const [repoResponse, readmeResponse] = await Promise.all([
                fetch(repoUrl),
                fetch(readmeUrl)
            ]);

            if (!repoResponse.ok || !readmeResponse.ok) {
                throw new Error(`Network response was not ok.`);
            }

            const repoData = await repoResponse.json();
            const readmeData = await readmeResponse.json();
            
            // Dekódování README z Base64 a konverze na HTML
            const readmeMarkdown = atob(readmeData.content);
            const readmeHTML = marked.parse(readmeMarkdown);

            const lastUpdated = new Date(repoData.updated_at).toLocaleDateString('cs-CZ', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            const repoCardHTML = `
                <div class="repo-header">
                    <h3>
                        <a href="${repoData.html_url}" target="_blank" rel="noopener noreferrer">
                            ${repoData.name}
                        </a>
                    </h3>
                </div>
                <p class="repo-description">${repoData.description || 'No description provided.'}</p>
                <div class="repo-stats">
                    <div class="stat-item">
                        <i class="devicon-star-plain"></i>
                        <span>${repoData.stargazers_count} Stars</span>
                    </div>
                    <div class="stat-item">
                        <i class="devicon-git-plain"></i>
                        <span>${repoData.forks_count} Forks</span>
                    </div>
                    <div class="stat-item">
                        <span style="color: ${getLanguageColor(repoData.language)}; font-size: 1.5rem;">●</span>
                        <span>${repoData.language}</span>
                    </div>
                </div>
                <div class="repo-footer">
                    Last updated: ${lastUpdated}
                </div>
                
                <div class="repo-readme">
                    ${readmeHTML}
                </div>
            `;

            placeholder.innerHTML = repoCardHTML;

        } catch (error) {
            placeholder.innerHTML = `<p>Failed to load project data. Please try again later.</p>`;
            console.error('There was a problem fetching the repo data:', error);
        }
    }

    // Pomocná funkce pro barvu jazyka zůstává stejná
    function getLanguageColor(language) {
        const colors = {
            "JavaScript": "#f1e05a", "HTML": "#e34c26", "CSS": "#563d7c",
            "Python": "#3572A5", "PHP": "#4F5D95", "Vue": "#4FC08D"
        };
        return colors[language] || '#cccccc';
    }

    // Zavolání funkce po načtení stránky
    fetchRepoData();
});
