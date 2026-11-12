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
