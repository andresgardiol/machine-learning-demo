# Spec Delta

## MODIFIED Requirements

### Requirement: Guía de inicio
Con la guía activa, la pestaña SHALL mostrar un texto breve que diga qué se
está viendo, qué probar y con qué teclas se maneja. El texto MUST nombrar la
cantidad de carriles que la calle tiene en ese momento.

#### Scenario: Guía activa
- **WHEN** la guía está activa
- **THEN** el panel muestra el texto de inicio con las teclas de manejo

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio no se muestra y el manejo funciona igual

#### Scenario: Carriles por defecto
- **WHEN** se abre la pestaña con la configuración por defecto
- **THEN** el texto de inicio habla de una calle de 3 carriles

#### Scenario: Carriles elegidos
- **WHEN** la persona elige cuatro carriles en la configuración avanzada
- **THEN** el texto de inicio pasa a hablar de una calle de 4 carriles, en el idioma activo
