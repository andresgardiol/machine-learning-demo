# Spec Delta

## MODIFIED Requirements

### Requirement: Elegir la pista
La pestaña SHALL ofrecer, sobre el escenario, el selector de pista común a
todas las pestañas, con las cuatro del catálogo, la calle recta elegida por defecto. Cambiar de pista MUST reiniciar
el intento en la pista nueva, con el mismo controlador y los mismos sensores.
El selector SHALL tener un tooltip que diga qué hace y por qué importa, y los
nombres de las pistas SHALL estar en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la pista elegida es la calle recta y todo funciona como antes

#### Scenario: Pasar a un circuito
- **WHEN** la persona elige el óvalo
- **THEN** el auto aparece detenido en la línea de salida del óvalo, sin tráfico, y se maneja con las mismas teclas

#### Scenario: Volver a la calle
- **WHEN** la persona vuelve a elegir la calle recta, o restablece la configuración
- **THEN** el intento se reinicia en la calle recta con el tráfico de siempre

#### Scenario: Tooltip del selector
- **WHEN** la persona posa el cursor sobre el selector de pista
- **THEN** un tooltip en el idioma activo explica que cambia dónde se maneja y que cada pista plantea un problema distinto: tráfico en la calle, curvas en los circuitos

#### Scenario: Panel sin desplazarse
- **WHEN** se abre la pestaña en 1440×900, con el selector de pista sobre el escenario y ya no en el panel
- **THEN** el panel se ve completo sin desplazarse
