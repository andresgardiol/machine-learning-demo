// Determinismo de la evolución (entrenar-la-generacion-ensena, tarea 2.3, escenario "Mismo resultado" de
// neuroevolucion): diez generaciones con la misma semilla dan el mismo mejor fitness y las mismas redes que el
// código de antes del cambio. Los valores de FIJADOS se sacaron con `c324def`/`e2a2c41` (sin la muestra de la
// mutación ni record.changes), corriendo esta misma función, y se volvieron a tomar con el tráfico por carril
// de `trafico-vivo` (cambiaron el tráfico y por eso los fitness; la evolución no cambió).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraining } from '../src/core/training.js';

/** Huella FNV-1a de todos los pesos y sesgos de una población, en orden. */
export function fingerprint(networks) {
  let h = 0x811c9dc5;
  const mix = (x) => {
    const s = x.toPrecision(17);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  };
  for (const net of networks) for (const layer of net.layers) {
    for (const row of layer.weights) for (const w of row) mix(w);
    for (const b of layer.biases) mix(b);
  }
  return h.toString(16).padStart(8, '0');
}

/** Corre `generations` generaciones de `steps` pasos cada una (cerrándolas a pedido) y devuelve lo que se compara. */
export function runTraining({ seed = 7, config = {}, generations = 10, steps = 240 } = {}) {
  const t = createTraining({ seed, config: { population: 40, ...config } });
  const out = [];
  for (let g = 0; g < generations; g++) {
    for (let s = 0; s < steps; s++) if (t.step()) break;
    if (t.completed === g) t.finishGeneration();
    const r = t.history[t.history.length - 1];
    out.push({ generation: r.generation, best: r.best, average: r.average, networks: fingerprint(t.networks) });
  }
  return out;
}

const CASES = {
  porDefecto: {},
  conCruce: { crossover: true, elite: 5, selection: 30 },
  sinEnfriamiento: { mutationCooling: false, mutationStrength: 40, mutationRate: 50 },
};

const FIJADOS = {"porDefecto":[{"generation":1,"best":35.16666666667152,"average":2.161118818099082,"networks":"3ab10a2f"}, {"generation":2,"best":35.16666666667152,"average":10.004182887552936,"networks":"c14203a5"}, {"generation":3,"best":34.57263788195269,"average":15.26079155358202,"networks":"c3ba4773"}, {"generation":4,"best":34.53091748766989,"average":19.10139924379861,"networks":"1e603087"}, {"generation":5,"best":35.16666666667152,"average":22.868549286992256,"networks":"7b12e4c1"}, {"generation":6,"best":35.16666666667152,"average":21.750882690188273,"networks":"a962b122"}, {"generation":7,"best":35.16666666667152,"average":22.000057034784184,"networks":"3b9cf2a5"}, {"generation":8,"best":35.16666666667152,"average":23.945998394915172,"networks":"46d53992"}, {"generation":9,"best":35.16666666667152,"average":21.364367530902747,"networks":"6895e002"}, {"generation":10,"best":35.16666666667152,"average":21.62667937695272,"networks":"a9cdf56b"}], "conCruce":[{"generation":1,"best":35.16666666667152,"average":2.161118818099082,"networks":"6537e42f"}, {"generation":2,"best":35.16666666667152,"average":4.065138771378406,"networks":"feb5d65d"}, {"generation":3,"best":31.85317192294557,"average":9.324198076977579,"networks":"274646d0"}, {"generation":4,"best":35.128345890756464,"average":12.354498728951025,"networks":"7da49cd5"}, {"generation":5,"best":35.16666666667152,"average":13.017163058887187,"networks":"4c40f864"}, {"generation":6,"best":35.16666666667152,"average":21.20101948809497,"networks":"3b0e45a0"}, {"generation":7,"best":35.16666666667152,"average":16.10690763561821,"networks":"016d5120"}, {"generation":8,"best":35.16666666667152,"average":16.96785952288798,"networks":"0b9d4b5e"}, {"generation":9,"best":35.16666666667152,"average":16.39530609202472,"networks":"20f5944c"}, {"generation":10,"best":35.16666666667152,"average":23.42095445444732,"networks":"19dcbdef"}], "sinEnfriamiento":[{"generation":1,"best":35.16666666667152,"average":2.161118818099082,"networks":"ac039079"}, {"generation":2,"best":35.16666666667152,"average":8.382847189417589,"networks":"b5db66e9"}, {"generation":3,"best":34.56794647582865,"average":19.067282697523844,"networks":"8816207e"}, {"generation":4,"best":34.938332954625366,"average":17.151708947975568,"networks":"c7c37988"}, {"generation":5,"best":35.16666666667152,"average":12.138183283337517,"networks":"6bbab3a0"}, {"generation":6,"best":35.16666666667152,"average":23.458923022936865,"networks":"2491d65e"}, {"generation":7,"best":35.16666666667152,"average":25.620389498247942,"networks":"7e44c263"}, {"generation":8,"best":35.16666666667152,"average":22.865552065972345,"networks":"02989561"}, {"generation":9,"best":35.16666666667152,"average":24.673483509434423,"networks":"57a03e54"}, {"generation":10,"best":35.16666666667152,"average":20.099529971584584,"networks":"1f5e58d9"}]};

for (const [name, config] of Object.entries(CASES)) {
  test(`mismo resultado que antes del cambio: ${name}`, () => {
    assert.deepEqual(runTraining({ config }), FIJADOS[name]);
  });
}
