// Rótulos de rol (sistema-de-diseno-base 5.1 y 5.2): texto y ayuda en los dos idiomas, y la clase `guide`.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

test('los rótulos dicen lo de la spec en español y en inglés', () => {
  assert.equal(es['role.in'], 'Entra · lo que percibe');
  assert.equal(es['role.decide.program'], 'Decide · el programa');
  assert.equal(es['role.decide.network'], 'Decide · la red');
  assert.equal(es['role.out'], 'Sale · lo que acciona');
  assert.equal(en['role.in'], 'In · what it senses');
  assert.equal(en['role.decide.program'], 'Decides · the program');
  assert.equal(en['role.decide.network'], 'Decides · the network');
  assert.equal(en['role.out'], 'Out · what it does');
});

test('cada rol tiene su ayuda "qué es / por qué importa" en los dos idiomas', () => {
  for (const role of ['in', 'decide', 'out']) {
    for (const part of ['what', 'why']) {
      for (const dict of [es, en]) assert.ok(dict[`help.role.${role}.${part}`]?.trim(), `help.role.${role}.${part}`);
    }
  }
});
