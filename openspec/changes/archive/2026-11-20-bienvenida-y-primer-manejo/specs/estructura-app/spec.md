## MODIFIED Requirements

### Requirement: Lista para usar al abrir
La aplicación SHALL abrir directamente en la primera pestaña, con su escenario
funcionando, sin pedir ninguna configuración ni registro. En la primera visita
SHALL mostrar encima la ventana de bienvenida, que se cierra en un paso.

#### Scenario: Primera visita
- **WHEN** una persona abre la aplicación por primera vez
- **THEN** ve la primera pestaña con su escenario listo para usar y, encima, la ventana de bienvenida

#### Scenario: Visitas siguientes
- **WHEN** una persona que ya cerró la bienvenida vuelve a abrir la aplicación en el mismo navegador
- **THEN** ve la primera pestaña lista para usar, sin ninguna ventana encima

## ADDED Requirements

### Requirement: Ventana de bienvenida
La aplicación SHALL mostrar, en la primera visita, una ventana que dice en
pocas líneas qué es la aplicación y por dónde empezar: manejar el auto en El
problema con las flechas. SHALL tener una sola acción principal, "Empezar a
manejar", que la cierra y deja el foco en el escenario. Sus textos SHALL estar
en español y en inglés, y seguir el idioma activo.

#### Scenario: Qué dice
- **WHEN** aparece la ventana de bienvenida con la aplicación en español
- **THEN** se lee qué es la aplicación, que se empieza manejando en El problema con las flechas, y una acción principal "Empezar a manejar"

#### Scenario: Empezar a manejar
- **WHEN** la persona usa "Empezar a manejar" y después aprieta la flecha arriba
- **THEN** la ventana se cierra y el auto empieza a avanzar sin otro clic

#### Scenario: Otro idioma
- **WHEN** la persona cambia el idioma a inglés con la ventana abierta
- **THEN** los textos de la ventana pasan a inglés

#### Scenario: Atajos con la ventana abierta
- **WHEN** la ventana de bienvenida está abierta y la persona aprieta la flecha arriba
- **THEN** el auto no se mueve

### Requirement: Cerrar la bienvenida
La ventana de bienvenida SHALL poder cerrarse con su acción principal, con un
botón de cerrar y con Escape. Al cerrarse por cualquiera de esas vías, la
aplicación SHALL recordar en el mismo navegador que ya se vio, y la ventana
MUST no volver a abrirse sola. Si el navegador no permite guardar
preferencias, MUST aparecer en cada visita y cerrarse igual, sin errores.

#### Scenario: Cerrar con Escape
- **WHEN** la persona aprieta Escape con la ventana abierta
- **THEN** la ventana se cierra y no vuelve a aparecer en la próxima visita

#### Scenario: Navegador sin almacenamiento
- **WHEN** el navegador impide guardar preferencias y la persona cierra la bienvenida
- **THEN** la ventana se cierra sin errores y vuelve a aparecer en la próxima visita

#### Scenario: Controles explicados
- **WHEN** la persona pasa el mouse sobre "Empezar a manejar" o sobre el botón de cerrar, con las ayudas encendidas
- **THEN** un tooltip dice qué hace y por qué importa, en el idioma activo

### Requirement: Volver a ver la bienvenida
La ventana de créditos SHALL ofrecer un control que vuelve a abrir la ventana
de bienvenida, con su tooltip en español y en inglés.

#### Scenario: Reabrir desde créditos
- **WHEN** la persona abre los créditos y usa "Ver la bienvenida"
- **THEN** se cierran los créditos y se abre la ventana de bienvenida

#### Scenario: Reabrirla no cambia lo recordado
- **WHEN** la persona vuelve a abrir la bienvenida desde créditos y la cierra
- **THEN** en la próxima visita no aparece sola
