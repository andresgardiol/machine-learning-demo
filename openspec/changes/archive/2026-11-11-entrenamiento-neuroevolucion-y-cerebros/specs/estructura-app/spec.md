# Spec Delta

## MODIFIED Requirements

### Requirement: Pestañas del recorrido
La aplicación SHALL mostrar una barra con las seis pestañas del recorrido, en
este orden: El problema, Reglas a mano, Entrenar, Competir, Inspeccionar y
Laboratorio. Las pestañas El problema y Entrenar SHALL estar disponibles. Las
pestañas aún no disponibles MUST verse como no disponibles y no poder abrirse.

#### Scenario: Recorrido visible
- **WHEN** se abre la aplicación
- **THEN** la barra muestra las seis pestañas en orden y la primera está activa

#### Scenario: Abrir Entrenar
- **WHEN** la persona elige la pestaña Entrenar
- **THEN** Entrenar pasa a ser la pestaña activa y muestra su escenario y su panel

#### Scenario: Pestaña no disponible
- **WHEN** la persona intenta abrir una pestaña no disponible
- **THEN** la pestaña activa no cambia

#### Scenario: Explicación de una pestaña no disponible
- **WHEN** la persona posa el cursor sobre una pestaña no disponible
- **THEN** un tooltip indica que llegará próximamente y qué va a enseñar

#### Scenario: Explicación de una pestaña disponible
- **WHEN** la persona posa el cursor sobre la pestaña Entrenar
- **THEN** un tooltip indica qué se hace en ella y por qué importa, sin decir que llegará próximamente

## ADDED Requirements

### Requirement: Biblioteca de cerebros compartida
La aplicación SHALL tener una única biblioteca de cerebros, común a todas las
pestañas: un cerebro guardado en una pestaña MUST estar disponible en las
demás.

#### Scenario: Cerebro disponible tras cambiar de pestaña
- **WHEN** la persona guarda un cerebro en Entrenar, abre El problema y vuelve a Entrenar
- **THEN** el cerebro sigue en la biblioteca

### Requirement: Una sola pestaña en marcha
Al cambiar de pestaña, la pestaña que se deja MUST dejar de simular y de
dibujar, de modo que solo la pestaña visible consuma recursos.

#### Scenario: Salir de una pestaña
- **WHEN** la persona pasa de Entrenar a El problema
- **THEN** el entrenamiento deja de avanzar mientras El problema está a la vista
