## ADDED Requirements

### Requirement: Marcador y tabla sin cortes
El marcador SHALL mostrar cada columna con su ancho, sin que un encabezado se parta, se salga de su caja o se pegue al de al lado. El nombre de la pista SHALL leerse en una sola línea en la tabla por pista y en el indicador "Primero": con la forma corta si no entra, y con puntos suspensivos y el nombre completo en el tooltip si tampoco entra. En el cartel de largada, un número MUST NOT separarse de su unidad.

#### Scenario: Choques y estado
- **WHEN** se abre la pestaña con la ventana en 1440×900, en español o en inglés
- **THEN** "Choques" y "Estado" se leen como dos encabezados separados, cada uno dentro de su caja

#### Scenario: Pista en una línea
- **WHEN** la ventana mide 1366×768 o 1236×863 y la carrera es en la calle con tráfico nuevo
- **THEN** el nombre de la pista ocupa una sola línea en la tabla y en "Primero", sin cortarse a mitad de una letra

#### Scenario: Nombre completo
- **WHEN** el nombre se ve con puntos suspensivos y la persona posa el cursor
- **THEN** el tooltip muestra el nombre completo

#### Scenario: Meta en el cartel
- **WHEN** el cartel de largada dice la distancia de la carrera
- **THEN** "1000 m" se lee en el mismo renglón, en español y en inglés

### Requirement: Botones de solo ícono con nombre
Los botones de la lista de competidores que muestran solo un ícono (ver sus sensores y quitar) SHALL tener un nombre accesible que incluya el nombre del competidor, y un tooltip en español y en inglés que diga qué hacen y por qué importa.

#### Scenario: Sensores de un competidor
- **WHEN** la persona posa el cursor sobre el ícono de los sensores de "Calle, tráfico nuevo"
- **THEN** aparece un tooltip que dice que muestra en la escena los sensores de ese competidor

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega al botón de quitar de "7 sensores"
- **THEN** anuncia "Quitar a 7 sensores" y que es un botón

#### Scenario: Auditoría
- **WHEN** se corre la auditoría de tooltips en Competir
- **THEN** no informa ningún botón de la lista sin tooltip

### Requirement: Panel a la vista en 1366×768
Con la ventana en 1366×768 y la guía activa, el panel de Competir SHALL verse sin desplazarse con los tres competidores por defecto. Con seis, solo la lista de competidores SHALL desplazarse por dentro. Cada competidor de la lista ocupa un renglón, con su nombre y su tipo.

#### Scenario: Por defecto
- **WHEN** se abre la pestaña con la ventana en 1366×768 y la guía activa
- **THEN** el panel no tiene barra de desplazamiento y se ven la tarjeta de consigna, los ajustes de la carrera, los tres competidores y las misiones

#### Scenario: Seis competidores
- **WHEN** la persona agrega tres competidores más, con o sin "Vos"
- **THEN** el panel no se desplaza y la lista de competidores se desplaza por dentro

#### Scenario: Un renglón por competidor
- **WHEN** el panel mide 360 píxeles de ancho
- **THEN** cada competidor ocupa un renglón, con el nombre y el tipo en la misma línea y el nombre largo con puntos suspensivos y su tooltip
