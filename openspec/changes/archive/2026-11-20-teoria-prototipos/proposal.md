# Proposal

## Why

La práctica da por sabido lo que el mentor contaría antes: qué es una red, qué
es un peso, por qué se corrige. Antes de publicar el proyecto, el dueño quiere
una sección teórica aparte, fácil de leer y muy visual, que dé esa base a quien
no la tiene y sirva de apoyo a quien sí. Hay tres formas posibles de escribirla
y no se puede elegir sin verlas: este cambio las construye con un mismo
capítulo para compararlas en vivo.

Concepto que hace visible: una neurona decide sumando sus entradas con pesos y
comparando el total con un umbral. Además, como infraestructura, habilita la
sección teórica completa (otro cambio), al fijar su forma.

## What Changes

- Una carpeta de prototipos, `prototipos/teoria/`, con una portada que enlaza
  cuatro páginas. No se enlaza desde la app.
- **Tramo de historia en película** (1943 a 1986): una línea de tiempo fija que
  avanza con el desplazamiento, con cinco hitos. Cada hito nombra el capítulo de
  teoría y la pestaña de la práctica con que se relaciona.
- **El capítulo "Una neurona" en tres formas**, con el mismo guion, los mismos
  textos y las mismas figuras:
  1. *Libro*: se lee bajando, con figuras vivas entre párrafos.
  2. *Pasos*: una pantalla por paso, con una pregunta para predecir antes de ver.
  3. *Película*: una figura fija que se transforma con el desplazamiento.
- **Figuras vivas compartidas**: una neurona con perillas y su recta en el
  plano. Hacen la cuenta real con el núcleo de la app y se pueden tocar.
- **Mapa teoría y práctica**: qué capítulo acompaña a qué pestaña, y la lista
  de temas de teoría que la práctica todavía no tiene, como candidatos a
  features nuevas.
- Una comparación escrita, con capturas de cada forma, para que el dueño elija.

Filtro de entrada (para las cuatro páginas):

1. *¿Qué concepto hace visible?* La cuenta de una neurona (entradas, pesos,
   sesgo, activación) y que esa cuenta es una recta que separa. La historia
   muestra de dónde sale cada idea que la práctica usa.
2. *¿Se entiende sin que nadie lo explique?* Es lo que se compara: cada forma
   abre con una pregunta y una figura que ya muestra algo, sin configurar nada.
3. *¿El mentor puede ignorarla u ocultarla?* Sí: vive en su propia dirección y
   la práctica no cambia.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* Cada figura tiene
   "Restablecer", que la devuelve a sus valores iniciales. Recargar la página
   también.

Público: el principiante, que lee de corrido, y el mentor, que la usa como
apoyo o la saltea. No entorpece a ninguno en la práctica porque no la toca.

Fuera de alcance:

- El resto del temario y el resto de la historia (de 1986 a los LLMs).
- Elegir la forma: lo hace el dueño después de comparar.
- La dirección definitiva de la sección y sus enlaces desde la V1 y la V2.
- Que funcione en el celular.
- Cualquier cambio en las pestañas, en la V2 o en las specs de la app.
- Videos renderizados (Manim u otra herramienta).
- Guardar el avance del lector.

## Capabilities

### New Capabilities

Ninguna. Los prototipos son para comparar y se quitan al elegir; no cambian el
comportamiento de la app. El cambio lleva `skip_specs: true`. La sección
definitiva tendrá su capacidad en el cambio que la construya.

### Modified Capabilities

Ninguna.

## Impact

- Carpeta nueva `prototipos/teoria/` (páginas, estilos, textos en español e
  inglés y figuras).
- Usa sin modificar `src/core/network.js`, `styles/tokens.css` y, si alcanza
  tal como está, `src/render/plane-view.js`.
- Pruebas nuevas en `tests/` para las funciones puras de las figuras, y una
  regla en `tests/architecture.test.js`: nada fuera de `prototipos/` importa de
  ahí.
- `PENDIENTES.md`: recibe la lista de temas sin práctica.
- Sin dependencias de terceros y sin paso de build.
