# Spec Delta

## MODIFIED Requirements

### Requirement: Elegir una neurona o una conexión
El inspector SHALL permitir elegir con un clic una neurona o una conexión, en
el diagrama o en la tabla, y avisar cuál se eligió. Hay como mucho una cosa
elegida. Lo elegido SHALL poder soltarse con otro clic sobre lo mismo, con un
clic en un lugar vacío o con Escape. Al elegir, lo relacionado se destaca y
el resto se atenúa sin desaparecer.

#### Scenario: Elegir en el diagrama
- **WHEN** la persona hace clic en una neurona
- **THEN** queda marcada como elegida, se destacan las conexiones que le entran y las que salen de ella, y el inspector avisa cuál es

#### Scenario: Elegir una conexión en el diagrama
- **WHEN** la persona hace clic sobre una línea
- **THEN** esa conexión queda elegida, se destaca junto con sus dos neuronas, y el inspector avisa de dónde a dónde va

#### Scenario: Elegir en la tabla
- **WHEN** la persona hace clic en una celda de la tabla
- **THEN** queda elegida la conexión de esa celda

#### Scenario: Soltar con otro clic
- **WHEN** la persona hace clic otra vez en lo que está elegido
- **THEN** nada queda elegido y la red vuelve a verse entera

#### Scenario: Clic fuera
- **WHEN** la persona hace clic en un lugar vacío del diagrama sin arrastrar
- **THEN** nada queda elegido

#### Scenario: Soltar con Escape
- **WHEN** el foco está en la red, hay algo elegido y la persona presiona Escape
- **THEN** nada queda elegido

#### Scenario: Arrastrar no suelta
- **WHEN** la persona arrastra el diagrama para moverlo con algo elegido
- **THEN** lo elegido sigue elegido

#### Scenario: Neurona antes que línea
- **WHEN** el clic cae sobre una neurona por la que pasan líneas
- **THEN** se elige la neurona

#### Scenario: Línea más cercana
- **WHEN** el clic cae a menos de 6 píxeles de varias líneas
- **THEN** se elige la más cercana y, con una neurona elegida, primero las suyas

#### Scenario: Lo demás no desaparece
- **WHEN** hay algo elegido
- **THEN** las conexiones que no están relacionadas siguen viéndose, atenuadas

#### Scenario: Neurona de entrada
- **WHEN** la persona elige una neurona de entrada
- **THEN** queda elegida y se destacan las conexiones que salen de ella

## ADDED Requirements

### Requirement: Estado sin nada elegido
El inspector SHALL mostrar la red sin nada elegido, y ese es su estado al
abrir en todas las pestañas que lo usan: ninguna conexión se destaca ni se
atenúa por elección, y la red se ve entera y pareja.

#### Scenario: Nada elegido
- **WHEN** no hay nada elegido
- **THEN** todas las conexiones se ven con su grosor, su trazo y su brillo, y ninguna neurona lleva la marca de elegida

#### Scenario: Estado por defecto
- **WHEN** se abre Inspeccionar o el Laboratorio
- **THEN** no hay nada elegido

### Requirement: Conexiones siempre visibles
Toda conexión con peso distinto de cero SHALL verse. El grosor es relativo al
peso más grande de la red, sin el signo, con un mínimo que se distingue; el
signo va con color y trazo; y el brillo dice cuánta señal pasa ahora, sin
bajar de un piso. El piso y el grosor máximo MUST bajar con la cantidad de
conexiones entre dos capas, para que una red densa no sea una mancha.

#### Scenario: Red de pesos chicos
- **WHEN** se muestra una red cuyos pesos no pasan de 0,25
- **THEN** la conexión de mayor peso se ve con el grosor máximo y las demás en proporción, no todas con el mínimo

#### Scenario: Cerebro de ejemplo
- **WHEN** se abre Inspeccionar con el cerebro de ejemplo de la calle y nada elegido
- **THEN** las 60 conexiones se distinguen del fondo, cada una con al menos 1,5 píxeles de grosor

#### Scenario: Sin señal
- **WHEN** por una conexión no pasa señal en este cuadro
- **THEN** se ve con el piso de brillo, no desaparece

#### Scenario: Con señal
- **WHEN** por una conexión pasa la mayor señal del cuadro
- **THEN** es la más brillante

#### Scenario: Peso cero
- **WHEN** una conexión tiene peso cero
- **THEN** se ve como una línea fina y gris, distinta de una apagada

#### Scenario: Peso cambiado a mano
- **WHEN** la persona lleva un peso a un valor mayor que todos los demás
- **THEN** esa conexión pasa a ser la más gruesa y las demás se afinan en proporción

#### Scenario: Red densa
- **WHEN** se muestra la red más grande que permite la aplicación, sin nada elegido
- **THEN** se distinguen las capas y las conexiones más fuertes, y el conjunto no es una mancha uniforme

#### Scenario: Grosor entre capas densas
- **WHEN** dos capas vecinas tienen 256 conexiones o más entre ellas
- **THEN** la más gruesa de esas conexiones mide 4 píxeles o menos, y la más fina sigue midiendo al menos 1,5

#### Scenario: Mismo aspecto, misma red
- **WHEN** se muestra dos veces la misma red con la misma cuenta
- **THEN** cada conexión tiene el mismo grosor y el mismo brillo

### Requirement: Neuronas que usan el espacio
El tamaño de las neuronas SHALL salir del lugar que hay: crecen hasta llenar
el alto y el ancho que les toca, con un máximo de 44 píxeles de radio. Al
resumir una capa, las neuronas de las capas abiertas MUST crecer si esa capa
era la que las limitaba.

#### Scenario: Red chica
- **WHEN** se muestra una red de 6 entradas, 6 ocultas y 4 salidas en una zona de 708×648 píxeles
- **THEN** cada neurona mide al menos 30 píxeles de radio

#### Scenario: Resumir la capa más alta
- **WHEN** la persona resume la capa de 21 entradas de una red cuyas otras capas tienen 8 neuronas o menos
- **THEN** las neuronas de las otras capas se ven más grandes que antes

#### Scenario: Sin encimarse
- **WHEN** se muestra cualquier red que la aplicación permite
- **THEN** ninguna neurona toca a su vecina ni tapa un rótulo

#### Scenario: Zona que cambia de tamaño
- **WHEN** la persona agranda la zona de la red
- **THEN** las neuronas crecen con ella, hasta el máximo

### Requirement: Neurona por dentro
Cada neurona SHALL mostrar adentro tanto detalle como le entra. Chica, solo su
relleno. Mediana, su valor en números. Grande, además dónde cae su suma en la
activación. Muy grande, además su suma y su sesgo. El detalle MUST cambiar
solo con el tamaño en pantalla, sea por el lugar, por resumir capas o por
acercar.

#### Scenario: Neurona mediana
- **WHEN** una neurona mide 12 píxeles de radio o más
- **THEN** muestra su valor con dos decimales

#### Scenario: Neurona grande
- **WHEN** una neurona oculta o de salida mide 24 píxeles de radio o más
- **THEN** muestra su valor y una marca de dónde cae su suma en la curva de su activación

#### Scenario: Neurona muy grande
- **WHEN** una neurona mide 40 píxeles de radio o más
- **THEN** muestra además su suma y su sesgo con su nombre

#### Scenario: Al acercar
- **WHEN** la persona acerca la vista sobre una red de neuronas chicas
- **THEN** las neuronas pasan a mostrar su valor y después su detalle, sin que la persona elija nada

#### Scenario: Sin calcular
- **WHEN** una neurona todavía no se calculó en un recorrido paso a paso
- **THEN** no muestra ningún número

### Requirement: Vista previa al posar el cursor
Al posar el cursor sobre una neurona o una conexión, el inspector SHALL
destacarla como si estuviera elegida, sin elegirla, y mostrar junto al cursor
una lectura breve: qué es y cuánto vale. Al sacar el cursor, la red MUST
volver a como estaba. La lectura no es una ayuda de la guía: aparece siempre.

#### Scenario: Cursor sobre una neurona
- **WHEN** la persona posa el cursor sobre una neurona oculta
- **THEN** se destacan sus conexiones y una lectura dice su nombre, su valor, su suma y su sesgo

#### Scenario: Cursor sobre una conexión
- **WHEN** la persona posa el cursor sobre una línea
- **THEN** la línea se destaca y una lectura dice de dónde a dónde va, su peso y cuánto aporta ahora

#### Scenario: Sacar el cursor
- **WHEN** la persona saca el cursor sin hacer clic
- **THEN** la red vuelve a verse como antes, con lo que estaba elegido si había algo

#### Scenario: Con la guía apagada
- **WHEN** la guía está apagada y la persona posa el cursor sobre una neurona
- **THEN** la lectura aparece igual

#### Scenario: Sin demora
- **WHEN** la persona mueve el cursor de una neurona a otra
- **THEN** lo destacado y la lectura cambian en el mismo cuadro

#### Scenario: No tapa
- **WHEN** aparece la lectura
- **THEN** no tapa la neurona ni la línea que describe

### Requirement: Números sobre las conexiones
Con una neurona elegida, cada conexión que le entra SHALL mostrar su peso
sobre la línea, mientras haya lugar. Con una conexión elegida, esa conexión
muestra su peso. Los números MUST seguir legibles al acercar y no encimarse
entre sí.

#### Scenario: Neurona elegida
- **WHEN** la persona elige una neurona con 6 conexiones de entrada
- **THEN** cada una de las 6 líneas lleva su peso con dos decimales

#### Scenario: Sin lugar
- **WHEN** la neurona elegida tiene 21 entradas y los números se encimarían
- **THEN** llevan número solo las de mayor peso que entran sin encimarse, y las demás se leen al posar el cursor

#### Scenario: Nada elegido
- **WHEN** no hay nada elegido
- **THEN** ninguna línea lleva número

### Requirement: Cambiar un peso en el lugar
La conexión elegida SHALL llevar sobre la línea una pastilla con su peso, que
se puede arrastrar o mover con las flechas para cambiarlo, cuando la pestaña
permite cambios. El efecto MUST verse mientras se mueve, y el detalle del
panel MUST mostrar el mismo valor. Cuenta como un cambio que se deshace.

#### Scenario: Arrastrar la pastilla
- **WHEN** la persona arrastra la pastilla hacia arriba
- **THEN** el peso sube, la línea engrosa y la red recalcula mientras la mueve

#### Scenario: Con el teclado
- **WHEN** la pastilla tiene el foco y la persona usa las flechas
- **THEN** el peso cambia de a 0,01, y de a 0,1 con Mayús

#### Scenario: Un arrastre es un cambio
- **WHEN** la persona arrastra la pastilla y la suelta
- **THEN** cuenta como un solo cambio y "Deshacer" lo vuelve atrás

#### Scenario: Mismo valor en el panel
- **WHEN** la persona mueve la pastilla
- **THEN** el deslizador del detalle se mueve con ella

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a la pastilla
- **THEN** la anuncia como un deslizador, con de dónde a dónde va la conexión y su valor

### Requirement: De dónde viene una neurona
Con una neurona elegida, el inspector SHALL destacar todo el camino hacia
atrás, hasta las entradas, con cada tramo según cuánto aporta a lo que esa
neurona recibe. El filtro de conexiones MUST limitar cuántos tramos se siguen
desde cada neurona del camino.

#### Scenario: Rastro de una decisión
- **WHEN** la persona elige una salida de una red con dos capas ocultas
- **THEN** se destacan las conexiones que le entran y, detrás de cada una, las que alimentan a esa neurona, hasta los sensores

#### Scenario: Lo que más aporta
- **WHEN** un sensor aporta la mayor parte de lo que recibe la salida elegida
- **THEN** el camino desde ese sensor es el más destacado

#### Scenario: Un solo camino
- **WHEN** el filtro de conexiones está en la más importante
- **THEN** desde la neurona elegida se destaca un solo camino hasta una entrada

#### Scenario: Cambia con la señal
- **WHEN** el auto maneja y los sensores cambian
- **THEN** el camino destacado cambia con ellos

### Requirement: Flujo de la señal
Cuando la pestaña lo pide, el inspector SHALL mostrar marcas que viajan por
las conexiones por las que pasa señal, de las entradas a las salidas, con el
color del signo y más marcas donde pasa más. MUST poder apagarse, MUST NOT
mostrarse durante un paso a paso, y MUST respetar la preferencia de menos
movimiento.

#### Scenario: Red manejando
- **WHEN** la red se reproduce en tiempo real con el flujo encendido
- **THEN** por las conexiones con señal viajan marcas hacia la capa siguiente

#### Scenario: Sin señal
- **WHEN** por una conexión no pasa señal
- **THEN** no lleva marcas

#### Scenario: Paso a paso
- **WHEN** la persona avanza de a un paso
- **THEN** el flujo no se muestra y se ve la animación del paso

#### Scenario: En pausa
- **WHEN** la reproducción está en pausa
- **THEN** las marcas se detienen

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** no hay marcas que viajen

### Requirement: Pocos colores con significado
El diagrama SHALL usar un solo par de colores para el signo, uno para lo
elegido y uno para el paso en curso; el aprendizaje suma uno para la culpa.
Lo apagado, lo cambiado y lo puesto a mano MUST marcarse con forma, sin un
color propio. Los dos colores del signo MUST distinguirse con las formas
comunes de daltonismo, además del trazo.

#### Scenario: Par del signo
- **WHEN** se validan los dos colores del signo contra el fondo de la red
- **THEN** su separación con deuteranopia, protanopia y tritanopia es de 8 o más, y su contraste con el fondo, de 3 a 1 o más

#### Scenario: Cambiado a mano
- **WHEN** un peso está cambiado a mano
- **THEN** su conexión lleva una marca con forma, del color del texto

#### Scenario: Sin color
- **WHEN** la persona no distingue los colores
- **THEN** distingue positivo de negativo por el trazo, y lo elegido, lo que se calcula, lo apagado y lo cambiado por su forma

### Requirement: Mapa dentro de la neurona
Cuando la pestaña le pasa un mapa por neurona, el inspector SHALL dibujarlo
adentro de cada neurona abierta que mida 20 píxeles de radio o más, en lugar
de su relleno, con su valor encima. Sin mapas, las neuronas se ven como
siempre.

#### Scenario: Con mapas
- **WHEN** la pestaña pasa un mapa para cada neurona oculta
- **THEN** cada una muestra su mapa adentro, recortado a su círculo

#### Scenario: Neurona chica
- **WHEN** una neurona mide menos de 20 píxeles de radio
- **THEN** muestra su relleno de siempre

#### Scenario: Sin mapas
- **WHEN** la pestaña no pasa mapas
- **THEN** el inspector se ve igual que sin esta opción

## REMOVED Requirements

### Requirement: Sin neurona elegida
**Reason**: Pedía que Inspeccionar tuviera siempre una neurona elegida. Ahora todas las pestañas abren sin nada elegido y lo elegido se puede soltar.
**Migration**: Lo reemplaza "Estado sin nada elegido". El Laboratorio ya abría sin neurona elegida; Inspeccionar pasa a hacerlo.
