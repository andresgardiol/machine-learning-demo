# vista-escenario Specification

## Purpose

Muestra en pantalla lo que ocurre en la simulación (pista, autos, sensores) y
permite observarlo con comodidad mediante una cámara que sigue al auto y admite
zoom y paneo. Es la misma vista para todas las pestañas que tienen escenario.

## Requirements

### Requirement: Dibujo del escenario
La vista SHALL dibujar la pista con sus bordes y la separación entre carriles,
el auto del conductor y los vehículos del tráfico, de modo que cada tipo de
elemento se distinga de los demás a simple vista.

#### Scenario: Escenario por defecto
- **WHEN** se muestra la calle recta de tres carriles con tráfico
- **THEN** se ven los dos bordes, las dos líneas de separación entre carriles, el auto del conductor y los vehículos del tráfico cercanos

#### Scenario: Auto chocado
- **WHEN** el auto del conductor choca
- **THEN** su aspecto cambia de forma evidente, y no solo por el color

### Requirement: Colores con significado constante
La vista SHALL usar siempre el mismo color para el mismo tipo de elemento (auto
del conductor, tráfico, sensores, pista) en cualquier escenario y pestaña.

#### Scenario: Mismo significado tras cambiar el escenario
- **WHEN** se cambia la cantidad de carriles o se genera tráfico nuevo
- **THEN** el auto del conductor, el tráfico y los sensores conservan sus colores

### Requirement: Sensores visibles
La vista SHALL poder dibujar cada rayo de los sensores, distinguiendo el tramo
que llega hasta el obstáculo detectado del tramo que queda detrás de él, y
SHALL poder ocultarlos.

#### Scenario: Rayo que detecta un obstáculo
- **WHEN** los sensores están visibles y un rayo alcanza un vehículo
- **THEN** el rayo se dibuja con un aspecto hasta el punto de contacto y con otro desde allí hasta su alcance máximo

#### Scenario: Sensores ocultos
- **WHEN** se ocultan los sensores
- **THEN** no se dibuja ningún rayo y la simulación no cambia

### Requirement: Cámara que sigue al auto
La cámara SHALL seguir al auto del conductor por defecto, manteniéndolo siempre
en pantalla y dejando a la vista más pista por delante que por detrás.

#### Scenario: El auto avanza
- **WHEN** el auto avanza por la pista
- **THEN** el auto permanece en la misma zona de la pantalla y la pista se desplaza

#### Scenario: Calle recta vertical
- **WHEN** se muestra la calle recta
- **THEN** la calle se ve vertical, con el sentido de avance hacia arriba y el auto en la parte de abajo

### Requirement: Zoom
La vista SHALL permitir acercar y alejar con la rueda del mouse y con botones
en pantalla, dentro de un límite mínimo y uno máximo. Al usar la rueda, el
punto bajo el cursor MUST quedar fijo en pantalla.

#### Scenario: Zoom con la rueda
- **WHEN** la persona gira la rueda del mouse sobre un vehículo
- **THEN** la vista se acerca o se aleja y ese vehículo sigue bajo el cursor

#### Scenario: Límite de zoom
- **WHEN** la persona sigue acercando al llegar al zoom máximo
- **THEN** la vista no se acerca más

### Requirement: Paneo
La vista SHALL permitir desplazar el encuadre arrastrando con el mouse. Al
panear, la cámara MUST dejar de seguir al auto hasta que se restablezca la
vista.

#### Scenario: Arrastrar la vista
- **WHEN** la persona arrastra el escenario con el mouse
- **THEN** el encuadre se desplaza con el arrastre y deja de seguir al auto

#### Scenario: Clic sin arrastre
- **WHEN** la persona hace clic sobre el escenario sin arrastrar
- **THEN** la cámara sigue al auto

### Requirement: Restablecer la vista
La vista SHALL ofrecer un control y un atajo de teclado que devuelven la cámara
al seguimiento del auto y al zoom por defecto.

#### Scenario: Volver al auto
- **WHEN** la persona cambió el zoom y paneó, y luego usa restablecer la vista
- **THEN** la cámara vuelve a seguir al auto con el zoom por defecto

#### Scenario: Reinicio de la simulación
- **WHEN** se reinicia la simulación
- **THEN** la cámara vuelve a seguir al auto

### Requirement: Controles de cámara explicados
Cada control de cámara en pantalla (acercar, alejar, restablecer la vista)
SHALL tener un tooltip que diga qué hace y por qué importa, y sus textos SHALL
estar en español y en inglés.

#### Scenario: Tooltip de un control de cámara
- **WHEN** la persona posa el cursor sobre el control de restablecer la vista
- **THEN** aparece un tooltip en el idioma activo que explica qué hace y por qué importa

### Requirement: Adaptación al tamaño de la ventana
La vista SHALL ocupar el espacio disponible de su zona y verse nítida en
pantallas de cualquier densidad de píxeles, sin deformar el escenario al
cambiar el tamaño de la ventana.

#### Scenario: Cambio de tamaño
- **WHEN** la persona cambia el tamaño de la ventana
- **THEN** la vista se ajusta al nuevo espacio y los autos conservan sus proporciones

### Requirement: Fluidez
La vista SHALL mostrar la simulación de forma fluida con la configuración por
defecto en una computadora de escritorio de uso general.

#### Scenario: Medición con la configuración por defecto
- **WHEN** se mide la tasa de cuadros durante diez segundos de manejo con la configuración por defecto
- **THEN** el promedio es de al menos 55 cuadros por segundo
