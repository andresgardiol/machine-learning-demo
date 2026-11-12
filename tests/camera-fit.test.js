// Circuitos orientados y zoom mínimo para verlos enteros (circuitos-y-paisaje, tarea 5.2 y D7).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCamera, CAMERA_DEFAULTS, FIT_MARGIN, fitTrack, orientationFor, VERTICAL_ANCHOR } from '../src/render/camera.js';
import { createTrackById } from '../src/core/circuits.js';

const STAGE = { width: 400, height: 851 }; // escenario por defecto a 1440×900, con el tablero a la vista
const CIRCUITS = ['oval', 'kidney', 'grandPrix'];

test('Salida hacia arriba: en un circuito la recta de salida queda vertical, con el avance hacia arriba', () => {
  for (const id of CIRCUITS) {
    const track = createTrackById(id);
    const o = orientationFor(track);
    assert.deepEqual(o.anchor, VERTICAL_ANCHOR);
    const cam = createCamera();
    cam.setOrientation(o);
    const a = cam.worldToScreen(track.pointAt(0).position, STAGE);
    const b = cam.worldToScreen(track.pointAt(10).position, STAGE);
    assert.ok(Math.abs(a.x - b.x) < 1e-6, `${id}: la salida no queda vertical`);
    assert.ok(b.y < a.y, `${id}: el avance no va hacia arriba`);
  }
  // La calle recta, como siempre.
  assert.deepEqual(orientationFor(createTrackById('straight')).anchor, VERTICAL_ANCHOR);
});

test('zoom mínimo: en la calle sigue en 2; en un circuito, el que lo deja entero en el escenario a la vista', () => {
  assert.equal(CAMERA_DEFAULTS.minZoom, 2);
  const cam = createCamera();
  for (const id of CIRCUITS) {
    const track = createTrackById(id);
    const o = orientationFor(track);
    const fit = fitTrack(track, STAGE, o.rotation);
    assert.ok(fit.zoom <= 2);
    cam.setOrientation(o);
    cam.setFit(fit);
    assert.equal(cam.limits.min, fit.zoom);
  }
  cam.setFit(null);
  assert.equal(cam.limits.min, 2);
});

test('Alejar hasta ver todo: con el zoom al mínimo, todo el trazado entra en el escenario de 400×851 px', () => {
  for (const id of CIRCUITS) {
    const track = createTrackById(id);
    const o = orientationFor(track);
    const fit = fitTrack(track, STAGE, o.rotation);
    const cam = createCamera();
    cam.setOrientation(o);
    cam.setFit(fit);
    // Siguiendo al auto en cualquier punto de la pista, al alejar al mínimo se ve el circuito entero.
    const car = track.pointAt(track.length * 0.37).position;
    cam.update(car, STAGE);
    for (let i = 0; i < 40; i++) cam.zoomBy(1 / 1.25, STAGE, car);
    assert.equal(cam.zoom, fit.zoom);
    cam.update(car, STAGE);
    for (const p of [...track.leftBorder, ...track.rightBorder]) {
      const s = cam.worldToScreen(p, STAGE);
      assert.ok(s.x >= 0 && s.x <= STAGE.width && s.y >= 0 && s.y <= STAGE.height, `${id}: ${JSON.stringify(s)}`);
    }
    // Y queda margen: el zoom es el justo, con FIT_MARGIN metros alrededor.
    assert.ok(fit.zoom * (2 * FIT_MARGIN) > 0);
  }
});

test('Restablecer: después de alejar al mínimo, vuelve al zoom por defecto centrado en el auto', () => {
  const track = createTrackById('grandPrix');
  const o = orientationFor(track);
  const cam = createCamera();
  cam.setOrientation(o);
  cam.setFit(fitTrack(track, STAGE, o.rotation));
  const car = track.pointAt(300).position;
  for (let i = 0; i < 40; i++) cam.zoomBy(0.8, STAGE, car);
  cam.reset();
  cam.update(car, STAGE);
  assert.equal(cam.zoom, CAMERA_DEFAULTS.zoom);
  const s = cam.worldToScreen(car, STAGE);
  assert.ok(Math.abs(s.x - VERTICAL_ANCHOR.x * STAGE.width) < 1e-6 && Math.abs(s.y - VERTICAL_ANCHOR.y * STAGE.height) < 1e-6);
});
