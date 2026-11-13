// Texto de la descripción del escenario de cada pestaña (panel-de-entrenar-por-vistas D9), sin DOM:
// la pista, el estado de lo que pasa y el dato principal. Lo escribe ui/stage-description.js.

/** La pista: la calle recta con sus carriles y tráfico, o un circuito por su nombre, sin tráfico. */
function trackText(t, track, lanes) {
  return track === 'straight'
    ? t('stage.describe.straight', { lanes })
    : t('stage.describe.circuit', { track: t(`track.${track}`) });
}

const withMachine = (t, parts, machineView) => (machineView ? [...parts, t('stage.describe.machine')] : parts).join(' ');

/**
 * El problema y Reglas a mano: pista, estado del auto (en marcha, en pausa o chocó) y metros recorridos.
 * @param {{t:Function, track:string, lanes:number, paused:boolean, crashed:boolean, meters:number, machineView?:boolean}} spec
 */
export function drivingDescription({ t, track, lanes, paused, crashed, meters, machineView = false }) {
  const value = Math.floor(meters);
  const state = crashed ? 'stage.describe.crashed' : paused ? 'stage.describe.paused' : 'stage.describe.running';
  return withMachine(t, [trackText(t, track, lanes), t(state, { value })], machineView);
}

/**
 * Entrenar: pista de la generación en curso, generación, autos en carrera y si está en pausa.
 * @param {{t:Function, track:string, lanes:number, generation:number, alive:number, total:number, paused:boolean, machineView?:boolean}} spec
 */
export function trainingDescription({ t, track, lanes, generation, alive, total, paused, machineView = false }) {
  return withMachine(t, [
    trackText(t, track, lanes),
    t('stage.describe.generation', { generation, alive, total }),
    t(paused ? 'stage.describe.trainPaused' : 'stage.describe.trainRunning'),
  ], machineView);
}
