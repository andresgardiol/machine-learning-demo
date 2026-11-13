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

/** Meta de una carrera en texto ("Carrera a 1000 m." o "Carrera a 2 vueltas."). */
export const goalText = (t, goal) => (goal.kind === 'laps'
  ? t(goal.value === 1 ? 'stage.describe.goalLap' : 'stage.describe.goalLaps', { value: goal.value })
  : t('stage.describe.goalMeters', { value: goal.value }));

/**
 * Competir (pestana-competir D11): la pista, la meta, cuántos corren, quién va primero (o quién
 * ganó) y a quién sigue la cámara.
 * @param {{t:Function, track:string, lanes:number, goal:{kind:string, value:number}, count:number,
 *   phase:'waiting'|'running'|'paused'|'finished', leader:string|null, winner:string|null, followed:string|null,
 *   machineView?:boolean}} spec
 */
export function raceDescription({ t, track, lanes, goal, count, phase, leader, winner, followed, machineView = false }) {
  const parts = [trackText(t, track, lanes), goalText(t, goal), t('stage.describe.racers', { count })];
  if (phase === 'waiting') parts.push(t('stage.describe.raceWaiting'));
  else if (phase === 'finished') parts.push(winner ? t('stage.describe.raceWon', { name: winner }) : t('stage.describe.raceNoWinner'));
  else {
    if (leader) parts.push(t('stage.describe.raceLeader', { name: leader }));
    if (phase === 'paused') parts.push(t('stage.describe.racePaused'));
  }
  if (followed) parts.push(t('stage.describe.raceFollowing', { name: followed }));
  return withMachine(t, parts, machineView);
}
