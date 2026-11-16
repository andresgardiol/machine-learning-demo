# Spec Delta

## ADDED Requirements

### Requirement: Valores de cada neurona sobre una grilla
Para una red de dos entradas SHALL poder calcularse, en una sola pasada por
punto, el valor de todas sus neuronas en cada punto de una grilla del plano,
con lo apagado tenido en cuenta. El valor de la salida MUST ser el mismo que
usa el fondo del plano. Sin DOM y reproducible.

#### Scenario: Todas las neuronas
- **WHEN** se pide la grilla de 50 por 50 de una red de 2, 4 y 1
- **THEN** se obtienen 2500 valores para cada una de las 4 neuronas ocultas y para la salida

#### Scenario: Igual al fondo
- **WHEN** se comparan los valores de la salida con los del fondo del plano
- **THEN** son los mismos

#### Scenario: Neurona apagada
- **WHEN** una neurona oculta está apagada
- **THEN** su mapa vale cero en todos los puntos

### Requirement: Historia de los pesos
El recorrido del aprendizaje SHALL guardar cómo fue cada peso y cada sesgo al
terminar cada época, con a lo sumo 300 muestras por peso: al llenarse, se
conserva una de cada dos. Un cambio a mano MUST quedar anotado en la época en
que se hizo. Empezar de nuevo vacía la historia.

#### Scenario: Una muestra por época
- **WHEN** el aprendizaje completa 40 épocas
- **THEN** la historia de cada peso tiene 40 valores, cada uno con su época

#### Scenario: Muchas épocas
- **WHEN** el aprendizaje completa 5000 épocas
- **THEN** la historia de cada peso tiene 300 valores o menos, repartidos de la primera a la última época

#### Scenario: Cambio a mano
- **WHEN** la persona cambia un peso a mano en la época 30
- **THEN** la historia de ese peso marca esa época como un cambio a mano

#### Scenario: Reiniciar
- **WHEN** se reinician los pesos
- **THEN** la historia queda vacía

#### Scenario: Mismo resultado
- **WHEN** se repite el mismo aprendizaje con la misma semilla
- **THEN** la historia es idéntica
