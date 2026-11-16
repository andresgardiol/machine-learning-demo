# Spec Delta

## MODIFIED Requirements

### Requirement: Preferencias recordadas
La aplicación SHALL recordar en el mismo navegador el idioma elegido, el
estado del interruptor de guía, el del interruptor de ayudas y la velocidad
máxima del auto entre visitas. La velocidad máxima del auto SHALL ser una sola
para todas las pestañas. Si el navegador no permite guardar preferencias, la
aplicación MUST funcionar igual con los valores por defecto.

#### Scenario: Segunda visita
- **WHEN** una persona eligió inglés y apagó la guía, y vuelve a abrir la aplicación en el mismo navegador
- **THEN** la aplicación abre en inglés y con la guía apagada

#### Scenario: Navegador sin almacenamiento
- **WHEN** el navegador impide guardar o leer preferencias
- **THEN** la aplicación abre con los valores por defecto y no muestra ningún error

#### Scenario: Ayudas apagadas en la segunda visita
- **WHEN** una persona apagó las ayudas y vuelve a abrir la aplicación en el mismo navegador
- **THEN** la aplicación abre con las ayudas apagadas

#### Scenario: Quien tenía la guía apagada
- **WHEN** una persona que tenía la guía apagada abre la aplicación por primera vez con el interruptor de ayudas
- **THEN** las ayudas abren apagadas, como las tenía, y la guía sigue apagada

## ADDED Requirements

### Requirement: Interruptor de guía sin tooltips
La aplicación SHALL ofrecer un interruptor que muestra u oculta, en toda la
aplicación, los textos de guía y las misiones. La guía SHALL estar visible por
defecto. El interruptor SHALL tener un tooltip que diga qué hace y por qué
importa, en español y en inglés. MUST NOT cambiar si aparecen los tooltips.

#### Scenario: Guía visible por defecto
- **WHEN** una persona abre la aplicación por primera vez
- **THEN** los textos de guía y las misiones están visibles

#### Scenario: Ocultar la guía
- **WHEN** la persona apaga el interruptor de guía
- **THEN** los textos de guía y las misiones desaparecen y el resto de la pestaña sigue funcionando igual

#### Scenario: Volver a mostrar la guía
- **WHEN** la persona vuelve a encender el interruptor de guía
- **THEN** los textos de guía y las misiones reaparecen con el progreso que tenían

#### Scenario: La guía apagada no calla los tooltips
- **WHEN** la persona apaga el interruptor de guía con las ayudas encendidas y posa el cursor sobre un control
- **THEN** aparece su tooltip

#### Scenario: El tooltip del interruptor dice lo que gobierna
- **WHEN** la persona posa el cursor sobre el interruptor de guía, encendido o apagado
- **THEN** su tooltip nombra los textos de guía y las misiones, y no nombra los tooltips

### Requirement: Interruptor de ayudas
La aplicación SHALL ofrecer, en la barra de arriba, entre "Guía" y "Atajos",
un interruptor "Ayudas" que enciende o apaga los tooltips en toda la
aplicación. SHALL estar encendido por defecto, a la vista en todas las
pestañas, y tener un tooltip que diga qué hace y por qué importa, en español
y en inglés, que aparece también con las ayudas apagadas.

#### Scenario: A la vista
- **WHEN** la persona mira la barra de arriba en cualquier pestaña
- **THEN** ve el interruptor "Ayudas" con su estado

#### Scenario: Apagar
- **WHEN** la persona apaga "Ayudas"
- **THEN** desde ese momento ningún control muestra su tooltip, sin recargar

#### Scenario: Encender
- **WHEN** la persona enciende "Ayudas"
- **THEN** los tooltips vuelven a aparecer como siempre

#### Scenario: Con el teclado
- **WHEN** la persona llega al interruptor con Tab y presiona Espacio o Enter
- **THEN** cambia de estado y un lector de pantalla lee el estado nuevo

#### Scenario: Barra de arriba sin desbordar
- **WHEN** la ventana mide 1032 píxeles de ancho o más, en español o en inglés
- **THEN** la barra de arriba entra con los tres interruptores, sin encimar ni cortar ningún texto

## REMOVED Requirements

### Requirement: Interruptor de guía
**Reason**: Hacía que apagar la guía callara también los tooltips al posar el cursor. Los tooltips pasan a tener su propio interruptor.
**Migration**: Lo reemplaza "Interruptor de guía sin tooltips", que conserva lo demás: la guía muestra u oculta los textos de guía y las misiones. Los tooltips los gobierna "Interruptor de ayudas".
