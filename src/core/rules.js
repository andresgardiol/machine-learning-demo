// Lenguaje de reglas (design.md D1 a D3): el texto con el que una persona programa el auto a mano.
//
//   parseProgram(text, { sensors }) -> { ok: true, program, rules, constants, lines }
//                                    | { ok: false, errors: [{ line, code, details }] }
//   runProgram(program, perception)  -> { controls, activeLines }
//   classifyLine(text)               -> [{ start, end, kind }]
//   createRulesController({ program }) cumple el contrato de controlador (controller.js).
//
// Un programa es una lista de líneas: órdenes sueltas (`avanzar`), reglas
// (`si <condición> entonces <acciones>`, con acciones en la misma línea o debajo, con sangría),
// constantes (`cerca = 0,2`), comentarios (`# …`) y líneas vacías. Sin variables, memoria ni
// bucles: ejecutar un instante recorre cada sentencia una vez y termina. El texto nunca se evalúa
// como JavaScript; se analiza con un analizador léxico propio, el mismo que colorea el editor.
import { NO_CONTROLS } from './car.js';

export const RULES_LIMITS = Object.freeze({ lines: 200 });

/** Palabras del lenguaje por papel, en el orden de la tabla de design.md D2 (español y después inglés). */
export const VOCABULARY = Object.freeze({
  if: Object.freeze({ es: 'si', en: 'if' }),
  then: Object.freeze({ es: 'entonces', en: 'then' }),
  and: Object.freeze({ es: 'y', en: 'and' }),
  or: Object.freeze({ es: 'o', en: 'or' }),
  not: Object.freeze({ es: 'no', en: 'not' }),
  forward: Object.freeze({ es: 'avanzar', en: 'forward' }),
  reverse: Object.freeze({ es: 'retroceder', en: 'reverse' }),
  turn: Object.freeze({ es: 'girar', en: 'turn' }),
  left: Object.freeze({ es: 'izquierda', en: 'left' }),
  right: Object.freeze({ es: 'derecha', en: 'right' }),
  speed: Object.freeze({ es: 'velocidad', en: 'speed' }),
  sensor: Object.freeze({ es: 'sensor', en: 'sensor' }),
});

/** Papel de cada palabra (en minúsculas) del vocabulario. */
const ROLE_OF = new Map();
/** Palabras del vocabulario en el orden de la tabla, para buscar sugerencias. */
const TABLE_WORDS = [];
for (const [role, words] of Object.entries(VOCABULARY)) {
  for (const w of [words.es, words.en]) {
    if (!ROLE_OF.has(w)) ROLE_OF.set(w, role);
    if (!TABLE_WORDS.includes(w)) TABLE_WORDS.push(w);
  }
}

const KEYWORD_ROLES = new Set(['if', 'then', 'and', 'or', 'not']);
const ACTION_ROLES = new Set(['forward', 'reverse', 'turn', 'left', 'right']);
const COMPARISONS = new Set(['>', '<', '>=', '<=']);

// --- Analizador léxico ------------------------------------------------------------------------

const WORD_START = /[\p{L}_]/u;
const WORD_CHAR = /[\p{L}\p{N}_]/u;
const DIGIT = /[0-9]/;
const SPACE = /[ \t]/;
const SENSOR_WORD = /^sensor(\d+)$/;

/**
 * Tokens de una línea. Cada token: { type, start, end, text, ... }
 *   word      { lower, role }       palabra (role: papel del vocabulario o null)
 *   sensor    { index }             `sensor3` o `sensor 3`
 *   number    { value }             `0,5`, `0.5`, `-1`
 *   badNumber                       número mal escrito (`0,5,3`, `2cm`, `0.`)
 *   op        { op }                > < >= <= = ( ) ,
 *   other                           cualquier otro carácter
 *   comment                         desde `#` hasta el final
 */
export function tokenize(line) {
  const tokens = [];
  let i = 0;
  const n = line.length;
  while (i < n) {
    const c = line[i];
    if (SPACE.test(c)) { i += 1; continue; }
    const start = i;
    if (c === '#') {
      tokens.push({ type: 'comment', start, end: n, text: line.slice(start) });
      break;
    }
    if (WORD_START.test(c)) {
      while (i < n && WORD_CHAR.test(line[i])) i += 1;
      const text = line.slice(start, i);
      const lower = text.toLowerCase();
      const m = SENSOR_WORD.exec(lower);
      if (m) {
        tokens.push({ type: 'sensor', start, end: i, text, index: Number.parseInt(m[1], 10) });
        continue;
      }
      if (lower === 'sensor') {
        // `sensor 3`: la palabra, espacios y dígitos que no siguen con letras.
        let j = i;
        while (j < n && SPACE.test(line[j])) j += 1;
        let k = j;
        while (k < n && DIGIT.test(line[k])) k += 1;
        if (k > j && (k >= n || !WORD_CHAR.test(line[k]))) {
          tokens.push({ type: 'sensor', start, end: k, text: line.slice(start, k), index: Number.parseInt(line.slice(j, k), 10) });
          i = k;
          continue;
        }
      }
      tokens.push({ type: 'word', start, end: i, text, lower, role: ROLE_OF.get(lower) ?? null });
      continue;
    }
    const startsNumber = DIGIT.test(c)
      || ((c === '-' || c === '.') && i + 1 < n && DIGIT.test(line[i + 1]));
    if (startsNumber) {
      const m = /^-?\d+(?:[.,]\d+)?/.exec(line.slice(i));
      let end = i + (m ? m[0].length : 0);
      const next = line[end];
      const extends_ = next !== undefined && (WORD_CHAR.test(next) || next === '.' || (next === ',' && DIGIT.test(line[end + 1] ?? '')));
      if (m && !extends_) {
        tokens.push({ type: 'number', start, end, text: m[0], value: Number(m[0].replace(',', '.')) });
        i = end;
        continue;
      }
      if (!m) end = i + 1;
      while (end < n && (WORD_CHAR.test(line[end]) || line[end] === '.' || (line[end] === ',' && DIGIT.test(line[end + 1] ?? '')))) end += 1;
      tokens.push({ type: 'badNumber', start, end, text: line.slice(start, end) });
      i = end;
      continue;
    }
    if ((c === '>' || c === '<') && line[i + 1] === '=') {
      tokens.push({ type: 'op', start, end: i + 2, text: line.slice(i, i + 2), op: line.slice(i, i + 2) });
      i += 2;
      continue;
    }
    if ('><=(),'.includes(c)) {
      tokens.push({ type: 'op', start, end: i + 1, text: c, op: c });
      i += 1;
      continue;
    }
    i += 1;
    tokens.push({ type: 'other', start, end: i, text: c });
  }
  return tokens;
}

/** Tipo de palabra de un token, para el editor (design.md D1 y D4). */
function kindOf(token) {
  switch (token.type) {
    case 'comment': return 'comment';
    case 'sensor': return 'data';
    case 'number': case 'badNumber': return 'number';
    case 'op': return 'operator';
    case 'word':
      if (token.role === null) return 'name';
      if (KEYWORD_ROLES.has(token.role)) return 'keyword';
      if (ACTION_ROLES.has(token.role)) return 'action';
      return 'data';
    default: return 'name';
  }
}

/** Tramos de una línea con su tipo: keyword | action | data | name | number | operator | comment. */
export function classifyLine(text) {
  return tokenize(String(text ?? '')).map((t) => ({ start: t.start, end: t.end, kind: kindOf(t) }));
}

// --- Sugerencias ---------------------------------------------------------------------------------

/** Distancia de edición (Levenshtein) entre dos palabras. */
export function editDistance(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const up = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = up;
    }
  }
  return prev[b.length];
}

/**
 * Palabra parecida a `word` (distancia 1 o 2), buscada entre las constantes definidas y el
 * vocabulario; la de menor distancia y, a igual distancia, primero las constantes y después la
 * tabla de D2 en su orden. null si no hay ninguna.
 */
function suggest(word, constantNames) {
  const lower = word.toLowerCase();
  let best = null;
  let bestDistance = 3;
  for (const candidate of [...constantNames, ...TABLE_WORDS]) {
    const d = editDistance(lower, candidate.toLowerCase());
    if (d >= 1 && d < bestDistance) {
      best = candidate;
      bestDistance = d;
    }
  }
  return best;
}

// --- Análisis --------------------------------------------------------------------------------------

/** Error de análisis que corta la línea. */
class LineError {
  constructor(code, details = {}) { this.code = code; this.details = details; }
}

const isReservedToken = (t) => t.type === 'sensor' || (t.type === 'word' && t.role !== null);

/** Cantidad de líneas de un texto; un salto de línea final no abre una línea más. */
export function countLines(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines.length;
}

/**
 * Analiza un programa.
 * @param {string} text
 * @param {{sensors?: number}} [options] cantidad de sensores del auto (sin ella no se comprueba)
 */
export function parseProgram(text, { sensors = Infinity } = {}) {
  const all = String(text ?? '').split(/\r?\n/);
  const total = countLines(text);
  const lines = all.slice(0, Math.min(total, RULES_LIMITS.lines));
  const errors = [];
  const statements = [];
  const constants = [];
  const constantByKey = new Map(); // nombre en minúsculas -> constante
  let rules = 0;

  // Definiciones de constantes de todo el texto, para explicar un uso anterior a su definición.
  const definitionLine = new Map();
  lines.forEach((raw, index) => {
    const tokens = tokenize(raw).filter((t) => t.type !== 'comment');
    if (tokens.length >= 2 && tokens[1].type === 'op' && tokens[1].op === '=' && tokens[0].type === 'word' && tokens[0].role === null) {
      const key = tokens[0].lower;
      if (!definitionLine.has(key)) definitionLine.set(key, index + 1);
    }
  });

  let block = null; // regla abierta: { rule | null, line, indentedLines }
  function closeBlock() {
    if (block && block.rule && !block.indentedLines && block.rule.actions.length === 0) errors.push({ line: block.line, code: 'noAction', details: {} });
    block = null;
  }

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const lineNo = index + 1;
    const tokens = tokenize(raw).filter((t) => t.type !== 'comment');
    if (tokens.length === 0) continue; // vacía o comentario: no corta la regla abierta
    const indented = SPACE.test(raw[0]);
    try {
      if (tokens.length >= 2 && tokens[1].type === 'op' && tokens[1].op === '=') {
        if (!indented) closeBlock();
        defineConstant(tokens, lineNo, indented);
        continue;
      }
      if (indented) {
        if (!block) throw new LineError('indentWithoutRule');
        block.indentedLines = true; // una línea con sangría, aunque tenga un error, no deja a la regla sin acción
        checkWords(tokens, lineNo);
        const actions = parseActions(tokens, 0, lineNo);
        if (block.rule) block.rule.actions.push(...actions);
        continue;
      }
      closeBlock();
      if (tokens[0].type === 'word' && tokens[0].role === 'if') {
        block = { rule: null, line: lineNo };
        checkWords(tokens, lineNo);
        const rule = parseRule(tokens, lineNo);
        block.rule = rule;
        statements.push(rule);
        rules += 1;
        continue;
      }
      checkWords(tokens, lineNo);
      for (const a of parseActions(tokens, 0, lineNo)) statements.push({ kind: 'action', line: a.line, control: a.control });
    } catch (err) {
      if (!(err instanceof LineError)) throw err;
      errors.push({ line: lineNo, code: err.code, details: err.details });
    }
  }
  closeBlock();
  if (total > RULES_LIMITS.lines) errors.push({ line: RULES_LIMITS.lines + 1, code: 'tooLong', details: { max: RULES_LIMITS.lines } });

  if (errors.length > 0) {
    errors.sort((a, b) => a.line - b.line);
    // A lo sumo un error por línea (la de una regla puede sumar "sin acciones" solo si no tenía otro).
    const seen = new Set();
    return { ok: false, errors: errors.filter((e) => (seen.has(e.line) ? false : (seen.add(e.line), true))) };
  }
  const program = { lines: total, rules, constants: constants.map((c) => ({ ...c })), statements };
  return { ok: true, program, rules, constants: program.constants, lines: total };

  // --- Piezas del análisis (cierran sobre el estado de este análisis) ---------------------------

  function defineConstant(tokens, lineNo, indented) {
    const nameToken = tokens[0];
    const name = nameToken.text;
    if (isReservedToken(nameToken)) throw new LineError('reservedName', { name });
    if (nameToken.type !== 'word') throw new LineError('unexpectedWord', { word: tokens[1].text });
    if (indented) throw new LineError('indentedConstant', { name });
    const rest = tokens.slice(2);
    if (rest.length === 1 && rest[0].type === 'badNumber') throw new LineError('badNumber', { text: rest[0].text });
    if (rest.length !== 1 || rest[0].type !== 'number') throw new LineError('badConstant', { name });
    const key = nameToken.lower;
    const previous = constantByKey.get(key);
    if (previous) throw new LineError('duplicateConstant', { name, firstLine: previous.line });
    const constant = { name, value: rest[0].value, line: lineNo };
    constants.push(constant);
    constantByKey.set(key, constant);
  }

  /** Primer problema de palabras de la línea: palabra desconocida, número mal escrito o sensor que no existe. */
  function checkWords(tokens, lineNo) {
    for (const t of tokens) {
      if (t.type === 'badNumber') throw new LineError('badNumber', { text: t.text });
      if (t.type === 'other') throw new LineError('unknownWord', { word: t.text, suggestion: null });
      if (t.type === 'sensor' && (t.index < 1 || t.index > sensors)) {
        throw new LineError('unknownSensor', { sensor: t.index, count: sensors });
      }
      if (t.type === 'word' && t.role === null && !constantByKey.has(t.lower)) {
        const later = definitionLine.get(t.lower);
        if (later !== undefined && later > lineNo) throw new LineError('usedBeforeDefinition', { name: t.text, definedLine: later });
        throw new LineError('unknownWord', { word: t.text, suggestion: suggest(t.text, constants.map((c) => c.name)) });
      }
    }
  }

  /** Lista de acciones desde `from` hasta el final de la línea. */
  function parseActions(tokens, from, lineNo) {
    const actions = [];
    let i = from;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t.type !== 'word' || !ACTION_ROLES.has(t.role)) throw new LineError('unexpectedWord', { word: t.text });
      let control = t.role;
      i += 1;
      if (control === 'turn') {
        const dir = tokens[i];
        if (!dir || dir.type !== 'word' || (dir.role !== 'left' && dir.role !== 'right')) {
          throw new LineError('unexpectedWord', { word: dir ? dir.text : t.text });
        }
        control = dir.role;
        i += 1;
      }
      actions.push({ line: lineNo, control });
      if (i >= tokens.length) break;
      const sep = tokens[i];
      const isSeparator = (sep.type === 'op' && sep.op === ',') || (sep.type === 'word' && sep.role === 'and');
      if (!isSeparator) throw new LineError('unexpectedWord', { word: sep.text });
      i += 1;
      if (i >= tokens.length) throw new LineError('unexpectedWord', { word: sep.text });
    }
    return actions;
  }

  function parseRule(tokens, lineNo) {
    const thenIndex = tokens.findIndex((t) => t.type === 'word' && t.role === 'then');
    const hasThen = thenIndex >= 0;
    if (tokens.length === 1 || thenIndex === 1) throw new LineError('missingCondition');
    const end = hasThen ? thenIndex : tokens.length;
    const cursor = { i: 1 };
    const condition = parseCondition(tokens, cursor, end, hasThen);
    if (cursor.i < end) {
      const t = tokens[cursor.i];
      if (t.type === 'op' && t.op === ')') throw new LineError('unclosedParenthesis');
      if (!hasThen) throw new LineError('missingThen');
      throw new LineError('unexpectedWord', { word: t.text });
    }
    if (!hasThen) throw new LineError('missingThen');
    const actions = parseActions(tokens, thenIndex + 1, lineNo);
    return { kind: 'rule', line: lineNo, condition, actions };
  }

  function parseCondition(tokens, cursor, end, hasThen) {
    let left = parseTerm(tokens, cursor, end, hasThen);
    while (cursor.i < end && tokens[cursor.i].type === 'word' && tokens[cursor.i].role === 'or') {
      cursor.i += 1;
      left = { op: 'or', left, right: parseTerm(tokens, cursor, end, hasThen) };
    }
    return left;
  }

  function parseTerm(tokens, cursor, end, hasThen) {
    let left = parseFactor(tokens, cursor, end, hasThen);
    while (cursor.i < end && tokens[cursor.i].type === 'word' && tokens[cursor.i].role === 'and') {
      cursor.i += 1;
      left = { op: 'and', left, right: parseFactor(tokens, cursor, end, hasThen) };
    }
    return left;
  }

  function parseFactor(tokens, cursor, end, hasThen) {
    const t = cursor.i < end ? tokens[cursor.i] : null;
    if (t && t.type === 'word' && t.role === 'not') {
      cursor.i += 1;
      return { op: 'not', arg: parseFactor(tokens, cursor, end, hasThen) };
    }
    if (t && t.type === 'op' && t.op === '(') {
      cursor.i += 1;
      const inner = parseCondition(tokens, cursor, end, hasThen);
      const close = cursor.i < end ? tokens[cursor.i] : null;
      if (!close || close.type !== 'op' || close.op !== ')') {
        // Sin ")" antes de "entonces" (o del final): falta cerrar el paréntesis.
        if (!close || hasThen || isConditionToken(close)) throw new LineError('unclosedParenthesis');
        if (!hasThen) throw new LineError('missingThen');
        throw new LineError('unexpectedWord', { word: close.text });
      }
      cursor.i += 1;
      return inner;
    }
    return parseComparison(tokens, cursor, end, hasThen);
  }

  function parseComparison(tokens, cursor, end, hasThen) {
    const left = parseValue(tokens, cursor, end, hasThen);
    const op = cursor.i < end ? tokens[cursor.i] : null;
    if (!op || op.type !== 'op' || !COMPARISONS.has(op.op)) {
      if (op && !isConditionToken(op) && !hasThen) throw new LineError('missingThen');
      if (op && op.type === 'op' && op.op === '=') throw new LineError('unexpectedWord', { word: op.text });
      throw new LineError('incompleteComparison');
    }
    cursor.i += 1;
    const right = parseValue(tokens, cursor, end, hasThen);
    return { op: op.op, left, right };
  }

  function parseValue(tokens, cursor, end) {
    const t = cursor.i < end ? tokens[cursor.i] : null;
    if (!t) throw new LineError('incompleteComparison');
    if (t.type === 'number') { cursor.i += 1; return { number: t.value }; }
    if (t.type === 'sensor') { cursor.i += 1; return { sensor: t.index }; }
    if (t.type === 'word' && t.role === 'speed') { cursor.i += 1; return { speed: true }; }
    if (t.type === 'word' && t.role === null) {
      cursor.i += 1;
      return { number: constantByKey.get(t.lower).value };
    }
    if (t.type === 'op' && (COMPARISONS.has(t.op) || t.op === ')')) throw new LineError('incompleteComparison');
    if (t.type === 'word' && (KEYWORD_ROLES.has(t.role))) throw new LineError('incompleteComparison');
    throw new LineError('unexpectedWord', { word: t.text });
  }
}

/** ¿El token puede formar parte de una condición? (para distinguir "falta entonces" de otros errores) */
function isConditionToken(t) {
  if (t.type === 'number' || t.type === 'sensor') return true;
  if (t.type === 'op') return t.op !== ',' && t.op !== '=';
  if (t.type === 'word') return t.role === null || t.role === 'speed' || t.role === 'and' || t.role === 'or' || t.role === 'not';
  return false;
}

// --- Ejecución ---------------------------------------------------------------------------------------

function valueOf(node, perception) {
  if ('number' in node) return node.number;
  if ('sensor' in node) return perception.sensors[node.sensor - 1] ?? 0;
  return perception.speed ?? 0;
}

function holds(node, perception) {
  switch (node.op) {
    case 'or': return holds(node.left, perception) || holds(node.right, perception);
    case 'and': return holds(node.left, perception) && holds(node.right, perception);
    case 'not': return !holds(node.arg, perception);
    case '>': return valueOf(node.left, perception) > valueOf(node.right, perception);
    case '<': return valueOf(node.left, perception) < valueOf(node.right, perception);
    case '>=': return valueOf(node.left, perception) >= valueOf(node.right, perception);
    case '<=': return valueOf(node.left, perception) <= valueOf(node.right, perception);
    default: return false;
  }
}

/**
 * Ejecuta un instante: recorre las sentencias una vez, de arriba hacia abajo, y acciona cada control
 * nombrado por una orden suelta o por una regla que se cumple. No guarda nada entre instantes.
 * @returns {{controls:{forward:boolean, reverse:boolean, left:boolean, right:boolean}, activeLines:number[]}}
 */
export function runProgram(program, perception) {
  const controls = { forward: false, reverse: false, left: false, right: false };
  const active = new Set();
  for (const s of program.statements) {
    if (s.kind === 'action') {
      controls[s.control] = true;
      active.add(s.line);
    } else if (holds(s.condition, perception)) {
      active.add(s.line);
      for (const a of s.actions) {
        controls[a.control] = true;
        active.add(a.line);
      }
    }
  }
  return { controls, activeLines: [...active].sort((a, b) => a - b) };
}

/**
 * Controlador de reglas: maneja un auto con un programa válido (de parseProgram). Sin programa no
 * acciona nada. `controls` y `activeLines` guardan lo del último paso, que es lo que se dibuja.
 */
export function createRulesController({ program = null } = {}) {
  let current = program;
  let controls = { ...NO_CONTROLS };
  let activeLines = [];
  return {
    control(perception) {
      if (!current) {
        controls = { ...NO_CONTROLS };
        activeLines = [];
        return { ...controls };
      }
      const result = runProgram(current, perception);
      controls = result.controls;
      activeLines = result.activeLines;
      return { ...controls };
    },
    /** Reemplaza el programa en marcha (o lo quita con null); rige desde el paso siguiente. */
    setProgram(next) {
      current = next ?? null;
      if (!current) {
        controls = { ...NO_CONTROLS };
        activeLines = [];
      }
    },
    get controls() { return { ...controls }; },
    get activeLines() { return activeLines; },
    get program() { return current; },
  };
}
