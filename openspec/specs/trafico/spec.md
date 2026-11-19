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
- **THEN** los vehículos aparecen en los mismos carriles, a las mismas distancias, con el mismo tipo y la misma velocidad, y zigzaguean igual

#### Scenario: Semilla nueva
- **WHEN** se genera tráfico con una semilla distinta
- **THEN** la disposición de los vehículos es diferente, incluidas las distancias a las que aparecen y no solo sus carriles

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
El tráfico SHALL tener una irregularidad regulable entre 0 % y 100 %. Con 0 %,
cada vehículo va centrado en su carril, sin zigzaguear, y los huecos dentro de
cada carril son parejos. Con valores mayores, cada vehículo zigzaguea dentro
de su carril, lento y cada vez más ancho, hasta casi tocar los bordes del
carril sin salir de él, y los huecos dentro de cada carril se sortean en un
rango cada vez más amplio. Las velocidades de los carriles MUST NOT depender
de la irregularidad. El valor por defecto SHALL ser 50 %.

#### Scenario: Tráfico regular
- **WHEN** la irregularidad es 0 %
- **THEN** cada vehículo va centrado en su carril todo el tiempo y, dentro de cada carril, todos los huecos son iguales

#### Scenario: Zigzag dentro del carril
- **WHEN** la irregularidad es mayor que 0 %
- **THEN** cada vehículo cambia su posición lateral con el tiempo, de un lado al otro de su carril, sin salir de él

#### Scenario: Más irregularidad, más zigzag
- **WHEN** se compara el mismo vehículo con la misma semilla a irregularidad 25 % y a 100 %
- **THEN** a 100 % se aparta más del centro de su carril

#### Scenario: Sin carril seguro por suerte
- **WHEN** la irregularidad es del 50 % y un auto va derecho sobre la línea entre dos carriles a velocidad máxima, para cien semillas distintas
- **THEN** en todos los casos choca antes de recorrer un kilómetro

#### Scenario: Tráfico irregular sin invadir carriles
- **WHEN** la irregularidad es 100 %
- **THEN** los huecos dentro de cada carril varían y ningún vehículo sobresale de su carril

#### Scenario: Separaciones variadas
- **WHEN** la irregularidad es 100 %
- **THEN** dentro de un carril hay huecos que duplican a otros, sin que ninguno baje del mínimo

#### Scenario: Grupos escalonados
- **WHEN** dos vehículos de carriles distintos quedan a la par, con cualquier irregularidad
- **THEN** dejan de estarlo en pocos segundos, porque sus carriles van a distinta velocidad: el tráfico no forma grupos que avancen juntos

#### Scenario: Valor por defecto y vuelta atrás
- **WHEN** se restablece la configuración después de cambiar la irregularidad
- **THEN** la irregularidad vuelve a 50 % y el tráfico, con la misma semilla, es el mismo que al abrir

### Requirement: Cambio de configuración en marcha
La densidad y la irregularidad del tráfico SHALL poder cambiarse mientras la
simulación avanza, sin reiniciarla. Los vehículos que están cerca del auto
MUST seguir donde estaban. En cada carril, el tráfico con la nueva
configuración SHALL empezar más adelante, separado del anterior por al menos
cuatro largos de auto, y cada carril SHALL conservar su velocidad. Al
reiniciar, el tráfico SHALL usar la configuración vigente desde el principio.

#### Scenario: Cambiar la densidad en marcha
- **WHEN** se cambia la densidad mientras el auto avanza
- **THEN** los vehículos cercanos al auto siguen en el mismo lugar, ninguno aparece encima del auto y más adelante el tráfico tiene la nueva densidad

#### Scenario: Unión entre configuraciones
- **WHEN** se cambia la configuración del tráfico en marcha
- **THEN** en cada carril, entre el último vehículo de la configuración anterior y el primero de la nueva hay al menos cuatro largos de auto de hueco

#### Scenario: Cada carril conserva su ritmo
- **WHEN** se cambia la irregularidad en marcha
- **THEN** cada carril sigue a la misma velocidad que antes del cambio

### Requirement: Movimiento del tráfico
Los vehículos del tráfico SHALL avanzar por su carril a la velocidad constante
de su carril, que MUST ser menor que la menor velocidad máxima que se le
puede configurar al auto del conductor, sin cambiar de carril ni chocar entre
sí.

#### Scenario: Tráfico alcanzable
- **WHEN** el auto del conductor avanza a la menor velocidad máxima configurable detrás de un vehículo del carril más rápido
- **THEN** la distancia entre ambos se reduce con el tiempo

#### Scenario: Tráfico estable
- **WHEN** la simulación avanza durante un minuto simulado
- **THEN** cada vehículo del tráfico sigue en su carril y ningún vehículo del tráfico toca a otro

#### Scenario: Carriles a distinto ritmo
- **WHEN** la simulación avanza diez segundos simulados con tres carriles
- **THEN** los vehículos del carril más rápido avanzaron 40 metros más que los del más lento

### Requirement: Tráfico sin fin
Mientras la densidad sea mayor que 0 %, la calle SHALL tener siempre tráfico por
delante del conductor, sin importar cuánto haya avanzado.

#### Scenario: Recorrido largo
- **WHEN** el conductor recorre diez kilómetros
- **THEN** sigue habiendo vehículos por delante

### Requirement: Un ritmo por carril
Cada carril SHALL tener su propia corriente de vehículos, todos a la misma velocidad constante, que es la del carril. Las velocidades de los carriles SHALL ser distintas entre sí, repartidas parejas entre 6 m/s (el más lento) y 10 m/s (el más rápido), y la semilla SHALL sortear qué carril lleva cuál. Entre dos vehículos consecutivos del mismo carril MUST quedar un hueco de al menos cuatro largos de auto, de paragolpes a paragolpes.

#### Scenario: Tres carriles por defecto
- **WHEN** se genera tráfico con tres carriles y sin configurar nada más
- **THEN** los carriles van a 6, 8 y 10 m/s, uno a cada velocidad

#### Scenario: Dos y cuatro carriles
- **WHEN** se genera tráfico con dos carriles y con cuatro carriles
- **THEN** con dos van a 6 y 10 m/s, y con cuatro, a 6, 7,33, 8,67 y 10 m/s, redondeadas a dos decimales

#### Scenario: La semilla reparte los ritmos
- **WHEN** se genera tráfico de tres carriles con cien semillas distintas
- **THEN** el carril más rápido no es siempre el mismo

#### Scenario: Hueco dentro del carril
- **WHEN** se genera tráfico con densidad e irregularidad máximas para mil semillas distintas
- **THEN** en todos los casos, entre dos vehículos consecutivos de un mismo carril hay al menos cuatro largos de auto de paragolpes a paragolpes

#### Scenario: Sin filas
- **WHEN** se observa un tramo de un kilómetro de tráfico con los valores por defecto
- **THEN** los vehículos de carriles distintos no aparecen alineados a distancias que se repiten

### Requirement: Tipos de vehículo
El tráfico SHALL mezclar cuatro tipos de vehículo: moto, auto, camioneta y camión. Cada uno tiene un largo y un ancho propios, con los que choca y con los que lo leen los sensores. El tipo de cada vehículo SHALL salir de la semilla, en una proporción fija que no depende de la densidad ni de la irregularidad. Ningún tipo MUST ser más ancho que su carril.

#### Scenario: Todos los tipos aparecen
- **WHEN** se observan cinco kilómetros de tráfico con los valores por defecto
- **THEN** hay motos, autos, camionetas y camiones

#### Scenario: Medidas por tipo
- **WHEN** se comparan un camión y una moto del tráfico
- **THEN** el camión es más largo y más ancho que el auto, y la moto, más corta y más angosta

#### Scenario: Se choca con la medida real
- **WHEN** el auto toca el extremo trasero de un camión, a más de un largo y medio de auto de su centro
- **THEN** el choque cuenta

#### Scenario: Los sensores ven la medida real
- **WHEN** un rayo apunta a una moto que está dentro de su alcance
- **THEN** la lectura corresponde al contorno angosto de la moto, no al de un auto

### Requirement: Seguir en tu carril es seguro
Un auto que va dentro de su carril, detrás de un vehículo de ese carril y a la velocidad del carril, MUST NOT ser alcanzado por ningún vehículo del tráfico: ni por el de atrás de su carril ni por los de los carriles vecinos. Ningún vehículo del tráfico MUST salir de su carril.

#### Scenario: Esperar detrás
- **WHEN** el auto se pone detrás de un vehículo de su carril y lo sigue a su misma velocidad durante un minuto simulado, para cien semillas distintas
- **THEN** en ningún caso choca

#### Scenario: Nadie sale de su carril
- **WHEN** la irregularidad es del 100 % y la simulación avanza un minuto simulado
- **THEN** ninguna parte del contorno de ningún vehículo sale de su carril

### Requirement: Ningún muro encierra
Un muro es un instante en que, en algún punto de la calle, cada carril tiene un vehículo cuyo contorno queda a menos de medio largo de auto de ese punto. Todo muro MUST deshacerse en 7 segundos simulados o menos, con cualquier cantidad de carriles, densidad e irregularidad.

#### Scenario: Muros cortos con densidad máxima
- **WHEN** se genera tráfico con densidad máxima, para dos, tres y cuatro carriles y mil semillas distintas, y se recorren sus primeros diez kilómetros
- **THEN** ningún muro dura más de 7 segundos simulados

#### Scenario: Calle sin muros eternos
- **WHEN** el auto espera detrás de un muro siguiendo al vehículo de su carril
- **THEN** antes de 7 segundos simulados se abre un hueco en algún carril
