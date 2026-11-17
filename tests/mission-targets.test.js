// Qué control muestra "Mostrame" para cada misión (misiones-que-muestran-el-control D1): la tabla
// sin DOM, contra las tablas de la spec "Controles de las misiones de …".
import test from 'node:test';
import assert from 'node:assert/strict';
import { missionTarget, MISSION_TARGET_TABS } from '../src/ui/mission-targets.js';
import { MISSIONS as DRIVE } from '../src/tabs/drive/session.js';
import { MISSIONS as RULES } from '../src/tabs/rules/session.js';
import { MISSIONS as TRAIN } from '../src/tabs/train/session.js';
import { MISSIONS as COMPETE } from '../src/tabs/compete/missions.js';
import { MISSION_IDS as INSPECT } from '../src/tabs/inspect/missions.js';
import { MISSION_IDS as LAB, GATE_MISSION_IDS as LAB_GATES } from '../src/tabs/lab/missions.js';

const SESSIONS = {
  drive: DRIVE.map((m) => m.id),
  rules: RULES.map((m) => m.id),
  train: TRAIN.map((m) => m.id),
  compete: COMPETE.map((m) => m.id),
  inspect: [...INSPECT],
  lab: [...LAB_GATES, ...LAB],
};

// La spec, fila por fila. null: "—" (sin botón).
const SPEC = {
  drive: { pass: null, distance: null, machine: { targets: ['machineView'] } },
  rules: { pass: { targets: ['editor'] }, passMany: { targets: ['editor'] }, traffics: { targets: ['newTraffic'] } },
  train: { generations: null, passed: null, save: { targets: ['save'] }, fitness: { targets: ['fitness'], view: 'settings' } },
  compete: { tracks: { targets: ['track'] }, unseen: { targets: ['track'] }, beatBrain: { targets: ['run'] } },
  inspect: {
    follow: { targets: ['step', 'sizeOperation'] },
    decision: { targets: ['manualInput'], select: 'firstInput' },
    off: { targets: ['turnOff'], select: 'firstHidden' },
  },
};

test('toda misión de cada sesión tiene una entrada en la tabla, y nada más', () => {
  for (const [tab, ids] of Object.entries(SESSIONS)) {
    assert.deepEqual([...MISSION_TARGET_TABS[tab]].sort(), [...ids].sort(), tab);
  }
  assert.deepEqual(Object.keys(MISSION_TARGET_TABS).sort(), Object.keys(SESSIONS).sort());
});

test('cada fila fija coincide con la spec; las marcadas "—" devuelven null', () => {
  for (const [tab, rows] of Object.entries(SPEC)) {
    for (const [id, want] of Object.entries(rows)) {
      const got = missionTarget(tab, id, {});
      if (want === null) assert.equal(got, null, `${tab}.${id}`);
      else assert.deepEqual({ ...got, targets: [...got.targets] }, want, `${tab}.${id}`);
    }
  }
});

test('cuenta de la spec: 18 filas con control de 22', () => {
  let withControl = 0, total = 0;
  for (const [tab, ids] of Object.entries(SESSIONS)) {
    for (const id of ids) { total++; if (missionTarget(tab, id, { gate: 'and', hiddenLayers: 0 })) withControl++; }
  }
  assert.equal(total, 22);
  // Todas las del Laboratorio tienen control; sin control: drive pass/distance y train generations/passed.
  assert.equal(withControl, 18);
});

test('Laboratorio: AND siempre muestra el primer peso', () => {
  for (const gate of ['and', 'or', 'xor']) {
    assert.deepEqual([...missionTarget('lab', 'gateAnd', { gate, hiddenLayers: 0 }).targets], ['firstWeight']);
  }
});

test('Laboratorio: OR depende de la compuerta elegida', () => {
  assert.deepEqual([...missionTarget('lab', 'gateOr', { gate: 'and', hiddenLayers: 0 }).targets], ['gateOr']);
  assert.deepEqual([...missionTarget('lab', 'gateOr', { gate: 'xor', hiddenLayers: 1 }).targets], ['gateOr']);
  assert.deepEqual([...missionTarget('lab', 'gateOr', { gate: 'or', hiddenLayers: 0 }).targets], ['firstWeight']);
});

test('Laboratorio: XOR depende de la compuerta, de las capas ocultas y de si "Agregar una capa oculta" está', () => {
  const t = (s) => [...missionTarget('lab', 'gateXor', s).targets];
  assert.deepEqual(t({ gate: 'and', hiddenLayers: 0 }), ['gateXor']);
  assert.deepEqual(t({ gate: 'xor', hiddenLayers: 0, addHidden: true }), ['addHidden']);
  assert.deepEqual(t({ gate: 'xor', hiddenLayers: 1, addHidden: false }), ['firstWeight']);
  // Sin la explicación todavía, el botón no existe: el primer peso, que es lo que hay que probar.
  assert.deepEqual(t({ gate: 'xor', hiddenLayers: 0, addHidden: false }), ['firstWeight']);
});

test('Laboratorio: memorizar devuelve tres controles; seguir una corrección, Paso y «De a: Fase»', () => {
  assert.deepEqual([...missionTarget('lab', 'memorize', {}).targets], ['count', 'noise', 'hiddenLayers']);
  assert.deepEqual([...missionTarget('lab', 'follow', {}).targets], ['step', 'sizePhase']);
  assert.deepEqual([...missionTarget('lab', 'save', {}).targets], ['saveBrain']);
});

test('mismo estado, mismo resultado', () => {
  const states = [{}, { gate: 'and', hiddenLayers: 0 }, { gate: 'or', hiddenLayers: 2 }, { gate: 'xor', hiddenLayers: 0, addHidden: true }];
  for (const [tab, ids] of Object.entries(SESSIONS)) {
    for (const id of ids) {
      for (const s of states) assert.deepEqual(missionTarget(tab, id, { ...s }), missionTarget(tab, id, { ...s }), `${tab}.${id}`);
    }
  }
});

test('pestaña o misión desconocida: null', () => {
  assert.equal(missionTarget('nope', 'pass'), null);
  assert.equal(missionTarget('drive', 'nope'), null);
  assert.equal(missionTarget('drive', 'machine', null) !== null, true);
});
