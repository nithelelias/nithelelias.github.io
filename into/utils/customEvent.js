// Create a new event, allow bubbling, and provide any data you want to pass to the "detail" property

export function dispatchEvent(eventName, payload) {
  const custom_event = new CustomEvent(eventName, {
    bubbles: true,
    detail: { ...payload },
  });
  document.documentElement.dispatchEvent(custom_event);
}
export function onEventListener(eventName, callback) {
  const callback_handler = (e) => callback(e.detail);
  document.documentElement.addEventListener(eventName, callback_handler, false);
  return () => {
    document.documentElement.removeEventListener(eventName, callback_handler);
  };
}
