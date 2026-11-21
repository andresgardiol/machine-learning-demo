# Spec Delta

## ADDED Requirements

### Requirement: Enlace a la teoría
La barra de la aplicación SHALL mostrar un enlace "Teoría" que lleva a la sección teórica, con su nombre
escrito y a la altura de las pestañas, no como un ícono entre las herramientas. SHALL distinguirse de una
pestaña, porque sale de la aplicación. SHALL abrirse en otra pestaña del navegador, para no detener lo que está en marcha.
SHALL tener un tooltip que diga qué hace y por qué importa, en español y en inglés. Es el único
elemento de la práctica que nombra a la teoría.

#### Scenario: Enlace a la vista al abrir
- **WHEN** una persona abre la aplicación sin configurar nada
- **THEN** ve el enlace "Teoría", con su nombre, junto a las pestañas, en cualquier pestaña

#### Scenario: No se confunde con una pestaña
- **WHEN** una persona mira la fila de pestañas
- **THEN** "Teoría" está separado de ellas y lleva una marca de que abre otra página

#### Scenario: Ir a la teoría sin perder lo que estaba en marcha
- **WHEN** una persona usa el enlace "Teoría" con un entrenamiento en marcha
- **THEN** la teoría se abre en otra pestaña del navegador y el entrenamiento sigue

#### Scenario: Volver de la teoría
- **WHEN** esa persona cierra la pestaña de la teoría
- **THEN** la aplicación está como la dejó

#### Scenario: Enlace en inglés
- **WHEN** una persona usa la aplicación en inglés
- **THEN** el enlace y su tooltip están en inglés
