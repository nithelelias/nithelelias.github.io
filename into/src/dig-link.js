function replaceElement(icon, element) {
  const btn = document.createElement("button");
  btn.innerHTML = `<div class="icon-pack ${icon} ${element.getAttribute(
    "icon-class"
  )} "></div> <span>click aqui</span>`;
  btn.className = "link with-icon  " + element.className;
  btn.setAttribute("href", element.getAttribute("href"));
  element.replaceWith(btn);
}
export default function digLinks(container) {
  container.querySelectorAll("exit-link").forEach((element) => {
    replaceElement("door", element);
  });

  container.querySelectorAll("back-link").forEach((element) => {
    replaceElement("back", element);
  });

  container.querySelectorAll("next-link").forEach((element) => {
    replaceElement("next", element);
  });
  container.querySelectorAll("icon-link").forEach((element) => {
    replaceElement("", element);
  });
}
