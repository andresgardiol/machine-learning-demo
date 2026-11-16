# Diseño

## Decisiones

### D1 · Un interruptor propio, a la vista

"Ayudas" (en inglés "Hints") va en la barra de arriba, entre "Guía" y
"Atajos", con el mismo control (`role="switch"`). Está en todas las pestañas
y no se pliega ni se esconde.

Alternativas descartadas:
- Un enlace "No mostrar más" dentro de cada tooltip: apaga justo donde
  molesta, pero suma un control a cada tooltip y el camino de vuelta queda
  lejos.
- Dejarlo atado a "Guía": es lo que hay y no alcanza.

### D2 · Apagado es apagado

Con las ayudas apagadas no aparece ningún tooltip: ni al posar el cursor, ni
con Tab, ni en un control sin acción. `opensTooltip` recibe `hints` en lugar
de `guide`.

Excepciones:
- El interruptor "Ayudas": se explica siempre (cursor y Tab). Es el camino de
  vuelta.
- Apretar un control sin acción (clic, o Enter o Espacio con el foco): su
  tooltip aparece en el momento. No es una ayuda que se ofrece sola: es la
  respuesta a algo que la persona hizo y no anduvo.

Si hay un tooltip a la vista al apagar, se cierra.

Con Tab antes aparecían siempre, porque apagar la guía los callaba de rebote
y Tab era la salida. Con un interruptor que dice lo que hace, quien lo apaga
con el teclado tampoco los quiere.

**Lo que se pierde:** el tooltip es hoy la descripción accesible del control
(`aria-describedby` mientras está a la vista). Con las ayudas apagadas, un
lector de pantalla lee el nombre del control y no su explicación. Queda
anotado en PENDIENTES.md; el estado por defecto es encendido.

### D3 · "Guía" ya no los gobierna

"Guía" muestra u oculta los textos de guía y las misiones, nada más. Su
tooltip deja de nombrar los tooltips.

### D4 · Preferencia

`mlLab.hints` en `preferences.js`, por defecto encendido. Si no hay valor
guardado, toma el de la guía: quien la tenía apagada no veía tooltips con el
mouse y no los tiene que ver de golpe.

### D5 · Textos

- Interruptor: "Ayudas" / "Hints".
- Qué hace: "Enciende o apaga las explicaciones que aparecen al posar el
  cursor o llegar con Tab a un control."
- Por qué importa: "Explican cada control a quien recién empieza; quien ya
  los conoce puede apagarlas. Un control que no se puede usar sigue diciendo
  por qué al apretarlo."

## Riesgos

- **La barra de arriba gana un control.** Si a 1032 px de ancho (el mínimo
  con el que se midió Inspeccionar), en español o en inglés, la barra pasa a
  dos renglones o corta un texto: parar y consultar con medidas y una
  alternativa.
