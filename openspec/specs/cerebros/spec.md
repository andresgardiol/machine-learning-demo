# cerebros Specification

## Purpose

Convierte lo aprendido en algo que se puede guardar, nombrar, compartir y
volver a usar. Un cerebro es una red neuronal junto con los sensores para los
que fue entrenada y la historia de su entrenamiento; la biblioteca de cerebros
es común a toda la aplicación.

## Requirements

### Requirement: Contenido de un cerebro
Un cerebro SHALL contener una red neuronal completa, la configuración de
sensores para la que fue entrenada (cantidad, alcance y apertura), sus datos de
entrenamiento, un nombre, un identificador único y sus fechas de creación y de
última modificación.

#### Scenario: Cerebro recién guardado
- **WHEN** se guarda el campeón de un entrenamiento con 7 sensores
- **THEN** el cerebro contiene todos los pesos y sesgos de la red, la configuración de los 7 sensores, sus datos de entrenamiento, su nombre, un identificador y la fecha

### Requirement: Entradas y salidas de un cerebro
La red de un cerebro SHALL tener una entrada por sensor, en el orden de los
rayos de izquierda a derecha, más una última entrada con la velocidad del auto;
y cuatro salidas, en este orden: avanzar, izquierda, derecha y retroceder.

#### Scenario: Cinco sensores
- **WHEN** se crea un cerebro para un auto de 5 sensores
- **THEN** su red tiene 6 entradas y 4 salidas

### Requirement: Datos de entrenamiento
Un cerebro SHALL registrar cuántas generaciones se entrenó en total, la función
de fitness y el mejor fitness de su última generación, la configuración de
evolución usada, incluido el modo de selección, la velocidad máxima del auto,
la semilla y la lista de escenarios que vio (carriles, densidad, irregularidad
y modo de tráfico) con las generaciones entrenadas en cada uno. Un cerebro que
no registra el modo de selección MUST considerarse de selección automática.

#### Scenario: Dos escenarios
- **WHEN** un cerebro se entrena 30 generaciones en una calle de 3 carriles y luego 20 en una de 4 carriles
- **THEN** registra 50 generaciones en total y dos escenarios, con 30 y 20 generaciones

#### Scenario: Mismo escenario seguido
- **WHEN** un cerebro se entrena 10 generaciones, se guarda, se carga y se entrena 5 más en el mismo escenario
- **THEN** registra 15 generaciones y un solo escenario con 15 generaciones

#### Scenario: Cerebro elegido a mano
- **WHEN** se guarda al padre elegido de un entrenamiento con selección manual y la persona despliega ese cerebro en la biblioteca
- **THEN** entre sus datos se lee que la selección fue manual, y su mejor fitness es el que llevaba cuando se lo eligió

#### Scenario: Cerebro guardado antes de este cambio
- **WHEN** la persona despliega o importa un cerebro que no registra el modo de selección
- **THEN** el cerebro es válido y se muestra como de selección automática

### Requirement: Compatibilidad con el auto
Un cerebro SHALL manejar siempre con su propia configuración de sensores. Un
cerebro MUST rechazarse, explicando el motivo, cuando la cantidad de entradas
de su red no es la cantidad de sensores más uno o sus salidas no son cuatro.

#### Scenario: Cerebro coherente
- **WHEN** se asigna a un auto un cerebro de 9 sensores
- **THEN** el auto pasa a tener 9 sensores con el alcance y la apertura del cerebro

#### Scenario: Cerebro incoherente
- **WHEN** se intenta usar un cerebro que declara 5 sensores y cuya red tiene 8 entradas
- **THEN** el cerebro se rechaza indicando que sus entradas no coinciden con sus sensores

### Requirement: Validación de un cerebro
Antes de usarse o guardarse, un cerebro MUST validarse. Un cerebro al que le
faltan partes, con una cantidad de pesos o sesgos que no corresponde a su
forma, con valores que no son números finitos o de una versión de formato no
admitida SHALL rechazarse indicando cuál es el problema.

#### Scenario: Pesos faltantes
- **WHEN** se valida un cerebro al que le falta un peso en una capa
- **THEN** se rechaza indicando que la cantidad de pesos no corresponde a la forma de la red

#### Scenario: Valor no numérico
- **WHEN** se valida un cerebro con un sesgo que no es un número finito
- **THEN** se rechaza indicando que contiene valores que no son números

#### Scenario: Versión no admitida
- **WHEN** se valida un cerebro de una versión de formato más nueva que la admitida
- **THEN** se rechaza indicando que fue creado con una versión más nueva de la aplicación

### Requirement: Nombre propio
Todo cerebro guardado SHALL tener un nombre de 1 a 40 caracteres, sin espacios
al principio ni al final. La aplicación SHALL sugerir un nombre ("Cerebro" y un
número). Si el nombre ya existe en la biblioteca, MUST agregarse un número
entre paréntesis para distinguirlo.

#### Scenario: Nombre sugerido
- **WHEN** la persona guarda un cerebro sin escribir un nombre y ya existe "Cerebro 1"
- **THEN** el cerebro se guarda como "Cerebro 2"

#### Scenario: Nombre repetido
- **WHEN** la persona guarda un cerebro con el nombre "Rayo" y ya existe uno llamado "Rayo"
- **THEN** el cerebro se guarda como "Rayo (2)"

#### Scenario: Nombre demasiado largo
- **WHEN** la persona escribe un nombre de más de 40 caracteres
- **THEN** el nombre queda limitado a 40 caracteres

### Requirement: Biblioteca recordada
Los cerebros guardados SHALL conservarse entre visitas en el mismo navegador y
listarse del más reciente al más antiguo. Si el navegador no permite guardar,
la biblioteca MUST seguir funcionando durante la visita y avisar que los
cerebros no se conservarán, sugiriendo exportarlos.

#### Scenario: Segunda visita
- **WHEN** la persona guarda dos cerebros y vuelve a abrir la aplicación en el mismo navegador
- **THEN** los dos cerebros están en la biblioteca, primero el más reciente

#### Scenario: Navegador sin almacenamiento
- **WHEN** el navegador impide guardar y la persona guarda un cerebro
- **THEN** el cerebro aparece en la biblioteca, se puede usar y exportar, y un aviso explica que se perderá al cerrar la página

#### Scenario: Espacio agotado
- **WHEN** el navegador no tiene más espacio al guardar un cerebro
- **THEN** un mensaje explica que no hay espacio y sugiere exportar o eliminar cerebros, y los cerebros ya guardados quedan intactos

### Requirement: Lista de cerebros
La biblioteca SHALL mostrar de cada cerebro su nombre, su origen (guardado o
autoguardado), sus generaciones, su cantidad de sensores, la forma de su red y
su mejor fitness; y, al desplegarlo, el resto de sus datos de entrenamiento,
con los escenarios que vio. Un autoguardado SHALL llamarse "Entrenamiento en
curso" o "Entrenamiento anterior", en el idioma activo, con la etiqueta
"Autoguardado". Un nombre MUST NOT partirse en medio de una palabra que entre
en el ancho de la lista.

#### Scenario: Resumen de un cerebro
- **WHEN** la biblioteca muestra un cerebro de 5 sensores, una capa oculta de 6 neuronas y 40 generaciones
- **THEN** se lee su nombre, su origen, "40 generaciones", "5 sensores", la forma "6-6-4" y su mejor fitness con su unidad

#### Scenario: Detalle de un cerebro
- **WHEN** la persona despliega un cerebro
- **THEN** ve la función de fitness, la configuración de evolución, la velocidad máxima del auto y cada escenario con sus generaciones

#### Scenario: Autoguardado del entrenamiento en curso
- **WHEN** la biblioteca muestra el autoguardado del entrenamiento en curso con el panel en 360 píxeles de ancho
- **THEN** se lee "Entrenamiento en curso" sin partir ninguna palabra y la etiqueta "Autoguardado", sin repetir esa palabra en el nombre

#### Scenario: Autoguardado del entrenamiento anterior
- **WHEN** la biblioteca muestra el autoguardado del entrenamiento que se abandonó
- **THEN** se lee "Entrenamiento anterior" y la etiqueta "Autoguardado"

#### Scenario: Autoguardados en inglés
- **WHEN** la persona cambia el idioma a inglés con los dos autoguardados en la lista
- **THEN** sus nombres y su etiqueta pasan a leerse en inglés sin recargar la página

#### Scenario: Nombre largo
- **WHEN** un cerebro guardado se llama "Prudente con tráfico nuevo y cuatro carriles" y el panel mide 300 píxeles de ancho
- **THEN** el nombre ocupa más de un renglón cortando entre palabras y la etiqueta de origen sigue completa

### Requirement: Renombrar
La biblioteca SHALL permitir cambiar el nombre de un cerebro guardado, con las
mismas reglas de nombre que al guardar.

#### Scenario: Cambiar el nombre
- **WHEN** la persona renombra "Cerebro 1" como "Prudente"
- **THEN** la biblioteca muestra "Prudente" y el cerebro conserva su red y sus datos

#### Scenario: Cancelar el cambio
- **WHEN** la persona empieza a renombrar un cerebro y presiona Escape
- **THEN** el cerebro conserva su nombre anterior

### Requirement: Eliminar con confirmación
La biblioteca SHALL permitir eliminar cualquier cerebro, guardado o
autoguardado, solo después de una confirmación explícita que lo nombre. Nada
de la biblioteca MUST quedar sin poder eliminarse.

#### Scenario: Confirmar
- **WHEN** la persona elige eliminar "Prudente" y confirma
- **THEN** "Prudente" desaparece de la biblioteca

#### Scenario: Cancelar
- **WHEN** la persona elige eliminar "Prudente" y cancela
- **THEN** "Prudente" sigue en la biblioteca sin cambios

#### Scenario: Eliminar el entrenamiento anterior
- **WHEN** la persona elige eliminar el autoguardado "entrenamiento anterior" y confirma
- **THEN** desaparece de la biblioteca y no vuelve a aparecer hasta que se abandone otro entrenamiento

#### Scenario: Eliminar el entrenamiento en curso
- **WHEN** la persona elige eliminar el autoguardado del entrenamiento en curso
- **THEN** la confirmación avisa que volverá a guardarse solo al terminar la próxima generación; al confirmar desaparece, y reaparece cuando esa generación termina

#### Scenario: Biblioteca vacía
- **WHEN** la persona elimina todos los cerebros, guardados y autoguardados, con el entrenamiento en pausa
- **THEN** la biblioteca queda vacía, muestra el texto de biblioteca vacía y el contador de la pestaña de cerebros dice 0

### Requirement: Actualizar un cerebro guardado
Cuando un entrenamiento continúa desde un cerebro guardado, la aplicación SHALL
ofrecer dos formas de guardar su campeón: actualizar ese cerebro, conservando
su nombre e identificador, o guardarlo como un cerebro nuevo.

#### Scenario: Actualizar
- **WHEN** la persona continúa el entrenamiento de "Prudente" y elige actualizarlo
- **THEN** "Prudente" pasa a tener la red nueva y sus generaciones acumuladas, y no aparece un cerebro adicional

#### Scenario: Guardar como nuevo
- **WHEN** la persona continúa el entrenamiento de "Prudente" y elige guardar como nuevo con el nombre "Audaz"
- **THEN** la biblioteca tiene "Prudente" sin cambios y además "Audaz"

### Requirement: Exportar
La biblioteca SHALL permitir descargar cualquier cerebro como un archivo que
lleva su nombre y contiene todo su contenido.

#### Scenario: Descargar un cerebro
- **WHEN** la persona exporta "Prudente"
- **THEN** el navegador descarga un archivo cuyo nombre deriva de "Prudente" y que contiene la red, los sensores y los datos de entrenamiento

### Requirement: Importar
La biblioteca SHALL permitir agregar un cerebro desde un archivo exportado. La
importación MUST validar el archivo, MUST NOT reemplazar ningún cerebro
existente y, ante un archivo inválido, SHALL explicar el problema en lenguaje
llano y dejar la biblioteca como estaba.

#### Scenario: Ida y vuelta
- **WHEN** la persona exporta un cerebro, lo elimina y luego importa el archivo
- **THEN** el cerebro vuelve a la biblioteca con la misma red, los mismos sensores y los mismos datos de entrenamiento

#### Scenario: Cerebro que ya existe
- **WHEN** la persona importa el archivo de un cerebro que sigue en la biblioteca
- **THEN** se agrega como un cerebro aparte, con un número entre paréntesis en el nombre, y el original no cambia

#### Scenario: Archivo que no es un cerebro
- **WHEN** la persona importa un archivo que no es un cerebro exportado
- **THEN** un mensaje explica que el archivo no es un cerebro del laboratorio y la biblioteca no cambia

#### Scenario: Archivo dañado
- **WHEN** la persona importa un cerebro con pesos faltantes
- **THEN** un mensaje explica que el archivo está dañado o incompleto y la biblioteca no cambia

### Requirement: Autoguardado
Al terminar cada generación, la aplicación SHALL guardar sola el cerebro del
entrenamiento en curso (el campeón o, con selección manual, el padre elegido),
reemplazando el autoguardado anterior de ese mismo entrenamiento. Al empezar
un entrenamiento nuevo, el último autoguardado del entrenamiento que se
abandona MUST conservarse como "entrenamiento anterior" hasta que se empiece
otro más.

#### Scenario: Recarga de la página
- **WHEN** la persona entrena 12 generaciones y recarga la página sin guardar
- **THEN** la biblioteca muestra un cerebro autoguardado con 12 generaciones

#### Scenario: Reinicio del entrenamiento
- **WHEN** la persona reinicia un entrenamiento de 30 generaciones y el nuevo completa su primera generación
- **THEN** la biblioteca muestra el autoguardado del entrenamiento en curso, con 1 generación, y el del entrenamiento anterior, con 30

#### Scenario: Conservar un autoguardado
- **WHEN** la persona guarda con nombre un cerebro autoguardado
- **THEN** pasa a ser un cerebro guardado que los entrenamientos siguientes no reemplazan

#### Scenario: Autoguardado con selección manual
- **WHEN** termina una generación con selección manual y un padre elegido
- **THEN** el autoguardado del entrenamiento en curso tiene la red del padre elegido

#### Scenario: Selección manual sin padre
- **WHEN** termina una generación con selección manual y sin padre elegido
- **THEN** el autoguardado que hubiera de ese entrenamiento queda como estaba

### Requirement: Controles de la biblioteca explicados
Cada control de la biblioteca (guardar, actualizar, importar, exportar,
renombrar, eliminar, seguir entrenando y desplegar) SHALL tener un tooltip que
diga qué hace y por qué importa, y todos sus textos y mensajes SHALL estar en
español y en inglés.

#### Scenario: Tooltip de exportar
- **WHEN** la persona posa el cursor sobre exportar
- **THEN** un tooltip en el idioma activo explica que descarga el cerebro como archivo y que sirve para conservarlo o compartirlo

#### Scenario: Biblioteca en inglés
- **WHEN** la aplicación está en inglés
- **THEN** los rótulos, resúmenes, confirmaciones y mensajes de error de la biblioteca se muestran en inglés

### Requirement: Pistas en los datos de entrenamiento
Cada escenario de los datos de entrenamiento de un cerebro SHALL registrar en
qué pista o pistas corrieron sus generaciones. Un cerebro guardado antes de
existir los circuitos MUST seguir siendo válido y leerse como entrenado en la
calle recta. Los datos de un cerebro en la biblioteca SHALL nombrar esas
pistas en el idioma activo.

#### Scenario: Entrenado en un circuito
- **WHEN** se guarda el campeón de un entrenamiento de 30 generaciones en el óvalo
- **THEN** sus datos dicen que se entrenó 30 generaciones en el óvalo

#### Scenario: Entrenado en varias pistas
- **WHEN** se guarda el campeón de un entrenamiento de 40 generaciones que alternó la calle recta y el riñón
- **THEN** sus datos dicen que se entrenó 40 generaciones alternando la calle recta y el riñón

#### Scenario: Cerebro anterior
- **WHEN** se abre la biblioteca con un cerebro guardado antes de este cambio
- **THEN** el cerebro es válido y sus datos dicen que se entrenó en la calle recta

#### Scenario: Cambio de pistas a mitad de camino
- **WHEN** un entrenamiento corre 20 generaciones en la calle recta y después 10 en el óvalo
- **THEN** los datos del cerebro tienen dos escenarios, en ese orden, con 20 y 10 generaciones

#### Scenario: Exportar e importar
- **WHEN** se exporta un cerebro entrenado en el gran premio y se lo vuelve a importar
- **THEN** conserva la pista en sus datos
