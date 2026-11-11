// Mundo: une pista, tráfico, auto, sensores y controlador, y avanza en pasos fijos.
import { createStraightStreet } from './track.js';
import { createTraffic } from './traffic.js';
import {
  createCar, stepCar, carContour, normalizedSpeed, configureSensors, resetSensors,
} from './car.js';
import { readSensors, rangeMeters } from './sensors.js';
import { normalizeControls, idleController, isController } from './controller.js';
import { outline, segmentIntersection, contoursTouch, distance } from './geometry.js';
import { STEP, CAR_LENGTH } from './constants.js';

/**
 * @param {object} spec
 * @param {number} spec.seed semilla del tráfico
 * @param {number} [spec.lanes] 2, 3 o 4 (3 por defecto)
 * @param {number} [spec.density] % de tráfico
 * @param {number} [spec.irregularity] % de irregularidad
 * @param {object} [spec.sensors] { count, range, spread }
 * @param {number} [spec.maxSpeed] velocidad máxima de avance del auto (m/s), de 12 a 40; 15 por defecto
 * @param {object} [spec.controller] objeto con control(perception) (ver controller.js)
 */
export function createWorld(spec = {}) {
  const { seed = 1, lanes, density, irregularity, sensors, maxSpeed } = spec;
  const track = createStraightStreet({ lanes });
  const traffic = createTraffic({ seed, track, density, irregularity });
  const startLane = Math.floor(track.lanes / 2);

  let controller = isController(spec.controller) ? spec.controller : idleController;
  let paused = false;
  let car;
  let time;
  let steps;
  let segmentIndex;
  let progress;
  let crashCause;
  let nearby;
  let rays;
  let perception;

  const windowRadius = () => rangeMeters(car.sensors) + 2 * CAR_LENGTH;

  function look() {
    const p = track.progressOf(car.position, segmentIndex);
    segmentIndex = p.segmentIndex;
    progress = p.progress;
    const radius = windowRadius();
    nearby = traffic.vehicles(time, progress - radius, progress + radius);
    const obstacles = [...track.bordersNear(car.position, rangeMeters(car.sensors))];
    for (const v of nearby) {
      if (distance(v.position, car.position) <= rangeMeters(car.sensors) + CAR_LENGTH) obstacles.push(...outline(v.contour));
    }
    rays = readSensors(car, car.sensors, obstacles);
    perception = { sensors: rays.map((r) => r.reading), speed: normalizedSpeed(car) };
  }

  function findCrash() {
    const contour = carContour(car);
    const edges = outline(contour);
    for (const [a, b] of track.bordersNear(car.position, CAR_LENGTH)) {
      for (const [c, d] of edges) if (segmentIntersection(a, b, c, d)) return 'edge';
    }
    for (const v of nearby) {
      if (distance(v.position, car.position) <= CAR_LENGTH * 1.5 && contoursTouch(contour, v.contour)) return 'vehicle';
    }
    return null;
  }

  function reset() {
    car = createCar({
      position: track.laneCenter(startLane, 0).position, angle: 0,
      sensors: car ? car.sensors : sensors, maxSpeed: car ? car.maxSpeed : maxSpeed,
    });
    time = 0;
    steps = 0;
    segmentIndex = 0;
    progress = 0;
    crashCause = null;
    look();
  }

  /** Avanza un paso de simulación (1/60 s). No hace nada en pausa ni con el auto chocado. */
  function step() {
    if (paused || car.crashed) return;
    stepCar(car, normalizeControls(controller.control(perception)), STEP);
    steps += 1;
    time = steps * STEP;
    look();
    const cause = findCrash();
    if (cause) {
      car.crashed = true;
      car.speed = 0;
      crashCause = cause;
      look();
    }
  }

  reset();

  const world = {
    track, traffic, seed, step, reset,
    pause() { paused = true; },
    resume() { paused = false; },
    setController(next) { if (isController(next)) controller = next; },
    configureSensors(partial) { configureSensors(car, partial); look(); },
    resetSensors() { resetSensors(car); look(); },
    /** Vehículos del tráfico con su posición sobre la línea central en [from, to], en el instante actual. */
    vehiclesIn(from, to) { return traffic.vehicles(time, from, to); },
    /** Copia plana del estado para pruebas, comparaciones y dibujo. */
    snapshot() {
      return {
        time, steps, paused, progress, crashCause,
        car: { position: { ...car.position }, angle: car.angle, speed: car.speed, crashed: car.crashed },
        vehicles: nearby.map((v) => ({ id: v.id, position: { ...v.position }, angle: v.angle, speed: v.speed })),
        perception: { sensors: [...perception.sensors], speed: perception.speed },
      };
    },
    get car() { return car; },
    get time() { return time; },
    get steps() { return steps; },
    get paused() { return paused; },
    get progress() { return progress; },
    get crashCause() { return crashCause; },
    get crashed() { return car.crashed; },
    get vehicles() { return nearby; },
    get rays() { return rays; },
    get perception() { return perception; },
    get controller() { return controller; },
  };
  return world;
}
