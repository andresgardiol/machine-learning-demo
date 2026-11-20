// Contraste de colores (WCAG 2.x) para la escena. Puro, sin DOM.
//
// Uso: la moto del tráfico es chica (unos 22 × 9 px al zoom por defecto), así que su color tiene que
// separarse del asfalto más que el de los vehículos grandes. `legibleOn` aclara un color, mezclándolo
// con blanco, solo lo necesario para llegar al contraste pedido; el tono se conserva.

/** '#rrggbb' o '#rgb' → [r, g, b] de 0 a 255, o null si no es un color hexadecimal. */
export function parseHex(color) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color ?? '').trim());
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/** Luminancia relativa de un color [r, g, b]. */
export function luminance([r, g, b]) {
  const lin = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Relación de contraste entre dos colores hexadecimales (de 1 a 21), o null si alguno no se entiende. */
export function contrast(a, b) {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return null;
  const [hi, lo] = [luminance(pa), luminance(pb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * El color, aclarado hacia el blanco en pasos de 5 % hasta tener al menos `min` de contraste con
 * `background`. Si ya lo tiene, o si algún color no se entiende, lo devuelve tal cual.
 */
export function legibleOn(color, background, min = 3) {
  const c = parseHex(color);
  const first = contrast(color, background);
  if (!c || first === null || first >= min) return color;
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const mixed = toHex(c.map((v) => v + (255 - v) * t));
    if (contrast(mixed, background) >= min) return mixed;
  }
  return '#ffffff';
}
