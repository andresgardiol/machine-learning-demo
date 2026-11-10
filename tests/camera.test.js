import test from 'node:test';
import assert from 'node:assert/strict';
import { createCamera, CAMERA_DEFAULTS } from '../src/render/camera.js';

const vp = { width: 900, height: 700 };
const close = (a, b, msg) => {
  assert.ok(Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9, `${msg}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
};

test('el eje y se invierte al dibujar: más arriba en el mundo es más arriba en la pantalla', () => {
  const cam = createCamera();
  cam.update({ x: 0, y: 0 }, vp);
  const low = cam.worldToScreen({ x: 0, y: 0 }, vp);
  const high = cam.worldToScreen({ x: 0, y: 4 }, vp);
  assert.equal(low.y - high.y, 4 * CAMERA_DEFAULTS.zoom);
});

test('seguir al auto: queda en el mismo lugar de la pantalla y se ve más pista por delante que por detrás', () => {
  const cam = createCamera();
  cam.update({ x: 0, y: 0 }, vp);
  const first = cam.worldToScreen({ x: 0, y: 0 }, vp);
  cam.update({ x: 250, y: 3 }, vp);
  const later = cam.worldToScreen({ x: 250, y: 3 }, vp);
  close(first, later, 'el auto permanece en la misma zona');
  close(first, { x: 0.3 * vp.width, y: 0.5 * vp.height }, 'punto de seguimiento');
  const b = cam.visibleBounds(vp);
  assert.ok(b.maxX - 250 > 250 - b.minX, 'más pista por delante (+x) que por detrás');
});

test('zoom con la rueda: el punto bajo el cursor queda fijo en pantalla', () => {
  const cam = createCamera();
  cam.pan(0, 0); // cámara libre
  const cursor = { x: 640, y: 210 };
  const vehicle = cam.screenToWorld(cursor, vp);
  for (const factor of [1.25, 1.25, 0.8, 0.5, 3]) {
    assert.equal(cam.zoomAt(cursor, factor, vp), true);
    close(cam.worldToScreen(vehicle, vp), cursor, `factor ${factor}`);
  }
});

test('zoom con la rueda mientras sigue al auto: el punto bajo el cursor queda fijo y el auto sigue en pantalla', () => {
  const cam = createCamera();
  const car = { x: 100, y: 0 };
  cam.update(car, vp);
  const cursor = { x: 500, y: 300 };
  const vehicle = cam.screenToWorld(cursor, vp);
  assert.equal(cam.zoomAt(cursor, 1.25, vp, car), true);
  close(cam.worldToScreen(vehicle, vp), cursor, 'vehículo bajo el cursor');
  assert.equal(cam.following, true);
  const carOnScreen = cam.worldToScreen(car, vp);
  cam.update(car, vp); // el siguiente cuadro no lo mueve
  close(cam.worldToScreen(car, vp), carOnScreen, 'el auto conserva su lugar');
  close(cam.worldToScreen(vehicle, vp), cursor, 'y el vehículo sigue bajo el cursor');
});

test('límite de zoom: al llegar al máximo la vista no se acerca más', () => {
  const cam = createCamera();
  cam.update({ x: 0, y: 0 }, vp);
  const cursor = { x: 300, y: 300 };
  while (cam.zoomAt(cursor, 1.5, vp)) { /* acercar hasta el tope */ }
  assert.equal(cam.zoom, CAMERA_DEFAULTS.maxZoom);
  const before = cam.center;
  assert.equal(cam.zoomAt(cursor, 1.5, vp), false);
  assert.equal(cam.zoomBy(1.25, vp), false);
  assert.equal(cam.zoom, CAMERA_DEFAULTS.maxZoom);
  assert.deepEqual(cam.center, before);
});

test('límite de zoom: al llegar al mínimo la vista no se aleja más', () => {
  const cam = createCamera();
  while (cam.zoomBy(0.5, vp)) { /* alejar hasta el tope */ }
  assert.equal(cam.zoom, CAMERA_DEFAULTS.minZoom);
  assert.equal(cam.zoomBy(0.8, vp), false);
  assert.equal(cam.zoom, CAMERA_DEFAULTS.minZoom);
});

test('paneo: el encuadre se desplaza con el arrastre y deja de seguir al auto', () => {
  const cam = createCamera();
  const car = { x: 0, y: 0 };
  cam.update(car, vp);
  const grabbed = cam.screenToWorld({ x: 400, y: 400 }, vp);
  cam.pan(120, -40);
  assert.equal(cam.following, false);
  close(cam.worldToScreen(grabbed, vp), { x: 520, y: 360 }, 'el punto arrastrado acompaña al mouse');
  const center = cam.center;
  cam.update({ x: 500, y: 0 }, vp); // el auto se aleja: la cámara no lo sigue
  assert.deepEqual(cam.center, center);
});

test('volver al auto: tras cambiar el zoom y panear, restablecer sigue al auto con el zoom por defecto', () => {
  const cam = createCamera();
  const car = { x: 42, y: -3 };
  cam.update(car, vp);
  cam.zoomAt({ x: 800, y: 100 }, 2, vp, car);
  cam.pan(300, 200);
  cam.reset();
  cam.update(car, vp);
  assert.equal(cam.following, true);
  assert.equal(cam.zoom, CAMERA_DEFAULTS.zoom);
  close(cam.worldToScreen(car, vp), { x: 0.3 * vp.width, y: 0.5 * vp.height }, 'auto en su lugar de seguimiento');
});

test('reinicio de la simulación: la cámara vuelve a seguir al auto', () => {
  const cam = createCamera();
  cam.pan(50, 50);
  assert.equal(cam.following, false);
  cam.follow();
  const car = { x: 0, y: 0 };
  cam.update(car, vp);
  assert.equal(cam.following, true);
  close(cam.worldToScreen(car, vp), { x: 0.3 * vp.width, y: 0.5 * vp.height }, 'auto en su lugar de seguimiento');
});

test('acercar lejos del auto hasta sacarlo de la pantalla deja de seguirlo', () => {
  const cam = createCamera();
  const car = { x: 0, y: 0 };
  cam.update(car, vp);
  cam.zoomAt({ x: 880, y: 20 }, 4, vp, car);
  assert.equal(cam.following, false);
});
