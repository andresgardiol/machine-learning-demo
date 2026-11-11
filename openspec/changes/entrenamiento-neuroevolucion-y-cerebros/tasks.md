# Tasks

## 1. Números según el idioma y pendientes de la pestaña 1

- [x] 1.1 Formatear los parámetros numéricos en `src/ui/i18n.js` con `Intl.NumberFormat` (sin separador de miles, hasta 2 decimales); verificar con pruebas "1,5" en español, "1.5" en inglés, "12345" sin separadores en ambos y que el singular con valor 1 sigue funcionando
- [x] 1.2 Pasar la cantidad de carriles como parámetro del texto de guía de la pestaña 1 en `es.js` y `en.js`, y actualizarlo al cambiar los carriles; verificar en el navegador con 2, 3 y 4 carriles en ambos idiomas y que la prueba de paridad pasa
- [x] 1.3 Quitar de `PENDIENTES.md` los dos detalles resueltos y anotar las ideas que este cambio deja fuera (cerebro incluido que generaliza, fitness por vehículos superados, elegir con un clic qué auto seguir, entrenar en segundo plano); verificar que el archivo refleja ambas cosas

## 2. Componentes de panel compartidos

- [x] 2.1 Extraer botón, interruptor, fila con deslizador, grupo de opciones y texto variable de `src/tabs/drive/index.js` a `src/ui/controls.js` y usarlos desde la pestaña 1, sin cambiar su comportamiento; verificar que `npm test` pasa y que la pestaña 1 se ve y responde igual en el navegador
- [x] 2.2 Agregar a `src/ui/controls.js` la confirmación en línea (mensaje, confirmar, cancelar, Escape cancela, foco en cancelar al abrir) con sus textos en español e inglés; verificar con pruebas la lógica de abrir, confirmar y cancelar, y que la paridad pasa

## 3. Núcleo: red neuronal

- [x] 3.1 Crear `src/core/network.js` con la creación y validación de la forma (0 a 3 capas ocultas, 1 a 16 neuronas, activaciones admitidas); verificar con una prueba por cada escenario de "Estructura por capas" y "Activación desconocida"
- [x] 3.2 Implementar el cálculo de salidas, la salida escalón y las cuatro activaciones de capas ocultas; verificar con una prueba por cada escenario numérico de "Cálculo de las salidas", "Salidas sí/no" y "Activación de las capas ocultas"
- [x] 3.3 Implementar la inicialización con semilla, el cálculo con el detalle de todas las capas y la copia independiente; verificar con pruebas los escenarios de "Inicialización reproducible", "Valores de todas las neuronas" y "Cálculo sin efectos"

## 4. Núcleo: mundo con varios autos

- [x] 4.1 Generalizar `src/core/world.js` a una lista de agentes conservando la interfaz de un solo auto (design D1); verificar que las 194 pruebas existentes pasan y que `git diff --stat main -- tests/` no muestra cambios en archivos que ya existían
- [x] 4.2 Consultar el tráfico una vez por paso y repartirlo por agente (design D2); verificar con pruebas los escenarios "Controladores distintos", "Un auto choca y los demás siguen" y "Autos superpuestos"
- [x] 4.3 Escribir las pruebas de equivalencia (50 autos contra 50 mundos de un auto, paso a paso), de reproducibilidad (100 autos, 1000 pasos, dos corridas) y de reinicio de una población; verificar que pasan
- [x] 4.4 Crear `tools/bench.mjs` (100 autos, 3600 pasos) y documentar en `README.md` cómo correrlo y el resultado obtenido; verificar que supera 20 veces el tiempo real y, si no, detenerse y consultar antes de seguir

## 5. Núcleo: operadores de evolución

- [x] 5.1 Crear `src/core/evolution.js` con las estadísticas por agente y las tres funciones de fitness; verificar con una prueba por cada escenario de "Funciones de fitness"
- [x] 5.2 Implementar el orden de la población, la selección de padres y la élite con sus límites; verificar con pruebas los escenarios de "Selección de los padres" y "Élite"
- [x] 5.3 Implementar la mutación con probabilidad y fuerza; verificar con pruebas los tres escenarios de "Mutación", que el padre no cambia y que con probabilidad 1 % cambia solo una fracción de los valores
- [x] 5.4 Implementar el cruce uniforme entre dos padres distintos; verificar con pruebas los dos escenarios de "Cruce opcional"
- [x] 5.5 Implementar el armado de la generación siguiente (élite, hijos, tamaño constante, valores fuera de rango ajustados) con el orden de consumo del azar de design D5; verificar con pruebas los escenarios de "Tamaño de la población" y que dos armados con el mismo generador dan poblaciones idénticas

## 6. Núcleo: cerebros y controlador de red

- [x] 6.1 Crear `src/core/brain.js` con el formato versión 1, la creación y la validación con códigos de error (design D7); verificar con una prueba por cada escenario de "Validación de un cerebro", "Entradas y salidas de un cerebro" y "Compatibilidad con el auto"
- [x] 6.2 Implementar el controlador de red neuronal y su verificación al crearse; verificar con pruebas los escenarios de "Controlador de red neuronal" y "Red que no corresponde a la percepción", incluido que un mundo lo maneja sin cambios
- [x] 6.3 Implementar la acumulación de datos de entrenamiento (generaciones totales y lista de escenarios, uniendo el mismo escenario consecutivo); verificar con pruebas los dos escenarios de "Datos de entrenamiento"

## 7. Núcleo: entrenamiento

- [x] 7.1 Crear `src/core/training.js` con la población inicial, el mundo de la generación, el paso, las estadísticas por agente y el líder; verificar con pruebas "Inicio de una generación" y los dos escenarios de "Líder"
- [x] 7.2 Implementar el fin de la generación con sus cuatro motivos, el historial y el campeón; verificar con una prueba por cada escenario de "Fin de la generación", "Pasar de generación a pedido", "Historial de generaciones" y "Campeón"
- [x] 7.3 Implementar los cambios de configuración pendientes hasta la generación siguiente, el rechazo de cambios de red y sensores, y los dos modos de tráfico; verificar con pruebas los escenarios de "Cambios de configuración durante el entrenamiento" y "Tráfico por generación"
- [x] 7.4 Implementar el inicio desde un cerebro y la obtención del cerebro del campeón con sus datos; verificar con pruebas los dos escenarios de "Continuar desde un cerebro" y que el cerebro obtenido pasa la validación
- [x] 7.5 Escribir las pruebas de reproducibilidad (diez generaciones, dos corridas, mismo historial y mismo campeón), de semilla distinta y de "El mejor nunca empeora con élite y mismo tráfico", usando poblaciones y duraciones chicas para que corran en pocos segundos; verificar que pasan
- [x] 7.6 Actualizar la sección de arquitectura de `README.md` con el mundo de varios autos, la red, la evolución, el entrenamiento y el formato del cerebro; verificar que nombra los módulos tal como quedaron

## 8. Calibración de los valores por defecto

- [x] 8.1 Crear `tools/calibrate.mjs`, que entrena 20 generaciones con la configuración por defecto en 10 semillas e informa la mejor distancia de cada una; verificar que corre y muestra las 10 distancias
- [x] 8.2 Comprobar el criterio de design (mejor distancia de al menos 300 metros en 8 de 10 semillas); si no se cumple, ajustar los valores por defecto, actualizar las specs y `design.md` con los nuevos valores e informarlo; verificar dejando el resultado final anotado en `design.md`

## 9. Biblioteca de cerebros

- [x] 9.1 Crear `src/ui/library.js` con almacenamiento, reloj e identificadores inyectados: listar, guardar con las reglas de nombre, actualizar, renombrar y eliminar; verificar con pruebas los escenarios de "Nombre propio", "Renombrar", "Eliminar con confirmación" (la parte de datos) y "Actualizar un cerebro guardado"
- [x] 9.2 Implementar la persistencia entre visitas, el orden por fecha y la tolerancia a almacenamiento ausente o lleno; verificar con pruebas los tres escenarios de "Biblioteca recordada" usando almacenamientos falsos que fallan
- [x] 9.3 Implementar importar desde texto y exportar a texto; verificar con pruebas los cuatro escenarios de "Importar" y que lo exportado contiene todo el cerebro
- [x] 9.4 Implementar el autoguardado con su límite de una escritura por segundo y la rotación a "entrenamiento anterior"; verificar con pruebas los tres escenarios de "Autoguardado" usando un reloj falso

## 10. Revisión: sin cerebros incluidos, regla de los lentos y velocidad de 20 m/s

- [x] 10.1 Quitar de `src/ui/library.js` el soporte de cerebros incluidos y sus pruebas, sin agregar `tools/train-presets.mjs` ni `src/presets/`, y anotar en `PENDIENTES.md` la idea de incluir más adelante dos o tres cerebros elegidos por el dueño (design D9); verificar que `npm test` pasa y que ningún archivo del código menciona cerebros incluidos
- [x] 10.2 Agregar `world.retire(index, cause)` al mundo (design D18); verificar con una prueba el escenario "Auto sacado por lento" de "Sacar un auto de carrera"
- [x] 10.3 Implementar en `src/core/training.js` la regla "eliminar a los lentos" como ajuste `slowRule`, encendido por defecto y aplicado desde la generación siguiente, con el motivo `tooSlow` (design D18); verificar con una prueba por cada escenario de "Eliminar a los lentos" y el de "Todos fuera de carrera", y que las pruebas de reproducibilidad y de "el mejor nunca empeora" siguen pasando
- [x] 10.4 Subir `MAX_SPEED` a 20 m/s (design D19), actualizar en español e inglés el tooltip de restablecer de la pestaña 1 y, con acuerdo del dueño, las dos aserciones de `tests/drive-settings.test.js` que fijaban 15; verificar con pruebas el escenario "Velocidad por defecto" y en el navegador el escenario "Restablecer" de la pestaña 1
- [x] 10.5 Repetir `node tools/calibrate.mjs` con la regla y la velocidad nuevas, informando también cuántos autos salieron por lentos; verificar dejando el resultado anotado en la sección de calibración de `design.md` y, si no cumple el criterio, detenerse y consultar

## 11. Bucle con velocidades

- [x] 11.1 Agregar a `src/ui/loop.js` los factores 1, 2, 4 y 8; verificar con pruebas que seiscientos pasos a velocidad 8 dejan el mismo estado que a velocidad normal y que las pruebas existentes del bucle pasan sin modificarse
- [x] 11.2 Agregar la velocidad máxima con presupuesto de tiempo por cuadro y el factor logrado, con el reloj inyectado; verificar con pruebas que ejecuta al menos un paso por cuadro, que respeta el presupuesto, que informa el factor y que se detiene con la página oculta

## 12. Pestaña 3: esqueleto en marcha

- [x] 12.1 Crear `src/tabs/train/settings.js` con los ajustes, sus rangos, sus valores por defecto y a qué grupo pertenece cada uno (al instante, próxima generación, entrenamiento nuevo); verificar con pruebas la normalización de valores fuera de rango y la clasificación de cada ajuste
- [x] 12.2 Crear la biblioteca al arrancar y entregarla a las pestañas en su contexto, registrar la pestaña en `src/main.js` y montar entrenamiento, vista y bucle con el estado conservado entre montajes; verificar en el navegador que la pestaña abre con el entrenamiento en marcha, que al ir a El problema y volver sigue en la misma generación y que solo la pestaña visible simula
- [x] 12.3 Reemplazar en ambos diccionarios el tooltip "próximamente" de la pestaña Entrenar por uno de qué hace y por qué importa; verificar en el navegador en ambos idiomas y que la paridad pasa

## 13. Vista del escenario con población

- [ ] 13.1 Extender `src/render/view.js` para dibujar todos los agentes: foco con detalles y rayos, resto atenuado, chocados con aspecto propio y élite marcada, sin cambiar el dibujo de un mundo de un auto; verificar en el navegador los escenarios de "Dibujo de una población" y "Marca de la élite", y que la pestaña 1 se ve igual
- [ ] 13.2 Implementar el desplazamiento continuo al cambiar el auto seguido como función pura más su uso en la vista (design D11); verificar con pruebas que la diferencia se reduce a cero y que un salto mayor de 50 metros es inmediato, y en el navegador los tres escenarios de "Seguimiento del líder"
- [ ] 13.3 Medir la tasa de cuadros con 100 y con 500 autos a velocidad normal; verificar que el promedio es de al menos 50 y 30 cuadros por segundo

## 14. Diagrama de red

- [ ] 14.1 Crear en `src/render/network-view.js` la disposición del diagrama como función pura (columnas, nodos, rótulos que se resumen); verificar con pruebas la red 6-6-4, el cambio a cuatro columnas, el resumen de rótulos con 60 sensores y que la red máxima cabe en su zona
- [ ] 14.2 Dibujar el diagrama en canvas con pesos, sesgos y actividad en vivo, agregando sus colores a `styles/tokens.css`; verificar en el navegador los escenarios de "Pesos visibles", "Sesgos visibles", "Actividad en vivo" y "Diagrama solo de lectura"
- [ ] 14.3 Escribir en español e inglés los rótulos de entradas y salidas, la leyenda y el tooltip de la sección; verificar en el navegador en ambos idiomas, que la paridad pasa y que con el diagrama visible el promedio es de al menos 50 cuadros por segundo

## 15. Curva de fitness

- [ ] 15.1 Crear en `src/ui/chart.js` la escala y los puntos de la curva como función pura; verificar con pruebas una curva vacía, una de un punto, una de cinco y una con todos los valores iguales
- [ ] 15.2 Dibujar la curva en SVG con leyenda, ejes con unidad, texto de curva vacía, valores de la generación señalada y reinicio al cambiar la función de fitness, con sus textos en español e inglés; verificar en el navegador los cuatro escenarios de "Curva de fitness" y que la paridad pasa

## 16. Pestaña 3: panel

- [ ] 16.1 Implementar la guía de inicio, los indicadores del entrenamiento y el número de generación sobre el escenario, con la lógica en `src/tabs/train/session.js`; verificar con pruebas el cálculo de los indicadores y en el navegador los tres escenarios de "Indicadores del entrenamiento"
- [ ] 16.2 Implementar pausa, velocidades, velocidad máxima con su factor y siguiente generación, con los atajos barra espaciadora, T y N; verificar con pruebas el mapa de atajos y en el navegador los escenarios de "Pausa", "Velocidad del entrenamiento" y "Pasar a la siguiente generación"
- [ ] 16.3 Implementar reiniciar y población nueva con la regla de confirmación y la rotación del autoguardado; verificar en el navegador los cuatro escenarios de "Reiniciar el entrenamiento" y el de "Población nueva"
- [ ] 16.4 Implementar la configuración básica (población y fuerza de mutación) con la indicación de cambios pendientes; verificar en el navegador los dos escenarios de "Configuración básica"
- [ ] 16.5 Implementar la configuración avanzada de evolución (con el interruptor "eliminar a los lentos") y de escenario, con la velocidad máxima compartida con la pestaña 1; verificar en el navegador los cuatro escenarios de "Configuración avanzada"
- [ ] 16.6 Implementar los ajustes de red y sensores con la regla de entrenamiento nuevo, la confirmación única al soltar un deslizador y la vuelta al valor anterior al cancelar; verificar en el navegador los cuatro escenarios de "Red y sensores"
- [ ] 16.7 Implementar restablecer la configuración; verificar en el navegador los dos escenarios de "Restablecer la configuración"
- [ ] 16.8 Implementar el interruptor de sensores del líder y las secciones plegables de la red y de la curva; verificar en el navegador "Sensores del líder" y "Plegar el diagrama"
- [ ] 16.9 Implementar las cuatro misiones en `src/tabs/train/session.js`; verificar con pruebas el progreso, el cumplimiento y que siguen cumplidas tras reiniciar, y en el navegador que se ocultan con el interruptor de guía

## 17. Biblioteca en la pestaña

- [ ] 17.1 Crear `src/ui/library-view.js` con la lista de cerebros (resumen, origen y detalle desplegable); verificar en el navegador los dos escenarios de "Lista de cerebros" y "Biblioteca al abrir"
- [ ] 17.2 Implementar guardar el campeón: deshabilitado sin campeón, nombre sugerido y las dos acciones al continuar un cerebro guardado; verificar en el navegador los tres escenarios de "Guardar el campeón"
- [ ] 17.3 Implementar renombrar, eliminar con confirmación, exportar e importar con `src/ui/files.js` y los mensajes de error; verificar en el navegador los escenarios de "Renombrar", "Eliminar con confirmación", "Exportar" e "Importar", incluida la ida y vuelta de un archivo real
- [ ] 17.4 Implementar seguir entrenando un cerebro; verificar en el navegador los tres escenarios de "Seguir entrenando un cerebro"
- [ ] 17.5 Conectar el autoguardado (fin de generación, pausa, salida de la pestaña, página oculta) y el aviso de almacenamiento no disponible; verificar en el navegador "Recarga de la página" y "Reinicio del entrenamiento"
- [ ] 17.6 Escribir en español e inglés todos los rótulos, resúmenes, confirmaciones y mensajes de error de la biblioteca; verificar en el navegador "Biblioteca en inglés" y que la paridad pasa

## 18. Tooltips y textos de la pestaña 3

- [ ] 18.1 Escribir en español e inglés el tooltip (qué hace y por qué importa) de cada control de la pestaña 3 y de la biblioteca, usando el término técnico real y definiéndolo; verificar que la auditoría de tooltips no reporta faltantes y que la paridad pasa
- [ ] 18.2 Revisar que los tooltips de las funciones de fitness, de eliminar a los lentos, del modo de tráfico, de la mutación y de la velocidad máxima digan lo que piden los escenarios de "Controles de la pestaña explicados" y que el de velocidad máxima avise que el entrenamiento se detiene con la página oculta; verificar leyéndolos en el navegador en ambos idiomas

## 19. Verificación integral

- [ ] 19.1 Ejecutar `npm test` completo; verificar que todas las pruebas pasan
- [ ] 19.2 Recorrer la pestaña 3 y la biblioteca en inglés (guía, indicadores, curva, diagrama, confirmaciones, misiones, mensajes de error); verificar que no aparece ningún texto en español
- [ ] 19.4 Recorrer la pestaña 1 completa en el navegador; verificar que se comporta igual que antes del cambio, salvo el texto de guía, el formato de los números y la velocidad máxima por defecto de 20 m/s
- [ ] 19.5 Verificar a mano en el navegador cada feature visible contra el filtro de entrada (qué concepto hace visible, si se entiende sola, si el mentor puede ocultarla, cómo se vuelve atrás) y contra los escenarios de las specs que no tienen prueba automática

## Workflow follow-up

- Archivar el cambio una vez revisado y verificado.
