## 1. Un solo desplazamiento (V1)

- [x] 1.1 Quitar el desplazamiento propio de `.inspect-card` y `.inspect-rows-scroll`, y dejar que el panel sea el único que se desplaza (D1).
- [x] 1.2 Pegar el pie de la tarjeta de la neurona al borde de abajo del panel, con fondo y borde superior (D2).

## 2. Orden del panel (V1)

- [x] 2.1 Con algo elegido, ordenar el panel moviendo los nodos (D3): renglón compacto del cerebro, detalle, "Tráfico", frase, leyenda y misiones. Sin nada elegido, el orden de siempre.
- [x] 2.2 Al elegir algo, volver el panel arriba.
- [x] 2.3 En el detalle de una conexión, poner el peso con su deslizador justo debajo del título (D4).
- [x] 2.4 Comprobar que el orden de Tab sigue al orden visual.

## 3. Entender (V2)

- [x] 3.1 Aplicar los grupos 1 y 2 a la V2 (D5).

## 4. Pruebas

- [x] 4.1 Ajustar las pruebas de distribución o de estructura que dependan del desplazamiento de la tarjeta o del orden del panel, y agregar una del orden con algo elegido y sin nada elegido, si el repositorio tiene dónde.
- [x] 4.2 Correr `npm test` completo.

## 5. Verificación manual

- [x] 5.1 En el navegador, a 1440×900 y a 1366×768, en la V1 y en la V2:
  - elegir la neurona 5 de un cerebro de 12 entradas y ver el sesgo sin desplazar nada;
  - desplazar el panel hasta la última fila y ver su peso y el sesgo a la vez;
  - elegir una conexión y ver el peso primero;
  - soltar y ver el orden de siempre;
  - abrir el caso del choque y elegir una neurona;
  - comprobar en las herramientas del navegador que solo el panel tiene desplazamiento.
- [x] 5.2 Tomar capturas del después en `capturas/` (el antes es `capturas/antes-duenio-*.png`) y revisar el filtro de entrada.

## Notas de la implementación

**Decisiones**
- **Dónde va la tarjeta de consigna con algo elegido.** D3 no la nombra. Ya se ocultaba con algo elegido (`show(consigna.node, !state.selected)`), así que en el orden "elegido" va después de la frase, oculta. Lo mismo el texto plegado ("Más sobre esta pestaña") y el bloque sin nada elegido.
- **Renglón compacto del cerebro.** Se oculta solo la línea del entrenamiento (`.inspect-brain-meta`) con `.inspect-panel[data-selection="true"]`. El aviso del cerebro (`.inspect-brain-notice`, con `role="status"`) se deja, porque es un aviso y no detalle.
- **El Laboratorio no cambia.** Usa las mismas clases (`.inspect-panel.lab-panel`, `.inspect-card.lab-card`). Las reglas nuevas de la V1 van con `.inspect-panel:not(.lab-panel)` y `.panel:has(> .inspect-panel:not(.lab-panel))`, y las de la V2 con `.v2-sheet-neuron`.
- **2.3, conexión.** El detalle de la conexión ya tenía el peso con su deslizador justo debajo de la cabecera. No hubo que cambiar el código: se comprobó en el navegador.
- **V2 (D5).** Cerebro, tráfico, leyenda y misiones viven en la hoja Etapa. Por eso, en la hoja Neurona solo se reordenan la tarjeta y la línea de guía: con algo elegido va la tarjeta y la línea debajo. El desplazamiento único es el de la hoja (`.v2-sheet`), y la tarjeta y sus filas pierden el suyo.
- **Orden de Tab (2.4).** Se mueven los nodos, no se usa `order` de CSS, así que entre bloques el orden de Tab sigue al visual. Al mover un nodo que tenía el foco, se le devuelve el foco sin desplazar.
- **Volver arriba (2.2).** Se hace cuando cambia lo elegido (neurona o conexión distinta), no en cada `sync`.
- **Sombra sobre el pie.** El pie lleva una sombra corta hacia arriba, para que se note que las filas pasan por detrás.

**Medido en el navegador** (V1 en `/`, V2 en `/v2/#entender`). Se usó un cerebro de prueba de 12 entradas (11 sensores más la velocidad), 6 ocultas y 4 salidas, con pesos al azar. No se entrenó. Se guardó en `mlLab.brains` del navegador del panel y después se borró.
- V1 a 1440×900, sin nada elegido: el panel entra entero (`scrollHeight` 779 = `clientHeight` 779).
- V1 a 1440×900, neurona 5 de la capa oculta:
  - orden: cerebro, tarjeta, tráfico, frase, leyenda y misiones;
  - 12 filas;
  - el deslizador del sesgo se ve sin desplazar;
  - el único elemento con desplazamiento es `.panel`.
- V1 a 1440×900, peso de la última fila abierto: su deslizador y el del sesgo se ven a la vez sin desplazar.
- V1 a 1440×900, conexión:
  - el detalle va primero;
  - debajo del título van el peso y su deslizador;
  - sin desplazamiento.
- V1, soltar: vuelve el orden de siempre.
- V1 con el caso del choque: la tarjeta va primero y la frase del caso debajo.
- V1 a 1366×768, neurona 5:
  - el sesgo se ve sin desplazar;
  - el panel se desplaza como un solo bloque;
  - el pie queda `sticky`.
- V1 a 1366×768, desplazando hasta la última fila: su deslizador y el del sesgo se ven a la vez y reciben el puntero (`elementFromPoint`).
- V1 a 1366×768, sin nada elegido: el panel mide 798 y se ve 647, así que hoy se desplaza. Antes quedaba recortado por `overflow: hidden`.
- V2 a 1366×768 y a 1440×900 se midió lo mismo:
  - neurona 5 primero;
  - sesgo a la vista;
  - última fila y sesgo a la vez, usables;
  - conexión con el peso primero;
  - soltar devuelve el orden;
  - con el choque, la tarjeta primero y la frase debajo;
  - solo la hoja se desplaza.

**Sin verificar**
- El orden de Tab con el teclado real. Se comprobó por el orden del DOM, que es el visual.
- El inglés y otros anchos de panel.
- El Laboratorio en el navegador. Las reglas nuevas lo excluyen por selector, pero no se miró.

**Filtro de entrada (5.2):** sin cambios respecto de la propuesta. El sesgo y los pesos quedan al alcance apenas se elige algo. No hay que configurar nada. Soltar vuelve al orden de siempre. Lo que baja de lugar sigue en el panel.
