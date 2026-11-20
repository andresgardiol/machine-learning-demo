// Las piezas del capítulo que comparten las tres formas (teoria-prototipos D2): el texto de un tramo, la
// predicción (elegir y después ver), el desafío del AND y el cierre con el enlace a la app. Cada forma
// decide dónde pone cada pieza; ninguna cambia lo que dicen.
import { h, prosa, parrafos, rellenar } from './dom.js';

/** Camino a la app desde la página de una forma (prototipos/teoria/<forma>/). */
const APP = '../../../';

function crearPrediccion(tramo, c, alResolver) {
  const t = tramo.prediccionTexto;
  const resultado = h('div', { class: 'prediccion-resultado', 'aria-live': 'polite' });
  const pendiente = h('p', { class: 'prediccion-pendiente', text: t.pendiente });
  const botones = Object.entries(t.opciones).map(([id, texto]) => h('button', {
    type: 'button', class: 'opcion', 'data-id': id,
    onclick: () => elegir(id),
  }, h('span', { class: 'opcion-marca', 'aria-hidden': 'true' }), h('span', { text: texto })));
  const el = h('div', { class: 'prediccion', role: 'group', 'aria-label': t.pregunta },
    h('p', { class: 'prediccion-pregunta', text: t.pregunta }),
    h('div', { class: 'opciones' }, botones), pendiente, resultado);

  function elegir(id) {
    const acierto = id === tramo.prediccion.correcta;
    for (const b of botones) {
      const esta = b.dataset.id === id;
      const correcta = b.dataset.id === tramo.prediccion.correcta;
      b.setAttribute('aria-disabled', 'true');
      b.setAttribute('aria-pressed', esta ? 'true' : 'false');
      b.classList.toggle('correcta', correcta);
      b.classList.toggle('equivocada', esta && !correcta);
      b.querySelector('.opcion-marca').textContent = correcta ? '✓' : esta ? '✕' : '';
      b.onclick = null;
    }
    el.classList.add('resuelta');
    pendiente.remove();
    resultado.replaceChildren(
      h('p', { class: `veredicto ${acierto ? 'acierto' : 'error'}`, text: acierto ? t.acierto : t.error }),
      h('p', { text: t.explicacion }));
    alResolver();
  }
  return el;
}

function crearDesafio(tramo, c) {
  const t = tramo.desafioTexto;
  const puntos = [0, 1, 2, 3].map(() => h('i', { class: 'desafio-punto' }));
  const texto = h('span', { class: 'desafio-texto' });
  const estado = h('p', { class: 'desafio-estado', 'aria-live': 'polite' }, h('span', { class: 'desafio-puntos', 'aria-hidden': 'true' }, puntos), texto);
  const pista = h('p', { class: 'desafio-pista', hidden: true, text: t.pista });
  const pedir = h('button', {
    type: 'button', class: 'boton', 'aria-expanded': 'false', text: t.pedirPista,
    onclick: () => { pista.hidden = false; pedir.setAttribute('aria-expanded', 'true'); pedir.disabled = true; },
  });
  const logrado = h('p', { class: 'desafio-logrado', hidden: true }, prosa(t.logrado));
  const el = h('div', { class: 'desafio' }, estado, h('div', { class: 'desafio-ayuda' }, pedir, pista), logrado);
  let ultimo = -1;
  return {
    el,
    /** Recibe la lectura de la figura. Devuelve true cuando los cuatro puntos están bien. */
    leer(l) {
      if (l.bien !== ultimo) {
        ultimo = l.bien;
        texto.textContent = rellenar(t.estado, { bien: l.bien });
        puntos.forEach((p, i) => p.classList.toggle('bien', i < l.bien));
      }
      logrado.hidden = l.bien !== 4;
      el.classList.toggle('logrado', l.bien === 4);
      return l.bien === 4;
    },
  };
}

/** El cierre del capítulo: una frase y el enlace de ida a la práctica. */
export function crearCierre(c) {
  return h('div', { class: 'cierre' },
    h('p', { text: c.capitulo.cierre.texto }),
    h('a', { class: 'boton boton-principal', href: APP, text: c.capitulo.cierre.enlace }));
}

/**
 * El texto de un tramo, armado. `ranura` queda vacía: es donde el libro pone la figura.
 * @param {object} tramo de c.capitulo.tramos
 * @param {number} i índice desde 0
 * @param {{c: object, figura: () => object, alResolver?: () => void}} opciones
 *   figura: devuelve la figura que acompaña a este tramo (se pide tarde: puede no existir todavía)
 */
export function crearTramo(tramo, i, { c, figura, alResolver = () => {} }) {
  const total = c.capitulo.tramos.length;
  const titulo = h('h2', { class: 'pregunta', tabindex: -1, text: tramo.pregunta });
  const ranura = h('div', { class: 'tramo-ranura' });
  const despues = h('div', { class: 'tramo-despues' }, parrafos(tramo.despues));
  let resuelta = false;
  let desafio = null;
  let prediccion = null;

  if (tramo.prediccion) {
    despues.hidden = true;
    prediccion = crearPrediccion(tramo, c, () => {
      resuelta = true;
      despues.hidden = false;
      // Primero la neurona como estaba en la pregunta; después, el cambio, para verlo pasar.
      figura().irA(tramo.estado, { forzar: true, animar: false });
      setTimeout(() => figura().irA(tramo.prediccion.despues, { forzar: true }), 350);
      alResolver();
    });
  }
  if (tramo.desafioTexto) {
    desafio = crearDesafio(tramo, c);
    despues.hidden = true;
    despues.append(crearCierre(c));
  }

  const el = h('section', { class: 'tramo', id: tramo.id, 'data-tramo': i },
    h('p', { class: 'tramo-numero', text: rellenar(c.comun.tramoDe, { n: i + 1, total }) }),
    titulo,
    h('div', { class: 'tramo-antes' }, parrafos(tramo.antes)),
    tramo.consigna ? h('p', { class: 'consigna' }, prosa(tramo.consigna)) : null,
    ranura,
    prediccion,
    desafio?.el,
    despues);

  return {
    el,
    titulo,
    ranura,
    tramo,
    /** El estado de la figura para este tramo: el de después, si la predicción ya se resolvió. */
    estado: () => (resuelta && tramo.prediccion ? tramo.prediccion.despues : tramo.estado),
    pendiente: () => Boolean(tramo.prediccion) && !resuelta,
    /** Recibe cada lectura de la figura (solo le interesa al desafío). */
    leer(l) {
      if (desafio && l.vista === 'and' && desafio.leer(l)) despues.hidden = false;
    },
  };
}
