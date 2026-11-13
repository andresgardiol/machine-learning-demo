// Escenario descrito en texto (panel-de-entrenar-por-vistas D9, spec accesibilidad).
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n } from '../src/ui/i18n.js';
import { createThrottledText, DESCRIPTION_INTERVAL_MS } from '../src/ui/stage-description.js';
import { drivingDescription, trainingDescription } from '../src/tabs/shared/stage-text.js';

const t = (lang) => createI18n({ dictionaries: { es, en }, language: lang }).t;

function setup() {
  let now = 0;
  const writes = [];
  const tasks = [];
  const text = createThrottledText({
    write: (s) => writes.push([now, s]), clock: () => now,
    schedule: (fn, ms) => { tasks.push({ fn, at: now + ms }); return tasks.length; }, cancel: () => {},
  });
  const advance = (ms) => {
    now += ms;
    for (const task of tasks.splice(0)) { if (task.at <= now) task.fn(); else tasks.push(task); }
  };
  return { text, writes, advance };
}

test('la descripción se escribe como mucho una vez por segundo', () => {
  const { text, writes, advance } = setup();
  assert.equal(DESCRIPTION_INTERVAL_MS, 1000);
  assert.equal(text.push('12 m'), true);
  for (let i = 0; i < 59; i++) { advance(16); text.push(`${13 + i} m`); } // un cuadro tras otro, durante casi un segundo
  assert.equal(writes.length, 1);
  advance(100);
  assert.equal(writes.length, 2);
  assert.equal(writes[1][1], '71 m'); // el último texto que llegó
  assert.ok(writes[1][0] - writes[0][0] >= 1000);
});

test('la descripción solo se escribe cuando cambia', () => {
  const { text, writes, advance } = setup();
  text.push('En pausa');
  for (let i = 0; i < 10; i++) { advance(1500); text.push('En pausa'); }
  assert.equal(writes.length, 1);
  text.push('En marcha');
  assert.equal(writes.length, 2);
});

test('un cambio pendiente que vuelve al texto escrito no se escribe', () => {
  const { text, writes, advance } = setup();
  text.push('A');
  advance(100);
  text.push('B');
  text.push('A');
  advance(2000);
  assert.deepEqual(writes.map((w) => w[1]), ['A']);
});

test('El problema: la calle recta de tres carriles con tráfico, en marcha y los metros', () => {
  assert.equal(drivingDescription({ t: t('es'), track: 'straight', lanes: 3, paused: false, crashed: false, meters: 42.7 }),
    'Calle recta de 3 carriles, con tráfico. El auto está en marcha y lleva 42 m.');
  assert.equal(drivingDescription({ t: t('es'), track: 'kidney', lanes: 3, paused: true, crashed: false, meters: 10 }),
    'Pista «Óvalo con chicana», sin tráfico. El auto está en pausa, a los 10 m.');
  assert.equal(drivingDescription({ t: t('en'), track: 'straight', lanes: 4, paused: false, crashed: true, meters: 99 }),
    'Straight street with 4 lanes and traffic. The car crashed at 99 m.');
});

test('Entrenar: la pista, la generación y los autos en carrera', () => {
  assert.equal(trainingDescription({ t: t('es'), track: 'oval', lanes: 3, generation: 12, alive: 87, total: 100, paused: false }),
    'Pista «Óvalo», sin tráfico. Generación 12: 87 de 100 autos siguen en carrera. El entrenamiento está en marcha.');
});

test('Ver como la máquina: dice que la pista no se muestra y que solo se ven el auto y sus sensores', () => {
  const s = drivingDescription({ t: t('es'), track: 'straight', lanes: 3, paused: false, crashed: false, meters: 1, machineView: true });
  assert.match(s, /la pista no se muestra; solo se ven el auto y sus sensores/);
  const e = trainingDescription({ t: t('en'), track: 'straight', lanes: 3, generation: 1, alive: 5, total: 5, paused: true, machineView: true });
  assert.match(e, /the track is not shown; only the car and its sensors are visible/);
});
