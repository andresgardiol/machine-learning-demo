# Diseño

## Contexto

Leído en el código (no medido):

- `src/core/network.js`: la salida es siempre escalón (`outputFn = step`) y
  `DEFAULT_ACTIVATION` de las ocultas es `'step'`. Un valor puede pasar de 0 a
  1 en un cuadro.
- `src/render/network-inspector.js` (`drawNode`) pinta el relleno con
  `globalAlpha = 0.15 + 0.85 * level` sobre el fondo: de casi nada a blanco
  pleno. `network-view.js` (vista chica de otras pestañas) y
  `weight-table.js` dibujan con la misma idea.
- `src/tabs/shared/driving-cards.js` (`actionBlock`) cambia `data-on` de cada
  tecla; el CSS la pinta llena o vacía.
- Inspeccionar y el Laboratorio con tu manejo dibujan cada cuadro en tiempo
  real.

## Objetivos / No objetivos

**Objetivos**
- Ninguna región destella más de 3 veces por segundo (WCAG 2.3.1), sin
  mentir sobre lo que hace la red.
- Un solo lugar, puro y probado, que decide qué se muestra.

**No objetivos**
- Suavizar todo: un cambio de valor que no destella se sigue viendo exacto y
  al instante (principio "causa y efecto inmediatos").
- Tocar la red o la simulación.

## Decisiones

### D1. Medir primero
Antes de cambiar nada se mide la causa: en el navegador, con el cerebro de la
captura y con el de ejemplo de la calle, leer cada cuadro el brillo del lienzo
en el centro de cada neurona (`getImageData`) y el estado de cada tecla, un
minuto, y contar cambios de más de la mitad del rango por segundo. Si lo que
destella no son neuronas de escalón ni teclas de la decisión, se para y se
consulta: el diseño de abajo asume esa causa.

### D2. Guarda de destellos: módulo puro
`src/render/flash-guard.js`, sin DOM:

```
createFlashGuard({ maxFlips: 3, windowMs: 1000, swing: 0.5, averageMs: 500, calmMs: 1000 })
  .show(key, level, nowMs) → { level, flicker: boolean, average }
  .reset()
```

- Un "cambio grande" es cuando `level` se aleja 0,5 o más del último nivel
  contado; ahí se cuenta y se toma como nuevo nivel de referencia.
- Si en la ventana de 1 s ya hubo 3 cambios grandes, el que sería el cuarto no
  se muestra: el elemento pasa a `flicker: true` y se muestra `average`
  (promedio de los niveles de los últimos 500 ms, pesado por tiempo).
- Sale de `flicker` cuando no hubo ningún cambio grande en 1 s.
- `key` identifica neurona (`n:capa:i`), conexión (`c:capa:i:j`) o tecla
  (`a:forward`).

Así los tres primeros cambios se ven exactos; nunca hay un cuarto en el mismo
segundo. El promedio cambia de a poco y no cuenta como destello.

**Ajustes al implementar (medidos en el navegador, tareas 2.1 y 3.1).** Con la regla tal cual
quedaban destellos: (a) un cambio grande pasa a ser un *recorrido* de 0,5 (entre el menor y el mayor
brillo mostrado desde el último cambio contado): contra un solo nivel de referencia, una salida que va
de 0,34 a 0,88 y vuelve cada cuadro alrededor de 0,6 no contaba nunca; (b) la cuenta se lleva sobre lo
que se muestra, en brillo: el relleno de una neurona es nada en 0 y 0,15 + 0,85 × nivel si no, así
que de 0 a 0,42 ya es medio rango; (c) que el rayado aparezca o se vaya pesa 0,15; (d) si mostrar el
promedio sería el cuarto cambio, se muestra lo más cerca del promedio que no lo es; (e) la ventana
lleva 100 ms de margen; (f) desde 0,47 ya cuenta como grande (0,03 de margen por el redondeo de
los píxeles). La medida de D1 usa la misma cuenta por recorrido.

*Alternativa 1*: suavizar siempre (filtro exponencial). Se pierde la
inmediatez y mentiría en redes sin escalón. *Alternativa 2*: limitar los
cuadros por segundo del dibujo de la red. Sigue destellando a 3–4 Hz y
retrasa todo.

### D3. Quién usa la guarda
Una instancia por vista (inspector, vista chica, tabla de pesos, teclas de
la decisión), con el reloj de `performance.now()`. Se aplica solo cuando la
red corre de corrido (`playback.size === 'frame'` y reproduciendo, o el
Laboratorio con la escena manejando). En pausa o paso a paso se llama a
`reset()` y se dibuja lo exacto (escenarios "Pausa exacta" y "En pausa").

### D4. Cómo se ve lo que titubea
- Neurona: relleno al `average`, con un rayado diagonal fijo (patrón de lienzo
  creado una vez, del color del texto al 35 %) y el número con "≈".
- Conexión: brillo al promedio y un punteado fino fijo, distinto del punteado
  de los pesos negativos (más corto y más fino).
- Tecla de la decisión: `data-on="mixed"`, con fondo rayado por CSS
  (`repeating-linear-gradient`) y `aria-label` que suma "titubea".
- Leyenda: la marca "titubea" va en el renglón de las marcas (elegida, en
  curso, apagada, cambiada), para no pasar de los cinco renglones que pide
  "Guía, leyenda y misiones" de Inspeccionar; lo mismo en el Laboratorio. Hay
  que medir que la leyenda siga entrando.

El rayado es fijo: no se anima, para no crear otro destello.

**Ajuste al implementar (tarea 3.1).** El número de lo que titubea va con la letra del color del texto
y un borde fino del fondo, sin la curva de la activación: con el número normal, el color de la letra
sigue al relleno (oscura desde 0,55) y destellaba; con una pastilla del fondo detrás, como sobre un
mapa, aparecía un rectángulo oscuro al empezar a titubear. La marca del Laboratorio va en la franja de
abajo de la red y se ve solo aprendiendo de corrido.

### D5. Tarjeta de la neurona
La guarda lleva, por clave, cuánto del último segundo estuvo el valor en cada
lado. La tarjeta, si la neurona elegida titubea, dice "titubea entre 0 y 1:
1 el 40 % del último segundo". Solo lectura.

## Riesgos / Compromisos

- [La causa no es la supuesta] → D1 mide antes; si no coincide, parar.
- [Coste por cuadro] → la guarda hace O(1) por elemento; con 2-8-8-8-4 son
  unos 250 elementos. Medir la fluidez antes y después en Inspeccionar con la
  red más grande; aceptar si la mediana no empeora más de 1 ms.
- [Un elemento chico que destella poco no es peligroso según la pauta, y se
  lo raya igual] → se prefiere de más a de menos; es la regla más simple de
  explicar.
- [La leyenda deja de entrar] → medir a 1440×900 y 1366×768; si no entra,
  parar y consultar.
