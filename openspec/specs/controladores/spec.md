# controladores Specification

## Purpose

Define la única forma en que algo maneja un auto: recibe lo que el auto percibe
y devuelve qué controles accionar. Una persona con el teclado, un programa o
una red neuronal son intercambiables porque todos cumplen este mismo contrato.

## Requirements

### Requirement: Contrato único de controlador
Todo controlador SHALL recibir en cada paso la percepción del auto y devolver
cuatro controles de tipo sí/no: avanzar, retroceder, izquierda y derecha. La
simulación MUST manejar el auto con cualquier controlador que cumpla el
contrato, sin tratar distinto a ninguno.

#### Scenario: Controlador automático mínimo
- **WHEN** se asigna al auto un controlador que siempre devuelve solo avanzar
- **THEN** el auto acelera en línea recta sin intervención de una persona

#### Scenario: Controladores intercambiables
- **WHEN** se reemplaza el controlador de un auto por otro que cumple el contrato y se reinicia la simulación
- **THEN** el auto pasa a ser manejado por el nuevo controlador sin ningún otro cambio

### Requirement: Contenido de la percepción
La percepción entregada al controlador SHALL contener las lecturas de los
sensores, en su orden estable, y la velocidad del auto expresada entre -1 y 1
respecto de su velocidad máxima de avance.

#### Scenario: Auto detenido en calle vacía
- **WHEN** el auto está detenido y ningún rayo detecta obstáculos
- **THEN** la percepción contiene una lectura 0 por cada rayo y velocidad 0

#### Scenario: Auto a velocidad máxima
- **WHEN** el auto avanza a su velocidad máxima
- **THEN** la velocidad en la percepción es 1

### Requirement: Controles contradictorios
Cuando un controlador acciona a la vez dos controles opuestos, la simulación
SHALL tratarlos como si ninguno de los dos estuviera accionado.

#### Scenario: Avanzar y retroceder juntos
- **WHEN** un controlador devuelve avanzar y retroceder a la vez
- **THEN** el auto no acelera en ningún sentido

#### Scenario: Izquierda y derecha juntas
- **WHEN** un controlador devuelve izquierda y derecha a la vez
- **THEN** el auto no gira

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

### Requirement: El teclado no interfiere con la página
El controlador de teclado MUST ignorar las teclas mientras la persona escribe
en un campo de texto, MUST evitar que las flechas desplacen la página mientras
se maneja y MUST soltar todos los controles cuando la ventana pierde el foco.

#### Scenario: Escribir en un campo
- **WHEN** la persona escribe la letra W dentro de un campo de texto
- **THEN** el auto no acelera

#### Scenario: Flechas sin desplazar la página
- **WHEN** la persona maneja con las flechas
- **THEN** la página no se desplaza

#### Scenario: Cambio de ventana con una tecla presionada
- **WHEN** la persona cambia a otra ventana mientras mantiene presionada la flecha arriba
- **THEN** el controlador deja de devolver avanzar

### Requirement: Controlador de red neuronal
El sistema SHALL ofrecer un controlador que maneja un auto con la red de un
cerebro, cumpliendo el contrato único: en cada paso entrega a la red las
lecturas de los sensores en su orden y la velocidad como última entrada, y
convierte las cuatro salidas en los controles avanzar, izquierda, derecha y
retroceder.

#### Scenario: Salidas convertidas en controles
- **WHEN** la red entrega las salidas 1, 0, 1 y 0
- **THEN** el controlador devuelve avanzar y derecha accionados, e izquierda y retroceder sin accionar

#### Scenario: Mismo trato que cualquier controlador
- **WHEN** se asigna un controlador de red neuronal a un auto
- **THEN** la simulación lo maneja igual que con el controlador de teclado, sin ningún cambio en el mundo

#### Scenario: Decisión repetible
- **WHEN** el controlador recibe dos veces la misma percepción
- **THEN** devuelve los mismos controles

### Requirement: Red que no corresponde a la percepción
Un controlador de red neuronal MUST rechazarse al crearse, explicando el
motivo, si la cantidad de entradas de la red no es la cantidad de sensores del
auto más uno. El rechazo SHALL ocurrir antes de empezar a manejar, nunca a
mitad de una simulación.

#### Scenario: Entradas de más
- **WHEN** se crea un controlador con una red de 10 entradas para un auto de 5 sensores
- **THEN** el controlador no se crea y se informa que la red espera 9 sensores y el auto tiene 5

### Requirement: Controlador de reglas
El sistema SHALL ofrecer un controlador que maneja un auto con un programa del
lenguaje de reglas, cumpliendo el contrato único: en cada paso ejecuta el
programa con la percepción recibida y devuelve los cuatro controles que el
programa acciona. El programa de un controlador SHALL poder reemplazarse en
marcha por otro programa válido.

#### Scenario: Programa convertido en controles
- **WHEN** el programa es `avanzar` más una regla que gira a la derecha y la condición de la regla se cumple
- **THEN** el controlador devuelve avanzar y derecha accionados, e izquierda y retroceder sin accionar

#### Scenario: Mismo trato que cualquier controlador
- **WHEN** se asigna un controlador de reglas a un auto
- **THEN** la simulación lo maneja igual que con el controlador de teclado o con el de red neuronal, sin ningún cambio en el mundo

#### Scenario: Decisión repetible
- **WHEN** el controlador recibe dos veces la misma percepción
- **THEN** devuelve los mismos controles

#### Scenario: Reemplazar el programa en marcha
- **WHEN** se reemplaza el programa de un controlador a mitad de una simulación
- **THEN** desde el paso siguiente el auto se maneja con el programa nuevo, sin reiniciar la simulación

#### Scenario: Sin programa válido
- **WHEN** un controlador de reglas todavía no recibió ningún programa válido
- **THEN** no acciona ningún control

### Requirement: Programa que no corresponde al auto
Un programa que nombra un sensor que el auto no tiene MUST rechazarse al
analizarse, antes de manejar, explicando cuántos sensores tiene el auto.

#### Scenario: Sensor de más
- **WHEN** se analiza para un auto de 5 sensores un programa que usa `sensor9`
- **THEN** el programa no se acepta y se informa que el auto tiene 5 sensores

### Requirement: Controlador con observador
El sistema SHALL ofrecer un controlador que combina dos: uno que maneja y otro
que observa. En cada cuadro, los dos reciben la misma percepción; el auto
recibe solo los controles del que maneja, y la decisión del que observa queda
disponible para mostrarla. El que observa MUST NOT influir en el auto.

#### Scenario: Maneja uno, observa otro
- **WHEN** maneja un controlador que siempre avanza y observa una red que, con esa percepción, decide doblar a la izquierda
- **THEN** el auto recibe solo avanzar, y la decisión disponible del observador es doblar a la izquierda

#### Scenario: Misma percepción
- **WHEN** pasa un cuadro
- **THEN** el observador recibió exactamente la percepción que recibió el que maneja

#### Scenario: Mismo recorrido
- **WHEN** se simula dos veces con la misma semilla el mismo controlador que maneja, una vez solo y otra con una red observando
- **THEN** el auto hace exactamente el mismo recorrido las dos veces

#### Scenario: Cambiar quién maneja
- **WHEN** a mitad de un intento el que observa pasa a manejar
- **THEN** desde el cuadro siguiente el auto recibe sus controles, sin volver a empezar el intento

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
