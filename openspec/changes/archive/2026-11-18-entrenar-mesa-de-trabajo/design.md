# Design

## Context

Después de `entrenar-red-primero` (commit `ce6d19e`), medido por su guion (`borradores/entrenar-red-primero/despues/`):

- **Zonas a 1440×900:** escena de 400 px de ancho y 779 de alto, tablero al centro (la red primero, después la curva) y panel de 360.
- **Vista de entrenamiento del panel:**
  - la tarjeta de consigna, con `run` adentro (`.train-run`, 194 px: quién elige al padre, Pausar y Siguiente, la selección manual, las velocidades, Reiniciar y Población nueva);
  - "Más sobre esta pestaña";
  - `viewSwitches`, con Sensores y Ver como la máquina;
  - `basic` (Población y mutación);
  - guardar el campeón;
  - el renglón de misiones.

  A 1440×900 entra sin desplazarse, sin un píxel de sobra.
- **La vista de ajustes** tiene la red y la evolución. La evolución empieza por la función de fitness (`choices.fitness.row`).
- **Reglas a mano** ya tiene una zona del escenario en columna (`.rules-stage-zone`): la escena con `flex: 1` y la barra de marcha (`.rules-runbar`) abajo, con el mismo nodo `run` que antes estaba en la tarjeta. Es el antecedente que se copia.
- **`syncMainAction`** (`index.js`) elige la acción principal por vista. En la vista de cerebros es "Guardar como nuevo". Con la marcha siempre a la vista habría dos.
- **"Mostrame" de la función de fitness** (`missionReveal`, `nodes.fitness`) cambia el panel a la vista de ajustes antes de marcar.

## Goals / Non-Goals

**Goals:**
- La marcha se ve y funciona desde cualquier vista del panel.
- Los ajustes que más cambian el aprendizaje están juntos y a la vista al abrir.
- Mover un control no cambia lo que hace: se mueven los mismos nodos del DOM, con sus manejadores, atajos y tooltips.

**Non-Goals:**
- Un componente de "barra de marcha" compartido entre Reglas a mano y Entrenar. Se copia el patrón, y se generaliza si una tercera pestaña lo pide.
- Cambiar el tablero (la red y la curva), salvo medirlo.

## Decisions

### D1. Mantener el panel y mover la marcha (elegida por Claude, reversible)

| Opción | Lo que resuelve | Costo |
|---|---|---|
| **A. Sin panel, como Reglas a mano** (dos zonas, ajustes por niveles en el tablero, biblioteca flotante) | La marcha a la vista, los ajustes junto a la curva, simetría con Reglas a mano | L: hay que reescribir *Vistas del panel*, *Biblioteca de cerebros* y *Orden común del panel*, y plegar ajustes, lo que choca con "Ningún ajuste MUST quedar plegado". La biblioteca pierde el alto del panel. |
| **B. Panel con sus tres vistas, la marcha debajo de la escena** y "Probá esto" en la vista de entrenamiento | La marcha a la vista, los tres ajustes clave a la vista al abrir; la vista de ajustes ya es "lo avanzado aparte" sin plegar | M. Se pierde la simetría con Reglas a mano, pero gana la de Inspeccionar y el Laboratorio, que tienen la marcha debajo de lo que se mira. |
| **C. Solo fijar la marcha arriba del panel**, fuera de las vistas | La marcha a la vista | S. La marcha queda lejos de la escena (Art. 3) y le quita alto a las tres vistas. |

Elegí **B**: resuelve los dos problemas medidos con el menor cambio de specs.

### D2. La zona del escenario de Entrenar

- Igual que Reglas a mano: el escenario de Entrenar pasa a ser una columna (`.train-stage-zone`). Arriba va la escena con `flex: 1`; debajo, la barra de marcha (`.train-runbar`).
- La barra lleva el nodo `run` tal cual, con su orden: quién elige al padre, Pausar y Siguiente, la selección manual (Elegir al líder, Deshacer y el estado), las velocidades, y Reiniciar y Población nueva con su confirmación. Al final, `viewSwitches` en un renglón compacto (24 px), como los interruptores de Reglas a mano.
- El ancho del escenario no cambia (400 px por defecto). Con 400 px, quién elige al padre, Pausar con Siguiente y las cinco velocidades entran cada uno en un renglón. Reiniciar y Población nueva van en otro.
- **Decisión tras la parada de la tarea 2.4 (Claude, 18 de noviembre de 2026).** Medido por la sub-sesión a 1366×768 con la barra sin compactar: escena de 434 px con la selección automática, de 307 con la manual y el aviso «Rige desde la próxima generación». Las compactaciones de abajo no entran en los 384 px útiles (492 y 510 px). Con los espacios de la barra en 4 px, la escena mide 371 con la selección manual y 343 mientras dura el aviso, que es una sola generación. Opciones: (a) espacios de 4 px y aceptar 343 con el aviso; (b) además, mover el aviso sobre la escena, lejos del ajuste que lo causa, con un cambio de spec; (c) bajar el piso a unos 340 para la selección manual; (d) partir la barra en dos columnas, rompiendo su orden. Elegí **(a) con el piso de 340 solo mientras se ve el aviso**: 360 en todo estado estable y el aviso junto a su ajuste. Los interruptores de la barra se suman a las barras densas de "Dos alturas".
- **Presupuesto original:** la escena tiene que medir 360 px o más de alto a 1366×768. La zona mide 647 px, así que la barra puede medir hasta unos 287, con la selección manual incluida.
  - Hoy `run` mide 194 en 360 px de ancho (sin la selección manual) y los interruptores 32.
  - Si la escena no llega a 360, primero se compacta la barra (las velocidades en el renglón de Pausar, los interruptores en el renglón de Reiniciar). Si aun así no llega, **se para y se consulta** (tarea 2.4).
- Las barras de la escena y los avisos (generación, pausa, ver como la máquina) siguen sobre la escena.
- El orden del foco pasa a ser: escena, barra de marcha, tablero y panel.

*Alternativa descartada:* poner la barra sobre la escena como capa. Tapa autos y la cámara.

### D3. "Probá esto"

- El bloque `basic` pasa a llamarse "Probá esto" (`train.basic.title`, con su ayuda "qué hace / por qué importa"). Lleva `choices.fitness.row` primero, después Población, Fuerza de mutación y Enfriar la mutación.
- La función de fitness sale del bloque de evolución de la vista de ajustes (se mueve el mismo nodo). Su aviso de cambio pendiente pasa a ser el del bloque, `basicPending`, que ya avisa la población y la mutación.
- La marca de cambios pendientes de la pestaña Ajustes deja de contar la función de fitness.
- La misión de la función de fitness no cambia.

*Por qué estos tres ajustes:* son los de §5.3 del análisis de UX para Entrenar, salvo la velocidad de simulación, que ya está en la marcha. La población y la mutación ya estaban en este bloque.

### D4. Una sola acción principal

`syncMainAction` deja de dar la acción principal a "Guardar como nuevo" en la vista de cerebros: queda secundaria y la marcha sigue siendo la principal. Las demás reglas no cambian: con la selección manual esperando, Elegir al líder.

### D5. "Mostrame" sin cambiar de vista

El blanco de la misión de la función de fitness sigue siendo `choices.fitness.row`, que ahora está en la vista de entrenamiento. "Mostrame" solo cambia de vista si el blanco no está en la vista actual; para esta misión no hace falta. Las otras misiones no cambian: Guardar campeón sigue en la vista de entrenamiento.

### D6. Capturas

Se copia `borradores/entrenar-red-primero/capturar.mjs` a `borradores/entrenar-mesa-de-trabajo/`. Mantiene sus vistas y suma estas:

| Vista | Tamaños |
|---|---|
| Vista de ajustes | 1440×900 |
| Vista de cerebros | 1440×900 |
| Selección manual | 1440×900 y 1366×768 |

Medidas nuevas:
- el alto de la escena;
- el alto de la barra de marcha;
- si la zona del escenario se desplaza;
- dónde queda la marcha en cada vista;
- cuántas acciones principales se ven.

## Risks / Trade-offs

- [La escena pierde alto: unos 230 px a 1440 y a 1366.] → El presupuesto de D2 y la parada de la tarea 2.4.
- [Quien conocía la marcha en el panel la busca ahí.] → Pasa lo mismo que en Reglas a mano, Inspeccionar y el Laboratorio, donde la marcha está debajo de lo que se mira. Los atajos no cambian.
- [La vista de entrenamiento sin la marcha queda más corta, y puede sobrar alto.] → Bien: le da lugar a "Probá esto" y a la lista de misiones si se despliega. Se mide.
- [El rótulo "Probá esto" es nuevo y tiene que pasar las pruebas de largo de textos en los dos idiomas.] → Hay una tarea con su prueba.
- Rendimiento: solo cambia dónde se monta el DOM. El bucle de dibujo no cambia, pero el lienzo de la escena se achica, así que dibuja menos píxeles.
