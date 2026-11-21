// La cuenta de "Programar o aprender" (seccion-teoria D9, capítulo 0), sin DOM. Reglas del tipo "si el
// sensor X pasa de un umbral, doblar", evaluadas sobre una lista de situaciones (lo que leen los dos
// sensores y lo que habría que hacer), y una búsqueda del umbral por barrido: prueba umbrales en orden y
// se queda con el que más acierta. Es determinista: misma lista, mismo resultado.
//
// No es todavía cómo aprende una red (eso es de los capítulos 4 a 6): es la idea de pasar de ejemplos a
// números. Cuenta propia y no src/core/rules.js: ese módulo interpreta programas escritos como texto
// para la pestaña Reglas a mano; acá hace falta evaluar una regla con un número que se mueve.
//
//   regla: { sensor: 'izquierdo' | 'derecho', umbral }    dispara si lectura > umbral
//   con varias reglas, el auto dobla si dispara alguna; si no dispara ninguna, sigue derecho

export const SENSORES = Object.freeze(['izquierdo', 'derecho']);
export const DOBLA = 'dobla';
export const SIGUE = 'sigue';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

/**
 * Situaciones propuestas para el capítulo (la sesión de diseño puede cambiarlas al escribir el guion).
 * Las seis primeras se resuelven con una regla sobre el sensor izquierdo; la séptima (algo cerca solo a
 * la derecha) no: hace falta una segunda regla. Con las dos reglas bien puestas aciertan las ocho.
 */
export const SITUACIONES = congelar([
  { id: 's1', izquierdo: 0.8, derecho: 0.1, correcta: DOBLA },
  { id: 's2', izquierdo: 0.6, derecho: 0.2, correcta: DOBLA },
  { id: 's3', izquierdo: 0.2, derecho: 0.1, correcta: SIGUE },
  { id: 's4', izquierdo: 0.4, derecho: 0.3, correcta: SIGUE },
  { id: 's5', izquierdo: 0.9, derecho: 0.5, correcta: DOBLA },
  { id: 's6', izquierdo: 0.1, derecho: 0.2, correcta: SIGUE },
  { id: 's7', izquierdo: 0.2, derecho: 0.7, correcta: DOBLA },
  { id: 's8', izquierdo: 0.3, derecho: 0.4, correcta: SIGUE },
]);

function comprobarRegla(regla) {
  if (!regla || !SENSORES.includes(regla.sensor)) throw new TypeError(`sensor desconocido: ${regla?.sensor}`);
  if (!Number.isFinite(regla.umbral)) throw new TypeError('el umbral tiene que ser un número finito');
}

/** ¿Dispara la regla en esta situación? (la lectura de su sensor pasa del umbral) */
export function dispara(regla, situacion) {
  comprobarRegla(regla);
  return situacion[regla.sensor] > regla.umbral;
}

/** Lo que hace el auto con estas reglas: DOBLA si dispara alguna; SIGUE si ninguna (o no hay reglas). */
export function responder(reglas, situacion) {
  return reglas.some((r) => dispara(r, situacion)) ? DOBLA : SIGUE;
}

/**
 * Cuántas situaciones da bien un conjunto de reglas (una, dos o ninguna).
 * @returns {{aciertos: number, total: number, resultados: Array<{id: string, respuesta: string, correcta: string, bien: boolean}>}}
 */
export function contarAciertos(reglas, situaciones = SITUACIONES) {
  for (const r of reglas) comprobarRegla(r);
  const resultados = situaciones.map((s) => {
    const respuesta = responder(reglas, s);
    return { id: s.id, respuesta, correcta: s.correcta, bien: respuesta === s.correcta };
  });
  return { aciertos: resultados.filter((r) => r.bien).length, total: situaciones.length, resultados };
}

/**
 * Los umbrales que prueba el barrido, en orden: de `desde` a `hasta` (los dos incluidos), de a `paso`.
 * Se cuentan con enteros y se redondean a milésimos para que 0,1 + 0,2 no dé 0,30000000000000004.
 */
export function umbralesDelBarrido({ desde = 0, hasta = 1, paso = 0.05 } = {}) {
  if (![desde, hasta, paso].every(Number.isFinite) || paso <= 0 || hasta < desde) throw new RangeError('barrido inválido');
  const n = Math.round((hasta - desde) / paso);
  return Array.from({ length: n + 1 }, (_, k) => Math.round((desde + k * paso) * 1000) / 1000);
}

/**
 * "Buscar": prueba, en orden, cada umbral del barrido para una regla sobre `sensor` (junto con las
 * `otras` reglas, que quedan fijas) y se queda con el que más acierta. Ante un empate gana el primero
 * del barrido, el umbral más bajo: así el resultado es siempre el mismo. `empatados` lista todos los que
 * llegaron al máximo, y `probados` cada intento, para mostrarlos en orden.
 * @returns {{regla: {sensor: string, umbral: number}, aciertos: number, total: number,
 *   empatados: number[], probados: Array<{umbral: number, aciertos: number}>}}
 */
export function buscarUmbral({ sensor, otras = [], situaciones = SITUACIONES, ...barrido }) {
  comprobarRegla({ sensor, umbral: 0 });
  const probados = umbralesDelBarrido(barrido).map((umbral) => ({
    umbral, aciertos: contarAciertos([...otras, { sensor, umbral }], situaciones).aciertos,
  }));
  const mejor = Math.max(...probados.map((p) => p.aciertos));
  const empatados = probados.filter((p) => p.aciertos === mejor).map((p) => p.umbral);
  return { regla: { sensor, umbral: empatados[0] }, aciertos: mejor, total: situaciones.length, empatados, probados };
}

/**
 * "Buscar" con una regla por sensor, en orden: primero el umbral de la primera regla sola; después, con
 * ese fijo, el de la segunda. No depende de dónde estaban los umbrales: misma lista, mismo resultado.
 * (Buscar cada regla con la otra fija donde la dejó la persona puede quedarse trabado en un par peor.)
 * @returns {{reglas: Array<{sensor: string, umbral: number}>, pasos: Array<ReturnType<typeof buscarUmbral>>,
 *   aciertos: number, total: number}}
 */
export function buscarEnOrden({ sensores = SENSORES, situaciones = SITUACIONES, ...barrido } = {}) {
  const reglas = [];
  const pasos = [];
  for (const sensor of sensores) {
    const paso = buscarUmbral({ sensor, otras: reglas, situaciones, ...barrido });
    pasos.push(paso);
    reglas.push(paso.regla);
  }
  return { reglas, pasos, aciertos: pasos.at(-1)?.aciertos ?? 0, total: situaciones.length };
}
