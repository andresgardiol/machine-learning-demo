// Guion y textos de los capítulos 7 a 9 de la teoría (seccion-teoria D12; tareas 15.2 a 17.5): seis
// tramos con sus campos, la respuesta de la predicción y la solución del desafío salen de la cuenta, y
// cada capítulo cierra con "Para profundizar" y sus fuentes. Ninguna prueba mide si algo aprende: los
// números de una generación son una cuenta con semilla, siempre la misma.
import test from 'node:test';
import assert from 'node:assert/strict';
import { armarTramos, cargarContenido } from '../src/teoria/cargar.js';
import { crearEstadoPorTramo } from '../src/teoria/estado-figura.js';
import * as evolucion from '../src/teoria/capitulos/evolucion/guion.js';
import * as cuentaEvolucion from '../src/teoria/capitulos/evolucion/cuenta.js';
import * as generalizar from '../src/teoria/capitulos/generalizar/guion.js';
import * as cuentaGeneralizar from '../src/teoria/capitulos/generalizar/cuenta.js';
import * as adentro from '../src/teoria/capitulos/adentro/guion.js';
import * as cuentaAdentro from '../src/teoria/capitulos/adentro/cuenta.js';

const texto = (v) => typeof v === 'string' && v.trim().length > 0;
const dos = (v) => Math.round(v * 100) / 100;
// En qué tramo va la predicción de cada capítulo (desde 0): en el 7 es el quinto (D12).
const GUIONES = { evolucion: { guion: evolucion, prediccion: 4 }, generalizar: { guion: generalizar, prediccion: 3 }, adentro: { guion: adentro, prediccion: 3 } };

for (const [id, { guion, prediccion }] of Object.entries(GUIONES)) {
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
      // Una sola predicción y el desafío al cierre.
      assert.deepEqual(tramos.map((t) => Boolean(t.prediccion)), [0, 1, 2, 3, 4, 5].map((k) => k === prediccion), `${id}/${idioma}`);
      assert.ok(tramos.at(-1).desafioTexto, `${id}/${idioma} desafío`);
      for (const k of ['estado', 'pedirPista', 'pista', 'logrado']) assert.ok(texto(tramos.at(-1).desafioTexto[k]), `${id}/${idioma} desafío ${k}`);
      assert.match(tramos.at(-1).desafioTexto.estado, /\{bien\}.*\{total\}/, `${id}/${idioma} el desafío muestra el avance`);
      const p = tramos[prediccion].prediccionTexto;
      for (const k of ['pregunta', 'acierto', 'error', 'explicacion', 'pendiente']) assert.ok(texto(p[k]), `${id}/${idioma} predicción ${k}`);
      assert.ok(Object.keys(p.opciones).includes(tramos[prediccion].prediccion.correcta), `${id}/${idioma} la correcta es una opción`);
      assert.ok(guion.VISTAS.includes(tramos[prediccion].prediccion.despues.vista), `${id}/${idioma} el después de la predicción`);
      assert.match(tramos.flatMap((t) => t.despues).join(' '), /\*\*/, `${id}/${idioma} nombra sus términos`);
      const prof = c.profundizar;
      assert.ok(texto(prof.titulo) && prof.formulas.length > 0, `${id}/${idioma} para profundizar`);
      for (const f of prof.formulas) assert.ok(texto(f.nombre) && texto(f.formula), `${id}/${idioma} fórmula`);
      assert.ok(prof.simbolos.length > 0 && prof.simbolos.every((x) => texto(x.simbolo) && texto(x.que)), `${id}/${idioma} símbolos`);
      assert.ok(prof.frases.length > 0 && prof.frases.every(texto), `${id}/${idioma} frase`);
      assert.ok(texto(c.fuentes.titulo) && texto(c.fuentes.nota) && c.fuentes.lista.length > 0, `${id}/${idioma} fuentes`);
      for (const f of c.fuentes.lista) assert.ok(texto(f.texto) && (f.url === '' || /^https:\/\//.test(f.url)), `${id}/${idioma} fuente`);
      const ayudas = [];
      (function buscar(o) { for (const [k, v] of Object.entries(o)) { if (k === 'ayuda') ayudas.push(v); else if (v && typeof v === 'object') buscar(v); } }(c.figura));
      assert.ok(ayudas.length >= 2 && ayudas.every((a) => texto(a) && a.length <= 70 && !a.includes('\n')), `${id}/${idioma} ayudas de una línea`);
      assert.ok(texto(c.figura.restablecer.rotulo) && texto(c.figura.tocada), `${id}/${idioma} restablecer`);
    }
    const estados = crearEstadoPorTramo(guion.TRAMOS.map((t) => t.estado));
    assert.equal(estados.total, 6);
    assert.deepEqual(estados.entrar(1).estado, structuredClone(guion.TRAMOS[1].estado));
  });
}

// ---- Capítulo 7, «Aprender por evolución» -----------------------------------------------------------------

test('evolución: los números que dice el texto salen de la cuenta', () => {
  const { poblacionAlAzar, puntuar, DESAFIO } = cuentaEvolucion;
  const errores = (p) => puntuar(p).puntajes.map((x) => x.error);
  // Tramo 1: en la primera tanda la mejor tiene 0,68 y la peor, 1,31. Tramo 2: en la segunda, 0,53.
  const primera = errores(poblacionAlAzar({ tanda: 0 }));
  assert.deepEqual([dos(Math.min(...primera)), dos(Math.max(...primera))], [0.68, 1.31]);
  assert.equal(dos(evolucion.mejorError(poblacionAlAzar({ tanda: 1 }))), 0.53);
  for (const t of evolucion.TRAMOS) assert.equal(t.estado.tanda, 0);
  // Tramos 3 y 4: pasan tres y la fuerza arranca en 30 %; con eso, en la primera generación la mejor baja a 0,56.
  const [, , seleccion, mutacion, , desafio] = evolucion.TRAMOS.map((t) => t.estado);
  assert.deepEqual([seleccion.pasan, mutacion.pasan, mutacion.fuerza], [3, 3, 30]);
  const tras = evolucion.poblacionDe({ ...mutacion, historia: [{ pasan: 3, fuerza: 30, elegidos: null }] });
  assert.equal(tras.generacion, 1);
  assert.equal(tras.padres.length, 3);
  assert.equal(dos(evolucion.mejorError(tras.poblacion)), 0.56);
  // Las perillas no se salen de lo que acepta la cuenta: de 1 a 6 padres.
  assert.deepEqual([evolucion.RANGOS.pasan.desde, evolucion.RANGOS.pasan.hasta], [1, 6]);
  // Tramo 6: tres generaciones, fuerza 30 %, meta 0,6.
  assert.deepEqual([evolucion.DE_LA_VISTA.desafio.tope, desafio.fuerza, DESAFIO.meta], [3, 30, 0.6]);
});

test('evolución: la respuesta de la predicción sale de la cuenta', async () => {
  const { poblacionAlAzar } = cuentaEvolucion;
  const tramo = evolucion.TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  assert.deepEqual([tramo.estado.fuerza, tramo.estado.historia.length], [0, 0], 'antes de contestar no se dio la generación');
  const despues = tramo.prediccion.despues;
  assert.deepEqual(despues.historia, [{ pasan: 3, fuerza: 0, elegidos: null }]);
  assert.equal(tramo.prediccion.correcta, evolucion.respuestaDeLaPrediccion(despues));
  assert.equal(tramo.prediccion.correcta, 'copias');
  // Lo que dice la explicación: las doce quedan en tres lugares y la mejor sigue con 0,68.
  const { poblacion } = evolucion.poblacionDe(despues);
  assert.equal(new Set(poblacion.map((ind) => cuentaEvolucion.pesosDe(ind).join())).size, 3);
  assert.equal(evolucion.mejorError(poblacion), evolucion.mejorError(poblacionAlAzar({ tanda: 0 })));
  // Con mutación ya no son copias.
  assert.notEqual(evolucion.respuestaDeLaPrediccion({ ...despues, historia: [{ pasan: 3, fuerza: 30, elegidos: null }] }), 'copias');
  for (const idioma of ['es', 'en']) {
    const c = await cargarContenido('evolucion', idioma);
    assert.deepEqual(Object.keys(c.tramos.prediccion.prediccionTexto.opciones).sort(), ['azar', 'copias', 'mejora']);
  }
});

test('evolución: el desafío no viene resuelto y tiene una solución conocida', () => {
  const { puntuar, DESAFIO } = cuentaEvolucion;
  let estado = structuredClone(evolucion.TRAMOS.at(-1).estado);
  assert.deepEqual(evolucion.avanceDelDesafio(estado), { bien: 0, total: 4 });
  // La solución conocida: elegir cada vez las tres de menos error, como haría la persona en la figura.
  for (let g = 0; g < DESAFIO.generaciones; g++) {
    const elegidos = puntuar(evolucion.poblacionDe(estado).poblacion).orden.slice(0, DESAFIO.solucion.padres);
    estado = { ...estado, historia: [...estado.historia, { pasan: elegidos.length, fuerza: estado.fuerza, elegidos }] };
  }
  assert.deepEqual(evolucion.avanceDelDesafio(estado), { bien: 4, total: 4 });
  // El estado con los padres elegidos da lo mismo que la cuenta paso a paso.
  assert.equal(evolucion.poblacionDe(estado).generacion, 3);
});

// ---- Capítulo 8, «Generalizar o memorizar» ----------------------------------------------------------------

test('generalizar: los números que dice el texto salen de la cuenta', () => {
  const { comparar, puntos, DATOS, ANGULOS, PARTES_APARTADAS } = cuentaGeneralizar;
  const c = comparar();
  // Tramo 1: cuarenta vistos; el memorizador acierta 40 y la recta, 35 (cinco mal). Tramo 4: en los
  // cuarenta apartados, 38 la recta y 31 el memorizador (nueve fallos).
  assert.deepEqual([c.vistos, c.apartados], [40, 40]);
  assert.deepEqual([c.memorizador.vistos, c.recta.vistos, c.vistos - c.recta.vistos], [40, 35, 5]);
  assert.deepEqual([c.recta.apartados, c.memorizador.apartados, c.apartados - c.memorizador.apartados], [38, 31, 9]);
  // «Para profundizar»: 100 % y 77,5 %; 87,5 % y 95 %.
  assert.deepEqual([c.memorizador.apartados / c.apartados, c.recta.vistos / c.vistos, c.recta.apartados / c.apartados], [0.775, 0.875, 0.95]);
  // La recta es la mejor de 24 candidatas, una cada 15 grados.
  assert.deepEqual([ANGULOS.length, ANGULOS[1] - ANGULOS[0]], [24, 15]);
  // Los naranjas (respuesta 1) tienden a estar arriba a la izquierda y los azules, abajo a la derecha.
  const { todos } = puntos();
  const medio = (clase, k) => { const ps = todos.filter((e) => e.targets[0] === clase); return ps.reduce((s, e) => s + e.inputs[k], 0) / ps.length; };
  assert.ok(medio(1, 0) < 0 && medio(1, 1) > 0 && medio(0, 0) > 0 && medio(0, 1) < 0);
  assert.equal(todos.length, 80);
  // Los tramos 1 a 5 usan la separación del capítulo; el desafío arranca con el 10 %: ocho de ochenta,
  // y los dos aciertan los ocho.
  for (const t of generalizar.TRAMOS.slice(0, 5)) assert.equal(t.estado.holdout, DATOS.holdout);
  const inicio = generalizar.TRAMOS.at(-1).estado;
  assert.equal(inicio.holdout, PARTES_APARTADAS[0]);
  const diez = comparar({ holdout: inicio.holdout });
  assert.deepEqual([diez.apartados, diez.recta.apartados, diez.memorizador.apartados], [8, 8, 8]);
  // Antes de la predicción no se dicen los aciertos en los apartados.
  for (const t of generalizar.TRAMOS.slice(0, 4)) assert.equal(generalizar.DE_LA_VISTA[t.estado.vista].aciertosNuevos, false, t.id);
});

test('generalizar: la respuesta de la predicción sale de la cuenta', async () => {
  const tramo = generalizar.TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  const despues = tramo.prediccion.despues;
  assert.equal(despues.holdout, tramo.estado.holdout);
  assert.equal(tramo.prediccion.correcta, generalizar.respuestaDeLaPrediccion(despues));
  assert.equal(tramo.prediccion.correcta, cuentaGeneralizar.comparar().mejorEnApartados);
  assert.equal(tramo.prediccion.correcta, 'recta');
  assert.equal(generalizar.respuestaDeLaPrediccion({ holdout: 10 }), 'igual', 'con ocho apartados empatan');
  for (const idioma of ['es', 'en']) {
    const c = await cargarContenido('generalizar', idioma);
    assert.deepEqual(Object.keys(c.tramos.prediccion.prediccionTexto.opciones).sort(), ['igual', 'memorizador', 'recta']);
  }
});

test('generalizar: el desafío no viene resuelto y tiene una solución conocida', () => {
  const { comparar, PARTES_APARTADAS } = cuentaGeneralizar;
  const inicio = generalizar.TRAMOS.at(-1).estado;
  assert.equal(inicio.elegido, null);
  assert.deepEqual(generalizar.avanceDelDesafio(inicio), { bien: 0, total: 2 });
  // Elegir sin que se vea una diferencia no cuenta.
  assert.equal(generalizar.avanceDelDesafio({ ...inicio, elegido: 'recta' }).bien, 0);
  // En cada parte de la perilla: se resuelve quedándose con el que rinde mejor en los apartados, cuando
  // hay diferencia. La solución conocida: apartar el 25 % o más y quedarse con la recta.
  for (const holdout of PARTES_APARTADAS) {
    const mejor = comparar({ holdout }).mejorEnApartados;
    for (const elegido of generalizar.QUIENES) {
      const { bien } = generalizar.avanceDelDesafio({ ...inicio, holdout, elegido });
      assert.equal(bien === 2, mejor !== 'empate' && elegido === mejor, `${holdout} ${elegido}`);
    }
    assert.equal(generalizar.avanceDelDesafio({ ...inicio, holdout, elegido: 'recta' }).bien === 2, holdout >= 25, `${holdout}`);
  }
});

// ---- Capítulo 9, «Qué quedó adentro» ----------------------------------------------------------------------

test('adentro: lo que dice el texto sale de la cuenta', () => {
  const { numeros, mapaDeOculta, mapaDeSalida, ESCENAS } = cuentaAdentro;
  const base = adentro.TRAMOS[0].estado;
  // Tramo 1: la red entera da el XOR; adentro hay seis pesos y tres sesgos.
  assert.deepEqual(adentro.casosDe(base).map((k) => k.bien), [true, true, true, true]);
  const n = numeros(adentro.redDe(base));
  assert.equal([...n.ocultas, n.salida].reduce((s, x) => s + x.pesos.length, 0), 6);
  assert.equal([...n.ocultas, n.salida].length, 3);
  // Tramo 2: A se enciende si alguna entrada vale 1; B, solo si valen 1 las dos; la red, donde A sí y B no.
  const casos = adentro.casosDe(base);
  assert.deepEqual(casos.map((k) => k.ocultas[0]), [0, 1, 1, 1]);
  assert.deepEqual(casos.map((k) => k.ocultas[1]), [0, 0, 0, 1]);
  assert.deepEqual(casos.map((k) => k.salida), casos.map((k) => (k.ocultas[0] === 1 && k.ocultas[1] === 0 ? 1 : 0)));
  assert.equal(mapaDeOculta(0, { n: 24 }).length, 24);
  assert.equal(mapaDeSalida({ n: 24 }).flat().filter((v) => v === 1).length > 0, true);
  // Tramo 3: sin B falla solo el caso de las dos entradas en 1, y la red se enciende con cualquier entrada en 1.
  const sinB = adentro.casosDe({ ...base, apagadas: [1] });
  assert.deepEqual(sinB.filter((k) => !k.bien).map((k) => k.entradas), [[1, 1]]);
  assert.deepEqual(sinB.map((k) => k.salida), [0, 1, 1, 1]);
  assert.deepEqual(adentro.DE_LA_VISTA.apagar.apagar, [1], 'en el tramo 3 solo se apaga B: lo de A es la predicción');
  // Tramo 4: sin A la red contesta 0 siempre.
  assert.deepEqual(adentro.casosDe({ ...base, apagadas: [...ESCENAS.prediccion.apagar] }).map((k) => k.salida), [0, 0, 0, 0]);
  assert.ok(mapaDeSalida({ n: 24, apagadas: [0] }).flat().every((v) => v === 0), 'la zona clara desaparece');
  // Tramo 5: el peso de B a la salida vale −1; en −0,5 o más abajo la red da el XOR, y por encima no.
  assert.equal(adentro.PESO, -1);
  for (let k = -20; k <= 20; k++) {
    const peso = k / 10;
    const fallan = adentro.casosDe({ ...base, peso }).filter((x) => !x.bien).map((x) => x.entradas);
    assert.deepEqual(fallan, peso <= -0.5 ? [] : [[1, 1]], `peso ${peso}`);
  }
  // «Para profundizar»: apagar B cuesta un acierto; apagar A, dos.
  const aciertos = (apagadas) => adentro.casosDe({ ...base, apagadas }).filter((k) => k.bien).length;
  assert.deepEqual([aciertos([]) - aciertos([1]), aciertos([]) - aciertos([0])], [1, 2]);
});

test('adentro: la respuesta de la predicción sale de la cuenta', async () => {
  const tramo = adentro.TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  assert.deepEqual(tramo.estado.apagadas, [], 'antes de contestar la red está entera');
  const despues = tramo.prediccion.despues;
  assert.deepEqual(despues.apagadas, [...cuentaAdentro.ESCENAS.prediccion.apagar]);
  assert.equal(tramo.prediccion.correcta, adentro.respuestaDeLaPrediccion(despues));
  assert.equal(tramo.prediccion.correcta, 'distintas');
  assert.equal(adentro.respuestaDeLaPrediccion({ ...despues, apagadas: [1] }), 'iguales');
  assert.equal(adentro.respuestaDeLaPrediccion({ ...despues, apagadas: [] }), 'ninguno');
  for (const idioma of ['es', 'en']) {
    const c = await cargarContenido('adentro', idioma);
    assert.deepEqual(Object.keys(c.tramos.prediccion.prediccionTexto.opciones).sort(), ['distintas', 'iguales', 'ninguno']);
  }
});

test('adentro: el desafío no viene resuelto y tiene una solución conocida', () => {
  const inicio = adentro.TRAMOS.at(-1).estado;
  assert.deepEqual(adentro.avanceDelDesafio(inicio), { bien: 3, total: 4 }, 'la red entera acierta el caso que hay que romper');
  assert.deepEqual(adentro.avanceDelDesafio({ ...inicio, apagadas: [...cuentaAdentro.ESCENAS.desafio.solucion] }), { bien: 4, total: 4 });
  assert.ok(adentro.avanceDelDesafio({ ...inicio, apagadas: [0] }).bien < 4);
  assert.ok(adentro.avanceDelDesafio({ ...inicio, apagadas: [0, 1] }).bien < 4);
  assert.deepEqual(adentro.DE_LA_VISTA.desafio.apagar, [0, 1]);
});

// ---- «Para profundizar» en los capítulos 0 a 2 (tarea 18.1) -----------------------------------------------

test('para profundizar: los diez capítulos lo traen, en los dos idiomas', async () => {
  const { CAPITULOS } = await import('../src/teoria/capitulos/indice.js');
  const { RED_XOR } = await import('../src/teoria/capitulos/xor/cuenta.js');
  for (const { id } of CAPITULOS) {
    for (const idioma of ['es', 'en']) {
      const p = (await cargarContenido(id, idioma)).profundizar;
      assert.ok(p && texto(p.titulo) && texto(p.intro), `${id}/${idioma}`);
      assert.ok(Array.isArray(p.formulas) && Array.isArray(p.simbolos), `${id}/${idioma}`);
      assert.ok(p.frases.length > 0 && p.frases.every(texto), `${id}/${idioma}`);
      // Con fórmula, cada símbolo va nombrado; el capítulo 0 no lleva fórmula.
      assert.equal(p.formulas.length > 0, id !== 'programar', `${id}/${idioma}`);
      if (p.formulas.length > 0) assert.ok(p.simbolos.length > 0, `${id}/${idioma}`);
    }
  }
  // La fórmula del capítulo 2 usa los números de la red del capítulo.
  assert.deepEqual(structuredClone(RED_XOR), { ocultas: [{ pesos: [1, 1], sesgo: -0.5 }, { pesos: [1, 1], sesgo: -1.5 }], salida: { pesos: [1, -1], sesgo: -0.5 } });
  const xor = (await cargarContenido('xor', 'es')).profundizar;
  assert.match(xor.formulas.map((f) => f.formula).join(' '), /x₁ \+ x₂ − 0,5.*x₁ \+ x₂ − 1,5.*A − B − 0,5/);
  assert.match(xor.frases.join(' '), /Cybenko.*Hornik/);
});
