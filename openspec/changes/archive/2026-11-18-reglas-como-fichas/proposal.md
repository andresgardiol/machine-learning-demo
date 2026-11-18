# Proposal

## Why

En Reglas a mano, quien llega solo tiene que escribir una sintaxis antes de poder pensar en reglas. Los errores de sintaxis están muy bien explicados, pero son una barrera que no tiene que ver con el concepto. Además, afinar un número (¿0,2 o 0,3?) exige escribirlo, mirar el auto y volver a escribir. No se ve contra qué valor se compara.

Este es el cambio 3 de los tres acordados para Reglas a mano. Se apoya en los anteriores:
- `sistema-de-diseno-base`: los roles *entra*, *decide* y *sale*, y los estados *se cumple* y *choque*;
- `reglas-mesa-de-trabajo`: las filas que insertan su comparación;
- `reglas-el-choque-ensena`: el caso del choque, "Tu programa" y la regla para el caso.

**Concepto que hace visible.** Que una regla escrita a mano es una comparación entre lo que percibe un sensor y un umbral que eligió una persona. En la ficha se ve a la vez el umbral y el valor en vivo del sensor, así que se ve cuándo la regla va a cumplirse antes de que se cumpla. Y que no escala: con 20 sensores, la pila de fichas desborda el tablero.

## What Changes

Decisiones del dueño (18 de noviembre de 2026):

- **Una segunda vista del mismo programa, con fichas, que es la que se abre por defecto.** Cada regla es una fila:

  `si [sensor3 ▾] [> ▾] [0,20 ───●───] entonces [girar izquierda ▾]`

  El riel del número dibuja en vivo el valor del sensor. "Ver como texto" muestra el editor de hoy, y la vista elegida se recuerda. **El texto sigue siendo la fuente de verdad**: lo que se cambia en las fichas se escribe en el texto, y exportar, importar, los ejemplos, la comparación y "Tu programa" no cambian.
- **Qué cubren las fichas:** las órdenes sueltas, las constantes y las reglas con una o varias comparaciones unidas por "y", con una o varias acciones. Lo demás (`o`, `no`, paréntesis, comentarios dentro de una regla) se muestra como una **ficha "escrita a mano"** con su texto, que se edita en la vista de texto. Los tres ejemplos y el programa inicial entran enteros en fichas.
- **Qué se puede hacer:**
  - cambiar el sensor, el operador y el número (con un deslizador);
  - agregar y borrar reglas, con deshacer;
  - reordenarlas arrastrando, con una alternativa de teclado;
  - mover las constantes, que van arriba de todo como deslizadores: al moverlas cambian todas las reglas que las usan.
- **Lo que ya existe sigue andando en la vista de fichas:**
  - la ficha que se cumple se enciende con el estado "se cumple";
  - con un choque, las fichas que se cumplían quedan con el estado "choque";
  - una fila de la columna de percepción agrega una ficha nueva con esa comparación;
  - "Escribir una regla para este caso" agrega una ficha con la condición del choque y la acción para elegir;
  - "Mostrame" marca las fichas.
- **La paleta** solo se muestra en la vista de texto, porque en la de fichas no sirve.
- **Capturas del antes y del después** con el guion de `reglas-el-choque-ensena`.

Fuera de alcance:
- fichas para `o`, `no` y paréntesis (bloques anidados);
- arrastrar palabras sueltas, al estilo de un editor de bloques;
- otras pestañas;
- cambiar el lenguaje de reglas.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* Que cada regla compara una lectura con un umbral elegido a mano, y que hacen falta muchas para cubrir los casos.
2. *¿Se entiende sin que nadie lo explique?* La ficha se lee como una oración ("si sensor3 > 0,20 entonces girar izquierda"), y el punto que se mueve sobre el riel muestra el sensor contra el umbral.
3. *¿El mentor puede ignorarla u ocultarla?* "Ver como texto" deja la pestaña como hoy, y la vista elegida se recuerda.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* En las fichas no se pueden cometer errores de sintaxis. Lo único incompleto posible es una regla sin acción, que se marca y no maneja. Cada cambio se deshace con Ctrl+Z, igual que en el texto, porque es el mismo historial. Restablecer el programa vuelve al programa inicial.

**Público.** El principiante empieza sin sintaxis y afina números mirando el sensor en vivo. El mentor pasa al texto con un toque cuando quiere mostrar que eso es programar.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `pestana-reglas`:
  - la vista de fichas y lo que se puede hacer en ella;
  - la tarjeta del programa con dos vistas;
  - la paleta solo en la vista de texto;
  - la inserción desde las barras y la regla para el caso, que agregan fichas;
  - el resaltado en las fichas.
- `consigna-de-pestana`: "Mostrame" de las dos primeras misiones marca el programa (las fichas o el editor, según la vista).

## Impact

- `src/tabs/rules/`: un módulo nuevo de fichas. Tiene una proyección del texto a fichas, por línea, con el `tokenize` de `src/core/rules.js` y sus posiciones; y la escritura de cada cambio como un parche del texto, por el historial de deshacer del editor.
- `src/ui/editor.js`: el camino de deshacer compartido y el cambio de vista.
- `src/tabs/rules/index.js`: el cambio de vista; la paleta solo en el texto; la inserción y la regla para el caso cuando la vista es la de fichas.
- `src/ui/preferences.js`: la vista recordada.
- `src/i18n/es.js` y `en.js`: los textos y las ayudas de los controles nuevos.
- Pruebas sin DOM: la proyección (qué entra en fichas y qué queda escrito a mano); que ida y vuelta texto → fichas → texto sin cambios deje el texto igual; y los parches (cambiar el número, el sensor, el operador y la acción, agregar, borrar, reordenar y mover una constante) sin tocar comentarios ni otras líneas.
- Sin dependencias nuevas ni cambios en el núcleo de la simulación ni en el lenguaje.
- `borradores/reglas-como-fichas/`: el antes, el después y la comparación.
