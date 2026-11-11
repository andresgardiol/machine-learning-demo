# Spec Delta

## ADDED Requirements

### Requirement: Números según el idioma
Todo número con decimales que se muestre SHALL usar la coma como separador
decimal en español y el punto en inglés, en cualquier texto visible, incluidos
tooltips, valores de deslizadores, indicadores y mensajes. Los números MUST
mostrarse sin separador de miles en ambos idiomas.

#### Scenario: Decimal en español
- **WHEN** la aplicación está en español y un ajuste vale uno y medio
- **THEN** se muestra "1,5"

#### Scenario: Decimal en inglés
- **WHEN** la aplicación está en inglés y un ajuste vale uno y medio
- **THEN** se muestra "1.5"

#### Scenario: Cambio de idioma con números a la vista
- **WHEN** la persona cambia de español a inglés con valores decimales a la vista
- **THEN** todos pasan de coma a punto de inmediato

#### Scenario: Número grande
- **WHEN** se muestra una distancia de 12345 metros
- **THEN** se lee "12345" en ambos idiomas, sin punto ni coma

#### Scenario: Singular con decimales
- **WHEN** un valor es exactamente 1
- **THEN** el texto usa la forma singular, igual que antes de este cambio
