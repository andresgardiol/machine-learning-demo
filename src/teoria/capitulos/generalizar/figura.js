// La figura viva de "Generalizar o memorizar" (seccion-teoria D12, capítulo 8): puntos de dos clases con
// ruido, y dos formas de contestar: la mejor recta de 24 candidatas y un memorizador que contesta como el
// punto visto más parecido. Es una sola figura: primero los puntos vistos, después la zona de cada
// respuesta, después los puntos apartados y los aciertos de cada uno. Toda la cuenta sale de cuenta.js
// (los puntos y la separación, de pointsDataset y splitDataset de la app).
//
// Forma además de color: un punto naranja es un círculo y uno azul, un cuadrado; los vistos van rellenos
// y los apartados, huecos; un fallo de quien se mira lleva una cruz roja. La zona se pinta del color de
// lo que contesta ahí; la recta se dibuja además como una línea blanca.
//
// Igual que las otras figuras, no decide qué valores muestra: `poner` la lleva al estado que le dan y
// `alTocar` avisa cada cambio de la persona con el estado completo (D4).

import { h, s, rellenar, formato, crearAyuda, conAyuda } from '../../dom.js';
import { DATOS, PARTES_APARTADAS, puntos, mejorRecta, memorizador, comparar, zona } from './cuenta.js';
import { DE_LA_VISTA, QUIENES, avanceDelDesafio } from './guion.js';

const ANCHO = 580;
const ALTO = 330;
const P = { x: 34, y: 14, lado: 286 };
const CELDAS = 40;
const px = (v) => P.x + ((v + 1) / 2) * P.lado;
const py = (v) => P.y + P.lado - ((v + 1) / 2) * P.lado;
// Cada renglón de la tabla lleva el nombre arriba y los dos números abajo: así entra también en celular.
const TABLA = { x: 344, ancho: 228, y: 40, alto: 52, vistos: 452, nuevos: 566 };

/**
 * @param {HTMLElement} contenedor
 * @param {{c: {idioma: string, figura: object}, alCambiar?: (lectura: object) => void,
 *   alTocar?: (estado: object) => void, alRestablecer?: () => void}} opciones
 */
export function crearFigura(contenedor, { c, alCambiar = () => {}, alTocar = () => {}, alRestablecer = () => {} }) {
  const fmt = formato(c.idioma);
  const f = c.figura;
  let vista = 'vistos';
  let mira = 'memorizador';
  let muestra = 'vistos';
  let holdout = DATOS.holdout;
  let elegido = null;
  let cambiada = false;
  let avisoPendiente = 0;
  const guardado = new Map(); // por parte apartada: los puntos, los dos que contestan, sus zonas y sus aciertos

  /** Todo lo que depende de cuántos puntos se apartan; se calcula una vez por valor. */
  function datosDe(parte) {
    if (!guardado.has(parte)) {
      const p = puntos({ holdout: parte });
      const quienes = { recta: mejorRecta(p.vistos), memorizador: memorizador(p.vistos) };
      guardado.set(parte, { ...p, quienes, zonas: {}, cuenta: comparar({ holdout: parte }) });
    }
    return guardado.get(parte);
  }
  function zonaDe(datos, quien) {
    if (!datos.zonas[quien]) {
      const lado = P.lado / CELDAS;
      datos.zonas[quien] = zona(datos.quienes[quien].contestar, CELDAS).flatMap((fila, k) => fila.map((v, i) => (v === 1
        ? `M${(P.x + i * lado - 0.3).toFixed(1)} ${(P.y + k * lado - 0.3).toFixed(1)}h${(lado + 0.6).toFixed(1)}v${(lado + 0.6).toFixed(1)}h${(-lado - 0.6).toFixed(1)}Z` : ''))).join('');
    }
    return datos.zonas[quien];
  }

  // ---- El plano y los puntos ---------------------------------------------------------------------------
  const recorte = `gen-recorte-${Math.random().toString(36).slice(2, 8)}`;
  const zonaCero = s('rect', { class: 'gen-zona gen-zona-0', x: P.x, y: P.y, width: P.lado, height: P.lado });
  const zonaUno = s('path', { class: 'gen-zona gen-zona-1' });
  const linea = s('line', { class: 'plano-recta' });
  const todos = datosDe(DATOS.holdout).todos;
  const marcas = todos.map((e) => {
    const forma = e.targets[0] === 1
      ? s('circle', { class: 'gen-forma gen-clase-1', r: 4.6 })
      : s('rect', { class: 'gen-forma gen-clase-0', x: -4.2, y: -4.2, width: 8.4, height: 8.4, rx: 1 });
    const cruz = s('path', { class: 'gen-fallo', d: 'M-7 -7 L7 7 M-7 7 L7 -7' });
    return s('g', { class: 'gen-punto', transform: `translate(${px(e.inputs[0]).toFixed(1)} ${py(e.inputs[1]).toFixed(1)})` }, cruz, forma);
  });
  const plano = s('g', { class: 'gen-plano' },
    s('defs', null, s('clipPath', { id: recorte }, s('rect', { x: P.x, y: P.y, width: P.lado, height: P.lado, rx: 4 }))),
    s('rect', { class: 'plano-fondo', x: P.x, y: P.y, width: P.lado, height: P.lado, rx: 4 }),
    s('g', { 'clip-path': `url(#${recorte})` }, zonaCero, zonaUno, linea), marcas);

  // ---- La tabla de aciertos ----------------------------------------------------------------------------
  const cabeza = [
    s('text', { class: 'rotulo', x: TABLA.vistos, y: 30, 'text-anchor': 'end', text: f.tabla.vistos }),
    s('text', { class: 'rotulo gen-columna-nuevos', x: TABLA.nuevos, y: 30, 'text-anchor': 'end', text: f.tabla.nuevos }),
  ];
  const filas = Object.fromEntries(QUIENES.map((quien, k) => {
    const y = TABLA.y + k * TABLA.alto + TABLA.alto / 2;
    const icono = quien === 'recta'
      ? s('line', { class: 'plano-recta gen-icono', x1: TABLA.x + 8, y1: y - 6, x2: TABLA.x + 24, y2: y - 18 })
      : s('g', { class: 'gen-icono' }, [[10, -4], [20, -5], [14, 5], [23, 4]].map(([dx, dy]) => s('circle', { class: 'gen-icono-punto', cx: TABLA.x + dx, cy: y - 12 + dy, r: 2.6 })));
    const vistos = s('text', { class: 'gen-numero', x: TABLA.vistos, y: y + 15, 'text-anchor': 'end' });
    const nuevos = s('text', { class: 'gen-numero', x: TABLA.nuevos, y: y + 15, 'text-anchor': 'end' });
    const g = s('g', { class: 'gen-fila' },
      s('rect', { class: 'error-fila-fondo', x: TABLA.x, y: y - TABLA.alto / 2 + 2, width: TABLA.ancho, height: TABLA.alto - 4, rx: 5 }),
      icono, s('text', { class: 'gen-nombre', x: TABLA.x + 32, y: y - 7, text: f.quien[quien] }), vistos, nuevos);
    return [quien, { g, vistos, nuevos }];
  }));
  const nota = s('text', { class: 'rotulo', x: TABLA.x + 4, y: TABLA.y + 2 * TABLA.alto + 28 });
  const nota2 = s('text', { class: 'rotulo', x: TABLA.x + 4, y: TABLA.y + 2 * TABLA.alto + 50 });

  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite', id: `figura-generalizar-${Math.random().toString(36).slice(2, 8)}` });
  const svg = s('svg', { class: 'escenario', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'group', 'aria-label': f.titulo, 'aria-describedby': vivo.id },
    plano, cabeza, QUIENES.map((q) => filas[q].g), nota, nota2);

  // ---- La cuenta escrita y los mandos -----------------------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  function crearSelector(textos, opciones, alElegir) {
    const botones = opciones.map((id) => h('button', { type: 'button', class: 'selector-opcion', text: textos[id], onclick: () => alElegir(id) }));
    const grupo = h('div', { class: 'selector', role: 'group', 'aria-label': textos.rotulo }, botones);
    return { botones, opciones, caja: conAyuda(grupo, crearAyuda(textos.ayuda)) };
  }
  const cambiar = (hacer) => { hacer(); dibujar(); alTocar(estado()); };
  const selectorMira = crearSelector(f.controles.mira, QUIENES, (id) => { if (mira !== id) cambiar(() => { mira = id; }); });
  const selectorMuestra = crearSelector(f.controles.muestra, ['vistos', 'apartados'], (id) => { if (muestra !== id) cambiar(() => { muestra = id; }); });
  const selectorElegido = crearSelector(f.controles.elegido, QUIENES, (id) => { if (elegido !== id) cambiar(() => { elegido = id; }); });
  const cajaSelectores = h('div', { class: 'figura-boton' }, selectorMira.caja, selectorMuestra.caja);

  const idCampo = `perilla-generalizar-${Math.random().toString(36).slice(2, 8)}`;
  const campo = h('input', { type: 'range', id: idCampo, min: PARTES_APARTADAS[0], max: PARTES_APARTADAS.at(-1), step: PARTES_APARTADAS[1] - PARTES_APARTADAS[0], class: 'perilla-campo' });
  const valorPerilla = h('output', { class: 'perilla-valor', for: idCampo });
  const perilla = h('div', { class: 'perilla perilla-tasa' },
    h('label', { for: idCampo, class: 'perilla-cabeza' }, h('span', { class: 'perilla-rotulo', text: f.controles.apartar.nombre }), valorPerilla),
    conAyuda(campo, crearAyuda(f.controles.apartar.ayuda), 'perilla-riel'));
  campo.addEventListener('input', () => cambiar(() => { holdout = Math.round(Number(campo.value)); }));
  const cajaDesafio = h('div', { class: 'figura-mandos-mixtos' }, perilla, selectorElegido.caja);
  const mandos = h('div', { class: 'figura-mandos' }, cajaSelectores, cajaDesafio);

  const leyenda = h('ul', { class: 'figura-leyenda' },
    h('li', null, h('i', { class: 'forma forma-circulo' }), h('i', { class: 'forma forma-cuadrado' }), f.leyenda.vistos),
    h('li', null, h('i', { class: 'forma forma-circulo forma-hueca' }), h('i', { class: 'forma forma-cuadrado forma-hueca' }), f.leyenda.nuevos),
    h('li', null, h('i', { class: 'forma-cruz', text: '✕' }), f.leyenda.fallo));
  const restablecer = h('button', { type: 'button', class: 'boton', text: f.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: f.tocada });
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(restablecer, crearAyuda(f.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, leyenda, pieAccion);

  const figura = h('figure', { class: 'figura figura-red figura-generalizar' }, h('div', { class: 'figura-lamina' }, svg), cuenta, mandos, pie, vivo);
  contenedor.append(figura);

  // ---- Estado ----------------------------------------------------------------------------------------
  const estado = () => ({ vista, mira, muestra, holdout, elegido });

  function leer() {
    const datos = datosDe(holdout);
    return { vista, mira, muestra, holdout, elegido, cambiada, cuenta: datos.cuenta, desafio: vista === 'desafio' ? avanceDelDesafio(estado()) : null };
  }

  const termino = (clase, texto) => h('span', { class: clase, text: texto });

  function dibujar() {
    const d = DE_LA_VISTA[vista];
    const l = leer();
    const datos = datosDe(holdout);
    // A quién se mira: en el desafío, con el que la persona se quedó (si ya eligió).
    const quien = d.apartar ? elegido : mira;
    const conZona = d.zona && quien !== null;
    const enNuevos = muestra === 'apartados';
    figura.dataset.vista = vista;
    figura.dataset.nuevos = d.aciertosNuevos ? 'si' : 'no';

    // La zona de quien se mira y, si es la recta, su línea.
    zonaCero.style.display = zonaUno.style.display = conZona ? '' : 'none';
    if (conZona) zonaUno.setAttribute('d', zonaDe(datos, quien));
    linea.style.display = conZona && quien === 'recta' ? '' : 'none';
    if (conZona && quien === 'recta') {
      const [cx, cy] = datos.quienes.recta.normal;
      linea.setAttribute('x1', px(-cy * 2)); linea.setAttribute('y1', py(cx * 2));
      linea.setAttribute('x2', px(cy * 2)); linea.setAttribute('y2', py(-cx * 2));
    }
    // Los puntos: los apartados van huecos; los que no están en primer plano, tenues; los fallos de quien
    // se mira, con cruz (los de los apartados, solo cuando ya se dicen sus aciertos).
    todos.forEach((e, i) => {
      const apartado = datos.held[i];
      const enPrimerPlano = apartado === enNuevos;
      const g = marcas[i];
      g.classList.toggle('nuevo', apartado);
      g.classList.toggle('escondido', apartado && !enNuevos);
      g.classList.toggle('tenue', !apartado && enNuevos);
      const seDice = conZona && enPrimerPlano && (!apartado || d.aciertosNuevos);
      g.classList.toggle('fallo', seDice && datos.quienes[quien].contestar(e.inputs) !== e.targets[0]);
    });

    // La tabla: cuántos acierta cada uno en lo visto y en lo apartado.
    const k = l.cuenta;
    for (const q of QUIENES) {
      filas[q].vistos.textContent = rellenar(f.tabla.de, { n: k[q].vistos, total: k.vistos });
      filas[q].nuevos.textContent = d.aciertosNuevos ? rellenar(f.tabla.de, { n: k[q].apartados, total: k.apartados }) : enNuevos ? '?' : '';
      filas[q].g.classList.toggle('elegida', conZona && quien === q);
    }
    nota.textContent = d.apartar ? rellenar(f.apartados, { n: k.apartados, total: k.vistos + k.apartados }) : '';
    nota2.textContent = d.apartar ? rellenar(f.practica, { n: k.vistos }) : '';

    // La cuenta escrita.
    if (!conZona) {
      cuenta.replaceChildren(termino('cuenta-palabra', enNuevos ? rellenar(f.cuenta.nuevos, { n: k.apartados }) : rellenar(f.cuenta.vistos, { n: k.vistos })));
    } else {
      const donde = enNuevos ? 'apartados' : 'vistos';
      const seDice = !enNuevos || d.aciertosNuevos;
      cuenta.replaceChildren(termino('cuenta-palabra', f.quien[quien]), termino('op', ':'),
        termino('cuenta-suma', seDice ? String(k[quien][donde]) : '?'), termino('cuenta-palabra', rellenar(enNuevos ? f.cuenta.deNuevos : f.cuenta.deVistos, { total: k[donde] })));
    }

    // Los mandos. Lo que no hace nada en esta vista no se ve.
    const marcar = (sel, valor, activo) => sel.botones.forEach((b, i) => { b.disabled = !activo; b.setAttribute('aria-pressed', sel.opciones[i] === valor ? 'true' : 'false'); });
    selectorMira.caja.hidden = !d.elegirMira;
    selectorMuestra.caja.hidden = !d.elegirMuestra;
    marcar(selectorMira, mira, d.elegirMira);
    marcar(selectorMuestra, muestra, d.elegirMuestra);
    marcar(selectorElegido, elegido, d.apartar);
    cajaSelectores.classList.toggle('oculta', !d.elegirMira && !d.elegirMuestra);
    cajaDesafio.classList.toggle('oculta', !d.apartar);
    campo.disabled = !d.apartar;
    campo.value = String(holdout);
    perilla.style.setProperty('--pos', `${((holdout - PARTES_APARTADAS[0]) / (PARTES_APARTADAS.at(-1) - PARTES_APARTADAS[0])) * 100}%`);
    valorPerilla.textContent = `${fmt(holdout)} %`;
    campo.setAttribute('aria-valuetext', valorPerilla.textContent);
    pieAccion.classList.toggle('oculta', !d.elegirMira && !d.elegirMuestra && !d.apartar && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => {
      vivo.textContent = rellenar(d.aciertosNuevos ? f.resumenNuevos : f.resumen, {
        rv: k.recta.vistos, mv: k.memorizador.vistos, v: k.vistos, rn: k.recta.apartados, mn: k.memorizador.apartados, n: k.apartados,
      });
    }, 500);
    alCambiar(l);
  }

  /** Lleva la figura a un estado ({ vista, mira, muestra, holdout, elegido }). */
  function poner(destino) {
    vista = destino.vista;
    mira = destino.mira;
    muestra = destino.muestra;
    holdout = destino.holdout;
    elegido = destino.elegido ?? null;
    dibujar();
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
