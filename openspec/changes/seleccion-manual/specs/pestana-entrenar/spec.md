# Spec Delta

## MODIFIED Requirements

### Requirement: Guía de inicio
Con la guía activa, el panel SHALL mostrar un texto de inicio, de hasta 240
caracteres en cada idioma, que diga qué se está viendo (autos manejados por
redes con números al azar) y de dónde sale la generación siguiente: de los que
mejor manejaron, con selección automática, o del auto que la persona elija,
con selección manual. Los atajos de teclado MUST leerse en el control que
accionan y no en el texto de inicio.

#### Scenario: Guía activa
- **WHEN** la guía está activa
- **THEN** el panel muestra el texto de inicio

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio, los renglones de ayuda del tablero y las misiones no se muestran y el entrenamiento sigue igual

#### Scenario: Texto breve
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el texto de inicio ocupa como mucho cinco renglones, con selección automática y con selección manual

#### Scenario: Atajos en los controles
- **WHEN** la persona busca cómo pausar, pasar de generación o acelerar con el teclado
- **THEN** lee la tecla en el botón de pausa, en el de siguiente generación y en la opción de velocidad máxima

#### Scenario: Guía con selección manual
- **WHEN** la persona elige "vos" en el ajuste de quién elige al padre
- **THEN** el texto de inicio pasa a decir que, cuando el líder haga algo prometedor, lo elija, y que la generación siguiente serán copias suyas con pequeños cambios

#### Scenario: Guía al volver a selección automática
- **WHEN** la persona vuelve a elegir la función de fitness
- **THEN** el texto de inicio vuelve a decir que los que mejor manejaron se copian con pequeños cambios

### Requirement: Guardar el campeón
El panel SHALL ofrecer siempre a la vista, fuera de la biblioteca plegada, un
campo de nombre y un botón para guardar en la biblioteca, con el nombre que la
persona escriba o con el sugerido, al campeón de la última generación
terminada o, con selección manual, al padre elegido. Mientras no haya qué
guardar, el control MUST estar deshabilitado y explicar por qué. El resultado
de guardar MUST leerse junto al botón.

#### Scenario: Sin campeón todavía
- **WHEN** no terminó ninguna generación y la persona posa el cursor sobre guardar
- **THEN** el control está deshabilitado y su tooltip explica que hace falta terminar una generación

#### Scenario: Guardar
- **WHEN** la persona escribe "Prudente" y guarda tras la generación 15
- **THEN** la biblioteca muestra "Prudente" con 15 generaciones y el entrenamiento sigue sin interrumpirse

#### Scenario: Guardar con la biblioteca plegada
- **WHEN** la persona guarda al campeón sin haber desplegado la biblioteca
- **THEN** un mensaje junto al botón dice con qué nombre se guardó y el contador de la biblioteca aumenta en uno

#### Scenario: Guardar tras continuar un cerebro
- **WHEN** el entrenamiento continúa desde el cerebro guardado "Prudente" y la persona va a guardar
- **THEN** se ofrecen dos acciones: actualizar "Prudente" o guardar como nuevo

#### Scenario: Guardar al padre elegido
- **WHEN** la selección es manual, la persona eligió un padre en la generación 5 y guarda
- **THEN** la biblioteca muestra un cerebro con la red de ese padre, y el rótulo sobre el campo de nombre dice que se guarda al padre elegido

#### Scenario: Selección manual sin padre
- **WHEN** la selección es manual, no hay padre elegido y la persona posa el cursor sobre guardar
- **THEN** el control está deshabilitado y su tooltip explica que primero hay que elegir un padre

### Requirement: Controles de marcha agrupados
El panel SHALL agrupar los controles de marcha en este orden: arriba, el
ajuste de quién elige al padre; pausar y pasar a la siguiente generación en un
mismo renglón; con selección manual, elegir al líder y deshacer en el renglón
siguiente, con la línea de estado del padre debajo; después, las velocidades
en un solo renglón; y debajo, con menor peso visual, reiniciar y población
nueva. La confirmación de reiniciar o de población nueva SHALL aparecer junto
a esos botones.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña con el panel en 360 píxeles de ancho
- **THEN** el ajuste de quién elige al padre está arriba de todo, pausar y siguiente generación comparten renglón, las cinco velocidades entran en un renglón y reiniciar y población nueva se ven más chicos, debajo

#### Scenario: Confirmación junto al botón
- **WHEN** la persona pide reiniciar con generaciones terminadas
- **THEN** la confirmación aparece debajo de los botones de reiniciar y población nueva, sin tapar otros controles

#### Scenario: Cancelar
- **WHEN** la persona cancela esa confirmación
- **THEN** la confirmación desaparece y los controles de marcha vuelven a verse como antes

#### Scenario: Con selección manual
- **WHEN** la selección es manual y el panel mide 360 píxeles de ancho
- **THEN** elegir al líder y deshacer comparten un renglón debajo de pausar y siguiente generación, a un renglón del ajuste que los hizo aparecer, y la línea de estado del padre se lee debajo de ellos

#### Scenario: Con selección automática
- **WHEN** la selección es automática
- **THEN** no se ven los botones de elegir al líder y deshacer ni la línea de estado del padre

### Requirement: Panel a la vista sin desplazarse
Con la ventana en 1440×900, la guía activa y las secciones plegables en su
estado por defecto, el panel de Entrenar SHALL verse completo sin desplazarse.
Con la ventana en 1366×768 SHALL verse sin desplazarse, como mínimo, los
controles de marcha, el interruptor de sensores del líder y la configuración
básica. Con selección manual, los controles de marcha con sus botones de
elegir y deshacer y la línea de estado SHALL verse sin desplazarse en los dos
tamaños.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la guía activa
- **THEN** el panel no tiene barra de desplazamiento y se ven la guía, los controles de marcha con el ajuste de quién elige al padre, el interruptor de sensores, la configuración básica, guardar el campeón, las misiones y los títulos de la biblioteca y de la sección avanzada

#### Scenario: Pantalla de 1366×768
- **WHEN** se abre la pestaña con la ventana en 1366×768 y la guía activa
- **THEN** los controles de marcha, el interruptor de sensores del líder y la configuración básica se ven sin desplazar el panel

#### Scenario: Causa y efecto a la vista
- **WHEN** la persona mueve la fuerza de mutación con la ventana en 1440×900
- **THEN** el deslizador, la curva de fitness, la red del líder y los autos están a la vista al mismo tiempo

#### Scenario: Selección manual a la vista
- **WHEN** la selección es manual, con la ventana en 1366×768 y la guía activa
- **THEN** el ajuste de quién elige al padre, pausar, siguiente generación, elegir al líder, deshacer y la línea de estado del padre se ven sin desplazar el panel

## ADDED Requirements

### Requirement: Quién elige al padre
La pestaña SHALL ofrecer un ajuste con dos opciones para decidir quién elige
al padre de la generación siguiente: la función de fitness (por defecto) o la
persona. El ajuste SHALL encabezar los controles de marcha, antes que
cualquier otro control del panel, con un rótulo de mayor peso que el de un
ajuste común. El cambio SHALL regir desde la generación siguiente, MUST NOT
reiniciar el entrenamiento y, mientras espera, MUST indicarse junto al ajuste.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** está elegida la opción de la función de fitness y el entrenamiento avanza solo, como siempre

#### Scenario: Primero en el panel
- **WHEN** se abre la pestaña con la guía oculta
- **THEN** el ajuste de quién elige al padre es el primer control del panel, arriba de pausar y siguiente generación, y no está entre los ajustes de configuración

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

### Requirement: Elegir al líder
Con selección manual, la pestaña SHALL ofrecer un botón, con la tecla E como
atajo, que toma al líder de ese momento como padre de la generación siguiente.
SHALL funcionar en cualquier momento de la generación, también en pausa, y
MUST poder usarse desde que la persona elige la selección manual, sin esperar
a la generación siguiente.

#### Scenario: Elegir con el botón
- **WHEN** la persona presiona elegir al líder en la generación 4, cuando el líder lleva 310 metros
- **THEN** la línea de estado pasa a decir que el padre es el líder de la generación 4, con 310 m, y el entrenamiento sigue sin interrumpirse

#### Scenario: Elegir con el teclado
- **WHEN** la persona presiona la tecla E con selección manual
- **THEN** ocurre lo mismo que al presionar el botón

#### Scenario: Elegir en pausa
- **WHEN** el entrenamiento está en pausa y la persona elige al líder
- **THEN** el padre queda elegido y el entrenamiento sigue en pausa

#### Scenario: La generación siguiente sale del padre
- **WHEN** termina la generación después de elegir al líder
- **THEN** en la generación siguiente uno de los autos lleva la marca de la élite: es la copia sin cambios del padre elegido

#### Scenario: Tecla E con selección automática
- **WHEN** la persona presiona la tecla E con selección automática
- **THEN** no pasa nada

### Requirement: Deshacer la elección
Con selección manual, la pestaña SHALL ofrecer un botón, con la tecla Z como
atajo, que deshace la última elección de padre. Cuando no hay ninguna elección
que deshacer, el botón MUST estar deshabilitado y explicar por qué.

#### Scenario: Deshacer una elección
- **WHEN** la persona eligió padres en las generaciones 3 y 5 y presiona deshacer
- **THEN** la línea de estado vuelve a decir que el padre es el líder de la generación 3

#### Scenario: Deshacer la única elección
- **WHEN** hay una sola elección y la persona presiona deshacer
- **THEN** la línea de estado dice que no hay padre elegido y que la próxima generación será al azar

#### Scenario: Nada que deshacer
- **WHEN** no hay ninguna elección y la persona posa el cursor sobre deshacer
- **THEN** el botón está deshabilitado y su tooltip explica que todavía no se eligió a nadie

### Requirement: Estado del padre elegido
Con selección manual, la pestaña SHALL mostrar junto a los botones una línea
de texto que diga, en todo momento, de dónde va a salir la generación
siguiente: del padre elegido, con la generación en que se lo eligió y el
fitness que llevaba, o de una población al azar nueva si no hay padre.

#### Scenario: Sin padre elegido
- **WHEN** la selección es manual y no hay padre elegido
- **THEN** la línea dice que no hay padre y que, si no se elige uno, la próxima generación empieza con redes al azar

#### Scenario: Con padre elegido
- **WHEN** el padre se eligió en la generación 4 con 310 metros
- **THEN** la línea dice que la próxima generación sale del líder de la generación 4, que llevaba 310 m

#### Scenario: Padre que viene del campeón
- **WHEN** la persona pasó de selección automática a manual y el padre es el campeón de la generación 12
- **THEN** la línea dice que el padre es el campeón de la generación 12, con su fitness

#### Scenario: Cambio a manual que todavía no rige
- **WHEN** la persona acaba de pasar de selección automática a manual, la generación en curso no terminó y no eligió a nadie
- **THEN** la línea dice que, si no elige a nadie, el padre será el mejor de esta generación

#### Scenario: Padre que viene de un cerebro
- **WHEN** la persona sigue entrenando el cerebro guardado "Prudente" con selección manual
- **THEN** la línea dice que el padre es el cerebro "Prudente"

### Requirement: Ajustes que no aplican con selección manual
Con selección manual, los ajustes de selección, élite y cruce de la sección
avanzada SHALL verse deshabilitados y explicar que no se usan porque hay un
solo padre. Sus valores MUST conservarse y volver a regir con selección
automática.

#### Scenario: Ajustes deshabilitados
- **WHEN** la selección es manual y la persona despliega el grupo de evolución
- **THEN** selección, élite y cruce están deshabilitados y su tooltip explica que con un solo padre no se usan

#### Scenario: Valores conservados
- **WHEN** la persona tenía la selección en 20 %, pasa a manual y vuelve a automática
- **THEN** la selección sigue en 20 % y vuelve a estar habilitada

### Requirement: Selección manual explicada
El ajuste de quién elige, cada una de sus opciones, el botón de elegir al
líder y el de deshacer SHALL tener un tooltip que diga qué hace y por qué
importa, definiendo qué es un padre. Todos sus textos, la línea de estado y
los rótulos de guardar SHALL estar en español y en inglés.

#### Scenario: Tooltip de elegir al líder
- **WHEN** la persona posa el cursor sobre elegir al líder
- **THEN** un tooltip en el idioma activo explica que ese auto pasa a ser el padre, que todos los autos de la generación siguiente son copias suyas con pequeñas mutaciones, y que así es la persona, y no la fitness, quien decide qué se premia

#### Scenario: Tooltip de la opción manual
- **WHEN** la persona posa el cursor sobre la opción "vos"
- **THEN** el tooltip explica que la función de fitness es una forma de automatizar esa decisión y que elegir a mano permite compararlas

#### Scenario: Selección manual en inglés
- **WHEN** la aplicación está en inglés con selección manual
- **THEN** el ajuste, los botones, la línea de estado y el rótulo de guardar se muestran en inglés
