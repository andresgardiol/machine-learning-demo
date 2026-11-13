# Spec Delta

## ADDED Requirements

### Requirement: Elegir la pista
La pestaña SHALL ofrecer en el panel un selector de pista con las cuatro del
catálogo, la calle recta elegida por defecto. Cambiar de pista MUST reiniciar
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
- **WHEN** se abre la pestaña en 1440×900 con el selector de pista a la vista
- **THEN** el panel se ve completo sin desplazarse

### Requirement: Pestaña en un circuito
En un circuito, el indicador de vehículos superados SHALL pasar a mostrar las
vueltas del intento, con un decimal. El botón de tráfico nuevo y los ajustes
de carriles, densidad e irregularidad SHALL verse deshabilitados y explicar
que en un circuito no hay tráfico; sus valores MUST conservarse. Las misiones,
que son de la calle recta, SHALL ocultarse y dejar una línea que lo diga.

#### Scenario: Indicador de vueltas
- **WHEN** el auto lleva recorrida una vuelta y media del óvalo
- **THEN** el indicador se llama "Vueltas" y muestra 1,5

#### Scenario: Ajustes de tráfico
- **WHEN** la persona despliega la configuración avanzada en un circuito
- **THEN** carriles, densidad e irregularidad están deshabilitados y su tooltip explica que en un circuito no hay tráfico

#### Scenario: Valores conservados
- **WHEN** la persona tenía la densidad en 80 %, pasa a un circuito y vuelve a la calle recta
- **THEN** la densidad sigue en 80 %

#### Scenario: Misiones
- **WHEN** la persona elige un circuito con la guía activa
- **THEN** en lugar de las misiones se lee que las misiones son de la calle recta

#### Scenario: Choque en un circuito
- **WHEN** el auto choca contra el borde de un circuito
- **THEN** el intento termina como en la calle, con su aviso y la forma de reiniciarlo
