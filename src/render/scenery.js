// Dibujo del paisaje (circuitos-y-paisaje D9) en el canvas de la vista, a partir de la distribución
// de scenery-layout.js. Solo dibuja lo que cruza el encuadre, con figuras planas (sin sombras ni
// degradados). Tres capas, que la vista intercala con la pista:
//
//   under  veredas, pianitos y tribunas (debajo de la calzada; el pasto es el fondo)
//   paint  sendas peatonales y línea de largada (pintadas sobre la calzada)
//   over   árboles (después de los bordes, pero siempre fuera de la pista)
import { streetCell, streetCellsIn, circuitScenery, STREET_CELL } from './scenery-layout.js';

const CELL_CACHE = 48; // celdas de la calle que se guardan mientras estén cerca
const CROSSWALK_STRIPE = 0.6; // ancho de cada franja de la senda (m), con el mismo hueco

/** ¿El recuadro [x0, x1] × [y0, y1] cruza el encuadre b (con un margen)? */
const crosses = (b, x0, x1, y0, y1, margin = 0) => x1 >= b.minX - margin && x0 <= b.maxX + margin
  && y1 >= b.minY - margin && y0 <= b.maxY + margin;

function quadsInView(ctx, quads, b) {
  for (const q of quads) {
    const xs = q.points.map((p) => p.x);
    const ys = q.points.map((p) => p.y);
    if (!crosses(b, Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys))) continue;
    const [p0, p1, p2, p3] = q.points;
    ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
  }
}

export function createSceneryPainter() {
  const cells = new Map();

  /** Celdas de la calle que cruzan el encuadre, con caché. */
  function streetCells(world, b) {
    const { width } = world.track;
    const out = [];
    for (const k of streetCellsIn(b.minX - STREET_CELL, b.maxX)) {
      const key = `${world.seed}:${width}:${k}`;
      let cell = cells.get(key);
      if (!cell) {
        cell = streetCell({ seed: world.seed, width, index: k });
        if (cells.size >= CELL_CACHE) cells.delete(cells.keys().next().value);
        cells.set(key, cell);
      }
      if (cell.x1 >= b.minX - 50 && cell.x0 <= b.maxX + 50) out.push(cell);
    }
    return out;
  }

  const circuitOf = (world) => circuitScenery(world.track, world.trackId);

  /** Veredas, pianitos y tribunas. */
  function under(ctx, world, b, colors) {
    if (world.track.closed) {
      const s = circuitOf(world);
      for (const tone of [0, 1]) {
        ctx.fillStyle = tone === 0 ? colors.kerbA : colors.kerbB;
        ctx.beginPath();
        quadsInView(ctx, s.kerbs.filter((k) => k.tone === tone), b);
        ctx.fill();
      }
      ctx.fillStyle = colors.stand;
      ctx.beginPath();
      quadsInView(ctx, s.stands, b);
      ctx.fill();
      return;
    }
    ctx.fillStyle = colors.sidewalk;
    ctx.beginPath();
    for (const cell of streetCells(world, b)) {
      for (const r of cell.sidewalks) {
        const x0 = Math.max(r.x0, b.minX);
        const x1 = Math.min(r.x1, b.maxX);
        if (x1 > x0 && crosses(b, x0, x1, r.y0, r.y1)) ctx.rect(x0, r.y0, x1 - x0, r.y1 - r.y0);
      }
    }
    ctx.fill();
  }

  /** Sendas peatonales y línea de largada, pintadas sobre la calzada. */
  function paint(ctx, world, b, colors) {
    if (world.track.closed) {
      const s = circuitOf(world);
      for (const tone of [0, 1]) {
        ctx.fillStyle = tone === 0 ? colors.checkerA : colors.checkerB;
        ctx.beginPath();
        quadsInView(ctx, s.checkers.filter((c) => c.tone === tone), b);
        ctx.fill();
      }
      return;
    }
    ctx.fillStyle = colors.crosswalk;
    ctx.beginPath();
    for (const cell of streetCells(world, b)) {
      for (const w of cell.crosswalks) {
        if (!crosses(b, w.x0, w.x1, w.y0, w.y1)) continue;
        // Franjas a lo largo de la calle, repartidas en el ancho de la calzada.
        for (let y = w.y0 + CROSSWALK_STRIPE / 2; y + CROSSWALK_STRIPE <= w.y1; y += 2 * CROSSWALK_STRIPE) {
          ctx.rect(w.x0, y, w.x1 - w.x0, CROSSWALK_STRIPE);
        }
      }
    }
    ctx.fill();
  }

  /** Árboles: círculos planos de dos tonos. */
  function over(ctx, world, b, colors) {
    const trees = world.track.closed ? circuitOf(world).trees : streetCells(world, b).flatMap((c) => c.trees);
    for (const tone of [0, 1]) {
      ctx.fillStyle = tone === 0 ? colors.tree : colors.treeDark;
      ctx.beginPath();
      for (const t of trees) {
        if (t.tone !== tone || !crosses(b, t.x - t.r, t.x + t.r, t.y - t.r, t.y + t.r)) continue;
        ctx.moveTo(t.x + t.r, t.y);
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }

  return { under, paint, over };
}
