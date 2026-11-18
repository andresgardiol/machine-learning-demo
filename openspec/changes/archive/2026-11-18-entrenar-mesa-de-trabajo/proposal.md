# Proposal

## Why

La crítica de Entrenar (`borradores/sistema-de-diseno/critica-entrenar.md`) encontró dos problemas que este cambio resuelve.

- **La marcha desaparece.** Pausar, Siguiente y las velocidades están dentro de la vista *Entrenamiento* del panel. Al pasar a *Ajustes* o a *Cerebros* dejan de verse, justo cuando se cambia algo y se quiere mirar el efecto (observado en las tres vistas).
- **El ajuste que más enseña está escondido.** La función de fitness, que es la regla de qué se premia, está en la vista Ajustes, mezclada con la élite y el cruce. La misión "Probá otra función de fitness" tiene que cambiar de vista para mostrarla. Mientras tanto, la vista de entrenamiento tiene la población y la mutación, pero no la función de fitness.

Es el cambio 1 de los cuatro que eligió la crítica, después de `entrenar-red-primero`.

**Concepto que hace visible.** Que el aprendizaje se controla con unos pocos ajustes (qué se premia, cuántos autos y cuánto mutan) y que su efecto se mira en la escena y en la curva, que siguen a la vista mientras se cambian.

## What Changes

- **La barra de marcha va debajo de la escena**, siempre a la vista en cualquier vista del panel. Lleva los mismos controles de hoy, en el mismo orden:
  - quién elige al padre;
  - Pausar y Siguiente generación;
  - con selección manual, Elegir al líder, Deshacer y la línea de estado;
  - las velocidades;
  - Reiniciar y Población nueva.

  Al final, en un renglón compacto, los interruptores Sensores y Ver como la máquina, como en Reglas a mano. Es el mismo patrón de Inspeccionar, el Laboratorio y Reglas a mano: la marcha debajo de lo que se mira.
- **"Probá esto" en la vista de entrenamiento:** la función de fitness, la población, la fuerza de mutación y Enfriar la mutación, en ese orden. La función de fitness sale de la vista Ajustes y no se repite ahí.
- **La tarjeta de consigna de Entrenar queda sin la marcha**: la consigna, la misión en curso y "Mostrame".
- **"Mostrame" de "Probá otra función de fitness"** marca el selector en "Probá esto", sin cambiar de vista.
- **En la vista Cerebros, "Guardar como nuevo" pasa a ser secundaria**, porque la marcha sigue a la vista y tiene que ser la única acción principal.
- **Capturas del antes y del después**, con las mismas vistas que `entrenar-red-primero` y además las vistas Ajustes y Cerebros.

**Decisión distinta de la crítica (elegida por Claude, reversible).** La crítica proponía sacar el panel, como en Reglas a mano. Al leer las specs elegí mantener el panel y sus tres vistas, y mover solo la marcha. Las razones:
- el problema más grave, que la marcha desaparezca, viene de las vistas, no del panel;
- la vista Cerebros necesita el alto del panel para la biblioteca;
- la vista Ajustes ya cumple "lo avanzado aparte" sin plegar nada, así que no hace falta tocar "Ningún ajuste MUST quedar plegado";
- Entrenar sigue con la disposición de tres zonas de El problema y Competir (Art. 9).

Se pierde la simetría con Reglas a mano y el ancho del panel para el tablero. Las opciones con sus costos están en D1 de `design.md`.

Fuera de alcance:
- sacar el panel o unir sus vistas;
- el corte de fin de generación y las marcas en la curva (`entrenar-la-generacion-ensena`);
- el trazo fantasma de la mutación (`entrenar-mutacion-a-la-vista`);
- dar más alto a la red y a la curva a 1366×768 (se mide);
- cambiar textos, salvo el título del bloque "Probá esto" y su ayuda.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* Que la función de fitness, la población y la mutación son los ajustes que deciden cómo aprende la población, y que su efecto se ve sin dejar de mirar la escena.
2. *¿Se entiende sin que nadie lo explique?* El bloque se llama "Probá esto" y está debajo de la consigna. La misión "Probá otra función de fitness" marca su control en el mismo lugar.
3. *¿El mentor puede ignorarla u ocultarla?* No agrega nada que ocultar. Los ajustes son los de siempre, en otro orden, y la marcha sigue con sus atajos.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* Todo rige desde la generación siguiente, como hoy, y "Restablecer ajustes" vuelve a los valores por defecto.

**Público.** Al principiante le deja a mano los tres ajustes que más cambian el aprendizaje y la marcha siempre a la vista. Al mentor le deja pausar o pasar de generación desde cualquier vista del panel, con los mismos atajos.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `pestana-entrenar`: la barra de marcha debajo de la escena; "Probá esto" con la función de fitness; la vista Ajustes sin la función de fitness; quién elige al padre, primero en la barra; las vistas del panel; los avisos de cambios pendientes.
- `consigna-de-pestana`: en Entrenar la marcha sale de la tarjeta; "Mostrame" de la función de fitness no cambia de vista; en la vista Cerebros la acción principal sigue siendo la marcha.
- `jerarquia-visual`: dónde está la marcha de Entrenar, y "Guardar como nuevo" pasa a secundaria.
- `estructura-app`: el *Orden común del panel* suma a Entrenar entre las pestañas con la marcha fuera del panel.

## Impact

- `src/tabs/train/index.js`: dónde se montan `run` y `viewSwitches` (la zona del escenario) y el bloque `basic` con la función de fitness; `syncMainAction` para la vista Cerebros; el blanco de "Mostrame".
- `styles/app.css`: la barra de marcha debajo de la escena de Entrenar, como `.rules-runbar`.
- `src/i18n/es.js` y `en.js`: el título y la ayuda de "Probá esto".
- Pruebas de disposición y de la acción principal de Entrenar.
- Ninguna dependencia nueva. No toca el núcleo ni el bucle de simulación.
