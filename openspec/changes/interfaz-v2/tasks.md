# Tasks

**Cómo leer esta lista.**

- Las fases 1 y 2 (grupos 1 a 5) no tocan código de la app.
- El grupo 6 es la **parada del dueño**: nada de la fase 3 empieza sin la elección de una propuesta.
- Los grupos 7 a 16 están escritos sin saber qué propuesta se va a elegir. Después de elegir, `/opsx:update` los afina con la disposición elegida (design.md D1), y lo que cambie en ellos se anota en esa actualización.
- La implementación, las pruebas en el navegador y las mediciones las hace una sub-sesión con Opus 5.5 y esfuerzo medio (design.md D9).
- No se entrena para verificar que las redes aprendan.

## 1. Fase 1a: análisis a ciegas, desde el recorrido

- [x] 1.1 Crear `openspec/changes/interfaz-v2/analisis/` y `borradores/interfaz-v2/`. En `analisis/informe.md`, escribir la sección "A ciegas" usando solo `CONSTITUCION.md` y la lista de conceptos de la app (sin abrir la V1 ni sus capturas). La sección tiene que dejar claro qué se leyó y qué no. Verificación: el archivo existe y su encabezado lo dice.
  *Hecho. `analisis/` y `borradores/interfaz-v2/` creados. `analisis/informe.md` abre con la Parte 1 "A ciegas" y un recuadro que dice qué se leyó (la constitución, la introducción y las secciones de conceptos del README, los nombres de las 33 capacidades y los artefactos del cambio) y qué no (la V1, sus capturas, `src/`, `styles/`, `borradores/analisis-ux/`, `borradores/sistema-de-diseno/` y `PENDIENTES.md`). Se escribió antes de abrir cualquiera de ellos; la Parte 2 no la corrige.*
- [x] 1.2 Con `design-skills:ux-strategy`, escribir los trabajos de los dos públicos (*jobs to be done*) y, para cada una de las cinco etapas, la oración que la persona tendría que poder enunciar al salir. Verificación: hay una tabla de cinco etapas por dos públicos, con todas las celdas llenas y rotuladas como [Hipótesis].
  *Hecho con `design-skills:ux-strategy`: trabajo principal, relacionados, emocional, social, las cuatro fuerzas y resultados deseados para cada público, y la tabla de cinco etapas por dos públicos con las diez celdas llenas y rotuladas [Hipótesis]. No hubo entrevistas.*
- [x] 1.3 Con `design-skills:journey-mapping`, dibujar dos mapas del recorrido ideal: el principiante solo (30 a 45 min) y el mentor en una clase. Cada uno con acciones, dudas, emociones y puntos de quiebre. Verificación: dos mapas en el informe, como tabla o diagrama en texto, y la lista de los puntos de quiebre que la V2 tiene que cuidar.
  *Hecho con `design-skills:journey-mapping`: dos mapas de estado futuro (principiante en seis momentos de 0 a 45 min, mentor en seis momentos de una clase) con meta, acciones, dudas, emoción, quiebre y oportunidad, una curva de emoción en texto, los momentos de la verdad y doce puntos de quiebre (Q1 a Q12). La skill pide mapear primero el estado actual; acá va primero el ideal a propósito (D3) y se anota.*
- [x] 1.4 Proponer la arquitectura de información de las cinco etapas: qué experiencia de la V1 va en cada una y qué pregunta abre y cierra cada etapa. Resuelve la pregunta abierta del Laboratorio (design.md, Open Questions). Verificación: un cuadro etapa → experiencias → pregunta de apertura → pregunta que deja abierta.
  *Hecho: cuadro etapa → experiencias → pregunta de apertura → lo que deja abierto. Resuelve la pregunta abierta: el Laboratorio va en Aprender, como "por gradiente" junto a Entrenar "por evolución", porque enseña cómo aprende y produce cerebros; el sobreajuste queda anticipando Evaluar. Riesgo anotado: Aprender es la etapa más pesada.*
- [x] 1.5 Con `design-skills:ux-writing`, escribir la voz y el tono de la V2 y la escalera de vocabulario: cada término técnico, la etapa en que aparece por primera vez y su definición de una línea, en español y en inglés. Agregar los verbos Reiniciar y Restablecer, con su alcance. Verificación: una tabla con al menos los diez términos de la spec *Vocabulario escalonado*, y las dos columnas de idioma llenas.
  *Hecho con `design-skills:ux-writing`: tabla de voz (cinco rasgos con sí y no), tono por situación, los verbos Reiniciar/Restart y Restablecer/Reset con alcance, lo que no tocan y su Deshacer, y una escalera de 21 términos (los diez de la spec en negrita) con etapa de primera aparición y definición de una línea en español y en inglés, las dos columnas llenas.*

## 2. Fase 1b: contraste con la V1

- [ ] 2.1 Copiar el guion de capturas de `borradores/sistema-de-diseno/capturar.mjs` a `borradores/interfaz-v2/capturar-v1.mjs`. Sacar las seis pestañas de la V1 en su estado por defecto y en un estado con algo en curso (manejando, choque, generación terminada, carrera, neurona elegida, compuerta resuelta), a 1440×900, 1366×768 y 800×600. Verificación: `borradores/interfaz-v2/v1/indice.md` lista todas las vistas con su commit, y dos corridas seguidas dan las mismas medidas.
- [ ] 2.2 Con `design-skills:design-critique`, hacer la evaluación heurística de la V1 por pestaña: heurísticas de Nielsen, leyes de UX, *excise* y arquitectura de información. Cada hallazgo lleva su severidad, su evidencia (captura o medida) y su rótulo. Verificación: una tabla de hallazgos por pestaña en el informe, donde cada fila tiene captura o medida.
- [ ] 2.3 Cruzar con lo ya aprendido: P1 a P14 de `borradores/analisis-ux/informe.md`, las críticas de Reglas a mano y de Entrenar, y las notas por área de `PENDIENTES.md`. Antes de darlo por vigente, volver a verlo en la V1 actual. Verificación: cada problema anterior figura como "sigue", "resuelto" o "cambió", con la captura de 2.1 que lo muestra.
- [ ] 2.4 Con `design-skills:interaction-design`, armar la máquina de estados de cada experiencia (en marcha, en pausa, choque, fin, algo elegido, error) y anotar dónde la V1 no da retroalimentación o no deja deshacer. Verificación: un diagrama de estados por experiencia en el informe.
- [ ] 2.5 Con `design-skills:accessibility-audit`, auditar la V1 contra WCAG 2.2 AA: contraste medido, foco, nombres accesibles, objetivos de 24×24 y recorrido con teclado. Verificación: lista de incumplimientos con su criterio WCAG, y cuáles pasan; es la línea de base para el grupo 16.
- [ ] 2.6 Escribir "Lo que la V1 hace bien": lo que hay que conservar, con evidencia. Por ejemplo, los tooltips, los errores de Reglas a mano, el cartel de Competir y "Ver como la máquina". Verificación: la sección existe y cada punto lleva su captura.

## 3. Fase 1c: síntesis

- [ ] 3.1 Escribir `analisis/principios.md`: de 8 a 12 principios de diseño de la V2, cada uno con la evidencia de los grupos 1 y 2 que lo justifica y el artículo de la constitución que sirve. Verificación: cada principio cita al menos un hallazgo y un artículo.
- [ ] 3.2 Escribir `analisis/paridad.md`: cada requisito de las 33 capacidades de `openspec/specs/` en una fila, con su capacidad, su experiencia, su lugar previsto en la V2 y su estado ("igual", "rediseñado", "fusionado con…" o "propuesto quitar", con el motivo). Verificación: un guion cuenta los `### Requirement:` de `openspec/specs/` y las filas de la matriz, y los dos números coinciden.
- [ ] 3.3 Fijar los criterios para comparar las maquetas, con su peso: claridad didáctica, usabilidad, convivencia de los dos públicos, costo de la paridad, esfuerzo de la fase 3, riesgo para la fluidez y accesibilidad. Verificación: la tabla de criterios está en `analisis/comparacion.md`, vacía de puntajes.

## 4. Fase 2: tres maquetas

- [ ] 4.1 Con `design-superpowers:creative` y `frontend-design:frontend-design`, definir la dirección de cada propuesta (A, B y C, a partir de las semillas de design.md D4, cambiadas si los principios lo piden). Cada una con su postura en los cuatro ejes, su paleta, su tipografía y una oración de qué la hace distinta. Verificación: un cuadro propuesta por eje en `analisis/comparacion.md`, sin dos propuestas iguales en más de un eje.
- [ ] 4.2 Con `design-skills:design-systems`, armar los tokens (tres capas) y la lista de componentes de cada propuesta. Los tokens tienen que incluir las variables de color que leen los pintores de canvas (design.md D8). Verificación: cada propuesta tiene un `tokens.css` en su carpeta, con todas las variables de `COLOR_VARS` definidas.
- [ ] 4.3 Maqueta A en `borradores/interfaz-v2/maquetas/a/index.html`, con las pantallas de design.md D4: armazón, El problema, Entrenar con "Avanzado" abierto, Inspeccionar con una neurona elegida y un estado mentor. Es HTML y CSS estáticos, con JS solo para navegar. Verificación: se abre con `npm start` en `/borradores/interfaz-v2/maquetas/a/`, sin errores en la consola, y se navega entre las cinco pantallas.
- [ ] 4.4 Maqueta B en `borradores/interfaz-v2/maquetas/b/`, con las mismas pantallas y la misma verificación que 4.3.
- [ ] 4.5 Maqueta C en `borradores/interfaz-v2/maquetas/c/`, con las mismas pantallas y la misma verificación que 4.3.
- [ ] 4.6 Las tres maquetas tienen textos en español y en inglés, con selector, y las de los controles llevan su tooltip "qué hace / por qué importa". Verificación: en cada maqueta, cambiar el idioma cambia todos los textos visibles, y al posar el cursor sobre tres controles al azar aparece su tooltip.
- [ ] 4.7 Capturas de las tres maquetas, cada pantalla a 1440×900 y a 1366×768, en `borradores/interfaz-v2/maquetas/capturas/`. Verificación: un `indice.md` con 30 capturas (3 maquetas × 5 pantallas × 2 tamaños).
- [ ] 4.8 Con `design-skills:design-critique`, criticar las tres maquetas: jerarquía, una sola acción principal, contraste y si se entiende sin explicación. Corregir lo que se pueda; lo que quede, declararlo. Verificación: una sección de crítica por maqueta en la comparación, con "corregido" o "queda" en cada hallazgo.

## 5. Fase 2: comparación y presentación

- [ ] 5.1 Completar `analisis/comparacion.md`: el puntaje de cada maqueta en cada criterio (3.3) con su justificación, los pros y contras, y qué parte de la matriz de paridad le cuesta más a cada una. Verificación: la tabla está llena, y cada puntaje tiene una oración de motivo.
- [ ] 5.2 Escribir la recomendación de Claude, con el porqué y con qué tomaría de las otras dos. Rotularla como recomendación, no como decisión. Verificación: la sección existe y separa lo medido de lo opinado.
- [ ] 5.3 Presentarle al dueño las tres maquetas: los enlaces locales, las capturas lado a lado y la comparación. Ofrecer una página privada de comparación si la quiere compartir. Verificación: el mensaje al dueño tiene los tres enlaces, el índice de capturas y la pregunta de cuál elige.

## 6. Parada: elección del dueño

- [ ] 6.1 Esperar la elección del dueño (una propuesta, o una mezcla explícita) y anotarla con su fecha y sus palabras en `analisis/comparacion.md`. Verificación: la decisión está anotada; sin ella, no se marca esta tarea ni se empieza el grupo 7.
- [ ] 6.2 Con `/opsx:update`, volcar la propuesta elegida en el cambio: la sección *D-elegida* de `design.md` (disposición, navegación, tokens y componentes), los requisitos de disposición de `specs/interfaz-v2/spec.md` y el detalle de los grupos 7 a 16. Verificación: `openspec validate interfaz-v2 --strict` pasa, y el diseño nombra la propuesta elegida.

## 7. Fase 3: entrada, armazón y convivencia

- [ ] 7.1 Crear `v2/index.html` con el aviso de respaldo para abrir como archivo, en los dos idiomas, y `src/v2/main.js`, que arranca i18n, preferencias, biblioteca y armazón. Verificación: `/v2/` abre sin errores en la consola, y con doble clic en el archivo se ve el aviso.
- [ ] 7.2 Escribir `src/v2/preferences.js`, sin DOM, con claves `mlLab.v2.*` y `mlLab.language` compartida, tolerante a que el almacenamiento falle. Pruebas en `tests/v2/preferences.test.js`: lee, escribe, falla sin romperse y no toca las claves de la V1. Verificación: `npm test`.
- [ ] 7.3 Ampliar `tests/architecture.test.js` con las tres reglas de design.md D5: nada fuera de `src/v2` importa de `src/v2`; `src/v2` importa de `src/ui` y `src/tabs` solo módulos sin `document` ni `window`; el núcleo sigue sin DOM. Verificación: `npm test` pasa, y una importación prohibida puesta a propósito lo hace fallar.
- [ ] 7.4 Armar el armazón: la navegación del recorrido con la posición a la vista, la barra superior (idioma, guía, atajos, créditos, "Volver a la V1") y el manejo de fallas de una etapa, con reintentar. Las etapas que todavía no existan muestran su pregunta y "Por ahora, en la V1", con enlace (design.md D9). Verificación: escenarios *Recorrido libre*, *Falla al abrir una etapa* y *Ventana angosta* de la spec.
- [ ] 7.5 Agregar a la V1 el enlace "Probar la V2" en la barra superior, como acción terciaria y en el idioma activo. Agregar al armazón de la V2 "Volver a la V1". Verificación: los escenarios de *Enlace a la V2* (`estructura-app`) y de *Pasar de una versión a la otra*; `mlLab.auditHierarchy()` de la V1 sigue en 0.
- [ ] 7.6 Escribir los textos del armazón en `src/v2/i18n/es.js` y `en.js`, con los tooltips de cada control (incluidos los dos enlaces de versión, el de la guía y el de los atajos), y sumar la clave de la V1 para su enlace a `src/i18n/es.js` y `en.js`. Agregar `tests/v2/i18n.test.js`: las mismas claves en los dos idiomas y ningún texto fijo en `src/v2`. Verificación: `npm test`.
- [ ] 7.7 Sumar al `README.md` cómo abrir la V2, cómo compararla con la V1 y la regla de dependencias. Verificación: los comandos y las direcciones del README funcionan tal como están escritos.

## 8. Fase 3: componentes y auditorías

- [ ] 8.1 Escribir los componentes de `src/v2/components/` que pide la propuesta elegida. Como mínimo: botón en cuatro niveles, deslizador, grupo de opciones, interruptor, niveles de ajustes ("Probá esto", "Más", "Avanzado" recordado), aviso con "Deshacer" de al menos 8 s, tarjeta de misión con "Mostrame" y término definido. La lógica sin DOM va aparte y tiene sus pruebas en `tests/v2/`. Verificación: `npm test`, y una página de muestra en `borradores/interfaz-v2/muestra-componentes.html` con cada componente en cada estado.
- [ ] 8.2 Tooltip con indicio constante: todo control con ayuda lo muestra sin pasar el cursor, el tooltip aparece con el cursor y con el teclado, y los botones de solo ícono tienen nombre accesible. Verificación: escenarios *Indicio de tooltip* y *Auditoría de tooltips*, sobre la página de muestra.
- [ ] 8.3 Escribir `src/v2/audit.js`, en la consola como `mlLab.v2.audit*()`, con las verificaciones de design.md D10. Las partes puras llevan pruebas. Verificación: sobre la página de muestra con un defecto a propósito, cada auditoría lo informa; sin defectos, da 0.
- [ ] 8.4 Escribir `styles/v2/tokens.css` y `app.css` con los tokens de la propuesta elegida, incluidas las variables de color de los pintores de canvas. Verificación: `tests/v2/tokens.test.js` comprueba que están todas las variables de `COLOR_VARS`, y que los pares de texto y fondo declarados tienen un contraste de 4,5:1 o más.

## 9. Fase 3: escenario compartido

- [ ] 9.1 Escribir `src/v2/scenario.js`, sin DOM: escenario común, valores que fija cada etapa, y suscripción a los cambios. Pruebas: un cambio se ve en todas las etapas, los valores de etapa no tocan el común, y con las mismas entradas da el mismo resultado. Verificación: `npm test`.
- [ ] 9.2 Agregar a `tests/v2/` una prueba de igualdad: la configuración por defecto que arma cada etapa de la V2 (escenario, entrenamiento, carrera y red) es igual a la de la V1, y 5 generaciones con la semilla 1 dan el mismo historial y el mismo campeón. Verificación: `npm test` (escenario *Entrenamiento igual en las dos versiones*).
- [ ] 9.3 Hacer visible el escenario en la V2 con el componente que pida la propuesta, con el rótulo "de esta etapa" para los valores fijados y su tooltip, en los dos idiomas. Verificación: escenario *Cambio de densidad que se conserva* en el navegador.

## 10. Fase 3: etapa El problema

- [ ] 10.1 Componer la etapa con la pregunta, la consigna, la escena protagonista, el manejo con el volante suave, el cartel de primer manejo, los indicadores, el choque, el reinicio, la pausa, "Ver como la máquina", la percepción, la acción como estado y no como botón, y las misiones con "Mostrame". Todo, desde la lógica pura de `src/tabs/drive/session.js` y `shortcuts.js`. Verificación: las filas de `pestana-conducir` en la matriz quedan "hechas", y se comprueban en el navegador una por una.
- [ ] 10.2 Ajustes de El problema en tres niveles, como diga la propuesta elegida, con sus tooltips, sus textos en los dos idiomas y la escalera de vocabulario. Verificación: escenario *Pocos ajustes a la vista*, y las auditorías de tooltips y de acción principal en 0.
- [ ] 10.3 Capturas de la V1 y la V2 en los mismos estados (inicio, manejando, choque, guía oculta), a 1440×900 y 1366×768, en `borradores/interfaz-v2/comparacion/problema/`. Verificación: un índice con los pares y las medidas del área de la escena (escenario *Escena en El problema*).

## 11. Fase 3: etapa Reglas a mano

- [ ] 11.1 Componer la etapa con el editor, la paleta, la percepción que inserta comparaciones, los errores en lenguaje llano, las líneas que se cumplen, el choque que enseña (repetición, caso y cuaderno), las fichas como segunda vista, los ejemplos con su aviso de sensores, el programa recordado (en `mlLab.v2.*`), exportar, importar, el reintento automático y las misiones. Todo, desde la lógica pura de la V1. Verificación: las filas de `pestana-reglas` y `reglas` en la matriz quedan "hechas", y el escenario *Ejemplo que cambia los sensores* se cumple.
- [ ] 11.2 Restablecer el programa con "Deshacer", y Tab que sale del editor. Verificación: escenarios *Restablecer un programa escrito* y *Recorrido con teclado* en esta etapa.
- [ ] 11.3 Textos y tooltips de la etapa en los dos idiomas. Capturas de la V1 y la V2 a 1440×900, 1366×768 y 800×600. Verificación: escenario *800×600 usable*, y las auditorías en 0.

## 12. Fase 3: etapa de entrenamiento (Entrenar)

- [ ] 12.1 Componer la etapa con la escena de la población, la red del líder, la curva con sus marcas de ajuste, el corte y la tarjeta de generación, la mutación a la vista, la velocidad, pasar de generación, la selección manual del padre con deshacer, los cambios pendientes, la biblioteca (guardar, seguir entrenando, exportar, importar, renombrar, eliminar y autoguardados) y las misiones. Verificación: las filas de `pestana-entrenar`, `neuroevolucion` y `cerebros` en la matriz quedan "hechas".
- [ ] 12.2 Ajustes de Entrenar en tres niveles. Cada ajuste está en un solo lugar, el término se define en la primera aparición (fitness, élite, mutación, cruce, activación) y cada uno tiene su tooltip y sus textos en los dos idiomas. Verificación: escenarios *El mentor abre Avanzado*, *Misión que pide un ajuste plegado* y *Primera vez que aparece "fitness"*.
- [ ] 12.3 Reiniciar el entrenamiento con "Deshacer" si había generaciones, y el escenario *Importar un archivo que no es un cerebro*. Capturas de la V1 y la V2 (inicio, generación terminada, "Avanzado" abierto) a dos tamaños. Verificación: auditorías en 0, y el índice de capturas.

## 13. Fase 3: etapa Competir

- [ ] 13.1 Componer la etapa con la carrera lista al abrir, la cuenta regresiva, los competidores (cerebros, programa, ejemplos y vos), seguir a un competidor, el marcador, la tabla por pista con "practicó" y "no la vio", la meta, el tráfico de la carrera, la carrera conservada y las misiones. Verificación: las filas de `pestana-competir` y `carrera` en la matriz quedan "hechas".
- [ ] 13.2 Textos, tooltips (también los de los botones de solo ícono) y capturas de la V1 y la V2 (inicio, carrera y fin) a dos tamaños. Verificación: auditorías en 0, y el marcador sin cortes a 1366×768.

## 14. Fase 3: etapa Inspeccionar

- [ ] 14.1 Componer la etapa con la red protagonista, sus dos vistas, la reproducción y el paso con su ritmo, la operación en curso, la tarjeta de la neurona, la curva de respuesta, el detalle de una conexión, el flujo, apagar partes de la red y cambiar pesos con deshacer, comparar con el original, manejar vos y devolver el volante, el caso del choque con repetición, y la guía, que sigue a la mano después de elegir. Verificación: las filas de `pestana-inspeccionar`, `inspector-de-red`, `cuenta-de-la-red` y `vista-red` en la matriz quedan "hechas".
- [ ] 14.2 Controles de la red agrupados como diga la propuesta, con su acción principal sola, sus tooltips y sus textos en los dos idiomas. Nada destella más de tres veces por segundo. Verificación: auditorías en 0, y la prueba de destellos de la V1 aplicada a la V2.
- [ ] 14.3 Capturas de la V1 y la V2 (inicio, neurona elegida y vista de pesos) a dos tamaños. Verificación: el índice, y las tablas de pesos sin cortes.

## 15. Fase 3: etapa Laboratorio

- [ ] 15.1 Componer el Laboratorio en la etapa que fijó la tarea 1.4, con sus tres experimentos a la vista (compuertas, puntos y tu manejo): las perillas que se arrastran como acción destacada, la tabla de verdad, el plano, el punto de prueba, la reproducción del aprendizaje y su operación en curso, las curvas, los apartados y el sobreajuste, armar la red, la tasa, grabar tu manejo, imitar y guardar como cerebro, la tabla de datos, la historia de un peso y "Ver una solución". Verificación: las filas de `pestana-laboratorio`, `datos-de-ejemplo` y `retropropagacion` en la matriz quedan "hechas", y el escenario *Manipulación directa destacada*.
- [ ] 15.2 Textos y tooltips en los dos idiomas, con la escalera de vocabulario (época, tasa de aprendizaje, apartados, sesgo y peso). Capturas de la V1 y la V2 de los tres experimentos a dos tamaños. Verificación: auditorías en 0, y el índice.

## 16. Fase 3: integración y verificación

- [ ] 16.1 Comprobar que la matriz de paridad está completa: cada fila "hecha", o con la decisión del dueño anotada. Verificación: un guion cuenta las filas que no están ni "hechas" ni "decididas", y da 0.
- [ ] 16.2 Medir la fluidez con el navegador a la vista, 10 s cada caso: Entrenar con 100 y con 500 autos y la red visible, Competir con seis competidores en el circuito de curvas, Inspeccionar con la red más grande y el Laboratorio operación por operación. Anotar la V1 y la V2 lado a lado. Verificación: escenario *Entrenar con 500 autos*, y la tabla en `borradores/interfaz-v2/comparacion/fluidez.md`.
- [ ] 16.3 Con `design-skills:accessibility-audit`, auditar la V2 contra WCAG 2.2 AA con los mismos criterios que la tarea 2.5, y anotar la diferencia con la línea de base. Verificación: ningún incumplimiento AA abierto sin decisión del dueño.
- [ ] 16.4 Con `design-skills:design-critique`, criticar la V2 contra la V1 con las mismas heurísticas de la tarea 2.2, en `analisis/critica-final.md`. Verificación: cada problema de la tarea 2.3 figura como "resuelto en la V2", "sigue" o "nuevo".
- [ ] 16.5 Correr `npm test` completo y `node tools/bench.mjs`. Verificación: todas las pruebas pasan, también las de la V1 sin modificarse, y el factor del bench no cambia respecto del README.
- [ ] 16.6 Verificación manual en el navegador contra el filtro de entrada, etapa por etapa: ¿qué concepto hace visible?, ¿se entiende sin que nadie lo explique?, ¿el mentor puede ocultar la guía? y ¿cómo se vuelve atrás? Probar también el pase de la V1 a la V2 y de vuelta, con un cerebro guardado en una y visto en la otra. Verificación: una tabla de etapa por pregunta en `analisis/critica-final.md`, con las capturas de lo verificado.
- [ ] 16.7 Dejarle al dueño un guion de cinco tareas para probar la V2 con una persona que llega sola (design.md D2), y actualizar `PENDIENTES.md` con lo que quedó. Verificación: el guion está en `analisis/` y `PENDIENTES.md` nombra el cambio.

## Workflow follow-up

- El dueño compara la V1 y la V2 y decide con cuál se queda. Hacer de la V2 la versión por defecto, o quitar la V1, es otro cambio.
- Archivar `interfaz-v2` con `/opsx:archive` cuando el dueño apruebe la revisión, y sincronizar las specs.
