import { dispatchEvent, onEventListener } from "./customEvent.js";
const EVENT_NAME = "HTML-PAGE:change";

export function triggerHtmlChange() {
  dispatchEvent(EVENT_NAME, { change: true });
}
export default function onHtmlChange(callback) {
  return onEventListener(EVENT_NAME, callback);
}
