// Lenguaje de reglas (spec `reglas`, design.md D1 a D3): un caso por escenario, más classifyLine.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VOCABULARY, RULES_LIMITS, parseProgram, runProgram, classifyLine, tokenize,
} from '../src/core/rules.js';

const NONE = { forward: false, reverse: false, left: false, right: false };
const on = (...names) => ({ ...NONE, ...Object.fromEntries(names.map((n) => [n, true])) });
const perception = (sensors = [0, 0, 0, 0, 0], speed = 0) => ({ sensors, speed });

/** Analiza un programa que tiene que ser válido. */
function valid(text, sensors = 5) {
  const r = parseProgram(text, { sensors });
  assert.equal(r.ok, true, `se esperaba válido: ${JSON.stringify(r.errors)}`);
  return r;
}
/** Analiza un texto que tiene que tener errores. */
function invalid(text, sensors = 5) {
  const r = parseProgram(text, { sensors });
  assert.equal(r.ok, false, 'se esperaba un error');
  return r.errors;
}
const run = (text, p, sensors = 5) => runProgram(valid(text, sensors).program, p);
const controlsOf = (text, p, sensors = 5) => run(text, p, sensors).controls;
/** Condición evaluada: una regla que avanza si se cumple. */
const holds = (cond, p) => controlsOf(`si ${cond} entonces avanzar`, p).forward;

// --- Vocabulario y analizador léxico (tarea 1.1) ---------------------------------------------------

test('vocabulario: cada palabra de la tabla se reconoce en español y en inglés, sin distinguir mayúsculas', () => {
  const roles = Object.keys(VOCABULARY);
  assert.deepEqual(roles, ['if', 'then', 'and', 'or', 'not', 'forward', 'reverse', 'turn', 'left', 'right', 'speed', 'sensor']);
  assert.deepEqual(VOCABULARY.if, { es: 'si', en: 'if' });
  assert.deepEqual(VOCABULARY.speed, { es: 'velocidad', en: 'speed' });
  for (const role of roles) {
    for (const word of [VOCABULARY[role].es, VOCABULARY[role].en]) {
      for (const written of [word, word.toUpperCase(), word[0].toUpperCase() + word.slice(1)]) {
        const [t] = tokenize(written);
        assert.equal(t.type, 'word', written);
        assert.equal(t.role, role, written);
      }
    }
  }
});

test('vocabulario: `sensor3` y `sensor 3` son el mismo dato', () => {
  const [a] = tokenize('sensor3');
  const [b] = tokenize('sensor 3');
  assert.equal(a.type, 'sensor');
  assert.equal(b.type, 'sensor');
  assert.equal(a.index, 3);
  assert.equal(b.index, 3);
  assert.equal(tokenize('Sensor12')[0].index, 12);
});

test('vocabulario: `0,5` y `0.5` son el mismo número', () => {
  const [a] = tokenize('0,5');
  const [b] = tokenize('0.5');
  assert.equal(a.type, 'number');
  assert.equal(b.type, 'number');
  assert.equal(a.value, 0.5);
  assert.equal(b.value, 0.5);
  assert.equal(tokenize('-0,25')[0].value, -0.25);
});

test('classifyLine: tipos de `si sensor3 > cerca entonces girar izquierda # esquiva`', () => {
  const line = 'si sensor3 > cerca entonces girar izquierda # esquiva';
  const spans = classifyLine(line);
  assert.deepEqual(spans.map((s) => [line.slice(s.start, s.end), s.kind]), [
    ['si', 'keyword'], ['sensor3', 'data'], ['>', 'operator'], ['cerca', 'name'], ['entonces', 'keyword'],
    ['girar', 'action'], ['izquierda', 'action'], ['# esquiva', 'comment'],
  ]);
});

test('classifyLine: tipos de `cerca = 0,5`', () => {
  const line = 'cerca = 0,5';
  assert.deepEqual(classifyLine(line).map((s) => [line.slice(s.start, s.end), s.kind]), [
    ['cerca', 'name'], ['=', 'operator'], ['0,5', 'number'],
  ]);
});

test('classifyLine: `velocidad` y `sensor 3` son datos; la coma entre acciones es un signo', () => {
  const line = 'si velocidad < sensor 3 entonces retroceder, girar derecha';
  assert.deepEqual(classifyLine(line).map((s) => [line.slice(s.start, s.end), s.kind]), [
    ['si', 'keyword'], ['velocidad', 'data'], ['<', 'operator'], ['sensor 3', 'data'], ['entonces', 'keyword'],
    ['retroceder', 'action'], [',', 'operator'], ['girar', 'action'], ['derecha', 'action'],
  ]);
});

// --- Programa por líneas (tarea 1.2) -------------------------------------------------------------

test('Programa mínimo: `avanzar` es válido, con una orden y ninguna regla', () => {
  const r = valid('avanzar');
  assert.equal(r.rules, 0);
  assert.equal(r.program.statements.length, 1);
  assert.deepEqual(r.program.statements[0], { kind: 'action', line: 1, control: 'forward' });
});

test('Comentarios y líneas vacías: el programa sigue válido y acciona lo mismo', () => {
  const base = 'avanzar\nsi sensor3 > 0,5 entonces\n    girar izquierda';
  const withNoise = '# arriba\n\navanzar\n   \n# medio\nsi sensor3 > 0,5 entonces\n# dentro\n\n    girar izquierda\n# fin';
  for (const p of [perception([0, 0, 0.7, 0, 0]), perception([0, 0, 0.2, 0, 0])]) {
    assert.deepEqual(controlsOf(withNoise, p), controlsOf(base, p));
  }
  assert.deepEqual(controlsOf(withNoise, perception([0, 0, 0.7, 0, 0])), on('forward', 'left'));
});

test('Comentario al final de una línea: `avanzar # siempre para adelante` vale como `avanzar`', () => {
  const r = valid('avanzar # siempre para adelante');
  assert.deepEqual(r.program.statements, [{ kind: 'action', line: 1, control: 'forward' }]);
});

test('Programa vacío: texto vacío o solo comentarios es válido y no acciona nada', () => {
  for (const text of ['', '# nada\n# más', '\n\n']) {
    assert.deepEqual(controlsOf(text, perception([1, 1, 1, 1, 1], 1)), NONE);
  }
});

// --- Órdenes ---------------------------------------------------------------------------------------

test('Orden suelta: `avanzar` acciona avanzar con cualquier percepción, y nada más', () => {
  for (const p of [perception(), perception([1, 0.5, 0.2, 0.9, 1], -1), perception([0.3, 0.3, 0.3, 0.3, 0.3], 0.5)]) {
    assert.deepEqual(controlsOf('avanzar', p), on('forward'));
  }
});

test('Forma corta de girar: `izquierda` vale lo mismo que `girar izquierda`', () => {
  assert.deepEqual(valid('izquierda').program.statements, valid('girar izquierda').program.statements);
  assert.deepEqual(controlsOf('izquierda', perception()), on('left'));
  assert.deepEqual(controlsOf('derecha', perception()), on('right'));
  assert.deepEqual(controlsOf('retroceder', perception()), on('reverse'));
});

// --- Reglas ----------------------------------------------------------------------------------------

test('Regla de una línea: con sensor 3 en 0,7 queda accionado izquierda', () => {
  assert.deepEqual(controlsOf('si sensor3 > 0,5 entonces girar izquierda', perception([0, 0, 0.7, 0, 0])), on('left'));
});

test('Regla que no se cumple: con sensor 3 en 0,2 no se acciona nada', () => {
  assert.deepEqual(controlsOf('si sensor3 > 0,5 entonces girar izquierda', perception([0, 0, 0.2, 0, 0])), NONE);
});

test('Acciones en las líneas siguientes: las dos acciones con sangría pertenecen a la regla', () => {
  const r = valid('si sensor3 > 0,5 entonces\n    girar izquierda\n\tretroceder');
  assert.equal(r.program.statements.length, 1);
  assert.deepEqual(r.program.statements[0].actions, [{ line: 2, control: 'left' }, { line: 3, control: 'reverse' }]);
  assert.deepEqual(runProgram(r.program, perception([0, 0, 0.7, 0, 0])).controls, on('left', 'reverse'));
});

test('Fin de la regla: `avanzar` sin sangría después de las acciones es una orden suelta', () => {
  const text = 'si sensor3 > 0,5 entonces\n    girar izquierda\navanzar';
  const r = valid(text);
  assert.equal(r.program.statements.length, 2);
  assert.deepEqual(r.program.statements[1], { kind: 'action', line: 3, control: 'forward' });
  assert.deepEqual(runProgram(r.program, perception([0, 0, 0.2, 0, 0])).controls, on('forward'));
});

test('Varias acciones en una línea: `retroceder, girar derecha` son dos acciones; también con `y`', () => {
  const r = valid('si sensor3 > 0,8 entonces retroceder, girar derecha');
  assert.equal(r.program.statements[0].actions.length, 2);
  assert.deepEqual(runProgram(r.program, perception([0, 0, 0.9, 0, 0])).controls, on('reverse', 'right'));
  assert.equal(valid('si sensor3 > 0,8 entonces retroceder y girar derecha').program.statements[0].actions.length, 2);
});

test('Una regla puede tener acciones en su propia línea y también debajo', () => {
  const r = valid('si sensor3 > 0,5 entonces avanzar\n    girar derecha');
  assert.deepEqual(r.program.statements[0].actions, [{ line: 1, control: 'forward' }, { line: 2, control: 'right' }]);
});

// --- Condiciones (tarea 1.3) -------------------------------------------------------------------

test('Comparar con un número: `sensor1 <= 0,3` se cumple con 0,3', () => {
  assert.equal(holds('sensor1 <= 0,3', perception([0.3, 0, 0, 0, 0])), true);
  assert.equal(holds('sensor1 >= 0,3', perception([0.3, 0, 0, 0, 0])), true);
  assert.equal(holds('sensor1 < 0,3', perception([0.3, 0, 0, 0, 0])), false);
});

test('Comparar dos sensores: `sensor1 > sensor5` con 0,6 y 0,2 se cumple', () => {
  assert.equal(holds('sensor1 > sensor5', perception([0.6, 0, 0, 0, 0.2])), true);
  assert.equal(holds('sensor1 > sensor5', perception([0.2, 0, 0, 0, 0.6])), false);
});

test('Dos comparaciones con "y": con lectura 0,7 y velocidad 0,2 no se cumple', () => {
  assert.equal(holds('sensor3 > 0,5 y velocidad > 0,5', perception([0, 0, 0.7, 0, 0], 0.2)), false);
  assert.equal(holds('sensor3 > 0,5 y velocidad > 0,5', perception([0, 0, 0.7, 0, 0], 0.6)), true);
});

test('Orden de "y" y "o": `sensor1 > 0,5 o sensor2 > 0,5 y sensor3 > 0,5` con 0,9, 0 y 0 se cumple', () => {
  assert.equal(holds('sensor1 > 0,5 o sensor2 > 0,5 y sensor3 > 0,5', perception([0.9, 0, 0, 0, 0])), true);
});

test('Paréntesis: `(sensor1 > 0,5 o sensor2 > 0,5) y sensor3 > 0,5` con las mismas lecturas no se cumple', () => {
  assert.equal(holds('(sensor1 > 0,5 o sensor2 > 0,5) y sensor3 > 0,5', perception([0.9, 0, 0, 0, 0])), false);
});

test('Negación: `no sensor3 > 0,5` con 0,2 se cumple; `no` se resuelve antes que `y`', () => {
  assert.equal(holds('no sensor3 > 0,5', perception([0, 0, 0.2, 0, 0])), true);
  assert.equal(holds('no sensor3 > 0,5', perception([0, 0, 0.7, 0, 0])), false);
  // no (A) y B: con A falsa y B falsa, no se cumple (sería verdadera si `no` tomara todo).
  assert.equal(holds('no sensor3 > 0,5 y sensor1 > 0,5', perception([0, 0, 0, 0, 0])), false);
});

// --- Datos disponibles ---------------------------------------------------------------------------

test('Orden de los sensores: `sensor3` es la tercera lectura (la del frente con 5 sensores)', () => {
  assert.equal(holds('sensor3 > 0,5', perception([0, 0, 0.8, 0, 0])), true);
  assert.equal(holds('sensor3 > 0,5', perception([0.8, 0.8, 0, 0.8, 0.8])), false);
});

test('Coma y punto: `sensor3 > 0,5` y `sensor3 > 0.5` significan lo mismo', () => {
  for (const v of [0.4, 0.5, 0.51, 0.9]) {
    const p = perception([0, 0, v, 0, 0]);
    assert.equal(holds('sensor3 > 0,5', p), holds('sensor3 > 0.5', p));
  }
  assert.deepEqual(valid('si sensor3 > 0,5 entonces avanzar').program.statements, valid('si sensor3 > 0.5 entonces avanzar').program.statements);
});

test('Espacio antes del número: `sensor 3 > 0,5` vale lo mismo que `sensor3 > 0,5`', () => {
  assert.deepEqual(valid('si sensor 3 > 0,5 entonces avanzar').program.statements, valid('si sensor3 > 0,5 entonces avanzar').program.statements);
});

test('Velocidad: a la mitad de la máxima, `velocidad > 0,4` se cumple', () => {
  assert.equal(holds('velocidad > 0,4', perception([0, 0, 0, 0, 0], 0.5)), true);
  assert.equal(holds('velocidad > 0,4', perception([0, 0, 0, 0, 0], -0.5)), false);
});

// --- Constantes (tarea 1.4) -----------------------------------------------------------------

test('Definir y usar: `cerca = 0,3` y la regla se cumple cuando el sensor 3 supera 0,3', () => {
  const text = 'cerca = 0,3\nsi sensor3 > cerca entonces girar izquierda';
  assert.deepEqual(controlsOf(text, perception([0, 0, 0.31, 0, 0])), on('left'));
  assert.deepEqual(controlsOf(text, perception([0, 0, 0.3, 0, 0])), NONE);
  // la constante se resuelve al analizar: en el árbol queda el número
  assert.deepEqual(valid(text).program.statements[0].condition, { op: '>', left: { sensor: 3 }, right: { number: 0.3 } });
});

test('Una constante en varias reglas: cambiar su definición de 0,3 a 0,5 cambia las tres', () => {
  const program = (v) => `cerca = ${v}\nsi sensor1 > cerca entonces girar izquierda\nsi sensor3 > cerca entonces retroceder\nsi sensor5 > cerca entonces girar derecha`;
  const p = perception([0.4, 0, 0.4, 0, 0.4]);
  assert.deepEqual(controlsOf(program('0,3'), p), on('left', 'reverse', 'right'));
  assert.deepEqual(controlsOf(program('0,5'), p), NONE);
  assert.deepEqual(controlsOf(program('0,5'), perception([0.6, 0, 0.6, 0, 0.6])), on('left', 'reverse', 'right'));
});

test('Comparar una constante con un dato: `cerca < sensor3` vale lo mismo que `sensor3 > cerca`', () => {
  for (const v of [0.1, 0.3, 0.31, 0.8]) {
    const p = perception([0, 0, v, 0, 0]);
    assert.equal(controlsOf('cerca = 0,3\nsi cerca < sensor3 entonces avanzar', p).forward,
      controlsOf('cerca = 0,3\nsi sensor3 > cerca entonces avanzar', p).forward);
  }
});

test('Nombre con guion bajo y dígitos: `muy_cerca2 = 0,8` es válido', () => {
  const r = valid('muy_cerca2 = 0,8');
  assert.deepEqual(r.constants, [{ name: 'muy_cerca2', value: 0.8, line: 1 }]);
});

test('Nombres de constantes: no distinguen mayúsculas y admiten tildes y ñ', () => {
  const r = valid('Cerca = 0,3\nsi sensor3 > cerca entonces avanzar');
  assert.equal(runProgram(r.program, perception([0, 0, 0.5, 0, 0])).controls.forward, true);
  assert.equal(valid('pequeño_ángulo = 0,1\nsi sensor1 > pequeño_ángulo entonces avanzar').constants[0].name, 'pequeño_ángulo');
});

test('Las constantes no son reglas ni órdenes: solo definiciones es válido, sin reglas y sin controles', () => {
  const r = valid('cerca = 0,3\nlejos = 0,1');
  assert.equal(r.rules, 0);
  assert.equal(r.constants.length, 2);
  assert.deepEqual(runProgram(r.program, perception([1, 1, 1, 1, 1], 1)).controls, NONE);
});

test('Constantes contadas aparte: cuatro constantes y cinco reglas', () => {
  const text = [
    'cerca = 0,2', 'costado = 0,5', 'borde = 0,7', 'pegado = 0,8', 'avanzar',
    'si sensor3 > cerca entonces girar izquierda', 'si sensor2 > costado entonces girar derecha',
    'si sensor4 > costado entonces girar izquierda', 'si sensor1 > borde entonces girar derecha',
    'si sensor3 > pegado entonces retroceder',
  ].join('\n');
  const r = valid(text);
  assert.equal(r.rules, 5);
  assert.equal(r.constants.length, 4);
  assert.deepEqual(r.constants.map((c) => c.name), ['cerca', 'costado', 'borde', 'pegado']);
});

// --- Errores explicados (tarea 1.5) -----------------------------------------------------------

test('Palabra desconocida con parecida: `entonses` en la línea 2 sugiere `entonces`', () => {
  const errors = invalid('avanzar\nsi sensor3 > 0,5 entonses girar izquierda');
  assert.deepEqual(errors, [{ line: 2, code: 'unknownWord', details: { word: 'entonses', suggestion: 'entonces' } }]);
});

test('Palabra desconocida con parecida: `abanzar` sugiere `avanzar`', () => {
  assert.deepEqual(invalid('abanzar'), [{ line: 1, code: 'unknownWord', details: { word: 'abanzar', suggestion: 'avanzar' } }]);
});

test('Palabra desconocida sin parecida: `saltar` no sugiere nada', () => {
  assert.deepEqual(invalid('saltar'), [{ line: 1, code: 'unknownWord', details: { word: 'saltar', suggestion: null } }]);
});

test('Falta "entonces": `si sensor3 > 0,5 girar izquierda`', () => {
  assert.deepEqual(invalid('si sensor3 > 0,5 girar izquierda'), [{ line: 1, code: 'missingThen', details: {} }]);
  assert.deepEqual(invalid('si sensor3 > 0,5'), [{ line: 1, code: 'missingThen', details: {} }]);
});

test('Regla sin acciones: `si … entonces` seguida de una línea sin sangría', () => {
  assert.deepEqual(invalid('si sensor3 > 0,5 entonces\navanzar'), [{ line: 1, code: 'noAction', details: {} }]);
  assert.deepEqual(invalid('avanzar\nsi sensor3 > 0,5 entonces'), [{ line: 2, code: 'noAction', details: {} }]);
  // un comentario o una línea vacía no cortan la regla: la acción de abajo le pertenece
  valid('si sensor3 > 0,5 entonces\n# esquiva\n\n    girar izquierda');
});

test('Comparación incompleta: `si sensor3 > entonces avanzar` y sin signo', () => {
  assert.deepEqual(invalid('si sensor3 > entonces avanzar'), [{ line: 1, code: 'incompleteComparison', details: {} }]);
  assert.deepEqual(invalid('si sensor3 entonces avanzar'), [{ line: 1, code: 'incompleteComparison', details: {} }]);
  assert.deepEqual(invalid('si > 0,5 entonces avanzar'), [{ line: 1, code: 'incompleteComparison', details: {} }]);
});

test('Sensor que no existe: con 5 sensores, `sensor7` informa que el auto tiene 5', () => {
  assert.deepEqual(invalid('si sensor7 > 0,5 entonces avanzar', 5), [{ line: 1, code: 'unknownSensor', details: { sensor: 7, count: 5 } }]);
  assert.deepEqual(invalid('si sensor0 > 0,5 entonces avanzar', 5), [{ line: 1, code: 'unknownSensor', details: { sensor: 0, count: 5 } }]);
});

test('Sangría sin regla: la primera línea `    avanzar`', () => {
  assert.deepEqual(invalid('    avanzar'), [{ line: 1, code: 'indentWithoutRule', details: {} }]);
  assert.deepEqual(invalid('avanzar\n\tretroceder'), [{ line: 2, code: 'indentWithoutRule', details: {} }]);
});

test('Paréntesis sin cerrar: `si (sensor1 > 0,5 o sensor2 > 0,5 entonces avanzar`; también si sobra uno', () => {
  assert.deepEqual(invalid('si (sensor1 > 0,5 o sensor2 > 0,5 entonces avanzar'), [{ line: 1, code: 'unclosedParenthesis', details: {} }]);
  assert.deepEqual(invalid('si sensor1 > 0,5) entonces avanzar'), [{ line: 1, code: 'unclosedParenthesis', details: {} }]);
});

test('Varios errores: errores en las líneas 2 y 5 se informan los dos, en orden', () => {
  const text = 'avanzar\nsaltar\nsi sensor3 > 0,5 entonces\n    girar izquierda\nsi sensor3 > 0,5 girar derecha';
  const errors = invalid(text);
  assert.deepEqual(errors.map((e) => [e.line, e.code]), [[2, 'unknownWord'], [5, 'missingThen']]);
});

test('A lo sumo un error por línea: una línea con dos problemas informa solo el primero', () => {
  const errors = invalid('si saltar > sensor9 entonses avanzar');
  assert.equal(errors.length, 1);
  assert.deepEqual(errors[0], { line: 1, code: 'unknownWord', details: { word: 'saltar', suggestion: null } });
});

test('unexpectedWord: `entonces` sin `si`, y una palabra del lenguaje fuera de lugar', () => {
  assert.deepEqual(invalid('entonces avanzar'), [{ line: 1, code: 'unexpectedWord', details: { word: 'entonces' } }]);
  assert.deepEqual(invalid('avanzar velocidad'), [{ line: 1, code: 'unexpectedWord', details: { word: 'velocidad' } }]);
  assert.deepEqual(invalid('si sensor1 > 0,5 entonces\n    si sensor2 > 0,5 entonces avanzar'), [{ line: 2, code: 'unexpectedWord', details: { word: 'si' } }]);
});

test('missingCondition: `si` seguido de `entonces` o de nada', () => {
  assert.deepEqual(invalid('si entonces avanzar'), [{ line: 1, code: 'missingCondition', details: {} }]);
  assert.deepEqual(invalid('si'), [{ line: 1, code: 'missingCondition', details: {} }]);
});

test('badNumber: un número mal escrito', () => {
  assert.deepEqual(invalid('si sensor3 > 0,5,3 entonces avanzar'), [{ line: 1, code: 'badNumber', details: { text: '0,5,3' } }]);
  assert.deepEqual(invalid('si sensor3 > 2cm entonces avanzar'), [{ line: 1, code: 'badNumber', details: { text: '2cm' } }]);
  assert.deepEqual(invalid('cerca = 0.5.1'), [{ line: 1, code: 'badNumber', details: { text: '0.5.1' } }]);
});

// --- Errores de constantes -----------------------------------------------------------------------

test('Constante repetida: `cerca` en las líneas 1 y 4 se informa en la 4 con la primera', () => {
  const errors = invalid('cerca = 0,3\navanzar\n# otra vez\ncerca = 0,5');
  assert.deepEqual(errors, [{ line: 4, code: 'duplicateConstant', details: { name: 'cerca', firstLine: 1 } }]);
  assert.equal(invalid('cerca = 0,3\nCERCA = 0,5')[0].code, 'duplicateConstant');
});

test('Nombre que es una palabra del lenguaje: `velocidad = 0,5` y `sensor3 = 0,5`', () => {
  assert.deepEqual(invalid('velocidad = 0,5'), [{ line: 1, code: 'reservedName', details: { name: 'velocidad' } }]);
  assert.deepEqual(invalid('sensor3 = 0,5'), [{ line: 1, code: 'reservedName', details: { name: 'sensor3' } }]);
  for (const word of ['o', 'y', 'no', 'if', 'left', 'speed', 'sensor']) assert.equal(invalid(`${word} = 1`)[0].code, 'reservedName', word);
});

test('Constante sin número: `cerca = sensor3`', () => {
  assert.deepEqual(invalid('cerca = sensor3'), [{ line: 1, code: 'badConstant', details: { name: 'cerca' } }]);
  assert.deepEqual(invalid('cerca ='), [{ line: 1, code: 'badConstant', details: { name: 'cerca' } }]);
  assert.deepEqual(invalid('cerca = 0,3\nlejos = cerca'), [{ line: 2, code: 'badConstant', details: { name: 'lejos' } }]);
});

test('Constante usada antes de definirla: en la línea 2, definida en la 5', () => {
  const errors = invalid('avanzar\nsi sensor3 > cerca entonces girar izquierda\n\n\ncerca = 0,3');
  assert.deepEqual(errors, [{ line: 2, code: 'usedBeforeDefinition', details: { name: 'cerca', definedLine: 5 } }]);
});

test('Constante mal escrita: `serca` sugiere la constante `cerca`', () => {
  const errors = invalid('cerca = 0,3\nsi sensor3 > serca entonces avanzar');
  assert.deepEqual(errors, [{ line: 2, code: 'unknownWord', details: { word: 'serca', suggestion: 'cerca' } }]);
});

test('Definición con sangría: `    cerca = 0,3`', () => {
  assert.deepEqual(invalid('si sensor3 > 0,5 entonces avanzar\n    cerca = 0,3'), [{ line: 2, code: 'indentedConstant', details: { name: 'cerca' } }]);
});

// --- Tamaño y cantidad de reglas (tarea 1.6) ------------------------------------------------

test('Programa de 200 líneas: es válido', () => {
  const text = Array.from({ length: 200 }, (_, i) => (i === 0 ? 'avanzar' : `si sensor${(i % 5) + 1} > 0,5 entonces girar izquierda`)).join('\n');
  const r = valid(text);
  assert.equal(r.lines, 200);
  assert.equal(r.rules, 199);
  assert.equal(RULES_LIMITS.lines, 200);
});

test('Programa demasiado largo: 201 líneas informa que se admiten hasta 200', () => {
  const text = Array.from({ length: 201 }, () => 'avanzar').join('\n');
  const errors = invalid(text);
  assert.deepEqual(errors, [{ line: 201, code: 'tooLong', details: { max: 200 } }]);
});

test('Órdenes y reglas: `avanzar`, un comentario y dos reglas son 2 reglas', () => {
  assert.equal(valid('avanzar\n# dos reglas\nsi sensor1 > 0,5 entonces girar derecha\nsi sensor5 > 0,5 entonces girar izquierda').rules, 2);
});

test('Sin reglas: `avanzar` tiene 0 reglas', () => {
  assert.equal(valid('avanzar').rules, 0);
});

// --- Ejecución (tarea 1.7) --------------------------------------------------------------------

test('Dos reglas a la vez: quedan accionados izquierda y retroceder', () => {
  const text = 'si sensor3 > 0,5 entonces girar izquierda\nsi sensor3 > 0,7 entonces retroceder';
  assert.deepEqual(controlsOf(text, perception([0, 0, 0.9, 0, 0])), on('left', 'reverse'));
});

test('Órdenes opuestas: `avanzar` y una regla que retrocede accionan los dos (el mundo los anula)', () => {
  const text = 'avanzar\nsi sensor3 > 0,5 entonces retroceder';
  assert.deepEqual(controlsOf(text, perception([0, 0, 0.9, 0, 0])), on('forward', 'reverse'));
});

test('Sin memoria: la misma percepción da los mismos controles, con otras en el medio', () => {
  const r = valid('avanzar\nsi sensor3 > 0,5 entonces girar izquierda\nsi velocidad > 0,5 entonces retroceder');
  const p = perception([0, 0, 0.6, 0, 0], 0.2);
  const first = runProgram(r.program, p);
  runProgram(r.program, perception([1, 1, 1, 1, 1], 1));
  runProgram(r.program, perception([0, 0, 0, 0, 0], -1));
  assert.deepEqual(runProgram(r.program, p), first);
});

test('Siempre termina: un instante recorre cada sentencia una sola vez', () => {
  const text = Array.from({ length: 50 }, (_, i) => `si sensor${(i % 5) + 1} > 0,${i % 9} entonces girar izquierda`).join('\n');
  const r = valid(text);
  let reads = 0;
  const sensors = new Proxy([0.5, 0.5, 0.5, 0.5, 0.5], {
    get(target, prop) { if (/^\d+$/.test(String(prop))) reads += 1; return target[prop]; },
  });
  const result = runProgram(r.program, { sensors, speed: 0 });
  assert.equal(reads, 50); // una comparación por regla
  assert.equal(result.controls.left, true);
});

// --- Vocabulario en español y en inglés --------------------------------------------------------

test('Programa en inglés: `if sensor3 > 0.5 then turn left` hace lo mismo que en español', () => {
  const en = valid('if sensor3 > 0.5 then turn left').program.statements;
  const es = valid('si sensor3 > 0,5 entonces girar izquierda').program.statements;
  assert.deepEqual(en, es);
});

test('Idiomas mezclados: `si sensor3 > 0,5 then girar izquierda` es válido', () => {
  assert.deepEqual(controlsOf('si sensor3 > 0,5 then girar izquierda', perception([0, 0, 0.7, 0, 0])), on('left'));
});

test('Mayúsculas: `SI Sensor3 > 0,5 ENTONCES Girar Izquierda` es válido', () => {
  assert.deepEqual(controlsOf('SI Sensor3 > 0,5 ENTONCES Girar Izquierda', perception([0, 0, 0.7, 0, 0])), on('left'));
});

test('Formas cortas en inglés: `left` vale lo mismo que `turn left`', () => {
  assert.deepEqual(valid('left').program.statements, valid('turn left').program.statements);
  assert.deepEqual(valid('if not speed > 0.5 and sensor1 < 0.2 or sensor2 >= 1 then forward, reverse and right').program.statements[0].actions.map((a) => a.control), ['forward', 'reverse', 'right']);
});

// --- Líneas que se cumplen -------------------------------------------------------------------------

test('Líneas que se cumplen: `avanzar` en la 1 y una regla en la 2 y la 3 que se cumple → 1, 2 y 3', () => {
  const text = 'avanzar\nsi sensor3 > 0,5 entonces\n    girar izquierda';
  assert.deepEqual(run(text, perception([0, 0, 0.7, 0, 0])).activeLines, [1, 2, 3]);
});

test('Líneas que se cumplen: si la regla no se cumple, solo la 1', () => {
  const text = 'avanzar\nsi sensor3 > 0,5 entonces\n    girar izquierda';
  assert.deepEqual(run(text, perception([0, 0, 0.2, 0, 0])).activeLines, [1]);
});

test('Línea de una constante: nunca figura entre las que se cumplen', () => {
  const text = 'cerca = 0,2\navanzar\nsi sensor3 > cerca entonces\n    girar izquierda';
  for (const p of [perception([0, 0, 0.7, 0, 0]), perception([0, 0, 0, 0, 0]), perception([1, 1, 1, 1, 1], 1)]) {
    assert.ok(!run(text, p).activeLines.includes(1));
  }
  assert.deepEqual(run(text, perception([0, 0, 0.7, 0, 0])).activeLines, [2, 3, 4]);
});
