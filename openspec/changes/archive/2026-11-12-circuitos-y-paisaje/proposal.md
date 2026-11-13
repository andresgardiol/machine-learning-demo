# Proposal

## Why

Hoy todo pasa en una sola pista, la calle recta con tráfico. Un cerebro
entrenado ahí solo puede mostrarse ahí, así que no hay forma de preguntar lo
que la pestaña Competir necesita preguntar: ¿aprendió a manejar, o aprendió
esa calle? Hacen falta pistas distintas, con otro problema adentro (curvas en
lugar de tráfico), para entrenar en unas y probar en otras.

Además, el escenario es una franja gris sobre fondo negro. Un entorno alrededor
de la pista ayuda a leer la velocidad y la escala, y hace que la app se vea
terminada.

Concepto que hace visible: **manejar bien en la pista donde se practicó no es
lo mismo que saber manejar. Una pista nueva muestra qué se aprendió de verdad
(generalizar) y qué era solo costumbre (sobreajuste).** Este cambio pone las
pistas; la pestaña Competir, que viene después, hace la comparación.

El paisaje es infraestructura visual: no enseña un concepto de ML. Habilita
que el escenario se lea mejor y que los circuitos se reconozcan como tales.

## What Changes

- **Tres circuitos cerrados, sin tráfico**, además de la calle recta:
  - **Óvalo:** dos rectas y dos curvas amplias. El más fácil.
  - **Riñón:** curvas a los dos lados y una chicana.
  - **Gran premio:** el más largo y con más curvas, inspirado en un trazado de
    gran premio conocido, simplificado y sin el cruce sobre sí mismo.
- **Vueltas:** en un circuito el avance se mide a lo largo de la pista y se
  acumula vuelta tras vuelta. Ir en sentido contrario no suma.
- **Los autos siguen sin chocarse entre sí** (ya es así): en un circuito
  corren como fantasmas, lo que permite comparar sus líneas de manejo.
- **Elegir la pista en las tres pestañas** (El problema, Reglas a mano y
  Entrenar). En un circuito, los ajustes de tráfico y de carriles se ven
  deshabilitados y explican por qué.
- **Entrenar en varias pistas a la vez:** en Entrenar se elige una pista o
  varias; con varias, cada generación corre en la siguiente de la lista. La
  calle recta sigue siendo la pista por defecto.
- **La misma fitness sirve en un circuito:** la "ventaja" premia avanzar en el
  sentido correcto, dar más vueltas y hacerlo más rápido. Donde no hay
  tráfico, se mide contra el ritmo de referencia de 10 m/s, el del tráfico.
- **Indicador de vueltas:** en un circuito, el indicador de vehículos
  superados pasa a mostrar las vueltas.
- **Un cerebro recuerda en qué pistas se entrenó.**
- **Paisaje alrededor de la pista**, solo estético y generado por semilla:
  - en la calle: pasto, árboles, veredas y sendas peatonales pintadas;
  - en los circuitos: pasto, árboles, tribunas, pianitos en las curvas y la
    línea de largada a cuadros.
- **Interruptor "Paisaje"**, encendido por defecto, para apagarlo. Tampoco se
  dibuja en "ver como la máquina".
- **"Ver como la máquina" en Reglas a mano y en Entrenar**, como ya existe en
  El problema: oculta la pista, el tráfico y el paisaje, y deja solo el auto
  con sus rayos. En Entrenar deja solo al líder, que es el auto cuya red se ve
  en el tablero. Con más cosas dibujadas en el escenario, importa más poder
  ver qué poco recibe la máquina.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Circuitos cerrados | Otra pista es otro problema: lo aprendido en una puede no servir en otra | Un selector de pista con cuatro opciones y su dibujo en el escenario | La calle recta sigue siendo la pista por defecto en las tres pestañas | Cambiar de pista reinicia el intento o rige desde la generación siguiente; restablecer vuelve a la calle |
| Entrenar en varias pistas | Practicar en situaciones distintas enseña a generalizar | Se marcan las pistas y el escenario cambia de una generación a la otra | Con una sola pista marcada no cambia nada | Desmarcar rige desde la generación siguiente; no se puede dejar ninguna |
| Ventaja en un circuito | Qué se premia define qué se aprende, también sin tráfico | El tooltip dice contra qué se mide; el indicador de vueltas muestra el resultado | Es el valor por defecto; las otras funciones siguen ahí | Elegir otra función rige desde la generación siguiente |
| Indicador de vueltas | El objetivo se mide en algo concreto: cuántas vueltas dio | Un número en el mismo lugar que los vehículos superados | Es un indicador, no un control | No tiene estado propio |
| Ver como la máquina en las pestañas 2 y 3 | El programa y la red deciden con unos pocos números, no con lo que ve una persona | Un interruptor con el mismo nombre y el mismo efecto que en El problema | Está apagado por defecto | Se apaga con el mismo interruptor; no cambia la simulación |
| Paisaje | Ninguno de ML: da escala, sensación de velocidad y contexto | Se ve; no hay nada que aprender a usar | Un interruptor lo apaga; "ver como la máquina" también | Es solo dibujo: no cambia la simulación ni lo que perciben los sensores |

### A quién sirve

- **Principiante:** no cambia nada si no toca nada: abre en la calle recta de
  siempre, ahora con pasto y árboles. Si elige un circuito, maneja o entrena
  ahí con los mismos controles.
- **Mentor:** entrena un cerebro en la calle y otro en un circuito, o uno en
  las cuatro pistas, y deja listos los ejemplos para hablar de generalización
  en Competir. Si el paisaje distrae en una proyección, lo apaga.

### Fuera de alcance

- La pestaña Competir: comparar cerebros, marcadores, tiempos de vuelta y
  varias líneas de manejo a la vez.
- Circuitos generados por semilla o dibujados por la persona: son tres, fijos.
- Tráfico en los circuitos.
- Tiempos de vuelta, mejor vuelta y cronómetro.
- Programas de ejemplo de Reglas a mano para circuitos: los ejemplos siguen
  siendo para la calle recta.
- Misiones nuevas para circuitos.
- Paisaje con cruces de calles, puentes o calles laterales.
- Que el paisaje afecte la simulación: no choca y los sensores no lo ven.

## Capabilities

### New Capabilities

- `paisaje`: el entorno estético alrededor de la pista: qué se dibuja en la
  calle y en los circuitos, cómo se genera, cuándo se oculta y qué no puede
  afectar.

### Modified Capabilities

- `pista`: se agregan las pistas cerradas, el progreso por vueltas y el
  catálogo de tres circuitos.
- `simulacion`: el mundo puede armarse sobre un circuito, que no lleva
  tráfico.
- `neuroevolucion`: se agregan las pistas del entrenamiento (una o varias,
  alternadas por generación), la ventaja en un circuito, la cuenta de vueltas
  y el aprendizaje esperado en el óvalo.
- `cerebros`: los datos de entrenamiento registran en qué pistas se entrenó.
- `vista-escenario`: dibujo de un circuito con su línea de largada.
- `pestana-conducir`, `pestana-reglas` y `pestana-entrenar`: elegir la pista,
  ajustes que no aplican en un circuito, indicador de vueltas e interruptor
  del paisaje. En `pestana-reglas` y `pestana-entrenar`, además, el modo "ver
  como la máquina".

## Impact

- **Núcleo:** `src/core/track.js` (pistas cerradas y vueltas), módulo nuevo
  `src/core/circuits.js` (catálogo), `src/core/world.js` (pista elegible, sin
  tráfico en circuitos), `src/core/training.js` (pistas del entrenamiento),
  `src/core/evolution.js` (vueltas) y `src/core/brain.js` (pista en los
  escenarios). Sin DOM y determinista.
- **Dibujo:** `src/render/view.js` (circuitos, largada) y módulo nuevo
  `src/render/scenery.js` (paisaje). `src/render/camera.js` ya trata a una
  pista con curvas sin girarla.
- **Pestañas:** `src/tabs/shared/street-settings.js` y `street-advanced.js`
  (selector de pista compartido por las pestañas 1 y 2), las tres pestañas y
  `src/ui/preferences.js` (preferencia del paisaje).
- **Textos y estilos:** `src/i18n/es.js`, `en.js`, `styles/tokens.css`
  (colores del paisaje) y `styles/app.css`.
- **Cerebros guardados:** siguen valiendo; todos se entrenaron en la calle.
- **Pruebas:** nuevas para pistas cerradas, catálogo, vueltas, mundo en
  circuito y pistas del entrenamiento. Las que enumeran claves de
  configuración suman las nuevas.
- **Rendimiento:** el paisaje se dibuja en cada cuadro y solo dentro del
  encuadre; tiene que respetar los mínimos de fluidez ya exigidos.
- **Sin medir todavía:** si la población aprende a dar vueltas con los
  valores por defecto. Lo mide la implementación antes de armar las pestañas,
  y se detiene a consultar si no alcanza.
- **Dependencias y build:** ninguna nueva.
