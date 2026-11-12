// Zoom mínimo para ver un circuito entero (circuitos-y-paisaje, tarea 5.2).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCamera, CAMERA_DEFAULTS, MIN_ZOOM, FIT_STAGE, FIT_MARGIN, fitZoom, trackBounds,
} from '../src/render/camera.js';
import { createTrackById } from '../src/core/circuits.js';

test('el zoom mínimo baja de 2 px por metro solo lo necesario para que el gran premio entre entero', () => {
  assert.ok(MIN_ZOOM <= 2);
  assert.equal(CAMERA_DEFAULTS.minZoom, MIN_ZOOM);
  assert.equal(createCamera().limits.min, MIN_ZOOM);
  const gp = fitZoom(trackBounds(createTrackById('grandPrix')));
  assert.ok(MIN_ZOOM <= gp && MIN_ZOOM > gp - 0.01, `${MIN_ZOOM} y ${gp}`);
});

test('Alejar hasta ver todo: al zoom mínimo cada circuito entra entero en un escenario de 1074×851 px', () => {
  assert.deepEqual({ ...FIT_STAGE }, { width: 1074, height: 851 });
  for (const id of ['oval', 'kidney', 'grandPrix']) {
    const b = trackBounds(createTrackById(id));
    assert.ok((b.maxX - b.minX) * MIN_ZOOM <= FIT_STAGE.width, id);
    assert.ok((b.maxY - b.minY) * MIN_ZOOM <= FIT_STAGE.height, id);
    // Centrada en el recuadro, la cámara al mínimo muestra todo el trazado.
    const cam = createCamera();
    cam.zoomBy(0.0001, FIT_STAGE, null);
    assert.equal(cam.zoom, MIN_ZOOM);
    cam.pan(0, 0);
    const center = { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 };
    for (const p of [{ x: b.minX - FIT_MARGIN / 2, y: b.minY }, { x: b.maxX + FIT_MARGIN / 2, y: b.maxY }]) {
      const s = { x: (p.x - center.x) * MIN_ZOOM + FIT_STAGE.width / 2, y: -(p.y - center.y) * MIN_ZOOM + FIT_STAGE.height / 2 };
      assert.ok(s.x >= 0 && s.x <= FIT_STAGE.width && s.y >= 0 && s.y <= FIT_STAGE.height, `${id}: ${JSON.stringify(s)}`);
    }
  }
});
