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

const FIJADOS = {"porDefecto":[{"generation":1,"best":35.16666666667152,"average":1.8922545667604331,"networks":"a1aeac2d"}, {"generation":2,"best":35.16666666667152,"average":10.880456863797857,"networks":"fc957ce8"}, {"generation":3,"best":35.16666666667152,"average":22.804024414196824,"networks":"19ff4152"}, {"generation":4,"best":35.16666666667152,"average":22.30625115680086,"networks":"2c827646"}, {"generation":5,"best":33.143333333340706,"average":24.287392520099814,"networks":"1d523c3d"}, {"generation":6,"best":26.833333333333336,"average":19.644545112290757,"networks":"ead14f18"}, {"generation":7,"best":33.09776212852254,"average":23.37503028762148,"networks":"a83a3f8e"}, {"generation":8,"best":26.833333333333336,"average":18.11549000773206,"networks":"c74af50c"}, {"generation":9,"best":26.833333333333336,"average":23.099246103602134,"networks":"b8b51b7c"}, {"generation":10,"best":35.16666666667152,"average":26.14512083031004,"networks":"b05f2b28"}], "conCruce":[{"generation":1,"best":35.16666666667152,"average":1.8922545667604331,"networks":"9dd99761"}, {"generation":2,"best":35.16666666667152,"average":4.173331697799464,"networks":"35e97196"}, {"generation":3,"best":35.16666666667152,"average":11.152348478007116,"networks":"313c169c"}, {"generation":4,"best":35.16666666667152,"average":16.74360254778209,"networks":"4aaa0d97"}, {"generation":5,"best":35.03142224617477,"average":14.8795940189757,"networks":"800dddc0"}, {"generation":6,"best":35.03142224617477,"average":15.625692419578508,"networks":"c0416cb2"}, {"generation":7,"best":35.06819101507426,"average":17.34857972248295,"networks":"0c68a3b5"}, {"generation":8,"best":34.99922189352219,"average":16.94433293292702,"networks":"05b4ee88"}, {"generation":9,"best":32.855354691326895,"average":18.391843773546018,"networks":"58855b6d"}, {"generation":10,"best":35.16666666667152,"average":25.388790226319543,"networks":"d78ded42"}], "sinEnfriamiento":[{"generation":1,"best":35.16666666667152,"average":1.8922545667604331,"networks":"9959052f"}, {"generation":2,"best":35.16666666667152,"average":7.968812685956314,"networks":"1b1fdfa8"}, {"generation":3,"best":35.16666666667152,"average":19.778735612452028,"networks":"04cc33f9"}, {"generation":4,"best":35.16666666667152,"average":21.55075764782256,"networks":"621ada8e"}, {"generation":5,"best":33.92157892452087,"average":21.29674224992316,"networks":"fc04dc36"}, {"generation":6,"best":32.84185951890929,"average":15.218039814632723,"networks":"e1cc8e13"}, {"generation":7,"best":35.01666761598608,"average":14.824941339904523,"networks":"39444e7f"}, {"generation":8,"best":35.0145606239239,"average":15.17304909050181,"networks":"837a1ce5"}, {"generation":9,"best":34.898943921303726,"average":19.834489398942605,"networks":"b962b5da"}, {"generation":10,"best":35.16666666667152,"average":16.240358348197336,"networks":"1127a339"}]};

for (const [name, config] of Object.entries(CASES)) {
  test(`mismo resultado que antes del cambio: ${name}`, () => {
    assert.deepEqual(runTraining({ config }), FIJADOS[name]);
  });
}
