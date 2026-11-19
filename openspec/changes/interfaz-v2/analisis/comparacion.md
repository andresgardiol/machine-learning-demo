# Comparación de las tres maquetas: interfaz-v2

## 1. Criterios de comparación

Los fija la tarea 3.3 antes de ver las maquetas. El orden y los pesos siguen el orden de prioridades de la constitución: claridad didáctica primero, usabilidad segundo; lo demás reparte el resto. Escala de 1 a 5 por criterio; el total ponderado va de 1 a 5.

| Criterio | Peso | Qué se mira | Cómo se puntúa en una maqueta estática |
|---|---|---|---|
| Claridad didáctica | 25 % | Si cada pantalla deja ver la pregunta y el concepto de la etapa, y si la escena (o la red) manda. Principios 1, 2, 7 y 9. | % de la ventana que ocupa la escena a 1366×768 [Medido]; si la pregunta y la definición de "fitness" se ven; lectura de 5 segundos [Observado]. |
| Usabilidad | 20 % | Una acción principal, ajustes en un solo lugar, reinicios con alcance, todo a la vista a 1366×768. Principios 4, 5, 8 y 12. | Controles a la vista y principales [Medido]; zonas que desplazan a 1366×768 [Medido]; crítica heurística (4.8). |
| Convivencia de los dos públicos | 15 % | Si el mentor oculta la guía de una vez y encuentra todo en "Avanzado" sin estorbar al principiante. Principios 5 y 10. | Pantalla del estado mentor; Entrenar con "Avanzado" abierto [Observado]. |
| Costo de la paridad | 10 % | Cuántas filas de `paridad.md` cuestan más con esa disposición (lo que no tiene lugar natural). | Filas "rediseñado" sin lugar obvio en la maqueta [Hipótesis razonada]. |
| Esfuerzo de la fase 3 | 10 % | Cuántos componentes nuevos y cuánto se aparta de los pintores de canvas de la V1. | Lista de componentes de 4.2 [Medido: cantidad]; cambios de dibujo (D8) [Hipótesis]. |
| Riesgo para la fluidez | 10 % | Si la disposición agranda los lienzos, suma brillo o superposiciones sobre la escena. | Área de lienzo a 1440×900 contra la V1 [Medido]; capas sobre la escena [Observado]. La tasa de cuadros real no se mide con maquetas. |
| Accesibilidad | 10 % | Contraste, orden de lectura, objetivos de 24 px, foco visible. Principio 12. | Contraste de los tokens [Medido]; tamaños de objetivo [Medido]; orden del DOM [Observado]. |

| Maqueta | Claridad (25) | Usabilidad (20) | Dos públicos (15) | Paridad (10) | Esfuerzo (10) | Fluidez (10) | Accesibilidad (10) | Total |
|---|---|---|---|---|---|---|---|---|
| A | 4 | 3,5 | 4,5 | 2 | 2,5 | 2 | 3,5 | **3,38** |
| B | 4 | 3 | 3,5 | 3,5 | 3 | 4 | 4,5 | **3,63** |
| C | 4,5 | 4,5 | 4 | 4,5 | 4,5 | 4 | 4,5 | **4,38** |

La tabla se llenó en la tarea 5.1; el motivo de cada puntaje está en la sección 5.

## 2. Las tres direcciones

Método: `design-superpowers:creative` (nivel de madurez **L2**: la V1 tiene sistema de diseño; como el pedido es una dirección nueva, las tres parten de cero y solo conservan los nombres de las variables que leen los pintores de canvas) y `frontend-design:frontend-design` (un plan de color, tipo y disposición por propuesta, revisado contra los defaults genéricos antes de construir). Las semillas de design.md D4 se mantienen; los principios cambiaron la manera de resolver Entender y el estado mentor, como se anota abajo. Todo es **[Propuesta]**.

Tipos: solo fuentes del sistema de macOS (sin dependencias), con su respaldo genérico. Están disponibles en esta máquina [Medido: `/System/Library/Fonts`]; en Windows o Linux caen al respaldo y se verían distintas.

### Cuadro por eje

| Eje | A · Cabina | B · Cuaderno de laboratorio | C · Mesa de trabajo |
|---|---|---|---|
| 1. Disposición | La escena a pantalla completa; lo demás flota encima como instrumentos (pregunta, marcha, misión) | Lectura narrativa: una página por etapa, texto corto y una figura viva grande incrustada | Dos zonas fijas en todas las etapas: el objeto (escena o red) a la izquierda y el banco a la derecha |
| 2. Navegación del recorrido | Riel vertical de etapas a la izquierda, con la pregunta al posarse | Capítulos: índice al costado con las cinco preguntas y "Capítulo siguiente" al pie | Línea de tiempo arriba: cinco pasos unidos, el actual con su pregunta |
| 3. Manejo de los ajustes | Cajón que se abre desde la derecha, con los tres niveles adentro | En el lugar del objeto: "Probá esto" pegado a la figura, "Más" y "Avanzado" como desplegables debajo de ella, y las definiciones en el margen | Inspector acoplado en el banco, con pestañas "Probá esto · Más · Avanzado", que cambia a la neurona o al auto elegido |
| 4. Dirección de arte | Noche y asfalto, como `og-image.png`: fondo verde petróleo, rayos con brillo, amarillo de señal para la acción; DIN Alternate y Avenir Next | Papel cuadriculado y tinta: fondo claro con cuadrícula, azul de tinta para la acción, rojo de margen para el choque, resaltador para los términos; Iowan Old Style y Avenir Next Condensed | Taller claro: mesa gris, banco blanco, el objeto en un pozo oscuro; los tres roles (entra, decide, sale) en tres colores; la acción en grafito; Futura y Gill Sans |

Coincidencias entre pares, por eje: **ninguna**. A, B y C toman una postura distinta en los cuatro ejes (el mínimo pedido era tres de cuatro, y que ningún par coincida en más de uno).

### Paleta y tipografía por propuesta

| | A · Cabina | B · Cuaderno | C · Mesa de trabajo |
|---|---|---|---|
| Fondo | `#0b1416` asfalto nocturno | `#f6f8fb` papel, cuadrícula `#dfe6ef` | `#e3e6ea` mesa |
| Superficie | vidrio `#0f1c1f` al 86 % | `#ffffff` hoja | `#ffffff` banco; pozo del objeto `#13171c` |
| Texto | `#e9f1f2` | `#1b2a44` tinta | `#1d2127` grafito |
| Acción principal | `#f4d23c` amarillo de señal, texto oscuro | `#2b54c8` azul de tinta, texto blanco | `#1d2127` grafito, texto blanco |
| Choque y error | `#ff5a6a` | `#d8434b` rojo de margen | `#d23f36` |
| Acento propio | brillo celeste `#8fd3ff` de los rayos | resaltador `#ffe46b` en los términos | roles: entra `#2f97d1`, decide `#7a5cf0`, sale `#e7801f` |
| Títulos | DIN Alternate Bold (números del tablero) | Iowan Old Style, la pregunta como título de capítulo | Futura Medium |
| Texto | Avenir Next | Iowan Old Style; controles en Avenir Next Condensed | Gill Sans |

### Qué la hace distinta, en una oración

- **A · Cabina:** manejás adentro de la escena: todo es el auto y lo demás es instrumental, como un tablero que se apaga cuando no hace falta.
- **B · Cuaderno:** se lee como una explicación interactiva: cada etapa es una página con una figura que se toca, y las palabras nuevas se definen en el margen, al lado de donde aparecen.
- **C · Mesa de trabajo:** el mismo banco en todas las etapas: el objeto a la izquierda, las herramientas a la derecha; aprendés el lugar una vez y sirve para todo el recorrido.

### Revisión del plan contra los defaults genéricos (`frontend-design`)

- A empezó como "fondo casi negro con un solo acento ácido" (default 2 de la skill). **Cambió:** el fondo es verde petróleo de la imagen del proyecto, no negro neutro, y el acento es el amarillo de la línea de `og-image.png`, que ya es un activo del proyecto.
- B corría el riesgo de "crema con serif de alto contraste" (default 1). **Cambió:** papel frío con cuadrícula de cuaderno de laboratorio, tinta azul y margen rojo; el serif es de texto (Iowan), no de exhibición.
- C corría el riesgo del "kit de tarjetas SaaS" (default 4). **Cambió:** no hay tarjetas repetidas con sombra; el banco es una sola superficie con divisiones de regla, y el color se reserva a los tres roles del contrato.
- Ninguna usa rótulos en mayúsculas sostenidas, números 01/02/03 decorativos ni flechas "→" en los botones. La numeración de las etapas sí se usa, porque es una secuencia real.

### Cambios a las semillas de D4 que pidieron los principios

- A: en Entender la red no puede ser un instrumento flotante chico (principio 2 aplicado a la red). La red ocupa la mitad derecha como un vidrio grande, y la escena queda atrás a la izquierda.
- B: para cumplir el principio 12 (todo a la vista a 1366×768), la primera vista de cada capítulo muestra la pregunta, la consigna, la figura y su acción sin desplazar; el texto largo va después de la figura.
- C: el inspector cambia según lo elegido (la neurona en Entender), como dice la semilla, pero la pregunta y la acción no se mueven del banco (principio 3).

## 3. Tokens y componentes de cada propuesta

Método: `design-skills:design-systems` (tokens en tres capas: referencia, semántica y componente). Cada maqueta tiene su `tokens.css` en `borradores/interfaz-v2/maquetas/<a|b|c>/`. La capa semántica define las 41 variables de color que leen los pintores de canvas de la V1: las 38 de `COLOR_VARS` en `view.js`, `network-view.js` y `network-inspector.js`, más `--color-border`, `--color-class-a` y `--color-class-b`, que lee `plane-view.js`. Medido con un guion: **0 faltantes en las tres**. Los dibujos de las maquetas (escena, población, red y curva) son SVG estáticos que pintan con esas mismas variables, así cada maqueta muestra cómo se verían los pintores con su paleta. No son la salida de la V1: son un dibujo aproximado con la misma geometría (carriles, rayos y red 6-6-4).

Las tres comparten los textos (`maquetas/comun/textos.js`: 207 claves y 32 tooltips por idioma, con las mismas claves en español y en inglés [Medido]) y el JS mínimo (`maquetas/comun/maqueta.js`: idioma, pantallas, paneles, tooltips y dibujos).

| | A · Cabina | B · Cuaderno | C · Mesa de trabajo |
|---|---|---|---|
| Tokens de referencia | 20 (petróleo, niebla, señal, celeste, verdes y rosa; dos familias tipográficas) | 18 (papel, cuadrícula, tinta, azul, margen, resaltador; dos familias) | 16 (mesa, banco, grafito, pozo, tres roles; tres familias) |
| Componentes propios | Riel de etapas, instrumento de vidrio (HUD), cajón de ajustes con niveles plegables, pastilla de indicadores, teclas destacadas, mapa del recorrido superpuesto | Índice de capítulos, cabeza de capítulo con subcapítulos, figura con lámina y mandos, láminas chicas, nota de margen, desplegable, portada con índice, término resaltado | Línea de tiempo, pozo del objeto con transporte, banco, contrato entra → sale, inspector con "Probá esto" fijo y pestañas "Más · Avanzado", mapa de pasos en tarjetas |
| Componentes comunes a las tres | Botón en cuatro niveles (principal, secundario, terciario, teclas), interruptor, selector de idioma, deslizador con valor, grupo de opciones, definición de término, rótulo "de esta etapa", corte de generación, marcador, tabla por pista, tarjeta de la neurona, barra de marcha, misión con progreso y "Mostrame", tooltip con indicio constante | ← | ← |
| Cantidad de componentes | 22 | 24 | 24 |
| Indicio de tooltip | Punto en la esquina | "?" volado, como una llamada al margen | Esquina doblada en el color de "entra" |
| Cambio en el dibujo (D8) | Brillo en rayos, faros y neuronas activas (filtro de desenfoque): necesitaría `src/v2/render/` y medir fluidez | Trazo de tinta en la calle y los autos; paleta clara: los pintores de la V1 alcanzan con los tokens | Plano, sin cambios: los pintores de la V1 alcanzan con los tokens |

## 4. Crítica de las maquetas

Método: `design-skills:design-critique` sobre las 30 capturas (`borradores/interfaz-v2/maquetas/capturas/indice.md`) y las medidas de `capturar-maquetas.mjs`: jerarquía, una sola acción principal, contraste y si se entiende sin explicación. Cada hallazgo dice si se **corrigió** o si **queda**.

### Medidas de las tres, después de las correcciones [Medido]

"Escena visible" es la parte de la ventana donde lo que se ve es el lienzo de la escena o de la red, sin nada encima (muestreo cada 12 px con `elementFromPoint`, a 1366×768). En la V1, en la misma medida de área (sin descontar lo que tapa), la escena ocupa entre el 13,7 % y el 24,7 % a 1366×768.

| Pantalla (1366×768) | A: escena visible | B | C | V1, misma vista (área del lienzo) |
|---|---|---|---|---|
| El problema | 70,9 % | 44,1 % | 47,3 % | 24,7 % (`1a-1366`) |
| Aprender con Avanzado | 41,7 % | 23,5 % | 24,7 % | 17,5 % + red 527×120 (`3a-1366`) |
| Entender, neurona | 61,5 % (escena 32 % + red) | 43,2 % (red) | 47,9 % (red) | red 599×420 + escena 17 % (`5b-1366`) |
| Evaluar, mentor | 72,4 % | 27,7 % | 49,2 % | 24,7 % (`4b-1366`) |

| Medida (las 30 capturas) | A | B | C |
|---|---|---|---|
| Acciones principales a la vista | 1 en cada pantalla; 0 en El problema, donde se destacan las teclas | igual | igual |
| Controles a la vista (1366×768) | 15 a 31 | 13 a 27 | 14 a 28 |
| Zonas que piden desplazar a 1366×768 | el cajón de ajustes en Aprender (694 de 907 px) | la página entera en las cuatro etapas (el texto largo va después de la figura) y el margen en Aprender (604 de 840 px) | el banco en Aprender (688 de 866 px) |
| La pregunta empieza a | 101 px | 77–114 px | 82–110 px |
| Controles sin tooltip, sin nombre accesible, objetivos de menos de 24 px, textos bajo 4,5:1, textos sin clave (en los dos idiomas) | 0 · 0 · 0 · 0 · 0 | 0 · 0 · 0 · 0 · 0 | 0 · 0 · 0 · 0 · 0 |
| Líneas de texto que no cambian al pasar a inglés (fuera de números y teclas) | 0 | 0 | 0 |
| Errores en la consola | 0 | 0 | 0 |

### Hallazgos de la crítica

| # | Maqueta | Hallazgo | Principio | Estado |
|---|---|---|---|---|
| K1 | A, B, C | Los deslizadores no tenían nombre accesible: el `<output>` dentro de la `<label>` se llevaba la etiqueta (es el primer elemento etiquetable). | WCAG 4.1.2 | **corregido**: el deslizador va antes de su valor en el documento; 0 sin nombre [Medido]. |
| K2 | A, B, C | En El problema, la primera versión tenía "Pausar" como acción principal, el mismo error de la V1 (E1). | Principio 4, Art. 13 | **corregido**: se destacan las teclas ←↑→ y "Manejá con ↑ ← →"; ningún botón principal. |
| K3 | A, B, C | "Capas ocultas", "Quién elige al padre" y "Tráfico por generación" mostraban el tooltip de otro control. | Art. 5 | **corregido**: tooltips propios en los dos idiomas. |
| K4 | B | Textos en lápiz y en rojo de margen bajo 4,5:1 (4,09 a 4,35:1) y el título del corte en ámbar (2,69:1). | WCAG 1.4.3 | **corregido**: lápiz `#4e5b70`, margen `#c0353e`, élite `#a85f00`; 0 bajo el mínimo [Medido]. |
| K5 | C | Los colores de rol sobre el banco blanco daban 3,25:1 (entra) y 2,80:1 (sale). | WCAG 1.4.3 | **corregido**: `#1b6e9e`, `#6a4ae0`, `#a85410`; el foco y las entradas de la red, sobre el pozo oscuro, usan tonos más claros. |
| K6 | A, B, C | "Volver a la V1", "Más" y el título medían 16 a 23 px de alto. | WCAG 2.5.8 | **corregido**: 28 px. |
| K7 | A | En Entender, la tarjeta de la neurona tapaba las salidas de la red. | Principio 2 | **corregido**: la tarjeta flota sobre la escena, bajo la pregunta. |
| K8 | B, C | La miniatura del auto tapaba neuronas (B: Velocidad; C: Sensor 1). | H8 | **corregido**: arriba a la izquierda en B, arriba a la derecha en C. |
| K9 | C | El mapa del recorrido salía en columnas deformes (el indicio de ayuda pisaba el `display`). | Visual | **corregido**. |
| K10 | B | En Aprender, la marcha quedaba cortada abajo a 1366×768. | Principio 12 | **corregido**: la figura se acorta en esa pantalla. |
| K11 | C | Con las pestañas "Probá esto · Más · Avanzado", abrir Avanzado escondía "Probá esto" (la spec pide "Probá esto" a la vista). | Spec *Ajustes en tres niveles* | **corregido**: "Probá esto" queda fijo y las pestañas son "Más · Avanzado". |
| K12 | A | Los instrumentos tapan la escena: en Aprender queda visible el 41,7 %, aunque el lienzo ocupa el 88,8 %. Es el costo de la disposición. | Principio 2 | **queda**: es propio de A. |
| K13 | A | El cajón de ajustes abierto deja a la escena sin el instrumento "Lo que percibe" (se oculta para no superponerse). | H1 | **queda**. |
| K14 | A, B, C | Con "Avanzado" abierto, los ajustes piden desplazar a 1366×768 (A: cajón; B: margen; C: banco). Lo que la spec pide sin desplazar (pregunta, consigna, acción, escena y misión) sí entra. | Principio 12 | **queda**: Avanzado es largo por naturaleza. |
| K15 | B | La página entera desplaza en las cuatro etapas: el texto largo de la guía va debajo de la figura. Lo esencial entra arriba. | Principio 12 | **queda**: es propio de la lectura narrativa. |
| K16 | B | En Aprender y Evaluar la escena baja al 23,5 % y al 27,7 %: la figura doble la reparte con la red, la curva o el marcador. | Principio 2 | **queda**. |
| K17 | B, C | La red del líder en Aprender se dibuja chica (alrededor de 300×130 px en B). | V1 N4 | **queda**: igual o peor que la V1 a 1366×768. |
| K18 | A | El amarillo de señal (acción) y el amarillo de la élite son el mismo tono. | Principio "un color, un significado" | **queda**: decidir en la fase 3 (otro tono para la élite). |
| K19 | C | Con la guía oculta, el banco de Evaluar queda con media pantalla vacía. | H8 | **queda**: el mentor podría usarlo para la tabla más grande. |
| K20 | A, B, C | La etapa Reglas a mano no tiene pantalla en las maquetas; el enlace lleva al recorrido. | Alcance de D4 | **queda**: D4 no la pide. |
| K21 | A, B, C | Fuentes del sistema de macOS: en otro sistema se ven con su respaldo y no se probó cómo quedan. | — | **queda**: sin probar. |

## 5. Puntajes, pros y contras

Los puntajes son **[Hipótesis razonada]**: se apoyan en las medidas de la sección 4 cuando las hay, pero ponderar es una opinión. La tabla está en la sección 1. Totales: C 4,38 · B 3,63 · A 3,38.

### Motivo de cada puntaje

| Criterio | A · Cabina | B · Cuaderno | C · Mesa de trabajo |
|---|---|---|---|
| Claridad didáctica (25) | **4.** La escena más grande del recorrido (70,9 % visible en El problema [Medido]) y la pregunta arriba. Pero los instrumentos compiten con lo que se mira, y las definiciones viven en el cajón cerrado. | **4.** La pregunta es el título del capítulo, "Capítulo siguiente" cierra con la pregunta que sigue, y los términos se definen resaltados en el margen. La escena baja al 23,5 % y al 27,7 % en Aprender y Evaluar [Medido]. | **4,5.** La pregunta fija en el banco, el contrato entra → sale en sus colores en todas las etapas (el hilo de la promesa), escena del 47 al 49 % y red del 48 % [Medido], sin nada encima. |
| Usabilidad (20) | **3,5.** Pocos controles (15 a 31 [Medido]), pero los instrumentos cambian de lugar según la etapa, el cajón tapa "Lo que percibe" (K13) y pide desplazar. | **3.** La página entera desplaza en las cuatro etapas y el margen también en Aprender (K15) [Medido]; los ajustes al lado de la figura sí se encuentran. | **4,5.** El mismo plano en las cinco pantallas, "Probá esto" siempre a la vista, una sola zona que desplaza (el banco con Avanzado abierto) [Medido]. |
| Dos públicos (15) | **4,5.** Con la guía oculta y el cajón cerrado queda la escena casi entera: lo mejor para mostrar a un grupo. | **3,5.** Ocultar la guía saca el texto, pero la página sigue siendo un texto con figuras; el mentor salta por capítulos sin problema. | **4.** Avanzado siempre en el mismo lugar del banco; con la guía oculta queda espacio vacío en el banco (K19). |
| Costo de la paridad (10) | **2.** Cada feature de la V1 que hoy es un panel (editor de Reglas, biblioteca, tablas de pesos, curvas del Laboratorio, cinta del manejo) pasa a ser otro instrumento flotante sobre la escena, o a vivir en el cajón. | **3,5.** Las features caben como figuras y notas de margen; el editor de Reglas puede ser una figura. Las páginas se alargan. | **4,5.** El banco con su inspector aloja lo que hoy está en los paneles, y el inspector que cambia según lo elegido ya es como trabaja la V1 en Inspeccionar y el Laboratorio. |
| Esfuerzo de la fase 3 (10) | **2,5.** Disposición superpuesta, vidrio con desenfoque y brillo en el dibujo (necesita `src/v2/render/`, D8). 22 componentes. | **3.** Tema claro: hay que revisar que los pintores se lean bien sobre papel (los tokens alcanzan; el trazo de tinta del auto es un cambio de dibujo) y cómo se dimensiona un lienzo dentro de una página que desplaza. 24 componentes. | **4,5.** Dos zonas como la V1 de hoy en Reglas y Entrenar; dibujo plano, los pintores de la V1 alcanzan con los tokens. 24 componentes. |
| Riesgo para la fluidez (10) | **2.** Lienzo de unos 1290×720 (más de 3 veces el de la V1 en El problema) y `backdrop-filter` sobre una escena que se mueve, más brillo. Sin medir: no hay simulación en las maquetas. | **4.** Lienzo de unas 2 veces la V1, sin capas encima. | **4.** Lienzo de unas 2 veces la V1, sin capas encima. |
| Accesibilidad (10) | **3,5.** 0 problemas medidos, pero el texto de los instrumentos va sobre vidrio encima de una escena que se mueve: el contraste real cambia con lo que pasa por detrás, y el guion no lo mide. | **4,5.** 0 problemas medidos; tinta sobre papel, alto contraste. | **4,5.** 0 problemas medidos; banco blanco y pozo oscuro con contrastes fijos. |

### Pros y contras

**A · Cabina**
- A favor: la escena manda como en ninguna otra (principio 2); se siente un producto propio y es la que más se parece a `og-image.png`; con la guía oculta es lo más cercano a un modo proyector sin hacer uno.
- En contra: los instrumentos tapan la escena y cambian de lugar según la etapa; todo lo que la V1 tiene en paneles necesita un lugar flotante; es la que más arriesga la fluidez (lienzo grande, desenfoque y brillo).
- **Lo que más le cuesta de la paridad:** `pestana-reglas` (39 requisitos: el editor, las fichas, el cuaderno de casos), `pestana-laboratorio` (44: tabla de datos, curvas, plano y perillas) y la biblioteca de `cerebros` (17). No tienen un lugar natural sobre la escena.

**B · Cuaderno de laboratorio**
- A favor: la mejor para el principiante que llega solo: la cadena de preguntas se lee como un texto, los términos se definen al lado de donde aparecen y cada capítulo cierra con la pregunta que sigue; es la más accesible en contraste.
- En contra: desplaza siempre; la escena se achica cuando la figura tiene que mostrar dos cosas; el mentor proyectando ve un cuaderno, no un laboratorio.
- **Lo que más le cuesta de la paridad:** `pestana-entrenar` y `neuroevolucion` (80 requisitos con mucho estado en vivo: corte, mutación, selección manual, cambios pendientes) y `pestana-competir` (30), que piden ver varias cosas a la vez y no caben en una figura sin achicar la escena.

**C · Mesa de trabajo**
- A favor: el mismo banco en todas las etapas (principio 3), con la pregunta y la acción siempre en el mismo lugar; el contrato entra → decide → sale como columna vertebral; la más barata de construir y de mantener a la par con la V1.
- En contra: es la más parecida a la V1 en estructura (dos zonas), así que el cambio se nota más en el orden y la estética que en la forma; deja espacio vacío con la guía oculta; la escena llega al 47 %, no al 70 % de A.
- **Lo que más le cuesta de la paridad:** `pestana-laboratorio` (44): los tres experimentos con plano, tabla de verdad, curvas y red tienen que repartirse entre el pozo y el banco sin que el banco desplace más.

## 6. Recomendación de Claude

> **Esto es una recomendación, no una decisión.** La elección es del dueño (tarea 6.1), y la fase 3 no empieza sin ella.

**Lo medido** (sección 4): las tres maquetas cumplen las auditorías de tooltips, nombres, contraste, objetivos de 24 px y textos en los dos idiomas, con 0 problemas en las 30 capturas. Las tres llevan la escena a más del doble del área de la V1 en El problema a 1366×768: A 70,9 %, C 47,3 %, B 44,1 %, contra 24,7 % en la V1. Solo A y C muestran todo sin desplazar la página; en las dos, lo único que desplaza es la zona de ajustes con "Avanzado" abierto (el cajón en A, el banco en C).

**Lo opinado:** recomiendo **C · Mesa de trabajo** como base, porque es la que mejor cumple los principios de usabilidad (3, 5 y 12) sin perder claridad, y la que menos arriesga la paridad y la fluidez. Tomaría de las otras dos:

1. **De B, el vocabulario y la cadena de preguntas:** los términos definidos con resaltador en el lugar donde aparecen, y al pie del banco, el "Siguiente: ¿…?" con la pregunta de la etapa que sigue, más la portada con el índice de las cinco preguntas.
2. **De A, la escena grande para mostrar:** un modo "escena a pantalla completa" para el mentor (el banco se pliega y quedan la pregunta y la marcha encima, como en la Cabina). Es el puente al `modo-proyector` pendiente. Si el dueño lo quiere, entra en la fase 3 como decisión aparte.
3. **De A, el amarillo de señal y el auto con volumen** de `og-image.png`, solo si el dueño quiere más dirección de arte que el plano de C. Cuesta `src/v2/render/` y una medición de fluidez (D8).

Si el dueño valora más la sorpresa visual que el costo, A con el banco de C para las etapas con mucho panel (Reglas y Laboratorio) sería la mezcla a considerar. Tiene el riesgo de tener dos disposiciones, en contra del principio 3.

### Modo proyector (pregunta abierta de design.md)

Ninguna maqueta lo implementa. A con la guía oculta es lo más cercano, y la recomendación 2 lo acerca a C. Queda para la decisión del dueño junto con la elección.

## 7. Revisión del dueño y maqueta D (grupo 5b, 19 de noviembre de 2026)

### Lo que dijo el dueño (19 de noviembre de 2026, resumido por la sesión principal)

- **A:** la mejor equilibrada. Le gusta el riel vertical de etapas a la izquierda, porque se ve el recorrido y se entiende que se puede avanzar.
- **B:** le gusta el diseño de cuaderno y la separación clara entre la simulación y los ajustes.
- **C:** "no mejora realmente la UI". En la etapa 3 no ve las opciones para modificar la red ni los sensores, y en la 4 no ve la configuración de la meta.
- **Tema:** no le gusta el tema claro de B y C.

### El hueco de paridad de A, B y C [Medido]

Busqué en los `index.html` de las cuatro maquetas los textos de doce ajustes: rayos, alcance, apertura, activación, neuronas por capa, meta, pistas del entrenamiento, duración máxima, eliminar a los lentos, selección, biblioteca de cerebros y el editor de Reglas a mano. **A, B y C no muestran ninguno de los doce. D muestra los doce.** El hueco era de las tres, no solo de C. Las maquetas del grupo 4 seguían D4 al pie de la letra: armazón y cuatro pantallas, con los ajustes "de muestra". El dueño, con razón, las juzgó como si fueran completas. Los puntajes de paridad de la sección 5 valoraban la capacidad de cada disposición para alojar los ajustes, no lo que la maqueta mostraba. Abajo se corrigen.

### El criterio que faltó: cambio notable respecto de la V1

Lo pidió el dueño desde el principio (proposal: "esperaba un cambio más notable"), y la tabla de la sección 1 no lo tenía. Se suma con un 15 %, y los pesos se redistribuyen. Los puntajes son **[Hipótesis razonada]**; los de paridad de A, B y C bajan por el hueco medido arriba.

| Maqueta | Claridad (20) | Usabilidad (20) | **Cambio notable (15)** | Dos públicos (15) | Paridad (10) | Esfuerzo (5) | Fluidez (7,5) | Accesibilidad (7,5) | Total |
|---|---|---|---|---|---|---|---|---|---|
| A · Cabina | 4 | 3,5 | **5** | 4,5 | 1,5 | 2,5 | 2 | 3,5 | **3,61** |
| B · Cuaderno | 4 | 3 | **3** | 3,5 | 2,5 | 3 | 4 | 4,5 | **3,41** |
| C · Mesa de trabajo | 4,5 | 4,5 | **1,5** | 4 | 3 | 4,5 | 4 | 4,5 | **3,79** |
| **D · Cabina con cuaderno** | 4,5 | 4 | **4,5** | 4,5 | 5 | 3 | 3 | 4 | **4,23** |

Motivo del criterio nuevo:
- **A, 5:** la escena a pantalla completa, los instrumentos encima y el riel de etapas: no se parece a la V1 en nada.
- **B, 3:** la lectura narrativa es nueva, pero el tema claro y las figuras enmarcadas se leen como un documento con la V1 adentro, y el dueño rechazó el tema claro.
- **C, 1,5:** dos zonas, como la V1 de hoy en Reglas y Entrenar; el dueño dijo que "no mejora realmente la UI".
- **D, 4,5:** el riel, la noche de A y la escena al 50 % de la ventana [Medido], contra el 24,7 % de la V1. No llega a 5 porque la columna de ajustes a la derecha se parece, en el plano, al panel de la V1. La diferencia está en lo que contiene y en cómo se pliega.

Motivo de los demás puntajes de D:
- **Claridad, 4,5:** pregunta y acción encima de la escena, el contrato entra → sale en la banda de abajo, términos definidos al margen con resaltador.
- **Usabilidad, 4:** el mismo plano en las seis pantallas, el cuaderno siempre a la derecha y la escena sin nada encima salvo la pregunta. En Entrenar el cuaderno es largo: 2419 px de contenido en 673 visibles [Medido] (KD4).
- **Dos públicos, 4,5:** plegar el cuaderno deja la escena en el 70,9 % de la ventana [Medido], lo más cercano a un modo proyector; la guía se oculta como en las demás.
- **Paridad, 5:** 248 de 248 controles de la V1 en sus pantallas, verificado con un guion (abajo).
- **Esfuerzo, 3:** el armazón de A más el cuaderno, y el brillo del dibujo (`src/v2/render/`, D8).
- **Fluidez, 3:** el lienzo es más chico que en A (unas 2 veces el de la V1, no 3,6) y el desenfoque queda solo detrás de la pregunta; sigue el brillo. Sin medir.
- **Accesibilidad, 4:** 0 problemas medidos; el único texto sobre vidrio es la pregunta.

### Maqueta D (tareas 5b.2 y 5b.3)

En `borradores/interfaz-v2/maquetas/d/`, con `npm start`, en `/borradores/interfaz-v2/maquetas/d/index.html`. Pantallas: `#armazon`, `#problema`, `#reglas`, `#entrenar`, `#avanzado` (Entrenar con el cuaderno en "Red y sensores", como lo dejaría "Mostrame"), `#entender`, `#mentor` (Evaluar con la guía oculta) y `#plegado` (El problema con el cuaderno plegado).

| Eje | D · Cabina con cuaderno |
|---|---|
| Disposición | Tres zonas fijas: riel, escena protagonista con una banda debajo (percepción, acción, indicadores y marcha) y cuaderno a la derecha. La pregunta y la acción principal flotan sobre la escena, como en A. Nada más la tapa. |
| Navegación | El riel vertical de A, con "Por gradiente" como sub-paso de Aprender. |
| Ajustes | El cuaderno de B en oscuro: cuadrícula tenue, línea de margen rosa, títulos en Iowan Old Style, "Probá esto", "Más" y "Avanzado", el escenario compartido aparte y los términos definidos al margen. Se pliega con "Plegar cuaderno" y se abre con la lengüeta. |
| Dirección de arte | La noche de A (sus tokens, más una capa de cuaderno: `--color-cuaderno`, `--color-cuaderno-linea`, `--color-termino`). |

**Verificación de 5b.2** [Medido]:
- 0 errores en la consola en las 16 capturas.
- En el navegador: "Plegar cuaderno" pasa la columna de 360 px a 0, la lengüeta la vuelve a abrir, y se vuelve a plegar.
- Las 41 variables de los pintores están definidas (los tokens de A, sin quitar ninguna).

**Verificación de 5b.3** [Medido]: `borradores/interfaz-v2/paridad-d.mjs` toma, para cada pestaña de la V1, sus controles reales: 266 claves `data-help` medidas en el navegador a 1440×900, con Entrenar en sus tres vistas e Inspeccionar en pausa con una neurona elegida (`maquetas/d/inventario-v1.json`). Busca cada clave en el atributo `data-v1` de un control de la pantalla equivalente de D y asocia cada una a su capacidad de `paridad.md`. Resultado: **248 de 248 controles de la V1 están en D; 0 faltantes; 28 excluidos con su motivo** (rótulos de rol, el diálogo de créditos, la pantalla de falla, el aviso de destellos, y el ancho de las zonas, que `paridad.md` propone quitar). Se probó que el guion falla: al quitar a propósito `compete.penalty`, informó el faltante.

| Pantalla de D | Pestaña de la V1 | Controles de la V1 en D |
|---|---|---|
| El problema | El problema | 25 de 25 |
| Reglas a mano | Reglas a mano (editor, fichas, paleta, percepción con "+", ejemplos, exportar, importar, cuaderno de casos) | 49 de 49 |
| Aprender | Entrenar (capas, neuronas, activación, rayos, alcance, apertura, fitness, élite, selección, mutación, cruce, duración, lentos, tráfico, pistas y biblioteca) | 73 de 73 |
| Evaluar (mentor) | Competir (meta, tráfico de la carrera, penalización, competidores) | 33 de 33 |
| Entender | Inspeccionar con una neurona elegida | 57 de 57 |
| Barra y riel | Comunes | 11 de 11 |

Límite de esta verificación: comprueba que cada control de la V1 tiene un lugar con nombre en D, no que se comporte igual (D es una maqueta estática). Cuando un control se repite por fila (por ejemplo, el "+" de cada sensor o el apagado de cada conexión), se marca una sola fila.

### Medidas de D (tarea 5b.4) [Medido]

Capturas: `borradores/interfaz-v2/maquetas/capturas/indice-d.md` (16: 8 pantallas × 2 tamaños), con las de A al lado, y `lado-a-lado.html` para verlas en el navegador. Medidas en `medidas-d.json`.

| Pantalla, a 1366×768 | D: escena visible | A | V1 (área del lienzo) |
|---|---|---|---|
| El problema | **50,0 %** (lienzo 55,6 %) | 70,8 % | 24,7 % |
| El problema, cuaderno plegado | **70,9 %** | — | — |
| Reglas a mano | 24,8 % | — (no está en A) | 14,5 % |
| Aprender | 31,9 % | 41,7 % | 17,5 % |
| Entender (red) | 47,3 % | 61,5 % (escena y red) | red 599×420 |
| Evaluar, mentor | 46,1 % | 72,4 % | 24,7 % |

La estimación de 55 % para El problema era **[Hipótesis]**: el lienzo ocupa el 55,6 %, y lo visible queda en el 50,0 %, porque la pregunta flota encima.

En las 16 capturas: una sola acción principal, o ninguna donde se destaca la manipulación (El problema, Reglas a mano, plegado). Además, 0 controles sin tooltip, 0 sin nombre accesible, 0 objetivos de menos de 24 px, 0 textos bajo 4,5:1, 0 textos fuera de los diccionarios en español y en inglés, y 0 líneas que no cambian al pasar a inglés. La página no desplaza en ninguna pantalla; lo único que desplaza es el cuaderno (en El problema, 719 px en 673; en Entrenar, 2419 en 673; en Entender, 925 en 673). Tooltips al posar el cursor en tres controles por pantalla en Reglas, Avanzado y Evaluar: los nueve muestran el suyo.

### Crítica de D (tarea 5b.5, `design-skills:design-critique`)

| # | Hallazgo | Principio | Estado |
|---|---|---|---|
| KD1 | En Reglas a mano, la escena quedaba en el 13,7 % de la ventana, como en la V1: la percepción ocupaba la columna de la escena. | Principio 2; cambio notable | **corregido**: la percepción pasa compacta arriba del programa, y la escena tiene toda la altura (24,8 % visible). |
| KD2 | Los botones "5", "3" y "1" del filtro de conexiones medían menos de 24 px de ancho. | WCAG 2.5.8 | **corregido**: 28 px. |
| KD3 | El aviso "Restableciste el programa · Deshacer" tapaba la marcha de Reglas. | H8 | **corregido**: va en el cuaderno, junto a "Restablecer programa", que es lo que lo dispara. |
| KD4 | En Entrenar, "Avanzado" está abierto pero queda debajo del pliegue del cuaderno; es justo lo que el dueño no veía en C. | H6; queja del dueño | **corregido en parte**: "Mostrame" y la vista `#avanzado` llevan al lugar. **Queda** que el cuaderno de Entrenar es largo (2419 px). En la fase 3, "Avanzado" podría dividirse en sus tres grupos (Evolución, Generación, Red y sensores) con un índice arriba. |
| KD5 | Los botones de cámara salían en columna (el indicio de ayuda pisaba el `display`). | Visual | **corregido**. |
| KD6 | En Entrenar, la red del líder y la curva al costado dejaban la escena angosta y tapada por la pregunta. | Principio 2 | **corregido**: van en una franja debajo de la escena. **Queda** que la pregunta y el corte de generación tapan parte de la escena (31,9 % visible). |
| KD7 | El rótulo "de esta etapa" salía en letra de título dentro del cuaderno. | Visual | **corregido**. |
| KD8 | En Entender, la red se dibujaba chica por los márgenes que dejaban lugar a la pregunta y a la viñeta. | Principio 2 | **corregido**: 47,3 % visible. |
| KD9 | El amarillo de la acción y el de la élite son el mismo tono (heredado de A, K18). | "Un color, un significado" | **queda**: decidir en la fase 3. |
| KD10 | El brillo en rayos y faros necesita un dibujo propio y medir la fluidez. | D8, Art. 10 | **queda**: sin medir. |
| KD11 | En Evaluar (mentor), los autos están en carrera y la acción principal dice "Largar". Es una incoherencia de la maqueta estática. | H1 | **queda**: cosmético, de la maqueta. |
| KD12 | "Por gradiente" (el Laboratorio) es un enlace en el riel y no tiene pantalla en D. | Alcance de 5b.3 | **queda**: 5b.3 no lo pide. |

### Recomendación revisada (tarea 5b.5)

> **Recomendación, no decisión.** La elección es del dueño (tarea 6.1).

**Lo medido:** D es la única maqueta que muestra todos los ajustes de la V1 en sus pantallas (248 de 248). Duplica la escena de la V1 en El problema (50,0 % visible contra 24,7 % de área) y llega al 70,9 % con el cuaderno plegado. Pasa las mismas auditorías que las otras tres, y nada flota sobre la escena salvo la pregunta y la acción. Eso resuelve K12 y K13 de A.

**Lo opinado:** con el criterio de cambio notable y la opinión del dueño, recomiendo **D** en lugar de C. Toma lo que el dueño valoró de A (el riel, la noche, la escena protagonista) y de B (el cuaderno separado de la simulación). La consistencia de C ya está en D: la columna del cuaderno ocupa el mismo lugar en todas las etapas. Para la fase 3 quedarían:
1. dividir el "Avanzado" largo de Entrenar en sus grupos con un índice (KD4);
2. otro tono para la élite (KD9);
3. medir la fluidez del brillo antes de adoptarlo (KD10), y si no alcanza, el dibujo plano de los pintores de la V1 con los tokens de D;
4. el modo plegado como base del `modo-proyector` pendiente.
