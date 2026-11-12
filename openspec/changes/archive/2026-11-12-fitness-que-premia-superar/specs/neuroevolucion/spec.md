# Spec Delta

## MODIFIED Requirements

### Requirement: Tamaño de la población
La población SHALL tener entre 2 y 500 individuos, 400 por defecto, y mantener
su tamaño de una generación a la siguiente. Un valor fuera de rango MUST
ajustarse al límite válido más cercano.

#### Scenario: Tamaño constante
- **WHEN** termina una generación de 100 individuos
- **THEN** la generación siguiente tiene 100 individuos

#### Scenario: Valor fuera de rango
- **WHEN** se pide una población de 1
- **THEN** la población queda en 2

#### Scenario: Población por defecto
- **WHEN** empieza un entrenamiento sin configurar nada
- **THEN** la primera generación tiene 400 individuos

### Requirement: Funciones de fitness
El fitness de cada individuo SHALL calcularse con una función elegible entre
cuatro: ventaja sobre el tráfico (los metros que el auto le sacó al tráfico:
lo que avanzó menos lo que avanzó el tráfico en el mismo tiempo; cuenta la
mayor ventaja que alcanzó mientras estuvo en carrera y nunca es menor que
cero), distancia (la mayor distancia alcanzada, en metros), tiempo sin chocar
(segundos que estuvo en carrera) y velocidad media (distancia dividida por el
tiempo en carrera). La función por defecto SHALL ser ventaja sobre el tráfico.

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
- **WHEN** a los 20 segundos de una generación un auto lleva recorridos 300 metros, con el tráfico a 10 m/s
- **THEN** su fitness por ventaja sobre el tráfico es 100

#### Scenario: Seguir al tráfico no suma
- **WHEN** un auto alcanza una ventaja de 30 metros y después va 20 segundos detrás de un vehículo, a su misma velocidad
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

### Requirement: Élite
Con selección automática, los mejores individuos de una generación SHALL pasar
a la siguiente sin ningún cambio, en una cantidad configurable de 0 a 20 (10
por defecto) que nunca supera la mitad de la población, redondeada hacia
abajo, para que siempre haya al menos tantos hijos nuevos como individuos de
élite.

#### Scenario: Élite de uno
- **WHEN** termina una generación con élite 1
- **THEN** la generación siguiente contiene un individuo cuya red es idéntica a la del mejor de la anterior

#### Scenario: Sin élite
- **WHEN** termina una generación con élite 0 y mutación mayor que cero
- **THEN** ningún individuo de la generación siguiente tiene garantizada una red idéntica a una de la anterior

#### Scenario: Con selección manual no se usa
- **WHEN** termina una generación con selección manual, un padre elegido y élite 3
- **THEN** la generación siguiente contiene una sola copia sin cambios, la del padre elegido

#### Scenario: Élite por defecto
- **WHEN** termina una generación sin configurar nada
- **THEN** los diez primeros individuos de la generación siguiente tienen redes idénticas a las de los diez mejores de la anterior, en orden

#### Scenario: Valor fuera de rango
- **WHEN** se pide una élite de 35
- **THEN** la élite queda en 20

#### Scenario: Población chica
- **WHEN** termina una generación de 10 individuos con la élite por defecto
- **THEN** pasan sin cambios cinco individuos y los otros cinco son hijos nuevos

## ADDED Requirements

### Requirement: Vehículos superados
El entrenamiento SHALL poder informar, para cada individuo de la generación en
curso, cuántos vehículos superó: los vehículos del tráfico que quedaron
enteros detrás del auto en el momento de su mayor ventaja sobre el tráfico. La
cuenta MUST NOT bajar durante la generación y MUST NOT depender de la función
de fitness elegida.

#### Scenario: Sin superar a nadie
- **WHEN** un auto va toda la generación detrás del primer vehículo del tráfico
- **THEN** su cuenta de vehículos superados es 0

#### Scenario: Vehículo que queda atrás
- **WHEN** la cola de un auto deja atrás el frente de un vehículo que tenía adelante
- **THEN** su cuenta de vehículos superados sube en uno

#### Scenario: Chocar no descuenta
- **WHEN** un auto supera tres vehículos, choca y esos vehículos lo vuelven a pasar
- **THEN** su cuenta de vehículos superados sigue siendo 3

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
- **THEN** los vehículos de cada grupo van alineados, centrados en su carril, y todos los grupos están a la misma distancia uno de otro

#### Scenario: Subir la irregularidad
- **WHEN** se configura una irregularidad del 50 % durante una generación
- **THEN** la generación siguiente tiene grupos a distancias distintas y vehículos desalineados

#### Scenario: Volver al valor por defecto
- **WHEN** se restablece la configuración después de entrenar con irregularidad 50 %
- **THEN** la generación siguiente vuelve a tener el tráfico alineado

#### Scenario: Otras pestañas
- **WHEN** se abre El problema o Reglas a mano sin configurar nada
- **THEN** su tráfico tiene la irregularidad del 50 % de siempre

### Requirement: Enfriamiento de la mutación
Con selección automática, el entrenamiento SHALL ofrecer un enfriamiento de
la mutación, encendido por defecto: la generación que sigue a la generación
número g se arma con una fuerza de 30 % × 0,95^g, nunca menor que 3 %, en
lugar de la fuerza configurada. Apagado, o con selección manual, MUST usarse
la fuerza configurada. El entrenamiento SHALL informar la fuerza con que se
armará la generación siguiente.

#### Scenario: Estado por defecto
- **WHEN** termina la primera generación de un entrenamiento sin configurar nada
- **THEN** la segunda se arma con una fuerza de mutación de 28,5 %

#### Scenario: La fuerza baja con las generaciones
- **WHEN** terminan las generaciones 10 y 20 con el enfriamiento encendido
- **THEN** las generaciones siguientes se arman con fuerzas de 17,96 % y 10,75 %, redondeadas a dos decimales

#### Scenario: Piso
- **WHEN** termina la generación 45 o cualquier otra posterior con el enfriamiento encendido
- **THEN** la siguiente se arma con una fuerza de 3 %

#### Scenario: Enfriamiento apagado
- **WHEN** se apaga el enfriamiento con la fuerza configurada en 10 % y termina una generación
- **THEN** la siguiente se arma con una fuerza de 10 %, sea cual sea su número

#### Scenario: Volver a encenderlo
- **WHEN** se vuelve a encender el enfriamiento durante la generación 30
- **THEN** la generación 31 se arma con la fuerza que le toca por su número, 6,44 %, como si nunca se hubiera apagado

#### Scenario: Con selección manual no se usa
- **WHEN** termina una generación con selección manual, un padre elegido, el enfriamiento encendido y la fuerza configurada en 10 %
- **THEN** los hijos del padre se arman con una fuerza de 10 %

#### Scenario: Continuar desde un cerebro
- **WHEN** se continúa con el enfriamiento encendido desde un cerebro que lleva 60 generaciones
- **THEN** la población inicial, hijos de ese cerebro, se arma con una fuerza de 3 %

#### Scenario: Enfriamiento reproducible
- **WHEN** se repite un entrenamiento con la misma semilla y la misma configuración
- **THEN** cada generación se arma con la misma fuerza y resulta la misma población

### Requirement: Aprendizaje con los valores por defecto
Con los valores por defecto, la población SHALL aprender a superar al tráfico.
La medida, fija, usa población 100 y el resto de los valores por defecto: con
las semillas 1 a 8, los campeones de las generaciones 51 a 60 manejan 60 s
cada uno en 10 tráficos que no vieron y se promedia cuántos vehículos superan.
Ese promedio MUST ser de al menos 8, y el de cada semilla, de al menos 5. La
misma medida con la función distancia MUST dar 2 o menos, para que el
contraste se pueda mostrar.

#### Scenario: Valores por defecto
- **WHEN** se hace la medida con los valores por defecto
- **THEN** los campeones superan en promedio 8 vehículos o más

#### Scenario: Ninguna semilla se queda atrás
- **WHEN** se hace la medida con los valores por defecto
- **THEN** los campeones de cada una de las ocho semillas superan en promedio 5 vehículos o más

#### Scenario: Con la función distancia
- **WHEN** se hace la misma medida cambiando solo la función de fitness a distancia
- **THEN** los campeones superan en promedio 2 vehículos o menos

#### Scenario: Medida reproducible
- **WHEN** se repite la medida con las mismas semillas
- **THEN** el promedio es exactamente el mismo
