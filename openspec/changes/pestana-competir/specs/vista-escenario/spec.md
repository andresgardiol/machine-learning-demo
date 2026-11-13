# Spec Delta

## ADDED Requirements

### Requirement: Competidores distinguibles
Al mostrar una carrera, la vista SHALL dibujar a cada competidor con un color
y un número propios, de modo que se los distinga entre sí y del tráfico sin
depender solo del color. El auto manejado por la persona SHALL conservar el
verde del auto del conductor. El competidor en foco se dibuja encima, con sus
sensores. Los que ya no corren, porque llegaron o no terminaron, se ven
atenuados.

#### Scenario: Seis competidores
- **WHEN** se muestra una carrera de seis competidores
- **THEN** cada auto lleva su número a la vista y ninguno comparte color con otro ni con el tráfico

#### Scenario: Autos superpuestos
- **WHEN** varios competidores están en el mismo lugar, como en la salida
- **THEN** el competidor en foco se ve encima de los demás

#### Scenario: Competidor que choca
- **WHEN** un competidor choca
- **THEN** su auto muestra la marca de choque donde chocó mientras dura la penalización, y después se lo ve reaparecer más atrás

#### Scenario: Recién reaparecido
- **WHEN** un competidor acaba de reaparecer y el tráfico todavía no puede chocarlo
- **THEN** su auto se ve translúcido y con el contorno punteado, sin depender solo de un parpadeo, hasta que termina la protección, también mientras pasa a través de un vehículo

#### Scenario: Competidor fuera de la carrera
- **WHEN** un competidor queda como que no terminó
- **THEN** su auto queda donde estaba, atenuado, y su número sigue leyéndose

#### Scenario: Mismos colores que en el tablero
- **WHEN** la persona mira un auto en el escenario y su fila en el marcador
- **THEN** llevan el mismo color y el mismo número

### Requirement: Meta a la vista
Al mostrar una carrera, la vista SHALL dibujar la meta: en la calle recta, una
línea a cuadros que cruza la calle a la distancia de la meta; en un circuito,
la línea de salida, que es también la de llegada.

#### Scenario: Meta de la calle
- **WHEN** un competidor se acerca a los 1000 metros en la calle recta
- **THEN** se ve la línea de meta cruzando todos los carriles, y se distingue de las líneas de carril

#### Scenario: Meta de un circuito
- **WHEN** se muestra una carrera en el óvalo
- **THEN** la línea de salida se ve como línea de llegada

### Requirement: Fluidez en una carrera
La vista SHALL mantenerse fluida con seis competidores y el paisaje encendido
en una computadora de escritorio de uso general.

#### Scenario: Carrera en el circuito más largo
- **WHEN** se mide la tasa de cuadros durante diez segundos de una carrera de seis competidores en el circuito de curvas, a velocidad normal
- **THEN** el promedio es de al menos 55 cuadros por segundo
