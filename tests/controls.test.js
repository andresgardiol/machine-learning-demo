import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createConfirmation } from '../src/ui/controls.js';

function setup() {
  const seen = [];
  const calls = { confirm: 0, cancel: 0 };
  const c = createConfirmation({ onChange: (req) => seen.push(req ? req.message : null) });
  const request = (message = 'train.confirm.restart') => ({
    message, params: { value: 30 },
    onConfirm: () => { calls.confirm += 1; },
    onCancel: () => { calls.cancel += 1; },
  });
  return { c, seen, calls, request };
}

test('confirmación: al abrir queda pendiente con su mensaje y los textos por defecto', () => {
  const { c, seen, request } = setup();
  assert.equal(c.isOpen, false);
  c.open(request());
  assert.equal(c.isOpen, true);
  assert.equal(c.current.message, 'train.confirm.restart');
  assert.deepEqual(c.current.params, { value: 30 });
  assert.equal(c.current.confirmKey, 'confirm.ok');
  assert.equal(c.current.cancelKey, 'confirm.cancel');
  assert.deepEqual(seen, ['train.confirm.restart']);
});

test('confirmación: confirmar cierra y llama una sola vez a la respuesta afirmativa', () => {
  const { c, seen, calls, request } = setup();
  c.open(request());
  assert.equal(c.confirm(), true);
  assert.equal(c.isOpen, false);
  assert.equal(c.confirm(), false); // ya cerrada: no hace nada
  assert.deepEqual(calls, { confirm: 1, cancel: 0 });
  assert.deepEqual(seen, ['train.confirm.restart', null]);
});

test('confirmación: cancelar cierra y llama una sola vez a la respuesta negativa', () => {
  const { c, calls, request } = setup();
  c.open(request());
  assert.equal(c.cancel(), true);
  assert.equal(c.cancel(), false);
  assert.equal(c.isOpen, false);
  assert.deepEqual(calls, { confirm: 0, cancel: 1 });
});

test('confirmación: abrir otra con una pendiente cancela la anterior', () => {
  const { c, calls, request } = setup();
  c.open(request('a'));
  c.open(request('b'));
  assert.deepEqual(calls, { confirm: 0, cancel: 1 });
  assert.equal(c.current.message, 'b');
  c.confirm();
  assert.deepEqual(calls, { confirm: 1, cancel: 1 });
});

test('confirmación: se pueden pedir otros textos para los botones', () => {
  const { c } = setup();
  c.open({ message: 'm', confirmKey: 'x.ok', cancelKey: 'x.no' });
  assert.equal(c.current.confirmKey, 'x.ok');
  assert.equal(c.current.cancelKey, 'x.no');
});

test('confirmación: sus textos y tooltips existen en español y en inglés', () => {
  for (const key of ['confirm.ok', 'confirm.cancel', 'help.confirm.ok.what', 'help.confirm.ok.why', 'help.confirm.cancel.what', 'help.confirm.cancel.why']) {
    assert.equal(typeof es[key], 'string', `es:${key}`);
    assert.equal(typeof en[key], 'string', `en:${key}`);
  }
  assert.equal(es['confirm.cancel'], 'Cancelar');
  assert.equal(en['confirm.cancel'], 'Cancel');
});
