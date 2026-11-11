# simulacion Specification

## Purpose

Hace avanzar el mundo del laboratorio (auto y tráfico) en pasos fijos y
reproducibles, con la física del auto y la detección de choques, sin depender
de un navegador ni de una pantalla.

## Requirements

### Requirement: Avance en pasos fijos
La simulación SHALL avanzar en pasos de duración fija, de modo que el resultado
no dependa de la frecuencia de refresco de la pantalla ni de la velocidad del
equipo.

#### Scenario: Misma evolución en pantallas distintas
- **WHEN** la misma simulación corre durante diez segundos simulados en una pantalla de 60 Hz y en una de 144 Hz
- **THEN** el estado final del auto y del tráfico es idéntico en ambas

#### Scenario: Regreso tras una interrupción larga
- **WHEN** la ventana estuvo oculta varios segundos y vuelve a mostrarse
- **THEN** la simulación continúa desde donde estaba sin saltar hacia adelante de golpe

### Requirement: Resultado reproducible
La simulación MUST producir exactamente la misma evolución cuando se repiten la
semilla, la configuración y la secuencia de controles, en un mismo navegador o
entorno de ejecución.

#### Scenario: Repetición idéntica
- **WHEN** se ejecutan dos simulaciones con la misma semilla, la misma configuración y los mismos controles paso a paso
- **THEN** la posición, el ángulo y la velocidad del auto y de cada vehículo del tráfico coinciden en todos los pasos

#### Scenario: Semilla distinta
- **WHEN** se ejecutan dos simulaciones que solo difieren en la semilla
- **THEN** la disposición del tráfico es distinta

### Requirement: Ejecución sin navegador
La simulación SHALL poder ejecutarse por completo sin pantalla ni navegador,
para probarla de forma automática y, más adelante, acelerarla sin dibujar.

#### Scenario: Corrida automática
- **WHEN** se ejecuta el conjunto de pruebas del núcleo desde la línea de comandos
- **THEN** la simulación avanza y se verifica sin abrir un navegador

### Requirement: Aceleración y velocidad máxima
El auto SHALL acelerar mientras se mantiene el control de avanzar, hasta una
velocidad máxima que no supera, y SHALL retroceder con una velocidad máxima
menor que la de avance.

#### Scenario: Acelerar hasta el tope
- **WHEN** se mantiene el control de avanzar durante un tiempo prolongado
- **THEN** la velocidad crece de forma progresiva y se estabiliza en la velocidad máxima

#### Scenario: Marcha atrás más lenta
- **WHEN** se mantiene el control de retroceder durante un tiempo prolongado
- **THEN** el auto retrocede y su velocidad se estabiliza en un tope menor que el de avance

### Requirement: Velocidad máxima configurable
La velocidad máxima de avance del auto SHALL poder configurarse entre 12 y
40 m/s, con 20 m/s por defecto, siempre por encima de la velocidad del
tráfico. La marcha atrás SHALL llegar a la mitad de esa velocidad. Un valor
fuera de rango MUST ajustarse al límite válido más cercano. La velocidad
máxima SHALL poder cambiarse en marcha, sin reiniciar la simulación. La percepción
SHALL expresar la velocidad respecto de la máxima configurada.

#### Scenario: Velocidad por defecto
- **WHEN** se crea un auto sin indicar velocidad máxima y se mantiene el control de avanzar
- **THEN** la velocidad se estabiliza en 20 m/s

#### Scenario: Auto más rápido
- **WHEN** se configura una velocidad máxima de 30 m/s y se mantiene el control de avanzar
- **THEN** la velocidad se estabiliza en 30 m/s y la velocidad de la percepción es 1

#### Scenario: Valor fuera de rango
- **WHEN** se pide una velocidad máxima de 5 m/s
- **THEN** el auto queda con 12 m/s

#### Scenario: Cambio en marcha
- **WHEN** se cambia la velocidad máxima mientras el auto avanza
- **THEN** la simulación sigue sin reiniciarse y, si el auto iba más rápido que el nuevo tope, pasa a ir a ese tope

### Requirement: Fricción
El auto SHALL perder velocidad de forma progresiva hasta detenerse cuando no se
acciona avanzar ni retroceder.

#### Scenario: Soltar los controles
- **WHEN** el auto va a velocidad máxima y se sueltan todos los controles
- **THEN** la velocidad disminuye paso a paso hasta quedar exactamente en cero

### Requirement: Giro
El auto SHALL girar solo mientras se mueve, y SHALL invertir el sentido del
giro al ir marcha atrás, como un auto real.

#### Scenario: Giro detenido
- **WHEN** el auto está detenido y se acciona izquierda o derecha
- **THEN** el auto no cambia de orientación

#### Scenario: Giro avanzando
- **WHEN** el auto avanza y se acciona izquierda
- **THEN** el auto gira hacia su izquierda

#### Scenario: Giro en marcha atrás
- **WHEN** el auto retrocede y se acciona izquierda
- **THEN** la cola del auto se desplaza hacia la izquierda, al revés que avanzando

### Requirement: Choque
La simulación SHALL marcar el auto como chocado cuando su contorno toca un
borde de la pista o un vehículo del tráfico. Un auto chocado MUST quedar
detenido y dejar de responder a los controles hasta que se reinicie.

#### Scenario: Choque contra el borde
- **WHEN** el contorno del auto toca un borde de la pista
- **THEN** el auto queda marcado como chocado y detenido

#### Scenario: Choque contra el tráfico
- **WHEN** el contorno del auto toca el contorno de un vehículo del tráfico
- **THEN** el auto queda marcado como chocado y detenido

#### Scenario: Controles ignorados tras chocar
- **WHEN** el auto está chocado y se acciona cualquier control
- **THEN** el auto no se mueve

### Requirement: Reinicio
La simulación SHALL poder reiniciarse en cualquier momento, volviendo al estado
inicial con la misma semilla y la misma configuración.

#### Scenario: Reinicio tras chocar
- **WHEN** el auto está chocado y se reinicia la simulación
- **THEN** el auto vuelve a su posición inicial, sin chocar, y el tráfico vuelve a su disposición inicial

#### Scenario: Reinicio en marcha
- **WHEN** se reinicia la simulación mientras el auto avanza
- **THEN** el estado resultante es idéntico al de una simulación recién creada con la misma semilla

### Requirement: Pausa
La simulación SHALL poder pausarse y reanudarse sin alterar su evolución.

#### Scenario: Pausar y reanudar
- **WHEN** se pausa la simulación, pasa un tiempo y se reanuda
- **THEN** el estado al reanudar es el mismo que al pausar y la evolución posterior es la misma que sin la pausa

### Requirement: Sacar un auto de carrera
La simulación SHALL permitir sacar de carrera a un auto de un mundo con varios
autos, indicando el motivo. El auto MUST quedar detenido y fuera de carrera
como uno chocado, con ese motivo, y los demás MUST seguir sin cambios.

#### Scenario: Auto sacado por lento
- **WHEN** se saca de carrera a uno de tres autos con el motivo "demasiado lento"
- **THEN** ese auto queda detenido, fuera de carrera y con ese motivo, y los otros dos evolucionan igual que si no hubiera pasado nada

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
