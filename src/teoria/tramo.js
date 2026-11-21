// Las piezas de un tramo de capítulo (seccion-teoria; vienen de teoria-prototipos D2): el texto, la
// predicción (elegir y después ver), el desafío del cierre y el cierre con el enlace a la app. La
// película decide dónde va cada una y qué estado muestra la figura.
import { h, prosa, parrafos, rellenar } from './dom.js';
import { DESTINO_APP } from './capitulos/indice.js';

function crearPrediccion(tramo, alElegir) {
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

  /** Marca la respuesta. `restaurar`: ya se había contestado (por ejemplo, antes de cambiar de idioma). */
  function elegir(id, { restaurar = false } = {}) {
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
    alElegir(id, { restaurar });
  }
  return { el, elegir };
}

function crearDesafio(tramo) {
  const t = tramo.desafioTexto;
  let puntos = [];
  const cajaPuntos = h('span', { class: 'desafio-puntos', 'aria-hidden': 'true' });
  const texto = h('span', { class: 'desafio-texto' });
  const estado = h('p', { class: 'desafio-estado', 'aria-live': 'polite' }, cajaPuntos, texto);
  const pista = h('p', { class: 'desafio-pista', hidden: true, text: t.pista });
  const pedir = h('button', {
    type: 'button', class: 'boton', 'aria-expanded': 'false', text: t.pedirPista,
    onclick: () => { pista.hidden = false; pedir.setAttribute('aria-expanded', 'true'); pedir.disabled = true; },
  });
  const logrado = h('p', { class: 'desafio-logrado', hidden: true }, prosa(t.logrado));
  const el = h('div', { class: 'desafio' }, estado, h('div', { class: 'desafio-ayuda' }, pedir, pista), logrado);
  let ultimo = '';
  return {
    el,
    /** Recibe el avance que da la figura ({ bien, total }). Devuelve true cuando está todo bien. */
    leer({ bien, total }) {
      if (puntos.length !== total) {
        puntos = Array.from({ length: total }, () => h('i', { class: 'desafio-punto' }));
        cajaPuntos.replaceChildren(...puntos);
        ultimo = '';
      }
      if (`${bien}/${total}` !== ultimo) {
        ultimo = `${bien}/${total}`;
        texto.textContent = rellenar(t.estado, { bien, total });
        puntos.forEach((p, i) => p.classList.toggle('bien', i < bien));
      }
      const listo = bien === total;
      logrado.hidden = !listo;
      el.classList.toggle('logrado', listo);
      return listo;
    },
  };
}

/** El cierre del capítulo: una frase y el enlace de ida a la práctica. */
export function crearCierre(cierre) {
  return h('div', { class: 'cierre' },
    h('p', { text: cierre.texto }),
    // El enlace a la práctica va como botón común: lo principal al terminar es seguir leyendo (decisión 59).
    h('a', { class: 'boton cierre-app', href: DESTINO_APP, text: cierre.enlace }));
}

/**
 * El texto de un tramo, armado.
 * @param {object} tramo el del guion, con su prosa (pregunta, antes, consigna, despues, ...)
 * @param {number} i índice desde 0
 * @param {{c: object, alElegir?: (id: string, opciones: {restaurar: boolean}) => void}} opciones
 *   c: los textos (c.comun.tramoDe, c.capitulo.tramos y c.capitulo.cierre)
 */
export function crearTramo(tramo, i, { c, alElegir = () => {} }) {
  const total = c.capitulo.tramos.length;
  const titulo = h('h2', { class: 'pregunta', tabindex: -1, text: tramo.pregunta });
  const despues = h('div', { class: 'tramo-despues' }, parrafos(tramo.despues));
  let resuelta = false;
  let desafio = null;
  let prediccion = null;

  if (tramo.prediccion) {
    despues.hidden = true;
    prediccion = crearPrediccion(tramo, (id, opciones) => {
      resuelta = true;
      despues.hidden = false;
      alElegir(id, opciones);
    });
  }
  if (tramo.desafioTexto) {
    desafio = crearDesafio(tramo);
    despues.hidden = true;
    despues.append(crearCierre(c.capitulo.cierre));
  }

  // Un párrafo que aparece cuando la figura llega a algo en este tramo (la figura lo dice con `logro`).
  const logro = tramo.logroTexto ? h('p', { class: 'desafio-logrado tramo-logro', hidden: true, 'aria-live': 'polite' }, prosa(tramo.logroTexto)) : null;

  const el = h('section', { class: 'tramo', id: `tramo-${tramo.id}`, 'data-tramo': i },
    h('p', { class: 'tramo-numero', text: rellenar(c.comun.tramoDe, { n: i + 1, total }) }),
    titulo,
    h('div', { class: 'tramo-antes' }, parrafos(tramo.antes)),
    tramo.consigna ? h('p', { class: 'consigna' }, prosa(tramo.consigna)) : null,
    prediccion?.el,
    desafio?.el,
    despues,
    logro);

  return {
    el,
    titulo,
    tramo,
    /** ¿Tiene predicción sin contestar? */
    pendiente: () => Boolean(tramo.prediccion) && !resuelta,
    /** Marca una respuesta ya dada (al rearmar el capítulo en otro idioma). */
    restaurar: (id) => prediccion?.elegir(id, { restaurar: true }),
    /** Recibe cada lectura de la figura (solo le interesa al desafío). */
    leer(l) {
      if (desafio && l.desafio && desafio.leer(l.desafio)) despues.hidden = false;
      if (logro && typeof l.logro === 'boolean') logro.hidden = !l.logro;
    },
  };
}
