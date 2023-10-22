import { dispatchEvent, onEventListener } from "../utils/customEvent.js";

import onHtmlChange from "../utils/onHtmlChange.js";
import pointer from "../utils/pointer.js";

export default function onTouch(signal = "signal.name", callback) {
  return onEventListener(signal, callback);
}

function overlapPointElement(point, element) {
  const bound = element.getBoundingClientRect();
  return (
    point.x >= bound.left &&
    point.x <= bound.right &&
    point.y >= bound.top &&
    point.y <= bound.bottom
  );
}
function update() {
  document.querySelectorAll("[on-touch]").forEach((element) => {
    const signal = element.getAttribute("on-touch");
    if (!signal) {
      return;
    }
    const unbind = pointer.onMove(() => {
      if (!element.isConnected) {
        unbind();
        return;
      }

      if (!overlapPointElement(pointer, element)) {
        return;
      }
      dispatchEvent(signal, {
        target: element,
        x: pointer.x,
        y: pointer.y,
      });
    });
  });
}

onHtmlChange(update);
update();
