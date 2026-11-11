// Auto: estado y física simple. Un paso avanza dt segundos.
import { add, scale, fromAngle, rectCorners } from './geometry.js';
import {
  ACCELERATION, CAR_LENGTH, CAR_WIDTH, FRICTION, MAX_SPEED, REVERSE_FRACTION, SPEED_LIMITS, TURN_RATE,
} from './constants.js';
import { sensorConfig } from './sensors.js';

export const NO_CONTROLS = Object.freeze({ forward: false, reverse: false, left: false, right: false });

/** Dos controles opuestos accionados a la vez se anulan. */
export function resolveControls(controls = NO_CONTROLS) {
  const forward = Boolean(controls.forward);
  const reverse = Boolean(controls.reverse);
  const left = Boolean(controls.left);
  const right = Boolean(controls.right);
  return {
    forward: forward && !reverse,
    reverse: reverse && !forward,
    left: left && !right,
    right: right && !left,
  };
}

/** Velocidad máxima de avance válida (m/s): sin valor usa la de por defecto y fuera de rango se ajusta al límite. */
export function maxSpeedOf(value) {
  const n = Number(value ?? MAX_SPEED);
  if (!Number.isFinite(n)) return MAX_SPEED;
  return Math.min(Math.max(n, SPEED_LIMITS.min), SPEED_LIMITS.max);
}

export function createCar({ position = { x: 0, y: 0 }, angle = 0, sensors, maxSpeed } = {}) {
  return {
    position: { x: position.x, y: position.y },
    angle,
    speed: 0,
    crashed: false,
    maxSpeed: maxSpeedOf(maxSpeed),
    sensors: sensorConfig(sensors),
  };
}

/** Avanza el auto un paso. Un auto chocado queda detenido y no responde. */
export function stepCar(car, rawControls, dt) {
  if (car.crashed) {
    car.speed = 0;
    return car;
  }
  const c = resolveControls(rawControls);

  if (c.forward) car.speed += ACCELERATION * dt;
  else if (c.reverse) car.speed -= ACCELERATION * dt;
  else if (car.speed > 0) car.speed = Math.max(0, car.speed - FRICTION * dt);
  else if (car.speed < 0) car.speed = Math.min(0, car.speed + FRICTION * dt);
  car.speed = Math.min(Math.max(car.speed, -car.maxSpeed * REVERSE_FRACTION), car.maxSpeed);

  const direction = car.speed > 0 ? 1 : car.speed < 0 ? -1 : 0; // solo gira en movimiento; al revés en marcha atrás
  const steer = (c.left ? 1 : 0) - (c.right ? 1 : 0);
  car.angle += TURN_RATE * dt * direction * steer;

  car.position = add(car.position, scale(fromAngle(car.angle), car.speed * dt));
  return car;
}

export const carContour = (car) => rectCorners(car.position, car.angle, CAR_LENGTH, CAR_WIDTH);

/** Velocidad respecto de la máxima de avance (la configurada para este auto), entre -1 y 1. */
export const normalizedSpeed = (car) => Math.min(Math.max(car.speed / car.maxSpeed, -1), 1);

export function configureSensors(car, partial) {
  car.sensors = sensorConfig({ ...car.sensors, ...partial });
  return car;
}

export function resetSensors(car) {
  car.sensors = sensorConfig();
  return car;
}
