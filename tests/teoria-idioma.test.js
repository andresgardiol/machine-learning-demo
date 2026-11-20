// Idioma de los prototipos de teoría (teoria-prototipos D7, tarea 2.4).
import test from 'node:test';
import assert from 'node:assert/strict';
import { elegirIdioma, CLAVE_IDIOMA } from '../prototipos/teoria/contenido/idioma.js';
import { createPreferences } from '../src/ui/preferences.js';
import { SHARED_LANGUAGE_KEY } from '../src/v2/preferences.js';

function memoria(inicial = {}) {
  const datos = new Map(Object.entries(inicial));
  return { getItem: (k) => (datos.has(k) ? datos.get(k) : null), setItem: (k, v) => datos.set(k, String(v)) };
}

test('idioma: usa la misma clave que guarda la app (V1 y V2)', () => {
  assert.equal(CLAVE_IDIOMA, SHARED_LANGUAGE_KEY);
  for (const idioma of ['es', 'en']) {
    const almacen = memoria();
    createPreferences(() => almacen).language = idioma;
    assert.equal(elegirIdioma(() => almacen), idioma);
  }
});

test('idioma: español si no hay valor, si no es válido o si el almacenamiento falla', () => {
  assert.equal(elegirIdioma(() => memoria()), 'es');
  assert.equal(elegirIdioma(() => memoria({ [CLAVE_IDIOMA]: 'fr' })), 'es');
  assert.equal(elegirIdioma(() => undefined), 'es');
  assert.equal(elegirIdioma(() => { throw new Error('sin almacenamiento'); }), 'es');
  assert.equal(elegirIdioma(() => ({ getItem() { throw new Error('bloqueado'); } })), 'es');
});
