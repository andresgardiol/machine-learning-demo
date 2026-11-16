# Tareas: la vista de la red, legible y completa

## 1. Funciones puras, con pruebas

- [x] 1.1 `linkLook` (design.md D2) en `src/render/link-look.js`: grosor relativo, brillo por señal, piso por densidad y papel. Pruebas de los escenarios de "Conexiones siempre visibles" que no necesitan pantalla: red de pesos chicos, sin señal, con señal, peso cero, peso cambiado y mismo aspecto.
- [x] 1.2 Radio de las neuronas en `layoutInspector` (D3). Pruebas de "Neuronas que usan el espacio": red chica en 708×648, resumir la capa más alta, sin encimarse en todas las formas que permite la aplicación.
- [x] 1.3 Distancia de un punto a una línea y elección de lo que se toca (D5), sin DOM. Pruebas de "Neurona antes que línea" y "Línea más cercana".
- [x] 1.4 `upstream` en el núcleo (D9). Pruebas de los escenarios de "De dónde viene lo que recibe una neurona".
- [x] 1.5 `neuronGrid` en el núcleo (D12). Pruebas de "Valores de cada neurona sobre una grilla".
- [x] 1.6 Historia de pesos en el recorrido del aprendizaje. Pruebas de "Historia de los pesos".
- [x] 1.7 Correr el validador de la skill de visualización con el verde agua y candidatos de rosa sobre el fondo de la red, y fijar el rosa que cumple "Par del signo". Anotar los números. **Medido** con `validate_palette.js --mode dark --surface #1b212a`: rosa fijado `#e0489a`; separación con `#36d6c3`: peor de protan y deutan ΔE 14,3 (deutan), tritan 38,7, visión normal 36,5; contraste 4,29:1 sobre `#1b212a` (verde agua 8,91:1). El rosa viejo `#ff6fb5` daba 4,6 (deutan). Candidatos: `#d9429a` ΔE 16,1, `#e4529f` ΔE 12,5. El aviso de banda de claridad lo marca el verde agua (L 0,792) y no aplica (design.md D11).
- [x] 1.8 `responseCurve` en el núcleo (D17). Pruebas de los escenarios de "Respuesta de una neurona a una entrada", con una red de escalón y con una que aprende.

## 2. Leer la red sin tocar nada

- [x] 2.1 El inspector dibuja las conexiones con `linkLook`, y Entrenar usa la misma escala (`network-view.js`). Verificar los escenarios de "Conexiones siempre visibles" y el delta de `vista-red`.
- [x] 2.2 Neuronas con el radio nuevo y sus rótulos. Verificar "Neuronas que usan el espacio" en el navegador, con capas resumidas.
- [x] 2.3 Neurona por dentro, según el radio en pantalla (D4). Verificar los escenarios de "Neurona por dentro", también acercando.
- [x] 2.4 Estado sin nada elegido en el inspector y en las dos pestañas; Inspeccionar abre así. Verificar "Estado sin nada elegido" y "Lista para mirar al abrir".
- [x] 2.5 El rosa nuevo en `styles/tokens.css`. Revisar que la leyenda, la tabla de pesos, Entrenar y el Laboratorio lo usen.
- [x] 2.6 Tomar capturas a 1440×900 de tres redes sin nada elegido: el cerebro de ejemplo (6, 6, 4), una de 6, 8, 8, 4, y la más grande (21, 16, 16, 16, 4), antes y después del cambio, en Inspeccionar; y la red por defecto del Laboratorio. Guardarlas en la carpeta de notas y **detenerse y consultar** con ellas: los números de D2 se confirman mirando. *Consultada: aprobada con dos ajustes (grosor máximo de 7 a 4 px según la densidad; suma y sesgo desde 40 px). Red grande con la regla nueva: grosor 1,50 / 2,15 / 5,98 px (mín / mediana / máx); entre ocultas de 16, máx. 3,8 px.*

## 3. Vista previa, elegir y soltar

- [x] 3.1 Vista previa al posar el cursor sobre una neurona o una línea, y la lectura junto al cursor (D6). Verificar los escenarios de "Vista previa al posar el cursor". *Verificado con Chrome sin ventana y mouse de verdad, en las dos pestañas: neurona y línea se destacan bajo el cursor, la lectura aparece con la guía en cualquier estado y al salir vuelve todo.*
- [x] 3.2 Elegir una neurona o una conexión, en el diagrama y en la tabla, y soltar con otro clic, clic afuera sin arrastre y Escape. Verificar los escenarios de "Elegir una neurona o una conexión". *Verificado: clic en neurona, en línea y en celda de la tabla; otro clic, clic en vacío y Escape (en el diagrama y en la tabla) sueltan; arrastrar no suelta. La celda elegida queda marcada.*
- [x] 3.3 Números sobre las conexiones de lo elegido. Verificar "Números sobre las conexiones", con 6 y con 21 entradas. *Verificado: con 6 entradas, 6 números; con 21, 11 números sin encimarse (captura vista-3-numeros-21.png).*
- [x] 3.4 Teclado y lector de pantalla para elegir y soltar. Verificar "Inspector accesible" completo. *Flechas y Enter en neuronas; en la tabla, el nombre de la fila es la parada de Tab y las flechas recorren las celdas (Enter elige la conexión). Se anuncia lo elegido y lo soltado.*
- [x] 3.5 Probar en el navegador elegir líneas en la red más grande: diez intentos sobre líneas distintas, con y sin una neurona elegida. Informar cuántas veces se eligió la que se buscaba. Si son menos de ocho, **detenerse y consultar**. *Consultada: alternativa A, la regla queda. Medido (simulación con puntos sorteados sobre un cerebro de pesos al azar, no una persona): a ciegas 6 de 10 (2 de 5 sin nada elegido, 4 de 5 con una neurona elegida, sus líneas 3 de 3); con la vista previa 9 de 10. Los errores a ciegas son cruces a menos de 1 px.*

## 4. Detalle en el panel de Inspeccionar

- [ ] 4.1 Panel sin nada elegido: frase y atajos. Verificar "Panel sin nada elegido".
- [ ] 4.2 Tarjeta de la neurona con barras de lo que aporta, la cuenta escrita y filas que eligen su conexión. Verificar los escenarios de "Tarjeta de la neurona", los de antes y los nuevos.
- [ ] 4.3 Detalle de una conexión. Verificar "Detalle de una conexión".
- [ ] 4.4 "Ver original" como botón que se mantiene apretado. Verificar "Comparar con el original".
- [ ] 4.5 Curva de respuesta en la tarjeta de la neurona: botones de entrada, línea del cero, punto de ahora que se arrastra en pausa, y la frase que la lee. Verificar los escenarios de "Curva de respuesta".
- [ ] 4.6 Comprobar que "Apagar una parte de la red", "Cambiar pesos y sesgos", "Deshacer y restablecer la red" y las tres misiones siguen cumpliéndose.
- [ ] 4.7 Medir en el DOM a 1440×900 y a 1366×768, en los dos idiomas, el panel con cada forma del detalle (nada, neurona de 6 y de 21 entradas con su curva de respuesta, conexión). Si a 1440×900 el panel se desplaza con una neurona de 6 entradas o con una conexión, **detenerse y consultar** con las medidas y con la alternativa de design.md D17 (alternar "Cuenta | Respuesta").

## 5. Cambiar en el lugar

- [ ] 5.1 Pastilla sobre la conexión elegida: arrastre, flechas, límites y un solo cambio por arrastre. Verificar "Cambiar un peso en el lugar", en Inspeccionar y en el Laboratorio.

## 6. De dónde viene

- [ ] 6.1 El inspector destaca el camino hacia atrás con `upstream`, y el filtro de conexiones lo limita. Verificar "De dónde viene una neurona" con una red de dos capas ocultas, y que "Conexiones más importantes" sigue cumpliéndose.

## 7. Flujo

- [ ] 7.1 Marcas que viajan por las conexiones con señal (D10) e interruptor "Flujo". Verificar "Flujo de la señal" y "Flujo de la señal en Inspeccionar".

## 8. Colores y leyenda

- [ ] 8.1 Lo cambiado y lo puesto a mano, con marcas de forma en el color del texto; quitar los dos tonos que dejan de usarse. Verificar "Pocos colores con significado" y "Marcas de lo apagado y lo cambiado".
- [ ] 8.2 Leyenda de cinco renglones en Inspeccionar. Verificar "Leyenda corta".
- [ ] 8.3 Revisar en el navegador las seis pestañas por si algo usaba el rosa viejo o los tonos quitados.

## 9. Laboratorio

- [ ] 9.1 Mapas adentro de las neuronas ocultas con puntos. Verificar "Mapa dentro de la neurona" y "Qué detecta cada neurona".
- [ ] 9.2 El plano muestra el mapa de la neurona elegida o bajo el cursor, con su rótulo. Verificar los escenarios nuevos de "Plano de puntos". Tomar una captura con la red del círculo aprendida y una neurona elegida, y sumarla al informe.
- [ ] 9.3 Con tu manejo, la curva de respuesta en la tarjeta de la neurona. Verificar "Con tu manejo", "La curva cambia al aprender" y "Con puntos no hay curva".
- [ ] 9.4 Detalle de una conexión con la historia de su peso. Verificar "Detalle de una conexión en el Laboratorio" e "Historia de un peso".
- [ ] 9.5 Comprobar que el Laboratorio no muestra "Flujo" ni "Ver original", y que "Cambiar la red a mano" y "Deshacer y restablecer los cambios a mano" siguen cumpliéndose.
- [ ] 9.6 Medir en el DOM a 1440×900 y a 1366×768, en los dos idiomas, con puntos y con tu manejo, el panel con una neurona y con una conexión elegidas. Si a 1440×900 algo se desplaza o se recorta, **detenerse y consultar**.

## 10. Textos, tooltips y accesibilidad

- [ ] 10.1 Textos nuevos en los dos idiomas y tooltip "qué hace / por qué importa" en cada control nuevo ("Flujo", "Ver original", la pastilla, los controles de los detalles). Verificar `tests/i18n.test.js`, `tests/copy-length.test.js` y que `mlLab.auditTooltips()` no informa nada en las dos pestañas, con nada, una neurona y una conexión elegidas.
- [ ] 10.2 Menos movimiento: sin flujo y sin animación al cambiar de tamaño. Sin color: positivo y negativo por el trazo, y las marcas por la forma.
- [ ] 10.3 Recorrer con el teclado las dos pestañas: elegir, soltar, mover la pastilla, ir de una conexión a sus neuronas. Informar lo que no se cumpla.

## 11. Verificación

- [ ] 11.1 Medir en el DOM las dos pestañas a 1440×900 y a 1366×768, con el panel en su mínimo, 360 y 400 px, y la zona de la red en 600 px, en los dos idiomas. Si a 1440×900 algo se desplaza, o la barra de arriba de la red se parte donde antes no, **detenerse y consultar**.
- [ ] 11.2 Medir la fluidez con la red más grande manejando en tiempo real, con el flujo encendido y una salida elegida, en el diagrama y en la tabla; y en el Laboratorio con tres capas de 8 y los mapas. Criterio: 55 cuadros por segundo o más. Si el navegador está oculto, informar el tiempo por cuadro y dejar la tarea sin marcar. Si no se llega, **detenerse y consultar**.
- [ ] 11.3 Recorrer el filtro de entrada de la propuesta, fila por fila, en el navegador. Informar lo que no se cumpla.
- [ ] 11.4 Comprobar que Entrenar, Competir y las otras pestañas no cambiaron más que en el rosa y la escala de su diagrama: `npm test` completo y un recorrido corto.
- [ ] 11.5 Correr `openspec validate vista-de-la-red --strict` y `npm test`. Actualizar `PENDIENTES.md`: quitar la nota de la vista de la red y anotar lo que quedó fuera de alcance y sin medir.
- [ ] 11.6 Informe final con capturas de antes y después, que separe lo medido, lo observado y lo que no se probó.
