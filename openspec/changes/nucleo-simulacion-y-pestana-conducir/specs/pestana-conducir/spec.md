# Spec Delta

## Purpose

Presenta el problema que todo el recorrido intenta resolver: manejar un auto
entre el tráfico sin chocar. La persona lo hace con el teclado mientras ve qué
percibe el auto y qué controles se accionan, y así descubre que conducir es
convertir percepción en acción.

## ADDED Requirements

### Requirement: Manejo inmediato
Al abrirse, la pestaña SHALL mostrar el auto del conductor detenido y centrado
en un carril de una calle recta de tres carriles con tráfico, listo para
manejarse con el teclado sin configurar nada.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** se ve la calle de tres carriles, el auto detenido, tráfico por delante y los sensores visibles

#### Scenario: Primer movimiento
- **WHEN** la persona presiona la flecha arriba
- **THEN** el auto empieza a avanzar

### Requirement: Guía de inicio
Con la guía activa, la pestaña SHALL mostrar un texto breve que diga qué se
está viendo, qué probar y con qué teclas se maneja.

#### Scenario: Guía activa
- **WHEN** la guía está activa
- **THEN** el panel muestra el texto de inicio con las teclas de manejo

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio no se muestra y el manejo funciona igual

### Requirement: Indicadores del intento
La pestaña SHALL mostrar, actualizados en tiempo real, la distancia recorrida
en metros, la cantidad de vehículos superados, la cantidad de intentos y la
mejor distancia lograda desde que se abrió la pestaña.

#### Scenario: Avanzar
- **WHEN** el auto avanza y supera a un vehículo del tráfico
- **THEN** la distancia aumenta de forma continua y los vehículos superados aumentan en uno

#### Scenario: Nueva mejor distancia
- **WHEN** un intento termina con una distancia mayor que la mejor registrada
- **THEN** la mejor distancia pasa a ser la de ese intento

### Requirement: Fin del intento por choque
Cuando el auto choca, la pestaña SHALL dar por terminado el intento y mostrar un
mensaje con la distancia lograda y cómo volver a intentar.

#### Scenario: Chocar
- **WHEN** el auto choca contra un borde o un vehículo
- **THEN** aparece un mensaje con la distancia del intento y la indicación de la tecla y el botón para reiniciar

### Requirement: Reiniciar el intento
La pestaña SHALL permitir reiniciar el intento en cualquier momento con un
botón y con la tecla R. El reinicio MUST conservar el mismo tráfico y sumar un
intento.

#### Scenario: Reiniciar tras chocar
- **WHEN** la persona presiona R después de chocar
- **THEN** el auto vuelve al inicio, el mensaje desaparece, el tráfico es el mismo que antes y los intentos aumentan en uno

#### Scenario: Reiniciar en marcha
- **WHEN** la persona presiona el botón de reiniciar mientras maneja
- **THEN** el intento vuelve a empezar con el mismo tráfico

### Requirement: Tráfico nuevo
La pestaña SHALL ofrecer un botón que reinicia el intento con una disposición
de tráfico distinta.

#### Scenario: Pedir tráfico nuevo
- **WHEN** la persona presiona el botón de tráfico nuevo
- **THEN** el intento se reinicia y los vehículos aparecen en posiciones distintas a las anteriores

### Requirement: Pausa
La pestaña SHALL permitir pausar y reanudar con un botón y con la barra
espaciadora, y MUST indicar de forma visible cuando está en pausa.

#### Scenario: Pausar
- **WHEN** la persona presiona la barra espaciadora mientras maneja
- **THEN** el auto y el tráfico se detienen y se indica que está en pausa

#### Scenario: Reanudar
- **WHEN** la persona vuelve a presionar la barra espaciadora
- **THEN** el manejo continúa desde el mismo estado

### Requirement: Percepción visible
La pestaña SHALL mostrar una barra por cada sensor, en el mismo orden que los
rayos de izquierda a derecha, que refleja su lectura en tiempo real. Un
interruptor SHALL mostrar u ocultar a la vez los rayos y las barras, que están
visibles por defecto.

#### Scenario: Obstáculo que se acerca
- **WHEN** un vehículo se acerca por un rayo
- **THEN** la barra de ese rayo crece a medida que el vehículo está más cerca

#### Scenario: Ocultar la percepción
- **WHEN** la persona apaga el interruptor de sensores
- **THEN** desaparecen los rayos y las barras y el manejo no cambia

### Requirement: Acción visible
La pestaña SHALL mostrar cuatro indicadores, uno por control (avanzar,
retroceder, izquierda, derecha), que se resaltan mientras ese control está
accionado.

#### Scenario: Presionar una tecla
- **WHEN** la persona mantiene presionada la flecha izquierda
- **THEN** el indicador de izquierda se resalta y vuelve a su estado normal al soltarla

### Requirement: Ver como la máquina
La pestaña SHALL ofrecer un modo, apagado por defecto, que oculta la calle y el
tráfico y deja a la vista solo el auto, sus rayos y las barras, para manejar
con la misma información que tendría una máquina.

#### Scenario: Activar el modo
- **WHEN** la persona activa el modo ver como la máquina
- **THEN** dejan de verse la calle y el tráfico, y siguen visibles el auto, los rayos y las barras, aunque los sensores estuvieran ocultos

#### Scenario: Chocar sin ver
- **WHEN** el auto choca con el modo activo
- **THEN** la calle y el tráfico vuelven a mostrarse junto con el mensaje de fin del intento

#### Scenario: Desactivar el modo
- **WHEN** la persona desactiva el modo
- **THEN** la calle y el tráfico vuelven a verse y el intento continúa

### Requirement: Misiones
Con la guía activa, la pestaña SHALL mostrar tres misiones con su progreso:
superar 5 vehículos sin chocar, recorrer 500 metros sin chocar y recorrer 200
metros en el modo ver como la máquina. Las misiones MUST NOT bloquear ninguna
función y una misión cumplida SHALL seguir marcada hasta cerrar la aplicación.

#### Scenario: Progreso de una misión
- **WHEN** la persona supera tres vehículos sin chocar
- **THEN** la primera misión muestra tres de cinco

#### Scenario: Misión cumplida
- **WHEN** la persona supera el quinto vehículo sin chocar
- **THEN** la primera misión queda marcada como cumplida y sigue marcada tras reiniciar el intento

#### Scenario: Chocar antes de cumplir
- **WHEN** la persona choca antes de cumplir una misión
- **THEN** el progreso de esa misión vuelve a cero en el siguiente intento

### Requirement: Configuración avanzada
La pestaña SHALL ofrecer, en una sección colapsada por defecto, la velocidad
máxima del auto (compartida por todas las pestañas), la cantidad de
carriles (2, 3 o 4), la densidad y la irregularidad del tráfico, y la cantidad,
el alcance y la apertura de los sensores. Todo cambio MUST aplicarse de
inmediato reiniciando el intento con la nueva configuración.

#### Scenario: Sección colapsada
- **WHEN** se abre la pestaña
- **THEN** los controles de configuración avanzada no están a la vista

#### Scenario: Cambiar los carriles
- **WHEN** la persona elige cuatro carriles
- **THEN** el intento se reinicia de inmediato en una calle de cuatro carriles

#### Scenario: Cambiar la velocidad del auto
- **WHEN** la persona sube la velocidad máxima a 30 m/s
- **THEN** el intento se reinicia y el auto puede llegar a 30 m/s

#### Scenario: Cambiar los sensores
- **WHEN** la persona cambia la cantidad de sensores a nueve
- **THEN** el auto muestra nueve rayos y el panel nueve barras

### Requirement: Restablecer la configuración
La pestaña SHALL ofrecer un botón que devuelve toda la configuración avanzada a
sus valores por defecto.

#### Scenario: Restablecer
- **WHEN** la persona cambió velocidad, carriles, tráfico y sensores, y presiona restablecer
- **THEN** el auto vuelve a 15 m/s, la calle a tres carriles, el tráfico a densidad e irregularidad de 50 %, y los sensores a 5 rayos, 3 largos de auto y 90 grados

### Requirement: Controles de la pestaña explicados
Cada control de la pestaña (reiniciar, tráfico nuevo, pausa, sensores, ver como
la máquina, cada ajuste avanzado y restablecer) SHALL tener un tooltip que diga
qué hace y por qué importa, y todos sus textos SHALL estar en español y en
inglés.

#### Scenario: Tooltip de la densidad
- **WHEN** la persona posa el cursor sobre el ajuste de densidad
- **THEN** un tooltip en el idioma activo explica que regula cuántos vehículos hay y por qué eso vuelve más difícil el problema

#### Scenario: Pestaña en inglés
- **WHEN** la aplicación está en inglés
- **THEN** la guía, los indicadores, las misiones, los mensajes y los controles de la pestaña se muestran en inglés
