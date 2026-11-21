// El bloque "Para profundizar" con que puede cerrar un capítulo (seccion-teoria, spec "Para profundizar"):
// plegado al llegar, con la fórmula del concepto, su nombre, cada símbolo dicho en palabras y una frase.
// Es un <details> nativo: se abre y se cierra con el mouse, con Enter y con la barra espaciadora. El
// capítulo se entiende entero sin abrirlo. Recibe lo que trae el contenido del idioma:
//
//   profundizar: { titulo, intro, formulas: [{ nombre, formula }], simbolos: [{ simbolo, que }], frases: [..] }
//
// `formulas` y `simbolos` pueden ir vacíos: el bloque lleva entonces solo las frases.
import { h, parrafos } from './dom.js';

/** @returns {HTMLElement | null} */
export function crearProfundizar(p) {
  // Un capítulo sin fórmula (el 0) lleva solo las frases.
  if (!p || (!p.formulas?.length && !p.frases?.length)) return null;
  return h('details', { class: 'profundizar' },
    h('summary', { class: 'profundizar-titulo' }, h('span', { text: p.titulo })),
    h('div', { class: 'profundizar-cuerpo' },
      p.intro ? h('p', { text: p.intro }) : null,
      (p.formulas ?? []).map((f) => h('figure', { class: 'formula' },
        h('figcaption', { class: 'formula-nombre', text: f.nombre }),
        h('p', { class: 'formula-texto', text: f.formula }))),
      p.simbolos?.length ? h('dl', { class: 'formula-simbolos' }, p.simbolos.map((x) => h('div', null,
        h('dt', { text: x.simbolo }), h('dd', { text: x.que })))) : null,
      parrafos(p.frases ?? [])));
}
