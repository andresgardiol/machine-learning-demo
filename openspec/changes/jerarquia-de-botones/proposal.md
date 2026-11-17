# Proposal

## Why

El análisis de UX del 17 de noviembre de 2026 (`borradores/analisis-ux/informe.md`) midió que el mismo azul relleno significa a la vez "acción principal", "opción elegida" y "salida encendida de la red", y que el gris de los botones se usa para la acción principal, para "Restablecer" y para "Créditos". El problema más grave que encontró es que no hay una acción principal reconocible: El problema, Reglas a mano y Entrenar no tienen ninguna, e Inspeccionar muestra seis azules a la vez. El dueño lo resumió así: "todos los botones se ven iguales". Este cambio va primero porque la tarjeta de consigna, los ajustes por niveles y el recorrido guiado se apoyan en esa jerarquía.

**Concepto que habilita.** Es infraestructura visual, no un concepto de ML nuevo. Habilita que cada pestaña muestre su experimento en marcha como lo primero que se toca, y que la salida de la red se lea como una salida, no como un botón. Esto refuerza "controles entran, salidas salen" (el contrato de controlador).

## What Changes

- **Cuatro estilos con un significado cada uno**, en toda la app:
  1. **Acción principal.** Relleno del color de acción, más grande que el resto. Es el único elemento relleno de ese color.
  2. **Acción secundaria.** Con borde y sin relleno.
  3. **Opción elegida** en selectores, segmentos e interruptores. Fondo tenue y borde del color de acción, letra en negrita. Ya no usa el relleno pleno.
  4. **Estado o salida de la red** ("Lo que estás accionando", "Decisión de la red" y las teclas de salida). Tiene un aspecto propio que no parece botón: no usa el color de acción ni reacciona al cursor.
- **Una sola acción principal a la vista por pestaña, y por vista del panel.** Por decisión del dueño (17 de noviembre de 2026), es el control de marcha en las seis pestañas:
  - Pausar/Seguir en El problema, Reglas a mano y Entrenar;
  - Largar/Pausar/Reanudar en Competir;
  - Reproducir/Pausar en Inspeccionar y Laboratorio.

  Cambia solo en tres estados:
  - con un choque a la vista, es Reiniciar;
  - con la selección manual, es Elegir al líder;
  - con la carrera terminada, es Otra carrera.
- **Botones que hoy están rellenos y pasan a secundarios:**
  - "Guardar campeón", en la vista de entrenamiento;
  - "Agregar una capa oculta de 2" y "Guardar como cerebro", en el Laboratorio;
  - el botón de marcha del panel de Competir mientras el cartel de largada está a la vista.
- **"Créditos"** pasa a verse como enlace, no como botón.
- **Capturas del antes y del después** con un mismo guion, para comparar lado a lado. El antes se sacó sobre el commit `60b4397`.

Fuera de alcance, con su candidato en el informe:
- dónde va la consigna (`tarjeta-de-consigna`);
- la barra de escenario plegable;
- los ajustes por niveles;
- el cartel "Usá las flechas" (`primer-manejo-guiado`);
- arrastrar pesos como acción principal en Compuertas (`laboratorio-experimentos-a-la-vista`);
- los verbos de Restablecer y Reiniciar (`reinicios-con-alcance`);
- los tooltips anunciados y los botones de solo ícono;
- los cortes y desbordes.

También quedan fuera los cambios de textos o de lugar de los controles, la paleta del dibujo (sensores, red, autos), las tres propuestas del recorrido guiado y el artículo de jerarquía visual que el informe sugiere sumar a la constitución, que es decisión del dueño.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* Que cada pestaña es un experimento en marcha que se controla con un botón, y que la decisión de la red es una salida. El azul deja de mezclar "lo que tocás" con "lo que la red hace".
2. *¿Se entiende sin que nadie lo explique?* Sí. Un solo elemento relleno por pantalla es una convención conocida, y las opciones elegidas siguen distinguiéndose por la negrita y el fondo, no solo por el color.
3. *¿El mentor puede ignorarla u ocultarla?* No hay nada que ocultar, porque no agrega controles ni textos. Al mentor le sirve igual: puede decir "tocá el botón azul".
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* Ningún control cambia de comportamiento, solo de aspecto. Si un estilo nuevo se entiende peor, se vuelve atrás revirtiendo los estilos: el cambio no toca la lógica ni los datos guardados.

**Público.** Sirve sobre todo al principiante que llega solo, que hoy no encuentra qué tocar. Al mentor no le estorba: no hay nada nuevo que esconder, y el lenguaje visual le da una consigna corta para la clase.

## Capabilities

### New Capabilities
- `jerarquia-visual`: el significado constante de los estilos de los controles (acción principal, secundaria, opción elegida y estado o salida de la red), y qué es la acción principal de cada pestaña en cada estado.

### Modified Capabilities
(ninguna: los requisitos de contraste, tamaño mínimo y "estado sin depender del color" de `accesibilidad` siguen igual, y los estilos nuevos los cumplen)

## Impact

- `styles/tokens.css`: tokens nuevos para la acción, la opción elegida y la salida encendida, que separan el color de acción de `--color-accent`.
- `styles/app.css`:
  - `.tool`, `.tool.primary` y `.tool[aria-pressed]`;
  - `.segment`, `.lang-option`, `.camera-button[data-active]` y `.switch`;
  - `.inspector-knob-switch`, `.compete-check`, `.curve-chip` y `.bar-track`;
  - `.action-key` (también el estado "titubea");
  - `.credits-button`.
- Clases `primary` en `src/tabs/train/index.js`, `src/tabs/lab/index.js` y `src/tabs/compete/index.js`, para dejar una sola acción principal por vista y por estado. Se agrega la clase en la marcha de `drive`, `rules` y `train`.
- Pruebas: una nueva que lee los tokens, como `tests/control-contrast.test.js`, y una que cuenta las acciones principales por pestaña.
- Sin dependencias nuevas, sin cambios en el núcleo, en la simulación ni en los datos guardados.
- `borradores/jerarquia-de-botones/`: el guion de capturas y las carpetas `antes/` y `despues/`.
