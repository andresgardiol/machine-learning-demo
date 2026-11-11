# Spec Delta

## Purpose

Da al auto su percepción del entorno: un abanico de rayos que miden a qué
distancia hay un obstáculo. Sus lecturas son los únicos números que una máquina
tendrá para decidir cómo manejar.

## ADDED Requirements

### Requirement: Rayos distribuidos en un abanico
El auto SHALL tener una cantidad configurable de rayos repartidos de forma
uniforme dentro de una apertura, centrada en la dirección hacia la que apunta
el auto. Con un solo rayo, este MUST apuntar exactamente hacia adelante.

#### Scenario: Abanico simétrico
- **WHEN** el auto tiene cinco rayos con una apertura de 90 grados
- **THEN** el rayo del medio apunta hacia adelante y los demás se reparten de forma simétrica, con los extremos a 45 grados a cada lado

#### Scenario: Un solo rayo
- **WHEN** el auto tiene un rayo
- **THEN** ese rayo apunta exactamente hacia adelante, sea cual sea la apertura

#### Scenario: Los rayos acompañan al auto
- **WHEN** el auto gira
- **THEN** todos los rayos giran con él manteniendo su disposición

### Requirement: Lectura normalizada
Cada rayo SHALL entregar una lectura entre 0 y 1: 0 cuando no detecta nada
dentro de su alcance, y un valor que crece a medida que el obstáculo está más
cerca, hasta 1 cuando lo toca.

#### Scenario: Sin obstáculo
- **WHEN** no hay ningún obstáculo dentro del alcance de un rayo
- **THEN** su lectura es 0

#### Scenario: Obstáculo a media distancia
- **WHEN** el obstáculo más cercano sobre un rayo está a la mitad de su alcance
- **THEN** su lectura es 0,5

#### Scenario: Varios obstáculos sobre el mismo rayo
- **WHEN** un rayo cruza dos obstáculos
- **THEN** su lectura corresponde al más cercano

### Requirement: Obstáculos detectados
Los rayos SHALL detectar los bordes de la pista y los vehículos del tráfico, y
MUST ignorar al propio auto.

#### Scenario: Borde de la pista
- **WHEN** un rayo alcanza un borde de la pista
- **THEN** su lectura es mayor que 0

#### Scenario: Vehículo del tráfico
- **WHEN** un rayo alcanza un vehículo del tráfico
- **THEN** su lectura es mayor que 0

### Requirement: Orden estable de las lecturas
Las lecturas SHALL entregarse siempre en el mismo orden, del rayo más a la
izquierda del auto al más a la derecha.

#### Scenario: Obstáculo a la izquierda
- **WHEN** solo hay un obstáculo a la izquierda del auto
- **THEN** las lecturas mayores que 0 están al principio de la lista

### Requirement: Configuración de los sensores
Los sensores SHALL admitir una cantidad de 1 a 100 rayos, un alcance de 1 a 25
largos de auto y una apertura de 10 a 360 grados. Los valores por defecto SHALL
ser 5 rayos, 3 largos de auto y 90 grados. Un valor fuera de rango MUST
ajustarse al límite válido más cercano.

#### Scenario: Valores por defecto
- **WHEN** se crea un auto sin configurar sus sensores
- **THEN** tiene 5 rayos, con alcance de 3 largos de auto y apertura de 90 grados

#### Scenario: Valor fuera de rango
- **WHEN** se pide una cantidad de 150 rayos
- **THEN** el auto queda con 100 rayos

#### Scenario: Restablecer
- **WHEN** se restablece la configuración de los sensores
- **THEN** vuelven a ser 5 rayos, 3 largos de auto y 90 grados
