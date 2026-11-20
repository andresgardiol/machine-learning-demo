// Caché de imágenes de los vehículos ilustrados (vehiculos-ilustrados D3). Los dibujos son de
// src/render/vehicles.js; este módulo solo los compone en un canvas fuera de pantalla (D2: carrocería con
// 'source-in', detalle encima y sombra por debajo) y guarda cada imagen por tipo, color, escala y capa, así
// cada cuadro solo hace un drawImage girado. No toca el DOM: el canvas se lo da quien crea el caché.
import {
  VEHICLE_SIZES, SIMPLE_BELOW, DEFAULT_PALETTE,
  drawShadow, drawBody, drawDetail, drawBodySimple, drawDetailSimple,
} from './vehicles.js';

export const SHADOW_PAD = 0.15; // m de margen alrededor del rectángulo en la imagen (la sombra llega a SHADOW_REACH)
export const MAX_IMAGE_PX = 2048; // lado máximo de una imagen del caché
export const CACHE_SIZE = 256; // entradas; se descartan las que hace más que no se usan

/**
 * Escala de la imagen (px por metro, potencia de 2) para dibujar a `pxPerMeter` píxeles físicos por metro:
 * la potencia inmediata superior, para que no se vea borroso; por debajo de SIMPLE_BELOW, la simplificada
 * siempre a SIMPLE_BELOW. Tope: que el lado mayor del vehículo no pase de MAX_IMAGE_PX.
 */
export function scaleFor(pxPerMeter, kind = 'player') {
  const { L } = VEHICLE_SIZES[kind];
  if (!(pxPerMeter >= SIMPLE_BELOW)) return { scale: SIMPLE_BELOW, simple: true };
  const cap = 2 ** Math.floor(Math.log2(MAX_IMAGE_PX / (L + 2 * SHADOW_PAD)));
  const scale = Math.min(cap, 2 ** Math.ceil(Math.log2(pxPerMeter) - 1e-9));
  return { scale, simple: false };
}

/**
 * Arma la imagen de un vehículo en `canvas` (D2). Capas: 'full' (sombra, carrocería del color y detalle) o
 * 'mask' (solo la carrocería, del color: la población, D5). La carrocería se pinta con 'source-in' sobre la
 * máscara; el detalle, neutro, va encima, y la sombra por debajo ('destination-over').
 */
export function composeVehicle(canvas, { kind, color, scale, simple = false, layer = 'full', palette = DEFAULT_PALETTE }) {
  const { L, W } = VEHICLE_SIZES[kind];
  canvas.width = Math.ceil((L + 2 * SHADOW_PAD) * scale);
  canvas.height = Math.ceil((W + 2 * SHADOW_PAD) * scale);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, canvas.width / 2, canvas.height / 2);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000';
  if (simple) drawBodySimple(ctx, kind); else drawBody(ctx, kind);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(-L / 2 - SHADOW_PAD, -W / 2 - SHADOW_PAD, L + 2 * SHADOW_PAD, W + 2 * SHADOW_PAD);
  ctx.globalCompositeOperation = 'source-over';
  if (layer === 'full') {
    if (simple) drawDetailSimple(ctx, kind, palette);
    else {
      drawDetail(ctx, kind, palette);
      ctx.globalCompositeOperation = 'destination-over';
      drawShadow(ctx, kind);
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  return canvas;
}

/**
 * @param {{ createCanvas: () => HTMLCanvasElement, palette?: object, size?: number }} spec
 *   createCanvas: un canvas fuera de pantalla nuevo (document.createElement('canvas') en el navegador).
 */
export function createVehicleCache({ createCanvas, palette = DEFAULT_PALETTE, size = CACHE_SIZE }) {
  const entries = new Map(); // clave -> canvas, en orden de último uso
  let pal = palette;
  let built = 0;

  function image(kind, color, pxPerMeter, layer = 'full') {
    const { scale, simple } = scaleFor(pxPerMeter, kind);
    const key = `${kind}|${color}|${scale}|${simple ? 's' : 'f'}|${layer}`;
    let img = entries.get(key);
    if (img) {
      entries.delete(key);
      entries.set(key, img);
      return img;
    }
    img = composeVehicle(createCanvas(), { kind, color, scale, simple, layer, palette: pal });
    built++;
    entries.set(key, img);
    while (entries.size > size) entries.delete(entries.keys().next().value);
    return img;
  }

  /**
   * Estampa el vehículo con el centro en el origen del contexto, con la transformación de ejes locales ya
   * puesta (x hacia adelante, en metros). pxPerMeter: píxeles físicos por metro en pantalla.
   */
  function stamp(ctx, kind, color, pxPerMeter, layer = 'full') {
    const img = image(kind, color, pxPerMeter, layer);
    const s = scaleFor(pxPerMeter, kind).scale;
    const w = img.width / s;
    const h = img.height / s;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  }

  return {
    image,
    stamp,
    /** Cambian los tokens (tema): se vacía y se rearma con la paleta nueva a medida que se pida. */
    reset(palette = pal) { pal = palette; entries.clear(); },
    get size() { return entries.size; },
    /** Imágenes armadas desde que se creó (para las pruebas y la medición). */
    get built() { return built; },
    keys() { return [...entries.keys()]; },
  };
}
