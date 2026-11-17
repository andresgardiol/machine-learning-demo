# Tasks

## 1. Antes y regla de la acción principal

- [x] 1.1 Confirmar que `borradores/jerarquia-de-botones/antes/` tiene las capturas y su `indice.md`, y que `capturar.mjs` las reproduce igual dos veces seguidas. Si faltan o no salen iguales, sacarlas o arreglar el guion antes de tocar estilos. Verificación: correr el guion con una carpeta temporal y comparar contra `antes/`.
  *Hecho. Medido: `antes/` tiene 120 PNG e `indice.md`. Se corrió `capturar.mjs repro-1-1` (borrada después) sobre el mismo código y se comparó píxel a píxel con `antes/`: 101 de 120 idénticas byte a byte; 16 difieren en 1 a 29 píxeles sueltos (suavizado de texto); tres difieren más: `11-inspeccionar-entrar-1366` (2743 px) y `12-inspeccionar-neurona-1366` (2346 px), por los puntitos de "Flujo" que ya anota el índice, y `16-laboratorio-tu-manejo-1440` (1620 px, en un recuadro de 200×210 px sobre los rayos de los sensores). Observado: en ese recorte los rayos se ven iguales a simple vista; es suavizado del lienzo. Los recortes de botones salieron todos iguales salvo dos de "Decisión de la red" (1 y 11 px). No hizo falta tocar el guion.*
- [x] 1.2 `src/ui/main-action.js` con `mainAction(tab, state)` (D3), y sus pruebas en `tests/main-action.test.js`. Casos a probar:
  - la marcha es la acción principal en las seis pestañas por defecto;
  - con un choque, Reiniciar, en El problema y en Reglas a mano;
  - con la selección manual pendiente, Elegir al líder;
  - con la carrera terminada, Otra carrera;
  - con el cartel de largada a la vista, el botón del cartel;
  - en la vista de cerebros de Entrenar, Guardar como nuevo;
  - en la vista de ajustes de Entrenar, ninguna;
  - con un diálogo abierto, el diálogo;
  - mismo estado, mismo resultado.

  Verificación: `npm test`.
  *Hecho. `src/ui/main-action.js` con `mainAction(tab, state)` y `TABS_WITH_RUN`; sin DOM ni importaciones. Medido: `tests/main-action.test.js` cubre los nueve casos; `npm test` pasa (1300 de 1300). El diálogo va primero; en Competir, la carrera terminada gana al cartel de largada.*
- [x] 1.3 Agregar `applyMainAction(buttons, key)` y su prueba con botones falsos: pone `primary` en uno solo y lo saca de los demás. Verificación: `npm test`.
  *Hecho. `applyMainAction(buttons, key)` en el mismo módulo: recibe `{clave: botón}`, alterna `primary` y saltea botones nulos. Medido: prueba con botones falsos (uno solo con `primary`, `null` saca todos, no toca otras clases); `npm test` pasa.*

## 2. Tokens y estilos

- [x] 2.1 Agregar en `styles/tokens.css` los tokens de D1, con un comentario de para qué es cada uno. Prueba en `tests/control-contrast.test.js`, o en una prueba hermana:
  - el texto sobre `--color-action`, `--color-selected-bg` y `--color-output-on` da 4,5:1 o más;
  - `--color-selected-border` da 3:1 o más sobre `--color-bg`, `--color-surface` y `--color-surface-2`;
  - `--color-selected-bg` difiere de `--color-surface-2`.

  Verificación: `npm test`.
  *Hecho. Tokens `--color-action`, `--color-on-action`, `--color-selected-bg` (#2c435f), `--color-selected-border`, `--color-output-on`, `--color-output-on-border` y `--color-on-output`, cada uno con su comentario; `--color-accent` anotado como foco, pestaña elegida y enlaces. Prueba hermana `tests/hierarchy-styles.test.js`. Medido: texto sobre la acción 6,80:1; texto sobre la opción elegida 8,93:1; texto sobre la salida encendida 4,79:1; contorno elegido 6,80 / 6,06 / 5,28:1 sobre fondo, panel y tarjeta; fondo elegido contra `--color-surface-2` 1,39:1 en luminancia (la prueba pide 1,3 o más). Los valores de la salida son los de la alternativa de 2.5. `npm test` pasa (1306).*
- [x] 2.2 Estilos de acción principal y secundaria en `styles/app.css` (D2, puntos 1 y 2), con `.tool.primary` ganándole a `[aria-pressed]`. Verificación: una prueba que lee `app.css` y afirma que `var(--color-action)` como `background` solo aparece en reglas de `.tool.primary`; y `npm test`.
  *Hecho. `.tool` pasa a fondo transparente, contorno `--color-control-border` y 14 px; al pasar el cursor, contorno acento y fondo `--color-surface-2`. `.tool.primary` (también con `[aria-pressed]` y `:hover`) va al final de `app.css` para ganarle a las reglas de zona: relleno `--color-action`, 15 px en negrita, 36 px de alto mínimo y 16 px de relleno lateral. Medido: la prueba que lee `app.css` confirma que `background: var(--color-action)` solo está en reglas de `.tool.primary`, y otra que ningún control se rellena con `--color-accent`; `npm test` pasa. Observado en el navegador: "Reproducir" de Inspeccionar con `aria-pressed` sigue azul relleno, 15 px negrita.*
- [x] 2.3 Una sola regla de opción elegida (D2, punto 3) para todos los selectores:
  - `.tool[aria-pressed="true"]`, `.segment`, `.lang-option` y `.camera-button[data-active]`;
  - `.inspector-knob-switch`, `.compete-check`, `.curve-chip` y `.bar-track`.

  Verificación: en el navegador, los cuatro casos del escenario "Mismo aspecto en distintas pestañas" con los mismos estilos calculados.
  *Hecho. Una regla compartida al final de `app.css` para los ocho selectores: fondo `--color-selected-bg`, contorno `--color-selected-border`, texto `--color-text` en negrita; segmentos e idioma con sombra interior de 2 px, los que tienen borde con 1 px de borde y 1 px de sombra, la pista con su borde de 2 px. Medido en el navegador (1440×900), estilos calculados idénticos en los cuatro casos del escenario: carril "3", "ES", "1×" de Entrenar y "Cuadro" de Inspeccionar dan fondo rgb(44,67,95), sombra interior de 2 px rgb(78,161,255) y peso 700. La perilla-interruptor del Laboratorio encendida da el mismo fondo y contorno. Sin probar en el navegador: `.curve-chip` elegida. `.compete-check` no lo usa ningún elemento de `src/` hoy; su regla se actualizó igual.*
- [x] 2.4 Interruptores encendidos (D2, punto 4) en la barra de arriba, en Inspeccionar y en el panel. Verificación: escenario "Interruptores encendidos" y la perilla del lado derecho.
  *Hecho. Riel encendido con `--color-selected-bg` y contorno `--color-selected-border`; perilla de ese color, corrida 14 px a la derecha (12 px en Inspeccionar, regla que ya existía). Medido en el navegador: Guía, Ayudas y Atajos encendidos dan riel rgb(44,67,95), perilla rgb(78,161,255) con `translateX(14px)`; ningún riel con relleno pleno azul.*
- [x] 2.5 Salida de la red (D2, punto 5): `.action-key` encendida con `--color-output-on`, sin cursor de mano ni cambio al pasar el cursor, y "titubea" mezclando hacia `--color-output-on`. Verificación: escenarios "La salida de la red no parece botón" y "La red titubea", con Inspeccionar reproduciendo un cerebro de ejemplo. **Si la tecla encendida llama más la atención que la acción principal en las capturas, aplicar la alternativa de Risks y avisar.**
  *Hecho, con la alternativa de Risks. Medido: con el blanco pleno, la tecla encendida daba 15,1:1 contra el panel y la acción principal 5,3:1 contra su barra; observado en la captura de Inspeccionar a 1440 que "Avanzar" en blanco era lo más brillante de la columna y competía con "Reproducir". Se aplicó la alternativa: relleno `#6d737b` (blanco al 35 % sobre `--color-surface-2`), contorno blanco de 2 px (1 px de borde y 1 px de sombra, sin mover nada) y letra blanca en negrita (4,79:1). "Titubea" mezcla hacia `--color-output-on` con el rayado fijo y el borde punteado. Medido en el navegador: `.action-key` con `cursor: default`, ninguna regla `:hover` la alcanza, encendida sin el color de acción. Observado en `capturar.mjs`: "Derecha" de la captura 11 se ve quieta, rayada, a medio encender y gris, sin azul. Las capturas con el blanco pleno quedaron en `borradores/jerarquia-de-botones/tecla-blanca/` para que el dueño compare. **Aviso al dueño.***
- [x] 2.6 Créditos como `.link-button` (D2, punto 6), con su tooltip intacto. Verificación: `mlLab.auditTooltips()` sin problemas nuevos.
  *Hecho. Créditos pasa a `link-button credits-button` (subrayado, color acento, sin contorno). Medido en el navegador: `mlLab.auditTooltips()` da 0 problemas; al pasar el cursor el tooltip "Qué hace / Por qué importa" de Créditos aparece igual. Sin probar: la "i" de menos de 1240 px.*

## 3. Una acción principal por pestaña

- [x] 3.1 Usar `mainAction` y `applyMainAction` en El problema y Reglas a mano, con la marcha y el Reiniciar del aviso. Quitar el `primary` fijo del aviso. Verificación: escenarios "El problema en marcha" y "Choque y vuelta atrás", en las dos pestañas.
  *Hecho. El problema y Reglas a mano llaman a `applyMainAction({ run, restart }, mainAction(...))` en su `sync()`; el Reiniciar del aviso perdió el `primary` fijo. En Reglas cuenta como choque a la vista el aviso visible (con "Reintentar solo" encendido no hay aviso y la marcha sigue siendo la principal). Medido en el navegador, avanzando el mundo a mano porque el panel estaba oculto: El problema muestra "Pausar (espacio)" como única principal; con el choque, solo "Reiniciar (R)" del aviso; al reiniciar, vuelve "Pausar". En Reglas, con "Reintentar solo" apagado, lo mismo. Medido también en `capturar.mjs` (estados 01 a 05, a 1440 y 1366).*
- [x] 3.2 Lo mismo en Entrenar:
  - marcha, en la vista de entrenamiento;
  - Elegir al líder, con la selección manual;
  - Guardar como nuevo, en la vista de cerebros;
  - Guardar campeón pasa a secundario.

  Verificación: escenarios "Entrenar con selección manual" y "Guardar no compite con la marcha".
  *Hecho. Entrenar llama a `syncMainAction()` en `sync()` y al cambiar de vista. "Selección manual pendiente" se tomó como modo manual sin padre elegido (`training.parent` nulo), que es cuando el panel dice que falta elegir; en manual, el padre elegido sigue de una generación a la otra. Guardar campeón y Guardar como nuevo perdieron el `primary` fijo. Medido en el navegador: vista de entrenamiento, "Pausar"; ajustes, ninguna; cerebros, "Guardar como nuevo"; "Guardar campeón" con clase `tool save-quick`; en modo "Vos", "Elegir al líder (E)"; después de elegir, "Pausar" otra vez.*
- [x] 3.3 Lo mismo en Competir, Inspeccionar y Laboratorio:
  - en Competir: marcha, cartel de largada y Otra carrera;
  - en el Laboratorio, Agregar una capa oculta y Guardar como cerebro pasan a secundarios.

  Medir a 1440×900 y a 1366×768 que la barra de marcha de Inspeccionar y la del Laboratorio entran sin cortes con 36 px de alto. Si sobra lugar, probar 40 px; si corta, dejar 32 px (Risks). Anotar la medida. Verificación: escenarios "Competir con el cartel de largada", "Carrera terminada" y "Laboratorio".
  *Hecho. Competir: la marcha y el botón del cartel sin `primary` fijo; `applyMainAction` en `sync()`. Con la carrera terminada la principal es el mismo botón de marcha, que entonces dice "Otra carrera (espacio)"; el "Otra carrera" chico sigue secundario. Inspeccionar y Laboratorio: la marcha toma `primary` con `applyMainAction` al crearse; "Agregar una capa oculta" y "Guardar como cerebro" quedaron secundarios. Medido con `capturar.mjs` en los seis estados de Inspeccionar y Laboratorio, a 1440×900 y 1366×768: antes (60b4397, en un worktree aparte, ya borrado) la barra medía 69 px y el botón 28; con 36 px, la barra mide 77 y no hay cortes ni desbordes; con 40 px, 81, también sin cortes ni desbordes, y en las capturas a 1366 la red y la leyenda de arriba se ven enteras. Se dejó en **40 px**. Medido en la auditoría: 09 con "Largar" del cartel como única principal (la marcha del panel, secundaria); 10 con "Otra carrera (espacio)" como única.*
- [x] 3.4 `auditHierarchy()` en `src/ui/audit.js`, expuesta como `mlLab.auditHierarchy()` (D4). Correrla en las seis pestañas y en los estados del guion de capturas. Verificación: cero avisos; escenarios "El azul relleno es solo de la acción principal", "Al abrir la app" y "Diálogo de confirmación".
  *Hecho. `auditHierarchy()` en `src/ui/audit.js`, expuesta como `mlLab.auditHierarchy()`; el guion de capturas la corre en cada foto y la guarda en `auditoria.json`. Cambio respecto de D4: cuenta solo los controles (el mismo selector que `auditTooltips`). Lo que no es control y tiene el mismo azul se lista aparte en `marks`, sin contarlo como problema: las barras de los sensores (`--color-sensor`) y las de las misiones (`--color-accent`). Sin ese filtro daba 10 avisos por estado en El problema. Medido: 0 problemas en los 36 estados del guion (18 a 1440 y 18 a 1366), con exactamente una principal por estado; ninguna en Ajustes de Entrenar; en la confirmación de reemplazar el programa, "Reemplazar" adentro del diálogo y "Pausar" afuera.*
- [x] 3.5 Comprobar que nada cambió de comportamiento:
  - cada botón que cambió de estilo hace lo mismo con el mouse y con su atajo, con el mismo texto y tooltip en español y en inglés;
  - con la misma semilla, la simulación da los mismos resultados que antes. Usar las pruebas del núcleo que ya existen; no entrenar redes para comprobar que aprenden.

  Verificación: `npm test` completo, escenarios "Mismo comportamiento" y "Determinismo", y `mlLab.auditTooltips()` sin problemas nuevos en los dos idiomas.
  *Hecho. Medido: el diff contra 60b4397 en `src/` solo cambia clases (`primary` sacado, Créditos a `link-button`), agrega las llamadas a `applyMainAction` y la auditoría; ningún `i18n`, `help` ni manejador cambió, y `button()` ya usaba `tool` por defecto. En el navegador: Pausar de El problema y de Entrenar alterna con el clic y con espacio; Reproducir de Inspeccionar y del Laboratorio, igual; en Competir, espacio larga desde el cartel. `mlLab.auditTooltips()` da 0 en las seis pestañas, en español y en inglés. `npm test` pasa (1306 de 1306), incluidas las de reproducibilidad, azar, evolución y carrera (91). No se entrenó ninguna red. Sin probar: los atajos R, E, Z y N uno por uno; sus manejadores no se tocaron.*

## 4. Después y cierre

- [ ] 4.1 Correr `capturar.mjs despues` y armar `borradores/jerarquia-de-botones/comparacion.md`: el antes y el después de cada captura, lado a lado, con una línea de qué cambió y qué no. Anotar los estados que no salieron iguales.
- [ ] 4.2 Revisar las capturas del después en escala de grises: la acción principal, la opción elegida, el interruptor encendido y la salida encendida se reconocen sin color (escenario "Estado sin depender del color"). Verificación: una captura en escala de grises por pestaña, en la comparación.
- [ ] 4.3 Verificación manual en el navegador contra el filtro de entrada, en las seis pestañas, a 1440×900 y 1366×768, con la guía encendida y apagada:
  - ¿se ve qué tocar sin leer?;
  - ¿el mentor no tiene nada nuevo que ocultar?;
  - ¿un estilo mal entendido se arregla sin perder nada?

  Anotar lo observado separado de lo propuesto.
- [ ] 4.4 Anotar en `PENDIENTES.md`:
  - lo que quedó: los sensores del mismo azul que la acción (Risks) y lo que no se pudo medir;
  - que `jerarquia-de-botones` está hecho, sacándolo de "En curso".

  Verificación: `git diff PENDIENTES.md`.

## Workflow follow-up

- Archivar con `/opsx:archive` cuando el dueño revise la comparación del antes y el después.
- Después, el informe sugiere `barra-de-escenario-plegable` y `tarjeta-de-consigna`. Las tres propuestas del recorrido guiado van después de esos cambios.
