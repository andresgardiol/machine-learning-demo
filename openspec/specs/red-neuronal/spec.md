# red-neuronal Specification

## Purpose

Define la red neuronal del laboratorio: una serie de capas de neuronas que
convierte números de entrada en salidas sí/no mediante pesos y sesgos. Es la
misma red para manejar el auto y, más adelante, para inspeccionarla y
experimentar con ella.

## Requirements

### Requirement: Estructura por capas
Una red SHALL tener una capa de entradas, de 0 a 3 capas ocultas con 1 a 16
neuronas cada una y una capa de salidas. Cada neurona de una capa MUST estar
conectada con todas las de la capa anterior, con un peso por conexión y un
sesgo (bias) propio. Una forma fuera de esos límites MUST rechazarse indicando
los límites válidos.

#### Scenario: Red con una capa oculta
- **WHEN** se crea una red de 6 entradas, una capa oculta de 6 neuronas y 4 salidas
- **THEN** la red tiene 36 pesos y 6 sesgos en la capa oculta, y 24 pesos y 4 sesgos en la capa de salida

#### Scenario: Red sin capas ocultas
- **WHEN** se crea una red de 6 entradas y 4 salidas sin capas ocultas
- **THEN** la red tiene 24 pesos y 4 sesgos, y cada salida está conectada directamente con todas las entradas

#### Scenario: Forma fuera de los límites
- **WHEN** se pide una red con 4 capas ocultas o con una capa oculta de 20 neuronas
- **THEN** la red no se crea y se informa cuáles son los límites

### Requirement: Cálculo de las salidas
La red SHALL calcular sus salidas capa por capa: el valor de cada neurona es su
función de activación aplicada a la suma de cada valor de la capa anterior
multiplicado por su peso, más el sesgo de la neurona.

#### Scenario: Suma positiva
- **WHEN** una red de 2 entradas y 1 salida con pesos 0,5 y -0,5 y sesgo 0,1 recibe las entradas 1 y 0,5
- **THEN** la suma es 0,35 y la salida es 1

#### Scenario: Suma negativa
- **WHEN** esa misma red recibe las entradas 0 y 1
- **THEN** la suma es -0,4 y la salida es 0

#### Scenario: Cantidad de entradas incorrecta
- **WHEN** una red de 6 entradas recibe 5 valores
- **THEN** el cálculo se rechaza indicando cuántas entradas espera la red

### Requirement: Salidas sí/no
La capa de salida SHALL usar siempre la activación escalón: la salida vale 1
cuando la suma es mayor que cero y 0 en cualquier otro caso.

#### Scenario: Suma exactamente cero
- **WHEN** la suma de una neurona de salida es exactamente 0
- **THEN** su salida es 0

### Requirement: Activación de las capas ocultas
Las capas ocultas SHALL usar una misma función de activación, elegible entre
escalón, sigmoide, tangente hiperbólica y ReLU, con escalón por defecto. Una
activación desconocida MUST rechazarse.

#### Scenario: Escalón
- **WHEN** la activación es escalón y la suma de una neurona oculta es 0,2
- **THEN** su valor es 1

#### Scenario: Sigmoide
- **WHEN** la activación es sigmoide y la suma de una neurona oculta es 0
- **THEN** su valor es 0,5

#### Scenario: Tangente hiperbólica
- **WHEN** la activación es tangente hiperbólica y la suma de una neurona oculta es 0
- **THEN** su valor es 0

#### Scenario: ReLU
- **WHEN** la activación es ReLU y las sumas de dos neuronas ocultas son -0,7 y 0,7
- **THEN** sus valores son 0 y 0,7

#### Scenario: Activación desconocida
- **WHEN** se pide una red con una activación que no es ninguna de las cuatro
- **THEN** la red no se crea y se informa cuáles son las activaciones admitidas

### Requirement: Inicialización reproducible
Una red nueva SHALL tener todos sus pesos y sesgos elegidos al azar entre -1 y
1, determinados por completo por una semilla.

#### Scenario: Misma semilla
- **WHEN** se crean dos redes de la misma forma con la misma semilla
- **THEN** todos sus pesos y sesgos coinciden

#### Scenario: Semilla distinta
- **WHEN** se crean dos redes de la misma forma con semillas distintas
- **THEN** sus pesos y sesgos difieren

#### Scenario: Valores dentro del rango
- **WHEN** se crea una red nueva
- **THEN** todos sus pesos y sesgos están entre -1 y 1

### Requirement: Valores de todas las neuronas
Además de las salidas, la red SHALL poder informar el valor que tomó cada
neurona de cada capa en un cálculo, para mostrarlo en pantalla.

#### Scenario: Valores por capa
- **WHEN** se pide el detalle de un cálculo en una red de 6 entradas, 6 neuronas ocultas y 4 salidas
- **THEN** se obtienen 6 valores de entrada, 6 de la capa oculta y 4 de salida, y los de salida coinciden con el resultado del cálculo

### Requirement: Cálculo sin efectos
Calcular las salidas MUST NOT modificar la red: las mismas entradas SHALL dar
siempre las mismas salidas.

#### Scenario: Cálculo repetido
- **WHEN** se calculan las salidas de una red mil veces con distintas entradas y luego otra vez con las primeras
- **THEN** el último resultado es igual al primero y los pesos y sesgos no cambiaron
