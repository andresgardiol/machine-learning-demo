# Tasks

## 0. Antes

- [x] 0.1 Sacar las capturas del antes con el navegador: El problema al abrir (sensores visibles y tráfico ya alejado a los 5 s), un arrastre en el óvalo siguiendo al auto (la cámara lo pierde) y la ventana de créditos. Guardarlas en `borradores/bienvenida-y-primer-manejo/antes/`. Verificación: están los cuatro archivos.

## 1. Paneo que sigue al auto (vista-escenario, D1)

- [x] 1.1 Agregar en `src/render/camera.js` el paneo que recibe el auto seguido. Con auto seguido, corre `anchor` como `zoomAt` y suelta el seguimiento si el auto queda fuera de la pantalla. Sin auto, o con el circuito entero a la vista, se comporta como el `pan` de hoy. Verificación: `pan(dx, dy)` sin auto sigue pasando las pruebas actuales de `tests/camera.test.js`.
- [x] 1.2 Pruebas en `tests/camera.test.js`: un arrastre de 100 px corre al auto 100 px y sigue `following`; el auto sigue en ese lugar después de avanzar; un arrastre que lo saca suelta el seguimiento; al mínimo en un circuito suelta el seguimiento; `reset()` y `follow()` vuelven al `anchor` de siempre; la misma secuencia de arrastres da el mismo `anchor`. Verificación: `npm test` en verde.
- [x] 1.3 Hacer que el arrastre de `src/render/view.js` pase `lastTarget` al paneo y actualice el indicador del botón de seguir (`syncFollowIndicator`). Verificación: con el navegador, después de un arrastre chico en El problema, el botón "Seguir el auto" no se marca como activo y el auto sigue en pantalla mientras avanza.
- [x] 1.4 Revisar que el diagrama de la red (`network-inspector.js`) y el centrado por teclado de Inspeccionar y del Laboratorio no cambian: ninguno le pasa el auto al paneo. Verificación: búsqueda de llamadas y `npm test` en verde.

## 2. Tráfico que espera al conductor (pestana-conducir, D2)

- [x] 2.1 En `src/tabs/drive/index.js`, renombrar `tapeStarted` a una marca de intento arrancado que se ponga en el `keydown` de manejo, con el mismo criterio que apaga el cartel. Cuando no está puesta, no se llama a `world.step()`. Borrar la condición duplicada del bucle. Verificación: con el navegador, a los 10 s de abrir la pestaña el tráfico sigue en el mismo lugar y el tiempo del intento en cero.
- [x] 2.2 Volver a poner la espera en `restartAttempt` (reiniciar, tráfico nuevo, cambio de pista o ajuste que rearma). Verificación: con el navegador, después de chocar y reiniciar, y después de "Tráfico nuevo", el tráfico espera quieto.
- [x] 2.3 Con la pausa puesta antes de manejar, una flecha marca el arranque, pero nada se mueve hasta reanudar. Verificación: con el navegador.
- [x] 2.4 Extraer la decisión "esta tecla arranca el intento" a una función sin DOM y probarla en `tests/`: las teclas de manejo sí; V, zoom, modificadores y campos de texto no. Verificación: `npm test` en verde.
- [x] 2.5 Prueba de determinismo con el núcleo: dos mundos con la misma semilla, uno con 0 y otro con 300 cuadros de espera sin avanzar, dan las mismas posiciones paso a paso con las mismas teclas. Verificación: `npm test` en verde.

## 3. Sensores apagados por defecto (pestana-conducir, D3)

- [x] 3.1 Poner `showSensors: false` al montar El problema y revisar que el interruptor se lea apagado (`aria-checked="false"`) y que las barras sigan. Verificación: con el navegador, al entrar no se ven rayos; al encender el interruptor aparecen; "Ver como la máquina" los muestra igual.
- [x] 3.2 Revisar que la guía, la consigna y el tooltip del interruptor no digan que los rayos se ven al entrar. Si lo dicen, ajustar el texto en `src/i18n/es.js` y `src/i18n/en.js`. Verificación: lectura de los textos y `tests/i18n.test.js` en verde.

## 4. Ventana de bienvenida (estructura-app, D4 y D5)

- [x] 4.1 Agregar `welcomed` (clave `mlLab.welcomed`) a `src/ui/preferences.js`, tolerante a fallas como las demás. Probarlo en `tests/preferences.test.js`: falso por defecto, verdadero después de escribirlo, falso sin error con un almacenamiento que lanza. Verificación: `npm test` en verde.
- [x] 4.2 Textos de la ventana en `src/i18n/es.js` y `src/i18n/en.js`: título, dos o tres párrafos cortos (qué es la app, empezar manejando en El problema con las flechas, después se le enseña a una máquina), "Empezar a manejar", la cruz de cerrar, "Ver la bienvenida" y el tooltip "qué hace / por qué importa" de cada control. Verificación: `tests/i18n.test.js` en verde (mismas claves en los dos idiomas).
- [x] 4.3 Armar el `<dialog>` de bienvenida en `src/ui/app.js`, con la acción principal y la cruz. Se abre con `showModal()` en la primera visita, y cualquier cierre escribe `welcomed`. "Empezar a manejar" deja El problema a la vista y enfoca el escenario. Verificación: con el navegador y el almacenamiento vacío, aparece; "Empezar a manejar" y después la flecha arriba mueven el auto sin otro clic; al recargar no aparece.
- [x] 4.4 Agregar "Ver la bienvenida" en los créditos: cierra los créditos, abre la bienvenida y no toca la marca. Verificación: con el navegador.
- [x] 4.5 Confirmar que con la bienvenida abierta una flecha no mueve el auto ni arranca el intento (D5). Si no es así, ignorar en `input/keyboard.js` y en `onDrivingKey` las teclas con el foco dentro de un `dialog` abierto. Verificación: con el navegador.
- [x] 4.6 Revisar que la bienvenida cuente como diálogo abierto para la acción principal (`main-action.js`) y para la auditoría de `ui/audit.js` (24 px, contraste, foco visible). Verificación: la auditoría sin errores nuevos con la ventana abierta.
- [x] 4.7 Estilos de la ventana con los tokens del sistema de diseño, en claro y oscuro, a 1366×768 y 1440×900, sin desplazamiento. Verificación: capturas en los dos tamaños.

## 5. Cierre

- [x] 5.1 `npm test` completo en verde.
- [x] 5.2 Verificación manual en el navegador contra el filtro de entrada, para cada una de las cuatro partes: qué concepto habilita, si se entiende sin explicación, si el mentor puede ignorarla y cómo se vuelve atrás (Restablecer la vista, Reiniciar, el interruptor y "Ver la bienvenida"). Anotar el resultado en `borradores/bienvenida-y-primer-manejo/comparacion.md`, separando lo medido de lo que no se probó.
- [x] 5.3 Sacar las capturas del después, con los mismos encuadres de 0.1, en `borradores/bienvenida-y-primer-manejo/despues/`, y sumarlas a la comparación. Verificación: los archivos existen y se ven en la comparación.
- [x] 5.4 Sacar de Prioridad 1 y 2 de `PENDIENTES.md` las tres notas del 20 de noviembre y sumar una línea en *Hecho*. Anotar lo que quedó, si queda algo. Verificación: lectura del archivo.

## Workflow follow-up

- El dueño revisa las capturas y la comparación antes de archivar.
- Archivar con `/opsx:archive` y sincronizar las specs `vista-escenario`, `pestana-conducir` y `estructura-app`.
