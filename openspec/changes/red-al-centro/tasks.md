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

- [ ] 4.1 Inspeccionar guarda un cuadro por paso, hasta 180, con lo necesario para volver el mundo, dibujar la escena y recalcular la red de ese cuadro. Al reiniciar se vacía. Verificación: prueba de la memoria (largo, vaciado) y medida del tiempo por cuadro antes y después, con la red más grande (ver *Rendimiento*).
- [ ] 4.2 Al chocar, la reproducción se congela y aparece la tarjeta del caso debajo de la decisión, con la distancia, contra qué, la decisión y la neurona que más aportó (D5). Ya no hay `RETRY_TICKS` en Inspeccionar. Verificación: escenarios de *Caso del choque en Inspeccionar*.
- [ ] 4.3 La función que elige la decisión y la neurona que más aportó va en un módulo sin DOM, con pruebas: con capas ocultas, sin capas ocultas, sin ninguna acción encendida y con empates. Verificación: `npm test`.
- [ ] 4.4 El deslizador de la repetición sobre la escena: empieza 1 s antes del choque, cubre hasta 3 s y se maneja con el teclado. La escena, la red, la decisión, la tarjeta del caso y la de la neurona siguen al deslizador. Con la red cambiada después del choque, se muestra la red de entonces y la tarjeta lo dice. Verificación: escenarios de *Repetición del choque en Inspeccionar*.
- [ ] 4.5 "Reintentar desde acá": restaura el mundo en el cuadro del deslizador y reproduce con la red de ahora. Es la acción principal mientras se ve el caso. Verificación: escenarios de *Reintentar desde un cuadro* y "Choque en Inspeccionar" de *Estados que cambian la acción principal*; `auditHierarchy()` con una sola principal. Prueba de determinismo: reintentar dos veces desde el mismo cuadro sin cambios da el mismo choque.
- [ ] 4.6 Con la persona manejando, el choque se congela igual y reintentar sigue con la persona. Verificación: "Choque" de *Manejar vos* y "Con la persona manejando".

## 5. "Atrás" entre cuadros

- [ ] 5.1 Al principio de un cuadro, "Atrás" restaura el cuadro anterior de la memoria y muestra su cuenta completa. Al avanzar desde ahí, se descartan los cuadros posteriores (D6). La explicación de "Atrás" sin memoria cambia de texto en los dos idiomas. Verificación: escenarios "Atrás al cuadro anterior", "Atrás al principio del cuadro" y "Seguir desde un cuadro anterior" de *Avance paso a paso*, y "Atrás con B".

## 6. La barra de la red y la guía

- [ ] 6.1 La barra de arriba de la red se arma en tres grupos rotulados (Vista, Conexiones, Acercar), en las dos pestañas. En el Laboratorio, la Vista suma Datos (D3). Verificación: escenarios de *Vista de la red a la vista* (incluido "Un renglón al abrir") y "Barra de arriba en ventana angosta".
- [ ] 6.2 La franja de cambios de prueba (contador, Deshacer, Restablecer la red y Ver original en Inspeccionar; contador, Deshacer y Restablecer la red en el Laboratorio) aparece solo con cambios. Reserva su alto mientras haya cambios, para no correr la red durante un arrastre. Verificación: escenarios de *Deshacer y restablecer la red*, *Comparar con el original* y *Deshacer y restablecer los cambios a mano*; se miden los saltos de la red al aparecer la franja.
- [ ] 6.3 La línea de guía de Inspeccionar con sus cinco textos (D4) y "Soltar" junto al nombre de la neurona o la conexión elegida. Textos en `es.js` y `en.js`, de hasta 120 caracteres, y tooltip de "Soltar". Verificación: escenarios "Con algo elegido", "Soltar vuelve a los atajos" y "Guía oculta" de *Guía, leyenda y misiones*; prueba de largo de textos.
- [ ] 6.4 Medir las tres zonas de las dos pestañas a 1440×900 y a 1366×768, en español y en inglés. Si a 1366×768 la zona izquierda del Laboratorio se desplaza con Compuertas después de achicar las curvas, **parar y consultar**, con las medidas (D2). Verificación: "Pantalla de 1440×900" de las dos pestañas y "Pantalla de 1366×768" del Laboratorio.

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
