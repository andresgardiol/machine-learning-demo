# Proposal

## Why

Segundo cambio de la revisión de diseño de las cuatro pestañas que faltaban (18 de noviembre de 2026). El primero es `red-al-centro`. Este junta las dos pestañas donde maneja una persona, El problema y Competir: comparten el teclado y la escena grande, y les quedan arreglos chicos.

Lo observado en el análisis de UX (`borradores/analisis-ux/informe.md`, §2.1 y §2.4, P13 y P14) y en las capturas del 17 de noviembre. La sub-sesión lo vuelve a medir en el antes:

- **El problema.**
  - El volante es muy sensible: un toque de 0,3 s a la izquierda saca al auto de la calle. Hoy el auto gira a 1,8 rad/s (unos 100° por segundo) desde el primer cuadro en que se aprieta la flecha (`TURN_RATE`, `src/core/car.js`). A 20 m/s, 0,3 s de giro son unos 31° [cuenta, no medido en pantalla].
  - Debajo de "Lo que estás accionando" quedan unos 200 px vacíos a 1440×900.
  - Nada sobre la escena dice qué tocar para empezar: la consigna está en el panel.
- **Competir.** Ya tenía la mejor jerarquía. Le quedan cortes:
  - "Choques" y "Estado" del marcador se leen pegados ("ChoquesEstado"); en `vista-de-la-red` se midió que "Choques" sale 6 px de su caja;
  - el nombre de la pista se corta a 1236×863 (117 de 97 px) y pasa a dos renglones a 1366;
  - en el cartel de largada, "Carrera a 1000 m." parte el número de su unidad;
  - el botón 👁 de cada competidor no tiene nombre ni tooltip (medido en el análisis);
  - a 1366×768 el panel se desplaza hasta 126 px con seis competidores (medido en `pestana-competir`, grupo 12).

**Concepto que hace visible.** Que manejar es una sucesión de instantes: en cada uno, lo que el auto percibe y lo que la persona acciona. Eso mismo, guardado, son los datos de los que aprende una red a imitar. Y que la salida sigue siendo sí o no en cada cuadro, aun con un volante suave.

## What Changes

- **Volante suave para el teclado** (El problema, Competir, Manejar vos en Inspeccionar y grabar en el Laboratorio).
  - Al mantener una flecha, el giro crece de cero al máximo en 0,3 s. Al soltarla, se corta en el acto.
  - No cambia la física ni el contrato: el controlador de teclado sigue devolviendo sí o no en cada cuadro, y reparte los "sí" entre cuadros mientras el giro crece. Un toque corto dobla en algunos cuadros y no en otros.
  - Los cerebros, los programas y las carreras dan los mismos resultados que antes.
- **"Lo que estás accionando" muestra cuánto se dobla.** Izquierda y Derecha se llenan en proporción al giro (de 0 a 100 %), con el número. Avanzar y Retroceder siguen siendo sí o no.
- **La cinta del manejo**, en el centro vacío de El problema. Es una tira con los últimos 10 segundos:
  - arriba, una fila por sensor y la velocidad, con el color de "entra";
  - abajo, las cuatro acciones, con el color de "sale";
  - cada columna es un cuadro;
  - al chocar se congela con una marca en el cuadro del choque.

  Una línea dice que eso son datos, y que con datos así aprende una red a imitar (Laboratorio, Tu manejo).
- **Cartel de primer manejo** sobre la escena de El problema, como el de Competir: "Manejá con las flechas: ↑ avanza, ← → doblan". Se va con la primera tecla de manejo y vuelve en cada visita a la pestaña. Solo se ve con la guía activa.
- **Competir sin cortes:**
  - "Choques" y "Estado" separados, cada uno en su columna, con su ancho;
  - el nombre de la pista en una sola línea en la tabla y en "Primero", con la forma corta si no entra y el nombre completo en el tooltip;
  - en el cartel de largada, el número y su unidad juntos;
  - el botón de los sensores de cada competidor con nombre accesible y tooltip ("Ver sus sensores"), y el de quitar también;
  - a 1366×768, el panel no se desplaza con tres competidores, y con seis solo se desplaza la lista por dentro.
- **Capturas del antes y del después** de las dos pestañas.

Fuera de alcance:
- cambiar `TURN_RATE` o la física del auto;
- volante suave para los cerebros o los programas;
- la cinta del manejo en otras pestañas, o guardarla para el Laboratorio;
- un "volante directo" opcional (D1);
- el resto de las ideas de Competir anotadas en *Competir y circuitos*.

**Filtro de entrada**

1. *¿Qué concepto hace visible?* La cinta muestra que cada instante de manejo es un par percepción y acción: un dato. El volante suave muestra que una salida de sí o no, repartida en el tiempo, puede dar un giro gradual.
2. *¿Se entiende sin que nadie lo explique?* El cartel dice qué tocar. La cinta se llena mientras se maneja y se congela al chocar, con una línea que dice qué es.
3. *¿El mentor puede ignorarla u ocultarla?* El cartel y la línea de la cinta se ocultan con la guía. La cinta sigue a la vista, como las barras de los sensores, porque es una lectura.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* El volante suave no tiene un mal uso: soltar la flecha corta el giro. Reiniciar vacía la cinta. En Competir no hay comportamiento nuevo.

**Público.** Al principiante le da un primer manejo que no termina en un choque al segundo y algo que mirar en el centro. Al mentor le da la cinta como puente al Laboratorio ("esto son datos") y una carrera que se lee entera a 1366.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `controladores`: el controlador de teclado reparte el giro con un volante suave.
- `pestana-conducir`: la acción visible con cuánto se dobla; la cinta del manejo; el cartel de primer manejo.
- `pestana-competir`: el marcador y la tabla por pista sin cortes; botones de solo ícono con nombre; el panel a 1366×768.

## Impact

- `src/input/keyboard.js` (o donde se arma el controlador de teclado): el volante suave, con su estado por cuadro.
- `src/tabs/drive/index.js` y `src/tabs/shared/driving-cards.js`: la cinta y el llenado proporcional de Izquierda y Derecha; el cartel sobre la escena.
- `src/tabs/compete/index.js`, `competitors.js` y `countdown.js`: columnas, nombres y botones.
- `styles/app.css`; `src/i18n/es.js` y `en.js`.
- Pruebas: volante suave (núcleo del controlador, sin DOM); determinismo de cerebros y programas sin cambios; disposición de Competir.
- Ninguna dependencia nueva. La cinta dibuja en cada cuadro de El problema (ver *Rendimiento* en `design.md`).
