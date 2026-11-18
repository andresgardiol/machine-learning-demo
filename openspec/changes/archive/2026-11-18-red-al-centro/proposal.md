# Proposal

## Why

Revisión de diseño de las cuatro pestañas que faltaban (18 de noviembre de 2026), después de Reglas a mano y Entrenar. Este cambio junta las dos pestañas de la red, Inspeccionar y Laboratorio, porque comparten la disposición (la red a la izquierda, ancha), la barra de controles sobre la red y la barra de reproducción. El otro cambio de la revisión es `manejo-amable-y-competir-sin-cortes`.

Lo observado, en las capturas del 17 de noviembre (`borradores/sistema-de-diseno/despues/07-*` y `08-*`, y `borradores/analisis-ux/`). La sub-sesión lo vuelve a medir en el antes:

- **Inspeccionar.**
  - Hay más de 20 controles alrededor de la red, en dos filas arriba y una abajo. Tres de ellos (Deshacer, Restablecer la red, Ver original) se ven sin acción hasta que se cambia algo.
  - La escena del auto mide unos 326×210 px, en el medio, sin controles de cámara. El dueño pidió poder acercarla y alejarla (*Zoom en la escena chica*, en `PENDIENTES.md`).
  - Al elegir una neurona, el texto de guía y "Por dónde empezar" desaparecen y no hay cómo volver.
  - Cuando el auto choca, el intento vuelve a empezar solo al momento. "Atrás" deshace solo dentro del cuadro, así que no hay forma de ver qué decidió la red antes del choque.
- **Laboratorio.**
  - Compuertas, Puntos y Tu manejo son tres experimentos distintos, pero se eligen con un selector chico ("Datos") en la esquina de la barra.
  - En Compuertas, la consigna pide mover los pesos, pero lo que destaca la pantalla es "Reproducir (espacio)". Las pastillas de los pesos miden unos 40×16 px y solo el tooltip dice que se arrastran.
  - Con Tu manejo, la escena también es chica y el centro queda casi vacío.
  - En español, "Reiniciar pesos", "Red de siempre" y "Guardar como cerebro" se parten en dos renglones.

**Concepto que hace visible.** Que una red es una cuenta que se puede seguir: con el auto a la vista, se puede volver atrás desde un choque hasta encontrar la neurona que lo decidió, cambiarla y probar de nuevo. Y que en el Laboratorio primero se resuelve a mano y después se deja aprender.

## What Changes

- **El mundo a la izquierda y la red al centro, en las dos pestañas.** La columna izquierda es lo que la red mira: en Inspeccionar, la escena del auto, de alto completo y con sus controles de cámara, con la decisión de la red debajo; en el Laboratorio, el plano con la tabla de verdad y las curvas, o la escena con Tu manejo. La red pasa al centro y sigue siendo la zona más ancha. El panel no cambia de lugar. Es la misma disposición que El problema, Entrenar y Competir: la escena siempre a la izquierda (Art. 9).
- **Una sola barra sobre la red, con tres grupos rotulados:**
  - **Vista:** Diagrama, Pesos y, en el Laboratorio, Datos; Flujo.
  - **Conexiones:** Todas, 5, 3 y 1; Resumir todas.
  - **Acercar:** −, + y Ver entera.

  Los cambios de prueba (cuántos hay, Deshacer, Restablecer la red y Ver original) salen de la barra. Pasan a una franja que aparece sobre la red solo cuando hay cambios. Sin cambios, no se ven.
- **La guía no desaparece.** Una línea de guía queda siempre arriba del detalle y cambia según lo que se mira: nada elegido, una neurona, una conexión o un choque. Con algo elegido, "Soltar" vuelve al panel sin nada elegido, con sus atajos.
- **El choque enseña (Inspeccionar).**
  - Al chocar, la reproducción se congela y aparece una tarjeta del caso debajo de la escena: a los cuántos metros, contra qué, qué decidió la red en ese cuadro y qué neurona aportó más a esa decisión. Un botón elige esa neurona.
  - Un deslizador sobre la escena recorre los últimos 3 segundos, cuadro por cuadro. La escena, la red, la decisión y la tarjeta muestran lo que se calculó en ese cuadro.
  - "Reintentar desde acá" vuelve a correr desde el cuadro elegido con la red de ahora, con los cambios de prueba incluidos. "Reiniciar (R)" vuelve a empezar desde la salida.
- **"Atrás" cruza cuadros.** Con la misma memoria de 3 segundos, "Atrás" al principio de un cuadro vuelve al cuadro anterior, y el auto vuelve a donde estaba.
- **Tres experimentos a la vista (Laboratorio).** La barra empieza con tres opciones grandes, numeradas, cada una con su nombre y una línea que dice para qué es: "1 Compuertas · resolvé a mano", "2 Puntos · que aprenda sola" y "3 Tu manejo · que te imite".
- **En Compuertas, primero a mano.**
  - Las pastillas de los pesos y del sesgo crecen a por lo menos 24 px de alto, con ▲▼ y cursor de arrastre.
  - Hasta el primer cambio, una marca "Arrastrá un peso" señala la primera pastilla.
  - "Reproducir" se ve como secundaria hasta que la compuerta se resuelve a mano, se usa "Ver una solución" o se hacen cinco cambios sin resolverla. Desde ahí pasa a ser la acción principal y la consigna invita a dejar que aprenda.
- **Las acciones del panel del Laboratorio no se parten** en español.
- **Capturas del antes y del después** de las dos pestañas, con un guion que se pueda volver a correr.

Fuera de alcance:
- la leyenda de la red (sigue en el panel, igual);
- el auto de Tu manejo que choca solo antes de que se toque nada;
- las fichas de peso encimadas en Puntos;
- comparar dos neuronas, historia de la actividad, mapas en Inspeccionar;
- el "Reintentar desde acá" con la persona manejando: reintenta, pero no lleva la cuenta de coincidencias desde ahí (vuelve a cero, como hoy al reiniciar);
- cambiar Competir, El problema, Reglas a mano o Entrenar.

**Filtro de entrada**

1. *¿Qué concepto hace visible?* Que la decisión de la red es una cuenta reproducible: se puede volver al cuadro del choque, ver qué neurona empujó la decisión, cambiarla y comprobar si el auto se salva. En el Laboratorio, que ajustar pesos a mano es lo mismo que hace el aprendizaje, más despacio.
2. *¿Se entiende sin que nadie lo explique?* La tarjeta del choque dice qué pasó y qué tocar ("Elegir esta neurona", "Reintentar desde acá"). Los experimentos dicen para qué sirven y en Compuertas la marca señala la pastilla que hay que arrastrar.
3. *¿El mentor puede ignorarla u ocultarla?* La línea de guía y la marca de "Arrastrá un peso" se ocultan con la guía. La tarjeta del choque no, porque es el estado del auto. Se cierra con Reiniciar (R) o con "Reintentar desde acá".
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* Reintentar desde un cuadro no toca el cerebro guardado ni los cambios de prueba. Reiniciar vuelve a la salida. Los cambios se deshacen con Deshacer o Restablecer, que siguen igual, solo que aparecen cuando hay algo que deshacer.

**Público.** Al principiante le da el auto grande, una guía que no se va y un camino claro en cada experimento. Al mentor le da el choque como caso para la clase, sin tener que buscar el momento, y los mismos atajos de siempre.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `estructura-app`: *Disposición común* con el mundo a la izquierda y la red al centro en Inspeccionar y en el Laboratorio.
- `pestana-inspeccionar`: disposición y anchos; la escena con cámara; la barra de la red en grupos; los cambios de prueba solo con cambios; la guía que no desaparece; el caso del choque, la repetición, la neurona que decidió y reintentar desde un cuadro; "Atrás" entre cuadros.
- `pestana-laboratorio`: disposición; los tres experimentos; las perillas grandes y "a mano primero" en Compuertas; los cambios a mano solo con cambios; la escena de Tu manejo con cámara.
- `jerarquia-visual`: la acción principal de Compuertas mientras se resuelve a mano y la del choque en Inspeccionar.
- `vista-escenario`: la escena chica deja de usarse en Inspeccionar y en el Laboratorio.

## Impact

- `src/tabs/inspect/index.js`, `playback.js` y `card.js`; `src/tabs/lab/index.js` y `session.js`: dónde se montan las zonas, la barra de la red y la franja de cambios.
- `src/render/network-view.js` o donde se arma la barra de controles de la red, que comparten las dos pestañas.
- `src/core/world.js`: poder volver el mundo a un estado guardado (D5). El tráfico ya es función del tiempo.
- `src/tabs/rules/case.js`: `createReplayBuffer` pasa a `src/tabs/shared/` para usarlo en Inspeccionar.
- `src/ui/layout` o el módulo de anchos, y `styles/app.css`.
- `src/i18n/es.js` y `en.js`: rótulos de los grupos, experimentos, tarjeta del choque, línea de guía y marca de arrastre.
- Pruebas: disposición, acción principal, búfer de cuadros, volver el mundo atrás (núcleo), determinismo de reintentar.
- Ninguna dependencia nueva. Toca el bucle de Inspeccionar: guardar un cuadro por paso (ver *Rendimiento* en `design.md`).
