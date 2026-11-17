# Tasks

## 1. Antes, misión en curso y textos

- [x] 1.1 Confirmar que `borradores/tarjeta-de-consigna/antes/` tiene las capturas, `indice.md` y `medidas.md`, y que `capturar.mjs` las reproduce igual dos veces seguidas. Si falta algo, sacarlo antes de tocar código. Verificación: correr el guion con una carpeta temporal y comparar contra `antes/`.
  *Hecho. Medido: `antes/` tiene las 74 capturas, `indice.md` y `medidas.md`. Una corrida nueva del guion sobre el mismo código (carpeta temporal) dio `medidas.json` idéntico y 50 de 74 PNG iguales píxel por píxel (comparado con `borradores/tarjeta-de-consigna/comparar-pixeles.mjs`, nuevo). Los otros 24 difieren en 1 a 75 píxeles de suavizado de letra, salvo los estados con animación: los puntitos de Flujo en Inspeccionar (05, 18), la escena de El problema (14) y la escena de Tu manejo (17, la posición del auto). Observado: 17 a 1366 se ve igual a ojo. No se corrió una tercera vez.*
- [x] 1.2 `src/ui/current-mission.js` con `currentMission(missions, { available })` (D2) y sus pruebas en `tests/current-mission.test.js`. Casos a probar:
  - sin cumplir, devuelve la primera;
  - con la primera cumplida, devuelve la segunda aunque la tercera también esté cumplida;
  - con todas cumplidas, devuelve `allDone`;
  - sin misiones disponibles en el modo, devuelve `null`;
  - lista vacía, devuelve `null`;
  - misma lista, mismo resultado.

  Verificación: `npm test`.
  *Hecho. `src/ui/current-mission.js` y `tests/current-mission.test.js` con los seis casos. Medido: `npm test` pasa.*
- [x] 1.3 Las claves de D3 en `src/i18n/es.js` y `src/i18n/en.js`, incluidas `consigna.drive.plain` y `consigna.drive.circuit.plain`. Topes en `tests/copy-length.test.js`: 90 caracteres para cada consigna, en los dos idiomas. Verificación: `npm test`, con `tests/i18n.test.js` sin claves de un solo idioma.
  *Hecho. 14 claves `consigna.*` en `es.js` y `en.js`, con topes de 90 caracteres en `tests/copy-length.test.js` y una prueba que exige tope a toda consigna nueva. Cambio sobre D3: `consigna.lab.gates` suma "o tocá Reproducir abajo de la red", porque la spec pide que en el Laboratorio la consigna nombre dónde está la marcha en los tres experimentos. Medido: `npm test`, 1321 pruebas sin fallas, paridad de claves incluida. El largo en renglones se mide en 4.3.*

## 2. Componente de la tarjeta

- [ ] 2.1 `src/tabs/shared/consigna-card.js` (D1): región con título oculto, consigna y misión con la clase `guide`, y lugar para `run`. `setConsigna` y `setMission` escriben con `createTextSetter`. Si el armado se puede probar sin DOM, con su prueba. Verificación: `npm test`.
- [ ] 2.2 Estilos de la tarjeta y del texto largo de la guía en `styles/app.css` (D5), y la marca de la misión en curso en la lista (`data-current`: "▸" y negrita). Verificación: el contorno de los controles sobre `--color-surface-2` sigue pasando `tests/control-contrast.test.js`, y en el navegador la marca se ve en escala de grises.

## 3. La tarjeta en cada pestaña

- [ ] 3.1 El problema:
  - la tarjeta primera, con `run` adentro;
  - `describeMission` compartida por la lista y la tarjeta;
  - consigna de la calle o del circuito, sin misión en el circuito;
  - se quita el renglón `drive.guide.keys` del `intro`.

  Verificación: escenarios "Consigna por defecto", "Circuito", "Primera misión por defecto", "Pasa a la siguiente", "Progreso al día", "Sin misiones en el modo" y "El problema". Con los atajos apagados, la consigna usa la versión `.plain`.
- [ ] 3.2 Reglas a mano y Competir: la tarjeta primera, con `run` o `runSection` adentro. Verificación:
  - en Competir, escenario "Competir con el cartel de largada", y `mlLab.auditHierarchy()` con una sola acción principal en cada estado del guion;
  - en Reglas a mano, "Misión en curso" con el progreso de la primera misión.
- [ ] 3.3 Entrenar: la tarjeta primera en la vista de entrenamiento, con `run` adentro; consigna automática o manual. Verificación: escenarios "Cambia con el modo", "Otras vistas de Entrenar" y "Ventana mediana". **Si a 1366×768 la tarjeta no entra entera sin desplazar, parar y consultar** (Risks).
- [ ] 3.4 Inspeccionar y Laboratorio: la tarjeta primera, sin `run`, con la consigna que nombra la barra de abajo de la red; en el Laboratorio, la consigna de cada experimento. Verificación: escenarios "Inspeccionar", "Laboratorio" y "Elegir una neurona".
- [ ] 3.5 Comportamiento sin cambios:
  - la marcha hace lo mismo con el mouse y con su atajo, con el mismo texto y el mismo tooltip, en los dos idiomas;
  - `mlLab.auditTooltips()` y `mlLab.auditHierarchy()` sin problemas nuevos;
  - las misiones se cumplen igual. Usar las pruebas de sesión que ya existen; no entrenar redes para comprobarlo.

  Verificación: `npm test` completo y escenario "Mismo comportamiento".

## 4. Guía, accesibilidad, después y cierre

- [ ] 4.1 Guía apagada y encendida en las seis pestañas: la consigna y la misión se ocultan, la marcha queda y la misión vuelve al día. Verificación: escenarios "Apagar la guía", "Volver a encender" y "Guía oculta" de *Orden común del panel*.
- [ ] 4.2 Accesibilidad:
  - la región "Qué hacer ahora" con su nombre;
  - el orden de lectura: consigna, marcha y misión;
  - con Tab, el primer control del panel es la marcha en El problema;
  - la misión sin anuncios en cada paso.

  Verificación: el árbol de accesibilidad del navegador (`read_page`), escenarios "Lector de pantalla" y "Con el teclado". Sin lector de pantalla real: anotarlo.
- [ ] 4.3 Medir que cada consigna entra en dos renglones con el panel de 360 px, en español y en inglés (escenario "Largo"), y ajustar el texto si no entra. Verificación: tabla de medidas en la comparación.
- [ ] 4.4 Correr `capturar.mjs despues`, repetir las medidas de `antes/medidas.md` y armar `borradores/tarjeta-de-consigna/comparacion.md`: el antes y el después lado a lado, la tabla de medidas de los dos y una línea de qué cambió. Anotar los estados que no salieron iguales.
- [ ] 4.5 Verificación manual en el navegador contra el filtro de entrada, en las seis pestañas, a 1440×900 y 1366×768, con la guía encendida y apagada:
  - ¿se entiende qué hacer leyendo solo la tarjeta?;
  - ¿el mentor la oculta con la guía?;
  - ¿algo se rompe si se usa mal?

  Anotar lo observado separado de lo propuesto.
- [ ] 4.6 Anotar en `PENDIENTES.md`:
  - lo que quedó: la misión leída dos veces por un lector de pantalla, la consigna que repite el texto largo y lo que no se pudo medir;
  - que `tarjeta-de-consigna` está hecho.

  Verificación: `git diff PENDIENTES.md`.

## Workflow follow-up

- Archivar con `/opsx:archive` cuando el dueño revise la comparación del antes y el después.
- El candidato que sigue es `misiones-que-muestran-el-control`, que usa la misión en curso de la tarjeta. Después vienen las tres propuestas del recorrido guiado.
