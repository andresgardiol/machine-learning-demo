// Estado del programa en edición de la pestaña Reglas a mano (design.md D6 y D7), sin DOM: el texto
// a la vista, el último programa válido (el que maneja), los errores del texto y si el texto es propio
// de la persona o uno de los programas conocidos.
import { parseProgram } from '../../core/rules.js';

/** Firma de lo que hace un programa: sus sentencias sin los números de línea. */
function behaviorOf(program) {
  if (!program) return null;
  return JSON.stringify(program.statements.map((s) => (s.kind === 'action'
    ? { control: s.control }
    : { condition: s.condition, actions: s.actions.map((a) => a.control) })));
}

/** Texto normalizado para comparar: saltos de línea de Unix y sin espacios ni líneas vacías al final. */
const normalize = (text) => String(text ?? '').replace(/\r\n?/g, '\n').trimEnd();

/**
 * @param {{text?: string, sensors: number}} spec
 */
export function createProgramState({ text = '', sensors }) {
  let current = String(text ?? '');
  let count = sensors;
  let result = parseProgram(current, { sensors: count });
  let valid = result.ok ? result.program : null;

  /**
   * Analiza `next`. Si es válido pasa a ser el programa que maneja; si no, el anterior sigue.
   * @returns {{ok:boolean, validChanged:boolean, behaviorChanged:boolean}}
   *   validChanged: cambió el programa que maneja (también si solo se corrieron sus líneas);
   *   behaviorChanged: cambió lo que hace.
   */
  function update(next) {
    current = String(next ?? '');
    result = parseProgram(current, { sensors: count });
    if (!result.ok) return { ok: false, validChanged: false, behaviorChanged: false };
    return replaceValid(result.program);
  }

  function replaceValid(program) {
    const before = valid;
    valid = program;
    const validChanged = JSON.stringify(before) !== JSON.stringify(valid);
    const behaviorChanged = behaviorOf(before) !== behaviorOf(valid);
    return { ok: Boolean(valid), validChanged, behaviorChanged };
  }

  /**
   * Cambia la cantidad de sensores del auto y vuelve a analizar el texto. Si deja de ser válido, el
   * programa anterior ya no corresponde a este auto: no queda ninguno que maneje.
   */
  function setSensors(n) {
    count = n;
    result = parseProgram(current, { sensors: count });
    return replaceValid(result.ok ? result.program : null);
  }

  return {
    update,
    setSensors,
    get text() { return current; },
    get sensors() { return count; },
    /** Último programa válido (el que maneja), o null. */
    get valid() { return valid; },
    /** Errores del texto a la vista ([] si es válido). */
    get errors() { return result.ok ? [] : result.errors; },
    /** Reglas del programa que maneja. */
    get rules() { return valid ? valid.rules : 0; },
    /** Constantes del programa válido, para la paleta. */
    get constants() { return valid ? valid.constants : []; },
    /** ¿El texto a la vista es el programa que maneja? */
    get showsRunning() { return result.ok; },
    /** ¿El texto no coincide con ninguno de los textos conocidos (programa inicial y ejemplos)? */
    isOwn(known) {
      const mine = normalize(current);
      return !known.some((k) => normalize(k) === mine);
    },
  };
}
