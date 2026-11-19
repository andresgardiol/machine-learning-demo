# Tasks

Quién hace qué (design.md D7): los grupos marcados **[Fable]** los hace una sub-sesión Fable 5.2 medium, y los marcados **[Opus]**, una sub-sesión Opus 5.5 medium. Empieza Fable. Opus arranca en el grupo 3, cuando el grupo 2 está hecho. Requiere `trafico-vivo` archivado o, al menos, con sus tipos y medidas en el código.

## 1. Muestras de estilo [Fable]

- [x] 1.1 Capturas del antes, en Chrome a 1440×900: El problema, Reglas a mano, Entrenar con 100 autos y Competir con seis competidores, en la V1 y en la V2. Guardarlas en `borradores/vehiculos-ilustrados/antes/`. Verificación: ocho capturas con su nombre.
  *Hecho: `node borradores/vehiculos-ilustrados/capturar.mjs antes` sobre el commit 8439114 (sin cambios de código todavía), Chrome sin ventana con tiempo virtual, 1440×900, dpr 1. Medido: ocho capturas (`v1-` y `v2-` de `problema`, `reglas`, `entrenar-100` y `competir-6`); Entrenar con «100 autos» y Competir con 6 competidores, según la propia página. En Competir la foto cae a los 6 s de largar, con los seis autos todavía juntos. En la V2 el botón Agregar de Competir está en una sección plegada y el script lo aprieta sin abrirla.*
- [ ] 1.2 Página de muestra `borradores/vehiculos-ilustrados/muestras/index.html`, que use canvas y los tokens reales. Muestra dos o tres variantes de estilo, inspiradas en `assets/og-image.png`, de los cinco vehículos: el auto del conductor y moto, auto, camioneta y camión del tráfico.
  - Cada variante sobre la pista oscura, con sus medidas reales (D3 de `trafico-vivo`), en el zoom por defecto, en uno cercano y en uno lejano (la versión simplificada).
  - En los colores del auto, el tráfico, el choque (con su cruz) y los seis competidores, y con la población atenuada.
  - El contorno de choque se puede superponer con un interruptor.

  Verificación: la página abre sin errores en la consola y cada variante muestra todo lo pedido. **Detenerse y consultar**: el dueño elige una variante. Anotar la elección acá.

## 2. Dibujos definitivos [Fable]

- [ ] 2.1 `src/render/vehicles.js`: para cada uno de los cinco vehículos, las funciones de la capa de carrocería (máscara) y de la capa de detalle (neutra: negros y blancos con transparencia, vidrios y luces fijos), en metros y en ejes locales. Incluye la versión simplificada para zoom lejano (D4, riesgos). Sin dependencias y sin tocar el núcleo. Verificación: la página de muestra pasa a usar este módulo y se ve igual que la variante elegida.
- [ ] 2.2 Prueba de honestidad (D4) en `tests/vehicles.test.js`: rasterizar cada máscara en un canvas de prueba y comprobar que ningún píxel cae fuera del rectángulo de choque, con un píxel de tolerancia, y que la sombra no pasa de 0,15 m. Si el entorno de pruebas no tiene canvas, la prueba trabaja sobre los puntos de los trazos. Verificación: la prueba pasa, y falla si se agranda a propósito un espejo.

## 3. Caché y recoloreo [Opus]

- [ ] 3.1 Caché por (tipo, color, escala) en `src/render/vehicles.js` (D3): la escala se redondea a potencias de 2 de píxeles por metro, la carrocería se pinta con `source-in` y el detalle va encima, y las entradas que no se usan se descartan. Verificación: prueba de que pedir dos veces lo mismo no rearma la imagen, de que un zoom continuo usa como mucho 4 escalas y de que el color cambia solo la carrocería.
- [ ] 3.2 El choque compuesto (D2): carrocería del color del choque, el mismo detalle, y la cruz y el contorno punteado encima. Verificación: el escenario *Choque reconocible sin color*, en el navegador y con una captura en escala de grises.

## 4. Integración en la vista [Opus]

- [ ] 4.1 `drawVehicle`, `drawCar`, `drawTraffic` y `drawCompetitor` en `src/render/view.js` usan el caché, con la transparencia de siempre para el fantasma y el que terminó en Competir. Verificación: los escenarios *Vehículos ilustrados* ("Escena por defecto", "Cada tipo se reconoce" y "Mismo dibujo en las dos versiones") y *Un dibujo, muchos colores* ("Competidores con su color" y "Tráfico de un solo color"), en el navegador en la V1 y en la V2. Las pruebas de `vista-escenario` que ya existían pasan sin cambios.
- [ ] 4.2 Población con la forma ilustrada (D5) en `silhouettes` y `drawElite`. `drawOut` y la marca de élite siguen igual. Verificación: "Entrenar con cien autos", y los escenarios de *Dibujo de una población* y *Marca de la élite*, en el navegador.
- [ ] 4.3 Fluidez:
  - `node tools/bench.mjs` sin cambios, porque no toca el núcleo;
  - en el navegador, la tasa de cuadros durante 10 s en El problema por defecto, Entrenar con 100 y con 500 autos, y Competir con seis.

  Comparar con el antes (1.1) y anotar en `borradores/vehiculos-ilustrados/despues.md` si se midió a la vista o sin ventana. Si "Población grande y fluida" no da 50 c/s a la vista, o si cualquier caso baja más de 10 % contra el antes, **detenerse y consultar** con el plan B de D3. Verificación: los números anotados.
- [ ] 4.4 Faros (D6): el cono de `src/v2/render/glow.js` pasa a 3,5 m, con degradé hasta 0 y bordes redondeados. Verificación: "Faros junto a los rayos", con una captura de la V2 con los sensores visibles.
- [ ] 4.5 "Roce visible": en El problema, el auto pasa a 0,2 m del costado de un camión. Se puede montar con un mundo armado en una prueba visual o en la página de muestra. Verificación: una captura con el hueco a la vista.

## 5. Cierre [Opus]

- [ ] 5.1 Pruebas: `npm test` sin fallas, con el total de pruebas anotado. `auditSistema()` sin problemas nuevos en las pestañas con escena.
- [ ] 5.2 Capturas del después, con los mismos ocho encuadres de 1.1, en `borradores/vehiculos-ilustrados/despues/`, y la comparación en `borradores/vehiculos-ilustrados/comparacion.md`. Verificación: las dieciséis capturas enlazadas.
- [ ] 5.3 Verificación manual en el navegador contra el filtro de entrada:
  1. se reconoce cada tipo y su frente;
  2. se entiende sin explicación;
  3. no hay controles nuevos;
  4. revertir vuelve a la silueta provisoria (comprobar con `git stash` en una copia).

  Verificación: lo observado anotado acá, separando lo medido de lo supuesto.
- [ ] 5.4 `PENDIENTES.md`: el cambio pasa a *Hecho*, con lo que quedó (por ejemplo, lo que no se pudo medir a la vista). Verificación: el diff.

## Workflow follow-up

- Las sub-sesiones no hacen push ni archivan. El dueño revisa y decide cuándo archivar.
