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
| A | | | | | | | | |
| B | | | | | | | | |
| C | | | | | | | | |

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
