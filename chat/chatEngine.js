/**
 * ChatEngine.js - Lógica de procesamiento del chatbot
 * Se encarga de la carga de datos, coincidencia de intenciones y generación de respuestas.
 */

export class ChatEngine {
  constructor() {
    this.content = null;
    this.intents = null;
    this.startTime = Date.now();
  }

  async init() {
    const [contentRes, intentsRes] = await Promise.all([
      fetch("../content.json"),
      fetch("responses.json")
    ]);

    if (!contentRes.ok || !intentsRes.ok) throw new Error("Error al cargar los datos");

    this.content = await contentRes.json();
    const data = await intentsRes.json();
    this.intents = data.intents;
  }

  normalize(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .trim();
  }

  getYearsSince(year) {
    return new Date().getFullYear() - year;
  }

  getDuration() {
    const diff = Date.now() - this.startTime;
    const s = Math.floor((diff / 1000) % 60);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    let p = [];
    if (h > 0) p.push(`${h} ${h === 1 ? 'hora' : 'horas'}`);
    if (m > 0) p.push(`${m} ${m === 1 ? 'minuto' : 'minutos'}`);
    if (s > 0 || p.length === 0) p.push(`${s} ${s === 1 ? 'segundo' : 'segundos'}`);
    return p.join(" y ");
  }

  matchIntents(userInput) {
    const normInput = this.normalize(userInput);
    const tokens = normInput.split(/\s+/);
    let matched = [];

    for (const intent of this.intents) {
      if (intent.id === "fallback") continue;

      let keywordScore = 0;
      for (const kw of intent.keywords) {
        const kwNorm = this.normalize(kw);
        if (kwNorm.includes(" ")) {
          if (normInput.includes(kwNorm)) keywordScore += 3;
        } else {
          // Coincidencia exacta
          if (tokens.includes(kwNorm)) {
            keywordScore += (kwNorm.length > 2 || ["hi", "ey"].includes(kwNorm)) ? 2 : 1;
          }
          // Coincidencia parcial (letras parecidas)
          else if (normInput.includes(kwNorm) || kwNorm.includes(normInput)) {
            if (normInput.length > 3) keywordScore += 0.5;
          }
        }
      }

      if (keywordScore > 0) {
        const finalScore = keywordScore + (intent.priority || 0);
        matched.push({ intent, score: finalScore });
      }
    }

    if (matched.length === 0) return [this.intents.find(i => i.id === "fallback")];

    matched.sort((a, b) => b.score - a.score);

    // Si el mejor score es bajo (< 4), buscamos sugerencias "parecidas"
    if (matched[0].score < 4) {
      const fallbackIntent = this.intents.find(i => i.id === "fallback");
      // Buscar los 5 mejores intents basados en cualquier coincidencia parcial
      const potentialSugg = matched
        .slice(0, 5)
        .flatMap(m => m.intent.suggestions);

      return [{
        ...fallbackIntent,
        suggestions: [...new Set(potentialSugg)].slice(0, 5)
      }];
    }

    const topScore = matched[0].score;
    return matched
      .filter(m => m.score >= topScore - 2 && m.score >= 5)
      .map(m => m.intent);
  }

  getGenerators() {
    return {
      greeting: () => {
        const exp = this.getYearsSince(this.content.personal_info.experience_start_year);
        const greets = [
          `¡Hola! 👋 Soy <strong>${this.content.personal_info.name}</strong>, con ${exp} años de experiencia. ¿Qué quieres saber?`,
          `¡Ey! ¿Qué tal? Soy <strong>${this.content.personal_info.name}</strong>, un gusto saludarte.`,
          `¡Saludos! Soy <strong>${this.content.personal_info.name}</strong>. ¿En qué puedo ayudarte hoy?`
        ];
        return greets[Math.floor(Math.random() * greets.length)];
      },
      name: () => `Me llamo <strong>${this.content.personal_info.full_name}</strong>, pero puedes decirme <strong>${this.content.personal_info.name}</strong>.`,
      about: () => this.content.profile.bio.join("<br><br>"),
      skills: () => {
        const allSkills = this.content.skills.map(s => `<strong>${s.name}</strong>`).join(" &nbsp;·&nbsp; ");
        return `Mis habilidades y tecnologías:<br><br>${allSkills}`;
      },
      frontend: () => {
        const fe = this.content.skills.filter(s => ["Javascript", "HTML", "CSS", "React", "Angular"].includes(s.name));
        return `Especializado en <strong>Frontend</strong> 🚀<br><br>` +
          fe.map(s => `<strong>${s.name}</strong>`).join(" &nbsp;·&nbsp; ") +
          `<br><br>${this.content.experience[0].description}`;
      },
      backend: () => {
        return `En el <strong>Backend</strong> domino <strong>PHP</strong> y <strong>NodeJs</strong>. También tengo experiencia con <strong>Java Swing</strong> y la creación de scripts de automatización en <strong>Python</strong>.`;
      },
      fullstack: () => {
        return `Soy un desarrollador <strong>Full Stack</strong> con experiencia en arquitecturas complejas. He gestionado <strong>monorepos</strong> y desarrollado proyectos donde el frontend (Angular) y el backend (PHP) dependen estrechamente uno del otro.`;
      },
      database: () => {
        return `Tengo experiencia administrando <strong>Bases de Datos</strong> (SQL, PostGress) y he trabajado específicamente con datos <strong>GEOEspaciales (GIS)</strong> implementando soluciones personalizadas.`;
      },
      experience: () => {
        const exp = this.getYearsSince(this.content.personal_info.experience_start_year);
        return `Tengo <strong>${exp} años</strong> de trayectoria:<br><br>` +
          this.content.experience.map(e => `<strong>${e.company}</strong> — ${e.role}<br>${e.description}`).join("<br><br>");
      },
      games: () => {
        const gs = this.content.skills.filter(s => ["PhaserJs", "Godot", "Unity"].includes(s.name));
        return `Amo los videojuegos web 🎮 Engines: ${gs.map(s => `<strong>${s.name}</strong>`).join(", ")}<br><br>Ver en <a href="${this.content.contact.itchio}" target="_blank">Itch.io</a> 👾`;
      },
      contact: () => {
        const c = this.content.contact;
        return `Escríbeme aquí:<br><br>📧 <a href="mailto:${c.email}">${c.email}</a><br>💼 <a href="${c.linkedin}" target="_blank">LinkedIn</a><br>💻 <a href="${c.github}" target="_blank">GitHub</a>`;
      },
      personal: (input) => {
        const norm = this.normalize(input);
        const age = this.getYearsSince(this.content.personal_info.born_year);
        const exp = this.getYearsSince(this.content.personal_info.experience_start_year);
        const hasAge = norm.includes("edad");
        const hasExp = ["anos", "años", "experiencia", "programando"].some(k => norm.includes(k));
        const hasOrigin = ["naci", "donde", "barranquilla", "colombia", "origen", "vives"].some(k => norm.includes(k));
        let p = [];
        if (hasAge || (!hasExp && !hasOrigin)) p.push(`Tengo <strong>${age} años</strong>.`);
        if (hasExp) p.push(`Llevo <strong>${exp} años</strong> programando.`);
        if (hasOrigin) p.push(`Nací en <strong>${this.content.personal_info.birthplace}</strong> 🇨🇴.`);
        return p.join(" ");
      },
      time: () => `La hora actual es <strong>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.`,
      date: () => `Hoy es <strong>${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.`,
      duration: () => `Llevamos conversando <strong>${this.getDuration()}</strong>.`,
      bot: () => `Soy un asistente virtual del portafolio de ${this.content.personal_info.name}.`,
      education: () => {
        return `Mi formación académica incluye:<br><br>` +
          this.content.education.map(e => `<strong>${e.degree}</strong> en ${e.institution}`).join("<br>");
      },
      fallback: () => {
        return `No estoy seguro de haber entendido 🤔<br>Quizás quieras preguntar sobre:<br>
        <a href="javascript:sendChat('Habilidades')">Habilidades</a>, 
        <a href="javascript:sendChat('Experiencia')">Experiencia</a> o 
        <a href="javascript:sendChat('Contacto')">Contacto</a>.`;
      },
    };
  }

  getResponse(userInput) {
    const matchedIntents = this.matchIntents(userInput);
    let intentsToRespond = matchedIntents;

    // Filtro inteligente de saludo
    if (intentsToRespond.length > 1) {
      const hasGreeting = intentsToRespond.some(i => i.id === "greeting");
      const userSaluted = ["hola", "hey", "buenos", "buenas"].some(s => this.normalize(userInput).includes(s));
      if (hasGreeting && !userSaluted) {
        intentsToRespond = intentsToRespond.filter(i => i.id !== "greeting");
      }
    }

    const uniqueIntents = Array.from(new Set(intentsToRespond.map(i => i.id)))
      .map(id => intentsToRespond.find(i => i.id === id));

    const gens = this.getGenerators();
    const responses = uniqueIntents.map(i => (gens[i.id] || gens.fallback)(userInput));

    return {
      text: responses.join("<br><br>"),
      suggestions: [...new Set(uniqueIntents.flatMap(i => i.suggestions))].slice(0, 3),
      intents: uniqueIntents.map(i => i.id)
    };
  }
}
