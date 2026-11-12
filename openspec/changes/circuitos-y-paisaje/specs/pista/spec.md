# Spec Delta

## ADDED Requirements

### Requirement: Pista cerrada
Una pista SHALL poder ser cerrada: su línea central vuelve al punto de
partida y sus dos bordes son contornos cerrados, sin principio ni fin. La
línea de salida está en la distancia 0 y el sentido de avance es el de la
línea central. El largo de una pista cerrada es el de una vuelta.

#### Scenario: Bordes sin extremos
- **WHEN** se arma una pista cerrada
- **THEN** cada borde es un contorno cerrado y no hay ningún punto de la pista por donde un auto pueda salir sin cruzar un borde

#### Scenario: Posición después de una vuelta
- **WHEN** se pide el centro de la pista a una distancia igual al largo de una vuelta más 10 metros
- **THEN** es el mismo punto y la misma orientación que a 10 metros de la salida

#### Scenario: Pista abierta sin cambios
- **WHEN** se arma la calle recta
- **THEN** se comporta igual que antes: tiene principio y fin y no da vueltas

### Requirement: Progreso por vueltas
En una pista cerrada, el progreso de un auto SHALL acumularse vuelta tras
vuelta: al cruzar la línea de salida hacia adelante sigue creciendo, sin
volver a cero, y al cruzarla hacia atrás sigue bajando. Las vueltas de un
auto son su progreso dividido por el largo de una vuelta.

#### Scenario: Cruce de la salida hacia adelante
- **WHEN** un auto recorre una vuelta entera de un circuito de 600 metros y avanza 20 metros más
- **THEN** su progreso es de 620 metros

#### Scenario: Sentido contrario
- **WHEN** un auto sale de la línea de salida y retrocede 30 metros
- **THEN** su progreso es de -30 metros

#### Scenario: Progreso sin saltos
- **WHEN** un auto cruza la línea de salida en cualquiera de los dos sentidos
- **THEN** su progreso cambia entre un paso y el siguiente lo mismo que avanzó, sin saltar el largo de una vuelta

### Requirement: Catálogo de circuitos
Además de la calle recta, el sistema SHALL ofrecer tres circuitos cerrados,
siempre los mismos: el óvalo (dos rectas y dos curvas amplias, de 500 a 700
metros), el riñón (curvas hacia los dos lados y una chicana, de 800 a 1000
metros) y el gran premio (el más largo, de 1400 a 1800 metros, con al menos
ocho curvas hacia los dos lados, una horquilla, una sección de eses y una
recta de al menos 250 metros). Ninguno se cruza consigo mismo.

#### Scenario: Cuatro pistas
- **WHEN** se piden las pistas disponibles
- **THEN** son la calle recta, el óvalo, el riñón y el gran premio, en ese orden

#### Scenario: Circuito repetible
- **WHEN** se arma dos veces el mismo circuito
- **THEN** las dos pistas tienen exactamente los mismos puntos

#### Scenario: Pista desconocida
- **WHEN** se pide una pista que no está en el catálogo
- **THEN** el pedido se rechaza con un error que nombra las pistas disponibles

### Requirement: Circuitos manejables
Todo circuito del catálogo SHALL tener 12 metros de ancho, curvas con un radio
de al menos 25 metros sobre la línea central, al menos 30 metros entre las
líneas centrales de dos tramos que no son vecinos, y la línea de salida en una
recta de al menos 80 metros. No tiene carriles marcados.

#### Scenario: Vuelta por el centro
- **WHEN** un auto sigue la línea central de cada circuito a la velocidad máxima por defecto
- **THEN** completa una vuelta de cada uno sin tocar los bordes

#### Scenario: Tramos separados
- **WHEN** se mide la distancia entre los bordes de dos tramos no vecinos de cualquier circuito
- **THEN** es de al menos 18 metros
