# Tasks

## 1. Antes

- [x] 1.1 Armar `borradores/red-al-centro/capturar.mjs` a partir del guion más reciente (`borradores/entrenar-mutacion-a-la-vista/capturar.mjs`). Usa Chrome sin ventana, tiempo virtual y un perfil nuevo por vista. Vistas, a 1440×900 y 1366×768:
  - Inspeccionar al abrir;
  - con una neurona elegida;
  - la tabla de pesos;
  - con dos cambios de prueba;
  - manejando vos;
  - en el momento de un choque (con un cerebro o un tráfico que choque de forma reproducible; anotar cuál);
  - Laboratorio en Compuertas al abrir;
  - Compuertas después de un cambio a mano;
  - Puntos;
  - Tu manejo.

  Medidas por vista:
  - el ancho de cada zona y el tamaño de la escena;
  - los renglones de la barra de arriba de la red;
  - los controles a la vista sobre y debajo de la red, y cuántos están sin acción;
  - el desplazamiento de cada zona;
  - cuántas acciones principales hay y cuál;
  - si se ve la guía (texto o atajos) con algo elegido;
  - el alto de las pastillas de peso del Laboratorio;
  - los renglones de las acciones del panel del Laboratorio;
  - los resultados de `auditSistema()`, `auditHierarchy()` y `auditTooltips()`.

  Verificación: dos corridas seguidas sobre el mismo código dan las mismas medidas.

  *Hecho: `borradores/red-al-centro/capturar.mjs`, copia del guion de `entrenar-mutacion-a-la-vista` (Chrome sin ventana por el protocolo DevTools, tiempo virtual, perfil nuevo por vista, `Math.random` con semilla) con las diez vistas pedidas a 1440×900 y 1366×768, más Inspeccionar y Compuertas en inglés a 1440 (22 vistas). Las medidas buscan por clase lo que existe antes y después: anchos de `.stage`, `.board` y `.panel`; el lienzo de la red y el de la escena con su zona; los renglones de los controles de `.inspect-controls`; los controles a la vista arriba (`.inspect-controls` y la franja nueva) y abajo (`.inspect-playbar`) con los que tienen `aria-disabled`; el desborde de cada zona; `auditHierarchy().filled`; qué se ve de la guía; el alto de `.inspector-knob`; los renglones del texto de las acciones del panel del Laboratorio (con `Range.getClientRects`); y las tres auditorías. `indice.mjs` las pasa a tabla.*

  *El choque: con los valores por defecto (velocidad 20 m/s) el cerebro de ejemplo `example:street-new` **no choca** en 60 s (medido en Node con el núcleo: calle, 3 carriles, tráfico 50 %, irregularidad 0, semilla 1). Se usa la irregularidad en 100 %, que choca contra un vehículo a los 10,47 s y 203,9 m (628 pasos): medido en Node, y en el navegador el guion lo encuentra en el mismo paso. El guion la cambia en la barra (evento `change` de `#inspect-irregularity`).*

  *Medido: dos corridas seguidas sobre `926226d` sin tocar dieron `medidas-1440x900.json` y `medidas-1366x768.json` idénticos byte a byte (`cmp`). Las imágenes no son idénticas byte a byte (el flujo de la red), como en los cambios anteriores.*
- [x] 1.2 Sacar el antes en `borradores/red-al-centro/antes/` sobre el commit de partida, con su `indice.md`, también en escala de grises. Verificación: el índice lista todas las vistas y las medidas.

  *Hecho: `borradores/red-al-centro/antes/` sobre `926226d`, con 44 capturas (color y gris) e `indice.md` con las 22 vistas.*

  *Medido (1440×900, español):*
  - *Inspeccionar: zonas 708 / 360 / 360; la red en la izquierda, 708×653; la escena en el centro, 325×210. Sobre la red, 14 controles en 2 renglones, 3 sin acción (Deshacer, Restablecer la red, Ver original); abajo, 8, con «Atrás» sin acción. Con dos cambios, la barra pasa a 3 renglones y la red baja a 708×625 (28 px). Con una neurona elegida no se ve la guía: ni la consigna, ni «Más sobre esta pestaña», ni los atajos. Una sola acción principal (Pausar). Sin desplazamiento en ninguna zona. Auditorías en 0.*
  - *1366×768: zonas 634 / 360 / 360; red 634×521; escena 325×210.*
  - *Choque: al chocar, «Pausar» sigue siendo la principal y el intento vuelve a empezar solo a los 60 cuadros.*
  - *Laboratorio: las mismas zonas; la red 708×565. Pastillas de peso de 18 px de alto. Los experimentos son tres segmentos de 32 px bajo «Datos». «Reproducir» es la principal en Compuertas desde el principio. Sobre la red, 13 controles, 2 sin acción. Con Tu manejo a 1366, el panel se desplaza 23 px por dentro.*
  - *Distinto de lo observado el 17 de noviembre: «Reiniciar pesos», «Red de siempre» y «Guardar como cerebro» **no** se parten hoy, ni a 1440 ni a 1366 (un renglón cada una). Con Compuertas y Puntos, «Guardar como cerebro» no está en el panel.*

## 2. Disposición: el mundo a la izquierda, la red al centro

- [x] 2.1 Inspeccionar: la zona izquierda tiene la escena (`flex: 1`), con el renglón de cámara (Seguir al auto, +, −) y "Manejar vos" en altura normal, y la decisión debajo. La red va a la zona central y el panel no cambia. Anchos por defecto: 400 / resto / 360. Se descartan los anchos guardados con la forma vieja (D2 y *Migration Plan*). Verificación: escenarios de *La red en el centro*, "Disposición de Inspeccionar" y "Recorrido con el teclado" de *Disposición común*, y "Tomar el volante con el botón" de *Manejar vos*.

  *Hecho: `src/tabs/shared/net-zones.js` con los anchos de las dos pestañas (`NET_ZONES`: izquierda 400, se queda en 280 mientras la red conserva 600, después la red cede hasta 440 y por último la izquierda hasta 200; panel 360). `ui/layout.js` los aplica con `netInCenter(spec)` en `fitZones`, `stageLimits` y `panelLimits`; el panel cede primero, como en el resto de la app. En `inspect/index.js` la red (`.inspect-net`) va al tablero (`.net-board`, de borde a borde) y la zona izquierda es `.inspect-left`: la escena (`flex: 1`) y la decisión debajo. La leyenda pasa al panel, antes de las misiones, como pide *Guía, leyenda y misiones*. "Manejar vos" va al renglón de la cámara (`sceneView.controls`) con la altura normal (32 px); los avisos de la escena, a su esquina (`sceneView.corner`). La preferencia nueva es `netLeftWidth` (`mlLab.net.leftWidth`); al leerla se borra la vieja (`mlLab.inspect.stageWidth`), que medía la red a la izquierda (*Migration Plan*).*

  *Medido (guion, 1440×900): zonas 400 / 668 / 360, la red 667×653 en el centro, la escena 374×616 a la izquierda, sin desplazamiento en ninguna zona ("Pantalla de 1440×900", "Anchos por defecto", "Disposición de Inspeccionar"). A 1366×768: 394 / 600 / 360 (la izquierda cede 6 px para que la red conserve 600); la red 599×493 y la escena 368×484.*

  *Medido (guion de verificación, `v2.1-recorrido-teclado`): 60 Tab desde la escena pasan por izquierda (7 controles), el borde, centro (28), el borde y panel (8), en ese orden ("Recorrido con el teclado", "Orden del foco"). `v2.1-manejar-vos`: "Manejar vos" queda activo, en el renglón de la cámara, de 32 px; el aviso dice «Manejás vos · la red solo mira»; con el foco en la escena, medio segundo de flecha izquierda gira el auto 0,9 rad ("Tomar el volante con el botón").*

  *Hallazgo, sin parar (no es condición de parada): a 1366×768, con nada elegido, el panel de Inspeccionar se desplaza 79 px porque la leyenda pasó al panel; las misiones quedan abajo. Antes no se desplazaba. Con una neurona elegida no se desplaza. La spec solo pide el panel sin desplazar a 1440×900; lo decide la sesión de diseño.*
- [x] 2.2 La escena de Inspeccionar usa la cámara del escenario grande en vez de la escena chica. La rueda y los botones acercan, y seguir al auto vuelve al encuadre por defecto, que muestra los rayos enteros. Arrastrar desde una manija de rayo mueve el rayo; desde otro lado, la cámara (D2). Verificación: escenarios de *Escena del auto en segundo plano* ("Encuadre", "Acercar", "Volver al encuadre"), "Inspeccionar y Laboratorio con cámara" de *Escena chica* y *Rayos que se mueven a mano*.

  *Hecho: `createStageView` suma `framing: 'rays'`: los controles de cámara del escenario grande, con el encuadre por defecto de la escena chica (el auto al centro y sus rayos enteros, `smallZoom`). La rueda, los botones y el arrastre lo dejan (`fitted = false`); "Seguir al auto" vuelve a él. Con `resetKey: false` la tecla V no toca la escena y el botón dice «Seguir al auto», sin el atajo, con su tooltip propio (`help.camera.reset.rays`, en los dos idiomas). Las manijas de los rayos se atienden antes que el paneo: si el arrastre empieza en una manija, mueve el rayo; si no, la cámara.*

  *Medido (guion de verificación, `v2.2-camara`): al abrir, zoom 10,75 siguiendo al auto con el encuadre de los rayos; la rueda hacia arriba lo lleva a 14,51 y el botón + a 18,14, sin mover la página, el tablero, la zona izquierda ni el zoom de la red (1); "Seguir al auto" vuelve a 10,75 con el encuadre de los rayos ("Encuadre", "Acercar", "Volver al encuadre"); la tecla V no cambia la escena; un arrastre lejos de las manijas deja de seguir al auto. `v2.2-manijas`: en pausa hay 5 manijas; arrastrar la del sensor 3 pone la entrada a mano en 0,19 y la cámara sigue al auto con su encuadre (*Rayos que se mueven a mano*).*
- [x] 2.3 Laboratorio: la zona izquierda tiene los datos según el experimento (plano, tabla de verdad, ejemplo en curso, curvas; o la escena con cámara y las curvas con Tu manejo). La red va al centro. Verificación: escenarios de *Disposición del Laboratorio*, incluida "Cámara con tu manejo".

  *Hecho: en `lab/index.js` la red va al tablero (`.net-board`) y la columna de datos (`.lab-board.lab-left`: datos, curva de respuesta, ejemplo en curso y curvas) a la zona izquierda. La escena de Tu manejo usa `framing: 'rays'` y sus avisos van a la esquina de la escena. Con Tu manejo la escena se queda con el alto que sobra y la curva de respuesta con el suyo, hasta el 45 %.*

  *Medido (guion): las tres vistas del Laboratorio a 1440×900 con zonas 400 / 668 / 360 y la red 667×565 en el centro, sin desplazar ninguna zona ("Pantalla de 1440×900", "Mismos anchos que Inspeccionar"). Tu manejo: la escena 374×450 a la izquierda (antes 325×210). `v2.3-laboratorio-camara`: la rueda hacia abajo aleja la escena de 10,75 a 7,97 sin mover la página ni la red ("Cámara con tu manejo"). A 1366×768, Compuertas sin desplazamiento.*
- [x] 2.4 Las acciones del panel del Laboratorio no se parten en español con el panel de 360 (D9). Verificación: "Acciones enteras".

  *Hecho: `.lab-actions-panel .tool { white-space: nowrap }`: cada acción en un renglón; si dos no entran, la segunda baja entera.*

  *Medido (guion): «Reiniciar pesos», «Red de siempre» y «Guardar como cerebro» en un renglón cada una, a 1440 y a 1366, con el panel en 360 ("Acciones enteras"). Ya no se partían antes de este cambio (tarea 1.2).*
- [x] 2.5 Pruebas de disposición (`tests/inspector-layout.test.js`, `tests/layout.test.js` o las que correspondan): el orden de las zonas, los anchos por defecto y los mínimos. Verificación: `npm test`.

  *Hecho: `tests/inspect-zones.test.js` reescrita: anchos por defecto a 1440 (400 / 668 / 360) y a 1366 (394 / 600 / 360); los mismos en el Laboratorio; la red no baja de 600 mientras la izquierda tenga 280; de 1032 a 1240, la izquierda en 280 y la red entre 440 y 600; de 960 a 1032, la red en 440 y la izquierda con lo que sobra (208 a 960); el orden y que la red es la más ancha; el tope del panel; las demás pestañas igual; y el descarte del ancho guardado con la forma vieja.*

  *Medido: `npm test`, 1470 pruebas, todas pasan.*

## 3. Volver el mundo atrás (núcleo)

- [x] 3.1 `world.restore(state)` en `src/core/world.js`, con el estado que guarda cada cuadro (D5). Antes, comprobar si el tráfico se recalcula solo con el tiempo. **Si restaurar exige tocar más que `world.js` y `traffic.js`, parar y consultar**, con lo encontrado. Verificación: prueba de núcleo en Node. Desde un estado restaurado, 300 pasos con el mismo controlador dan los mismos cuadros que la corrida original, en la calle y en un circuito.

  *Comprobado antes: `traffic.vehicles(time, from, to)` no tiene estado propio más que un caché de los últimos 8 bloques, que se rearma igual desde la semilla (`randomFor(blockSeed, b)`); el único cambio de tráfico en marcha es `setTraffic`, que reemplaza el objeto. Restaurar no exigió tocar más que `world.js`: no hubo parada.*

  *Hecho: `world.capture()` guarda el reloj (tiempo, pasos, pausa), el tráfico vigente y su configuración, y de cada agente el auto (pose, velocidad, choque, tope y sensores), el tramo, el progreso, las vueltas, el choque, la protección y lo que percibió (rayos, percepción y vehículos cercanos, por referencia: el mundo los reemplaza en cada paso, no los modifica). `world.restore(state)` lo repone sin volver a mirar. No toca los controladores. `traffic.js` no cambió.*

  *Medido (`tests/world-restore.test.js`, Node): desde un estado guardado a los 240 pasos, 300 pasos más dan cuadros idénticos (`deepEqual` de `snapshot()` y las lecturas de los rayos) en la calle con tráfico (irregularidad 100 %) y en el óvalo. Volviendo un segundo antes del choque del caso de las capturas, el auto vuelve a chocar en el paso 628, en el mismo lugar y contra un vehículo. Avanzar después de guardar no cambia lo guardado.*
- [x] 3.2 `createReplayBuffer` pasa a `src/tabs/shared/replay-buffer.js` y Reglas a mano lo importa de ahí, sin cambiar su comportamiento. Verificación: las pruebas de Reglas a mano (`rules-case`, `rules-session`) pasan igual.

  *Hecho: `createReplayBuffer` y `REPLAY_FRAMES` pasan a `src/tabs/shared/replay-buffer.js`, sin cambios. `rules/index.js` lo importa de ahí y `rules/case.js` lo reexporta, así las pruebas que lo importaban de `case.js` siguen igual.*

  *Medido: `rules-case`, `rules-session` y `architecture` pasan (29 pruebas); `npm test` completo, 1475.*

## 4. El choque enseña (Inspeccionar)

- [x] 4.1 Inspeccionar guarda un cuadro por paso, hasta 180, con lo necesario para volver el mundo, dibujar la escena y recalcular la red de ese cuadro. Al reiniciar se vacía. Verificación: prueba de la memoria (largo, vaciado) y medida del tiempo por cuadro antes y después, con la red más grande (ver *Rendimiento*).

  *Hecho: en `inspect/index.js`, `memory` es un `createReplayBuffer` de 180 cuadros (`CASE_FRAMES`, en `crash-case.js`). Cada cuadro es `{ state: world.capture(), epoch }`: el estado para volver el mundo (que también da lo que se dibuja: el auto, los rayos y el tráfico, que sale del tiempo) y la «época» de la red, un objeto que se reemplaza en cada cambio de prueba y lleva su lista de cambios (con ella y las entradas del estado se recalcula la cuenta de ese cuadro). Se guarda uno al armar el mundo y uno después de cada paso. Al reiniciar se vacía y queda el de la salida. Se conserva con lo demás al salir de la pestaña (`state.live`). El búfer compartido suma `pop()`, con prueba en `rules-case.test.js`.*

  *Medido (guion de verificación, `v4-memoria`): 89 cuadros al abrir (88 pasos), 180 después de 5 s (388 pasos), 1 después de R.*

  *Medido (Node, `borradores/red-al-centro/costo-memoria.mjs`, red de 21 entradas y tres capas de 16, 6000 pasos, mediana de 7 corridas): el paso con la cuenta de la vista cuesta 0,0124 ms sin memoria y 0,0128 ms con ella (+0,0004 ms). 180 cuadros pesan unos 960 KB serializados en JSON: la hipótesis de menos de 100 KB no se cumple; en memoria son referencias a los objetos que el mundo ya creaba en cada paso (rayos, percepción y vehículos cercanos). La fluidez en el navegador se mide en la 8.2.*
- [x] 4.2 Al chocar, la reproducción se congela y aparece la tarjeta del caso debajo de la decisión, con la distancia, contra qué, la decisión y la neurona que más aportó (D5). Ya no hay `RETRY_TICKS` en Inspeccionar. Verificación: escenarios de *Caso del choque en Inspeccionar*.

  *Hecho: al chocar (`worldStep` y `stepWorld`), `openCase()` congela la reproducción y abre el caso; ya no hay `RETRY_TICKS` ni `crashTicks`. La tarjeta `.inspect-case` (con el estado «choque» del sistema de diseño) va debajo de la decisión: contra qué y a los cuántos metros, qué cuadro se ve, la decisión, la neurona que más aportó con su aporte y «Elegir esta neurona», la nota de red cambiada y «Reintentar desde acá» y «Reiniciar (R)». Reiniciar cierra el caso y la reproducción sigue como estaba antes del choque. El aviso de la escena dice «¡Choque!». Textos y tooltips nuevos en `es.js` y `en.js`. La neurona que más aportó lleva en la red un aro de puntos afuera, en el color del texto (`state.culprit` en `network-inspector.js`).*

  *Medido (guion de verificación, `v4-caso` y `v4-reintentar-sin-cambios`): con el caso de las capturas, la tarjeta dice «Chocó contra un vehículo a los 204 m | Se ve 1,0 s antes del choque. | La red decidió: Avanzar. | Oculta 1 · neurona 5 aportó +0,23 a Avanzar.»; la reproducción queda en pausa y 2 s después sigue igual (no vuelve a empezar). R: la tarjeta y el deslizador se van, el auto vuelve a la salida, la reproducción sigue y la memoria se vacía ("Estado por defecto", "Reiniciar"). `auditTooltips()` en 0 con el caso a la vista ("Textos y tooltips").*

  *Observado (captura en grises): el aro de puntos marca la neurona sin depender del color ("Sin depender del color"). Sin probar en el navegador: "Sin capas ocultas" y "Ninguna acción encendida" (ningún cerebro de ejemplo sirve); los cubren las pruebas de la 4.3.*
- [x] 4.3 La función que elige la decisión y la neurona que más aportó va en un módulo sin DOM, con pruebas: con capas ocultas, sin capas ocultas, sin ninguna acción encendida y con empates. Verificación: `npm test`.

  *Hecho: `src/tabs/inspect/crash-case.js`, sin DOM: `decisionOf(trace)` (la acción encendida de mayor total; a igual total, la de menor índice), `topContributor(trace, output)` (el mayor producto positivo de la última capa oculta, o de las entradas sin capas ocultas; una conexión apagada no cuenta) y `caseOf(trace)`.*

  *Decisión fuera de una lectura literal del `design.md`: D5 dice «la acción encendida más cercana al choque (si hay varias, la de mayor valor)»; la spec dice «la acción encendida de mayor valor». Seguí la spec: no hay una medida de "más cercana al choque" que no sea inventada.*

  *Medido: `tests/inspect-crash-case.test.js`, 6 pruebas (con capas ocultas, sin capas ocultas, ninguna acción encendida, empates, conexión apagada y sin aportes positivos), todas pasan.*
- [x] 4.4 El deslizador de la repetición sobre la escena: empieza 1 s antes del choque, cubre hasta 3 s y se maneja con el teclado. La escena, la red, la decisión, la tarjeta del caso y la de la neurona siguen al deslizador. Con la red cambiada después del choque, se muestra la red de entonces y la tarjeta lo dice. Verificación: escenarios de *Repetición del choque en Inspeccionar*.

  *Hecho: el deslizador `.inspect-replay` va superpuesto abajo de la escena; su valor son los cuadros desde el del choque (0) hacia atrás, hasta lo guardado. Empieza 1 s antes (`CASE_START`), o al principio si el intento duró menos. Moverlo vuelve el mundo a ese cuadro (`world.restore`) con la cuenta completa: la escena, la red, la decisión y las tarjetas lo siguen. Con el caso a la vista, la cuenta se calcula con la red de la época de ese cuadro (`changesOf`); si la red cambió después, la tarjeta dice «Se ve la red de antes de tus cambios: rigen al reintentar». Las flechas sobre el deslizador no llegan a la ventana. Desde el cuadro del choque, o a menos de 20 cuadros, la tarjeta dice que desde ahí vuelve a chocar enseguida.*

  *Medido (guion de verificación, `v4-caso`): al chocar, el deslizador está en −60 (−179…0) y dice «1,0 s antes»; el mundo está en el paso 568 (el choque es el 628). Llevado a −120: el auto en el paso 508, a 164 m, la decisión de ese cuadro (solo Avanzar) y la neurona que más aportó en él (neurona 6, +0,04). Con el foco en el deslizador, la flecha izquierda lo lleva a −121, el auto no gira y sigue manejando la red ("Con el teclado"). Con la neurona apagada después del choque, al mover el deslizador aparece la nota ("Red cambiada después del choque"). Después de R el auto vuelve a chocar en el paso 628, a 203,9 m ("Determinismo"). Sin probar: "Intento corto" con un choque antes de 3 s (el caso de prueba choca a los 10,47 s; la regla está en el código: `min = -(memory.length - 1)`).*
- [x] 4.5 "Reintentar desde acá": restaura el mundo en el cuadro del deslizador y reproduce con la red de ahora. Es la acción principal mientras se ve el caso. Verificación: escenarios de *Reintentar desde un cuadro* y "Choque en Inspeccionar" de *Estados que cambian la acción principal*; `auditHierarchy()` con una sola principal. Prueba de determinismo: reintentar dos veces desde el mismo cuadro sin cambios da el mismo choque.

  *Hecho: `retry()` descarta los cuadros posteriores al que se ve (la memoria es una línea), cierra el caso y reproduce con la red de ahora (el controlador lee los cambios vigentes). Reproducir, o avanzar el mundo con Paso, con el caso a la vista también reintenta desde el cuadro que se ve. `mainAction('inspect', { crashed })` devuelve `'retry'` con el caso (prueba en `main-action.test.js`) y la pestaña lo aplica en cada `sync`.*

  *Medido (guion de verificación): con el caso, la única acción principal es «Reintentar desde acá»; después de R o de reintentar, «Pausar». Reintentar dos veces sin cambios desde 1 s antes da el mismo choque las dos veces: paso 628, 203,9 m, contra un vehículo ("Reintentar sin cambios", prueba de determinismo). Con la neurona 5 apagada y reintentando desde 1 s antes, el auto vuelve a chocar, antes: a 190,3 m ("Reintentar con un cambio"); el caso nuevo aparece con su repetición ("Volver atrás"). `auditHierarchy()` sin problemas.*
- [x] 4.6 Con la persona manejando, el choque se congela igual y reintentar sigue con la persona. Verificación: "Choque" de *Manejar vos* y "Con la persona manejando".

  *Hecho: el choque manejando la persona usa el mismo camino; al reintentar o reiniciar, sigue manejando la persona y la coincidencia vuelve a empezar (`resetCompare`).*

  *Medido (guion de verificación, `v4-manejando`): con «Manejar vos» y las flechas arriba e izquierda, el auto se sale de la calle a los 39,9 m; el caso se abre con la reproducción en pausa y maneja «you». Después de reintentar, sigue manejando la persona, la reproducción sigue y la coincidencia se cuenta de nuevo desde el reintento.*

## 5. "Atrás" entre cuadros

- [x] 5.1 Al principio de un cuadro, "Atrás" restaura el cuadro anterior de la memoria y muestra su cuenta completa. Al avanzar desde ahí, se descartan los cuadros posteriores (D6). La explicación de "Atrás" sin memoria cambia de texto en los dos idiomas. Verificación: escenarios "Atrás al cuadro anterior", "Atrás al principio del cuadro" y "Seguir desde un cuadro anterior" de *Avance paso a paso*, y "Atrás con B".

  *Hecho: `stepBack()` deshace dentro del cuadro y, al principio, saca el último cuadro de la memoria y vuelve el mundo al anterior con su cuenta completa. Con el caso a la vista, retrocede la repetición. De a cuadros, un paso mueve el auto un cuadro con la cuenta completa; para que "Atrás" sea simétrico, de a cuadros con la cuenta completa vuelve un cuadro entero (la primera versión pedía dos toques por cuadro: uno para vaciar la cuenta y otro para cambiar de cuadro). Avanzar después descarta lo de adelante (se vuelve a calcular). "Atrás" queda sin acción solo con un cuadro guardado y la cuenta sin empezar. Los textos de su explicación cambian en los dos idiomas.*

  *Decisión fuera del `design.md`: de a cuadros, "Atrás" vuelve un cuadro por toque aunque la cuenta del cuadro esté completa (D6 habla de "al principio de un cuadro"). Con los otros tamaños, se comporta como dice D6.*

  *Medido (guion de verificación, `v5-atras`): recién reiniciado y en pausa, el primer B vacía la cuenta y el segundo no hace nada, con «Atrás» sin acción y la ayuda nueva ("Atrás al principio del cuadro"). Después de 2 s (paso 119), 30 B llevan el auto al paso 89 (de x 34,756 a 24,756); 30 pasos desde ahí lo dejan en el paso 119 en la misma pose exacta ("Seguir desde un cuadro anterior"). De a operaciones: tres pasos y tres B vuelven al principio del cuadro; un B más vuelve al cuadro anterior ("Atrás al cuadro anterior", "Atrás con B").*

## 6. La barra de la red y la guía

- [x] 6.1 La barra de arriba de la red se arma en tres grupos rotulados (Vista, Conexiones, Acercar), en las dos pestañas. En el Laboratorio, la Vista suma Datos (D3). Verificación: escenarios de *Vista de la red a la vista* (incluido "Un renglón al abrir") y "Barra de arriba en ventana angosta".

  *Hecho: `src/tabs/shared/net-bar.js` arma la barra de las dos pestañas: el nombre de la red arriba y un renglón con tres grupos, cada uno con su rótulo arriba (como la barra de escenario): **Vista** (Diagrama, Pesos y, en el Laboratorio, Datos; Flujo en Inspeccionar), **Conexiones** (Todas, 5, 3 y 1; Resumir todas; el rótulo lleva el tooltip del filtro) y **Acercar** (−, + y Ver entera). Si no entran, el último grupo baja entero. Con la tabla de pesos o los datos, el grupo Acercar se oculta (no tiene efecto). Se quitó la lógica que movía los botones de acercar de renglón; queda la que pasa la barra de reproducción a los nombres sin atajo con la red por debajo de 600 px. Textos de los rótulos en `es.js` y `en.js` (`net.bar.*`).*

  *Medido (guion): a 1440×900, un renglón en las dos pestañas y en los dos idiomas, con 11 controles arriba de la red y ninguno sin acción (antes, en Inspeccionar: 14 controles en 2 renglones, 3 sin acción) ("Un renglón al abrir"). A 1366×768 (red de 600 px): 2 renglones en Inspeccionar (el interruptor de Flujo) y 1 en el Laboratorio. Guion de verificación (`v6-barra-*`): con la red en 507 px (ventana de 1100) y en 439 px (ventana de 1032), 2 renglones en las dos pestañas y los dos idiomas ("Barra de arriba en ventana angosta": pide 2 o menos y 3 o menos).*
- [x] 6.2 La franja de cambios de prueba (contador, Deshacer, Restablecer la red y Ver original en Inspeccionar; contador, Deshacer y Restablecer la red en el Laboratorio) aparece solo con cambios. Reserva su alto mientras haya cambios, para no correr la red durante un arrastre. Verificación: escenarios de *Deshacer y restablecer la red*, *Comparar con el original* y *Deshacer y restablecer los cambios a mano*; se miden los saltos de la red al aparecer la franja.

  *Hecho: `src/tabs/shared/changes-strip.js`: la franja con el contador («3 cambios de prueba» / «1 cambio a mano»), Deshacer, Restablecer la red y, en Inspeccionar, Ver original. Va dentro de la barra de arriba de la red, debajo de los grupos (así sus botones siguen en una barra densa de "Dos alturas", sin tocar el auditor ni la spec). `stripState` decide: con cambios se ve; si el primer cambio llega arrastrando una pastilla sobre la red, aparece al soltar; ya vista, reserva su alto (invisible, fuera del teclado) mientras haya cambios en algún cerebro de la sesión (Inspeccionar); en el Laboratorio, con un solo cuerpo de cambios, se va con el último. Pruebas en `tests/changes-strip.test.js`.*

  *Medido (guion): sin cambios no se ve ni el contador ni los botones; con dos cambios, «2 cambios de prueba | Deshacer | Restablecer la red | Ver original» ("Sin cambios", "Red modificada"). En el Laboratorio, «1 cambio a mano | Deshacer | Restablecer la red». Saltos de la red (`v6-salto-*`): arrastrando la pastilla de una conexión, la red no se mueve (arriba en 197 px antes y durante, con el peso ya cambiado) y la franja aparece al soltar, que baja la red 35 px una vez; Deshacer la saca y la red vuelve a 197; un segundo arrastre tampoco la corre. En el Laboratorio, lo mismo con la pastilla de un peso (190 → 190 → 225 al soltar).*
- [x] 6.3 La línea de guía de Inspeccionar con sus cinco textos (D4) y "Soltar" junto al nombre de la neurona o la conexión elegida. Textos en `es.js` y `en.js`, de hasta 120 caracteres, y tooltip de "Soltar". Verificación: escenarios "Con algo elegido", "Soltar vuelve a los atajos" y "Guía oculta" de *Guía, leyenda y misiones*; prueba de largo de textos.

  *Hecho: `.inspect-guide-line` (con la clase `guide`) arriba del detalle, con los cinco textos de D4 (`inspect.guideLine.*`), elegidos por prioridad: el choque, la persona manejando, una conexión, una neurona o nada. Con la guía encendida, reemplaza el texto del bloque vacío (que decía lo mismo); con la guía apagada, ese texto vuelve. «Soltar» (`inspect.release`, con tooltip en los dos idiomas) va junto al nombre en la tarjeta de la neurona y en el detalle de la conexión; al usarlo, el foco pasa al primer atajo. Prueba de largo en `copy-length.test.js` (hasta 120 caracteres).*

  *Medido (guion de verificación, `v6-guia`): nada elegido, la línea de inicio y los atajos; con una neurona, la línea de la neurona, el detalle, la leyenda, las misiones y «Soltar» a la vista ("Con algo elegido"); con una conexión, su línea; «Soltar» vuelve a la línea de inicio y a los atajos, con el foco en el primero ("Soltar vuelve a los atajos"); con la guía apagada no se ven la línea, la leyenda ni las misiones, y «Soltar» sí ("Guía oculta"). `npm test`: 1486, todas pasan.*
- [x] 6.4 Medir las tres zonas de las dos pestañas a 1440×900 y a 1366×768, en español y en inglés. Si a 1366×768 la zona izquierda del Laboratorio se desplaza con Compuertas después de achicar las curvas, **parar y consultar**, con las medidas (D2). Verificación: "Pantalla de 1440×900" de las dos pestañas y "Pantalla de 1366×768" del Laboratorio.

  *Medido (guion, español e inglés):*
  - *1440×900: las dos pestañas con zonas 400 / 668 / 360, sin desplazamiento en ninguna zona ("Pantalla de 1440×900" de las dos).*
  - *1366×768: 394 / 600 / 360. El Laboratorio con Compuertas, sin desplazamiento en la zona izquierda, en los dos idiomas: no se da la condición de parada. Con Tu manejo, el panel se desplaza 23 px por dentro, igual que antes.*
  - *Inspeccionar a 1366×768 sin nada elegido: el panel se desplaza 67 px (83 por dentro) en los dos idiomas: la leyenda pasó al panel (ver la nota de la 2.1). Con una neurona elegida, no.*

## 7. Laboratorio: experimentos y a mano primero

- [ ] 7.1 Los tres experimentos como opciones grandes y numeradas al principio de la barra, con su nombre y su línea en los dos idiomas, tooltip y manejo con el teclado (D7). Verificación: escenarios de *Elegir los datos*.
- [ ] 7.2 Las pastillas de peso y de sesgo de Compuertas: al menos 24 px de alto, ▲▼ y cursor de arrastre vertical (D8). Verificación: "Red de las compuertas" de *Perillas*; se mide el alto.
- [ ] 7.3 La marca "Arrastrá un peso ↕", con texto en los dos idiomas, junto a la primera pastilla de peso, con la guía activa, hasta el primer cambio. Verificación: escenarios "Estado por defecto", "Primer cambio", "Guía oculta" y "Vuelta atrás" de *A mano primero en Compuertas*.
- [ ] 7.4 La acción principal de Compuertas: ninguna hasta resolver a mano, ver la solución o hacer cinco cambios; después, Reproducir, y la consigna cambia. La regla va en `mainAction` o en un módulo sin DOM, con prueba. Si `auditHierarchy()` exige una principal, se ajusta para ese estado. Verificación: escenarios "Resuelta a mano", "Cinco cambios sin resolver", "Otros experimentos" y "Determinismo"; "Compuertas sin resolver" y "Laboratorio" de *La marcha es la acción principal*; `npm test`.

## 8. Cierre

- [ ] 8.1 `npm test` completo, y `auditSistema()`, `auditHierarchy()` y `auditTooltips()` en todas las vistas del guion, en los dos idiomas. Verificación: los resultados anotados. Lo que ya fallaba antes se anota sin arreglarlo.
- [ ] 8.2 Fluidez: tiempo por cuadro de Inspeccionar con la red más grande, con la escena grande y la memoria de cuadros, y del Laboratorio con Tu manejo, en Chrome sin ventana, antes y después. Si alguno baja de la medida sustituta de 55 cuadros por segundo, **parar y consultar**. Verificación: tabla con las medidas.
- [ ] 8.3 El después con el mismo guion en `borradores/red-al-centro/despues/`, con vistas nuevas: el caso del choque con la repetición a 2 s, después de "Elegir esta neurona", después de reintentar con la neurona apagada, la franja de cambios y la marca de "Arrastrá un peso". Escribir `comparacion.md` con el antes y el después lado a lado y las medidas. Verificación: la comparación muestra cada punto de *What Changes*.
- [ ] 8.4 Verificación en el navegador contra el filtro de entrada:
  - desde un choque, llegar a la neurona que decidió y reintentar con un cambio;
  - en Compuertas, que lo primero que se destaca sea la pastilla;
  - la guía y la marca se ocultan con la guía apagada;
  - Reiniciar y Restablecer vuelven atrás.

  Anotar lo que no se pudo probar. No se mide si la red aprende (eso lo verifica el dueño).

## Workflow follow-up

- La sesión de diseño revisa `comparacion.md` y archiva.
- Sigue `manejo-amable-y-competir-sin-cortes`.
