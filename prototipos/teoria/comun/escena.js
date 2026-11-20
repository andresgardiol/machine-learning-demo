// Qué tramo está en escena (teoria-prototipos D5, revisión 2). Una línea de referencia cruza la pantalla
// (la da quien llama: el medio, o debajo de la figura cuando está arriba); el tramo en escena es el
// último cuyo comienzo ya pasó esa línea. Va por tramos, no por píxel: `alCambiar` solo avisa al pasar
// de uno a otro.
//
// Reemplaza al IntersectionObserver de la primera versión: con la figura arriba la franja útil cambia
// con el tamaño de la ventana, y esto se recalcula solo al desplazar y al cambiar el tamaño.

/**
 * @param {{secciones: HTMLElement[], linea: () => number, alCambiar: (i: number) => void}} opciones
 */
export function seguir({ secciones, linea, alCambiar }) {
  let actual = -1;
  let pendiente = false;
  function medir() {
    pendiente = false;
    const y = linea();
    let i = 0;
    secciones.forEach((el, k) => {
      const r = el.getBoundingClientRect();
      if ((r.width || r.height) && r.top <= y) i = k;
    });
    if (i !== actual) {
      actual = i;
      alCambiar(i);
    }
  }
  function pedir() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { if (pendiente) medir(); });
    // Si el navegador no da cuadros (pestaña en segundo plano), se mide igual.
    setTimeout(() => { if (pendiente) medir(); }, 120);
  }
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir);
  medir();
  return { medir, actual: () => actual };
}
