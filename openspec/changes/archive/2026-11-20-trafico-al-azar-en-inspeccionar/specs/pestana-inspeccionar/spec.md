## ADDED Requirements

### Requirement: Tráfico nuevo o repetido
En la calle recta, la pestaña SHALL usar una semilla de tráfico nueva, al azar, cada vez que arma el intento: al abrirla, al cambiar de cerebro y al cambiar los ajustes. Al reiniciar, la semilla SHALL ser otra con "Tráfico" en "Nuevo" y la misma en "Repetir". Las repeticiones (Atrás, Reintentar desde acá, el deslizador) MUST conservarla. Misma semilla, cerebro y ajustes SHALL dar el mismo intento.

#### Scenario: Estado por defecto
- **WHEN** la persona abre la pestaña en la calle recta sin tocar nada
- **THEN** la opción "Tráfico" muestra "Nuevo" y el tráfico es uno elegido al azar

#### Scenario: Reiniciar con Nuevo
- **WHEN** con "Nuevo", la persona reinicia el intento con R
- **THEN** el auto vuelve a la salida con otro tráfico

#### Scenario: Reiniciar con Repetir
- **WHEN** la persona elige "Repetir" y reinicia el intento dos veces sin cambiar la red
- **THEN** las dos veces el tráfico es el mismo que estaba viendo al elegir "Repetir", y el auto hace lo mismo

#### Scenario: Volver a Nuevo
- **WHEN** con "Repetir", la persona elige "Nuevo" y reinicia
- **THEN** el tráfico vuelve a ser otro en cada reinicio

#### Scenario: Elegir la opción no reinicia
- **WHEN** la persona cambia la opción "Tráfico" en medio de un intento
- **THEN** el intento sigue sin reiniciarse y la opción rige desde el próximo reinicio

#### Scenario: Las repeticiones conservan el tráfico
- **WHEN** con "Nuevo", la persona choca, mueve el deslizador y elige "Reintentar desde acá"
- **THEN** el intento sigue desde ese cuadro con el mismo tráfico

#### Scenario: Atrás conserva el tráfico
- **WHEN** con "Nuevo", la persona vuelve 30 cuadros con "Atrás" y reproduce
- **THEN** el auto hace lo mismo que la primera vez, con el mismo tráfico

### Requirement: Opción Tráfico en el panel
El panel SHALL ofrecer la opción "Tráfico", con los valores "Nuevo" (por defecto) y "Repetir". El grupo y cada valor tienen un tooltip en español y en inglés que dice qué hace y por qué importa. Cambiar la opción MUST NOT reiniciar el intento. La opción no se guarda entre sesiones, y en un circuito, que no tiene tráfico, MUST ocultarse.

#### Scenario: Circuito
- **WHEN** el cerebro elegido entrenó en el óvalo
- **THEN** la opción "Tráfico" no se ve

#### Scenario: Nueva sesión
- **WHEN** la persona eligió "Repetir", cierra la aplicación y la vuelve a abrir
- **THEN** la opción "Tráfico" muestra "Nuevo"

#### Scenario: Textos y tooltips
- **WHEN** la persona posa el cursor sobre la opción "Tráfico", "Nuevo" o "Repetir", en español o en inglés
- **THEN** cada uno tiene un tooltip que dice qué hace y por qué importa

## MODIFIED Requirements

### Requirement: Lista para mirar al abrir
Al abrirse, la pestaña SHALL mostrar, sin configurar nada, un cerebro
manejando y su red en grande, en tiempo real: el último entrenamiento de la
persona si existe, y si no, el cerebro de ejemplo de la calle con tráfico
nuevo. El auto SHALL manejar en una pista donde ese cerebro entrenó.

#### Scenario: Con un entrenamiento hecho
- **WHEN** la persona entrenó en el óvalo y abre Inspeccionar
- **THEN** ve la red de ese entrenamiento encendiéndose y el auto manejando en el óvalo

#### Scenario: Sin haber entrenado nunca
- **WHEN** la persona abre Inspeccionar sin haber entrenado ni guardado nada
- **THEN** ve la red del cerebro de ejemplo de la calle con tráfico nuevo, manejando en la calle recta

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** la red se ve como diagrama, con todas las capas abiertas, corriendo en tiempo real, sin nada elegido y con todas las conexiones a la vista

#### Scenario: Misma semilla, misma escena
- **WHEN** con el mismo cerebro y los mismos ajustes, el mundo se arma dos veces con la misma semilla de tráfico
- **THEN** el auto hace lo mismo las dos veces

#### Scenario: Cada apertura, otro tráfico
- **WHEN** la persona abre la pestaña dos veces en la calle recta con el mismo cerebro y los mismos ajustes
- **THEN** cada vez el tráfico es otro, elegido al azar

### Requirement: Manejar vos
La escena SHALL ofrecer "Manejar vos", un botón con tooltip en español y en inglés, en el renglón de los controles de cámara, con la altura normal. Al activarlo, o al apretar una flecha con el foco en la escena o en ningún control, el auto pasa a manejarse con el teclado como en El problema, y la reproducción pasa a correr en tiempo real de a cuadros. La red sigue calculando cada cuadro y se ve igual que cuando maneja.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** maneja la red, "Manejar vos" está a la vista sin activar y el tráfico de la calle recta es uno nuevo, elegido al azar

#### Scenario: Tomar el volante con el botón
- **WHEN** la persona activa "Manejar vos"
- **THEN** el botón se ve activo, el foco queda en la escena, un aviso en la escena dice que maneja la persona y que la red solo mira, y el auto responde a las flechas

#### Scenario: Tomar el volante con una flecha
- **WHEN** la red maneja, el foco está en la escena y la persona aprieta la flecha arriba
- **THEN** el auto pasa a manejarse con el teclado desde ese cuadro, sin volver a empezar el intento

#### Scenario: Flechas dentro de la red
- **WHEN** el foco está en el diagrama, en una pastilla o en un deslizador y la persona usa las flechas
- **THEN** las flechas hacen lo de siempre en ese control y no toman el volante

#### Scenario: La red se sigue viendo
- **WHEN** la persona maneja
- **THEN** el diagrama, la tabla de pesos y la tarjeta de la neurona elegida muestran la cuenta de la red con lo que ve el auto en cada cuadro

#### Scenario: Pausa
- **WHEN** la persona pausa mientras maneja
- **THEN** el auto se detiene, las flechas no lo mueven, y el paso a paso, las entradas a mano y los cambios de la red funcionan como siempre

#### Scenario: Un cuadro con N
- **WHEN** en pausa la persona mantiene la flecha izquierda y aprieta N de a cuadros
- **THEN** el auto avanza un cuadro doblando a la izquierda y la red muestra su cuenta de ese cuadro

#### Scenario: Choque
- **WHEN** la persona choca mientras maneja
- **THEN** la escena se congela con el caso del choque, como cuando maneja la red, y al reiniciar o reintentar sigue manejando la persona

#### Scenario: Atajos apagados
- **WHEN** los atajos de una tecla están apagados
- **THEN** las flechas manejan y toman el volante, y W, A, S y D no hacen nada

#### Scenario: Guía
- **WHEN** la guía está activa
- **THEN** el texto de la guía dice que se puede tomar el volante con las flechas para ver qué haría la red en cada situación

### Requirement: Caso del choque en Inspeccionar
Al chocar, la pestaña SHALL congelar la reproducción y mostrar, debajo de la decisión, una tarjeta del caso con: a los cuántos metros y contra qué chocó, qué decidió la red en el cuadro que se mira, y qué neurona aportó más a esa decisión, con un botón "Elegir esta neurona". La decisión es la acción encendida de mayor valor; la neurona que más aportó es la de la última capa oculta con el mayor aporte positivo (valor por peso) a esa salida, o la entrada, si la red no tiene capas ocultas. La tarjeta SHALL ofrecer "Reintentar desde acá" y "Reiniciar (R)". Reiniciar o reintentar SHALL cerrar el caso.

#### Scenario: Estado por defecto
- **WHEN** el cerebro de ejemplo choca con los valores por defecto
- **THEN** la reproducción queda en pausa, la escena muestra el auto chocado y la tarjeta dice a los cuántos metros, contra qué, qué decidió la red y qué neurona aportó más, con su aporte en números

#### Scenario: Elegir la neurona que decidió
- **WHEN** la persona elige "Elegir esta neurona"
- **THEN** esa neurona queda elegida en la red, el panel muestra su tarjeta con la cuenta de ese cuadro y la línea de guía habla del choque

#### Scenario: Sin capas ocultas
- **WHEN** choca un cerebro sin capas ocultas
- **THEN** la tarjeta nombra la entrada que más aportó a la decisión y el botón la elige

#### Scenario: Ninguna acción encendida
- **WHEN** en el cuadro que se mira la red no tenía ninguna acción encendida
- **THEN** la tarjeta dice que la red no accionaba nada y no nombra una neurona

#### Scenario: Reiniciar
- **WHEN** la persona reinicia con R o con el botón
- **THEN** la tarjeta y el deslizador desaparecen, el intento vuelve a la salida con el tráfico que indica la opción "Tráfico" (uno nuevo con "Nuevo", el mismo con "Repetir") y la reproducción sigue como estaba antes del choque

#### Scenario: Sin depender del color
- **WHEN** se ve el caso en escala de grises
- **THEN** la neurona que más aportó se distingue en la red por su marca, no solo por el color

#### Scenario: Textos y tooltips
- **WHEN** la persona posa el cursor sobre "Elegir esta neurona", "Reintentar desde acá" o "Reiniciar"
- **THEN** cada uno tiene un tooltip en español y en inglés que dice qué hace y por qué importa
