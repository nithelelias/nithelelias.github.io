export default function digNavigation(container,{ route, back }) {
  container.querySelectorAll("[href]").forEach((button) => {
    var href = "";
    if (button.attributes.href.value) {
      href = button.attributes.href.value;
      button.removeAttribute("href");
    }
    button.onclick = () => {
      if (href) {
        route(href);
      }
    };
  });
}
