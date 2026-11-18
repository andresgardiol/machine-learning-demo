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

El 17 de noviembre, `misiones-que-muestran-el-control` (commits 11c6034 a
cfbd6f1). Junto a la misión en curso de la
tarjeta, "Mostrame" lleva al control con que se cumple: cambia de vista o
desplaza, lo marca con un anillo amarillo quieto 4 s y le pasa el foco. Medido
sin ventana en las 18 misiones con control, a 1440×900 y 1366×768; la tarjeta
entra entera. El dueño aceptó las cinco decisiones de la implementación y lo archivó el
mismo día: pausar en Inspeccionar para mostrar el valor a mano, abrir la tarjeta
del programa si está plegada, el primer peso con XOR antes de la explicación,
el anillo como `box-shadow` y el nombre corto que se anuncia.

El 18 de noviembre, `sistema-de-diseno-base` (cambio 0 de la revisión del sistema de diseño,
  punto 2 de la *Prioridad 1*): hecho y archivado el 18 de noviembre de 2026.
  El antes y el después están en `borradores/sistema-de-diseno/comparacion.md`
  (local). Es la propuesta B (Roles del contrato), con:
  - el celeste `#a5e4ff` para "entra";
  - tokens en tres capas;
  - cuatro tamaños de letra a la vista (12, 14, 16 y 20, más 13 de código);
  - tres alturas (24, 32 y 44);
  - espaciado de 4 a 32 px y tres radios;
  - los estados *se cumple*, *error* y *choque*, cada uno con su forma;
  - la acción terciaria y los deslizadores de la app;
  - rótulos de rol que se apagan con la guía;
  - `mlLab.auditSistema()`.

  Medido sin ventana: `mlLab.auditSistema()` da 0 problemas en las ocho vistas
  de D3, a 1440×900 y a 1366×768. Lo que quedó:
  - a 1366×768, el tablero de Reglas a mano desborda 71 px (37 en el commit de
    partida), por las alturas y la letra nuevas;
  - las acciones terciarias (Exportar, Importar, "Mostrame", "Más sobre esta
    pestaña") se ven como texto suelto y no anuncian que se tocan hasta pasar
    el cursor (observado, sin medir);
  - en la "Red del líder" de Entrenar, el contorno celeste de las entradas casi
    no se ve: las tapa el relleno del valor (observado).

  Lo que no se pudo medir:
  - Firefox (no está instalado);
  - el uso con un lector de pantalla;
  - el clic real con el mouse (se probó con clics programáticos y con el
    teclado por el protocolo de Chrome).

  Sigue `reglas-mesa-de-trabajo`, que ya puede usar la acción terciaria, las
  tres alturas, los estados y los rótulos.

El 18 de noviembre, `reglas-mesa-de-trabajo` hecho y archivado el 18 de noviembre de 2026.
  El antes y el después están en `borradores/reglas-mesa-de-trabajo/comparacion.md`
  (local).
  Cambio 1 de Reglas a mano. Dos zonas solo en esta pestaña (sin panel): el
  escenario, de 520 px, con la escena, la columna de percepción al costado
  (una fila por sensor que escribe su comparación en el editor al tocarla) y
  la marcha debajo; y el tablero, con la consigna, el programa (el grupo de
  sensores y los ejemplos en su cabecera; el editor ocupa el alto que queda) y
  las misiones. La paleta, sin sensores ni `velocidad`. Hubo una parada en la
  tarea 3.4: con la percepción debajo de la escena, la escena medía 229 px a
  1366×768; el dueño eligió la columna al costado.

  Medido sin ventana (`capturar.mjs`): a 1366×768, escena de 547 px de alto
  (unos 300 de ancho) y 15 líneas del editor (antes 8); a 1440×900, 679 px y
  22 líneas. `auditSistema()` y `auditHierarchy()`: 0 problemas en las 12
  vistas de 1440 y 1366. Lo que quedó:
  - **800×600 no funciona bien:** las zonas siguen lado a lado, pero el
    escenario mide 300 px y la columna 220, así que la escena queda en unos
    80 px de ancho, los controles de cámara se salen y la marcha se parte en
    renglones (5 problemas de altura de `auditSistema()`). Hace falta otra
    disposición de la zona para escenarios angostos (por ejemplo, la columna
    debajo de la escena por debajo de cierto ancho).
  - Retoques de la revisión del dueño (grupo 7): la ayuda de Sensores ya no
    habla del tablero, las filas que insertan llevan un "+" tenue y la delta
    de `jerarquia-visual` suma las filas de percepción y el renglón de
    interruptores a las barras densas, igual que el auditor.
  - `help.mission.reveal.why` dice "sin buscar por todo el panel", y Reglas a
    mano no tiene panel (se dejó: la ayuda es de las seis pestañas).
  - El aviso de choque queda apretado en una escena de 300 px; lo rediseña
    `reglas-el-choque-ensena`.

  Lo que no se pudo medir: con el navegador a la vista (el panel estaba
  oculto; todo se probó en Chrome sin ventana, con clics programáticos y
  teclas por el protocolo de Chrome); "Mostrame" de "Superá 10 en 3 tráficos
  distintos"; lectores de pantalla; Firefox.

  Sigue `reglas-el-choque-ensena`.

El 18 de noviembre, `reglas-el-choque-ensena`, hecho y archivado el mismo día.
  El antes y el después están en `borradores/reglas-el-choque-ensena/comparacion.md`
  (local).
  Cambio 2 de Reglas a mano. Al chocar, la columna queda congelada, el editor
  marca con el estado "choque" (rayado y ✸) las líneas que se cumplían, y una
  tarjeta del caso ocupa el lugar de la marcha. La tarjeta tiene la cuenta
  regresiva de 5 s, "Compará con los ejemplos" (acción principal), "Escribir
  una regla para este caso" y Reiniciar. Además: la repetición de 3 s grabada
  mientras el auto anda; la comparación en el mismo tráfico, por tramos, en la
  tarjeta del programa; los ejemplos sin confirmación, con "Tu programa"; y el
  cuaderno de casos (con la guía).

  Medido sin ventana (`capturar.mjs` y sondas): a 1366×768 la escena mide
  479 px con el caso y el cuaderno (antes 547; el mínimo era 450) y el editor
  sigue en 15 líneas. Fluidez mientras se calcula la comparación
  (`medir-fluidez.mjs`, Chrome sin ventana en tiempo real): 60 cuadros por
  segundo, ningún cuadro de más de 16,8 ms, 350 ms en total. Comparación con
  la semilla 2: inicial 82 m (1 regla), 3 sensores 1224 m sin chocar, 7
  sensores 1041 m (5 reglas), 20 sensores 290 m (9 reglas).
  `auditTooltips()`, `auditSistema()` y `auditHierarchy()`: 0 problemas, en
  español y en inglés. `npm test`: 0 fallas. Lo que quedó:
  - "Comparar" quedó en el renglón de arriba de la cabecera y no junto a los
    ejemplos (D4): ahí partía el renglón y le quitaba 2 líneas al editor.
  - Con la comparación abierta a 1366×768 el editor baja a su mínimo y el
    tablero se desplaza.
  - Con el caso a la vista no se ven Reintentar solo ni los interruptores de
    vista (la tarjeta reemplaza a la marcha, D1).
  - La regla para el caso sin sensores por encima de 0,3 puede escribir
    `sensor1 > 0,00`.

  Lo que no se pudo medir: con el navegador a la vista (el panel estaba
  oculto), así que la fluidez es de Chrome sin ventana; un choque antes de
  los 3 s; "Ninguna regla se cumplía" en la pestaña; Ctrl+Z con el teclado
  real; borrar el cuaderno al cambiar de pista desde la barra; lectores de
  pantalla.

  Sigue `reglas-como-fichas`.

El 18 de noviembre, `reglas-como-fichas`, hecho y archivado el mismo día. El
  antes y el después están en `borradores/reglas-como-fichas/comparacion.md`
  (local). Cambio 3 de Reglas a mano, y con él se cierra la revisión de Reglas
  a mano. La vista de fichas es la que se abre por defecto y "Texto" está a un
  toque (se recuerda). Cada edición es un parche del texto por el deshacer del
  editor. Se puede cambiar el dato, el comparador, el umbral (deslizador con la
  marca del valor en vivo, o escrito) y la acción, agregar y borrar, reordenar
  (arrastre o Alt+flechas) y mover las constantes. Lo demás (`o`, `no`,
  paréntesis, comentarios dentro) va como ficha escrita a mano. Por decisión
  del dueño, los ejemplos de 7 y 20 sensores ya no usan `o`: cada regla se
  partió en una por alternativa, con la misma distancia. Pasan de 5 a 7 y de
  9 a 22 reglas, y "casi el doble" pasa a ser "más del triple".

  Medido sin ventana: fluidez con el de 20 sensores, 60 cuadros por segundo
  (máx. 16,8 ms) en fichas y en texto. Las tres auditorías dan 0 en las 22
  vistas, en español y en inglés. La vista de texto mide lo mismo que antes
  (15 y 22 líneas). La cabecera sigue en un renglón. `npm test`: 1421, 0
  fallas. Lo que quedó:
  - a 1366×768 con la guía y el de 20 sensores, la pila mide 290 px y solo
    entra entera la primera ficha (las 5 constantes y dos comentarios ocupan
    el resto);
  - "+ acción" es un botón «+» que abre el selector (como selector suelto
    partía la regla inicial en dos renglones);
  - la orden suelta cuenta como "regla" en el rótulo del asa;
  - un programa recordado con el texto viejo de un ejemplo se ve como "Tu
    programa".

  Lo que no se pudo medir: con el navegador a la vista (el panel estaba
  oculto, así que el arrastre y la fluidez son de Chrome sin ventana, con
  eventos del protocolo); Cmd+Z con un teclado real; lectores de pantalla;
  Firefox y Safari (`<select>` nativos, `showPicker`).

  Revisión del dueño (grupo 6, mismo día):
  - El error de `cerca = 0,24costado = 0,5`: la vista previa del arrastre
    proyectaba las fichas desde su propio texto, y el parche usaba esas
    columnas sobre el texto del editor. Corregido: cada lugar se ubica por
    línea y orden del token y se comprueba antes de escribir; un parche nunca
    lanza, y un error de una ficha no detiene la pestaña. Lo prueban 360
    arrastres al azar y el caso exacto.
  - Más lugar para las fichas: la franja de programas con superados en lugar
    de los botones de ejemplos, la tabla cerrada y flotante, controles de 24 px
    y constantes en un renglón. A 1366×768 con la guía se ven 6 de 7 reglas
    con 7 sensores y 4 de 22 con 20 (antes, 1 ficha entera). Auditorías en 0.

El 18 de noviembre, `entrenar-red-primero` (cambio 0 de la crítica de Entrenar),
  hecho y archivado el mismo día. El antes y el después están en
  `borradores/entrenar-red-primero/comparacion.md` (local). La red del líder es
  la primera tarjeta del tablero y la lista de misiones va plegada en un
  renglón "Todas las misiones · N de 4" al final del panel. Medido con el
  guion: a 1440×900 el panel pasa de desbordar 126 px a 0, en español y en
  inglés y después de guardar, sin un píxel de sobra. `npm test`: 1428, 0
  fallas. Lo que quedó:
  - a 1366×768 los dos lienzos miden 120 px y el panel desborda 252 px (lo
    resuelve `entrenar-mesa-de-trabajo`);
  - `auditSistema()` da 1 problema después de guardar: el botón Renombrar del
    resultado mide 24 px (ya estaba antes);
  - sin probar: lector de pantalla, Firefox y una ventana visible.

## En curso

Nada.

## Para probar a mano (dueño)

- Compuertas: los escenarios en que la red tiene que aprender ("Aprende al
  reproducir", "Con la capa oculta", "Trabada en un mínimo local",
  "Aprendiendo tampoco", "De corrido"). Detalle en *Laboratorio y
  compuertas*.
- Fluidez con el navegador a la vista: casi todas las medidas se tomaron con
  Chrome sin ventana. Lista de qué medir en *Pruebas que faltan*, más abajo.
- "Mostrame" (`misiones-que-muestran-el-control`): con VoiceOver, que anuncie
  «Se muestra: …» y quede sobre el control (se leyó el árbol de accesibilidad,
  no se escuchó); con el navegador a la vista, el anillo y el desplazamiento
  suave; Reglas a mano con la tarjeta del programa plegada (no se probó).

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
     que resalta el control que hay que tocar. Hecho (ver *En curso*).
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
   - Dejado por `misiones-que-muestran-el-control` para esta revisión: el color
     del anillo de "Mostrame" (`--color-reveal`, el amarillo de "en curso" de la
     red, que también es el del competidor 3 en la escena) y el botón compacto
     de 24 px en la tarjeta, una excepción a "la compacta solo en las barras
     densas". Con el botón, el nombre de la misión pasa a dos renglones en
     Reglas a mano, Inspeccionar y el Laboratorio con puntos o tu manejo, y la
     tarjeta crece 18 px (medido en la comparación).
   - Qué entregar: la crítica con evidencia (capturas, controles), un sistema
     de diseño (niveles de botón, tipografía, espaciado, superficies y
     estados) separado de lo propuesto para Reglas a mano, y de ahí propuestas
     de OpenSpec. Lo que ya fijan `jerarquia-visual` y `consigna-de-pestana`
     es punto de partida, no límite.
   - **Hecho (17 de noviembre de 2026): la crítica de Reglas a mano**, con
     las dos skills. Está en `borradores/sistema-de-diseno/critica-reglas-a-mano.md`
     (local) y trae tres propuestas para la pestaña. Al dueño le gustaron las
     tres y se acordó hacerlas en secuencia, cada una con su OpenSpec y sus
     capturas del antes y del después:
     0. `sistema-de-diseno-base` (M, transversal): tipografía, alturas de
        control, botón terciario, un color con un solo significado,
        superficies y los estados *se cumple*, *error* y *choque*. Su diseño
        trae tres propuestas de sistema, a pedido del dueño.
     1. `reglas-mesa-de-trabajo` (M): dos zonas (el auto y el programa), la
        percepción pegada a la escena, Rayos en la cabecera del editor y un
        clic en una barra que inserta el sensor con su valor.
     2. `reglas-el-choque-ensena` (L): el choque se congela, con repetición,
        una tarjeta del caso, "Escribir una regla para este caso" y un
        cuaderno de casos contra reglas.
     3. `reglas-como-fichas` (L+): un editor de fichas como segunda vista del
        mismo programa; el texto sigue siendo la fuente de verdad.
     4. `modo-proyector` (L, después de `reglas-mesa-de-trabajo`): la
        propuesta C de `sistema-de-diseno-base`, con una escala para proyectar
        en un aula y un interruptor para el mentor. Se descartó del cambio 0
        porque a 1280×720 rompía la disposición en las ocho vistas medidas
        (`borradores/sistema-de-diseno/muestras/comparacion.md`). Necesita
        decidir qué se pliega en modo proyector.
     Para el cambio 0, el dueño eligió la propuesta B (Roles del contrato) con
     el celeste `#a5e4ff` para "entra" (17 de noviembre de 2026).
     Decisiones pendientes, una por cambio: si la marcha sigue siendo la
     acción principal en Reglas a mano, si Reintentar solo viene apagado,
     si el orden nuevo se lleva a todas las pestañas y qué vista se abre por
     defecto con las fichas.
   - **Hecho (18 de noviembre de 2026): la crítica de Entrenar**, con las
     mismas dos skills. Está en `borradores/sistema-de-diseno/critica-entrenar.md`
     (local). Medido: a 1440×900 el panel desborda 126 px (865 en 739), en
     contra de *Panel a la vista sin desplazarse*; la marcha desaparece al
     pasar a Ajustes o Cerebros; a 1366×768 la red mide 120 px de alto. Por
     pedido del dueño, Claude eligió el orden y las decisiones, que el dueño
     puede revertir (tabla en §6 de la crítica):
     0. ~~`entrenar-red-primero`~~ (S, hecho el 18 de noviembre): la red del líder arriba de la curva (el
        pedido de *Entrenar, tráfico y aprendizaje*) y el arreglo del
        desborde del panel.
     1. `entrenar-mesa-de-trabajo` (M): sin panel, como Reglas a mano; barra
        de transporte bajo la escena, "Probá esto" junto a la curva y "Más
        ajustes" plegado.
     2. `entrenar-la-generacion-ensena` (L): corte de unos 2 s al fin de cada
        generación (salteado a 4× o más), tarjeta de generación, los pesos que
        mutaron en la red y marcas de ajuste en la curva.
     3. `entrenar-mutacion-a-la-vista` (S–M): trazo fantasma en la red al
        mover la fuerza de mutación.
     Sigue esperando al dueño: el artículo de jerarquía visual y la tabla de
     "Probá esto".
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

- **Más atajos de teclado y un cheatsheet.** Pedido del dueño (17 de
  noviembre de 2026), para después.
  - Qué: entrar a cada pestaña con los números del 1 al 6, que ya son los
    números que muestra la barra de pestañas; y una hoja de atajos
    (cheatsheet) que liste todos los atajos de la pestaña y los globales.
  - Lo que dice el código hoy (medido): ninguna tecla de número está tomada
    como atajo en `src/`.
  - A tener en cuenta (hipótesis, sin probar):
    - los números son atajos de una tecla, así que entran en el interruptor
      "Atajos" de `accesibilidad`: apagado, no tienen que dispararse;
    - no tienen que disparar con el foco en un campo de texto, sobre todo en
      el editor de Reglas a mano, donde se escriben números;
    - el cheatsheet necesita cómo abrirlo (por ejemplo, con "?" o con un
      botón en la barra de arriba), textos en español e inglés, y mostrar solo
      lo que vale con los atajos encendidos;
    - conviene juntarlo con lo pendiente de atajos de *Prioridad 2* y de
      *Entrenar, tráfico y aprendizaje*, como los tooltips que nombran la
      tecla con los atajos apagados.
- **Lavado de cara con dirección de arte.** Pedido del dueño (18 de noviembre
  de 2026), dejado para después de los cambios de Reglas a mano: "esperaba un
  cambio más notable [...] mi idea original era ver si con las skills de UX y
  diseño lográbamos un lavado de cara interesante".
  - Por qué `sistema-de-diseno-base` no lo dio (análisis de Claude): ordenó lo
    que había, sin cambiar el esqueleto. La escena ocupa una columna de 400 px
    y el resto son unos 60 controles en cajas con contorno. Las tres muestras
    solo variaban el color, y las skills que se usaron son de usabilidad, no
    de dirección de arte.
  - Propuesta (hipótesis, sin probar): primero ver, después especificar. Tres
    maquetas de una pestaña entera con `assets/og-image.png` como referencia
    y los tokens nuevos, con la skill `frontend-design`. Con la que elija el
    dueño, un OpenSpec de dirección de arte:
    - la escena como protagonista, más grande, con los paneles más angostos
      o flotando;
    - el dibujo con volumen y brillo (ver el ítem del auto, abajo);
    - menos controles a la vista, junto con `barra-de-escenario-plegable` y
      `ajustes-por-niveles`;
    - agrupar con superficies y espacio en vez de contornos. Choca con el
      contorno de 3:1 que pide `accesibilidad` para reconocer un control.
  - Va antes o junto con los cambios que tocan la disposición.
- **Un auto que se parezca al de la vista previa.** Pedido del dueño (18 de
  noviembre de 2026): "Me encantó la imagen para las previews del link. Me
  gustaría que el auto se asemeje más al de la imagen". La imagen es
  `assets/og-image.png` (la que muestran los enlaces compartidos).
  - Lo que se ve en la imagen (observado en una captura que mandó el dueño):
    un auto verde de líneas redondeadas, con volumen (luces y sombras sobre la
    carrocería), parabrisas y luneta oscuros, y un halo de luz en la trompa de
    donde salen los rayos de los sensores, que también brillan.
  - A tener en cuenta (hipótesis, sin probar):
    - es solo el dibujo: el tamaño y la forma de choque del auto en la
      simulación no cambian (Art. 7: lo que se ve tiene que seguir siendo lo
      que se calcula);
    - el auto se dibuja muchas veces por cuadro en Entrenar (toda la
      población), así que el dibujo nuevo tiene que medirse contra la fluidez
      (Art. 10). Quizás conviene un dibujo rico para el auto que se sigue y uno
      simple para el resto;
    - los colores siguen siendo los de `tokens.css` (el verde del auto, el rojo
      del choque, el violeta de la élite y el celeste de "entra" para los
      rayos, de `sistema-de-diseno-base`). El brillo no puede pasar el límite
      de destellos de `accesibilidad`;
    - el auto chocado, la élite y los competidores numerados de Competir
      tienen que seguir distinguiéndose sin depender del color.
- Cerebros incluidos elegidos por el dueño.
- Elegir con un clic qué auto seguir en el entrenamiento.
- Entrenar en segundo plano (Web Worker).
- **Tráfico menos regular y con variedad de vehículos** (importante para el
  dueño, 18 de noviembre de 2026). Detalle en *Entrenar, tráfico y
  aprendizaje*, "Tráfico menos regular".
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

- **Zoom en la escena chica de Inspeccionar y del Laboratorio.** Pedido del
  dueño (18 de noviembre de 2026), con una captura de Inspeccionar: "la
  preview tanto de la tab 5 como la 6 deberían poder hacer zoom in y out".
  - Choca con la spec: `pestana-inspeccionar`, requisito "Escena del auto en
    segundo plano", dice que la escena se encuadra para que se vean los rayos
    y lo que tocan, "sin controles de cámara". Hay que modificar ese
    requisito, y su equivalente en el Laboratorio si lo hay (a revisar en
    `pestana-laboratorio`).
  - A tener en cuenta (hipótesis, sin probar):
    - usar los mismos controles de cámara que el resto (+, − y restablecer la
      vista, con la rueda del mouse), por el Art. 9 y por `vista-escenario`;
    - la escena es chica: los botones tienen que entrar sin tapar el auto ni
      "Manejar vos", y respetar los 24 px de `accesibilidad`;
    - el zoom por defecto tiene que seguir mostrando enteros los rayos (el
      escenario "Encuadre"), y restablecer la vista vuelve a ese encuadre;
    - la rueda del mouse sobre la escena no tiene que mover la página ni la
      red de al lado.
  - Observado de paso en la misma captura: en la tarjeta de consigna de
    Inspeccionar, la misión "Seguí la cuenta de una neurona" se parte en tres
    renglones junto a "Pendiente" y "Mostrame", porque el tablero es angosto.

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

- **La red del líder, arriba de la curva de fitness.** Pedido del dueño (18 de
  noviembre de 2026), con una captura de Entrenar: "la red debería estar
  arriba de la curva fitness, es lo más interesante de la tab. Y queda
  actualmente en un lugar menos importante de lo que debería".
  - Observado en la captura: al abrir la pestaña, la primera tarjeta del
    tablero es la curva de fitness, y está vacía ("La curva aparece cuando
    termina la primera generación"). La red del líder, que ya se mueve, queda
    debajo y se ve cortada.
  - Lo que dicen las specs hoy (`pestana-entrenar`): "Red del líder" pide una
    tarjeta plegable, visible por defecto, y el escenario "Red y curva a la
    vez" pide que, a 1440×900, las dos se vean completas a la vez. Ninguna
    spec fija el orden, así que invertirlo no contradice nada. Conviene sumar
    un escenario que fije la red primero.
  - A tener en cuenta (hipótesis, sin probar): al plegar la red, la curva
    ocupa su lugar ("Plegar el diagrama"). Con el orden invertido, la curva
    tiene que subir. También conviene medir a 1366×768 cuál de las dos queda
    cortada.
  - Es un cambio chico (S). Puede ir solo o junto con el lavado de cara.

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

- **Tráfico menos regular y con variedad de vehículos.** Pedido del dueño
  (18 de noviembre de 2026), con una captura de Entrenar en la generación 61:
  "El tráfico es demasiado regular, la densidad solo cambia cuántos van de
  costado, pero todos aparecen a la misma distancia vertical [...] no ayuda
  al auto a aprender más generalizadamente. La irregularidad solo los mueve
  unos píxeles de su carril, arriba y abajo. Además me gustaría variedad:
  camiones grandes, motos pequeñas, camionetas medianas, para que sea más
  diverso y menos aburrido". Junta y reemplaza las dos notas anteriores
  ("Más variedad en el tráfico con densidad alta" y "Otros tipos de
  vehículos").
  - Lo que dice el código hoy (leído en `src/core/traffic.js` y
    `constants.js`, sin correr):
    - el tráfico se arma en **grupos**: filas de vehículos a la misma distancia,
      uno por carril ocupado. La densidad cambia la separación entre grupos
      (de 80 m a 24 m, centro a centro) y cuántos carriles ocupa cada grupo
      (de 1 a `carriles - 1`);
    - la irregularidad mueve cada vehículo dentro de su grupo, como mucho
      `TRAFFIC_MAX_STAGGER` = 4 m (un largo de auto) hacia adelante o atrás,
      acotado además a (separación − 20 m) / 6. Con los valores por defecto
      (densidad 50 % e irregularidad 50 %) da unos ±2 m: medio auto. También
      lo corre de costado dentro del carril, y reparte un poco más desparejas
      las separaciones entre grupos;
    - todos los vehículos van a la misma velocidad (`TRAFFIC_SPEED` = 10 m/s)
      y miden lo mismo (4 × 2 m), así que el tráfico se mueve como un bloque
      rígido;
    - a densidad máxima, la separación promedio (24 m) casi coincide con el
      mínimo permitido (unos 21 m), así que el sorteo solo varía unos 3 m.
  - Por qué importa para el ADN (análisis de Claude): la etapa "¿generaliza?"
    necesita que el auto vea casos variados. Con filas a distancias parejas,
    la red puede aprender un ritmo ("cada tanto aparece una fila") en vez de
    mirar los sensores. Sirve, pero enseña menos de lo que podría.
  - Direcciones posibles (hipótesis, sin probar):
    - dejar de pensar en grupos y ubicar cada vehículo por su cuenta, con una
      regla que garantice que nunca se cierran todos los carriles al auto
      principal; o mantener los grupos pero dejar que la irregularidad los
      desarme de verdad (adelantos de varios largos, tramos cargados y tramos
      vacíos);
    - velocidades distintas por tipo o por vehículo, para que el tráfico no se
      mueva como un bloque (exige revisar que no se choquen entre sí);
    - **tipos de vehículo**: motos (angostas y cortas), autos, camionetas
      (medianas) y camiones (largos y anchos), cada uno con su contorno de
      choque y su dibujo siempre dentro de ese contorno (Art. 7). Revisar el
      hueco mínimo y el carril libre según el largo: un camión largo ocupa más;
    - un ajuste de "variedad de vehículos" en la barra de escenario, o que la
      irregularidad también la controle (a definir con el dueño).
  - A tener en cuenta:
    - determinismo (Art. 8): misma semilla, mismo tráfico. Pero cambiar cómo se
      genera cambia el tráfico de todas las semillas;
    - los cerebros guardados y los de ejemplo se entrenaron con el tráfico de
      hoy: hay que medir cuánto empeoran, y quizás volver a entrenar los de
      ejemplo;
    - varias specs dependen del tráfico actual: los escenarios de los
      programas de ejemplo de Reglas a mano ("Siete sensores supera al menos
      10"), las misiones y las medidas de aprendizaje de
      `fitness-que-premia-superar`. Hay que revisarlas con el tráfico nuevo;
    - fluidez (Art. 10): más formas para dibujar y más contornos para probar
      choques por cuadro, con toda la población de Entrenar en pantalla;
    - el sensor tiene que leer bien un vehículo angosto (moto) con pocos rayos:
      puede pasar entre dos rayos sin que lo vea, y eso también enseña algo.

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
