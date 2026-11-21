// Temario y contenido de la teoría (seccion-teoria D2 y D9, tareas 1.5, 1.6 y 2.4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CAPITULOS, DISPONIBLES, DESTINO_APP, capituloDe } from '../src/teoria/capitulos/indice.js';
import { cargarContenido, cargarGuion, armarTramos } from '../src/teoria/cargar.js';
import { IDIOMAS } from '../src/teoria/idioma.js';
import { HITOS } from '../src/teoria/hitos.js';

const raiz = new URL('../src/teoria/', import.meta.url);
const existe = (camino) => existsSync(fileURLToPath(new URL(camino, raiz)));
const texto = (v) => typeof v === 'string' && v.trim().length > 0;

/** Todas las claves de un valor, con su camino; los arreglos cuentan con su largo. */
function claves(valor, camino = '') {
  if (Array.isArray(valor)) return [`${camino}[${valor.length}]`, ...valor.flatMap((v, i) => claves(v, `${camino}.${i}`))];
  if (valor && typeof valor === 'object') return Object.keys(valor).sort().flatMap((k) => claves(valor[k], camino ? `${camino}.${k}` : k));
  return [`${camino}:${typeof valor}`];
}

test('índice: los diez capítulos del temario, del 0 al 9, con su pestaña', () => {
  assert.deepEqual(CAPITULOS.map((c) => c.numero), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(new Set(CAPITULOS.map((c) => c.id)).size, 10);
  assert.deepEqual(CAPITULOS.slice(0, 3).map((c) => c.id), ['programar', 'neurona', 'xor']);
  for (const c of CAPITULOS) {
    assert.ok(/^[a-z]+$/.test(c.id), c.id);
    assert.equal(typeof c.disponible, 'boolean', c.id);
    assert.ok(c.pestanas.length > 0, c.id);
  }
  assert.equal(capituloDe('neurona').numero, 1);
  assert.equal(capituloDe('nada'), null);
  assert.equal(DESTINO_APP, '../');
  assert.deepEqual(DISPONIBLES, CAPITULOS.filter((c) => c.disponible).map((c) => c.id));
  assert.ok(DISPONIBLES.includes('neurona'));
});

test('índice: cada capítulo disponible tiene guion, figura y contenido en los dos idiomas', async () => {
  for (const id of DISPONIBLES) {
    assert.ok(existe(`capitulos/${id}/guion.js`), `${id}: guion`);
    assert.ok(existe(`capitulos/${id}/figura.js`), `${id}: figura`);
    const guion = await cargarGuion(id);
    assert.ok(guion.length > 0, `${id}: tramos`);
    for (const idioma of IDIOMAS) {
      const c = await cargarContenido(id, idioma);
      assert.ok(texto(c.titulo) && texto(c.bajada), `${id}/${idioma}: título y bajada`);
      assert.ok(texto(c.cierre?.texto) && texto(c.cierre?.enlace), `${id}/${idioma}: cierre`);
      assert.deepEqual(Object.keys(c.tramos).sort(), guion.map((t) => t.id).sort(), `${id}/${idioma}: un texto por tramo`);
      assert.doesNotThrow(() => armarTramos(guion, c.tramos));
    }
  }
});

test('índice: cada capítulo tiene título en los dos idiomas, y cada pestaña y ejercicio su nombre', async () => {
  for (const idioma of IDIOMAS) {
    const comun = await cargarContenido('comun', idioma);
    assert.equal(comun.idioma, idioma);
    assert.deepEqual(Object.keys(comun.capitulos), CAPITULOS.map((c) => c.id), idioma);
    for (const c of CAPITULOS) {
      assert.ok(texto(comun.capitulos[c.id].titulo), `${idioma}:${c.id}`);
      for (const p of c.pestanas) assert.ok(texto(comun.pestanas[p]), `${idioma}:${c.id}:${p}`);
      if (c.ejercicio) assert.ok(texto(comun.ejercicios[c.ejercicio]), `${idioma}:${c.id}:${c.ejercicio}`);
    }
  }
});

test('historia: cada hito apunta a un capítulo del temario o a ninguno, y tiene texto en los dos idiomas', async () => {
  for (const h of HITOS) if (h.capitulo) assert.ok(capituloDe(h.capitulo), h.id);
  for (const idioma of IDIOMAS) {
    const c = await cargarContenido('historia', idioma);
    assert.deepEqual(Object.keys(c.hitos), HITOS.map((h) => h.id), idioma);
  }
});

test('idiomas: los mismos archivos y las mismas claves en todo contenido/', async () => {
  const archivos = (idioma) => readdirSync(fileURLToPath(new URL(`contenido/${idioma}/`, raiz))).filter((f) => f.endsWith('.js')).sort();
  const lista = archivos('es');
  assert.ok(lista.length > 0);
  for (const idioma of IDIOMAS) assert.deepEqual(archivos(idioma), lista, idioma);
  for (const archivo of lista) {
    const id = archivo.replace(/\.js$/, '');
    const [es, en] = await Promise.all(['es', 'en'].map((i) => cargarContenido(id, i)));
    const sinIdioma = ({ idioma, ...resto }) => resto;
    assert.deepEqual(claves(sinIdioma(en)), claves(sinIdioma(es)), archivo);
  }
});
