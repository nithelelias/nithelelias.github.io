import Component from "../src/component.js";

Component("[rever-scroll]", (layer) => {
  if (layer && layer.isConnected) {
    const onScrollEvent = () => {
      if (!layer.isConnected) {
        window.removeEventListener("scroll", onScrollEvent, false);
      }
      let y = -window.scrollY;
      layer.style.transform = `translate(0px,${y}px)`;
    };
    window.addEventListener("scroll", onScrollEvent, false);
  }
});
