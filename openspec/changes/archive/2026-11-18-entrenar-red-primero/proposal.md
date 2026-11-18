# Proposal

## Why

La crítica de Entrenar (`borradores/sistema-de-diseno/critica-entrenar.md`, 18 de noviembre de 2026) midió dos cosas que se pueden arreglar sin rediseñar la pestaña:

- **El panel no cumple su spec.** A 1440×900 con la guía encendida, la vista de entrenamiento mide 865 px y se ven 739. La lista de misiones (165 px) arranca en y = 845 y queda cortada. *Panel a la vista sin desplazarse* pide que a ese tamaño no haya barra de desplazamiento.
- **Lo más interesante queda abajo.** Al abrir la pestaña, la primera tarjeta del tablero es la curva de fitness, y está vacía. A 1× la primera generación tarda más de 20 s (medido). La red del líder, que ya se mueve, queda debajo. El dueño lo pidió el mismo día: "la red debería estar arriba de la curva fitness, es lo más interesante de la tab".

Es el cambio 0 de los cuatro que eligió la crítica para Entrenar. Va primero porque es chico y corrige algo medido.

**Concepto que hace visible.** Que lo que aprende es una red: los pesos y las neuronas del líder se ven primero, y la curva cuenta después cuánto mejoró.

## What Changes

- **La red del líder, primera en el tablero**, arriba de la curva de fitness. Si se pliega la red, la curva sube y ocupa su lugar. Si se pliega la curva, la red ocupa el alto que queda.
- **La lista completa de misiones, plegada al final del panel de Entrenar.** La misión en curso sigue en la tarjeta de consigna, con su barra y su "Mostrame". Debajo, un renglón plegable "Todas las misiones (1 de 4)" despliega la lista. Se recuerda si está abierta o cerrada. Así el panel vuelve a entrar sin desplazarse a 1440×900.
- **Capturas del antes y del después** de Entrenar, a 1440×900 y 1366×768.

Fuera de alcance:
- sacar el panel, la barra de marcha bajo la escena y "Probá esto" (`entrenar-mesa-de-trabajo`, cambio 1);
- el momento de fin de generación (`entrenar-la-generacion-ensena`, cambio 2);
- plegar la lista de misiones en otras pestañas;
- el alto de la red a 1366×768 (120 px): se mide y se anota, pero lo resuelve el cambio 1;
- cambiar textos, salvo el rótulo y el tooltip del renglón plegable.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* Que lo que aprende es una red. La curva es la consecuencia.
2. *¿Se entiende sin que nadie lo explique?* Sí: la red se mueve con el auto líder desde el primer segundo. El renglón de misiones dice cuántas van cumplidas.
3. *¿El mentor puede ignorarla u ocultarla?* Las dos tarjetas se siguen plegando, y la guía oculta las misiones como antes.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* Plegar o desplegar no cambia el entrenamiento. Volver a tocar el renglón o el título de una tarjeta la deja como estaba.

**Público.** Al principiante le muestra primero lo que se mueve. Al mentor le deja el panel sin desplazamiento a 1440×900, y la misión en curso a la vista, como antes.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `pestana-entrenar`: el orden de las tarjetas del tablero (la red primero) y la lista de misiones plegada al final del panel.
- `consigna-de-pestana`: "La lista completa SHALL seguir al final del panel" pasa a admitir, en Entrenar, la lista plegada.

## Impact

- `src/tabs/train/index.js`: el orden de `board.append` y la lista de misiones.
- `styles/app.css`: el crecimiento de las dos tarjetas y el renglón plegable.
- `src/i18n/es.js` y `en.js`: el rótulo y el tooltip del renglón de misiones.
- Pruebas de la disposición de Entrenar que miren el orden.
- Ninguna dependencia nueva. No toca el núcleo ni el bucle de simulación.
