# Tasks

## 1. Antes, tabla y textos

- [x] 1.1 Confirmar que `borradores/misiones-que-muestran-el-control/antes/` tiene las capturas, `indice.md` y `medidas.md`, y que el guion las reproduce igual dos veces seguidas. Si falta algo, sacarlo antes de tocar código. Verificación: correr el guion con una carpeta temporal y comparar.
  *Hecho. `antes/` tiene las 68 capturas, `indice.md`, `medidas.md` y `medidas.json`. Medido: corrí el guion en una carpeta temporal; `medidas.json` y la tabla de `medidas.md` salen idénticos byte a byte. Píxel a píxel (con `comparar-pixeles.mjs`, copiado de `tarjeta-de-consigna`): 57 de 68 iguales; 8 difieren en 1 a 108 píxeles sueltos; `09-…` en ~1900 px (los puntitos de Flujo, ya conocidos); `06-laboratorio-entrar-1440` (y sus dos recortes) difiere en 58 167 px de suavizado de texto, y repitiéndolo con `--solo` vuelve a salir igual a la nueva corrida, no a la guardada: la guardada es la rara. Observado: a simple vista son iguales. Para el después, esa captura se compara contra la corrida nueva.*
- [x] 1.2 `src/ui/mission-targets.js` con `missionTarget(tab, missionId, state)` (D1), igual a las tablas de los requisitos "Controles de las misiones de …", uno por pestaña. Pruebas en `tests/mission-targets.test.js`:
  - toda misión de cada sesión tiene una entrada;
  - las marcadas "—" devuelven `null`;
  - OR y XOR cambian con `gate` y `hiddenLayers`;
  - memorizar devuelve tres controles;
  - mismo estado, mismo resultado.

  Verificación: `npm test`.

  *Hecho. `src/ui/mission-targets.js` y `tests/mission-targets.test.js` (9 pruebas, pasan). Medido: las 22 misiones de las seis sesiones tienen entrada; 18 tienen control y 4 devuelven `null` (el design decía "11 de las 22": la cuenta de la spec da 18, corregido en el design). Orden de claves: la primera recibe el foco, así que Inspeccionar → seguir la cuenta es `['step', 'sizeOperation']` (el foco va a Paso, como dice la spec) y Laboratorio → seguir una corrección, `['step', 'sizePhase']` por analogía. Decisión a confirmar con el dueño (anotada en el design, D1): con XOR, sin capa oculta y sin que la guía haya explicado todavía que una recta no alcanza, "Agregar una capa oculta" no existe; la tabla devuelve el primer peso. Por eso `state` lleva también `addHidden`.*
- [x] 1.3 Los textos de D5 en `src/i18n/es.js` y `en.js`. Verificación: `npm test`, con `tests/i18n.test.js` sin claves de un solo idioma.
  *Hecho. Las cuatro claves de D5 en los dos idiomas. Medido: `npm test` completo, 1333 pruebas pasan, `tests/i18n.test.js` incluido.*

## 2. Mecanismo y botón

- [ ] 2.1 `src/ui/reveal.js` con `revealControls` (D2): trae a la vista, marca, pasa el foco, anuncia y saca la marca a los 4 s o con otra interacción. Si se puede probar sin navegador (la cuenta del tiempo y quitar la marca), con su prueba. Verificación: `npm test`.
- [ ] 2.2 El anillo en `styles/app.css`, con el token `--color-reveal` (D3) y su prueba de contraste en `tests/control-contrast.test.js` (3:1 o más sobre las cuatro superficies, y distinto de `--color-accent`). Menos movimiento, sin transición. Verificación: `npm test`, y en el navegador el escenario "Menos movimiento" con la preferencia emulada.
- [ ] 2.3 "Mostrame" en la tarjeta (D4): `setMission` con `reveal`, botón compacto con la clase `guide` y su tooltip. Verificación: escenarios "Misión con control", "Misión sin control", "Guía apagada" e "Idioma", y `mlLab.auditTooltips()` sin problemas.

## 3. En cada pestaña

- [ ] 3.1 El problema y Reglas a mano: traducir las claves a nodos (Ver como la máquina, el editor y Tráfico nuevo) y llamar a `revealControls`. Verificación: escenario "Cambia con la misión". Con el editor, el foco queda adentro sin mover el cursor del texto.
- [ ] 3.2 Entrenar: Guardar campeón y Función de fitness, que exige cambiar a la vista Ajustes. Verificación: escenarios "Fitness en otra vista" y "No cambia nada".
- [ ] 3.3 Competir: Pista en la barra de escenario y la marcha. Verificación: escenario "Control en la barra de escenario", y que "Mostrame" en "Ganarle a un cerebro manejando" no larga la carrera.
- [ ] 3.4 Inspeccionar: Paso; la entrada a mano y Apagar, eligiendo antes la entrada o la primera neurona oculta. Verificación: escenario "Elegir en Inspeccionar y volver atrás", sin apagar nada ni cambiar ningún valor.
- [ ] 3.5 Laboratorio: el primer peso, Agregar una capa oculta (o el peso, según el estado), Paso, Cantidad, Ruido y las capas ocultas, y Guardar como cerebro. Verificación: escenarios "Varios controles" y "Depende del estado".
- [ ] 3.6 En el navegador, para cada fila de la tabla con control: tocar "Mostrame" y comprobar que el nodo existe, queda marcado y tiene el foco, a 1440×900 y 1366×768. Verificación: una línea por misión en la nota de la tarea, con lo medido.

## 4. Sin destellos, determinismo, después y cierre

- [ ] 4.1 Medir el anillo con el método de `sin-destellos-en-la-red`, el brillo cuadro a cuadro durante 4 s. Verificación: escenarios "Anillo quieto" y "Se va solo".
- [ ] 4.2 Comportamiento sin cambios: ningún ajuste ni valor cambia al tocar "Mostrame"; las pruebas del núcleo siguen pasando; no entrenar redes para comprobarlo. Verificación: `npm test` completo, escenario "Determinismo" con las pruebas que ya existen, y `mlLab.auditHierarchy()` sin avisos.
- [ ] 4.3 Accesibilidad: el anuncio "Se muestra: …" y el foco sobre el control, en el árbol de accesibilidad del navegador (`read_page`). Sin lector de pantalla real: anotarlo. Verificación: escenario "Lector de pantalla".
- [ ] 4.4 Correr el guion con `despues`, medir que la tarjeta siga entrando entera a 1366×768 con "Mostrame" y armar `comparacion.md`: el antes y el después lado a lado, más una captura de cada misión con su control marcado. **Si la tarjeta no entra entera, parar y consultar.**
- [ ] 4.5 Verificación manual en el navegador contra el filtro de entrada, en las seis pestañas, a 1440×900 y 1366×768, con la guía encendida y apagada. Anotar lo observado separado de lo propuesto.
- [ ] 4.6 Anotar en `PENDIENTES.md` lo que quedó (el color del anillo y el botón compacto, para la revisión del sistema de diseño; lo no medido) y que el cambio está hecho. Verificación: `git diff PENDIENTES.md`.

## Workflow follow-up

- Archivar con `/opsx:archive` cuando el dueño revise la comparación.
- Lo que sigue es la revisión del sistema de diseño con `/design:design-critique` y `/design-skills:interaction-design`, empezando por Reglas a mano (en `PENDIENTES.md`).
