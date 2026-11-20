import test from 'node:test';
import assert from 'node:assert/strict';
import { createVehicleCache, scaleFor, composeVehicle, MAX_IMAGE_PX, SHADOW_PAD } from '../src/render/vehicle-cache.js';
import { SIMPLE_BELOW, VEHICLE_KINDS, VEHICLE_SIZES } from '../src/render/vehicles.js';

// Caché de imágenes de los vehículos (vehiculos-ilustrados D3). En Node no hay canvas: un canvas falso anota
// cada llamada de su contexto, así se puede ver qué se armó y con qué color.

function fakeCanvas() {
  const calls = [];
  const gradient = () => ({ addColorStop() {} });
  const ctx = new Proxy({ calls }, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return gradient;
      return (...args) => { calls.push([prop, ...args]); };
    },
    set(target, prop, value) { calls.push([`=${String(prop)}`, value]); target[prop] = value; return true; },
  });
  return { width: 0, height: 0, getContext: () => ctx, calls };
}

test('pedir dos veces lo mismo no rearma la imagen', () => {
  const cache = createVehicleCache({ createCanvas: fakeCanvas });
  const a = cache.image('player', '#3ddc84', 10);
  const b = cache.image('player', '#3ddc84', 10);
  assert.equal(a, b);
  assert.equal(cache.built, 1);
  // Otro zoom dentro de la misma potencia de 2 tampoco la rearma.
  cache.image('player', '#3ddc84', 14.5);
  assert.equal(cache.built, 1);
  cache.image('player', '#ffb020', 10);
  cache.image('truck', '#3ddc84', 10);
  cache.image('player', '#3ddc84', 10, 'mask');
  assert.equal(cache.built, 4, 'otro color, otro tipo u otra capa sí arman una imagen nueva');
});

test('la escala es la potencia de 2 inmediata superior; por debajo del umbral, la simplificada', () => {
  assert.deepEqual(scaleFor(10), { scale: 16, simple: false });
  assert.deepEqual(scaleFor(16), { scale: 16, simple: false });
  assert.deepEqual(scaleFor(20), { scale: 32, simple: false });
  assert.deepEqual(scaleFor(SIMPLE_BELOW), { scale: SIMPLE_BELOW, simple: false });
  assert.deepEqual(scaleFor(SIMPLE_BELOW - 0.5), { scale: SIMPLE_BELOW, simple: true });
  assert.deepEqual(scaleFor(2), { scale: SIMPLE_BELOW, simple: true });
  // Tope: ninguna imagen pasa de MAX_IMAGE_PX de lado, ni con el zoom más cercano de la escena chica.
  for (const kind of VEHICLE_KINDS) {
    const { scale } = scaleFor(800, kind);
    assert.ok((VEHICLE_SIZES[kind].L + 2 * SHADOW_PAD) * scale <= MAX_IMAGE_PX, kind);
  }
});

test('un zoom continuo usa como mucho 4 escalas de la imagen completa, más la simplificada', () => {
  // El rango de la cámara del escenario: de 2 a 40 px/m, con pantallas de 1× y de 2×.
  for (const dpr of [1, 2]) {
    const cache = createVehicleCache({ createCanvas: fakeCanvas });
    for (let z = 2; z <= 40; z *= 1.01) cache.image('player', '#3ddc84', z * dpr);
    const full = new Set(cache.keys().filter((k) => k.includes('|f|')).map((k) => k.split('|')[2]));
    const simple = cache.keys().filter((k) => k.includes('|s|'));
    assert.ok(full.size <= 4, `dpr ${dpr}: ${full.size} escalas (${[...full]})`);
    assert.ok(simple.length <= 1, `dpr ${dpr}: ${simple.length} simplificadas`);
  }
});

test('el color cambia solo la carrocería: el detalle y la sombra se trazan igual', () => {
  const draw = (color) => composeVehicle(fakeCanvas(), { kind: 'van', color, scale: 16 }).calls;
  const green = draw('#3ddc84');
  const amber = draw('#ffb020');
  assert.equal(green.length, amber.length);
  const diff = green.map((c, i) => [c, amber[i]]).filter(([g, a]) => JSON.stringify(g) !== JSON.stringify(a));
  assert.deepEqual(diff.map(([g]) => g), [['=fillStyle', '#3ddc84']], 'lo único distinto es el color con que se pinta la máscara');
  // Y ese color se pinta con 'source-in', sobre la máscara de la carrocería.
  const i = green.findIndex((c) => c[0] === '=fillStyle' && c[1] === '#3ddc84');
  assert.deepEqual(green[i - 1], ['=globalCompositeOperation', 'source-in']);
  assert.equal(green[i + 1][0], 'fillRect');
});

test('la capa de la población es solo la carrocería, sin detalle ni sombra', () => {
  const mask = composeVehicle(fakeCanvas(), { kind: 'player', color: '#3ddc84', scale: 16, layer: 'mask' }).calls;
  const full = composeVehicle(fakeCanvas(), { kind: 'player', color: '#3ddc84', scale: 16 }).calls;
  assert.ok(mask.length < full.length / 4, `${mask.length} contra ${full.length} llamadas`);
  assert.ok(!mask.some((c) => c[0] === '=globalCompositeOperation' && c[1] === 'destination-over'), 'sin sombra');
});

test('se descartan las que hace más que no se usan', () => {
  const cache = createVehicleCache({ createCanvas: fakeCanvas, size: 3 });
  cache.image('player', 'a', 10);
  cache.image('player', 'b', 10);
  cache.image('player', 'c', 10);
  cache.image('player', 'a', 10); // se vuelve a usar: pasa a ser la más reciente
  cache.image('player', 'd', 10);
  assert.equal(cache.size, 3);
  assert.deepEqual(cache.keys().map((k) => k.split('|')[1]), ['c', 'a', 'd'], 'se fue b, la que menos se usó');
});

test('estampar dibuja la imagen centrada, del tamaño del vehículo más el margen de la sombra', () => {
  const cache = createVehicleCache({ createCanvas: fakeCanvas });
  const calls = [];
  cache.stamp({ drawImage: (...a) => calls.push(a) }, 'truck', '#ffb020', 10);
  const [, x, y, w, h] = calls[0];
  const { L, W } = VEHICLE_SIZES.truck;
  assert.ok(Math.abs(x + w / 2) < 1e-9 && Math.abs(y + h / 2) < 1e-9, 'centrada');
  assert.ok(Math.abs(w - (L + 2 * SHADOW_PAD)) < 1 / 16 && Math.abs(h - (W + 2 * SHADOW_PAD)) < 1 / 16, `${w} × ${h}`);
});

test('la luz de los faros termina antes de un largo de auto y no tiene lados rectos (D6)', async () => {
  const { beamPath, BEAM_LENGTH } = await import('../src/v2/render/glow.js');
  const { CAR_LENGTH } = await import('../src/core/constants.js');
  const pts = [];
  const ops = [];
  const ctx = {
    moveTo: (x, y) => { ops.push('M'); pts.push([x, y]); },
    lineTo: (x, y) => { ops.push('L'); pts.push([x, y]); },
    bezierCurveTo: (a, b, c, d, x, y) => { ops.push('C'); pts.push([a, b], [c, d], [x, y]); },
    quadraticCurveTo: (a, b, x, y) => {
      ops.push('Q');
      const [px, py] = pts[pts.length - 1];
      // El extremo de la curva: en t = 1/2 (los extremos son simétricos).
      pts.push([0.25 * px + 0.5 * a + 0.25 * x, 0.25 * py + 0.5 * b + 0.25 * y]);
    },
    closePath: () => ops.push('Z'),
  };
  const x0 = CAR_LENGTH / 2;
  beamPath(ctx, x0, BEAM_LENGTH);
  assert.ok(!ops.includes('L'), 'sin lados rectos');
  // Las cúbicas no salen de sus puntos de control; la cuadrática se mide en su punta.
  const reach = Math.max(...pts.map(([x]) => x)) - x0;
  assert.ok(reach < CAR_LENGTH, `llega ${reach.toFixed(2)} m por delante`);
  assert.ok(BEAM_LENGTH <= 3.5);
});
