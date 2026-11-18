# Design

## Context

Medido en el código después de `reglas-mesa-de-trabajo` (commit `7818dd3`):

- **El choque** (`src/tabs/rules/index.js`). Con "Reintentar solo" encendido, se muestra un cartel chico (`crashBadge`) y el intento se reinicia a los `RETRY_STEPS` = 90 pasos (un segundo y medio a 60 por segundo; `src/tabs/rules/session.js`). Apagado, se muestra `crashBox` sobre la escena, con Reiniciar como acción principal (`mainAction('rules', { crashed })`).
- **La disposición.** La zona del escenario tiene la escena, la columna de percepción al costado (una fila por sensor y `velocidad`, que insertan su comparación) y la marcha debajo, de 100 px. A 1366×768 la escena mide 547 px de alto y el editor muestra 15 líneas.
- **El mundo** (`src/core/world.js`) es determinista y no conoce el DOM. El lenguaje de reglas corre sin navegador (`reglas`, "Lenguaje sin navegador").
- **Los ejemplos** (`src/tabs/rules/examples.js`): `EXAMPLES` trae los tres programas con sus sensores. `settingsForProgram` los lleva a la calle recta. Hoy se cargan con confirmación si hay texto propio.
- **Las líneas que se cumplen** ya se calculan por cuadro, para resaltarlas (`data-state="holds"`).
- **El estado "choque"** (`data-state="crash"`), con su contorno rojo, el rayado y ✸, existe desde `sistema-de-diseno-base`.

## Goals / Non-Goals

**Goals:**
- Que el choque se quede a la vista con sus datos y lleve a una comparación con los ejemplos.
- Que la repetición y la comparación muestren el cálculo real (Art. 7) y sean deterministas (Art. 8).
- Que nada de esto trabe la animación (Art. 10).

**Non-Goals:**
- Volver a simular para la repetición. Se graba mientras el auto anda.
- Guardar el cuaderno o "Tu programa" entre visitas.
- Cambiar El problema.

## Decisions

### D1. La tarjeta del caso, en el lugar de la marcha

Al chocar, la barra de marcha de la zona del escenario se reemplaza por la tarjeta del caso, con el estado "choque" (contorno, rayado y ✸). Lleva:

- **Título y datos:** "¡Choque! Se salió de la calle a los 82 m", y "Se cumplían: líneas 3 y 5" o "Ninguna regla se cumplía".
- **Acciones:** "Compará con los ejemplos" (principal), "Escribir una regla para este caso" (secundaria) y "Reiniciar (R)" (secundaria).
- **La cuenta regresiva**, con el reintento encendido: "Vuelve a salir en 4 s".

Otras decisiones:

- **La columna de percepción** queda congelada sola: ya muestra la última lectura con la pausa del choque. Las filas siguen insertando su valor, que ahora es el del choque.
- **El editor** marca las líneas del instante del choque con `data-state="crash"`, en lugar de `holds`: una barra lateral roja y ✸ en el margen, distintas del ▸ y de la barra blanca de "se cumple".
- **El cartel viejo y `crashBox`** se quitan de Reglas a mano.
- **El alto:** la tarjeta mide 140 px o menos, así que a 1366×768 la escena queda en 500 px o más. Se mide.

*Alternativa descartada:* la tarjeta sobre la escena, como hoy `crashBox`. Tapaba el lugar del choque.

### D2. Reintento de 5 segundos con cuenta regresiva

- `RETRY_STEPS` pasa a 300 pasos (5 s a 60 por segundo, en tiempo de simulación). La tarjeta muestra los segundos que faltan.
- **Retención:** al tocar cualquier control del caso (el deslizador de la repetición, "Compará con los ejemplos", "Escribir una regla…" o una fila de la columna), la sesión pasa a `held` y no reinicia sola. Reiniciar a mano, probar otro programa o cambiar de pista sale de ese estado.
- La pausa sigue deteniendo la cuenta, como hoy ("En pausa no se reintenta").
- *Por qué tiempo de simulación:* así es determinista y respeta la pausa.

### D3. La repetición, grabada en un búfer circular

- Mientras el auto anda, la pestaña guarda los últimos 180 cuadros (3 s a 60 por segundo) en un búfer circular. Cada cuadro guarda la pose del auto, las lecturas de los sensores y la velocidad, los controles accionados y los números de las líneas que se cumplían.
- El tráfico no se guarda: es una función pura del tiempo (`traffic.vehicles(t, …)`), así que se recalcula para el instante.
- El búfer se vacía al reiniciar.
- **El deslizador** va abajo de la escena, superpuesto, con el ancho de la escena. Va de −3 s a 0 y por defecto en 0. Las flechas lo mueven de a un cuadro y Mayús + flechas de a 10 (unos 0,17 s).
- Al moverlo, se dibuja el cuadro guardado en lugar del mundo. La columna y el editor muestran lo de ese cuadro.
- Las flechas, con el foco en el deslizador, no llegan al control del auto.
- **Memoria:** unos 180 × (pose + 30 lecturas + 4 controles + líneas), menos de 100 kB.
- *Por qué grabar y no volver a simular:* el programa puede haber cambiado mientras el auto andaba ("El programa rige mientras se escribe"). Grabar muestra lo que realmente pasó, aunque el texto ya sea otro.

### D4. La comparación, corrida sin navegador por tramos

**`compareRuns({ seed, settings, programs, limitSeconds: 120 })`**, en `src/tabs/rules/` sin DOM, corre cada programa en un mundo nuevo:
- con la misma semilla de tráfico del intento, la misma velocidad y la calle recta (los ejemplos se escribieron para ella);
- con los sensores de cada programa;
- hasta chocar o hasta los 2 minutos.

Devuelve, por programa: los sensores, las reglas, la distancia, los vehículos superados, si chocó y a los cuántos metros.

- **Por tramos:** un generador avanza 600 pasos por tramo. La pestaña lo llama entre cuadros (`requestAnimationFrame` o un `setTimeout` de 0), así la escena sigue animándose. Mientras tanto, la tabla dice "Calculando…".
- **Cuánto cuesta [Hipótesis, se mide]:** 4 programas × 7200 pasos como máximo. A unos 20 µs por paso son unos 0,6 s repartidos en varios cuadros.
- **La fila del programa que maneja:** si el intento actual es en la calle recta, con esa semilla, se corre igual que los demás, para que el tope de 2 minutos sea parejo.
- **Si la pestaña está en un circuito:** la comparación corre en la calle recta y lo dice ("en la calle recta, donde se escribieron los ejemplos").
- **Aviso de velocidad:** si la velocidad no es 20 m/s, la tabla avisa que los ejemplos se escribieron para 20 m/s.
- **Qué columna manda** (decisión del dueño, 18 de noviembre de 2026, después de ver las cifras): "Superados" es la primera columna de cifras, con la cifra destacada (`--text-figure`), porque es lo que miden las misiones. La distancia va después, con el peso del cuerpo. Un programa que no choca ni supera a nadie lleva en su resultado "frena detrás del primero", en lugar de "no chocó en 2 min". Con los valores por defecto, el ejemplo de 3 sensores cortos recorría 1223 m sin chocar y con 0 superados, y parecía el ganador.
- **La tabla** va en la tarjeta del programa, entre la cabecera y el editor, plegable y abierta mientras se compara. Columnas: programa, sensores, reglas, distancia, superados y "chocó a los X m" o "no chocó en 2 min". Cada fila es un botón "Probar".
- **Siempre a mano:** la cabecera suma "Comparar" (acción terciaria) junto a los ejemplos, así la comparación también se abre sin chocar.

### D5. "Tu programa"

- Un espacio en el estado de la pestaña, `{ text, sensors }`. Se llena cuando se carga un ejemplo o se prueba una fila de la comparación con un texto propio en el editor, es decir, que no coincide con un programa conocido (`knownTexts`).
- En la fila de los ejemplos aparece "Tu programa" como primera opción, con el estilo de opción elegida cuando es el que está en el editor.
- Restablecer el programa lo borra.
- No se guarda entre visitas: el programa recordado de hoy ya guarda el texto del editor.

### D6. La regla para el caso

**`caseCondition(lecturas, idioma)`**, una función pura:
- toma los dos sensores con lectura más alta que sean mayores que 0,3, o el único si hay uno solo;
- redondea cada valor hacia abajo a la décima (0,87 da 0,80);
- arma `si sensor1 > 0,80 y sensor2 > 0,80 entonces ` con las palabras y el separador del idioma.

Si ningún sensor pasa de 0,3, el choque fue contra el borde sin nada delante, y la condición usa los dos sensores laterales más altos.

El texto se agrega al final del programa con un salto de línea antes, por el mismo camino de inserción que la paleta (con deshacer).

### D7. El cuaderno de casos

- Una franja de 40 px entre la escena y la tarjeta de la marcha o del caso. Muestra "3 casos · 5 reglas · mejor 310 m" y un eje de 0 a la mejor distancia, con un punto rojo con ✸ por choque.
- Cada punto tiene tooltip ("Chocó contra un vehículo a los 82 m").
- Se oculta con la guía.
- Se borra al restablecer el programa o al cambiar de pista. Sobrevive al cambiar de pestaña.
- *Por qué en la zona del escenario:* cuenta lo que le pasó al auto. Junto a la cifra de reglas cuenta la promesa: los casos crecen y las reglas detrás.

## Risks / Trade-offs

- [La comparación puede mostrar que el ejemplo "que no choca" sí choca, a otra velocidad o en otro tráfico] → El aviso de velocidad. Lo de fondo es *Prioridad 2* ("ejemplos solo valen a 20 m/s").
- [Llevar al principiante a los ejemplos puede reemplazar el escribir reglas propias] → "Escribir una regla para este caso" queda a un toque, y "Tu programa" conserva lo suyo. La comparación deja ver que tampoco los ejemplos alcanzan.
- [5 segundos de cuenta regresiva pueden aburrir al mentor que muestra intentos seguidos] → Reiniciar (R) sigue a mano. Si molesta, el valor es una constante.
- [La tarjeta del caso más el cuaderno quitan alto a la escena] → Se mide a 1366×768: la escena tiene que quedar en 450 px o más. Si no, parar y consultar.
- [Rendimiento] La grabación copia unos pocos números por cuadro. La comparación corre por tramos fuera del dibujo. Se mide la fluidez con la comparación en marcha.

## Migration Plan

Sin datos que migrar. "Reintentar solo" conserva su preferencia; solo cambia cuánto espera. Vuelta atrás: revertir la pestaña, `compareRuns`, `caseCondition` y el valor de `RETRY_STEPS`.
