// Prueba de igualdad (interfaz-v2, tarea 9.2): la configuración por defecto de cada etapa de la V2 es la
// de la V1, y con la misma semilla el entrenamiento da el mismo historial y el mismo campeón. No mide si
// la red aprende: compara resultados.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createScenario } from '../../src/v2/scenario.js';
import { problemaWorld, evolucionConfig, evolucionNetwork, evaluarRace } from '../../src/v2/configs.js';
import { DEFAULT_SETTINGS as DRIVE_DEFAULTS, worldSpec as driveWorldSpec } from '../../src/tabs/drive/settings.js';
import { DEFAULT_SETTINGS as TRAIN_DEFAULTS, trainingConfig, hiddenOf } from '../../src/tabs/train/settings.js';
import { createTraining, TRAINING_IRREGULARITY } from '../../src/core/training.js';
import { DEFAULT_LANES, MAX_SPEED } from '../../src/core/constants.js';
import { DEFAULT_TRAFFIC } from '../../src/core/traffic.js';

test('igualdad: El problema arma el mismo mundo que la V1', () => {
  const s = createScenario();
  assert.deepEqual(problemaWorld(s.forStage('problema'), 7), driveWorldSpec(DRIVE_DEFAULTS, 7));
});

test('igualdad: Aprender por evolución arma la misma configuración y la misma red que Entrenar de la V1', () => {
  const s = createScenario();
  assert.deepEqual(evolucionConfig(s.forStage('evolucion')), trainingConfig(TRAIN_DEFAULTS));
  assert.deepEqual(evolucionNetwork(), { hidden: hiddenOf(TRAIN_DEFAULTS), activation: TRAIN_DEFAULTS.activation });
});

test('igualdad: Evaluar arma el escenario de carrera de Competir de la V1', () => {
  const s = createScenario();
  // Los valores de BAR_DEFAULTS de src/tabs/compete/index.js (ese módulo arma pantalla y no se importa acá).
  assert.deepEqual(evaluarRace(s.forStage('evaluar')), { track: 'straight', lanes: DEFAULT_LANES, density: DEFAULT_TRAFFIC.density, irregularity: TRAINING_IRREGULARITY, maxSpeed: MAX_SPEED });
});

test('igualdad: 5 generaciones con la semilla 1 dan el mismo historial y el mismo campeón (escenario Entrenamiento igual en las dos versiones)', () => {
  const s = createScenario();
  const v1 = createTraining({ seed: 1, config: trainingConfig({ ...TRAIN_DEFAULTS, population: 20, maxDuration: 10 }) });
  const v2 = createTraining({ seed: 1, config: evolucionConfig(s.forStage('evolucion'), { ...TRAIN_DEFAULTS, population: 20, maxDuration: 10 }) });
  for (const t of [v1, v2]) while (t.history.length < 5) t.step();
  assert.deepEqual(v2.history, v1.history);
  assert.deepEqual(v2.champion, v1.champion);
});
