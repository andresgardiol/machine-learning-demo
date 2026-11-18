// Determinismo de la evolución (entrenar-la-generacion-ensena, tarea 2.3, escenario "Mismo resultado" de
// neuroevolucion): diez generaciones con la misma semilla dan el mismo mejor fitness y las mismas redes que el
// código de antes del cambio. Los valores de FIJADOS se sacaron con `c324def`/`e2a2c41` (sin la muestra de la
// mutación ni record.changes), corriendo esta misma función.
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

const FIJADOS = { "porDefecto": [ { "generation": 1, "best": 30.999999999995147, "average": 1.9527854847652635, "networks": "3ab10a2f" }, { "generation": 2, "best": 33.65463086078429, "average": 9.124129283540363, "networks": "889f4eb9" }, { "generation": 3, "best": 33.65463086078429, "average": 15.0899051713049, "networks": "9cec5f73" }, { "generation": 4, "best": 35.16666666667152, "average": 19.682494857531005, "networks": "59432849" }, { "generation": 5, "best": 35.16666666667152, "average": 22.392493069998697, "networks": "8397f985" }, { "generation": 6, "best": 35.132844203471905, "average": 24.656161917387717, "networks": "611cba80" }, { "generation": 7, "best": 35.16666666667152, "average": 23.218738772258074, "networks": "19425634" }, { "generation": 8, "best": 31.162777777775773, "average": 14.7933892873282, "networks": "dd4b6c98" }, { "generation": 9, "best": 35.16666666667152, "average": 19.824081003754692, "networks": "6f937e47" }, { "generation": 10, "best": 34.48645947355059, "average": 20.38772450899814, "networks": "2db5d681" } ], "conCruce": [ { "generation": 1, "best": 30.999999999995147, "average": 1.9527854847652635, "networks": "6537e42f" }, { "generation": 2, "best": 31.13111111111357, "average": 3.680916549155517, "networks": "e8efb372" }, { "generation": 3, "best": 31.13111111111357, "average": 8.632347901953835, "networks": "3c56a7e1" }, { "generation": 4, "best": 35.16666666667152, "average": 14.134535568489445, "networks": "60835064" }, { "generation": 5, "best": 35.16666666667152, "average": 14.62170352621045, "networks": "e5281222" }, { "generation": 6, "best": 33.52408059675751, "average": 15.949112585908248, "networks": "6dfbe647" }, { "generation": 7, "best": 35.16666666667152, "average": 15.683722274299845, "networks": "2ac0fb96" }, { "generation": 8, "best": 31.143333333340706, "average": 18.563956520924084, "networks": "c57e447a" }, { "generation": 9, "best": 35.16666666667152, "average": 11.938986968862203, "networks": "a574c46a" }, { "generation": 10, "best": 32.823646368420064, "average": 17.368898748000355, "networks": "d39ba8aa" } ], "sinEnfriamiento": [ { "generation": 1, "best": 30.999999999995147, "average": 1.9527854847652635, "networks": "ac039079" }, { "generation": 2, "best": 30.999999999995147, "average": 7.802936339127216, "networks": "d59f4164" }, { "generation": 3, "best": 31.143333333340706, "average": 18.73444569750657, "networks": "d04d895f" }, { "generation": 4, "best": 35.16666666667152, "average": 14.69872305157466, "networks": "ab2a13e7" }, { "generation": 5, "best": 35.16666666667152, "average": 25.387141318188757, "networks": "46ac5431" }, { "generation": 6, "best": 34.90492826369882, "average": 22.200208707073752, "networks": "19f0c144" }, { "generation": 7, "best": 35.16666666667152, "average": 19.838389668520175, "networks": "6f318736" }, { "generation": 8, "best": 31.143333333340706, "average": 15.530340645254304, "networks": "1be5d52b" }, { "generation": 9, "best": 35.16666666667152, "average": 15.329299750588325, "networks": "40f1a290" }, { "generation": 10, "best": 31.143333333340706, "average": 16.380138878823338, "networks": "5861d543" } ] };

for (const [name, config] of Object.entries(CASES)) {
  test(`mismo resultado que antes del cambio: ${name}`, () => {
    assert.deepEqual(runTraining({ config }), FIJADOS[name]);
  });
}
