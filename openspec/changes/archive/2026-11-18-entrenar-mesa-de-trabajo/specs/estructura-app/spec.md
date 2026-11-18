## MODIFIED Requirements

### Requirement: Orden común del panel
Todo panel SHALL ordenarse así: tarjeta de consigna (consigna, marcha y misión en curso), texto de guía, interruptores de vista, ajustes y acciones, y misiones. En Inspeccionar y el Laboratorio la marcha va abajo de la red; en Entrenar, abajo de la escena, con los interruptores de vista; los ajustes de calle y auto, en la barra de escenario. Si no entra, SHALL repartirse en vistas con pestañas arriba; la primera sigue este orden. Ningún ajuste MUST quedar plegado. El nombre de la pestaña MUST NOT verse como título, y SHALL seguir para lectores de pantalla.

#### Scenario: Mismo orden en dos pestañas
- **WHEN** la persona compara los paneles de El problema y de Entrenar
- **THEN** en El problema aparecen, en ese orden, la tarjeta de consigna con la marcha, el texto de guía, los interruptores de vista y la lista de misiones; en la vista de entrenamiento de Entrenar, la tarjeta de consigna sin la marcha, el texto de guía, los ajustes y las misiones, y la marcha con los interruptores está abajo de la escena

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el panel empieza directamente por los controles de marcha

#### Scenario: Título para lectores de pantalla
- **WHEN** un lector de pantalla recorre el panel de Entrenar
- **THEN** anuncia un título con el nombre de la pestaña aunque no se vea

#### Scenario: Sin secciones plegables
- **WHEN** la persona busca cualquier ajuste de cualquier pestaña
- **THEN** lo encuentra a la vista, en la barra de escenario o en una vista del panel, sin desplegar nada
