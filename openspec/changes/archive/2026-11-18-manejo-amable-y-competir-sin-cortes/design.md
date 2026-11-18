# Design

## Context

Rótulos: **[Medido]**, **[Observado]** e **[Hipótesis]**, como en `red-al-centro`.

- **[Observado en el código]** `stepCar` (`src/core/car.js`) gira `TURN_RATE · dt · dirección · steer`, con `steer` de −1, 0 o 1, según izquierda y derecha. `TURN_RATE` vale 1,8 rad/s. Los cerebros de ejemplo y los guardados se entrenaron con esa física.
- **[Observado en la spec]** *Contrato único de controlador* (`controladores`) pide cuatro controles de sí o no. *Controlador de teclado* devuelve lo que está apretado.
- **[Observado]** Captura `04-problema-manejando-1440.png` (17 de noviembre): el tablero tiene las cifras, la percepción (unos 360 px) y la acción (unos 120 px), y debajo un hueco de unos 200 px.
- **[Medido, en cambios anteriores]** Competir: "Choques" sale 6 px de su caja; el nombre de la pista se corta a 1236×863 (117 de 97 px); a 1366×768 el panel se desplaza hasta 126 px con seis competidores sin "Vos" y el panel en 360.
- **[Medido en el análisis de UX]** El tooltip del 👁 no apareció al pasar el mouse.

## Goals / Non-Goals

**Goals:**
- Un toque corto de flecha no saca al auto de la calle a la velocidad por defecto.
- Ningún cambio en lo que hacen los cerebros y los programas.
- El centro de El problema enseña algo.
- Competir sin texto cortado a 1366×768 y a 1440×900.

**Non-Goals:**
- Volante analógico en el núcleo.
- Rediseñar Competir.

## Decisions

### D1. El volante (elegida por Claude, reversible)

| Opción | A favor | En contra |
|---|---|---|
| A. Bajar `TURN_RATE` | Una línea | Cambia la física de todos: los cerebros guardados y los de ejemplo manejarían distinto (Art. 8) |
| B1. Giro proporcional en el núcleo (`controls.steer` de −1 a 1) | Un giro suave de verdad | Cambia el contrato de sí o no, que es el hilo de la app. Las grabaciones del Laboratorio dirían "izquierda" donde el auto dobló a medias |
| **B2. Volante suave en el controlador de teclado: el nivel de giro sube de 0 a 1 en 0,3 s y se reparte en "sí" y "no" entre cuadros** | El núcleo y el contrato no cambian; lo grabado en el Laboratorio es lo que hizo el auto; los cerebros no cambian | Un toque muy corto dobla de a saltos de un cuadro (0,03 rad), que no se ven [Hipótesis] |
| C. Bajar la velocidad por defecto de El problema | Sin código nuevo | El auto sigue girando 100° por segundo y la misión de superar vehículos se vuelve más difícil |
| D. Un interruptor "volante suave / directo" | La persona elige | Otro ajuste, y la mayoría no sabría para qué sirve |

**Elegí B2.**
- **Nivel.** Por lado, de 0 a 1. Mientras la flecha está apretada sube 1/18 por cuadro (0,3 s a 60 cuadros por segundo). Al soltarla vuelve a 0. Apretar la flecha opuesta arranca su propio nivel desde 0.
- **Reparto.** Con un acumulador por lado: en cada cuadro `acc += nivel`; si `acc ≥ 1`, ese cuadro devuelve "sí" y `acc -= 1`. Con el nivel en 1, devuelve "sí" en todos los cuadros, igual que hoy. Al soltar, el acumulador vuelve a 0.
- **Por cuadro, no por reloj.** El nivel avanza cuando el controlador se consulta, es decir, en cada paso de la simulación. En pausa no sube. A 2× sube igual por cuadro de simulación.
- **Cuenta [Hipótesis, a medir en 4.1]:** con un toque de 0,1 s, el auto gira unos 0,03 rad (hoy 0,18). Si se mantiene 1 s, gira unos 1,53 rad (hoy 1,8).
- **Dónde:** en el controlador de teclado, que usan El problema, Competir ("Vos"), Inspeccionar ("Manejar vos") y el Laboratorio (grabar). No hay otra persona que maneje.
- **El Laboratorio:** la grabación guarda los sí y no que salieron del controlador, que son los que movieron al auto. Si la imitación cambia por esto, lo verifica el dueño (no se mide aprendizaje en este cambio).

### D2. El centro de El problema: la cinta del manejo (elegida)

| Opción | A favor | En contra |
|---|---|---|
| A. Estirar las tarjetas de percepción y acción | Barato | Más grande no enseña nada nuevo |
| **B. La cinta del manejo: los últimos 10 s de percepción y acción, cuadro por cuadro** | Muestra que manejar produce datos (pares entrada y salida), el puente al Laboratorio; al chocar, deja ver qué pasó antes | Un dibujo nuevo, que corre en cada cuadro |
| C. Subir la consigna y las misiones al centro | Las misiones a la vista | Rompe el *Orden común del panel* y deja el panel vacío |

**Elegí B.**
- **Filas.** Una por sensor, en el orden de las barras, y la velocidad, con la intensidad del color de "entra" (`--color-in`) según la lectura. Después un renglón de separación y cuatro filas de acción (Avanzar, Retroceder, Izquierda, Derecha), llenas con el color de "sale" en los cuadros en que estuvieron en "sí".
- **Columnas.** Un cuadro por columna, los últimos 600. Si el lienzo es más angosto que 600 px, cada píxel junta varios cuadros: la percepción toma el promedio y la acción se enciende si estuvo en "sí" en alguno.
- **Con muchos sensores** (más de 12), las filas de sensores se reparten el alto y no llevan nombre. Con hasta 12, el nombre va a la izquierda en letra de 12 px.
- **Choque.** La cinta se congela y una marca vertical en la última columna dice "Choque". Reiniciar la vacía. En pausa no avanza.
- **Texto** (con la guía activa): "Cada columna es un instante: arriba lo que percibías, abajo lo que hiciste. Con datos así, una red aprende a imitarte (Laboratorio, Tu manejo)." Hasta 160 caracteres por idioma.
- **Alto.** La cinta ocupa el alto que sobra en el tablero, con un mínimo de 80 px. A 1440×900 se esperan unos 200 [Hipótesis]. A 1366×768, si no llega a 80 sin desplazar el tablero, parar y consultar (tarea 3.4).
- **Accesibilidad.** La cinta es un dibujo con un nombre accesible que la describe. La información también está en las barras y en la acción, así que no se repite cuadro por cuadro.

### D3. Cartel de primer manejo (elegida)

| Opción | A favor | En contra |
|---|---|---|
| A. Sin cartel; la consigna ya lo dice | Nada que hacer | La consigna está en el panel, lejos del auto |
| **B. Un cartel sobre la escena, como el de Competir, que se va con la primera tecla de manejo** | Coincide con Competir (Art. 9); dice qué tocar donde se mira | Tapa un poco la calle hasta la primera tecla |

**Elegí B.** Sin botón: no hay nada que confirmar. Con la guía apagada no se ve. Vuelve en cada visita a la pestaña, no después de cada reinicio, para no molestar en una clase. El cartel no toma el foco: las flechas manejan como siempre.

### D4. Competir sin cortes

- **Marcador:** anchos fijos para las columnas de cifras (Lleva, Choques, Mejor vuelta) y el estado, con el espacio entre columnas del sistema de diseño. Los encabezados no se parten ni se salen de su caja.
- **Nombre de la pista** en la tabla por pista y en el indicador "Primero": en una sola línea. Si no entra, se usa la forma corta (ya existe para la tabla angosta), y si tampoco entra, puntos suspensivos con el nombre completo en el tooltip.
- **Cartel de largada:** espacio que no se parte entre el número y su unidad, en los dos idiomas.
- **Botones de solo ícono** de la lista de competidores: el de los sensores y el de quitar, con nombre accesible ("Ver los sensores de …", "Quitar a …") y tooltip de qué hace / por qué importa. El ícono se mantiene.
- **Panel a 1366×768:** la fila de cada competidor pasa a un renglón (el nombre y el tipo en la misma línea, el tipo en gris), y la lista se desplaza por dentro con seis. Se mide con tres y con seis, con y sin "Vos". Si con tres el panel se sigue desplazando, se achica el espacio entre bloques. Si aun así no entra, parar y consultar.

## Rendimiento

- El volante suave suma una cuenta por cuadro: no se mide aparte.
- La cinta dibuja una columna por cuadro, corriendo el dibujo anterior con `drawImage` sobre sí mismo, sin redibujar todo. Se mide el tiempo por cuadro de El problema antes y después, en Chrome sin ventana. El mínimo de la medida sustituta es 55 cuadros por segundo.

## Risks / Trade-offs

- **La sensación del volante** es una hipótesis: que 0,3 s se sienta mejor lo tiene que probar el dueño a mano. El tiempo de subida queda en una constante (`STEER_RAMP_STEPS`) para cambiarlo fácil.
- **La cinta y la percepción compiten por el alto** a 1366×768.
- **Competir con "Vos"** cambia apenas: la persona dobla más suave al principio de cada giro. Las carreras entre cerebros no cambian.

## Migration Plan

Sin datos que migrar.

## Open Questions

Ninguna que frene. El dueño decide al probar si 0,3 s es el tiempo de subida correcto.
