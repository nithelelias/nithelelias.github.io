import Component from "../src/component.js";

Component("[repeat]", (element) => { 
  const totaliterations = element.getAttribute("repeat");
  if (!totaliterations) {
    return;
  }
  element.removeAttribute("repeat"); 
  // clone element n times
  for (let i = 1; i < totaliterations; i++) {
    const cloned = element.cloneNode(true);
    element.parentElement.appendChild(cloned);
  }
});
