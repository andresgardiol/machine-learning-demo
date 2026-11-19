# Proposal

## Why

El tráfico de la calle es demasiado regular. Los vehículos salen en filas a distancias parejas, todos iguales y a la misma velocidad, así que la calle se mueve como un bloque rígido. La red puede aprender un ritmo ("cada tanto aparece una fila") en vez de mirar sus sensores, y la etapa "¿generaliza?" enseña menos de lo que podría. El dueño lo pidió el 18 de noviembre de 2026 con una captura de Entrenar en la generación 61. Lo marcó como importante y la exploración del 19 de noviembre fijó el rumbo.

**Concepto de ML que hace visible:** la generalización. Una red que solo memorizó un patrón falla cuando el mundo deja de repetirse. Para que aprenda a mirar, el tráfico tiene que variar de verdad.

## What Changes

- **BREAKING (núcleo):** el tráfico deja de armarse en filas. Cada carril es una corriente propia de vehículos, con huecos al azar entre ellos y **una velocidad fija y distinta por carril**: el más lento a 6 m/s y el más rápido a 10 m/s, repartidas parejas. La semilla sortea qué carril lleva cuál. Dentro de un carril nadie se choca y todo sigue siendo función pura de (semilla, configuración, tiempo).
- **Tipos de vehículo:** moto, auto, camioneta y camión, cada uno con su largo, su ancho y su contorno de choque. Se mezclan en una proporción fija. En este cambio se dibujan con siluetas simples de su medida. La ilustración detallada, con la estética de la vista previa, va en otro cambio, diseñado con Fable 5.2.
- **La irregularidad vuelve a su idea original:** que no haya una posición lateral segura por suerte. Regula cuánto zigzaguea cada vehículo dentro de su carril (lento, sin salir nunca del carril) y cuán desparejos son los huecos dentro de cada carril. Con 0 %, los vehículos van centrados, sin zigzag y con huecos parejos.
- **BREAKING (garantía):** "Tráfico siempre superable" pasa a ser **"nunca te encierran"**:
  - ir detrás de un vehículo de tu carril, a su velocidad, es siempre seguro;
  - todo muro (todos los carriles tapados a la vez) se abre solo en 7 segundos o menos.

  A veces hay que esperar el hueco, y eso es algo nuevo que la red puede aprender.
- **Cuentas que suponían 10 m/s para todos:**
  - la ventaja sobre el tráfico se mide contra el carril más rápido (10 m/s, el mismo número de hoy);
  - "eliminar a los lentos" toma el carril más lento como piso, para no castigar a quien espera el hueco;
  - los vehículos superados se cuentan uno por uno, con su largo y su velocidad;
  - el cambio de configuración en marcha conserva el tráfico cercano carril por carril.
- **Medición de encierros**, pedida por el dueño: cuántos muros hay por kilómetro, cuánto duran y cuánto chocan los programas y cerebros de ejemplo, antes y después. Con eso el dueño decide si seguimos con velocidades distintas o volvemos a una sola velocidad (plan B en el diseño).
- Se revisan, y donde haga falta se vuelven a medir o entrenar, los programas de ejemplo de Reglas, las misiones y los cerebros de ejemplo, que dependen del tráfico de hoy.

## Filtro de entrada

Para el tráfico nuevo, que es lo único visible para la persona:

1. **¿Qué concepto hace visible?** La generalización. Con un tráfico que no se repite, una red que memorizó choca y una que mira, no.
2. **¿Se entiende sin que nadie lo explique?** Sí. Es una calle con motos, autos y camiones que van a distinto ritmo por carril. No hay controles nuevos, y el tooltip de la irregularidad pasa a decir qué hace ahora.
3. **¿El mentor puede ignorarla u ocultarla?** No hay nada que ocultar: es el mundo de la simulación. El mentor sigue regulando densidad e irregularidad como hoy.
4. **¿Qué pasa si se usa mal, y cómo se vuelve atrás?** Con densidad alta y 2 carriles hay más muros, pero ninguno encierra para siempre. "Restablecer" vuelve a los valores por defecto y "Tráfico nuevo" sortea otro.

**Público:** sirve a los dos. Al principiante le da un mundo más vivo y menos aburrido. Al mentor le permite mostrar la diferencia entre memorizar y generalizar sin preparar nada. No suma controles ni texto, así que no entorpece a ninguno.

## Fuera de alcance

- La ilustración de los autos con la estética de la vista previa (`assets/og-image.png`), para el auto propio y el tráfico. Va en un cambio aparte de diseño, con Fable 5.2 medium, que parte de las medidas que fija este.
- El plan B (todos a la misma velocidad, sin filas, con un pasillo tallado). Se describe en el diseño, pero solo se hace si el dueño lo decide después de ver la medición de encierros.
- Vehículos que cambian de carril, frenan o se siguen entre sí. Cada carril va a velocidad constante.
- Tráfico en los circuitos: siguen sin tráfico.
- Un ajuste para elegir la mezcla de vehículos o las velocidades de los carriles.
- Verificar que la población aprende con el tráfico nuevo (*Aprendizaje con los valores por defecto*). Lo mide el dueño.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `trafico`:
  - corrientes por carril a velocidades distintas, en lugar de grupos;
  - tipos de vehículo;
  - irregularidad como zigzag y huecos desparejos;
  - "nunca te encierran" en lugar de "siempre superable";
  - cambio en marcha por carril;
  - movimiento a la velocidad de cada carril.
- `neuroevolucion`:
  - ventaja sobre el tráfico medida contra el carril más rápido;
  - "eliminar a los lentos" con el carril más lento como piso;
  - vehículos superados contados por vehículo;
  - el estado por defecto del entrenamiento, que hoy habla de filas alineadas.
- `pestana-conducir`: los vehículos superados se cuentan con el largo de cada vehículo.
- `pestana-reglas` (sumado durante la implementación, con el dueño): con carriles a distinto ritmo, el ejemplo de tres sensores supera a los de los carriles lentos; cambian "Tres sensores cortos" y los dos "Frenar no alcanza", y la pestaña pasa a la semilla 516.

## Impact

- **Núcleo:**
  - `src/core/traffic.js` (reescritura del generador);
  - `src/core/constants.js` (velocidades de carril, tipos y huecos);
  - `src/core/world.js` (frontera del cambio en marcha por carril; las distancias de choque y de sensores suponen hoy un largo de 4 m);
  - `src/core/training.js` y `src/core/evolution.js` (ventaja, lentos y superados);
  - `src/core/race.js` (reaparición entre vehículos de largos distintos).
- **Pantalla:** `src/render/view.js` y `src/v2/render/glow.js` (dibujo por tipo y medida); `src/tabs/shared/attempt.js` (superados con el largo de cada vehículo).
- **Textos:** los tooltips de irregularidad en `src/i18n/` y `src/v2/i18n/`, en español y en inglés.
- **Datos:** `src/data/example-brains.js`, que puede haber que volver a entrenar con `tools/train-examples.mjs`. Los programas de ejemplo de Reglas y las metas de las misiones (`src/ui/mission-targets.js`) se vuelven a medir.
- **Pruebas:** `tests/traffic.test.js` se reescribe. Hay que ajustar las que suponen filas o 10 m/s: `training-passed`, `world*`, `race`, `rules-examples`, `mission-targets` y `reproducibility`, entre otras.
- **Herramientas:** una medición de encierros nueva en `tools/`. `tools/bench.mjs` para la fluidez.
- **Cerebros guardados de las personas:** siguen cargando, porque la red no cambia. Pero se entrenaron con el tráfico viejo y van a manejar peor. No se migran.
