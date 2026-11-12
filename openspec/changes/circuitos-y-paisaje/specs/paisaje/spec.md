# Spec Delta

## Purpose

Rodea la pista con un entorno que da escala, sensación de velocidad y
contexto, para que el escenario se lea mejor y cada pista se reconozca a
simple vista. Es solo dibujo: no forma parte de la simulación.

## ADDED Requirements

### Requirement: Paisaje de la calle
Alrededor de la calle recta, la vista SHALL dibujar pasto, árboles y
vegetación, una vereda a cada lado de la calle y, cada tanto, una senda
peatonal pintada sobre la calzada. El paisaje MUST seguir a lo largo de toda
la calle, sin terminarse ni repetirse a la vista.

#### Scenario: Estado por defecto
- **WHEN** se abre El problema sin configurar nada
- **THEN** a los costados de la calle se ven las veredas, el pasto y árboles, en lugar del fondo vacío

#### Scenario: Calle larga
- **WHEN** el auto recorre 2000 metros de calle
- **THEN** sigue habiendo paisaje a los dos lados y no se nota un tramo que se repita

### Requirement: Paisaje de los circuitos
Alrededor de un circuito, la vista SHALL dibujar pasto, árboles, tribunas
junto a la recta de salida, pianitos en las curvas y la línea de largada a
cuadros. Las tribunas y los pianitos de un circuito SHALL estar siempre en el
mismo lugar.

#### Scenario: Recta de salida
- **WHEN** se muestra la recta de salida del óvalo
- **THEN** se ven la línea de largada a cuadros y una tribuna a un costado, fuera de la pista

#### Scenario: Curva
- **WHEN** se muestra una curva de cualquier circuito
- **THEN** sus bordes llevan pianitos de dos colores alternados

### Requirement: Paisaje solo estético
El paisaje MUST NOT cambiar la simulación: no choca, los sensores no lo ven y
no ocupa la calzada. Ningún elemento del paisaje, salvo las sendas peatonales
y la línea de largada, que van pintadas sobre el piso, MUST dibujarse sobre la
pista, ni tapar a un auto, a un vehículo o a un rayo de los sensores.

#### Scenario: Misma simulación
- **WHEN** se repite una corrida con el paisaje encendido y con el paisaje apagado
- **THEN** el estado del mundo es idéntico paso a paso

#### Scenario: Sensores ciegos al paisaje
- **WHEN** un rayo de los sensores pasa por encima de un árbol o de una tribuna
- **THEN** su lectura es la misma que si no estuvieran

#### Scenario: Pista despejada
- **WHEN** se muestra cualquier tramo de cualquier pista
- **THEN** ningún árbol, tribuna ni vereda queda sobre la calzada ni sobre un auto

### Requirement: Paisaje reproducible
El paisaje SHALL generarse a partir de la pista y de una semilla, sin azar
propio del navegador: la misma pista con la misma semilla MUST verse igual
cada vez, también después de reiniciar el intento o de recargar la página.

#### Scenario: Reinicio
- **WHEN** la persona reinicia el intento
- **THEN** los árboles y las sendas están en los mismos lugares que antes

#### Scenario: Tráfico nuevo
- **WHEN** la persona pide tráfico nuevo en la calle recta
- **THEN** el paisaje puede cambiar junto con el tráfico, y vuelve a ser el mismo si se vuelve a esa semilla

### Requirement: Colores del paisaje
Los colores del paisaje SHALL ser apagados y distintos de los del auto, el
tráfico, los sensores, los bordes y las líneas de carril, de modo que esos
elementos sigan distinguiéndose a simple vista sobre cualquier parte del
paisaje.

#### Scenario: Auto sobre el pasto
- **WHEN** un auto chocado queda contra el borde, con pasto detrás
- **THEN** el auto, su marca de choque y el borde se distinguen del pasto sin esfuerzo

#### Scenario: Rayos sobre el paisaje
- **WHEN** los rayos de los sensores se extienden por fuera de la pista
- **THEN** se ven completos sobre el pasto, las veredas y los pianitos

### Requirement: Mostrar u ocultar el paisaje
La vista SHALL ofrecer, junto a los controles de cámara, un interruptor
"Paisaje", encendido por defecto, que muestra u oculta el paisaje en todas
las pestañas y cuyo estado se recuerda entre visitas. El paisaje MUST
ocultarse también en "ver como la máquina". El interruptor SHALL tener un
tooltip que diga qué hace y por qué importa, en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la aplicación por primera vez
- **THEN** el interruptor está encendido y el paisaje se ve

#### Scenario: Apagar el paisaje
- **WHEN** la persona apaga el interruptor
- **THEN** el escenario vuelve a mostrar solo la pista sobre el fondo, en esa pestaña y en las demás

#### Scenario: Volver a encenderlo
- **WHEN** la persona vuelve a encender el interruptor
- **THEN** el paisaje reaparece igual que antes, sin reiniciar nada

#### Scenario: Preferencia recordada
- **WHEN** la persona apaga el paisaje y recarga la página
- **THEN** el paisaje sigue apagado

#### Scenario: Ver como la máquina
- **WHEN** la persona activa "ver como la máquina" con el paisaje encendido
- **THEN** el paisaje no se dibuja, igual que la pista y el tráfico

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre el interruptor
- **THEN** un tooltip en el idioma activo explica que muestra u oculta el entorno y que es solo dibujo: el auto no lo percibe

### Requirement: Paisaje fluido
Con el paisaje encendido, la vista SHALL cumplir los mismos mínimos de fluidez
que sin él, dibujando solo lo que cae dentro del encuadre.

#### Scenario: Calle con paisaje
- **WHEN** se mide la tasa de cuadros durante diez segundos de manejo en la calle recta con el paisaje encendido
- **THEN** el promedio es de al menos 55 cuadros por segundo

#### Scenario: Población con paisaje
- **WHEN** se mide la tasa de cuadros durante diez segundos con una población de 100 autos en la calle recta, a velocidad normal y con el paisaje encendido
- **THEN** el promedio es de al menos 50 cuadros por segundo
