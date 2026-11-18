# Spec Delta

## MODIFIED Requirements

### Requirement: Acción principal en la tarjeta
En El problema, Entrenar y Competir, los controles de marcha SHALL ir adentro de la tarjeta, debajo de la consigna. Esto incluye la acción principal y botones como Reiniciar o Siguiente; "Tráfico nuevo" SHALL ir fuera, junto a los interruptores de vista. En Inspeccionar y en el Laboratorio, la marcha SHALL quedar en la barra de abajo de la red; en Reglas a mano, en la barra de abajo de la escena, con Reiniciar y Tráfico nuevo. Mover un control MUST NOT cambiar lo que hace, su texto, su tooltip ni su atajo.

#### Scenario: El problema
- **WHEN** la persona entra a El problema
- **THEN** el botón de pausar, que es la acción principal, está en la tarjeta, debajo de la consigna, junto a Reiniciar y con su misma altura; "Tráfico nuevo" está fuera de la tarjeta, junto a Sensores y Ver como la máquina

#### Scenario: Competir con el cartel de largada
- **WHEN** en Competir se ve el cartel de largada sobre la escena
- **THEN** la marcha de la tarjeta se ve como secundaria y el botón del cartel sigue siendo la única acción principal

#### Scenario: Inspeccionar
- **WHEN** la persona entra a Inspeccionar
- **THEN** la tarjeta muestra la consigna y la misión en curso, y el botón Reproducir sigue en la barra de abajo de la red como acción principal

#### Scenario: Mismo comportamiento
- **WHEN** la persona usa la marcha de la tarjeta con el mouse o con su atajo
- **THEN** hace lo mismo que antes del cambio, y una sola acción principal queda a la vista

#### Scenario: Reglas a mano
- **WHEN** la persona entra a Reglas a mano
- **THEN** la tarjeta muestra la consigna y la misión en curso, y "Pausar (espacio)", que es la acción principal, está en la barra de abajo de la escena, junto a Reiniciar y Tráfico nuevo

### Requirement: Tarjeta al principio del panel
Cada una de las seis pestañas SHALL abrir su panel (en Reglas a mano, su tablero) con una tarjeta de consigna, antes que cualquier otro contenido visible del panel, salvo mientras hay algo elegido en Inspeccionar o en el Laboratorio. En Entrenar va solo en la vista de entrenamiento. SHALL destacarse del panel por un fondo más claro y una barra gruesa a la izquierda, neutra y no del color de acción. MUST NOT tapar la escena, el tablero ni la red.

#### Scenario: Al abrir la app
- **WHEN** la persona abre la app sin haber configurado nada y recorre las seis pestañas a 1440×900
- **THEN** en cada una lo primero del panel es la tarjeta de consigna, y la tarjeta entra entera en la ventana sin desplazar

#### Scenario: Se destaca
- **WHEN** la persona mira el panel de cualquier pestaña, también en escala de grises
- **THEN** la tarjeta se distingue a simple vista del resto del panel por su fondo y su barra lateral, y la barra no es del color de la acción principal

#### Scenario: Ventana mediana
- **WHEN** la persona recorre las seis pestañas a 1366×768
- **THEN** la tarjeta de consigna entra entera en la ventana sin desplazar el panel

#### Scenario: Otras vistas de Entrenar
- **WHEN** la persona pasa de la vista de entrenamiento a la de cerebros
- **THEN** la tarjeta no se ve, y la acción principal de esa vista es Guardar como nuevo
- **WHEN** vuelve a la vista de entrenamiento
- **THEN** la tarjeta vuelve a estar al principio, con la misión en curso al día

#### Scenario: Reglas a mano
- **WHEN** la persona abre Reglas a mano a 1366×768
- **THEN** lo primero del tablero es la tarjeta de consigna, entera, antes que la tarjeta del programa
