## ADDED Requirements

### Requirement: Lo elegido, primero en el panel
Con una neurona o una conexión elegida, el panel SHALL mostrar su detalle primero, con sus controles (pesos, sesgo, apagar), debajo de un renglón compacto con el nombre del cerebro y "Cambiar". La opción "Tráfico", la frase de ayuda, "Cómo se lee la red" y las misiones SHALL ir después del detalle. Sin nada elegido, el panel MUST mantener su orden de siempre. En el detalle de una conexión, el peso con su deslizador SHALL ser lo primero debajo del título.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña sin nada elegido
- **THEN** el panel muestra el cerebro, la opción "Tráfico", la frase y los atajos, la leyenda y las misiones, como siempre

#### Scenario: Elegir una neurona
- **WHEN** la persona elige la neurona 5 de la capa oculta con la ventana en 1440×900
- **THEN** la tarjeta de la neurona aparece arriba del panel, debajo del renglón del cerebro, y el deslizador del sesgo se ve sin desplazar nada

#### Scenario: Elegir una conexión
- **WHEN** la persona elige una conexión
- **THEN** el detalle de la conexión aparece arriba del panel y su peso con el deslizador es lo primero debajo del título

#### Scenario: Soltar
- **WHEN** la persona suelta lo elegido
- **THEN** el panel vuelve a su orden de siempre

#### Scenario: Con el caso del choque
- **WHEN** hay un choque a la vista y la persona elige una neurona
- **THEN** la tarjeta de la neurona va primero y la frase del caso queda debajo

#### Scenario: Ventana baja
- **WHEN** la ventana mide 1366×768 y la persona elige una neurona de 12 entradas
- **THEN** el panel se desplaza como un solo bloque y el pie con el sesgo queda pegado abajo, a la vista

## MODIFIED Requirements

### Requirement: Tarjeta de la neurona
Con una neurona elegida, el panel SHALL mostrar su cuenta real, y es donde
se la cambia: una fila por entrada, con de dónde viene, su valor, su peso, su
producto y una barra con signo de lo que aporta; y al pie, siempre a la vista,
la suma, el sesgo, la activación y la salida, escritas como una cuenta. Los
valores SHALL actualizarse en el momento. La tarjeta MUST NOT desplazarse por
dentro: el único que se desplaza es el panel, y el pie queda pegado al borde
de abajo del panel mientras la tarjeta está a la vista.

#### Scenario: Neurona de una capa oculta
- **WHEN** la persona elige una neurona de la primera capa oculta de un cerebro de 5 sensores
- **THEN** la tarjeta muestra seis filas, una por sensor y una por la velocidad, y al pie la suma, el sesgo, la activación con su nombre y la salida

#### Scenario: Cuenta que se puede comprobar
- **WHEN** la persona suma a mano los productos de la tarjeta, con los dos decimales que se ven, y le agrega el sesgo
- **THEN** obtiene el total que muestra la tarjeta o un número que difiere solo por el redondeo de cada término, y la tarjeta dice a la vista que los números están redondeados a dos decimales

#### Scenario: El total es el de verdad
- **WHEN** se compara el total que muestra la tarjeta con el que usa la red para decidir
- **THEN** es el mismo número, redondeado recién al mostrarlo

#### Scenario: Neurona de salida
- **WHEN** la persona elige la salida de doblar a la izquierda
- **THEN** la tarjeta dice a qué acción corresponde y que la salida es sí cuando el total es mayor que cero

#### Scenario: Neurona de entrada
- **WHEN** la persona elige la entrada de un sensor
- **THEN** la tarjeta dice qué sensor es, qué está leyendo y de dónde sale ese número, y en la escena ese rayo se destaca

#### Scenario: En el paso a paso
- **WHEN** la cuenta va por la suma de la neurona elegida
- **THEN** la tarjeta muestra los productos ya hechos, destaca la suma y deja sin valor lo que falta

#### Scenario: Red grande
- **WHEN** la red tiene tres capas ocultas de 16 neuronas y 20 sensores
- **THEN** la tarjeta sigue mostrando una sola neurona, con 21 filas como mucho; al desplazar el panel las filas pasan y el pie, con el sesgo, queda a la vista

#### Scenario: Un solo desplazamiento
- **WHEN** la persona elige una neurona de 12 entradas con la ventana en 1440×900
- **THEN** solo el panel se desplaza, ninguna parte de la tarjeta tiene un desplazamiento propio y el deslizador del sesgo se ve sin desplazar nada

#### Scenario: Peso y sesgo a la vez
- **WHEN** la persona desplaza el panel para llegar a la última fila de una neurona de 12 entradas
- **THEN** el deslizador del peso de esa fila y el del sesgo se ven a la vez y se pueden usar

#### Scenario: Con el filtro de conexiones
- **WHEN** el filtro de conexiones está en las 3 más importantes y la neurona tiene 21 entradas
- **THEN** la tarjeta muestra las filas de esas 3 y una fila más que junta a las otras 18 con la suma de sus productos, y la cuenta total es la misma

#### Scenario: Qué mira la neurona
- **WHEN** la neurona elegida recibe directamente los sensores
- **THEN** en la escena cada rayo lleva el color y el grosor del peso con que esa neurona lo mira

#### Scenario: Barras de lo que aporta
- **WHEN** la persona mira las filas de una neurona
- **THEN** cada fila tiene una barra que sale del centro hacia la derecha si su producto suma y hacia la izquierda si resta, con un largo proporcional, y se ve de un vistazo qué entrada empuja más

#### Scenario: La cuenta escrita
- **WHEN** la persona mira el pie de la tarjeta
- **THEN** lee la suma más el sesgo, el total, el nombre de la activación y la salida, en ese orden

#### Scenario: Elegir una fila
- **WHEN** la persona hace clic en el nombre de una entrada en una fila
- **THEN** queda elegida esa conexión, en la red y en el panel

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** no hay neurona elegida y el panel muestra qué elegir, no una tarjeta vacía

#### Scenario: Filas a la vista
- **WHEN** la persona elige una neurona de 6 entradas con la ventana en 1366×768 o más grande, en español o en inglés
- **THEN** las seis filas se ven sin desplazar nada, con el pie debajo

#### Scenario: La cuenta entera
- **WHEN** la cuenta escrita no entra en un renglón del panel
- **THEN** sigue en un segundo renglón y se lee hasta la salida, sin puntos suspensivos

#### Scenario: Nada se encima
- **WHEN** el panel muestra cualquier detalle, con cualquier ancho de panel y alto de ventana que la aplicación permita
- **THEN** ninguna parte del detalle tapa a otra ni a las misiones, y nada sale del borde de la tarjeta

#### Scenario: Deslizador que se puede usar
- **WHEN** la persona hace clic en el peso de una fila o llega a él con Tab
- **THEN** esa fila muestra debajo un deslizador de al menos 120 píxeles de ancho, y las demás filas siguen en un renglón

#### Scenario: Barra y número
- **WHEN** la persona mira el producto de una fila
- **THEN** la barra de lo que aporta no pasa por encima del número

#### Scenario: Controles que se pueden apuntar
- **WHEN** la persona mira los botones del detalle de una neurona o de una conexión
- **THEN** cada uno mide al menos 24 píxeles de alto
