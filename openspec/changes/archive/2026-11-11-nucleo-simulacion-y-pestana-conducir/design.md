# Design

## Context

El repositorio solo contiene la constitución y la configuración de OpenSpec;
no hay código. Este cambio fija la arquitectura sobre la que se apoyarán las
seis pestañas, así que sus decisiones pesan más que su tamaño. La motivación y
el alcance están en `proposal.md`; el comportamiento exigido, en `specs/`.

Restricciones que condicionan el diseño: sin frameworks ni dependencias de
terceros, sin paso de build obligatorio, sitio estático, núcleo sin DOM y
determinista, solo escritorio, dos idiomas. Entorno disponible para
desarrollo: Node 24 (trae ejecutor de pruebas propio).

## Goals / Non-Goals

**Goals:**

- Un núcleo de simulación que se pueda probar y, más adelante, acelerar sin
  dibujar, porque el entrenamiento de la pestaña 3 lo va a necesitar.
- Que agregar una pestaña o un tipo de controlador nuevo no obligue a tocar el
  núcleo ni las pestañas existentes.
- Que cumplir la constitución (tooltips, idiomas, núcleo sin DOM) se verifique
  con pruebas o auditorías, no con disciplina.

**Non-Goals:**

- Pistas cerradas, vueltas y puntos de control. La representación los admite,
  pero no se implementan ni se prueban acá.
- Simular varios autos controlados a la vez con buen rendimiento. La interfaz
  del mundo lo permite; la optimización llega con la pestaña 3.
- Controles analógicos. Los cuatro controles son sí/no.
- Temas de color alternativos y empaquetado a un solo archivo.

## Decisions

### D1. Capas con dependencias hacia el núcleo

```
index.html
styles/          tokens.css (colores y medidas), app.css
src/
  core/          geometria, azar, pista, auto, sensores, trafico, mundo
  input/         controlador de teclado (adapta eventos al contrato)
  render/        camara y dibujo del escenario en canvas
  ui/            estructura, pestanas, tooltips, idiomas, preferencias, errores
  i18n/          es.js, en.js
  tabs/drive/    composicion de la pestana 1
  main.js
tests/           pruebas del nucleo, de textos y de arquitectura
tools/serve.mjs  servidor local de desarrollo
```

```
 tabs/drive --> ui ------+
     |                   |
     +--> render --------+--> core   (core no importa nada de afuera)
     |                   |
     +--> input ---------+
```

`core` no importa nada fuera de `core` ni usa `document`, `window`,
`Math.random`, `Date.now` o `performance.now`. Una prueba de arquitectura
recorre `src/core` y falla si encuentra alguno. No se prevén excepciones.

El código y sus identificadores van en inglés; todo texto visible sale de los
diccionarios. Así el repositorio se lee igual desde cualquier idioma.

*Alternativas:* un solo archivo (descartado: inmanejable con este alcance) y
un empaquetador (descartado: agrega dependencia y build sin necesidad, porque
los módulos ES nativos funcionan en cualquier hosting estático).

### D2. Bucle de paso fijo fuera del núcleo

El núcleo expone "avanzar un paso" de 1/60 de segundo. El bucle que lo llama
vive en `ui`: acumula el tiempo real transcurrido, ejecuta los pasos que
correspondan (máximo 5 por cuadro, descartando el resto) y luego dibuja una
vez. Se detiene cuando la página queda oculta.

*Alternativa:* paso variable según el tiempo real. Descartado: el resultado
dependería del equipo y rompería la reproducibilidad.

*Rendimiento:* un paso de esta pestaña cuesta decenas de operaciones
geométricas; el tope de 5 pasos por cuadro evita la espiral de retraso.

### D3. Azar con semilla y tráfico como función pura

El núcleo usa un generador propio con semilla (mulberry32). El tráfico no se
"va generando": cada grupo de vehículos se calcula a partir de la semilla y
de su número de grupo. El mundo materializa solo los grupos dentro de una
ventana alrededor del conductor.

```
 bloque b (16 grupos):  largo = 16 * S(densidad), empieza en base + b * largo
     huecos h_i = M + (S - M) * w_i,  con  w_i = (1 - irr) + irr * 16 * e_i / suma(e)
                  e_i exponenciales sorteadas con (semilla, b): suman exactamente el largo
 grupo k = 16b + i:  distancia = inicio del bloque + h_0 + ... + h_(i-1)
     carriles ocupados = eleccion(semilla, k), siempre queda uno libre
     cada vehiculo: adelanto en [-a, a], con a = irr * min(1 largo, (S - Mmin) / 6)
 M = Mmin + 2a   (Mmin: 5 largos centro a centro, o sea 4 largos de hueco)
 en el tiempo t:  distancia + velocidad_trafico * t
```

Esto da tráfico sin fin, idéntico sin importar cómo maneje la persona, y hace
verificables las garantías de carril libre y separación mínima con pruebas
sobre mil semillas. Las separaciones se sortean por bloques para que la
distancia de cualquier grupo siga saliendo solo de la semilla y su número, sin
recorrer los grupos anteriores. Que los huecos de un bloque sumen su largo fijo
mantiene la separación promedio que pide la densidad. Con irregularidad 0 los
huecos son todos S y no hay adelantos, como una grilla. El adelanto acota la
amplitud (2a) con la que se cuenta al mínimo M. Así, los vehículos más cercanos
de grupos consecutivos siempre quedan a 4 largos de hueco o más.

La densidad y la irregularidad se pueden cambiar en marcha (`changeTraffic`)
sin que aparezca un vehículo encima del auto. Lo que ya existe se conserva hasta
20 m por delante del auto, medido en el marco del tráfico, que avanza con él. El
tráfico con la configuración nueva empieza cuatro largos de hueco más allá, así
que se ve llegar. Cada cambio agrega una capa con su tramo, y las capas que se
quedan sin tramo se descartan. Reiniciar vuelve a un tráfico de una sola capa
con la configuración actual.

*Antes:* cada grupo se corría poco alrededor de una grilla fija
(`base + k * S ± desvío`). Con los valores por defecto, el 80 % de las
separaciones caía entre 37 y 50 m y dos semillas daban casi las mismas
distancias. Una red podía aprender "un obstáculo cada ~44 m" en lugar de leer
los sensores.

*Alternativa:* crear vehículos al azar a medida que el conductor avanza.
Descartado: la disposición dependería del recorrido y "mismo tráfico al
reiniciar" sería frágil.

Todos los vehículos del tráfico van a la misma velocidad. Es lo que garantiza
que no choquen entre sí y que el camino libre no se cierre.

### D4. Unidades reales y valores calibrados

El núcleo trabaja en metros y segundos; la vista decide cuántos píxeles es un
metro. Valores calibrados por sensación de manejo y validados por el dueño del
proyecto:

| Magnitud | Valor |
|---|---|
| Auto | 2 m x 4 m |
| Ancho de carril | 4 m |
| Velocidad máxima | configurable de 12 a 40 m/s, 15 m/s por defecto |
| Marcha atrás | la mitad de la velocidad máxima (7,5 m/s por defecto) |
| Aceleración / fricción | 40 m/s2 / 14 m/s2 |
| Velocidad de giro | 1,8 rad/s |
| Velocidad del tráfico | 10 m/s fijos, siempre por debajo del mínimo del auto |
| Primer grupo de tráfico | a 35 m de la línea de salida |
| Calle recta | 100 km por delante y 100 km por detrás de la línea de salida |
| Sensores | 1 a 100 rayos, 1 a 25 largos de auto, 10 a 360 grados; 5 rayos, 3 largos y 90 grados por defecto |

La velocidad máxima es una sola para todas las pestañas: más rápido es más
entretenido, pero deja menos tiempo para reaccionar y hace más difícil
entrenar. El tráfico no cambia con ella, para que siempre se pueda superar.

Las pruebas verifican relaciones (el tráfico es más lento, la marcha atrás
tiene menor tope), no estos números, para poder calibrar sin romperlas.

### D5. Pista como polilínea con bordes desplazados

La línea central es una lista de puntos. Los bordes se obtienen desplazando
esa polilínea medio ancho a cada lado, uniendo los tramos en inglete. El
progreso de una posición se calcula proyectándola sobre el tramo más cercano,
empezando la búsqueda por el último tramo conocido del auto.

La calle recta es una línea central de dos puntos. Las distancias sobre la
pista se miden desde la línea de salida: `createTrack` acepta `start`, la
distancia del primer punto respecto de ella (0 por defecto), y expone `start`
y `end`. La calle recta va de -100 km a +100 km con la salida en x = 0, así
retroceder desde la salida no saca al auto de la calle y el progreso por
detrás es negativo; tráfico, centro de carril e indicadores no cambian.

Se prueba además una pista
abierta con una curva suave, para que la representación no quede atada a la
recta sin que nadie lo note. La creación de una pista rechaza curvas más
cerradas que medio ancho, donde el borde interior se cruzaría consigo mismo.

*Alternativa:* una calle recta hecha a medida (carriles por interpolación,
como en el curso original). Descartado: obligaría a un segundo motor para los
circuitos.

### D6. Una sola rutina de intersección para sensores y choques

Sensores y choques usan la misma intersección entre segmentos. Antes se
descartan los vehículos fuera del alcance y los tramos de borde lejanos al
auto. Con 30 rayos y una decena de vehículos cercanos son unas pocas cientas
de intersecciones por paso.

*Rendimiento:* despreciable hoy. Con cientos de autos (pestaña 3) hará falta
un índice espacial; queda aislado detrás de la consulta "obstáculos cerca de".

### D7. Controlador inyectado

El contrato es un objeto con una operación: recibe la percepción
(`sensors`, `speed`) y devuelve `forward`, `reverse`, `left`, `right`. El
mundo consulta al controlador de cada auto en cada paso. El controlador de
teclado vive en `input`, escucha eventos del navegador y se le entrega al
mundo desde afuera, de modo que el núcleo no conoce el teclado.

*Alternativa:* que la pestaña calcule los controles y se los pase al mundo.
Descartado: con muchos autos y controladores distintos la pestaña terminaría
conociendo detalles de cada uno.

### D8. Vista en un canvas, indicadores en el DOM

Un canvas 2D dibuja pista, tráfico, auto y rayos, solo lo que cae dentro del
encuadre. La cámara es posición, zoom, giro del encuadre y un indicador de
seguimiento. La calle recta se muestra vertical, con el sentido de avance hacia
arriba y el auto centrado al 70 % del alto, para aprovechar el alto del
escenario; las pistas con curvas (circuitos, de formato más cuadrado) se
muestran sin girar (`orientationFor`). El zoom por defecto es 10 px/m, con
límites de 2 y 40. El paneo empieza recién al superar 5 px de arrastre, para
que un clic sobre el escenario no deje de seguir al auto.

Los vehículos llevan detalles cosméticos (carrocería redondeada, parabrisas,
luneta, ópticas y luces traseras) dibujados siempre dentro de su contorno de
choque: lo que se ve nunca es más grande que lo que choca. Los
colores se leen de las variables de `tokens.css`, única fuente de la paleta.
Indicadores, barras y mensajes son elementos del DOM, porque así heredan
idiomas, tooltips y accesibilidad sin trabajo extra. El modo "ver como la
máquina" es una opción de dibujo que omite las capas de pista y tráfico.

*Alternativa:* dibujar también los indicadores en el canvas. Descartado:
duplicaría el sistema de textos.

### D9. Interfaz sin framework

Cada pestaña es un módulo con dos operaciones, montar y desmontar, registrado
en una lista que también declara las pestañas aún no disponibles. El estado
de una pestaña vive en un almacén observable mínimo (suscribirse y notificar).
Los componentes son funciones que devuelven un elemento.

Las pestañas futuras se muestran deshabilitadas en lugar de ocultarse: el
recorrido completo es parte de lo que se enseña.

El almacén de la app guarda, además de la guía y la pestaña activa, la
velocidad máxima del auto (`carSpeed`), que comparten todas las pestañas.

El borde entre escenario y panel se arrastra para ajustar el ancho del panel,
como en un IDE: entre 300 px y la mitad de la ventana, 360 px por defecto;
también se mueve con las flechas del teclado y vuelve al valor por defecto con
doble clic o Enter. El aviso de uso en escritorio aparece solo por debajo de
600 px de ancho, en pantallas de celular; desde ahí la disposición se adapta.

### D10. Idiomas

Dos diccionarios de claves planas (`es.js`, `en.js`). Los elementos declaran
su clave con un atributo y el sistema los reescribe al cambiar de idioma; los
textos con valores variables se suscriben al cambio. Si falta una clave se
usa el otro idioma. Una prueba exige que ambos diccionarios tengan exactamente
las mismas claves.

### D11. Tooltips

Un único elemento flotante y un solo par de escuchas en el documento. Cada
control declara su identificador de ayuda; el contenido sale del diccionario
en dos partes (qué hace, por qué importa). Aparece a los 400 ms de posar el
cursor o al recibir foco, se reubica para no salirse de la ventana y se cierra
con Escape. Los controles no disponibles usan `aria-disabled` en lugar del
atributo `disabled`, porque un control deshabilitado de forma nativa no recibe
eventos y no podría explicarse.

Una función de auditoría lista los controles interactivos sin ayuda
declarada; se usa en la verificación manual de cada cambio.

*Alternativa:* el atributo `title` nativo. Descartado: no permite las dos
partes, ni controlar la espera, ni cambiar de idioma en vivo.

### D12. Fin del intento al chocar

Chocar termina el intento y se reinicia con el mismo tráfico. El
restablecimiento con penalización llega con las carreras.

*Alternativa:* restablecer el auto tras unos segundos. Descartado por ahora:
agrega reglas (dónde reaparece, invulnerabilidad) que la pestaña 1 no necesita.

### D13. Preferencias y errores

Idioma, guía, ancho del panel y velocidad máxima del auto se guardan en el
almacenamiento del navegador, siempre dentro de
un bloque que tolera su ausencia. Un manejador global y la protección del
bucle convierten cualquier falla en un mensaje con botón de reinicio, que
vuelve a montar la pestaña.

`index.html` trae un mensaje estático que el arranque elimina. Si los módulos
no cargan (por ejemplo, al abrir el archivo con doble clic), ese mensaje queda
a la vista y explica cómo abrir la aplicación.

### D14. Pruebas y herramientas

Las pruebas usan el ejecutor incluido en Node (`node --test`) y cubren el
núcleo, la paridad de los diccionarios y la regla de arquitectura.
`package.json` solo declara scripts, sin dependencias. El servidor local es un
script propio sobre el módulo `http` de Node. La interfaz se verifica a mano
en el navegador; no se incorpora un navegador automatizado.

### D15. Lógica de la pestaña 1 sin DOM

Indicadores y misiones (`session.js`), configuración avanzada (`settings.js`)
y atajos (`shortcuts.js`) no usan el DOM y se prueban con `node --test`;
`index.js` solo compone. Reglas:

- Un vehículo cuenta como superado cuando la cola del auto pasó su frente, y
  deja de contar si vuelve a quedar por completo delante (cuenta neta).
- La mejor distancia se registra al terminar el intento (choque o reinicio).
- Las misiones cumplidas siguen marcadas hasta cerrar la aplicación, aunque la
  pestaña se vuelva a montar; su progreso vuelve a cero con cada intento.
- La velocidad máxima, la densidad y la irregularidad se aplican en marcha
  (`world.setMaxSpeed`, `world.setTraffic`), sin reiniciar el intento. Los
  carriles y los sensores sí lo reinician, porque cambian la calle o lo que el
  auto percibe; un arrastre de deslizador suma un solo intento. "Restablecer"
  reinicia solo si cambian carriles o sensores. "Tráfico nuevo" usa la
  semilla siguiente.
- Un deslizador o el borde del panel enfocados con el teclado usan las
  flechas; mientras tanto el teclado no maneja el auto.

## Risks / Trade-offs

- [La reproducibilidad exacta depende del motor de JavaScript: las funciones
  trigonométricas pueden diferir en el último decimal entre navegadores] →
  Se garantiza dentro de un mismo navegador, que es lo que exige la spec; no
  se construyen funciones que dependan de repetir una corrida en otro motor.
- [El cambio es grande para ser el primero: diez capacidades] → Las tareas
  entregan primero el núcleo con sus pruebas y cada grupo se verifica solo;
  si hace falta, se puede cortar después del núcleo sin dejar nada a medias.
- [Textos fijos que se cuelan en el código] → La prueba de paridad no los
  detecta; se cubren con un recorrido completo en inglés en la verificación.
- [La barra espaciadora activa el botón que tenga el foco además de pausar] →
  Tras un clic con el mouse, el foco vuelve al escenario; los atajos se
  ignoran cuando el foco está en un control alcanzado con el teclado.
- [Abrir `index.html` con doble clic no funciona con módulos] → Mensaje
  estático de respaldo e instrucciones en el README.
- [Los valores de física elegidos pueden sentirse mal al manejar] → Tarea de
  calibración explícita; las pruebas no dependen de los valores exactos.
- [Con la calle vertical se ve menos distancia por delante que en horizontal]
  → El primer grupo de tráfico se acercó a 35 m para que se vea al abrir.
- [A velocidades altas, el giro fijo hace curvas muy abiertas] → Aceptado:
  muestra que ir más rápido exige anticiparse; se revisará con las carreras.

## Open Questions

- Paleta de colores definitiva. Se decide al implementar la vista, respetando
  contraste alto y sin depender solo del color.
- Nombres en inglés de las pestañas futuras. Se pueden ajustar cuando cada
  pestaña se construya.
