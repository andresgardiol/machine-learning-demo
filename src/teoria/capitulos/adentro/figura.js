// La figura viva de "Qué quedó adentro" (seccion-teoria D12, capítulo 9): la red del XOR con sus números
// a la izquierda y, a la derecha, el mapa de dónde se enciende una neurona (o de dónde la red entera da
// 1), con los cuatro casos del XOR. Es una sola figura: se elige qué neurona mirar, se apaga una oculta o
// se mueve un peso, y el mapa y los casos cambian. Toda la cuenta sale de cuenta.js (forwardValues y
// neuronGrid de la app, con su `off`, el de la pestaña Inspeccionar).
//
// Forma además de color: la zona clara es donde la neurona se enciende; un caso que tiene que dar 1 es un
// círculo y uno que tiene que dar 0, un cuadrado, con ✓ o ✕; una neurona apagada va a rayas y tachada, y
// sus pesos, tenues; la neurona cuyo mapa se mira lleva el contorno de "vos".
//
// Igual que las otras figuras, no decide qué valores muestra: `poner` la lleva al estado que le dan y
// `alTocar` avisa cada cambio de la persona con el estado completo (D4).

import { h, s, rellenar, formato, crearAyuda, conAyuda } from '../../dom.js';
import { RANGO, mapaDeOculta, mapaDeSalida, numeros } from './cuenta.js';
import { TABLA_XOR } from '../xor/cuenta.js';
import { DE_LA_VISTA, NEURONAS, RANGO_PESO, redDe, casosDe, avanceDelDesafio } from './guion.js';
import { crearRedEnCapas } from '../../figuras/red-capas.js';

const ANCHO = 580;
const ALTO = 330;
const P = { x: 356, y: 22, lado: 204 };
const CELDAS = 24;
const px = (v) => P.x + ((v - RANGO[0]) / (RANGO[1] - RANGO[0])) * P.lado;
const py = (v) => P.y + P.lado - ((v - RANGO[0]) / (RANGO[1] - RANGO[0])) * P.lado;
const LETRAS = { a: 'A', b: 'B', c: 'C' };

const decima = (v) => Math.round(v * 10) / 10;
const signo = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'cero');

/**
 * @param {HTMLElement} contenedor
 * @param {{c: {idioma: string, figura: object}, alCambiar?: (lectura: object) => void,
 *   alTocar?: (estado: object) => void, alRestablecer?: () => void}} opciones
 */
export function crearFigura(contenedor, { c, alCambiar = () => {}, alTocar = () => {}, alRestablecer = () => {} }) {
  const fmt = formato(c.idioma);
  const f = c.figura;
  let vista = 'red';
  let mapa = 'c';
  let apagadas = [];
  let peso = -1;
  let cambiada = false;
  let avisoPendiente = 0;

  // ---- La red ------------------------------------------------------------------------------------------
  const red = crearRedEnCapas({ sizes: [2, 2, 1], caja: { x: 50, y: 40, ancho: 232, alto: 204 }, etiquetas: true, sesgos: true, clase: 'adentro-red' });
  const nodos = { a: red.nodos[1][0], b: red.nodos[1][1], c: red.nodos[2][0] };
  for (const id of NEURONAS) {
    nodos[id].valor.textContent = LETRAS[id];
    nodos[id].g.append(s('path', { class: 'adentro-tacha', d: 'M-16 -16 L16 16 M-16 16 L16 -16' }));
  }
  const rotulosEntrada = red.nodos[0].map((n, i) => s('text', { class: 'rotulo', x: n.x, y: i === 0 ? n.y - 27 : n.y + 38, 'text-anchor': 'middle', text: i === 0 ? f.izquierda : f.derecha }));
  const C = nodos.c;
  const cable = s('line', { class: 'salida-linea', x1: C.x + C.radio + 3, y1: C.y, x2: C.x + 44, y2: C.y });

  // ---- El mapa y los cuatro casos ----------------------------------------------------------------------
  const zona = s('path', { class: 'plano-zona' });
  const guias = [0, 1].flatMap((v) => [
    s('line', { class: 'plano-guia', x1: px(v), y1: P.y, x2: px(v), y2: P.y + P.lado }),
    s('line', { class: 'plano-guia', x1: P.x, y1: py(v), x2: P.x + P.lado, y2: py(v) }),
    s('text', { class: 'rotulo', x: px(v), y: P.y + P.lado + 15, 'text-anchor': 'middle', text: String(v) }),
    s('text', { class: 'rotulo', x: P.x - 7, y: py(v) + 5, 'text-anchor': 'end', text: String(v) }),
  ]);
  const casos = TABLA_XOR.map(({ entradas: [x, y], salida: esperada }) => {
    const forma = esperada === 1
      ? s('circle', { class: 'caso-forma caso-1', r: 9 })
      : s('rect', { class: 'caso-forma caso-0', x: -8, y: -8, width: 16, height: 16, rx: 2 });
    const veredicto = s('text', { class: 'caso-veredicto', x: 12, y: -9 });
    const g = s('g', { class: 'caso adentro-caso', transform: `translate(${px(x)} ${py(y)})` }, forma, veredicto);
    return { g, veredicto };
  });
  const titulo = s('text', { class: 'rotulo adentro-titulo', x: P.x + P.lado / 2, y: P.y + P.lado + 40, 'text-anchor': 'middle' });
  const aciertos = s('text', { class: 'error-resumen', x: P.x + P.lado / 2, y: P.y + P.lado + 66, 'text-anchor': 'middle' });
  const plano = s('g', { class: 'adentro-plano' },
    s('rect', { class: 'plano-fondo', x: P.x, y: P.y, width: P.lado, height: P.lado, rx: 4 }), zona, guias, casos.map((k) => k.g), titulo, aciertos);

  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite', id: `figura-adentro-${Math.random().toString(36).slice(2, 8)}` });
  const svg = s('svg', { class: 'escenario', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'group', 'aria-label': f.titulo, 'aria-describedby': vivo.id },
    red.g, rotulosEntrada, cable, plano);

  // ---- La cuenta escrita y los mandos -----------------------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  const cambiar = (hacer) => { hacer(); dibujar(); alTocar(estado()); };
  const opciones = NEURONAS.map((id) => h('button', {
    type: 'button', class: 'selector-opcion', text: f.controles.mapa[id], onclick: () => { if (mapa !== id) cambiar(() => { mapa = id; }); },
  }));
  const selector = conAyuda(h('div', { class: 'selector', role: 'group', 'aria-label': f.controles.mapa.rotulo }, opciones), crearAyuda(f.controles.mapa.ayuda));
  const interruptores = [0, 1].map((j) => {
    const boton = h('button', {
      type: 'button', class: 'boton boton-figura',
      onclick: () => cambiar(() => { apagadas = apagadas.includes(j) ? apagadas.filter((x) => x !== j) : [...apagadas, j].sort(); }),
    });
    return { boton, caja: conAyuda(boton, crearAyuda(rellenar(f.controles.apagar.ayuda, { quien: LETRAS[NEURONAS[j]] }))) };
  });
  const cajaBotones = h('div', { class: 'figura-boton' }, selector, interruptores.map((x) => x.caja));

  const idCampo = `perilla-adentro-${Math.random().toString(36).slice(2, 8)}`;
  const campo = h('input', { type: 'range', id: idCampo, min: RANGO_PESO.desde, max: RANGO_PESO.hasta, step: RANGO_PESO.paso, class: 'perilla-campo' });
  const valorPerilla = h('output', { class: 'perilla-valor', for: idCampo });
  const perilla = h('div', { class: 'perilla' },
    h('label', { for: idCampo, class: 'perilla-cabeza' }, h('span', { class: 'perilla-rotulo', text: f.controles.peso.nombre }), valorPerilla),
    conAyuda(campo, crearAyuda(f.controles.peso.ayuda), 'perilla-riel'));
  campo.addEventListener('input', () => cambiar(() => { peso = decima(Number(campo.value)); }));
  const cajaPerilla = h('div', { class: 'figura-perillas figura-perillas-una' }, perilla);
  const mandos = h('div', { class: 'figura-mandos' }, cajaBotones, cajaPerilla);

  const marcador = h('p', { class: 'figura-marcador' });
  const restablecer = h('button', { type: 'button', class: 'boton', text: f.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: f.tocada });
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(restablecer, crearAyuda(f.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, marcador, pieAccion);

  const figura = h('figure', { class: 'figura figura-red figura-adentro' }, h('div', { class: 'figura-lamina' }, svg), cuenta, mandos, pie, vivo);
  contenedor.append(figura);

  // ---- Estado ----------------------------------------------------------------------------------------
  const estado = () => ({ vista, mapa, apagadas: [...apagadas], peso });

  function leer() {
    const lista = casosDe(estado());
    return {
      vista, mapa, apagadas: [...apagadas], peso, cambiada, casos: lista, bien: lista.filter((k) => k.bien).length, total: lista.length,
      desafio: vista === 'desafio' ? avanceDelDesafio(estado()) : null,
    };
  }

  const termino = (clase, texto) => h('span', { class: clase, text: texto });
  const conSigno = (v) => (v < 0 ? `(${fmt(v)})` : fmt(v));

  function dibujar() {
    const d = DE_LA_VISTA[vista];
    const l = leer();
    const r = redDe(estado());
    const valores = numeros(r);
    const deQuien = d.elegirMapa ? mapa : 'c';
    figura.dataset.vista = vista;

    // La red: sus números, lo apagado y la neurona cuyo mapa se mira.
    const neuronas = { a: valores.ocultas[0], b: valores.ocultas[1], c: valores.salida };
    for (const id of NEURONAS) {
      const [capa, j] = id === 'c' ? [1, 0] : [0, NEURONAS.indexOf(id)];
      const apagada = id !== 'c' && apagadas.includes(j);
      neuronas[id].pesos.forEach((w, i) => {
        const arista = red.aristas[capa][j][i];
        red.pintarPeso(arista, w, fmt(w));
        // Un peso queda tenue si la neurona a la que llega está apagada, o si sale de una apagada.
        const tenue = apagada || (id === 'c' && apagadas.includes(i));
        arista.linea.classList.toggle('en-espera', tenue);
        arista.g.classList.toggle('en-espera', tenue);
        arista.g.classList.toggle('elegido', d.peso && id === 'c' && i === 1);
      });
      red.pintarSesgo(nodos[id], neuronas[id].sesgo, (neuronas[id].sesgo >= 0 ? '+ ' : '') + fmt(neuronas[id].sesgo));
      nodos[id].g.classList.toggle('apagada', apagada);
      nodos[id].g.classList.toggle('en-foco', d.elegirMapa && id === mapa);
    }

    // El mapa: dónde se enciende la neurona elegida, o dónde la red da 1.
    const grilla = deQuien === 'c' ? mapaDeSalida({ n: CELDAS, apagadas, r }) : mapaDeOculta(NEURONAS.indexOf(deQuien), { n: CELDAS, apagadas, r });
    const lado = P.lado / CELDAS;
    zona.setAttribute('d', grilla.flatMap((fila, k) => fila.map((v, i) => (v === 1
      ? `M${(P.x + i * lado - 0.3).toFixed(1)} ${(P.y + k * lado - 0.3).toFixed(1)}h${(lado + 0.6).toFixed(1)}v${(lado + 0.6).toFixed(1)}h${(-lado - 0.6).toFixed(1)}Z` : ''))).join(''));
    casos.forEach((k, i) => {
      k.g.classList.toggle('bien', l.casos[i].bien);
      k.veredicto.textContent = l.casos[i].bien ? '✓' : '✕';
    });
    titulo.textContent = deQuien === 'c' ? f.mapaDe.red : rellenar(f.mapaDe.neurona, { quien: LETRAS[deQuien] });
    aciertos.textContent = rellenar(f.acierta, { bien: l.bien, total: l.total });

    // La cuenta escrita: la suma de la neurona cuyo mapa se mira, con sus números de ahora.
    const n = neuronas[deQuien];
    const recibe = deQuien === 'c' ? [LETRAS.a, LETRAS.b] : [f.izquierda, f.derecha];
    const partes = [termino('cuenta-quien', LETRAS[deQuien])];
    recibe.forEach((nombre, i) => {
      if (i > 0) partes.push(termino('op', '+'));
      partes.push(termino(`cuenta-palabra ${deQuien === 'c' ? 'c-decide' : 'c-entra'}`, nombre), termino('op', '×'), termino(`c-${signo(n.pesos[i])}`, conSigno(n.pesos[i])));
    });
    partes.push(termino('op', '+'), termino(`c-${signo(n.sesgo)}`, conSigno(n.sesgo)), termino('cuenta-palabra cuenta-nota', f.cuenta.pasa));
    cuenta.replaceChildren(...partes);

    // Los mandos: qué mapa mirar, qué apagar o el peso. Lo que no hace nada en esta vista no se ve.
    selector.hidden = !d.elegirMapa;
    opciones.forEach((b, i) => { b.disabled = !d.elegirMapa; b.setAttribute('aria-pressed', NEURONAS[i] === mapa ? 'true' : 'false'); });
    interruptores.forEach((x, j) => {
      const apagada = apagadas.includes(j);
      x.caja.hidden = !d.apagar.includes(j);
      x.boton.disabled = !d.apagar.includes(j);
      x.boton.textContent = rellenar(apagada ? f.controles.apagar.prender : f.controles.apagar.apagar, { quien: LETRAS[NEURONAS[j]] });
      x.boton.setAttribute('aria-pressed', apagada ? 'true' : 'false');
    });
    cajaBotones.classList.toggle('oculta', !d.elegirMapa && d.apagar.length === 0);
    cajaPerilla.classList.toggle('oculta', !d.peso);
    campo.disabled = !d.peso;
    campo.value = String(peso);
    perilla.dataset.signo = signo(peso);
    perilla.style.setProperty('--pos', `${((peso - RANGO_PESO.desde) / (RANGO_PESO.hasta - RANGO_PESO.desde)) * 100}%`);
    valorPerilla.textContent = fmt(peso);
    campo.setAttribute('aria-valuetext', fmt(peso));

    const nombres = apagadas.map((j) => LETRAS[NEURONAS[j]]);
    marcador.textContent = nombres.length === 0 ? f.entera : rellenar(nombres.length === 1 ? f.sinUna : f.sinDos, { quien: nombres.join(f.y) });
    pieAccion.classList.toggle('oculta', !d.elegirMapa && d.apagar.length === 0 && !d.peso && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => { vivo.textContent = `${marcador.textContent}. ${rellenar(f.acierta, { bien: l.bien, total: l.total })}.`; }, 500);
    alCambiar(l);
  }

  /** Lleva la figura a un estado ({ vista, mapa, apagadas, peso }). */
  function poner(destino) {
    vista = destino.vista;
    mapa = destino.mapa;
    apagadas = [...destino.apagadas];
    peso = destino.peso;
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
