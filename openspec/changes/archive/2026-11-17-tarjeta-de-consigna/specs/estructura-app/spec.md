## MODIFIED Requirements

### Requirement: Orden común del panel
El panel de toda pestaña SHALL ordenar su contenido así: tarjeta de consigna (consigna, controles de marcha y misión en curso), texto de guía, interruptores de vista, ajustes y acciones a la vista, y lista de misiones. En Inspeccionar y en el Laboratorio, los controles de marcha van en la barra de abajo de la red y no en la tarjeta. Los ajustes de la calle y del auto van en la barra de escenario.
Un panel con más contenido del que entra SHALL repartirlo en vistas con pestañas arriba; la primera sigue este orden. Ningún ajuste MUST quedar en una sección plegable. El nombre de la pestaña MUST NOT repetirse como título visible, y SHALL seguir para lectores de pantalla.

#### Scenario: Mismo orden en dos pestañas
- **WHEN** la persona compara los paneles de El problema y de Entrenar
- **THEN** en El problema y en la vista de entrenamiento de Entrenar aparecen, en ese orden, la tarjeta de consigna con la marcha, el texto de guía, los interruptores de vista y la lista de misiones

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el panel empieza directamente por los controles de marcha

#### Scenario: Título para lectores de pantalla
- **WHEN** un lector de pantalla recorre el panel de Entrenar
- **THEN** anuncia un título con el nombre de la pestaña aunque no se vea

#### Scenario: Sin secciones plegables
- **WHEN** la persona busca cualquier ajuste de cualquier pestaña
- **THEN** lo encuentra a la vista, en la barra de escenario o en una vista del panel, sin desplegar nada
