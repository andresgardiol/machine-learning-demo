# Design

## Context

Lo que sigue lo medí el 18 de noviembre de 2026 en el navegador de la app, a 1440×900, con la guía encendida, sobre `c946255`.

- **El tablero** (`src/tabs/train/index.js`, alrededor de la línea 680) arma `board.append(strip.node, lastLine, chartCard.node, networkCard.node)`. Las dos tarjetas son `boardCard` con `--grow` 1 (curva) y 1,3 (red), y su estado de plegado está en `state.settings.showChart` y `showNetwork`.
- **La vista de entrenamiento del panel** es `.train-training`. Su contenido mide 865 px en 739 visibles; sobran 126 px. Lo que ocupa:

| Bloque | Alto |
|---|---|
| Tarjeta de consigna, con la marcha y la misión en curso | 307 px |
| Más sobre esta pestaña | 32 px |
| Interruptores | 32 px |
| Población y mutación | 158 px |
| Guardar campeón | 59 px |
| Misiones (`.train-missions`, título y cuatro renglones) | 165 px |

## Goals / Non-Goals

**Goals:**
- La red del líder es la primera tarjeta del tablero.
- La vista de entrenamiento entra sin desplazarse a 1440×900, en español y en inglés, también después de guardar.

**Non-Goals:**
- Que la red tenga más alto a 1366×768. Se mide y se anota.
- Tocar la disposición de las otras pestañas o el componente de misiones compartido.

## Decisions

### D1. La red primero, con el mismo crecimiento

El orden de `board.append` pasa a ser indicadores, la última generación, la red y la curva. Los `--grow` quedan como están (1,3 la red y 1 la curva), así cada una conserva el reparto de alto de hoy, y la red, que tiene más para mostrar, sigue llevándose más. El plegado ya funciona por tarjeta. Al plegar una, la otra crece por flex, sin código nuevo.

*Alternativa descartada:* darle a la red un alto fijo arriba. A 1366×768 le quitaría a la curva su mínimo.

### D2. Plegar la lista de misiones (elegida por Claude, con los costos a la vista)

Hacen falta 126 px. Estas fueron las opciones:

| Opción | Ahorra | Costo |
|---|---|---|
| **A. Compactar** (márgenes, Guardar campeón de 59 a 32 px, interruptores al lado de "Más sobre esta pestaña") | unos 60 px | No alcanza. Choca con las alturas del sistema y es frágil ante el inglés. |
| **B. Sacar Guardar campeón** de la vista de entrenamiento | unos 75 px | No alcanza. Contradice *Guardar el campeón* ("la vista de entrenamiento SHALL ofrecer un solo botón"), y la misión "Guardá un cerebro" pierde su control a la vista. |
| **C. Lista de misiones plegada** en un renglón "Todas las misiones · 1 de 4" | unos 130 px (de 165 a un renglón de 32) | Ajustado. Las misiones que vienen dejan de verse sin un toque, pero la misión en curso ya está en la tarjeta de consigna, con barra y "Mostrame". |

Elegí **C**. Es la única que alcanza sin tocar otras specs, y la información que más importa (la misión en curso) ya se ve en la tarjeta. El renglón usa el mismo patrón plegable que "Más sobre esta pestaña" (el mismo componente o sus estilos, con el triángulo y `aria-expanded`), para no sumar un control nuevo. El estado abierto o cerrado va en `state.settings.showMissions`, como `showChart` y `showNetwork`. Por defecto queda plegado.

La lista desplegada sigue marcando la misión en curso también con algo que no es el color, como hoy. El "Mostrame" sigue solo en la tarjeta.

*Si con C no alcanza* (por ejemplo, en inglés o después de guardar), la tarea 3.3 para y consulta. Ese caso no se resuelve sumando A a escondidas.

### D3. Capturas del antes y del después

Se copia `borradores/sistema-de-diseno/capturar.mjs` a `borradores/entrenar-red-primero/`, con estas vistas:

| Vista | Tamaños |
|---|---|
| Entrenar al abrir | 1440×900 y 1366×768 |
| Entrenar tras la primera generación | 1440×900 y 1366×768 |
| Entrenar con la red plegada | 1440×900 |
| Entrenar después de guardar, en inglés | 1440×900 |

Cada captura guarda estas medidas:
- el desborde del panel y del tablero (`scrollHeight − clientHeight`);
- la posición de las dos tarjetas;
- el alto del lienzo de la red y del de la curva.

El antes se saca sobre el commit de partida, sin cambios en `src/` ni en `styles/`.

## Risks / Trade-offs

- [El ahorro de C es justo: unos 130 px contra 126.] → La tarea 3.3 mide en los dos idiomas y después de guardar. Si no alcanza, para y consulta.
- [A 1366×768 el tablero ya desborda 44 px (691 en 647). Con la red primero, lo que queda cortado abajo pasa a ser la curva.] → Se mide y se anota. Lo resuelve `entrenar-mesa-de-trabajo`. No hay spec de la curva a 1366.
- [Quien busque las misiones que vienen no las ve sin un toque.] → El renglón dice cuántas van, y la tarjeta muestra la siguiente cuando se cumple una.
- Rendimiento: no cambia el bucle de simulación ni el de dibujo. Solo cambia el orden del DOM y un plegable.
