## Why

Al elegir una neurona en la pestaña 5, el sesgo y la cuenta escrita quedan tapados.

**Lo que se ve hoy** (capturas del dueño en `capturas/antes-duenio-*.png`):
- La tarjeta queda debajo del cerebro, de "Tráfico" y de la frase del caso del choque.
- Hay dos desplazamientos anidados: el de la tarjeta (`.inspect-card`, con `overflow-y: auto`) y el de las filas (`.inspect-rows-scroll`).
- El pie con el sesgo termina fuera de la vista, y no se nota que haya que desplazar algo para llegar a él.
- La especificación ya pide que el pie quede "siempre a la vista", y hoy no se cumple.

**El concepto de ML que hace visible:** los parámetros (pesos y sesgo) son lo que se aprende, y cambiarlos a mano es el experimento central de esta pestaña. Por eso tienen que estar al alcance apenas se elige algo.

## What Changes

- **Con algo elegido, su detalle va primero.** Con una neurona o una conexión elegida, la tarjeta de detalle pasa al principio del panel. El cerebro (nombre y "Cambiar") se reduce a un renglón compacto encima. Debajo de la tarjeta quedan, en este orden:
  - la opción "Tráfico";
  - la frase de ayuda del caso;
  - "Cómo se lee la red";
  - las misiones.

  Sin nada elegido, el panel queda como hoy.
- **Un solo desplazamiento.** La tarjeta y su lista de filas dejan de desplazarse por su cuenta: el único que se desplaza es el panel.
- **El pie siempre a la vista.** El pie de la tarjeta (la cuenta escrita, el sesgo con su deslizador, la activación y la salida) queda pegado al borde de abajo del panel mientras la tarjeta está a la vista. Así los pesos de las filas y el sesgo se pueden usar a la vez, sin buscar.
- **En una conexión, el peso arriba.** En el detalle de una conexión, el peso con su deslizador es lo primero debajo del título.
- Se aplica igual en la V2 (Entender).

Filtro de entrada:
1. **¿Qué concepto hace visible?** Que los pesos y el sesgo son lo que se ajusta: quedan al alcance apenas se elige una neurona.
2. **¿Funciona sin configurar nada?** Sí. Es el orden por defecto al elegir algo.
3. **¿Se puede volver atrás?** Sí. Al soltar lo elegido, el panel vuelve a su orden de siempre.
4. **¿Estorba a alguien?** No. Lo que baja de lugar (tráfico, leyenda, misiones) sigue en el panel, a un desplazamiento.

**Público:** a los dos. El principiante encuentra el deslizador sin buscarlo. El mentor ajusta un peso y el sesgo sin perder la cuenta escrita.

**Fuera de alcance:**
- Rediseñar la tarjeta: sus filas, columnas y barras siguen iguales.
- Cambiar la red, la escena o la decisión.
- Otras pestañas.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `pestana-inspeccionar`:
  - se agrega el requisito "Lo elegido, primero en el panel";
  - cambia "Tarjeta de la neurona": un solo desplazamiento y el pie pegado abajo, en lugar del desplazamiento por dentro.

Entender, en la V2, implementa lo mismo.

## Impact

- `src/tabs/inspect/index.js`: orden de los bloques del panel según haya algo elegido, y renglón compacto del cerebro.
- `styles/app.css`:
  - `.panel:has(.inspect-panel)`, `.inspect-card` y `.inspect-rows-scroll`;
  - el pie de la tarjeta, que pasa a `position: sticky`.
- `src/v2/stages/entender/index.js` y los estilos de la V2 equivalentes.
- Pruebas de distribución que verifican el panel, si existen.
- El núcleo no cambia.
