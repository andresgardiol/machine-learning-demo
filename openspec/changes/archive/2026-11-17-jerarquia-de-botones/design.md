# Design

## Context

Hoy los estilos de los controles se reparten así (medido en el código, `styles/app.css` y `styles/tokens.css`):

- `--color-accent` (`#4ea1ff`) rellena siete cosas distintas:
  - `.tool.primary`;
  - `.tool[aria-pressed="true"]`, `.segment[aria-pressed="true"]` y `.lang-option[aria-pressed="true"]`;
  - `.camera-button[data-active]`;
  - el riel de `.switch[aria-checked="true"]`, `.inspector-knob-switch` y `.compete-check`;
  - las teclas de salida encendidas (`.action-key[data-on="true"]`).
- El mismo azul es además el de los sensores (`--color-sensor`), el contorno de foco y el borde de la pestaña elegida.
- `.tool` es el botón de toda la app: fondo `--color-surface-2` y contorno `--color-control-border`. Se usa igual para la marcha, para Restablecer y para Créditos.
- La clase `primary` está hoy en Reiniciar del aviso de choque (El problema y Reglas a mano), Elegir al líder, Guardar campeón y Guardar como nuevo (Entrenar), la marcha y el botón del cartel de largada (Competir), la marcha de Inspeccionar y del Laboratorio, Agregar una capa oculta y Guardar como cerebro (Laboratorio), y los diálogos de confirmación y de error.
- La marcha de El problema, Reglas a mano y Entrenar no lleva `primary`.
- `tests/control-contrast.test.js` lee los colores de `tokens.css` como `#rrggbb` y mide contrastes de WCAG. Las pruebas corren en Node sin DOM. La lógica que se prueba vive en funciones puras, como `createConfirmation`.

La evidencia de lo que se ve está en `borradores/analisis-ux/informe.md`, en §1 y §3, y en las capturas del antes en `borradores/jerarquia-de-botones/antes/`.

## Goals / Non-Goals

**Goals:**
- Que el color de acción relleno quede reservado a la acción principal y que eso se pueda verificar con una prueba y con una auditoría en el navegador.
- Que qué botón es la acción principal en cada estado salga de una función pura, probada sin DOM, en vez de clases sueltas en cada pestaña.
- Que el después se pueda comparar con el antes, captura por captura.

**Non-Goals:**
- Rediseñar los botones de solo ícono, el tamaño de las fichas de peso o la paleta del dibujo en el lienzo.
- Cambiar el contorno de foco o el borde de la pestaña elegida: no son rellenos, y el foco tiene que seguir viéndose igual en toda la app.

## Decisions

### D1. Tokens propios para la acción, la opción elegida y la salida

Se agregan estos tokens en `tokens.css`, todos en `#rrggbb` para que las pruebas los lean:

| Token | Para qué | Valor de partida |
|---|---|---|
| `--color-action` | Relleno de la acción principal | `#4ea1ff`, el azul de hoy |
| `--color-on-action` | Texto sobre la acción principal | `#12161c` |
| `--color-selected-bg` | Fondo de una opción elegida | cerca de `#2c435f` (el acento al 20 % sobre `--color-surface-2`) |
| `--color-selected-border` | Contorno de una opción elegida y perilla de un interruptor encendido | `#4ea1ff` |
| `--color-output-on` | Relleno de una salida encendida | `--color-neuron-active` (`#f5f7fa`) |
| `--color-on-output` | Texto sobre una salida encendida | `#12161c` |

`--color-accent` queda para el foco, la pestaña elegida y los enlaces. Los valores finales se ajustan midiendo:

- el texto da 4,5:1 o más sobre `--color-action`, sobre `--color-selected-bg` y sobre `--color-output-on`;
- `--color-selected-border` da 3:1 o más sobre `--color-bg`, `--color-surface` y `--color-surface-2`;
- `--color-selected-bg` se distingue de `--color-surface-2` a simple vista y en escala de grises.

*Por qué el azul sigue siendo el de la acción:* Competir, Inspeccionar y Laboratorio ya usan ese azul para su acción principal. Es lo que mejor funciona hoy según el informe, y el que ya los usó lo reconoce. *Alternativa descartada:* un color nuevo para la acción, como un naranja. Ese naranja ya es el del tráfico, y la paleta de dibujo tiene ocupados el verde, el rojo, el violeta, el amarillo, el verde agua y el rosa.

*Por qué la salida encendida usa el blanco de la neurona activa:* en el diagrama de la red, una neurona activa se rellena con `--color-neuron-active`, y la tecla encendida es esa misma salida. Así "encendido" se ve igual en la red y en las teclas (art. 9) y deja de parecer un botón azul. *Alternativa descartada:* el verde del auto, que en la app significa "el auto", no "la salida de la red".

### D2. Los cuatro estilos en CSS

1. **Acción principal: `.tool.primary`.**
   - Relleno `--color-action`, texto `--color-on-action`, letra de 15 px en negrita.
   - Alto mínimo de 36 px y relleno lateral de 16 px.
   - Con `aria-pressed`, porque la marcha de Inspeccionar lo usa, sigue con el mismo estilo. La regla de opción apretada no puede ganarle.

   El informe proponía 16 px y 40 px de alto. Se parte de 36 px porque la barra de marcha de Inspeccionar es angosta. Si a 1366×768 entra sin cortar nada, se sube a 40 px. Esto se mide en la tarea 3.3.
2. **Acción secundaria: `.tool`.**
   - Fondo transparente, contorno `--color-control-border`, letra de 14 px.
   - Al pasar el cursor, contorno `--color-accent` y fondo `--color-surface-2`.
   - `.tool.small` sigue siendo la variante compacta de las barras densas.
3. **Opción elegida.** Una sola regla, compartida por todos los selectores de la tabla de Impacto de la propuesta. Fondo `--color-selected-bg`, contorno `--color-selected-border`, texto `--color-text` en negrita.

   En un grupo de segmentos, donde no hay contorno propio por opción, el contorno va como sombra interior de 2 px. Así el estado no depende solo del color: lo marcan el fondo, el contorno y la negrita.
4. **Interruptor encendido.**
   - Riel: `--color-selected-bg` con contorno `--color-selected-border`.
   - Perilla: `--color-selected-border`, del lado derecho.
5. **Salida de la red: `.action-key`.**
   - Apagada: como hoy, pero sin contorno de control: contorno `--color-border`, el de las líneas que solo separan zonas.
   - Encendida: relleno `--color-output-on`, texto `--color-on-output` y negrita.
   - En los dos casos: `cursor: default` y sin cambio al pasar el cursor.
   - "Titubea" mantiene el rayado fijo y el borde punteado, pero la mezcla va hacia `--color-output-on` en vez de hacia el acento.
6. **Créditos** pasa a `.link-button`, como los enlaces que ya hay.

### D3. La acción principal sale de una función pura

`src/ui/main-action.js` exporta `mainAction(tab, state)`. Recibe la pestaña y lo mínimo del estado:

- `crashed`;
- `manualPending`;
- `raceFinished`;
- `startCardVisible`;
- `panelView`;
- `dialogOpen`.

Devuelve qué control es el principal: `'run'`, `'restart'`, `'chooseLeader'`, `'another'`, `'startCard'`, `'saveAsNew'`, `'dialog'` o `null`. Es la tabla del requisito "La marcha es la acción principal", escrita una vez.

Cada pestaña llama a una ayuda chica, `applyMainAction(buttons, key)`, en el `sync()` que ya tiene. La ayuda pone `primary` en el botón que corresponde y lo saca de los demás. Las clases `primary` fijas de hoy se quitan: Guardar campeón, Agregar una capa oculta, Guardar como cerebro y Reiniciar del aviso. Las de los diálogos se quedan, porque el diálogo siempre es su propia acción principal.

*Por qué así:* hoy la jerarquía está desparramada en once `class: 'tool primary'` y por eso se rompió. Con una función pura, la regla "una sola por estado" se prueba en Node, como `createConfirmation`. *Alternativa descartada:* resolverlo solo con CSS, con selectores por estado. El estado del choque o de la selección manual no está en el DOM de forma uniforme, y no se podría probar sin navegador.

### D4. Auditoría en el navegador

`src/ui/audit.js` suma `auditHierarchy()`, que se expone como `mlLab.auditHierarchy()`, junto a `auditTooltips()`. Hace dos cosas:

- lista los elementos visibles cuyo fondo calculado es `--color-action`, y avisa si hay más de uno por pestaña, salvo un diálogo abierto;
- lista los elementos con fondo `--color-action` que no son `.tool.primary`.

La usan la verificación manual y el guion de capturas. No corre en producción: solo cuando alguien la llama desde la consola.

### D5. Capturas del antes y del después

El guion `borradores/jerarquia-de-botones/capturar.mjs` recibe la carpeta de salida (`antes` o `despues`). Fija el tamaño de ventana, el idioma, la guía, el azar y el momento de cada estado. El antes ya se sacó sobre `60b4397`, con su índice. Al final del cambio se corre con `despues`, y se arma `borradores/jerarquia-de-botones/comparacion.md`: una tabla con el antes y el después de cada captura, una al lado de la otra, con una línea de qué cambió. Si un estado no sale igual dos veces, se anota en vez de forzarlo.

## Risks / Trade-offs

- **La tecla encendida en blanco puede llamar más la atención que la acción principal.** Se mide en las capturas del después. Si pasa, la salida encendida usa el blanco al 35 % sobre `--color-surface-2`, con contorno de 2 px blanco y negrita, y se anota la medida.
- **Opción elegida demasiado parecida a una sin elegir**, sobre todo en los segmentos chicos. Se prueba en escala de grises (escenario "Estado sin depender del color"). Si no alcanza, se sube el tono de `--color-selected-bg` antes de tocar otra cosa.
- **36 px de alto en la barra de marcha de Inspeccionar y del Laboratorio puede cortar algo a 1366×768.** Se mide en la tarea 3.3. Si corta, se queda en 32 px con la letra de 15 px en negrita, y se anota.
- **Las pruebas que miran clases o colores pueden romperse** (por ejemplo `tests/control-contrast.test.js`, que lee `app.css`). Se corren después de cada grupo y se ajustan solo si la prueba describía el estilo viejo, no un requisito.
- **Que alguien entienda "azul = tocá acá" y busque el azul en los sensores**, que son del mismo azul. Es un riesgo conocido y queda fuera de alcance. Se anota en PENDIENTES para ver con el dueño si los sensores necesitan otro tono.

**Rendimiento.** No toca el bucle de simulación ni el de dibujo. Las teclas de salida ya cambian `data-on` en cada cuadro, y solo cambia la regla de CSS que las pinta. `applyMainAction` corre en el `sync()` que ya existe y cambia a lo sumo dos clases.

**Núcleo y dependencias.** `main-action.js` vive en `src/ui/`, no importa nada del DOM y no lo usa el núcleo. No hay dependencias nuevas ni paso de build.

## Migration Plan

No hay datos guardados que migrar: las preferencias y los cerebros no guardan estilos. Para volver atrás se revierten `tokens.css`, `app.css` y las llamadas a `applyMainAction`; la lógica de los controles no cambia.
