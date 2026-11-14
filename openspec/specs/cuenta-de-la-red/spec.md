# cuenta-de-la-red Specification

## Purpose
Desglosa la cuenta que hace una red neuronal en las operaciones de cada
neurona, permite recorrerla paso a paso y probarle cambios sin tocar la red
original. Es lo que deja mostrar el cálculo real de una red, y no una
animación que se le parece.

## Requirements

### Requirement: Cuenta desglosada
Para unas entradas dadas, la cuenta SHALL informar, por cada neurona que no
es de entrada: los valores que recibe, el peso de cada conexión, cada
producto, la suma de los productos, el sesgo, el total y la salida después de
la activación. Las salidas MUST ser exactamente las de la red al manejar.

#### Scenario: Una neurona
- **WHEN** una neurona recibe 0,5 y 1 con pesos 0,4 y −0,2 y sesgo 0,1
- **THEN** su cuenta informa los productos 0,2 y −0,2, la suma 0, el sesgo 0,1 y el total 0,1

#### Scenario: Igual que al manejar
- **WHEN** se compara, para las mismas entradas, la salida de la cuenta desglosada con la de la red que maneja el auto
- **THEN** son idénticas, bit a bit, en mil entradas al azar con semilla y con las cuatro activaciones

#### Scenario: Neurona de salida
- **WHEN** el total de una neurona de salida es mayor que cero
- **THEN** su cuenta informa que la activación es el escalón y que la salida es 1

#### Scenario: Sin efectos
- **WHEN** se pide la cuenta de una red
- **THEN** la red no cambia

### Requirement: Recorrido paso a paso
La cuenta SHALL poder recorrerse en orden: capa por capa, y dentro de cada
capa neurona por neurona, y dentro de cada neurona en cuatro operaciones:
productos, suma, sesgo y activación. SHALL poder avanzarse de a una
operación, una neurona, una capa o hasta el final, y saberse en todo momento
qué está hecho y qué falta.

#### Scenario: De a una operación
- **WHEN** se avanza una operación desde el principio
- **THEN** quedan hechos los productos de la primera neurona de la primera capa oculta, y nada más

#### Scenario: De a una neurona
- **WHEN** se avanza una neurona con una neurona a medio hacer
- **THEN** se completan las operaciones que le faltaban a esa neurona, y nada más

#### Scenario: De a una capa
- **WHEN** se avanza una capa
- **THEN** se completan las neuronas que faltaban de la capa en curso

#### Scenario: Hasta el final
- **WHEN** se avanza hasta el final
- **THEN** quedan hechas todas las neuronas y la cuenta informa las salidas

#### Scenario: Al terminar
- **WHEN** la cuenta está completa y se pide avanzar
- **THEN** informa que terminó, sin cambiar nada

#### Scenario: Red sin capas ocultas
- **WHEN** la red solo tiene entradas y salidas
- **THEN** el recorrido empieza por la primera neurona de salida

### Requirement: Cambios de prueba
A una red SHALL poder aplicársele un conjunto de cambios de prueba: otro
valor para un peso o un sesgo, una conexión apagada y una neurona o una
entrada apagada. El resultado es otra red; la original MUST NOT cambiar. Sin
cambios, la red resultante MUST dar exactamente las mismas salidas.

#### Scenario: Peso cambiado
- **WHEN** se cambia un peso de 0,4 a −0,9
- **THEN** la cuenta de esa neurona usa −0,9 y la red original sigue con 0,4

#### Scenario: Conexión apagada
- **WHEN** se apaga una conexión
- **THEN** su producto vale 0, sea cual sea la entrada

#### Scenario: Neurona apagada
- **WHEN** se apaga una neurona de una capa oculta
- **THEN** su salida vale 0, con cualquier activación, y las neuronas siguientes reciben 0 de ella

#### Scenario: Salida apagada
- **WHEN** se apaga la neurona de salida de doblar a la izquierda
- **THEN** la red nunca decide doblar a la izquierda

#### Scenario: Entrada apagada
- **WHEN** se apaga la entrada de un sensor
- **THEN** la red recibe 0 de ese sensor, vea lo que vea

#### Scenario: Sin cambios
- **WHEN** se aplica un conjunto vacío de cambios
- **THEN** las salidas son idénticas a las de la red original

### Requirement: Cambios que se deshacen
El conjunto de cambios SHALL llevar el orden en que se hicieron, poder
deshacer el último y poder vaciarse. Cambiar dos veces lo mismo cuenta como
un solo cambio, con el último valor.

#### Scenario: Deshacer el último
- **WHEN** se apaga una neurona, se cambia un peso y se deshace
- **THEN** el peso vuelve a su valor y la neurona sigue apagada

#### Scenario: Mismo peso dos veces
- **WHEN** se cambia el mismo peso a 0,2 y después a 0,6, y se deshace
- **THEN** el peso vuelve a su valor original, no a 0,2

#### Scenario: Vaciar
- **WHEN** se vacía el conjunto
- **THEN** la red resultante es igual a la original

#### Scenario: Volver al valor original
- **WHEN** un peso cambiado se vuelve a poner en su valor original
- **THEN** deja de contar como cambio

### Requirement: Cuenta reproducible y sin navegador
La cuenta desglosada, el recorrido y los cambios de prueba SHALL funcionar
sin navegador y dar siempre el mismo resultado con los mismos datos.

#### Scenario: Sin navegador
- **WHEN** se recorre una cuenta entera en un entorno sin DOM
- **THEN** termina y da las mismas salidas que la red
