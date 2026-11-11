// Mundo: une pista, tráfico, autos, sensores y controladores, y avanza en pasos fijos.
//
// Admite uno o más autos (agentes) sobre la misma pista y el mismo tráfico (design.md D1). Cada
// agente tiene su controlador, sus sensores, su velocidad máxima, su progreso, su percepción y su
// estado de choque. Los autos no se detectan ni chocan entre sí: solo perciben y chocan con los
// bordes y el tráfico. Sin `cars`, el mundo tiene un solo auto y todo lo de siempre (`car`,
// `progress`, `rays`, `setController`, …) se refiere a él; con varios, se refiere al primero.
//
// El tráfico se consulta una vez por paso para el tramo que cubre a todos los agentes en carrera y
// a cada uno se le entregan los vehículos de su propio tramo, con el mismo criterio y el mismo
// orden que si estuviera solo (design.md D2): un auto se comporta igual solo o acompañado.
import { createStraightStreet } from './track.js';
import { changeTraffic, createTraffic } from './traffic.js';
import {
  createCar, stepCar, carContour, normalizedSpeed, configureSensors, resetSensors, maxSpeedOf,
} from './car.js';
import { readSensors, rangeMeters } from './sensors.js';
import { normalizeControls, idleController, isController } from './controller.js';
import { outline, segmentIntersection, contoursTouch, distance } from './geometry.js';
import { STEP, CAR_LENGTH, REVERSE_FRACTION, TRAFFIC_CHANGE_AHEAD, TRAFFIC_SPEED } from './constants.js';

/**
 * @param {object} spec
 * @param {number} spec.seed semilla del tráfico
 * @param {number} [spec.lanes] 2, 3 o 4 (3 por defecto)
 * @param {number} [spec.density] % de tráfico
 * @param {number} [spec.irregularity] % de irregularidad
 * @param {object} [spec.sensors] { count, range, spread } (mundo de un auto)
 * @param {number} [spec.maxSpeed] velocidad máxima de avance del auto (m/s), de 12 a 40; 15 por defecto (mundo de un auto)
 * @param {object} [spec.controller] objeto con control(perception) (ver controller.js) (mundo de un auto)
 * @param {{controller?:object, sensors?:object, maxSpeed?:number}[]} [spec.cars] varios autos, cada uno con lo suyo
 */
export function createWorld(spec = {}) {
  const { seed = 1, lanes, density, irregularity } = spec;
  const track = createStraightStreet({ lanes });
  let trafficConfig = { density, irregularity };
  let traffic = createTraffic({ seed, track, ...trafficConfig });
  const startLane = Math.floor(track.lanes / 2);

  const carSpecs = Array.isArray(spec.cars) && spec.cars.length > 0
    ? spec.cars
    : [{ controller: spec.controller, sensors: spec.sensors, maxSpeed: spec.maxSpeed }];

  const agents = carSpecs.map((c) => ({
    controller: isController(c?.controller) ? c.controller : idleController,
    car: null,
    segmentIndex: 0,
    progress: 0,
    crashCause: null,
    nearby: [],
    rays: [],
    perception: null,
    initialSensors: c?.sensors,
    initialMaxSpeed: c?.maxSpeed,
    get crashed() { return this.car.crashed; },
  }));
  const first = agents[0];

  let paused = false;
  let time;
  let steps;

  const windowRadius = (agent) => rangeMeters(agent.car.sensors) + 2 * CAR_LENGTH;

  /** Actualiza el progreso (y el tramo de pista) del agente a partir de su posición. */
  function locate(agent) {
    const p = track.progressOf(agent.car.position, agent.segmentIndex);
    agent.segmentIndex = p.segmentIndex;
    agent.progress = p.progress;
  }

  /**
   * Vehículos del tráfico para un grupo de agentes ya ubicados: una sola consulta para el tramo
   * que los cubre a todos. Devuelve la lista (en el orden del tráfico) y el tramo pedido.
   */
  function trafficFor(group) {
    let from = Infinity;
    let to = -Infinity;
    for (const a of group) {
      const radius = windowRadius(a);
      if (a.progress - radius < from) from = a.progress - radius;
      if (a.progress + radius > to) to = a.progress + radius;
    }
    return { from, to, list: traffic.vehicles(time, from, to) };
  }

  /** Vehículos del tramo propio del agente, con el mismo criterio y orden que una consulta directa. */
  function nearbyFor(agent, shared) {
    const radius = windowRadius(agent);
    const from = agent.progress - radius;
    const to = agent.progress + radius;
    if (from === shared.from && to === shared.to) return shared.list;
    const out = [];
    for (const v of shared.list) if (v.distance >= from && v.distance <= to) out.push(v);
    return out;
  }

  /** Percepción del agente: obstáculos cercanos (bordes y tráfico) y lectura de sus rayos. */
  function sense(agent, shared) {
    const { car } = agent;
    agent.nearby = nearbyFor(agent, shared);
    const range = rangeMeters(car.sensors);
    const obstacles = [...track.bordersNear(car.position, range)];
    for (const v of agent.nearby) {
      if (distance(v.position, car.position) <= range + CAR_LENGTH) obstacles.push(...outline(v.contour));
    }
    agent.rays = readSensors(car, car.sensors, obstacles);
    agent.perception = { sensors: agent.rays.map((r) => r.reading), speed: normalizedSpeed(car) };
  }

  /** Ubica y percibe a un grupo de agentes con una sola consulta al tráfico. */
  function look(group) {
    if (group.length === 0) return;
    for (const a of group) locate(a);
    const shared = trafficFor(group);
    for (const a of group) sense(a, shared);
  }

  function findCrash(agent) {
    const { car } = agent;
    const contour = carContour(car);
    const edges = outline(contour);
    for (const [a, b] of track.bordersNear(car.position, CAR_LENGTH)) {
      for (const [c, d] of edges) if (segmentIntersection(a, b, c, d)) return 'edge';
    }
    for (const v of agent.nearby) {
      if (distance(v.position, car.position) <= CAR_LENGTH * 1.5 && contoursTouch(contour, v.contour)) return 'vehicle';
    }
    return null;
  }

  /** Vuelve al estado inicial con la misma semilla y la configuración actual (también la del tráfico). */
  function reset() {
    traffic = createTraffic({ seed, track, ...trafficConfig });
    for (const a of agents) {
      a.car = createCar({
        position: track.laneCenter(startLane, 0).position, angle: 0,
        sensors: a.car ? a.car.sensors : a.initialSensors,
        maxSpeed: a.car ? a.car.maxSpeed : a.initialMaxSpeed,
      });
      a.segmentIndex = 0;
      a.progress = 0;
      a.crashCause = null;
    }
    time = 0;
    steps = 0;
    look(agents);
  }

  /** Avanza un paso de simulación (1/60 s) para cada auto en carrera. No hace nada en pausa ni con todos chocados. */
  function step() {
    if (paused) return;
    const running = agents.filter((a) => !a.car.crashed);
    if (running.length === 0) return;
    for (const a of running) stepCar(a.car, normalizeControls(a.controller.control(a.perception)), STEP);
    steps += 1;
    time = steps * STEP;
    look(running);
    const crashed = [];
    for (const a of running) {
      const cause = findCrash(a);
      if (cause) {
        a.car.crashed = true;
        a.car.speed = 0;
        a.crashCause = cause;
        crashed.push(a);
      }
    }
    look(crashed);
  }

  reset();

  /** Copia plana del estado de un agente. */
  const agentSnapshot = (a) => ({
    progress: a.progress, crashCause: a.crashCause,
    car: { position: { ...a.car.position }, angle: a.car.angle, speed: a.car.speed, crashed: a.car.crashed },
    perception: { sensors: [...a.perception.sensors], speed: a.perception.speed },
  });

  const world = {
    track, seed, step, reset,
    pause() { paused = true; },
    resume() { paused = false; },
    setController(next) { if (isController(next)) first.controller = next; },
    /** Cambia la velocidad máxima en marcha, sin reiniciar; si el auto va más rápido, baja al nuevo tope. */
    setMaxSpeed(value) {
      const { car } = first;
      car.maxSpeed = maxSpeedOf(value);
      car.speed = Math.min(Math.max(car.speed, -car.maxSpeed * REVERSE_FRACTION), car.maxSpeed);
      look([first]);
    },
    /**
     * Cambia densidad e irregularidad en marcha, sin reiniciar: lo que está hasta TRAFFIC_CHANGE_AHEAD
     * por delante del auto no cambia y el tráfico nuevo empieza más adelante (ver changeTraffic).
     */
    setTraffic(partial) {
      trafficConfig = { ...trafficConfig, ...partial };
      const next = createTraffic({ seed, track, ...trafficConfig });
      traffic = changeTraffic(traffic, next, first.progress + TRAFFIC_CHANGE_AHEAD - TRAFFIC_SPEED * time);
      look(agents);
    },
    configureSensors(partial) { configureSensors(first.car, partial); look([first]); },
    resetSensors() { resetSensors(first.car); look([first]); },
    /** Vehículos del tráfico con su posición sobre la línea central en [from, to], en el instante actual. */
    vehiclesIn(from, to) { return traffic.vehicles(time, from, to); },
    /** Copia plana del estado (del primer auto) para pruebas, comparaciones y dibujo. */
    snapshot() {
      return {
        time, steps, paused, progress: first.progress, crashCause: first.crashCause,
        car: { position: { ...first.car.position }, angle: first.car.angle, speed: first.car.speed, crashed: first.car.crashed },
        vehicles: first.nearby.map((v) => ({ id: v.id, position: { ...v.position }, angle: v.angle, speed: v.speed })),
        perception: { sensors: [...first.perception.sensors], speed: first.perception.speed },
      };
    },
    /** Copia plana del estado de todos los autos, en orden. */
    agentsSnapshot() { return agents.map(agentSnapshot); },
    /** Agentes del mundo: { car, controller, progress, rays, perception, crashed, crashCause }. */
    get agents() { return agents; },
    /** Cantidad de autos que siguen en carrera. */
    get aliveCount() { let n = 0; for (const a of agents) if (!a.car.crashed) n += 1; return n; },
    get traffic() { return traffic; },
    get car() { return first.car; },
    get time() { return time; },
    get steps() { return steps; },
    get paused() { return paused; },
    get progress() { return first.progress; },
    get crashCause() { return first.crashCause; },
    get crashed() { return first.car.crashed; },
    get vehicles() { return first.nearby; },
    get rays() { return first.rays; },
    get perception() { return first.perception; },
    get controller() { return first.controller; },
  };
  return world;
}
