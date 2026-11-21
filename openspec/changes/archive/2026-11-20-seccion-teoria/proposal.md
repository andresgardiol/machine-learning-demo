# Proposal

## Why

La práctica da por sabido lo que un mentor contaría antes: qué es una neurona, qué es un peso, de dónde
salió cada idea. Antes de compartir el proyecto, el dueño quiere una sección teórica aparte, fácil de
leer y muy visual, que dé esa base a quien no la tiene y sirva de apoyo a quien sí. Los prototipos
(`teoria-prototipos`) ya fijaron la forma: la película lado a lado.

Concepto que hace visible: cada capítulo, uno. En este cambio: de dónde viene cada idea (historia), por
qué las reglas a mano no escalan y hace falta aprender (capítulo 0), cómo decide una neurona (capítulo
1) y por qué una sola no alcanza y hacen falta capas (capítulo 2).

## What Changes

- **Sección nueva en `/teoria/`**, aparte de la práctica: una portada con la historia y el temario, y
  una dirección por capítulo.
- **Formato de capítulo "película lado a lado"**: una figura viva fija a la izquierda y el texto que
  pasa a la derecha, en tramos. Cada tramo abre con una pregunta. Índice de tramos con título, una
  predicción que pide elegir antes de seguir y un desafío al cierre. En ventana angosta, la figura
  queda arriba y el texto debajo.
- **Figuras que hacen la cuenta real** con el núcleo de la app y se pueden tocar. Cada tramo tiene su
  estado de figura: al entrar a un tramo, la figura muestra los números de los que habla el texto.
- **Historia completa en película**, de 1943 a los LLMs: una línea de tiempo fija con unos doce hitos.
  Cada hito apunta a su capítulo y a su pestaña, o dice que la práctica todavía no lo tiene.
- **Los diez capítulos del temario**, del 0 "Programar o aprender" al 9 "Qué quedó adentro" (el dueño
  pidió todos el 20 de noviembre de 2026; los guiones están en `design.md`, D9 y D12). Cada uno puede
  cerrar con un bloque plegado "Para profundizar".
- **Fuentes a la vista**: cada capítulo y la historia cierran con sus fuentes. Nada se publica sin
  pasar la revisión de contenido contra fuentes.
- **Se lee en el celular** (desde 360 px de ancho): es lo que se abre cuando se comparte un enlace.
- **Un enlace "Teoría"** en la barra de la V1 y de la V2. Es el único cambio en la práctica. Cada
  capítulo cierra con un enlace de ida a la app, que nombra la pestaña donde seguir.
- Se borra `prototipos/teoria/`; lo que sirve (figuras, cuenta, textos, estilos) se muda a la sección.

Filtro de entrada:

1. *¿Qué concepto hace visible?* Uno por capítulo, enunciado en su título; la historia, de dónde sale
   cada idea que la práctica usa.
2. *¿Se entiende sin que nadie lo explique?* Cada capítulo abre con una pregunta y una figura que ya
   muestra algo. Si una persona lo entiende sola no se probó: queda para el dueño.
3. *¿El mentor puede ignorarla u ocultarla?* Sí. Vive en su propia dirección; en la práctica solo
   aparece un enlace en la barra.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* Las perillas tienen tope. Cada figura tiene
   "Restablecer", que la devuelve a los valores del tramo. Recargar también.

Público: el principiante, que la lee de corrido como rampa; y el mentor, que la usa de apoyo o la
saltea. No entorpece a ninguno en la práctica, porque no la toca.

Una excepción a la regla de los tooltips, decidida por el dueño en la revisión de los prototipos: en la
teoría la ayuda de un control es una sola línea corta, fuera de la figura, y el punto del plano no
tiene. El enlace "Teoría" de la app sí lleva el tooltip de siempre.

Fuera de alcance:

- Abrir la app directamente en una pestaña desde la teoría: el enlace lleva a la app y nombra la
  pestaña.
- Enlaces desde las pestañas o desde los tooltips hacia un capítulo.
- Las features nuevas que sugiere la teoría (paisaje del error, refuerzo, predecir la letra siguiente):
  siguen en `PENDIENTES.md`.
- Decidir entre la V1 y la V2.
- Videos renderizados, sonido y guardar el avance del lector entre visitas.
- Probar con personas, lector de pantalla real, Firefox y Safari: quedan para probar a mano.

## Capabilities

### New Capabilities

- `seccion-teoria`: la sección en sí: su dirección, la portada con el temario, el idioma, los enlaces
  con la práctica, que se lea en el celular y las fuentes a la vista.
- `capitulo-de-teoria`: el formato de un capítulo: tramos, figura fija, índice, predicción, desafío,
  estado de la figura por tramo, ayuda breve y cierre.
- `historia-de-la-ia`: la línea de tiempo en película, sus hitos y el vínculo de cada uno con un
  capítulo y una pestaña.

### Modified Capabilities

- `estructura-app`: suma el enlace "Teoría" en la barra de la V1.
- `interfaz-v2`: suma el enlace "Teoría" en la barra de la V2.

## Impact

- Carpeta nueva `teoria/` (página) y `src/teoria/` (módulos, textos por idioma, figuras), con estilos
  en `styles/teoria.css`. Se borra `prototipos/teoria/`.
- Usa sin modificar `src/core/network.js`, `src/core/sensors.js` (como referencia) y
  `styles/tokens.css`.
- `src/ui/app.js` y `src/v2/shell/shell.js`: un enlace cada uno. `src/i18n/es.js` y `en.js` (y los de
  la V2): el texto y el tooltip de ese enlace.
- `tests/`: pruebas de las cuentas de las figuras, de que los dos idiomas tienen los mismos textos y de
  la regla de dependencias (la teoría importa del núcleo; nada de la app importa de la teoría).
- `README.md`: la dirección de la teoría. `PENDIENTES.md`: lo que quede.
- Sin dependencias de terceros y sin paso de build. No toca el bucle de simulación ni el de dibujo.
