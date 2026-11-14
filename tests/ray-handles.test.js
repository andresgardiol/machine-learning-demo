import test from 'node:test';
import assert from 'node:assert/strict';
import { projectOnRay, readingAt, nearestHandle, HANDLE, smallZoom } from '../src/render/view.js';
import { createWorld } from '../src/core/world.js';
import { createCamera } from '../src/render/camera.js';

test('arrastrar una manija hasta la mitad del rayo: lectura 0,5; en la punta, 0; junto al auto, 1', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 100, y: 0 };
  assert.equal(readingAt(projectOnRay({ x: 50, y: 12 }, a, b)), 0.5);
  assert.equal(readingAt(projectOnRay({ x: 100, y: 0 }, a, b)), 0);
  assert.equal(readingAt(projectOnRay({ x: -30, y: 0 }, a, b)), 1, 'no se sale del rayo hacia atrás');
  assert.equal(readingAt(projectOnRay({ x: 400, y: 0 }, a, b)), 0, 'ni hacia adelante');
});

test('la manija más cercana dentro del alcance; fuera de él, ninguna', () => {
  const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, null];
  assert.equal(nearestHandle(pts, { x: 6, y: 0 }), 1);
  assert.equal(nearestHandle(pts, { x: 4, y: 0 }), 0);
  assert.equal(nearestHandle(pts, { x: 40, y: 40 }), null);
});

test('manijas agarrables: con 20 sensores en un recuadro de 340 × 220, cada manija se agarra sin agarrar la de al lado', () => {
  const world = createWorld({ seed: 1, density: 0, sensors: { count: 20, range: 3, spread: 120 } });
  const vp = { width: 340, height: 220 };
  const camera = createCamera({ minZoom: 0.2, maxZoom: 400 });
  camera.setOrientation({ rotation: Math.PI / 2, anchor: { x: 0.5, y: 0.5 } });
  camera.zoomBy(smallZoom(world.car.sensors, vp) / camera.zoom, vp, world.car.position);
  camera.follow();
  camera.update(world.car.position, vp);
  const handles = world.rays.map((r) => camera.worldToScreen(r.hit ?? r.end, vp));
  assert.equal(handles.length, 20);
  handles.forEach((h, i) => {
    assert.ok(h.x >= 0 && h.x <= vp.width && h.y >= 0 && h.y <= vp.height, `manija ${i} a la vista`);
    assert.equal(nearestHandle(handles, h), i, `al agarrar la ${i} se agarra la ${i}`);
  });
  const gaps = handles.slice(1).map((h, i) => Math.hypot(h.x - handles[i].x, h.y - handles[i].y));
  // Medido: 6 px entre manijas vecinas en la punta de los rayos. Se agarra siempre la más cercana; con
  // tantas, el deslizador de la tarjeta de la entrada es la forma cómoda (y la del teclado).
  assert.ok(Math.min(...gaps) >= 5, `separación mínima ${Math.min(...gaps).toFixed(1)} px`);
  assert.ok(HANDLE.grab >= 12);
});
