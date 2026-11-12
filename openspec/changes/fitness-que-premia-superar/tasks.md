# Tasks

## 1. Ventaja sobre el tráfico en el núcleo

- [x] 1.1 En `src/core/evolution.js`, sumar `lead` a `createStats()` y el parámetro opcional `trafficAdvance` a `recordStep` (design.md D1). Verificar con pruebas nuevas en `tests/evolution.test.js`: la ventaja es la mayor alcanzada, no baja si el auto frena y no cambia después de un choque.
- [x] 1.2 Agregar la función `lead` a `fitnessOf`, con `FITNESS_KINDS` en el orden de D1 y `FITNESS_UNITS.lead = 'metersAhead'`. Verificar con pruebas los escenarios "Ventaja sobre el tráfico", "Seguir al tráfico no suma", "La ventaja alcanzada se conserva" y "Auto que no avanza" de la spec `neuroevolucion`.
- [x] 1.3 En `src/core/training.js`, pasar a `recordStep` lo que avanzó el tráfico en la generación. Verificar con una prueba en `tests/training.test.js` que, con la función `lead`, un auto que sale por lento conserva la ventaja que llevaba, y que `npm test` pasa.

## 2. Vehículos superados en el núcleo

- [x] 2.1 Armar al empezar cada generación la lista ordenada de distancias iniciales de los vehículos y llevar `passed` en las estadísticas de cada auto (design.md D2). Verificar con una prueba que `passed` no baja durante la generación, ni cuando el auto choca y el tráfico lo vuelve a pasar.
- [x] 2.2 Exponer `training.passedOf(i = leaderIndex)`. Verificar con pruebas los cuatro escenarios de "Vehículos superados", comparando la cuenta contra un recorrido directo de `world.vehiclesIn` en el momento de mayor ventaja.
- [x] 2.3 Verificar con una prueba de reproducibilidad que dos entrenamientos con la misma semilla dan las mismas cuentas de vehículos superados paso a paso.

## 3. Valores por defecto y límites

- [x] 3.1 Cambiar `EVOLUTION_LIMITS.elite` a 0–20 con 10 por defecto y acotar la élite a la mitad de la población en `eliteCount` y `normalizeEvolution` (design.md D3). Verificar con pruebas los escenarios "Élite por defecto", "Valor fuera de rango" y "Población chica".
- [x] 3.2 Cambiar `DEFAULT_EVOLUTION.fitness` a `lead` y `DEFAULT_TRAINING_CONFIG.irregularity` a 0 con su constante propia, sin tocar `DEFAULT_TRAFFIC`. Verificar con pruebas los escenarios de "Escenario por defecto del entrenamiento", incluido que un mundo de las pestañas 1 y 2 sigue con irregularidad 50 %.
- [x] 3.3 Adaptar las pruebas existentes según la regla de design.md D8: las que dependían de un valor por defecto para probar otra cosa lo piden explícito; solo cambian de valor esperado las de D8. Verificar que `npm test` pasa y listar en el informe cada prueba existente que cambió y por qué.

## 4. Enfriamiento de la mutación en el núcleo

- [x] 4.1 Agregar `MUTATION_COOLING` y `cooledStrength` a `src/core/evolution.js` (design.md D9). Verificar con pruebas los valores de la spec: 28,5 % tras la generación 1, 17,96 % tras la 10, 10,75 % tras la 20 y 3 % desde la 45.
- [x] 4.2 Sumar `mutationCooling` a la configuración del entrenamiento, encendido por defecto, y usar la fuerza enfriada al armar cada generación con selección automática. Verificar con pruebas los escenarios "Estado por defecto", "Enfriamiento apagado", "Volver a encenderlo" y "Con selección manual no se usa", comparando la población resultante con la de `nextGeneration` llamada a mano con la fuerza esperada.
- [x] 4.3 Aplicar el enfriamiento a la población inicial al continuar desde un cerebro, exponer `training.nextMutationStrength` y registrar `mutationCooling` en el cerebro. Verificar con pruebas el escenario "Continuar desde un cerebro" y "Enfriamiento reproducible".
- [x] 4.4 Adaptar las pruebas existentes según design.md D8 (las que prueban el efecto de la fuerza piden `mutationCooling: false`; las que enumeran claves suman la nueva). Verificar que `npm test` pasa y sumar al informe las pruebas que cambiaron.

## 5. Comprobación de aprendizaje

- [x] 5.1 Escribir `tools/measure-learning.mjs` con el protocolo de design.md D6, exportando la función de medida, y agregar el script `test:learning` a `package.json`. Verificar con una prueba en `npm test` que la medida con una semilla y 5 generaciones da exactamente lo mismo en dos corridas.
- [x] 5.2 Correr `npm run test:learning` y pegar la tabla en el informe. Si el promedio con los valores por defecto es menor que 8, si el de alguna semilla es menor que 5 o si el de la función distancia es mayor que 2, **detenerse y consultar**: no ajustar umbrales ni valores por defecto por cuenta propia. Si cumple pero difiere de 13,3 y 0,6, informarlo.

## 6. Pestaña Entrenar

- [x] 6.1 En `src/tabs/train/session.js`, sumar `passed` a `indicators`, reemplazar la misión de distancia por la de superar 5 vehículos y comparar la misión de "otra función" con la función por defecto (design.md D5). Verificar con pruebas en `tests/train-session.test.js` los escenarios "Misión de superar vehículos", "Seguir al tráfico no la cumple" y "Misión de la función de fitness".
- [x] 6.2 Tratar la unidad `metersAhead` como metros al redondear, en `fitnessText` y en `src/ui/library-view.js` (design.md D4). Verificar con pruebas que 120,7 m de ventaja se muestran como 120 y que un cerebro con `fitness.kind: 'distance'` se sigue mostrando en metros.
- [x] 6.3 En `src/tabs/train/index.js`, agregar el cuarto indicador al tablero y actualizarlo junto a los otros tres. Verificar en el navegador los escenarios "Vehículos superados del líder" y "Líder que cambia".
- [x] 6.4 Agregar el ajuste `mutationCooling` a `src/tabs/train/settings.js` y su interruptor a la configuración básica, debajo de la fuerza de mutación, con el deslizador sin editar mientras el enfriamiento está en uso (design.md D9). Verificar con pruebas en `tests/train-settings.test.js` el valor por defecto y que restablecer lo enciende, y en el navegador los escenarios "La fuerza baja sola", "Fuerza que no se edita", "Apagar el enfriamiento", "Volver a encender el enfriamiento" y "Con selección manual".

## 7. Textos y tooltips

- [x] 7.1 Agregar en `src/i18n/es.js` y `en.js` las claves de design.md D7 y quitar `train.mission.distance`. Verificar que la prueba de paridad de diccionarios pasa y que `mlLab.auditTooltips()` no informa controles sin ayuda.
- [x] 7.2 Sumar a `tests/copy-length.test.js` los largos de la misión nueva, del nombre del indicador y del interruptor del enfriamiento, para que entren en un renglón. Verificar que pasa.
- [x] 7.3 Verificar en el navegador, en español y en inglés, los tooltips de la ventaja, la distancia, la élite, el enfriamiento y la irregularidad contra los escenarios de "Controles de la pestaña explicados".

## 8. Verificación integral

- [x] 8.1 Con el panel en 360 px, en español y en inglés: las cuatro funciones de fitness se leen enteras, los cuatro indicadores entran en un renglón, las misiones ocupan un renglón cada una y la configuración básica, con el interruptor nuevo, no hace desplazar el panel en 1440×900. Medirlo en el DOM e informar los anchos.
- [ ] 8.2 Abrir la pestaña sin tocar nada y dejar correr 20 generaciones: el tráfico va en filas parejas y cambia en cada generación, hay diez autos con la marca de élite, la fuerza de mutación baja sola y el indicador de superados del líder pasa de 0. Informar el mayor valor visto y una captura.
- [x] 8.3 Cambiar la función a distancia, dejar correr 15 generaciones y volver con restablecer: informar qué se ve en cada caso y que restablecer devuelve ventaja, élite 10, irregularidad 0 % y el enfriamiento encendido sin reiniciar el entrenamiento.
- [x] 8.4 Guardar un cerebro entrenado con ventaja y abrir la biblioteca: su fitness se lee como metros de ventaja, y un cerebro anterior se sigue leyendo en metros.
- [ ] 8.5 Medir la fluidez con la población por defecto durante diez segundos, con la página visible. Si el promedio baja de 50 cuadros por segundo, **detenerse y consultar**.
- [x] 8.6 Repasar el filtro de entrada de proposal.md contra lo que se ve en el navegador e informar cualquier respuesta que ya no valga.
- [x] 8.7 Actualizar `PENDIENTES.md`: reemplazar la nota "Los autos aprenden a seguir al tráfico, no a pasarlo" por lo que queda pendiente (manejar sin chocar con tráfico irregular, con las mediciones de proposal.md) y quitar la idea "Fitness por vehículos superados", que este cambio midió y descartó.

## Workflow follow-up

- Archivar el cambio cuando el dueño lo haya revisado.
