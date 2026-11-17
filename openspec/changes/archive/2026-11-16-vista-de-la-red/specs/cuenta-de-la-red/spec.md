# Spec Delta

## ADDED Requirements

### Requirement: De dónde viene lo que recibe una neurona
Para una cuenta ya hecha y una neurona, SHALL poder obtenerse cuánto aporta
cada conexión de las capas anteriores a lo que esa neurona recibe: en cada
neurona del camino, su importancia se reparte entre sus conexiones de entrada
según el tamaño de su producto, sin el signo. Si todos los productos son
cero, se reparte según el tamaño de los pesos. Sin DOM y reproducible.

#### Scenario: Una sola capa atrás
- **WHEN** una neurona recibe productos 0,6, −0,3 y 0,1
- **THEN** sus tres conexiones tienen importancia 0,6, 0,3 y 0,1

#### Scenario: Dos capas atrás
- **WHEN** la conexión que entra a la neurona elegida tiene importancia 0,5 y su neurona de origen recibe dos productos iguales
- **THEN** cada una de esas dos conexiones tiene importancia 0,25

#### Scenario: Sin señal
- **WHEN** todos los productos que recibe una neurona del camino valen cero
- **THEN** su importancia se reparte según el tamaño de sus pesos

#### Scenario: Límite por neurona
- **WHEN** se pide seguir solo la conexión más importante de cada neurona
- **THEN** el resultado es un solo camino hasta una entrada, y en un empate gana la entrada que está más arriba

#### Scenario: Con partes apagadas
- **WHEN** una conexión o una neurona del camino está apagada
- **THEN** su importancia es cero y el camino no sigue por ahí

#### Scenario: Mismo resultado
- **WHEN** se pide dos veces con la misma cuenta y la misma neurona
- **THEN** el resultado es idéntico

### Requirement: Respuesta de una neurona a una entrada
Para una red, unas entradas y una neurona, SHALL poder obtenerse la suma y la
salida de esa neurona para cada valor de una entrada elegida a lo largo de su
rango, con las demás entradas como están. Vale para redes con escalón y para
las que aprenden, y tiene en cuenta los cambios de prueba y lo apagado. El
punto de las entradas de ahora MUST coincidir con la cuenta real. Sin DOM.

#### Scenario: Primera capa
- **WHEN** se pide la respuesta de una neurona de la primera capa oculta a una entrada con peso 0,4
- **THEN** la suma crece 0,4 cuando la entrada va de 0 a 1, en línea recta

#### Scenario: Coincide con la cuenta
- **WHEN** se compara el valor de la curva en la entrada de ahora con la suma que da la cuenta de la red
- **THEN** son el mismo número

#### Scenario: Salida con escalones
- **WHEN** se pide la respuesta de una salida de una red con escalón y una capa oculta
- **THEN** la suma cambia solo en los valores de la entrada donde una neurona oculta pasa de 0 a 1 o de 1 a 0

#### Scenario: Entrada apagada
- **WHEN** la entrada elegida está apagada
- **THEN** la respuesta es la misma para todos sus valores

#### Scenario: Con un peso cambiado
- **WHEN** hay un cambio de prueba en el peso de esa conexión
- **THEN** la curva usa el peso cambiado

#### Scenario: Mismo resultado
- **WHEN** se pide dos veces con la misma red y las mismas entradas
- **THEN** el resultado es idéntico

