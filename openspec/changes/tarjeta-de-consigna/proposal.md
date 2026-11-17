# Proposal

## Why

El análisis de UX del 17 de noviembre de 2026 (`borradores/analisis-ux/informe.md`) encontró dos problemas:

- **P2.** Lo que dice qué hacer está en el último lugar que recorre la vista. En El problema, la consigna es la última línea de un párrafo en gris.
- **P4.** Las misiones, que son lo que invita a probar algo distinto, quedan al final de la columna.

Medido sobre `945a848`, con `jerarquia-de-botones` ya hecho (`borradores/tarjeta-de-consigna/antes/medidas.md`):
- La primera misión empieza entre 468 y 757 px desde arriba de la ventana. La guía empieza a 146 px.
- En Entrenar, a 1366×768, la primera misión queda cortada: la columna tiene 793 px de contenido y se ven 654.

`jerarquia-de-botones` ya dejó una sola acción principal por pestaña. Falta que lo primero que se lee diga qué hacer con ella. Este cambio va antes del recorrido guiado porque la tarjeta es el lugar donde ese recorrido va a hablar.

**Concepto que habilita.** Es infraestructura didáctica, no un concepto de ML nuevo. Hace que el concepto de cada pestaña se encuentre con una frase y una acción, en vez de enterrado en un párrafo: el problema de manejar, las reglas, la evolución, la generalización, la cuenta de la red y el aprendizaje.

## What Changes

- **Una tarjeta de consigna al principio del panel**, en las seis pestañas. Por decisión del dueño (17 de noviembre de 2026), va arriba de la columna derecha. En Entrenar va arriba de la vista de entrenamiento, que es la primera.
- **Qué tiene la tarjeta:**
  1. **La consigna.** Una frase corta en imperativo que dice qué hacer ahora, como "Manejá con las flechas sin chocar". Es un texto nuevo por pestaña y por modo (calle o circuito; selección automática o manual; Compuertas, Puntos o Tu manejo), en español y en inglés.
  2. **La acción principal**, adentro de la tarjeta, en El problema, Reglas a mano, Entrenar y Competir.
     - En Inspeccionar y en el Laboratorio, la marcha sigue en la barra de abajo de la red, junto a Paso y Atrás: sacarla de ahí la separaría de sus controles. En esas dos pestañas la consigna nombra dónde está ("Tocá Reproducir, abajo de la red…").
     - En Competir, con el cartel de largada a la vista, la acción principal sigue siendo el botón del cartel, como fija `jerarquia-visual`.
  3. **La misión en curso.** La primera sin cumplir, con su progreso y su barra. Si están todas cumplidas, lo dice.
- **El texto largo de la guía** queda visible debajo de la tarjeta, con menos peso. No se pliega, por decisión del dueño, en línea con la del 13 de noviembre de no tener secciones plegables.
- **La lista completa de misiones** sigue al final del panel, con la misión en curso marcada.
- **Con la guía apagada**, la tarjeta oculta la consigna y la misión, y queda solo la marcha, en el mismo lugar.
- **En Inspeccionar y en el Laboratorio**, al elegir una neurona o una conexión, la tarjeta cede su lugar, como el texto largo, y vuelve al soltar la elección. Al principio el diseño la dejaba a la vista. El dueño lo cambió el 17 de noviembre de 2026, porque a 1366×768 la cuenta de la neurona pedía desplazar y una tarjeta compacta ganaba solo 26 de los 78 px que faltaban.
- **Capturas del antes y del después** con un mismo guion. El antes se sacó sobre `945a848`.

Fuera de alcance, con su candidato en el informe:
- la barra de escenario plegable;
- los ajustes por niveles;
- el "Mostrame" que resalta el control de cada misión (`misiones-que-muestran-el-control`);
- el cartel "Usá las flechas" sobre la escena (`primer-manejo-guiado`);
- que la guía y "Por dónde empezar" de Inspeccionar sigan al elegir una neurona (`inspeccionar-guia-persistente`);
- los tres experimentos del Laboratorio a la vista.

También quedan fuera reescribir los textos largos de la guía (solo se quita lo que pasa a la consigna), las misiones nuevas, y el recorrido guiado con sus tres propuestas.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* El de cada pestaña, en una frase y con la acción para probarlo. Por ejemplo, en Entrenar: "Mirá cómo mejoran de generación en generación", con la marcha al lado y la misión que invita a cambiar algo.
2. *¿Se entiende sin que nadie lo explique?* Esa es la razón del cambio: la primera línea del panel dice qué hacer, y el botón para hacerlo está pegado a ella.
3. *¿El mentor puede ignorarla u ocultarla?* Sí. El interruptor de guía oculta la consigna y la misión; queda solo la marcha, como hoy con la guía apagada.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* La tarjeta no tiene controles nuevos. La marcha hace lo mismo que antes y la misión en curso es la misma de la lista. Si la consigna no ayuda, se apaga la guía. Se vuelve atrás revirtiendo el cambio, sin tocar datos guardados.

**Público.** Sirve sobre todo al principiante que llega solo: la primera línea le dice qué hacer. El mentor la oculta con la guía, como ya oculta el resto de los textos, y la marcha queda en el mismo lugar.

## Capabilities

### New Capabilities
- `consigna-de-pestana`: la tarjeta al principio del panel de cada pestaña. Define qué dice la consigna, dónde va la acción principal, cómo se elige la misión en curso y cómo se comporta con la guía apagada.

### Modified Capabilities
- `estructura-app`: *Orden común del panel* cambia el orden. Primero va la tarjeta de consigna (consigna, controles de marcha y misión en curso), después el texto de guía, los interruptores de vista, los ajustes y acciones, y al final la lista de misiones.

## Impact

- `src/tabs/drive`, `rules`, `train`, `compete`, `inspect` y `lab` (`index.js`): el armado del panel y el `sync()` que actualiza la misión en curso.
- `src/tabs/shared/`: un componente nuevo para la tarjeta.
- `src/ui/`: una función pura que elige la misión en curso.
- `src/i18n/es.js` y `en.js`: las claves nuevas de consigna, de "todas las misiones cumplidas" y del título accesible de la tarjeta.
- `styles/app.css`: los estilos de la tarjeta y el texto de guía con menos peso.
- Pruebas: la misión en curso, el largo de las consignas (`tests/copy-length.test.js`) y las claves en los dos idiomas (`tests/i18n.test.js`).
- Sin dependencias nuevas ni cambios en el núcleo, en la simulación ni en los datos guardados.
- `borradores/tarjeta-de-consigna/`: el guion de capturas, `antes/` y `despues/`.
