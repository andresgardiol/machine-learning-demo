# Spec Delta

## ADDED Requirements

### Requirement: La vuelta en la red
El inspector SHALL poder mostrar, además de la ida, la vuelta de un
aprendizaje: la culpa de cada neurona, con su signo y su tamaño, distinta a
la vista de su actividad; y qué pesos cambian y cuánto. Sin un aprendizaje
que mostrar, la vista MUST verse como en Inspeccionar.

#### Scenario: Culpa a la vista
- **WHEN** se le pasa al inspector la culpa de cada neurona de un ejemplo
- **THEN** cada neurona muestra su culpa con una marca propia, sin tapar su actividad, y sin depender solo del color

#### Scenario: Peso que cambia
- **WHEN** se le pasa la corrección de cada peso
- **THEN** cada conexión muestra si su peso sube o baja y cuánto, y después queda con su valor nuevo

#### Scenario: Sin vuelta
- **WHEN** no se le pasa ninguna culpa ni corrección
- **THEN** la red se ve igual que en Inspeccionar

#### Scenario: En la tabla de pesos
- **WHEN** la vista es la tabla de pesos durante una corrección
- **THEN** cada celda muestra su valor nuevo y una marca de cuánto cambió

### Requirement: Vuelta animada
Cada paso de la vuelta y de la corrección SHALL verse como un movimiento, con
los valores reales: la culpa viaja hacia atrás por cada conexión, de la
neurona siguiente a la anterior, y cada peso corregido cambia de grosor hasta
su valor nuevo. Valen las reglas del paso animado de la ida: no frena a la
persona, entra en el ritmo elegido y respeta la preferencia de menos
movimiento.

#### Scenario: La culpa viaja hacia atrás
- **WHEN** se avanza la culpa de una neurona oculta
- **THEN** por cada conexión que sale de ella viaja una marca desde la neurona siguiente hasta ella, en sentido contrario al de la ida

#### Scenario: Se distingue de la ida
- **WHEN** la persona mira un paso de la vuelta
- **THEN** se distingue de un paso de la ida por el sentido del movimiento y por la forma de la marca, no solo por el color

#### Scenario: Corrección de una capa
- **WHEN** se avanza la corrección de una capa
- **THEN** las conexiones que entran a esa capa cambian a la vez hasta su valor nuevo

#### Scenario: Aprendizaje de corrido
- **WHEN** el aprendizaje corre de a épocas o de a ejemplos
- **THEN** los pesos se ven cambiar sin animaciones de paso

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** nada viaja: cada paso se marca con un cambio de estado
