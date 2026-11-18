# Design

## Context

Medido en `borradores/sistema-de-diseno/` (después de `sistema-de-diseno-base`, commit `4693d6f`) y en el código:

- Reglas a mano tiene tres zonas, como las demás pestañas: la escena (400 px por defecto), el tablero (cifras, editor, paleta y "Lo que percibe y lo que acciona") y el panel (360 px: tarjeta de consigna con la marcha, interruptores de vista, Tráfico nuevo, bloque Programa y misiones), más la barra de escenario arriba.
- A 1366×768 el tablero desborda 71 px; en el commit de partida de `sistema-de-diseno-base` desbordaba 37. La paleta, con fichas de 32 px, ocupa tres renglones con 5 sensores.
- `src/ui/layout.js` calcula los anchos con `fitZones({stage, panel}, ventana, spec)`. Una pestaña puede pedir sus mínimos y su ancho por defecto (`stageMin`, `stageDefault`, `boardMin`), como hacen Inspeccionar y el Laboratorio. No hay una variante sin panel.
- La marcha de Reglas a mano usa `mainAction` y `applyMainAction` (`src/ui/main-action.js`). El aviso de choque cambia la acción principal a Reiniciar.
- La percepción y la acción salen de `src/tabs/shared/driving-cards.js` (`perceptionBlock` y `actionBlock`), que comparten El problema y Reglas a mano. Con más de 12 sensores, las barras van sin nombre ni valor.
- La paleta inserta palabras en el cursor del editor y devuelve el foco (`src/ui/editor.js`).
- El grupo de sensores de la barra de escenario guarda sus valores por pestaña, y en Reglas a mano se cambia también desde los ejemplos y el Restablecer del programa.
- "Mostrame" de "Superá 10 en 3 tráficos distintos" apunta al botón Tráfico nuevo (`consigna-de-pestana`). Como se mueve el mismo elemento, el blanco no cambia.

## Goals / Non-Goals

**Goals:**
- Que el ciclo editar, mirar, chocar y corregir quede entre dos zonas vecinas.
- Que mover un control no cambie su comportamiento: se mueven los mismos elementos del DOM, con sus manejadores, atajos y tooltips.
- Que la inserción desde las barras sea una función pura probada sin DOM.

**Non-Goals:**
- Una disposición nueva para otras pestañas, o un componente de "mesa de trabajo" genérico. Si el lavado de cara la lleva a otras pestañas, se generaliza ahí.
- Cambiar el aviso de choque. Sigue sobre la escena como hoy; lo rediseña `reglas-el-choque-ensena`.

## Decisions

### D1. Dos zonas con la cuenta de anchos de siempre

`fitZones` y los límites aceptan `spec.panel === false`: el panel vale 0, su borde no se muestra y el ancho del panel guardado en las preferencias no se toca. Reglas a mano pide `{ panel: false, stageDefault: 520, stageMin: 300, boardMin: 520 }`.

- A 1440: escenario 520 y tablero el resto (cerca de 900). A 1366: 520 y 846. El editor de 70 caracteres de 13 px necesita unos 560 px, así que entra con holgura.
- Entre 600 y 959 px (ventana mediana) las dos zonas siguen lado a lado: el tablero cede hasta 300 y el escenario hasta 300. No se usa la disposición apilada de las otras pestañas, que pondría el editor debajo de la escena.
- El borde entre escenario y tablero sigue arrastrable, y su ancho se recuerda como el del escenario de Reglas a mano.

*Por qué 520:* la zona lleva la escena y, al costado, la columna de percepción (D2), de unos 220 px. Así la escena queda en unos 300 px de ancho, suficiente para 4 carriles. *Alternativa descartada:* esconder el panel con CSS y dejar las cuentas como están. Dejaba un hueco de 360 px sin usar, porque `fitZones` lo seguía reservando.

### D2. La zona del escenario

**Decisión del dueño (18 de noviembre de 2026), después de la parada de la tarea 3.4.** Con la marcha y la percepción debajo de la escena, a 1366×768 la escena medía 205 px de alto (229 con la percepción compactada y 272 sin guía), contra los 360 que pide la spec. La zona mide 647 px de alto, y la barra de marcha ocupaba 171 y la percepción 247. Se eligió la percepción al costado, en lugar de superponerla a la escena, plegarla en ventanas bajas o aceptar una escena corta.

1. **Arriba, la escena y una columna de percepción lado a lado, a todo el alto disponible.**
   - La escena tiene unos 300 px de ancho, con sus controles de cámara (Paisaje, + y −, Seguir al auto).
   - La columna mide unos 220 px:
     - "Entra · lo que percibe": **una barra horizontal por sensor**, de 24 px o más de alto, con el nombre a la izquierda y el valor a la derecha (`sensor3 ▓▓▓░░ 0,49`), y la barra de `velocidad`;
     - "Sale · lo que acciona": las cuatro teclas, en 2×2.
   - Con 12 sensores, las barras ocupan unos 340 px.
   - El texto de guía "Los nombres bajo las barras…" pasa a la ayuda de la columna, para no ocupar alto.
2. **Abajo, la barra de marcha en un renglón**, con Pausar (acción principal, 44 px), Reiniciar y Tráfico nuevo. Los interruptores Sensores, Ver como la máquina y Reintentar solo van en un segundo renglón compacto, con las cifras del intento a la derecha. La barra no puede pasar de unos 100 px de alto.

- Las barras de la escena y el aviso de choque siguen sobre la escena.
- *Por qué barras horizontales:* cada fila es un botón que se puede tocar (24 px de alto o más) aunque haya 12 sensores, y el nombre y el valor entran en la misma fila. Se pierde el orden de izquierda a derecha de los rayos: el orden es el de los nombres (`sensor1` arriba), que es el que se usa en el programa.
- *Alternativas descartadas:* superponer la percepción a la escena (tapa parte de la calle y obliga a correr la cámara), plegarla en ventanas bajas (esconde justo lo que la pestaña quiere mostrar) y aceptar una escena corta (se ve poca calle adelante del auto).
- *Por qué la marcha abajo de la escena y no en la tarjeta:* es el control del auto, y queda pegado al auto. Inspeccionar y el Laboratorio ya tienen su marcha abajo de lo que se mira (`consigna-de-pestana`).

### D3. El tablero

De arriba abajo:
1. La tarjeta de consigna: la consigna, la misión en curso con "Mostrame" y "Más sobre esta pestaña". Sin la marcha.
2. El texto de guía.
3. **La tarjeta del programa.** La cabecera tiene dos renglones:
   - el título "Programa", el rótulo "Decide · el programa", **"Reglas: N"** con la cifra destacada (`--text-figure`), y Restablecer (secundaria), Exportar e Importar (terciarias);
   - los sensores (Rayos, Alcance y Apertura, los mismos controles de la barra de escenario) y los ejemplos.

   Después vienen el editor y la paleta.
4. Las misiones.

- *Por qué la cifra de reglas va con el programa:* es la cifra de la promesa ("las reglas no escalan"). Junto a la distancia pesaba igual que ella.
- *Por qué los sensores con el programa:* en esta pestaña, cada sensor es una palabra del lenguaje. Al subirlos, la cifra de reglas y la paleta están ahí mismo.

- **El editor ocupa el alto que queda** en la tarjeta del programa, hasta el final del tablero visible, con un mínimo de 10 líneas. La paleta y las misiones van debajo y se alcanzan desplazando el tablero. Los ejemplos van en el renglón de los sensores, para que la cabecera tenga dos renglones y no tres. Esto responde a la medida de la parada: con el editor de alto fijo se veían 10 líneas a 1440 y 8 a 1366.

### D4. El grupo de sensores, en otro lugar y con el mismo estado

- La barra de escenario trata el grupo de sensores de Reglas a mano como un grupo que no se muestra (el mecanismo de "Grupo que no aplica").
- La cabecera del programa crea los mismos tres controles con la misma función que los arma en la barra, enlazados al mismo estado de la pestaña. Así, los ejemplos, Restablecer del programa y el análisis del programa al cambiar sensores siguen igual.
- El Restablecer de la barra, en Reglas a mano, deja de tocar los sensores, igual que en Competir.

*Alternativa descartada:* mover el nodo del grupo de la barra a la cabecera al entrar a la pestaña. Dos dueños del mismo nodo complican el cambio de pestaña.

### D5. Insertar desde una barra

- **`comparisonFor(dato, valor, idioma)`**, una función pura en el módulo de las reglas o del editor, devuelve `sensor3 > 0,49`: dos decimales, el separador del idioma y el nombre del dato en el idioma activo (`velocidad` o `speed`). El operador es siempre `>`; la persona lo cambia escribiendo.
- **`insertAt(texto, cursor, fragmento)`** agrega un espacio antes si el carácter anterior no es un espacio ni el comienzo de un renglón, y uno después. Devuelve el texto y el cursor nuevos. Usa el mismo camino que la paleta, así que entra en el historial de deshacer del editor.
- **El valor es el de la última lectura dibujada**, la que muestra la barra. Con el intento en marcha, es el valor de ese cuadro.
- **Con 12 sensores o menos**, cada fila de la columna es un `<button>` con su tooltip (`help.rules.barInsert.what` y `.why`), de al menos 24 px de alto y con foco visible. Enter y Espacio insertan sin disparar los atajos de la pestaña. **Con más de 12**, las barras no son botones: la paleta suma `sensor` y el texto "se pueden escribir de sensor1 a sensorN", que ya existe.
- **La barra de `velocidad`** también inserta.

*Por qué 12:* es el umbral que ya usa la percepción para sacar los nombres. Por encima de 12, las filas ya no entran con 24 px de alto en la columna a 1366×768.

### D6. La paleta

La paleta deja de ofrecer los sensores y `velocidad`; ofrece las palabras de regla, las cuatro órdenes y las constantes. Con 5 sensores pasa de tres renglones a dos o menos a 1366 (hipótesis: se mide).

### D7. Capturas

Se reusa `borradores/sistema-de-diseno/capturar.mjs`, copiado a `borradores/reglas-mesa-de-trabajo/`, con estas vistas de Reglas a mano, a 1440×900 y 1366×768:
- inicio;
- con el ejemplo de 7 sensores;
- con el de 20;
- con un error;
- con un choque (Reintentar solo apagado);
- con la guía apagada.

Y una a 800×600. En cada una se mide:
- el desborde del tablero;
- el alto de la escena;
- cuántas líneas del editor se ven;
- si la zona del escenario se desplaza.

## Risks / Trade-offs

- [Reglas a mano se ve distinta de las otras cinco pestañas (Art. 9)] → Lo aceptó el dueño. Las piezas (barra de escenario, consigna, estados) siguen siendo las mismas, y el lavado de cara puede llevar la disposición a las demás.
- [La escena pierde alto] → Tarea 3.4 con medida y "parar y consultar" si queda por debajo de 360 px a 1366×768.
- [El mentor que ya conoce la pestaña busca la marcha en el panel] → La barra espaciadora y R siguen iguales, y la acción principal sigue siendo el único botón relleno.
- [Insertar con el intento en marcha toma un valor que ya cambió] → Es el valor que muestra la barra en ese cuadro; para elegir con calma, se pausa. Lo dice la ayuda de la barra.
- [Rendimiento] Las barras ya se redibujan en cada cuadro. Hacerlas botones no agrega trabajo al bucle: el valor se lee al hacer clic.

## Migration Plan

Sin datos que migrar. El ancho del panel guardado no se toca. El ancho del escenario de Reglas a mano empieza en 520; un ancho de escenario guardado antes, pensado para tres zonas, se toma solo si está entre los límites nuevos. Vuelta atrás: revertir los cambios de la pestaña y la variante sin panel de `layout.js`.
