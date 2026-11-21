// Sensores de la figura de teoría (seccion-teoria; viene de teoria-prototipos, revisión 1): lo que se dibuja es lo que se lee.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SENSORES, escenaDeSensores, distanciaDe, lecturaDe } from '../src/teoria/figuras/sensores.js';
import { TRAMOS } from '../src/teoria/capitulos/neurona/guion.js';

const MEDIO_AUTO = 17; // medio ancho del auto dibujado (figuras/neurona.js)
const valores = Array.from({ length: 21 }, (_, i) => i / 20);
const todas = valores.flatMap((a) => valores.map((b) => [a, b]));
const cerca = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

test('sensores: la distancia dibujada y la lectura salen de la misma cuenta', () => {
  for (const lecturas of todas) {
    const { rayos } = escenaDeSensores(lecturas);
    rayos.forEach((r, i) => {
      assert.ok(cerca(lecturaDe(r.distancia), lecturas[i]), `lectura ${lecturas} [${i}]`);
      assert.ok(cerca(r.distancia, distanciaDe(lecturas[i])));
    });
  }
  assert.equal(distanciaDe(0), SENSORES.alcance);
  assert.equal(distanciaDe(1), SENSORES.minimo);
});

test('sensores: un rayo nunca termina en el vacío', () => {
  for (const lecturas of todas) {
    const { rayos } = escenaDeSensores(lecturas);
    rayos.forEach((r, i) => {
      const donde = `lecturas ${lecturas}, rayo ${i}`;
      if (lecturas[i] === 0) {
        // Lectura 0: llega entero, y el borde no está dentro del alcance.
        assert.equal(r.toca, 'nada', donde);
        assert.equal(r.distancia, SENSORES.alcance, donde);
        assert.ok(r.alBorde >= SENSORES.alcance - 1e-9, donde);
      } else if (r.toca === 'borde') {
        assert.ok(cerca(r.alBorde, r.distancia), donde);
      } else {
        // El vehículo está antes que el borde: el borde no pudo cortar el rayo primero.
        assert.equal(r.toca, 'obstaculo', donde);
        assert.ok(r.alBorde > r.distancia, donde);
      }
    });
  }
});

test('sensores: la lectura más alta la explica el borde de la calle', () => {
  for (const [a, b] of todas) {
    if (Math.abs(a - b) < SENSORES.banda) continue;
    const { rayos } = escenaDeSensores([a, b]);
    assert.equal(rayos[a > b ? 0 : 1].toca, 'borde', `lecturas ${a}, ${b}`);
  }
  // Los tramos del capítulo que muestran la calle: siempre hay un rayo en el borde.
  for (const t of TRAMOS.filter((x) => !['plano', 'and'].includes(x.estado.vista))) {
    assert.ok(escenaDeSensores(t.estado.entradas).rayos.some((r) => r.toca === 'borde'), t.id);
  }
});

test('sensores: el auto queda dentro de la calle y la escena es simétrica', () => {
  for (const [a, b] of todas) {
    const { posicion, rayos } = escenaDeSensores([a, b]);
    assert.ok(posicion >= MEDIO_AUTO && posicion <= SENSORES.ancho - MEDIO_AUTO, `lecturas ${a}, ${b}: ${posicion}`);
    // Espejo: cambiar las lecturas de lado refleja la escena.
    const espejo = escenaDeSensores([b, a]);
    assert.ok(cerca(espejo.posicion, SENSORES.ancho - posicion), `espejo ${a}, ${b}`);
    assert.equal(espejo.rayos[0].toca, rayos[1].toca);
    assert.ok(cerca(espejo.rayos[0].distancia, rayos[1].distancia));
  }
  // Lecturas iguales: el auto va por el medio.
  for (const v of valores) assert.ok(cerca(escenaDeSensores([v, v]).posicion, SENSORES.ancho / 2), `iguales ${v}`);
});

test('sensores: el auto se mueve sin saltos al cambiar una lectura de a poco', () => {
  let previa = escenaDeSensores([0.5, 0]).posicion;
  for (let i = 1; i <= 1000; i++) {
    const p = escenaDeSensores([0.5, i / 1000]).posicion;
    assert.ok(Math.abs(p - previa) < 4, `salto de ${Math.abs(p - previa)} en ${i / 1000}`);
    previa = p;
  }
});
