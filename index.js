/**
 * Neobrutalist Game HUD Portfolio
 */

async function initPortfolio() {
    try {
        const response = await fetch('content.json');
        if (!response.ok) throw new Error('Failed to load content');
        const data = await response.json();
        
        const app = document.getElementById('app');
        app.innerHTML = ''; // Clear for fresh start
        
        renderHero(app, data.personal_info, data.contact);
        renderExperience(app, data.experience);
        renderSkills(app, data.skills);
        renderEducation(app, data.education);
        renderContact(app, data.contact);
        
        renderPaletteSelector();
        renderChatButton();
        applySavedTheme();
        
    } catch (error) {
        console.error('Error initializing portfolio:', error);
        document.getElementById('app').innerHTML = `<div class="error">LOAD ERROR: SYSTEM MALFUNCTION</div>`;
    }
}

function renderChatButton() {
    const container = document.createElement('div');
    container.className = 'chat-container';
    container.innerHTML = `
        <a href="./chat/" class="chat-trigger" title="Hablar con mi Asistente IA">
            🤖
        </a>
    `;
    document.body.prepend(container);
}

const THEMES = [
    { id: 'classic', name: 'CLASSIC', color: '#ffde00' },
    { id: 'cyber', name: 'CYBER', color: '#00ff41' },
    { id: 'vapor', name: 'VAPOR', color: '#ff71ce' },
    { id: 'gameboy', name: 'GBOY', color: '#9bbc0f' },
    { id: 'noir', name: 'NOIR', color: '#000000' },
    { id: 'light', name: 'LIGHT', color: '#ffffff' }
];


function renderPaletteSelector() {
    const container = document.createElement('div');
    container.className = 'palette-container';
    container.innerHTML = `
        <div class="palette-selector">
            <h4>SKIN SELECTOR</h4>
            <div class="palette-options">
                ${THEMES.map(t => `
                    <div class="palette-btn" 
                         data-theme="${t.id}" 
                         style="background: ${t.color}" 
                         title="${t.name}"></div>
                `).join('')}
            </div>
        </div>
        <div class="palette-trigger" title="Cambiar Skin">
            🎨
        </div>
    `;
    document.body.prepend(container);

    const trigger = container.querySelector('.palette-trigger');
    trigger.onclick = (e) => {
        e.stopPropagation();
        container.classList.toggle('open');
    };

    // Close when clicking outside
    document.addEventListener('click', () => {
        container.classList.remove('open');
    });

    container.querySelectorAll('.palette-btn').forEach(btn => {
        btn.onclick = () => setTheme(btn.dataset.theme);
    });
}

function setTheme(themeId) {
    // Remove all theme classes
    THEMES.forEach(t => document.body.classList.remove(`theme-${t.id}`));
    
    // Add new theme class (except classic which is default)
    if (themeId !== 'classic') {
        document.body.classList.add(`theme-${themeId}`);
    }

    // Update active state in selector
    document.querySelectorAll('.palette-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeId);
    });

    // Save to LocalStorage
    localStorage.setItem('portfolio-theme', themeId);
}

function applySavedTheme() {
    const saved = localStorage.getItem('portfolio-theme') || 'classic';
    setTheme(saved);
}

function renderHero(parent, info, contact) {
    const hero = document.createElement('section');
    hero.className = 'hero';
    hero.innerHTML = `
        <div class="hero-container">
            <div class="hero-portrait">
                <img src="images/nit-trans.png" alt="Nithel Elias Portrait" />
            </div>
            <div class="hero-text">
                <div class="badge">PLAYER</div>
                <h1>${info.full_name}</h1>
                <p>> ${info.about}</p>
                <div class="cta-group">
                    <a href="#experience" class="btn">QUESTS</a>
                    <a href="${contact.itchio}" target="_blank" class="btn" style="background: var(--accent-1); color: var(--text-on-accent);">GAMES</a>
                    <a href="${contact.github}" target="_blank" class="btn">GITHUB</a>
                </div>
            </div>
        </div>
    `;

    parent.appendChild(hero);
}


function renderExperience(parent, experience) {
    const section = document.createElement('section');
    section.id = 'experience';
    section.innerHTML = `
        <h2>QUEST LOG</h2>
        <div class="experience-grid">
            ${experience.map(exp => `
                <div class="exp-card">
                    <div class="exp-header">
                        <h3>${exp.company}</h3>
                        <span class="exp-period">${exp.period}</span>
                    </div>
                    <p>ROLE: ${exp.role}</p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">${exp.description}</p>
                </div>
            `).join('')}
        </div>
    `;
    parent.appendChild(section);
}

function renderSkills(parent, skills) {
    if (!skills || skills.length === 0) return;

    const section = document.createElement('section');
    section.id = 'skills';
    
    // Group skills by category (ensure category exists)
    const categories = [...new Set(skills.map(s => s.category || 'Otros'))];
    let activeCategory = categories[0];

    const renderContent = () => {
        const filteredSkills = skills.filter(s => (s.category || 'Otros') === activeCategory);
        
        section.innerHTML = `
            <h2>SKILLS</h2>
            <div class="skills-explorer">
                <div class="skills-sidebar">
                    ${categories.map(cat => `
                        <div class="folder ${cat === activeCategory ? 'active' : ''}" data-category="${cat}">
                            <span class="icon">📁</span>
                            <span class="name">${cat.toUpperCase()}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="skills-main">
                    <div class="directory-path">C:\\SKILLS\\${activeCategory.toUpperCase()}></div>
                    <div class="skills-grid">
                        ${filteredSkills.map(skill => `
                            <div class="skill-file">
                                <span class="file-icon">📄</span>
                                <span class="file-name">${skill.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Add events
        section.querySelectorAll('.folder').forEach(folder => {
            folder.onclick = () => {
                activeCategory = folder.dataset.category;
                renderContent();
            };
        });
    };

    renderContent();
    parent.appendChild(section);
}


function renderEducation(parent, education) {
    const section = document.createElement('section');
    section.id = 'education';
    section.innerHTML = `
        <h2>ACHIEVEMENTS</h2>
        <div class="experience-grid">
            ${education.map(edu => `
                <div class="exp-card">
                    <h3>${edu.degree}</h3>
                    <p>${edu.institution}</p>
                </div>
            `).join('')}
        </div>
    `;
    parent.appendChild(section);
}

function renderContact(parent, contact) {
    const section = document.createElement('section');
    section.id = 'contact';
    section.innerHTML = `
        <h2 style="background: var(--accent-1);">COMM-LINK</h2>
        <p>¿ESTÁS LISTO PARA INICIAR UNA NUEVA PARTIDA?</p>
        <div class="cta-group">
            <a href="mailto:${contact.email}" class="btn">SEND MSG</a>
            <a href="${contact.linkedin}" target="_blank" class="btn">LINKEDIN</a>
            <a href="${contact.itchio}" target="_blank" class="btn" style="background: var(--accent-1); color: var(--text-on-accent);">ITCH.IO</a>
        </div>
    `;
    parent.appendChild(section);
}



document.addEventListener('DOMContentLoaded', initPortfolio);
