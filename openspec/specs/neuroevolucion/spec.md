# neuroevolucion Specification

## Purpose

Hace que una población de redes neuronales aprenda a manejar sin que nadie les
diga cómo: en cada generación todas manejan, se mide qué tan bien lo hicieron,
las mejores dejan descendencia con pequeños cambios y el ciclo se repite. Es
aprendizaje por evolución, no por recompensa paso a paso.

## Requirements

### Requirement: Población evaluada en el mismo escenario
En cada generación, todos los individuos de la población SHALL manejar a la
vez, cada uno con su propia red, sobre la misma pista y el mismo tráfico y
partiendo del mismo punto, para que la comparación entre ellos sea justa.

#### Scenario: Inicio de una generación
- **WHEN** empieza una generación con una población de 100
- **THEN** hay 100 autos detenidos en la misma posición de salida, cada uno manejado por una red distinta

### Requirement: Tamaño de la población
La población SHALL tener entre 2 y 500 individuos, 100 por defecto, y mantener
su tamaño de una generación a la siguiente. Un valor fuera de rango MUST
ajustarse al límite válido más cercano.

#### Scenario: Tamaño constante
- **WHEN** termina una generación de 100 individuos
- **THEN** la generación siguiente tiene 100 individuos

#### Scenario: Valor fuera de rango
- **WHEN** se pide una población de 1
- **THEN** la población queda en 2

### Requirement: Fin de la generación
Una generación SHALL terminar cuando ocurre lo primero de esto: todos los autos
quedaron fuera de carrera (porque chocaron o porque fueron eliminados por
lentos); se cumplió la duración máxima (de 10 a 300 segundos simulados, 60 por
defecto); o ningún auto en carrera mejoró su mayor distancia durante 5 segundos
simulados. El motivo MUST quedar registrado.

#### Scenario: Todos fuera de carrera
- **WHEN** choca o es eliminado por lento el último auto en carrera
- **THEN** la generación termina con el motivo "todos quedaron fuera de carrera"

#### Scenario: Duración máxima
- **WHEN** pasan 60 segundos simulados con la duración por defecto y queda algún auto en carrera que sigue avanzando
- **THEN** la generación termina con el motivo "se acabó el tiempo"

#### Scenario: Nadie avanza
- **WHEN** los autos en carrera llevan 5 segundos simulados sin superar su mayor distancia
- **THEN** la generación termina con el motivo "nadie avanzaba"

### Requirement: Eliminar a los lentos
El entrenamiento SHALL ofrecer una regla, encendida por defecto, que saca de
carrera a todo auto que en los últimos 5 segundos simulados avanzó menos que el
tráfico en ese tiempo (50 metros, a 10 m/s). La regla MUST aplicarse recién
cuando la generación lleva 5 segundos, MUST dejar al auto detenido y fuera de
carrera con el motivo "demasiado lento", y su fitness SHALL ser el logrado
hasta ese momento. Con la regla apagada, ningún auto sale de carrera por lento.

#### Scenario: Auto detrás del tráfico
- **WHEN** con la regla encendida un auto avanza a 10 m/s o menos durante 5 segundos simulados
- **THEN** queda fuera de carrera con el motivo "demasiado lento" y deja de contarse entre los autos en carrera

#### Scenario: Auto más rápido que el tráfico
- **WHEN** con la regla encendida un auto avanza a más de 10 m/s sin chocar
- **THEN** sigue en carrera

#### Scenario: Comienzo de la generación
- **WHEN** empiezan a moverse los autos de una generación
- **THEN** ninguno sale por lento antes de que pasen 5 segundos simulados

#### Scenario: Fitness al salir por lento
- **WHEN** un auto sale por lento tras recorrer 40 metros en 5 segundos
- **THEN** su fitness por distancia es 40 y por tiempo sin chocar es 5

#### Scenario: Regla apagada
- **WHEN** la regla está apagada y un auto va detrás del tráfico toda la generación
- **THEN** sigue en carrera hasta que termina la generación

### Requirement: Pasar de generación a pedido
El entrenamiento SHALL poder terminar la generación en curso en cualquier
momento, evaluando a cada individuo con lo logrado hasta ese instante.

#### Scenario: Terminar ahora
- **WHEN** se pide pasar de generación con autos todavía en carrera
- **THEN** la generación termina con el motivo "a pedido" y empieza la siguiente

### Requirement: Funciones de fitness
El fitness de cada individuo SHALL calcularse con una función elegible entre
tres: distancia (la mayor distancia alcanzada, en metros), tiempo sin chocar
(segundos que estuvo en carrera) y velocidad media (distancia dividida por el
tiempo en carrera). La función por defecto SHALL ser distancia.

#### Scenario: Distancia
- **WHEN** un auto llega a 120 metros, retrocede hasta 100 y la generación termina
- **THEN** su fitness por distancia es 120

#### Scenario: Tiempo sin chocar
- **WHEN** un auto choca a los 3 segundos y otro no se mueve durante toda una generación de 5 segundos
- **THEN** sus fitness por tiempo sin chocar son 3 y 5

#### Scenario: Velocidad media
- **WHEN** un auto recorre 60 metros y choca a los 4 segundos
- **THEN** su fitness por velocidad media es 15

### Requirement: Selección de los padres
Al terminar una generación, los individuos SHALL ordenarse de mayor a menor
fitness, resolviendo los empates por su posición en la población. Los padres de
la generación siguiente SHALL ser los mejores, en una proporción configurable
del 1 % al 50 % de la población (10 % por defecto), nunca menos de uno.

#### Scenario: Diez por ciento
- **WHEN** termina una generación de 100 individuos con selección del 10 %
- **THEN** los padres son los 10 individuos de mayor fitness

#### Scenario: Empate
- **WHEN** dos individuos tienen el mismo fitness
- **THEN** queda primero el que estaba antes en la población

#### Scenario: Población mínima
- **WHEN** termina una generación de 2 individuos con selección del 1 %
- **THEN** hay un padre

### Requirement: Élite
Los mejores individuos de una generación SHALL pasar a la siguiente sin ningún
cambio, en una cantidad configurable de 0 a 10 (1 por defecto) que nunca supera
el tamaño de la población menos uno.

#### Scenario: Élite de uno
- **WHEN** termina una generación con élite 1
- **THEN** la generación siguiente contiene un individuo cuya red es idéntica a la del mejor de la anterior

#### Scenario: Sin élite
- **WHEN** termina una generación con élite 0 y mutación mayor que cero
- **THEN** ningún individuo de la generación siguiente tiene garantizada una red idéntica a una de la anterior

### Requirement: Mutación
Cada individuo que no es de la élite SHALL ser una copia de un padre en la que
cada peso y cada sesgo, con una probabilidad configurable (1 % a 100 %, 100 %
por defecto), se acerca a un valor al azar entre -1 y 1 en una proporción
llamada fuerza (0 % a 100 %, 10 % por defecto). Mutar un hijo MUST NOT
modificar al padre.

#### Scenario: Fuerza cero
- **WHEN** se genera un hijo con fuerza de mutación 0 %
- **THEN** su red es idéntica a la de su padre

#### Scenario: Fuerza del diez por ciento
- **WHEN** se genera un hijo con fuerza 10 % y probabilidad 100 %
- **THEN** ningún peso ni sesgo del hijo difiere del de su padre en más de 0,2

#### Scenario: Fuerza total
- **WHEN** se genera un hijo con fuerza 100 % y probabilidad 100 %
- **THEN** todos sus pesos y sesgos están entre -1 y 1 y la red del padre no cambió

### Requirement: Cruce opcional
El cruce SHALL estar apagado por defecto. Cuando está encendido, cada hijo
SHALL formarse a partir de dos padres distintos, tomando cada peso y cada sesgo
de uno u otro al azar, antes de aplicar la mutación. Si hay un solo padre, el
hijo MUST formarse solo con él.

#### Scenario: Cruce sin mutación
- **WHEN** el cruce está encendido, hay al menos dos padres y la fuerza de mutación es 0 %
- **THEN** cada peso y cada sesgo de un hijo es igual al valor que tiene en esa misma posición uno de sus dos padres

#### Scenario: Un solo padre
- **WHEN** el cruce está encendido y la selección deja un solo padre
- **THEN** cada hijo se forma a partir de ese padre

### Requirement: Tráfico por generación
El entrenamiento SHALL ofrecer dos modos de tráfico: un tráfico nuevo en cada
generación (por defecto) o el mismo tráfico en todas las generaciones. Con
tráfico nuevo, la secuencia de tráficos MUST quedar determinada por la semilla
del entrenamiento.

#### Scenario: Mismo tráfico
- **WHEN** el modo es mismo tráfico
- **THEN** los vehículos aparecen en las mismas posiciones al empezar cada generación

#### Scenario: Tráfico nuevo
- **WHEN** el modo es tráfico nuevo
- **THEN** la disposición de los vehículos cambia de una generación a la siguiente

#### Scenario: Estado por defecto
- **WHEN** se crea un entrenamiento sin indicar el modo de tráfico
- **THEN** el modo es tráfico nuevo y la segunda generación empieza con los vehículos en posiciones distintas de las de la primera

#### Scenario: Tráfico nuevo reproducible
- **WHEN** se ejecutan dos entrenamientos de diez generaciones con la misma semilla, la misma configuración y tráfico nuevo
- **THEN** la generación número n de uno enfrenta el mismo tráfico que la generación número n del otro, y el mejor fitness y el promedio de cada generación coinciden

#### Scenario: Volver al mismo tráfico
- **WHEN** se cambia el modo a mismo tráfico durante un entrenamiento con tráfico nuevo
- **THEN** desde la generación siguiente todas las generaciones enfrentan el mismo tráfico

### Requirement: Entrenamiento reproducible
Un entrenamiento MUST quedar determinado por su semilla, su configuración y los
cambios de configuración hechos en cada generación: repetirlos SHALL producir
el mismo historial y el mismo campeón, en un mismo navegador o entorno.

#### Scenario: Repetición idéntica
- **WHEN** se ejecutan dos entrenamientos de diez generaciones con la misma semilla y la misma configuración
- **THEN** el mejor fitness y el promedio de cada generación coinciden, y los campeones finales tienen redes idénticas

#### Scenario: Semilla distinta
- **WHEN** se ejecutan dos entrenamientos que solo difieren en la semilla
- **THEN** las redes de la población inicial son distintas

### Requirement: El mejor nunca empeora con élite y mismo tráfico
Con élite de al menos 1, mismo tráfico y sin cambios de configuración, el mejor
fitness de una generación MUST ser mayor o igual que el de la anterior.

#### Scenario: Diez generaciones
- **WHEN** se entrenan diez generaciones con élite 1 y mismo tráfico
- **THEN** el mejor fitness de cada generación es mayor o igual que el de la generación anterior

### Requirement: Historial de generaciones
El entrenamiento SHALL registrar, por cada generación terminada, su número, el
mejor fitness, el fitness promedio de la población, la función de fitness usada
y el motivo por el que terminó.

#### Scenario: Registro de una generación
- **WHEN** termina la tercera generación
- **THEN** el historial tiene tres registros y el último tiene el número 3 con su mejor fitness, su promedio, su función y su motivo

### Requirement: Campeón
El entrenamiento SHALL mantener como campeón al individuo de mayor fitness de la
última generación terminada, junto con ese fitness. Antes de que termine la
primera generación MUST NOT haber campeón.

#### Scenario: Antes de la primera generación
- **WHEN** el entrenamiento acaba de empezar
- **THEN** no hay campeón

#### Scenario: Tras una generación
- **WHEN** termina una generación
- **THEN** el campeón es el individuo de mayor fitness de esa generación

### Requirement: Líder
En todo momento el entrenamiento SHALL identificar a un líder: el auto en
carrera que más avanzó o, si no queda ninguno en carrera, el que llegó más
lejos.

#### Scenario: Cambio de líder
- **WHEN** un auto en carrera supera en distancia al líder actual
- **THEN** ese auto pasa a ser el líder

#### Scenario: Líder chocado
- **WHEN** el líder choca y quedan otros autos en carrera
- **THEN** el líder pasa a ser el auto en carrera que más avanzó

### Requirement: Cambios de configuración durante el entrenamiento
Los cambios de población, élite, selección, mutación, cruce, función de
fitness, duración máxima, eliminar a los lentos, modo de tráfico, escenario y velocidad máxima del
auto SHALL aplicarse desde la generación siguiente, sin reiniciar el
entrenamiento. Un cambio en la forma de la red, en su activación o en los
sensores MUST requerir un entrenamiento nuevo.

#### Scenario: Cambio de mutación
- **WHEN** se cambia la fuerza de mutación durante la generación 4
- **THEN** la generación 4 sigue sin alteraciones y la generación 5 se forma con la fuerza nueva

#### Scenario: Cambio de población
- **WHEN** se cambia la población de 100 a 200 durante una generación
- **THEN** la generación siguiente tiene 200 individuos y el entrenamiento conserva su número de generación y su historial

### Requirement: Continuar desde un cerebro
Un entrenamiento SHALL poder empezar a partir de un cerebro existente. Su
primera población MUST contener una copia exacta de ese cerebro y el resto
formarse como hijos mutados de él, y la cuenta de generaciones SHALL continuar
desde las que el cerebro ya tenía.

#### Scenario: Población inicial desde un cerebro
- **WHEN** se inicia un entrenamiento a partir de un cerebro con 40 generaciones
- **THEN** el primer individuo tiene una red idéntica a la del cerebro, los demás son hijos mutados de él y la generación en curso es la 41

#### Scenario: Forma heredada
- **WHEN** se inicia un entrenamiento a partir de un cerebro de 9 sensores y dos capas ocultas
- **THEN** todos los individuos tienen 9 sensores y esa misma forma de red
