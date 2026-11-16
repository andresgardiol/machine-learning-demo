# datos-de-ejemplo Specification

## Purpose
Define de dónde salen los ejemplos con los que una red aprende en el
Laboratorio: puntos de dos colores generados con una semilla, y ejemplos de
manejo tomados de un maestro o grabados por una persona. Define también cómo
se aparta una parte para comprobar si la red generaliza.

## Requirements

### Requirement: Puntos de dos colores
Los datos de puntos SHALL generarse con una forma, una cantidad, un ruido y
una semilla. Cada ejemplo es un punto del plano, con sus dos coordenadas
entre −1 y 1 como entradas, y su color como respuesta correcta. Las formas
son cuatro: dos grupos, círculo, cruzado y espiral. La misma semilla MUST dar
los mismos puntos.

#### Scenario: Dos grupos
- **WHEN** se generan 200 puntos de dos grupos sin ruido
- **THEN** los de un color quedan de un lado y los del otro del otro, y una recta los separa

#### Scenario: Círculo
- **WHEN** se generan puntos de círculo sin ruido
- **THEN** los de un color quedan en el centro y los del otro alrededor

#### Scenario: Cruzado
- **WHEN** se generan puntos cruzados sin ruido
- **THEN** cada color ocupa dos cuadrantes opuestos

#### Scenario: Espiral
- **WHEN** se generan puntos de espiral sin ruido
- **THEN** cada color forma un brazo de la espiral

#### Scenario: Mitad de cada color
- **WHEN** se generan puntos de cualquier forma
- **THEN** hay la misma cantidad de cada color, con uno de diferencia como mucho

#### Scenario: Ruido
- **WHEN** se generan los mismos puntos con ruido
- **THEN** algunos puntos quedan del lado del otro color, más cuanto más ruido

#### Scenario: Misma semilla
- **WHEN** se generan dos veces con la misma forma, cantidad, ruido y semilla
- **THEN** los puntos son idénticos

### Requirement: Ejemplos de manejo
Un ejemplo de manejo SHALL ser lo que percibía un auto en un instante (la
lectura de cada sensor y la velocidad) y, como respuesta correcta, los cuatro
controles que estaban accionados: avanzar, izquierda, derecha y retroceder.
Los ejemplos SHALL tomarse de cualquier controlador mientras maneja, en el
orden en que pasan.

#### Scenario: Un ejemplo por paso
- **WHEN** un controlador maneja 10 segundos
- **THEN** se obtienen 600 ejemplos, uno por paso de la simulación, con 6 entradas y 4 respuestas cada uno si el auto tiene 5 sensores

#### Scenario: Lo que se apretó
- **WHEN** en un instante el controlador avanza y dobla a la derecha
- **THEN** la respuesta correcta de ese ejemplo es sí, no, sí, no

#### Scenario: Hasta el choque
- **WHEN** el auto choca mientras se toman ejemplos
- **THEN** no se toman ejemplos del auto chocado

### Requirement: Maestro
Los ejemplos de manejo SHALL poder generarse sin que nadie maneje, haciendo
manejar a un maestro (un cerebro o un programa) en una pista, un tráfico y
una duración dados. Con el mismo maestro y los mismos ajustes, los ejemplos
MUST ser los mismos.

#### Scenario: Maestro por defecto
- **WHEN** se piden ejemplos del cerebro de ejemplo de la calle con tráfico nuevo, 60 segundos en la calle recta
- **THEN** se obtienen sus ejemplos en una fracción de segundo, siempre los mismos

#### Scenario: Maestro que choca
- **WHEN** el maestro choca antes de terminar
- **THEN** vuelve a empezar con otro tráfico hasta completar la duración

### Requirement: Apartar ejemplos
Los datos SHALL separarse en dos grupos con una semilla: los de práctica, con
los que la red aprende, y los apartados, que nunca la corrigen. La parte
apartada SHALL poder elegirse entre el 10 % y el 50 %. En los datos de manejo
MUST apartarse tramos enteros y seguidos, no instantes sueltos, porque dos
instantes vecinos son casi iguales.

#### Scenario: Separación de puntos
- **WHEN** se apartan el 30 % de 200 puntos
- **THEN** quedan 140 de práctica y 60 apartados, con los dos colores en cada grupo

#### Scenario: Separación reproducible
- **WHEN** se separa dos veces con la misma semilla
- **THEN** los grupos son los mismos

#### Scenario: Tramos de manejo
- **WHEN** se apartan el 30 % de un manejo de 60 segundos
- **THEN** lo apartado son tramos seguidos de al menos 2 segundos que suman 18 segundos

### Requirement: Resumen de los datos
Los datos SHALL poder resumirse: cuántos ejemplos hay de práctica y cuántos
apartados, y qué parte de los ejemplos tiene accionado cada control o es de
cada color.

#### Scenario: Resumen de un manejo
- **WHEN** se resumen los ejemplos de un manejo
- **THEN** se informa en qué parte de los ejemplos se avanza, se dobla a cada lado y se retrocede

#### Scenario: Sin navegador
- **WHEN** se generan, se separan y se resumen datos en un entorno sin DOM
- **THEN** funciona

### Requirement: Ejemplos evaluados
Para una red y un conjunto de ejemplos SHALL poder obtenerse, por cada
ejemplo, sus entradas, la respuesta correcta, la respuesta de la red, si
acierta y si es de práctica o apartado, y un resumen con los aciertos de cada
grupo. Acertar MUST contarse igual que en las curvas. La lista SHALL poder
filtrarse por grupo y por los que fallan. Sin DOM: con la misma red y los
mismos datos, el resultado es el mismo.

#### Scenario: Punto acertado
- **WHEN** la red contesta más de 0,5 para un punto cuya respuesta correcta es 1
- **THEN** ese ejemplo figura como acertado

#### Scenario: Ejemplo de manejo
- **WHEN** la red coincide con el maestro en tres de los cuatro controles de un ejemplo
- **THEN** ese ejemplo figura como fallado, y se informa qué control no coincide

#### Scenario: Resumen igual al de las curvas
- **WHEN** se evalúan todos los ejemplos al terminar una época
- **THEN** los aciertos de práctica y de apartados del resumen son los mismos que esa época anota en la historia

#### Scenario: Solo los que fallan
- **WHEN** se filtra por los que fallan y por apartados
- **THEN** la lista trae solo los ejemplos apartados que la red falla, con su número de ejemplo original

#### Scenario: Con partes apagadas
- **WHEN** la red tiene una neurona apagada
- **THEN** la respuesta de cada ejemplo se calcula con esa neurona apagada
