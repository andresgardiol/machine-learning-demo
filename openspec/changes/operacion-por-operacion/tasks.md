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

- [ ] 2.1 `describe.js`: `describeOperation` devuelve la cuenta como datos (operación, números con su nombre, cuál es el resultado, frase, recorrido de la neurona) y `describeStep` la oración para el lector de pantalla. Textos en `es.js` y `en.js`, incluidas las frases de sensor (nada a la vista, a qué porcentaje del alcance), velocidad, entrada a mano, conexión apagada y neurona apagada. Pruebas en `tests/inspect-describe.test.js`.
- [ ] 2.2 La franja en HTML con sus cuatro renglones de alto fijo de a operaciones, y el resumen de dos renglones con los otros tamaños (D4). Nombres con el tooltip del término. Verificar los escenarios de "Operación en curso", en especial "Alto que no salta", "Muchas entradas" (con `prueba-grande`) y "Sin depender del color".
- [ ] 2.3 Medir de nuevo el alto de la red a 1440×900 y 1366×768 y comparar con lo anotado arriba. **Si la red pierde más de 48 px a 1366×768 o la pestaña deja de verse sin desplazarse: parar y consultar** con medidas, capturas y una alternativa.
- [ ] 2.4 "Lugar de la cuenta" en la barra: capa, neurona, entrada y operación (`whereText`).
- [ ] 2.5 "Producto" pasa a "Aporte" en la tarjeta y en todo texto de las dos pestañas que use la tarjeta (`es.js`, `en.js`: "Contribution"). `mlLab.auditTooltips()` no informa nada.

## 3. El diagrama y la tabla

- [ ] 3.1 `network-inspector.js`: con `terms`, aportes por conexión (sumada, en curso, sin calcular), `inProgress` con `kind: 'connection'`, pastilla "valor × peso" y aporte, rótulo de la suma hasta acá, entradas sin leer (D5). Pruebas en `tests/in-progress.test.js`. Verificar los escenarios nuevos de "Actividad en el momento".
- [ ] 3.2 Animación de `read`, `multiply` y `add`; capa resumida; menos movimiento. Verificar "Paso animado".
- [ ] 3.3 `weight-table.js`: celda en curso y celdas sin calcular. Verificar "Vista de pesos".
- [ ] 3.4 El rayo del sensor que se lee, destacado en la escena. Verificar "La entrada que se lee, en la escena".
- [ ] 3.5 Laboratorio en el navegador: la ida de un ejemplo, de a neuronas y de a fases, se ve como antes. Verificar "Sin detalle fino". `tests/lab*.test.js` en verde sin tocar lo que afirman.

## 4. La tarjeta

- [ ] 4.1 `shared/neuron-card.js`: filas sin hacer, multiplicada, sumada y en curso; pie con la suma hasta acá; la fila en curso a la vista aunque esté en "Otras" (D6). Verificar "La tarjeta sigue la cuenta de a una operación" a 1440×900, 1366×768 y 1236×863, sin romper "Filas a la vista" ni "Nada se encima".

## 5. Paso atrás

- [ ] 5.1 Botón "Atrás (B)" junto a "Paso (N)", atajo B en `shortcuts.js`, tooltip qué hace / por qué importa, `aria-disabled` al principio del cuadro (D7). Verificar "Atrás", "Atrás con otro tamaño", "Atrás al principio del cuadro", "Atrás con B", "B reproduciendo" y "Atajos apagados". La barra sigue entrando en una fila a 600 px de red y en las que tenía a 440 px; si no, parar y consultar.

## 6. Cierre

- [ ] 6.1 Recorrido completo en el navegador de un cuadro de a operaciones con el cerebro por defecto: capturas de un `read`, un `multiply`, un `add`, el sesgo, una activación oculta y una de salida, a 1440×900 y 1366×768, en la carpeta de notas.
- [ ] 6.2 Fluidez: de a cuadros en tiempo real con `prueba-grande` (mediana y peor intervalo entre cuadros, 10 s) y de a operaciones a 20 pasos por segundo. Comparar con 5,6 ms de mediana medidos en `vista-de-la-red`.
- [ ] 6.3 Teclado y lector: Tab llega a "Atrás"; cada paso a mano anuncia la cuenta con nombres; reproduciendo no anuncia.
- [ ] 6.4 PENDIENTES.md: lo que quedó afuera (design.md, "Mejoras que quedan afuera") y lo no medido.
- [ ] 6.5 `npm test` y `openspec validate operacion-por-operacion --strict`.
