import test from 'node:test';
import assert from 'node:assert/strict';
import { createCamera, CAMERA_DEFAULTS, orientationFor, VERTICAL_ANCHOR, panStarts, PAN_THRESHOLD } from '../src/render/camera.js';
import { createStraightStreet, createTrack } from '../src/core/track.js';

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

// --- Orientación: calle recta vertical --------------------------------------------------


const vertical = () => {
  const cam = createCamera();
  cam.setOrientation(orientationFor(createStraightStreet()));
  return cam;
};

test('la calle recta se muestra vertical: avanzar sobre la calle es subir en la pantalla', () => {
  const cam = vertical();
  cam.update({ x: 0, y: 0 }, vp);
  const here = cam.worldToScreen({ x: 0, y: 0 }, vp);
  const ahead = cam.worldToScreen({ x: 10, y: 0 }, vp);
  close(ahead, { x: here.x, y: here.y - 10 * CAMERA_DEFAULTS.zoom }, '10 m adelante = 80 px más arriba');
});

test('calle vertical: el carril de la izquierda (y positiva) queda a la izquierda en la pantalla', () => {
  const cam = vertical();
  cam.update({ x: 0, y: 0 }, vp);
  const center = cam.worldToScreen({ x: 0, y: 0 }, vp);
  const leftLane = cam.worldToScreen({ x: 0, y: 4 }, vp);
  assert.ok(leftLane.x < center.x);
  assert.ok(Math.abs(leftLane.y - center.y) < 1e-9);
});

test('calle vertical: el auto queda centrado, más abajo de la mitad, con más pista por delante (arriba)', () => {
  const cam = vertical();
  const car = { x: 250, y: 0 };
  cam.update(car, vp);
  close(cam.worldToScreen(car, vp), { x: VERTICAL_ANCHOR.x * vp.width, y: VERTICAL_ANCHOR.y * vp.height }, 'punto de seguimiento');
  const b = cam.visibleBounds(vp);
  assert.ok(b.maxX - 250 > 250 - b.minX, 'más pista por delante (+x) que por detrás');
  cam.update({ x: 600, y: 0 }, vp);
  close(cam.worldToScreen({ x: 600, y: 0 }, vp), { x: 0.5 * vp.width, y: 0.7 * vp.height }, 'el auto permanece en la misma zona');
});

test('calle vertical: el zoom con la rueda deja fijo el punto bajo el cursor y el paneo acompaña al mouse', () => {
  const cam = vertical();
  cam.update({ x: 0, y: 0 }, vp);
  const cursor = { x: 640, y: 210 };
  const vehicle = cam.screenToWorld(cursor, vp);
  for (const factor of [1.25, 0.8, 3]) {
    cam.zoomAt(cursor, factor, vp);
    close(cam.worldToScreen(vehicle, vp), cursor, `factor ${factor}`);
  }
  const grabbed = cam.screenToWorld({ x: 400, y: 400 }, vp);
  cam.pan(120, -40);
  close(cam.worldToScreen(grabbed, vp), { x: 520, y: 360 }, 'el punto arrastrado acompaña al mouse');
});

test('calle vertical: restablecer y reiniciar vuelven al punto de seguimiento vertical', () => {
  const cam = vertical();
  const car = { x: 42, y: -3 };
  cam.pan(300, 200);
  cam.reset();
  cam.update(car, vp);
  close(cam.worldToScreen(car, vp), { x: 0.5 * vp.width, y: 0.7 * vp.height }, 'tras restablecer');
  cam.pan(10, 10);
  cam.follow();
  cam.update(car, vp);
  close(cam.worldToScreen(car, vp), { x: 0.5 * vp.width, y: 0.7 * vp.height }, 'tras reiniciar');
});

test('las pistas con curvas (circuitos) se muestran sin girar', () => {
  const curved = createTrack({ centerline: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 170, y: 70 }], width: 12, lanes: 3 });
  assert.deepEqual(orientationFor(curved), { rotation: 0, anchor: CAMERA_DEFAULTS.anchor });
});

test('un clic con un temblor del mouse no es un paneo; un arrastre real sí', () => {
  assert.equal(PAN_THRESHOLD, 5);
  assert.equal(panStarts(1, 1), false);
  assert.equal(panStarts(3, 4), false, 'justo 5 px todavía es un clic');
  assert.equal(panStarts(6, 0), true);
  assert.equal(panStarts(0, -8), true);
});
