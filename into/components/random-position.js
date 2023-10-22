import onHtmlChange from "../utils/onHtmlChange.js";
import random from "../utils/random.js";
function getContainer(element) {
  const selector = element.getAttribute("random-position");
  if (selector) {
    let container = document.querySelector(selector);
    console.log(selector, container);
    if (container) {
      return container;
    }
  }

  return element.parentElement;
}
function update() {
  document.querySelectorAll("[random-position]").forEach((element) => {
    const container = getContainer(element);
    element.removeAttribute("random-position");
    const bounds = container.getBoundingClientRect();
    const elementBounds = element.getBoundingClientRect();

    const x = random(0, bounds.width - elementBounds.width);
    const y = random(0, bounds.height - elementBounds.height);
    console.log(y, bounds.top, bounds.bottom, elementBounds.height);
    element.style.position = "absolute";
    element.style.top = y + "px";
    element.style.left = x + "px";
  });
}
update();
onHtmlChange(() => {
  setTimeout(update, 100);
});
