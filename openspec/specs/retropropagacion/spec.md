# retropropagacion Specification

## Purpose
Define cómo una red aprende de un ejemplo: contesta, mide su error, reparte
la culpa hacia atrás y corrige cada peso. Es la cuenta real de
backpropagation, sin navegador, que el Laboratorio muestra paso a paso.

## Requirements

### Requirement: Respuesta suave
Para aprender, la red SHALL contestar con un número entre 0 y 1 en cada
salida, usando la sigmoide sobre el mismo total que usa al manejar. Una
salida mayor que 0,5 MUST corresponder exactamente a un "sí" de la red al
manejar. Las capas ocultas SHALL usar tanh, sigmoide o ReLU; el escalón MUST
rechazarse, porque no tiene pendiente.

#### Scenario: Misma decisión
- **WHEN** se comparan, en mil entradas al azar con semilla, la respuesta suave y la salida de la red al manejar
- **THEN** la respuesta es mayor que 0,5 exactamente cuando la red dice sí

#### Scenario: Escalón rechazado
- **WHEN** se pide aprender con una red de activación escalón
- **THEN** el pedido se rechaza con un error que lo explica

#### Scenario: Sin efectos
- **WHEN** se pide la respuesta de una red
- **THEN** la red no cambia

### Requirement: Error de un ejemplo
Para un ejemplo con su respuesta correcta, el aprendizaje SHALL informar el
error de cada salida, que es la respuesta menos la correcta, y una medida del
error del ejemplo que vale cero cuando la red acierta del todo y crece cuanto
más segura está de algo equivocado.

#### Scenario: Acierto
- **WHEN** la red contesta 0,98 y la respuesta correcta es 1
- **THEN** el error de esa salida es −0,02 y la medida del error es chica

#### Scenario: Equivocada y segura
- **WHEN** la red contesta 0,98 y la respuesta correcta es 0
- **THEN** el error de esa salida es 0,98 y la medida del error es mucho mayor que si hubiera contestado 0,6

### Requirement: Culpa de cada neurona
El aprendizaje SHALL calcular, de la última capa a la primera, la culpa de
cada neurona: en una salida, su error; en una neurona oculta, la suma de la
culpa de cada neurona siguiente por el peso que las une, por la pendiente de
su activación en el valor que tomó. SHALL informar cada término de esa cuenta.

#### Scenario: Culpa de una salida
- **WHEN** una salida contesta 0,8 y la correcta es 0
- **THEN** su culpa es 0,8

#### Scenario: Culpa de una neurona oculta
- **WHEN** una neurona oculta con tanh tomó el valor 0,6 y se une con peso 0,5 a una salida con culpa 0,8
- **THEN** su culpa es 0,8 por 0,5 por la pendiente de tanh en ese punto, que es 0,64: 0,256

#### Scenario: Neurona que no participó
- **WHEN** una neurona con ReLU quedó en cero
- **THEN** su culpa es cero y sus pesos de entrada no cambian con ese ejemplo

### Requirement: Corrección de los pesos
Cada peso SHALL corregirse restándole la tasa de aprendizaje por la culpa de
la neurona a la que llega por el valor que traía la conexión; cada sesgo,
restándole la tasa por la culpa de su neurona. El aprendizaje SHALL informar,
por peso, el valor anterior, la corrección y el valor nuevo, y SHALL poder
calcular la corrección sin aplicarla.

#### Scenario: Corregir un peso
- **WHEN** un peso vale 0,62, la tasa es 0,3, la culpa de su neurona es 0,2 y la conexión traía 0,5
- **THEN** la corrección es −0,03 y el peso pasa a 0,59

#### Scenario: Entrada en cero
- **WHEN** la conexión traía 0
- **THEN** el peso no cambia

#### Scenario: Tasa cero
- **WHEN** la tasa de aprendizaje es 0
- **THEN** ningún peso cambia

#### Scenario: Ver sin aplicar
- **WHEN** se pide la corrección de un ejemplo sin aplicarla
- **THEN** la red no cambia

### Requirement: La corrección achica el error
La corrección calculada MUST ser la que achica el error: SHALL coincidir con
la que se obtiene moviendo cada peso un poquito y midiendo cuánto cambia el
error.

#### Scenario: Comprobación con números
- **WHEN** se compara, peso por peso, la corrección calculada con la medida moviendo ese peso una millonésima, en redes de cero a tres capas ocultas y con las tres activaciones
- **THEN** coinciden con una diferencia relativa menor que una milésima

#### Scenario: Un paso mejora
- **WHEN** se corrige con un ejemplo y una tasa chica y se vuelve a medir el error de ese ejemplo
- **THEN** el error es menor que antes

### Requirement: Una época
Una época SHALL corregir la red una vez con cada ejemplo de práctica, de a
uno, en un orden mezclado con semilla, e informar el error medio y el
porcentaje de aciertos sobre los ejemplos de práctica y sobre los apartados.
Los ejemplos apartados MUST NOT corregir la red.

#### Scenario: Orden reproducible
- **WHEN** se entrena dos veces con los mismos datos, la misma red inicial, la misma tasa y la misma semilla
- **THEN** la red queda idéntica peso por peso después de cada época

#### Scenario: Los apartados no enseñan
- **WHEN** se cambian los ejemplos apartados por otros
- **THEN** la red aprende exactamente lo mismo

#### Scenario: Acierto de un ejemplo
- **WHEN** todas las salidas de un ejemplo quedan del lado correcto de 0,5
- **THEN** el ejemplo cuenta como acierto

### Requirement: Recorrido paso a paso del aprendizaje
El aprendizaje de un ejemplo SHALL poder recorrerse en cuatro fases, en
orden: ida, error, vuelta y corrección. La vuelta y la corrección se recorren
capa por capa de la última a la primera, y neurona por neurona. SHALL poder
avanzarse de a una neurona, una capa, una fase, un ejemplo o una época, y
saberse en todo momento qué está hecho.

#### Scenario: De a una fase
- **WHEN** se avanza una fase desde el principio de un ejemplo
- **THEN** queda hecha la ida entera y nada más

#### Scenario: De a una neurona en la vuelta
- **WHEN** se avanza una neurona durante la vuelta
- **THEN** queda calculada la culpa de una neurona más, empezando por las salidas

#### Scenario: De a un ejemplo
- **WHEN** se avanza un ejemplo con uno a medio hacer
- **THEN** se completan sus fases y la red queda corregida con él

#### Scenario: Paso a paso igual que de corrido
- **WHEN** se recorre una época entera de a una neurona
- **THEN** la red queda idéntica a la que deja la misma época hecha de corrido

#### Scenario: Sin navegador
- **WHEN** se entrena y se recorre paso a paso en un entorno sin DOM
- **THEN** funciona y da los mismos resultados

### Requirement: Aprender con partes apagadas
La cuenta de aprender SHALL aceptar neuronas de entrada u ocultas y conexiones
apagadas. Una neurona apagada vale cero y no recibe culpa; una conexión
apagada no aporta a la suma ni lleva culpa hacia atrás. Lo apagado MUST NOT
corregirse: los pesos que entran a una neurona apagada, su sesgo y el peso de
una conexión apagada quedan como estaban. Sin nada apagado, el resultado MUST
ser idéntico al de la cuenta sin esta opción.

#### Scenario: Neurona oculta apagada
- **WHEN** una neurona oculta está apagada y la red aprende de un ejemplo
- **THEN** su valor es cero, su culpa es cero, y no cambian sus pesos de entrada, su sesgo ni los pesos que salen de ella

#### Scenario: Entrada apagada
- **WHEN** una entrada está apagada
- **THEN** la red calcula como si esa entrada valiera cero y los pesos que salen de ella no cambian

#### Scenario: Conexión apagada
- **WHEN** una conexión está apagada
- **THEN** no aporta a la suma de su neurona, no lleva culpa hacia atrás y su peso no cambia

#### Scenario: La corrección sigue achicando el error
- **WHEN** se compara, con partes apagadas, la pendiente calculada de cada peso no apagado con la medida por diferencias finitas
- **THEN** coinciden con la misma tolerancia que sin nada apagado

#### Scenario: Sin nada apagado
- **WHEN** no hay nada apagado
- **THEN** cada valor, cada culpa y cada corrección es idéntico al de la cuenta de antes

#### Scenario: Salida apagada
- **WHEN** se pide apagar una neurona de salida
- **THEN** la cuenta lo rechaza con un error que lo dice

### Requirement: Cambios a mano durante el aprendizaje
El recorrido del aprendizaje SHALL permitir, en cualquier momento, cambiar un
peso o un sesgo y apagar o encender una neurona o una conexión. Si hay un
ejemplo a medio recorrer, ese ejemplo MUST volver a empezar desde la ida con
la red cambiada. El recorrido SHALL poder entregar una copia de la red con lo
apagado y volver a ella después, sin cambiar la época ni la historia de
errores.

#### Scenario: Cambio entre dos ejemplos
- **WHEN** se cambia un peso entre un ejemplo y el siguiente
- **THEN** el ejemplo siguiente se calcula y se corrige con el peso nuevo

#### Scenario: Cambio a mitad de un ejemplo
- **WHEN** se cambia un peso con un ejemplo en la fase de la vuelta
- **THEN** ese mismo ejemplo vuelve a la ida, calculado con el peso nuevo, y ninguna corrección del recorrido anterior se aplica

#### Scenario: Volver a una copia
- **WHEN** se guarda una copia, se hacen cambios, se aprenden diez épocas y se vuelve a la copia
- **THEN** los pesos, los sesgos y lo apagado son los de la copia, y la época y la historia de errores siguen donde estaban

#### Scenario: Valor que no es un número
- **WHEN** se pide poner en un peso un valor que no es un número finito
- **THEN** el recorrido lo rechaza y la red no cambia

#### Scenario: Mismo resultado
- **WHEN** se repiten los mismos cambios en los mismos momentos sobre la misma red, los mismos datos y la misma semilla
- **THEN** la red y la historia de errores terminan idénticas
