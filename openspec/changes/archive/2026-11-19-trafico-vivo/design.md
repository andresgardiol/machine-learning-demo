# Design

## Context

El motivo está en proposal.md (*Why*). Lo que sigue describe el código actual (leído, sin correr) y las restricciones que dan forma al enfoque.

- **El generador** (`src/core/traffic.js`) es una función pura de (semilla, número de grupo, tiempo). Cada grupo es una fila con un vehículo en algunos carriles. Las separaciones entre grupos se sortean por bloques de 16 grupos, para calcular cualquier grupo sin recorrer los anteriores. Todo se desplaza a `TRAFFIC_SPEED` = 10 m/s: `distancia(t) = distancia(0) + 10·t`.
- **Todos los vehículos miden 4 × 2 m**, y varios lugares lo suponen:
  - `world.js` busca choques a menos de `CAR_LENGTH * 1.5` del centro del vehículo, y solo le pasa a los sensores los vehículos a menos de `alcance + CAR_LENGTH`;
  - `traffic.vehicles()` y `changeTraffic()` amplían las ventanas en un `CAR_LENGTH`;
  - `attempt.js` (`relativePosition`) usa el largo del auto para el vehículo.
- **10 m/s está metido en varias cuentas:**
  - la ventaja (`recordStep(..., TRAFFIC_SPEED * t)`);
  - "eliminar a los lentos" (`SLOW_LIMIT = TRAFFIC_SPEED * 5`);
  - la lista de vehículos que se pueden superar (`trafficStarts`, armada una vez por generación como distancias en el instante 0);
  - la frontera del cambio en marcha (`world.setTraffic`: `progreso + 20 − 10·t`).
- **Restricciones:**
  - núcleo sin DOM y determinista (Art. 8): misma semilla, mismo tráfico, en todo momento y aunque cambie la configuración en marcha;
  - fluidez con 500 autos en Entrenar (Art. 10);
  - la velocidad máxima del auto se puede bajar a 12 m/s (`SPEED_LIMITS.min`);
  - los circuitos no tienen tráfico: `world.js` fuerza la densidad 0 en pistas cerradas.

## Goals / Non-Goals

**Goals:**
- Un generador por carril, puro y con acceso directo a cualquier vehículo, igual que hoy con los grupos.
- Garantías que se puedan probar con el generador solo, sin simular autos: "seguir en tu carril es seguro" y "ningún muro dura más de 7 s".
- Que las cuentas de entrenamiento conserven sus números de hoy donde se pueda. La ventaja sigue contra 10 m/s.
- Dejar medido lo que el dueño necesita para decidir entre velocidades distintas o una sola.

**Non-Goals:**
- El dibujo final de los vehículos. Acá se dibuja una silueta provisoria de la medida justa.
- Simulación de tráfico con estado (frenar, seguir, cambiar de carril).
- Una garantía de "camino libre sin esperar" con velocidades distintas: no existe (proposal, *REMOVED*).

## Decisions

### D1. Una corriente pura por carril

El vehículo `j` del carril `i` tiene una distancia de base `b_ij`, que es su posición en el instante 0, y avanza a la velocidad del carril:

```
  posicion_ij(t) = b_ij + v_i * t        (sobre la linea central)

  carril 0 (v=8):  [moto]----hueco----[auto]------hueco------[camion====]--...
  carril 1 (v=6):  ----[camioneta]--------hueco--------[auto]--hueco--[auto]...
  carril 2 (v=10): ------[auto]---hueco---[camion====]----hueco------[moto]...
```

- **Bloques por carril.** Cada carril se arma por bloques de K vehículos, como hoy los grupos, con su propio espacio de semillas (`deriveSeed(seed, LANE_STREAM + i)`). Así cualquier vehículo sale de la semilla sin recorrer los anteriores, y `vehicles(t, from, to)` consulta en cada carril la ventana `[from − v_i·t, to − v_i·t]` en el marco de ese carril.
- **Cada vehículo ocupa una casilla**: su largo más el hueco que lo sigue. La suma de las casillas de un bloque es el largo fijo del bloque, así que el hueco del último vehículo también respeta el mínimo.
- **Las velocidades dependen solo de la semilla y de la cantidad de carriles**, nunca de la densidad ni de la irregularidad. Por eso el marco de cada carril es el mismo antes y después de un cambio en marcha (D8).
- **Alternativas descartadas:**
  - velocidad por vehículo con lógica de seguimiento: pierde la función pura, cuesta más por cuadro y complica el cambio en marcha;
  - mantener las filas con más desorden: sigue siendo un bloque rígido, y el dueño no quiere filas.

### D2. Velocidades de 6 a 10 m/s, y por qué 10 arriba

- **Repartidas parejas en [6, 10] m/s**:
  - 2 carriles: 6 y 10 m/s;
  - 3 carriles: 6, 8 y 10 m/s;
  - 4 carriles: 6; 7,33; 8,67 y 10 m/s.

  La semilla las asigna a los carriles con una permutación (`deriveSeed(seed, SPEED_STREAM)`).
- **10 arriba** conserva el número de referencia de hoy. La ventaja se mide contra el carril más rápido (D7) y "seguir al tráfico no suma" vale para cualquier carril. Todas quedan por debajo del tope mínimo del auto (12 m/s).
- **6 abajo** hace que la diferencia se vea (40 m en 10 s entre el más lento y el más rápido) sin que el carril lento parezca detenido.
- **La cota de los muros sale de acá.** Un muro necesita a la vez un vehículo del carril más lento y uno del más rápido, cada uno a menos de medio largo de auto (2 m) del mismo punto. Entonces sus centros están a menos de `(L_a + L_b)/2 + 4` m, y eso dura como mucho `(L_a + L_b + 8) / (10 − 6)` s. Con camiones de 10 m: `(10 + 10 + 8) / 4 = 7 s`. La cota no depende de la cantidad de carriles ni de la densidad, porque siempre están los dos carriles extremos.
- **Restricción que se desprende:** ningún vehículo puede medir más de 10 m. Si el diseño visual pide camiones más largos, la cota sube y hay que cambiar la spec.
- **Alternativa:** un rango más chico, por ejemplo de 8 a 10. El tráfico se ve menos vivo y los muros duran más (la cota sería 14 s).

### D3. Tipos y medidas (tentativas)

| Tipo | Largo × ancho (m) | Proporción |
|---|---|---|
| moto | 2,2 × 0,9 | 15 % |
| auto | 4 × 2 (como hoy) | 50 % |
| camioneta | 5,2 × 2,2 | 20 % |
| camión | 10 × 2,5 | 15 % |

- Van en una tabla congelada en `constants.js`. Cada vehículo que devuelve `vehicles()` suma `type`, `length` y `width`, y su `contour` sale de esas medidas.
- El auto del conductor sigue en 4 × 2.
- Son hipótesis para ajustar cuando se vea andando. El cambio de diseño visual puede ajustarlas, siempre dentro de la cota de D2.

### D4. Densidad → separación por carril

Para que una densidad dada ponga más o menos la misma cantidad de vehículos por kilómetro que hoy, la casilla media de un carril es:

```
  casilla_media(d, carriles) = carriles * separacion_de_grupos(d) / vehiculos_por_grupo(d, carriles)
```

Usa las funciones de hoy (`groupSpacing` y `1 + f·(carriles − 2)`). Con 3 carriles da unos 145 m al 25 %, 88 m al 50 % y 36 m al 100 %.

- **Hueco mínimo:** 4 largos de auto (16 m) de paragolpes a paragolpes, como el mínimo entre grupos de hoy.
- **El sobrante se reparte con pesos.** En cada bloque, lo que sobra después de largos y mínimos se reparte entre las casillas con pesos que van de parejos (irregularidad 0) a exponenciales normalizados (100 %), la misma técnica de hoy.
- **Si a densidad máxima no sobra nada**, por ejemplo con muchos camiones en un bloque, el sobrante queda en 0: ese bloque sale más corto y con huecos mínimos. La densidad satura, pero el hueco mínimo nunca se rompe.

### D5. Zigzag: la irregularidad como idea original

```
  lateral_ij(t) = A * sin(2*pi * t / P + phi)
  A = r * max(0, ancho_carril/2 - 0,1 - (W/2)*cos(6 grados) - (L/2)*sin(6 grados))
  P sorteado en [6, 10] s y phi en [0, 2*pi), por vehiculo
  giro = recortado a +-6 grados, atan(velocidad_lateral / v_carril)
```

- `r` es la irregularidad de 0 a 1.
- **A se calcula para el peor giro (6°).** Así el contorno girado nunca sale del carril (spec *Seguir en tu carril es seguro*). Con 100 %, una moto se aparta unos 1,3 m, un auto 0,7 m y un camión apenas 0,13 m, como un camión de verdad.
- **El truco de ir sobre la línea se rompe.** Con 50 %, un auto se aparta hasta 0,35 m. Su borde llega a 0,65 m de la línea, y nuestro auto, sobre la línea, ocupa 1 m de cada lado. Un camión centrado ya deja solo 0,75 m.
- **Vaivén lento**, con períodos de 6 a 10 s, para que se vea como manejo y no como temblor.
- **El giro hace que el contorno no sea un rectángulo alineado.** Sensores y choques ya trabajan con polígonos (`rectCorners` con ángulo), así que no cambia nada.
- **Alternativa:** desvío fijo de costado, como hoy. Se descarta porque deja posiciones seguras por suerte durante todo el cruce.

### D6. Cómo se prueban las garantías

- **Seguir en tu carril es seguro.** Sale de dos cosas: misma velocidad dentro del carril y ningún contorno fuera de él. Se prueba simulando un auto que sigue al vehículo de adelante a la velocidad del carril, y con un barrido de contornos contra los bordes del carril.
- **Ningún muro encierra.** Se prueba sobre el generador solo:
  - en el marco del carril más lento, los vehículos del más rápido se acercan a 4 m/s;
  - para cada par lento-rápido que llega a menos de la distancia de D2, se calcula el intervalo en que los dos tapan;
  - se cruza con los demás carriles y se mide la duración de cada muro.

  Es exacto, porque todo es lineal salvo el zigzag, que no cambia la ocupación a lo largo. Además es rápido para mil semillas y diez kilómetros.
- **La prueba unitaria** corre una muestra de semillas. La herramienta de medición (D10) corre las mil.

### D7. Cuentas del entrenamiento

- **El tráfico expone** `fastestSpeed` (10) y `slowestSpeed` (6).
- **Ventaja:** `recordStep(stats, agent, fastestSpeed * t)`. Es el mismo número de hoy.
- **Eliminar a los lentos:** `SLOW_LIMIT = slowestSpeed * 5` (30 m). Quien espera un hueco siguiendo a un vehículo no sale de carrera. Quien no avanza, sí.
- **Superados:**
  - al empezar la generación se arma, por carril, la lista ordenada de `b + L/2` (el frente de cada vehículo en el instante 0) de los que empiezan delante del auto, hasta un alcance de `(maxSpeed − slowestSpeed) · maxDuration + Lmax`;
  - en cada paso, los que están enteros detrás son `Σ_carril #{ b + L/2 < progreso − CAR_LENGTH/2 − v_i·t }`, con una búsqueda binaria por carril;
  - la cuenta es el máximo a lo largo de la generación.

  Cuesta carriles × log n por agente y por paso: con 500 agentes, unas 1.500 búsquedas binarias por paso.
- **Alternativa:** mantener "en el momento de la mayor ventaja". Con carriles a distinto ritmo puede bajar, y la spec exige que no baje.

### D8. Cambio en marcha por carril

`changeTraffic` pasa a cortar cada carril en su propio marco:
- la frontera del carril `i` es `progreso + TRAFFIC_CHANGE_AHEAD − v_i·t`;
- la capa nueva de ese carril empieza `16 m + Lmax` más adelante.

Como las velocidades no dependen de densidad ni de irregularidad (D1), las dos capas de un carril comparten marco y la unión respeta el hueco mínimo. Cambiar la cantidad de carriles no es un cambio en marcha: cambia la pista y reinicia, como hoy.

### D9. Lugares que suponían 4 m

- **`world.js`:**
  - el umbral de choque pasa a `(CAR_LENGTH + v.length)/2 + 1`;
  - la ventana de sensores, a `alcance + v.length/2`;
  - el radio de la consulta compartida suma `Lmax/2`.
- **`traffic.vehicles()` y `changeTraffic()`:** amplían con `Lmax`.
- **`attempt.js`:** `relativePosition` recibe el largo del vehículo.
- **`race.js`:** la reaparición ya usa el contorno real (`contoursTouch`). Solo se revisa que el retroceso de 2 largos no la deje dentro de un camión.

### D10. Medición de encierros (pedido del dueño)

La herramienta es `tools/measure-walls.mjs`. Todo es inferencia o geometría, sin entrenar redes:
- **Muros:** por kilómetro, duración media y máxima, para 2, 3 y 4 carriles, densidades de 25, 50, 75 y 100 % e irregularidades de 0, 50 y 100 %, con mil semillas y diez kilómetros.
- **Programas y cerebros de ejemplo:** se manejan en 10 tráficos nuevos y se cuentan choques, vehículos superados y choques dentro de un muro. Se hace con el tráfico de hoy (en una copia del commit de partida) y con el nuevo.
- **Salida:** `borradores/trafico-vivo/encierros.md`, con lo medido rotulado como medido.

Es un punto de "detenerse y consultar": con esa tabla, el dueño decide si se sigue o se pasa al plan B (D11).

### D11. Plan B: una sola velocidad y un pasillo tallado (no se implementa)

Si los encierros molestan, el generador se cambia así:
- todos los carriles a 10 m/s;
- la misma corriente por carril y los mismos tipos, zigzag y huecos;
- un **pasillo tallado**: antes de ubicar vehículos se sortea un recorrido libre que cambia de carril con al menos 4 largos entre cambios, y los vehículos que lo pisan se descartan.

Con todo quieto en el marco del tráfico, la garantía de camino libre sin esperar vuelve a ser geométrica. Para que el cambio sea barato, la tabla de velocidades vive en una sola función del generador, y nada fuera de `traffic.js` supone velocidades distintas: todo se pide a `fastestSpeed`, `slowestSpeed` y a la velocidad de cada vehículo.

### D12. Dibujo provisorio

- `drawVehicle` (V1, `src/render/view.js`) y su par en V2 (`src/v2/render/glow.js`) reciben largo y ancho, y dibujan la silueta de hoy escalada a la medida de cada tipo:
  - la moto, sin luneta y con un solo faro;
  - el camión, con una cabina marcada.
- Siempre dentro del contorno de choque y con el color de tráfico de siempre.
- La ilustración final, con capas que se puedan recolorear y la estética de la vista previa, la hace el próximo cambio con Fable 5.2 medium.

## Risks / Trade-offs

- **[Con 2 carriles y densidad alta, muros seguidos]** → Duran 7 s o menos (D2), y la medición (D10) muestra cuántos hay antes de seguir. El plan B está listo (D11).
- **[Los cerebros guardados de las personas y los de ejemplo se entrenaron con el tráfico viejo]** → Los de ejemplo se vuelven a entrenar con `tools/train-examples.mjs`, que comprueba sus contrastes, después de la decisión de D10. Los de las personas siguen cargando, pero manejan peor; no se migran. Se avisa en `PENDIENTES.md`.
- **[El aprendizaje por defecto puede empeorar o mejorar]** → No se verifica en este cambio: lo mide el dueño (*Aprendizaje con los valores por defecto*). Si hace falta, se ajusta en otro cambio.
- **[Fluidez]** → Por cuadro, la consulta por carril cuesta lo mismo que por grupo. Se suma un `sin` y un `atan` por vehículo visible y una búsqueda binaria por carril y por agente para los superados. Se mide con `tools/bench.mjs` antes y después. Se espera que no se note.
- **[`Math.sin` puede diferir en el último bit entre navegadores]** → El núcleo ya usa trigonometría (los ángulos del auto, los circuitos), así que el riesgo no es nuevo. La reproducibilidad se prueba dentro de un mismo motor, como hoy.
- **[Muchas pruebas suponen filas o 10 m/s]** → Se reescriben junto con el generador. Las que medían comportamiento de entrenamiento no se vuelven a correr acá (memoria del dueño: no entrenar para verificar).
- **[Un rayo puede pasar entre dos sin ver una moto]** → Es así y enseña algo: más sensores, mejor percepción. Se anota en el informe si aparece en la medición.

## Migration Plan

- **Sin datos que migrar.** Los cerebros guardan la red y los sensores, no el tráfico. Las descripciones de escenario de la biblioteca ("densidad, irregularidad") siguen valiendo.
- **Una instantánea vieja guardada en memoria** se descarta al recargar, porque no persiste.
- **Vuelta atrás:** revertir el cambio vuelve todo al generador de filas. El plan B (D11) es la alternativa intermedia.

## Open Questions

- La proporción y las medidas exactas de cada tipo (D3). Se pueden ajustar viendo el tráfico andando o en el cambio de diseño visual, dentro de la cota de D2, sin tocar el enfoque.
