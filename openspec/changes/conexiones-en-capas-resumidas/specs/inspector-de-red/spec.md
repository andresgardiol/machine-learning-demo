# Spec Delta

## MODIFIED Requirements

### Requirement: Capas resumidas
Cada capa, sea de entradas, oculta o de salidas, SHALL poder resumirse y
volver a abrirse desde su propio encabezado, que está en la red misma, arriba
de la capa, con su nombre y cuántas neuronas tiene. Un solo control resume o
abre todas. Una capa resumida es un bloque angosto de cuadritos pegados, uno
por neurona, que conservan su actividad. Sus conexiones MUST seguir viéndose,
de cuadrito a cuadrito, con el mismo aspecto y comportamiento que entre capas
abiertas.

#### Scenario: Estado por defecto
- **WHEN** se abre el inspector
- **THEN** todas las capas están abiertas

#### Scenario: Encabezado sobre cada capa
- **WHEN** la persona mira una red con tres capas ocultas
- **THEN** cada una de las cinco capas tiene su encabezado justo arriba, y no hay una fila aparte de botones de capas

#### Scenario: Resumir una capa
- **WHEN** la persona hace clic en el encabezado de la primera capa oculta de una red de 16 neuronas por capa
- **THEN** esa capa pasa a ser un bloque de 16 cuadritos que siguen encendiéndose, sus conexiones siguen dibujadas hasta cada cuadrito y las otras capas ganan lugar

#### Scenario: Encabezado que sigue a su capa
- **WHEN** la persona acerca o mueve la vista
- **THEN** cada encabezado sigue arriba de su capa y a la vista, aunque la capa no entre entera

#### Scenario: Resumir las entradas o las salidas
- **WHEN** la persona resume la capa de entradas o la de salidas
- **THEN** se resume igual que una capa oculta, y sus nombres se leen al posar el cursor o con el foco en cada cuadrito

#### Scenario: Resumir todas
- **WHEN** la persona usa "Resumir todas"
- **THEN** todas las capas quedan resumidas y el control pasa a ofrecer "Abrir todas"

#### Scenario: Abrir todas
- **WHEN** la persona usa "Abrir todas" con algunas capas resumidas
- **THEN** todas las capas vuelven a verse neurona por neurona

#### Scenario: Volver a abrir una
- **WHEN** la persona vuelve a hacer clic en el encabezado de una capa resumida
- **THEN** esa capa se ve otra vez neurona por neurona

#### Scenario: Elegir un cuadrito
- **WHEN** la persona hace clic en un cuadrito de una capa resumida
- **THEN** esa neurona queda elegida, sin abrir la capa

#### Scenario: Neurona elegida en una capa resumida
- **WHEN** se resume la capa de la neurona elegida
- **THEN** su cuadrito queda marcado y la elección no se pierde

#### Scenario: En la tabla
- **WHEN** la vista es la tabla de pesos y se resume una capa
- **THEN** la tabla de esa capa se reduce a su encabezado, que es el mismo control, y su tira de actividad

#### Scenario: Recorrido que entra a una capa resumida
- **WHEN** el recorrido paso a paso llega a una capa resumida
- **THEN** el cuadrito de la neurona en curso se marca, sin abrir la capa

#### Scenario: Todas resumidas
- **WHEN** la persona resume todas las capas de una red de 21, 11, 11 y 4 neuronas
- **THEN** entre cada par de capas se ven sus conexiones como líneas de un cuadrito a otro, con el color y el trazo del signo y el grosor del peso; no hay una banda uniforme en su lugar

#### Scenario: Filtro de conexiones con capas resumidas
- **WHEN** las capas están resumidas y la persona elige ver la conexión más importante de cada neurona
- **THEN** queda destacada una línea por neurona y las demás se atenúan, igual que con las capas abiertas

#### Scenario: Grosor entre cuadritos
- **WHEN** una conexión llega a una capa resumida o sale de ella
- **THEN** su línea no es más gruesa que la mitad del lado de un cuadrito, y la más fina sigue midiendo al menos 1 píxel

#### Scenario: Elegir una conexión entre capas resumidas
- **WHEN** la persona hace clic sobre una línea entre dos capas resumidas
- **THEN** esa conexión queda elegida con su detalle, como entre capas abiertas, sin abrir ninguna capa

#### Scenario: Vista previa entre capas resumidas
- **WHEN** la persona posa el cursor sobre un cuadrito
- **THEN** se destacan las conexiones de esa neurona y las demás se atenúan

#### Scenario: Flujo entre capas resumidas
- **WHEN** el flujo de la señal está encendido y hay capas resumidas
- **THEN** el flujo corre también por las líneas que llegan a los cuadritos

#### Scenario: Una capa resumida y su vecina abierta
- **WHEN** una capa está resumida y la siguiente abierta
- **THEN** las líneas van de cada cuadrito a cada neurona abierta

#### Scenario: Red más grande, todo resumido
- **WHEN** se mide la tasa de cuadros durante diez segundos con la red más grande que permite la aplicación, todas sus capas resumidas y todas las conexiones a la vista
- **THEN** el promedio es de al menos 55 cuadros por segundo

### Requirement: Paso animado
Cada paso del recorrido SHALL verse como un movimiento, no como un salto:
leer una entrada, como su relleno que llega al valor; multiplicar, como una
marca que viaja por esa sola conexión; sumar, como esa marca que entra a la
neurona; el sesgo, en su contorno; y la activación, como el relleno que llega
a su valor. Un paso de una neurona, una capa o un cuadro encadena esos
movimientos. Lo animado MUST ser el valor real.

#### Scenario: Productos
- **WHEN** se multiplica una entrada de una neurona
- **THEN** por esa conexión, y solo por esa, viaja una marca desde su origen hasta la neurona, con el color del signo y el tamaño del aporte

#### Scenario: Suma, sesgo y activación
- **WHEN** se suma un aporte, y más adelante se avanzan el sesgo y la activación
- **THEN** la marca entra a la neurona y el rótulo de la suma pasa al valor nuevo; después se marca su contorno con el sesgo y se llena su relleno hasta la salida

#### Scenario: Una neurona entera
- **WHEN** se avanza de a una neurona
- **THEN** todas sus operaciones se ven en orden, más breves, en un solo movimiento

#### Scenario: Una capa entera
- **WHEN** se avanza de a una capa
- **THEN** todas las neuronas de la capa reciben y se encienden a la vez, como una ola

#### Scenario: Un cuadro entero en pausa
- **WHEN** se avanza de a un cuadro con la reproducción en pausa
- **THEN** se ve una ola que cruza la red de las entradas a las salidas, y después se mueve el auto

#### Scenario: Tiempo real
- **WHEN** la red se reproduce de a cuadros en tiempo real
- **THEN** los valores se actualizan sin animaciones de paso

#### Scenario: No frena a la persona
- **WHEN** la persona pide otro paso antes de que termine la animación del anterior
- **THEN** la animación en curso se completa al instante y empieza la del paso nuevo

#### Scenario: Al ritmo elegido
- **WHEN** la reproducción avanza sola a 10 pasos por segundo
- **THEN** cada animación dura menos que el intervalo entre pasos y ninguna se encima con la siguiente

#### Scenario: Capa resumida
- **WHEN** el paso cae en una capa resumida
- **THEN** la animación se ve en las líneas que llegan a su cuadrito y en el cuadrito

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** nada viaja ni crece: cada paso se marca con un cambio de estado

#### Scenario: Leer una entrada
- **WHEN** se lee una entrada
- **THEN** su neurona pasa de sin leer a mostrar su valor, con el relleno que llega a ese valor

#### Scenario: Paso atrás
- **WHEN** la persona vuelve un paso
- **THEN** la red muestra el estado anterior sin animación
