function valueToDir(v) {
  return (v = v === 0 ? 0 : Math.abs(v) / v);
}
export default function getDirAndDistance(position, targetPosition) {
  const dif = {
    x: targetPosition.x - position.x,
    y: targetPosition.y - position.y,
  };
  const dir = { x: valueToDir(dif.x), y: valueToDir(dif.y) };
  const dist = Math.sqrt(dif.x * dif.x + dif.y * dif.y);
  return { dir, dist, dif };
}
