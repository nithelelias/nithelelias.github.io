export default function loopAnimationFrame(callback) {
  var active = true;

  const loop = () => {
    if (!active) {
      return;
    }
    
    callback();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return {
    play: () => {
      if (active) {
        return;
      }
      active = true;
      requestAnimationFrame(loop);
    },
    stop: () => {
      active = false;
    },
  };
}
