export const rng = (seed) => () => {
  // xorshift32-ish
  seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5;
  return ((seed < 0 ? ~seed + 1 : seed) % 100000) / 100000;
};

export function daysUntil(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  return Math.ceil((then - now) / (1000 * 60 * 60 * 24));
}

export function normalize(val, min, max) {
  return (val - min) / (max - min);
}

export function withinWindow(dayStr, window) {
  // Simple gate: accepts scheduling if target day label matches
  return window.day.toLowerCase().slice(0,3) === dayStr.toLowerCase().slice(0,3);
}
