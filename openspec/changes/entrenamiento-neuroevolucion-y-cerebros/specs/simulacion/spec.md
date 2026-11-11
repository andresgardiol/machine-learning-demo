# Spec Delta

## ADDED Requirements

### Requirement: Varios autos en un mismo mundo
La simulación SHALL admitir uno o más autos que comparten la misma pista y el
mismo tráfico. Cada auto MUST tener su propio controlador, sus propios
sensores, su propia velocidad máxima y su propio progreso, percepción y estado
de choque.

#### Scenario: Controladores distintos
- **WHEN** un mundo tiene tres autos, uno que solo avanza, uno que avanza y gira a la izquierda y uno que no acciona nada
- **THEN** cada auto evoluciona según su controlador y tiene su propio progreso

#### Scenario: Un auto choca y los demás siguen
- **WHEN** uno de los autos choca contra un borde
- **THEN** ese auto queda chocado y detenido, y los demás siguen avanzando

### Requirement: Los autos no chocan entre sí
Los autos de un mismo mundo MUST NOT chocar entre sí ni detectarse con sus
sensores: solo chocan y perciben los bordes de la pista y el tráfico.

#### Scenario: Autos superpuestos
- **WHEN** dos autos ocupan la misma posición
- **THEN** ninguno queda chocado y las lecturas de sus sensores no cambian por la presencia del otro

### Requirement: Un auto se comporta igual solo o acompañado
La evolución de un auto en un mundo con varios autos MUST ser idéntica, paso a
paso, a la que tendría solo en un mundo con la misma semilla, la misma
configuración y el mismo controlador.

#### Scenario: Comparación con el mundo de un auto
- **WHEN** se simula un mundo con cincuenta autos y, por separado, cincuenta mundos de un auto con los mismos controladores
- **THEN** la posición, el ángulo, la velocidad y el estado de choque de cada auto coinciden en todos los pasos

### Requirement: Reproducibilidad con varios autos
Un mundo con varios autos MUST producir exactamente la misma evolución cuando
se repiten la semilla, la configuración y los controladores.

#### Scenario: Repetición con población
- **WHEN** se ejecutan dos veces mil pasos de un mundo de cien autos con la misma semilla y los mismos controladores
- **THEN** el estado de todos los autos y del tráfico coincide en todos los pasos

### Requirement: Reinicio con varios autos
Al reiniciar un mundo con varios autos, todos SHALL volver a la posición de
salida, detenidos y sin chocar, y el tráfico a su disposición inicial.

#### Scenario: Reinicio de una población
- **WHEN** se reinicia un mundo en el que algunos autos chocaron y otros avanzaron
- **THEN** todos los autos están en la salida sin chocar y el estado es idéntico al de un mundo recién creado

### Requirement: Velocidad de simulación
La simulación SHALL poder mostrarse a 1, 2, 4 y 8 veces la velocidad real, y a
la máxima velocidad que permita el equipo. El resultado MUST ser el mismo a
cualquier velocidad, y la aplicación MUST seguir respondiendo a la persona
mientras corre acelerada.

#### Scenario: Mismo resultado acelerado
- **WHEN** la misma simulación avanza seiscientos pasos a velocidad normal y a velocidad 8
- **THEN** el estado final es idéntico

#### Scenario: Velocidad máxima con respuesta
- **WHEN** la simulación corre a la máxima velocidad y la persona presiona pausa
- **THEN** la simulación se pausa en menos de medio segundo

#### Scenario: Página oculta
- **WHEN** la página queda oculta mientras la simulación corre acelerada
- **THEN** la simulación se detiene y continúa desde el mismo estado al volver a mostrarse
