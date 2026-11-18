## ADDED Requirements

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
| Superá 3 vehículos sin chocar | El editor del programa |
| Superá 10 vehículos sin chocar | El editor del programa |
| Superá 10 en 3 tráficos distintos | Tráfico nuevo |

#### Scenario: El editor
- **WHEN** la persona toca "Mostrame" junto a "Superá 3 vehículos sin chocar"
- **THEN** el editor del programa queda marcado y con el foco, sin cambiar el texto ni el cursor

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
