import Component from "../src/component.js";
function update(container) {
  container.querySelectorAll(".section.repeated").forEach((element, idx) => {
    element.innerHTML = `${idx + 1}`;
    element.style.animationDelay = `calc(var(--snap${idx}) * -1s) !important`;
  });
}
Component("[combination]", (element) => {
  setTimeout(() => update(element), 200);
});
