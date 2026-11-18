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

- [ ] 2.1 El volante suave en el controlador de teclado: nivel por lado, acumulador, 18 cuadros de subida (`STEER_RAMP_STEPS`), vuelta a 0 al soltar y sin avanzar en pausa (D1). La lógica va en una función sin DOM. Verificación: pruebas de *Volante suave* ("Toque corto", "Mantener apretada", "Soltar", "En pausa", "Determinismo") y de *Controlador de teclado*.
- [ ] 2.2 Pruebas de que nada más cambia: los cerebros de ejemplo y un programa de reglas dan los mismos cuadros que antes del cambio, con la misma semilla (`reproducibility`, `example-brains`, `compete-logic`). Verificación: `npm test`; escenario "Otros controladores".
- [ ] 2.3 La grabación del Laboratorio guarda lo que devolvió el controlador. Verificación: escenario "Lo grabado es lo que hizo el auto", con una prueba o una sonda. No se mide si la imitación aprende.
- [ ] 2.4 Repetir la medida de 1.3 con el volante suave. Verificación: tabla antes y después en la comparación.

## 3. El problema

- [ ] 3.1 Izquierda y Derecha de "Lo que estás accionando" se llenan con el nivel del volante y muestran su número, sin destellar (el nivel cambia de a poco, no con el reparto). Tooltip en los dos idiomas. Verificación: escenarios de *Acción visible*; `auditTooltips()`; prueba de destellos si aplica (`flash-guard`).
- [ ] 3.2 La cinta del manejo debajo de la acción (D2): filas de sensores y velocidad, separación, cuatro filas de acción, 600 cuadros, congelada al chocar con su marca, vacía al reiniciar, en pausa quieta, nombre accesible, tooltip y la línea de guía en los dos idiomas. La cuenta de qué se dibuja en cada columna (juntar cuadros cuando el lienzo es angosto) va en una función sin DOM, con pruebas. Verificación: escenarios de *Cinta del manejo*, salvo los de 1366 y fluidez.
- [ ] 3.3 El cartel de primer manejo sobre la escena, con el estilo del de Competir, en los dos idiomas, que se va con la primera tecla y vuelve en cada visita, solo con la guía (D3). Verificación: escenarios de *Cartel de primer manejo*.
- [ ] 3.4 Medir el tablero de El problema a 1440×900 y a 1366×768, en español y en inglés. Si a 1366×768 la cinta no llega a 80 px sin desplazar el tablero, **parar y consultar**, con las medidas. Verificación: "Pantalla de 1366×768" de la cinta, y "Percepción y acción a la vista" y *Panel a la vista sin desplazarse* de El problema.

## 4. Competir sin cortes

- [ ] 4.1 Marcador con anchos de columna y encabezados que no se salen; el nombre de la pista en una línea con la forma corta o puntos suspensivos y tooltip; el número y su unidad juntos en el cartel (D4). Verificación: escenarios de *Marcador y tabla sin cortes*, medidos con el guion.
- [ ] 4.2 Nombre accesible y tooltip en los botones de solo ícono de la lista de competidores. Verificación: escenarios de *Botones de solo ícono con nombre*; `auditTooltips()` en 0 para esos botones.
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
