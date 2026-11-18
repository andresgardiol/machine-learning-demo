# consigna-de-pestana Specification

## Purpose
Fija la tarjeta de consigna que abre el panel de cada pestaña: una frase que dice qué hacer ahora, la acción principal para hacerlo y la misión en curso. Así quien llega solo sabe qué probar sin leer el texto largo de la guía.

## Requirements

### Requirement: Tarjeta al principio del panel
Cada una de las seis pestañas SHALL abrir su panel (en Reglas a mano, su tablero) con una tarjeta de consigna, antes que cualquier otro contenido visible del panel, salvo mientras hay algo elegido en Inspeccionar o en el Laboratorio. En Entrenar va solo en la vista de entrenamiento. SHALL destacarse del panel por un fondo más claro y una barra gruesa a la izquierda, neutra y no del color de acción. MUST NOT tapar la escena, el tablero ni la red.

#### Scenario: Al abrir la app
- **WHEN** la persona abre la app sin haber configurado nada y recorre las seis pestañas a 1440×900
- **THEN** en cada una lo primero del panel es la tarjeta de consigna, y la tarjeta entra entera en la ventana sin desplazar

#### Scenario: Se destaca
- **WHEN** la persona mira el panel de cualquier pestaña, también en escala de grises
- **THEN** la tarjeta se distingue a simple vista del resto del panel por su fondo y su barra lateral, y la barra no es del color de la acción principal

#### Scenario: Ventana mediana
- **WHEN** la persona recorre las seis pestañas a 1366×768
- **THEN** la tarjeta de consigna entra entera en la ventana sin desplazar el panel

#### Scenario: Otras vistas de Entrenar
- **WHEN** la persona pasa de la vista de entrenamiento a la de cerebros
- **THEN** la tarjeta no se ve, y la acción principal de esa vista es Guardar como nuevo
- **WHEN** vuelve a la vista de entrenamiento
- **THEN** la tarjeta vuelve a estar al principio, con la misión en curso al día

#### Scenario: Reglas a mano
- **WHEN** la persona abre Reglas a mano a 1366×768
- **THEN** lo primero del tablero es la tarjeta de consigna, entera, antes que la tarjeta del programa

### Requirement: Consigna
La tarjeta SHALL mostrar una consigna en español y en inglés: una frase en imperativo, de hasta 90 caracteres y dos renglones con el panel por defecto, que dice qué hacer ahora. SHALL cambiar con el modo de la pestaña (calle o circuito, selección automática o manual, Compuertas, Puntos o Tu manejo) y no con cada paso de la simulación. En Inspeccionar y en el Laboratorio SHALL nombrar dónde está la marcha.

#### Scenario: Consigna por defecto
- **WHEN** la persona entra a El problema con la configuración por defecto
- **THEN** la tarjeta dice que maneje con las flechas sin chocar

#### Scenario: Cambia con el modo
- **WHEN** en Entrenar la persona pasa a la selección manual
- **THEN** la consigna pasa a decir que elija al líder cuando haga algo prometedor
- **WHEN** vuelve a la selección automática
- **THEN** la consigna vuelve a la de la selección automática

#### Scenario: Circuito
- **WHEN** en El problema la persona elige un circuito
- **THEN** la consigna habla de no salirse de la pista en vez de no chocar con el tráfico

#### Scenario: Laboratorio
- **WHEN** la persona pasa de Compuertas a Puntos y a Tu manejo
- **THEN** la consigna cambia con cada uno y nombra el botón Reproducir de abajo de la red

#### Scenario: Idioma
- **WHEN** la persona cambia a inglés
- **THEN** la consigna se muestra en inglés, sin recargar

#### Scenario: Largo
- **WHEN** se mide cada consigna en español y en inglés con el panel de 360 píxeles
- **THEN** ninguna pasa de 90 caracteres ni de dos renglones

### Requirement: Acción principal en la tarjeta
En El problema, Entrenar y Competir, los controles de marcha SHALL ir adentro de la tarjeta, debajo de la consigna. Esto incluye la acción principal y botones como Reiniciar o Siguiente; "Tráfico nuevo" SHALL ir fuera, junto a los interruptores de vista. En Inspeccionar y en el Laboratorio, la marcha SHALL quedar en la barra de abajo de la red; en Reglas a mano, en la barra de abajo de la escena, con Reiniciar y Tráfico nuevo. Mover un control MUST NOT cambiar lo que hace, su texto, su tooltip ni su atajo.

#### Scenario: El problema
- **WHEN** la persona entra a El problema
- **THEN** el botón de pausar, que es la acción principal, está en la tarjeta, debajo de la consigna, junto a Reiniciar y con su misma altura; "Tráfico nuevo" está fuera de la tarjeta, junto a Sensores y Ver como la máquina

#### Scenario: Competir con el cartel de largada
- **WHEN** en Competir se ve el cartel de largada sobre la escena
- **THEN** la marcha de la tarjeta se ve como secundaria y el botón del cartel sigue siendo la única acción principal

#### Scenario: Inspeccionar
- **WHEN** la persona entra a Inspeccionar
- **THEN** la tarjeta muestra la consigna y la misión en curso, y el botón Reproducir sigue en la barra de abajo de la red como acción principal

#### Scenario: Mismo comportamiento
- **WHEN** la persona usa la marcha de la tarjeta con el mouse o con su atajo
- **THEN** hace lo mismo que antes del cambio, y una sola acción principal queda a la vista

#### Scenario: Reglas a mano
- **WHEN** la persona entra a Reglas a mano
- **THEN** la tarjeta muestra la consigna y la misión en curso, y "Pausar (espacio)", que es la acción principal, está en la barra de abajo de la escena, junto a Reiniciar y Tráfico nuevo

### Requirement: Misión en curso
La tarjeta SHALL mostrar la misión en curso: la primera sin cumplir, en el orden de la lista, con el mismo nombre, progreso y barra que en la lista. Con todas cumplidas, SHALL decirlo; sin misiones en ese modo, SHALL no mostrar misión. La lista completa SHALL seguir al final del panel, con la misión en curso marcada también por algo que no es el color. En Entrenar la lista SHALL ir plegada en un renglón que dice cuántas van cumplidas, como fija `pestana-entrenar`; en las demás pestañas, a la vista.

#### Scenario: Primera misión por defecto
- **WHEN** la persona entra a El problema sin haber cumplido nada
- **THEN** la tarjeta muestra "Superá 5 vehículos sin chocar" con 0 de 5

#### Scenario: Pasa a la siguiente
- **WHEN** la persona supera el quinto vehículo sin chocar
- **THEN** la lista marca la primera misión como cumplida y la tarjeta pasa a mostrar "Recorré 500 m sin chocar" con su progreso

#### Scenario: Progreso al día
- **WHEN** la persona supera tres vehículos sin chocar
- **THEN** la tarjeta y la lista muestran los dos "3 de 5" al mismo tiempo

#### Scenario: Todas cumplidas
- **WHEN** la persona cumple todas las misiones de la pestaña
- **THEN** la tarjeta dice que están todas cumplidas y la lista las muestra marcadas

#### Scenario: Sin misiones en el modo
- **WHEN** en El problema la persona elige un circuito
- **THEN** la tarjeta muestra la consigna y la marcha sin misión

#### Scenario: Misiones recordadas
- **WHEN** la persona cumple una misión, reinicia el intento y vuelve a la pestaña más tarde, sin cerrar la app
- **THEN** la tarjeta sigue mostrando como misión en curso la primera que falta

#### Scenario: La lista plegada de Entrenar
- **WHEN** la persona llega a la generación 5 en Entrenar con la lista de misiones plegada
- **THEN** la tarjeta pasa a mostrar la misión siguiente y el renglón plegado pasa a decir una misión cumplida

### Requirement: Tarjeta con la guía apagada
El interruptor de guía SHALL ocultar la consigna y la misión en curso de la tarjeta, junto con los demás textos de guía y las misiones. La marcha SHALL quedar en el mismo lugar y funcionar igual. Al volver a encender la guía, la tarjeta SHALL mostrar otra vez la consigna y la misión en curso al día.

#### Scenario: Apagar la guía
- **WHEN** la persona apaga la guía en El problema
- **THEN** la tarjeta deja de mostrar la consigna y la misión, y el panel empieza por los controles de marcha

#### Scenario: Volver a encender
- **WHEN** la persona supera dos vehículos con la guía apagada y la vuelve a encender
- **THEN** la tarjeta muestra la consigna y la misión en curso con 2 de 5

### Requirement: Tarjeta al elegir en Inspeccionar y en el Laboratorio
En Inspeccionar y en el Laboratorio, la tarjeta SHALL ceder su lugar cuando la persona elige una neurona o una conexión, igual que el texto largo de la guía, para que la cuenta entre sin desplazar. Al soltar la elección, la tarjeta SHALL volver al principio del panel, con la consigna y la misión en curso al día. Lo decidió el dueño el 17 de noviembre de 2026, después de medir que una tarjeta compacta no alcanzaba.

#### Scenario: Elegir una neurona
- **WHEN** en Inspeccionar la persona elige una neurona
- **THEN** la tarjeta no se ve, y lo primero del panel es la cuenta de la neurona

#### Scenario: La cuenta entra a 1366×768
- **WHEN** en Inspeccionar, a 1366×768, la persona elige una neurona de la capa de salida
- **THEN** la tabla de la neurona se ve entera, con todas sus filas, sin desplazar el panel ni la tabla

#### Scenario: Soltar la elección
- **WHEN** la persona suelta la neurona elegida
- **THEN** la tarjeta vuelve al principio del panel, con la consigna y la misión en curso con su progreso al día

#### Scenario: Laboratorio
- **WHEN** en el Laboratorio la persona elige una neurona
- **THEN** la tarjeta y la lista de misiones no se ven mientras dura la elección, y vuelven al soltarla

### Requirement: Tarjeta accesible
La tarjeta SHALL ser una región con un nombre accesible ("Qué hacer ahora" o el equivalente en inglés) que un lector de pantalla anuncia. El orden de lectura y de foco SHALL ser consigna, controles de marcha y misión en curso. Los cambios de progreso de la misión MUST NOT anunciarse en cada paso.

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega al panel de El problema
- **THEN** anuncia la región "Qué hacer ahora", lee la consigna, después la marcha y después la misión en curso

#### Scenario: Con el teclado
- **WHEN** en El problema la persona recorre el panel con Tab
- **THEN** el primer control del panel que recibe el foco es la marcha de la tarjeta

### Requirement: Texto de guía plegado
Con la guía activa, el texto largo de la guía de cada pestaña SHALL quedar plegado por defecto debajo de la tarjeta de consigna, detrás de un control "Más sobre esta pestaña" que lo despliega y lo vuelve a plegar. El control SHALL tener tooltip en español y en inglés y anunciar si está desplegado. Lo que no es texto SHALL quedar fuera del pliegue. Con la guía apagada, no se muestran ni el control ni el texto.

#### Scenario: Plegado por defecto
- **WHEN** la persona entra a cualquier pestaña con la guía encendida
- **THEN** ve la tarjeta de consigna y, debajo, "Más sobre esta pestaña", sin el texto largo

#### Scenario: Desplegar y volver a plegar
- **WHEN** la persona toca "Más sobre esta pestaña"
- **THEN** aparece el texto largo de la guía, en el idioma activo
- **WHEN** lo vuelve a tocar
- **THEN** el texto se pliega otra vez

#### Scenario: Con el teclado
- **WHEN** la persona llega a "Más sobre esta pestaña" con Tab y presiona Enter o Espacio
- **THEN** el texto se despliega y un lector de pantalla anuncia que está desplegado

#### Scenario: Guía apagada
- **WHEN** la persona apaga la guía
- **THEN** no se ven ni "Más sobre esta pestaña" ni el texto largo

#### Scenario: Controles fuera del pliegue
- **WHEN** la persona entra al Laboratorio con el texto plegado
- **THEN** "Agregar una capa oculta" se ve sin desplegar nada

### Requirement: Mostrar el control de la misión
Junto a la misión en curso de la tarjeta de consigna SHALL haber un botón "Mostrame" si esa misión tiene un control para tocar, y ninguno si no lo tiene. La lista de misiones de abajo MUST NOT tener ese botón. El botón SHALL tener un tooltip que diga qué hace y por qué importa, en español y en inglés, y SHALL ocultarse con la guía, junto con la misión.

#### Scenario: Misión con control
- **WHEN** en Entrenar la misión en curso es "Probá otra función de fitness"
- **THEN** la tarjeta muestra "Mostrame" junto a la misión

#### Scenario: Misión sin control
- **WHEN** la persona entra a El problema sin haber cumplido nada y la misión en curso es "Superá 5 vehículos sin chocar"
- **THEN** la tarjeta muestra la misión sin "Mostrame"

#### Scenario: Cambia con la misión
- **WHEN** en El problema la persona cumple las dos primeras misiones y pasa a "200 m viendo como la máquina"
- **THEN** aparece "Mostrame" junto a esa misión

#### Scenario: Guía apagada
- **WHEN** la persona apaga la guía
- **THEN** "Mostrame" no se ve, junto con la misión y la consigna

#### Scenario: Idioma
- **WHEN** la persona cambia a inglés
- **THEN** el botón y su tooltip se leen en inglés, sin recargar

### Requirement: Controles de las misiones de El problema
Las misiones de El problema SHALL mostrar este control; "—" quiere decir sin botón.

| Misión | Control |
|---|---|
| Superá 5 vehículos sin chocar | — |
| Recorré 500 m sin chocar | — |
| 200 m viendo como la máquina | Ver como la máquina |

#### Scenario: Ver como la máquina
- **WHEN** la persona toca "Mostrame" junto a "200 m viendo como la máquina"
- **THEN** el interruptor "Ver como la máquina" queda marcado y con el foco, sin cambiar de estado

### Requirement: Controles de las misiones de Reglas a mano
Las misiones de Reglas a mano SHALL mostrar este control.

| Misión | Control |
|---|---|
| Superá 3 vehículos sin chocar | El programa (las fichas o el editor, según la vista) |
| Superá 10 vehículos sin chocar | El programa (las fichas o el editor, según la vista) |
| Superá 10 en 3 tráficos distintos | Tráfico nuevo |

#### Scenario: El editor
- **WHEN** la persona toca "Mostrame" junto a "Superá 3 vehículos sin chocar"
- **THEN** el programa, en la vista que está a la vista, queda marcado y con el foco, sin cambiar el texto ni el cursor

### Requirement: Controles de las misiones de Entrenar
Las misiones de Entrenar SHALL mostrar este control; "—" quiere decir sin botón.

| Misión | Control |
|---|---|
| Llegá a la generación 5 | — |
| Un auto que supere 5 vehículos | — |
| Guardá un cerebro | Guardar campeón |
| Probá otra función de fitness | Función de fitness (vista Ajustes) |

#### Scenario: Fitness en otra vista
- **WHEN** en Entrenar la persona toca "Mostrame" junto a "Probá otra función de fitness"
- **THEN** el panel pasa a la vista Ajustes y el selector de la función de fitness queda marcado y con el foco

### Requirement: Controles de las misiones de Competir
Las misiones de Competir SHALL mostrar este control.

| Misión | Control |
|---|---|
| Correr en las cuatro pistas | Pista, en la barra de escenario |
| Un cerebro choca donde no practicó | Pista, en la barra de escenario |
| Ganarle a un cerebro manejando | La marcha (Largar) |

#### Scenario: Control en la barra de escenario
- **WHEN** en Competir la persona toca "Mostrame" junto a "Correr en las cuatro pistas"
- **THEN** el selector de pista de la barra de escenario queda marcado y con el foco

#### Scenario: No larga la carrera
- **WHEN** la persona toca "Mostrame" junto a "Ganarle a un cerebro manejando"
- **THEN** la marcha queda marcada y con el foco, y la carrera no larga hasta que la persona la toque

### Requirement: Controles de las misiones de Inspeccionar
Las misiones de Inspeccionar SHALL mostrar este control. Donde el control solo existe con algo elegido, "Mostrame" elige primero lo que dice la tabla. Para el valor a mano, que solo existe en pausa, antes pausa.

| Misión | Control |
|---|---|
| Seguí la cuenta de una neurona | «De a: Operación» y Paso, en la barra de abajo de la red |
| Cambiá una decisión a mano | El valor a mano de la primera entrada, elegida |
| Apagá una neurona y mirá | Apagar, con la primera neurona oculta elegida |

#### Scenario: Paso
- **WHEN** la persona toca "Mostrame" junto a "Seguí la cuenta de una neurona"
- **THEN** «De a: Operación» y Paso, en la barra de abajo de la red, quedan marcados, y el foco va a Paso

### Requirement: Controles de las misiones de compuertas del Laboratorio
Las misiones de compuertas SHALL mostrar este control, según la compuerta elegida y la red.

| Misión | Control |
|---|---|
| Resolvé AND a mano | El primer peso sobre la red |
| Resolvé OR a mano | La compuerta OR, si no está elegida; si no, el primer peso |
| Resolvé XOR con una capa oculta | La compuerta XOR, si no está elegida; si no, Agregar una capa oculta (o el primer peso, mientras no aparece); con capa, el primer peso |

#### Scenario: Elegir la compuerta primero
- **WHEN** con AND resuelta y AND todavía elegida, la persona toca "Mostrame" junto a "Resolvé OR a mano"
- **THEN** la opción OR de la barra de escenario queda marcada y con el foco, sin elegirla

#### Scenario: Depende del estado
- **WHEN** en el Laboratorio, con XOR y una capa oculta ya agregada, la persona toca "Mostrame"
- **THEN** queda marcado el primer peso sobre la red, no "Agregar una capa oculta"

### Requirement: Controles de las misiones de puntos y tu manejo del Laboratorio
Las misiones con puntos o con tu manejo SHALL mostrar este control.

| Misión | Control |
|---|---|
| Seguí una corrección entera | «De a: Fase» y Paso |
| Hacé que la red memorice | Cantidad, Ruido y las capas ocultas |
| Guardá un cerebro imitador | Guardar como cerebro |

#### Scenario: Varios controles
- **WHEN** en el Laboratorio, con puntos, la persona toca "Mostrame" junto a "Hacé que la red memorice"
- **THEN** Cantidad, Ruido y las capas ocultas quedan marcados a la vez, y el foco va a Cantidad

### Requirement: Cómo se muestra un control
Al tocar "Mostrame", la pestaña SHALL traer el control a la vista, marcarlo con un anillo quieto que se va a los 4 segundos o al tocar otra cosa, pasarle el foco y anunciar su nombre corto. MUST NOT cambiar ajustes, valores ni la simulación, salvo en Inspeccionar (pausar y elegir) y en Reglas a mano (desplegar el programa). El anillo SHALL distinguirse del foco y de la opción elegida y dar 3:1 o más. Con menos movimiento, sin transición.

#### Scenario: Anillo quieto
- **WHEN** la persona toca "Mostrame" y se mide el brillo del anillo durante los 4 segundos
- **THEN** no cambia más de una vez para aparecer y una para irse, y nunca más de tres veces en un segundo

#### Scenario: Se va solo
- **WHEN** pasan 4 segundos sin que la persona toque nada
- **THEN** el anillo desaparece y el foco queda en el control

#### Scenario: No cambia nada
- **WHEN** la persona toca "Mostrame" junto a "Probá otra función de fitness"
- **THEN** la función de fitness sigue siendo la misma y el entrenamiento sigue igual; solo cambió la vista del panel

#### Scenario: Elegir en Inspeccionar y volver atrás
- **WHEN** en Inspeccionar la persona toca "Mostrame" junto a "Apagá una neurona y mirá"
- **THEN** queda elegida la primera neurona oculta y su botón Apagar queda marcado y con el foco, sin apagarla
- **WHEN** la persona suelta la elección
- **THEN** vuelve la tarjeta de consigna, con la misión en curso

#### Scenario: Pausar para la entrada a mano
- **WHEN** en Inspeccionar, reproduciendo, la persona toca "Mostrame" junto a "Cambiá una decisión a mano"
- **THEN** la reproducción se pausa, queda elegida la primera entrada y su valor a mano queda marcado y con el foco, sin cambiar el valor

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla está activo y la persona toca "Mostrame"
- **THEN** anuncia el nombre del control mostrado y queda sobre él

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** el panel no se desplaza con animación y el anillo aparece y desaparece sin transición

#### Scenario: Determinismo
- **WHEN** se repite un recorrido con la misma semilla, una vez tocando "Mostrame" y otra sin tocarlo
- **THEN** la simulación, el entrenamiento y las carreras dan los mismos resultados
