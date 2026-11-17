# Design

## Context

Así arma hoy cada pestaña su panel (medido en el código, `src/tabs/*/index.js`):

| Pestaña | Orden del panel | Dónde está la marcha |
|---|---|---|
| El problema | `intro` (texto + renglón de teclas), `run`, interruptores, `missions` | en el panel |
| Reglas a mano | `intro`, `run`, interruptores, `programSection`, `missions` | en el panel |
| Entrenar, vista de entrenamiento | `intro`, `run`, interruptores, `basic`, `saveBlock`, `missions` | en el panel |
| Competir | `intro`, `runSection`, tráfico, penalización, interruptores, lista, `missions` | en el panel; además el cartel de largada sobre la escena |
| Inspeccionar | `intro`, cerebro, vacío, tarjeta de la neurona, detalle de la conexión, `missions` | en la barra de abajo de la red |
| Laboratorio | `intro` (con "Agregar una capa oculta"), …, `missions` | en la barra de abajo de la red |

Otros datos del código:

- Lo que es de la guía lleva la clase `guide`, y `.app[data-guide="off"] .guide` lo oculta (`styles/app.css:262`).
- Las misiones viven en la sesión de cada pestaña (`session.missions`), con `id`, `done`, `progress`, `goal` y `unit`. Cada pestaña arma sus filas y las actualiza en `sync()`.
- `createTextSetter` escribe un texto solo si cambió, así que actualizar la misión en cada cuadro no toca el DOM de más.
- Una clave `<clave>.plain` se usa sola cuando los atajos están apagados (`src/ui/i18n.js:87`).
- En Inspeccionar, con algo elegido, el `intro` cede su lugar (`data-selection`, D17 de `pestana-inspeccionar`).
- `tests/copy-length.test.js` ya pone topes de largo por clave y por idioma.

El estado de partida medido está en `borradores/tarjeta-de-consigna/antes/medidas.md`, con las capturas al lado.

## Goals / Non-Goals

**Goals:**
- Un solo componente de tarjeta, que las seis pestañas usan igual.
- Que la misión de la tarjeta y la de la lista salgan del mismo texto, para que no se contradigan nunca.
- La misión en curso elegida por una función pura, probada sin DOM.

**Non-Goals:**
- Cambiar qué misiones hay, sus metas o cómo se cuentan.
- Reordenar los controles de la barra de abajo de la red en Inspeccionar y en el Laboratorio.

## Decisions

### D1. Un componente compartido: `src/tabs/shared/consigna-card.js`

`createConsignaCard({ i18n, run })` devuelve `{ node, setConsigna(key, params), setMission(view) }`.

- **`node`.** Es `<section class="consigna-card" aria-labelledby=…>` con:
  - un título solo para lectores de pantalla ("Qué hacer ahora");
  - `<p class="guide consigna-text">`;
  - el lugar para `run`, que es opcional;
  - `<div class="guide consigna-mission">`, con nombre, estado y barra.
- **La guía apagada.** La consigna y la misión llevan `guide`, así que se ocultan con la regla que ya existe, sin código nuevo. `run` no la lleva: queda en el mismo lugar.
- **`setMission(view)`.** Recibe `null` (sin misión en ese modo), `{ allDone: true }` o `{ nameKey, nameParams, statusKey, statusParams, fraction }`.

*Por qué un componente:* las seis pestañas tienen que verse y ordenarse igual (art. 9). Si cada una arma la suya, se separan con el tiempo. *Alternativa descartada:* reutilizar el `intro` de cada pestaña y moverle la marcha adentro. Cada `intro` es distinto: un `section` en El problema, un `p` en Entrenar y un `div` con botón en el Laboratorio.

### D2. La misión en curso: `src/ui/current-mission.js`

`currentMission(missions, { available })` devuelve:

- `null` si `available` es falso o la lista está vacía;
- la primera con `done` falso, en el orden de la lista;
- `{ allDone: true }` si están todas cumplidas.

Cada pestaña ya sabe escribir el estado de una fila, por ejemplo `drive.mission.progress.vehicles` con `{ value, goal }`. Esa lógica pasa a una función `describeMission(m)` por pestaña, que devuelve las claves y los parámetros. La usan las filas de la lista y la tarjeta, así que los dos textos salen del mismo lado.

La fila de la misión en curso lleva `data-current="true"`. Por CSS se le agrega una marca "▸" y la letra en negrita, para que no dependa del color.

*Alternativa descartada:* clonar el nodo de la fila. Duplicaría los `id` y el texto accesible, y el clon no se actualizaría solo.

### D3. Claves y textos de partida

Las claves son `consigna.<pestaña>[.<modo>]`, en `es.js` y `en.js`, con un tope de 90 caracteres en `tests/copy-length.test.js`. Textos de partida en español, para ajustar en la implementación si no entran en dos renglones:

| Clave | Español |
|---|---|
| `consigna.drive` | Manejá con las flechas o W A S D sin chocar. |
| `consigna.drive.plain` | Manejá con las flechas sin chocar. |
| `consigna.drive.circuit` | Manejá con las flechas o W A S D sin salirte de la pista. (también con `.plain`) |
| `consigna.rules` | Cambiá un número del programa y mirá qué hace el auto. |
| `consigna.train` | Mirá cómo mejoran los autos de generación en generación. |
| `consigna.train.manual` | Elegí al líder cuando haga algo prometedor. |
| `consigna.compete` | Largá y mirá quién llega más lejos en cada pista. |
| `consigna.inspect` | Pausá con el botón de abajo de la red y avanzá de a un paso. |
| `consigna.lab.gates` | Mové los pesos hasta que la tabla diga 4 de 4. |
| `consigna.lab.points` | Tocá Reproducir, abajo de la red, y mirá cómo separa los puntos. |
| `consigna.lab.driving` | Tocá Reproducir, abajo de la red: aprende a manejar imitando. |
| `consigna.missions.allDone` | ✓ Cumpliste todas las misiones de esta pestaña. |
| `consigna.title` | Qué hacer ahora |

El inglés se escribe con el mismo sentido y el mismo tope.

En El problema, el renglón de teclas del `intro` (`drive.guide.keys`) se quita, porque su contenido pasa a la consigna. El requisito "Guía de inicio" de `pestana-conducir` pide un renglón aparte con las teclas de manejo, y la consigna es ese renglón. Los textos largos de las demás pestañas no se tocan.

*Por qué una consigna por modo y no por estado:* una frase que cambia con cada paso se vuelve ruido, y el progreso ya lo muestra la misión. *Alternativa descartada:* usar como consigna el nombre de la misión en curso. Le diría al que llega qué meta cumplir, pero no qué hacer.

### D4. La tarjeta en cada pestaña

- **El problema, Reglas a mano y Competir.** La tarjeta va primera en el panel, y `run` (o `runSection`) va adentro.
- **Entrenar.** La tarjeta va primera en `trainingView`, con `run` adentro. Las vistas de ajustes y de cerebros no la tienen.
- **Inspeccionar.** La tarjeta va primera en `inspect-panel`, sin `run`. Elegir una neurona oculta el `intro`, como hoy, pero no la tarjeta.
- **Laboratorio.** Lo mismo, sin `run`. "Agregar una capa oculta" sigue en el `intro`.
- **`mainAction`** (de `jerarquia-de-botones`) no cambia: los botones son los mismos y solo cambian de lugar.

### D5. Estilos

- **Tarjeta.**
  - Fondo `--color-surface-2`, contorno `--color-border`, `--radius` y relleno de 12 px.
  - Consigna de 15 px, peso 600, en `--color-text`.
  - Misión de 13 px, con la barra de las misiones.
- **Texto largo de la guía.** Pasa a 13 px en `--color-text-muted`, que da 8:1 sobre `--color-surface`. Así queda por debajo de la tarjeta en peso.
- **Secundarias sobre la tarjeta.** Los botones secundarios, que ahora son transparentes con contorno, quedan sobre `--color-surface-2`. `tests/control-contrast.test.js` ya mide el contorno sobre esa superficie.

### D6. Accesibilidad

- La tarjeta es una región nombrada por su título oculto.
- El orden en el DOM es consigna, `run` y misión: el foco con Tab llega primero a la marcha.
- La misión no lleva `aria-live`: hoy las filas no la tienen, y anunciar cada vehículo superado sería ruido.

### D7. Capturas del antes y del después

El guion es `borradores/tarjeta-de-consigna/capturar.mjs`. El antes se sacó sobre `945a848`, con `antes/medidas.md`: altura de la guía, de la acción principal y de la primera misión, si esta se ve sin desplazar, el desborde de la columna y el largo del texto. Al final se corre con `despues`, se repiten las mismas medidas y se arma `comparacion.md`.

## Risks / Trade-offs

- **Entrenar ya desborda a 1440×900 y la tarjeta le suma un renglón de misión.** Se compensa con el texto largo más chico. Lo que importa es que la tarjeta entre entera; la lista de abajo puede seguir pidiendo desplazar, porque su primera misión ya está en la tarjeta. Se mide en el después. Si la tarjeta no entra entera a 1366×768, se para a consultar.
- **La consigna puede repetir lo que dice el texto largo**, como en Reglas a mano ("Cambiá un número…"). Se acepta: la tarjeta es para quien no lee el párrafo. Recortar los textos largos queda para `vocabulario-escalonado` o para el recorrido guiado.
- **La misión aparece dos veces**, en la tarjeta y en la lista. Se acepta, porque la lista marca cuál es. Un lector de pantalla la lee dos veces si recorre todo el panel.
- **En Inspeccionar y en el Laboratorio la tarjeta no tiene botón**, distinta de las otras cuatro. Es a propósito (ver la propuesta). La consigna nombra dónde está Reproducir.
- **Los textos de partida de D3 pueden no entrar en dos renglones** en inglés. El tope de 90 caracteres es la prueba, y la medida en el navegador decide.

**Rendimiento.** No toca el bucle de simulación ni el de dibujo. La tarjeta se actualiza en el `sync()` que ya existe, y `createTextSetter` solo escribe si el texto cambió. Es una fila más por cuadro, del mismo costo que las de la lista.

**Núcleo y dependencias.** `current-mission.js` vive en `src/ui/` y no usa el DOM. `consigna-card.js` vive en `src/tabs/shared/`. Nada del núcleo cambia y no hay dependencias nuevas.

## Migration Plan

No hay datos que migrar: las misiones cumplidas siguen en la sesión de cada pestaña, como ahora. Para volver atrás se revierte el cambio; las preferencias (como la guía) no cambian de forma.
