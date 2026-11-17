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

- [ ] 2.1 Agregar en `styles/tokens.css` los tokens de D1, con un comentario de para qué es cada uno. Prueba en `tests/control-contrast.test.js`, o en una prueba hermana:
  - el texto sobre `--color-action`, `--color-selected-bg` y `--color-output-on` da 4,5:1 o más;
  - `--color-selected-border` da 3:1 o más sobre `--color-bg`, `--color-surface` y `--color-surface-2`;
  - `--color-selected-bg` difiere de `--color-surface-2`.

  Verificación: `npm test`.
- [ ] 2.2 Estilos de acción principal y secundaria en `styles/app.css` (D2, puntos 1 y 2), con `.tool.primary` ganándole a `[aria-pressed]`. Verificación: una prueba que lee `app.css` y afirma que `var(--color-action)` como `background` solo aparece en reglas de `.tool.primary`; y `npm test`.
- [ ] 2.3 Una sola regla de opción elegida (D2, punto 3) para todos los selectores:
  - `.tool[aria-pressed="true"]`, `.segment`, `.lang-option` y `.camera-button[data-active]`;
  - `.inspector-knob-switch`, `.compete-check`, `.curve-chip` y `.bar-track`.

  Verificación: en el navegador, los cuatro casos del escenario "Mismo aspecto en distintas pestañas" con los mismos estilos calculados.
- [ ] 2.4 Interruptores encendidos (D2, punto 4) en la barra de arriba, en Inspeccionar y en el panel. Verificación: escenario "Interruptores encendidos" y la perilla del lado derecho.
- [ ] 2.5 Salida de la red (D2, punto 5): `.action-key` encendida con `--color-output-on`, sin cursor de mano ni cambio al pasar el cursor, y "titubea" mezclando hacia `--color-output-on`. Verificación: escenarios "La salida de la red no parece botón" y "La red titubea", con Inspeccionar reproduciendo un cerebro de ejemplo. **Si la tecla encendida llama más la atención que la acción principal en las capturas, aplicar la alternativa de Risks y avisar.**
- [ ] 2.6 Créditos como `.link-button` (D2, punto 6), con su tooltip intacto. Verificación: `mlLab.auditTooltips()` sin problemas nuevos.

## 3. Una acción principal por pestaña

- [ ] 3.1 Usar `mainAction` y `applyMainAction` en El problema y Reglas a mano, con la marcha y el Reiniciar del aviso. Quitar el `primary` fijo del aviso. Verificación: escenarios "El problema en marcha" y "Choque y vuelta atrás", en las dos pestañas.
- [ ] 3.2 Lo mismo en Entrenar:
  - marcha, en la vista de entrenamiento;
  - Elegir al líder, con la selección manual;
  - Guardar como nuevo, en la vista de cerebros;
  - Guardar campeón pasa a secundario.

  Verificación: escenarios "Entrenar con selección manual" y "Guardar no compite con la marcha".
- [ ] 3.3 Lo mismo en Competir, Inspeccionar y Laboratorio:
  - en Competir: marcha, cartel de largada y Otra carrera;
  - en el Laboratorio, Agregar una capa oculta y Guardar como cerebro pasan a secundarios.

  Medir a 1440×900 y a 1366×768 que la barra de marcha de Inspeccionar y la del Laboratorio entran sin cortes con 36 px de alto. Si sobra lugar, probar 40 px; si corta, dejar 32 px (Risks). Anotar la medida. Verificación: escenarios "Competir con el cartel de largada", "Carrera terminada" y "Laboratorio".
- [ ] 3.4 `auditHierarchy()` en `src/ui/audit.js`, expuesta como `mlLab.auditHierarchy()` (D4). Correrla en las seis pestañas y en los estados del guion de capturas. Verificación: cero avisos; escenarios "El azul relleno es solo de la acción principal", "Al abrir la app" y "Diálogo de confirmación".
- [ ] 3.5 Comprobar que nada cambió de comportamiento:
  - cada botón que cambió de estilo hace lo mismo con el mouse y con su atajo, con el mismo texto y tooltip en español y en inglés;
  - con la misma semilla, la simulación da los mismos resultados que antes. Usar las pruebas del núcleo que ya existen; no entrenar redes para comprobar que aprenden.

  Verificación: `npm test` completo, escenarios "Mismo comportamiento" y "Determinismo", y `mlLab.auditTooltips()` sin problemas nuevos en los dos idiomas.

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
