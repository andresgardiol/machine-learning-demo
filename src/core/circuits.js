// Catálogo de pistas (circuitos-y-paisaje, design.md D2): la calle recta y tres circuitos
// cerrados, siempre los mismos.
//
// Cada circuito se describe como una lista de tramos que arranca en la línea de salida, en (0, 0)
// y mirando hacia +x: rectas `{ straight: largo }` y arcos `{ radius, turn }`, con `turn` en
// grados (positivo a la izquierda, negativo a la derecha). El armador los convierte en la línea
// central, muestreando los arcos con cuerdas de ARC_CHORD metros como máximo. Agregar un circuito
// es agregar una entrada a CIRCUITS y su id a TRACK_IDS.
import { createTrack, createStraightStreet, TrackError } from './track.js';

/** Pistas del catálogo, en el orden en que se ofrecen. La primera es la de por defecto. */
export const TRACK_IDS = Object.freeze(['straight', 'oval', 'kidney', 'grandPrix']);
export const DEFAULT_TRACK = TRACK_IDS[0];

/** Ancho de los circuitos: un solo carril, sin líneas de carril (m). */
export const CIRCUIT_WIDTH = 12;

/** Cuerda máxima con que se muestrean los arcos (m). */
export const ARC_CHORD = 3;

/** Distancia máxima entre el final del trazado y la salida para darlo por cerrado (m). */
const CLOSE_TOLERANCE = 0.05;

/**
 * Trazados de los circuitos. Los largos con decimales cierran el trazado (los calculó el diseño
 * resolviendo la vuelta al punto de partida); los demás números son decisiones de dibujo.
 */
export const CIRCUITS = Object.freeze({
  // Dos rectas de 150 m y dos medias vueltas de radio 50 m; la salida, en la mitad de una recta.
  oval: Object.freeze([
    { straight: 75 },
    { radius: 50, turn: 180 },
    { straight: 150 },
    { radius: 50, turn: 180 },
    { straight: 75 },
  ]),
  // Un óvalo apenas más largo, con una entrante suave en el lado de la salida y una chicana marcada
  // (un cambio de dirección claro, que corre la recta) en el lado opuesto.
  kidney: Object.freeze([
    { straight: 45 },
    { radius: 50, turn: 30 }, { radius: 50, turn: -60 }, { radius: 50, turn: 30 }, // entrante suave
    { straight: 15 },
    { radius: 50, turn: 180 },
    { straight: 105.699 },
    { radius: 25, turn: -60 }, { straight: 12 }, { radius: 25, turn: 60 }, // chicana
    { straight: 45 },
    { radius: 50, turn: 90 },
    { straight: 35.392 },
    { radius: 50, turn: 90 },
    { straight: 40 },
  ]),
  // Alargado y angosto, con la ida y la vuelta casi paralelas: recta de salida, primera curva de casi
  // media vuelta, eses (cuatro curvas que alternan el sentido), curva larga, horquilla en el extremo
  // lejano, recta de atrás, curva rápida y chicana final antes de la recta de salida. La vuelta va
  // por el lado de afuera de la ida, así no se cruza.
  grandPrix: Object.freeze([
    { straight: 70 },
    { radius: 35, turn: 160 }, // primera curva
    { straight: 20 },
    { radius: 35, turn: -50 }, { radius: 35, turn: 100 }, { radius: 35, turn: -90 }, { radius: 35, turn: 60 }, // eses
    { straight: 115.257 },
    { radius: 150, turn: 30 }, // curva larga
    { straight: 117.212 },
    { radius: 30, turn: 150 }, // horquilla
    { straight: 150 }, // recta de atrás
    { radius: 120, turn: -20 }, { straight: 20 }, { radius: 120, turn: 20 }, // curva rápida
    { straight: 30 },
    { radius: 25, turn: 40 }, { radius: 25, turn: -40 }, // chicana final
    { straight: 50 },
  ]),
});

/**
 * Línea central de un trazado por tramos, desde (0, 0) mirando hacia +x. Devuelve los puntos (sin
 * repetir el primero al final), el rumbo final en grados y cuánto le faltó para cerrar (m).
 */
export function buildCenterline(pieces) {
  let x = 0;
  let y = 0;
  let heading = 0;
  const points = [{ x, y }];
  for (const piece of pieces) {
    if (piece.straight !== undefined) {
      if (!(piece.straight > 0)) throw new TrackError('INVALID_PIECE', { piece });
      x += piece.straight * Math.cos(heading);
      y += piece.straight * Math.sin(heading);
      points.push({ x, y });
      continue;
    }
    const { radius, turn } = piece;
    if (!(radius > 0) || !Number.isFinite(turn) || turn === 0) throw new TrackError('INVALID_PIECE', { piece });
    const angle = (turn * Math.PI) / 180;
    const side = Math.sign(angle);
    const cx = x - side * radius * Math.sin(heading);
    const cy = y + side * radius * Math.cos(heading);
    const steps = Math.max(1, Math.ceil((radius * Math.abs(angle)) / ARC_CHORD));
    for (let i = 1; i <= steps; i++) {
      const h = heading + (angle * i) / steps;
      points.push({ x: cx + side * radius * Math.sin(h), y: cy - side * radius * Math.cos(h) });
    }
    heading += angle;
    ({ x, y } = points[points.length - 1]);
  }
  const gap = Math.hypot(x, y);
  // El último punto coincide (o casi) con la salida: se descarta y el tramo de cierre lo reemplaza.
  if (gap <= CLOSE_TOLERANCE) points.pop();
  return { points, heading: (heading * 180) / Math.PI, gap };
}

/** ¿Es un id del catálogo? */
export const isTrackId = (id) => TRACK_IDS.includes(id);

/** ¿Es un circuito cerrado del catálogo (no la calle recta)? */
export const isCircuit = (id) => isTrackId(id) && id !== 'straight';

/**
 * Arma la pista `id` del catálogo. La calle recta usa `lanes`; los circuitos lo ignoran (un solo
 * carril de CIRCUIT_WIDTH metros). Lanza TrackError('UNKNOWN_TRACK') con las disponibles si el id
 * no está en el catálogo.
 */
export function createTrackById(id, { lanes } = {}) {
  if (id === 'straight') return createStraightStreet({ lanes });
  if (!isCircuit(id)) throw new TrackError('UNKNOWN_TRACK', { id, available: [...TRACK_IDS] });
  const { points, gap } = buildCenterline(CIRCUITS[id]);
  if (gap > CLOSE_TOLERANCE) throw new TrackError('CIRCUIT_NOT_CLOSED', { id, gap });
  return createTrack({ centerline: points, width: CIRCUIT_WIDTH, lanes: 1, closed: true });
}
