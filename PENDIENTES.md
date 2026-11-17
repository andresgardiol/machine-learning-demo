# Pendientes

Ideas y detalles anotados para más adelante. No son parte de ningún cambio en
curso: cada uno pasa por el filtro de entrada de la constitución y por su
propuesta de OpenSpec antes de implementarse.

Arriba, el orden de trabajo: una línea por tema, de lo más urgente a lo que
puede esperar. Abajo, las notas detalladas de cada cambio, agrupadas por
área. Las líneas de arriba nombran la nota de abajo que tiene el detalle.

## Hecho

Las seis pestañas están hechas, con circuitos y paisaje, Competir,
Inspeccionar y Laboratorio, en el orden que fijó el dueño el 12 de noviembre
de 2026. El 16 de noviembre se sumó al Laboratorio el recorrido de
compuertas (`laboratorio-empieza-por-compuertas`). El 17 de noviembre,
`sin-destellos-en-la-red`: ninguna neurona, conexión ni tecla de la decisión
destella más de tres veces por segundo en Inspeccionar, el Laboratorio y
Entrenar; lo que titubea se ve quieto y rayado. Implementado y medido sin
ventana, archivado; lo que quedó, en *Inspeccionar y vista de la red*.
También el 17 de noviembre, `manejar-vos-en-inspeccionar`: en Inspeccionar se
toma el volante con las flechas (o "Manejar vos") y la decisión muestra
"Vos" y "La red" lado a lado, con cuánto coincidieron; "Devolver el volante"
deja a la red seguir desde donde quedó el auto. Implementado y verificado
sin ventana, archivado; lo que quedó, en *Inspeccionar y vista de la red*.
El 17 de noviembre, `jerarquia-de-botones`: cuatro estilos con un significado
cada uno (acción principal, secundaria, opción elegida y salida de la red) y
una sola acción principal a la vista por pestaña, que es la marcha salvo con
un choque, la selección manual o la carrera terminada. Implementado y medido
sin ventana, con el antes y el después en
`borradores/jerarquia-de-botones/comparacion.md`. El dueño eligió la tecla de
salida gris y lo archivó el mismo día; lo que quedó, en *Ayudas, guía y
accesibilidad*. También el 17 de noviembre, el análisis de UX desde cero
(punto 1 de la *Prioridad 1*). El informe está en
`borradores/analisis-ux/informe.md` (local: `borradores/` no va a git), y sus
cambios candidatos están en la *Prioridad 1*, más abajo.
El 17 de noviembre, `tarjeta-de-consigna`: cada pestaña abre su panel con una
tarjeta que dice qué hacer (una frase), tiene la marcha adentro (salvo en
Inspeccionar y el Laboratorio, donde sigue abajo de la red) y muestra la
misión en curso; la lista marca esa misión con "▸" y negrita. Implementado y
medido sin ventana: la tarjeta entra entera en todos los estados medidos,
también Entrenar a 1366×768. El antes y el después están en
`borradores/tarjeta-de-consigna/comparacion.md`. Con la revisión del dueño
(grupo 6): botones de dos alturas, la tarjeta con fondo propio y barra lateral,
el texto largo plegado en "Más sobre esta pestaña" y Tráfico nuevo fuera de la
tarjeta. Archivado el 17 de noviembre; lo que quedó, en *Ayudas, guía y
accesibilidad*.

## En curso

Nada.

## Para probar a mano (dueño)

- Compuertas: los escenarios en que la red tiene que aprender ("Aprende al
  reproducir", "Con la capa oculta", "Trabada en un mínimo local",
  "Aprendiendo tampoco", "De corrido"). Detalle en *Laboratorio y
  compuertas*.
- Fluidez con el navegador a la vista: casi todas las medidas se tomaron con
  Chrome sin ventana. Lista de qué medir en *Pruebas que faltan*, más abajo.

## Prioridad 1: que alguien que llega solo entienda la app

Orden propuesto por Claude el 16 de noviembre de 2026 y actualizado el 17,
después del análisis de UX; el dueño puede cambiarlo. El recorrido guiado se
monta sobre la jerarquía, la tarjeta de consigna y las misiones.

1. **Cambios del análisis de UX.** Cada uno se propone e implementa por
   separado, con su antes y después en capturas. El análisis ya se hizo
   (17 de noviembre de 2026) y `jerarquia-de-botones` ya está hecho.
   Tamaños del informe: S es un panel o unos pocos estilos, M son varias
   pestañas o un componente nuevo, L es un rediseño transversal. En el orden
   sugerido por el informe (hipótesis, no medido):
   - `barra-de-escenario-plegable` (M): la barra de ajustes del escenario
     pasa a un resumen de una línea que se despliega, para que no sea lo
     primero que se ve. Desplegada por defecto en El problema. Choca con
     "Ningún ajuste MUST quedar en una sección plegable" de *Orden común del
     panel* (`estructura-app`): hay que modificar ese requisito.
   - ~~`tarjeta-de-consigna` (M)~~: hecho el 17 de noviembre de 2026 (ver
     *Hecho*). Al final, el texto largo quedó plegado en "Más sobre esta
     pestaña", por decisión del dueño en la revisión. Es el lugar donde
     después puede hablar el recorrido guiado.
   - `ajustes-por-niveles` (L, o M por pestaña; Entrenar primero): "Probá
     esto", "Más" y "Avanzado" colapsado. La tabla de qué va en cada nivel
     está en §5.3 del informe y hay que validarla con el dueño. Choca con el
     mismo requisito que la barra plegable.
   - `misiones-que-muestran-el-control` (M): un "Mostrame" en cada misión
     que resalta el control que hay que tocar.
   - `laboratorio-experimentos-a-la-vista` (M): Compuertas, Puntos y Tu
     manejo como tres experimentos con nombre; en Compuertas, arrastrar un
     peso como acción principal.
   - Chicos e independientes:
     - `reinicios-con-alcance` (S–M): unificar Restablecer y Reiniciar,
       decir qué se pierde y ofrecer deshacer;
     - `escenario-coherente-entre-pestanas` (S): ¿los ajustes del escenario
       son globales o por pestaña? Lo decide el dueño;
     - `interruptores-de-ayuda-claros` (S): Guía, Ayudas y Atajos que digan
       qué ocultan;
     - `inspeccionar-guia-persistente` (M): la guía sigue al elegir una
       neurona y los controles van en grupos;
     - `cortes-y-desbordes-ux` (S): junto con los de la *Prioridad 2*;
     - `tooltips-anunciados` (S): un indicio de que hay ayuda, y texto en
       los botones de solo ícono;
     - `primer-manejo-guiado` (S): el cartel "Usá las flechas" en El
       problema. Pregunta abierta: ¿suavizar el volante? Toca la física;
     - `vocabulario-escalonado` (M): definir en pantalla fitness, élite,
       época y los demás términos.
   - Decisión del dueño: el informe sugiere sumar a la constitución un
     artículo de jerarquía visual ("cada pestaña tiene una acción principal y
     una consigna visibles antes que cualquier ajuste").
2. **Sistema de diseño: revisión con dos skills.** Pedido del dueño (17 de
   noviembre de 2026), después de ver `tarjeta-de-consigna` terminada:
   "Sigo pensando que los botones no tienen jerarquía clara, nos hace falta un
   sistema de diseño".
   - Cómo: con las skills `/design:design-critique` y
     `/design-skills:interaction-design`. Primero sobre la pestaña 2 (Reglas a
     mano) como ejemplo; con lo que salga, mejorar las demás.
   - Cuándo: después de `misiones-que-muestran-el-control`, que es el cambio
     que sigue del análisis de UX.
   - Qué entregar: la crítica con evidencia (capturas, controles), un sistema
     de diseño (niveles de botón, tipografía, espaciado, superficies y
     estados) separado de lo propuesto para Reglas a mano, y de ahí propuestas
     de OpenSpec. Lo que ya fijan `jerarquia-visual` y `consigna-de-pestana`
     es punto de partida, no límite.
   - Observado por Claude en la captura del dueño de Reglas a mano (17 de
     noviembre, hipótesis, sin medir):
     - en la columna derecha conviven unos diez botones con contorno y la
       misma altura: Tráfico nuevo, los tres ejemplos, Restablecer, Exportar,
       Importar y los interruptores;
     - las fichas de la paleta del editor también parecen botones;
     - las teclas de salida ("Avanzar", "Retroceder") con contorno blanco
       siguen pareciendo botones.
3. **Recorrido interactivo para aprender sin mentor.** Pedido del dueño (16 de
   noviembre de 2026).
   - Qué: un recorrido guiado (walkthrough) que lleve a quien llega solo por
     toda la experiencia, de El problema al Laboratorio, para que aprenda sin
     depender de una persona que lo guíe.
   - Qué entregar: **tres propuestas distintas** para que el dueño elija la
     mejor, comparadas por claridad didáctica, cuánto se puede saltear o
     retomar, cómo convive con el mentor (que lo oculta), esfuerzo y
     mantenimiento cuando cambia la interfaz.
   - Restricciones de la constitución: un concepto por paso, se puede
     saltear y volver a abrir, textos en español e inglés, sin dependencias
     nuevas.
   - Va después de `tarjeta-de-consigna` y
     `misiones-que-muestran-el-control`. Absorbe la idea anterior *Introducción
     guiada para quien llega sin la teoría* (en *Ayudas, guía y
     accesibilidad*), con sus preguntas abiertas: Claude Motion, y
     animaciones con el dibujo de la app o videos.

## Prioridad 2: arreglos chicos que se notan en una clase

Cada uno es corto. Conviene pasarlos por el análisis de UX antes de
arreglarlos de a uno.

- Reglas a mano: los ejemplos solo valen con la velocidad por defecto, y el
  programa recordado no recuerda los sensores. Detalle en *Reglas a mano*.
- Laboratorio: imitar en el óvalo no anda con los valores por defecto;
  decide el dueño si la pista cambia la tasa o la red. En *Laboratorio y
  compuertas*.
- Biblioteca: poder eliminar los autoguardados antes de una charla. En
  *Biblioteca de cerebros*.
- Los tooltips siguen nombrando la tecla con los atajos apagados. En
  *Entrenar, tráfico y aprendizaje* (lo que quedó de
  `panel-de-entrenar-por-vistas`).
- Cosas que se cortan o se desplazan: el panel de Competir a 1366×768, la
  barra de pestañas a 1032 px, "Choques" y el nombre de la pista en
  Competir, las acciones del Laboratorio en dos renglones en español, la
  vista de entrenamiento con selección manual a 1440×900. En sus áreas.
- Teclado: el editor de Reglas a mano corta el recorrido con Tab; los atajos
  con el foco en un botón del panel; el foco de "Eliminar" en la biblioteca.

## Prioridad 3: pruebas que faltan

- **Fluidez con el navegador a la vista**, diez segundos cada una: paisaje y
  circuitos, Competir con seis competidores en el circuito de curvas,
  Inspeccionar con la red más grande, Laboratorio, punto de prueba,
  operación por operación y perillas de las compuertas.
- **Accesibilidad real y otros navegadores**: lector de pantalla
  (VoiceOver), una herramienta automática como axe, Safari y Firefox. Ningún
  cambio lo probó todavía; conviene una pasada única por toda la app.
- Menos movimiento emulado en el navegador (en el Laboratorio se verificó
  por código) y tocar y arrastrar con el dedo.

## Prioridad 4: aprendizaje en casos difíciles (investigación)

- Manejar sin chocar con tráfico irregular (irregularidad 50 %). En
  *Entrenar, tráfico y aprendizaje*.
- La espiral con tres capas, ReLU o sigmoide; el aviso de sobreajuste con
  pocos apartados. En *Laboratorio y compuertas*.
- XOR con una capa de 2 se traba en 4 de cada 10 redes; con 4 ocultas,
  nunca. En *Laboratorio y compuertas*.

## Ideas para más adelante, sin orden

- Cerebros incluidos elegidos por el dueño.
- Elegir con un clic qué auto seguir en el entrenamiento.
- Entrenar en segundo plano (Web Worker).
- Más variedad en el tráfico con densidad alta, y otros tipos de vehículos.
- Lo que quedó fuera de alcance en cada cambio (Competir, circuitos,
  operación por operación, punto de prueba, vista de la red, Inspeccionar,
  Laboratorio, compuertas, panel de entrenar). Está al final de cada nota de
  abajo.

---

# Notas por área

## Laboratorio y compuertas

- **Compuertas en el Laboratorio: lo que quedó sin probar, visto o fuera de
  alcance.** Del cambio `laboratorio-empieza-por-compuertas` (16 de noviembre
  de 2026, archivado el 17):
  - XOR con una capa de 2 y tanh se traba en un mínimo local en 4 de cada 10
    redes de la serie, con cualquier tasa (medido en la tarea 5.2). Decisión
    del dueño: arranque fijo que llega (semilla 1, 68 épocas a tasa 0,3) y la
    guía nombra el mínimo local si "Reiniciar pesos" da una red que se traba.
    Con 4 ocultas llegaban 10 de 10: queda como alternativa si la traba
    molesta en clase.
  - El rótulo que el lienzo de la red dibuja junto a la neurona bajo el
    cursor ("neurona 5 · vale … · suma …") queda debajo de las pastillas de
    las perillas cuando se pisan (visto con 2 → 8 → 8 → 1). No tapa nada que
    no se lea en otro lado; queda para `sin-destellos-en-la-red`, que toca el
    mismo archivo.
  - Cada flecha sobre una pastilla es un cambio a mano: cinco flechas cuentan
    como los cinco cambios que hacen aparecer la explicación de XOR.
  - Perillas con 600 px de red: las neuronas se achican con perillas (radio
    hasta 0,16 del hueco entre columnas) para que entren las pastillas en las
    51 formas de hasta 16 conexiones. Más angosto, sin medir.
  - Fluidez y "fondo en el momento": medidos con Chrome sin ventana (CDP), no
    con el navegador a la vista: mediana 16,7 ms y peor 16,8 ms arrastrando
    con 2 → 8 → 8 → 8 → 1 en pausa y con 2 → 4 → 1 aprendiendo.
  - A verificar por el dueño, a mano (pedido suyo): los escenarios que
    dependen de que la red aprenda: "Aprende al reproducir", "Con la capa
    oculta", "Trabada en un mínimo local", "Aprendiendo tampoco" y "De
    corrido". Se corrieron antes de que llegara el pedido; quedan como
    referencia, no como verificación.
  - Sin probar: lector de pantalla real (tabla de verdad, interruptores y
    pastillas de sesgo; rol, nombre y estado se leyeron del DOM), Safari y
    Firefox.
  - Fuera de alcance (propuesta): NAND, NOR, XNOR y tablas de más de dos
    entradas; el escalón como activación; perillas en Inspeccionar (la vista
    las ofrece, Inspeccionar no las pide).

- **Laboratorio: lo que quedó sin medir, sin probar o fuera de alcance.** Del
  cambio `pestana-laboratorio` (14 de noviembre de 2026):
  - Fluidez sin medir en cuadros por segundo (tarea 10.2): el panel del
    navegador estuvo oculto. Sustituto medido, tick y dibujo por cuadro: con
    500 puntos y tres capas de 8 a 10 épocas/s, mediana 0,5 ms y máximo
    9,3 ms; a 60 épocas/s, mediana 2,3 ms; con tu manejo, máximo 8,3 ms.
  - Imitar en el óvalo no anda con los valores por defecto (tasa 0,1): no
    llega en ninguna carrera, con 34 a 39 choques. Con una capa de 8 y tasa
    0,03 llega sin choques a las 500 y a las 1000 épocas. Que la pista elegida
    cambie la tasa o la red por defecto queda para que decida el dueño.
  - La espiral (desde `espiral-aprendible`, 1,25 vueltas) se aprende con dos
    capas de 7 u 8, tanh y la tasa por defecto (45 a 69 épocas en cinco
    semillas); sigue sin andar bien, medido con una copia del generador
    (design.md D2 de ese cambio, sin repetir con el real): tres capas de 8
    con tanh, 2 de 5 semillas; ReLU, 1 o 2 de 5; sigmoide, 1 de 5 como mucho;
    ruido 20 %, 2 de 5 con dos capas de 8.
  - Con pocos apartados (receta de la misión 2: 12 puntos), el error de los
    apartados es ruidoso: el aviso de sobreajuste aparece y se retira de 1 a 3
    veces en 600 épocas, según la semilla. Ninguna pasó de tres.
  - Menos movimiento: verificado por código, no emulado en el navegador.
  - Con tu manejo, en español, las acciones del panel ("Reiniciar pesos",
    "Red de siempre", "Guardar como cerebro") se parten en dos renglones
    (56 px contra 26 en inglés). No se desplaza nada; queda para decidir.
  - Tabla de datos y cambios a mano: no se probaron con un lector de pantalla
    real.
  - Sin probar: lector de pantalla real, Safari y Firefox.
  - Fuera de alcance: lotes, momento y otros optimizadores, regularización,
    dibujar puntos a mano, aprender con recompensas en vez de ejemplos (el
    aprendizaje por refuerzo con backpropagation), guardar o cargar los
    ejemplos grabados.

- **Lo que quedó fuera de `punto-de-prueba`.** Cada cosa, con su propia
  propuesta:
  - el punto de prueba con "Tu manejo" (rayos y velocidad a mano en el
    Laboratorio; Inspeccionar ya lo permite con un cerebro guardado);
  - llevar el punto de prueba a un ejemplo elegido en la tabla de datos;
  - una misión ("Encontrá un lugar donde la red dude");
  - varios puntos de prueba a la vez.
  - Sin probar: lector de pantalla real (se leyó el texto que se anuncia),
    Safari y Firefox, tocar y arrastrar con el dedo, y la fluidez con el
    navegador a la vista (medida en Chrome sin ventana).

## Inspeccionar y vista de la red

- **Vista de la red: lo que quedó sin medir, sin probar o fuera de alcance.**
  Del cambio `vista-de-la-red` (16 de noviembre de 2026):
  - Fluidez en cuadros por segundo con el navegador a la vista (tarea 11.2):
    el panel del navegador estuvo oculto. Medido sin ventana, como sustituto:
    60 cuadros por segundo con la red más grande, el flujo y una salida
    elegida (dibujo de 0,9 ms de mediana); 60 en el Laboratorio con tres capas
    de 8 y los mapas (la grilla, 2,3 ms, como mucho 15 veces por segundo).
  - Elegir líneas en un cruce: preferir la más visible (mayor |peso| o
    brillo) entre las que quedan a menos de 1,5 px de la más cercana
    (consulta 3.5, alternativa B; no se implementó). Medido: a ciegas 6 de
    10 en la red más grande; con la vista previa, 9 de 10.
  - Laboratorio en ventana angosta: tiene el mismo mínimo de 600 px de red
    que Inspeccionar tenía antes de D18 y no se midió angosto (consulta 4.10).
  - La red más grande sigue cargada entre las capas ocultas aun con el
    grosor máximo de 4 px (consulta 2.6); se miró con cerebros de prueba con
    pesos al azar, no con uno grande entrenado.
  - Con el tablero en 280 px o menos, la leyenda de Inspeccionar pasa de
    cinco renglones a seis u ocho líneas; con el panel en 300 px, los
    nombres "Neuronas de la capa 1" y "Tasa de aprendizaje" del Laboratorio
    se parten en dos líneas dentro de su renglón.
  - Con el filtro de conexiones y una neurona elegida, el camino hacia atrás
    elige por lo que aporta cada conexión, y sin elección el filtro elige por
    |peso|: cada escenario se cumple en su caso, pero son dos criterios.
  - En Competir (fuera de este cambio): "Choques" sale 6 px de su caja y, a
    1236×863, el nombre de la pista se corta (117 de 97 px).
  - Sin probar: lector de pantalla real, Safari y Firefox, y una persona
    eligiendo líneas (la prueba de la 3.5 fue una simulación).
  - Fuera de alcance: minimapa, histogramas de pesos por capa, ordenar o
    arrastrar neuronas, comparar dos neuronas, exportar la red como imagen,
    historia de la actividad de una neurona y mapas en Inspeccionar.

- **Inspeccionar: lo que quedó sin medir o consultado.** Del cambio
  `pestana-inspeccionar`:
  - Fluidez sin medir en cuadros por segundo (tareas 2.3, 4.6 y 6.6): el panel
    del navegador estuvo oculto. Como sustituto se midió el tiempo de dibujo
    por cuadro con la red más grande (20 sensores, tres capas de 16): diagrama
    1,1 a 1,3 ms de mediana, tabla 0,7 ms, ola de una capa a 10 pasos por
    segundo 1,1 ms (p95 2,3 ms). Falta medir diez segundos de cuadros por
    segundo en cada caso (mínimo 55).
  - Con 20 sensores en la escena chica de 340 × 220, las manijas vecinas quedan
    a 6 px: se agarra la más cercana, pero no miden 24 px sin encimarse (el
    deslizador de la tarjeta de la entrada es la alternativa).
  - Fuera de alcance, para Laboratorio o más adelante: guardar una red
    modificada como cerebro, comparar dos redes, mapas de respuesta, agregar o
    quitar neuronas, seguir en vivo un entrenamiento y una tercera vista con
    los pesos sobre el abanico de sensores.
  - Sin probar: lector de pantalla real, Safari y Firefox.

- **Lo que quedó fuera de `operacion-por-operacion`.** Cada cosa, con su propia
  propuesta:
  - saltear los aportes que valen cero, para acortar el recorrido de a
    operaciones (la red 6 → 6 → 4 tiene 146 operaciones por cuadro);
  - que la vista se acerque sola a la neurona en curso;
  - el mismo desglose de a una operación en la ida del Laboratorio (hoy se ve
    como siempre);
  - volver cuadros hacia atrás: "Atrás" deshace dentro del cuadro y no guarda
    los cuadros anteriores.
  - Sin medir o sin probar:
    - lector de pantalla real (se leyó el texto del anuncio, no se oyó);
    - Safari y Firefox;
    - fluidez con el navegador a la vista (las medidas son de Chrome sin
      ventana);
    - "Activación con tanh" en el navegador: el cerebro de ejemplo usa
      escalón en la oculta; el escenario está cubierto por las pruebas.
  - "Eliminar" en la biblioteca pasa el foco a "Cancelar" y no lleva
    `data-focus="keep"`. Por el mismo camino que "Renombrar", un clic con el
    mouse devolvería el foco al escenario; no se probó.

- **Lo que quedó de `sin-destellos-en-la-red`** (17 de noviembre de 2026).
  Lo que titubea se ve quieto, rayado y con su promedio (`flash-guard.js`).
  - Sin probar: con el navegador a la vista (todas las medidas, con Chrome
    sin ventana), con un lector de pantalla real (", titubea" en las teclas,
    "Titubea" en el nombre de las neuronas), Safari y Firefox. Tampoco con el
    cerebro "5s - traffic" de la captura del dueño (no estaba guardado en el
    navegador de prueba) ni con el Laboratorio aprendiendo de una grabación
    propia (se midió con el maestro de ejemplo).
  - Sin medir cuadro a cuadro: el brillo de las conexiones (pasan por la
    guarda, pero la medida es de neuronas y teclas), las marcas del flujo que
    aparecen y se van en una conexión cuyo aporte salta entre cero y su peso,
    y el contorno de una neurona del Laboratorio cuando su sesgo cambia de
    signo de una época a la otra. Son elementos finos; la pauta de destellos
    mira áreas grandes, pero conviene medirlos.
  - Sin guarda: las teclas de Reglas a mano (siguen a las reglas, que pueden
    cambiar de idea en cada cuadro) y el resaltado de las líneas que se
    cumplen en su editor. Sin medir; las de El problema siguen a la persona.
  - La medida cuenta un cambio grande por recorrido (de la mitad del rango
    entre el menor y el mayor brillo desde el último contado) y mira el
    relleno, arriba del número: el número no entra en la cuenta. Con el
    número normal, su color seguía al relleno y destellaba; ahora el de lo que
    titubea es fijo.
  - En las neuronas chicas del Laboratorio a 1366×768 (radio ~16 px),
    "≈ −0,17" sobresale un poco del círculo; se lee por el borde del fondo.
  - No tocado: el rótulo bajo el cursor que queda debajo de las pastillas de
    las perillas (nota en *Laboratorio y compuertas*) sigue igual; este cambio
    solo le sumó la explicación del rayado.

- **Lo que quedó de `manejar-vos-en-inspeccionar`** (17 de noviembre de 2026).
  El mundo de Inspeccionar usa un controlador con observador
  (`createObservedController`): la red siempre calcula; maneja ella o el
  teclado.
  - Sin probar: con el navegador a la vista (todo se verificó con Chrome sin
    ventana y teclas por CDP; el panel integrado estaba oculto y ahí los
    cuadros se frenan), con un lector de pantalla real (los anuncios de "Vos"
    y "La red", las marcas "coinciden" / "no coinciden" y el aviso de la
    escena), con teclados de otras distribuciones (W A S D van por posición
    física), Safari y Firefox.
  - Las marcas ✓ / ✗ y el contorno punteado de lo que no coincide siguen
    también a las teclas de la persona, sin guarda de destellos (como la fila
    "Vos"): zigzagueando cuatro veces por segundo, una marca cambió hasta 12
    veces en un segundo. Son elementos chicos y los provoca la persona; la
    tecla de la red que titubea sí pasa por la guarda y su marca es ≈.
  - La escena se enfoca con un clic o con "Manejar vos", no con Tab
    (`tabindex="-1"`, a diferencia de D3): con Tab la auditoría le pide un
    tooltip, que aparecería al posar el cursor en toda la escena. Con el
    teclado se llega a "Manejar vos", y las flechas también toman el volante
    desde el cuerpo de la página o un botón común.
  - Medido una vez y no repetido: un cuadro de 200 ms al apretar "Manejar
    vos" en la primera tanda de fluidez; en las demás, peor 16,8 ms.
  - La coincidencia cuenta los pasos del mundo con la persona manejando
    (también los de N en pausa) y vuelve a cero al tomar o devolver el volante
    y al rearmar el mundo, no al chocar.

## Entrenar, tráfico y aprendizaje

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

- **Fluidez con paisaje y circuitos sin medir.** La tarea 10.1 de
  `circuitos-y-paisaje` quedó sin hacer porque el panel del navegador estuvo
  oculto (sin cuadros no hay medida que valga). Falta medir, diez segundos
  cada una y con el paisaje encendido: un auto en la calle recta y en el gran
  premio (mínimo 55 cuadros por segundo) y una población de 100 en la calle
  recta y en el gran premio (mínimo 50).

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

## Competir y circuitos

- **Lo que quedó fuera de `pestana-competir`** (noviembre de 2026), cada cosa con
  su propia propuesta: que los competidores se choquen entre sí; elegir la
  cantidad de vueltas o la distancia; semáforo de largada, bandera, podio y
  repetición; configurar los 5 s sin avanzar y los 20 s de espera; una
  biblioteca de programas de Reglas a mano con nombre; guardar los resultados
  entre visitas; evaluar en las cuatro pistas con un solo botón; editar o
  seguir entrenando los ejemplos; más de seis competidores; los programas de
  3 y 20 sensores como competidores; quitar de la barra el tráfico en un
  circuito (hoy se ve deshabilitado en las cuatro pestañas).

- **Lo que quedó sin medir o débil en `pestana-competir`:**
  - El ejemplo "Calle, mismo tráfico" no muestra haber memorizado: en diez
    tráficos nuevos choca 0,2 veces en promedio contra 0,1 del de tráfico nuevo
    (la comprobación se cumple por un choque) y, con densidad 100 % o
    irregularidad 50 %, choca igual o menos. Los de la calle llegan sin chocar
    en los tres circuitos. El contraste que sí se ve es el del óvalo en la
    calle (12 a 15 choques por carrera).
  - Fluidez con seis competidores en el circuito de curvas (mínimo 55 cuadros
    por segundo, tarea 10.3): **sin medir**, porque el navegador estuvo oculto
    (1,5 cuadros por segundo). Sustituto medido: dibujar un cuadro tarda 0,16
    ms de media y 0,5 ms como máximo, y un paso de la carrera 0,04 ms. Queda
    como verificación del dueño: abrir Competir con el navegador a la vista,
    seis competidores en el circuito de curvas, sensores y paisaje, y medir
    diez segundos.
  - Límite conocido (lista con solo los que corren, grupo 12): a 1366×768 el
    panel de Competir se desplaza hasta 126 px con seis competidores sin "Vos"
    y el panel en 360 px (88 px con "Vos"; 14 px con tres sin "Vos"; con el
    panel en 400 px, hasta 106 px), y el tablero hasta 33 px. A 1440×900, el
    panel no se desplaza con tres ni con seis competidores. El tablero, a
    1440×900, se desplaza de 51 a 74 px con seis cerebros de nombres de 40
    caracteres sin "Vos" (la tabla por pista crece con los nombres partidos).

- **Ideas que quedaron fuera de la lista de competidores de Competir:** buscar
  por nombre en el selector para agregar (con veinte cerebros alcanza con
  desplazarse; haría falta con muchos más), y una biblioteca de programas de
  Reglas a mano con nombre (compite solo el programa actual).
  - Sin probar con un lector de pantalla real, en Safari ni en Firefox.
  - La persona que maneja a 15 m/s en el óvalo queda fuera por la espera de
    20 s al 98 % (medido con un manejo simulado).

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

## Reglas a mano

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

## Biblioteca de cerebros

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

## Ayudas, guía y accesibilidad

- **Lo que quedó de `tarjeta-de-consigna`** (17 de noviembre de 2026).
  - Un lector de pantalla que recorre todo el panel lee la misión en curso
    dos veces: en la tarjeta y en la lista. Aceptado en Risks.
  - La consigna repite parte del texto largo en Reglas a mano ("Cambiá un
    número…") y en Inspeccionar ("Pausá… avanzá de a un paso"). Recortar los
    textos largos queda para `vocabulario-escalonado` o el recorrido guiado.
  - Costo medido a 1366×768: en Reglas a mano y Competir, la columna pide
    75 px al final (la lista de misiones); en Entrenar, la vista de
    entrenamiento pasa de 757 a 860 px. En Inspeccionar con una neurona
    elegida la tabla pedía 51 px: lo resolvió el grupo 5 (abajo).
  - En Inspeccionar y el Laboratorio, con una neurona o una conexión elegida,
    la tarjeta cede su lugar y vuelve al soltar (decisión del dueño, grupo 5;
    una tarjeta compacta, sin la misión, ganaba solo 26 de los ~78 px que
    faltaban). Así la tabla de la neurona entra sin desplazar a 1366×768. En
    el Laboratorio, mientras dura la elección, la misión no se ve en ningún
    lado (la lista también se oculta); el dueño lo aceptó.
  - En Inspeccionar y el Laboratorio, con la guía apagada, la tarjeta entera
    se oculta (no tiene marcha; si no, quedaba una caja vacía).
  - `consigna.lab.gates` nombra Reproducir ("…o tocá Reproducir abajo de la
    red"), distinto del texto de partida de D3, para que las tres consignas
    del Laboratorio nombren la marcha como pide la spec.
  - Sin medir: un lector de pantalla real (solo el árbol de accesibilidad del
    navegador), el estado de carrera terminada en Competir, el atajo de la
    marcha de Competir en el navegador y personas reales leyendo la tarjeta.
  - Revisión del dueño (grupo 6): dos alturas de botón (36 y 24 px), tarjeta
    con fondo más claro y barra lateral, texto largo plegado bajo "Más sobre
    esta pestaña" y Tráfico nuevo fuera de la tarjeta. Quedó: a 1366×768 la
    columna todavía pide desplazar 66 px en Reglas a mano, 44 en Competir y
    232 en Entrenar (la tarjeta entra entera en todas). Compactos además de las
    barras de D8: Cambiar y Apagar en Inspeccionar y el Laboratorio (decisión
    del dueño, para que la tabla de la neurona entre), los avisos sobre la
    escena de Inspeccionar, las filas de la biblioteca de cerebros y la barra
    de arriba de la app. El fondo de la tarjeta da 1,31:1 contra el panel: en
    grises la distingue la barra. `consigna.lab.gates` se acortó para entrar
    en dos renglones con la letra de 17 px. Sin probar: el pliegue con teclado
    y lector de pantalla reales, y una captura en escala de grises.

- **Lo que quedó de `jerarquia-de-botones`** (17 de noviembre de 2026).
  - Las barras de "Lo que perciben los sensores" usan `--color-sensor`, el
    mismo azul que la acción principal. En escala de grises quedan en un gris
    parecido al de la acción principal. Quien entienda "azul = tocá acá" puede
    buscarlo en los sensores. Ver con el dueño si los sensores necesitan otro
    tono (Risks del cambio).
  - Las barras de progreso de las misiones se rellenan con `--color-accent`,
    el mismo azul. `mlLab.auditHierarchy()` cuenta solo los controles y lista
    estas dos barras aparte, como marcas, sin avisar.
  - La salida encendida usa la alternativa de Risks: gris claro con contorno
    blanco y negrita. El blanco pleno de la neurona activa llamaba más la
    atención que la acción principal (15,1:1 contra 5,3:1). El dueño eligió el
    gris (17 de noviembre de 2026); las capturas con el blanco quedaron en
    `borradores/jerarquia-de-botones/tecla-blanca/`.
  - Por eso la tecla encendida ya no usa el mismo blanco que la neurona activa
    del diagrama (`--color-neuron-active`). El vínculo entre las dos queda solo
    en el contorno blanco (`--color-output-on-border`).
  - El fondo de la opción elegida se distingue poco en luminancia de uno sin
    elegir (1,39:1). La marcan el contorno de 2 px y la negrita. Si en clase
    no alcanza, subir el tono de `--color-selected-bg`.
  - La acción principal quedó en 40 px de alto. La barra de marcha de
    Inspeccionar y del Laboratorio pasó de 69 a 81 px, y la red de arriba
    perdió esos 12 px.
  - Sin probar: lector de pantalla real, Safari y Firefox; la "i" de
    Créditos por debajo de 1240 px; las fichas de curva elegidas; los atajos
    R, E, Z y N uno por uno (no se tocaron sus manejadores). `.compete-check`
    tiene regla de opción elegida, pero ningún elemento la usa hoy.

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

- **Tooltips: lo que quedó del cambio `tooltips-con-calma`** (14 de noviembre de
  2026). Ya no aparecen al apretar ni al arrastrar y esperan 0,7 s. Desde
  `interruptor-de-ayudas` los gobierna su propio interruptor, "Ayudas", y no
  la guía.
  - Sin medir: que 0,7 s sea la espera que deja de molestar. Es una constante
    (`SHOW_DELAY_MS`); el dueño la prueba.
  - Fuera de alcance: tooltips que se cansan solos, tooltips en dos tamaños y
    una tecla o un modo "¿qué es esto?".
  - Sin probar: con un lector de pantalla real; el arrastre de dos segundos se
    probó con eventos de puntero simulados, no con el mouse.

- **Lo que quedó de `interruptor-de-ayudas`.**
  - Con las ayudas apagadas, un lector de pantalla lee el nombre de cada
    control y no su explicación: el tooltip es la descripción accesible
    (`aria-describedby`) solo mientras está a la vista. Por defecto están
    encendidas.
  - A 1032 px de ancho la barra de pestañas sigue desplazándose por dentro: 66
    px en español y 11 en inglés quedan fuera (antes de "Ayudas", 67 y 21).
    Salidas posibles: un segundo renglón para las herramientas o un menú de
    preferencias.
  - Sin probar: lector de pantalla real, Safari y Firefox.
