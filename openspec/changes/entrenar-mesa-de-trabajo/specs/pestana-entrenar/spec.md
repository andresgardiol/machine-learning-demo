## MODIFIED Requirements

### Requirement: Configuración básica
La vista de entrenamiento SHALL mostrar a la vista, en un bloque "Probá esto",
cuatro ajustes en este orden: la función de fitness, el tamaño de la
población, la fuerza de la mutación y un interruptor para enfriar la
mutación, encendido por defecto. El bloque SHALL ir debajo de la tarjeta de
consigna y de "Más sobre esta pestaña", y arriba de guardar el campeón. Sus cambios SHALL aplicarse desde la
generación siguiente, y la pestaña MUST indicar de forma visible que hay
cambios esperando a la próxima generación. Con el enfriamiento en uso, el
ajuste de la fuerza SHALL mostrar la fuerza con que se armará la generación
siguiente y MUST NOT poder editarse.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** la vista de entrenamiento muestra la función de fitness con "ventaja" elegida, 400 autos, la fuerza de mutación y el enfriamiento encendido, sin pasar a otra vista

#### Scenario: Cambiar la mutación
- **WHEN** la persona, con el enfriamiento apagado, sube la fuerza de mutación durante una generación
- **THEN** aparece una indicación de que el cambio se aplica en la próxima generación y desaparece cuando esa generación empieza

#### Scenario: Cambiar la población
- **WHEN** la persona cambia la población a 200
- **THEN** la generación en curso sigue con sus autos y la siguiente empieza con 200

#### Scenario: La fuerza baja sola
- **WHEN** se abre la pestaña y corren diez generaciones sin tocar nada
- **THEN** el ajuste de la fuerza de mutación fue bajando en cada generación, de 29 % a 18 %, sin que la persona lo mueva

#### Scenario: Fuerza que no se edita
- **WHEN** la persona intenta mover la fuerza de mutación con el enfriamiento encendido
- **THEN** el valor no cambia y el tooltip explica que la fuerza baja sola y que apagando el enfriamiento se puede fijar a mano

#### Scenario: Apagar el enfriamiento
- **WHEN** la persona apaga el enfriamiento cuando la fuerza va por 18 %
- **THEN** el ajuste queda en 18 %, pasa a poder editarse y la fuerza deja de bajar

#### Scenario: Volver a encender el enfriamiento
- **WHEN** la persona vuelve a encender el enfriamiento
- **THEN** desde la generación siguiente la fuerza vuelve a ser la que le toca por el número de generación

#### Scenario: Con selección manual
- **WHEN** la persona elige "vos" en el ajuste de quién elige al padre
- **THEN** el interruptor del enfriamiento se ve deshabilitado, su tooltip explica que con un padre elegido a mano la fuerza es la del deslizador, y la fuerza de mutación se puede editar

### Requirement: Configuración avanzada
La pestaña SHALL ofrecer, en la vista de ajustes, los ajustes de evolución
(élite, selección, probabilidad de mutación, cruce, duración máxima,
eliminar a los lentos y modo de tráfico), que SHALL regir
desde la generación siguiente, con el mismo aviso que la configuración
básica. Los de escenario (pista, carriles, densidad, irregularidad y
velocidad) SHALL estar en la barra de escenario y regir en el momento: la
generación en curso vuelve a empezar con la misma población.

#### Scenario: Sección colapsada
- **WHEN** se abre la pestaña
- **THEN** el panel muestra la vista de entrenamiento y los ajustes de la vista de ajustes no están a la vista

#### Scenario: Cambiar la función de fitness
- **WHEN** la persona elige "tiempo sin chocar"
- **THEN** la generación siguiente se evalúa con esa función y los indicadores pasan a mostrar segundos

#### Scenario: Cambiar los carriles
- **WHEN** la persona elige cuatro carriles durante una generación
- **THEN** la generación en curso vuelve a empezar en ese momento, con los mismos autos, en una calle de cuatro carriles, sin ninguna indicación de cambio pendiente

#### Scenario: Apagar la regla de los lentos
- **WHEN** la persona apaga "eliminar a los lentos" durante una generación
- **THEN** la generación en curso sigue con la regla y en la siguiente ningún auto sale de carrera por lento

#### Scenario: Velocidad máxima compartida
- **WHEN** la persona cambia la velocidad máxima del auto en esta pestaña y luego abre El problema
- **THEN** el auto de El problema tiene esa misma velocidad máxima

### Requirement: Controles de marcha agrupados
Los controles de marcha SHALL ir en una barra debajo de la escena, siempre a
la vista en cualquier vista del panel, y agruparse en este orden: arriba, el
ajuste de quién elige al padre; pausar y pasar a la siguiente generación en un
mismo renglón; con selección manual, elegir al líder y deshacer en el renglón
siguiente, con la línea de estado del padre debajo; después, las velocidades
en un solo renglón; y debajo, con menor peso visual, reiniciar y población
nueva; y al final, en un renglón compacto, los interruptores de los sensores
del líder y de ver como la máquina. La confirmación de reiniciar o de
población nueva SHALL aparecer junto a esos botones. Mover un control MUST NOT
cambiar lo que hace, su texto, su tooltip ni su atajo.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña con el escenario en su ancho por defecto
- **THEN** la barra está debajo de la escena, el ajuste de quién elige al padre está arriba de todo, pausar y siguiente generación comparten renglón, las cinco velocidades entran en un renglón y reiniciar y población nueva se ven más chicos, debajo

#### Scenario: Confirmación junto al botón
- **WHEN** la persona pide reiniciar con generaciones terminadas
- **THEN** la confirmación aparece debajo de los botones de reiniciar y población nueva, sin tapar otros controles

#### Scenario: Cancelar
- **WHEN** la persona cancela esa confirmación
- **THEN** la confirmación desaparece y los controles de marcha vuelven a verse como antes

#### Scenario: Con selección manual
- **WHEN** la selección es manual y el escenario está en su ancho por defecto
- **THEN** elegir al líder y deshacer comparten un renglón debajo de pausar y siguiente generación, a un renglón del ajuste que los hizo aparecer, y la línea de estado del padre se lee debajo de ellos

#### Scenario: Marcha en otra vista
- **WHEN** la persona pasa el panel a la vista de ajustes o a la de cerebros con el entrenamiento en marcha
- **THEN** pausar, siguiente generación y las velocidades siguen a la vista debajo de la escena, y funcionan igual

#### Scenario: Mismos atajos
- **WHEN** la persona usa la barra espaciadora, N y T, y con selección manual E y Z, con el foco fuera de un campo de texto
- **THEN** pausan, pasan a la siguiente generación, cambian la velocidad, eligen al líder y deshacen la elección como antes del cambio

#### Scenario: Con selección automática
- **WHEN** la selección es automática
- **THEN** no se ven los botones de elegir al líder y deshacer ni la línea de estado del padre

### Requirement: Panel a la vista sin desplazarse
Con la ventana en 1440×900 y la guía activa, la vista de entrenamiento del
panel de Entrenar SHALL verse completa sin desplazarse, con la lista de
misiones plegada, también después de guardar un cerebro.
Con la ventana en 1366×768 SHALL verse sin desplazar el panel, como mínimo, la
tarjeta de consigna y el bloque "Probá esto". La barra de marcha, con la
selección manual incluida, SHALL verse entera sin desplazar la zona del
escenario en los dos tamaños, y la escena SHALL medir al menos 360 píxeles de
alto a 1366×768.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la guía activa
- **THEN** el panel no tiene barra de desplazamiento y se ven la tarjeta de consigna con la misión en curso, "Probá esto", guardar el campeón, el renglón de las misiones y las tres pestañas del panel, y debajo de la escena, la barra de marcha entera

#### Scenario: Pantalla de 1366×768
- **WHEN** se abre la pestaña con la ventana en 1366×768 y la guía activa
- **THEN** la tarjeta de consigna y "Probá esto" se ven sin desplazar el panel, y la barra de marcha entera y una escena de al menos 360 píxeles de alto se ven sin desplazar la zona del escenario

#### Scenario: Causa y efecto a la vista
- **WHEN** la persona mueve la fuerza de mutación con la ventana en 1440×900
- **THEN** el deslizador, la curva de fitness, la red del líder y los autos están a la vista al mismo tiempo

#### Scenario: Selección manual a la vista
- **WHEN** la selección es manual, con la ventana en 1366×768 y la guía activa
- **THEN** el ajuste de quién elige al padre, pausar, siguiente generación, elegir al líder, deshacer y la línea de estado del padre se ven debajo de la escena sin desplazar la zona del escenario

#### Scenario: Después de guardar
- **WHEN** la persona guarda un cerebro con la ventana en 1440×900, en español o en inglés, con el panel en 360 píxeles de ancho
- **THEN** la vista de entrenamiento sigue sin barra de desplazamiento, ni vertical ni horizontal

### Requirement: Avanzado por grupos
En la vista de ajustes, los ajustes SHALL estar en dos bloques a la vista, sin
plegar y cada uno con su título: primero la red (capas ocultas, neuronas y
activación) y después la evolución, con la élite primero. La función de
fitness MUST NOT repetirse en esta vista: está en "Probá esto". El
botón de restablecer y el aviso de cambios esperando SHALL verse en la vista.
Cada ajuste SHALL tener su tooltip, en español y en inglés.

#### Scenario: Abrir la sección avanzada
- **WHEN** la persona pasa a la vista de ajustes por primera vez
- **THEN** ve, sin desplegar nada, el bloque de la red arriba y el de la evolución debajo, con todos sus ajustes

#### Scenario: Abrir un grupo
- **WHEN** la persona mira el bloque de evolución
- **THEN** ve la élite, la selección, la probabilidad de mutación, el cruce, la duración máxima, eliminar a los lentos y el modo de tráfico

#### Scenario: Grupo recordado
- **WHEN** la persona deja el panel en la vista de ajustes, abre otra pestaña y vuelve
- **THEN** el panel sigue en la vista de ajustes, con los dos bloques a la vista

#### Scenario: Confirmación de la red junto a su grupo
- **WHEN** la persona cambia las capas ocultas con generaciones terminadas
- **THEN** la confirmación de entrenamiento nuevo aparece dentro del bloque de red, junto al ajuste que la pidió

#### Scenario: Tooltip de un grupo
- **WHEN** la persona posa el cursor sobre la élite
- **THEN** un tooltip en el idioma activo dice qué hace y por qué importa

#### Scenario: A un clic
- **WHEN** la persona quiere cambiar las capas de la red desde la vista de entrenamiento
- **THEN** le alcanza con un clic, en la pestaña de ajustes, para tenerlas a la vista; la función de fitness ya está a la vista en la vista de entrenamiento

#### Scenario: La red, sin desplazarse
- **WHEN** la persona pasa a la vista de ajustes con la ventana en 1440×900
- **THEN** el bloque de la red se ve entero sin desplazar el panel

### Requirement: Quién elige al padre
La pestaña SHALL ofrecer un ajuste con dos opciones para decidir quién elige
al padre de la generación siguiente: la función de fitness (por defecto) o la
persona. El ajuste SHALL encabezar la barra de marcha de abajo de la
escena, antes que pausar y siguiente generación, con un rótulo de mayor peso que el de un
ajuste común. El cambio SHALL regir desde la generación siguiente, MUST NOT
reiniciar el entrenamiento y, mientras espera, MUST indicarse junto al ajuste.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** está elegida la opción de la función de fitness y el entrenamiento avanza solo, como siempre

#### Scenario: Primero en el panel
- **WHEN** se abre la pestaña con la guía oculta
- **THEN** el ajuste de quién elige al padre es el primer control de la barra de abajo de la escena, arriba de pausar y siguiente generación, y no está entre los ajustes del panel

#### Scenario: Cambio esperando, junto al ajuste
- **WHEN** la persona pasa de "la fitness" a "vos" durante una generación
- **THEN** un aviso junto al ajuste dice que rige desde la próxima generación, la generación en curso sigue con sus autos, y el aviso desaparece cuando esa generación empieza

#### Scenario: El aviso de configuración no se mezcla
- **WHEN** el único cambio que espera es el de quién elige al padre
- **THEN** el aviso de cambios esperando de la configuración básica no se muestra

#### Scenario: Pasar a selección manual con progreso
- **WHEN** la persona elige "vos" en la generación 12 y no elige a ningún auto antes de que termine
- **THEN** el entrenamiento sigue en la generación 13 con su curva intacta, y esa generación sale del campeón de la 12

#### Scenario: Volver a selección automática
- **WHEN** la persona vuelve a elegir la función de fitness
- **THEN** los botones de elegir y deshacer y la línea de estado desaparecen en ese momento, y desde la generación siguiente los padres vuelven a salir de la fitness

#### Scenario: Restablecer
- **WHEN** la selección es manual y la persona presiona restablecer la configuración
- **THEN** el ajuste vuelve a la función de fitness desde la generación siguiente, sin reiniciar el entrenamiento

### Requirement: Funciones de fitness a elegir
El ajuste de la función de fitness SHALL ofrecer las cuatro funciones en este
orden: ventaja, distancia, tiempo sin chocar y velocidad media, con la ventaja
elegida al abrir la pestaña. Las cuatro opciones MUST verse completas con el
panel en su ancho por defecto, en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la vista de entrenamiento muestra elegida la función "ventaja"; en la vista de ajustes, la élite es 10, la irregularidad del tráfico es 0 % y el enfriamiento de la mutación está encendido

#### Scenario: Cuatro opciones a la vista
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** las cuatro funciones se leen enteras, sin texto cortado ni fuera del panel

#### Scenario: Mostrar el contraste
- **WHEN** la persona elige "distancia" con la población ya pasando vehículos y deja correr unas generaciones
- **THEN** la función rige desde la generación siguiente y los indicadores y la curva pasan a mostrar metros recorridos

#### Scenario: Volver a los valores por defecto
- **WHEN** la persona cambió la función de fitness, la élite y la población, apagó el enfriamiento, y presiona restablecer ajustes
- **THEN** vuelven a ventaja, 10 y 400 autos, y el enfriamiento se enciende, desde la generación siguiente y sin reiniciar el entrenamiento; la barra de escenario no cambia

### Requirement: Vistas del panel
El panel de Entrenar SHALL repartir su contenido en tres vistas, elegibles con
tres pestañas siempre visibles arriba del panel: entrenamiento (tarjeta
de consigna, guía, "Probá esto", guardar y misiones), ajustes (la red, la evolución y restablecer) y cerebros (guardar con
nombre y la biblioteca). Al abrir SHALL verse la de entrenamiento. Cambiar de
vista MUST NOT cambiar el entrenamiento ni ningún ajuste, ni ocultar la barra
de marcha de abajo de la escena.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** el panel muestra la vista de entrenamiento, con la tarjeta de consigna y "Probá esto", la marcha está debajo de la escena, y las pestañas de ajustes y de cerebros arriba

#### Scenario: Cambiar de vista
- **WHEN** la persona pasa a la vista de ajustes con el entrenamiento en marcha
- **THEN** el entrenamiento sigue, el escenario, la barra de marcha y el tablero siguen a la vista, y los atajos de teclado siguen funcionando

#### Scenario: Volver
- **WHEN** la persona vuelve a la vista de entrenamiento
- **THEN** encuentra los controles como los dejó

#### Scenario: Vista recordada
- **WHEN** la persona deja la vista de cerebros, abre otra pestaña de la aplicación y vuelve a Entrenar
- **THEN** el panel sigue en la vista de cerebros, hasta cerrar la aplicación

#### Scenario: Teclado
- **WHEN** la persona llega con Tab a las pestañas del panel y usa las flechas izquierda y derecha
- **THEN** el foco pasa de una pestaña a otra y la vista cambia con él; Tab entra al contenido de la vista a la vista

#### Scenario: Pestañas anunciadas
- **WHEN** un lector de pantalla llega a las pestañas del panel
- **THEN** anuncia que son tres pestañas, cuál está elegida y, en la de cerebros, cuántos cerebros hay

#### Scenario: Confirmación abierta al cambiar de vista
- **WHEN** hay una confirmación abierta en la vista de ajustes (entrenamiento nuevo o restablecer) y la persona pasa a otra vista
- **THEN** la confirmación se cancela, el ajuste vuelve a su valor anterior y nada queda esperando a escondidas

#### Scenario: Foco a la vista
- **WHEN** la persona recorre con Tab una vista más alta que el panel
- **THEN** el control con foco queda siempre a la vista, nunca debajo de la barra de pestañas

#### Scenario: Ancho mínimo
- **WHEN** el panel mide 360 píxeles de ancho, en español o en inglés
- **THEN** las tres pestañas entran en un renglón con sus nombres completos y el contador de cerebros

#### Scenario: Tooltips
- **WHEN** la persona posa el cursor sobre cada pestaña del panel
- **THEN** un tooltip en el idioma activo dice qué reúne esa vista y por qué importa

### Requirement: Cambios pendientes a la vista
Mientras haya ajustes de la vista de ajustes esperando a la próxima
generación, la pestaña de esa vista SHALL mostrar una marca que lo indique, se esté en la vista
que se esté, y la marca MUST desaparecer cuando esa generación empieza. Los de "Probá
esto" (función de fitness, población y mutación) SHALL mostrar su aviso en el
mismo bloque, como los demás ajustes de la configuración básica. Los de la
barra de escenario rigen en el momento. La marca MUST NOT depender solo del color.

#### Scenario: Cambio hecho y vista cambiada
- **WHEN** la persona cambia la élite en la vista de ajustes y vuelve a la vista de entrenamiento durante la misma generación
- **THEN** la pestaña de ajustes muestra la marca de cambios pendientes

#### Scenario: Generación siguiente
- **WHEN** empieza la generación siguiente
- **THEN** la marca desaparece

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla anuncia la pestaña de ajustes con cambios pendientes
- **THEN** dice que hay cambios esperando a la próxima generación
