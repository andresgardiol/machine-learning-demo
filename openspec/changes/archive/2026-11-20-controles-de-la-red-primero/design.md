## Context

El panel de la pestaña 5 es una columna flex con `overflow: hidden` (`.panel:has(.inspect-panel)`, en `styles/app.css:1436`).

La tarjeta (`.inspect-card`, línea 1444) tiene `flex: 1 1 auto; overflow-y: auto`, y adentro las filas (`.inspect-rows-scroll`, línea 1453) tienen otro `overflow-y: auto`. Son dos desplazamientos anidados, y además la tarjeta va después del cerebro, de "Tráfico" y de la frase. En una ventana normal, el pie con el sesgo queda fuera de la vista. La V2 (`src/v2/stages/entender/index.js` y sus estilos) tiene una estructura equivalente.

## Goals / Non-Goals

**Goals:**
- Un único desplazamiento: el del panel.
- La tarjeta de lo elegido va primero.
- El pie con el sesgo siempre a la vista.

**Non-Goals:**
- Cambiar el contenido de la tarjeta.
- Mover la leyenda o las misiones a otra zona.

## Decisions

**D1. El panel es el único que se desplaza.**
- `.panel:has(.inspect-panel)` pasa a `overflow-y: auto`.
- `.inspect-card` y `.inspect-rows-scroll` pierden `overflow-y` y `flex: 1 1 auto`: crecen con su contenido.
- Si el panel tiene `overflow: hidden` para respetar "Pestaña a la vista sin desplazarse" (1440×900 sin nada elegido), se mantiene ese objetivo: sin nada elegido, el panel debería seguir entrando entero.

**D2. El pie, pegado abajo.**
- El pie de la tarjeta (la cuenta escrita, el sesgo, la activación y la salida) lleva `position: sticky; bottom: 0`, con el fondo de la tarjeta y un borde arriba, para no encimarse con las filas que pasan por detrás.
- Como el sticky se apoya en el panel, que es el que se desplaza, el pie queda abajo mientras la tarjeta está a la vista y se va con ella cuando la tarjeta termina.

**D3. El orden según lo elegido.**
- Con algo elegido, el panel ordena sus bloques así:
  1. renglón compacto del cerebro (nombre y "Cambiar", sin la línea de detalle del entrenamiento);
  2. tarjeta de detalle;
  3. "Tráfico";
  4. frase de ayuda o del caso;
  5. "Cómo se lee la red";
  6. misiones.
- Sin nada elegido, el orden es el de hoy.
- Se reordena con clases o con el orden del DOM, lo más simple. Si se usa `order` de CSS, hay que cuidar que el orden de Tab siga al visual: por eso es preferible mover los nodos.
- Al elegir algo, el panel vuelve arriba (`scrollTop = 0`), para que la tarjeta quede a la vista.

**D4. Conexión.**
- En el detalle de una conexión, el bloque del peso (deslizador y valor) va justo debajo del título.
- Después van el valor original, la entrada, el producto y la parte del total.

**D5. La V2.**
- Se aplican D1 a D4 con la estructura y las clases de la V2.
- Si la V2 ya tiene un solo desplazamiento, solo se aplican el orden y el pie pegado.

## Risks / Trade-offs

- **Pruebas de distribución.** Pueden fallar las pruebas de distribución que medían la tarjeta con su desplazamiento propio. Se ajustan a la regla nueva.
- **El panel de 1440×900.** "Pestaña a la vista sin desplazarse" pide que el panel entre entero a 1440×900. Con una neurona de muchas entradas, el panel ahora se desplaza. Se acepta, porque la especificación ya admitía desplazar las filas: lo que cambia es dónde ocurre el desplazamiento, no si existe.
