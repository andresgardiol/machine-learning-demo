# Spec Delta

## MODIFIED Requirements

### Requirement: Orden común del panel
El panel de toda pestaña SHALL ordenar su contenido de arriba hacia abajo así:
guía de inicio, controles de marcha, interruptores de vista, ajustes y
acciones a la vista, misiones y, al final, las secciones plegables. Un panel
con más contenido del que entra SHALL repartirlo en vistas con pestañas
propias arriba del panel, en lugar de anidar secciones plegables; su primera
vista sigue este mismo orden. Las secciones plegables y las pestañas de vista
SHALL verse iguales en todas las pestañas que las usen. El nombre de la
pestaña MUST NOT repetirse como título visible del panel, y SHALL seguir
disponible para los lectores de pantalla.

#### Scenario: Mismo orden en dos pestañas
- **WHEN** la persona compara los paneles de El problema y de Entrenar
- **THEN** en El problema y en la vista de entrenamiento de Entrenar aparecen, en ese orden, la guía, los controles de marcha, los interruptores de vista y las misiones; El problema termina con su sección plegable y Entrenar lleva los ajustes y los cerebros en vistas aparte

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el panel empieza directamente por los controles de marcha

#### Scenario: Título para lectores de pantalla
- **WHEN** un lector de pantalla recorre el panel de Entrenar
- **THEN** anuncia un título con el nombre de la pestaña aunque no se vea

#### Scenario: Un solo nivel
- **WHEN** la persona busca cualquier ajuste de cualquier pestaña
- **THEN** lo encuentra a la vista, dentro de una sección plegable o dentro de una vista del panel, nunca dentro de una sección plegable que está dentro de otra
