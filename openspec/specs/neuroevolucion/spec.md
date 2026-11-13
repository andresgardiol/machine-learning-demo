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
cuatro: ventaja sobre el tráfico (la mayor ventaja que alcanzó en carrera: lo
que avanzó menos lo que avanzó el tráfico en el mismo tiempo, nunca menor que
cero, en metros), distancia (la mayor distancia alcanzada, en metros), tiempo
sin chocar (segundos en carrera) y velocidad media (distancia dividida por el
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

### Requirement: Selección de los padres
Con selección automática, al terminar una generación los individuos SHALL
ordenarse de mayor a menor fitness, resolviendo los empates por su posición en
la población. Los padres de la generación siguiente SHALL ser los mejores, en
una proporción configurable del 1 % al 50 % de la población (10 % por
defecto), nunca menos de uno.

#### Scenario: Diez por ciento
- **WHEN** termina una generación de 100 individuos con selección del 10 %
- **THEN** los padres son los 10 individuos de mayor fitness

#### Scenario: Empate
- **WHEN** dos individuos tienen el mismo fitness
- **THEN** queda primero el que estaba antes en la población

#### Scenario: Población mínima
- **WHEN** termina una generación de 2 individuos con selección del 1 %
- **THEN** hay un padre

#### Scenario: Con selección manual no se usa
- **WHEN** termina una generación con selección manual y selección del 10 %
- **THEN** los individuos de mayor fitness no pasan a ser padres por serlo

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
Un entrenamiento MUST quedar determinado por su semilla, su configuración, los
cambios de configuración hechos en cada generación y las elecciones de padre
hechas o deshechas en cada paso: repetirlos SHALL producir el mismo historial
y el mismo campeón, en un mismo navegador o entorno.

#### Scenario: Repetición idéntica
- **WHEN** se ejecutan dos entrenamientos de diez generaciones con la misma semilla y la misma configuración
- **THEN** el mejor fitness y el promedio de cada generación coinciden, y los campeones finales tienen redes idénticas

#### Scenario: Semilla distinta
- **WHEN** se ejecutan dos entrenamientos que solo difieren en la semilla
- **THEN** las redes de la población inicial son distintas

#### Scenario: Mismas elecciones
- **WHEN** se ejecutan dos entrenamientos con selección manual, la misma semilla y las mismas elecciones y deshechas en los mismos pasos
- **THEN** las poblaciones de cada generación son idénticas y el historial coincide

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
Los cambios de población, modo de selección, élite, selección, mutación,
cruce, función de fitness, duración máxima, eliminar a los lentos, modo de
tráfico, escenario y velocidad máxima del auto SHALL aplicarse desde la
generación siguiente, sin reiniciar el entrenamiento. Un cambio en la forma de
la red, en su activación o en los sensores MUST requerir un entrenamiento
nuevo.

#### Scenario: Cambio de mutación
- **WHEN** se cambia la fuerza de mutación durante la generación 4
- **THEN** la generación 4 sigue sin alteraciones y la generación 5 se forma con la fuerza nueva

#### Scenario: Cambio de población
- **WHEN** se cambia la población de 100 a 200 durante una generación
- **THEN** la generación siguiente tiene 200 individuos y el entrenamiento conserva su número de generación y su historial

#### Scenario: Cambio de modo de selección
- **WHEN** se cambia la selección de automática a manual durante la generación 6
- **THEN** la generación 6 sigue sin alteraciones y la generación 7 se forma con selección manual

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

### Requirement: Modo de selección
El entrenamiento SHALL ofrecer dos modos de selección: automática (por
defecto), en la que los padres salen del orden de fitness, y manual, en la que
la generación siguiente sale de un padre elegido. La generación MUST terminar
por los mismos motivos en los dos modos.

#### Scenario: Estado por defecto
- **WHEN** se crea un entrenamiento sin indicar el modo de selección
- **THEN** la selección es automática y el entrenamiento se comporta igual que antes de existir el modo manual

#### Scenario: Fin de generación con selección manual
- **WHEN** todos los autos quedan fuera de carrera con selección manual
- **THEN** la generación termina con el motivo "todos quedaron fuera de carrera" y empieza la siguiente sin esperar ninguna elección

#### Scenario: Volver a selección automática
- **WHEN** se cambia la selección de manual a automática
- **THEN** desde la generación siguiente los padres vuelven a salir del orden de fitness

### Requirement: Elegir al líder como padre
En cualquier momento de una generación, el entrenamiento SHALL permitir tomar
al líder de ese momento como padre elegido, con su red, el número de la
generación y el fitness que llevaba al elegirlo. Elegir de nuevo SHALL
reemplazar al padre elegido por el líder nuevo.

#### Scenario: Elegir durante una generación
- **WHEN** se elige al líder en la generación 4, cuando lleva 310 metros
- **THEN** el padre elegido tiene la red de ese auto y registra la generación 4 y 310 metros

#### Scenario: Elegir dos veces en la misma generación
- **WHEN** se elige al líder, otro auto pasa a ser el líder y se elige de nuevo
- **THEN** el padre elegido es el segundo auto

#### Scenario: Elegir al que ya es el padre
- **WHEN** el líder es la copia sin cambios del padre elegido y se lo elige otra vez
- **THEN** el padre elegido y el historial de elecciones no cambian

#### Scenario: La generación en curso no cambia
- **WHEN** se elige al líder a mitad de una generación
- **THEN** los autos de esa generación siguen manejando igual

### Requirement: Generación siguiente desde el padre elegido
Con selección manual y un padre elegido, la generación siguiente SHALL estar
formada por una copia exacta del padre, en la primera posición, y por hijos
mutados de él con la fuerza y la probabilidad de mutación vigentes, hasta
completar el tamaño de la población. Si durante una generación no se elige a
nadie, el padre elegido MUST seguir siendo el mismo.

#### Scenario: Copia exacta y mutaciones
- **WHEN** termina una generación con selección manual, un padre elegido, población de 100 y fuerza de mutación del 10 %
- **THEN** la generación siguiente tiene 100 individuos, el primero con una red idéntica a la del padre y los otros 99 con redes distintas de la del padre

#### Scenario: Mutación en cero
- **WHEN** termina una generación con selección manual, un padre elegido y fuerza de mutación del 0 %
- **THEN** todos los individuos de la generación siguiente tienen una red idéntica a la del padre

#### Scenario: Generación sin elección
- **WHEN** pasan dos generaciones seguidas sin elegir a nadie después de haber elegido un padre
- **THEN** las dos generaciones siguientes salen del mismo padre

#### Scenario: La copia del padre se distingue
- **WHEN** empieza una generación formada desde un padre elegido
- **THEN** el entrenamiento informa un individuo de élite, el primero, que es la copia del padre

### Requirement: Sin padre elegido
Con selección manual y sin padre elegido, la generación siguiente SHALL ser
una población de redes al azar nueva, distinta de todas las anteriores del
entrenamiento y determinada por la semilla y el número de generación.

#### Scenario: Generaciones al azar
- **WHEN** un entrenamiento con selección manual pasa de la generación 1 a la 3 sin elegir a nadie
- **THEN** las redes de las generaciones 1, 2 y 3 son distintas entre sí

#### Scenario: Azar reproducible
- **WHEN** se repite ese entrenamiento con la misma semilla
- **THEN** las redes de cada generación son las mismas que en la corrida anterior

#### Scenario: Sin individuo de élite
- **WHEN** empieza una generación al azar
- **THEN** el entrenamiento informa cero individuos de élite

### Requirement: Deshacer la elección
El entrenamiento SHALL permitir deshacer la última elección: el padre elegido
vuelve a ser el anterior y, si no había anterior, no queda ninguno. SHALL
recordar las últimas 20 elecciones. Deshacer MUST NOT cambiar la generación en
curso.

#### Scenario: Deshacer con dos elecciones
- **WHEN** se eligió un padre en la generación 3 y otro en la 5, y se deshace
- **THEN** el padre elegido vuelve a ser el de la generación 3

#### Scenario: Deshacer la única elección
- **WHEN** hay una sola elección y se deshace
- **THEN** no queda padre elegido y la generación siguiente será al azar

#### Scenario: Deshacer sin elecciones
- **WHEN** no hay ninguna elección y se pide deshacer
- **THEN** nada cambia

#### Scenario: Más de veinte elecciones
- **WHEN** se hacen 21 elecciones y después se deshace 20 veces
- **THEN** no queda padre elegido, porque la primera elección ya no se recordaba

### Requirement: Padre al cambiar de modo
Al pasar de selección automática a manual sin haber elegido a nadie, el padre
elegido SHALL ser el campeón de la generación que termina, para no perder lo
aprendido. Al pasar de manual a automática, las elecciones MUST olvidarse y la
generación siguiente SHALL formarse por fitness a partir de la población de
ese momento.

#### Scenario: De automática a manual
- **WHEN** se cambia a selección manual durante la generación 12 y no se elige a nadie antes de que termine
- **THEN** la generación 13 sale del campeón de la generación 12

#### Scenario: Elegir antes de que rija el cambio
- **WHEN** se cambia a selección manual durante la generación 12 y se elige al líder antes de que termine
- **THEN** la generación 13 sale del líder elegido y no del campeón

#### Scenario: De manual a automática
- **WHEN** se cambia a selección automática con un padre elegido
- **THEN** la generación siguiente se forma con los mejores por fitness de la población en curso y no queda padre elegido

#### Scenario: Volver a manual más tarde
- **WHEN** después de varias generaciones automáticas se vuelve a selección manual sin elegir a nadie
- **THEN** el padre es el campeón de la generación que termina, no el que se había elegido antes

### Requirement: Padre al continuar desde un cerebro
Un entrenamiento con selección manual que empieza a partir de un cerebro SHALL
tener a ese cerebro como padre elegido inicial.

#### Scenario: Continuar un cerebro con selección manual
- **WHEN** se inicia un entrenamiento con selección manual a partir de un cerebro y la primera generación termina sin elegir a nadie
- **THEN** la segunda generación sale de ese mismo cerebro

### Requirement: Cerebro del entrenamiento
El cerebro que un entrenamiento entrega para guardar SHALL ser el del campeón
con selección automática y el del padre elegido con selección manual, y MUST
registrar el modo de selección. Con selección manual y sin padre elegido, el
entrenamiento MUST NOT entregar ningún cerebro.

#### Scenario: Selección automática
- **WHEN** se pide el cerebro de un entrenamiento con selección automática tras la generación 8
- **THEN** el cerebro tiene la red del campeón de la generación 8

#### Scenario: Selección manual
- **WHEN** se pide el cerebro de un entrenamiento con selección manual cuyo padre se eligió en la generación 5 con 310 metros
- **THEN** el cerebro tiene la red de ese padre, registra 310 metros como mejor fitness y selección manual

#### Scenario: Selección manual sin padre
- **WHEN** se pide el cerebro de un entrenamiento con selección manual sin padre elegido
- **THEN** no se entrega ningún cerebro

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

### Requirement: Pistas del entrenamiento
El entrenamiento SHALL correr sobre una lista de una o más pistas del
catálogo, la calle recta sola por defecto. Con más de una, cada generación
corre entera en una sola pista y la siguiente pasa a la que sigue en la
lista, volviendo a empezar al terminar. Un cambio en la lista MUST regir
desde la generación siguiente. Una lista vacía o con pistas desconocidas MUST
ajustarse al valor por defecto.

#### Scenario: Estado por defecto
- **WHEN** empieza un entrenamiento sin configurar nada
- **THEN** todas las generaciones corren en la calle recta

#### Scenario: Dos pistas alternadas
- **WHEN** se entrena con la lista calle recta y óvalo
- **THEN** las generaciones 1, 3 y 5 corren en la calle recta y las generaciones 2, 4 y 6 en el óvalo

#### Scenario: Una generación, una pista
- **WHEN** corre una generación con varias pistas en la lista
- **THEN** todos los individuos de esa generación manejan en la misma pista

#### Scenario: Cambio durante una generación
- **WHEN** se agrega el riñón a la lista durante una generación
- **THEN** la generación en curso termina en su pista y el riñón entra en el turno desde la generación siguiente

#### Scenario: Volver a una sola pista
- **WHEN** se restablece la configuración después de entrenar en varias pistas
- **THEN** desde la generación siguiente todas corren en la calle recta

#### Scenario: Alternancia reproducible
- **WHEN** se repite un entrenamiento con la misma semilla y la misma lista de pistas
- **THEN** cada generación corre en la misma pista y resulta la misma población

### Requirement: Ventaja en un circuito
En un circuito, la función de fitness ventaja SHALL medirse igual que en la
calle, contra el ritmo de referencia de 10 m/s (el del tráfico), aunque no
haya vehículos: el progreso acumulado del auto menos lo que habría avanzado
ese ritmo en el mismo tiempo. Así premia avanzar en el sentido correcto, dar
más vueltas y darlas más rápido.

#### Scenario: Dos vueltas en un minuto
- **WHEN** un auto da dos vueltas a un circuito de 600 metros en 60 segundos
- **THEN** su fitness por ventaja es 600

#### Scenario: Sentido contrario
- **WHEN** un auto recorre el circuito en sentido contrario durante toda la generación
- **THEN** su fitness por ventaja es 0

#### Scenario: Más rápido vale más
- **WHEN** dos autos completan una vuelta al mismo circuito, uno en 40 segundos y otro en 55
- **THEN** el fitness por ventaja del primero es mayor que el del segundo

### Requirement: Vueltas de un individuo
El entrenamiento SHALL poder informar, para cada individuo de una generación
que corre en un circuito, cuántas vueltas lleva: su mayor progreso dividido
por el largo de una vuelta, nunca menos que cero. En la calle recta no hay
vueltas, y en un circuito la cuenta de vehículos superados es siempre cero.

#### Scenario: Vuelta y media
- **WHEN** el mayor progreso de un auto en un circuito de 600 metros es de 900 metros
- **THEN** lleva 1,5 vueltas

#### Scenario: Chocar no descuenta
- **WHEN** un auto choca después de completar una vuelta y cuarto
- **THEN** sigue llevando 1,25 vueltas

#### Scenario: Sin tráfico que superar
- **WHEN** una generación corre en un circuito
- **THEN** la cuenta de vehículos superados de cada individuo es 0

### Requirement: Aprendizaje en el óvalo
Con los valores por defecto y el óvalo como única pista, la población SHALL
aprender a dar la vuelta. La medida es fija: con las semillas de
entrenamiento 1 a 8, se mira si el campeón de la generación 60, manejando
solo durante 60 segundos, completa al menos una vuelta. Eso MUST cumplirse en
al menos 5 de las 8 semillas.

#### Scenario: Óvalo con los valores por defecto
- **WHEN** se hace la medida
- **THEN** el campeón completa al menos una vuelta en 5 o más de las 8 semillas

#### Scenario: Medida reproducible
- **WHEN** se repite la medida
- **THEN** da exactamente el mismo resultado
