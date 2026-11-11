# Pendientes

Ideas y detalles anotados para más adelante. No son parte de ningún cambio en
curso: cada uno pasa por el filtro de entrada de la constitución y por su
propuesta de OpenSpec antes de implementarse.

## Ideas

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
