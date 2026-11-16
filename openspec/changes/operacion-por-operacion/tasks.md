# Tareas

Medir antes de tocar: a 1440×900 y 1366×768, con `Calle` y el cerebro por
defecto, en pausa y de a operaciones, el alto de la red (`.inspect-net` menos
controles, franja y barra) y el de la franja. Anotarlo acá.

*Medido antes de tocar nada (Chrome sin ventana contra el servidor de vista previa, `example:street-new`
6 → 6 → 4, pista `straight`, en pausa, de a operaciones y tres pasos dados):*

| Ventana | `.inspect-net` | Controles | Red | Franja | Barra | Se desplaza |
|---|---|---|---|---|---|---|
| 1440×900 | 786 | 69 | **605** | **43** | 69 | no (página ni escenario) |
| 1366×768 | 654 | 69 | **473** | **43** | 69 | no |

## 1. El cursor

- [x] 1.1 `src/core/pass-cursor.js`: operaciones finas (`read`, `multiply`, `add`, `bias`, `activation`), capa de entradas con un paso por entrada, `at(k)` con `input`, `terms`, `stepOf`, `back(size)`; `opsDone` de 0 a 4 como etapa (design.md D1 y D2). Pruebas en `tests/pass-cursor.test.js`: cantidad de operaciones por forma (6 → 6 → 4 son 146), orden dentro de una neurona, `advance` de cada tamaño desde cualquier punto, `back` de cada tamaño, cambiar de tamaño a mitad de la cuenta.
  *Hecho. `OPERATIONS` pasa a ser las cinco finas y `STAGES` las cuatro etapas de siempre; `opsPerNeuron`, `termsOf` y `stageOfTerms` sueltas para que la animación arme el mismo estado. Además `doneIn(l, j)` (operaciones finas hechas). `back(size)` vuelve al principio de la neurona (o la capa) de la última operación hecha: a mitad, la misma; en su principio, la anterior. 20 pruebas en `tests/pass-cursor.test.js` (146 para 6 → 6 → 4, 1949 para `prueba-grande`).*
- [x] 1.2 `src/tabs/inspect/step-animation.js`: la línea de tiempo y `displayCursor` con las operaciones finas (incluye `terms` a medio animar). Actualizar `tests/inspect-playback.test.js`.
  *Hecho. La animación arma fases por neurona con los términos de antes de cada una (`shown`), y `displayCursor` trae `terms`, `doneIn` y `stepOf`. De a operaciones, cada fase es una operación fina (con su `input`). De a neuronas, capas o cuadros las operaciones de una neurona se agrupan en leer, productos (todos a la vez, con `inputs`), suma, sesgo y activación: así se cumple "Mientras se anima una capa" (las marcas viajan por todas las conexiones) y la neurona se ve "más breve, en un solo movimiento". Un cuadro anima ahora también la capa de entradas. 17 pruebas.*
- [x] 1.3 `src/tabs/inspect/index.js`: `stepCursor`, `afterAdvance` y lo que supone que la capa 0 está siempre hecha; de a cuadros en tiempo real no arma la lista de operaciones. Misión "follow" con todas las operaciones de una neurona (`missions.js` y su prueba). Verificar "Una operación", "Una neurona", "Una capa", "Orden dentro de una neurona", "Leer una entrada", "Cambiar el tamaño a mitad de la cuenta" y "Fin de la cuenta".
  *Hecho. `afterAdvance` pasa la forma a la animación y a las misiones; la tarjeta sigue también a la entrada que se lee. De a cuadros en tiempo real `tick` sigue sin pasar por `stepCursor` (no arma la lista). "Seguí la cuenta" pide las 2n + 2 de una neurona; leer entradas no cuenta. Nombre accesible de una entrada sin leer: "sin leer". En el navegador (sin ventana, 1440×900, con las funciones de la pestaña): el cuadro empieza con `Sensor 1 · Leer`; de a neuronas en las entradas lee una; con 9 operaciones va por `Oculta 1 · neurona 1 · Sensor 2 · Multiplicar`; de a capas con la oculta a medio hacer la completa; después de la última salida, el paso siguiente mueve el auto. Consola sin errores.*

## 2. La franja

- [x] 2.1 `describe.js`: `describeOperation` devuelve la cuenta como datos (operación, números con su nombre, cuál es el resultado, frase, recorrido de la neurona) y `describeStep` la oración para el lector de pantalla. Textos en `es.js` y `en.js`, incluidas las frases de sensor (nada a la vista, a qué porcentaje del alcance), velocidad, entrada a mano, conexión apagada y neurona apagada. Pruebas en `tests/inspect-describe.test.js`.
  *Hecho. `describeOperation` devuelve lugar, paso ("Paso 5 de 14 de esta neurona"; en las entradas, "Entrada 2 de 6"), los números como datos (`num` con nombre, tooltip y `result`; `sym`; `fn`), la frase y el recorrido (`trackOf`, resumido desde 13 entradas). Un aporte negativo se escribe "+ (−0,21)": el número bajo "aporte de…" es el aporte. Las sumas parciales salen de los aportes en orden; el total del sesgo es `n.total`. `describeStep` de a operaciones es la oración con nombres; de a neuronas o capas en las entradas, "Entradas · Sensor 1 = 0,45" y "Entradas: leídas las 6". 12 pruebas, incluida una que pide como mucho 100 caracteres por frase en los dos idiomas (para que entre en un renglón).*
- [x] 2.2 La franja en HTML con sus cuatro renglones de alto fijo de a operaciones, y el resumen de dos renglones con los otros tamaños (D4). Nombres con el tooltip del término. Verificar los escenarios de "Operación en curso", en especial "Alto que no salta", "Muchas entradas" (con `prueba-grande`) y "Sin depender del color".
  *Hecho. Franja en HTML con `data-mode` fine o summary; de a operaciones mide 88 px fijos (filas de 15, 31, 16 y 18 px). Resultado con borde de 2 px; marca en curso con borde punteado y negrita; hecha con ✓. Nombres con el tooltip de la tarjeta (más `inspect.term.total` y `inspect.term.zero`, nuevos). Medido sin ventana: 20 operaciones seguidas a 1440×900 y 1366×768, la franja siempre 88 px y la red siempre igual ("Alto que no salta"); con `prueba-grande` el recorrido dice "Entradas 3 de 21 · Sesgo · Activación" y nada se corta, en es y en ("Muchas entradas"). Capturas `op-2.2-*.png`.*
- [x] 2.3 Medir de nuevo el alto de la red a 1440×900 y 1366×768 y comparar con lo anotado arriba. **Si la red pierde más de 48 px a 1366×768 o la pestaña deja de verse sin desplazarse: parar y consultar** con medidas, capturas y una alternativa.
  *Medido: red de 605 a 560 px a 1440×900 y de 473 a 428 px a 1366×768 (pierde 45 px; el tope es 48). La página y el escenario no se desplazan. No hace falta consultar.*
- [x] 2.4 "Lugar de la cuenta" en la barra: capa, neurona, entrada y operación (`whereText`).
  *Hecho. `whereText` agrega la entrada en multiplicar y sumar: "Cuadro 37 · Oculta 1 · neurona 2 · Sensor 3 · Multiplicar"; en las entradas, "Entradas · Sensor 1 · Leer". Nombres de operación nuevos `inspect.op.read/multiply/add`.*
- [x] 2.5 "Producto" pasa a "Aporte" en la tarjeta y en todo texto de las dos pestañas que use la tarjeta (`es.js`, `en.js`: "Contribution"). `mlLab.auditTooltips()` no informa nada.
  *Hecho. "Aporte" / "Contri\u00ADbution" (con guion opcional: con el panel en 300 px el encabezado parte en dos renglones en inglés y siguen a la vista las 6 filas; medido a 1236×863 y 1100×800). Columna de 22 % a 26 %. También "aporte" en las ayudas de la suma, el sesgo y apagar una conexión, y las ayudas de los tamaños del paso. La tarjeta compacta del Laboratorio no tiene esa columna: no cambia a la vista. `mlLab.auditTooltips()` da 0 en es y en.*

## 3. El diagrama y la tabla

- [x] 3.1 `network-inspector.js`: con `terms`, aportes por conexión (sumada, en curso, sin calcular), `inProgress` con `kind: 'connection'`, pastilla "valor × peso" y aporte, rótulo de la suma hasta acá, entradas sin leer (D5). Pruebas en `tests/in-progress.test.js`. Verificar los escenarios nuevos de "Actividad en el momento".
  *Hecho. Con `terms`, cada conexión muestra su aporte desde que se multiplica; `inProgress` da `kind: 'connection'` si la próxima es multiplicar o sumar, y solo esa conexión cuenta como relacionada, con anillos en sus dos extremos. Las demás de esa neurona se ven normales (las sumadas con su aporte escrito, las que faltan sin calcular); el resto se atenúa. Como la tarjeta elige la neurona en curso, esa elección no destaca todas sus conexiones mientras va de a operaciones. Sobre la conexión en curso, "0,00 × −0,07" o "aporte −0,10", al costado de la línea; junto a la neurona, "suma hasta acá …" desde el primer sumar hasta el sesgo. Entradas sin leer: contorno punteado y sin número. 5 pruebas nuevas en `tests/in-progress.test.js`, incluida "Sin detalle fino". Verificado sin ventana a 1440×900: capturas `op-3.1-*.png`.*
- [x] 3.2 Animación de `read`, `multiply` y `add`; capa resumida; menos movimiento. Verificar "Paso animado".
  *Hecho. Leer: el relleno de la entrada crece. Multiplicar: una marca por esa sola conexión. Sumar: entra a la neurona y el rótulo pasa al valor nuevo a mitad del paso. Sesgo y activación, como antes. Capa resumida: la conexión en curso va a su cuadrito, sin cuenta escrita. Con menos movimiento no hay animación (sin cambios: `afterAdvance` no la crea). Capturas `op-3.2-multiplicar-animando.png`, `op-3.2-sumar-animando.png` y `op-3.2-capa-resumida.png`.*
- [x] 3.3 `weight-table.js`: celda en curso y celdas sin calcular. Verificar "Vista de pesos".
  *Hecho. Celdas de la neurona en curso con `data-op` current (borde punteado amarillo y negrita), done o pending (opacidad 0,4); las entradas sin leer muestran "–" y la que se lee lleva la marca de en curso. Medido: en la neurona 2 yendo por la tercera entrada, la fila da `d d c p p p`. Captura `op-3.3-tabla.png`.*
- [x] 3.4 El rayo del sensor que se lee, destacado en la escena. Verificar "La entrada que se lee, en la escena".
  *Hecho. Mientras la última operación es leer un sensor (de a operaciones o de a neuronas), su rayo va en el color de lo que se calcula, con 4 px, y los demás al 35 %. La velocidad no tiene rayo: un aviso en la escena dice "Se lee la velocidad: 1,00". La entrada a mano ya la dice la frase de la franja (2.1). Capturas `op-3.4-lee-sensor-2.png` y `op-3.4-lee-velocidad.png`.*
- [x] 3.5 Laboratorio en el navegador: la ida de un ejemplo, de a neuronas y de a fases, se ve como antes. Verificar "Sin detalle fino". `tests/lab*.test.js` en verde sin tocar lo que afirman.
  *Verificado. Laboratorio sin ventana a 1440×900, desde los pesos iniciales, con el código de `d09b03c` (servido desde una copia, interceptando las peticiones) y con el de ahora: de a neuronas en la ida, de a fase, en la vuelta y con la tarjeta de una neurona; el resumen de los píxeles del lienzo, el lugar de la cuenta y el texto de la tarjeta dan iguales en los cuatro. Las pruebas `tests/lab*.test.js` pasan sin tocarlas. Capturas `op-3.5-lab-*-antes.png` y `-despues.png`.*

## 4. La tarjeta

- [x] 4.1 `shared/neuron-card.js`: filas sin hacer, multiplicada, sumada y en curso; pie con la suma hasta acá; la fila en curso a la vista aunque esté en "Otras" (D6). Verificar "La tarjeta sigue la cuenta de a una operación" a 1440×900, 1366×768 y 1236×863, sin romper "Filas a la vista" ni "Nada se encima".
  *Hecho. Con `terms` (solo Inspeccionar), cada fila lleva `data-term` (pending, multiplied, added) y `data-current`; la sumada, una ✓ al lado de su aporte; la que falta, "–"; la fila en curso, barra amarilla a la izquierda y el aporte con borde punteado, y se trae a la vista dentro de las filas. Con el filtro de conexiones la fila en curso se agrega a las que se muestran. El pie dice "Suma hasta acá" con la suma de los aportes sumados, y sesgo, activación y salida "–". Medido sin ventana a 1440×900, 1366×768, 1236×863 y 1100×800: yendo por la tercera entrada, las filas dan sumada, sumada, multiplicada (en curso), y tres sin hacer; con tres sumadas el pie da "Suma hasta acá −0,11"; con el filtro en 1, la fila en curso se ve igual. Filas a la vista 6 de 6 en los cuatro tamaños y nada se encima ni sale de la celda del aporte (al principio la ✓ se encimaba con la barra a 1236×863; la barra ahora se achica). La tarjeta compacta del Laboratorio no se tocó. Tooltips: 0. Capturas `op-4.1-*.png`.*

## 5. Paso atrás

- [ ] 5.1 Botón "Atrás (B)" junto a "Paso (N)", atajo B en `shortcuts.js`, tooltip qué hace / por qué importa, `aria-disabled` al principio del cuadro (D7). Verificar "Atrás", "Atrás con otro tamaño", "Atrás al principio del cuadro", "Atrás con B", "B reproduciendo" y "Atajos apagados". La barra sigue entrando en una fila a 600 px de red y en las que tenía a 440 px; si no, parar y consultar.

## 6. Cierre

- [ ] 6.1 Recorrido completo en el navegador de un cuadro de a operaciones con el cerebro por defecto: capturas de un `read`, un `multiply`, un `add`, el sesgo, una activación oculta y una de salida, a 1440×900 y 1366×768, en la carpeta de notas.
- [ ] 6.2 Fluidez: de a cuadros en tiempo real con `prueba-grande` (mediana y peor intervalo entre cuadros, 10 s) y de a operaciones a 20 pasos por segundo. Comparar con 5,6 ms de mediana medidos en `vista-de-la-red`.
- [ ] 6.3 Teclado y lector: Tab llega a "Atrás"; cada paso a mano anuncia la cuenta con nombres; reproduciendo no anuncia.
- [ ] 6.4 PENDIENTES.md: lo que quedó afuera (design.md, "Mejoras que quedan afuera") y lo no medido.
- [ ] 6.5 `npm test` y `openspec validate operacion-por-operacion --strict`.
