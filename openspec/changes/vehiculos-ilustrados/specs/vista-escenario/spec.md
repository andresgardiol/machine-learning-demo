## ADDED Requirements

### Requirement: Vehículos ilustrados
La vista SHALL dibujar el auto del conductor y cada tipo de vehículo del tráfico (moto, auto, camioneta y camión) con un dibujo propio visto desde arriba, con volumen, vidrios, brillos y luces, en un mismo estilo mitad realista y mitad caricatura. El frente de cada vehículo y su tipo MUST reconocerse a simple vista con el zoom por defecto.

#### Scenario: Escena por defecto
- **WHEN** se abre El problema sin configurar nada
- **THEN** el auto del conductor y los vehículos del tráfico se ven con sus dibujos ilustrados, cada uno con su frente reconocible

#### Scenario: Cada tipo se reconoce
- **WHEN** en la escena hay una moto, un auto, una camioneta y un camión del tráfico
- **THEN** cada uno se distingue de los otros tres por su forma, y no solo por su tamaño

#### Scenario: Mismo dibujo en las dos versiones
- **WHEN** se muestra la misma escena en la V1 y en la V2
- **THEN** los vehículos tienen el mismo dibujo

### Requirement: Un dibujo, muchos colores
Cada dibujo SHALL pintar su carrocería con el color que corresponde a su papel, que es el del auto del conductor, el del tráfico, el de cada competidor o el del choque, y SHALL conservar los mismos vidrios, brillos y sombras con cualquier color. Los colores MUST seguir siendo los de siempre para cada papel.

#### Scenario: Competidores con su color
- **WHEN** compiten seis autos en Competir
- **THEN** los seis tienen el mismo dibujo de auto, cada uno con la carrocería de su color de competidor

#### Scenario: Tráfico de muchos colores
- **WHEN** se muestra la calle con tráfico
- **THEN** los vehículos del tráfico tienen carrocerías de distintos colores de la paleta del tráfico, sea cual sea su tipo

#### Scenario: Choque reconocible sin color
- **WHEN** el auto del conductor choca
- **THEN** además del color del choque se ve la marca de choque de siempre, de modo que se reconoce también en escala de grises

### Requirement: Lo que se ve es lo que choca
La carrocería de cada vehículo dibujado, con todas sus partes, MUST quedar dentro de su contorno de choque. Solo una sombra tenue MAY salir de él, y como mucho 0,15 m.

#### Scenario: Carrocería dentro del contorno
- **WHEN** se dibuja cada tipo de vehículo en cualquier ángulo
- **THEN** ningún punto de su carrocería queda fuera de su contorno de choque

#### Scenario: Roce visible
- **WHEN** el auto del conductor pasa a 0,2 m del costado de un camión sin chocar
- **THEN** en la escena se ve un hueco entre los dos dibujos

### Requirement: Faros que no parecen sensores
La luz de los faros, donde se dibuje, MUST NOT confundirse con los rayos de los sensores: no SHALL pasar de un largo de auto por delante del vehículo, y su intensidad SHALL apagarse en forma gradual, sin bordes rectos como los de un rayo.

#### Scenario: Faros junto a los rayos
- **WHEN** en la V2 el auto maneja con los sensores visibles
- **THEN** la luz de los faros termina antes de un largo de auto y los rayos se distinguen de ella a simple vista

### Requirement: Población con la forma ilustrada
En una población, los autos atenuados SHALL dibujarse con la forma del auto ilustrado, en un solo tono y sin detalle, en vez de un rectángulo. El líder SHALL tener el dibujo completo.

#### Scenario: Entrenar con cien autos
- **WHEN** se muestra una población de cien autos en Entrenar
- **THEN** los autos atenuados tienen la forma del auto ilustrado y el líder se ve con su dibujo completo y sus rayos

#### Scenario: Población grande y fluida
- **WHEN** se muestra una población de quinientos autos durante diez segundos
- **THEN** el promedio es de al menos 50 cuadros por segundo, lo mismo que pide *Fluidez con una población* para cien

### Requirement: Rayos debajo del auto
En todas las pestañas con escena, los rayos de los sensores y sus marcas SHALL dibujarse debajo del auto del que salen, de modo que el auto se vea entero. Los puntos donde los rayos detectan algo y las manijas para mover un rayo a mano SHALL seguir viéndose.

#### Scenario: Inspeccionar con sensores
- **WHEN** se abre Inspeccionar con los sensores visibles
- **THEN** el auto se ve entero, con los rayos saliendo por debajo, igual que en El problema

#### Scenario: Todas las pestañas con escena
- **WHEN** se muestra el auto con sus sensores en El problema, Reglas a mano, Entrenar, Competir, Inspeccionar y el Laboratorio, en la V1 y en la V2
- **THEN** en ninguna los rayos pasan por encima de la carrocería del auto

#### Scenario: Manijas a la vista
- **WHEN** en una pestaña se pueden mover los rayos a mano
- **THEN** las manijas de los extremos de los rayos siguen viéndose y se pueden tomar como antes

## MODIFIED Requirements

### Requirement: Colores con significado constante
La vista SHALL usar siempre el mismo color para el mismo tipo de elemento (auto
del conductor, sensores, pista) en cualquier escenario y pestaña. El tráfico
SHALL usar una paleta propia de varios colores, todos distintos del color del
auto del conductor, del color del choque y de los seis colores de los
competidores, de modo que ningún vehículo del tráfico se confunda con ellos. El
color de cada vehículo del tráfico SHALL salir de la semilla: con la misma
semilla, los mismos colores.

#### Scenario: Mismo significado tras cambiar el escenario
- **WHEN** se cambia la cantidad de carriles o se genera tráfico nuevo
- **THEN** el auto del conductor y los sensores conservan sus colores, y el tráfico sigue usando su paleta

#### Scenario: El tráfico no se confunde con los autos que importan
- **WHEN** en Competir corren seis competidores por la calle con tráfico
- **THEN** ningún vehículo del tráfico tiene el color del auto del conductor, del choque ni de ninguno de los seis competidores

#### Scenario: Mismos colores con la misma semilla
- **WHEN** se abre dos veces la misma escena con la misma semilla
- **THEN** cada vehículo del tráfico tiene el mismo color las dos veces
