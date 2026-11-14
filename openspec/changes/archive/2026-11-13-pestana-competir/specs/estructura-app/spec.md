# Spec Delta

## MODIFIED Requirements

### Requirement: Pestañas del recorrido
La aplicación SHALL mostrar una barra con las seis pestañas del recorrido, en
este orden: El problema, Reglas a mano, Entrenar, Competir, Inspeccionar y
Laboratorio. Las pestañas El problema, Reglas a mano, Entrenar y Competir
SHALL estar disponibles. Las pestañas aún no disponibles MUST verse como no disponibles y
no poder abrirse.

#### Scenario: Recorrido visible
- **WHEN** se abre la aplicación
- **THEN** la barra muestra las seis pestañas en orden y la primera está activa

#### Scenario: Abrir Entrenar
- **WHEN** la persona elige la pestaña Entrenar
- **THEN** Entrenar pasa a ser la pestaña activa y muestra su escenario y su panel

#### Scenario: Abrir Reglas a mano
- **WHEN** la persona elige la pestaña Reglas a mano
- **THEN** Reglas a mano pasa a ser la pestaña activa y muestra su escenario, su tablero con el editor y su panel

#### Scenario: Pestaña no disponible
- **WHEN** la persona intenta abrir una pestaña no disponible
- **THEN** la pestaña activa no cambia

#### Scenario: Explicación de una pestaña no disponible
- **WHEN** la persona posa el cursor sobre una pestaña no disponible
- **THEN** un tooltip indica que llegará próximamente y qué va a enseñar

#### Scenario: Explicación de una pestaña disponible
- **WHEN** la persona posa el cursor sobre la pestaña Entrenar
- **THEN** un tooltip indica qué se hace en ella y por qué importa, sin decir que llegará próximamente

#### Scenario: Explicación de Reglas a mano
- **WHEN** la persona posa el cursor sobre la pestaña Reglas a mano
- **THEN** un tooltip indica que ahí se programa el auto con reglas escritas a mano y por qué eso deja de alcanzar, sin decir que llegará próximamente

#### Scenario: Abrir Competir
- **WHEN** la persona elige la pestaña Competir
- **THEN** Competir pasa a ser la pestaña activa y muestra su barra de escenario, su escenario, su tablero y su panel

#### Scenario: Explicación de Competir
- **WHEN** la persona posa el cursor sobre la pestaña Competir
- **THEN** un tooltip indica que ahí se comparan cerebros, reglas y personas en pistas vistas y no vistas, y por qué eso muestra si algo generaliza, sin decir que llegará próximamente

