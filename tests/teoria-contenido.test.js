// Guion y textos de «Una neurona» y de la historia (seccion-teoria D2 y D8; vienen de teoria-prototipos
// D2, D6 y D7).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import comunEs from '../src/teoria/contenido/es/comun.js';
import comunEn from '../src/teoria/contenido/en/comun.js';
import neuronaEs from '../src/teoria/contenido/es/neurona.js';
import neuronaEn from '../src/teoria/contenido/en/neurona.js';
import historiaEs from '../src/teoria/contenido/es/historia.js';
import historiaEn from '../src/teoria/contenido/en/historia.js';
import { TRAMOS, VISTAS } from '../src/teoria/capitulos/neurona/guion.js';
import { HITOS } from '../src/teoria/hitos.js';
import { capituloDe } from '../src/teoria/capitulos/indice.js';
import { armarTramos } from '../src/teoria/cargar.js';
import { crearNeurona, calcular, TABLA_AND } from '../src/teoria/capitulos/neurona/cuenta.js';
import { zonaEncendida } from '../src/teoria/figuras/zona.js';
import { DEFAULT_SENSORS } from '../src/core/sensors.js';

/** Cada idioma armado como lo arma la película: el capítulo con sus tramos, la figura y la historia. */
const armar = (comun, neurona, historia) => ({
  comun,
  capitulo: { ...neurona, tramos: armarTramos(TRAMOS, neurona.tramos) },
  figura: neurona.figura,
  historia: { ...historia, hitos: HITOS.map((h) => ({ ...h, ...historia.hitos[h.id] })) },
});
const es = armar(comunEs, neuronaEs, historiaEs);
const en = armar(comunEn, neuronaEn, historiaEn);
const IDIOMAS = { es, en };
const texto = (v) => typeof v === 'string' && v.trim().length > 0;
const salidaDe = ({ entradas, pesos, sesgo }) => calcular(crearNeurona({ pesos: [...pesos], sesgo }), [...entradas]).salida;

test('guion: seis tramos, cada uno con su pregunta, su texto y el estado de la figura', () => {
  assert.equal(TRAMOS.length, 6);
  for (const [idioma, c] of Object.entries(IDIOMAS)) {
    const tramos = c.capitulo.tramos;
    assert.deepEqual(tramos.map((t) => t.id), TRAMOS.map((t) => t.id), idioma);
    for (const t of tramos) {
      const donde = `${idioma}:${t.id}`;
      assert.ok(texto(t.pregunta), `${donde} pregunta`);
      assert.ok(texto(t.corto), `${donde} corto`);
      assert.ok(t.antes.length > 0 && t.antes.every(texto), `${donde} antes`);
      assert.ok(t.despues.length > 0 && t.despues.every(texto), `${donde} despues`);
      assert.equal(typeof t.consigna, 'string', `${donde} consigna`);
      assert.ok(VISTAS.includes(t.estado.vista), `${donde} vista`);
      assert.equal(t.estado.entradas.length, 2, `${donde} entradas`);
      assert.equal(t.estado.pesos.length, 2, `${donde} pesos`);
      assert.ok([...t.estado.entradas, ...t.estado.pesos, t.estado.sesgo].every(Number.isFinite), `${donde} números`);
    }
  }
});

test('guion: una pregunta abre cada tramo y un término se nombra después de la figura', () => {
  for (const [idioma, c] of Object.entries(IDIOMAS)) {
    for (const t of c.capitulo.tramos) {
      assert.match(t.pregunta, /\?$/, `${idioma}:${t.id} abre con una pregunta`);
      // Los términos (**así**) no aparecen antes de la figura: primero el caso, después el nombre (D4).
      for (const p of t.antes) assert.doesNotMatch(p, /\*\*/, `${idioma}:${t.id} nombra un término antes de mostrarlo`);
    }
  }
});

test('guion: la predicción del tramo 4 se contesta haciendo la cuenta', () => {
  const tramo = TRAMOS.find((t) => t.prediccion);
  assert.equal(tramo.id, 'prediccion');
  assert.equal(salidaDe(tramo.estado), 0, 'antes está apagada');
  const enciende = salidaDe(tramo.prediccion.despues) === 1;
  assert.equal(tramo.prediccion.correcta, enciende ? 'si' : 'no');
  for (const [idioma, c] of Object.entries(IDIOMAS)) {
    const t = c.capitulo.tramos.find((x) => x.id === 'prediccion').prediccionTexto;
    assert.deepEqual(Object.keys(t.opciones).sort(), ['no', 'si'], idioma);
    for (const k of ['pregunta', 'acierto', 'error', 'explicacion', 'pendiente']) assert.ok(texto(t[k]), `${idioma}:${k}`);
  }
});

test('guion: los números que dice la prosa son los de la figura', () => {
  // Tramo 3: "casi lo mismo" y aun así dobla. Tramo 4: la suma de antes y la de después.
  const sesgo = TRAMOS.find((t) => t.id === 'sesgo').estado;
  assert.deepEqual(sesgo.entradas, [0.5, 0.45]);
  assert.equal(salidaDe(sesgo), 1);
  const pred = TRAMOS.find((t) => t.id === 'prediccion');
  const suma = (e) => calcular(crearNeurona({ pesos: [...e.pesos], sesgo: e.sesgo }), [...e.entradas]).suma;
  assert.ok(Math.abs(suma(pred.estado) - -0.25) < 1e-9);
  assert.ok(Math.abs(suma(pred.prediccion.despues) - 0.2) < 1e-9);
  assert.match(es.capitulo.tramos[3].prediccionTexto.explicacion, /0,2\b.*−0,25/);
  assert.match(en.capitulo.tramos[3].prediccionTexto.explicacion, /0\.2\b.*−0\.25/);
});

test('guion: el desafío del AND arranca sin resolver y tiene solución con las perillas', () => {
  const inicio = TRAMOS.find((t) => t.id === 'and').estado;
  const bien = (valores) => TABLA_AND.filter(({ entradas, salida }) => salidaDe({ ...valores, entradas }) === salida).length;
  assert.ok(bien(inicio) < 4, 'el desafío no viene resuelto');
  // Solución al alcance de las perillas (de −2 a 2, de a 0,1).
  assert.equal(bien({ pesos: [1, 1], sesgo: -1.5 }), 4);
});

test('historia: doce hitos con año, título, texto, dibujo y su vínculo con la práctica', () => {
  assert.equal(HITOS.length, 12);
  for (const [idioma, c] of Object.entries(IDIOMAS)) {
    const hitos = c.historia.hitos;
    assert.deepEqual(hitos.map((x) => x.id), HITOS.map((x) => x.id), idioma);
    for (const x of hitos) {
      const donde = `${idioma}:${x.id}`;
      assert.ok(texto(x.anio) && texto(x.titulo), donde);
      // Dos párrafos como máximo (spec "Hitos de 1943 a los modelos de lenguaje").
      assert.ok(x.texto.length > 0 && x.texto.length <= 2 && x.texto.every(texto), `${donde} texto`);
      assert.ok(texto(c.historia.imagenes[x.id]), `${donde} texto alternativo de la imagen`);
      assert.equal(typeof x.quien, 'string', `${donde} quién`);
      assert.equal(typeof x.pestana, 'string', `${donde} pestaña`);
      if (x.capitulo) {
        assert.ok(texto(c.comun.capitulos[x.capitulo].titulo), `${donde} capítulo`);
        assert.ok(texto(x.pestana), `${donde} pestaña`);
        assert.ok(texto(x.quien), `${donde} quién`);
      }
      // Una pausa no nombra ni capítulo ni pestaña.
      if (x.pausa) assert.ok(!x.capitulo && !x.pestana, donde);
    }
    assert.deepEqual(hitos.map((x) => x.anio).slice(0, 3), ['1943', '1958', '1969'], idioma);
    assert.deepEqual(hitos.map((x) => x.anio).slice(-6), ['1997', '1998', '2012', '2016', '2017', '2022'], idioma);
    // Los dos inviernos, cada uno en su época.
    assert.deepEqual(hitos.filter((x) => !x.quien).map((x) => x.id), ['h1970', 'h1987'], idioma);
    // Lo que la práctica todavía no tiene lo dice, en lugar de nombrar una pestaña.
    assert.deepEqual(hitos.filter((x) => !x.pestana && !x.pausa).map((x) => x.id), ['h2012', 'h2016', 'h2017', 'h2022'], idioma);
    for (const k of ['sinCapitulo', 'ningunCapitulo', 'sinPractica', 'lineaNota', 'final']) assert.ok(texto(c.historia[k]), `${idioma}:${k}`);
  }
  // Los vínculos que confirmó la revisión de contenido: 1997 al capítulo 0; 2012 sin capítulo.
  assert.deepEqual(HITOS.map((x) => x.capitulo), ['neurona', 'neurona', 'xor', null, 'culpa', null, 'programar', 'culpa', null, null, null, null]);
  // Los capítulos escritos se enlazan; los demás se anuncian. 1986 y 1998 enlazan a «Repartir la culpa».
  assert.deepEqual(HITOS.filter((x) => capituloDe(x.capitulo)?.disponible).map((x) => x.capitulo), ['neurona', 'neurona', 'xor', 'culpa', 'programar', 'culpa']);
});

test('historia: los textos nuevos no afirman lo que la revisión de contenido pidió no afirmar', () => {
  const de = (c, id) => c.historia.hitos.find((x) => x.id === id).texto.join(' ');
  for (const [idioma, c] of Object.entries(IDIOMAS)) {
    // Deep Blue: ni red neuronal ni aprendía jugando, pero sus números se afinaron con partidas.
    assert.match(de(c, 'h1997'), idioma === 'es' ? /miles de partidas de maestros/ : /thousands of master games/, idioma);
    assert.doesNotMatch(de(c, 'h1997'), /nada aprendido|nothing learned/, idioma);
    // LeNet: "millones de cheques", sin decir por día ni por mes.
    assert.doesNotMatch(de(c, 'h1998'), /por día|por mes|per day|per month|a day|a month/, idioma);
    // AlphaGo: primero de partidas de expertos; no "solo" ni "desde cero".
    assert.match(de(c, 'h2016'), idioma === 'es' ? /expertos humanos/ : /human experts/, idioma);
    assert.doesNotMatch(de(c, 'h2016'), /desde cero|from scratch/, idioma);
    // ChatGPT: los 100 millones son una estimación de analistas, no una cifra de OpenAI.
    assert.match(de(c, 'h2022'), idioma === 'es' ? /estimación de analistas \(no es una cifra de OpenAI\)/ : /estimate by analysts \(it is not a figure from OpenAI\)/, idioma);
    // El segundo invierno no da un año para el recorte de DARPA.
    assert.doesNotMatch(de(c, 'h1987'), /DARPA|1988/, idioma);
  }
});

test('historia: la fuente de las fechas y los nombres queda anotada en contenido/es/historia.js', () => {
  const fuente = readFileSync(fileURLToPath(new URL('../src/teoria/contenido/es/historia.js', import.meta.url)), 'utf8');
  assert.match(fuente, /FUENTES/);
  // Las publicaciones originales, cada una con su año, y lo que quedó sin verificar.
  for (const [anio, autor] of [['1943', 'McCulloch'], ['1958', 'Rosenblatt'], ['1969', 'Minsky'], ['1986', 'Rumelhart']]) {
    assert.match(fuente, new RegExp(`//\\s+${anio}\\s+${autor}`), `${anio} ${autor}`);
  }
  assert.match(fuente, /No se verificó/);
});

test('idiomas: cada control tiene su ayuda, de una sola línea corta', () => {
  // Revisión 1 del dueño: ayudas chicas, de una línea. El punto y los casos del plano no llevan ayuda a
  // la vista, pero conservan su descripción para lectores de pantalla.
  const MAXIMO = 80;
  for (const [idioma, c] of Object.entries(IDIOMAS)) {
    const f = c.figura;
    const ayudas = [...Object.entries(f.controles).map(([id, ctl]) => [id, ctl.ayuda]), ['restablecer', f.restablecer.ayuda]];
    for (const [id, ayuda] of ayudas) {
      assert.ok(texto(ayuda), `${idioma}:${id}`);
      assert.ok(ayuda.length <= MAXIMO, `${idioma}:${id} tiene ${ayuda.length} caracteres (máximo ${MAXIMO})`);
    }
    for (const ctl of Object.values(f.controles)) assert.ok(texto(ctl.antes) && texto(ctl.nombre), idioma);
    assert.ok(texto(f.punto.descripcion) && texto(f.and.descripcion), idioma);
  }
});

test('zona: el lado del plano donde la neurona se enciende', () => {
  const caja = { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
  // x > 0,5: la mitad derecha
  assert.deepEqual(zonaEncendida({ pesos: [1, 0], sesgo: -0.5 }, caja), [[0.5, 0], [1, 0], [1, 1], [0.5, 1]]);
  // AND: el triángulo de la esquina (1, 1)
  const and = zonaEncendida({ pesos: [1, 1], sesgo: -1.5 }, caja);
  assert.equal(and.length, 3);
  assert.ok(and.some(([x, y]) => x === 1 && y === 1));
  // sin pesos: todo o nada, según el sesgo
  assert.equal(zonaEncendida({ pesos: [0, 0], sesgo: 1 }, caja).length, 4);
  assert.deepEqual(zonaEncendida({ pesos: [0, 0], sesgo: -1 }, caja), []);
  // todos los vértices dan suma mayor o igual que 0
  const v = { pesos: [0.7, -1.3], sesgo: 0.2 };
  for (const [x, y] of zonaEncendida(v, caja)) assert.ok(v.pesos[0] * x + v.pesos[1] * y + v.sesgo > -1e-12);
});

test('contenido: el auto del capítulo es uno imaginado y la neurona es artificial', () => {
  // Revisión contra fuentes (C2): el auto de la práctica tiene cinco sensores, no dos.
  assert.equal(DEFAULT_SENSORS.count, 5);
  for (const [idioma, c] of Object.entries(IDIOMAS)) {
    const t1 = c.capitulo.tramos[0];
    assert.match(t1.antes[0], idioma === 'es' ? /^Imaginá .*cinco/ : /^Picture .*five/, idioma);
    assert.match(t1.despues.join(' '), idioma === 'es' ? /\*\*neurona artificial\*\*/ : /\*\*artificial neuron\*\*/, idioma);
  }
});
