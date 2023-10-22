import onHtmlChange from "../utils/onHtmlChange.js";
import onTouch from "./on-touch.js";
import random from "../utils/random.js";

function getLupa() {
  return document.querySelector("#lupa");
}
onTouch("light", ({ target }) => {
  target.remove();
  const lupa = getLupa();
  lupa.level = (lupa.level || 1) + 1;
  var size = 50 + lupa.level * 25;
  lupa.style.width = size + "px";
  lupa.style.height = size + "px";
  lupa.style.marginLeft = -size / 2 + "px";
  lupa.style.marginTop = -size / 2 + "px";
});
function update() {
  if (!document.querySelector("#dark")) {
    return;
  } 
  const p = document.querySelector(".paragraph"); 
  const words = p.innerText.split(" ");
  const long = words.length;
  const cut = random(long * 0.2, long * 0.95);

  p.innerHTML =
    words.slice(0, cut).join(" ") +
    `. <span class="text-accent" >He otra vez por aqui?  te equivocaste de link creo </span>` +
    words.slice(cut, long).join(" ");
}
onHtmlChange(() => {
  setTimeout(update, 100);
});
