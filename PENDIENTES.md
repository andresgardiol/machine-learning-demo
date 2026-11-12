# Pendientes

Ideas y detalles anotados para más adelante. No son parte de ningún cambio en
curso: cada uno pasa por el filtro de entrada de la constitución y por su
propuesta de OpenSpec antes de implementarse.

## Próximo

- **Manejar sin chocar con tráfico irregular.** El cambio
  `fitness-que-premia-superar` hizo que, con los valores por defecto (ventaja
  sobre el tráfico, élite 10, mutación que se enfría e irregularidad 0 %), la
  población aprenda a pasar al tráfico: los campeones de las generaciones 51 a
  60 superan 13,3 vehículos en promedio en tráficos que no vieron (entre 10,8 y
  17,0 según la semilla; `npm run test:learning`). Queda pendiente el caso
  difícil:
  - Con irregularidad 50 %, ninguna combinación medida pasa de 6,3 vehículos ni
    baja del 80 % de manejos que chocan. Los campeones entrenados con filas
    parejas, probados con irregularidad 50 %, superan 5,7; los entrenados
    directamente con 50 %, entre 4,0 y 5,6.
  - Aun con filas parejas, el 44 % de los manejos de prueba termina en choque a
    las 60 generaciones y el 28 % a las 100: la ventaja premia pasar, no llegar.
  - Medido y sin mejora (detalle en el proposal.md del cambio): subir la
    dificultad sola a medida que la población aprende (cinco formas, entre 5,8 y
    6,3 en tráfico irregular), otras reglas para ajustar la mutación, cruce,
    población 200, 7 rayos, capa oculta de 8, más alcance de sensores, evaluar
    en 3 o 5 calles por generación y penalizar el choque.
  - Sin probar: enfriar la mutación con selección manual.

- **Los ejemplos de Reglas a mano solo valen con la velocidad por defecto.**
  La velocidad máxima del auto es una sola para toda la app y se recuerda;
  los programas de ejemplo están escritos para 20 m/s.
  - Medido sin navegador el 12 de noviembre de 2026, con el intérprete del
    producto y el tráfico inicial de la pestaña (semilla 2): a 23 m/s el
    programa inicial choca contra el primer vehículo a los 59 m en vez de
    esquivarlo, y el ejemplo de 3 sensores, cuyo comentario dice "No choca",
    choca a los 61 m (y en las semillas 1 a 5). A 30 m/s el ejemplo de 20
    sensores (1296 m, 27 superados) le gana al de 7 (108 m, 1 superado), al
    revés de lo que el ejemplo quiere mostrar.
  - Las pruebas automáticas usan la velocidad por defecto y no lo detectan.
  - Propuesta, sin implementar: que la pestaña tenga su propia velocidad,
    que arranque en 20 m/s y que cargar un ejemplo o restablecer la vuelvan a
    20, como ya hacen con los sensores. Cambia, solo para esta pestaña, el
    requisito de que la velocidad sea una sola para todas.
- **El programa recordado no recuerda los sensores.** Se guarda solo el
  texto: si se carga el ejemplo de 20 sensores y se recarga la página, la
  pestaña abre con 5 sensores y el error de sensores que no existen.
  Propuesta, sin implementar: recordar los sensores junto al programa.

## Ideas

- **Detalles que dejó el tablero de aprendizaje** (cambio
  `tablero-de-aprendizaje`, noviembre de 2026):
  - Con el foco puesto con Tab en un botón común del panel, los atajos
    (espacio, N, T, R) se siguen ignorando para no accionar el botón dos
    veces; solo los títulos de las tarjetas del tablero los dejan pasar.
    Revisar si conviene extender esa excepción a otros controles.
  - En ventanas de 600 a 959 px el tablero queda debajo del escenario con el
    45 % del alto: las tarjetas conservan sus 160 px y el tablero se
    desplaza. Con menos de 360 px de ancho, los indicadores y las acciones
    pasan a dos columnas. Revisarlo con personas en una pantalla mediana.
  - El tablero de El problema tiene espacio libre a la derecha de las barras
    en pantallas anchas (lo anticipaba el design.md, riesgos).


- **"Ver como la máquina" en la pestaña Entrenar.** Como en la pestaña 1:
  ocultar calle y tráfico y mostrar solo lo que perciben los sensores del
  líder, para ver con qué decide la red. Quizás junto al diagrama de la red,
  que ya muestra esas mismas entradas.
- **Eliminar autoguardados.** Los cerebros guardados ya se pueden eliminar
  con confirmación, pero los autoguardados ("entrenamiento en curso" y
  "entrenamiento anterior") no se pueden eliminar ni renombrar, porque la
  app los reemplaza sola. Conviene poder eliminarlos (sobre todo el
  anterior) para limpiar la biblioteca antes de una charla.

- **Cerebros incluidos elegidos por el dueño.** La app no trae cerebros
  preentrenados: el mentor entrena y guarda los suyos antes de una charla.
  Más adelante podrían incluirse dos o tres cerebros elegidos por el dueño
  (por ejemplo, uno que memorizó su tráfico y otro entrenado con tráfico nuevo
  en cada generación, que generaliza), exportados desde la app y versionados
  como datos.
- **Elegir con un clic qué auto seguir.** En el entrenamiento la cámara sigue
  siempre al líder; podría poder elegirse cualquier auto de la población
  haciendo clic sobre él, y ver su red en el diagrama.
- **Entrenar en segundo plano.** Hoy el entrenamiento se detiene con la página
  oculta o al cambiar de pestaña. Con un Web Worker podría seguir avanzando,
  a costa de duplicar el estado para dibujarlo y de cuidar la
  reproducibilidad.
- **Más variedad en el tráfico con densidad alta.** Con 4 carriles y densidad
  e irregularidad al máximo, el tráfico se ve monótono: los grupos quedan a
  distancias muy parecidas y casi siempre con 3 vehículos.
  - Causa: a densidad máxima, la separación promedio entre grupos (24 m) casi
    coincide con el mínimo permitido (unos 21 m con el escalonado), así que el
    sorteo solo puede variar unos 3 m. Además, la cantidad de vehículos por
    grupo depende solo de la densidad y al 100 % es siempre `carriles - 1`, y
    el escalonado queda acotado a menos de 1 m.
  - Direcciones posibles: que la densidad suba también variando la cantidad de
    vehículos por grupo y dejando tramos más cargados y otros más vacíos (en
    vez de achicar siempre la separación); permitir grupos vacíos o de un solo
    vehículo aun con densidad alta; o dejar de pensar en grupos y ubicar cada
    vehículo por su cuenta, con una regla que garantice el camino libre.
  - Siempre con las dos garantías: el tráfico no se choca entre sí y nunca
    cierra todos los carriles al auto principal.
- **Otros tipos de vehículos.** Camiones y motos, además de autos, para tener
  variedad de tamaños (largo y ancho). Cada tipo con su contorno de choque, y
  el dibujo siempre dentro de ese contorno. Implica revisar el hueco mínimo
  entre grupos y el carril libre según el tamaño (un camión largo ocupa más),
  que el tráfico siga sin chocarse y que siempre quede un camino libre para el
  auto principal. Va de la mano de la idea anterior.

- **Paisaje procedural alrededor de la calle.** Aprovechar el espacio negro a
  los costados del escenario con un entorno que se genere solo y nunca
  termine, igual que el tráfico:
  - árboles y vegetación;
  - veredas a los costados de la calle;
  - sendas peatonales;
  - cruces de calles que pasan por debajo, con tramos donde la calle propia va
    como autopista elevada sobre puentes.

  Es solo estético: no choca, los sensores no lo ven y no cambia la
  simulación. A tener en cuenta al proponerlo:
  - generarlo con la semilla, como el tráfico, para que se vea igual al
    reiniciar;
  - dibujarlo solo dentro del encuadre, para no degradar la fluidez
    (artículo 10);
  - ocultarlo en el modo "ver como la máquina", como la calle y el tráfico;
  - mantener los colores de auto, tráfico y sensores bien distinguibles
    (artículo 9) y no distraer del problema (artículo 1);
  - quizás un interruptor para que el mentor lo apague (artículo 6).

- **Circuitos cerrados.** Además de la calle recta, pistas con curvas que
  cierran sobre sí mismas, para dar vueltas. Hoy todas las pestañas usan la
  calle recta con tráfico. Queda por definir al proponerlo: en qué pestañas
  se usan, si llevan tráfico, cómo se mide el avance (vueltas, distancia
  sobre el eje de la pista) y si los cerebros y los programas escritos para
  la calle recta sirven en un circuito.
