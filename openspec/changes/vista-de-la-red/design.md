# Diseño: la vista de la red, legible y completa

## Context

`src/render/network-inspector.js` dibuja la red en un canvas, con una capa de
botones encima para el teclado. `inspector-layout.js` reparte las columnas.
Lo usan Inspeccionar (`src/tabs/inspect/`) y el Laboratorio
(`src/tabs/lab/`). El aspecto de pesos y sesgos sale de `network-view.js`
(`weightStyle`, `levelLook`), que es también el diagrama chico de Entrenar.
La tarjeta de la neurona está en `src/tabs/shared/neuron-card.js`.

Este diseño sale de tres skills, a pedido del dueño: crítica de diseño,
diseño de interacción y visualización de datos.

### Lo medido antes de diseñar

| Qué | Hoy | Por qué |
|---|---|---|
| Grosor de las conexiones | 56 de 60 en 1,1 px | Escala fija de 0 a 1 en cuatro niveles; los pesos entrenados no pasan de 0,25 |
| Opacidad de las conexiones | 7 % a 16 % | 0,315 por el nivel, × 0,5 por no ser de la elegida, × 0,45 a 1 por el aporte |
| Radio de las neuronas | 16 px | `maxRadius: 16`; con 6 por capa el alto da para 37, con 4 para 56 |
| Resumir una capa | No agranda | El radio depende de la capa abierta más alta, pero el tope lo anula |
| Soltar la neurona | No se puede | La spec pedía una siempre elegida |
| Par verde agua y rosa | ΔE 4,6 con deuteranopia | `#36d6c3` y `#ff6fb5` tienen casi la misma claridad |

### La crítica, en una tabla

| Hallazgo | Principio | Gravedad | Qué se hace |
|---|---|---|---|
| Las conexiones no se ven | Visibilidad del estado (H1) | 4 | D2 |
| No se puede soltar lo elegido | Control y libertad (H3) | 3 | D5 |
| Neuronas de 32 px en una zona de 708×648 | Fitts; jerarquía visual | 3 | D3 |
| El detalle está a 700 px de la neurona | Proximidad; herramientas a mano | 2 | D6 y D8 |
| Cambiar un peso exige ir al panel | Manipulación directa | 2 | D8 |
| Siete tonos y leyenda de nueve renglones | Diseño mínimo (H8); carga cognitiva | 2 | D11 |
| El color solo no alcanza con daltonismo | Accesibilidad | 3 | D11 |

## Goals / Non-Goals

**Goals:** que la red se lea sin tocar nada; que todo lo que se ve se pueda
preguntar y cambiar donde está; que el Laboratorio muestre qué aprende cada
neurona; una sola vista para las dos pestañas.

**Non-Goals:** cambiar la cuenta de la red, la disposición de las pestañas,
la reproducción o el paso a paso animado; sumar dependencias.

## Decisions

### D1. Un solo criterio para todo

Tres cosas se ven en una conexión y cada una usa un canal distinto, sin
multiplicarse entre sí:

| Qué | Canal |
|---|---|
| Signo del peso | Color y trazo (continuo o punteado) |
| Tamaño del peso | Grosor |
| Señal que pasa ahora | Brillo |

La elección no cambia ninguno de los tres: atenúa lo que no está relacionado.

### D2. Aspecto de una conexión

Función pura `linkLook({ weight, maxWeight, product, maxProduct, role,
density })`, en `src/render/`, con pruebas. Valores de partida, a ajustar
mirando capturas (ver tareas):

- **Grosor:** `1,5 + 5,5 × |peso| / mayor |peso| de la red`, en píxeles con
  el acercamiento en 1. El mayor peso se toma de la red con sus cambios.
- **Brillo:** `piso + (1 − piso) × |producto| / mayor |producto| del cuadro`.
  Sin cuenta (nada calculado), todo en el piso.
- **Piso según la densidad:** 0,35 con hasta 48 conexiones entre dos capas,
  bajando hasta 0,12 con 256 o más. Es lo que evita la mancha en una red de
  16 por 16.
- **Papel:** sin nada elegido, todo como arriba. Con algo elegido o con el
  cursor encima, lo relacionado sube a 0,8 como mínimo y lo demás baja a
  0,15 de su brillo. Lo que queda fuera del filtro de conexiones, a 0,12.
- **Peso cero:** línea de 1 px, gris, continua. Apagada: punteada fina, como
  hoy.

`weightStyle` y `levelLook` de `network-view.js` pasan a usar la misma escala
relativa, así Entrenar muestra lo mismo.

### D3. Tamaño de las neuronas

`layoutInspector` calcula el radio como el menor de: 44; 0,38 del alto que le
toca a cada neurona de la capa abierta más alta; y 0,3 del hueco entre
columnas. El lugar para los rótulos de entradas y salidas se mantiene. Con
una capa resumida, la capa más alta deja de limitar y las otras crecen sin
hacer nada más: el cálculo ya estaba, lo anulaba el tope de 16.

### D4. Neurona por dentro

Según el radio en pantalla (lugar, capas resumidas o acercamiento):

| Radio | Adentro |
|---|---|
| menos de 12 | solo el relleno |
| 12 a 23 | el valor |
| 24 a 35 | el valor y la curva de su activación con un punto donde cae la suma |
| 36 o más | además, suma y sesgo con su nombre |

Las entradas muestran solo su valor. Con un mapa (D12), el mapa reemplaza al
relleno desde los 20 px y el valor va encima.

### D5. Estados y elección

Lo elegido es `null`, una neurona o una conexión. Un solo estado, sin modos.

```
[Nada elegido] --cursor encima--> [Vista previa] --sale--> [Nada elegido]
[Nada elegido / Vista previa] --clic en neurona o línea--> [Elegido]
[Elegido] --clic en lo mismo / clic afuera / Escape--> [Nada elegido]
[Elegido] --clic en otra cosa--> [Elegido (la otra)]
[Elegido] --cursor sobre otra cosa--> [Vista previa de la otra, sin perder lo elegido]
```

- **Qué se toca:** una neurona gana sobre las líneas que pasan por ella. Una
  línea se toca a 6 px o menos; entre varias, la más cercana, y con una
  neurona elegida, primero las suyas. La vista previa muestra cuál se va a
  elegir antes del clic: es lo que hace usable elegir entre muchas líneas.
- **Clic afuera:** suelta solo si no hubo arrastre (el arrastre mueve la
  vista).
- **Inspeccionar abre sin nada elegido.** La primera impresión pasa a ser la
  red entera y viva; el panel dice qué elegir (D7).
- **Teclado:** como hoy para las neuronas (flechas y Enter); Enter sobre la
  elegida la suelta; Escape suelta. Las conexiones se alcanzan desde las
  filas del detalle y desde la tabla de pesos.

### D6. Lectura al posar el cursor

Un rótulo chico junto al cursor, dibujado por el inspector (no es el tooltip
de ayuda ni depende de "Guía"): para una neurona, "Oculta 1 · neurona 3 ·
vale 1,00 · suma 0,42 · sesgo −0,10"; para una conexión, "Sensor 2 → Oculta 1
· neurona 3 · peso −0,26 · ahora aporta −0,08". Aparece en el mismo cuadro,
se ubica para no tapar lo que describe y no recibe el cursor.

### D7. Detalle en el panel

El lugar de la tarjeta pasa a tener tres formas:

- **Nada elegido:** una frase y atajos (las tres conexiones con más señal
  ahora y la salida que se está decidiendo). Se actualizan como mucho dos
  veces por segundo, para que no se muevan bajo el cursor.
- **Neurona:** la tarjeta de hoy, la curva de respuesta (D17), más una
  barra con signo por fila (sale del
  centro; largo relativo al mayor producto de la neurona), el pie escrito
  como una cuenta ("suma −0,07 + sesgo 0,00 = −0,07 → escalón → 0") y el
  nombre de cada entrada como botón que elige esa conexión.
- **Conexión:** origen → destino (los dos nombres son botones), el peso en
  grande con deslizador y campo, el original si cambió, "ahora: entrada ×
  peso = producto", "es el 62 % de lo que recibe la neurona", y apagar.

En el Laboratorio valen las formas compactas, sin "entrada a mano", y el
detalle sigue ocupando el lugar de la guía y las misiones mientras está
abierto. La forma "nada elegido" no se muestra ahí: el panel queda como al
abrir.

### D8. Cambiar en el lugar

La conexión elegida lleva en su punto medio una pastilla con su peso. Es un
control de verdad en la capa de botones, con papel de deslizador: se arrastra
en vertical (4 px por 0,01) y responde a las flechas (0,01; con Mayús, 0,1).
Usa los mismos límites que el deslizador del panel y el mismo cambio que se
deshace. El gesto no es el único camino: el deslizador y el campo del panel
hacen lo mismo.

### D9. De dónde viene

`upstream(trace, target, perNeuron)` en el núcleo (junto a
`network-trace.js`), puro: devuelve la importancia de 0 a 1 de cada conexión
de las capas anteriores. En cada neurona del camino, su importancia se
reparte entre sus entradas según `|producto|`; si todos valen cero, según
`|peso|`. `perNeuron` es el filtro de conexiones (todas, 5, 3 o 1).

El inspector lo usa con una neurona elegida o con el cursor encima: las
conexiones directas van con brillo pleno y las de más atrás con
`0,35 + 0,65 × importancia`. No hay un modo "rastro": es lo que pasa al
elegir.

### D10. Flujo de la señal

Marcas chicas que viajan por las conexiones con señal, del color del signo
del producto. Como mucho 150 a la vez, repartidas según `|producto|`; cruzan
un tramo en 0,6 s. Solo mientras la reproducción avanza sola de a cuadros; no
en pausa (se detienen), no en el paso a paso, no con menos movimiento.
Interruptor "Flujo" sobre la red, en Inspeccionar, encendido por defecto.

### D11. Colores y leyenda

- **Se mantiene el par** verde agua y rosa, por decisión del dueño. El rosa
  pasa a uno más profundo para separarlos en claridad: con `#e0489a` el
  validador da ΔE 14,3 con deuteranopia (hoy 4,6) y contraste de más de 3 a
  1 con el fondo. El valor final lo fija la implementación con el validador
  (`scripts/validate_palette.js` de la skill de visualización), con el
  criterio de la spec. El aviso de "banda de claridad" del validador no
  aplica: es para series de un gráfico, y acá la diferencia de claridad es a
  propósito.
- **Tonos que quedan:** verde agua y rosa (signo), azul (elegido), amarillo
  (paso en curso), naranja (culpa, solo en el Laboratorio) y el claro del
  relleno.
- **Tonos que se van:** el naranja de "cambiado" y el violeta de "a mano"
  pasan a marcas con forma en el color del texto.
- **Leyenda de cinco renglones:** signo; grosor; brillo y relleno; sesgo; y
  uno con las cuatro marcas.

### D12. Laboratorio

- **Mapas:** `neuronGrid(net, size, off)` en el núcleo: una pasada por punto
  y los valores de todas las neuronas. La grilla de 50 × 50 que ya pinta el
  plano alcanza para todo: el plano la muestra a su tamaño y cada neurona,
  reducida. Se recalcula con el plano, sin costo aparte.
- **El plano muestra lo elegido:** con una neurona oculta elegida o con el
  cursor encima, `plane-view` pinta su mapa con la misma escala de colores,
  y un rótulo sobre el plano dice "Lo que detecta Oculta 1 · neurona 2" o
  "Lo que contesta la red". El rótulo es lo que evita un modo oculto.
- **Con tu manejo:** la curva de respuesta (D17) en la tarjeta, con las
  demás entradas como en el ejemplo en curso. Reemplaza a las cuatro barras
  por control de la primera versión de esta propuesta, que decían menos. Con
  puntos no va: el mapa ya lo muestra.
- **Historia de un peso:** el recorrido guarda los pesos al terminar cada
  época, con tope de 300 muestras (al llenarse, una de cada dos). La dibuja
  el gráfico compartido, chico, en el detalle de la conexión.
- **No van:** "Flujo" ni "Ver original".

### D13. Comparar con el original

Botón "Ver original" junto a "Deshacer" y "Restablecer la red". Es un modo
de resorte: vale solo mientras se mantiene apretado (mouse, o barra
espaciadora con el foco en él). Mientras tanto, un rótulo sobre la red dice
"Original, sin tus cambios". No toca la lista de cambios.

### D14. Módulos

| Módulo | Cambio |
|---|---|
| `src/render/link-look.js` (nuevo) | Aspecto de una conexión, puro |
| `src/render/inspector-layout.js` | Radio, y a qué distancia está una línea |
| `src/render/network-inspector.js` | Estados, vista previa, lectura, números, pastilla, flujo, mapas |
| `src/render/network-view.js` | Escala relativa en Entrenar |
| `src/core/network-trace.js` o vecino | `upstream` |
| `src/core/backprop.js` o vecino | `neuronGrid` |
| `src/core/learning-cursor.js` | Historia de pesos |
| `src/tabs/shared/neuron-card.js` | Barras, cuenta escrita, filas que eligen |
| `src/tabs/shared/` (nuevo) | Detalle de una conexión |
| `src/tabs/inspect/`, `src/tabs/lab/` | Elección, panel, controles |

Las dependencias siguen apuntando al núcleo. Ninguna dependencia nueva.

### D15. Rendimiento

Toca el bucle de dibujo. Hoy la spec pide 55 cuadros por segundo con la red
más grande (20 sensores, tres capas de 16, cuatro salidas: 912 conexiones).
Lo que se suma por cuadro: el aspecto de cada conexión (una cuenta por
línea), hasta 150 marcas de flujo, y el texto adentro de las neuronas. Los
mapas se dibujan desde una imagen ya calculada. Buscar la línea bajo el
cursor es una distancia por conexión, solo al mover el mouse. `upstream` es
lineal en la cantidad de conexiones y corre solo con algo elegido. La tarea
de verificación mide los 55 cuadros con todo encendido.

### D16. Accesibilidad

- Signo: color y trazo. Marcas: forma. Nada depende solo del color.
- La pastilla es un deslizador con nombre y valor. Las conexiones se eligen
  también desde filas y celdas, que son botones.
- La lectura al posar el cursor repite lo que el lector de pantalla ya
  anuncia de cada neurona; no agrega información solo visual.
- Menos movimiento: sin flujo, y los cambios de tamaño al resumir, sin
  animación.

### D17. Curva de respuesta

Pedido del dueño: estaba en su demo original y no terminaba de entenderse.
Es un barrido de una entrada: cómo cambia la suma de una neurona cuando una
entrada va de 0 a 1 y las demás quedan como están.

- **Núcleo:** `responseCurve(net, inputs, target, inputIndex, { samples,
  changes, off, soft })`, puro, junto a `upstream`. 41 muestras: 41 pasadas
  de la red, solo con una neurona elegida.
- **Por qué no se entendía, y qué se agrega:** una curva suelta no dice
  nada. Acá lleva tres anclas: la línea del cero con "sale 1" y "sale 0" a
  cada lado; el punto de "ahora"; y una frase debajo que la lee ("Ahora la
  suma es 0,28, así que sale 1. En la primera capa es una recta: su
  inclinación es el peso de esa conexión, 0,22.").
- **Qué se ve:** en la primera capa oculta, una recta cuya inclinación es el
  peso; más atrás y en las salidas, escalones (cada salto es una neurona
  oculta que cambia). En el Laboratorio las activaciones son suaves y la
  curva también.
- **Dónde:** en el detalle de la neurona, debajo de la cuenta, de unos 140
  px de alto. Botones chicos para elegir la entrada; arranca en la que más
  aporta ahora y después recuerda la elegida.
- **El punto se arrastra** en Inspeccionar, en pausa: es otra forma de las
  entradas a mano que ya existen, con su misma vuelta atrás. En el
  Laboratorio no se arrastra: ahí no hay entradas a mano.
- **[Sin medir] Si entra en el panel.** La tarjeta de Inspeccionar ya mide
  508 px. Si a 1440×900 no entra con una neurona de 6 entradas, la salida es
  alternar "Cuenta | Respuesta" con dos botones en la tarjeta; se consulta
  en la 4.7 antes de hacerlo.
- **Dibujo:** el gráfico compartido, o un dibujo propio chico si el
  compartido no admite la línea del cero y el punto arrastrable.

## Risks / Trade-offs

- **[Sin medir] Una red densa con todo visible puede ser una mancha.** → El
  piso baja con la densidad (D2). Se mira con capturas de tres redes en la
  tarea 2.6, que es de detenerse a consultar: la decisión es visual y del
  dueño.
- **[Sin medir] Elegir una línea entre cientos.** → La vista previa muestra
  cuál se va a elegir; con una neurona elegida, primero las suyas; y están
  las filas y la tabla. Se prueba en la 3.5.
- **[Sin medir] El detalle nuevo en el panel.** La tarjeta de hoy mide 508
  px en Inspeccionar; las barras no suman alto, la cuenta escrita reemplaza
  renglones. → Se mide en la 4.7.
- **[Sin medir] Fluidez con la red más grande y todo encendido.** → 11.2.
- **[Sin medir] Los mapas chicos se leen a 40 px.** → Se mira en la 9.2.
- **Inspeccionar abre sin tarjeta.** Quien llega ve menos cuenta de entrada.
  → A cambio ve la red entera; el panel le ofrece atajos y la misión 1 lo
  lleva a elegir.
- **El flujo puede distraer.** → Interruptor a la vista; nunca en el paso a
  paso.
- **El rosa cambia en toda la aplicación,** incluida la leyenda de Entrenar.
  → Es un solo token; se revisa en la 8.3.
- **Es un cambio grande sobre una vista que usan dos pestañas.** → Las
  tareas van de lo que se ve sin tocar nada a lo que se pide; cada grupo deja
  las dos pestañas funcionando y con sus pruebas en verde.

## Migration Plan

Sin datos que migrar. La elección guardada por pestaña pasa a poder ser
"nada". Vuelta atrás: revertir el cambio; los cerebros no se tocan.

## Open Questions

- El valor exacto del rosa y los números de D2: se fijan mirando capturas.
- ¿El flujo encendido por defecto? La propuesta dice que sí, en Inspeccionar.
