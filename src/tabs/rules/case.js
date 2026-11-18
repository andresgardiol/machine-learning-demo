// El caso del choque de Reglas a mano (reglas-el-choque-ensena D3 y D6), sin DOM: la condición de la
// regla para el caso y el búfer circular de la repetición. Se prueba con node --test.
import es from '../../i18n/es.js';
import en from '../../i18n/en.js';

const DICTIONARIES = Object.freeze({ es, en });
const DECIMAL = Object.freeze({ es: ',', en: '.' });

/** Lectura mínima para que un sensor entre en la condición. */
export const CASE_MIN_READING = 0.3;

/** Valor redondeado hacia abajo a la décima (0,87 da 0,8), sin errores de coma flotante. */
const floorTenth = (v) => Math.max(0, Math.floor(Number(v) * 10 + 1e-9) / 10);

/** Índices (desde 0) de los sensores laterales: el tercio de cada costado; con uno solo, ese. */
function lateralIndices(count) {
  if (count <= 2) return Array.from({ length: count }, (_, i) => i);
  const side = Math.max(1, Math.floor(count / 3));
  const out = [];
  for (let i = 0; i < count; i += 1) if (i < side || i >= count - side) out.push(i);
  return out;
}

/** Los `n` índices de mayor lectura entre `indices` (a igual lectura, el de menor número). */
function highest(readings, indices, n) {
  return [...indices].sort((a, b) => (readings[b] - readings[a]) || (a - b)).slice(0, n);
}

/**
 * Condición de la regla para el caso (D6): los dos sensores de lectura más alta por encima de 0,3 (o el
 * único), con su valor redondeado hacia abajo a la décima, en el idioma pedido y sin acción. Si ningún
 * sensor pasa de 0,3, el choque fue contra el borde sin nada delante: usa los dos laterales más altos.
 * Los sensores van en orden de número.
 * @param {number[]} readings lecturas de los sensores en el instante del choque
 * @param {'es'|'en'} language
 * @returns {string} por ejemplo `si sensor1 > 0,80 y sensor2 > 0,80 entonces `
 */
export function caseCondition(readings, language) {
  const dict = DICTIONARIES[language] ?? es;
  const values = (readings ?? []).map((v) => Number(v) || 0);
  if (values.length === 0) return '';
  const above = values.map((_, i) => i).filter((i) => values[i] > CASE_MIN_READING);
  const chosen = (above.length > 0 ? highest(values, above, 2) : highest(values, lateralIndices(values.length), 2))
    .sort((a, b) => a - b);
  const sep = DECIMAL[language] ?? ',';
  const parts = chosen.map((i) => `${dict['rules.data.sensor'].replace('{n}', String(i + 1))} > ${floorTenth(values[i]).toFixed(2).replace('.', sep)}`);
  return `${dict['rules.word.if']} ${parts.join(` ${dict['rules.word.and']} `)} ${dict['rules.word.then']} `;
}

// El búfer circular de la repetición vive en shared/replay-buffer.js (red-al-centro D5): lo usan Reglas a mano e
// Inspeccionar. Se reexporta acá para quien lo importaba de este módulo.
export { createReplayBuffer, REPLAY_FRAMES } from '../shared/replay-buffer.js';

/**
 * Cuadro de la repetición a partir del mundo (de un auto) y del controlador de reglas, después de un
 * paso: la pose del auto, las lecturas y la velocidad, los controles accionados, las líneas que se
 * cumplían y los rayos (para dibujarlos). El tráfico no se guarda: es una función pura del tiempo.
 */
export function frameOf(world, controller) {
  const { car } = world;
  const rays = world.rays;
  const r = new Float32Array(rays.length * 6);
  rays.forEach((ray, i) => {
    const hit = ray.hit;
    r.set([ray.origin.x, ray.origin.y, ray.end.x, ray.end.y, hit ? hit.x : NaN, hit ? hit.y : NaN], i * 6);
  });
  return {
    steps: world.steps,
    time: world.time,
    progress: world.progress,
    car: { x: car.position.x, y: car.position.y, angle: car.angle, speed: car.speed, crashed: car.crashed },
    sensors: Float32Array.from(world.perception.sensors),
    speed: world.perception.speed,
    controls: { ...controller.controls },
    lines: [...controller.activeLines],
    rays: r,
  };
}

/** Rayos de un cuadro con la forma del mundo ({ origin, end, hit, reading }). */
export function raysOf(frame) {
  const out = [];
  for (let i = 0; i < frame.sensors.length; i += 1) {
    const o = i * 6;
    const hit = Number.isNaN(frame.rays[o + 4]) ? null : { x: frame.rays[o + 4], y: frame.rays[o + 5] };
    out.push({ origin: { x: frame.rays[o], y: frame.rays[o + 1] }, end: { x: frame.rays[o + 2], y: frame.rays[o + 3] }, hit, reading: frame.sensors[i] });
  }
  return out;
}
