# Design

## Context

Rótulos: **[Medido]** (con cómo), **[Observado]** (visto en una captura, sin contar) e **[Hipótesis]** (sin probar).

- **[Observado]** Las capturas del 17 de noviembre a 1440×900 (`borradores/sistema-de-diseno/despues/07-inspeccionar-neurona-1440.png` y `08-laboratorio-compuertas-1440.png`) muestran:
  - la red en la zona izquierda (unos 710 px), un tablero de 360 y el panel de 360;
  - en Inspeccionar, la escena de unos 326×210 px dentro del tablero, con "Manejar vos" en la esquina, y la decisión debajo;
  - sobre la red, dos filas: Diagrama/Pesos, Flujo, Conexiones Todas/5/3/1; y Resumir todas, "Sin cambios", Deshacer, Restablecer la red, Ver original, −, + y Ver entera. Abajo, Reproducir, Paso, Atrás, De a Cuadro/Capa/Neurona/Operación, el ritmo y el lugar de la cuenta.
- **[Observado]** Desde el 17 de noviembre se sumaron cambios en otras pestañas, no en estas dos. La sub-sesión mide el antes sobre el commit de partida (tarea 1).
- **Código.**
  - `src/tabs/inspect/index.js` (1367 líneas) arma las tres zonas y la escena chica.
  - Hoy el choque suma `crashTicks` y, al llegar a `RETRY_TICKS`, hace `world.reset()` (líneas 227 a 229, 1247 y 1256).
  - `src/tabs/rules/case.js` ya tiene `createReplayBuffer(capacity)`: un búfer circular con `push`, `at(offset)`, `frames()` y `clear()`. Reglas a mano lo usa para la repetición del choque (*Repetición del choque* en `pestana-reglas`).
  - `world.snapshot()` (`src/core/world.js:311`) copia el estado del primer auto para dibujar. No hay una forma de volver el mundo a ese estado.
  - `traffic.vehicles(time, from, to)` calcula el tráfico a partir del tiempo, sin estado propio [Observado en el código; que alcance para restaurar es **hipótesis**, D5].
- **Specs que se modifican.**
  - *Disposición común* (`estructura-app`).
  - *La red en el centro*, *Escena del auto en segundo plano*, *Vista de la red a la vista*, *Deshacer y restablecer la red*, *Comparar con el original*, *Guía, leyenda y misiones*, *Avance paso a paso* y *Manejar vos* (`pestana-inspeccionar`).
  - *Disposición del Laboratorio*, *Elegir los datos*, *Perillas* y *Deshacer y restablecer los cambios a mano* (`pestana-laboratorio`).
  - *Escena chica* (`vista-escenario`).

## Goals / Non-Goals

**Goals:**
- La escena a la izquierda en las seis pestañas.
- Menos controles a la vista sobre la red, y ninguno sin acción.
- Desde un choque, llegar en dos clics a la neurona que más empujó la decisión, y comprobar un cambio sin volver a la salida.
- En Compuertas, que la acción que se destaca sea la que pide la consigna.

**Non-Goals:**
- Cambiar cómo se calcula o se dibuja la red.
- Un componente de "tarjeta del caso" compartido con Reglas a mano: se copia el patrón y el búfer sí se comparte.

## Decisions

### D1. Cuántos cambios para las cuatro pestañas (elegida por Claude, reversible)

| Opción | A favor | En contra |
|---|---|---|
| A. Uno solo | Lo mínimo | Un cambio L+ que mezcla la red con el volante, y una revisión enorme |
| **B. Dos: las pestañas de la red y las del manejo** | Cada uno comparte código y specs adentro: Inspeccionar y Laboratorio comparten zonas, barra de la red y reproducción; El problema y Competir, el manejo y los cortes | Este cambio es grande (L) |
| C. Cuatro, uno por pestaña | Revisiones chicas | Lo que comparten Inspeccionar y Laboratorio se haría dos veces; el dueño pidió los menos posibles |

**Elegí B.**

### D2. Disposición: el mundo a la izquierda, la red al centro (elegida)

| Opción | A favor | En contra |
|---|---|---|
| A. Igual que hoy, con el tablero más ancho | Barato | La escena sigue chica y a contramano de las otras cuatro pestañas |
| **B. La columna izquierda es lo que la red mira (escena, o plano y tabla); la red al centro; el panel igual** | La escena con todo el alto y cámara, como en El problema (resuelve el pedido de zoom); el mismo lugar para la escena en las seis pestañas | Hay que modificar *Disposición común* y los anchos; la red pierde unos 30 px de ancho a 1440 |
| C. Dos zonas, sin panel, como Reglas a mano | Más lugar para la red | La tarjeta de la neurona necesita el alto del panel; reescribe mucho más |

**Elegí B.** Anchos por defecto a 1440: columna izquierda 400 (como la escena de las otras pestañas), panel 360 y la red con el resto (680). A 1366, la red mide 606, arriba de su mínimo de 600. En ventanas angostas, la columna izquierda cede primero hasta 280. Después cede la red, hasta 440, como hoy.

En Inspeccionar, la columna izquierda tiene, de arriba abajo:
- la escena (`flex: 1`), con los controles de cámara de siempre (Seguir al auto, +, −) y "Manejar vos" en su renglón, en altura normal;
- la decisión de la red;
- con un choque, la tarjeta del caso.

En el Laboratorio tiene, según el experimento:
- con Compuertas, el plano, la tabla de verdad y las curvas;
- con Puntos, el plano y las curvas;
- con Tu manejo, la escena con cámara y las curvas.

El ejemplo en curso va donde va hoy, junto a los datos.

**Riesgo [Hipótesis]:** a 1366×768, el plano, la tabla y las curvas de Compuertas no entran en 400 px de ancho por unos 600 de alto. Si no entran, las curvas se achican primero. Si aun así la columna se desplaza, parar y consultar (tarea 6.4).

**Las manijas de los rayos** (*Rayos que se mueven a mano*) siguen andando en la escena grande: un arrastre que empieza sobre una manija mueve el rayo; uno que empieza en otro lado mueve la cámara.

### D3. La barra sobre la red: tres grupos, y los cambios solo con cambios (elegida)

| Opción | A favor | En contra |
|---|---|---|
| A. Las mismas dos filas, con rótulos de grupo | Barato | Siguen tres botones sin acción hasta el primer cambio |
| **B. Un renglón con tres grupos rotulados (Vista, Conexiones, Acercar), y los cambios de prueba en una franja que aparece solo con cambios** | Unos 14 controles a la vista al abrir, en vez de 20; nada sin acción; los cambios se ven justo cuando importan | Deshacer y Restablecer dejan de verse sin cambios: cambia *Deshacer y restablecer la red* y su par del Laboratorio |
| C. Un menú "Vista ▾" plegado | El mínimo de controles | Choca con "Ninguna función MUST quedar plegada"; esconde el filtro de conexiones, que es de uso frecuente |

**Elegí B**, por la regla de la casa: un ajuste sin efecto se quita de la vista, no se deja deshabilitado. La franja de cambios va arriba de la red, debajo de la barra. Dice "3 cambios de prueba" y lleva Deshacer, Restablecer la red y Ver original. Aparece y se va sin mover la red de golpe: reserva su alto mientras haya cambios en cualquier cerebro de la sesión. El cálculo lo hace la sub-sesión.

Si a 600 px de ancho los tres grupos no entran en un renglón, se parten en dos: Vista y Conexiones arriba, Acercar a la derecha del segundo. Lo que se mide es la cantidad de renglones.

### D4. La guía con algo elegido (elegida)

| Opción | A favor | En contra |
|---|---|---|
| A. Un botón "← Volver a la guía" | Simple | La guía y el detalle se excluyen |
| **B. Una línea de guía que no se va y cambia con lo que se mira, más "Soltar"** | Siempre hay una indicación; "Soltar" es la salida explícita | Hay que escribir cinco textos cortos por idioma |
| C. La guía en una vista aparte del panel | Lugar de sobra | Más clics, y otra vista que mantener |

**Elegí B.** Textos (hasta 120 caracteres):
- **Nada elegido:** "Elegí una neurona o una conexión, o empezá por uno de estos atajos." Los atajos siguen debajo, como hoy.
- **Una neurona:** "Mirá qué entrada aporta más a la suma. Apagala o cambiá un peso y mirá la decisión."
- **Una conexión:** "Valor por peso es el aporte. Cambiá el peso y mirá la neurona de la derecha."
- **Un choque:** "Mové el deslizador para ver qué decidió la red antes del choque."
- **Manejando vos:** "Manejá y mirá qué haría la red en cada situación."

"Más sobre esta pestaña" sigue plegado debajo de la tarjeta de consigna. Con la guía apagada no se ve la línea.

### D5. El choque se congela: caso, repetición y reintentar desde un cuadro (elegida)

| Opción | A favor | En contra |
|---|---|---|
| A. Como hoy: vuelve a empezar solo | Nada que hacer | El momento que más enseña se pierde en un segundo |
| **B. Se congela, con la tarjeta del caso, la repetición de 3 s y "Reintentar desde acá"** | El patrón de Reglas a mano (Art. 9); cierra el ciclo: buscar, cambiar y probar | Hay que poder volver el mundo a un cuadro guardado |
| C. Se congela solo con la guía encendida | El mentor no lo ve | Dos comportamientos de la simulación según una preferencia de ayuda, a contramano de *Interruptor de guía* |

**Elegí B.**
- **Memoria de cuadros:** `createReplayBuffer` pasa de `src/tabs/rules/case.js` a `src/tabs/shared/replay-buffer.js`; Reglas a mano lo importa de ahí. Inspeccionar guarda 180 cuadros (3 s a 60 por segundo). Cada cuadro guarda el estado para volver el mundo atrás, las entradas de la red, sus salidas y lo necesario para dibujar la escena.
- **La red de un cuadro guardado** se recalcula con las entradas guardadas y con la red con la que se calculó ese cuadro. Si la persona cambió la red después del choque, la repetición sigue mostrando la red de entonces y la tarjeta lo dice ("con la red de antes de tus cambios"). Los cambios rigen al reintentar. Es la opción honesta (Art. 7): la repetición muestra lo que pasó.
- **Volver el mundo a un cuadro:** `world.restore(state)` en el núcleo. Repone el tiempo, los pasos, el auto (posición, ángulo, velocidad, chocado), el progreso y lo que haga falta del primer agente. La prueba de núcleo es que, desde un estado restaurado, la simulación da los mismos cuadros que la original con el mismo controlador.
  - **Hipótesis:** el tráfico se recalcula con el tiempo y no necesita guardarse.
  - Si `traffic` tiene estado propio, se guarda también.
  - **Si restaurar exige tocar más de `world.js` y `traffic.js`, parar y consultar** (tarea 3.1).
- **La neurona que decidió:** en el cuadro elegido, la salida "decidida" es la acción encendida más cercana al choque (si hay varias, la de mayor valor). La neurona que "más aportó" es la de la última capa oculta con el mayor aporte positivo a esa salida (valor por peso). Sin capas ocultas, es la entrada con el mayor aporte. Es la misma cuenta que ya muestra la tarjeta de la neurona; no hace falta un criterio nuevo. La tarjeta lo dice con esas palabras ("aportó +0,82 a Izquierda") y "Elegir esta neurona" la elige.
- **Acción principal con el choque:** "Reintentar desde acá" (D7). "Reiniciar (R)" y "Elegir esta neurona" son secundarias.
- **Posición inicial del deslizador:** 1 s antes del choque. Desde el cuadro del choque, reintentar volvería a chocar enseguida. Lo dice la tarjeta.
- **Con la persona manejando:** el choque también se congela. Reintentar desde un cuadro sigue manejando la persona y la coincidencia vuelve a cero.

### D6. "Atrás" entre cuadros (elegida)

| Opción | A favor | En contra |
|---|---|---|
| A. Solo dentro del cuadro (hoy) | Nada que hacer | No se puede ir al cuadro anterior |
| **B. Al principio de un cuadro, "Atrás" vuelve al anterior, hasta 3 s** | Usa la misma memoria de D5; "Atrás" hace lo que promete | Al volver un cuadro y reproducir, el mundo sigue desde ahí: hay que guardar de nuevo desde ese punto |

**Elegí B.** Al volver al cuadro anterior, la cuenta se ve completa (como al pausar). Si se vuelve al cuadro N y después se avanza, los cuadros guardados después de N se descartan: la memoria es una línea, no un árbol. "Atrás" con la memoria vacía (recién reiniciado) no hace nada y su tooltip lo explica, como hoy.

### D7. Laboratorio: tres experimentos a la vista (elegida)

| Opción | A favor | En contra |
|---|---|---|
| A. Tres tarjetas grandes al entrar | Lo más claro | Un paso más antes de tocar nada; choca con "Compuertas al abrir" |
| **B. Tres opciones grandes en la barra, numeradas, con nombre y una línea** | Se ve que son tres experimentos y en qué orden, sin pasos de más | La barra de escenario del Laboratorio crece de alto (44 px de opción contra 32) |
| C. Subpestañas sobre la red | Lugar de sobra | Son tres datos distintos, no tres vistas de la red; se confunde con Diagrama/Pesos/Datos |

**Elegí B.**
- Textos: "Compuertas · resolvé a mano" / "Gates · solve by hand"; "Puntos · que aprenda sola" / "Points · let it learn"; "Tu manejo · que te imite" / "Your driving · let it copy you".
- El número va en un círculo, como en la barra de pestañas.
- Las opciones de cada experimento (AND/OR/XOR, formas, pista) siguen en la barra, a la derecha.

### D8. Compuertas: a mano primero (elegida)

| Opción | A favor | En contra |
|---|---|---|
| A. Reproducir es la principal (hoy) | Coincide con "la marcha es la acción principal" | Contradice la consigna |
| **B. Mientras se resuelve a mano no hay botón principal: las pastillas crecen y una marca señala la primera. Reproducir pasa a principal al resolver, al ver la solución o después de cinco cambios sin resolver** | La pantalla pide lo mismo que la consigna, y después lleva a backpropagation (*De la mano a backpropagation*) | Una pestaña sin acción principal durante un rato. *Una sola acción principal a la vista* dice "a lo sumo una", así que cero cumple |
| C. Un botón principal "Arrastrá un peso" que hace foco en la primera pastilla | Hay un principal | Un botón que no hace lo que dice; la acción real es arrastrar |

**Elegí B.**
- Pastillas: alto mínimo de 24 px, ▲ arriba y ▼ abajo dentro de la pastilla, y `cursor: ns-resize`.
- La marca "Arrastrá un peso ↕" es un globo junto a la primera pastilla de peso. Se ve con la guía encendida hasta el primer cambio a mano, y vuelve si se restablecen los datos.
- Al pasar Reproducir a principal, la consigna de la tarjeta pasa a "Ahora dejá que aprenda: tocá Reproducir o Paso".
- Con Puntos y Tu manejo, Reproducir es la principal desde el principio, como hoy.

### D9. Las acciones del panel del Laboratorio, enteras

"Reiniciar pesos", "Red de siempre" y "Guardar como cerebro" van en un renglón cada una, o de a dos si entran en el panel de 360. No se parten. Es lo mismo que pide *Panel sin desplazamiento lateral* en Competir.

## Rendimiento

- Guardar un cuadro por paso en Inspeccionar copia unos pocos números: el estado del auto, las entradas y las salidas. 180 cuadros son menos de 100 KB [Hipótesis]. Se mide el tiempo por cuadro antes y después, con la red más grande (20 sensores, tres capas de 16), en Chrome sin ventana.
- La escena grande dibuja más píxeles que la chica. Se mide igual que hoy la de El problema (mínimo 55 cuadros por segundo en la medida sustituta). Si baja de eso, parar y consultar.

## Risks / Trade-offs

- **La red al centro pierde ancho** (unos 30 px a 1440). Se mide que los nombres de las salidas se lean enteros y que la barra de la red quepa en un renglón a 680 px.
- **Cero acciones principales en Compuertas** durante la resolución a mano. Si `auditHierarchy()` exige una, se ajusta el auditor para ese estado. No se agrega un botón.
- **Reintentar desde acá** depende de `world.restore`. Si no es posible sin un cambio grande del núcleo, la alternativa es dejar solo la repetición (como en Reglas a mano) y "Reiniciar". La sub-sesión para y consulta antes de elegirla.

## Migration Plan

Sin datos que migrar. Las preferencias de anchos de Inspeccionar y del Laboratorio guardadas en el navegador ya no corresponden a las zonas. Se descartan si su forma no coincide y quedan los anchos por defecto.

## Open Questions

Ninguna que frene. Lo que decide el dueño al revisar: el texto de las líneas de guía y si "Reintentar desde acá" debería arrancar 1 s antes del choque o en el cuadro elegido. Elegí el cuadro elegido, con el deslizador empezando 1 s antes.
