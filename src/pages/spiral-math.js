// Geometry for the "Get into Orbit" spiral.
//
// Tiles sit on one elliptical Archimedean spiral. Each tile owns a phase along
// it; the phase drifts slowly inward, tiles are sized, tilted along the path and
// faded by that phase. Pure functions, no DOM, so they can be checked in node.

const TAU = Math.PI * 2;
export const DESIGN_WIDTH = 1440;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
const mod = (value, length) => ((value % length) + length) % length;
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

// Deterministic 0..1 value per tile, so sizes stay stable between renders.
export const seeded = (index, salt) => {
  const raw = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return raw - Math.floor(raw);
};

// How much the whole design shrinks on stages narrower or shorter than it was drawn for.
const fit = (width, height, referenceHeight) => (
  width >= DESIGN_WIDTH ? 1 : Math.max(0.001, Math.min(1, width / DESIGN_WIDTH, height / referenceHeight))
);

// Outer phases are compressed so extra rows added on big stages keep their spacing.
const compress = (value) => (value <= 1 ? value : Math.sqrt(2 * value - 1));

// How far the spiral has to reach to fill a stage (1 = the design size).
function reach(width, height, { referenceHeight, turns }) {
  if (width >= DESIGN_WIDTH) return Math.max(1, width / DESIGN_WIDTH, height / referenceHeight);
  const scale = fit(width, height, referenceHeight);
  return Math.max(1, width / (DESIGN_WIDTH * scale), height / (referenceHeight * scale)) + 1 / Math.max(1, Math.abs(turns));
}

/** Sizes the spiral for a stage: how many tiles to render and how far out they run. */
export function layoutFor(width, height, config) {
  const stretch = reach(width, height, config);
  const tiles = stretch <= 1
    ? config.imageCount
    : Math.ceil(config.imageCount * (1 + (stretch * stretch - 1) / 2));
  const span = Math.max(1, tiles / config.imageCount);
  return { tiles, span, end: stretch <= 1 ? stretch : compress(span) };
}

function position(phase, config, width, height, end) {
  const along = clamp(phase, 0, end);
  const angle = (config.rotation * Math.PI) / 180 + along * config.turns * TAU;
  const radius = (config.endRadius * along) / 100;
  const reference = Math.min(DESIGN_WIDTH, config.referenceHeight);
  const scale = fit(width, height, config.referenceHeight);
  return {
    x: Math.cos(angle) * radius * Math.min(DESIGN_WIDTH, reference * 1.3) * config.horizontal * scale,
    y: Math.sin(angle) * radius * Math.min(config.referenceHeight, reference * 1.55) * config.vertical * scale,
  };
}

/**
 * Where one tile is. `progress` is the shared drift (0..span), `index` the tile.
 * Returns null when the tile has drifted past the end of the spiral.
 */
export function tilePose(index, progress, layout, config, width, height) {
  const phase = compress(mod(progress + index / config.imageCount, layout.span));
  if (phase >= layout.end) return null;

  const { x, y } = position(phase, config, width, height, layout.end);

  // Face along the path: compare a hair behind and a hair ahead.
  const step = 0.0015;
  const behind = position(Math.max(0, phase - step), config, width, height, layout.end);
  const ahead = position(Math.min(layout.end, phase + step), config, width, height, layout.end);
  const rotation = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;

  const variety = lerp(config.minSize, config.maxSize, seeded(index, 3));
  const growth = lerp(config.startScale, config.endScale, clamp(phase));
  const scale = fit(width, height, config.referenceHeight) * variety * growth;

  const opacity = smooth(phase / Math.max(0.01, config.fadeIn / 100))
    * smooth((layout.end - phase) / Math.max(0.01, config.fadeOut / 100));

  return { x, y, rotation, scale, opacity, phase };
}

/** Moves the shared drift on by `elapsed` ms. Negative direction drifts inward. */
export function advance(progress, elapsed, speed, direction, layout) {
  const step = (elapsed * Math.max(0.05, speed)) / 60000;
  return mod(progress + step * (direction === "in" ? -1 : 1), layout.span);
}

// Exactly what the live page uses on desktop and on narrower screens.
export const SPIRAL_DESKTOP = {
  imageCount: 113, base: 39, minSize: 0.68, maxSize: 1.27,
  turns: 5.14, endRadius: 104, rotation: 134, horizontal: 1.03, vertical: 1, referenceHeight: 600,
  startScale: 0.05, endScale: 2.85, fadeIn: 1, fadeOut: 1, speed: 0.1, direction: "in", progress: 0.23,
};

export const SPIRAL_COMPACT = {
  ...SPIRAL_DESKTOP,
  imageCount: 83, base: 37, minSize: 0.91, maxSize: 1.27,
  turns: 3.48, endRadius: 86, rotation: 130, horizontal: 0.96, vertical: 0.95, referenceHeight: 689,
  endScale: 3,
};
