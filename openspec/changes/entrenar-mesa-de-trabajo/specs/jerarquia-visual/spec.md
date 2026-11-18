## MODIFIED Requirements

### Requirement: La marcha es la acción principal
La acción principal de cada pestaña SHALL ser su control de marcha, el mismo en las seis:

| Pestaña | Control de marcha |
|---|---|
| El problema | Pausar o seguir |
| Reglas a mano | Pausar o seguir |
| Entrenar | Pausar o seguir, en la barra de abajo de la escena |
| Competir | Largar, pausar o reanudar |
| Inspeccionar | Reproducir o pausar |
| Laboratorio | Reproducir o pausar |

Que un control sea la acción principal MUST NOT cambiar lo que hace, su texto ni su atajo de teclado.

#### Scenario: El problema en marcha
- **WHEN** la persona entra a El problema y maneja sin chocar
- **THEN** la acción principal es el botón de pausar, y "Reiniciar" y "Tráfico nuevo" se ven como secundarias

#### Scenario: Laboratorio
- **WHEN** la persona entra al Laboratorio en Compuertas, Puntos o Tu manejo
- **THEN** la acción principal es el botón de reproducir, y "Agregar una capa oculta" y "Guardar como cerebro" se ven como secundarias

#### Scenario: Mismo comportamiento
- **WHEN** la persona usa cualquier botón que cambió de estilo, con el mouse o con su atajo
- **THEN** hace lo mismo que antes del cambio, con el mismo texto y el mismo tooltip

#### Scenario: Determinismo
- **WHEN** se repite el mismo recorrido con la misma semilla antes y después del cambio
- **THEN** la simulación, el entrenamiento y las carreras dan los mismos resultados: el cambio es solo visual

### Requirement: Guardar no compite con la marcha
En Entrenar la marcha SHALL seguir siendo la acción principal en las tres vistas del panel, porque queda siempre a la vista debajo de la escena. "Guardar como nuevo", en la vista de cerebros, "Guardar campeón", en la vista de entrenamiento, y "Agregar una capa oculta" y "Guardar como cerebro", en el Laboratorio, SHALL verse como acciones secundarias.

#### Scenario: Vista de entrenamiento
- **WHEN** en Entrenar la persona mira la vista de entrenamiento con un campeón para guardar
- **THEN** "Guardar campeón" se ve como acción secundaria y la marcha sigue siendo la acción principal

#### Scenario: Vista de cerebros
- **WHEN** la persona pasa a la vista de cerebros de Entrenar
- **THEN** "Guardar como nuevo" se ve como acción secundaria y la marcha de abajo de la escena sigue siendo la única acción principal
