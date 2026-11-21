// La figura viva de "Medir el error" (seccion-teoria D12, capítulo 4): a la izquierda, ocho ejemplos con
// su respuesta correcta y, en una regla de 0 a 1, lo que responde la neurona; a la derecha, primero cómo
// convierte la suma en respuesta (el escalón, que se vuelve una curva suave) y después la curva del error
// de todos los ejemplos contra un peso. Es una sola figura que se transforma. Toda la cuenta sale de
// cuenta.js (softOutput, outputLoss y exampleError de la app).
//
// Forma además de color: lo que cada ejemplo tenía que dar es un círculo naranja (1, doblar) en la punta
// derecha de su regla o un cuadrado azul (0, seguir) en la izquierda; lo que la neurona responde es un
// rombo blanco; el error es la barra naranja que va del rombo a la respuesta correcta, con su número.
//
// Igual que las otras figuras, no decide qué valores muestra: `poner` la lleva al estado que le dan y
// `alTocar` avisa cada cambio de la persona con el estado completo (D4).

import { h, s, rellenar, formato, crearAyuda, conAyuda, descripcionOculta, movimientoReducido } from '../../dom.js';
import { EJEMPLOS, MAPA, DESAFIO, responder, errorMedio, curvaDelError, softOutput, barrido } from './cuenta.js';
import { DE_LA_VISTA, avanceDelDesafio } from './guion.js';
import { crearCurva } from '../../figuras/paisaje.js';

const ANCHO = 580;
const ALTO = 330;
const DURACION = 450;
const FILA = { x: 6, ancho: 350, y: 44, alto: 33 };
const T0 = 128; // la regla: de 0...
const T1 = 262; // ...a 1
const TOPE_ERROR = 2.5;
const SUMAS = barrido({ desde: -5, hasta: 5, paso: 0.1 });

const decima = (v) => Math.round(v * 10) / 10;
const signo = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'cero');
const copiar = ({ pesos, sesgo, m }) => ({ pesos: [...pesos], sesgo, m });

/**
 * @param {HTMLElement} contenedor
 * @param {{c: {idioma: string, figura: object}, alCambiar?: (lectura: object) => void,
 *   alTocar?: (estado: object) => void, alRestablecer?: () => void}} opciones
 */
export function crearFigura(contenedor, { c, alCambiar = () => {}, alTocar = () => {}, alRestablecer = () => {} }) {
  const fmt = formato(c.idioma);
  const f = c.figura;
  let vista = 'lista';
  let valores = { pesos: [0, 0], sesgo: 0, m: 0 }; // m: 0 responde con el escalón; 1, con la salida suave
  let suave = false;
  let elegido = 0;
  let elegidoBase = 0;
  let par = [0, 1];
  let cambiada = false;
  let animacion = 0;
  let finAnimacion = 0;
  let transicion = false;
  let avisoPendiente = 0;

  // ---- Los ejemplos ------------------------------------------------------------------------------------
  const descripcionFila = descripcionOculta(f.fila.descripcion);
  const cabeza = [
    s('text', { class: 'rotulo', x: 46, y: 30, 'text-anchor': 'middle', text: f.columnas.izquierda }),
    s('text', { class: 'rotulo', x: 82, y: 30, 'text-anchor': 'middle', text: f.columnas.derecha }),
    s('text', { class: 'rotulo', x: T0, y: 30, 'text-anchor': 'middle', text: '0' }),
    s('text', { class: 'rotulo', x: (T0 + T1) / 2, y: 30, 'text-anchor': 'middle', text: f.columnas.responde }),
    s('text', { class: 'rotulo', x: T1, y: 30, 'text-anchor': 'middle', text: '1' }),
    s('text', { class: 'rotulo error-columna', x: FILA.x + FILA.ancho - 6, y: 30, 'text-anchor': 'end', text: f.columnas.error }),
  ];
  const filas = EJEMPLOS.map((ejemplo, i) => {
    const y = FILA.y + i * FILA.alto + FILA.alto / 2;
    const correcta = ejemplo.targets[0];
    const fin = correcta === 1 ? T1 : T0;
    const debe = correcta === 1
      ? s('circle', { class: 'caso-forma caso-1', cx: T1 + 17, cy: y, r: 7.5 })
      : s('rect', { class: 'caso-forma caso-0', x: T0 - 24, y: y - 7, width: 14, height: 14, rx: 2 });
    const barra = s('line', { class: 'error-barra', y1: y, y2: y, x2: fin });
    const rombo = s('path', { class: 'error-rombo', d: 'M0 -8 L8 0 L0 8 L-8 0 Z' });
    const veredicto = s('text', { class: 'caso-veredicto error-veredicto', x: 304, y: y + 5, 'text-anchor': 'middle' });
    const error = s('text', { class: 'error-numero', x: FILA.x + FILA.ancho - 6, y: y + 5, 'text-anchor': 'end' });
    const g = s('g', { class: 'error-fila', tabindex: 0, role: 'button', 'aria-describedby': descripcionFila.id },
      s('rect', { class: 'error-fila-fondo', x: FILA.x, y: y - FILA.alto / 2 + 1, width: FILA.ancho, height: FILA.alto - 2, rx: 5 }),
      s('text', { class: 'rotulo error-orden', x: 20, y: y + 5, 'text-anchor': 'middle', text: String(i + 1) }),
      ejemplo.inputs.map((x, k) => s('text', { class: 'error-lectura', x: 46 + k * 36, y: y + 5, 'text-anchor': 'middle', text: fmt(x) })),
      s('line', { class: 'error-regla', x1: T0, x2: T1, y1: y, y2: y }),
      [T0, T1].map((x) => s('line', { class: 'error-regla', x1: x, x2: x, y1: y - 5, y2: y + 5 })),
      debe, barra, rombo, veredicto, error);
    const elegir = () => { if (!DE_LA_VISTA[vista].elegir) return; elegido = i; dibujar(); };
    g.addEventListener('click', elegir);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(); } });
    return { g, barra, rombo, veredicto, error, y, fin, correcta };
  });
  const lista = s('g', { class: 'error-lista' }, cabeza, filas.map((x) => x.g));

  // ---- A la derecha: de la suma a la respuesta, y después la curva del error ----------------------------
  const caja = { x: 410, y: 30, ancho: 154, alto: 188 };
  const activacion = crearCurva({ caja, clase: 'paisaje-vista' });
  const curva = crearCurva({ caja, clase: 'paisaje-vista' });
  const resumen = s('text', { class: 'error-resumen', x: caja.x + caja.ancho / 2, y: 284, 'text-anchor': 'middle' });
  const resumen2 = s('text', { class: 'rotulo', x: caja.x + caja.ancho / 2, y: 306, 'text-anchor': 'middle' });

  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite', id: `figura-error-${Math.random().toString(36).slice(2, 8)}` });
  const svg = s('svg', { class: 'escenario', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'group', 'aria-label': f.titulo, 'aria-describedby': vivo.id },
    lista, activacion.g, curva.g, resumen, resumen2);

  // ---- La cuenta escrita y los mandos -----------------------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  const opciones = [false, true].map((si) => h('button', {
    type: 'button', class: 'selector-opcion', text: si ? f.selector.suave : f.selector.escalon,
    onclick: () => { if (suave === si) return; suave = si; llevar({ ...copiar(valores), m: si ? 1 : 0 }, true); alTocar(estado()); },
  }));
  const selector = h('div', { class: 'selector', role: 'group', 'aria-label': f.selector.rotulo }, opciones);
  const cajaSelector = h('div', { class: 'figura-boton' }, conAyuda(selector, crearAyuda(f.selector.ayuda)));

  const perillas = ['w1', 'w2', 'b'].map((id, k) => {
    const idCampo = `perilla-error-${id}-${Math.random().toString(36).slice(2, 8)}`;
    const campo = h('input', { type: 'range', id: idCampo, min: MAPA.desde, max: MAPA.hasta, step: 0.1, class: 'perilla-campo' });
    const valor = h('output', { class: 'perilla-valor', for: idCampo });
    const el = h('div', { class: 'perilla' },
      h('label', { for: idCampo, class: 'perilla-cabeza' }, h('span', { class: 'perilla-rotulo', text: f.controles[id].nombre }), valor),
      conAyuda(campo, crearAyuda(f.controles[id].ayuda), 'perilla-riel'));
    campo.addEventListener('input', () => {
      tocar();
      const v = decima(Number(campo.value));
      if (k < 2) valores.pesos[k] = v; else valores.sesgo = v;
      dibujar();
      alTocar(estado());
    });
    return { id, el, campo, valor };
  });
  const cajaPerillas = h('div', { class: 'figura-perillas' }, perillas.map((p) => p.el));
  const mandos = h('div', { class: 'figura-mandos' }, cajaSelector, cajaPerillas);

  const leyenda = h('ul', { class: 'figura-leyenda' },
    h('li', null, h('i', { class: 'forma forma-circulo' }), f.leyenda.uno),
    h('li', null, h('i', { class: 'forma forma-cuadrado' }), f.leyenda.cero),
    h('li', null, h('i', { class: 'forma forma-rombo' }), f.leyenda.responde));
  const restablecer = h('button', { type: 'button', class: 'boton', text: f.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: f.tocada });
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(restablecer, crearAyuda(f.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, leyenda, pieAccion);

  const figura = h('figure', { class: 'figura figura-red figura-error' },
    h('div', { class: 'figura-lamina' }, svg), cuenta, mandos, pie, vivo, descripcionFila);
  contenedor.append(figura);

  // ---- Estado ----------------------------------------------------------------------------------------
  function tocar() {
    cancelAnimationFrame(animacion);
    clearTimeout(finAnimacion);
    animacion = 0;
    if (transicion) { transicion = false; valores.m = suave ? 1 : 0; }
  }

  const neurona = () => ({ pesos: [...valores.pesos], sesgo: valores.sesgo });
  /** El estado que se ve. El ejemplo elegido no cuenta como cambio: queda el del tramo. */
  const estado = () => ({ vista, pesos: [...valores.pesos], sesgo: valores.sesgo, suave, elegido: elegidoBase, par: [...par] });

  /** Toda la cuenta de ahora: por ejemplo, lo que responde, si acierta y su error; y el error medio. */
  function leer() {
    const n = neurona();
    const medio = errorMedio(n);
    const casos = EJEMPLOS.map((e, i) => {
      const r = responder(n, e.inputs);
      const k = medio.porEjemplo[i];
      // Con el escalón, la respuesta es 0 o 1 y acierta si es la correcta; con la suave, como la app.
      const conEscalon = valores.m < 0.5;
      return {
        entradas: r.entradas, productos: r.productos, suma: r.suma, escalon: r.escalon, salida: r.salida, correcta: k.correcta, error: k.error,
        dice: r.escalon + (r.salida - r.escalon) * valores.m, bien: conEscalon ? r.escalon === k.correcta : k.acierta,
      };
    });
    return {
      vista, valores: n, suave, casos, medio: medio.medio, aciertos: casos.filter((k) => k.bien).length, total: casos.length, cambiada, elegido,
      desafio: vista === 'desafio' && !transicion ? avanceDelDesafio(estado()) : null,
    };
  }

  const termino = (clase, texto) => h('span', { class: clase, text: texto });
  const conSigno = (v) => (v < 0 ? `(${fmt(v)})` : fmt(v));

  function dibujar() {
    const d = DE_LA_VISTA[vista];
    const l = leer();
    const conSuave = valores.m >= 0.5;
    figura.dataset.vista = vista;
    figura.dataset.errores = d.errores ? 'si' : 'no';

    // Los ejemplos: el rombo de lo que responde, la barra hasta la correcta y el número del error.
    filas.forEach((fila, i) => {
      const k = l.casos[i];
      const x = T0 + k.dice * (T1 - T0);
      const delPar = !d.soloPar || par.includes(i);
      fila.rombo.setAttribute('transform', `translate(${x} ${fila.y})`);
      fila.barra.setAttribute('x1', x);
      fila.barra.style.display = Math.abs(x - fila.fin) < 1 ? 'none' : '';
      fila.veredicto.textContent = k.bien ? '✓' : '✕';
      fila.error.textContent = d.errores && delPar ? fmt(k.error) : '';
      fila.g.classList.toggle('bien', k.bien);
      fila.g.classList.toggle('tenue', !delPar);
      fila.g.classList.toggle('elegida', d.elegir ? i === elegido : d.soloPar && delPar);
      fila.g.setAttribute('aria-pressed', d.elegir && i === elegido ? 'true' : 'false');
      fila.g.setAttribute('aria-disabled', d.elegir ? 'false' : 'true');
      fila.g.setAttribute('aria-label', rellenar(d.errores && delPar ? f.fila.conError : f.fila.sinError, {
        n: i + 1, x1: fmt(k.entradas[0]), x2: fmt(k.entradas[1]), correcta: k.correcta, dice: fmt(k.dice), error: fmt(k.error),
        veredicto: k.bien ? f.fila.bien : f.fila.mal,
      }));
    });

    // A la derecha: cómo sale la respuesta de la suma, o la curva del error contra el peso izquierdo.
    const caso = l.casos[elegido];
    activacion.g.classList.toggle('fuera', d.curva);
    curva.g.classList.toggle('fuera', !d.curva);
    if (!d.curva) {
      activacion.dibujar({
        puntos: SUMAS.map((x) => { const e = x > 0 ? 1 : 0; return { x, y: e + (softOutput(x) - e) * valores.m }; }),
        xRango: [-5, 5], yRango: [0, 1], marca: d.elegir ? { x: caso.suma, y: caso.dice } : null,
        rotulos: { x: f.ejes.suma, y: f.ejes.responde }, fmt,
      });
    } else {
      curva.dibujar({
        puntos: curvaDelError(l.valores, { indice: 0, paso: 0.2 }).map((p) => ({ x: p.peso, y: p.error })),
        xRango: [MAPA.desde, MAPA.hasta], yRango: [0, TOPE_ERROR], marca: { x: l.valores.pesos[0], y: l.medio },
        meta: vista === 'desafio' ? { y: DESAFIO.meta, texto: rellenar(f.meta, { meta: fmt(DESAFIO.meta) }) } : null,
        rotulos: { x: f.ejes.peso, y: f.ejes.error }, fmt,
      });
    }
    resumen.textContent = d.curva ? rellenar(f.errorMedio, { error: fmt(l.medio) }) : rellenar(f.acierta, { n: l.aciertos, total: l.total });
    resumen2.textContent = d.curva ? rellenar(f.acierta, { n: l.aciertos, total: l.total }) : '';

    // La cuenta escrita.
    if (d.soloPar) {
      const [a, b] = par.map((i) => l.casos[i]);
      const una = (i, k) => [termino('cuenta-quien', String(i + 1)), termino('cuenta-palabra', f.cuenta.respondio), termino('c-decide', fmt(k.dice)),
        ...(d.errores ? [termino('op cuenta-flecha', '→'), termino('cuenta-palabra', f.cuenta.error), termino('c-culpa', fmt(k.error))] : [])];
      cuenta.replaceChildren(...una(par[0], a), termino('op', ' '), ...una(par[1], b));
    } else if (d.curva) {
      cuenta.replaceChildren(termino('cuenta-palabra', rellenar(f.cuenta.medio, { total: l.total })), termino('op', '='), termino('c-culpa', fmt(l.medio)));
    } else if (d.errores) {
      cuenta.replaceChildren(termino('cuenta-quien', String(elegido + 1)), termino('cuenta-palabra', f.cuenta.respondio), termino('c-decide', fmt(caso.dice)),
        termino('cuenta-palabra', f.cuenta.debia), termino('cuenta-suma', String(caso.correcta)),
        termino('op cuenta-flecha', '→'), termino('cuenta-palabra', f.cuenta.error), termino('c-culpa', fmt(caso.error)));
    } else {
      const partes = [termino('cuenta-quien', String(elegido + 1))];
      caso.entradas.forEach((x, i) => {
        if (i > 0) partes.push(termino('op', '+'));
        partes.push(termino('c-entra', fmt(x)), termino('op', '×'), termino(`c-${signo(l.valores.pesos[i])}`, conSigno(l.valores.pesos[i])));
      });
      partes.push(termino('op', '+'), termino(`c-${signo(l.valores.sesgo)}`, conSigno(l.valores.sesgo)),
        termino('op', '='), termino('cuenta-suma', fmt(caso.suma)), termino('op cuenta-flecha', '→'),
        termino(`cuenta-salida${caso.escalon === 1 ? ' encendida' : ''}`, conSuave ? fmt(caso.dice) : String(caso.escalon)));
      cuenta.replaceChildren(...partes);
    }

    // Los mandos: el selector, o las perillas. Lo que no hace nada en esta vista no se ve.
    cajaSelector.classList.toggle('oculta', !d.selector);
    opciones.forEach((b, i) => { b.disabled = !d.selector; b.setAttribute('aria-pressed', (i === 1) === suave ? 'true' : 'false'); });
    perillas.forEach((p, k) => {
      const v = k < 2 ? l.valores.pesos[k] : l.valores.sesgo;
      const visible = d.perillas.includes(p.id);
      p.campo.disabled = !visible;
      p.campo.value = String(v);
      p.el.dataset.signo = signo(v);
      p.el.classList.toggle('oculta', !visible);
      p.el.style.setProperty('--pos', `${((v - MAPA.desde) / (MAPA.hasta - MAPA.desde)) * 100}%`);
      p.valor.textContent = fmt(v);
      p.campo.setAttribute('aria-valuetext', fmt(v));
    });
    pieAccion.classList.toggle('oculta', !d.selector && d.perillas.length === 0 && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => {
      vivo.textContent = d.curva ? rellenar(f.resumenError, { error: fmt(l.medio), n: l.aciertos, total: l.total }) : rellenar(f.acierta, { n: l.aciertos, total: l.total });
    }, 500);
    alCambiar(l);
  }

  function llevar(destino, animar) {
    cancelAnimationFrame(animacion);
    clearTimeout(finAnimacion);
    const origen = copiar(valores);
    if (!animar || movimientoReducido()) { transicion = false; valores = copiar(destino); dibujar(); return; }
    const inicio = performance.now();
    transicion = true;
    const mezcla = (t) => ({
      pesos: origen.pesos.map((v, i) => v + (destino.pesos[i] - v) * t), sesgo: origen.sesgo + (destino.sesgo - origen.sesgo) * t, m: origen.m + (destino.m - origen.m) * t,
    });
    const cuadro = (ahora) => {
      const lineal = Math.min(1, (ahora - inicio) / DURACION);
      const t = lineal < 0.5 ? 2 * lineal * lineal : 1 - ((-2 * lineal + 2) ** 2) / 2;
      if (lineal >= 1) { transicion = false; valores = copiar(destino); clearTimeout(finAnimacion); } else valores = mezcla(t);
      dibujar();
      if (lineal < 1) animacion = requestAnimationFrame(cuadro);
    };
    animacion = requestAnimationFrame(cuadro);
    // Si el navegador no da cuadros (pestaña en segundo plano), la figura llega igual a su estado.
    finAnimacion = setTimeout(() => { cancelAnimationFrame(animacion); transicion = false; valores = copiar(destino); dibujar(); }, DURACION + 120);
  }

  /** Lleva la figura a un estado ({ vista, pesos, sesgo, suave, elegido, par }), con transición salvo que `animar` sea falso. */
  function poner(destino, { animar = true } = {}) {
    vista = destino.vista;
    suave = Boolean(destino.suave);
    elegido = elegidoBase = destino.elegido ?? 0;
    par = [...(destino.par ?? par)];
    llevar({ pesos: destino.pesos, sesgo: destino.sesgo, m: suave ? 1 : 0 }, animar);
  }

  /** Prende o apaga el aviso de que la figura tiene cambios de la persona en este tramo. */
  function mostrarCambios(si) {
    if (cambiada === Boolean(si)) return;
    cambiada = Boolean(si);
    dibujar();
  }

  dibujar();
  return { elemento: figura, poner, mostrarCambios, leer, estado };
}
