## ADDED Requirements

### Requirement: Sin destellos
Ningún elemento de la aplicación SHALL cambiar su brillo en más de la mitad
de su rango más de tres veces en un mismo segundo, en ninguna pestaña, con
ningún cerebro ni ninguna red. Lo que va a pasar ese límite MUST mostrarse
quieto y marcado como algo que titubea, sin perder lo que significa.

#### Scenario: Estado por defecto
- **WHEN** la persona abre Inspeccionar con el cerebro de ejemplo de la calle y lo deja manejar un minuto sin tocar nada
- **THEN** ninguna neurona, conexión ni tecla de la decisión cambia de brillo más de tres veces en ningún segundo

#### Scenario: Peor caso medido
- **WHEN** se mide, cuadro a cuadro durante un minuto, el brillo en el centro de cada neurona y de cada tecla de la decisión en Inspeccionar con el cerebro que más destellaba antes del cambio
- **THEN** ninguno pasa de tres cambios grandes en ningún segundo

#### Scenario: Laboratorio con tu manejo
- **WHEN** la red del Laboratorio aprende con tu manejo y la escena la muestra manejando
- **THEN** ninguna neurona ni acción cambia de brillo más de tres veces en ningún segundo

#### Scenario: Otras pestañas
- **WHEN** la red se ve en vivo en cualquier otra pestaña
- **THEN** vale la misma regla

#### Scenario: Volver atrás
- **WHEN** la persona pausa
- **THEN** cada elemento vuelve a mostrar su valor exacto, sin marca de que titubea
