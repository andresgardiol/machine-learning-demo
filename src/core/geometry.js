// Geometría 2D del núcleo. Ejes matemáticos: x hacia la derecha, y hacia arriba.
// Un ángulo de 0 apunta hacia +x y crece en sentido antihorario.
// Los puntos y vectores son objetos planos { x, y }.

export const vec = (x, y) => ({ x, y });
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a, k) => ({ x: a.x * k, y: a.y * k });
export const dot = (a, b) => a.x * b.x + a.y * b.y;
export const cross = (a, b) => a.x * b.y - a.y * b.x;
export const length = (a) => Math.hypot(a.x, a.y);
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function normalize(a) {
  const len = length(a);
  return len === 0 ? { x: 0, y: 0 } : { x: a.x / len, y: a.y / len };
}

/** Vector unitario que apunta hacia `angle`. */
export const fromAngle = (angle) => ({ x: Math.cos(angle), y: Math.sin(angle) });

/** Perpendicular a la izquierda (giro de +90 grados). */
export const leftOf = (a) => ({ x: -a.y, y: a.x });

/**
 * Intersección entre los segmentos ab y cd (extremos incluidos).
 * Devuelve { t, u, point } con t en ab y u en cd, ambos en [0, 1],
 * o null si no se cruzan o si son paralelos (incluidos los colineales).
 */
export function segmentIntersection(a, b, c, d) {
  const r = sub(b, a);
  const s = sub(d, c);
  const denom = cross(r, s);
  if (denom === 0) return null;
  const ac = sub(c, a);
  const t = cross(ac, s) / denom;
  const u = cross(ac, r) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { t, u, point: { x: a.x + r.x * t, y: a.y + r.y * t } };
}

/**
 * Esquinas de un rectángulo centrado en `center`, rotado `angle`.
 * `length` es el largo (a lo largo de la dirección) y `width` el ancho.
 * Orden: adelante-izquierda, adelante-derecha, atrás-derecha, atrás-izquierda.
 */
export function rectCorners(center, angle, rectLength, rectWidth) {
  const f = scale(fromAngle(angle), rectLength / 2);
  const l = scale(leftOf(fromAngle(angle)), rectWidth / 2);
  return [
    add(add(center, f), l),
    sub(add(center, f), l),
    sub(sub(center, f), l),
    add(sub(center, f), l),
  ];
}

/** Segmentos [p, q] que forman el contorno de un polígono dado por sus vértices. */
export function outline(points) {
  return points.map((p, i) => [p, points[(i + 1) % points.length]]);
}

/** Punto dentro (o sobre el borde) de un polígono convexo de vértices en orden. */
export function pointInConvex(p, poly) {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const side = cross(sub(b, a), sub(p, a));
    if (side !== 0) {
      const s = side > 0 ? 1 : -1;
      if (sign === 0) sign = s;
      else if (s !== sign) return false;
    }
  }
  return true;
}

/**
 * ¿Se tocan dos contornos convexos? Verdadero si algún par de lados se cruza
 * o toca, o si uno contiene al otro.
 */
export function contoursTouch(polyA, polyB) {
  for (const [a, b] of outline(polyA)) {
    for (const [c, d] of outline(polyB)) {
      if (segmentIntersection(a, b, c, d)) return true;
    }
  }
  return pointInConvex(polyA[0], polyB) || pointInConvex(polyB[0], polyA);
}
