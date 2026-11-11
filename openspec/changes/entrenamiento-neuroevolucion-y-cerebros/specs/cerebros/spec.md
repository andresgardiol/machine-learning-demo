# Spec Delta

## Purpose

Convierte lo aprendido en algo que se puede guardar, nombrar, compartir y
volver a usar. Un cerebro es una red neuronal junto con los sensores para los
que fue entrenada y la historia de su entrenamiento; la biblioteca de cerebros
es común a toda la aplicación.

## ADDED Requirements

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
evolución usada, la velocidad máxima del auto, la semilla y la lista de
escenarios que vio (carriles, densidad, irregularidad y modo de tráfico) con
las generaciones entrenadas en cada uno.

#### Scenario: Dos escenarios
- **WHEN** un cerebro se entrena 30 generaciones en una calle de 3 carriles y luego 20 en una de 4 carriles
- **THEN** registra 50 generaciones en total y dos escenarios, con 30 y 20 generaciones

#### Scenario: Mismo escenario seguido
- **WHEN** un cerebro se entrena 10 generaciones, se guarda, se carga y se entrena 5 más en el mismo escenario
- **THEN** registra 15 generaciones y un solo escenario con 15 generaciones

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
La biblioteca SHALL mostrar de cada cerebro su nombre, su origen (incluido,
guardado o autoguardado), las generaciones entrenadas, la cantidad de sensores,
la forma de su red y su mejor fitness; y, al desplegarlo, el resto de sus datos
de entrenamiento, con los escenarios que vio.

#### Scenario: Resumen de un cerebro
- **WHEN** la biblioteca muestra un cerebro de 5 sensores, una capa oculta de 6 neuronas y 40 generaciones
- **THEN** se lee su nombre, su origen, "40 generaciones", "5 sensores", la forma "6-6-4" y su mejor fitness con su unidad

#### Scenario: Detalle de un cerebro
- **WHEN** la persona despliega un cerebro
- **THEN** ve la función de fitness, la configuración de evolución, la velocidad máxima del auto y cada escenario con sus generaciones

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
La biblioteca SHALL permitir eliminar un cerebro guardado solo después de una
confirmación explícita que nombre al cerebro.

#### Scenario: Confirmar
- **WHEN** la persona elige eliminar "Prudente" y confirma
- **THEN** "Prudente" desaparece de la biblioteca

#### Scenario: Cancelar
- **WHEN** la persona elige eliminar "Prudente" y cancela
- **THEN** "Prudente" sigue en la biblioteca sin cambios

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

### Requirement: Cerebros incluidos
La aplicación SHALL incluir al menos dos cerebros ya entrenados, rotulados como
incluidos: "Novato", con 2 generaciones de entrenamiento, y "Experto", capaz de
manejar 120 segundos simulados sin chocar en su escenario de entrenamiento. Los
cerebros incluidos MUST NOT poder eliminarse, renombrarse ni actualizarse.

#### Scenario: Disponibles sin haber entrenado
- **WHEN** una persona abre la biblioteca por primera vez
- **THEN** ve "Novato" y "Experto" rotulados como incluidos

#### Scenario: Experto en su escenario
- **WHEN** "Experto" maneja 120 segundos simulados en el escenario y el tráfico con los que fue entrenado
- **THEN** no choca

#### Scenario: Incluidos protegidos
- **WHEN** la persona mira las acciones de un cerebro incluido
- **THEN** eliminar y renombrar no están disponibles y un tooltip explica por qué

### Requirement: Autoguardado
Al terminar cada generación, la aplicación SHALL guardar sola el campeón del
entrenamiento en curso, reemplazando el autoguardado anterior de ese mismo
entrenamiento. Al empezar un entrenamiento nuevo, el último autoguardado del
entrenamiento que se abandona MUST conservarse como "entrenamiento anterior"
hasta que se empiece otro más.

#### Scenario: Recarga de la página
- **WHEN** la persona entrena 12 generaciones y recarga la página sin guardar
- **THEN** la biblioteca muestra un cerebro autoguardado con 12 generaciones

#### Scenario: Reinicio del entrenamiento
- **WHEN** la persona reinicia un entrenamiento de 30 generaciones y el nuevo completa su primera generación
- **THEN** la biblioteca muestra el autoguardado del entrenamiento en curso, con 1 generación, y el del entrenamiento anterior, con 30

#### Scenario: Conservar un autoguardado
- **WHEN** la persona guarda con nombre un cerebro autoguardado
- **THEN** pasa a ser un cerebro guardado que los entrenamientos siguientes no reemplazan

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
