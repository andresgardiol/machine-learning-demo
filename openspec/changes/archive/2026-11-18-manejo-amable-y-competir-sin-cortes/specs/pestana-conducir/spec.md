## MODIFIED Requirements

### Requirement: Acción visible
El tablero SHALL mostrar, en una tarjeta, cuatro indicadores, uno por control
(avanzar, retroceder, izquierda, derecha), que se resaltan mientras ese
control está accionado. Izquierda y derecha SHALL mostrar además el nivel del volante suave, de 0 a 100 %, con un relleno proporcional y su número, sin destellar cuando el controlador reparte el giro entre cuadros. Un tooltip SHALL explicar que el giro crece mientras se mantiene la flecha.

#### Scenario: Presionar una tecla
- **WHEN** la persona mantiene presionada la flecha izquierda
- **THEN** el indicador de izquierda se llena de a poco hasta el 100 % en 0,3 s y vuelve a su estado normal al soltarla

#### Scenario: Avanzar
- **WHEN** la persona mantiene presionada la flecha arriba
- **THEN** el indicador de avanzar se resalta entero mientras la mantiene

#### Scenario: Percepción y acción a la vez
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** las tarjetas de percepción y de acción se ven completas a la vez, junto al escenario

## ADDED Requirements

### Requirement: Cinta del manejo
Debajo de la acción, el tablero SHALL mostrar la cinta del manejo: los últimos 10 segundos, una columna por cuadro, con una fila por sensor y la de la velocidad (intensidad según la lectura, con el color de lo que entra) y las cuatro acciones (llenas en los cuadros en que estuvieron accionadas, con el color de lo que sale). La cinta SHALL detenerse en pausa, congelarse al chocar con una marca en el cuadro del choque, y vaciarse al reiniciar. Con la guía activa, una línea SHALL decir que cada columna es un instante y que con datos así una red aprende a imitar, en español y en inglés. La cinta SHALL tener un nombre accesible y un tooltip.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña y la persona todavía no manejó
- **THEN** la cinta está vacía, con las filas rotuladas, ocupando el alto que deja libre la acción

#### Scenario: Manejar
- **WHEN** la persona avanza y dobla a la izquierda durante 3 segundos
- **THEN** la cinta muestra, cuadro por cuadro, las lecturas de los sensores y la velocidad arriba, y avanzar e izquierda encendidos abajo en los cuadros en que estuvieron accionados

#### Scenario: Choque
- **WHEN** el auto choca
- **THEN** la cinta deja de avanzar y una marca en su última columna dice que ahí chocó

#### Scenario: Reiniciar
- **WHEN** la persona reinicia el intento
- **THEN** la cinta se vacía y vuelve a llenarse desde el primer cuadro del intento nuevo

#### Scenario: Muchos sensores
- **WHEN** el auto tiene 30 sensores
- **THEN** la cinta muestra las 30 filas sin nombre, repartiéndose el alto, y las cuatro acciones conservan su alto

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** la línea que explica la cinta no se ve y la cinta sigue a la vista

#### Scenario: Pantalla de 1366×768
- **WHEN** se abre la pestaña con la ventana en 1366×768
- **THEN** la cinta mide al menos 80 píxeles de alto y el tablero no se desplaza

#### Scenario: Fluidez
- **WHEN** la persona maneja con la cinta a la vista
- **THEN** la pestaña sigue a 60 cuadros por segundo

### Requirement: Cartel de primer manejo
Con la guía activa, al entrar a la pestaña, la escena SHALL mostrar un cartel centrado, con el estilo del cartel de largada de Competir, que dice qué teclas manejan (en español y en inglés). Sin botón y sin tomar el foco. El cartel SHALL irse con la primera tecla de manejo y volver en la próxima visita a la pestaña.

#### Scenario: Al entrar
- **WHEN** la persona entra a El problema con la guía activa
- **THEN** sobre la escena se lee que la flecha arriba avanza y las de los costados doblan

#### Scenario: Primera tecla
- **WHEN** la persona aprieta la flecha arriba
- **THEN** el cartel desaparece y el auto empieza a avanzar en el mismo cuadro

#### Scenario: Reiniciar no lo trae
- **WHEN** la persona choca y reinicia
- **THEN** el cartel no vuelve

#### Scenario: Otra visita
- **WHEN** la persona pasa a otra pestaña y vuelve
- **THEN** el cartel se ve otra vez hasta la primera tecla

#### Scenario: Guía oculta
- **WHEN** la guía está apagada
- **THEN** el cartel no se ve y el manejo es el mismo
