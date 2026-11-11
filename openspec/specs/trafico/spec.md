# trafico Specification

## Purpose

Puebla la calle recta con vehículos que el conductor debe esquivar, de forma
reproducible y siempre superable, con una dificultad que se regula por densidad
e irregularidad.

## Requirements

### Requirement: Tráfico reproducible
El tráfico SHALL quedar completamente determinado por su semilla y su
configuración: mismos valores, mismos vehículos en las mismas posiciones en
todo momento.

#### Scenario: Misma semilla
- **WHEN** se genera tráfico dos veces con la misma semilla y la misma configuración
- **THEN** los vehículos aparecen en los mismos carriles y a las mismas distancias

#### Scenario: Semilla nueva
- **WHEN** se genera tráfico con una semilla distinta
- **THEN** la disposición de los vehículos es diferente, incluidas las distancias a las que aparecen y no solo sus carriles

### Requirement: Tráfico siempre superable
El tráfico MUST dejar siempre al menos un carril libre en cada grupo de
vehículos, y MUST mantener entre grupos consecutivos una separación de al menos
cuatro largos de auto, medida entre los vehículos más cercanos de ambos
grupos, para que siempre exista un camino sin choque.

#### Scenario: Carril libre con densidad máxima
- **WHEN** se genera tráfico con densidad máxima para mil semillas distintas
- **THEN** en todos los casos cada grupo de vehículos deja al menos un carril libre

#### Scenario: Separación mínima con irregularidad máxima
- **WHEN** se genera tráfico con irregularidad máxima para mil semillas distintas
- **THEN** en todos los casos la separación entre grupos consecutivos es de al menos cuatro largos de auto

### Requirement: Densidad configurable
El tráfico SHALL tener una densidad regulable entre 0 % y 100 %, donde 0 %
significa calle vacía y valores mayores significan más vehículos por tramo.
El valor por defecto SHALL ser 50 %.

#### Scenario: Calle vacía
- **WHEN** la densidad es 0 %
- **THEN** no hay ningún vehículo en la calle

#### Scenario: Más densidad, más vehículos
- **WHEN** se compara el mismo tramo de calle con la misma semilla a densidad 25 % y a densidad 100 %
- **THEN** a densidad 100 % hay más vehículos

### Requirement: Irregularidad configurable
El tráfico SHALL tener una irregularidad regulable entre 0 % y 100 %. Con 0 %
los grupos van a distancias iguales, con sus vehículos a la par y centrados en
su carril. Con valores mayores, la distancia entre grupos se sorteará en un
rango cada vez más amplio, los vehículos de un mismo grupo se adelantarán o
atrasarán entre sí y variará su posición lateral dentro del carril. El valor
por defecto SHALL ser 50 %.

#### Scenario: Tráfico regular
- **WHEN** la irregularidad es 0 %
- **THEN** todos los grupos están a la misma distancia entre sí y cada vehículo está a la par de los de su grupo y centrado en su carril

#### Scenario: Tráfico irregular sin invadir carriles
- **WHEN** la irregularidad es 100 %
- **THEN** las distancias entre grupos varían y ningún vehículo sobresale de su carril

#### Scenario: Separaciones variadas
- **WHEN** la irregularidad es 100 %
- **THEN** entre grupos consecutivos hay separaciones que duplican a otras, sin que ninguna baje del mínimo

#### Scenario: Grupos escalonados
- **WHEN** la irregularidad es mayor que 0 % y un grupo tiene más de un vehículo
- **THEN** sus vehículos no van todos exactamente a la par

### Requirement: Cambio de configuración en marcha
La densidad y la irregularidad del tráfico SHALL poder cambiarse mientras la
simulación avanza, sin reiniciarla. Los vehículos que están cerca del auto
MUST seguir donde estaban. El tráfico con la nueva configuración SHALL empezar
más adelante, separado del anterior por al menos cuatro largos de auto. Al
reiniciar, el tráfico SHALL usar la configuración vigente desde el principio.

#### Scenario: Cambiar la densidad en marcha
- **WHEN** se cambia la densidad mientras el auto avanza
- **THEN** los vehículos cercanos al auto siguen en el mismo lugar, ninguno aparece encima del auto y más adelante el tráfico tiene la nueva densidad

#### Scenario: Unión entre configuraciones
- **WHEN** se cambia la configuración del tráfico en marcha
- **THEN** entre el último vehículo de la configuración anterior y el primero de la nueva hay al menos cuatro largos de auto de hueco

### Requirement: Movimiento del tráfico
Los vehículos del tráfico SHALL avanzar por su carril a una velocidad constante
menor que la velocidad máxima del auto del conductor, sin cambiar de carril ni
chocar entre sí.

#### Scenario: Tráfico alcanzable
- **WHEN** el auto del conductor avanza a velocidad máxima detrás de un vehículo del tráfico
- **THEN** la distancia entre ambos se reduce con el tiempo

#### Scenario: Tráfico estable
- **WHEN** la simulación avanza durante un minuto simulado
- **THEN** cada vehículo del tráfico sigue en su carril y ningún vehículo del tráfico toca a otro

### Requirement: Tráfico sin fin
Mientras la densidad sea mayor que 0 %, la calle SHALL tener siempre tráfico por
delante del conductor, sin importar cuánto haya avanzado.

#### Scenario: Recorrido largo
- **WHEN** el conductor recorre diez kilómetros
- **THEN** sigue habiendo vehículos por delante
