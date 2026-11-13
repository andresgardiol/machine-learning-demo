// Lo que un cerebro sabe de cada pista (pestana-competir, design.md D7), sin DOM: si entrenó en ella,
// si en la calle recta entrenó siempre con el mismo tráfico, y si practicó con el tráfico de
// práctica de la barra (D2). El programa y la persona no llevan marca.
import { scenarioTracks } from '../../core/brain.js';

const scenariosOf = (brain) => (Array.isArray(brain?.training?.scenarios) ? brain.training.scenarios : []);
const trained = (s) => Number.isInteger(s.generations) && s.generations > 0;
const onStreet = (s) => scenarioTracks(s.track).includes('straight');

/** ¿Algún escenario con generaciones incluye esa pista? */
export function trainedOn(brain, trackId) {
  return scenariosOf(brain).some((s) => trained(s) && scenarioTracks(s.track).includes(trackId));
}

/** ¿Tiene escenarios de calle recta con generaciones y todos son del modo "mismo tráfico"? */
export function sameTrafficOnly(brain) {
  const street = scenariosOf(brain).filter((s) => trained(s) && onStreet(s));
  return street.length > 0 && street.every((s) => s.trafficMode === 'same');
}

/**
 * Marca de un cerebro en una pista: 'trained', 'trainedSame' (calle recta, siempre el mismo tráfico)
 * o 'unseen'. Sin cerebro (un programa o la persona), null.
 */
export function markFor(brain, trackId) {
  if (!brain) return null;
  if (!trainedOn(brain, trackId)) return 'unseen';
  if (trackId === 'straight' && sameTrafficOnly(brain)) return 'trainedSame';
  return 'trained';
}

/**
 * ¿Practicó con el tráfico de práctica de la barra (D2)? Tiene un escenario de calle recta en modo
 * "mismo tráfico", con generaciones y con los mismos carriles, densidad e irregularidad.
 * @param {object} brain
 * @param {{lanes:number, density:number, irregularity:number}} street
 */
export function practicedTraffic(brain, { lanes, density, irregularity }) {
  return scenariosOf(brain).some((s) => trained(s) && onStreet(s) && s.trafficMode === 'same'
    && s.lanes === lanes && s.density === density && s.irregularity === irregularity);
}
