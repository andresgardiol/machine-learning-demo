// Tooltips de la V2 (spec *Tooltip en todo control* y *Ayudas con nombre claro*). Todo elemento con
// data-help muestra "Qué hace" y "Por qué importa" al posar el cursor (con 0,7 s de espera, como la V1)
// y al llegar con el teclado. El indicio constante (un punto en la esquina) lo dibuja el CSS en
// [data-help]; con las ayudas apagadas se ocultan el indicio y los tooltips, salvo en el interruptor de ayudas.
// La posición (placeTip) es pura y tiene pruebas.

export const SHOW_DELAY_MS = 700;
export const GAP = 8;

/**
 * Dónde va el tooltip: abajo del control, o arriba si no entra, y siempre dentro de la ventana.
 * @returns {{x:number, y:number, side:'below'|'above'}}
 */
export function placeTip({ anchor, tip, viewport }) {
  const x = Math.min(Math.max(GAP, anchor.left + anchor.width / 2 - tip.width / 2), viewport.width - tip.width - GAP);
  const below = anchor.bottom + GAP;
  if (below + tip.height <= viewport.height - GAP) return { x: Math.max(GAP, x), y: below, side: 'below' };
  const above = anchor.top - GAP - tip.height;
  return { x: Math.max(GAP, x), y: Math.max(GAP, above), side: 'above' };
}

export function installTooltips({ doc = document, i18n, hintsOn = () => true }) {
  const box = doc.createElement('div');
  box.className = 'v2-tip';
  box.id = 'v2-tip';
  box.setAttribute('role', 'tooltip');
  box.hidden = true;
  doc.body.append(box);
  let timer = 0;
  let current = null;

  const allowed = (node) => hintsOn() || node.dataset.help === 'hints';

  function render(node) {
    const key = node.dataset.help;
    box.replaceChildren();
    if (node.dataset.helpTitle) {
      const t = doc.createElement('p');
      t.className = 'v2-tip-title';
      t.textContent = i18n.t(node.dataset.helpTitle);
      box.append(t);
    }
    for (const [part, label] of [['what', 'tip.what'], ['why', 'tip.why']]) {
      const p = doc.createElement('p');
      const b = doc.createElement('b');
      b.textContent = `${i18n.t(label)}. `;
      p.append(b, i18n.t(`help.${key}.${part}`));
      box.append(p);
    }
  }
  function show(node) {
    if (!node.isConnected || !allowed(node)) return;
    current = node;
    render(node);
    box.hidden = false;
    const a = node.getBoundingClientRect();
    const w = Math.min(320, doc.documentElement.clientWidth - 2 * GAP);
    box.style.maxWidth = `${w}px`;
    const r = box.getBoundingClientRect();
    const pos = placeTip({ anchor: a, tip: { width: r.width, height: r.height }, viewport: { width: doc.documentElement.clientWidth, height: doc.documentElement.clientHeight } });
    box.style.left = `${pos.x}px`;
    box.style.top = `${pos.y}px`;
    node.setAttribute('aria-describedby', 'v2-tip');
  }
  function hide() {
    clearTimeout(timer);
    box.hidden = true;
    if (current) current.removeAttribute('aria-describedby');
    current = null;
  }
  const target = (e) => e.target?.closest?.('[data-help]');
  doc.addEventListener('pointerover', (e) => {
    const n = target(e);
    if (!n || n === current) return;
    clearTimeout(timer);
    if (e.buttons) return;
    timer = setTimeout(() => show(n), n.dataset.helpTitle ? 250 : SHOW_DELAY_MS);
  });
  doc.addEventListener('pointerout', (e) => { if (target(e) && !target(e).contains(e.relatedTarget)) hide(); });
  doc.addEventListener('pointerdown', hide);
  doc.addEventListener('focusin', (e) => { const n = target(e); if (n && e.target.matches?.(':focus-visible')) { clearTimeout(timer); show(n); } else hide(); });
  doc.addEventListener('focusout', hide);
  doc.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  i18n.onChange(() => { if (current) show(current); });
  return { hide, show, element: box };
}
