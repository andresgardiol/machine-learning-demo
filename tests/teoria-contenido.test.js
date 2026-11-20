// Guion y textos de los prototipos de teoría (teoria-prototipos D2, D6 y D7; tareas 2.1, 2.2 y 2.3).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import es from '../prototipos/teoria/contenido/es.js';
import en from '../prototipos/teoria/contenido/en.js';
import { TRAMOS, HITOS, VISTAS } from '../prototipos/teoria/contenido/guion.js';
import { crearNeurona, calcular, TABLA_AND } from '../prototipos/teoria/figuras/cuenta.js';
import { zonaEncendida } from '../prototipos/teoria/figuras/zona.js';
import { DEFAULT_SENSORS } from '../src/core/sensors.js';

const IDIOMAS = { es, en };
const texto = (v) => typeof v === 'string' && v.trim().length > 0;
const salidaDe = ({ entradas, pesos, sesgo }) => calcular(crearNeurona({ pesos: [...pesos], sesgo }), [...entradas]).salida;

/** Todas las claves de un objeto, con su camino; los arreglos cuentan con su largo. */
function claves(valor, camino = '') {
  if (Array.isArray(valor)) return [`${camino}[${valor.length}]`, ...valor.flatMap((v, i) => claves(v, `${camino}.${i}`))];
  if (valor && typeof valor === 'object') return Object.keys(valor).sort().flatMap((k) => claves(valor[k], camino ? `${camino}.${k}` : k));
  return [`${camino}:${typeof valor}`];
}

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

test('historia: cinco hitos con año, título, texto y su vínculo con la práctica', () => {
  assert.equal(HITOS.length, 5);
  for (const [idioma, c] of Object.entries(IDIOMAS)) {
    const hitos = c.historia.hitos;
    assert.deepEqual(hitos.map((x) => x.id), HITOS.map((x) => x.id), idioma);
    for (const x of hitos) {
      const donde = `${idioma}:${x.id}`;
      assert.ok(texto(x.anio) && texto(x.titulo), donde);
      assert.ok(x.texto.length > 0 && x.texto.every(texto), `${donde} texto`);
      assert.ok(texto(c.historia.imagenes[x.id]), `${donde} texto alternativo de la imagen`);
      if (x.capitulo) {
        assert.ok(texto(c.historia.capitulos[x.capitulo]), `${donde} capítulo`);
        assert.ok(texto(x.pestana), `${donde} pestaña`);
        assert.ok(texto(x.quien), `${donde} quién`);
      }
    }
    assert.deepEqual(hitos.map((x) => x.anio).slice(0, 3), ['1943', '1958', '1969'], idioma);
    assert.equal(hitos.at(-1).anio, '1986', idioma);
    // Solo "Una neurona" existe; los demás capítulos se anuncian.
    assert.deepEqual(hitos.filter((x) => x.disponible).map((x) => x.capitulo), ['neurona', 'neurona']);
  }
});

test('historia: la fuente de las fechas y los nombres queda anotada en es.js', () => {
  const fuente = readFileSync(fileURLToPath(new URL('../prototipos/teoria/contenido/es.js', import.meta.url)), 'utf8');
  assert.match(fuente, /FUENTES/);
  // Las publicaciones originales, cada una con su año, y lo que quedó sin verificar.
  for (const [anio, autor] of [['1943', 'McCulloch'], ['1958', 'Rosenblatt'], ['1969', 'Minsky'], ['1986', 'Rumelhart']]) {
    assert.match(fuente, new RegExp(`//\\s+${anio}\\s+${autor}`), `${anio} ${autor}`);
  }
  assert.match(fuente, /No se verificó/);
});

test('idiomas: español e inglés tienen las mismas claves', () => {
  assert.deepEqual(claves(en), claves(es));
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
