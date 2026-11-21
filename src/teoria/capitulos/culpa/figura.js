// La figura viva de "Repartir la culpa" (seccion-teoria D12, capítulo 6): la red de tres neuronas con
// salida suave. La cuenta va de izquierda a derecha y la culpa vuelve de derecha a izquierda: primero la
// de la salida, después la de las ocultas, y al final cuánto cambia cada peso. Después la red se corrige
// con todos los ejemplos y se ve la curva del error. Es una sola figura que se transforma. Toda la cuenta
// sale de cuenta.js (forwardSoft, backward, corrections y trainEpoch de la app).
//
// La culpa lleva forma además de color: un rombo naranja junto a la neurona, con su número; las puntas
// naranjas sobre los pesos señalan hacia atrás, por donde viaja. El cambio de cada peso va escrito debajo
// de su pastilla, con su signo. El naranja es el de la barra del error del capítulo 4.
//
// Igual que las otras figuras, no decide qué valores muestra: `poner` la lleva al estado que le dan y
// `alTocar` avisa cada cambio de la persona con el estado completo (D4).

import { h, s, rellenar, formato, crearAyuda, conAyuda } from '../../dom.js';
import { TASA, crearRedSuave, valoresDe, idaYVuelta, pesoQueMasCambia, errorMedio, unaEpoca, aciertos, conPeso } from './cuenta.js';
import { DE_LA_VISTA, TOPE_EPOCAS, NEURONAS, EJEMPLO, PESO_DEL_DESAFIO, avanceDelDesafio } from './guion.js';
import { crearRedEnCapas } from '../../figuras/red-capas.js';
import { crearCurva } from '../../figuras/paisaje.js';

const ANCHO = 580;
const ALTO = 330;
const X0 = 412; // la regla de la respuesta: de 0...
const X1 = 536; // ...a 1
const Y_REGLA = 62;
const RANGO_PESO = { desde: -2, hasta: 2 };

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
  const base = crearRedSuave();
  const pesoBase = valoresDe(base).salida.pesos[PESO_DEL_DESAFIO.entrada];
  const historial = [{ red: base, error: errorMedio(base) }]; // la red después de cada época
  let vista = 'ejemplo';
  let pasos = 0;
  let peso = pesoBase;
  let epocas = 0;
  let cambiada = false;
  let avisoPendiente = 0;

  /** La red después de `n` épocas (se calcula una sola vez y se guarda). */
  function redTras(n) {
    while (historial.length <= n) {
      const e = unaEpoca(historial.at(-1).red);
      historial.push({ red: e.red, error: e.despues });
    }
    return historial[n].red;
  }

  // ---- La red ------------------------------------------------------------------------------------------
  const red = crearRedEnCapas({ sizes: [2, 2, 1], caja: { x: 62, y: 46, ancho: 272, alto: 204 }, etiquetas: true, sesgos: true, clase: 'culpa-red' });
  const nodos = [red.nodos[1][0], red.nodos[1][1], red.nodos[2][0]];
  // La letra de cada neurona va donde no pasa ningún peso ni cae su culpa.
  const LETRA = [{ x: -31, y: -19 }, { x: -31, y: 31 }, { x: 31, y: 21 }];
  nodos.forEach((nodo, k) => nodo.g.append(s('text', { class: 'red-letra', ...LETRA[k], 'text-anchor': 'middle', text: NEURONAS[k] })));
  const rotulosEntrada = red.nodos[0].map((n, i) => s('text', { class: 'rotulo', x: n.x, y: i === 0 ? n.y - 27 : n.y + 38, 'text-anchor': 'middle', text: i === 0 ? f.izquierda : f.derecha }));
  // La culpa de cada neurona: un rombo con su número, arriba a la derecha.
  const culpas = nodos.map((nodo) => {
    const texto = s('text', { class: 'culpa-numero', x: 12, y: 5 });
    return { g: null, texto };
  });
  // Cada rombo va donde no pasa ningún peso: arriba a la derecha, salvo el de B, que va abajo.
  const LUGAR_CULPA = [{ x: 14, y: -35 }, { x: 40, y: 34 }, { x: 14, y: -35 }];
  culpas.forEach((marca, k) => {
    marca.g = s('g', { class: 'culpa-marca', transform: `translate(${nodos[k].x + LUGAR_CULPA[k].x} ${nodos[k].y + LUGAR_CULPA[k].y})` }, s('path', { class: 'culpa-rombo', d: 'M0 -8 L8 0 L0 8 L-8 0 Z' }), marca.texto);
  });
  // La culpa que vuelve por cada peso de la salida: una punta hacia atrás. Lo que lleva va en la lista.
  const vueltas = red.aristas[1][0].map((a) => {
    const t = 0.68;
    const [x, y] = [a.x1 + (a.x2 - a.x1) * t, a.y1 + (a.y2 - a.y1) * t];
    const giro = (Math.atan2(-a.uy, -a.ux) * 180) / Math.PI;
    return { g: s('g', { class: 'culpa-vuelta' }, s('path', { class: 'culpa-punta', d: 'M-7 -7 L7 0 L-7 7 Z', transform: `translate(${x} ${y}) rotate(${giro})` })) };
  });
  // La pastilla de cada peso, para marcar el que más cambia y el que se mueve a mano.
  const pastillas = new Map();
  red.aristas.forEach((capa, l) => capa.forEach((fila, j) => fila.forEach((a, i) => pastillas.set(`${l + 1}-${j}-${i}`, a.g))));
  // A la derecha, una lista: lo que le llega a cada oculta, o el cambio de cada peso y de cada sesgo. Va
  // fuera de la red para que ningún número pise una línea.
  const FILAS = 9;
  const listaTitulo = s('text', { class: 'rotulo culpa-lista-titulo', x: 404, y: 140 });
  const lista = Array.from({ length: FILAS }, (_, k) => {
    const nombre = s('text', { class: 'culpa-fila-nombre', x: 404, y: 160 + k * 18.5 });
    const valor = s('text', { class: 'culpa-fila-valor', x: 570, y: 160 + k * 18.5, 'text-anchor': 'end' });
    return { nombre, valor, g: s('g', { class: 'culpa-fila' }, nombre, valor) };
  });
  const ORIGEN = [[f.nombres.izquierda, f.nombres.derecha], [NEURONAS[0], NEURONAS[1]]];
  const DESTINO = [[NEURONAS[0], NEURONAS[1]], [NEURONAS[2]]];
  const nombreDe = (c) => (c.tipo === 'peso'
    ? rellenar(f.nombres.peso, { de: ORIGEN[c.capa - 1][c.entrada], a: DESTINO[c.capa - 1][c.neurona] })
    : rellenar(f.nombres.sesgo, { a: DESTINO[c.capa - 1][c.neurona] }));

  // ---- A la derecha: lo que responde contra lo que debía, y la curva del error por época ---------------
  const C = nodos[2];
  const barra = s('line', { class: 'error-barra', y1: Y_REGLA, y2: Y_REGLA, x2: X1 });
  const rombo = s('path', { class: 'error-rombo', d: 'M0 -8 L8 0 L0 8 L-8 0 Z' });
  const responde = s('text', { class: 'rotulo', x: (X0 + X1) / 2, y: Y_REGLA + 30, 'text-anchor': 'middle' });
  const errorTexto = s('text', { class: 'error-resumen', x: (X0 + X1) / 2, y: Y_REGLA + 54, 'text-anchor': 'middle' });
  const regla = s('g', { class: 'culpa-regla' },
    s('path', { class: 'culpa-cable', d: `M${C.x + C.radio + 3} ${C.y} C ${C.x + 70} ${C.y}, ${X0 - 30} ${Y_REGLA + 40}, ${X0 - 6} ${Y_REGLA + 8}` }),
    s('line', { class: 'error-regla', x1: X0, x2: X1, y1: Y_REGLA, y2: Y_REGLA }),
    [X0, X1].map((x) => s('line', { class: 'error-regla', x1: x, x2: x, y1: Y_REGLA - 5, y2: Y_REGLA + 5 })),
    s('text', { class: 'rotulo', x: X0, y: Y_REGLA - 14, 'text-anchor': 'middle', text: '0' }),
    s('text', { class: 'rotulo', x: X1, y: Y_REGLA - 14, 'text-anchor': 'middle', text: '1' }),
    s('circle', { class: 'caso-forma caso-1', cx: X1 + 17, cy: Y_REGLA, r: 7.5 }),
    barra, rombo, responde, errorTexto);
  // La curva de las épocas ocupa el lugar de la lista. Su título va arriba y no en los ejes: en celular
  // los rótulos de los ejes pisaban los números.
  const curva = crearCurva({ caja: { x: 432, y: 160, ancho: 134, alto: 116 }, clase: 'paisaje-vista corregir-historia' });
  const curvaTitulo = s('text', { class: 'rotulo culpa-lista-titulo', x: 404, y: 148 });
  const aciertosTexto = s('text', { class: 'error-resumen culpa-aciertos', x: 499, y: 316, 'text-anchor': 'middle' });

  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite', id: `figura-culpa-${Math.random().toString(36).slice(2, 8)}` });
  const svg = s('svg', { class: 'escenario', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'group', 'aria-label': f.titulo, 'aria-describedby': vivo.id },
    red.g, rotulosEntrada, vueltas.map((v) => v.g), culpas.map((x) => x.g), regla, curva.g, curvaTitulo, aciertosTexto, listaTitulo, lista.map((x) => x.g));

  // ---- La cuenta escrita y los mandos -----------------------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  const crearBoton = (textos, alApretar) => {
    const boton = h('button', { type: 'button', class: 'boton boton-figura', text: textos.rotulo, onclick: alApretar });
    return { boton, caja: conAyuda(boton, crearAyuda(textos.ayuda)) };
  };
  const botonPaso = crearBoton(f.controles.paso, () => {
    if (pasos >= DE_LA_VISTA[vista].tope) return;
    pasos += 1;
    dibujar();
    alTocar(estado());
  });
  const correr = (n) => () => {
    if (epocas >= TOPE_EPOCAS) return;
    epocas = Math.min(TOPE_EPOCAS, epocas + n);
    dibujar();
    alTocar(estado());
  };
  const botonEpoca = crearBoton(f.controles.epoca, correr(1));
  const botonCien = crearBoton(f.controles.cien, correr(100));
  const cajaBotones = h('div', { class: 'figura-boton' }, botonPaso.caja, botonEpoca.caja, botonCien.caja);

  const idCampo = `perilla-culpa-${Math.random().toString(36).slice(2, 8)}`;
  const campo = h('input', { type: 'range', id: idCampo, min: RANGO_PESO.desde, max: RANGO_PESO.hasta, step: 0.1, class: 'perilla-campo' });
  const valorPeso = h('output', { class: 'perilla-valor', for: idCampo });
  const perilla = h('div', { class: 'perilla' },
    h('label', { for: idCampo, class: 'perilla-cabeza' }, h('span', { class: 'perilla-rotulo', text: f.controles.peso.nombre }), valorPeso),
    conAyuda(campo, crearAyuda(f.controles.peso.ayuda), 'perilla-riel'));
  campo.addEventListener('input', () => {
    peso = decima(Number(campo.value));
    dibujar();
    alTocar(estado());
  });
  const cajaPerilla = h('div', { class: 'figura-perillas figura-perillas-una' }, perilla);
  const mandos = h('div', { class: 'figura-mandos' }, cajaBotones, cajaPerilla);

  const leyenda = h('ul', { class: 'figura-leyenda' },
    h('li', null, h('i', { class: 'forma forma-culpa' }), f.leyenda.culpa),
    h('li', null, h('i', { class: 'muestra' }), f.leyenda.aFavor),
    h('li', null, h('i', { class: 'muestra muestra-neg' }), f.leyenda.enContra));
  const restablecer = h('button', { type: 'button', class: 'boton', text: f.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: f.tocada });
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(restablecer, crearAyuda(f.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, leyenda, pieAccion);

  const figura = h('figure', { class: 'figura figura-red figura-culpa' }, h('div', { class: 'figura-lamina' }, svg), cuenta, mandos, pie, vivo);
  contenedor.append(figura);

  // ---- Estado ----------------------------------------------------------------------------------------
  const estado = () => ({ vista, pasos, peso, epocas });

  /** La red de ahora: la de partida, la del desafío (con el peso que se mueve) o la corregida por épocas. */
  const redDeAhora = () => (vista === 'desafio' ? conPeso(base, PESO_DEL_DESAFIO, peso) : vista === 'epocas' ? redTras(epocas) : base);

  function leer() {
    const r = redDeAhora();
    const v = idaYVuelta(r, EJEMPLO, TASA);
    return {
      vista, pasos, peso, epocas, cambiada, red: r, vuelta: v, errorMedio: errorMedio(r), aciertos: aciertos(r),
      desafio: vista === 'desafio' ? avanceDelDesafio(estado()) : null,
      // El tramo de las épocas dice que la red llegó cuando acierta los cuatro.
      logro: vista === 'epocas' ? aciertos(r).bien === aciertos(r).total : undefined,
    };
  }

  const termino = (clase, texto) => h('span', { class: clase, text: texto });
  const conSigno = (v) => (v < 0 ? `(${fmt(v)})` : fmt(v));
  const conMas = (v) => (v > 0 ? `+${fmt(v)}` : fmt(v));

  function dibujar() {
    const d = DE_LA_VISTA[vista];
    const l = leer();
    const v = l.vuelta;
    const valores = valoresDe(l.red);
    const mayor = pesoQueMasCambia(v.correcciones);
    const conCambios = pasos >= 3;
    figura.dataset.vista = vista;
    figura.dataset.pasos = String(pasos);

    // La ida: lo que entra, lo que da cada neurona y los pesos de ahora.
    red.nodos[0].forEach((n, i) => { n.valor.textContent = fmt(v.ida.entradas[i]); });
    [...v.ida.ocultas, v.ida.salida].forEach((o, k) => { nodos[k].valor.textContent = fmt(o.salida); });
    [valores.ocultas[0], valores.ocultas[1], valores.salida].forEach((n, k) => {
      const [capa, j] = k < 2 ? [0, k] : [1, 0];
      n.pesos.forEach((w, i) => red.pintarPeso(red.aristas[capa][j][i], w, fmt(w)));
      red.pintarSesgo(nodos[k], n.sesgo, (n.sesgo >= 0 ? '+ ' : '') + fmt(n.sesgo));
    });

    // La vuelta: la culpa de la salida, la que llega a cada oculta y su culpa.
    culpas[2].texto.textContent = fmt(v.culpaSalida);
    culpas[2].g.classList.toggle('visible', pasos >= 1);
    v.culpaOcultas.forEach((o, j) => {
      culpas[j].texto.textContent = fmt(o.culpa);
      culpas[j].g.classList.toggle('visible', pasos >= 2);
      vueltas[j].g.classList.toggle('visible', pasos >= 2 && !d.peso);
    });
    // La lista: en el desafío, lo que la cuenta dice del peso que se mueve; con los cambios a la vista,
    // el de cada peso y cada sesgo; con las culpas de las ocultas, lo que le llegó a cada una.
    const esDelDesafio = (c) => c.tipo === 'peso' && c.capa === PESO_DEL_DESAFIO.capa && c.neurona === PESO_DEL_DESAFIO.neurona && c.entrada === PESO_DEL_DESAFIO.entrada;
    const delDesafio = v.correcciones.find(esDelDesafio);
    const filas = d.epocas ? []
      : d.peso ? [{ nombre: nombreDe(delDesafio), valor: conMas(delDesafio.cambio) }, { nombre: delDesafio.cambio > 0 ? f.sube : delDesafio.cambio < 0 ? f.baja : f.quieto, valor: '' }]
        : conCambios ? v.correcciones.map((c) => ({ nombre: nombreDe(c), valor: conMas(c.cambio), nulo: Math.abs(c.cambio) < 0.005, mayor: c === mayor }))
          : pasos === 2 ? v.culpaOcultas.map((o, j) => ({ nombre: rellenar(f.nombres.llega, { a: NEURONAS[j] }), valor: fmt(o.llega), culpa: true }))
            : [];
    listaTitulo.textContent = d.epocas || filas.length === 0 ? '' : d.peso ? f.lista.desafio : conCambios ? f.lista.cambios : f.lista.llega;
    lista.forEach((fila, k) => {
      const x = filas[k];
      fila.nombre.textContent = x?.nombre ?? '';
      fila.valor.textContent = x?.valor ?? '';
      fila.g.classList.toggle('nulo', Boolean(x?.nulo));
      fila.g.classList.toggle('mayor', Boolean(x?.mayor));
      fila.g.classList.toggle('de-culpa', Boolean(x?.culpa));
    });
    for (const c of v.correcciones) {
      if (c.tipo !== 'peso') continue;
      const pastilla = pastillas.get(`${c.capa}-${c.neurona}-${c.entrada}`);
      pastilla.classList.toggle('mayor', conCambios && c === mayor);
      pastilla.classList.toggle('elegido', d.peso && esDelDesafio(c));
    }

    // A la derecha: la respuesta en su regla, con la barra del error; y la curva de las épocas.
    const x = X0 + v.ida.salida.salida * (X1 - X0);
    rombo.setAttribute('transform', `translate(${x} ${Y_REGLA})`);
    barra.setAttribute('x1', x);
    responde.textContent = rellenar(f.responde, { salida: fmt(v.ida.salida.salida), correcta: v.error.correcta });
    errorTexto.textContent = rellenar(f.error, { error: fmt(v.error.medida) });
    curva.g.classList.toggle('fuera', !d.epocas);
    curvaTitulo.textContent = d.epocas ? f.ejes.epocas : '';
    aciertosTexto.textContent = d.epocas ? rellenar(f.aciertos, { n: l.aciertos.bien, total: l.aciertos.total, error: fmt(l.errorMedio) }) : '';
    if (d.epocas) {
      const hasta = Math.max(100, Math.ceil(epocas / 100) * 100);
      const salto = Math.max(1, Math.round(hasta / 100));
      const puntos = [];
      for (let k = 0; k <= epocas; k += salto) puntos.push({ x: k, y: historial[k].error });
      if (puntos.at(-1).x !== epocas) puntos.push({ x: epocas, y: historial[epocas].error });
      curva.dibujar({ puntos, xRango: [0, hasta], yRango: [0, 0.8], marca: puntos.at(-1), rotulos: { x: '', y: '' }, fmt });
    }

    // La cuenta escrita del paso que se ve.
    const A = v.culpaOcultas[0];
    if (d.epocas) {
      cuenta.replaceChildren(termino('cuenta-palabra', rellenar(f.cuenta.epoca, { n: epocas })), termino('op cuenta-flecha', '→'),
        termino('cuenta-palabra', f.cuenta.errorMedio), termino('c-culpa', fmt(l.errorMedio)));
    } else if (d.peso) {
      cuenta.replaceChildren(termino('cuenta-palabra', f.cuenta.peso), termino(`c-${signo(peso)}`, fmt(peso)), termino('op cuenta-flecha', '→'),
        termino('cuenta-palabra', f.cuenta.error), termino('c-culpa', fmt(v.error.medida)));
    } else if (pasos === 0) {
      cuenta.replaceChildren(termino('cuenta-palabra', f.cuenta.respondio), termino('c-decide', fmt(v.ida.salida.salida)),
        termino('cuenta-palabra', f.cuenta.debia), termino('cuenta-suma', String(v.error.correcta)),
        termino('op cuenta-flecha', '→'), termino('cuenta-palabra', f.cuenta.error), termino('c-culpa', fmt(v.error.medida)));
    } else if (pasos === 1) {
      cuenta.replaceChildren(termino('cuenta-palabra', rellenar(f.cuenta.culpaDe, { quien: NEURONAS[2] })), termino('op', '='),
        termino('c-decide', fmt(v.ida.salida.salida)), termino('op', '−'), termino('cuenta-suma', String(v.error.correcta)),
        termino('op', '='), termino('c-culpa', fmt(v.culpaSalida)));
    } else if (pasos === 2) {
      cuenta.replaceChildren(termino('cuenta-palabra', rellenar(f.cuenta.culpaDe, { quien: NEURONAS[0] })), termino('op', '='),
        termino('c-culpa', conSigno(v.culpaSalida)), termino('op', '×'), termino(`c-${signo(A.pesoQueLasUne)}`, conSigno(A.pesoQueLasUne)),
        termino('op', '×'), termino('cuenta-suma', fmt(A.pendiente)), termino('op', '='), termino('c-culpa', fmt(A.culpa)));
    } else {
      cuenta.replaceChildren(termino('cuenta-palabra cuenta-nota', f.cuenta.cambio), termino('op cuenta-nota', '='), termino('op', '−'), termino('c-vos', fmt(TASA)), termino('op', '×'),
        termino('c-culpa', conSigno(v.culpaSalida)), termino('op', '×'), termino('c-decide', fmt(mayor.traia)),
        termino('op', '='), termino('cuenta-suma', conMas(mayor.cambio)));
    }

    // Los mandos: el paso, las épocas o el peso. Lo que no hace nada en esta vista no se ve.
    const conPaso = d.paso && pasos < d.tope;
    const conEpocas = d.epocas && epocas < TOPE_EPOCAS;
    botonPaso.caja.hidden = !conPaso;
    botonEpoca.caja.hidden = botonCien.caja.hidden = !conEpocas;
    cajaBotones.classList.toggle('oculta', !conPaso && !conEpocas);
    cajaPerilla.classList.toggle('oculta', !d.peso);
    campo.disabled = !d.peso;
    campo.value = String(peso);
    perilla.dataset.signo = signo(peso);
    perilla.style.setProperty('--pos', `${((peso - RANGO_PESO.desde) / (RANGO_PESO.hasta - RANGO_PESO.desde)) * 100}%`);
    valorPeso.textContent = fmt(peso);
    campo.setAttribute('aria-valuetext', fmt(peso));
    pieAccion.classList.toggle('oculta', !d.paso && !d.epocas && !d.peso && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => {
      vivo.textContent = d.epocas ? rellenar(f.resumenEpocas, { n: epocas, error: fmt(l.errorMedio), bien: l.aciertos.bien, total: l.aciertos.total })
        : rellenar(f.resumen, { salida: fmt(v.ida.salida.salida), error: fmt(v.error.medida), culpa: pasos >= 1 ? fmt(v.culpaSalida) : f.sinCulpa });
    }, 500);
    alCambiar(l);
  }

  /** Lleva la figura a un estado ({ vista, pasos, peso, epocas }). Lo que aparece y se va lo anima el CSS. */
  function poner(destino) {
    vista = destino.vista;
    pasos = destino.pasos;
    peso = destino.peso;
    epocas = destino.epocas;
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
