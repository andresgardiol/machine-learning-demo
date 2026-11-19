import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isSmallTarget, hasLetters, overflows, tooManyPrimary, isHelpMark, MIN_TARGET } from '../../src/v2/audit.js';
import es from '../../src/v2/i18n/es.js';
import en from '../../src/v2/i18n/en.js';

test('v2/auditoría: objetivos de menos de 24×24 px; los deslizadores cuentan por el ancho', () => {
  assert.equal(MIN_TARGET, 24);
  assert.equal(isSmallTarget({ width: 23.9, height: 30 }), true);
  assert.equal(isSmallTarget({ width: 30, height: 20 }), true);
  assert.equal(isSmallTarget({ width: 24, height: 24 }), false);
  assert.equal(isSmallTarget({ width: 200, height: 16 }, { range: true }), false);
});

test('v2/auditoría: textos con letras', () => {
  assert.equal(hasLetters('Pausar'), true);
  assert.equal(hasLetters('142'), false);
  assert.equal(hasLetters('50 %'), false);
  assert.equal(hasLetters('−0,21'), false);
});

test('v2/auditoría: zonas que desbordan', () => {
  assert.equal(overflows({ scrollHeight: 680, clientHeight: 639 }), true);
  assert.equal(overflows({ scrollHeight: 639, clientHeight: 639 }), false);
  assert.equal(overflows({ scrollHeight: 10, clientHeight: 10, scrollWidth: 120, clientWidth: 100 }), true);
});

test('v2/auditoría: más de una acción principal', () => {
  assert.equal(tooManyPrimary(0), false);
  assert.equal(tooManyPrimary(1), false);
  assert.equal(tooManyPrimary(2), true);
});

test('v2/auditoría: una marca de ayuda es un seudoelemento chico puesto encima del control', () => {
  assert.equal(isHelpMark({ content: '""', position: 'absolute', width: '6px', height: '6px' }), true); // el punto que se quitó
  assert.equal(isHelpMark({ content: 'none', position: 'absolute', width: '6px', height: '6px' }), false);
  assert.equal(isHelpMark({ content: 'normal', position: 'static', width: 'auto', height: 'auto' }), false);
  assert.equal(isHelpMark({ content: '" ≠"', position: 'static', width: 'auto', height: 'auto' }), false); // texto, no marca
  assert.equal(isHelpMark({ content: '""', position: 'absolute', width: '26px', height: '2px' }), false); // una línea del dibujo
});

test('v2/aviso de ayudas: sin el punto en la esquina, con el aviso de la primera vez en los dos idiomas', () => {
  const css = readFileSync(new URL('../../styles/v2/app.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /\[data-help\][^{]*::(after|before)/, 'ninguna regla pone una marca sobre los controles con ayuda');
  assert.match(css, /\.v2-setting-name[^{]*\{[^}]*underline dotted/, 'los nombres de los ajustes llevan el subrayado punteado');
  for (const d of [es, en]) {
    for (const k of ['helpNotice.title', 'helpNotice.body', 'helpNotice.close', 'help.helpNotice.close.what', 'help.helpNotice.close.why']) assert.ok(d[k], k);
  }
  assert.notEqual(es['helpNotice.body'], en['helpNotice.body']);
  const shell = readFileSync(new URL('../../src/v2/shell/shell.js', import.meta.url), 'utf8');
  assert.match(shell, /help: 'helpNotice\.close'/, 'el botón de cerrar tiene tooltip');
  assert.match(shell, /prefs\.helpNoticeSeen = true/, 'cerrar el aviso se recuerda');
});
