# Spec Delta

## MODIFIED Requirements

### Requirement: Lista de cerebros
La biblioteca SHALL mostrar de cada cerebro su nombre, su origen (guardado o
autoguardado), las generaciones entrenadas, la cantidad de sensores,
la forma de su red y su mejor fitness; y, al desplegarlo, el resto de sus datos
de entrenamiento, con los escenarios que vio. Un autoguardado SHALL mostrarse
con el nombre "Entrenamiento en curso" o "Entrenamiento anterior", en el
idioma activo, y con la etiqueta "Autoguardado". Un nombre MUST NOT partirse
en medio de una palabra mientras esa palabra entre en el ancho de la lista.

#### Scenario: Resumen de un cerebro
- **WHEN** la biblioteca muestra un cerebro de 5 sensores, una capa oculta de 6 neuronas y 40 generaciones
- **THEN** se lee su nombre, su origen, "40 generaciones", "5 sensores", la forma "6-6-4" y su mejor fitness con su unidad

#### Scenario: Detalle de un cerebro
- **WHEN** la persona despliega un cerebro
- **THEN** ve la función de fitness, la configuración de evolución, la velocidad máxima del auto y cada escenario con sus generaciones

#### Scenario: Autoguardado del entrenamiento en curso
- **WHEN** la biblioteca muestra el autoguardado del entrenamiento en curso con el panel en 360 píxeles de ancho
- **THEN** se lee "Entrenamiento en curso" sin partir ninguna palabra y la etiqueta "Autoguardado", sin repetir esa palabra en el nombre

#### Scenario: Autoguardado del entrenamiento anterior
- **WHEN** la biblioteca muestra el autoguardado del entrenamiento que se abandonó
- **THEN** se lee "Entrenamiento anterior" y la etiqueta "Autoguardado"

#### Scenario: Autoguardados en inglés
- **WHEN** la persona cambia el idioma a inglés con los dos autoguardados en la lista
- **THEN** sus nombres y su etiqueta pasan a leerse en inglés sin recargar la página

#### Scenario: Nombre largo
- **WHEN** un cerebro guardado se llama "Prudente con tráfico nuevo y cuatro carriles" y el panel mide 300 píxeles de ancho
- **THEN** el nombre ocupa más de un renglón cortando entre palabras y la etiqueta de origen sigue completa
