# Design

## Context

Motivación y alcance: ver proposal.md.

Lo que ya existe y este cambio reutiliza:

- **Contrato de controlador** (`src/core/controller.js`): `control(perception)
  -> { forward, reverse, left, right }`, con `perception = { sensors, speed
  }`. El mundo (`src/core/world.js`) acepta cualquier objeto que lo cumpla y
  anula los controles opuestos.
- **Pestaña 1** (`src/tabs/drive/`): mundo de un auto, sesión con distancia,
  vehículos superados y mejor distancia (`session.js`), ajustes de calle y
  sensores (`settings.js`), y en `index.js` las tarjetas de percepción y de
  acción, la sección avanzada y el mensaje de choque.
- **Tablero** (`src/ui/board.js`): `statStrip` y `boardCard`.
- **Atajos** (`src/ui/shortcuts.js`): ya se ignoran cuando el foco está en un
  campo de texto (`isTypingTarget`).

Decisiones del dueño del proyecto: el programa se escribe como texto, con
ayudas; el editor va en el tablero; la pestaña recuerda un solo programa, con
exportar e importar.

**Qué se midió antes de diseñar.** Sin navegador, con un intérprete de
descarte que ejecuta el texto de cada programa (los cuatro están en D10), dos
minutos como máximo por intento, con 3 carriles, densidad e irregularidad del
50 % y 20 m/s. Cada celda es distancia y vehículos superados:

| Programa | Sensores | Semilla 2 | Semilla 1 | Semilla 3 | Semilla 4 | Semilla 5 |
|---|---|---|---|---|---|---|
| Inicial (1 regla) | 5, de 3 largos, 90° | 82 m, 1, borde | 67 m, 0 | 742 m, 10 | 267 m, 5, borde | 206 m, 4 |
| Tres sensores (1 regla) | 3, de 2 largos, 60° | 1224 m, 0, sin chocar | 1225 m, 0, sin chocar | 1563 m, 10, sin chocar | 1312 m, 4, sin chocar | 1297 m, 4, sin chocar |
| Siete sensores (5 reglas) | 7, de 3 largos, 90° | 1041 m, 14 | 844 m, 9 | 1225 m, 21 | 483 m, 8 | 1396 m, 26 |
| Veinte sensores (9 reglas) | 20, de 3 largos, 120° | 290 m, 4 | 759 m, 7 | 746 m, 10 | 944 m, 14 | 1719 m, 32 |

Los de siete y veinte sensores chocan en todas las semillas dentro de los dos
minutos (en las semillas 6 y 7: 66 m y 213 m el de siete; 66 m y 542 m el de
veinte).

Conclusiones de la medición:

- Con la semilla 1, que es la de la pestaña 1, una regla sobre el sensor del
  frente no cambia nada: el primer vehículo queda fuera del rayo central
  hasta que es tarde. Con la semilla 2 se ve en segundos: el programa inicial
  esquiva al primer vehículo y choca contra el borde a los 82 m.
- Frenar cuando hay algo adelante, con tres sensores cortos, no choca nunca
  y no pasa a nadie: es lo mismo que aprenden hoy las redes de la pestaña
  Entrenar.
- Cinco reglas con siete sensores superan 14 vehículos. El auto puede pasar
  al tráfico con estos sensores y estas velocidades; lo anotado en
  PENDIENTES.md sobre la fitness no es un límite del auto.
- Con veinte sensores, nueve reglas que usan 18 de los 20 manejan peor que
  cinco reglas con siete. Más datos no dan un programa mejor: dan más reglas
  que escribir y más formas de equivocarse.

El intérprete de descarte no es el del producto. Las tareas piden repetir la
medición con el real.

## Goals / Non-Goals

**Goals:**

- Un lenguaje tan chico que su vocabulario entero entre en una paleta, con
  análisis y ejecución en el núcleo, sin DOM y deterministas.
- Que un texto con errores nunca deje la pestaña sin funcionar.
- Editor sin dependencias, con edición nativa (deshacer, selección, teclado
  del sistema).
- Reutilizar de la pestaña 1 todo lo que es igual, sin duplicarlo ni cambiar
  su comportamiento.

**Non-Goals:**

- Un lenguaje de propósito general: sin variables, memoria, cuentas, bucles
  ni `sino`.
- Un editor de código completo: sin autocompletar, búsqueda ni plegado.
- Ejecutar programas en otras pestañas (el controlador queda listo para
  cuando haga falta).
- Arreglar la fitness automática de Entrenar.

## Decisions

### D1. El lenguaje vive en el núcleo (`src/core/rules.js`)

```js
export const RULES_LIMITS = { lines: 200 };
export const VOCABULARY;   // palabras por papel y por idioma (D2)

parseProgram(text, { sensors })   // sensors: cantidad de sensores del auto
  // -> { ok: true,  program, rules, constants, lines }
  // -> { ok: false, errors: [{ line, code, details }] }

runProgram(program, perception)
  // -> { controls: { forward, reverse, left, right }, activeLines: number[] }

classifyLine(text)
  // -> [{ start, end, kind }]   kind: keyword | action | data | name | number | operator | comment

createRulesController({ program } = {})
  // -> { control(perception), setProgram(program | null), controls, activeLines, program }
```

- `program` es un dato plano: `{ lines, rules, constants, statements }`.
  `constants` es la lista `[{ name, value, line }]`, en orden. Cada sentencia
  es `{ kind: 'action', line, control }` o `{ kind: 'rule', line, condition,
  actions: [{ line, control }] }`. La condición es un árbol de `{ op: 'or' |
  'and' | 'not' | '>' | '<' | '>=' | '<=', ... }` con hojas `{ sensor: i }`,
  `{ speed: true }` y `{ number: n }`. Una constante se resuelve al analizar:
  en el árbol queda su número, así ejecutar no busca nombres.
- `runProgram` recorre las sentencias una vez, sin recursión sobre el
  programa (solo sobre el árbol de cada condición), y no guarda nada.
- El controlador cumple el contrato; `control()` devuelve los controles y
  deja en `controls` y `activeLines` lo del último paso, que es lo que la
  pestaña dibuja. Sin programa, devuelve `NO_CONTROLS`.
- `classifyLine` usa el mismo analizador léxico que `parseProgram`, así el
  color del editor nunca contradice lo que el lenguaje entiende. Toda palabra
  que no es del vocabulario se clasifica como `name`: si es una constante
  definida o un error lo dice el análisis del programa completo.

*Alternativa descartada:* evaluar el texto como JavaScript. Rompe el
determinismo y la seguridad, no permite explicar errores en lenguaje llano y
no deja saber qué línea se cumple.

### D2. Gramática y vocabulario

```
línea       = [sangría] [ constante | regla | acciones ] [ "#" comentario ]
constante   = NOMBRE "=" número
regla       = SI condición ENTONCES [ acciones ]
acciones    = acción { ("," | Y) acción }
acción      = AVANZAR | RETROCEDER | [GIRAR] IZQUIERDA | [GIRAR] DERECHA
condición   = término { O término }
término     = factor { Y factor }
factor      = NO factor | "(" condición ")" | comparación
comparación = valor (">" | "<" | ">=" | "<=") valor
valor       = número | SENSOR | VELOCIDAD | NOMBRE
NOMBRE      = letra { letra | dígito | "_" }   (que no sea palabra del vocabulario)
SENSOR      = "sensor" [espacio] dígitos
número      = ["-"] dígitos [ ("," | ".") dígitos ]
```

| Papel | Español | Inglés |
|---|---|---|
| SI | `si` | `if` |
| ENTONCES | `entonces` | `then` |
| Y | `y` | `and` |
| O | `o` | `or` |
| NO | `no` | `not` |
| AVANZAR | `avanzar` | `forward` |
| RETROCEDER | `retroceder` | `reverse` |
| GIRAR | `girar` | `turn` |
| IZQUIERDA | `izquierda` | `left` |
| DERECHA | `derecha` | `right` |
| VELOCIDAD | `velocidad` | `speed` |
| SENSOR | `sensor` | `sensor` |

- Sin distinguir mayúsculas. Los dos idiomas valen siempre y se pueden
  mezclar.
- La coma es decimal dentro de un número (dígito, coma, dígito, sin espacios)
  y separa acciones después de `entonces`; no hay conflicto porque los
  números solo aparecen en la condición.
- **Constantes:** se definen sin sangría, una por línea, y valen desde la
  línea siguiente hasta el final. El nombre no distingue mayúsculas (`Cerca`
  y `cerca` son la misma), admite letras con tilde y `ñ`, y no puede ser una
  palabra de la tabla en ninguno de los dos idiomas ni `sensor` seguido de un
  número. El valor es un número; una constante no puede nombrar a un sensor
  ni a otra constante.
- **Sangría:** una línea que empieza con un espacio o una tabulación es una
  línea con sangría. Solo puede tener acciones, y pertenece a la regla más
  cercana de arriba. Los comentarios y las líneas vacías no cortan el bloque;
  una línea sin sangría sí. Una regla puede tener acciones en su propia línea
  y también debajo.

### D3. Errores

Cada error es `{ line, code, details }`. El análisis no se detiene en el
primero: informa a lo sumo uno por línea, en orden.

| Código | Cuándo | Detalles |
|---|---|---|
| `unknownWord` | palabra que no es del lenguaje | `word`, `suggestion` (o `null`) |
| `unexpectedWord` | palabra del lenguaje fuera de lugar (por ejemplo `entonces` sin `si`) | `word` |
| `missingThen` | hay condición y no hay `entonces` | |
| `missingCondition` | `si` seguido de `entonces` o de nada | |
| `noAction` | regla sin ninguna acción, ni en su línea ni debajo | |
| `incompleteComparison` | falta un valor o el signo | |
| `badNumber` | número mal escrito | `text` |
| `unclosedParenthesis` | falta cerrar o sobra un paréntesis | |
| `indentWithoutRule` | línea con sangría sin regla arriba | |
| `unknownSensor` | sensor que el auto no tiene (o `sensor0`) | `sensor`, `count` |
| `tooLong` | más de 200 líneas (se informa en la línea 201) | `max` |
| `duplicateConstant` | nombre ya definido más arriba | `name`, `firstLine` |
| `reservedName` | el nombre es una palabra del lenguaje o un sensor | `name` |
| `badConstant` | lo que sigue al `=` no es un número | `name` |
| `usedBeforeDefinition` | nombre usado antes de la línea que lo define | `name`, `definedLine` |
| `indentedConstant` | definición con sangría | `name` |

`suggestion` es la palabra a distancia de edición 1 o 2 de la escrita, buscada
entre las constantes definidas en el programa y el vocabulario; si hay varias,
la de menor distancia y, a igual distancia, primero las constantes y después
la tabla de D2 en su orden (español antes que inglés). Los textos de cada código viven
en los diccionarios (`rules.error.<code>`), con el número de línea delante.

### D4. Editor (`src/ui/editor.js` y `src/ui/editor-text.js`)

Un `<textarea>` transparente sobre un `<pre>` que muestra el mismo texto
coloreado, más una columna con los números de línea:

```
+----+------------------------------------------+
|  1 | # El auto hace lo que dicen estas líneas |   .editor-gutter: un <div> por línea
|▸ 2 | avanzar                                  |   .editor-backdrop: <pre> coloreado
|▸ 3 | si sensor3 > 0,2 entonces                |   .editor-input: <textarea> encima
|▸ 4 |     girar izquierda                      |
+----+------------------------------------------+
```

- Se usa `<textarea>` y no un elemento editable porque conserva gratis el
  deshacer, la selección, el portapapeles, el teclado del sistema y la
  accesibilidad. El costo es mantener el `<pre>` sincronizado en texto,
  tipografía y desplazamiento; por eso los dos comparten una sola regla CSS
  de fuente (13 px de ancho fijo, renglón de 20 px, sin ajuste de línea).
- Interfaz: `createCodeEditor({ container, i18n, value, classify, labelKey,
  help, onChange }) -> { node, value, setValue(text), insert(text),
  setMarks({ active, errors }), focus(), dispose() }`.
- `setMarks` recibe dos conjuntos de números de línea y solo toca las líneas
  cuyo estado cambió. Línea que se cumple: fondo tenue y `▸` junto al número.
  Línea con error: `✕` junto al número y subrayado. Ninguna marca depende
  solo del color.
- Tipos de palabra: palabras de regla en negrita; órdenes en negrita y con
  el color de acento; datos con el color de los sensores; nombres de
  constantes en cursiva; números sin adorno; comentarios en cursiva y
  atenuados. Un nombre que el análisis informa como error queda subrayado por
  la marca de su línea.
- Teclado (funciones puras en `editor-text.js`, que reciben y devuelven
  `{ text, start, end }`): Enter conserva la sangría de la línea y agrega un
  nivel si la línea termina en ENTONCES; Tab agrega 4 espacios o un nivel a
  las líneas seleccionadas; Mayús+Tab lo quita; Escape lleva el foco al
  escenario. El `aria-describedby` del editor dice que Escape sale.
- El editor avisa cada cambio con `onChange(text)`; no sabe nada de reglas
  más que la función `classify` que recibe.

### D5. Piezas compartidas con la pestaña 1

Lo que hoy está solo en la pestaña 1 y la pestaña 2 necesita igual se mueve a
`src/tabs/shared/`, y la pestaña 1 pasa a importarlo de ahí:

| Módulo nuevo | Sale de | Qué es |
|---|---|---|
| `shared/street-settings.js` | `drive/settings.js` | ajustes de calle y sensores, `normalizeSettings`, `needsRestart`, `worldSpec` |
| `shared/attempt.js` | `drive/session.js` | distancia, vehículos superados, intentos y mejor distancia de un intento |
| `shared/driving-cards.js` | `drive/index.js` | bloque de barras de percepción (con opción de mostrar nombres) y bloque de los cuatro controles |
| `shared/street-advanced.js` | `drive/index.js` | sección avanzada con sus deslizadores y restablecer |

`drive/settings.js` y `drive/session.js` siguen exportando lo mismo
(reexportan o componen lo compartido), así sus pruebas no cambian. El
comportamiento de la pestaña 1 no cambia; se comprueba con sus pruebas y en
el navegador antes de seguir.

*Alternativa descartada:* que la pestaña 2 importe de `tabs/drive/`. Ata una
pestaña a otra y deja a la primera como dueña de algo que no es suyo.

### D6. Módulos de la pestaña (`src/tabs/rules/`)

| Archivo | Contenido |
|---|---|
| `index.js` | composición: mundo, controlador de reglas, vista, bucle, tablero y panel |
| `session.js` | sin DOM: indicadores y misiones (D9) |
| `program.js` | sin DOM: estado del programa en edición (texto, último válido, errores, "cambiado por la persona") |
| `shortcuts.js` | espacio y R |

`program.js` expone `createProgramState({ text, sensors })` con `update(text)`,
`setSensors(n)`, y los datos `text`, `valid` (último programa válido o
`null`), `errors`, `rules`, `constants` (las del programa válido, para la
paleta), `showsRunning` (el texto a la vista es el programa que maneja) y
`isOwn(known)` (el texto no coincide con ninguno de los textos conocidos:
inicial y ejemplos, en los dos idiomas).

El estado de la pestaña vive a nivel de módulo, como en Entrenar: texto,
ajustes, semilla, reintento automático, tarjetas desplegadas y misiones
cumplidas. Al volver a la pestaña se retoma todo.

### D7. El programa rige mientras se escribe

- `onChange` del editor llama a `program.update(text)` con un retardo de 250
  ms desde la última tecla (un solo temporizador que se reinicia).
- Si el resultado es válido y distinto del que maneja:
  `controller.setProgram(program)`. No se toca el mundo: el intento sigue.
- Si no es válido: el controlador conserva el último programa válido, se
  muestran los errores y `setMarks` deja de marcar líneas cumplidas.
- Al cambiar la cantidad de sensores (`setSensors`), el programa se vuelve a
  analizar. Si deja de ser válido, el controlador pasa a `setProgram(null)`:
  el programa anterior ya no corresponde a este auto.
- Cada cambio de texto se guarda (D8) con el mismo retardo.

### D8. Programa recordado, exportar e importar

- `src/ui/preferences.js` suma `rulesProgram` (`mlLab.rules.program`), una
  cadena de hasta 20 000 caracteres; lo más largo o lo ilegible se trata como
  ausente. La app pasa `preferences` a las pestañas en el contexto de
  `mount`.
- Exportar usa `downloadText` (ya existe) con `type: 'text/plain'` y el
  nombre `reglas.txt` (`rules.txt` en inglés).
- Importar usa `readText` (ya existe). Se rechaza, con mensaje, un archivo de
  más de 20 000 caracteres, de más de 200 líneas o con caracteres de control
  que no sean salto de línea o tabulación (`rules.import.tooLong`,
  `rules.import.notText`). Un texto con errores del lenguaje sí se carga.
- Cargar un ejemplo, restablecer e importar pasan por la misma función
  `replaceProgram(text, sensors)`, que pide la confirmación en línea
  (`inlineConfirm`) cuando `program.isOwn(...)` es verdadero. Si recibe
  `sensors` (un ejemplo o restablecer), cambia primero la cantidad, el
  alcance y la apertura de los sensores, lo que reinicia el intento, y
  después pone el texto, para que el programa se analice ya con su auto.
  Importar no cambia los sensores.

### D9. Intentos, reintento y misiones (`session.js`)

- Indicadores: distancia, vehículos superados y mejor distancia, del módulo
  compartido de intentos; reglas, del programa que maneja.
- Reintento automático: el paso del bucle cuenta los pasos de simulación
  desde el choque (no usa temporizadores, así respeta la pausa y la página
  oculta). A los 90 pasos (1,5 s) reinicia el intento con el mismo tráfico.
  Con el reintento encendido, el choque se informa en una insignia sobre el
  escenario; apagado, en el cuadro con el botón de reiniciar, como en la
  pestaña 1.
- Misiones:

| Id | Meta | Progreso |
|---|---|---|
| `pass` | 3 vehículos | superados en el intento en curso |
| `passMany` | 10 vehículos | superados en el intento en curso |
| `traffics` | 3 tráficos | semillas distintas en las que el programa en marcha superó 10 vehículos en un intento |

  Las tres miden vehículos superados y no distancia, porque un programa que
  solo frena recorre kilómetros sin superar a nadie. El conjunto de semillas
  de `traffics` se vacía cuando cambia el programa que maneja. Una misión
  cumplida queda en el conjunto compartido del módulo hasta cerrar la
  aplicación.

### D10. Tráfico inicial, programa inicial y ejemplos

`DEFAULT_SEED = 2` para esta pestaña (ver la medición en Context). "Tráfico
nuevo" suma uno, como en la pestaña 1.

Cada ejemplo es un programa más los sensores para los que está escrito. La
lista vive en `src/tabs/rules/examples.js`, sin DOM:

| Id | Nombre | Sensores | Alcance | Apertura | Reglas | Constantes |
|---|---|---|---|---|---|---|
| `initial` | (programa inicial) | 5 | 3 largos | 90° | 1 | 1 |
| `three` | 3 sensores cortos | 3 | 2 largos | 60° | 1 | 1 |
| `seven` | 7 sensores | 7 | 3 largos | 90° | 5 | 4 |
| `twenty` | 20 sensores | 20 | 3 largos | 120° | 9 | 5 |

Los textos viven en los diccionarios (`rules.program.initial`,
`rules.example.three`, `rules.example.seven`, `rules.example.twenty`), en los
dos idiomas; acá van en español. Todos definen sus números arriba, como
constantes.

Inicial:

```
# El auto hace lo que dicen estas líneas.
cerca = 0,2
avanzar
si sensor3 > cerca entonces
    girar izquierda
```

Ejemplo "3 sensores cortos":

```
# Tres sensores cortos: frena cuando ve algo adelante.
# No choca, pero no pasa a nadie.
cerca = 0,1
avanzar
si sensor2 > cerca entonces
    retroceder
```

Ejemplo "7 sensores":

```
# Siete sensores: elige el lado más libre, se aleja de los
# costados y frena si no hay salida.
cerca = 0,2
costado = 0,5
borde = 0,7
pegado = 0,8
avanzar
si sensor4 > cerca y sensor3 <= sensor5 entonces
    girar izquierda
si sensor4 > cerca y sensor3 > sensor5 entonces
    girar derecha
si sensor3 > costado o sensor2 > borde entonces
    girar derecha
si sensor5 > costado o sensor6 > borde entonces
    girar izquierda
si sensor4 > pegado entonces
    retroceder
```

Ejemplo "20 sensores":

```
# Veinte sensores: la misma idea pide casi el doble de reglas,
# y todavía quedan dos sensores sin usar.
cerca = 0,25
costado = 0,5
borde = 0,75
pegado = 0,9
tope = 0,8
avanzar
# Frente: los dos rayos del medio. Elige el lado más libre.
si (sensor10 > cerca o sensor11 > cerca) y sensor8 <= sensor13 entonces
    girar izquierda
si (sensor10 > cerca o sensor11 > cerca) y sensor8 > sensor13 entonces
    girar derecha
# Diagonales.
si sensor8 > costado o sensor7 > costado o sensor6 > costado entonces
    girar derecha
si sensor13 > costado o sensor14 > costado o sensor15 > costado entonces
    girar izquierda
# Costados.
si sensor5 > borde o sensor4 > borde o sensor3 > borde entonces
    girar derecha
si sensor16 > borde o sensor17 > borde o sensor18 > borde entonces
    girar izquierda
# Bordes de la calle.
si sensor1 > pegado o sensor2 > pegado entonces
    girar derecha
si sensor19 > pegado o sensor20 > pegado entonces
    girar izquierda
# Freno.
si sensor10 > tope o sensor11 > tope entonces
    retroceder
```

Las versiones en inglés son la traducción palabra por palabra con el
vocabulario de D2, punto decimal y los nombres de las constantes traducidos
(`near`, `side`, `edge`, `touching`, `limit`).

El de veinte sensores no está afinado para ganar: muestra qué pasa al llevar
la misma idea a un auto que ve más. Si al implementarlo alguien encuentra uno
mejor, no lo reemplaza sin consultar: el escenario de la spec describe este.

### D11. Tablero y panel

Tablero, con la ventana en 1440×900 (819 px útiles de alto, 636 de ancho):

```
+--------------------------------------------------------------+
| Distancia    Vehículos superados   Mejor distancia   Reglas  |
+--------------------------------------------------------------+
| v Programa                                        (grow 3)   |
|   [ editor: unas 16 líneas ]                                 |
|   Sin errores · 1 regla            (o los errores, uno por   |
|                                     renglón, con su línea)   |
|   (guía) [si] [entonces] [y] [o] [no] [avanzar] [retroceder] |
|          [girar izquierda] [girar derecha] [velocidad]       |
|          [sensor1] [sensor2] [sensor3] [sensor4] [sensor5]   |
|          [cerca]                    (constantes del programa)|
+--------------------------------------------------------------+
| v Lo que percibe y lo que acciona                 (grow 1)   |
|   [barras con nombre y valor]   [ ↑ ] [ ↓ ] [ ← ] [ → ]      |
|   (guía) Los nombres bajo las barras son los que usás...     |
+--------------------------------------------------------------+
```

- Percepción y acción van en **una sola tarjeta** en esta pestaña (en la
  pestaña 1 son dos): así la tarjeta del programa recibe unos 480 px y el
  editor muestra unas 16 líneas con la guía activa y unas 20 sin ella. Con
  tres tarjetas el editor quedaba en 10 líneas.
- La paleta lleva la clase `guide`: se oculta con el interruptor de guía.
  Con más de 12 sensores muestra los primeros 12 y una nota con el último
  nombre válido. Al final lista las constantes del programa válido, y se
  rehace solo cuando cambia esa lista o la cantidad de sensores.
- Mínimos de las tarjetas: 280 px la del programa y 180 px la otra.

Panel, en el orden común:

| Bloque | Contenido |
|---|---|
| Guía | un párrafo de hasta 240 caracteres |
| Marcha | Pausar (espacio) · Reiniciar (R); debajo, chico, Tráfico nuevo |
| Vista y reintento | interruptores Sensores y Reintentar solo |
| Programa | Ejemplos (tres botones chicos: 3 sensores cortos, 7 sensores, 20 sensores), Restablecer, Exportar, Importar; confirmación y mensaje debajo |
| Misiones | tres, de un renglón |
| Avanzado | plegado; el mismo de la pestaña 1 |

El panel es corto (unos 520 px estimados): entra sin desplazarse en 1440×900
y en 1366×768.

### D12. Textos

Claves nuevas, en los dos idiomas, además de los programas de D10: título y
tooltip de la pestaña (`tab.rules`, `help.tab.rules`, que reemplaza a
`help.tab.rules.soon`); guía (`rules.guide`); indicador `rules.stats.rules`;
tarjetas y renglones de ayuda (`rules.program.title`, `rules.program.hint`,
`rules.io.title`, `rules.io.hint`); estado del programa (`rules.status.ok`
con su variante de singular, `rules.status.errors`); los dieciséis errores
(`rules.error.<code>`); paleta (`rules.word.<papel>` y un tooltip por
palabra, `help.rules.word.<papel>`, más `help.rules.word.sensor` con `{n}`);
controles (`rules.pause`, `rules.restart`, `rules.newTraffic`,
`rules.sensors`, `rules.retry`, `rules.reset`, `rules.export`,
`rules.import`, `rules.examples`, y los nombres de los tres ejemplos);
confirmaciones y mensajes de importar; choque (`rules.crash.vehicle`,
`rules.crash.edge`, `rules.crash.retrying`); y misiones.

Texto de guía propuesto:

| Español | Inglés |
|---|---|
| El auto hace lo que dicen las líneas del programa, nada más. Cambiá un número y mirá qué pasa; cuando choque, agregá una regla para ese caso. Las líneas que se están cumpliendo se resaltan. | The car does what the program's lines say, nothing else. Change a number and watch what happens; when it crashes, add a rule for that case. The lines being fulfilled are highlighted. |

Los mensajes de error siguen el modelo "línea, qué pasó, cómo se arregla", sin
jerga: por ejemplo, para `missingThen`, "Línea 3: después de la condición
falta `entonces`."; para `unknownWord` con sugerencia, "Línea 2: no entiendo
«abanzar». ¿Quisiste escribir «avanzar»?".

`tests/copy-length.test.js` suma la guía (240), los renglones de ayuda (120)
y las misiones (34) de esta pestaña.

### D13. Rendimiento

- Ejecutar un programa: una pasada por sus sentencias por paso de simulación.
  Con 50 reglas son unas pocas centenas de comparaciones, muy por debajo del
  costo de una red.
- Colorear: el texto completo se vuelve a clasificar con `classifyLine` en
  cada cambio (evento `input`), sin esperar el retardo de D7; con 200 líneas
  como máximo es barato.
- Resaltado: `setMarks` una vez por cuadro, tocando solo las líneas que
  cambiaron de estado.
- Criterio: al menos 50 cuadros por segundo con un programa de 50 reglas.

### D14. Pruebas

Sin DOM, con `node --test`:

- `tests/rules.test.js`: un caso por escenario de la spec `reglas` (programa
  por líneas, órdenes, reglas, condiciones con su precedencia, datos,
  ejecución, vocabulario en los dos idiomas, constantes, los dieciséis
  errores, tamaño, cantidad de reglas y de constantes, líneas que se
  cumplen) y de `classifyLine`.
- `tests/rules-controller.test.js`: los escenarios del requisito
  "Controlador de reglas" de `controladores`, y un auto manejado por
  `avanzar` en un mundo sin navegador.
- `tests/rules-examples.test.js`: los programas de D10, tomados de los dos
  diccionarios, son válidos con los sensores de su ejemplo, tienen las
  reglas y las constantes de la tabla de D10, y con la semilla 2 cumplen los
  escenarios de "Programas de ejemplo" y "El programa inicial hace algo y no
  alcanza". Además, que la versión en inglés de cada uno acciona lo mismo
  que la versión en español ante mil percepciones generadas con semilla.
- `tests/editor-text.test.js`: Enter, Tab y Mayús+Tab sobre texto y
  selección.
- `tests/rules-program.test.js`: `createProgramState` (último válido, errores,
  cambio de sensores, constantes del programa válido, `isOwn`).
- `tests/rules-session.test.js`: indicadores, reintento a los 90 pasos y las
  tres misiones, incluido el reinicio de `traffics` al cambiar de programa.
- `tests/preferences.test.js`: `rulesProgram`.
- `tests/architecture.test.js` ya impide el DOM y el azar sin semilla en
  `src/core`; no cambia.

Las pruebas existentes no se modifican. Si alguna enumera una lista completa
que este cambio amplía (por ejemplo las claves de preferencias), se le suman
solo las claves nuevas y se informa.

Lo que depende del DOM (editor, tablero, panel) se verifica en el navegador
con los escenarios de `pestana-reglas`.

## Risks / Trade-offs

- [Los números de la medición salen de un intérprete de descarte y no del
  intérprete del producto] → `tests/rules-examples.test.js` los repite con el intérprete
  real. Si un ejemplo no cumple su escenario, se detiene y se consulta; no se
  cambian ni los escenarios ni los programas por cuenta propia.
- [El `<pre>` y el `<textarea>` se desalinean si difieren en un detalle de
  tipografía, y el color queda corrido respecto del texto] → una sola regla
  CSS para los dos, sin ajuste de línea, y una verificación en el navegador
  con líneas largas, tabulaciones y desplazamiento.
- [El programa inicial choca a los 4 segundos y, con el reintento
  automático, repite el mismo choque indefinidamente] → es el punto de
  partida que se busca: el mismo error a la vista hasta que la persona cambia
  algo. La insignia dice contra qué chocó y la guía dice qué hacer.
- [Cinco reglas manejan mejor que las redes que hoy entrena la app, y la
  pestaña parece contradecir que las reglas no escalan] → es un dato cierto
  hoy y no se oculta. Lo que no escala se ve en el ejemplo de veinte
  sensores (más reglas, peor resultado) y en la misión de tráficos distintos;
  la comparación de fondo llega con la pestaña Competir.
- [Cargar un ejemplo cambia los sensores, que es un ajuste de la sección
  avanzada, plegada] → la confirmación lo avisa, el tablero muestra enseguida
  las barras nuevas con sus nombres, y restablecer vuelve a los 5 sensores.
- [El ejemplo de tres sensores no choca nunca: con el reintento automático
  no pasa nada a la vista] → es su punto: el indicador de vehículos superados
  queda en 0 y su comentario lo dice. Las misiones miden vehículos superados
  para que frenar no las cumpla.
- [Una constante es un nombre libre, y `o`, `y`, `no`, `if`, `left`… están
  reservados en los dos idiomas] → el error `reservedName` lo explica.
- [Extraer piezas de la pestaña 1 puede cambiarle algo sin querer] → va en
  un grupo de tareas propio, antes de construir la pestaña 2, con sus
  pruebas sin modificar y una verificación en el navegador.
- [La regla "el tablero solo muestra" gana una excepción] → queda escrita
  como requisito de `tablero` y acotada al caso en que lo que se escribe es
  lo que se ve ejecutarse.

## Migration Plan

Sin datos que migrar. La clave nueva de preferencias es opcional. Al archivar
hay que actualizar a mano el propósito de `openspec/specs/tablero/spec.md`,
cuya última oración pasa a ser: "El tablero muestra; los controles viven en
el panel, salvo el editor de un programa, que se escribe donde se lo ve
ejecutarse." Vuelta atrás: revertir los commits del cambio.

## Open Questions

- Los pesos de reparto de las tarjetas (3 y 1) y el alto de renglón del
  editor (20 px) se pueden retocar al verlos en pantalla.
- Si la paleta debe poder mostrarse también con la guía apagada es una
  decisión de uso que se puede tomar después de probar la pestaña.
