# barra-escenario Specification

## Purpose
Reúne en un solo lugar, siempre a la vista e igual en todas las pestañas, los
ajustes que definen dónde y con qué maneja el auto: la pista, el tráfico, los
sensores y la velocidad. Así quien presenta los cambia sin buscar, y los
paneles quedan solo con lo propio de cada pestaña.

## Requirements

### Requirement: Barra de escenario
Toda pestaña con escenario SHALL mostrar, debajo del encabezado y a todo el
ancho, una barra con los ajustes de su escenario en este orden: pista; tráfico
(carriles, densidad e irregularidad); sensores (cantidad, alcance y apertura);
velocidad máxima del auto; y restablecer. Todos MUST estar a la vista sin
desplegar nada, con su nombre y su valor. La barra muestra los valores de la
pestaña a la vista.

#### Scenario: Estado por defecto
- **WHEN** se abre la aplicación
- **THEN** la barra muestra la calle recta elegida, 3 carriles, densidad 50 %, los 5 sensores de 3 largos y 90 grados y la velocidad de 20 m/s, sin que haya que abrir nada

#### Scenario: Mismo lugar en las tres pestañas
- **WHEN** la persona pasa de El problema a Reglas a mano y a Entrenar
- **THEN** la barra está en el mismo lugar, con los mismos controles en el mismo orden

#### Scenario: Valores de cada pestaña
- **WHEN** la persona pone 4 carriles en El problema y abre Entrenar
- **THEN** la barra muestra los carriles de Entrenar, y al volver a El problema siguen siendo 4

#### Scenario: Un renglón
- **WHEN** la ventana mide 1366 píxeles de ancho o más, en español o en inglés
- **THEN** la barra ocupa un solo renglón, sin texto cortado

#### Scenario: Ventana más angosta
- **WHEN** la ventana mide menos de 1366 píxeles de ancho
- **THEN** la barra pasa a dos renglones, con todos sus controles a la vista

### Requirement: Pista en la barra
La barra SHALL mostrar las cuatro pistas del catálogo como opciones a la
vista, cada una con la miniatura de su trazado y su nombre, con exactamente
una elegida. Elegir una pista MUST aplicarse con un solo clic y en el momento.

#### Scenario: Elegir con un clic
- **WHEN** la persona hace clic en el óvalo
- **THEN** el óvalo queda elegido y el escenario muestra el óvalo de inmediato

#### Scenario: Volver a la calle recta
- **WHEN** la persona hace clic en la calle recta
- **THEN** el escenario vuelve a mostrar la calle recta

#### Scenario: Miniaturas
- **WHEN** la persona mira las cuatro pistas de la barra
- **THEN** distingue la calle recta de los tres circuitos, y cada circuito de los otros, por su miniatura

#### Scenario: Pista elegida sin depender del color
- **WHEN** una pista está elegida
- **THEN** se distingue de las otras también por algo que no es el color

### Requirement: Cambios del escenario en el momento
Todo cambio hecho en la barra SHALL verse en el escenario en el momento, en
cualquier pestaña, sin quedar esperando. En El problema y en Reglas a mano
rigen las reglas de siempre (la velocidad, la densidad y la irregularidad en
marcha; la pista, los carriles y los sensores reinician el intento). En
Entrenar, la pista, los carriles, la densidad, la irregularidad y la velocidad
vuelven a empezar la generación en curso; los sensores empiezan un
entrenamiento nuevo, con su confirmación.

#### Scenario: Densidad en Entrenar
- **WHEN** la persona sube la densidad durante una generación en Entrenar
- **THEN** la generación en curso vuelve a empezar con el tráfico más denso, con los mismos autos

#### Scenario: Arrastre de un deslizador en Entrenar
- **WHEN** la persona arrastra el deslizador de densidad pasando por varios valores
- **THEN** la generación vuelve a empezar una sola vez, al soltar el deslizador

#### Scenario: Aviso de lo que pasó
- **WHEN** un cambio de la barra vuelve a empezar la generación en curso
- **THEN** un aviso breve junto al número de generación lo dice, y un lector de pantalla lo anuncia

#### Scenario: Sensores en Entrenar
- **WHEN** la persona cambia la cantidad de sensores en Entrenar con generaciones terminadas
- **THEN** la confirmación de entrenamiento nuevo aparece junto a la barra, y nada cambia hasta que confirma

### Requirement: Ajustes de tráfico en un circuito
En un circuito, los ajustes de carriles, densidad e irregularidad de la barra
SHALL verse deshabilitados y explicar que en un circuito no hay tráfico. Sus
valores MUST conservarse para cuando se vuelva a la calle recta.

#### Scenario: Circuito elegido
- **WHEN** la persona elige un circuito
- **THEN** carriles, densidad e irregularidad se ven deshabilitados y su tooltip explica por qué

#### Scenario: Valores conservados
- **WHEN** la persona tenía la densidad en 80 %, elige un circuito y vuelve a la calle recta
- **THEN** la densidad sigue en 80 %

### Requirement: Restablecer el escenario
La barra SHALL ofrecer un botón que devuelve la pista, el tráfico, los sensores
y la velocidad de la pestaña a la vista a sus valores por defecto, con el
mismo efecto que cambiarlos uno por uno.

#### Scenario: Restablecer
- **WHEN** la persona cambió la pista, los carriles y los sensores, y presiona restablecer
- **THEN** la barra vuelve a mostrar los valores por defecto y el escenario los aplica

#### Scenario: Restablecer en Entrenar con los sensores cambiados
- **WHEN** en Entrenar restablecer implica cambiar los sensores, con generaciones terminadas
- **THEN** se pide la confirmación de entrenamiento nuevo antes de aplicar nada

### Requirement: Barra explicada y accesible
Cada control de la barra SHALL tener un tooltip que diga qué hace y por qué
importa, en español y en inglés. La barra SHALL poder recorrerse entera con el
teclado, anunciarse a un lector de pantalla como un grupo llamado "Escenario"
con sus subgrupos, y cumplir el contraste de los límites y el tamaño mínimo
de los controles.

#### Scenario: Tooltip de la densidad
- **WHEN** la persona posa el cursor sobre la densidad
- **THEN** un tooltip en el idioma activo dice qué cambia y por qué importa

#### Scenario: Teclado
- **WHEN** la persona recorre la barra con Tab y cambia la pista con las flechas
- **THEN** llega a todos los controles en el orden en que se ven y puede cambiar cada uno sin el mouse

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a la barra
- **THEN** anuncia el grupo "Escenario", y para cada control su nombre completo, su valor y, en las pistas, cuál está elegida

#### Scenario: Ver como la máquina
- **WHEN** está activo "ver como la máquina"
- **THEN** la barra sigue a la vista y usable
