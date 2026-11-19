// Ayudante de DOM propio de la V2 (la V2 no importa la pantalla de la V1, design.md D5).
//   el('button', { class: 'x', i18n: 'clave', help: 'ayuda', attrs: {...}, on: { click } }, ...hijos)
// `i18n` declara el texto (lo completa i18n.translateTree); `help` declara el tooltip (help.<clave>.what/why).

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  const { class: className, i18n, i18nAttr, params, help, helpTitle, attrs, dataset, on, text } = props;
  if (className) node.className = className;
  if (i18n) node.setAttribute('data-i18n', i18n);
  if (i18nAttr) node.setAttribute('data-i18n-attr', i18nAttr);
  if (params) node.setAttribute('data-i18n-params', JSON.stringify(params));
  if (help) node.setAttribute('data-help', help);
  if (helpTitle) node.setAttribute('data-help-title', helpTitle);
  if (text !== undefined) node.textContent = text;
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === false || v === null || v === undefined) continue;
    node.setAttribute(k, v === true ? '' : String(v));
  }
  Object.assign(node.dataset, dataset ?? {});
  for (const [type, fn] of Object.entries(on ?? {})) node.addEventListener(type, fn);
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child);
  }
  return node;
}

/** Escribe un atributo solo si cambió (lo que se actualiza en cada cuadro no invalida estilos de más). */
export function setAttr(node, name, value) {
  const v = String(value);
  if (node.getAttribute(name) !== v) node.setAttribute(name, v);
}
