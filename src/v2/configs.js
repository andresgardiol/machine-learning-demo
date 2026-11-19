// Configuración con que arranca cada etapa de la V2, sin DOM (design.md D9, prueba de igualdad 9.2).
// Arma lo mismo que la V1 a partir de su lógica pura: el escenario de la etapa y sus ajustes de fábrica.
import { worldSpec as driveWorldSpec } from '../tabs/drive/settings.js';
import { worldSpec as streetWorldSpec } from '../tabs/shared/street-settings.js';
import { DEFAULT_SETTINGS as TRAIN_DEFAULTS, trainingConfig, hiddenOf } from '../tabs/train/settings.js';

/** El problema: el mundo con el escenario de la etapa y los sensores por defecto (maneja una persona). */
export const problemaWorld = (scenario, seed) => driveWorldSpec(scenario, seed);

/** Reglas a mano: el mundo con el escenario de la etapa y los sensores del programa. */
export const reglasWorld = (scenario, sensors, seed) => streetWorldSpec({ ...scenario, sensorCount: sensors.count, sensorRange: sensors.range, sensorSpread: sensors.spread }, seed);

/**
 * Aprender por evolución: los ajustes de fábrica de Entrenar con el escenario de la etapa. La pista del
 * escenario no se usa: la etapa tiene sus propias pistas de entrenamiento (spec *Pistas del entrenamiento*).
 */
export function evolucionSettings(scenario, settings = TRAIN_DEFAULTS) {
  return { ...settings, lanes: scenario.lanes, density: scenario.density, irregularity: scenario.irregularity, maxSpeed: scenario.maxSpeed };
}
export const evolucionConfig = (scenario, settings = TRAIN_DEFAULTS) => trainingConfig(evolucionSettings(scenario, settings));

/** Red de fábrica de Aprender por evolución. */
export const evolucionNetwork = (settings = TRAIN_DEFAULTS) => ({ hidden: hiddenOf(settings), activation: settings.activation });

/** Evaluar: el escenario de la carrera. */
export const evaluarRace = (scenario) => ({ track: scenario.track, lanes: scenario.lanes, density: scenario.density, irregularity: scenario.irregularity, maxSpeed: scenario.maxSpeed });
