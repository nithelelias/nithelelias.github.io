import { triggerHtmlChange } from "../utils/onHtmlChange.js";
import digIcons from "./dig-icons.js";
import digImports from "./dig-imports.js";
import digLinks from "./dig-link.js";
import digNavigation from "./dig-navigation.js";

function getPage(path) {
  return fetch(`/pages/${path}.html`).then((res) => res.text());
}

export async function buildpage(container, path, navigation) {
  var htmlpage = await getPage(path);
  container.innerHTML = htmlpage;
  await digImports(container);
  //---
  digLinks(container);
  digNavigation(container, navigation);

  digIcons(container);

  triggerHtmlChange();
}
