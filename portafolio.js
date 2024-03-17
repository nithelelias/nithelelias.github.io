

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const scrollListeners = [];
const onScrollListen = (callback) => {
  scrollListeners.push(callback);
};
class DarkMode {
  static active = false;
  static set(_value) {
    this.active = _value;
    this.update();
  }
  static update() {
    if (this.active) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }
}

function initDarkMode() {
  // dark mode
  DarkMode.active =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      DarkMode.set(event.matches);
    });

  DarkMode.update();
}
//** COMPONENTS */
function Component(selector, iteratorCallback) {
  let elements = document.querySelectorAll(selector);
  if (elements && elements.length > 0) {
    elements.forEach(iteratorCallback);
  }
}
function HeroWebLink() {
  Component("HeroWebLink", (element) => {
    element.outerHTML = ` <a
        href="${element.attributes.href.value}"
        rel="noopener noreferrer"
        role="link"
        target="_blank"
        class="flex hero-web-link"
      >
        <img
          src="${element.attributes.image.value}"
          alt="${element.innerHTML} - icon - Nithel Elias "
          width="24"
          height="auto"          
        />
        ${element.innerHTML}
      </a>`;
  });
}
function SwitchRenderElement(
  element,
  { checked = false, className = "", onChange = () => null, title = "" }
) {
  let parent = element.parentElement;
  element.outerHTML = ` 
    <label class="switch __render-state ${className}">
    <input  type="checkbox" class="switch" ${
      checked ? "checked" : ""
    }  title="${title}"/>
    ${element.innerHTML}
  </label> `;

  const switchEl = parent.querySelector(".switch.__render-state");
  switchEl.classList.remove("__render-state");
  let input = switchEl.querySelector("input");
  input.onchange = () => {
    onChange(input.checked);
  };
}

function DarkModeSwitch() {
  Component("dark-mode-switch", (element) => {
    const onChange = (value) => {
      DarkMode.set(value);
    };
    SwitchRenderElement(element, {
      checked: DarkMode.active,
      title: "Cambiar modo ",
      onChange,
      className: "dark-mode-switch",
    });
  });
}

function NavMenuBtn() {
  let btn = document.querySelector(".mobile-menu-button");
  const nav = document.querySelector("nav");
  btn.onclick = () => {
    btn.classList.toggle("close");
    nav.classList.toggle("open");
  };
}

function ScrollBinder() {
  document.addEventListener("scroll", (event) => {
    let st = document.scrollingElement.scrollTop;
    let maxHeight = document.scrollingElement.scrollHeight - window.innerHeight;
    let percentage = st / maxHeight;
    document.documentElement.style.setProperty("--scroll", percentage);
  });
}

function isElementInViewPort(element) {
  let rect = element.getBoundingClientRect();
  let halfSize = window.innerHeight / 2;
  return rect.top < halfSize && rect.bottom > halfSize;
}
function navMenu() {
  document.querySelectorAll("nav a").forEach((linkRel) => {
    let sectionId = linkRel.attributes.href.value.replace("/", "");
    let section = document.querySelector(sectionId);
    onScrollListen(() => {
      if (isElementInViewPort(section)) {
        linkRel.classList.add("active");
      } else {
        linkRel.classList.remove("active");
      }
    });
  });
}

function stackCards() {
  let cards = document.querySelectorAll(".stack-card");
  let maxZindex = cards.length;
  var maxAngle = 35;
  const CardRender = (card, startIdx) => {
    const thresHold = 100;
    let pressed = true;
    let from = {
      x: 0,
      y: 0,
    };
    let startPosition = {
      x: card.offsetLeft + 0,
      y: card.offsetTop + 0,
    };
    let limits = {
      min: {
        x: startPosition.y - thresHold * 2,
        y: startPosition.y - thresHold * 2,
      },
      max: {
        x: startPosition.x + thresHold * 2,
        y: startPosition.y + thresHold * 2,
      },
    };

    const getClientPosition = (evt) => {
      if (evt.touches) {
        return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
      }
      return {
        x: evt.clientX,
        y: evt.clientY,
      };
    };
    // card.style.zIndex = startIdx;
    const onmove = (evt) => {
      evt.preventDefault();
      // calculate the new cursor position:
      let client = getClientPosition(evt);
      let pos_x = from.x - client.x;
      let pos_y = from.y - client.y;

      from.x = client.x;
      from.y = client.y;
      // set the element's new position:
      card.style.top =
        clamp(card.offsetTop - pos_y, limits.min.y, limits.max.y) + "px";
      card.style.left =
        clamp(card.offsetLeft - pos_x, limits.min.x, limits.max.x) + "px";
    };
    const onrelease = () => {
      document.removeEventListener("mousemove", onmove);
      document.removeEventListener("mouseup", onrelease);
      document.removeEventListener("touchmove", onmove);
      document.removeEventListener("touchend", onrelease);
      let distance = Math.max(
        Math.abs(card.offsetLeft - startPosition.x),
        Math.abs(card.offsetTop - startPosition.y)
      );
      if (distance > thresHold) {
        card.parentElement.insertBefore(card, card.parentElement.firstChild);
      }
      card.classList.remove("draggin");
      setTimeout(() => {
        card.style.top = startPosition.y;
        card.style.left = startPosition.x;
      }, 100);
    };
    const onPress = (evt) => {
      evt.preventDefault();
      pressed = true;
      let client = getClientPosition(evt);
      card.classList.add("draggin");
      from.x = client.x;
      from.y = client.y;

      if (window.innerWidth > 700) {
        document.addEventListener("mousemove", onmove);
        document.addEventListener("mouseup", onrelease);
      } else {
        document.addEventListener("touchmove", onmove);
        document.addEventListener("touchend", onrelease);
      }
    };
    card.addEventListener("mousedown", onPress, false);
    card.addEventListener("touchstart", onPress, false);

    const loop = () => {
      let angle = clamp(
        ((card.offsetLeft - startPosition.x) / (thresHold * 3)) * maxAngle,
        -maxAngle,
        maxAngle
      );
      card.style.transform = `rotate(${angle}deg)`;
      requestAnimationFrame(loop);
    };
    loop();
  };

  cards.forEach(CardRender);
}
function spaceInvaders() {
  let count = 0;
  let container = null;
  const punchSound = new Audio("sounds/punch.mp3");
  const killTheChickens = () => {
    document.querySelectorAll(".chicken").forEach((_hen) => {
      _hen.kill();
    });
    document.querySelectorAll(".egg").forEach((_egg) => {
      _egg.kill();
    });
  };
  const fadeInContainer = () => {
    container = document.createElement("div");
    container.classList.add("game-container");
    container.innerHTML=`<div id="space-game"></div>`
    document.body.appendChild(container);
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      container.style.opacity = 1;
    }, 300);
    return new Promise((resolve) => setTimeout(resolve, 1100));
  };
  const start = () => {
    if (window.gameStarted) {
      fadeInContainer().then(() => {
        window.playGame();
      });
      return;
    }
    window.gameStarted = true;
    window.endGame = () => {
      document.body.style.overflow = "inherit";
      count = 0;
      container.remove();
    };
    killTheChickens();
    fadeInContainer().then(() => {
      var s = document.createElement("script");
      s.src = "space.js";
      document.body.appendChild(s);
    });

    //
  };
  let trigger = document.querySelector(".space-trigger");
  trigger.onclick = (e) => {
    e.preventDefault();
    punchSound.currentTime = 0;
    punchSound.play();
    if (count > 3) {
      return false;
    }
    count++;

    console.log(
      `%c ${count} ${count === 4 ? "🛸👾🤖" : ""}`,
      "font-size:" + 12 * count + "px;color:blue;"
    );
    if (count > 3) {
      start();
    }
    return false;
  };
}

function infiniteScrollLateralSkills() {
  const list = document.querySelector("#skill-list");
  list.innerHTML += list.innerHTML;
}

function generateItchWigets() {
  const states = {
    visible: false,
    rendered: false,
  };
  const gameSection = document.getElementById("games");
  const widgetContentList = getItchWidgetFrames();
  const render = () => {
    if (states.rendered) return;
    states.rendered = true;
    const gameSectionContainer = gameSection.querySelector(".container");
    gameSectionContainer.innerHTML = widgetContentList
      .map((widgetHtml) => {
        return `<div class="widget-container">${widgetHtml}</div>`;
      })
      .join("");
  };

  onScrollListen(() => {
    if (!states.visible && isElementInViewPort(gameSection)) {
      states.visible = true;
      render();
    }
  });
}
//////
document.addEventListener("scroll", (event) => {
  for (let i in scrollListeners) {
    scrollListeners[i]();
  }
});
//// INIT
initDarkMode();
HeroWebLink();
DarkModeSwitch();
NavMenuBtn();
ScrollBinder();
infiniteScrollLateralSkills();

navMenu();
stackCards();
spaceInvaders(); 
