## MODIFIED Requirements

### Requirement: Eliminar a los lentos
El entrenamiento SHALL ofrecer una regla, encendida por defecto, que saca de
carrera a todo auto que en los últimos 5 segundos simulados avanzó menos que el
carril más lento del tráfico en ese tiempo (30 metros, a 6 m/s), para que
esperar un hueco detrás de un vehículo no saque a nadie de carrera. La regla
MUST aplicarse recién cuando la generación lleva 5 segundos, MUST dejar al auto
detenido y fuera de carrera con el motivo "demasiado lento", y su fitness
SHALL ser el logrado hasta ese momento. Con la regla apagada, ningún auto sale
de carrera por lento.

#### Scenario: Auto detrás del tráfico
- **WHEN** con la regla encendida un auto avanza a menos de 6 m/s durante 5 segundos simulados
- **THEN** queda fuera de carrera con el motivo "demasiado lento" y deja de contarse entre los autos en carrera

#### Scenario: Esperar el hueco no elimina
- **WHEN** con la regla encendida un auto sigue durante 6 segundos simulados a un vehículo del carril más lento, a su misma velocidad
- **THEN** sigue en carrera

#### Scenario: Auto más rápido que el tráfico
- **WHEN** con la regla encendida un auto avanza a más de 6 m/s sin chocar
- **THEN** sigue en carrera

#### Scenario: Comienzo de la generación
- **WHEN** empiezan a moverse los autos de una generación
- **THEN** ninguno sale por lento antes de que pasen 5 segundos simulados

#### Scenario: Fitness al salir por lento
- **WHEN** un auto sale por lento tras recorrer 25 metros en 5 segundos
- **THEN** su fitness por distancia es 25 y por tiempo sin chocar es 5

#### Scenario: Regla apagada
- **WHEN** la regla está apagada y un auto va detrás del tráfico toda la generación
- **THEN** sigue en carrera hasta que termina la generación

### Requirement: Funciones de fitness
El fitness de cada individuo SHALL calcularse con una función elegible entre
cuatro: ventaja sobre el tráfico (la mayor ventaja que alcanzó en carrera: lo
que avanzó menos lo que avanzó en el mismo tiempo el carril más rápido del
tráfico, nunca menor que cero, en metros), distancia (la mayor distancia
alcanzada, en metros), tiempo sin chocar (segundos en carrera) y velocidad
media (distancia dividida por el tiempo en carrera). La función por defecto
SHALL ser ventaja sobre el tráfico.

#### Scenario: Distancia
- **WHEN** un auto llega a 120 metros, retrocede hasta 100 y la generación termina
- **THEN** su fitness por distancia es 120

#### Scenario: Tiempo sin chocar
- **WHEN** un auto choca a los 3 segundos y otro no se mueve durante toda una generación de 5 segundos
- **THEN** sus fitness por tiempo sin chocar son 3 y 5

#### Scenario: Velocidad media
- **WHEN** un auto recorre 60 metros y choca a los 4 segundos
- **THEN** su fitness por velocidad media es 15

#### Scenario: Ventaja sobre el tráfico
- **WHEN** a los 20 segundos de una generación un auto lleva recorridos 300 metros, con el carril más rápido del tráfico a 10 m/s
- **THEN** su fitness por ventaja sobre el tráfico es 100

#### Scenario: Seguir al tráfico no suma
- **WHEN** un auto alcanza una ventaja de 30 metros y después va 20 segundos detrás de un vehículo de cualquier carril, a su misma velocidad
- **THEN** su fitness por ventaja sobre el tráfico sigue siendo 30

#### Scenario: La ventaja alcanzada se conserva
- **WHEN** un auto alcanza una ventaja de 80 metros y después choca o frena hasta que el tráfico lo pasa
- **THEN** su fitness por ventaja sobre el tráfico es 80

#### Scenario: Auto que no avanza
- **WHEN** un auto no se mueve o retrocede durante toda la generación
- **THEN** su fitness por ventaja sobre el tráfico es 0

#### Scenario: Función por defecto
- **WHEN** empieza un entrenamiento sin configurar nada
- **THEN** los individuos se evalúan con la ventaja sobre el tráfico

### Requirement: Vehículos superados
El entrenamiento SHALL poder informar, para cada individuo de la generación en
curso, cuántos vehículos superó: la mayor cantidad de vehículos del tráfico
que, habiendo empezado delante del auto, quedaron a la vez enteros detrás de
él, cada uno con su propio largo y la velocidad de su carril. La cuenta MUST
NOT bajar durante la generación y MUST NOT depender de la función de fitness
elegida.

#### Scenario: Sin superar a nadie
- **WHEN** un auto va toda la generación detrás del primer vehículo de su carril
- **THEN** su cuenta de vehículos superados es 0

#### Scenario: Vehículo que queda atrás
- **WHEN** la cola de un auto deja atrás el frente de un vehículo que tenía adelante
- **THEN** su cuenta de vehículos superados sube en uno

#### Scenario: Un camión se supera entero
- **WHEN** la cola del auto deja atrás el centro de un camión que tenía adelante, pero todavía no su frente
- **THEN** su cuenta de vehículos superados no cambia

#### Scenario: Chocar no descuenta
- **WHEN** un auto supera tres vehículos, choca y esos vehículos lo vuelven a pasar
- **THEN** su cuenta de vehículos superados sigue siendo 3

#### Scenario: Un carril rápido que lo vuelve a pasar
- **WHEN** un auto supera cuatro vehículos, frena, un vehículo del carril más rápido lo vuelve a pasar y después supera a otros dos
- **THEN** su cuenta de vehículos superados es 5

#### Scenario: Con otra función de fitness
- **WHEN** el entrenamiento usa la función distancia y un auto supera dos vehículos
- **THEN** su cuenta de vehículos superados es 2

### Requirement: Escenario por defecto del entrenamiento
Un entrenamiento que empieza sin configurar nada SHALL usar tres carriles,
densidad de tráfico del 50 %, irregularidad del 0 % y tráfico nuevo en cada
generación. La irregularidad SHALL seguir siendo configurable de 0 a 100 %.
Este valor por defecto MUST NOT cambiar el tráfico de las pestañas El problema
y Reglas a mano.

#### Scenario: Estado por defecto
- **WHEN** empieza un entrenamiento sin configurar nada
- **THEN** cada vehículo va centrado en su carril, sin zigzaguear, y dentro de cada carril los huecos son iguales

#### Scenario: Subir la irregularidad
- **WHEN** se configura una irregularidad del 50 % durante una generación
- **THEN** en la generación siguiente los vehículos zigzaguean dentro de su carril y los huecos de cada carril son desparejos

#### Scenario: Volver al valor por defecto
- **WHEN** se restablece la configuración después de entrenar con irregularidad 50 %
- **THEN** en la generación siguiente los vehículos vuelven a ir centrados y con huecos parejos

#### Scenario: Otras pestañas
- **WHEN** se abre El problema o Reglas a mano sin configurar nada
- **THEN** su tráfico tiene la irregularidad del 50 % de siempre
