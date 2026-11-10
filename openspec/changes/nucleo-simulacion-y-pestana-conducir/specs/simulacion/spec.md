# Spec Delta

## Purpose

Hace avanzar el mundo del laboratorio (auto y tráfico) en pasos fijos y
reproducibles, con la física del auto y la detección de choques, sin depender
de un navegador ni de una pantalla.

## ADDED Requirements

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
