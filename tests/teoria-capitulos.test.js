// Guion y textos de «Programar o aprender» y de «Una recta no alcanza», la línea de tiempo de la
// historia y el bloque de fuentes (seccion-teoria D8 y D9; tareas 5.5, 5.6, 6.2 a 6.5 y 7.2 a 7.5).
import test from 'node:test';
import assert from 'node:assert/strict';
import programarEs from '../src/teoria/contenido/es/programar.js';
import programarEn from '../src/teoria/contenido/en/programar.js';
import xorEs from '../src/teoria/contenido/es/xor.js';
import xorEn from '../src/teoria/contenido/en/xor.js';
import neuronaEs from '../src/teoria/contenido/es/neurona.js';
import neuronaEn from '../src/teoria/contenido/en/neurona.js';
import historiaEs from '../src/teoria/contenido/es/historia.js';
import historiaEn from '../src/teoria/contenido/en/historia.js';
import * as programar from '../src/teoria/capitulos/programar/guion.js';
import * as xor from '../src/teoria/capitulos/xor/guion.js';
import {
  SITUACIONES, contarAciertos, buscarEnOrden, buscarUmbral, umbralesDelBarrido,
} from '../src/teoria/capitulos/programar/cuenta.js';
import {
  TABLA_XOR, RED_XOR, crearRed, aciertosDeUnaNeurona, aciertosDeLaRed, zonasDeLaRed, zonaEntre,
} from '../src/teoria/capitulos/xor/cuenta.js';
import { recortar, cajaComoPoligono, zonaEncendida } from '../src/teoria/figuras/zona.js';
import { armarTramos } from '../src/teoria/cargar.js';
import { crearEstadoPorTramo } from '../src/teoria/estado-figura.js';
import { HITOS, TRAMOS_DE_LA_LINEA, lugarEnLaLinea } from '../src/teoria/hitos.js';

const texto = (v) => typeof v === 'string' && v.trim().length > 0;
const CAPITULOS = {
  programar: { guion: programar, es: programarEs, en: programarEn },
  xor: { guion: xor, es: xorEs, en: xorEn },
};

for (const [id, cap] of Object.entries(CAPITULOS)) {
  test(`${id}: seis tramos, cada uno con su pregunta, su texto y el estado de la figura`, () => {
    assert.equal(cap.guion.TRAMOS.length, 6);
    assert.equal(new Set(cap.guion.TRAMOS.map((t) => t.id)).size, 6);
    for (const idioma of ['es', 'en']) {
      const tramos = armarTramos(cap.guion.TRAMOS, cap[idioma].tramos);
      for (const t of tramos) {
        const donde = `${id}/${idioma}:${t.id}`;
        assert.ok(texto(t.corto), `${donde} corto`);
        assert.match(t.pregunta, /\?$/, `${donde} abre con una pregunta`);
        assert.ok(t.antes.length > 0 && t.antes.every(texto), `${donde} antes`);
        assert.ok(t.despues.length > 0 && t.despues.every(texto), `${donde} después`);
        assert.equal(typeof t.consigna, 'string', `${donde} consigna`);
        // Primero el caso, después el nombre: ningún término se nombra antes de la figura.
        for (const p of t.antes) assert.doesNotMatch(p, /\*\*/, `${donde} nombra un término antes de mostrarlo`);
        assert.ok(cap.guion.VISTAS.includes(t.estado.vista), `${donde} vista`);
      }
      // Una sola predicción, en el tramo 4, y el desafío al cierre.
      assert.deepEqual(tramos.map((t) => Boolean(t.prediccion)), [false, false, false, true, false, false], `${id}/${idioma}`);
      assert.ok(tramos.at(-1).desafioTexto, `${id}/${idioma} desafío`);
      for (const k of ['estado', 'pedirPista', 'pista', 'logrado']) assert.ok(texto(tramos.at(-1).desafioTexto[k]), `${id}/${idioma} desafío ${k}`);
      const p = tramos[3].prediccionTexto;
      for (const k of ['pregunta', 'acierto', 'error', 'explicacion', 'pendiente']) assert.ok(texto(p[k]), `${id}/${idioma} predicción ${k}`);
      assert.ok(Object.keys(p.opciones).includes(tramos[3].prediccion.correcta), `${id}/${idioma} la correcta es una opción`);
      // Los términos del capítulo llegan después de la figura.
      assert.match(tramos.flatMap((t) => t.despues).join(' '), /\*\*/, `${id}/${idioma} nombra sus términos`);
    }
    // El estado por tramo acepta estos estados: lo que se cambia en uno no pasa a otro (D4).
    const estados = crearEstadoPorTramo(cap.guion.TRAMOS.map((t) => t.estado));
    estados.cambiar(1, { vista: cap.guion.TRAMOS[1].estado.vista });
    assert.equal(estados.cambiado(1), false);
    assert.deepEqual(estados.entrar(2).estado, structuredClone(cap.guion.TRAMOS[2].estado));
  });

  test(`${id}: cada control tiene su ayuda, de una sola línea corta, en los dos idiomas`, () => {
    const MAXIMO = 80;
    const ayudas = (valor, camino = '') => (typeof valor === 'string'
      ? (/(^|\.)ayuda\w*$/i.test(camino) ? [[camino, valor]] : [])
      : Object.entries(valor).flatMap(([k, v]) => ayudas(v, camino ? `${camino}.${k}` : k)));
    for (const idioma of ['es', 'en']) {
      const lista = ayudas(cap[idioma].figura);
      assert.ok(lista.length >= 3, `${id}/${idioma}`);
      for (const [camino, ayuda] of lista) {
        assert.ok(texto(ayuda), `${id}/${idioma}:${camino}`);
        assert.ok(ayuda.length <= MAXIMO, `${id}/${idioma}:${camino} tiene ${ayuda.length} caracteres (máximo ${MAXIMO})`);
        assert.doesNotMatch(ayuda, /\n/, `${id}/${idioma}:${camino}`);
      }
      assert.ok(texto(cap[idioma].figura.restablecer.rotulo) && texto(cap[idioma].figura.tocada), `${id}/${idioma}`);
    }
  });
}

// ---- Programar o aprender ------------------------------------------------------------------------------

const aciertos = (id) => programar.aciertosDelEstado(programar.TRAMOS.find((t) => t.id === id).estado);

test('programar: los números que dice la prosa son los de la figura', () => {
  // Tramo 1: con 0,5, las seis bien. Tramo 2: con 0,1 falla dos de seis; sirve de 0,4 hasta antes de 0,6.
  assert.deepEqual([aciertos('regla').aciertos, aciertos('regla').total], [6, 6]);
  assert.deepEqual([aciertos('umbral').aciertos, aciertos('umbral').total], [4, 6]);
  const seis = SITUACIONES.slice(0, 6);
  const sirven = umbralesDelBarrido().filter((u) => contarAciertos([{ sensor: 'izquierdo', umbral: u }], seis).aciertos === 6);
  assert.deepEqual(sirven, [0.4, 0.45, 0.5, 0.55]);
  assert.match(programarEs.tramos.umbral.despues.join(' '), /desde 0,4 hasta antes de 0,6/);
  assert.match(programarEn.tramos.umbral.despues.join(' '), /from 0\.4 up to just below 0\.6/);
  // Tramo 3: con una regla, la séptima falla; ningún umbral acierta las ocho, y por debajo de 0,2 falla más.
  const otra = aciertos('otra');
  assert.equal(otra.aciertos, 7);
  assert.deepEqual(otra.resultados.filter((r) => !r.bien).map((r) => r.id), ['s7']);
  assert.deepEqual([SITUACIONES[6].izquierdo, SITUACIONES[6].derecho], [0.2, 0.7]);
  for (const u of umbralesDelBarrido()) {
    const r = contarAciertos([{ sensor: 'izquierdo', umbral: u }]);
    assert.ok(r.aciertos < 8, `umbral ${u}`);
    if (u < 0.2) assert.ok(r.resultados[6].bien && r.aciertos < 7, `umbral ${u}: arregla la séptima y rompe otras`);
  }
  // Tramo 5: arranca mal a propósito. Tramo 6: arranca en 0,2 y falla dos.
  assert.ok(aciertos('buscar').aciertos < 6);
  assert.deepEqual(programar.TRAMOS.at(-1).estado.umbrales, [0.2, 0.2]);
  assert.equal(aciertos('desafio').aciertos, 6);
  // El auto de la práctica tiene cinco sensores (lo dice el tramo 1 y el cierre del desafío).
  assert.match(programarEs.tramos.regla.antes[0], /cinco/);
  assert.match(programarEn.tramos.regla.antes[0], /five/);
});

test('programar: la respuesta de la predicción sale de la cuenta', () => {
  const tramo = programar.TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  // Antes: una regla en 0,5 y falla una. Después: la segunda regla (0,3) arregla la séptima y rompe la octava.
  assert.equal(programar.aciertosDelEstado(tramo.estado).aciertos, 7);
  const despues = programar.aciertosDelEstado(tramo.prediccion.despues);
  assert.deepEqual(despues.resultados.filter((r) => !r.bien).map((r) => r.id), ['s8']);
  assert.equal(tramo.prediccion.correcta, programar.OPCIONES_DE_LA_PREDICCION[despues.total - despues.aciertos]);
  assert.equal(tramo.prediccion.correcta, 'una');
  assert.deepEqual(tramo.prediccion.despues.umbrales, [0.5, 0.3]);
  for (const c of [programarEs, programarEn]) {
    assert.deepEqual(Object.keys(c.tramos.prediccion.prediccionTexto.opciones), [...programar.OPCIONES_DE_LA_PREDICCION]);
  }
  assert.equal(SITUACIONES[7].derecho, 0.4, 'la octava: el derecho lee 0,4');
});

test('programar: "Buscar" llega a las ocho desde cualquier estado y el desafío tiene solución a mano', () => {
  const r = buscarEnOrden();
  assert.deepEqual(r.reglas, [{ sensor: 'izquierdo', umbral: 0.4 }, { sensor: 'derecho', umbral: 0.4 }]);
  assert.equal(r.aciertos, 8);
  assert.equal(r.pasos.length, 2);
  // Veintiún números por regla, como dice la prosa.
  assert.deepEqual(r.pasos.map((p) => p.probados.length), [21, 21]);
  assert.match(programarEs.tramos.buscar.despues[0], /veintiuno por regla/);
  assert.match(programarEn.tramos.buscar.despues[0], /twenty-one per rule/);
  // La primera pasada es la primera regla sola: no depende de dónde estaba la segunda.
  assert.deepEqual(r.pasos[0], buscarUmbral({ sensor: 'izquierdo' }));
  assert.deepEqual(buscarEnOrden(), r, 'determinista');
  // Buscar cada regla con la otra fija donde arranca el desafío se queda trabado: por eso busca en orden.
  const [u1, u2] = programar.TRAMOS.at(-1).estado.umbrales;
  const trabada = buscarUmbral({ sensor: 'izquierdo', otras: [{ sensor: 'derecho', umbral: u2 }] });
  assert.ok(trabada.aciertos < 8 && u1 === 0.2);
  // A mano, con las perillas (de a 0,05): hay pares que aciertan las ocho.
  assert.equal(contarAciertos(programar.reglasDe([0.5, 0.5], 2)).aciertos, 8);
});

// ---- Una recta no alcanza -------------------------------------------------------------------------------

const estadoXor = (id) => xor.TRAMOS.find((t) => t.id === id).estado;

test('xor: los números que dice la prosa son los de la figura', () => {
  // Tramo 1: la neurona del AND acierta uno solo. Tramo 2: acierta tres y falla (1, 1).
  assert.equal(aciertosDeUnaNeurona(estadoXor('distintas').a).bien, 1);
  const tope = aciertosDeUnaNeurona(estadoXor('tope').a);
  assert.equal(tope.bien, 3);
  assert.deepEqual(tope.puntos.filter((p) => !p.bien).map((p) => p.entradas), [[1, 1]]);
  // Tramo 4, antes: los cuatro puntos del lado apagado de B, y tres entre las dos rectas.
  const antes = estadoXor('prediccion');
  assert.deepEqual([antes.b.pesos, antes.b.sesgo], [[1, 1], -2.4]);
  assert.deepEqual(xor.puntosEntre(antes), [[0, 1], [1, 0], [1, 1]]);
  // Tramo 5: C con 1, 1 y −0,5 acierta tres y falla (1, 1). Tramo 6: arranca sin resolver.
  const junta = estadoXor('junta');
  assert.deepEqual([junta.c.pesos, junta.c.sesgo], [[1, 1], -0.5]);
  const red = aciertosDeLaRed(crearRed(xor.redDe(junta)));
  assert.equal(red.bien, 3);
  assert.deepEqual(red.puntos.filter((p) => !p.bien).map((p) => p.entradas), [[1, 1]]);
  assert.ok(aciertosDeLaRed(crearRed(xor.redDe(estadoXor('desafio')))).bien < 4, 'el desafío no viene resuelto');
  // El desafío tiene solución moviendo solo C, al alcance de las perillas (de −2 a 2, de a 0,1).
  const resuelta = { ...estadoXor('desafio'), c: { pesos: [1, -1], sesgo: -0.5 } };
  assert.equal(aciertosDeLaRed(crearRed(xor.redDe(resuelta))).bien, 4);
  assert.deepEqual(xor.redDe(resuelta), structuredClone({ ocultas: RED_XOR.ocultas, salida: RED_XOR.salida }));
});

test('xor: la respuesta de la predicción sale de la cuenta', () => {
  const tramo = xor.TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  const despues = tramo.prediccion.despues;
  assert.equal(despues.b.sesgo, -1.5);
  // Entre las dos rectas quedan justo los puntos que tienen que dar 1.
  assert.deepEqual(xor.puntosEntre(despues), TABLA_XOR.filter((p) => p.salida === 1).map((p) => [...p.entradas]));
  assert.equal(tramo.prediccion.correcta, xor.respuestaDeLaPrediccion(despues));
  assert.equal(tramo.prediccion.correcta, 'circulos');
  assert.equal(xor.respuestaDeLaPrediccion(tramo.estado), 'tres', 'antes de contestar hay tres');
  for (const c of [xorEs, xorEn]) {
    assert.deepEqual(Object.keys(c.tramos.prediccion.prediccionTexto.opciones).sort(), ['circulos', 'cuadrado', 'tres']);
  }
});

test('xor: la zona clara de la red y la franja entre las dos rectas', () => {
  const caja = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
  // Recortar con el lado encendido da lo mismo que zonaEncendida; con el apagado, el resto.
  const v = { pesos: [1, 0], sesgo: -0.5 };
  assert.deepEqual(recortar(cajaComoPoligono(caja), v, true), zonaEncendida(v, caja));
  assert.deepEqual(recortar(cajaComoPoligono(caja), v, false), [[0, 0], [0.5, 0], [0.5, 1], [0, 1]]);
  assert.deepEqual(recortar(cajaComoPoligono(caja), { pesos: [0, 0], sesgo: -1 }, true), []);
  assert.equal(recortar(cajaComoPoligono(caja), { pesos: [0, 0], sesgo: -1 }, false).length, 4);
  // La red del XOR enciende una sola zona: la franja donde la primera oculta dice sí y la segunda no.
  const zonas = zonasDeLaRed(RED_XOR, caja);
  assert.equal(zonas.length, 1);
  assert.deepEqual(zonas[0].ocultas, [1, 0]);
  assert.deepEqual(zonas[0].poligono, zonaEntre(RED_XOR, caja));
  // Los puntos del XOR que dan 1 están dentro de esa franja; los otros, no.
  const dentro = ([x, y]) => x + y > 0.5 && x + y <= 1.5;
  for (const p of TABLA_XOR) assert.equal(dentro(p.entradas), p.salida === 1);
  for (const [x, y] of zonas[0].poligono) assert.ok(x + y >= 0.5 - 1e-9 && x + y <= 1.5 + 1e-9);
  // Una salida que nunca se enciende no tiene zona.
  assert.deepEqual(zonasDeLaRed({ ...RED_XOR, salida: { pesos: [0, 0], sesgo: -1 } }, caja), []);
});

// ---- Historia: la línea de tiempo y las fuentes ---------------------------------------------------------

test('línea de tiempo: doce marcas en orden, a escala dentro de cada tramo, con un corte', () => {
  assert.equal(HITOS.length, 12);
  const marcas = HITOS.map((x) => x.marca);
  assert.deepEqual(marcas, [...marcas].sort((a, b) => a - b));
  assert.equal(TRAMOS_DE_LA_LINEA.length, 2);
  assert.ok(TRAMOS_DE_LA_LINEA[0].hasta < TRAMOS_DE_LA_LINEA[1].desde, 'entre los dos tramos hay un corte');
  const lugares = HITOS.map((x) => lugarEnLaLinea(x.marca));
  // Cada marca cae dentro de su tramo, y cada tramo empieza y termina en una marca.
  for (const [i, t] of TRAMOS_DE_LA_LINEA.entries()) {
    const propios = lugares.filter((l) => l.tramo === i).map((l) => l.lugar);
    assert.equal(propios[0], 0);
    assert.equal(propios.at(-1), 1);
    assert.ok(propios.every((l) => l >= 0 && l <= 1));
    assert.ok(t.hasta > t.desde);
  }
  // A escala: dentro de un tramo, la distancia entre dos marcas es proporcional a los años.
  const { desde, hasta } = TRAMOS_DE_LA_LINEA[0];
  assert.ok(Math.abs(lugarEnLaLinea(1958).lugar - (1958 - desde) / (hasta - desde)) < 1e-12);
  // Ninguna marca pisa a otra: en un renglón de 300 px (un celular de 360), las marcas de un tramo
  // quedan a 12 px o más entre centros, y un punto mide 8 (12 el del hito que se lee).
  const RENGLON = 300;
  for (let i = 1; i < lugares.length; i++) {
    if (lugares[i].tramo !== lugares[i - 1].tramo) continue;
    const separacion = (lugares[i].lugar - lugares[i - 1].lugar) * RENGLON;
    assert.ok(separacion >= 12, `${HITOS[i - 1].id} y ${HITOS[i].id}: ${separacion.toFixed(1)} px`);
  }
  // En un renglón solo (desde 1024 px, cada riel mide unos 400 px), dos marcas a menos de 48 px llevan
  // el rótulo una arriba y otra abajo.
  const RIEL = 400;
  for (let i = 1; i < HITOS.length; i++) {
    if (lugares[i].tramo !== lugares[i - 1].tramo) continue;
    const pegadas = (lugares[i].lugar - lugares[i - 1].lugar) * RIEL < 48;
    if (pegadas) assert.notEqual(Boolean(HITOS[i].arriba), Boolean(HITOS[i - 1].arriba), `${HITOS[i - 1].id} y ${HITOS[i].id}`);
  }
  assert.throws(() => lugarEnLaLinea(Number.NaN), TypeError);
  assert.deepEqual(lugarEnLaLinea(1993), { tramo: 0, lugar: 1 });
  assert.deepEqual(lugarEnLaLinea(1996), { tramo: 1, lugar: 0 });
});

test('fuentes: cada capítulo y la historia cierran con sus fuentes, en los dos idiomas', () => {
  const todos = { programar: [programarEs, programarEn], neurona: [neuronaEs, neuronaEn], xor: [xorEs, xorEn], historia: [historiaEs, historiaEn] };
  for (const [id, [es, en]] of Object.entries(todos)) {
    for (const [idioma, c] of [['es', es], ['en', en]]) {
      const f = c.fuentes;
      assert.ok(texto(f.titulo) && texto(f.nota), `${id}/${idioma}`);
      assert.ok(f.lista.length > 0, `${id}/${idioma}`);
      for (const fuente of f.lista) {
        assert.ok(texto(fuente.texto), `${id}/${idioma}`);
        assert.equal(typeof fuente.nota, 'string');
        assert.ok(fuente.url === '' || /^https:\/\//.test(fuente.url), `${id}/${idioma}: ${fuente.url}`);
      }
    }
    // Las mismas fuentes, con los mismos enlaces, en los dos idiomas.
    assert.deepEqual(en.fuentes.lista.map((x) => x.url), es.fuentes.lista.map((x) => x.url), id);
  }
  // La historia dice qué descansa en fuentes secundarias.
  const notas = historiaEs.fuentes.lista.map((x) => x.nota).join(' ');
  assert.match(notas, /secundaria/);
  for (const autor of ['McCulloch', 'Rosenblatt', 'Minsky', 'Rumelhart', 'Campbell', 'LeCun', 'Krizhevsky', 'Silver', 'Vaswani']) {
    assert.ok(historiaEs.fuentes.lista.some((x) => x.texto.includes(autor)), autor);
  }
});
