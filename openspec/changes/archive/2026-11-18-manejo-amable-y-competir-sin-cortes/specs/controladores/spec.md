## MODIFIED Requirements

### Requirement: Controlador de teclado
El sistema SHALL ofrecer un controlador que permite a una persona manejar con
las flechas del teclado y también con las teclas W, A, S y D, admitiendo varias
teclas a la vez. Avanzar y retroceder se devuelven mientras su tecla está apretada; izquierda y derecha pasan por el volante suave (ver *Volante suave*).

#### Scenario: Flecha arriba
- **WHEN** la persona mantiene presionada la flecha arriba o la tecla W
- **THEN** el controlador devuelve avanzar

#### Scenario: Dos teclas a la vez
- **WHEN** la persona mantiene presionadas la flecha arriba y la flecha izquierda durante medio segundo
- **THEN** el controlador devuelve avanzar en todos los cuadros, e izquierda en todos los cuadros desde que el volante llegó al máximo

#### Scenario: Soltar la tecla
- **WHEN** la persona suelta todas las teclas
- **THEN** el controlador no devuelve ningún control accionado

## ADDED Requirements

### Requirement: Volante suave
Mientras la persona mantiene la flecha izquierda o la derecha, el controlador de teclado SHALL llevar un nivel de giro para ese lado que sube de 0 a 1 en 18 cuadros de simulación (0,3 s), y devolver ese lado en una parte de los cuadros igual al nivel, repartida con un acumulador. Al soltar la flecha, el nivel y el acumulador SHALL volver a 0 en el mismo cuadro. Los controles que devuelve MUST seguir siendo de sí o no: el núcleo y los demás controladores no cambian. El nivel solo avanza cuando la simulación consulta al controlador.

#### Scenario: Toque corto
- **WHEN** la persona aprieta la flecha izquierda durante 6 cuadros
- **THEN** el controlador devuelve izquierda en uno o dos de esos cuadros, y el auto gira mucho menos que si la devolviera en los seis

#### Scenario: Mantener apretada
- **WHEN** la persona mantiene la flecha derecha durante 1 segundo
- **THEN** desde el cuadro 18 el controlador devuelve derecha en todos los cuadros, como sin volante suave

#### Scenario: Soltar
- **WHEN** la persona suelta la flecha izquierda
- **THEN** en ese mismo cuadro el controlador deja de devolver izquierda, y si la vuelve a apretar el nivel empieza otra vez de 0

#### Scenario: En pausa
- **WHEN** la simulación está en pausa y la persona mantiene una flecha
- **THEN** el nivel no sube

#### Scenario: Determinismo
- **WHEN** la misma secuencia de teclas, cuadro por cuadro, se repite con la misma semilla
- **THEN** el controlador devuelve los mismos controles y el auto hace lo mismo

#### Scenario: Otros controladores
- **WHEN** maneja un cerebro o un programa de reglas
- **THEN** el auto hace exactamente lo mismo que antes de este cambio

#### Scenario: Lo grabado es lo que hizo el auto
- **WHEN** la persona graba su manejo en el Laboratorio con un toque corto de izquierda
- **THEN** los ejemplos grabados dicen izquierda solo en los cuadros en que el controlador la devolvió
