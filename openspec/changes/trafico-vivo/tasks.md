# Tasks

Quién hace qué: todo este cambio lo implementa una sub-sesión Opus 5.5 medium. El dibujo de los vehículos es provisorio (D12). La ilustración final va en otro cambio, con Fable 5.2 medium. Ninguna tarea entrena redes para comprobar que aprenden: eso lo verifica el dueño.

## 1. Punto de partida

- [x] 1.1 Dejar una copia del commit de partida fuera del repositorio (por ejemplo `git worktree add` en el scratchpad) para medir el "antes". Correr ahí `node tools/bench.mjs` y anotar los resultados en `borradores/trafico-vivo/antes.md`. Verificación: el archivo tiene el commit, la fecha y los números del bench.
  *Hecho: copia del commit 5b4f66d con `git worktree add --detach` en el scratchpad. Medido (Node 24.2, M1): redes al azar 179,7x a 187,5x; todos en carrera 1135,7x a 1179,8x, pero ese caso termina con 0 autos en carrera (el seguidor del bench choca), anotado en `borradores/trafico-vivo/antes.md`.*
- [x] 1.2 Capturas del antes, en Chrome, de la calle con tráfico: El problema, Reglas a mano y Entrenar con 100 autos, en V1 y en V2, a 1440×900. Guardarlas en `borradores/trafico-vivo/antes/`. Verificación: seis capturas con su nombre.
  *Hecho (Chrome sin ventana, tiempo virtual, perfil nuevo por escena): `borradores/trafico-vivo/capturar.mjs`, seis capturas en `borradores/trafico-vivo/antes/` (v1/v2 × problema, reglas, entrenar-100). La población de 100 se pone con el deslizador y "Población nueva"; el texto de la página dice "100 autos".*
- [x] 1.3 Con la copia de partida, manejar los programas de ejemplo de Reglas y los cuatro cerebros de ejemplo en 10 tráficos nuevos de la calle (semillas 1 a 10, valores por defecto, 60 s). Contar choques y vehículos superados. Es solo inferencia. Verificación: la tabla en `antes.md`, rotulada como medida.
  *Hecho con `tools/drive-examples.mjs --root <copia>` (nuevo, sirve también para 9.1). Medido: choques de 10 — initial 10, three 0, seven 8, twenty 9, street-new 9, street-same 8, oval 10, all-tracks 7; tabla completa en `antes.md`. También vehículos/km con 3 carriles: 34,02 al 50 %.*

## 2. Constantes y tipos

- [ ] 2.1 En `src/core/constants.js`: velocidades de carril (6 y 10 m/s en los extremos), hueco mínimo dentro del carril (4 largos de auto), período del zigzag (6 a 10 s), giro máximo (6°) y la tabla congelada de tipos (D3) con largo, ancho y proporción. Verificación: prueba en `tests/traffic.test.js` de que las proporciones suman 1, de que ningún tipo es más ancho que un carril de 4 m y de que ninguno mide más de 10 m (cota de D2).

## 3. Generador por carril

- [ ] 3.1 Reescribir `createTraffic` en `src/core/traffic.js` como corrientes por carril (D1). Cada carril con su espacio de semillas, bloques de K casillas (largo + hueco), velocidades repartidas en [6, 10] y asignadas con una permutación sembrada, y tipo por vehículo. Expone `fastestSpeed`, `slowestSpeed` y `laneSpeeds`. Cada vehículo devuelto suma `type`, `length`, `width` y `speed` (la de su carril). Verificación: escenarios *Un ritmo por carril* (los cinco) y *Tipos de vehículo* ("Todos los tipos aparecen", "Medidas por tipo") en `tests/traffic.test.js`.
- [ ] 3.2 Densidad → casilla media por carril con la fórmula de D4, y el reparto del sobrante con pesos de parejos a exponenciales según la irregularidad, con el mínimo siempre respetado. Verificación:
  - "Calle vacía" y "Más densidad, más vehículos";
  - "Tráfico regular" (huecos iguales con 0 %), "Separaciones variadas" y "Tráfico irregular sin invadir carriles";
  - una prueba de que, con 3 carriles al 50 %, hay entre 80 % y 120 % de los vehículos por kilómetro de hoy (el número de hoy, medido en 1.1).
- [ ] 3.3 Zigzag con giro (D5): lateral sinusoidal, amplitud calculada para el peor giro y giro recortado a ±6°, con contorno girado. Verificación: "Zigzag dentro del carril", "Más irregularidad, más zigzag" y "Nadie sale de su carril" (barrido de un minuto con irregularidad 100 % y mil semillas: ningún vértice fuera del carril).
- [ ] 3.4 Reproducibilidad. Verificación: "Misma semilla" (también tipo, velocidad y zigzag) y "Semilla nueva"; "Tráfico sin fin" a diez kilómetros; `tests/reproducibility.test.js` sin fallas.

## 4. Garantías

- [ ] 4.1 Medidor de muros sobre el generador solo (D6): intervalos exactos entre los carriles extremos, cruzados con los demás. Va en un módulo del núcleo sin DOM que usan la prueba y la herramienta. Verificación: prueba con un caso armado a mano (dos camiones de carriles extremos a la par) que da la duración que predice D2.
- [ ] 4.2 "Muros cortos con densidad máxima": en la prueba unitaria, una muestra de semillas de 2, 3 y 4 carriles, y las mil en la herramienta (grupo 9). Verificación: ningún muro de más de 7 s.
- [ ] 4.3 "Esperar detrás" y "Calle sin muros eternos": un auto controlado por una regla de prueba que sigue al vehículo de su carril a su velocidad, durante un minuto y con cien semillas. Verificación: no choca, y todo muro que tiene delante se abre antes de 7 s.
- [ ] 4.4 "Sin carril seguro por suerte": un auto derecho sobre la línea entre dos carriles a velocidad máxima, irregularidad 50 %, cien semillas. Verificación: choca antes de un kilómetro en todas.

## 5. Cambio en marcha

- [ ] 5.1 `changeTraffic` corta cada carril en su propio marco (D8), y `world.setTraffic` pasa la frontera por carril. Verificación: "Cambiar la densidad en marcha", "Unión entre configuraciones" (por carril, con largos reales) y "Cada carril conserva su ritmo", en `tests/traffic.test.js` y `tests/world.test.js`.

## 6. Mundo: lo que suponía 4 m

- [ ] 6.1 En `src/core/world.js` (D9): umbral de choque con el largo de cada vehículo, ventana de sensores con `v.length/2` y radio de la consulta compartida con `Lmax/2`. Verificación: "Se choca con la medida real" (el extremo de un camión) y "Los sensores ven la medida real" (una moto), en `tests/world.test.js`.
- [ ] 6.2 `src/core/race.js`: la reaparición no queda encima de un camión. Verificación: `tests/world-respawn.test.js` y `tests/race.test.js`, con un caso de camión detrás del punto de reaparición.

## 7. Entrenamiento y conteo

- [ ] 7.1 Ventaja contra `fastestSpeed` y regla de los lentos con `slowestSpeed · 5` (D7) en `src/core/training.js`. Verificación: escenarios de *Funciones de fitness* (incluido "Seguir al tráfico no suma" en cualquier carril) y de *Eliminar a los lentos* (incluidos "Esperar el hueco no elimina" y "Fitness al salir por lento" con 25 m), en `tests/training.test.js`.
- [ ] 7.2 Superados por carril, con búsqueda binaria y el máximo a lo largo de la generación (D7). Verificación: los seis escenarios de *Vehículos superados* en `tests/training-passed.test.js`.
- [ ] 7.3 `src/tabs/shared/attempt.js`: `relativePosition` con el largo de cada vehículo. Verificación: "Superar un camión" y "Vehículo que vuelve a pasar" (también por carril más rápido) en `tests/drive-session.test.js`.
- [ ] 7.4 *Escenario por defecto del entrenamiento*: centrados y con huecos parejos con 0 %, y zigzag con 50 %. Verificación: sus cuatro escenarios en `tests/training-defaults.test.js`.

## 8. Dibujo provisorio y textos

- [ ] 8.1 `drawVehicle` en `src/render/view.js` y su par en `src/v2/render/glow.js` reciben largo, ancho y giro, y dibujan la silueta escalada por tipo (D12), siempre dentro del contorno. Verificación: en el navegador, El problema y Entrenar muestran los cuatro tipos y se ve el zigzag; con `?debug` o una inspección por JS, el dibujo no pasa del contorno de choque.
- [ ] 8.2 Tooltips de la irregularidad, en español y en inglés, en `src/i18n/` y `src/v2/i18n/` (`help.drive.irregularity.*`, `help.train.setting.irregularity.*` y los de la hoja Escenario de la V2). Tienen que decir que regula cuánto zigzaguean los vehículos en su carril y cuán desparejos son los huecos, sin hablar de filas ni grupos. Verificación: `tests/i18n.test.js` y `tests/v2/i18n.test.js` pasan, `grep -rn "grupo\|filas" src/i18n src/v2/i18n` no encuentra textos del tráfico, y `auditTooltips()` da 0 en El problema y Entrenar.

## 9. Medición de encierros

- [ ] 9.1 `tools/measure-walls.mjs` (D10): muros por kilómetro, duración media y máxima para 2, 3 y 4 carriles × densidades de 25, 50, 75 y 100 % × irregularidades de 0, 50 y 100 %, con mil semillas y diez kilómetros. Además, los programas y los cerebros de ejemplo en los mismos 10 tráficos de 1.3: choques, superados y choques dentro de un muro. Verificación: `borradores/trafico-vivo/encierros.md` con las dos tablas, antes y después lado a lado, rotuladas como medidas.
- [ ] 9.2 **Detenerse y consultar** con el informe de 9.1: el dueño decide si sigue con velocidades distintas o pasa al plan B (D11). Verificación: la decisión anotada acá.

## 10. Datos que dependen del tráfico

- [ ] 10.1 Programas de ejemplo de Reglas: comprobar "Siete sensores" (supera al menos 10 antes de chocar con el tráfico inicial de la pestaña) y los demás escenarios de los ejemplos en `tests/rules-examples.test.js`. Si alguno no se cumple, **detenerse y consultar** con lo medido, sin cambiar los programas por cuenta propia.
- [ ] 10.2 Metas de las misiones (`src/ui/mission-targets.js`): comprobar con inferencia que siguen siendo alcanzables con el tráfico nuevo. Verificación: `tests/mission-targets.test.js` pasa y lo medido queda anotado acá.
- [ ] 10.3 Cerebros de ejemplo: **detenerse y consultar** antes de volver a entrenarlos, con lo medido en 9.1. Si el dueño lo aprueba, correr `node tools/train-examples.mjs` en segundo plano. La herramienta comprueba los contrastes de *Cerebros de ejemplo*. Si alguno falla, detenerse y consultar. Verificación: `src/data/example-brains.js` regenerado y `tests/example-brains.test.js` pasa.

## 11. Pruebas, fluidez y cierre

- [ ] 11.1 Ajustar las pruebas que suponían filas, grupos o 10 m/s (`world*`, `race`, `training*`, `drive-session`, `v2/equality`, `scenario-bar` y las que aparezcan), sin bajar lo que exigen las specs. Verificación: `npm test` sin fallas, con el total de pruebas anotado.
- [ ] 11.2 Fluidez: `node tools/bench.mjs` contra el antes de 1.1. Si "Todos en carrera" baja más de 10 %, **detenerse y consultar**. Con el navegador a la vista, si se puede: Entrenar con 500 autos y El problema a densidad 100 %. Si el panel está oculto, informar el tiempo por cuadro y dejarlo para el dueño en `PENDIENTES.md`. Verificación: los números en `borradores/trafico-vivo/despues.md`.
- [ ] 11.3 Capturas del después, con los mismos seis encuadres de 1.2, en `borradores/trafico-vivo/despues/`, y una comparación en `borradores/trafico-vivo/comparacion.md`. Verificación: las doce capturas enlazadas.
- [ ] 11.4 Verificación manual en el navegador contra el filtro de entrada:
  1. se ve que los carriles van a distinto ritmo y que hay cuatro tipos;
  2. se entiende sin explicación;
  3. no hay controles nuevos que ocultar;
  4. "Restablecer" y "Tráfico nuevo" vuelven atrás ("Valor por defecto y vuelta atrás").

  Verificación: lo observado anotado acá, separando lo medido de lo supuesto.
- [ ] 11.5 Actualizar `PENDIENTES.md`: la nota "Tráfico menos regular y con variedad de vehículos" pasa a *Hecho* con lo que quedó. Agregar el cambio de diseño visual de los autos (Fable 5.2 medium, estética de `assets/og-image.png`, capas que se puedan recolorear, medidas de D3) como lo próximo, y avisar que los cerebros guardados de las personas manejan peor con el tráfico nuevo. Verificación: el diff de `PENDIENTES.md`.

## Workflow follow-up

- La sub-sesión no hace push ni archiva. El dueño revisa, prueba el aprendizaje con el tráfico nuevo y decide cuándo archivar.
