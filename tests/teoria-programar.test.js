// Cuenta de «Programar o aprender» (seccion-teoria D9, capítulo 0; tarea 6.1).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SITUACIONES, DOBLA, SIGUE, dispara, responder, contarAciertos, umbralesDelBarrido, buscarUmbral,
} from '../src/teoria/capitulos/programar/cuenta.js';

const izq = (umbral) => ({ sensor: 'izquierdo', umbral });
const der = (umbral) => ({ sensor: 'derecho', umbral });

test('programar: una regla dispara solo si la lectura pasa del umbral', () => {
  const s = { izquierdo: 0.5, derecho: 0.2 };
  assert.equal(dispara(izq(0.4), s), true);
  assert.equal(dispara(izq(0.5), s), false, 'igual al umbral no pasa');
  assert.equal(dispara(der(0.1), s), true);
  assert.equal(responder([], s), SIGUE);
  assert.equal(responder([izq(0.9), der(0.1)], s), DOBLA, 'con dos reglas alcanza con una');
  assert.throws(() => dispara({ sensor: 'medio', umbral: 0 }, s), TypeError);
  assert.throws(() => dispara(izq(Number.NaN), s), TypeError);
});

test('programar: aciertos de una y dos reglas sobre las situaciones', () => {
  assert.equal(SITUACIONES.length, 8);
  const una = contarAciertos([izq(0.5)]);
  assert.equal(una.aciertos, 7);
  assert.deepEqual(una.resultados.filter((r) => !r.bien).map((r) => r.id), ['s7']);
  assert.equal(contarAciertos([izq(0.5), der(0.5)]).aciertos, 8);
  assert.equal(contarAciertos([]).aciertos, SITUACIONES.filter((s) => s.correcta === SIGUE).length);
  // Las seis primeras se resuelven con una regla; la séptima no.
  assert.equal(contarAciertos([izq(0.5)], SITUACIONES.slice(0, 6)).aciertos, 6);
});

test('programar: ninguna regla sola sobre un sensor acierta las ocho', () => {
  for (const sensor of ['izquierdo', 'derecho']) {
    for (const umbral of umbralesDelBarrido({ desde: -0.1, hasta: 1.1, paso: 0.01 })) {
      assert.ok(contarAciertos([{ sensor, umbral }]).aciertos < 8, `${sensor} ${umbral}`);
    }
  }
});

test('programar: el barrido prueba umbrales en orden, sin error de redondeo', () => {
  assert.deepEqual(umbralesDelBarrido({ desde: 0, hasta: 0.3, paso: 0.1 }), [0, 0.1, 0.2, 0.3]);
  assert.equal(umbralesDelBarrido().length, 21);
  assert.throws(() => umbralesDelBarrido({ paso: 0 }), RangeError);
  assert.throws(() => umbralesDelBarrido({ desde: 1, hasta: 0 }), RangeError);
});

test('programar: buscar se queda con el umbral que más acierta y, si empatan, con el primero', () => {
  const r = buscarUmbral({ sensor: 'izquierdo' });
  assert.equal(r.aciertos, 7);
  // Aciertan 7 todos los umbrales desde 0,4 (inclusive: 0,4 no "pasa") hasta antes de 0,6.
  assert.deepEqual(r.empatados, [0.4, 0.45, 0.5, 0.55]);
  assert.deepEqual(r.regla, { sensor: 'izquierdo', umbral: 0.4 });
  assert.equal(r.probados.length, 21);
  assert.deepEqual(r.probados.slice(0, 2), [{ umbral: 0, aciertos: 4 }, { umbral: 0.05, aciertos: 4 }]);
  // Con la regla izquierda fija, buscar la segunda llega a las ocho.
  const dos = buscarUmbral({ sensor: 'derecho', otras: [r.regla] });
  assert.equal(dos.aciertos, 8);
  assert.equal(contarAciertos([r.regla, dos.regla]).aciertos, 8);
});

test('programar: mismo resultado en cada corrida', () => {
  const a = buscarUmbral({ sensor: 'derecho', otras: [izq(0.5)], paso: 0.01 });
  for (let i = 0; i < 5; i++) assert.deepEqual(buscarUmbral({ sensor: 'derecho', otras: [izq(0.5)], paso: 0.01 }), a);
});
