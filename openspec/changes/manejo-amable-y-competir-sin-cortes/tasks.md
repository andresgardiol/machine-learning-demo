# Tasks

## 1. Antes

- [x] 1.1 Armar `borradores/manejo-amable-y-competir-sin-cortes/capturar.mjs` a partir del guion de `red-al-centro`. Vistas, a 1440×900 y 1366×768:
  - El problema al abrir;
  - manejando unos segundos con un recorrido de teclas fijo, cuadro por cuadro;
  - en el momento de un choque;
  - Competir al abrir (con el cartel);
  - Competir en carrera;
  - Competir con seis competidores;
  - Competir a 1236×863.

  Medidas por vista:
  - el alto libre debajo de la acción en El problema;
  - el desplazamiento de cada zona;
  - si "Choques" y "Estado" se tocan o se salen de su caja;
  - los renglones del nombre de la pista en la tabla y en "Primero";
  - si el número de la meta se separa de su unidad en el cartel;
  - los botones sin tooltip según `auditTooltips()`;
  - `auditSistema()` y `auditHierarchy()`.

  Verificación: dos corridas seguidas dan las mismas medidas.

  *Hecho: `borradores/manejo-amable-y-competir-sin-cortes/capturar.mjs`, con la base del guion de `red-al-centro` (Chrome sin ventana, tiempo virtual, perfil nuevo por vista). Vistas a 1440×900 y 1366×768: El problema al abrir, manejando (recorrido fijo con eventos de teclado reales: flecha arriba 3 s; izquierda 0,3 s; nada 1 s; derecha 0,3 s; nada 1 s), en el choque (arriba e izquierda hasta el primer cuadro chocado), Competir al abrir, en carrera (5 s después de Largar), con seis competidores (agregados desde el selector); Competir en carrera a 1236×863; El problema y Competir en inglés; y el tooltip del 👁 con el mouse del protocolo. Medidas: el alto de la tarjeta de acción, el hueco dentro de ella y lo libre debajo; el desplazamiento de cada zona y de la lista de competidores; cuánto sale cada encabezado del marcador de su caja y el hueco entre encabezados vecinos; los renglones (con `Range.getClientRects`) y el corte de los nombres en la tabla por pista y en «Primero»; si el número de la meta y su unidad quedan en el mismo renglón del cartel; el alto de cada competidor; las tres auditorías. `indice.mjs` las pasa a tabla.*

  *Medido: dos corridas seguidas sobre `2f7ffa9` dieron los tres `medidas-*.json` idénticos byte a byte (`cmp`).*
- [x] 1.2 Sacar el antes en `borradores/manejo-amable-y-competir-sin-cortes/antes/`, con `indice.md`, también en escala de grises. Es sobre el commit de partida de este cambio, o sea, después de `red-al-centro`. Verificación: el índice lista todas las vistas y las medidas.

  *Hecho: `borradores/manejo-amable-y-competir-sin-cortes/antes/` sobre `2f7ffa9` (después de `red-al-centro`), con 36 capturas e `indice.md` de 18 vistas.*

  *Medido:*
  - *El problema: la tarjeta de acción se estira (302 px a 1440, 247 a 1366) y tiene adentro un hueco de 176 px a 1440 y 121 a 1366 debajo de las teclas. El recorrido fijo termina con el auto **fuera de la calle** (0,3 s de izquierda a la velocidad que lleva a los 3 s).*
  - *Competir: «Choques» sale 7 px de su caja y queda encimado 3 px con «Estado» («ChoquesEstado»); en inglés, «Progress» sale 3 px y «Crashes» 4, con 1 px entre ellos. «Calle, tráfico nuevo» ocupa 1 renglón en la tabla por pista a 1440, 2 a 1366 y 3 a 1236; «Primero» con «7 sensores», 3 renglones a 1236. En el cartel, «1000» y «m» quedan en renglones distintos a 1440 y a 1366. El panel se desplaza 83 px a 1366 con los tres competidores (76 en inglés); con seis, 63 px a 1440 y 195 a 1366 (y el tablero 25). Cada competidor mide 36–37 px.*
  - *Distinto de lo anotado en el análisis: el tooltip del 👁 **sí** aparece al posar el mouse («Muestra u oculta en el escenario los sensores de este competidor…»), y los botones 👁 y ✕ ya tienen nombre accesible; `auditTooltips()` en 0 en todas las vistas, igual que `auditSistema()` y `auditHierarchy()`.*
- [x] 1.3 Medir el giro de hoy en Node: con el recorrido de teclas de "toque corto" (izquierda 6 cuadros) y de "mantener" (izquierda 60 cuadros) a 20 m/s, cuánto gira el auto y cuánto se corre de costado en el segundo siguiente. Verificación: tabla con las medidas, que se repite después del cambio.

  *Hecho: `borradores/manejo-amable-y-competir-sin-cortes/medir-giro.mjs` (Node, con el núcleo): la calle sin tráfico, el auto acelerado con la flecha arriba hasta 20 m/s y, con la flecha arriba siempre apretada, izquierda durante 6 o 60 cuadros y después nada durante 60. Mide el giro al soltar y el corrimiento de costado respecto de la calle.*

  *Medido (antes, el teclado devuelve lo apretado):*

  | Recorrido | Cuadros que giraron | Giro al soltar | Corrimiento en el segundo siguiente | ¿Choca? |
  |---|---|---|---|---|
  | Toque corto (izquierda 6 cuadros) | 6 | 0,18 rad (10,3°) | 3,58 m | no |
  | Mantener (izquierda 60 cuadros) | 29, hasta chocar | 0,87 rad (49,8°) | — | sí, contra el borde |

## 2. Volante suave

- [x] 2.1 El volante suave en el controlador de teclado: nivel por lado, acumulador, 18 cuadros de subida (`STEER_RAMP_STEPS`), vuelta a 0 al soltar y sin avanzar en pausa (D1). La lógica va en una función sin DOM. Verificación: pruebas de *Volante suave* ("Toque corto", "Mantener apretada", "Soltar", "En pausa", "Determinismo") y de *Controlador de teclado*.

  *Hecho: `src/input/steering.js`, sin DOM: `createSteering()` con `STEER_RAMP_STEPS = 18`; por lado, cuántos cuadros lleva apretado (el nivel es eso sobre 18, hasta 1) y un acumulador; en cada `step` suma el nivel y, si llega a 1, ese cuadro dobla y resta 1. Soltar vuelve el nivel y el acumulador a 0 en el mismo cuadro; cada lado lleva el suyo. `keyboard.js` lo usa en `control()`, que la simulación llama una vez por cuadro (en pausa el mundo no lo llama: no sube). Suma `held()` (lo apretado, sin avanzar el volante), `display()` (avanzar y retroceder, y el nivel de cada costado) y `last` (lo que devolvió el último cuadro). Pruebas en `tests/steering.test.js`; las del teclado que esperaban giro desde el primer cuadro leen ahora `held()` o recorren los 18 cuadros.*

  *Medido: `steering.test.js` (7 pruebas): 6 cuadros dan izquierda en 1 ("Toque corto"); manteniendo 60, todos desde el 18 ("Mantener apretada"); al soltar, el mismo cuadro sin giro y el nivel otra vez desde 1/18 ("Soltar"); con el mundo en pausa 30 pasos, el nivel sigue en 0, y mostrarlo no lo avanza ("En pausa"); la misma secuencia de teclas cuadro por cuadro da los mismos controles y el mismo auto ("Determinismo"). `keyboard.test.js`, "Dos teclas a la vez": avanzar en los 30 cuadros e izquierda en todos desde el 18.*
- [x] 2.2 Pruebas de que nada más cambia: los cerebros de ejemplo y un programa de reglas dan los mismos cuadros que antes del cambio, con la misma semilla (`reproducibility`, `example-brains`, `compete-logic`). Verificación: `npm test`; escenario "Otros controladores".

  *Hecho: `tests/steering-others.test.js`: la huella de 900 pasos (posición y ángulo de cada paso) del cerebro de ejemplo y del programa de reglas de 20 sensores, en la calle con tráfico y semilla 1, calculada sobre el código de antes (`2f7ffa9`, en un árbol de trabajo aparte) y fija en la prueba.*

  *Medido: las dos huellas son iguales antes y después (cerebro 2057855322, programa 1330019139). `reproducibility`, `example-brains` y `compete-logic` pasan sin cambios. `npm test`: 1500, todas pasan ("Otros controladores").*
- [x] 2.3 La grabación del Laboratorio guarda lo que devolvió el controlador. Verificación: escenario "Lo grabado es lo que hizo el auto", con una prueba o una sonda. No se mide si la imitación aprende.

  *Hecho: en el Laboratorio, la grabación guarda lo que devolvió `keyboard.control()` (lo que movió al auto); para saber si ya empezó a grabar y para esperar la primera tecla usa `held()`, que no avanza el volante. Inspeccionar compara "Vos" con lo apretado (`held()`), y El problema muestra `display()`: ninguno avanza el volante al dibujar.*

  *Medido (guion de verificación, `v2.3-grabado`, Chrome sin ventana): grabando con Tu manejo, 1 s de flecha arriba y un toque de 100 ms de izquierda dan 138 ejemplos; uno solo dice izquierda, y es el único paso en que el auto giró a la izquierda ("Lo grabado es lo que hizo el auto"). No se midió si la imitación aprende.*
- [x] 2.4 Repetir la medida de 1.3 con el volante suave. Verificación: tabla antes y después en la comparación.

  *Medido (`medir-giro.mjs`, Node, 20 m/s, con la flecha arriba apretada):*

  | Recorrido | Antes: cuadros que giraron | Antes: giro | Antes: corrimiento en el segundo siguiente | Después: cuadros que giraron | Después: giro | Después: corrimiento |
  |---|---|---|---|---|---|---|
  | Toque corto (6 cuadros) | 6 | 0,18 rad (10,3°) | 3,58 m | 1 | 0,03 rad (1,7°) | 0,60 m |
  | Mantener (60 cuadros) | 29, choca | 0,87 rad (49,8°) | — | 28, choca | 0,84 rad (48,1°) | — |

  *La cuenta de D1 para el toque (0,03 rad) se cumple. La de mantener 1 s (1,53 rad) no se puede medir así: a 20 m/s, la izquierda sostenida saca al auto de la calle a los 0,5 s, antes y después.*

## 3. El problema

- [x] 3.1 Izquierda y Derecha de "Lo que estás accionando" se llenan con el nivel del volante y muestran su número, sin destellar (el nivel cambia de a poco, no con el reparto). Tooltip en los dos idiomas. Verificación: escenarios de *Acción visible*; `auditTooltips()`; prueba de destellos si aplica (`flash-guard`).

  *Hecho: `actionBlock({ steer: true })` (en `shared/driving-cards.js`): izquierda y derecha reciben un número de 0 a 1 y se llenan de abajo hacia arriba (`--steer-level`), con su número en por ciento; sin pasar por la guarda de destellos, porque el nivel cambia de a poco y no con el reparto. Llevan el tooltip `drive.action.steer` (en los dos idiomas) y se pueden enfocar para leerlo. El problema le pasa `keyboard.display()`, que no avanza el volante. Avanzar y retroceder siguen siendo sí o no.*

  *Medido (guion de verificación, `v3.1-volante`): con avanzar apretado, la izquierda se llena 33 %, 67 % y 100 % a los 0,1, 0,2 y 0,3 s, y sigue en 100 %; al soltarla, vuelve a 0 y se apaga ("Presionar una tecla"); avanzar, encendida entera todo el tiempo ("Avanzar"). `auditTooltips()` en 0. No hace falta prueba de destellos: el relleno sigue al nivel, que no alterna.*
- [x] 3.2 La cinta del manejo debajo de la acción (D2): filas de sensores y velocidad, separación, cuatro filas de acción, 600 cuadros, congelada al chocar con su marca, vacía al reiniciar, en pausa quieta, nombre accesible, tooltip y la línea de guía en los dos idiomas. La cuenta de qué se dibuja en cada columna (juntar cuadros cuando el lienzo es angosto) va en una función sin DOM, con pruebas. Verificación: escenarios de *Cinta del manejo*, salvo los de 1366 y fluidez.

  *Hecho: `src/tabs/drive/tape.js`, sin DOM: `createTape()` (600 cuadros; `freeze` al chocar; `clear` al reiniciar), `tapeColumns(frames, ancho)` (una columna por cuadro, o varios por columna con la percepción promediada y la acción encendida si estuvo en alguno) y `tapeRows(sensores, alto)` (las acciones con su alto, de 13 a 18 px; los sensores se reparten el resto; con más de 12, sin nombre). Pruebas en `tests/drive-tape.test.js`. En `drive/index.js`, la tarjeta «La cinta del manejo» va debajo de la acción y se queda con el alto que sobra; un lienzo con nombre accesible (`drive.tape.label`), tooltip en el título y la línea de guía (la ayuda de la tarjeta, con la clase `guide`). Cada paso guarda lo que se percibía antes de moverse y lo que devolvió el controlador (`keyboard.last`). Se dibuja solo cuando cambia (un cuadro nuevo, otro tamaño u otro idioma). La cinta empieza con la primera tecla de manejo del intento: antes, el auto espera quieto y no hay nada que guardar.*

  *Decisión fuera del `design.md`: para que la cinta tenga alto, la tarjeta de acción toma el alto de su contenido (sin el mínimo de 160 px de las tarjetas) y la cinta crece con peso 4 frente al 1,4 de la percepción.*

  *Medido (guion de verificación, `v3.2-cinta`): al abrir, la cinta vacía con las filas rotuladas, 601×159 ("Estado por defecto"); después de avanzar 3 s con izquierda el último, 157 cuadros, avanzar en los 157 e izquierda en 28 (el recorrido terminó en un choque) ("Manejar"); congelada al chocar, con la marca «Choque» en la última columna, y sin avanzar después ("Choque"); con R, vacía ("Reiniciar"); con la guía apagada, la línea no se ve y la cinta sigue (crece a 601×239) ("Guía oculta"). "Muchos sensores": prueba de `tapeRows` con 30 (en El problema no se cambian los sensores). "En pausa": la cinta solo guarda cuando el mundo da un paso, y en pausa no da ninguno (observado en el código; la corrida se cruzó con un choque).*
- [x] 3.3 El cartel de primer manejo sobre la escena, con el estilo del de Competir, en los dos idiomas, que se va con la primera tecla y vuelve en cada visita, solo con la guía (D3). Verificación: escenarios de *Cartel de primer manejo*.

  *Hecho: el cartel `.drive-howto` sobre la escena, con las clases del cartel de largada de Competir (`start-layer`, `start-card`) y la clase `guide`; sin botón y sin eventos del mouse. Se va con la primera tecla de manejo permitida (`KEY_BINDINGS` y `keyAllowed`, fuera de un campo de texto) y vuelve en cada visita, porque es de cada montaje. Texto en los dos idiomas (`drive.howto`).*

  *Medido (guion de verificación, `v3.3-cartel`): al entrar se lee «Manejá con las flechas: ↑ avanza, ← → doblan» y el foco queda en la escena ("Al entrar"); con la flecha arriba desaparece ("Primera tecla"); chocar y reiniciar no lo trae ("Reiniciar no lo trae"); pasar a otra pestaña y volver, sí ("Otra visita"); con la guía apagada no se ve ("Guía oculta"). En inglés, «Drive with the arrows: ↑ goes, ← → turn». Sin medir: que el auto arranque en el mismo cuadro de la tecla (la tecla la atiende el teclado de siempre; el cartel solo se oculta).*
- [x] 3.4 Medir el tablero de El problema a 1440×900 y a 1366×768, en español y en inglés. Si a 1366×768 la cinta no llega a 80 px sin desplazar el tablero, **parar y consultar**, con las medidas. Verificación: "Pantalla de 1366×768" de la cinta, y "Percepción y acción a la vista" y *Panel a la vista sin desplazarse* de El problema.

  *Medido (guion, español e inglés): a 1440×900, la acción mide 152 px y la cinta 601×159, sin desplazar ninguna zona; a 1366×768, la cinta 527×80 y el tablero no se desplaza ("Pantalla de 1366×768", "Percepción y acción a la vista"). El panel no se desplaza en ninguno ("Panel a la vista sin desplazarse"). La primera versión dejaba la cinta en 80 px con el tablero desplazado 7 px; con la acción al alto de su contenido entra justo: no se dio la condición de parada.*

  *Observado: a 1366×768, con 80 px, las filas de los cinco sensores y la velocidad miden unos 4 px cada una y no llevan nombre; se lee la acción, la percepción apenas. Lo decide la sesión de diseño.*

## 4. Competir sin cortes

- [x] 4.1 Marcador con anchos de columna y encabezados que no se salen; el nombre de la pista en una línea con la forma corta o puntos suspensivos y tooltip; el número y su unidad juntos en el cartel (D4). Verificación: escenarios de *Marcador y tabla sin cortes*, medidos con el guion.

  *Hecho: en `styles/app.css`, los encabezados del marcador no se parten (`nowrap` con puntos suspensivos por las dudas) y las columnas de cifras tienen su ancho: Lleva 5,6 em, Choques 5,8 em y Estado 7 em (antes 4,6, 4,2 y 6,4). El nombre del competidor en la tabla por pista y en «Primero» va en un renglón, con puntos suspensivos y el nombre entero en el `title`. Entre el número de la meta y su unidad, un espacio que no se parte (`\u00a0`) en `stage.describe.goal*` y `compete.goal.*`, en los dos idiomas; las pruebas de la descripción de la carrera lo esperan así.*

  *Decisión fuera del `design.md`: "el nombre de la pista" de la tabla por pista y de «Primero» es el del competidor («Calle, tráfico nuevo», que lleva el nombre de la pista donde entrenó); las columnas de las pistas ya usan la forma corta. Para el nombre del competidor no hay forma corta: se usa directamente puntos suspensivos con el tooltip.*

  *Medido (guion): ningún encabezado sale de su caja (antes «Choques» salía 7 px) y entre «Choques» y «Estado» hay 16 px (antes, −3: encimados); en inglés, 13 y 20 px (antes 1). «Calle, tráfico nuevo» en 1 renglón a 1440, 1366 y 1236 (antes 1, 2 y 3), con puntos suspensivos y su `title` a 1366 y 1236; «Primero» en 1 renglón a 1236 (antes 3). En el cartel, «1000 m» en el mismo renglón a 1440 y 1366 (antes, separados). `auditSistema()` y `auditHierarchy()` en 0 ("Choques y estado", "Pista en una línea", "Nombre completo", "Meta en el cartel").*
- [x] 4.2 Nombre accesible y tooltip en los botones de solo ícono de la lista de competidores. Verificación: escenarios de *Botones de solo ícono con nombre*; `auditTooltips()` en 0 para esos botones.

  *Comprobado antes de tocar: los botones 👁 y ✕ de cada competidor ya tenían nombre accesible con el nombre del competidor («Sensores de 7 sensores: ocultos», «Quitar a 7 sensores de la carrera») y tooltip en los dos idiomas (`compete.sensorsOf`, `compete.remove`). No hubo que cambiarlos. El nombre del competidor en la lista suma su `title`, por si se corta.*

  *Medido (guion, `10-competir-tooltip-ojo`): con el mouse del protocolo sobre el 👁 aparece «Muestra u oculta en el escenario los sensores de este competidor, se lo siga o no» ("Sensores de un competidor"). `auditTooltips()` en 0 en todas las vistas de Competir, antes y después ("Auditoría"). "Lector de pantalla": el nombre accesible del ✕ es «Quitar a 7 sensores de la carrera» (dice "Quitar a 7 sensores" y agrega de dónde); sin probar con un lector de pantalla.*
- [ ] 4.3 Competidores en un renglón y el panel sin desplazarse a 1366×768 con tres; con seis, solo la lista. Si con tres el panel se sigue desplazando después de achicar los espacios, **parar y consultar**. Verificación: escenarios de *Panel a la vista en 1366×768* y los de *Pestaña a la vista sin desplazarse* a 1440×900, que siguen igual.

## 5. Cierre

- [ ] 5.1 `npm test` completo, y las tres auditorías en todas las vistas del guion, en los dos idiomas. Verificación: los resultados anotados; lo que ya fallaba se anota sin arreglarlo.
- [ ] 5.2 Fluidez de El problema con la cinta y de Competir con seis competidores en el circuito de curvas, en Chrome sin ventana, antes y después. Si alguno baja de la medida sustituta de 55 cuadros por segundo, **parar y consultar**. Verificación: tabla con las medidas.
- [ ] 5.3 El después con el mismo guion en `borradores/manejo-amable-y-competir-sin-cortes/despues/`, con vistas nuevas: la cinta después de 5 s de manejo, la cinta congelada en un choque, el cartel de primer manejo y el tooltip del ícono de sensores. Escribir `comparacion.md` con el antes y el después lado a lado y las medidas. Verificación: la comparación muestra cada punto de *What Changes*.
- [ ] 5.4 Escribir `borradores/cuatro-pestanas-antes-y-despues.md`, la comparación de toda la revisión en el orden en que se hizo. Lleva:
  - un índice;
  - "De punta a punta" de cada pestaña: el antes del primer cambio que la tocó y el después del último;
  - por cada punto de *What Changes* de `red-al-centro` y de este cambio, en orden: qué cambió en una o dos oraciones, la tabla de medidas antes y después, y las capturas lado a lado, con enlaces relativos a `red-al-centro/` y a `manejo-amable-y-competir-sin-cortes/`.

  Usa el formato de `borradores/comparaciones-entrenar.md`. Cada afirmación lleva su rótulo: medido (con cómo), observado o sin probar. Verificación: todos los enlaces a imágenes existen (comprobarlo con un script).
- [ ] 5.5 Verificación en el navegador contra el filtro de entrada:
  - un toque corto de flecha no saca al auto de la calle a 20 m/s;
  - la cinta muestra lo que se hizo y se congela al chocar;
  - el cartel se va con la primera tecla y no se ve con la guía apagada;
  - Competir se lee entero a 1366×768.

  Anotar lo que no se pudo probar. La sensación del volante la prueba el dueño a mano.

## Workflow follow-up

- La sesión de diseño revisa las dos comparaciones y archiva los dos cambios.
