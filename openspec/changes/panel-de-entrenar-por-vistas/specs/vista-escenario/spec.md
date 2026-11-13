# Spec Delta

## ADDED Requirements

### Requirement: Selector de pista sobre el escenario
La vista SHALL ofrecer, sobre el escenario y en el mismo lugar en todas las
pestañas, un selector de pista: cerrado, muestra el nombre de la pista a la
vista; abierto, lista las cuatro pistas del catálogo, cada una con su nombre
y una miniatura de su trazado, y marca la elegida. El selector MUST NOT tapar
al auto ni a los demás controles del escenario.

#### Scenario: Estado por defecto
- **WHEN** se abre cualquier pestaña con escenario
- **THEN** el selector está cerrado, en el mismo lugar que en las demás pestañas, y dice que la pista es la calle recta

#### Scenario: Elegir una pista
- **WHEN** la persona abre el selector y elige el óvalo
- **THEN** el selector se cierra, pasa a decir que la pista es el óvalo y el escenario muestra el óvalo

#### Scenario: Volver a la calle recta
- **WHEN** la persona vuelve a abrir el selector y elige la calle recta
- **THEN** el escenario vuelve a mostrar la calle recta

#### Scenario: Miniaturas
- **WHEN** la persona abre el selector
- **THEN** junto a cada nombre se ve la silueta de ese trazado, y la calle recta se distingue de los tres circuitos sin leer los nombres

#### Scenario: Cerrar sin elegir
- **WHEN** la persona abre el selector y presiona Escape o hace clic fuera
- **THEN** el selector se cierra y la pista no cambia

#### Scenario: Teclado
- **WHEN** la persona llega al selector con Tab, lo abre con Enter y se mueve con las flechas
- **THEN** puede elegir una pista con Enter sin usar el mouse, y el foco vuelve al selector

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega al selector y lo abre
- **THEN** anuncia que es un menú, si está abierto, el nombre de cada pista y cuál está elegida o marcada; las miniaturas no se anuncian

#### Scenario: Menú entero a la vista
- **WHEN** la persona abre el selector con el escenario en 400 píxeles de ancho
- **THEN** el menú se ve completo, sin cortarse en los bordes del escenario, y cada opción mide al menos 24 píxeles de alto

#### Scenario: Escenario angosto
- **WHEN** el escenario mide 400 píxeles de ancho, en español o en inglés
- **THEN** el selector, el rótulo de generación y los controles de cámara y de paisaje se ven enteros y sin encimarse, también con una generación de tres dígitos y varias pistas marcadas

#### Scenario: Ver como la máquina
- **WHEN** está activo "ver como la máquina"
- **THEN** el selector sigue a la vista y usable, aunque la pista no se dibuje

### Requirement: Selector de pista explicado
El selector de pista SHALL tener un tooltip que diga qué hace y por qué
importa, y sus textos SHALL estar en español y en inglés. Donde se pueden
marcar varias pistas, el tooltip MUST decirlo.

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre el selector en El problema
- **THEN** un tooltip en el idioma activo explica que cambia dónde se maneja y que cada pista plantea un problema distinto

#### Scenario: Tooltip en Entrenar
- **WHEN** la persona posa el cursor sobre el selector en Entrenar
- **THEN** el tooltip explica además que se pueden marcar varias pistas y que cada generación corre en una distinta
