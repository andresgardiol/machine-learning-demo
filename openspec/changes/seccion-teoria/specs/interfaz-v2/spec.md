# Spec Delta

## ADDED Requirements

### Requirement: Enlace a la teoría en la V2
La barra de la V2 SHALL mostrar un enlace "Teoría" que lleva a la sección teórica, la misma que enlaza
la V1. SHALL abrirse en otra pestaña del navegador y tener un tooltip que diga qué hace y por qué
importa, en español y en inglés.

#### Scenario: Enlace a la vista al abrir la V2
- **WHEN** una persona abre la V2 sin configurar nada
- **THEN** ve el enlace "Teoría" en la barra, en cualquier etapa

#### Scenario: Ir a la teoría desde la V2
- **WHEN** una persona usa el enlace "Teoría" con una etapa en marcha
- **THEN** la teoría se abre en otra pestaña del navegador y la etapa sigue como estaba

#### Scenario: Volver de la teoría a la V2
- **WHEN** esa persona cierra la pestaña de la teoría
- **THEN** la V2 está como la dejó
