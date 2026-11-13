# pista Specification

## Purpose

Describe por dónde se puede circular: una pista definida por su línea central,
su ancho y sus carriles, con bordes que la delimitan y una medida de cuánto se
avanzó sobre ella. Es la misma representación para la calle recta y para los
circuitos que lleguen después.

## Requirements

### Requirement: Pista definida por línea central, ancho y carriles
Una pista SHALL quedar definida por una línea central, un ancho total y una
cantidad de carriles de igual ancho. Toda pista, recta o con curvas, MUST usar
esta misma definición.

#### Scenario: Carriles de igual ancho
- **WHEN** se crea una pista de tres carriles
- **THEN** la pista tiene tres carriles contiguos del mismo ancho que juntos ocupan el ancho total

### Requirement: Calle recta de 2, 3 o 4 carriles
El sistema SHALL ofrecer una calle recta con 2, 3 o 4 carriles, lo bastante
larga como para no alcanzar su final durante el uso normal, y SHALL usar 3
carriles cuando no se indica una cantidad.

#### Scenario: Valor por defecto
- **WHEN** se crea la calle recta sin indicar la cantidad de carriles
- **THEN** la calle tiene tres carriles

#### Scenario: Cantidad no admitida
- **WHEN** se pide una calle recta con una cantidad de carriles distinta de 2, 3 o 4
- **THEN** la calle no se crea y se informa cuáles son las cantidades admitidas

#### Scenario: Calle detrás de la salida
- **WHEN** el auto retrocede desde la línea de salida de la calle recta
- **THEN** sigue habiendo calle con sus bordes detrás de él y su progreso es negativo

### Requirement: Bordes de la pista
La pista SHALL exponer un borde izquierdo y uno derecho, paralelos a la línea
central y separados de ella por la mitad del ancho total, que delimitan la zona
transitable.

#### Scenario: Bordes en la calle recta
- **WHEN** se consultan los bordes de una calle recta
- **THEN** cada borde corre paralelo a la línea central a una distancia igual a la mitad del ancho

#### Scenario: Bordes en una pista con curva
- **WHEN** se consultan los bordes de una pista abierta cuya línea central dobla
- **THEN** ambos bordes acompañan la curva de forma continua, sin huecos ni cruces entre tramos

### Requirement: Centro de carril
La pista SHALL informar la posición y la orientación del centro de cualquier
carril a una distancia dada sobre la línea central.

#### Scenario: Centro del carril del medio
- **WHEN** se consulta el centro del carril del medio de una calle recta de tres carriles
- **THEN** la posición coincide con la línea central

#### Scenario: Carril inexistente
- **WHEN** se consulta el centro de un carril que la pista no tiene
- **THEN** la consulta se rechaza indicando los carriles disponibles

### Requirement: Progreso sobre la pista
La pista SHALL medir el progreso de cualquier posición como la distancia
recorrida sobre la línea central desde el inicio, sin que los movimientos
laterales lo modifiquen.

#### Scenario: Avanzar aumenta el progreso
- **WHEN** un auto avanza diez metros en la dirección de la pista
- **THEN** su progreso aumenta diez metros

#### Scenario: Cambiar de carril no suma progreso
- **WHEN** un auto se desplaza de un carril a otro sin avanzar
- **THEN** su progreso no cambia

#### Scenario: Retroceder reduce el progreso
- **WHEN** un auto retrocede cinco metros
- **THEN** su progreso disminuye cinco metros

#### Scenario: Progreso a través de una curva
- **WHEN** un auto recorre una pista abierta con curva desde el inicio hasta el final siguiendo la línea central
- **THEN** su progreso final es igual al largo total de la línea central

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
siempre los mismos y de dificultad creciente: el óvalo (dos rectas y dos
curvas amplias, de 500 a 700 metros), el riñón (un óvalo con una entrante y
una chicana, de 650 a 800 metros) y el gran premio (alargado, de 1000 a 1300
metros, con una serie de eses, una horquilla, una curva larga, una recta de
al menos 150 metros y una chicana final). Ninguno se cruza consigo mismo.

#### Scenario: Cuatro pistas
- **WHEN** se piden las pistas disponibles
- **THEN** son la calle recta, el óvalo, el riñón y el gran premio, en ese orden

#### Scenario: Gran premio alargado
- **WHEN** se mide el recuadro que contiene al gran premio
- **THEN** su lado largo mide al menos el doble que su lado corto

#### Scenario: Eses del gran premio
- **WHEN** se recorre el gran premio desde la salida
- **THEN** después de la primera curva hay al menos seis curvas seguidas que alternan el sentido de giro, cada una de 45 grados o más, sin rectas de más de 20 metros entre ellas

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
