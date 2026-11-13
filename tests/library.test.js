import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLibrary, STORAGE_KEYS, exportFileName, cleanName, uniqueName, AUTOSAVE_INTERVAL_MS,
} from '../src/ui/library.js';
import { createBrain, copyBrain } from '../src/core/brain.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';

// --- Dobles de prueba ---------------------------------------------------------------------------

function memoryStorage() {
  const map = new Map();
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
  };
}

/** Almacenamiento que el navegador bloquea: toda operación falla. */
const blockedStorage = () => ({
  getItem() { throw new Error('SecurityError'); },
  setItem() { throw new Error('SecurityError'); },
  removeItem() { throw new Error('SecurityError'); },
});

/** Almacenamiento que se llena: deja escribir hasta `limit` caracteres en total. */
function limitedStorage(limit) {
  const s = memoryStorage();
  const size = () => [...s.map.values()].reduce((n, v) => n + v.length, 0);
  return {
    ...s,
    setItem(k, v) {
      const before = s.map.get(k);
      s.map.set(k, String(v));
      if (size() > limit) {
        if (before === undefined) s.map.delete(k); else s.map.set(k, before);
        const err = new Error('full');
        err.name = 'QuotaExceededError';
        throw err;
      }
    },
  };
}

function fakeClock(start = Date.UTC(2026, 10, 12, 10, 0, 0)) {
  let t = start;
  const clock = () => t;
  clock.advance = (ms) => { t += ms; };
  return clock;
}

function ids() {
  let n = 0;
  return () => `id-${++n}`;
}

function fakeScheduler() {
  const tasks = [];
  const schedule = (fn, ms) => { tasks.push({ fn, ms }); return tasks.length; };
  schedule.runAll = () => { while (tasks.length) tasks.shift().fn(); };
  schedule.tasks = tasks;
  return schedule;
}

function brain({ seed = 1, generations = 10, name = 'x', lanes = 3 } = {}) {
  return createBrain({
    id: `tmp-${seed}`, name, now: '2026-11-01T00:00:00.000Z',
    network: createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: createRandom(seed) }),
    sensors: { count: 5, range: 3, spread: 90 },
    training: {
      generations, seed, maxSpeed: 15, fitness: { kind: 'distance', best: 100 + seed },
      evolution: { population: 100, elite: 1, selection: 10, mutationStrength: 10, mutationRate: 100, crossover: false, maxDuration: 60 },
      scenarios: [{ track: 'straight', lanes, density: 50, irregularity: 50, trafficMode: 'same', generations }],
    },
  });
}

function setup({ storage = memoryStorage() } = {}) {
  const clock = fakeClock();
  const schedule = fakeScheduler();
  const library = createLibrary({ storage, clock, newId: ids(), schedule });
  return { library, clock, schedule, storage };
}

const savedNames = (library) => library.list().filter((e) => e.origin === 'saved').map((e) => e.brain.name);

// --- 9.1 Nombre propio, renombrar, eliminar y actualizar ----------------------------------------

test('nombre sugerido: sin nombre y con "Cerebro 1" existente, se guarda como "Cerebro 2"', () => {
  const { library } = setup();
  assert.equal(library.save(brain({ seed: 1 }), { baseName: 'Cerebro' }).brain.name, 'Cerebro 1');
  assert.equal(library.suggestName('Cerebro'), 'Cerebro 2');
  assert.equal(library.save(brain({ seed: 2 }), { name: '   ', baseName: 'Cerebro' }).brain.name, 'Cerebro 2');
});

test('nombre repetido: guardar "Rayo" con un "Rayo" existente lo guarda como "Rayo (2)"', () => {
  const { library } = setup();
  library.save(brain({ seed: 1 }), { name: 'Rayo' });
  assert.equal(library.save(brain({ seed: 2 }), { name: 'Rayo' }).brain.name, 'Rayo (2)');
  assert.equal(library.save(brain({ seed: 3 }), { name: '  Rayo ' }).brain.name, 'Rayo (3)');
  assert.deepEqual(savedNames(library).sort(), ['Rayo', 'Rayo (2)', 'Rayo (3)']);
});

test('nombre demasiado largo: queda limitado a 40 caracteres, sin espacios en los bordes', () => {
  const { library } = setup();
  const long = 'A'.repeat(55);
  const saved = library.save(brain(), { name: `  ${long}  ` }).brain;
  assert.equal(saved.name, 'A'.repeat(40));
  assert.equal(saved.name.length, 40);
  // Con número entre paréntesis tampoco pasa de 40.
  const again = library.save(brain({ seed: 2 }), { name: long }).brain;
  assert.equal(again.name, `${'A'.repeat(36)} (2)`);
  assert.equal(again.name.length, 40);
  assert.equal(cleanName(`${'b'.repeat(39)}  c`), 'b'.repeat(39));
  assert.equal(uniqueName('x', []), 'x');
});

test('guardar: el cerebro recibe identificador y fechas de la biblioteca y conserva red, sensores y datos', () => {
  const { library } = setup();
  const original = brain({ seed: 7 });
  const r = library.save(original, { name: 'Prudente' });
  assert.equal(r.ok, true);
  assert.equal(r.brain.id, 'id-1');
  assert.equal(r.brain.createdAt, '2026-11-12T10:00:00.000Z');
  assert.equal(r.brain.updatedAt, '2026-11-12T10:00:00.000Z');
  assert.deepEqual(r.brain.network, original.network);
  assert.deepEqual(r.brain.sensors, original.sensors);
  assert.deepEqual(r.brain.training, original.training);
});

test('guardar un cerebro inválido no cambia la biblioteca', () => {
  const { library } = setup();
  const bad = copyBrain(brain());
  bad.network.layers[0].weights[0].pop();
  assert.deepEqual(library.save(bad, { name: 'Roto' }).code, 'shapeMismatch');
  assert.deepEqual(library.list(), []);
});

test('renombrar "Cerebro 1" como "Prudente": cambia el nombre y conserva red y datos', () => {
  const { library } = setup();
  const saved = library.save(brain({ seed: 4 }), { baseName: 'Cerebro' }).brain;
  assert.equal(saved.name, 'Cerebro 1');
  const r = library.rename(saved.id, 'Prudente');
  assert.equal(r.ok, true);
  const now = library.get(saved.id).brain;
  assert.equal(now.name, 'Prudente');
  assert.deepEqual(now.network, saved.network);
  assert.deepEqual(now.training, saved.training);
  assert.equal(now.id, saved.id);
});

test('renombrar con las mismas reglas que al guardar: repetido, largo y vacío', () => {
  const { library } = setup();
  library.save(brain({ seed: 1 }), { name: 'Rayo' });
  const other = library.save(brain({ seed: 2 }), { name: 'Otro' }).brain;
  assert.equal(library.rename(other.id, 'Rayo').brain.name, 'Rayo (2)');
  assert.equal(library.rename(other.id, 'Z'.repeat(50)).brain.name, 'Z'.repeat(40));
  assert.equal(library.rename(other.id, '   ').code, 'emptyName');
  assert.equal(library.get(other.id).brain.name, 'Z'.repeat(40), 'un nombre vacío no cambia nada');
});

test('cancelar el renombrado: si no se confirma, el cerebro conserva su nombre', () => {
  const { library } = setup();
  const saved = library.save(brain(), { name: 'Prudente' }).brain;
  // La vista no llama a rename cuando la persona presiona Escape: la biblioteca queda igual.
  assert.equal(library.get(saved.id).brain.name, 'Prudente');
});

test('eliminar "Prudente" (confirmado): desaparece de la biblioteca', () => {
  const { library } = setup();
  const p = library.save(brain(), { name: 'Prudente' }).brain;
  library.save(brain({ seed: 2 }), { name: 'Otro' });
  assert.equal(library.remove(p.id).ok, true);
  assert.deepEqual(savedNames(library), ['Otro']);
  assert.equal(library.get(p.id), null);
  assert.equal(library.remove(p.id).code, 'notFound');
});

test('eliminar cancelado: "Prudente" sigue sin cambios', () => {
  const { library } = setup();
  const p = library.save(brain(), { name: 'Prudente' }).brain;
  const before = JSON.stringify(library.list());
  // Cancelar la confirmación no llama a remove.
  assert.equal(JSON.stringify(library.list()), before);
  assert.deepEqual(library.get(p.id).brain, p);
});

test('actualizar "Prudente": tiene la red nueva y las generaciones acumuladas, sin un cerebro adicional', () => {
  const { library, clock } = setup();
  const p = library.save(brain({ seed: 1, generations: 10 }), { name: 'Prudente' }).brain;
  clock.advance(60000);
  const continued = brain({ seed: 9, generations: 15 });
  const r = library.update(p.id, continued);
  assert.equal(r.ok, true);
  const now = library.get(p.id).brain;
  assert.equal(now.name, 'Prudente');
  assert.equal(now.id, p.id);
  assert.equal(now.createdAt, p.createdAt);
  assert.equal(now.updatedAt, '2026-11-12T10:01:00.000Z');
  assert.deepEqual(now.network, continued.network);
  assert.equal(now.training.generations, 15);
  assert.equal(library.list().length, 1);
});

test('guardar como nuevo "Audaz": "Prudente" queda sin cambios y además aparece "Audaz"', () => {
  const { library } = setup();
  const p = library.save(brain({ seed: 1, generations: 10 }), { name: 'Prudente' }).brain;
  library.save(brain({ seed: 9, generations: 15 }), { name: 'Audaz' });
  assert.deepEqual(savedNames(library).sort(), ['Audaz', 'Prudente']);
  assert.deepEqual(library.get(p.id).brain, p);
});

// --- 9.2 Persistencia, orden y almacenamiento que falla ------------------------------------------

test('segunda visita: los dos cerebros guardados siguen, primero el más reciente', () => {
  const storage = memoryStorage();
  const first = setup({ storage });
  first.library.save(brain({ seed: 1 }), { name: 'Primero' });
  first.clock.advance(5000);
  first.library.save(brain({ seed: 2 }), { name: 'Segundo' });
  assert.ok(storage.getItem(STORAGE_KEYS.brains));
  const again = setup({ storage });
  assert.deepEqual(savedNames(again.library), ['Segundo', 'Primero']);
  assert.equal(again.library.status.problem, null);
  assert.equal(again.library.status.persistent, true);
});

test('orden: actualizar un cerebro lo pasa primero', () => {
  const { library, clock } = setup();
  const a = library.save(brain({ seed: 1 }), { name: 'A' }).brain;
  clock.advance(1000);
  library.save(brain({ seed: 2 }), { name: 'B' });
  clock.advance(1000);
  library.update(a.id, brain({ seed: 3 }));
  assert.deepEqual(savedNames(library), ['A', 'B']);
});

test('navegador sin almacenamiento: el cerebro aparece, se puede usar y exportar, y se avisa', () => {
  const { library } = setup({ storage: blockedStorage() });
  assert.deepEqual(library.status, { persistent: false, problem: 'unavailable' });
  const r = library.save(brain({ seed: 3 }), { name: 'Volátil' });
  assert.equal(r.ok, true);
  assert.deepEqual(savedNames(library), ['Volátil']);
  assert.deepEqual(JSON.parse(library.exportText(r.brain.id)).network, brain({ seed: 3 }).network);
  assert.equal(library.status.problem, 'unavailable');
  // Tampoco falla sin almacenamiento alguno.
  const none = setup({ storage: null });
  assert.equal(none.library.save(brain(), { name: 'X' }).ok, true);
  assert.equal(none.library.status.problem, 'unavailable');
});

test('espacio agotado: se avisa que no hay espacio y los cerebros ya guardados quedan intactos', () => {
  const one = JSON.stringify([{ ...brain({ seed: 1 }), id: 'id-1', name: 'Uno' }]).length;
  const storage = limitedStorage(one + 200);
  const { library } = setup({ storage });
  assert.equal(library.save(brain({ seed: 1 }), { name: 'Uno' }).warning, null);
  const stored = storage.getItem(STORAGE_KEYS.brains);
  const r = library.save(brain({ seed: 2 }), { name: 'Dos' });
  assert.equal(r.warning, 'quota');
  assert.equal(library.status.problem, 'quota');
  assert.equal(storage.getItem(STORAGE_KEYS.brains), stored, 'lo guardado antes no cambió');
  assert.deepEqual(JSON.parse(stored).map((b) => b.name), ['Uno']);
  // Al eliminar y volver a entrar en el espacio, el aviso se va.
  library.remove(r.brain.id);
  assert.equal(library.status.problem, null);
});

test('al cargar se ignoran entradas dañadas del almacenamiento', () => {
  const storage = memoryStorage();
  const good = { ...brain(), id: 'g', name: 'Bueno', updatedAt: '2026-11-12T10:00:00.000Z' };
  storage.setItem(STORAGE_KEYS.brains, JSON.stringify([good, { hola: 1 }]));
  storage.setItem(STORAGE_KEYS.current, 'no es json');
  const { library } = setup({ storage });
  assert.deepEqual(library.list().map((e) => e.brain.name), ['Bueno']);
});

test('suscripción: avisa en cada cambio y deja de avisar al cancelarla', () => {
  const { library } = setup();
  let calls = 0;
  const off = library.subscribe(() => { calls += 1; });
  const b = library.save(brain(), { name: 'A' }).brain;
  library.rename(b.id, 'B');
  library.remove(b.id);
  off();
  library.save(brain(), { name: 'C' });
  assert.equal(calls, 3);
});

// --- 9.3 Importar y exportar ----------------------------------------------------------------------

test('exportar: el texto contiene todo el cerebro y el nombre de archivo deriva del nombre', () => {
  const { library } = setup();
  const p = library.save(brain({ seed: 5 }), { name: 'Prudente' }).brain;
  const data = JSON.parse(library.exportText(p.id));
  assert.deepEqual(data, p);
  assert.equal(data.format, 'ml-lab-brain');
  assert.ok(data.network && data.sensors && data.training);
  assert.equal(exportFileName('Prudente'), 'prudente.json');
  assert.equal(exportFileName('Ñandú veloz (2)'), 'nandu-veloz-2.json');
  assert.equal(exportFileName('***'), 'brain.json');
  assert.equal(library.exportText('nada'), null);
});

test('ida y vuelta: exportar, eliminar e importar devuelve la misma red, sensores y datos', () => {
  const { library } = setup();
  const p = library.save(brain({ seed: 6 }), { name: 'Prudente' }).brain;
  const text = library.exportText(p.id);
  library.remove(p.id);
  assert.deepEqual(library.list(), []);
  const r = library.importText(text);
  assert.equal(r.ok, true);
  const back = library.get(r.brain.id).brain;
  assert.equal(back.name, 'Prudente');
  assert.deepEqual(back.network, p.network);
  assert.deepEqual(back.sensors, p.sensors);
  assert.deepEqual(back.training, p.training);
});

test('importar un cerebro que ya existe: se agrega aparte con número entre paréntesis y el original no cambia', () => {
  const { library } = setup();
  const p = library.save(brain({ seed: 6 }), { name: 'Prudente' }).brain;
  const r = library.importText(library.exportText(p.id));
  assert.equal(r.ok, true);
  assert.equal(r.brain.name, 'Prudente (2)');
  assert.notEqual(r.brain.id, p.id);
  assert.deepEqual(library.get(p.id).brain, p);
  assert.equal(savedNames(library).length, 2);
});

test('importar un archivo que no es un cerebro: se explica y la biblioteca no cambia', () => {
  const { library } = setup();
  library.save(brain(), { name: 'Prudente' });
  const before = JSON.stringify(library.list());
  assert.equal(library.importText('hola, no soy JSON').code, 'notABrain');
  assert.equal(library.importText('{"tipo":"receta"}').code, 'notABrain');
  assert.equal(library.importText('[1,2,3]').code, 'notABrain');
  assert.equal(JSON.stringify(library.list()), before);
});

test('importar un cerebro con pesos faltantes: dañado o incompleto, y la biblioteca no cambia', () => {
  const { library } = setup();
  const data = JSON.parse(JSON.stringify(brain()));
  data.network.layers[0].weights[1].splice(0, 2);
  const before = JSON.stringify(library.list());
  assert.equal(library.importText(JSON.stringify(data)).code, 'shapeMismatch');
  assert.equal(JSON.stringify(library.list()), before);
});

// --- 9.4 Autoguardado -----------------------------------------------------------------------------

const autosaves = (library) => library.list().filter((e) => e.origin === 'autosave').map((e) => [e.slot, e.brain.training.generations]);

test('recarga de la página: tras 12 generaciones, la biblioteca muestra un autoguardado con 12', () => {
  const storage = memoryStorage();
  const { library, clock } = setup({ storage });
  for (let g = 1; g <= 12; g++) {
    clock.advance(1500);
    library.autosave(brain({ generations: g }), { session: 's1' });
  }
  const reloaded = setup({ storage });
  assert.deepEqual(autosaves(reloaded.library), [['current', 12]]);
});

test('autoguardado: como máximo una escritura por segundo; lo demorado se escribe después o al forzarlo', () => {
  const storage = memoryStorage();
  let writes = 0;
  const counting = { ...storage, setItem: (k, v) => { if (k === STORAGE_KEYS.current) writes += 1; storage.setItem(k, v); } };
  const { library, clock, schedule } = setup({ storage: counting });
  for (let g = 1; g <= 30; g++) {
    clock.advance(50); // treinta generaciones en 1,5 segundos (velocidad máxima)
    library.autosave(brain({ generations: g }), { session: 's1' });
  }
  assert.equal(writes, 2, 'una al empezar y otra pasado el segundo');
  // En memoria ya está la última.
  assert.deepEqual(autosaves(library), [['current', 30]]);
  // Lo pendiente se escribe más tarde, una sola vez, a la espera que pide el límite.
  assert.equal(schedule.tasks.length, 1);
  assert.ok(schedule.tasks[0].ms > 0 && schedule.tasks[0].ms <= AUTOSAVE_INTERVAL_MS);
  schedule.runAll();
  assert.equal(writes, 3);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEYS.current)).brain.training.generations, 30);
  // flush escribe de inmediato lo pendiente (al pausar, salir u ocultarse la página).
  clock.advance(10);
  library.autosave(brain({ generations: 31 }), { session: 's1' });
  library.flush();
  assert.equal(writes, 4);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEYS.current)).brain.training.generations, 31);
  library.flush(); // sin nada pendiente no escribe
  assert.equal(writes, 4);
});

test('reinicio del entrenamiento: el nuevo con 1 generación y el anterior con 30', () => {
  const storage = memoryStorage();
  const { library, clock } = setup({ storage });
  for (let g = 1; g <= 30; g++) { clock.advance(2000); library.autosave(brain({ generations: g }), { session: 'a' }); }
  // Se reinicia: mientras el nuevo no termine una generación, el de 30 sigue a la vista.
  assert.deepEqual(autosaves(library), [['current', 30]]);
  clock.advance(2000);
  library.autosave(brain({ seed: 2, generations: 1 }), { session: 'b' });
  assert.deepEqual(autosaves(library), [['current', 1], ['previous', 30]]);
  assert.deepEqual(autosaves(setup({ storage }).library), [['current', 1], ['previous', 30]]);
});

test('reinicio sin generaciones terminadas: no rota y conserva el entrenamiento anterior', () => {
  const { library, clock } = setup();
  library.autosave(brain({ generations: 30 }), { session: 'a' });
  clock.advance(2000);
  library.autosave(brain({ generations: 5 }), { session: 'b' });
  // El entrenamiento "c" se abandona sin terminar ninguna generación: nunca autoguarda.
  clock.advance(2000);
  library.autosave(brain({ generations: 1 }), { session: 'd' });
  assert.deepEqual(autosaves(library), [['current', 1], ['previous', 5]]);
});

test('conservar un autoguardado: guardarlo con nombre lo vuelve un cerebro que los entrenamientos no reemplazan', () => {
  const { library, clock } = setup();
  library.autosave(brain({ generations: 12 }), { session: 'a' });
  const auto = library.list().find((e) => e.origin === 'autosave').brain;
  const kept = library.save(auto, { name: 'Conservado' }).brain;
  for (const [g, s] of [[13, 'a'], [1, 'b'], [1, 'c']]) { clock.advance(2000); library.autosave(brain({ generations: g }), { session: s }); }
  assert.deepEqual(library.get(kept.id).brain.training.generations, 12);
  assert.deepEqual(savedNames(library), ['Conservado']);
  // Un autoguardado no se renombra desde la biblioteca, pero se puede eliminar (panel-de-entrenar-por-vistas D14).
  const current = library.list().find((e) => e.slot === 'current').brain;
  assert.equal(library.remove(current.id).ok, true);
  assert.equal(library.list().some((e) => e.slot === 'current'), false);
});

test('empezar un entrenamiento nuevo pasa el autoguardado del anterior a "entrenamiento anterior" en el acto', () => {
  const storage = memoryStorage();
  const { library, clock } = setup({ storage });
  library.autosave(brain({ generations: 30 }), { session: 'a' });
  clock.advance(2000);
  library.beginTraining('b');
  assert.deepEqual(autosaves(library), [['previous', 30]]);
  assert.deepEqual(autosaves(setup({ storage }).library), [['previous', 30]]);
  // El nuevo termina su primera generación.
  library.autosave(brain({ generations: 1 }), { session: 'b' });
  assert.deepEqual(autosaves(library), [['current', 1], ['previous', 30]]);
  // Se abandona "c" sin terminar ninguna generación: al empezar "d", "b" pasa a anterior.
  library.beginTraining('c');
  assert.deepEqual(autosaves(library), [['previous', 1]]);
  library.beginTraining('d');
  assert.deepEqual(autosaves(library), [['previous', 1]], '"c" no tenía autoguardado: el anterior se conserva');
  library.beginTraining('d');
  assert.deepEqual(autosaves(library), [['previous', 1]]);
});

test('orden de la lista: primero los guardados (el más reciente primero) y después los autoguardados', () => {
  const { library, clock } = setup();
  library.autosave(brain({ generations: 3 }), { session: 'a' });
  library.save(brain({ seed: 1 }), { name: 'Viejo' });
  clock.advance(1000);
  library.save(brain({ seed: 2 }), { name: 'Nuevo' });
  assert.deepEqual(library.list().map((e) => [e.origin, e.brain.name]), [['saved', 'Nuevo'], ['saved', 'Viejo'], ['autosave', 'x']]);
});

// --- panel-de-entrenar-por-vistas D4: deshacer una actualización ------------------------------------

test('deshacer una actualización: "Prudente" vuelve a ser idéntico al de antes, también guardado', () => {
  const { library, clock, storage } = setup();
  const p = library.save(brain({ seed: 1, generations: 10 }), { name: 'Prudente' }).brain;
  library.save(brain({ seed: 2, generations: 4 }), { name: 'Otro' });
  clock.advance(60000);
  const before = library.snapshot(p.id);
  const storedBefore = storage.getItem(STORAGE_KEYS.brains);
  assert.equal(library.update(p.id, brain({ seed: 9, generations: 15 })).ok, true);
  assert.notDeepEqual(library.get(p.id).brain, before);
  const r = library.restore(before);
  assert.equal(r.ok, true);
  assert.deepEqual(library.get(p.id).brain, before);
  assert.deepEqual(library.get(p.id).brain, p);
  assert.deepEqual(savedNames(library), ['Otro', 'Prudente']);
  assert.equal(storage.getItem(STORAGE_KEYS.brains), storedBefore);
});

test('deshacer: la copia tomada antes no cambia aunque cambie el cerebro, y uno eliminado no vuelve', () => {
  const { library } = setup();
  const p = library.save(brain({ seed: 1 }), { name: 'Prudente' }).brain;
  const before = library.snapshot(p.id);
  library.rename(p.id, 'Audaz');
  assert.equal(before.name, 'Prudente');
  assert.equal(library.snapshot('nadie'), null);
  library.remove(p.id);
  assert.equal(library.restore(before).ok, false);
  assert.equal(library.list().length, 0);
});

// --- Eliminar cualquier cerebro (panel-de-entrenar-por-vistas D14) ---------------------------------

test('Eliminar el entrenamiento anterior: desaparece y no vuelve hasta que se abandone otro entrenamiento', () => {
  const storage = memoryStorage();
  const { library, clock } = setup({ storage });
  library.autosave(brain({ seed: 1, generations: 30 }), { session: 'a' });
  clock.advance(2000);
  library.autosave(brain({ seed: 2, generations: 2 }), { session: 'b' });
  const previous = library.list().find((e) => e.slot === 'previous').brain;
  assert.equal(library.remove(previous.id).ok, true);
  assert.deepEqual(autosaves(library), [['current', 2]]);
  assert.deepEqual(autosaves(setup({ storage }).library), [['current', 2]]); // también en el almacenamiento
  // Más generaciones del mismo entrenamiento: el anterior no vuelve.
  clock.advance(2000);
  library.autosave(brain({ seed: 2, generations: 3 }), { session: 'b' });
  assert.deepEqual(autosaves(library), [['current', 3]]);
  // Se abandona "b": ahora sí hay un entrenamiento anterior, el de "b".
  library.beginTraining('c');
  assert.deepEqual(autosaves(library), [['previous', 3]]);
});

test('Eliminar el entrenamiento en curso: desaparece y reaparece al terminar la generación siguiente', () => {
  const storage = memoryStorage();
  const { library, clock } = setup({ storage });
  library.autosave(brain({ generations: 7 }), { session: 'a' });
  const current = library.list().find((e) => e.slot === 'current').brain;
  assert.equal(library.remove(current.id).ok, true);
  assert.deepEqual(autosaves(library), []);
  assert.deepEqual(autosaves(setup({ storage }).library), []);
  clock.advance(2000);
  library.autosave(brain({ generations: 8 }), { session: 'a' });
  assert.deepEqual(autosaves(library), [['current', 8]]);
});

test('Biblioteca vacía: se eliminan los guardados y los dos autoguardados', () => {
  const { library, clock } = setup();
  library.save(brain({ generations: 4 }), { name: 'Prudente' });
  library.autosave(brain({ seed: 1, generations: 5 }), { session: 'a' });
  clock.advance(2000);
  library.autosave(brain({ seed: 2, generations: 1 }), { session: 'b' });
  assert.equal(library.list().length, 3);
  for (const e of library.list()) assert.equal(library.remove(e.brain.id).ok, true, e.origin);
  assert.deepEqual(library.list(), []);
  assert.equal(library.remove('nada').code, 'notFound');
});
