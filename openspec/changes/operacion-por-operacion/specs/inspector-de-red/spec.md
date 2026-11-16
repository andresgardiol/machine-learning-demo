# Spec Delta

## MODIFIED Requirements

### Requirement: Paso animado
Cada paso del recorrido SHALL verse como un movimiento, no como un salto:
leer una entrada, como su relleno que llega al valor; multiplicar, como una
marca que viaja por esa sola conexión; sumar, como esa marca que entra a la
neurona; el sesgo, en su contorno; y la activación, como el relleno que llega
a su valor. Un paso de una neurona, una capa o un cuadro encadena esos
movimientos. Lo animado MUST ser el valor real.

#### Scenario: Productos
- **WHEN** se multiplica una entrada de una neurona
- **THEN** por esa conexión, y solo por esa, viaja una marca desde su origen hasta la neurona, con el color del signo y el tamaño del aporte

#### Scenario: Suma, sesgo y activación
- **WHEN** se suma un aporte, y más adelante se avanzan el sesgo y la activación
- **THEN** la marca entra a la neurona y el rótulo de la suma pasa al valor nuevo; después se marca su contorno con el sesgo y se llena su relleno hasta la salida

#### Scenario: Una neurona entera
- **WHEN** se avanza de a una neurona
- **THEN** todas sus operaciones se ven en orden, más breves, en un solo movimiento

#### Scenario: Una capa entera
- **WHEN** se avanza de a una capa
- **THEN** todas las neuronas de la capa reciben y se encienden a la vez, como una ola

#### Scenario: Un cuadro entero en pausa
- **WHEN** se avanza de a un cuadro con la reproducción en pausa
- **THEN** se ve una ola que cruza la red de las entradas a las salidas, y después se mueve el auto

#### Scenario: Tiempo real
- **WHEN** la red se reproduce de a cuadros en tiempo real
- **THEN** los valores se actualizan sin animaciones de paso

#### Scenario: No frena a la persona
- **WHEN** la persona pide otro paso antes de que termine la animación del anterior
- **THEN** la animación en curso se completa al instante y empieza la del paso nuevo

#### Scenario: Al ritmo elegido
- **WHEN** la reproducción avanza sola a 10 pasos por segundo
- **THEN** cada animación dura menos que el intervalo entre pasos y ninguna se encima con la siguiente

#### Scenario: Capa resumida
- **WHEN** el paso cae en una capa resumida
- **THEN** la animación se ve en la banda y en el cuadrito de la neurona

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** nada viaja ni crece: cada paso se marca con un cambio de estado

#### Scenario: Leer una entrada
- **WHEN** se lee una entrada
- **THEN** su neurona pasa de sin leer a mostrar su valor, con el relleno que llega a ese valor

#### Scenario: Paso atrás
- **WHEN** la persona vuelve un paso
- **THEN** la red muestra el estado anterior sin animación

### Requirement: Actividad en el momento
Las dos vistas SHALL mostrar el valor de cada neurona y lo que aporta cada
conexión con la cuenta que se les pasa, y actualizarse cada vez que esa
cuenta cambia, sin demora visible. Lo todavía no calculado en un recorrido
paso a paso (una entrada sin leer, una neurona, un aporte) MUST verse distinto
de lo calculado que vale cero. Lo que se marca como en curso MUST ser del
tamaño del paso: una conexión, una neurona o una capa entera.

#### Scenario: Red manejando
- **WHEN** el auto maneja y sus sensores cambian
- **THEN** el relleno de las neuronas cambia en el mismo cuadro, en el diagrama y en la tabla

#### Scenario: A medio calcular
- **WHEN** el recorrido paso a paso va por la segunda neurona de una capa
- **THEN** la primera muestra su valor, la segunda está marcada como la que se calcula y las demás se ven sin calcular

#### Scenario: Capa en curso
- **WHEN** el recorrido avanza de a neuronas
- **THEN** las conexiones que entran a la neurona en curso se destacan y las demás se atenúan

#### Scenario: De a capas
- **WHEN** el recorrido avanza de a capas
- **THEN** la capa en curso entera lleva la marca de en curso, como un solo marco alrededor de sus neuronas o de sus cuadritos, y todas las conexiones que le entran se destacan, no solo las de su primera neurona

#### Scenario: Mientras se anima una capa
- **WHEN** se anima el paso de una capa
- **THEN** las marcas viajan por todas las conexiones que entran a esa capa, y ninguna de esas conexiones está atenuada

#### Scenario: De a cuadros
- **WHEN** el recorrido avanza de a cuadros, en pausa o reproduciendo
- **THEN** ninguna neurona ni capa lleva la marca de en curso y nada se atenúa por el recorrido

#### Scenario: Cambiar el tamaño del paso
- **WHEN** la persona pasa de neuronas a capas con una capa a medio hacer
- **THEN** la marca pasa de la neurona a su capa entera, y las neuronas ya calculadas conservan su valor

#### Scenario: De a operaciones
- **WHEN** el recorrido avanza de a operaciones y va por la tercera entrada de una neurona
- **THEN** se destaca solo esa conexión, con sus dos extremos; las dos ya sumadas de esa neurona muestran su aporte sin destacarse; las que faltan se ven sin calcular, y el resto de la red se atenúa

#### Scenario: Cuenta sobre la conexión
- **WHEN** se multiplica una entrada
- **THEN** sobre esa conexión se lee el valor por el peso y, al terminar, el aporte

#### Scenario: Suma que se va juntando
- **WHEN** se sumaron tres de seis aportes de una neurona
- **THEN** junto a la neurona se lee la suma hasta acá, y la neurona todavía no muestra salida

#### Scenario: Entradas sin leer
- **WHEN** empieza la cuenta de un cuadro paso a paso
- **THEN** las entradas se ven sin leer hasta que su paso las lee

#### Scenario: Vista de pesos
- **WHEN** el recorrido avanza de a operaciones con la vista de pesos
- **THEN** la celda de la conexión en curso lleva la marca de en curso y las que faltan se ven sin calcular

#### Scenario: Sin detalle fino
- **WHEN** la cuenta que se le pasa al inspector no dice qué entradas van hechas, como en el Laboratorio
- **THEN** los aportes de una neurona aparecen todos juntos, como hasta ahora
