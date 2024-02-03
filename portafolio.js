import createChicken from "./chicken.js";

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
  let runs = [];
  document.querySelectorAll("nav a").forEach((linkRel) => {
    let sectionId = linkRel.attributes.href.value.replace("/", "");
    let section = document.querySelector(sectionId);
    runs.push(() => {
      if (isElementInViewPort(section)) {
        linkRel.classList.add("active");
      } else {
        linkRel.classList.remove("active");
      }
    });
  });

  document.addEventListener("scroll", (event) => {
    for (let i in runs) {
      runs[i]();
    }
  });
}
//// INIT
initDarkMode();
HeroWebLink();
DarkModeSwitch();
NavMenuBtn();
ScrollBinder();
createChicken();
navMenu();
