# Pendientes

Ideas y detalles anotados para más adelante. No son parte de ningún cambio en
curso: cada uno pasa por el filtro de entrada de la constitución y por su
propuesta de OpenSpec antes de implementarse.

## Orden de trabajo

Decidido por el dueño el 12 de noviembre de 2026:

1. ~~**Circuitos cerrados y paisaje**, en un mismo cambio.~~ Hecho en el
   cambio `circuitos-y-paisaje`: tres circuitos fijos sin tráfico, entrenar en
   una o varias pistas, paisaje con interruptor y "ver como la máquina" en las
   tres pestañas.
2. **Pestaña 4, Competir.** Es clave: es donde se habla de generalización y
   sobreajuste y se demuestra lo aprendido.
3. **Pestañas 5 y 6,** Inspeccionar y Laboratorio.
4. **Al final, los dos arreglos de Reglas a mano** anotados más abajo (los
   ejemplos solo valen con la velocidad por defecto; el programa recordado no
   recuerda los sensores). Esa pestaña es corta y es la que menos importa.

El resto de las notas de este archivo no tiene orden fijo.

## Próximo

- **Fluidez con paisaje y circuitos sin medir.** La tarea 10.1 de
  `circuitos-y-paisaje` quedó sin hacer porque el panel del navegador estuvo
  oculto (sin cuadros no hay medida que valga). Falta medir, diez segundos
  cada una y con el paisaje encendido: un auto en la calle recta y en el gran
  premio (mínimo 55 cuadros por segundo) y una población de 100 en la calle
  recta y en el gran premio (mínimo 50).

- **Manejar sin chocar con tráfico irregular.** El cambio
  `fitness-que-premia-superar` hizo que, con los valores por defecto (ventaja
  sobre el tráfico, élite 10, mutación que se enfría e irregularidad 0 %), la
  población aprenda a pasar al tráfico: con 100 autos, los campeones de las
  generaciones 51 a 60 superan 13,3 vehículos en promedio en tráficos que no
  vieron (entre 10,8 y 17,0 según la semilla; `npm run test:learning`, que
  mide con población 100). Con la población por defecto de 400 no se midió. Queda pendiente el caso
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
  - Sin adoptar: recalentar la mutación al estancarse (design.md D10 del
    cambio). Regla: el enfriamiento lleva un reloj que suma 1 por generación;
    si pasan 15 generaciones seguidas sin ninguna buena (algún auto le saca al
    tráfico 5/6 de la ventaja máxima posible, 500 m con los valores por
    defecto) y el reloj va por 30 o más, el reloj vuelve a 0 y la fuerza a
    30 %. En una medición preliminar con una copia del núcleo (población 100,
    semillas 1 a 40, 100 generaciones) deja 1 de 40 semillas sin aprender en
    las generaciones 91 a 100, contra 8 de 40 sin la regla, pero tarda más en
    despegar (primera generación buena: mediana 21, contra 10 con población
    200). Se eligió subir la población por defecto a 400.

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

- **Lo que quedó fuera de `panel-de-entrenar-por-vistas`.** Anotado para más
  adelante:
  - **Probar con un lector de pantalla y con una herramienta automática.** El
    cambio verificó leyendo el árbol de accesibilidad del navegador y
    recorriendo todo con teclado, pero no se probó con VoiceOver ni con una
    herramienta como axe: las pestañas de vista, la barra de escenario y la
    descripción del escenario quedan para que las pruebe el dueño.
  - **El editor de Reglas a mano corta el recorrido con Tab.** Tab y Mayús+Tab
    agregan y quitan sangría, y Escape devuelve el foco al escenario (lo dice
    la ayuda del editor). Avanzando con Tab desde el escenario se vuelve a
    entrar al editor, así que la paleta y el panel de esa pestaña solo se
    alcanzan retrocediendo con Mayús+Tab desde el encabezado. No es una
    trampa, pero es incómodo.
  - **Los tooltips siguen nombrando la tecla con los atajos apagados.** Los
    rótulos de los botones y los textos de guía y de choque dejan de mostrarla,
    pero las ayudas ("Atajo: tecla R") la siguen diciendo.
  - **Con selección manual, la vista de entrenamiento se desplaza a
    1440×900.** Con la barra de escenario quedan 746 px a la vista, y con
    selección manual el contenido mide 846 px (876 mientras el cambio de modo
    espera a la generación siguiente). Lo que pide la spec (quién elige al
    padre, pausar, siguiente, elegir, deshacer y la línea del padre) se ve sin
    desplazar. Con selección automática la vista entra justo: 746 de 746 px.
  - **Entrenar alternando varias pistas.** La interfaz entrena en una sola
    pista; el núcleo conserva la lista y los cerebros entrenados así siguen
    valiendo. Si se retoma, hay que decidir dónde se marcan las pistas.
  - **Editar la red sobre el diagrama del tablero.** Hoy está en la vista de
    ajustes, a un clic.
  - **Eliminar todos los cerebros de una vez.** Hoy se eliminan uno por uno,
    cada uno con su confirmación.
  - **El borde del riel de los deslizadores es el del navegador.** Medido en
    Chrome: #858585, más de 3:1 sobre el panel. No se midió en Safari ni en
    Firefox.

- **Introducción guiada para quien llega sin la teoría.** La guía explica
  cada control, pero la pantalla tiene mucha información a la vez y da por
  sabido lo que el mentor contaría antes: qué es una red, qué es una
  generación, por qué se muta. La idea es un recorrido corto por pestaña, de
  tres o cuatro pasos, con una animación muy visual del concepto clave de esa
  pestaña, antes de dejar a la persona sola con los controles.
  - Idea del dueño (12 de noviembre de 2026): generar las animaciones con
    Claude Motion. Queda por ver qué produce esa herramienta y si sirve acá.
  - A decidir al proponerlo: animaciones hechas con el propio dibujo de la app
    (livianas, en los dos idiomas, y muestran el cálculo real) o videos ya
    renderizados (más vistosos, pero pesan, hay que hacer uno por idioma y
    quedan viejos cuando cambia la interfaz).
  - A tener en cuenta: un concepto por paso (artículo 4), que se pueda saltear
    y volver a abrir (artículo 6), textos en español e inglés (artículo 11) y
    ninguna dependencia nueva.

- **Lo que quedó fuera de `circuitos-y-paisaje`.** Anotado para más adelante,
  cada cosa con su propia propuesta:
  - cruces de calles que pasan por debajo y tramos de autopista elevada sobre
    puentes, en el paisaje de la calle recta;
  - tiempos de vuelta, mejor vuelta y cronómetro en los circuitos (encaja con
    Competir);
  - circuitos generados por semilla o dibujados por la persona (hoy son tres,
    fijos);
  - programas de ejemplo de Reglas a mano escritos para los circuitos (hoy los
    ejemplos son de la calle recta y cargarlos vuelve a ella).
