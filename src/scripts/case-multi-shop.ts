// Custom size demo on the multi-shop case study (Screens, CUSTOM SIZE tab).
// Typing a width and a length redraws the opening to scale. The default drawing is already in
// the HTML as static SVG (CustomSize.astro calls `openingGeometry` at build time), so the page
// reads the same with JavaScript off; this file only makes the two fields live.
// Loaded by src/components/case/multi-shop/CustomSize.astro, on that page only.

/** Millimetres. The same limits are on the inputs as min / max / step. */
export const LIMITS = { min: 300, max: 3000, step: 10 } as const;
export const DEFAULTS = { width: 1000, length: 2000 } as const;

/** The drawing's viewBox. One unit is 10 mm, so the largest opening (3000 mm) is 300 units. */
export const VIEW = { width: 400, height: 380 } as const;
const SCALE = 0.1;
const CENTRE = { x: 185, y: 170 };
const GAP = 14;

export interface OpeningGeometry {
  rect: { x: number; y: number; width: number; height: number };
  /** Dimension line under the opening, and its label. */
  widthLine: { x1: number; x2: number; y: number };
  widthLabel: { x: number; y: number };
  /** Dimension line to the right of the opening, and its label. */
  lengthLine: { x: number; y1: number; y2: number };
  lengthLabel: { x: number; y: number };
}

export const clamp = (value: number): number => Math.min(LIMITS.max, Math.max(LIMITS.min, Math.round(value)));

export function openingGeometry(width: number, length: number): OpeningGeometry {
  const w = clamp(width) * SCALE;
  const h = clamp(length) * SCALE;
  const x = CENTRE.x - w / 2;
  const y = CENTRE.y - h / 2;
  return {
    rect: { x, y, width: w, height: h },
    widthLine: { x1: x, x2: x + w, y: y + h + GAP },
    widthLabel: { x: CENTRE.x, y: y + h + GAP + 18 },
    lengthLine: { x: x + w + GAP, y1: y, y2: y + h },
    lengthLabel: { x: x + w + GAP + 9, y: CENTRE.y + 4 },
  };
}

function set(el: Element | null, attrs: Record<string, number>) {
  if (!el) return;
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(Math.round(value * 100) / 100));
}

function initDemo(root: HTMLElement) {
  const widthInput = root.querySelector<HTMLInputElement>('[data-size-input="width"]');
  const lengthInput = root.querySelector<HTMLInputElement>('[data-size-input="length"]');
  const svg = root.querySelector<SVGSVGElement>('[data-size-drawing]');
  if (!widthInput || !lengthInput || !svg) return;
  const label = svg.dataset.label ?? '';

  // The fields are read-only in the HTML, because without this script they would do nothing.
  widthInput.readOnly = false;
  lengthInput.readOnly = false;

  /** The typed value if it is a number, otherwise the last good one. Always within the limits. */
  const read = (input: HTMLInputElement, fallback: number) =>
    input.value.trim() === '' || Number.isNaN(input.valueAsNumber) ? fallback : clamp(input.valueAsNumber);

  let width: number = DEFAULTS.width;
  let length: number = DEFAULTS.length;

  const draw = () => {
    width = read(widthInput, width);
    length = read(lengthInput, length);
    const g = openingGeometry(width, length);
    set(svg.querySelector('[data-size-rect]'), g.rect);
    set(svg.querySelector('[data-size-line="width"]'), { x1: g.widthLine.x1, x2: g.widthLine.x2, y1: g.widthLine.y, y2: g.widthLine.y });
    set(svg.querySelector('[data-size-line="length"]'), { x1: g.lengthLine.x, x2: g.lengthLine.x, y1: g.lengthLine.y1, y2: g.lengthLine.y2 });
    const widthLabel = svg.querySelector('[data-size-label="width"]');
    const lengthLabel = svg.querySelector('[data-size-label="length"]');
    set(widthLabel, g.widthLabel);
    set(lengthLabel, g.lengthLabel);
    if (widthLabel) widthLabel.textContent = String(width);
    if (lengthLabel) lengthLabel.textContent = String(length);
    svg.setAttribute('aria-label', label.replace('{w}', String(width)).replace('{l}', String(length)));
  };

  for (const input of [widthInput, lengthInput]) {
    input.addEventListener('input', draw);
    // When the field is left, show the value that was actually drawn (clamped to the limits).
    input.addEventListener('change', () => {
      draw();
      widthInput.value = String(width);
      lengthInput.value = String(length);
    });
  }
  root.querySelector('form')?.addEventListener('submit', (event) => event.preventDefault());
  draw();
}

if (typeof document !== 'undefined') {
  document.querySelectorAll<HTMLElement>('[data-size-demo]').forEach(initDemo);
}
