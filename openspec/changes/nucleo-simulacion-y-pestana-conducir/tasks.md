# Tasks

## 1. Base del proyecto

- [x] 1.1 Crear `package.json` con `"type": "module"`, scripts `test` y `start`, y sin dependencias; verificar que `npm test` corre y termina sin errores
- [x] 1.2 Crear `tools/serve.mjs` sobre el módulo `http` de Node; verificar que `npm start` sirve `index.html` y entrega los `.js` con el tipo de contenido correcto
- [x] 1.3 Crear `index.html`, `styles/tokens.css`, `styles/app.css` y `src/main.js` con el mensaje estático de respaldo que el arranque elimina; verificar en el navegador que la página carga sin errores en consola y que al abrir el archivo con doble clic queda visible el mensaje de respaldo
- [x] 1.4 Crear la prueba de arquitectura que prohíbe en `src/core` importar fuera de `core` y usar `document`, `window`, `Math.random`, `Date.now` y `performance.now`; verificar que falla al agregar a propósito un uso prohibido y que pasa al quitarlo
- [x] 1.5 Escribir `README.md` (qué es, cómo ejecutar, cómo probar, cómo publicar como sitio estático, créditos) y agregar `.nojekyll`; verificar que cada comando documentado funciona tal como está escrito

## 2. Núcleo: geometría y azar

- [x] 2.1 Implementar la geometría del núcleo (vectores, intersección de segmentos, contorno de un rectángulo rotado, contacto entre contornos); verificar con pruebas que cubren cruce, no cruce, segmentos paralelos y contornos que se tocan
- [x] 2.2 Implementar el generador de azar con semilla y la derivación por índice; verificar con pruebas que misma semilla da la misma secuencia y semillas distintas dan secuencias distintas

## 3. Núcleo: pista

- [x] 3.1 Implementar la pista por línea central, ancho y carriles, con bordes desplazados unidos en inglete y rechazo de curvas demasiado cerradas; verificar con pruebas los escenarios de bordes en recta y en pista con curva
- [x] 3.2 Implementar centro de carril y progreso por proyección con búsqueda desde el último tramo; verificar con pruebas los escenarios de avanzar, cambiar de carril, retroceder y recorrer una curva
- [x] 3.3 Implementar la calle recta de 2, 3 o 4 carriles con 3 por defecto; verificar con pruebas el valor por defecto y el rechazo de cantidades no admitidas y de carriles inexistentes

## 4. Núcleo: auto y sensores

- [x] 4.1 Implementar la física del auto (aceleración, velocidad máxima, marcha atrás, fricción, giro, controles contradictorios); verificar con una prueba por cada escenario de la spec de simulación y de controladores
- [x] 4.2 Implementar los sensores (abanico, lectura normalizada, orden estable, detección de bordes y vehículos, ajuste de valores fuera de rango, valores por defecto); verificar con una prueba por cada escenario de la spec de sensores

## 5. Núcleo: tráfico

- [x] 5.1 Implementar el tráfico como función pura de semilla y número de grupo, con densidad e irregularidad; verificar con pruebas sobre mil semillas el carril libre y la separación mínima, y con pruebas los escenarios de calle vacía, densidad e irregularidad
- [x] 5.2 Implementar el movimiento del tráfico y la materialización por ventana alrededor del conductor; verificar con pruebas que el tráfico es alcanzable, no se toca entre sí durante un minuto simulado y sigue existiendo tras diez kilómetros

## 6. Núcleo: mundo y contrato de controlador

- [x] 6.1 Definir el contrato de controlador y la percepción, e implementar el paso del mundo (controladores, física, tráfico, choques, sensores); verificar con pruebas que un controlador que solo avanza mueve el auto y que la percepción cumple sus escenarios
- [x] 6.2 Implementar choque, reinicio y pausa; verificar con pruebas los escenarios de choque contra borde y tráfico, controles ignorados, reinicio idéntico a un mundo nuevo y pausa sin efecto en la evolución
- [x] 6.3 Escribir la prueba de reproducibilidad: dos corridas con la misma semilla y los mismos controles coinciden en todos los pasos, y con otra semilla el tráfico difiere; verificar que pasa
- [x] 6.4 Documentar en `README.md` la arquitectura por capas y el contrato de controlador; verificar que la descripción coincide con los módulos existentes

## 7. Idiomas, preferencias y ayuda contextual

- [x] 7.1 Implementar el sistema de idiomas (diccionarios `es` y `en`, traducción con parámetros, reescritura en vivo, idioma inicial, texto faltante); verificar con pruebas la paridad de claves, la elección del idioma inicial y el uso del otro idioma cuando falta un texto
- [x] 7.2 Implementar las preferencias recordadas con tolerancia a la falta de almacenamiento; verificar con una prueba que usa un almacenamiento que falla y obtiene los valores por defecto sin error
- [x] 7.3 Implementar el sistema de tooltips en dos partes (aparición con espera y con foco, cierre con Escape, ubicación dentro de la ventana, controles no disponibles con `aria-disabled`); verificar en el navegador cada escenario de la spec de ayuda contextual
- [x] 7.4 Implementar la función de auditoría de tooltips; verificar que reporta un control dejado a propósito sin ayuda y que no reporta nada al corregirlo

## 8. Estructura de la app

- [x] 8.1 Implementar el registro de pestañas con montar y desmontar, la barra con las seis pestañas (una habilitada) y la disposición de escenario a la izquierda y panel a la derecha; verificar en el navegador el orden, la pestaña activa y que las no disponibles no se abren
- [x] 8.2 Implementar el selector de idioma y el interruptor de guía, conectados a las preferencias; verificar en el navegador el cambio en vivo y que ambos se recuerdan al recargar
- [x] 8.3 Implementar los créditos con enlace al curso; verificar que se abren desde la pestaña y que el enlace abre en otra pestaña del navegador
- [x] 8.4 Implementar el aviso para ventanas de menos de 600 píxeles (celulares); verificar achicando y agrandando la ventana, y que a 800 píxeles no aparece
- [x] 8.5 Implementar el manejo de fallas inesperadas con mensaje y reinicio de la pestaña; verificar provocando un error desde la consola
- [x] 8.6 Escribir los tooltips y los textos en español e inglés de todos los controles de la estructura, incluidas las pestañas no disponibles; verificar que la auditoría no reporta faltantes y que la prueba de paridad pasa
- [x] 8.7 Implementar el panel ajustable arrastrando su borde (límites, teclado, doble clic, tooltip en es/en) y recordar su ancho en las preferencias; verificar con pruebas los límites y la preferencia, y en el navegador cada escenario

## 9. Vista del escenario y teclado

- [x] 9.1 Implementar el bucle de paso fijo con acumulador, tope de pasos por cuadro y pausa al ocultarse la página; verificar con pruebas que 60 Hz y 144 Hz ejecutan la misma cantidad de pasos en el mismo tiempo y que una pausa larga no provoca un salto
- [x] 9.2 Implementar el dibujo de pista, carriles, auto, tráfico y auto chocado, con ajuste al tamaño y a la densidad de píxeles, tomando los colores de `tokens.css`; verificar en el navegador contra los escenarios de dibujo y de cambio de tamaño
- [x] 9.3 Implementar el dibujo de los rayos con sus dos tramos, la opción de ocultarlos y la opción que omite pista y tráfico; verificar en el navegador cada opción
- [x] 9.4 Implementar la cámara (seguimiento, zoom con rueda y botones con límites, paneo, restablecer con control y atajo); verificar con pruebas que el zoom mantiene fijo el punto bajo el cursor y respeta los límites, y en el navegador el paneo y el restablecimiento
- [x] 9.5 Implementar el controlador de teclado (flechas y WASD, varias teclas, ignorar campos de texto, no desplazar la página, soltar al perder el foco); verificar con pruebas usando eventos simulados cada escenario de la spec de controladores
- [x] 9.6 Escribir los tooltips y los textos en español e inglés de los controles de cámara; verificar que la auditoría no reporta faltantes y que la prueba de paridad pasa

## 10. Pestaña 1: El problema

- [x] 10.1 Componer la pestaña (mundo, controlador de teclado, vista) con su estado por defecto; verificar en el navegador que abre con calle de tres carriles, auto detenido, tráfico y sensores visibles, y que la flecha arriba mueve el auto
- [x] 10.2 Implementar los indicadores del intento (distancia, vehículos superados, intentos, mejor distancia); verificar con pruebas el cálculo y en el navegador que se actualizan al manejar
- [x] 10.3 Implementar el fin del intento por choque, reiniciar (botón y tecla R), tráfico nuevo y pausa (botón y barra espaciadora, con indicación visible); verificar en el navegador cada escenario, incluido que reiniciar conserva el tráfico y tráfico nuevo lo cambia
- [x] 10.4 Implementar las barras de percepción, los cuatro indicadores de acción y el interruptor de sensores; verificar en el navegador que las barras siguen a los rayos en orden y que los indicadores responden a las teclas
- [x] 10.5 Implementar el modo ver como la máquina; verificar en el navegador que oculta calle y tráfico, mantiene rayos y barras, y vuelve a mostrar todo al chocar o desactivarlo
- [x] 10.6 Implementar el texto de guía y las tres misiones con su progreso; verificar con pruebas la lógica de progreso, cumplimiento y reinicio al chocar, y en el navegador que se ocultan con el interruptor de guía
- [x] 10.7 Implementar la configuración avanzada colapsada (carriles, densidad, irregularidad, sensores) con aplicación inmediata y el botón de restablecer; verificar en el navegador cada escenario
- [x] 10.8 Escribir los tooltips y los textos en español e inglés de todos los controles, indicadores, misiones y mensajes de la pestaña; verificar que la auditoría no reporta faltantes y que la prueba de paridad pasa
- [x] 10.9 Calibrar los valores de física y de tráfico por sensación de manejo y actualizar la tabla de `design.md` si cambian; verificar que todas las pruebas siguen pasando
- [x] 10.10 Implementar la velocidad máxima configurable del auto (12 a 40 m/s, 15 por defecto, marcha atrás a la mitad) en el núcleo y en la configuración avanzada, compartida por todas las pestañas y recordada en las preferencias; verificar con pruebas el tope, el ajuste fuera de rango y la percepción, y en el navegador el cambio, el restablecer y que se recuerda al recargar

## 11. Verificación integral

- [x] 11.1 Ejecutar `npm test` completo; verificar que todas las pruebas pasan
- [x] 11.2 Recorrer toda la aplicación en inglés (pestaña, tooltips, mensajes, créditos, aviso de ventana angosta); verificar que no aparece ningún texto en español
- [x] 11.3 Medir la tasa de cuadros durante diez segundos de manejo con la configuración por defecto; verificar que el promedio es de al menos 55 cuadros por segundo
- [x] 11.4 Verificar a mano en el navegador cada feature visible contra el filtro de entrada (qué concepto hace visible, si se entiende sola, si el mentor puede ocultarla, cómo se vuelve atrás) y contra los escenarios de las specs que no tienen prueba automática

## Workflow follow-up

- Archivar el cambio una vez revisado y verificado.
