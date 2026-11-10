# Spec Delta

## Purpose

Describe por dónde se puede circular: una pista definida por su línea central,
su ancho y sus carriles, con bordes que la delimitan y una medida de cuánto se
avanzó sobre ella. Es la misma representación para la calle recta y para los
circuitos que lleguen después.

## ADDED Requirements

### Requirement: Pista definida por línea central, ancho y carriles
Una pista SHALL quedar definida por una línea central, un ancho total y una
cantidad de carriles de igual ancho. Toda pista, recta o con curvas, MUST usar
esta misma definición.

#### Scenario: Carriles de igual ancho
- **WHEN** se crea una pista de tres carriles
- **THEN** la pista tiene tres carriles contiguos del mismo ancho que juntos ocupan el ancho total

### Requirement: Calle recta de 2, 3 o 4 carriles
El sistema SHALL ofrecer una calle recta con 2, 3 o 4 carriles, lo bastante
larga como para no alcanzar su final durante el uso normal, y SHALL usar 3
carriles cuando no se indica una cantidad.

#### Scenario: Valor por defecto
- **WHEN** se crea la calle recta sin indicar la cantidad de carriles
- **THEN** la calle tiene tres carriles

#### Scenario: Cantidad no admitida
- **WHEN** se pide una calle recta con una cantidad de carriles distinta de 2, 3 o 4
- **THEN** la calle no se crea y se informa cuáles son las cantidades admitidas

### Requirement: Bordes de la pista
La pista SHALL exponer un borde izquierdo y uno derecho, paralelos a la línea
central y separados de ella por la mitad del ancho total, que delimitan la zona
transitable.

#### Scenario: Bordes en la calle recta
- **WHEN** se consultan los bordes de una calle recta
- **THEN** cada borde corre paralelo a la línea central a una distancia igual a la mitad del ancho

#### Scenario: Bordes en una pista con curva
- **WHEN** se consultan los bordes de una pista abierta cuya línea central dobla
- **THEN** ambos bordes acompañan la curva de forma continua, sin huecos ni cruces entre tramos

### Requirement: Centro de carril
La pista SHALL informar la posición y la orientación del centro de cualquier
carril a una distancia dada sobre la línea central.

#### Scenario: Centro del carril del medio
- **WHEN** se consulta el centro del carril del medio de una calle recta de tres carriles
- **THEN** la posición coincide con la línea central

#### Scenario: Carril inexistente
- **WHEN** se consulta el centro de un carril que la pista no tiene
- **THEN** la consulta se rechaza indicando los carriles disponibles

### Requirement: Progreso sobre la pista
La pista SHALL medir el progreso de cualquier posición como la distancia
recorrida sobre la línea central desde el inicio, sin que los movimientos
laterales lo modifiquen.

#### Scenario: Avanzar aumenta el progreso
- **WHEN** un auto avanza diez metros en la dirección de la pista
- **THEN** su progreso aumenta diez metros

#### Scenario: Cambiar de carril no suma progreso
- **WHEN** un auto se desplaza de un carril a otro sin avanzar
- **THEN** su progreso no cambia

#### Scenario: Retroceder reduce el progreso
- **WHEN** un auto retrocede cinco metros
- **THEN** su progreso disminuye cinco metros

#### Scenario: Progreso a través de una curva
- **WHEN** un auto recorre una pista abierta con curva desde el inicio hasta el final siguiendo la línea central
- **THEN** su progreso final es igual al largo total de la línea central
