# Spec Delta

## ADDED Requirements

### Requirement: Enlace a la V2
La barra superior de la V1 SHALL mostrar, en cualquier pestaña, un enlace "Probar la V2" que abre la V2 en el idioma activo. El enlace SHALL tener tooltip ("qué hace / por qué importa") y textos en español e inglés. Su estilo SHALL ser el de una acción terciaria, para no competir con la acción principal de la pestaña. Usarlo MUST NOT detener ni borrar lo que la V1 tiene en curso.

#### Scenario: Enlace visible por defecto
- **WHEN** se abre la V1 sin configurar nada
- **THEN** la barra superior muestra "Probar la V2" junto a los créditos, y la pestaña sigue teniendo una sola acción principal a la vista

#### Scenario: Abrir la V2 en el idioma activo
- **WHEN** la persona, con la V1 en inglés, usa el enlace
- **THEN** se abre la V2 en inglés

#### Scenario: Tooltip del enlace
- **WHEN** la persona posa el cursor sobre el enlace o llega a él con el teclado
- **THEN** un tooltip dice que abre la nueva versión de la interfaz para compararla, y que los cerebros guardados se comparten

#### Scenario: Volver sin perder nada
- **WHEN** la persona usa el enlace, pasa a la V2 y vuelve con "Volver a la V1"
- **THEN** la V1 abre con sus preferencias, su programa recordado y su biblioteca como estaban
