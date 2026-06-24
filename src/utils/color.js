const PALETTE = ['#1F5FBF', '#008A7C', '#7A4FB3', '#C56A16', '#C33C54', '#3C6E47', '#4267AC', '#8A5A44', '#6C757D'];

export function normalizeColor(value, seed = '') {
  if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim())) return value.trim();
  let hash = 0;
  for (const char of String(seed)) hash = ((hash << 5) - hash) + char.charCodeAt(0);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function lightenColor(hex, ratio = 0.68) {
  const clean = normalizeColor(hex).slice(1);
  const rgb = [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16));
  const light = rgb.map((value) => Math.round(value + ((255 - value) * ratio)));
  return `#${light.map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}
