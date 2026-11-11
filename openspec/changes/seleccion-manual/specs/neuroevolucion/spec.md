# Spec Delta

## MODIFIED Requirements

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
a la siguiente sin ningún cambio, en una cantidad configurable de 0 a 10 (1
por defecto) que nunca supera el tamaño de la población menos uno.

#### Scenario: Élite de uno
- **WHEN** termina una generación con élite 1
- **THEN** la generación siguiente contiene un individuo cuya red es idéntica a la del mejor de la anterior

#### Scenario: Sin élite
- **WHEN** termina una generación con élite 0 y mutación mayor que cero
- **THEN** ningún individuo de la generación siguiente tiene garantizada una red idéntica a una de la anterior

#### Scenario: Con selección manual no se usa
- **WHEN** termina una generación con selección manual, un padre elegido y élite 3
- **THEN** la generación siguiente contiene una sola copia sin cambios, la del padre elegido

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

## ADDED Requirements

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
