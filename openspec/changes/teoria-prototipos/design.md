# Design

## Context

Ver `proposal.md` para el motivo. Lo que condiciona el diseño:

- El dueño fijó (20 de noviembre de 2026) que la teoría es una sección aparte,
  que no se mezcla con las pestañas para no contaminar la práctica, y que
  **acompaña a la práctica**: se centra en lo que la práctica ya tiene.
- La constitución describe la práctica; la sección teórica no la contradice
  (decisión del dueño). Igual valen acá: honestidad técnica (artículo 7), sin
  dependencias ni build (12) y los dos idiomas (11).
- El núcleo no usa DOM: `src/core/network.js` da `createNetwork` y
  `computeDetailed`, que devuelven la cuenta de cada neurona. Una figura del
  texto puede ser una red real de una sola neurona.
- `styles/tokens.css` ya da los colores con significado: entra
  (`--color-role-in`), peso positivo (`--color-weight-positive`, línea
  continua) y peso negativo (`--color-weight-negative`, línea punteada).
- La V1 y la V2 conviven y no está decidido cuál queda. Los prototipos no
  dependen de ninguna.

## Goals / Non-Goals

**Goals:**

- Que las tres formas se comparen solo por su forma: mismo guion, mismos
  textos, mismas figuras.
- Que lo construido para las figuras y los textos sirva después a la sección
  definitiva, sea cual sea la forma elegida.
- Dejar escrito el mapa entre teoría y práctica, y los temas de teoría que la
  práctica no tiene.

**Non-Goals:**

- Pulir las tres formas a nivel de producto: alcanza con que se puedan juzgar.
- Componentes reutilizables por la app: las figuras viven en `prototipos/`.
- Medir si alguien aprende más con una forma que con otra.

## Decisions

### D1. Los prototipos van en `prototipos/teoria/`, dentro de git

```
prototipos/teoria/
  index.html            portada: enlaza las cuatro páginas
  historia/index.html   tramo de historia, en película
  libro/index.html      "Una neurona", forma 1
  pasos/index.html      "Una neurona", forma 2
  pelicula/index.html   "Una neurona", forma 3
  contenido/es.js en.js textos del tramo y del capítulo
  figuras/              neurona.js, plano.js, cuenta.js (sin DOM)
  estilos/teoria.css    solo tokens de styles/tokens.css
```

Se ven con `npm start` en `http://localhost:8000/prototipos/teoria/`.

*Alternativa:* `borradores/`, que no va a git. Se descartó porque una
sub-sesión que trabaje en su propio worktree no la tendría y su trabajo no
volvería con el merge. Al elegir la forma, el cambio siguiente borra la
carpeta.

Regla de dependencias: `prototipos/` importa de `src/core` y `src/render`;
nada fuera de `prototipos/` importa de ahí. Se suma a
`tests/architecture.test.js`.

### D2. Un guion, tres presentaciones

El capítulo se escribe una vez, como una lista de tramos en `contenido/`. Cada
tramo tiene: una pregunta, un texto corto, el estado de la figura y, si
corresponde, una predicción. Las tres páginas leen la misma lista y solo
cambian cómo la muestran.

Guion de "Una neurona", atado a la práctica (el auto y las compuertas del
Laboratorio):

| # | Pregunta que abre | Figura | Se toca |
|---|---|---|---|
| 1 | ¿Cómo decide doblar algo que solo sabe sumar? | Auto con dos sensores y una neurona | Nada: se mira |
| 2 | ¿Cuánto pesa cada sensor? | Dos entradas con sus pesos | Las dos perillas de peso |
| 3 | ¿Desde cuánto se anima a doblar? | Suma, sesgo y activación escalón | La perilla del sesgo |
| 4 | Predicción: si subo este peso, ¿se enciende? | La misma neurona | Elegir y después ver |
| 5 | ¿Qué dibuja esa cuenta? | El plano: la neurona es una recta | Mover la recta con las perillas |
| 6 | Desafío: que haga un AND | Plano con los cuatro puntos | Todo |

El tramo 6 cierra con un enlace de ida a la práctica: "Seguí en Laboratorio,
Compuertas". La práctica no enlaza de vuelta (fuera de alcance).

*Alternativa:* escribir cada forma por separado. Se descartó: las diferencias
de texto contaminarían la comparación.

### D3. Las figuras hacen la cuenta real

`figuras/cuenta.js` (sin DOM) arma una red de una neurona con
`createNetwork({ inputs: 2, outputs: 1, activation: 'step' })` y la calcula con
`computeDetailed`. La recta del plano sale de los mismos pesos y sesgo, con una
función pura que se prueba en `tests/`. Lo que se ve es lo que se calcula.

Para el plano se usa `src/render/plane-view.js` si sirve sin modificarlo. Si
pide cambios, la figura dibuja su propio plano en SVG y `plane-view.js` no se
toca.

Cada figura tiene "Restablecer" y un tooltip por control ("qué hace / por qué
importa"), en los dos idiomas.

### D4. Gramática visual

Tomada de 3Blue1Brown, sin su herramienta:

- **Un solo objeto que se transforma.** La neurona del tramo 1 es la misma
  hasta el 6; el plano aparece saliendo de ella.
- **El color es el significado**, con los tokens de la app: una entrada, un
  peso positivo y uno negativo se ven igual en la figura, en la cuenta y en el
  plano. Siempre con una forma además del color (continua o punteada).
- **Primero el caso, después el nombre.** "Sesgo" aparece recién cuando ya se
  movió la perilla.
- **Una pregunta abre cada tramo.**

De Brilliant: predecir antes de ver (tramo 4) y un desafío mínimo al cierre
(tramo 6). Están en las tres formas, porque son parte del guion.

### D5. La película, sin dependencias

Figura con `position: sticky` y tramos de texto que pasan al lado. Un
`IntersectionObserver` dice qué tramo está a la vista y la figura va a ese
estado con una transición corta. No se ata la animación al píxel de
desplazamiento: es más simple y se puede probar tramo por tramo.

Con `prefers-reduced-motion: reduce`, la figura cambia de estado sin
transición. Ningún elemento parpadea más de tres veces por segundo.

*Alternativa:* animación atada al desplazamiento continuo. Es más parecida a un
video, pero cuesta más y se rompe con teclado y con lector de pantalla. Queda
para la forma definitiva si la película gana.

### D6. El tramo de historia

Cinco hitos, de 1943 a 1986, cada uno con una imagen dibujada en SVG, una frase
y su vínculo con la práctica:

| Año | Hito | Capítulo | Pestaña |
|---|---|---|---|
| 1943 | McCulloch y Pitts: la neurona como cuenta | Una neurona | Laboratorio |
| 1958 | Rosenblatt: el perceptrón aprende sus pesos | Una neurona | Laboratorio, compuertas |
| 1969 | Minsky y Papert: una sola no puede con XOR | Una recta no alcanza | Laboratorio, XOR |
| años 70 | Primer invierno de la IA | (ninguno) | (ninguna) |
| 1986 | Rumelhart, Hinton y Williams: backpropagation | Repartir la culpa | Laboratorio |

En los prototipos, "Una neurona" enlaza al índice de formas; los demás
capítulos se muestran como "próximamente". Fechas y nombres se verifican contra
una fuente antes de escribir el texto.

### D7. Textos

Un módulo por idioma en `contenido/`, con la prosa por tramo. No se suman
claves a `src/i18n/es.js`: la prosa larga no encaja en claves cortas, y los
prototipos no deben tocar la app. El idioma se elige con el mismo valor que ya
guarda la app; si no hay, español.

### D8. Cómo se compara

Mismo ancho de ventana (1440×900) y mismo guion de prueba para las tres: leer
el capítulo entero, volver a buscar qué era el sesgo, y resolver el AND. Se
anota por forma: si se llegó al final, cuánto costó volver a encontrar algo, y
qué molestó. El resultado, con capturas, va a
`borradores/teoria-prototipos/comparacion.md`. Lo observado se rotula como
observado; nada se presenta como medido si no lo fue.

### D9. Mapa teoría y práctica

Cada capítulo del temario acompaña algo que la práctica ya tiene:

| Capítulo | Acompaña a |
|---|---|
| Historia breve | Todas (cada hito apunta a una pestaña) |
| 0. Programar o aprender | El problema, Reglas a mano |
| 1. Una neurona | Laboratorio: compuertas, perillas |
| 2. Una recta no alcanza (XOR) | Laboratorio: XOR, armar la red |
| 3. La cuenta hacia adelante | Inspeccionar: paso a paso |
| 4. Medir el error | Laboratorio: error de un ejemplo, curvas |
| 5. Corregir un poco cada vez | Laboratorio: tasa de aprendizaje |
| 6. Repartir la culpa | Laboratorio: un ejemplo paso a paso |
| 7. Aprender por evolución | Entrenar |
| 8. Generalizar o memorizar | Competir; Laboratorio: ejemplos apartados |
| 9. Qué quedó adentro | Inspeccionar: apagar partes, qué detecta cada neurona |

**Temas de teoría que la práctica no tiene** (salen de leer las specs y los
textos; no se probó la app para confirmarlos):

1. *El descenso por gradiente como imagen.* La palabra "gradiente" no aparece
   en los textos de la V1 (`src/i18n/es.js`, 0 coincidencias); la V2 tiene una
   etapa con ese nombre. Falta ver el error como un paisaje por el que se baja.
   Candidato: en el Laboratorio, el paisaje del error de una neurona de dos
   pesos, con la bolita que baja en cada corrección.
2. *Aprendizaje por refuerzo.* La spec de neuroevolución dice que no es
   aprendizaje por recompensa paso a paso. La historia lo nombra (AlphaGo).
   Candidato: una pestaña donde el auto aprende de premios y castigos.
3. *De 2012 en adelante: imágenes, Transformers y LLMs.* La historia llega
   hasta ahí y la práctica no tiene nada. Candidato: una red mínima que predice
   la letra siguiente.
4. *Aprender sin respuestas correctas (no supervisado).* La práctica tiene
   imitación (supervisado) y evolución. Sin candidato todavía.
5. *Remedios al sobreajuste.* El Laboratorio lo detecta. Sin verificar si
   muestra cómo se evita (más datos, red más chica, cortar a tiempo).

La teoría puede nombrar estos temas en la historia, pero no les dedica capítulo
mientras no haya práctica que acompañar. La lista pasa a `PENDIENTES.md`.

## Risks / Trade-offs

- [Tres formas a medio pulir se comparan mal] → El guion, los textos y las
  figuras son compartidos; cada forma solo resuelve su presentación.
- [La película y el desplazamiento molestan con teclado o rueda] → Estados por
  tramo (D5), no por píxel; se prueba con teclado.
- [Las figuras quedan atadas a los prototipos y hay que rehacerlas] →
  `cuenta.js` no usa DOM y tiene pruebas; se muda tal cual.
- [Un capítulo fácil favorece a una forma] → "Una neurona" tiene lectura,
  manipulación, predicción y desafío. Queda anotado como límite: un capítulo
  con más matemática (repartir la culpa) podría dar otro resultado.
- [La carpeta se publica con el sitio] → No se enlaza desde la app y se borra
  en el cambio siguiente.
- Rendimiento: las figuras calculan una neurona por movimiento de perilla; no
  tocan el bucle de simulación ni el de dibujo de la app.

## Open Questions

- La dirección definitiva de la sección y si funciona en el celular. Se
  deciden en el cambio que la construya; no cambian estos prototipos.
