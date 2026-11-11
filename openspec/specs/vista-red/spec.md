# vista-red Specification

## Purpose

Muestra una red neuronal como lo que es: capas de neuronas unidas por
conexiones con un peso cada una. Permite ver de un vistazo la forma de la red,
qué conexiones pesan más y qué neuronas se activan mientras el auto maneja. Es
la base visual del inspector de redes.

## Requirements

### Requirement: Diagrama por capas
El diagrama SHALL mostrar las capas de la red como columnas ordenadas de
izquierda a derecha (entradas, capas ocultas, salidas), con un nodo por neurona
y una línea por cada conexión entre capas consecutivas.

#### Scenario: Red con una capa oculta
- **WHEN** se muestra una red de 6 entradas, 6 neuronas ocultas y 4 salidas
- **THEN** se ven tres columnas con 6, 6 y 4 nodos, 36 líneas entre las dos primeras y 24 entre las dos últimas

#### Scenario: Cambio de forma
- **WHEN** la red mostrada pasa a tener dos capas ocultas
- **THEN** el diagrama pasa a tener cuatro columnas de inmediato

### Requirement: Entradas y salidas con nombre
El diagrama SHALL rotular las entradas (cada sensor, numerado de izquierda a
derecha, y la velocidad) y las salidas (avanzar, izquierda, derecha y
retroceder), en el idioma activo.

#### Scenario: Rótulos
- **WHEN** se muestra la red de un auto de 5 sensores
- **THEN** las entradas se leen como los sensores 1 a 5 y la velocidad, y las salidas como los cuatro controles

#### Scenario: Muchas entradas
- **WHEN** se muestra la red de un auto de 60 sensores
- **THEN** los rótulos de los sensores se resumen para no superponerse, y la velocidad y las cuatro salidas conservan su rótulo

### Requirement: Pesos visibles
Cada conexión SHALL mostrar el signo de su peso y su magnitud: el signo con dos
colores acompañados de un trazo distinto, para no depender solo del color, y la
magnitud con el grosor o la intensidad de la línea. El diagrama SHALL incluir
una leyenda que lo explique.

#### Scenario: Peso positivo fuerte y negativo débil
- **WHEN** una conexión tiene peso 0,9 y otra peso -0,1
- **THEN** la primera se ve con el color y el trazo de los pesos positivos y bien marcada, y la segunda con el color y el trazo de los negativos y tenue

#### Scenario: Leyenda
- **WHEN** se muestra el diagrama
- **THEN** una leyenda indica qué aspecto tienen los pesos positivos, los negativos y una neurona activa

### Requirement: Sesgos visibles
Cada neurona de las capas ocultas y de salida SHALL mostrar el signo y la
magnitud de su sesgo con la misma convención de colores y trazos que los pesos.

#### Scenario: Sesgo negativo
- **WHEN** una neurona tiene sesgo -0,8
- **THEN** su contorno se ve con el aspecto de los valores negativos y bien marcado

### Requirement: Actividad en vivo
El diagrama SHALL mostrar en tiempo real el valor de cada neurona para la
percepción actual del auto, de modo que se vea qué entradas están activas y qué
salidas se disparan.

#### Scenario: Obstáculo detectado
- **WHEN** un sensor del auto detecta un obstáculo cercano
- **THEN** el nodo de esa entrada se ve más activo que los de los sensores que no detectan nada

#### Scenario: Salida disparada
- **WHEN** la red acciona avanzar e izquierda
- **THEN** los nodos de avanzar e izquierda se ven activos y los de derecha y retroceder inactivos

### Requirement: Colores propios y constantes
Los colores del diagrama SHALL ser siempre los mismos para el mismo
significado y MUST ser distintos de los que identifican al auto, al tráfico y a
los sensores en el escenario.

#### Scenario: Significado constante
- **WHEN** se cambia la forma de la red o el auto mostrado
- **THEN** los pesos positivos, los negativos y la actividad conservan sus colores

### Requirement: Redes grandes
El diagrama SHALL caber completo en su zona con cualquier red admitida y MUST
NOT degradar la fluidez del escenario.

#### Scenario: Red máxima
- **WHEN** se muestra una red de 101 entradas y tres capas ocultas de 16 neuronas
- **THEN** el diagrama se ve completo dentro de su zona, sin barras de desplazamiento

#### Scenario: Fluidez con el diagrama visible
- **WHEN** se mide la tasa de cuadros durante diez segundos con el diagrama visible y la configuración por defecto
- **THEN** el promedio es de al menos 50 cuadros por segundo

### Requirement: Diagrama solo de lectura
Interactuar con el diagrama MUST NOT modificar la red que muestra.

#### Scenario: Clic sobre el diagrama
- **WHEN** la persona hace clic sobre nodos y conexiones del diagrama
- **THEN** los pesos y sesgos de la red no cambian
