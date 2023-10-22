import generateLoremIpsum from "../utils/generateLoremIpsum.js";
import onHtmlChange from "../utils/onHtmlChange.js";
const attr_selector = "lorem-ipsum";
function update() {
  document.querySelectorAll(`[${attr_selector}]`).forEach((element) => {
    const total = element.getAttribute(attr_selector) || 16;
    element.removeAttribute(attr_selector);
    element.innerText = generateLoremIpsum(total);
  });
}
update();
onHtmlChange(() => {
  update()
});
