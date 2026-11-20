// Brillo de la dirección de arte de la V2 (design.md D8 y D-elegida, KD10): solo para el auto seguido.
// Se dibuja encima de lo que pinta createStageView de la V1, que deja puesta la transformación del
// mundo a la pantalla: rayos con resplandor y la luz de los faros. La población es la de la V1 (la
// forma ilustrada, atenuada). Nada cambia con el tiempo (no destella) y el auto chocado no lleva brillo,
// así la forma del choque queda igual (Art. 7).
import { CAR_LENGTH, CAR_WIDTH } from '../../core/constants.js';

// Intensidad bajada un tercio a pedido del dueño (19 de noviembre de 2026): "me gustan, pero les pondría un poco menos".
export const GLOW_BLUR_PX = 7;
export const RAY_ALPHA = 0.33;
export const BEAM_ALPHA = 0.25;
export const BEAM_LENGTH = 3.5; // metros por delante del auto (vehiculos-ilustrados D6: menos de un largo de auto)

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
      ctx.save();
      // El resplandor de los rayos no pasa por encima del auto (vehiculos-ilustrados D9): se recorta todo
      // menos el rectángulo del auto, que ya está dibujado debajo.
      ctx.beginPath();
      exceptCar(ctx, car, 1e4);
      ctx.clip('evenodd');
      // Rayos: un solo trazo con resplandor, sin sumar luz (con 'lighter' el celeste se iba a blanco).
      ctx.shadowColor = c.sensor;
      ctx.shadowBlur = GLOW_BLUR_PX * dpr;
      ctx.strokeStyle = c.sensor;
      ctx.globalAlpha = RAY_ALPHA;
      ctx.lineWidth = 2.5 * px;
      ctx.beginPath();
      for (const s of raySegments(rays)) { ctx.moveTo(s.from.x, s.from.y); ctx.lineTo(s.to.x, s.to.y); }
      ctx.stroke();
      ctx.restore();
      // Faros (vehiculos-ilustrados D6): una mancha corta, de bordes redondeados, que se apaga del todo antes
      // de un largo de auto; así no se confunde con un rayo, que es una línea recta de borde neto.
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.translate(car.position.x, car.position.y);
      ctx.rotate(car.angle);
      const x0 = CAR_LENGTH / 2 - 0.1;
      const L = BEAM_LENGTH;
      const g = ctx.createRadialGradient(x0, 0, 0, x0, 0, L);
      g.addColorStop(0, withAlpha(c.headlight, BEAM_ALPHA));
      g.addColorStop(0.5, withAlpha(c.headlight, BEAM_ALPHA * 0.4));
      g.addColorStop(1, withAlpha(c.headlight, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      beamPath(ctx, x0, L);
      ctx.fill();
      ctx.restore();
    },
  };
}

/**
 * Contorno de la luz de los faros desde x0 hasta, como mucho, x0 + L: sale del ancho de los faros, se abre un
 * poco y cierra con una punta redondeada (sin lados rectos). Puro sobre el camino del contexto; tiene pruebas.
 */
export function beamPath(ctx, x0, L) {
  const h = CAR_WIDTH / 2 - 0.25;
  ctx.moveTo(x0, -h);
  ctx.bezierCurveTo(x0 + L * 0.35, -h - 0.25, x0 + L * 0.75, -h - 0.45, x0 + L * 0.9, -h * 0.9);
  ctx.quadraticCurveTo(x0 + L * 1.1, 0, x0 + L * 0.9, h * 0.9);
  ctx.bezierCurveTo(x0 + L * 0.75, h + 0.45, x0 + L * 0.35, h + 0.25, x0, h);
  ctx.closePath();
}

/**
 * Camino para recortar con 'evenodd': un cuadrado de `far` metros alrededor del auto y, adentro, el rectángulo
 * del auto. Lo que se dibuje con ese recorte queda afuera del auto. Puro sobre el camino del contexto.
 */
export function exceptCar(ctx, car, far) {
  const { x, y } = car.position;
  ctx.rect(x - far, y - far, 2 * far, 2 * far);
  const c = Math.cos(car.angle);
  const s = Math.sin(car.angle);
  const corner = (dx, dy) => [x + dx * c - dy * s, y + dx * s + dy * c];
  const pts = [corner(CAR_LENGTH / 2, CAR_WIDTH / 2), corner(-CAR_LENGTH / 2, CAR_WIDTH / 2),
    corner(-CAR_LENGTH / 2, -CAR_WIDTH / 2), corner(CAR_LENGTH / 2, -CAR_WIDTH / 2)];
  ctx.moveTo(...pts[0]);
  for (const p of pts.slice(1)) ctx.lineTo(...p);
  ctx.closePath();
}

/** Un color #rrggbb con transparencia (puro). */
export function withAlpha(hex, alpha) {
  const h = String(hex).trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) return `rgba(255,255,255,${alpha})`;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${alpha})`;
}
