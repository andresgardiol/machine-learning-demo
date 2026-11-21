// La figura viva de "Programar o aprender" (seccion-teoria D9, capítulo 0): el auto de dos sensores, la
// lista de situaciones y las reglas "si el sensor pasa de X, doblar". Toda la cuenta sale de cuenta.js.
//
// La idea visual: en cada fila, la barra es lo que lee el sensor y la línea blanca es el número de la
// regla. La línea cruza todas las filas a la vez: mover la perilla la corre y se ve en el momento qué
// barras la pasan (la regla dispara) y cuáles no. "Buscar" hace lo mismo que la mano: corre la línea de
// punta a punta, cuenta aciertos en cada lugar y se queda con el mejor. Es un barrido y se ve como tal.
//
// Igual que la de "Una neurona", la figura no decide qué valores muestra: `poner` la lleva al estado que
// le dan y `alTocar` avisa cada cambio de la persona con el estado completo (D4).

import { h, s, rellenar, formato, crearAyuda, conAyuda, movimientoReducido } from '../../dom.js';
import { SITUACIONES, SENSORES, DOBLA, responder, contarAciertos, buscarEnOrden, umbralesDelBarrido } from './cuenta.js';
import { DE_LA_VISTA, reglasDe } from './guion.js';
import { crearAuto } from '../../figuras/neurona.js';

const PASO = 0.05;
const DURACION = 450;
const PASO_DEL_BARRIDO = 70; // ms entre un número probado y el siguiente
const centesima = (v) => Math.round(v * 100) / 100;

const ICONOS = {
  [DOBLA]: 'M4 14 V8.5 Q4 5 7.5 5 H12 M9 2 L12 5 L9 8',
  sigue: 'M8 14 V3 M4.5 6.5 L8 3 L11.5 6.5',
};
const icono = (que) => s('svg', { class: 'sit-icono', viewBox: '0 0 16 16', 'aria-hidden': 'true' },
  s('path', { d: que === DOBLA ? ICONOS[DOBLA] : ICONOS.sigue }));

/**
 * @param {HTMLElement} contenedor
 * @param {{c: {idioma: string, figura: object}, alCambiar?: (lectura: object) => void,
 *   alTocar?: (estado: object) => void, alRestablecer?: () => void}} opciones
 */
export function crearFigura(contenedor, { c, alCambiar = () => {}, alTocar = () => {}, alRestablecer = () => {} }) {
  const fmt = formato(c.idioma);
  const f = c.figura;
  const palabra = (que) => (que === DOBLA ? f.tabla.doblar : f.tabla.seguir);
  let vista = 'fija';
  let umbrales = [0.5, 0.5];
  let elegida = 0;
  let elegidaBase = 0;
  let cambiada = false;
  let buscando = false;
  let enPausa = false; // en la primera pasada de "Buscar" la segunda regla todavía no cuenta
  let barridos = [null, null]; // por regla: { probados, hasta, mejor }
  let animacion = 0;
  let finAnimacion = 0;
  let transicion = false; // la figura va de un estado a otro: lo que se ve en el camino no cuenta para el desafío
  let reloj = 0;
  let avisoPendiente = 0;

  // ---- El auto ---------------------------------------------------------------------------------------
  const auto = crearAuto(c);
  const escena = s('svg', { class: 'escenario prog-escena', viewBox: '30 4 230 322', role: 'img' }, auto.g);

  // ---- Las reglas, cada una con su perilla -----------------------------------------------------------
  const reglas = SENSORES.map((sensor, i) => {
    const textos = f.controles[`u${i + 1}`];
    const id = `umbral-${i}-${Math.random().toString(36).slice(2, 8)}`;
    const valor = h('output', { class: 'regla-valor', for: id });
    const campo = h('input', { type: 'range', id, min: 0, max: 1, step: PASO, class: 'perilla-campo', 'aria-label': textos.rotulo });
    const barras = umbralesDelBarrido().map(() => h('i'));
    const nota = h('span', { class: 'regla-estado' });
    const perilla = h('div', { class: 'regla-perilla' },
      h('span', { class: 'regla-barrido', 'aria-hidden': 'true' }, barras),
      // Las reglas van a la derecha de la figura: la ayuda se abre hacia la izquierda para no salirse.
      conAyuda(campo, crearAyuda(textos.ayuda), 'ayuda-derecha'));
    const el = h('div', { class: 'regla' },
      h('p', { class: 'regla-texto' },
        h('span', { class: 'regla-si', text: `${f.regla.si} ` }), h('span', { class: 'c-entra', text: f.regla[sensor] }), ' ', f.regla.pasa, ' ', valor,
        h('span', { 'aria-hidden': 'true', text: ' → ' }), h('span', { class: 'solo-lector', text: ', ' }),
        h('span', { class: 'c-decide', text: f.regla.entonces }), nota),
      perilla);
    campo.addEventListener('input', () => {
      tocar();
      umbrales[i] = centesima(Number(campo.value));
      barridos = [null, null];
      dibujar();
      alTocar(estado());
    });
    return { el, campo, valor, barras, nota, perilla };
  });

  // ---- La lista de situaciones -----------------------------------------------------------------------
  const filas = SITUACIONES.map((sit, i) => {
    const boton = h('button', { type: 'button', class: 'sit-numero', text: String(i + 1), 'aria-label': rellenar(f.tabla.elegir, { n: i + 1 }) });
    const lectura = (sensor) => {
      const pista = h('span', { class: 'sit-pista' }, h('i', { class: 'sit-relleno', style: `width: ${sit[sensor] * 100}%` }));
      return { pista, td: h('td', { class: `sit-lectura sit-${sensor}` }, h('span', { class: 'sit-caja' }, h('span', { class: 'sit-valor', text: fmt(sit[sensor]) }), pista)) };
    };
    const lecturas = SENSORES.map(lectura);
    const hace = h('td', { class: 'sit-hace' });
    const veredicto = h('td', { class: 'sit-veredicto' });
    const tr = h('tr', { class: 'sit' },
      h('th', { scope: 'row' }, boton), lecturas.map((l) => l.td),
      h('td', { class: 'sit-debe' }, icono(sit.correcta), h('span', { class: 'solo-lector', text: palabra(sit.correcta) })),
      hace, veredicto);
    tr.addEventListener('click', () => { elegida = i; dibujar(); });
    return { sit, tr, boton, pistas: lecturas.map((l) => l.pista), hace, veredicto, ultimo: '' };
  });
  const tabla = h('table', { class: 'prog-tabla' },
    h('caption', { class: 'solo-lector', text: f.tabla.titulo }),
    h('thead', null, h('tr', null,
      h('th', { scope: 'col' }, h('span', { class: 'solo-lector', text: f.tabla.numero })),
      h('th', { scope: 'col', text: f.tabla.izquierdo }), h('th', { scope: 'col', text: f.tabla.derecho }),
      h('th', { scope: 'col', text: f.tabla.deberia }), h('th', { scope: 'col', text: f.tabla.hace }),
      h('th', { scope: 'col' }, h('span', { class: 'solo-lector', text: f.tabla.resultado })))),
    h('tbody', null, filas.map((x) => x.tr)));

  // ---- Pie: Buscar, el marcador y Restablecer --------------------------------------------------------
  const botonBuscar = h('button', { type: 'button', class: 'boton boton-buscar', text: f.controles.buscar.rotulo, onclick: () => buscar() });
  const cajaBuscar = conAyuda(botonBuscar, crearAyuda(f.controles.buscar.ayuda));
  const puntos = SITUACIONES.map(() => h('i', { class: 'desafio-punto' }));
  const marcadorTexto = h('span');
  const marcador = h('p', { class: 'figura-marcador' }, h('span', { class: 'desafio-puntos', 'aria-hidden': 'true' }, puntos), marcadorTexto);
  const restablecer = h('button', { type: 'button', class: 'boton', text: f.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: f.tocada });
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(restablecer, crearAyuda(f.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, cajaBuscar, marcador, pieAccion);
  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite' });

  const figura = h('figure', { class: 'figura figura-programar', 'aria-label': f.titulo },
    h('div', { class: 'prog' },
      h('div', { class: 'figura-lamina prog-auto' }, escena),
      h('div', { class: 'prog-reglas' }, reglas.map((r) => r.el)),
      tabla),
    pie, vivo);
  contenedor.append(figura);

  // ---- Estado ----------------------------------------------------------------------------------------
  /** La persona toca la figura: lo que estaba en marcha (una transición o una búsqueda) se corta. */
  function tocar() {
    cancelAnimationFrame(animacion);
    clearTimeout(finAnimacion);
    clearTimeout(reloj);
    animacion = 0;
    transicion = false;
    buscando = false;
    enPausa = false;
  }

  /** El estado que se ve. La situación elegida no cuenta como cambio: queda la del tramo. */
  const estado = () => ({ vista, umbrales: [...umbrales], elegida: elegidaBase });

  function cuenta() {
    const d = DE_LA_VISTA[vista];
    const cuantas = enPausa ? 1 : d.reglas;
    const activas = reglasDe(umbrales, cuantas);
    return { d, cuantas, activas, ...contarAciertos(activas, SITUACIONES.slice(0, d.situaciones)) };
  }

  function leer() {
    const { aciertos, total } = cuenta();
    return {
      vista, umbrales: [...umbrales], aciertos, total, cambiada, buscando,
      // Lo que lee el desafío del cierre: cuántas situaciones da bien.
      desafio: vista === 'desafio' && !transicion ? { bien: aciertos, total } : null,
    };
  }

  function dibujar() {
    const { d, cuantas, activas, aciertos, total, resultados } = cuenta();
    if (elegida >= d.situaciones) elegida = 0;
    figura.dataset.vista = vista;

    // El auto, en la situación elegida.
    const sit = SITUACIONES[elegida];
    const dobla = responder(activas, sit) === DOBLA;
    auto.actualizar({ entradas: [sit.izquierdo, sit.derecho], salida: dobla ? 1 : 0, giro: sit.derecho > sit.izquierdo ? -1 : 1 }, fmt);
    escena.setAttribute('aria-label', rellenar(f.auto, {
      n: elegida + 1, x1: fmt(sit.izquierdo), x2: fmt(sit.derecho), hace: dobla ? f.dobla : f.sigue,
    }));

    // Las reglas.
    reglas.forEach((r, i) => {
      const cuentaYa = i < cuantas;
      const pendiente = i === 1 && d.pendiente;
      const pausa = i === 1 && enPausa;
      r.el.dataset.estado = pausa ? 'pausa' : cuentaYa ? 'activa' : pendiente ? 'pendiente' : 'oculta';
      r.nota.textContent = pausa ? f.regla.pausa : pendiente ? f.regla.pendiente : '';
      const conPerilla = i < d.perillas;
      r.perilla.classList.toggle('oculta', !conPerilla);
      r.campo.disabled = !conPerilla || buscando;
      r.campo.value = String(umbrales[i]);
      r.campo.setAttribute('aria-valuetext', fmt(centesima(umbrales[i])));
      r.valor.textContent = fmt(centesima(umbrales[i]));
      r.el.style.setProperty('--pos', `${umbrales[i] * 100}%`);
      const b = barridos[i];
      r.barras.forEach((barra, k) => {
        const visto = b && k < b.hasta;
        barra.style.height = visto ? `${Math.max(8, (b.probados[k].aciertos / total) * 100)}%` : '0';
        barra.classList.toggle('mejor', Boolean(visto && b.mejor === b.probados[k].umbral));
      });
    });

    // La lista: la línea de cada regla cruza todas las filas.
    tabla.style.setProperty('--u1', String(umbrales[0]));
    tabla.style.setProperty('--u2', String(umbrales[1]));
    tabla.dataset.regla2 = cuantas === 2 ? 'si' : d.pendiente || enPausa ? 'pendiente' : 'no';
    filas.forEach((x, i) => {
      const r = resultados[i];
      const visible = Boolean(r);
      x.tr.classList.toggle('oculta', !visible);
      x.boton.disabled = !visible;
      x.tr.classList.toggle('elegida', visible && i === elegida);
      x.boton.setAttribute('aria-pressed', visible && i === elegida ? 'true' : 'false');
      if (!visible) return;
      x.tr.classList.toggle('mal', !r.bien);
      x.pistas.forEach((pista, k) => pista.classList.toggle('dispara', k < cuantas && x.sit[SENSORES[k]] > umbrales[k]));
      const clave = `${r.respuesta}/${r.bien}`;
      if (clave !== x.ultimo) {
        x.ultimo = clave;
        x.hace.replaceChildren(icono(r.respuesta), h('span', { class: 'solo-lector', text: palabra(r.respuesta) }));
        x.veredicto.replaceChildren(
          h('span', { 'aria-hidden': 'true', text: r.bien ? '✓' : '✕' }),
          h('span', { class: 'solo-lector', text: r.bien ? f.tabla.bien : f.tabla.mal }));
      }
    });

    // El pie.
    puntos.forEach((p, i) => {
      p.hidden = i >= total;
      p.classList.toggle('bien', i < aciertos);
    });
    marcadorTexto.textContent = rellenar(f.aciertos, { bien: aciertos, total });
    cajaBuscar.classList.toggle('oculta', !d.buscar);
    botonBuscar.disabled = !d.buscar || buscando;
    botonBuscar.textContent = buscando ? f.controles.buscar.buscando : f.controles.buscar.rotulo;
    pieAccion.classList.toggle('oculta', d.perillas === 0 && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    if (!buscando) {
      clearTimeout(avisoPendiente);
      avisoPendiente = setTimeout(() => { vivo.textContent = rellenar(f.resumen, { bien: aciertos, total }); }, 500);
    }
    alCambiar(leer());
  }

  /**
   * "Buscar": corre la línea de cada regla de punta a punta, cuenta aciertos en cada lugar y se queda
   * con el mejor. Primero la primera regla sola; después, con esa fija, la segunda (cuenta.js). Con
   * movimiento reducido no se ve el recorrido: queda el resultado, con las barritas de lo que probó.
   */
  function buscar() {
    if (buscando) return;
    tocar();
    const total = DE_LA_VISTA[vista].situaciones;
    const r = buscarEnOrden({ situaciones: SITUACIONES.slice(0, total) });
    const terminar = () => {
      buscando = false;
      enPausa = false;
      umbrales = r.reglas.map((x) => x.umbral);
      barridos = r.pasos.map((p) => ({ probados: p.probados, hasta: p.probados.length, mejor: p.regla.umbral }));
      dibujar();
      clearTimeout(avisoPendiente);
      vivo.textContent = rellenar(f.buscado, { u1: fmt(umbrales[0]), u2: fmt(umbrales[1]), bien: r.aciertos, total });
      alTocar(estado());
    };
    if (movimientoReducido()) { terminar(); return; }
    buscando = true;
    let fase = 0;
    let k = 0;
    barridos = [{ probados: r.pasos[0].probados, hasta: 0, mejor: null }, null];
    const paso = () => {
      const p = r.pasos[fase];
      enPausa = fase === 0;
      if (k < p.probados.length) {
        umbrales[fase] = p.probados[k].umbral;
        barridos[fase].hasta = ++k;
        dibujar();
        reloj = setTimeout(paso, PASO_DEL_BARRIDO);
        return;
      }
      // Terminó la pasada: la línea vuelve al mejor de los que probó.
      umbrales[fase] = p.regla.umbral;
      barridos[fase].mejor = p.regla.umbral;
      if (fase === 0) {
        fase = 1;
        k = 0;
        barridos[1] = { probados: r.pasos[1].probados, hasta: 0, mejor: null };
        dibujar();
        reloj = setTimeout(paso, 450);
        return;
      }
      terminar();
    };
    paso();
  }

  function llevar(destino, animar) {
    const origen = [...umbrales];
    if (!animar || movimientoReducido()) { umbrales = [...destino]; dibujar(); return; }
    const inicio = performance.now();
    transicion = true;
    const cuadro = (ahora) => {
      const lineal = Math.min(1, (ahora - inicio) / DURACION);
      const t = lineal < 0.5 ? 2 * lineal * lineal : 1 - ((-2 * lineal + 2) ** 2) / 2;
      umbrales = lineal >= 1 ? [...destino] : origen.map((v, i) => v + (destino[i] - v) * t);
      if (lineal >= 1) { transicion = false; clearTimeout(finAnimacion); }
      dibujar();
      if (lineal < 1) animacion = requestAnimationFrame(cuadro);
    };
    animacion = requestAnimationFrame(cuadro);
    // Si el navegador no da cuadros (pestaña en segundo plano), la figura llega igual a su estado.
    finAnimacion = setTimeout(() => { cancelAnimationFrame(animacion); transicion = false; umbrales = [...destino]; dibujar(); }, DURACION + 120);
  }

  /** Lleva la figura a un estado ({ vista, umbrales, elegida }), con transición salvo que `animar` sea falso. */
  function poner(destino, { animar = true } = {}) {
    tocar();
    barridos = [null, null];
    vista = destino.vista;
    elegida = elegidaBase = destino.elegida ?? 0;
    llevar(destino.umbrales, animar);
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
