# Proposal

## Why

`jerarquia-de-botones` le dio un significado a cada estilo de botón, pero
debajo no hay un sistema: cada pestaña elige tamaños, alturas y colores por su
cuenta. El dueño lo dijo así: "Sigo pensando que los botones no tienen
jerarquía clara, nos hace falta un sistema de diseño". La crítica de Reglas a
mano (`borradores/sistema-de-diseno/critica-reglas-a-mano.md`) lo midió:

- en Reglas a mano hay 63 controles a la vista, con nueve botones iguales que
  hacen cosas muy distintas;
- en las seis pestañas, cada una tiene entre 9 y 11 tamaños de letra a la vista
  y hasta 10 alturas de control distintas;
- el azul `#4ea1ff` significa seis cosas: la acción, el foco, la opción
  elegida, los sensores, las palabras del editor y las barras de progreso.

Va primero porque los tres cambios que siguen para Reglas a mano
(`reglas-mesa-de-trabajo`, `reglas-el-choque-ensena` y `reglas-como-fichas`)
necesitan sus piezas: los estados *se cumple*, *error* y *choque*, el botón
terciario y un color libre para cada significado.

**Concepto que habilita.** Es infraestructura visual, no un concepto de ML
nuevo. Habilita que lo que la app dibuja sea legible sin texto: que quien
llega solo distinga lo que toca de lo que la máquina percibe y decide, y que
reconozca el choque y la regla que se cumple igual en todas las pestañas.

## What Changes

- **Tres propuestas de sistema de diseño para que elija el dueño**, a su
  pedido. Están en `design.md` (D1), con lo que cada una cumple o tensiona del
  ADN, su costo y sus riesgos:
  - **A. Instrumento.** El color es de la simulación: la interfaz es casi gris
    y la acción principal se rellena de blanco. El azul queda para el foco.
  - **B. Roles del contrato.** El color sigue al contrato de controlador:
    *vos* (lo que tocás), *entra* (lo que percibe), *decide* (programa o red)
    y *sale* (lo que acciona). Cada rol tiene un color y una forma, iguales en
    la interfaz y en el dibujo.
  - **C. Dos escalas.** Tokens en capas con una escala que cambia entera: una
    para el escritorio y otra para proyectar en una clase, con un interruptor
    para el mentor.
  **El dueño eligió B, con el celeste `#a5e4ff` para "entra"** (17 de
  noviembre de 2026, después de ver las muestras). A y C quedan en
  `design.md` como descartadas, con su motivo. C pasa a ser un cambio propio,
  después de `reglas-mesa-de-trabajo`.
- **Antes de elegir, verlas.** Cada propuesta se aplica con una hoja de estilos
  de prueba y se fotografía en las mismas vistas que el antes. El dueño elige
  mirando las capturas, no leyendo. Hasta que elija no se toca el código de la
  app.
- **Una base común a las tres**, que es lo que piden las specs:
  - tipografía de a lo sumo cinco tamaños y dos pesos, ninguno menor a 12 px;
  - tres alturas de control: grande, normal y compacta;
  - espaciado y radios tomados de una escala;
  - tres superficies con nombre (fondo, panel y tarjeta), más la escena;
  - un color con un solo significado: el relleno de la acción no se repite en
    el dibujo ni en las barras de datos, y los sensores dejan de compartir el
    azul de la acción;
  - los estados *se cumple*, *error* y *choque*, con una forma propia además
    del color, iguales en todas las pestañas;
  - deslizadores con el estilo de la app, no los nativos;
  - un quinto estilo de control, la **acción terciaria** (texto sin contorno),
    para lo que no cambia la escena: Exportar, Importar, "Más sobre esta
    pestaña" y "Mostrame".
- **Capturas del antes y del después** con un mismo guion, como en
  `jerarquia-de-botones`.

Fuera de alcance:
- el lugar de los controles y la disposición de las pestañas
  (`reglas-mesa-de-trabajo` y los cambios del análisis de UX);
- el choque que se congela y la tarjeta del caso (`reglas-el-choque-ensena`);
- el editor de fichas (`reglas-como-fichas`);
- cambiar textos, salvo los rótulos de rol de B;
- el modo proyector de C, que va como un cambio propio;
- la paleta de los competidores, la del paisaje y la de los pesos, salvo
  cuando la propuesta elegida necesite mover un color para que no choque con
  otro significado;
- el artículo de jerarquía visual para la constitución, que decide el dueño.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* Que hay una diferencia entre lo que tocás, lo
   que la máquina percibe, lo que decide y lo que acciona. Con B esa diferencia
   se vuelve explícita. Y que el choque, el error y la regla que se cumple son
   estados, y se ven igual en todas partes.
2. *¿Se entiende sin que nadie lo explique?* Esa es la prueba de cada
   propuesta: en las capturas de muestra, la acción principal y los tres
   estados tienen que reconocerse sin leer y en escala de grises.
3. *¿El mentor puede ignorarla u ocultarla?* La base no agrega nada que
   ocultar. Los rótulos de rol de B se apagan con la guía.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* No cambia el
   comportamiento de ningún control, solo su aspecto. Se vuelve atrás
   revirtiendo `tokens.css` y `app.css`, sin tocar los datos guardados.

**Público.** Los dos. El principiante gana una interfaz que se lee sin texto,
y con los rótulos ve el contrato de controlador en cada pestaña. El mentor
gana consistencia y un vocabulario común para la clase. Ningún paso nuevo en
el uso de nadie.

## Capabilities

### New Capabilities
- `sistema-de-diseno`: las piezas comunes de la interfaz y su significado:
  escala tipográfica, alturas de control, espaciado, superficies, colores con
  un solo significado, los cuatro roles del contrato con sus rótulos, los
  estados *se cumple*, *error* y *choque*, y los deslizadores.

### Modified Capabilities
- `jerarquia-visual`: de cuatro estilos de control a cinco (se suma la acción
  terciaria) y de dos alturas a tres (la grande, para la acción principal y
  para la acción de un estado).

## Impact

- `styles/tokens.css`: tokens en capas, con la escala tipográfica, las tres
  alturas, los colores de los cuatro roles y los tokens de los estados.
- `styles/app.css`: dejar 16 tamaños de letra distintos (de 8 a 22 px, sin
  contar el decorativo de 96) en cinco; los 117 rellenos, márgenes y
  separaciones en px sueltos, en la escala; los 9 radios distintos, en tres;
  y los deslizadores con estilo propio.
- `src/ui/audit.js`: `mlLab.auditSistema()`, que cuenta tamaños, pesos,
  alturas y colores en la página, como `auditHierarchy()`.
- Las clases de los botones terciarios en Reglas a mano, la biblioteca de
  cerebros y la tarjeta de consigna.
- El color de los sensores y de las entradas de la red en el dibujo (lo leen
  las pestañas desde `tokens.css`), las palabras del editor de Reglas a mano,
  quizás el color del competidor 1, y los rótulos de rol con su ayuda en
  español y en inglés (`src/i18n/es.js` y `en.js`).
- Pruebas que leen `tokens.css` y `app.css`, como `tests/control-contrast.test.js`
  y `tests/hierarchy-styles.test.js`.
- Sin dependencias nuevas ni paso de build, y sin cambios en el núcleo, la
  simulación ni los datos guardados.
- `borradores/sistema-de-diseno/`: el guion de capturas, `antes/`,
  `muestras/` y `despues/`.
