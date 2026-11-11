# Pendientes

Ideas y detalles anotados para más adelante. No son parte de ningún cambio en
curso: cada uno pasa por el filtro de entrada de la constitución y por su
propuesta de OpenSpec antes de implementarse.

## Detalles

- **Guía de la pestaña 1 y cantidad de carriles.** El texto de inicio dice
  "calle de tres carriles" aunque en la configuración avanzada se elijan 2 o 4.
  Describe el estado por defecto, pero conviene que acompañe al valor elegido
  (por ejemplo, con la cantidad como parámetro del texto).
- **Separador decimal en español.** Los valores con decimales se muestran con
  punto en los dos idiomas (por ejemplo, "1.5 largos de auto"); en español
  debería ser coma ("1,5"). Afecta a todo texto con números, así que conviene
  resolverlo en el sistema de idiomas y no texto por texto.

## Ideas

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
