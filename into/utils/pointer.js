import { dispatchEvent, onEventListener } from "./customEvent.js";
const event_move = "pointer-move";
const pointer = {
  pressed: false,
  x: 0,
  y: 0,
  onMove,
};
function move(x, y) {
  pointer.x = x;
  pointer.y = y;
  dispatchEvent(event_move, { pointer });
}
function onMove(callback) {
  return onEventListener(event_move, callback);
}
const ismousemove = (e) => {
  move(e.clientX, e.clientY);
};

function istouchmove(e) {
  const touch = e.touches[0];
  move(touch.clientX, touch.clientY);
}
window.addEventListener("mousemove", ismousemove);
window.addEventListener("mousedown", () => {
  pointer.pressed = true;
});
window.addEventListener("mouseup", () => {
  pointer.pressed = false;
});
window.addEventListener("touchmove", istouchmove);
window.addEventListener("touchstart", () => {
  pointer.pressed = true;
});
window.addEventListener("touchend", () => {
  pointer.pressed = false;
});

export default pointer;
