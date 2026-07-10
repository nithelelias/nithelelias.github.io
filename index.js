/**
 * Professional Portfolio — Clean AI-chat style
 * Features: i18n (es/en), day/night toggle, global search with debounce + highlight + scroll
 */

let contentData = null;
let currentLang = localStorage.getItem('portfolio-lang') || 'es';
let currentTheme = localStorage.getItem('portfolio-theme') || 'light';
let searchQuery = '';
let searchTimer = null;
let lastHighlightCount = 0;

const DEBOUNCE_MS = 300;

// ─── Init ───────────────────────────────────────────────────────────────────

async function init() {
  try {
    const res = await fetch('content.json');
    if (!res.ok) throw new Error('Failed to load content');
    contentData = await res.json();
  } catch (e) {
    console.error('Error loading content:', e);
    document.getElementById('app').innerHTML =
      '<div class="error">Failed to load content.</div>';
    return;
  }

  applyTheme(currentTheme);
  render();
  bindTopbar();
  bindGlobalSearch();
}

function render() {
  const t = contentData[currentLang];
  const app = document.getElementById('app');
  app.innerHTML = '';

  document.documentElement.lang = currentLang;
  document.getElementById('lang-toggle').textContent = t.nav.lang_label;
  document.getElementById('footer-text').textContent =
    `\u00A9 ${new Date().getFullYear()} Nithel Elias \u2014 ${t.personal_info.location}`;

  renderHero(app, t.personal_info, t.contact);
  renderExperience(app, t.sections.experience, t.experience);
  renderSkills(app, t.sections.skills, t.skills);
  renderEducation(app, t.sections.education, t.education);
  renderContact(app, t.sections.contact, t.contact);

  if (searchQuery.length >= 2) {
    highlightAndScroll(searchQuery);
  }
}

// ─── Topbar Controls ────────────────────────────────────────────────────────

function bindTopbar() {
  document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('portfolio-lang', currentLang);
    clearSearch();
    render();
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('portfolio-theme', currentTheme);
    applyTheme(currentTheme);
  });
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
}

// ─── Global Search (keyboard capture + debounce) ────────────────────────────

function bindGlobalSearch() {
  const display = document.getElementById('search-display');
  const placeholder = document.getElementById('search-placeholder');
  const matchCount = document.getElementById('search-match-count');
  const clearBtn = document.getElementById('search-clear');
  const searchBar = document.getElementById('search-bar');
  const searchToggle = document.getElementById('search-toggle');

  function openSearch() {
    searchBar.classList.add('open');
    searchToggle.classList.add('hidden');
    searchBar.focus();
  }

  function closeSearch() {
    clearSearch();
    searchBar.classList.remove('open');
    searchToggle.classList.remove('hidden');
  }

  searchToggle.addEventListener('click', openSearch);

  document.addEventListener('mousedown', (e) => {
    if (searchBar.classList.contains('open') && !searchBar.contains(e.target) && e.target !== searchToggle) {
      closeSearch();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (searchBar.classList.contains('open')) {
        closeSearch();
      }
      return;
    }

    if (!searchBar.classList.contains('open')) return;

    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      searchQuery = searchQuery.slice(0, -1);
      onSearchUpdate();
      return;
    }

    if (e.key === 'Enter') return;

    if (e.key.length === 1 && e.key !== ' ') {
      e.preventDefault();
      searchQuery += e.key;
      onSearchUpdate();
    }
  });

  clearBtn.addEventListener('click', () => {
    clearSearch();
  });

  function onSearchUpdate() {
    const q = searchQuery;
    display.textContent = q;
    placeholder.classList.toggle('hidden', q.length > 0);
    clearBtn.classList.toggle('hidden', q.length === 0);
    searchBar.classList.toggle('active', q.length > 0);

    clearTimeout(searchTimer);

    if (q.length >= 2) {
      searchTimer = setTimeout(() => {
        const count = highlightAndScroll(q);
        lastHighlightCount = count;
        updateMatchCount(count);
      }, DEBOUNCE_MS);
    } else {
      clearHighlights();
      matchCount.classList.add('hidden');
      lastHighlightCount = 0;
    }
  }

  function updateMatchCount(count) {
    if (count > 0) {
      matchCount.textContent = `${count} match${count !== 1 ? 'es' : ''}`;
      matchCount.classList.remove('hidden');
    } else {
      matchCount.textContent = 'no matches';
      matchCount.classList.remove('hidden');
    }
  }
}

function clearSearch() {
  const display = document.getElementById('search-display');
  const placeholder = document.getElementById('search-placeholder');
  const clearBtn = document.getElementById('search-clear');
  const matchCount = document.getElementById('search-match-count');
  const searchBar = document.getElementById('search-bar');

  searchQuery = '';
  clearTimeout(searchTimer);
  display.textContent = '';
  placeholder.classList.remove('hidden');
  clearBtn.classList.add('hidden');
  matchCount.classList.add('hidden');
  searchBar.classList.remove('active');
  clearHighlights();
  lastHighlightCount = 0;
}

// ─── Highlight + Scroll ─────────────────────────────────────────────────────

function highlightAndScroll(query) {
  clearHighlights();

  const app = document.getElementById('app');
  const walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, null, false);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const nodesToHighlight = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (regex.test(node.textContent)) {
      regex.lastIndex = 0;
      nodesToHighlight.push(node);
    }
  }

  let firstMatch = null;
  let count = 0;

  nodesToHighlight.forEach((textNode) => {
    const span = document.createElement('span');
    span.innerHTML = textNode.textContent.replace(
      regex,
      (match) => {
        count++;
        return `<mark class="search-hl">${match}</mark>`;
      }
    );
    textNode.parentNode.replaceChild(span, textNode);
    span.dataset.searchWrapper = 'true';

    const mark = span.querySelector('.search-hl');
    if (mark && !firstMatch) firstMatch = mark;
  });

  if (firstMatch) {
    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return count;
}

function clearHighlights() {
  const app = document.getElementById('app');
  app.querySelectorAll('[data-search-wrapper]').forEach((wrapper) => {
    const text = document.createTextNode(wrapper.textContent);
    wrapper.parentNode.replaceChild(text, wrapper);
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Renderers ──────────────────────────────────────────────────────────────

function renderHero(parent, info, contact) {
  const locText = currentLang === 'es'
    ? `${info.location} \u2014 ${info.experience_years} an\u00f1os de experiencia`
    : `${info.location} \u2014 ${info.experience_years} years of experience`;
  const expBtnText = currentLang === 'es' ? 'Ver Experiencia' : 'View Experience';

  const section = document.createElement('section');
  section.className = 'hero';
  section.innerHTML = `
    <div class="hero-inner">
      <div class="hero-portrait">
        <img src="images/nit-trans.png" alt="${info.full_name}" />
      </div>
      <div class="hero-text">
        <span class="hero-badge">${info.specialization}</span>
        <h1>${info.full_name}</h1>
        <p class="hero-location">${locText}</p>
        <p class="hero-desc">${info.description}</p>
        <p class="hero-about">${info.about}</p>
        <div class="hero-actions">
          <a href="#experience" class="btn btn-primary">${expBtnText}</a>
          <a href="${contact.github}" target="_blank" class="btn btn-ghost">GitHub</a>
        </div>
      </div>
    </div>
  `;
  parent.appendChild(section);
}

function renderExperience(parent, title, experience) {
  const section = document.createElement('section');
  section.id = 'experience';
  section.className = 'card';
  section.innerHTML = `
    <h2>${title}</h2>
    <div class="timeline">
      ${experience.map(exp => `
        <div class="timeline-item">
          <div class="timeline-header">
            <h3>${exp.company}</h3>
            <span class="timeline-period">${exp.period}</span>
          </div>
          <p class="timeline-role">${exp.role}</p>
          <p class="timeline-desc">${exp.description}</p>
        </div>
      `).join('')}
    </div>
  `;
  parent.appendChild(section);
}

function renderSkills(parent, title, skills) {
  if (!skills || skills.length === 0) return;

  const categories = [...new Set(skills.map(s => s.category))];
  let activeCategory = categories[0];

  const section = document.createElement('section');
  section.id = 'skills';
  section.className = 'card';

  const renderContent = () => {
    const filtered = skills.filter(s => s.category === activeCategory);

    section.innerHTML = `
      <h2>${title}</h2>
      <div class="skills-tabs">
        ${categories.map(cat => `
          <button class="skills-tab ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">${cat}</button>
        `).join('')}
      </div>
      <div class="skills-grid">
        ${filtered.map(skill => `
          <div class="skill-item">
            <span class="skill-name">${skill.name}</span>
            <div class="skill-bar">
              <div class="skill-fill" style="width: ${skill.level * 20}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    section.querySelectorAll('.skills-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        activeCategory = tab.dataset.cat;
        renderContent();
      });
    });
  };

  renderContent();
  parent.appendChild(section);
}

function renderEducation(parent, title, education) {
  const section = document.createElement('section');
  section.id = 'education';
  section.className = 'card';
  section.innerHTML = `
    <h2>${title}</h2>
    <div class="edu-list">
      ${education.map(edu => `
        <div class="edu-item">
          <h3>${edu.degree}</h3>
          <p>${edu.institution}</p>
        </div>
      `).join('')}
    </div>
  `;
  parent.appendChild(section);
}

function renderContact(parent, title, contact) {
  const section = document.createElement('section');
  section.id = 'contact';
  section.className = 'card contact-card';
  section.innerHTML = `
    <h2>${title}</h2>
    <p class="contact-cta">${contact.cta_sub}</p>
    <div class="contact-links">
      <a href="mailto:${contact.email}" class="btn btn-primary">${contact.cta}</a>
      <a href="${contact.linkedin}" target="_blank" class="btn btn-ghost">LinkedIn</a>
      <a href="${contact.github}" target="_blank" class="btn btn-ghost">GitHub</a>
      <a href="${contact.itchio}" target="_blank" class="btn btn-ghost">itch.io</a>
    </div>
  `;
  parent.appendChild(section);
}

// ─── Boot ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', init);
