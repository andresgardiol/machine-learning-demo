# Pendientes

Ideas y detalles anotados para más adelante. No son parte de ningún cambio en
curso: cada uno pasa por el filtro de entrada de la constitución y por su
propuesta de OpenSpec antes de implementarse.

## Próximo

- **Los autos aprenden a seguir al tráfico, no a pasarlo.** Con la
  configuración por defecto la población se estabiliza en unos 620 a 650 m:
  es lo que recorre en 60 s un auto que va detrás de un vehículo, apenas más
  rápido que el tráfico (10 m/s, contra 20 m/s de máxima del auto). Pasa con
  el mismo tráfico y con tráfico nuevo en cada generación.
  - Medido sin navegador el 11 de noviembre de 2026: 60 generaciones,
    semillas 1 a 4, tráfico nuevo, cada campeón probado en 20 tráficos que no
    vio. Ninguno de estos ajustes logró campeones que pasen de 900 m en
    tráfico nuevo: fuerza de mutación 25 %, selección 20 %, fitness por
    velocidad media (5 de 80 pasan de 900 m, pero 62 de 80 chocan antes de
    300 m) y la regla de los lentos exigiendo 25 % o 50 % más que el tráfico
    (empeoran). La tabla completa está en el design.md del cambio
    `tablero-de-aprendizaje`, decisión D15.
  - Sin probar todavía: más alcance de los sensores (con 3 largos de auto y
    10 m/s de diferencia quedan 1,2 s para cambiar de carril), más
    generaciones, otra forma de red, una función de fitness que premie
    vehículos superados (ver más abajo) y un tráfico menos denso al empezar.
  - Importa porque es la promesa de la pestaña: que se vea al auto aprender
    a manejar, no solo a no chocar. Conviene explorarlo en un cambio propio.
  - Referencia de lo que el auto puede hacer, medida con el intérprete de la
    pestaña Reglas a mano (cambio `reglas-a-mano`, tarea 2.3; sin navegador,
    configuración por defecto, semilla 2, dos minutos como máximo): el
    ejemplo de 7 sensores (5 reglas) supera 14 vehículos y recorre 1041 m
    antes de chocar, y en las semillas 1 a 5 supera entre 8 y 26. El auto, con
    estos sensores y estas velocidades, puede pasar al tráfico: la meseta no
    es un límite del auto. El ejemplo de 3 sensores cortos (frenar si hay algo
    adelante) recorre 1224 m sin chocar y sin superar a nadie: reproduce a
    mano la misma conducta de seguir al tráfico que aprenden hoy las redes.

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
- **Fitness por vehículos superados.** Una cuarta función de fitness que premie
  la cantidad de vehículos del tráfico que el auto deja atrás, además de la
  distancia, el tiempo sin chocar y la velocidad media.
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
