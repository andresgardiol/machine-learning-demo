// Idioma de la teoría (seccion-teoria D6, tarea 2.3): la misma clave y la misma regla de idioma inicial
// que la app.
import test from 'node:test';
import assert from 'node:assert/strict';
import { idiomaInicial, guardarIdioma, IDIOMAS } from '../src/teoria/idioma.js';
import { createPreferences } from '../src/ui/preferences.js';
import { pickInitialLanguage } from '../src/ui/i18n.js';
import { SHARED_LANGUAGE_KEY } from '../src/v2/preferences.js';

function memoria(inicial = {}) {
  const datos = new Map(Object.entries(inicial));
  return { datos, getItem: (k) => (datos.has(k) ? datos.get(k) : null), setItem: (k, v) => datos.set(k, String(v)) };
}

test('idioma: lee y escribe el mismo valor que la app (V1 y V2)', () => {
  for (const idioma of IDIOMAS) {
    const almacen = memoria();
    createPreferences(() => almacen).language = idioma;
    assert.equal(idiomaInicial({ getStorage: () => almacen, idiomasDelNavegador: [] }), idioma);
    const otro = memoria();
    guardarIdioma(idioma, { getStorage: () => otro });
    assert.deepEqual([...otro.datos], [[SHARED_LANGUAGE_KEY, idioma]]);
    assert.equal(createPreferences(() => otro).language, idioma);
  }
});

test('idioma: sin valor guardado válido, la misma regla que la app (el idioma del navegador)', () => {
  const casos = [
    [memoria(), ['es-AR', 'en']],
    [memoria(), ['en-US']],
    [memoria(), []],
    [memoria({ [SHARED_LANGUAGE_KEY]: 'fr' }), ['es']],
    [memoria({ [SHARED_LANGUAGE_KEY]: 'fr' }), ['de']],
  ];
  for (const [almacen, navegador] of casos) {
    assert.equal(
      idiomaInicial({ getStorage: () => almacen, idiomasDelNavegador: navegador }),
      pickInitialLanguage({ stored: null, browserLanguages: navegador }),
      navegador.join(','));
  }
  assert.equal(idiomaInicial({ getStorage: () => memoria(), idiomasDelNavegador: ['es-MX'] }), 'es');
  assert.equal(idiomaInicial({ getStorage: () => memoria(), idiomasDelNavegador: ['pt-BR'] }), 'en');
});

test('idioma: el almacenamiento que falla no rompe nada', () => {
  assert.equal(idiomaInicial({ getStorage: () => undefined, idiomasDelNavegador: ['es'] }), 'es');
  assert.equal(idiomaInicial({ getStorage: () => { throw new Error('sin almacenamiento'); }, idiomasDelNavegador: ['en'] }), 'en');
  assert.doesNotThrow(() => guardarIdioma('en', { getStorage: () => ({ setItem() { throw new Error('lleno'); } }) }));
  assert.throws(() => guardarIdioma('fr', { getStorage: () => memoria() }), RangeError);
});
