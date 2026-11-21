// Guion y textos de los capítulos 3 a 6 de la teoría (seccion-teoria D12; tareas 11.2 a 14.5): seis
// tramos con sus campos, la respuesta de la predicción y la solución del desafío salen de la cuenta, y
// cada capítulo cierra con "Para profundizar" y sus fuentes. Ninguna prueba mide si algo aprende.
import test from 'node:test';
import assert from 'node:assert/strict';
import { armarTramos, cargarContenido } from '../src/teoria/cargar.js';
import { crearEstadoPorTramo } from '../src/teoria/estado-figura.js';
import * as adelante from '../src/teoria/capitulos/adelante/guion.js';
import * as cuentaAdelante from '../src/teoria/capitulos/adelante/cuenta.js';
import * as error from '../src/teoria/capitulos/error/guion.js';
import * as cuentaError from '../src/teoria/capitulos/error/cuenta.js';
import { pendiente } from '../src/teoria/capitulos/corregir/cuenta.js';
import * as corregir from '../src/teoria/capitulos/corregir/guion.js';
import * as cuentaCorregir from '../src/teoria/capitulos/corregir/cuenta.js';
import * as culpa from '../src/teoria/capitulos/culpa/guion.js';
import * as cuentaCulpa from '../src/teoria/capitulos/culpa/cuenta.js';

const texto = (v) => typeof v === 'string' && v.trim().length > 0;
const GUIONES = { adelante, error, corregir, culpa };
const dos = (v) => Math.round(v * 100) / 100;

for (const [id, guion] of Object.entries(GUIONES)) {
  test(`${id}: seis tramos, cada uno con su pregunta, su texto y el estado de la figura`, async () => {
    assert.equal(guion.TRAMOS.length, 6);
    assert.equal(new Set(guion.TRAMOS.map((t) => t.id)).size, 6);
    for (const idioma of ['es', 'en']) {
      const c = await cargarContenido(id, idioma);
      const tramos = armarTramos(guion.TRAMOS, c.tramos);
      for (const t of tramos) {
        const donde = `${id}/${idioma}:${t.id}`;
        assert.ok(texto(t.corto), `${donde} corto`);
        assert.match(t.pregunta, /\?$/, `${donde} abre con una pregunta`);
        assert.ok(t.antes.length > 0 && t.antes.every(texto), `${donde} antes`);
        assert.ok(t.despues.length > 0 && t.despues.every(texto), `${donde} después`);
        assert.equal(typeof t.consigna, 'string', `${donde} consigna`);
        // Primero el caso, después el nombre: ningún término se nombra antes de la figura.
        for (const p of t.antes) assert.doesNotMatch(p, /\*\*/, `${donde} nombra un término antes de mostrarlo`);
        assert.ok(guion.VISTAS.includes(t.estado.vista), `${donde} vista`);
        assert.ok(guion.DE_LA_VISTA[t.estado.vista], `${donde} vista descrita`);
      }
      // Una sola predicción, en el tramo 4, y el desafío al cierre.
      assert.deepEqual(tramos.map((t) => Boolean(t.prediccion)), [false, false, false, true, false, false], `${id}/${idioma}`);
      assert.ok(tramos.at(-1).desafioTexto, `${id}/${idioma} desafío`);
      for (const k of ['estado', 'pedirPista', 'pista', 'logrado']) assert.ok(texto(tramos.at(-1).desafioTexto[k]), `${id}/${idioma} desafío ${k}`);
      assert.match(tramos.at(-1).desafioTexto.estado, /\{bien\}.*\{total\}/, `${id}/${idioma} el desafío muestra el avance`);
      const p = tramos[3].prediccionTexto;
      for (const k of ['pregunta', 'acierto', 'error', 'explicacion', 'pendiente']) assert.ok(texto(p[k]), `${id}/${idioma} predicción ${k}`);
      assert.ok(Object.keys(p.opciones).includes(tramos[3].prediccion.correcta), `${id}/${idioma} la correcta es una opción`);
      assert.ok(guion.VISTAS.includes(tramos[3].prediccion.despues.vista), `${id}/${idioma} el después de la predicción`);
      assert.match(tramos.flatMap((t) => t.despues).join(' '), /\*\*/, `${id}/${idioma} nombra sus términos`);
      // Para profundizar: plegado, con la fórmula, su nombre y cada símbolo dicho en palabras.
      const prof = c.profundizar;
      assert.ok(texto(prof.titulo) && prof.formulas.length > 0, `${id}/${idioma} para profundizar`);
      for (const f of prof.formulas) assert.ok(texto(f.nombre) && texto(f.formula), `${id}/${idioma} fórmula`);
      assert.ok(prof.simbolos.length > 0 && prof.simbolos.every((x) => texto(x.simbolo) && texto(x.que)), `${id}/${idioma} símbolos`);
      assert.ok(prof.frases.length > 0 && prof.frases.every(texto), `${id}/${idioma} frase`);
      // Las fuentes.
      assert.ok(texto(c.fuentes.titulo) && texto(c.fuentes.nota) && c.fuentes.lista.length > 0, `${id}/${idioma} fuentes`);
      for (const f of c.fuentes.lista) assert.ok(texto(f.texto) && (f.url === '' || /^https:\/\//.test(f.url)), `${id}/${idioma} fuente`);
      // Los controles de la figura traen su ayuda de una línea.
      const ayudas = [];
      (function buscar(o) { for (const [k, v] of Object.entries(o)) { if (k === 'ayuda') ayudas.push(v); else if (v && typeof v === 'object') buscar(v); } }(c.figura));
      assert.ok(ayudas.length >= 2 && ayudas.every((a) => texto(a) && a.length <= 70 && !a.includes('\n')), `${id}/${idioma} ayudas de una línea`);
      assert.ok(texto(c.figura.restablecer.rotulo) && texto(c.figura.tocada), `${id}/${idioma} restablecer`);
    }
    // El estado por tramo acepta estos estados: lo que se cambia en uno no pasa a otro (D4).
    const estados = crearEstadoPorTramo(guion.TRAMOS.map((t) => t.estado));
    assert.equal(estados.total, 6);
    assert.deepEqual(estados.entrar(1).estado, structuredClone(guion.TRAMOS[1].estado));
  });
}

// ---- Capítulo 3, «La cuenta hacia adelante» ---------------------------------------------------------------

test('adelante: los números que dice el texto salen de la cuenta', () => {
  const { recorrido, redXor, redDelAuto, LECTURAS_AUTO, ESCENAS } = cuentaAdelante;
  const de = (entradas) => recorrido(redXor(), entradas).map((p) => [p.suma, p.salida]);
  // Tramo 1: con 1 y 0, A suma 0,5 y se enciende, B suma −0,5 y no, C suma 0,5: la red da 1.
  assert.deepEqual(adelante.TRAMOS[0].estado.entradas, [1, 0]);
  assert.deepEqual(de([1, 0]), [[0.5, 1], [-0.5, 0], [0.5, 1]]);
  // Tramo 2: arranca sin calcular. Tramo 3: llega calculada.
  assert.equal(adelante.TRAMOS[1].estado.pasos, 0);
  assert.equal(adelante.TRAMOS[2].estado.pasos, 3);
  // Tramo 4: con 1 y 1, A suma 1,5, B suma 0,5 y C suma −0,5.
  assert.deepEqual(adelante.TRAMOS[3].estado.entradas, [...ESCENAS.prediccion.entradas]);
  assert.deepEqual(de([1, 1]), [[1.5, 1], [0.5, 1], [-0.5, 0]]);
  // Tramo 5: diez neuronas y 54 pesos; la red sin entrenar aprieta tres teclas.
  const auto = recorrido(redDelAuto(), LECTURAS_AUTO);
  assert.equal(auto.length, 10);
  assert.equal(adelante.TRAMOS[4].estado.pasos, auto.length);
  assert.equal(auto.reduce((n, p) => n + p.pesos.length, 0), 54);
  assert.equal(auto.filter((p) => p.salidaDeLaRed && p.salida === 1).length, 3);
});

test('adelante: la respuesta de la predicción sale de la cuenta', async () => {
  const tramo = adelante.TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  assert.equal(tramo.estado.pasos, 0, 'antes de contestar no hay nada calculado');
  assert.equal(tramo.prediccion.despues.pasos, 3);
  assert.deepEqual(tramo.prediccion.despues.entradas, tramo.estado.entradas);
  assert.equal(tramo.prediccion.correcta, adelante.respuestaDeLaPrediccion(tramo.prediccion.despues));
  assert.equal(tramo.prediccion.correcta, cuentaAdelante.ESCENAS.prediccion.salida === 1 ? 'uno' : 'cero');
  assert.equal(adelante.respuestaDeLaPrediccion({ entradas: [1, 0] }), 'uno');
  for (const idioma of ['es', 'en']) {
    const c = await cargarContenido('adelante', idioma);
    assert.deepEqual(Object.keys(c.tramos.prediccion.prediccionTexto.opciones).sort(), ['cero', 'uno']);
  }
});

test('adelante: el desafío no viene resuelto y tiene una solución conocida', () => {
  const { ESCENAS, redXor, salidaDe } = cuentaAdelante;
  const inicio = adelante.TRAMOS.at(-1).estado.entradas;
  assert.deepEqual(inicio, [...ESCENAS.desafio.inicio]);
  assert.ok(adelante.avanceDelDesafio(inicio).bien < 3);
  assert.deepEqual(adelante.avanceDelDesafio(ESCENAS.desafio.solucion), { bien: 3, total: 3 });
  // El avance llega a 3 de 3 justo cuando la red se enciende, en toda la grilla de las perillas (de a
  // cuartos, exactos para la máquina); y eso pasa cuando las entradas suman más de 0,5 y no más de 1,5
  // (lo que dice el texto).
  for (let a = 0; a <= 4; a++) {
    for (let b = 0; b <= 4; b++) {
      const e = [a / 4, b / 4];
      const enciende = salidaDe(redXor(), e) === 1;
      assert.equal(adelante.avanceDelDesafio(e).bien === 3, enciende, e.join());
      assert.equal(enciende, a + b > 2 && a + b <= 6, e.join());
    }
  }
});

// ---- Capítulo 4, «Medir el error» -------------------------------------------------------------------------

test('error: los números que dice el texto salen de la cuenta', () => {
  const { EJEMPLOS, responder, errorMedio, errorDeUnEjemplo, curvaDelError, DESAFIO } = cuentaError;
  const de = (i) => error.neuronaDe(error.TRAMOS[i].estado);
  const [saber, cuanto, vale, , todos, desafio] = error.TRAMOS.map((t) => t.estado);
  // Tramo 1: pesos 2 y −2, con escalón. Acierta seis de ocho: falla el 7 y el 8.
  assert.deepEqual([saber.pesos, saber.sesgo, saber.suave], [[2, -2], 0, false]);
  const escalon = EJEMPLOS.map((e) => responder(de(0), e.inputs).escalon === e.targets[0]);
  assert.deepEqual(escalon, [true, true, true, true, true, true, false, false]);
  // El 7 se parece al 2 y el 8 al 4, con la respuesta contraria.
  assert.deepEqual([EJEMPLOS[1].inputs, EJEMPLOS[6].inputs], [[0.7, 0.4], [0.6, 0.4]]);
  assert.notEqual(EJEMPLOS[1].targets[0], EJEMPLOS[6].targets[0]);
  assert.deepEqual([EJEMPLOS[3].inputs, EJEMPLOS[7].inputs], [[0.4, 0.5], [0.4, 0.6]]);
  assert.notEqual(EJEMPLOS[3].targets[0], EJEMPLOS[7].targets[0]);
  // Tramo 2: llega con escalón y el ejemplo 7 elegido. Su suma da 0,4 y la del 1, 1,4; con la salida
  // suave responden 0,60 y 0,80. Una suma de cero da 0,5.
  assert.deepEqual([cuanto.suave, cuanto.elegido], [false, 6]);
  assert.deepEqual([dos(responder(de(1), EJEMPLOS[6].inputs).suma), dos(responder(de(1), EJEMPLOS[0].inputs).suma)], [0.4, 1.4]);
  assert.deepEqual([dos(responder(de(1), EJEMPLOS[6].inputs).salida), dos(responder(de(1), EJEMPLOS[0].inputs).salida)], [0.6, 0.8]);
  assert.equal(responder({ pesos: [0, 0], sesgo: 0 }, [1, 1]).salida, 0.5);
  // Tramo 3: el error del 1 es 0,22; el del 7, 0,91, el más alto junto con el del 8.
  assert.equal(vale.suave, true);
  const errores = EJEMPLOS.map((e) => dos(errorDeUnEjemplo(de(2), e).error));
  assert.deepEqual([errores[0], errores[6], errores[7]], [0.22, 0.91, 0.91]);
  assert.equal(Math.max(...errores), 0.91);
  // Tramo 5: en −2 el error medio es 1,15 y la curva tiene su fondo cerca de 2,3.
  assert.deepEqual(todos.pesos, [-2, -2]);
  assert.equal(dos(errorMedio(de(4)).medio), 1.15);
  const curva = curvaDelError(de(4), { indice: 0 });
  assert.equal(curva.reduce((a, b) => (b.error < a.error ? b : a)).peso, 2.3);
  // Tramo 6: arranca en 0,94, acertando dos de ocho.
  assert.deepEqual(error.neuronaDe(desafio), structuredClone(DESAFIO.inicio));
  assert.deepEqual([dos(errorMedio(de(5)).medio), errorMedio(de(5)).aciertos], [0.94, 2]);
});

test('error: con estos ejemplos el error medio no baja de 0,48 y ninguna recta los separa', () => {
  const { EJEMPLOS, errorMedio } = cuentaError;
  // El error medio de una neurona con esta medida tiene un solo valle: donde la pendiente es cero está
  // el mínimo. Ese punto (encontrado bajando por la pendiente) da 0,48.
  const fondo = { pesos: [9.07136245158075, 1.7029324490556412], sesgo: -5.152736621303712 };
  const p = pendiente(fondo);
  for (const v of [...p.pesos, p.sesgo]) assert.ok(Math.abs(v) < 1e-6);
  assert.equal(dos(errorMedio(fondo).medio), 0.48);
  // El ejemplo 7 (había que seguir) está dentro del triángulo de los ejemplos 2, 3 y 8 (había que
  // doblar): ninguna recta deja a los tres de un lado y a él del otro.
  const [a, b, c] = [1, 2, 7].map((i) => EJEMPLOS[i].inputs);
  const q = EJEMPLOS[6].inputs;
  const lado = (p1, p2, x) => (p2[0] - p1[0]) * (x[1] - p1[1]) - (p2[1] - p1[1]) * (x[0] - p1[0]);
  const signos = [lado(a, b, q), lado(b, c, q), lado(c, a, q)].map(Math.sign);
  assert.ok(signos.every((s) => s === signos[0] && s !== 0), 'el ejemplo 7 está dentro del triángulo');
  for (const i of [1, 2, 7]) assert.equal(EJEMPLOS[i].targets[0], 1);
  assert.equal(EJEMPLOS[6].targets[0], 0);
});

test('error: la respuesta de la predicción sale de la cuenta', async () => {
  const { EJEMPLOS, errorDeUnEjemplo } = cuentaError;
  const tramo = error.TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  const despues = tramo.prediccion.despues;
  assert.deepEqual([despues.pesos, despues.sesgo, despues.par], [tramo.estado.pesos, tramo.estado.sesgo, tramo.estado.par]);
  assert.equal(tramo.prediccion.correcta, error.respuestaDeLaPrediccion(despues));
  assert.equal(tramo.prediccion.correcta, 'b');
  // Los ejemplos 1 y 3: los dos debían dar 1; respondieron 0,20 y 0,40; sus errores son 1,62 y 0,91.
  assert.deepEqual(despues.par, [0, 2]);
  const [uno, tres] = despues.par.map((i) => errorDeUnEjemplo(error.neuronaDe(despues), EJEMPLOS[i]));
  assert.deepEqual([uno.correcta, tres.correcta], [1, 1]);
  assert.deepEqual([dos(uno.salida), dos(tres.salida)], [0.2, 0.4]);
  assert.deepEqual([dos(uno.error), dos(tres.error)], [1.62, 0.91]);
  assert.equal(error.respuestaDeLaPrediccion({ ...despues, par: [2, 0] }), 'a');
  assert.equal(error.respuestaDeLaPrediccion({ ...despues, par: [2, 2] }), 'igual');
  for (const idioma of ['es', 'en']) {
    const c = await cargarContenido('error', idioma);
    assert.deepEqual(Object.keys(c.tramos.prediccion.prediccionTexto.opciones).sort(), ['a', 'b', 'igual']);
  }
});

test('error: el desafío no viene resuelto y tiene una solución conocida', () => {
  const { DESAFIO } = cuentaError;
  const inicio = error.TRAMOS.at(-1).estado;
  assert.deepEqual(error.avanceDelDesafio(inicio), { bien: 0, total: 4 });
  assert.deepEqual(error.avanceDelDesafio({ ...inicio, ...DESAFIO.solucion }), { bien: 4, total: 4 });
  assert.equal(DESAFIO.meta, 0.6, 'la meta que dice el texto');
});

// ---- Capítulo 5, «Corregir un poco cada vez» --------------------------------------------------------------
// Cuentas deterministas de pasos de corrección: ninguna prueba mide si algo aprende.

test('corregir: los números que dice el texto salen de la cuenta', () => {
  const { ESCENAS, unPaso } = cuentaCorregir;
  const [lado, conPendiente, cuanto, , mapa, desafio] = corregir.TRAMOS.map((t) => t.estado);
  // Tramos 1 a 3: la bolita arranca en −2, con el peso derecho de la curva.
  for (const e of [lado, conPendiente, cuanto]) assert.deepEqual(e.camino, [[...ESCENAS.curva.inicio.pesos]]);
  assert.equal(lado.camino[0][0], -2);
  assert.deepEqual(lado.visto, [-2, -2], 'a ciegas, al llegar no hay nada recorrido');
  // Tramo 2: en −2 la pendiente vale −0,29; el fondo está cerca de 4,3 y ahí vale casi cero.
  assert.equal(dos(pendiente(ESCENAS.curva.inicio).pesos[0]), -0.29);
  assert.equal(corregir.fondoDeLaCurva(), 4.3);
  assert.ok(Math.abs(pendiente({ pesos: [4.3, ESCENAS.curva.inicio.pesos[1]], sesgo: 0 }).pesos[0]) < 0.005);
  // Tramo 3: con tasa 4, el primer paso lleva de −2 a −0,85, y los pasos se acortan.
  assert.equal(cuanto.tasa, 4);
  const pasos = corregir.caminoDe(ESCENAS.curva.inicio, 4, 8, [0]).map((p) => p[0]);
  assert.equal(dos(pasos[1]), -0.85);
  assert.equal(dos(unPaso(ESCENAS.curva.inicio, 4, { mover: [0] }).despues.pesos[0]), -0.85);
  for (let k = 2; k < pasos.length; k++) assert.ok(pasos[k] - pasos[k - 1] < pasos[k - 1] - pasos[k - 2], `el paso ${k} es más corto`);
  // Lo que se dibuja alcanza para los pasos con la tasa de la perilla, de 1 a 12.
  for (let tasa = corregir.RANGO_TASA.desde; tasa <= corregir.RANGO_TASA.hasta; tasa++) {
    for (const [w1] of corregir.caminoDe(ESCENAS.curva.inicio, tasa, corregir.DE_LA_VISTA.paso.tope, [0])) {
      assert.ok(w1 >= corregir.RANGO_CURVA.desde && w1 <= corregir.RANGO_CURVA.hasta, `tasa ${tasa}: ${w1}`);
    }
  }
  // Tramos 5 y 6: el mapa arranca donde el desafío de la cuenta, con error 0,94.
  assert.deepEqual(mapa.camino, [[...ESCENAS.desafio.inicio.pesos]]);
  assert.deepEqual(desafio.camino, [[...ESCENAS.desafio.inicio.pesos]]);
  assert.equal(dos(corregir.errorEn(desafio.camino[0])), 0.94);
  assert.equal(corregir.DE_LA_VISTA.desafio.tope, 10);
  assert.equal(ESCENAS.desafio.meta, 0.6);
});

test('corregir: la respuesta de la predicción sale de la cuenta', async () => {
  const { ESCENAS } = cuentaCorregir;
  const tramo = corregir.TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  assert.equal(tramo.estado.tasa, 60);
  assert.deepEqual(tramo.estado.camino, [[...ESCENAS.curva.inicio.pesos]], 'antes de contestar, la bolita no dio ningún paso');
  const despues = tramo.prediccion.despues;
  assert.equal(despues.tasa, ESCENAS.curva.tasas.muyAlta);
  assert.deepEqual(despues.camino, corregir.caminoDe(ESCENAS.curva.inicio, 60, 8, [0]));
  assert.equal(tramo.prediccion.correcta, corregir.respuestaDeLaPrediccion(despues));
  assert.equal(tramo.prediccion.correcta, 'rebota');
  // Lo que dice la explicación: el primer paso la manda a 15,21, fuera del dibujo; termina en 10,24.
  assert.equal(dos(despues.camino[1][0]), 15.21);
  assert.ok(despues.camino[1][0] > corregir.RANGO_CURVA.hasta);
  assert.equal(dos(despues.camino.at(-1)[0]), 10.24);
  // Las otras dos opciones son lo que pasa con las otras tasas de la cuenta.
  const con = (tasa) => corregir.respuestaDeLaPrediccion({ camino: corregir.caminoDe(ESCENAS.curva.inicio, tasa, 8, [0]) });
  assert.equal(con(ESCENAS.curva.tasas.chica), 'llega');
  assert.equal(con(ESCENAS.curva.tasas.alta), 'vuelve');
  for (const idioma of ['es', 'en']) {
    const c = await cargarContenido('corregir', idioma);
    assert.deepEqual(Object.keys(c.tramos.prediccion.prediccionTexto.opciones).sort(), ['llega', 'rebota', 'vuelve']);
  }
});

test('corregir: el desafío no viene resuelto y tiene una solución conocida', () => {
  const { ESCENAS } = cuentaCorregir;
  const inicio = corregir.TRAMOS.at(-1).estado;
  const tras = (tasa) => ({ ...inicio, tasa, camino: corregir.caminoDe(ESCENAS.desafio.inicio, tasa, ESCENAS.desafio.pasos, [0, 1]) });
  assert.deepEqual(corregir.avanceDelDesafio(inicio), { bien: 0, total: 4 });
  // Con la tasa con que llega (2), diez pasos no alcanzan; con la de la solución conocida, sí.
  assert.equal(inicio.tasa, 2);
  assert.ok(corregir.avanceDelDesafio(tras(inicio.tasa)).bien < 4);
  assert.deepEqual(corregir.avanceDelDesafio(tras(ESCENAS.desafio.solucion.tasa)), { bien: 4, total: 4 });
  // Lo que dice el texto: en la perilla, de 7 para arriba alcanza y de 6 para abajo no.
  for (let tasa = corregir.RANGO_TASA.desde; tasa <= corregir.RANGO_TASA.hasta; tasa++) {
    assert.equal(corregir.avanceDelDesafio(tras(tasa)).bien === 4, tasa >= 7, `tasa ${tasa}`);
  }
});

// ---- Capítulo 6, «Repartir la culpa» ----------------------------------------------------------------------
// Cuentas deterministas de una ida y una vuelta: ninguna prueba mide si la red aprende.

test('culpa: los números que dice el texto salen de la cuenta', () => {
  const { crearRedSuave, idaYVuelta, errorMedio, aciertos, TASA, RED_INICIAL } = cuentaCulpa;
  const r = idaYVuelta(crearRedSuave(), culpa.EJEMPLO);
  // El ejemplo: entra 1 y 0, y había que dar 1. La red responde 0,41 y su error es 0,9. A da 0,62 y B, 0,5.
  assert.deepEqual([culpa.EJEMPLO.inputs, culpa.EJEMPLO.targets], [[1, 0], [1]]);
  assert.deepEqual([dos(r.ida.salida.salida), dos(r.error.medida)], [0.41, 0.9]);
  assert.deepEqual(r.ida.ocultas.map((o) => dos(o.salida)), [0.62, 0.5]);
  assert.equal(r.correcciones.filter((c) => c.tipo === 'peso').length, 6);
  assert.equal(r.correcciones.filter((c) => c.tipo === 'sesgo').length, 3);
  // Tramo 2: la culpa de la salida es −0,59.
  assert.equal(dos(r.culpaSalida), -0.59);
  // Tramo 3: a A (unida con 1) le llega −0,59 y a B (unida con −1), 0,59; sus culpas son −0,14 y 0,15.
  assert.deepEqual(r.culpaOcultas.map((o) => o.pesoQueLasUne), [1, -1]);
  assert.deepEqual(r.culpaOcultas.map((o) => dos(o.llega)), [-0.59, 0.59]);
  assert.deepEqual(r.culpaOcultas.map((o) => dos(o.culpa)), [-0.14, 0.15]);
  assert.deepEqual(r.culpaOcultas.map((o) => dos(o.pendiente)), [0.24, 0.25]);
  // Tramo 4: los tres pesos de la predicción valen 1, −1,5 y 0,5 y cambian +0,18, +0,07 y nada. A traía 0,62.
  const de = (id) => r.correcciones.find((c) => c.tipo === 'peso' && c.capa === culpa.OPCIONES[id].capa && c.neurona === culpa.OPCIONES[id].neurona && c.entrada === culpa.OPCIONES[id].entrada);
  assert.deepEqual(['salida', 'entrada', 'apagada'].map((id) => de(id).antes), [1, -1.5, 0.5]);
  assert.deepEqual(['salida', 'entrada', 'apagada'].map((id) => dos(de(id).cambio)), [0.18, 0.07, 0]);
  assert.equal(dos(de('salida').traia), 0.62);
  // Los que llegan a C cambian más que los de atrás, y el sesgo de C es el que más cambia: +0,3.
  const pesos = r.correcciones.filter((c) => c.tipo === 'peso');
  const menorDeC = Math.min(...pesos.filter((c) => c.capa === 2).map((c) => Math.abs(c.cambio)));
  const mayorDeAtras = Math.max(...pesos.filter((c) => c.capa === 1).map((c) => Math.abs(c.cambio)));
  assert.ok(menorDeC > mayorDeAtras);
  const masCambia = r.correcciones.reduce((a, b) => (Math.abs(b.cambio) > Math.abs(a.cambio) ? b : a));
  assert.deepEqual([masCambia.tipo, masCambia.capa, dos(masCambia.cambio)], ['sesgo', 2, 0.3]);
  assert.equal(TASA, 0.5, 'la tasa que dice «Para profundizar»');
  // Tramo 5: el error medio arranca en 0,72 y la red de partida acierta uno de cuatro.
  assert.equal(dos(errorMedio(crearRedSuave())), 0.72);
  assert.deepEqual(aciertos(crearRedSuave()), { bien: 1, total: 4 });
  // Los estados del guion: los pasos de cada tramo y el peso del desafío, el de la red de partida.
  assert.deepEqual(culpa.TRAMOS.map((t) => t.estado.pasos), [0, 0, 1, 2, 0, 1]);
  for (const t of culpa.TRAMOS) {
    assert.equal(t.estado.peso, RED_INICIAL.salida.pesos[0]);
    assert.equal(t.estado.epocas, 0);
    assert.ok(t.estado.pasos <= Math.max(culpa.DE_LA_VISTA[t.estado.vista].tope, 0));
  }
});

test('culpa: la respuesta de la predicción sale de la cuenta', async () => {
  const { crearRedSuave, idaYVuelta, pesoQueMasCambia } = cuentaCulpa;
  const tramo = culpa.TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  assert.equal(tramo.estado.pasos, 2, 'antes de contestar se ven las culpas, no los cambios');
  assert.equal(tramo.prediccion.despues.pasos, 3);
  assert.equal(tramo.prediccion.correcta, culpa.respuestaDeLaPrediccion());
  assert.equal(tramo.prediccion.correcta, 'salida');
  const mas = pesoQueMasCambia(idaYVuelta(crearRedSuave(), culpa.EJEMPLO).correcciones);
  assert.deepEqual([mas.capa, mas.neurona, mas.entrada], Object.values(culpa.OPCIONES.salida));
  assert.deepEqual(culpa.PESO_DEL_DESAFIO, culpa.OPCIONES.salida, 'el desafío mueve el peso que más cambiaba');
  for (const idioma of ['es', 'en']) {
    const c = await cargarContenido('culpa', idioma);
    assert.deepEqual(Object.keys(c.tramos.prediccion.prediccionTexto.opciones).sort(), Object.keys(culpa.OPCIONES).sort());
  }
});

test('culpa: el desafío no viene resuelto y tiene una solución conocida', () => {
  const { DESAFIO, RED_INICIAL } = cuentaCulpa;
  const inicio = culpa.TRAMOS.at(-1).estado;
  assert.deepEqual(culpa.avanceDelDesafio(inicio), { bien: 0, total: 5 });
  assert.deepEqual(culpa.avanceDelDesafio({ ...inicio, peso: RED_INICIAL.salida.pesos[0] + DESAFIO.solucion.paso }), { bien: 5, total: 5 });
  assert.equal(culpa.avanceDelDesafio({ ...inicio, peso: 0.5 }).bien, 0, 'para el otro lado no avanza');
  // Lo que dice el texto: subir el peso baja el error del ejemplo y bajarlo lo sube.
  const { crearRedSuave, conPeso, idaYVuelta } = cuentaCulpa;
  const errorCon = (peso) => idaYVuelta(conPeso(crearRedSuave(), culpa.PESO_DEL_DESAFIO, peso), culpa.EJEMPLO).error.medida;
  assert.ok(errorCon(1.5) < errorCon(1) && errorCon(0.5) > errorCon(1));
});
