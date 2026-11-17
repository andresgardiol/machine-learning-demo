## ADDED Requirements

### Requirement: Manejar vos
La escena SHALL ofrecer "Manejar vos", un botón con tooltip en español y en
inglés. Al activarlo, o al apretar una flecha con el foco en la escena o en
ningún control, el auto pasa a manejarse con el teclado como en El problema,
y la reproducción pasa a correr en tiempo real de a cuadros. La red sigue
calculando cada cuadro y se ve igual que cuando maneja.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** maneja la red, "Manejar vos" está a la vista sin activar y la escena es la de siempre, igual para dos personas con la misma semilla

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
- **THEN** la escena muestra el choque un momento, el intento vuelve a empezar desde la salida con el mismo tráfico, y sigue manejando la persona

#### Scenario: Atajos apagados
- **WHEN** los atajos de una tecla están apagados
- **THEN** las flechas manejan y toman el volante, y W, A, S y D no hacen nada

#### Scenario: Guía
- **WHEN** la guía está activa
- **THEN** el texto de la guía dice que se puede tomar el volante con las flechas para ver qué haría la red en cada situación

### Requirement: Tu decisión y la de la red
Mientras la persona maneja, la decisión debajo de la escena SHALL mostrar dos
filas con las cuatro acciones: "Vos", lo que aprieta la persona, y "La red",
lo que decidiría la red en ese cuadro. Cada acción en que coinciden MUST
marcarse sin depender solo del color, y una línea dice en qué parte de los
cuadros de los últimos 10 segundos coincidieron las cuatro acciones.

#### Scenario: Coinciden
- **WHEN** la persona avanza y la red también decidiría solo avanzar
- **THEN** las dos filas muestran avanzar encendido y las cuatro acciones llevan la marca de que coinciden

#### Scenario: No coinciden
- **WHEN** la persona avanza recto y la red doblaría a la derecha
- **THEN** la fila "La red" muestra derecha encendida, "Vos" no, y derecha lleva la marca de que no coinciden

#### Scenario: Cuánto coinciden
- **WHEN** la persona maneja 10 segundos y en 450 de los 600 cuadros las cuatro acciones coincidieron
- **THEN** la línea dice que coincidieron en el 75 % de los cuadros de los últimos 10 segundos

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a la decisión mientras la persona maneja
- **THEN** anuncia qué aprieta la persona, qué haría la red y cuánto coinciden, sin anunciarlo en cada cuadro

#### Scenario: Con la red manejando
- **WHEN** maneja la red
- **THEN** la decisión se ve como siempre, una sola fila, sin la línea de coincidencia

### Requirement: Devolver el volante
Mientras la persona maneja, la escena SHALL ofrecer "Devolver el volante", que
le da el control a la red desde el cuadro siguiente, en el lugar donde está el
auto, sin volver a empezar el intento. Cambiar de pestaña MUST devolver el
volante.

#### Scenario: Devolver
- **WHEN** la persona deja el auto pegado a otro y elige "Devolver el volante"
- **THEN** la red maneja desde ahí, la decisión vuelve a una fila y el aviso de la escena desaparece

#### Scenario: Cambiar de pestaña
- **WHEN** la persona maneja, abre Competir y vuelve
- **THEN** maneja la red, y el auto sigue desde donde estaba

#### Scenario: Cambiar de cerebro
- **WHEN** la persona maneja y elige otro cerebro
- **THEN** el intento vuelve a empezar con el cerebro nuevo y sigue manejando la persona

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre "Devolver el volante"
- **THEN** un tooltip, en español y en inglés, dice que la red sigue manejando desde donde quedó el auto, para ver cómo sale de la situación
