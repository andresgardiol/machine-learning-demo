# Tasks

Las tareas marcadas **detenerse y consultar** no se resuelven bajando el
criterio: se informa lo medido y se espera la respuesta. Cada grupo deja algo
que se puede usar; se puede cortar al final de cualquiera.

## 1. La cuenta en el núcleo

- [x] 1.1 Crear `src/core/network-trace.js` con `traceNetwork` (design.md D3). Verificar con pruebas los escenarios de "Cuenta desglosada" de la spec `cuenta-de-la-red`, incluida la comparación bit a bit con `computeNetwork` en mil entradas con semilla y las cuatro activaciones.
- [x] 1.2 Crear `src/core/pass-cursor.js` (design.md D4). Verificar con pruebas los escenarios de "Recorrido paso a paso", con redes de cero, una y tres capas ocultas.
- [x] 1.3 Crear `src/core/network-changes.js` y aplicar los cambios en `traceNetwork` (design.md D5). Verificar con pruebas los escenarios de "Cambios de prueba" y "Cambios que se deshacen".
- [x] 1.4 Verificar "Cuenta reproducible y sin navegador" y que `tests/architecture.test.js` sigue pasando con los módulos nuevos.

## 2. La red en grande: diagrama

- [x] 2.1 Crear `src/render/network-inspector.js` con el diagrama (design.md D6): disposición reutilizada de `network-view.js`, actividad, neurona elegida con sus conexiones destacadas y detección de lo que está bajo el cursor. Verificar con pruebas la detección y la disposición, y que `tests/network-view.test.js` sigue pasando sin tocar el diagrama de Entrenar.
- [x] 2.2 Acercar, alejar, mover y restablecer la vista con la cámara y los controles del escenario. Verificar en el navegador los escenarios de "Acercar y moverse".
- [ ] 2.3 Medir la fluidez del escenario "Red más grande, diagrama": 20 sensores, tres capas de 16, manejando en tiempo real. Si no llega a 55 cuadros por segundo, **detenerse y consultar** con lo medido (si el navegador de la sesión está oculto, informar el tiempo de dibujo por cuadro como sustituto y dejar la medición sin marcar).

## 3. La pestaña: mirar

- [ ] 3.1 Crear `src/tabs/inspect/index.js` con `mount` / `unmount` y estado conservado, registrarlo en `src/main.js` y reemplazar los textos de "próximamente". Montar la red en la zona izquierda y la escena en el tablero (design.md D1). Verificar los escenarios "Abrir Inspeccionar", "Explicación de Inspeccionar" y "Disposición de Inspeccionar" de `estructura-app`, y que las pestañas 1 a 4 conservan su disposición.
- [x] 3.2 Modo chico de la vista del escenario (design.md D10). Verificar en el navegador los escenarios de "Escena chica" de `vista-escenario` y los de "Escena del auto en segundo plano", incluido el reintento tras un choque.
- [x] 3.3 Qué cerebro se mira (design.md D11): orden al abrir, copia de trabajo, panel con nombre, dónde entrenó y forma de la red. Verificar los escenarios de "Lista para mirar al abrir" con y sin entrenamiento previo.
- [x] 3.4 Selector de cerebro, reutilizando el de Competir (sacarlo a un módulo común si hace falta, sin cambiar cómo se ve ni cómo se usa en Competir). Verificar los escenarios de "Elegir el cerebro" y que el selector de Competir sigue pasando sus pruebas.
- [x] 3.5 Barra de escenario sin sensores, que pasa al escenario donde entrenó el cerebro elegido. Verificar los escenarios "Cambiar de pista" y "Restablecer el escenario".
- [ ] 3.6 Medir en el DOM el escenario "Pantalla de 1440×900" de "La red en el centro": escena y decisión en el tablero, y guía, cerebro y lugar para la tarjeta en el panel, en español y en inglés. Si no entran, **detenerse y consultar** con las medidas de cada bloque.

## 4. Reproducción y paso a paso

- [x] 4.1 Barra de reproducción debajo de la red (design.md D7): reproducir o pausar, paso, de a cuánto, ritmo y dónde va. Lógica del ritmo y del avance sin DOM, con pruebas. Verificar en el navegador los escenarios de "Barra de reproducción junto a la red" y "Ritmo de la reproducción".
- [x] 4.2 Avance paso a paso conectado al cursor y al mundo. Verificar los escenarios de "Avance paso a paso", y con una prueba que reproducir de a operaciones deja al auto exactamente donde lo deja reproducir de a cuadros después de la misma cantidad de cuadros.
- [x] 4.3 Mostrar en el diagrama lo calculado, lo que se calcula y lo que falta. Verificar los escenarios de "Actividad en el momento".
- [x] 4.4 Paso animado (design.md D7b): productos, suma, sesgo y activación, y sus encadenados por neurona, capa y cuadro, con los valores reales. La línea de tiempo de cada animación es una función pura con pruebas (duraciones, completar al instante, tope del 80 % del intervalo). Verificar en el navegador los escenarios de "Paso animado", incluidos "No frena a la persona", "Al ritmo elegido" y "Menos movimiento".
- [x] 4.5 Operación en curso (design.md D7c): `describeStep` con pruebas en los dos idiomas y la franja entre la red y la reproducción. Verificar los escenarios de "Operación en curso", con 4 y con 21 entradas.
- [ ] 4.6 Medir la fluidez durante una ola de una capa con la red más grande, reproduciendo de a capas a 10 pasos por segundo. Si baja de 55 cuadros por segundo, **detenerse y consultar** con lo medido.
- [x] 4.7 Atajos (design.md D13), con su prueba. Verificar los escenarios de "Atajos de la pestaña".
- [ ] 4.8 Medir la barra de reproducción con la zona de la red a 600 px y a su ancho por defecto, en los dos idiomas (escenario "Barra de reproducción angosta").

## 5. La cuenta de una neurona

- [x] 5.1 Decisión de la red en el tablero, con el estado "sin decidir". Verificar los escenarios de "Decisión de la red".
- [ ] 5.2 Tarjeta de la neurona en el panel (design.md D8 y D12): filas por entrada, suma, sesgo, activación con su gráfico y salida, para neuronas ocultas, de salida y de entrada. Verificar los escenarios de "Tarjeta de la neurona", incluido "Cuenta que se puede comprobar" con una prueba sobre los números mostrados.
- [x] 5.3 La tarjeta en el paso a paso y siguiendo al cursor. Verificar los escenarios "En el paso a paso" y "La tarjeta sigue a la cuenta".
- [x] 5.4 Rayos de la escena con el peso de la neurona elegida (design.md D9). Verificar el escenario "Qué mira la neurona" y los de `vista-escenario` "Rayos con el peso de una neurona".
- [x] 5.5 Medir la tarjeta con 21 entradas y con 4, a 1440×900 y con el panel en su ancho mínimo, en 360 y en 400 px (escenario "Red grande"). Si el pie con la suma, el sesgo, la activación y la salida no queda a la vista, o si el panel se desplaza, **detenerse y consultar** con las medidas.

## 6. Tabla de pesos y capas resumidas

- [x] 6.1 Tabla de pesos (design.md D6) y elección de vista sobre la red. Verificar los escenarios de "Dos vistas de la misma red" y "Vista de la red a la vista".
- [x] 6.2 Actividad, elección y paso a paso en la tabla. Verificar los escenarios "Elegir en la tabla" y los de "Actividad en el momento" con la tabla a la vista.
- [x] 6.3 Encabezado arriba de cada capa, en la red misma, que la resume o la abre; capas resumidas como cuadritos, para entradas, ocultas y salidas; y "Resumir todas" / "Abrir todas", en las dos vistas. Verificar los escenarios de "Capas resumidas", con la red más grande y con la más chica, y que los encabezados siguen a su capa al acercar y mover la vista.
- [x] 6.4 Filtro de conexiones (design.md D6b): función pura en el núcleo con sus pruebas (incluidos el empate, menos entradas que el filtro y un peso cambiado), control sobre la red, y efecto en el diagrama, la tabla y la tarjeta. Verificar los escenarios de "Conexiones más importantes" y "Con el filtro de conexiones".
- [ ] 6.5 Medir los controles de arriba de la red con la zona en su ancho mínimo y en su ancho por defecto, en los dos idiomas. Si pasan de dos renglones o algún texto se corta, **detenerse y consultar** con una captura.
- [ ] 6.6 Medir la fluidez del escenario "Red más grande, tabla". Si no llega a 55 cuadros por segundo, **detenerse y consultar** con lo medido.

## 7. Entradas a mano

- [ ] 7.1 Manijas sobre los rayos en la escena chica (design.md D9). Verificar los escenarios de `vista-escenario` "Rayos que se mueven a mano", con 5 y con 20 sensores.
- [ ] 7.2 Entradas a mano en pausa: manijas, deslizador en la tarjeta de la entrada, velocidad, aviso con "Soltar" y soltar al reproducir. Verificar los escenarios de "Entradas a mano".

## 8. Apagar y cambiar pesos

- [ ] 8.1 Apagar y encender la neurona elegida y sus conexiones, con efecto en el auto que maneja. Verificar los escenarios de "Apagar una parte de la red".
- [ ] 8.2 Deslizadores de pesos y de sesgo en la tarjeta. Verificar los escenarios de "Cambiar pesos y sesgos", con el auto manejando y en pausa.
- [ ] 8.3 Marcas en el diagrama y en la tabla. Verificar los escenarios de "Marcas de lo apagado y lo cambiado".
- [ ] 8.4 "Deshacer" y "Restablecer la red" siempre a la vista sobre la red, con el contador de cambios, y cambios por cerebro. Verificar los escenarios de "Deshacer y restablecer la red", incluido que el cerebro guardado no cambia (comparándolo antes y después).

## 9. Guía, misiones y textos

- [ ] 9.1 Guía en el panel, leyenda en el tablero y misiones en tres renglones (design.md D12 y D14), con la lógica de las misiones probada sin DOM. Verificar los escenarios de "Guía, leyenda y misiones" cumpliendo las tres de verdad, y medir que las misiones ocupan tres renglones a 360 px en los dos idiomas.
- [ ] 9.2 Textos de design.md D15 y todos los demás en los dos idiomas. Verificar `tests/copy-length.test.js`, `tests/i18n.test.js` y el escenario "Pestaña en inglés".
- [ ] 9.3 Tooltips "qué hace / por qué importa" de cada control, con las definiciones de sesgo, activación y tabla de pesos. Verificar los escenarios de tooltip y que `mlLab.auditTooltips()` no informa nada en pausa y reproduciendo, con y sin cambios.

## 10. Accesibilidad

- [ ] 10.1 Capa de botones sobre el diagrama con foco itinerante y flechas. Verificar los escenarios "Recorrer con el teclado" y "Lector de pantalla" de "Inspector accesible", leyendo el árbol de accesibilidad.
- [ ] 10.2 Encabezados de capa, tabla con encabezados y tarjeta. Verificar los escenarios "Encabezado de capa" y "Tabla con encabezados".
- [ ] 10.3 Anuncios de entradas soltadas y de red actualizada; menos movimiento; objetivos de 24 px. Verificar los escenarios correspondientes de "Controles explicados y accesibles".
- [ ] 10.4 Recorrer la pestaña entera con el teclado: todo lo que se hace arrastrando o con el mouse se puede hacer sin él. Informar lo que no se cumpla.

## 11. Verificación integral

- [ ] 11.1 Medir en el DOM los escenarios de "Pestaña a la vista sin desplazarse" a 1440×900 y a 1366×768, con el panel en su mínimo, en 360 y en 400 px, en los dos idiomas. Si a 1440×900 algo se desplaza, **detenerse y consultar** con las medidas.
- [ ] 11.2 Verificar "Estado conservado" saliendo y volviendo con cada cosa cambiada.
- [ ] 11.3 Recorrer el filtro de entrada de la propuesta, fila por fila, en el navegador. Informar lo que no se cumpla.
- [ ] 11.4 Comprobar que las pestañas 1 a 4 no cambiaron: `npm test` completo y un recorrido corto de cada una.
- [ ] 11.5 Correr `openspec validate pestana-inspeccionar --strict` y `npm test`. Actualizar `PENDIENTES.md`: la pestaña 5 hecha en el orden de trabajo, lo que quedó fuera de alcance y lo que quedó sin medir.
- [ ] 11.6 Informe final que separe lo medido, lo observado en el navegador y lo que no se probó.
