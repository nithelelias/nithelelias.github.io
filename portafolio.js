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
  var lastScrollTop = 0;
  document.addEventListener("scroll", (event) => {
    let st = document.scrollingElement.scrollTop;
    let maxHeight = document.scrollingElement.scrollHeight - window.innerHeight;
    let percentage = st / maxHeight;

    lastScrollTop = st;
    document.documentElement.style.setProperty("--scroll", percentage);
  });
}
function addEggAt(x, y) {
  const container = document.body;
  const div = document.createElement("div");

  div.style.position = "absolute";
  div.style.width = ".5rem";
  div.style.height = ".8rem";
  div.style.background = "white";
  div.style.borderRadius = "50%";
  div.style.border = "solid #111";
  div.style.left = x + "px";
  div.style.top = y + "px";
  div.style.cursor = "pointer";
  div.title = "is an egg";
  container.appendChild(div);
  var active = true;

  var lastTime = Date.now(),
    timeStart = Date.now();

  const shake = () => {
    let t = Date.now() - lastTime;

    if (t < 1000) {
      return;
    }

    lastTime = Date.now();
    var ang = random(-5, 5);
    div.style.transform = `rotate(${ang}deg)`;
    div.title = "is an egg - and is moving";
  };
  const born = () => {
    let t = Date.now() - timeStart;

    if (t < 10000) {
      return;
    }

    createChicken(x, y);
    div.remove();
    active = false;
  };
  const loop = () => {
    if (!active) {
      return;
    }
    shake();
    born();

    requestAnimationFrame(loop);
  };
  loop();
}
function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
var chickens = 0;
function createChicken(_x, _y) {
  chickens++;
  const maxPath = random(10, parseInt(document.body.clientHeight * 0.7));
  var active = true;
  var x =
      _x ||
      random(document.body.clientWidth * 0.4, document.body.clientWidth * 0.8),
    y =
      _y ||
      random(
        document.body.clientHeight * 0.4,
        document.body.clientHeight * 0.8
      ),
    vel = { x: 0, y: 0 };
  var lastTime = Date.now();
  var lastTimePutEgg = Date.now();
  var timeoutPutEgg = 3000;
  var delayMove = 100;
  var hen = document.createElement("img");
  hen.classList.add("chicken");
  hen.src = "images/hen.png";
  hen.alt = "es una gallina";
  hen.title = "Ko.";

  hen.style.filter = `hue-rotate(${random(0, chickens * 10)}deg)`;
  hen.onclick = () => {
    if (hen.src === "none") {
      return;
    }
    if (!active) {
      hen.src = "none";
      hen.alt = "killed";
      hen.style.width="4rem"
      setTimeout(() => {
        hen.remove();
      }, 5000);

      return;
    }
    alert("KO KO!");
    active = false;
  };
  document.body.appendChild(hen);

  const move = () => {
    hen.style.transform = `translate(${x}px,${y}px)`;
  };
  const limitMove = () => {
    if (x < 1) {
      x = 2;
    }
    if (x > document.body.clientWidth) {
      x = document.body.clientWidth - 1;
    }
    if (y < 1) {
      y = 2;
    }
    if (y > document.body.clientHeight) {
      y = document.body.clientHeight - 1;
    }
  };
  const randomMove = () => {
    if (vel.x === 0 && vel.y === 0) {
      if (random(0, 10) > 5) {
        vel.x = random(-maxPath, maxPath);
      } else {
        vel.y = random(-maxPath, maxPath);
      }
    }
  };
  const doMove = () => {
    let dirx = clamp(vel.x, -1, 1);
    let diry = clamp(vel.y, -1, 1);

    x += dirx;
    y += diry;
    vel.x -= dirx;
    vel.y -= diry;
  };
  const putEgg = () => {
    let t = Date.now() - lastTimePutEgg;
    if (t < timeoutPutEgg) {
      return;
    }
    timeoutPutEgg = random(3000, 19000);
    lastTimePutEgg = Date.now();
    addEggAt(x, y);
  };
  const run = () => {
    let t = Date.now() - lastTime;
    if (t < delayMove) {
      return;
    }
    lastTime = Date.now();
    randomMove();
    doMove();
    limitMove();
    putEgg();
  };
  const loop = () => {
    if (!active) {
      return;
    }
    run();
    move();
    requestAnimationFrame(loop);
  };
  loop();
}
//// INIT
initDarkMode();
HeroWebLink();
DarkModeSwitch();

NavMenuBtn();
ScrollBinder();
createChicken();
