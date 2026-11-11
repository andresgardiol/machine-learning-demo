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
teclas a la vez.

#### Scenario: Flecha arriba
- **WHEN** la persona mantiene presionada la flecha arriba o la tecla W
- **THEN** el controlador devuelve avanzar

#### Scenario: Dos teclas a la vez
- **WHEN** la persona mantiene presionadas la flecha arriba y la flecha izquierda
- **THEN** el controlador devuelve avanzar e izquierda

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
