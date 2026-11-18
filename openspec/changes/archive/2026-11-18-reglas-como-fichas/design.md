# Design

## Context

Medido en el código después de `reglas-el-choque-ensena` (commit `cc8661e`):

- **El lenguaje** (`src/core/rules.js`, sin DOM):
  - `tokenize(línea)` da los tokens de una línea con sus posiciones (`start` y `end`), sus tipos (palabra, sensor con su índice, número, comparador, comentario) y el número ya leído;
  - `classifyLine` dice qué es cada línea;
  - `parseProgram(texto, { sensors })` da las reglas con sus números de línea, o los errores con su línea.
- **El editor** (`src/ui/editor.js`) es un `textarea` con resaltado por línea, historial de deshacer e inserción en el cursor, que ya usan la paleta, las filas de la columna y la regla para el caso.
- **Las líneas que se cumplen** llegan por cuadro como números de línea, y se marcan con `data-state="holds"`. Las del choque, con `data-state="crash"`. La repetición entrega las del cuadro elegido.
- **La tarjeta del programa** tiene la cabecera en dos renglones, la comparación plegable, el editor, que ocupa el alto que queda, y la paleta. A 1366×768 el editor muestra 15 líneas.
- **Los tres ejemplos y el programa inicial** usan órdenes sueltas, constantes y reglas con "y". Se revisa en la tarea 2.1 que ninguno use `o`, `no` ni paréntesis.

## Goals / Non-Goals

**Goals:**
- Que el texto sea la única fuente de verdad, con un solo historial de deshacer para las dos vistas.
- Que cada cambio en una ficha toque solo las líneas de esa regla, sin reformatear el resto.
- Que la proyección y los parches sean funciones puras, probadas sin DOM.

**Non-Goals:**
- Un modelo de bloques anidados.
- Fichas para `o`, `no` y paréntesis.
- Editar comentarios desde las fichas.

## Decisions

### D1. La proyección: del texto a las fichas

**`projectCards(texto, idioma)`** es una función pura que agrupa las líneas en bloques y devuelve una lista ordenada:

- `{ kind: 'constant', name, value, line }`: una constante con un valor de 0 a 1;
- `{ kind: 'order', actions, line }`: una orden suelta;
- `{ kind: 'rule', conditions: [{ left, op, right }], actions, lines: [desde, hasta] }`: una regla. `left` es un dato (sensor o `velocidad`); `right` es un número, una constante o un dato;
- `{ kind: 'note', text, line }`: un comentario suelto o una línea vacía de separación. Se dibuja como nota;
- `{ kind: 'manual', text, lines }`: lo demás.

**Una regla es ficha** si su condición es una o varias comparaciones `dato op valor` unidas solo por `y`, sin `o`, `no`, paréntesis ni comentarios dentro, y si sus acciones están en la misma línea o en las líneas con sangría que siguen. Si no, es `manual`.

**El texto con errores** de sintaxis se proyecta igual, línea por línea: lo que no se puede leer queda `manual`, y la tarjeta muestra el mensaje de error de siempre arriba de las fichas. Así nunca se pierde nada al cambiar de vista.

### D2. Los parches: de una ficha al texto

Cada edición es una función pura **`patch(texto, edición) → { texto, cursor }`**. Toca el rango de caracteres de un token, no reescribe la línea:

| Edición | Qué hace |
|---|---|
| `setNumber` | escribe el número con dos decimales y el separador del idioma activo |
| `setOperand` | cambia el dato |
| `setOperator` | cambia el comparador |
| `setAction` | cambia una acción |
| `addRule` | agrega `si sensor1 > 0,50 entonces` en una línea nueva al final |
| `deleteRule` | borra las líneas de la regla |
| `moveRule` | mueve el bloque de líneas arriba o abajo de otro bloque, sin partir las sangrías |
| `setConstant` | cambia el número de la definición |

Las palabras nuevas se escriben en el idioma activo. Las que ya estaban no se traducen.

El resultado pasa por **el mismo camino que la paleta** (`replaceRange` en el editor), así que cada edición es un paso del historial de deshacer, y Ctrl+Z en cualquier vista lo deshace.

**El arrastre del número** escribe al soltar y, mientras se arrastra, cada 100 ms como mucho. Así el auto responde en vivo sin llenar el historial: varios pasos de un mismo arrastre se juntan en uno.

*Por qué parches por token y no regenerar el texto desde las fichas:* regenerar perdería comentarios, espacios y el idioma de cada palabra. La spec pide que ida y vuelta deje el texto igual.

### D3. La ficha en pantalla

- **Disposición:** una fila de 44 px como mínimo. Lleva un asa (⋮⋮) a la izquierda, "si", las comparaciones, "entonces", las acciones y un botón de borrar (terciario, ✕) a la derecha.
- **Comparaciones:** cada una tiene el selector del dato, con el color de "entra"; el del operador; y el umbral: un deslizador de 120 px, de 0 a 1 con paso 0,01, con el número escrito al lado y editable.
  - Sobre el riel se dibuja, en vivo, una marca del color de "entra" con el valor del dato.
  - Si el umbral es una constante, se ve su nombre y su valor, y moverlo mueve la constante (D5).
  - Si el umbral es otro dato, se ve otro selector, sin riel.
- **Acciones:** un selector por acción, con el estilo de "sale". "+ acción" agrega otra, como menú terciario.
- **Varias comparaciones:** se ven unidas por "y", y el ancho manda. Si no entra en una fila, la ficha pasa a dos renglones.
- **Controles:** los selectores son `<select>` nativos con el estilo de la app (contorno de control y foco), para no inventar un menú.
- **Estados:** se cumple, choque, error (incompleta) y la nota de escrita a mano, con las formas de `sistema-de-diseno`.
- **El valor en vivo** se lee de la última percepción que ya usa la columna, en el mismo cuadro. No se agrega ningún cálculo al bucle.
- **Las constantes** van arriba de todo en una fila de deslizadores (D5). Las notas son líneas de texto atenuado.

### D4. Cambio de vista y preferencia

- Un segmento "Fichas | Texto" va en la cabecera del programa, en el lugar del título "Programa" o junto a él. Se recuerda en `mlLab.rules.programView`.
- Por defecto se abre en fichas, también cuando no hay almacenamiento.
- La paleta solo existe en la vista de texto. En la de fichas no ocupa lugar, según la regla de ocultar lo que no sirve.
- "Editar como texto", en una ficha escrita a mano, cambia a texto y pone el cursor en su primera línea.
- **La inserción desde la columna de percepción y la regla para el caso**, en la vista de fichas, usan `addRule` con la condición armada, y enfocan el selector de la acción.
- **"Mostrame"** marca la lista de fichas o el editor, según la vista.

### D5. Constantes

- La definición `nombre = número` con un valor de 0 a 1 se ve como un deslizador con su nombre, en una fila de constantes arriba de todo.
- Al moverlo, `setConstant` cambia solo ese número, y todas las fichas que usan la constante mueven su umbral.
- Las constantes fuera de ese rango son `manual`. No pasa con los ejemplos de hoy.

### D6. Reordenar

- **Arrastre:** HTML5 drag and drop desde el asa, sin librerías, con una línea guía donde va a caer.
- **Teclado:** el asa es un botón que recibe el foco; Alt+flecha arriba y abajo hacen `moveRule`, y el foco sigue en el asa.
- **Límites:** no se puede soltar una regla en el medio de otra. Las notas se mueven con la regla que tienen abajo, si están pegadas a ella.
- **Lector de pantalla:** el asa anuncia "Mover regla N de M".

### D7. El error al arrastrar una constante (revisión del dueño, 18 de noviembre de 2026)

**Lo que pasó (observado por el dueño):** al arrastrar el deslizador de una constante, el texto quedó como `cerca = 0,24costado = 0,5`, con dos definiciones pegadas. Aparecieron muchos errores y la pestaña se detuvo con "Algo falló".

**Hipótesis, a confirmar con una prueba que lo reproduzca:** `placeOf` lee el lugar del token de la proyección a la vista (`cards`). Mientras se arrastra, `onPreview` cambia el texto, pero esa proyección no se recalcula. Si el número viejo era más largo que el nuevo (pasar de "0,24" a "0,3"), el rango viejo se come el salto de línea.

**Corrección:**
- todo parche resuelve su lugar contra el texto actual: vuelve a proyectar, o ubica el token por línea y orden, y nunca usa columnas guardadas;
- antes de escribir, comprueba que el rango contiene el tipo de token esperado (un número). Si no, vuelve a proyectar y reintenta una vez; si sigue sin coincidir, no escribe nada;
- un parche nunca lanza una excepción;
- la pestaña no se detiene por un error de una ficha: el error se registra y la ficha se vuelve a dibujar.

Pruebas: una secuencia al azar, con semilla, de cientos de arrastres de constantes y umbrales con valores de distinto largo deja el texto válido y con las mismas líneas; y el caso exacto del dueño.

### D8. Más lugar para las fichas (revisión del dueño, 18 de noviembre de 2026)

**Lo que pidió:** "Están redundantes los ejemplos, salen dos veces: arriba en Ejemplos y en el listado con el botón Probar. Me gustó el listado, pero le está quitando mucho espacio a las reglas, que están interesantes con ese estilo Scratch."

**Medido en la tarea 5.2:** a 1366×768, con la guía, la pila de fichas mide 290 px. Con el ejemplo de 20 sensores entra entera una sola ficha. Las fichas de dos comparaciones ocupan dos renglones.

**Decisiones:**
1. **Un solo lugar para los programas.** Los botones "Ejemplos" se reemplazan por la **franja de programas**, en el mismo renglón que los sensores: una ficha chica por programa ("Tu programa" cuando lo hay, "3 cortos", "7 sensores" y "20 sensores"), con su cifra de superados al lado cuando ya está calculada ("…" mientras tanto). Lleva el estilo de opción elegida en el que maneja, y un toque lo prueba. La comparación se calcula sola, por tramos, al abrir la pestaña y cada vez que cambian el tráfico o la velocidad.
2. **La tabla completa, cerrada por defecto y flotante.** "Tabla" (acción terciaria, en lugar de "Comparar") o la acción principal del choque la abren como un panel sobre la pila de fichas, sin correrla. Se cierra con Escape, con "Ocultar" o al probar un programa, y el foco vuelve a donde estaba. *Alternativa descartada:* dejarla en el flujo, que es como estaba y quitaba unos 200 px.
3. **Fichas en un renglón.**
   - Controles compactos, de 24 px, como barra densa.
   - El deslizador baja de 120 a 88 px.
   - El número deja de ser una caja aparte: se lee al lado del deslizador y se edita con un toque o con Enter.
   - Los selectores se angostan al largo de su palabra.
   - Objetivo: que una regla de dos comparaciones entre en un renglón a 1366.
4. **Constantes en un renglón:** fichas chicas con un deslizador de 64 px cada una.
5. **Menos renglones fijos:**
   - "Sin errores · N reglas" se va: la cuenta ya está en la cabecera ("Reglas 7") y el error se muestra solo cuando lo hay;
   - el texto de ayuda de abajo ("Cada ficha es una regla…") pasa a la ayuda del segmento "Fichas";
   - "Agregar regla" pasa a ser la última ficha de la pila, con un estilo de ficha vacía;
   - los comentarios seguidos se juntan en una sola nota.

**Objetivo medible:** a 1366×768, con la guía y el ejemplo de 7 sensores, se ven al menos 4 fichas de regla enteras (escenario "Lugar para las fichas").

## Risks / Trade-offs

- [Las fichas pueden hacer sentir que esto no es programar (etapa "programalo")] → El texto está a un toque y es la fuente de verdad. Además, cada ficha se lee como el texto que escribe.
- [El arrastre del número llena el historial de deshacer] → Se juntan los pasos de un mismo arrastre (D2).
- [Fichas de varias comparaciones en un tablero de unos 850 px] → Pasan a dos renglones. Se mide con el ejemplo de 20 sensores a 1366×768.
- [El valor en vivo sobre muchos rieles puede costar fluidez] → Se actualiza solo la posición de una marca por riel, con `transform`. Se mide con el ejemplo de 20 sensores.
- [Con el texto en un idioma y la app en otro, las fichas mezclan palabras] → Las fichas muestran lo que dice el texto. Las palabras nuevas van en el idioma activo, como permite el lenguaje ("Idiomas mezclados").

## Migration Plan

Sin datos que migrar. La preferencia nueva arranca en fichas. Vuelta atrás: revertir el módulo de fichas, el cambio de vista y la preferencia. El texto de los programas no cambia de formato.
