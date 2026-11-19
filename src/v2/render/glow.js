// Brillo de la dirección de arte de la V2 (design.md D8 y D-elegida, KD10): solo para el auto seguido.
// Se dibuja encima de lo que pinta createStageView de la V1, que deja puesta la transformación del
// mundo a la pantalla: rayos con resplandor y el cono de los faros. La población sigue con las
// siluetas simples de la V1. Nada cambia con el tiempo (no destella) y el auto chocado no lleva brillo,
// así la forma del choque queda igual (Art. 7).
import { CAR_LENGTH, CAR_WIDTH } from '../../core/constants.js';

export const GLOW_BLUR_PX = 10;
export const BEAM_LENGTH = 7; // metros por delante del auto

/** Segmentos de los rayos hasta lo que detectan (puro; tiene pruebas). */
export function raySegments(rays) {
  return rays.map((r) => ({ from: r.origin, to: r.hit ?? r.end }));
}

/**
 * @param {{ colors: () => { sensor: string, headlight: string } }} spec
 */
export function createGlow({ colors }) {
  return {
    /**
     * @param {CanvasRenderingContext2D} ctx  con la transformación del mundo ya puesta
     * @param {{ car: object, rays: object[], zoom: number, dpr?: number }} frame
     */
    draw(ctx, { car, rays, zoom, dpr = 1 }) {
      if (!car || car.crashed) return;
      const c = colors();
      const px = 1 / zoom;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      // Rayos: un solo trazo con resplandor.
      ctx.shadowColor = c.sensor;
      ctx.shadowBlur = GLOW_BLUR_PX * dpr;
      ctx.strokeStyle = c.sensor;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 3 * px;
      ctx.beginPath();
      for (const s of raySegments(rays)) { ctx.moveTo(s.from.x, s.from.y); ctx.lineTo(s.to.x, s.to.y); }
      ctx.stroke();
      // Faros: un cono que se apaga hacia adelante.
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.translate(car.position.x, car.position.y);
      ctx.rotate(car.angle);
      const x0 = CAR_LENGTH / 2;
      const g = ctx.createLinearGradient(x0, 0, x0 + BEAM_LENGTH, 0);
      g.addColorStop(0, withAlpha(c.headlight, 0.38));
      g.addColorStop(1, withAlpha(c.headlight, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x0, -CAR_WIDTH / 2 + 0.15);
      ctx.lineTo(x0 + BEAM_LENGTH, -CAR_WIDTH * 1.4);
      ctx.lineTo(x0 + BEAM_LENGTH, CAR_WIDTH * 1.4);
      ctx.lineTo(x0, CAR_WIDTH / 2 - 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
  };
}

/** Un color #rrggbb con transparencia (puro). */
export function withAlpha(hex, alpha) {
  const h = String(hex).trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) return `rgba(255,255,255,${alpha})`;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}
