# Diseño

## Contexto

La cuenta de un cuadro sale de `traceNetwork` y el cursor (`createPassCursor`)
solo dice hasta dónde se muestra. El inspector (`network-inspector.js`,
`weight-table.js`) y la tarjeta (`shared/neuron-card.js`) se comparten con el
Laboratorio, que les pasa otro cursor con la misma forma (`opsDone` de 0 a 4,
`isDone`, `stateOf`, `next`).

Nada de lo que sigue está medido en el navegador: son decisiones de diseño.
Las cuentas de pasos son aritmética sobre la forma de la red.

## Decisiones

### D1 · Qué es una operación

Una operación es una cuenta con dos números como mucho y un resultado. La
cuenta de un cuadro, en orden:

1. **Entradas** (capa 0): un paso `read` por entrada. No calcula: muestra el
   número que mide el auto.
2. **Cada neurona** de las capas siguientes, con *n* entradas:
   - por cada entrada *i*, en orden: `multiply` (valor × peso = aporte) y
     `add` (suma hasta acá + aporte = suma nueva);
   - `bias` (suma + sesgo = total);
   - `activation` (función(total) = salida).

   Son 2*n* + 2 pasos. La primera suma se muestra como 0 + aporte: deja a la
   vista que la neurona arranca en cero.

Para la red 6 → 6 → 4: 6 + 6 × 14 + 4 × 14 = 146 operaciones por cuadro (hoy
40).

**El sesgo va al final y una sola vez.** Es como lo muestra la tarjeta y la
fórmula. `traceNetwork` calcula el total arrancando por el sesgo, para dar
bit a bit lo mismo que el manejo; el resultado que se muestra en el paso del
sesgo es ese `total`, no una suma rehecha. Las sumas parciales se acumulan en
el orden de las entradas con los productos de la cuenta y se redondean al
mostrar; vale la nota de redondeo que ya tiene la tarjeta.

Una conexión apagada sigue siendo dos pasos (multiplicar da 0, sumar 0): así
la cantidad de pasos depende solo de la forma de la red y el lugar de la
cuenta no salta. La frase dice que está apagada. Una neurona apagada hace
todos sus pasos y en la activación la frase dice que da 0 por estar apagada.

Alternativa descartada: un paso por entrada que multiplica y suma a la vez.
Son dos cuentas en un paso, justo lo que se quiere evitar.

### D2 · El cursor

`createPassCursor` pasa a contar operaciones finas. Las capas dejan de tener
todas el mismo largo por neurona: la capa 0 tiene 1 por neurona y la capa *l*
tiene 2 × `sizes[l − 1]` + 2.

- `at(k)` devuelve `{ layer, neuron, op, input, index }`, con `op` en
  `read | multiply | add | bias | activation` e `input` en `multiply` y `add`.
- Nuevo: `terms(layer, neuron)` → `{ multiplied, added, bias, activation }`
  (cuántas entradas van multiplicadas y sumadas) y `stepOf(layer, neuron)` →
  `{ done, total }` para "paso 5 de 14".
- Nuevo: `back(size)`: lleva la cuenta al principio del paso anterior de ese
  tamaño (operación: una menos; neurona: principio de la neurona en curso o,
  si está en su principio, de la anterior; capa: igual con capas). No pasa de
  0.
- **Se conserva** para lo compartido: `opsDone(layer, neuron)` de 0 a 4 como
  etapa (0 nada; 1 algo multiplicado; 2 todo sumado; 3 sesgo; 4 activación),
  `isDone`, `stateOf`, `layerDone`. En la capa 0, 0 o 4.
- `advance('neuron')` en la capa 0 lee una entrada; `advance('layer')` lee
  todas. `advance('frame')` hace todo.

El inspector y la tarjeta usan `terms` si el cursor lo tiene; si no (el
cursor del Laboratorio), siguen mostrando los aportes de una neurona todos
juntos. El Laboratorio no cambia.

### D3 · Entradas como primer paso

Al moverse el auto, la cuenta nueva empieza con las entradas sin leer (se ven
como una neurona sin calcular). De a capas, el primer paso es "Entradas"; de
a neuronas, cada entrada es un paso; de a operaciones, también. De a cuadros
no hay diferencia: se ve la cuenta completa.

Es el "percibir" de "percibir, calcular la red y mover el auto", que hoy no
se ve como paso. Mientras se lee un sensor, su rayo se destaca en la escena
(ya existe `highlight` en la vista para la entrada elegida).

Qué dice la frase de un sensor, según su valor (`reading = 1 − distancia /
alcance`): 0, "no ve nada dentro de su alcance"; si no, a qué porcentaje del
alcance está lo que ve. La velocidad: respecto de la máxima. Una entrada
puesta a mano: "la pusiste vos".

### D4 · La franja

De a operaciones la franja tiene alto fijo y cuatro renglones:

1. Lugar y operación: "Oculta 1 · neurona 2 · Multiplicar"; a la derecha,
   "Paso 5 de 14 de esta neurona".
2. La cuenta: cada número en su caja, con su nombre debajo; el resultado, con
   borde más grueso.
3. Una frase que dice qué se hizo y por qué.
4. El recorrido de la neurona: una marca por entrada, sesgo y activación;
   hechas (con tilde), en curso (con borde), sin hacer. Con más marcas de las
   que entran en un renglón, se resume: "Entradas 3 de 21 · Sesgo ·
   Activación".

Nombres de los números (uno solo en toda la pestaña): valor de «entrada»,
peso de la conexión, aporte de «entrada», suma hasta acá, sesgo de la
neurona, total, salida. Cada nombre lleva el tooltip que ya tiene ese término
en la tarjeta. La columna "Producto" de la tarjeta pasa a "Aporte".

Con los otros tamaños la franja queda como hoy (resumen en dos renglones). El
alto cambia solo al cambiar el tamaño del paso, nunca entre pasos.

La franja es HTML (no canvas): los números son texto seleccionable. Para el
lector de pantalla, el anuncio de cada paso a mano es la cuenta en una
oración con los nombres ("Multiplicar: valor de Sensor 3, 0,00, por peso de
la conexión, −0,07, igual a aporte, 0,00"); la franja visual sigue fuera del
árbol de accesibilidad como hoy, salvo que el anuncio no alcance.

**Parar y consultar:** si a 1366×768 la franja de cuatro renglones le saca a
la red más de 48 px de alto respecto de hoy, o la pestaña deja de verse sin
desplazarse, parar y traer las medidas y una alternativa.

### D5 · El diagrama de a operaciones

- En curso: la conexión de la operación (y sus dos neuronas). Las demás
  conexiones de esa neurona: las ya sumadas, normales, con su aporte en la
  pastilla; las que faltan, como sin calcular. El resto de la red, atenuado
  como hoy.
- Sobre la conexión en curso, la pastilla muestra "valor × peso" mientras se
  multiplica y el aporte al terminar.
- Junto a la neurona en curso, el rótulo de la suma hasta acá (ya existe
  `labelBox` para la suma animada), desde el primer `add` hasta el sesgo.
- En `read`, la marca de en curso va en la entrada.
- `inProgress` devuelve `kind: 'connection'` de a operaciones cuando la
  próxima es `multiply` o `add`.

Animación (duración de un paso de a operaciones: 300 ms, como hoy):
`read`, el relleno de la entrada; `multiply`, una marca por esa conexión;
`add`, la marca entra y el rótulo cambia; `bias` y `activation`, como hoy.
Con menos movimiento, cambio de estado sin viaje. Un paso atrás no anima.

En una capa resumida la operación en curso se ve en la banda y en el
cuadrito, sin pastilla.

### D6 · La tarjeta

Con `terms`: fila sin multiplicar, sin aporte ("–"); multiplicada, con su
aporte; sumada, con una marca de sumada (tilde, no solo color). La fila en
curso lleva la marca de en curso y se muestra aunque el filtro de conexiones
la deje en "Otras". El pie muestra la suma hasta acá.

### D7 · Paso atrás

Botón "Atrás (B)" junto a "Paso (N)". Deshace dentro del cuadro: no devuelve
el auto al cuadro anterior (la simulación no guarda historia). Al principio
del cuadro no hace nada; queda con `aria-disabled` y su tooltip lo explica,
como los demás controles sin efecto momentáneo. Reproduciendo, pausa y
vuelve un paso.

Alternativa descartada: guardar los cuadros anteriores para volver también el
auto. Es otro cambio (historia de la simulación).

### D8 · Ritmo y misiones

Los ritmos no cambian (1, 2, 5, 10 y 20 pasos por segundo). A 1 por segundo,
un cuadro de la red 6 → 6 → 4 lleva 146 s; para recorrer rápido están
Neurona y Capa.

La misión "Seguí la cuenta de una neurona" pasa a cumplirse al avanzar de a
una operación todas las de una misma neurona (2*n* + 2), no cuatro.

## Mejoras que quedan afuera

- Saltear los aportes en cero para acortar el recorrido.
- Que la vista se acerque sola a la neurona en curso.
- El mismo desglose fino en la ida del Laboratorio.
- Volver cuadros hacia atrás.

## Riesgos

- El inspector y la tarjeta son compartidos: el Laboratorio tiene que verse
  igual. Se comprueba con sus pruebas y en el navegador.
- Más operaciones por cuadro: `afterAdvance` arma la lista de operaciones de
  cada paso; de a cuadros en tiempo real no debe armarla (hoy tampoco se
  anima). Medir la fluidez con `prueba-grande` como en `vista-de-la-red`.
