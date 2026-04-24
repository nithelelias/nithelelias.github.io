import { ChatEngine } from "./chatEngine.js";

// ── STATE ─────────────────────────────────────────────────────────────────
const engine = new ChatEngine();
const sessionState = {
  interactionCount: 0,
  isTyping: false
};

// Exponer función para que los links en el HTML puedan disparar mensajes
window.sendChat = (text) => {
  if (sessionState.isTyping) return;
  sendMessage(text);
};

// ── DOM ELEMENTS ──────────────────────────────────────────────────────────
const messagesEl = document.getElementById("chat-messages");
const suggestionsEl = document.getElementById("chat-suggestions");
const inputEl = document.getElementById("chat-input");
const sendBtn = document.getElementById("chat-send");

// ── ANIMATION ENGINE ──────────────────────────────────────────────────────
function scrambleText(element, finalHtml) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = finalHtml;
  const finalText = tempDiv.textContent;

  const maxRotations = 10;
  const state = finalText.split("").map(() => ({
    count: 0,
    done: false
  }));

  const interval = setInterval(() => {
    let allDone = true;
    const currentDisplay = finalText.split("").map((char, i) => {
      if (char === " " || char === "\n") {
        state[i].done = true;
        return char;
      }

      if (state[i].count < maxRotations) {
        state[i].count++;
        allDone = false;
        return chars[Math.floor(Math.random() * chars.length)];
      } else {
        state[i].done = true;
        return finalText[i];
      }
    }).join("");

    element.innerText = currentDisplay;

    if (allDone) {
      clearInterval(interval);
      element.innerHTML = finalHtml;
      adjustFontSize(element); // Ajustar tamaño una vez revelado
      sessionState.isTyping = false;
      document.body.classList.remove("is-responding"); // Quitar efecto cuando termina
    }
  }, 25);
}

// ── UI FUNCTIONS (PAINTING) ───────────────────────────────────────────────
function clearDisplay() {
  messagesEl.innerHTML = "";
}

function adjustFontSize(element) {
  let fontSize = 1.8; // Empezamos en 1.8rem (el valor inicial del CSS)
  const minFontSize = 0.75; // ~12px (suponiendo 16px base)

  element.style.fontSize = `${fontSize}rem`;
  element.style.overflowY = "visible";

  // Reducir tamaño mientras haya overflow y no hayamos llegado al mínimo
  while (element.scrollHeight > element.offsetHeight && fontSize > minFontSize) {
    fontSize -= 0.1;
    element.style.fontSize = `${fontSize}rem`;
  }

  // Si aún sobrepasa al mínimo, activar scroll
  if (element.scrollHeight > element.offsetHeight) {
    element.style.overflowY = "auto";
  }
}

function showInteraction(userText, botHtml) {
  clearDisplay();
  document.body.classList.add("is-responding"); // Activar efecto centrado

  const botMsg = document.createElement("div");
  botMsg.className = "msg bot";
  messagesEl.appendChild(botMsg);

  const userMsg = document.createElement("div");
  userMsg.className = "msg user";
  userMsg.textContent = `> ${userText}`;
  messagesEl.appendChild(userMsg);

  sessionState.isTyping = true;
  scrambleText(botMsg, botHtml);
}

function renderSuggestions(chips = []) {
  suggestionsEl.innerHTML = "";
  chips.forEach(chip => {
    const btn = document.createElement("button");
    btn.className = "suggestion-chip";
    btn.textContent = chip;
    btn.onclick = () => sendMessage(chip);
    suggestionsEl.appendChild(btn);
  });
}

async function sendMessage(text) {
  if (!text.trim() || sessionState.isTyping) return;

  inputEl.value = "";
  sessionState.interactionCount++;

  try {
    const response = engine.getResponse(text);
    showInteraction(text, response.text);
    renderSuggestions(response.suggestions);
  } catch (err) {
    console.error("Error:", err);
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────
async function init() {
  try {
    // Aplicar tema guardado
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme && savedTheme !== 'classic') {
        document.body.classList.add(`theme-${savedTheme}`);
    }

    await engine.init();

    sendBtn.onclick = () => sendMessage(inputEl.value);
    inputEl.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage(inputEl.value);
      }
    };

    // Saludo inicial proactivo
    const welcomeGen = engine.getGenerators().welcome;
    const initial = welcomeGen();
    showInteraction("Iniciando conexión...", initial);
    renderSuggestions(["Habilidades", "Experiencia", "Contacto"]);

  } catch (err) {
    console.error(err);
    messagesEl.innerHTML = "<div class='msg bot'>⚠️ Error de conexión con el núcleo de datos.</div>";
  }
}

init();
