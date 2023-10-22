const steps = () => {
  const total_snaps =
    document.documentElement.scrollHeight /
    document.documentElement.clientHeight;

  for (let i = 0; i < total_snaps; i++) {
    const v = getSnapAt(i);
    document.documentElement.style.setProperty("--snap" + i, v);
  }
};
const onScrollEvent = () => {
  const progress =
    document.documentElement.scrollTop /
    (document.documentElement.scrollHeight - window.innerHeight);
  document.documentElement.style.setProperty("--scroll", progress);

  steps();
};

export default function startScrollDriven() {
  window.addEventListener("scroll", onScrollEvent, false);
}
export function stopScrollDriven() {
  window.removeEventListener("scroll", onScrollEvent);
}

export function getSnapAt(n) {
  const progress = window.scrollY / window.innerHeight + 0.5;
  let v = 0;
  v = Math.max(0, Math.min(1, progress - n));
  return v;
}
