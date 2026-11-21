// Estado de la figura por tramo (seccion-teoria D4), sin DOM. El guion de cada tramo dice con qué
// valores llega la figura; esto guarda, por tramo, lo que la persona cambió ahí:
//
//   entrar a un tramo  --> hay cambios guardados de ESE tramo?
//                            no --> estado del guion (la base del tramo)
//                            si --> lo que la persona dejo ahi   (+ aviso junto a "Restablecer")
//
// Lo cambiado en un tramo nunca pasa a otro. No se guarda entre visitas: vive lo que vive la página.
//
// Un estado es { vista, entradas: [x1, x2], pesos: [w1, w2], sesgo } u otros campos que defina el
// capítulo: el módulo copia y compara cualquier valor de datos (números, textos, listas y objetos).

const copiar = (v) => (Array.isArray(v) ? v.map(copiar)
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, copiar(x)]))
    : v);

function iguales(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => iguales(x, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a);
    return ka.length === Object.keys(b).length && ka.every((k) => k in b && iguales(a[k], b[k]));
  }
  return false;
}

/**
 * @param {ReadonlyArray<object>} estados el estado del guion de cada tramo, en orden
 */
export function crearEstadoPorTramo(estados) {
  if (!Array.isArray(estados) || estados.length === 0) throw new TypeError('hace falta el estado de al menos un tramo');
  const bases = estados.map(copiar);
  const cambios = new Map();

  const comprobar = (i) => {
    if (!Number.isInteger(i) || i < 0 || i >= bases.length) throw new RangeError(`no hay tramo ${i}`);
  };

  return {
    /** Cuántos tramos hay. */
    get total() { return bases.length; },

    /**
     * El estado con que la figura muestra el tramo i: lo que la persona dejó ahí o, si no tocó nada, el
     * del guion. `cambiado` dice si hay que avisar junto a "Restablecer".
     * @returns {{estado: object, cambiado: boolean}}
     */
    entrar(i) {
      comprobar(i);
      return { estado: copiar(cambios.get(i) ?? bases[i]), cambiado: cambios.has(i) };
    },

    /**
     * La persona cambió la figura estando en el tramo i. `valores` puede traer solo una parte (por
     * ejemplo, `{ pesos }`); el resto queda como estaba en ese tramo. Si el resultado es igual al del
     * guion, el tramo deja de contar como cambiado.
     * @returns {{estado: object, cambiado: boolean}}
     */
    cambiar(i, valores) {
      comprobar(i);
      const nuevo = { ...copiar(cambios.get(i) ?? bases[i]), ...copiar(valores) };
      if (iguales(nuevo, bases[i])) cambios.delete(i); else cambios.set(i, nuevo);
      return this.entrar(i);
    },

    /** "Restablecer": olvida lo cambiado en el tramo i y devuelve el estado del guion. */
    restablecer(i) {
      comprobar(i);
      cambios.delete(i);
      return this.entrar(i);
    },

    /** ¿La persona dejó cambios en el tramo i? */
    cambiado(i) {
      comprobar(i);
      return cambios.has(i);
    },

    /** El estado del guion del tramo i (sin los cambios de la persona). */
    base(i) {
      comprobar(i);
      return copiar(bases[i]);
    },

    /**
     * Cambia la base del tramo i y olvida sus cambios. Lo usa la predicción: al contestar, el tramo pasa
     * a mostrar el estado de "después" del guion.
     */
    fijarBase(i, estado) {
      comprobar(i);
      bases[i] = copiar(estado);
      cambios.delete(i);
      return this.entrar(i);
    },
  };
}
