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

### Requirement: Dibujo de una población
Cuando el mundo tiene varios autos, la vista SHALL dibujarlos a todos: el auto
líder con su aspecto completo y sus sensores, y los demás atenuados y sin
sensores, de modo que el líder se distinga a simple vista. Los autos fuera de
carrera (chocados o eliminados por lentos) MUST distinguirse de los que siguen en carrera, y no solo por el color.

#### Scenario: Población en carrera
- **WHEN** se muestra un mundo con cien autos
- **THEN** se ven los cien, uno de ellos destacado con sus rayos y el resto atenuado sin rayos

#### Scenario: Autos fuera de carrera
- **WHEN** parte de la población chocó o fue eliminada por lenta
- **THEN** los autos fuera de carrera se ven con un aspecto distinto del de los autos en carrera, reconocible sin depender del color

#### Scenario: Mundo de un solo auto
- **WHEN** se muestra un mundo con un solo auto
- **THEN** el dibujo es el mismo que antes de este cambio

### Requirement: Marca de la élite
La vista SHALL poder marcar de forma reconocible a los autos que pasaron sin
cambios desde la generación anterior, para que se vea qué hace el mejor
individuo heredado.

#### Scenario: Élite marcada
- **WHEN** se muestra una generación que tiene un individuo de élite
- **THEN** ese auto lleva una marca que lo diferencia del resto de la población y del líder

### Requirement: Seguimiento del líder
La cámara SHALL poder seguir a un auto que cambia con el tiempo. Cuando el auto
seguido cambia, el encuadre MUST desplazarse de forma continua hacia el nuevo,
sin saltar de golpe, salvo al reiniciarse el mundo.

#### Scenario: Cambio de líder
- **WHEN** otro auto pasa a ser el líder a pocos metros del anterior
- **THEN** el encuadre se desliza hasta el nuevo líder en lugar de saltar

#### Scenario: Nueva generación
- **WHEN** empieza una generación nueva
- **THEN** la cámara muestra de inmediato la línea de salida

#### Scenario: Paneo durante el entrenamiento
- **WHEN** la persona panea el escenario mientras la población avanza
- **THEN** la cámara deja de seguir al líder hasta que se restablece la vista

### Requirement: Fluidez con una población
La vista SHALL mantenerse fluida al mostrar una población a velocidad normal
en una computadora de escritorio de uso general.

#### Scenario: Población por defecto
- **WHEN** se mide la tasa de cuadros durante diez segundos con una población de 100 autos a velocidad normal
- **THEN** el promedio es de al menos 50 cuadros por segundo

#### Scenario: Población máxima
- **WHEN** se mide la tasa de cuadros durante diez segundos con una población de 500 autos a velocidad normal
- **THEN** el promedio es de al menos 30 cuadros por segundo

### Requirement: Dibujo de un circuito
La vista SHALL dibujar un circuito con sus dos bordes cerrados, sin líneas de
carril, y con la línea de salida marcada de borde a borde. El circuito MUST
mostrarse con una orientación fija: la recta de salida vertical y el sentido
de avance hacia arriba, como la calle recta. La cámara sigue al auto, pero la
pista no gira con él, para que el trazado se reconozca.

#### Scenario: Óvalo a la vista
- **WHEN** se muestra el óvalo con el zoom por defecto
- **THEN** se ven los dos bordes del tramo donde está el auto y la línea de salida, y no hay líneas de carril

#### Scenario: La pista no gira
- **WHEN** el auto toma una curva de un circuito
- **THEN** el auto gira en pantalla y la pista conserva su orientación

#### Scenario: Salida hacia arriba
- **WHEN** se muestra la línea de salida de cualquier circuito
- **THEN** la recta de salida se ve vertical y el auto mira hacia arriba

#### Scenario: Calle recta sin cambios
- **WHEN** se muestra la calle recta
- **THEN** se sigue viendo vertical, con el sentido de avance hacia arriba y sus líneas de carril

### Requirement: Circuito entero a la vista
El zoom SHALL permitir alejar la vista hasta ver entero cualquier circuito del
catálogo en una ventana de 1440×900, y restablecer la vista SHALL volver al
zoom por defecto siguiendo al auto.

#### Scenario: Alejar hasta ver todo
- **WHEN** la persona aleja el zoom al mínimo sobre el gran premio, con el tablero a la vista
- **THEN** todo el trazado entra en el escenario

#### Scenario: Restablecer
- **WHEN** la persona presiona restablecer la vista después de alejar el zoom
- **THEN** la vista vuelve al zoom por defecto, centrada en el auto

### Requirement: Fluidez en un circuito
La vista SHALL mantenerse fluida en un circuito, con el paisaje encendido, en
una computadora de escritorio de uso general.

#### Scenario: Un auto
- **WHEN** se mide la tasa de cuadros durante diez segundos de manejo en el gran premio con el paisaje encendido
- **THEN** el promedio es de al menos 55 cuadros por segundo

#### Scenario: Una población
- **WHEN** se mide la tasa de cuadros durante diez segundos con una población de 100 autos en el gran premio, a velocidad normal y con el paisaje encendido
- **THEN** el promedio es de al menos 50 cuadros por segundo

### Requirement: Competidores distinguibles
Al mostrar una carrera, la vista SHALL dibujar a cada competidor con un color
y un número propios, de modo que se los distinga entre sí y del tráfico sin
depender solo del color. El auto manejado por la persona SHALL conservar el
verde del auto del conductor. El competidor en foco se dibuja encima. Se
dibujan los sensores de los competidores que la pestaña indique, con el color
de cada uno. Los que ya no corren, porque llegaron o no terminaron, se ven
atenuados.

#### Scenario: Seis competidores
- **WHEN** se muestra una carrera de seis competidores
- **THEN** cada auto lleva su número a la vista y ninguno comparte color con otro ni con el tráfico

#### Scenario: Autos superpuestos
- **WHEN** varios competidores están en el mismo lugar, como en la salida
- **THEN** el competidor en foco se ve encima de los demás

#### Scenario: Sensores de dos competidores
- **WHEN** la pestaña pide mostrar los sensores de dos competidores
- **THEN** los rayos de cada uno se ven con su color, y los puntos donde detectan algo se distinguen sin depender solo del color

#### Scenario: Competidor que choca
- **WHEN** un competidor choca
- **THEN** su auto muestra la marca de choque donde chocó mientras dura la penalización, y después se lo ve reaparecer más atrás

#### Scenario: Recién reaparecido
- **WHEN** un competidor acaba de reaparecer y el tráfico todavía no puede chocarlo
- **THEN** su auto se ve translúcido y con el contorno punteado, sin depender solo de un parpadeo, hasta que termina la protección, también mientras pasa a través de un vehículo

#### Scenario: Competidor fuera de la carrera
- **WHEN** un competidor queda como que no terminó
- **THEN** su auto queda donde estaba, atenuado, y su número sigue leyéndose

#### Scenario: Mismos colores que en el tablero
- **WHEN** la persona mira un auto en el escenario y su fila en el marcador
- **THEN** llevan el mismo color y el mismo número

### Requirement: Meta a la vista
Al mostrar una carrera, la vista SHALL dibujar la meta: en la calle recta, una
línea a cuadros que cruza la calle a la distancia de la meta; en un circuito,
la línea de salida, que es también la de llegada.

#### Scenario: Meta de la calle
- **WHEN** un competidor se acerca a los 1000 metros en la calle recta
- **THEN** se ve la línea de meta cruzando todos los carriles, y se distingue de las líneas de carril

#### Scenario: Meta de un circuito
- **WHEN** se muestra una carrera en el óvalo
- **THEN** la línea de salida se ve como línea de llegada

### Requirement: Fluidez en una carrera
La vista SHALL mantenerse fluida con seis competidores y el paisaje encendido
en una computadora de escritorio de uso general.

#### Scenario: Carrera en el circuito más largo
- **WHEN** se mide la tasa de cuadros durante diez segundos de una carrera de seis competidores en el circuito de curvas, a velocidad normal
- **THEN** el promedio es de al menos 55 cuadros por segundo

### Requirement: Escena chica
La vista SHALL poder mostrarse en un recuadro chico, para una pestaña donde
el auto no es lo principal: sigue al auto, encuadra lo que alcanzan a ver sus
sensores y no muestra controles de cámara ni responde a sus gestos. MUST
verse igual de nítida y con los mismos colores que el escenario grande.

#### Scenario: Recuadro de 340 por 220
- **WHEN** la escena se muestra en un recuadro de 340 por 220 píxeles
- **THEN** se ven el auto, sus rayos enteros y los bordes y vehículos que tocan, sin botones de cámara

#### Scenario: Recuadro que cambia de tamaño
- **WHEN** el recuadro se agranda
- **THEN** la escena conserva el encuadre y se ve más grande, sin deformarse

#### Scenario: Sin gestos de cámara
- **WHEN** la persona usa la rueda o arrastra sobre la escena chica
- **THEN** el encuadre no cambia

### Requirement: Rayos que se mueven a mano
La vista SHALL poder mostrar, sobre cada rayo, una manija que marca dónde
detecta algo y que se puede arrastrar a lo largo del rayo, avisando la lectura
que corresponde a cada posición. SHALL poder dibujar cada rayo con un color y
un grosor indicados por la pestaña, y un rayo como apagado.

#### Scenario: Arrastrar una manija
- **WHEN** la persona arrastra la manija de un rayo hasta la mitad
- **THEN** la vista avisa una lectura de 0,5 para ese sensor mientras arrastra, y la manija no se sale del rayo

#### Scenario: Manija en la punta
- **WHEN** la manija está en la punta del rayo
- **THEN** la lectura es 0: el sensor no detecta nada

#### Scenario: Manijas agarrables
- **WHEN** el auto tiene 20 sensores en un recuadro de 340 por 220 píxeles
- **THEN** cada manija se puede agarrar sin agarrar la de al lado

#### Scenario: Rayos con el peso de una neurona
- **WHEN** la pestaña indica un color y un grosor para cada rayo
- **THEN** los rayos se dibujan así, con la convención de signo del diagrama de la red

#### Scenario: Rayo apagado
- **WHEN** la pestaña indica que un sensor está apagado
- **THEN** su rayo se ve atenuado y tachado
