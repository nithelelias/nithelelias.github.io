import Component from "../src/component.js";

function update(container) {
  container.querySelectorAll(".cell").forEach((element) => {
    element.onclick = () => {
      element.classList.add("hidden");
    };
  });
}
Component("[green] ", (element) => {
  if (!element.isConnected) {
    return;
  }
  setTimeout(() => update(element), 199);
});
