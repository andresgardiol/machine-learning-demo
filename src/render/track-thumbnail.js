// Miniaturas del trazado de cada pista (panel-de-entrenar-por-vistas D5 y D11): la línea central de
// cada pista de src/core/circuits.js, con la misma orientación que en el escenario
// (camera.orientationFor), dentro de un recuadro de 40×28. Las usa la barra de escenario. Se calculan
// una sola vez; la parte sin DOM (thumbnail) se prueba en Node.
import { CIRCUITS, buildCenterline } from '../core/circuits.js';

export const THUMB_SIZE = Object.freeze({ width: 40, height: 28 });
const THUMB_PAD = 3;

/** Puntos de la línea central de una pista en coordenadas del mundo (la calle recta: un tramo). */
function centerline(id) {
  if (id === 'straight') return [{ x: 0, y: 0 }, { x: 100, y: 0 }];
  return buildCenterline(CIRCUITS[id]).points;
}

const thumbCache = new Map();

/**
 * Miniatura de una pista: los puntos, en píxeles de un recuadro de 40×28, de su línea central girada
 * como en el escenario (la recta de salida vertical, hacia arriba) y centrada. Una pista cerrada
 * repite el primer punto al final.
 * @returns {{points:{x:number,y:number}[], closed:boolean}}
 */
export function thumbnail(id) {
  if (thumbCache.has(id)) return thumbCache.get(id);
  const pts = centerline(id);
  // Misma orientación que el escenario: la dirección del primer tramo queda hacia arriba (y de
  // pantalla invertida), como en camera.orientationFor y en el dibujo de view.js.
  const d = { x: pts[1].x - pts[0].x, y: pts[1].y - pts[0].y };
  const rotation = Math.PI / 2 - Math.atan2(d.y, d.x);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const screen = pts.map((p) => ({ x: cos * p.x - sin * p.y, y: -(sin * p.x + cos * p.y) }));
  const xs = screen.map((p) => p.x);
  const ys = screen.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;
  const { width, height } = THUMB_SIZE;
  const scale = Math.min((width - 2 * THUMB_PAD) / (w || 1), (height - 2 * THUMB_PAD) / (h || 1));
  const offX = (width - w * scale) / 2;
  const offY = (height - h * scale) / 2;
  const round = (v) => Math.round(v * 10) / 10;
  const points = screen.map((p) => ({ x: round(offX + (p.x - minX) * scale), y: round(offY + (p.y - minY) * scale) }));
  const closed = id !== 'straight';
  if (closed) points.push({ ...points[0] });
  const result = Object.freeze({ points: Object.freeze(points), closed });
  thumbCache.set(id, result);
  return result;
}

const SVG = 'http://www.w3.org/2000/svg';

/** Dibujo de la miniatura de `id` como un SVG decorativo (aria-hidden), del tamaño pedido. */
export function thumbnailSvg(doc, id, { width = THUMB_SIZE.width, height = THUMB_SIZE.height } = {}) {
  const svg = doc.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'track-thumb');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${THUMB_SIZE.width} ${THUMB_SIZE.height}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const line = doc.createElementNS(SVG, 'polyline');
  line.setAttribute('points', thumbnail(id).points.map((p) => `${p.x},${p.y}`).join(' '));
  svg.append(line);
  return svg;
}
