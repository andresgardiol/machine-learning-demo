# Spec Delta

## MODIFIED Requirements

### Requirement: Interruptor de guía
La aplicación SHALL ofrecer un interruptor que muestra u oculta, en toda la
aplicación, los textos de guía, las misiones y los tooltips que aparecen al
posar el cursor. La guía SHALL estar visible por
defecto. El interruptor SHALL tener un tooltip que diga qué hace y por qué
importa, en español y en inglés.

#### Scenario: Guía visible por defecto
- **WHEN** una persona abre la aplicación por primera vez
- **THEN** los textos de guía y las misiones están visibles

#### Scenario: Ocultar la guía
- **WHEN** la persona apaga el interruptor de guía
- **THEN** los textos de guía y las misiones desaparecen y el resto de la pestaña sigue funcionando igual

#### Scenario: Volver a mostrar la guía
- **WHEN** la persona vuelve a encender el interruptor de guía
- **THEN** los textos de guía y las misiones reaparecen con el progreso que tenían

#### Scenario: La guía apagada calla los tooltips
- **WHEN** la persona apaga el interruptor de guía y posa el cursor sobre un control habilitado
- **THEN** no aparece su tooltip

#### Scenario: El tooltip del interruptor dice lo que gobierna
- **WHEN** la persona posa el cursor sobre el interruptor de guía, encendido o apagado
- **THEN** su tooltip nombra los textos de guía, las misiones y las ayudas al posar el cursor, y dice que con Tab siguen apareciendo
