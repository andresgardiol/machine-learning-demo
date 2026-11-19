# Design

## Context

El motivo está en proposal.md (*Why*). Esto es lo que hay hoy, leído en el código:

- **`drawVehicle`** (`src/render/view.js`) dibuja cada vehículo con trazos de canvas en cada cuadro: un rectángulo redondeado del color de su papel, parabrisas, luneta y luces. Tiene variantes provisorias para la moto y el camión desde `trafico-vivo`. Lo usan el auto del conductor (`drawCar`), el tráfico (`drawTraffic`) y los competidores (`drawCompetitor`, con transparencias para el fantasma y el que terminó).
- **El choque** se dibuja aparte: el contorno relleno del color del choque, con borde punteado y una cruz.
- **La población** (`silhouettes`, `drawElite`, `drawOut`) dibuja solo los contornos de choque, todos en un único trazo: relleno atenuado para los que están en carrera, contorno punteado para los que quedaron afuera y rombo para la élite.
- **La V2** usa la misma vista (`createStageView` de `src/render/view.js`) y le suma `src/v2/render/glow.js`: rayos con resplandor y un cono de faros de 7 m (`BEAM_LENGTH`) con 25 % de opacidad.
- **Colores:** tokens de `styles/tokens.css`. El auto es `#3ddc84`, el tráfico `#ffb020`, el choque `#ff5a5a` y los seis competidores tienen los suyos.
- **Medidas** de `trafico-vivo` (D3): moto 2,2 × 0,9 m, auto 4 × 2 m, camioneta 5,2 × 2,2 m y camión 10 × 2,5 m. El auto del conductor mide 4 × 2 m.
- **Referencia de estilo:** `assets/og-image.png`, generada con SpriteCook (`assets/spritecook-assets.json`). Es una imagen fija con el verde ya puesto y espejos que sobresalen.

## Goals / Non-Goals

**Goals:**
- Que el dibujo de cada tipo sea código vectorial nítido en cualquier zoom, con capas que se puedan recolorear.
- Que con 500 autos cada cuadro dibuje igual o más rápido que hoy.
- Que el dueño elija el estilo viendo muestras antes de integrarlo.

**Non-Goals:**
- Imágenes de mapa de bits generadas como recurso final.
- Dibujos distintos según el estado (frenando, girando).

## Decisions

### D1. Vector propio, no imágenes generadas

Los dibujos son funciones que trazan sobre un canvas (`drawBody(ctx, type)` y `drawDetail(ctx, type)`), en metros y en ejes locales (x hacia adelante). No son PNG.

- **Por qué:**
  - escalan a cualquier zoom sin perder nitidez;
  - separan carrocería y detalle para recolorear;
  - respetan la medida exacta del contorno de choque;
  - no suman archivos ni dependencias.
- **La vista previa y SpriteCook** quedan como referencia de estilo. Fable puede generar un boceto con SpriteCook si le sirve para explorar, pero lo que entra a la app es el vector.
- **Alternativa:** sprites generados con SpriteCook. Tienen el color fijo (habría que recolorear los píxeles), medidas aproximadas y un archivo por tipo y por resolución.

### D2. Dos capas: carrocería que se pinta y detalle neutro

```
  capa carroceria (mascara)   +   capa detalle (neutra)    =   vehiculo
  +--------------------+          +--------------------+       +--------------------+
  |  ################  |          |   ..  [vidrio]  .. |       |  ##[vidrio]####    |
  | ################## |   tinte  |  sombra    brillo  |       | ##sombra##brillo## |
  |  ################  |  ----->  |   ..  [vidrio]  .. |       |  ##[vidrio]####    |
  +--------------------+  color   +--------------------+       +--------------------+
```

- **La capa de carrocería** es una forma de un solo color. Se pinta con el color del papel (`source-in` sobre la máscara).
- **La capa de detalle** usa solo negros y blancos con transparencia (sombras, brillos y reflejos) y colores fijos para vidrios y luces. Así funciona con cualquier color de carrocería.
- **El choque** se compone así: carrocería del color del choque, el mismo detalle y, encima, la cruz y el contorno punteado de siempre (*Choque reconocible sin color*).
- **Alternativa:** un dibujo por color. Con 3 papeles fijos, 6 competidores y 5 tipos son decenas de dibujos que mantener.

### D3. Caché por tipo, color y escala

- La primera vez que se pide (tipo, color, escala) se arma la imagen en un canvas fuera de pantalla. Después, cada cuadro hace un `drawImage` girado.
- **La escala** se redondea a potencias de 2 de píxeles por metro (zoom × dpr). Así un zoom continuo no llena el caché, y se dibuja con la potencia inmediata superior para que no se vea borroso.
- **Tamaño del caché:** unas 5 formas × 10 colores × 3 o 4 escalas en uso, con descarte de las que no se usan hace rato.
- **Impacto en el bucle de dibujo:** hoy cada vehículo cuesta unos 8 trazos. Con caché es un `drawImage`. La población de 500 pasa de un trazo único de contornos a 500 `drawImage` de la forma atenuada. Se espera que sea parecido o más rápido, pero es una hipótesis: se mide en el navegador (tarea 4.3). Si no alcanza, el plan B es volver al trazo único para la población, usando como camino el contorno ilustrado simplificado (D5).

### D4. Estilo, medidas y honestidad

- **Estilo:** mitad realista y mitad caricatura, como la vista previa. Formas redondeadas y algo exageradas, vidrios oscuros con un reflejo, un brillo especular en el techo y una sombra suave debajo.
- **Rasgos que distinguen cada tipo:**
  - moto: casco y piloto visibles desde arriba;
  - camioneta: caja de carga;
  - camión: cabina y acoplado.
- **Honestidad:** la carrocería entra en el rectángulo de choque, con 2 cm de margen. Los espejos van pegados o se omiten. Solo la sombra sale, hasta 0,15 m y con poca opacidad.
- **La prueba** rasteriza cada máscara de carrocería y comprueba que no hay píxeles fuera del rectángulo, con un píxel de tolerancia por el suavizado.

### D5. Población con la forma ilustrada

- Los autos en carrera se estampan con la máscara del auto en el color del auto y con la opacidad de siempre (`RACING_ALPHA`).
- Los que están fuera de carrera conservan el contorno punteado. La élite conserva su marca (el contorno propio y el rombo).
- Así se distingue líder, en carrera, afuera y élite como hoy, pero con la silueta de auto.

### D6. Faros

- El cono de `glow.js` baja de 7 m a 3,5 m, con degradé que se apaga del todo y bordes redondeados en vez de un trapecio de lados rectos.
- En la V1 no hay cono; los faros quedan como puntos de luz en el dibujo.
- **Alternativa:** sacar el cono. Se pierde algo del clima de la vista previa que le gustó al dueño.

### D7. Quién hace qué

- **Fable 5.2 medium** diseña:
  - la página de muestra con dos o tres variantes de estilo de los cinco vehículos sobre la pista oscura, en los colores reales, en el zoom por defecto y en el cercano;
  - después de la elección del dueño, las funciones de dibujo definitivas en `src/render/vehicles.js`.
- **Opus 5.5 medium** hace la integración: el caché, el uso en `view.js` y `glow.js`, las pruebas, la fluidez y las capturas.
- Las tareas indican en cada grupo a qué sesión van.

## Risks / Trade-offs

- **[A zoom lejano, el detalle se vuelve ruido]** → Con menos de 8 píxeles por metro, el caché arma una versión simplificada: carrocería, parabrisas y nada más. Fable la diseña junto con la completa.
- **[Con 6 colores de competidor, alguno pierde contraste con su detalle]** → La página de muestra incluye los seis y el dueño los ve antes de elegir.
- **[El brillo de la carrocería se confunde con "en curso" o "se cumple" del sistema de diseño]** → Los brillos son blancos y tenues, sin ningún color con significado (Art. 9).
- **[Más dibujo, menos fluidez en máquinas lentas]** → Caché (D3) y medición en el navegador, con el plan B de D3.
- **[`OffscreenCanvas` no está en todos los navegadores]** → Se usa un `<canvas>` creado con `document.createElement`, que funciona en todos. El módulo vive en `src/render/`, nunca en el núcleo.

## Migration Plan

- Sin datos que migrar.
- Para volver atrás, se revierte el cambio y vuelve la silueta provisoria de `trafico-vivo`.

## Open Questions

- Cuál de las variantes de estilo de la página de muestra queda. La elige el dueño en la tarea 1.2 y no cambia el enfoque ni las tareas.
