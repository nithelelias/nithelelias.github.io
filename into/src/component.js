import onHtmlChange from "../utils/onHtmlChange.js";

export default function Component(selector, callback) {
  const update = () => {
    document.querySelectorAll(selector).forEach((element) => {
      callback(element);
    });
  };

  onHtmlChange(update);
  update();
}
