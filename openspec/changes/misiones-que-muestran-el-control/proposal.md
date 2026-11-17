# Proposal

## Why

El análisis de UX del 17 de noviembre de 2026 (`borradores/analisis-ux/informe.md`, P4) encontró que las misiones, que son lo que invita a probar algo distinto, no llevan al control que hay que tocar. "Probá otra función de fitness" está en la vista de entrenamiento, y el selector, en otra vista y abajo de todo. `tarjeta-de-consigna` ya subió la misión en curso al principio del panel. Falta que, desde ahí, quien llega solo encuentre con qué se cumple. Este cambio va antes del recorrido guiado, que se va a apoyar en este mismo mecanismo de "mostrar un control".

**Concepto que habilita.** Cada misión hace visible un concepto: ver como la máquina, la función de fitness, la generalización a una pista nueva, la cuenta de una neurona, la capa oculta para XOR o el sobreajuste. "Mostrame" une ese concepto con el control que lo pone en juego. Es infraestructura didáctica: no agrega un concepto de ML nuevo.

## What Changes

- **Un botón "Mostrame"** junto a la misión en curso de la tarjeta de consigna, solo si esa misión tiene un control para tocar. No va en la lista de misiones de abajo. Lo decidió el dueño el 17 de noviembre de 2026, para no sumar información.
- **Qué hace al tocarlo** (también decisión del dueño):
  - trae el control a la vista: cambia de vista del panel si hace falta (por ejemplo, a Ajustes en Entrenar) y desplaza hasta él;
  - lo marca con un anillo quieto durante unos segundos, sin parpadear;
  - le pasa el foco del teclado.
- **Las misiones sin un control para tocar no tienen botón**: manejar ("Superá 5 vehículos sin chocar", "Recorré 500 m sin chocar") y esperar a que aprenda ("Llegá a la generación 5", "Un auto que supere 5 vehículos"). La consigna ya dice qué hacer.
- **Para cada misión con control, cuál resalta.** Es una tabla fija, una fila por misión, en la spec.
- **En Inspeccionar**, dos misiones necesitan una neurona elegida para que su control exista: "Cambiá una decisión a mano" (una entrada) y "Apagá una neurona y mirá" (Apagar). Ahí "Mostrame" elige primero esa neurona y después resalta el control. Es el único caso en que cambia algo además de la vista, y se deshace soltando la elección.
- **Capturas del antes y del después** con un mismo guion. El antes se saca sobre `238b645`.

Fuera de alcance:
- un globo con texto junto al control (el dueño eligió no sumar textos);
- "Mostrame" en la lista de misiones;
- misiones nuevas o cambios en cómo se cuentan;
- el recorrido guiado;
- la revisión del sistema de diseño con `/design:design-critique` y `/design-skills:interaction-design`, que va después de este cambio (en `PENDIENTES.md`).

**Filtro de entrada**
1. *¿Qué concepto hace visible?* El de cada misión, unido al control que lo pone en juego. Por ejemplo, "Probá otra función de fitness" lleva al selector y deja ver que qué se premia decide qué aprende la población.
2. *¿Se entiende sin que nadie lo explique?* "Mostrame" es una palabra común, está pegado a la misión y lleva al control con un anillo y el foco.
3. *¿El mentor puede ignorarla u ocultarla?* Sí. Va en la tarjeta, junto a la misión, y se oculta con la guía. No hace nada si nadie lo toca.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* No cambia ningún ajuste ni la simulación. Como mucho cambia de vista del panel o, en Inspeccionar, elige una neurona; se vuelve atrás con la vista anterior o soltando la elección. El anillo se va solo.

**Público.** Sirve al principiante que llega solo: la misión le dice qué probar y "Mostrame", dónde. El mentor no lo necesita y lo oculta con la guía, junto con la tarjeta.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `consigna-de-pestana`: se suman requisitos. "Mostrar el control de la misión" fija dónde va el botón y cuándo aparece. Uno por pestaña ("Controles de las misiones de …") lleva su tabla de misión y control. "Cómo se muestra un control" fija que lo trae a la vista, el anillo quieto, el foco y que no cambia nada.

## Impact

- `src/tabs/shared/consigna-card.js`: el botón "Mostrame" en la línea de la misión.
- Un módulo nuevo, sin DOM, con la tabla de cada misión y su control. Otro, con DOM, que trae a la vista, marca y pasa el foco.
- `src/tabs/*/index.js`: cada pestaña dice dónde está cada control y, en Entrenar, cómo cambiar de vista; en Inspeccionar, cómo elegir la neurona.
- `src/i18n/es.js` y `en.js`: "Mostrame", su tooltip y el texto accesible que dice qué control se mostró.
- `styles/app.css`: el anillo, con menos movimiento respetado.
- Pruebas: la tabla (cada misión con control lo tiene, y las demás no) y el botón en los dos idiomas.
- Sin dependencias nuevas ni cambios en el núcleo ni en los datos guardados.
- `borradores/misiones-que-muestran-el-control/`: el guion de capturas, `antes/` y `despues/`.
