# Crítica final de la V2 (tareas 16.3, 16.4 y 16.6)

19 de noviembre de 2026. La V2 está en `/v2/`, con las seis pantallas del recorrido (El problema, Reglas a mano, Aprender por evolución, Aprender por gradiente, Evaluar y Entender). Cada afirmación lleva su rótulo: [Medido] (con número o captura), [Observado] (visto en el navegador, sin número), [Sin medir].

Las capturas de cada etapa están en `borradores/interfaz-v2/comparacion/<etapa>/index.html` (V1 y V2 en los mismos estados, a 1440×900 y 1366×768; Reglas también a 800×600). Las auditorías de la V2 (`mlLab.v2.auditAll()`) dan 0 en todas ellas.

## 1. Accesibilidad contra la línea de base (tarea 16.3)

Método: `design-skills:accessibility-audit`, capas automática, de teclado y visual, como en la 2.5. Guion: `borradores/interfaz-v2/comparacion/auditar-accesibilidad.mjs` (Chrome sin ventana, 1440×900, las seis etapas; resultado en `accesibilidad-v2.json`).

| Criterio | V1 (línea de base 2.5) | V2 | Rótulo |
|---|---|---|---|
| 1.1.1 Contenido no textual | Falla parcial: el lienzo de la escena sin nombre | **Pasa**: cada escena tiene su descripción (`aria-describedby`); el dibujo de la red es decorativo (`aria-hidden`) y la red se recorre por los botones de las neuronas | Medido |
| 1.3.1 Información y relaciones | Falla menor: el `h1` después de tres `h2` | **Pasa**: un solo `h1` visible por etapa (la pregunta), con `header`, `nav`, `main` y `aside` | Medido |
| 1.4.3 Contraste (mínimo) | Pasa | **Pasa**: 0 fallas en 655 textos de las seis etapas | Medido |
| 1.4.11 Contraste no textual | Sin medir | **Sin medir** | Sin medir |
| 1.4.10 Reflujo | Excepción declarada (aviso bajo 600 px) | Igual: aviso bajo 600 px | Observado |
| 2.1.1 Teclado | Pasa | **Pasa**: de 19 a 80 paradas con Tab por etapa, todos los controles | Medido |
| 2.1.2 Sin trampa de teclado | Pasa con condición (Tab quedaba en el editor de Reglas) | **Pasa**: Tab y Escape salen del editor | Medido |
| 2.1.4 Atajos de una tecla | Pasa | **Pasa**: el interruptor "Atajos" los apaga | Observado |
| 2.3.1 Tres destellos | Sin medir | **Pasa**: `tests/v2/flash.test.js` aplica la prueba de la V1 a la V2 | Medido |
| 2.4.1 Evitar bloques | Pasa por puntos de referencia | Igual | Medido |
| 2.4.3 Orden del foco | **Falla**: escena → tablero → panel → pestañas → barra | **Pasa**: barra → riel → zona (placa, escena, banda) → cuaderno, el orden de lectura | Medido |
| 2.4.7 Foco visible | Pasa (44 de 45) | **Pasa**: 0 paradas sin contorno en las seis etapas | Medido |
| 2.4.11 Foco no tapado | Sin medir | **Sin medir** | Sin medir |
| 2.5.7 Arrastre | Pasa | Pasa: las perillas del Laboratorio conservan sus flechas | Observado |
| 2.5.8 Tamaño del objetivo | **Falla en 4 controles** | **Pasa**: 0 objetivos bajo 24 px (se agrandaron el asa de las fichas, las entradas A y B, los rótulos de rol enfocables y las marcas "practicó" y "no la vio") | Medido |
| 3.1.1 Idioma | Pasa | Pasa (`lang` cambia con el idioma) | Medido |
| 3.2.6 Ayuda consistente | Pasa | Pasa: "Más sobre esta etapa" y la misión en la primera hoja de cada etapa | Observado |
| 4.1.2 Nombre, rol y valor | Pasa | **Pasa**: 0 controles sin nombre | Medido |
| Movimiento reducido | 3 reglas | Las animaciones de la V2 (marca de "Mostrame") respetan `prefers-reduced-motion`; los pintores de la V1 conservan las suyas | Observado |

**Ningún incumplimiento AA abierto** en lo medido. Sin probar, como en la línea de base: lector de pantalla real, zoom al 200 %, Safari y Firefox, 1.4.11 y 2.4.11.

## 2. La V2 contra la V1 (tarea 16.4)

Con las mismas heurísticas de la 2.2 (Nielsen, leyes de UX, *excise*, arquitectura de información). Cada problema de la 2.3 y cada KD de D, con su estado.

### Problemas de la tarea 2.3

| Problema | Estado en la V2 | Evidencia |
|---|---|---|
| P1 No hay acción principal | **resuelto**: una por pantalla (auditoría en 0); en Compuertas, mientras se resuelve a mano, lo destacado son las perillas | auditorías [Medido] |
| P2 La consigna está al final | **resuelto en la V2**: la pregunta y la consigna en la placa, arriba de la escena | capturas `inicio` |
| P3 Ajustes al mismo nivel y repartidos | **resuelto en la V2**: "Probá esto" con a lo sumo tres ajustes y hojas por tema | capturas de hojas |
| P4 Misiones al final | **resuelto en la V2**: la misión en curso arriba de la primera hoja, con "Mostrame" que abre la hoja y enfoca el control | navegador [Medido] |
| P5 Laboratorio con tres experiencias tras un selector chico | **resuelto en la V2**: los tres experimentos en la placa | `gradiente/` |
| P6 Barra que cambia y valores no compartidos | **resuelto en la V2**: escenario compartido con "de esta etapa" donde una etapa fija un valor (D7) | grupo 9 [Medido] |
| P7 Muchos Restablecer y Reiniciar | **resuelto en la V2**: cada uno nombra su objeto ("Restablecer escenario", "Restablecer programa"), y los que pierden trabajo ofrecen Deshacer | grupos 10 a 13 |
| P8 Guía, Ayudas y Atajos sin explicación | **sigue en parte**: tienen tooltip y la barra dice "Guía oculta" al apagarla; no dicen en pantalla qué ocultan | barra [Observado] |
| P9 Inspeccionar con muchos controles | **resuelto en la V2**: la red es la protagonista y el panel pasó a tres hojas | `entender/` |
| P10 Cortes y desbordes | **resuelto en la V2** a 1440×900 y 1366×768 (auditoría de desbordes en 0); a 800×600 Reglas es usable y su hoja Programar desplaza (la spec lo permite) | capturas [Medido] |
| P11 Tooltips que no se anuncian | **sigue**: los tooltips no se anuncian al lector de pantalla | [Sin medir con lector] |
| P12 Vocabulario sin escalonar | **resuelto en la V2**: fitness, élite, mutación, cruce, activación, época, tasa, apartados, peso y sesgo definidos en una línea | hojas |
| P13 Primer manejo frustrante | **resuelto en la V2**: teclas destacadas en la placa y cartel de primer manejo; la acción como lámparas, no como botones | `problema/` |
| P14 Espacio vacío | **resuelto en la V2**: escena visible 50,5 % en El problema a 1366×768 (V1: 21 %) | `problema/medidas.json` |
| Reglas: ciclo editar → mirar cruza la pantalla | **resuelto en la V2**: escena, percepción y editor juntos (KD1) | `reglas/` |
| Reglas: el choque desaparece | **resuelto en la V2**: el caso queda, con "Reintentar solo" apagado por defecto | navegador |
| Reglas: cartel de choque | resuelto (ya en la V1) | — |
| Reglas: Rayos es un deslizador más | resuelto: "Sensores del auto" en su grupo | — |
| Reglas: un ejemplo cambia Rayos sin avisar | **resuelto en la V2**: "Este ejemplo usa 7 sensores." junto a los sensores | navegador [Medido] |
| Reglas: dos Restablecer | **resuelto en la V2**: "Restablecer" (programa) y "Restablecer escenario", cada uno en su hoja | — |
| Reglas: "Reglas 1" pesa como Distancia | resuelto | — |
| Reglas: 63 controles | **cambió**: 62 a la vista, repartidos en zona y dos hojas | auditoría [Medido] |
| Reglas: deslizadores nativos | resuelto | — |
| Reglas: objetivos de 24 px | **resuelto en la V2** | 2.5.8 [Medido] |
| Entrenar: el fin de generación es una línea | resuelto (corte de generación) | `evolucion/` |
| Entrenar: la marcha desaparece | **resuelto en la V2**: Pausar y Siguiente en la placa | — |
| Entrenar: el panel desborda | **resuelto en la V2**: ninguna hoja desplaza | [Medido] |
| Entrenar: ajustes en cuatro lugares | **resuelto en la V2**: cuatro hojas por tema | — |
| Entrenar: la curva no marca cuándo se cambió algo | **sin verificar**: la curva es la de la V1 con sus marcas; no se cambió un ajuste en la captura | — |
| Entrenar: red de 120 px a 1366 | **resuelto en la V2**: la franja de la red mide 443×186 a 1366×768 | `evolucion/medidas.json` |
| Entrenar: el contador de Cerebros sube solo | **cambió**: la V2 no muestra contador en la hoja Cerebros | [Observado] |
| Barra de pestañas cortada a 1032 px | **cambió**: la V2 tiene riel; en la V1, el enlace "Probar la V2" se acorta a "V2" bajo 1240 px | grupo 7 |
| Inspeccionar a 1366 pedía desplazar | resuelto | — |
| El editor de Reglas corta Tab | **resuelto en la V2** | 2.1.2 |
| Tooltips que nombran la tecla con atajos apagados | **sin verificar** | — |
| Ejemplos de Reglas que solo valen a 20 m/s | **sigue** (no es de interfaz; no se midió) | — |

### KD de la maqueta D

| KD | Estado en la V2 |
|---|---|
| KD1 Reglas: escena chica | **resuelto en la V2**: escena, percepción compacta y editor juntos en la zona |
| KD2 Filtros de conexiones bajo 24 px | **resuelto**: 0 objetivos bajo 24 px |
| KD3 El aviso de Deshacer tapaba la marcha | **resuelto**: Deshacer junto al botón que lo dispara, en el cuaderno |
| KD4 "Avanzado" bajo el pliegue | **resuelto**: hojas por tema; ninguna desplaza |
| KD5 Botones de cámara en columna | **resuelto** |
| KD6 Red y curva al costado de la escena | **resuelto**: franja debajo de la escena; **sigue** que el corte de generación tapa parte de la escena mientras dura |
| KD7 "De esta etapa" en letra de título | **resuelto**; además ya no se pierde al traducir (grupo 12) |
| KD8 Red chica en Entender | **resuelto**: la red ocupa la zona y la viñeta va al costado |
| KD9 Élite y acción del mismo amarillo | **resuelto**: la élite en lavanda (`--color-elite`) |
| KD10 Brillo y fluidez | **resuelto**: el dueño lo midió a la vista (180 c/s con y sin brillo) y pidió un tercio menos (tarea 8.5) |
| KD11 "Largar" con la carrera en marcha | **resuelto**: "Largar" solo antes de la carrera |
| KD12 El Laboratorio sin pantalla | **resuelto**: maqueta `#gradiente` aprobada e implementada (grupo 15) |

### Nuevos en la V2

- **nuevo**: el corte de generación no aparece si la página está oculta (como en la V1); no es un problema para quien la mira, pero hace que la verificación con el navegador oculto no lo vea.
- **nuevo**: la pista del escenario compartido es la pista del entrenamiento; cambiarla en una etapa la cambia en todas. Es la regla D7, pero en Aprender por evolución reemplaza a las pistas de entrenamiento como ajuste propio (la V1 tampoco ofrecía más de una).
- **nuevo**: la V2 duplica piezas de pantalla de la V1 (editor, fichas, biblioteca, curva, tarjeta de neurona, tablas): son copias en `src/v2/legacy/` y `src/v2/stages/*/`. Un arreglo en la V1 no llega solo a la V2.

## 3. Verificación manual, etapa por etapa (tarea 16.6)

Con el filtro de entrada de la propuesta. [Observado] en el navegador con la guía encendida y apagada; las capturas son las de `comparacion/<etapa>/`.

| Etapa | ¿Qué concepto hace visible? | ¿Se entiende sin que nadie lo explique? | ¿El mentor puede ocultar la guía? | ¿Cómo se vuelve atrás? |
|---|---|---|---|---|
| El problema | Lo que percibe el auto (barras con sus números) y lo que acciona (lámparas), mientras uno maneja | Sí: la placa pregunta y muestra las teclas; el cartel de primer manejo se va con la primera tecla | Sí: "Guía" oculta la misión, "Más sobre esta etapa", el cartel y las definiciones | Reiniciar (R), Pausar (espacio); "Restablecer escenario" con Deshacer |
| Reglas a mano | Que un programa decide con lo percibido; qué línea se cumplía al chocar | Sí con el programa inicial que maneja y el caso del choque que explica | Sí | Deshacer del editor (Ctrl+Z, también desde las fichas), "Restablecer" con Deshacer |
| Aprender · por evolución | Que la población mejora generación tras generación; la mutación y la élite | Sí: el corte "Así nace la generación N" con la élite contada | Sí (también el corte, que es de la guía) | Reiniciar y Población nueva con Deshacer; Deshacer la elección del padre |
| Aprender · por gradiente | Que la red corrige su error ejemplo por ejemplo; las perillas cambian pesos | Sí en Compuertas (a mano primero); Puntos y Tu manejo piden Reproducir | Sí | Deshacer y Restablecer cambios en la franja de la red; pesos al azar; red de fábrica |
| Evaluar | Que rendir donde no se practicó es generalizar | Sí: la tabla por pista con "practicó" y "no la vio" | Sí | Reiniciar (R), Otra carrera (N) |
| Entender | La cuenta de una neurona y qué decide la red | Sí al elegir una neurona (la hoja Neurona la explica) | Sí | Deshacer y restablecer los cambios de prueba; "Ver original"; Atrás (B) en el paso a paso |

**Pase de la V1 a la V2 y de vuelta** [Medido en el navegador, 19 de noviembre de 2026]: un cerebro guardado en la V2 ("Imitación 1", desde Por gradiente) aparece en la biblioteca de la V1; uno guardado en la V1 ("Desde la V1", desde Entrenar) aparece en la V2 y se abre en Entender con "Cambiar cerebro". Las dos versiones comparten la biblioteca (`mlLab.brains`) y el idioma; el resto de las preferencias de la V2 va en `mlLab.v2.*`. "Probar la V2" (V1) y "Volver a la V1" (V2) llevan de una a otra.

## 4. Fluidez y rendimiento (tareas 16.2 y 16.5)

- [Medido sin ventana] `borradores/interfaz-v2/comparacion/fluidez.md`: los cinco casos (Entrenar con 100 y 500 autos y la red, Competir con seis en el circuito de curvas, Inspeccionar con la red de los ejemplos y el Laboratorio de a neuronas) dan 60,1 cuadros por segundo y el peor cuadro en 17 ms, en la V1 y en la V2: es el tope del navegador sin ventana, así que ninguna queda por debajo de la otra, pero la medida no distingue más. [Medido por el dueño, a la vista, tarea 8.5] Entrenar con 500 autos: 180 c/s con y sin brillo. Medir a la vista los cinco casos queda para el dueño.
- [Medido] `npm test`: 1534 de 1534, también las pruebas de la V1, que no se modificaron. `node tools/bench.mjs` en el commit de antes de la fase 3 (c6b8ff3) y ahora: Redes al azar 182–188× y 181–187×; Todos en carrera 1122–1192× y 1134–1195×. La V2 no toca el núcleo (`src/core`, `src/render`, `src/input` y `src/data` sin cambios desde c6b8ff3). La tabla del README (144,5× y 115,5×) es de una corrida anterior y no coincide con ninguna de las dos.
