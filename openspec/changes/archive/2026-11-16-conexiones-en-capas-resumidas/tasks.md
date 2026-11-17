# Tareas

Empezar con `operacion-por-operacion` ya commiteado entero.

## 1. Dibujo

- [x] 1.1 `network-inspector.js`: entre capas con alguna resumida, las conexiones se dibujan con `linkLook` como entre capas abiertas; quitar `drawBand`; extremos al borde del cuadrito (design.md D1). Verificar "Todas resumidas", "Resumir una capa", "Una capa resumida y su vecina abierta" y "Filtro de conexiones con capas resumidas".
  *Hecho. Sin `drawBand` ni el `continue` de las bandas: toda conexión se dibuja con `linkLook` y su rol de siempre. Las puntas salen de `linkOut` / `linkIn` (borde del cuadrito que mira a la otra capa; centro en una capa abierta), y las usan también el flujo, las marcas del paso, los números, la pastilla y la cuenta de a operaciones. Verificado sin ventana con `prueba-21-11-11-4` (cerebro de prueba con pesos al azar, semilla 13, no entrenado): todas resumidas, entradas resumidas con la oculta abierta (líneas de cada cuadrito a cada neurona) y la oculta 1 resumida sola. Filtro en 1, 3 y 5: 370, 318 y 266 conexiones atenuadas; con "Todas", 0. Capturas `resumidas-1.1-*.png` y `resumidas-1.3-*.png`.*
- [x] 1.2 Tope de grosor por el lado del cuadrito (D2), con prueba. Verificar "Grosor entre cuadritos".
  *Hecho. `capToSquare(width, side)` en `link-look.js`: tope en la mitad del lado del cuadrito en pantalla (el menor de las dos puntas), piso 1,5, o 1 si el tope queda por debajo. Prueba en `tests/link-look.test.js`, con lados de 2 a 14 px. No medí grosores en el navegador: el camino es el mismo que la prueba.*
- [x] 1.3 Capturas en la carpeta de notas con la red 21, 11, 11, 4 toda resumida: "Todas", 5, 3 y 1, a 1440×900 y 1366×768. **Si con "Todas" es una mancha, parar y consultar** (design.md, Riesgos).
  *Hecho, sin consulta. Capturas con la red 21, 11, 11, 4 toda resumida, con "Todas", 5, 3 y 1, a 1440×900 y 1366×768. Observado: con "Todas" se distinguen las cuatro columnas y las conexiones gruesas entre las dos ocultas se leen por encima del resto; entre las 21 entradas y la oculta 1 queda denso (231 líneas en unos 300 px de alto), sin que se pierdan las capas. Con 1, una línea por neurona y lo demás atenuado. La lectura es mía: decidí no parar. El cerebro es de prueba, no el entrenado de la persona.*

## 2. Comportamiento

- [x] 2.1 Elegir una conexión con un clic entre capas resumidas, vista previa al posar el cursor en un cuadrito o una línea, y pastilla si entra (D3). Pruebas del blanco del clic. Verificar "Elegir una conexión entre capas resumidas" y "Vista previa entre capas resumidas", y que elegir un cuadrito sigue andando como antes.
  *Hecho en el grupo 1: `hitLink` ya no saltea las capas resumidas y mide contra las puntas en el borde del cuadrito (`linkEnds`); los números, la pastilla y la cuenta de a operaciones se dibujan si no tapan la columna de una capa resumida (`overSquares`). Prueba en `tests/inspector-layout.test.js`: clic en la línea entre dos ocultas resumidas, clic en un cuadrito, y de un cuadrito a una neurona abierta. Verificado sin ventana con clics y movimientos de mouse de verdad, `prueba-21-11-11-4` toda resumida: posar en una línea da vista previa de esa conexión; el clic la elige con su detalle y su pastilla, sin abrir capas; posar en un cuadrito relaciona sus 32 conexiones (21 que entran y 11 que salen); el clic en el cuadrito elige la neurona con su tarjeta. Capturas `resumidas-2.1-*.png`.*
- [x] 2.2 Flujo y animación del paso por esas líneas, también de a operaciones; menos movimiento. Verificar "Flujo entre capas resumidas" y "Capa resumida" de "Paso animado".
  *Hecho en el grupo 1: el flujo y las marcas del paso usan las mismas puntas. Verificado: flujo `run` reproduciendo con todo resumido; de a operaciones la conexión en curso es una línea, con su cuenta al costado y sin tapar cuadritos; de a capas, la ola por las líneas. Menos movimiento: sin cambios (no se crea la animación). Capturas `resumidas-2.2-*.png`.*
- [x] 2.3 Laboratorio: resumir capas con puntos y con "Tu manejo", aprendiendo y en pausa; nada se rompe y las líneas se ven.
  *Verificado sin ventana: Laboratorio con todas las capas resumidas, con puntos aprendiendo, en pausa y de a neuronas, y con "Tu manejo" aprendiendo y en pausa; las líneas se ven y la consola no da errores. Las flechas de la vuelta (cuánto cambió cada peso) siguen sin dibujarse entre capas resumidas, como antes: no lo pide este cambio. Capturas `resumidas-2.3-*.png`.*

## 3. Cierre

- [x] 3.1 Fluidez con la red más grande, todo resumido, "Todas" y flujo encendido: mediana y peor intervalo entre cuadros en 10 s, de a cuadros en tiempo real. Verificar "Red más grande, todo resumido".
  *Medido sin ventana a 1440×900, `prueba-grande` (912 conexiones), todo resumido, "Todas" y el flujo encendido, de a cuadros en tiempo real, 10 s, dos corridas: 60 cuadros por segundo (el pedido es 55 o más), intervalo 16,7 ms de mediana y 16,8 de peor; dibujo del diagrama 0,9 ms de mediana y de 1,3 a 2,3 de peor. Con la banda (código de `d09b03c`, mismo script): 60 por segundo y 0,3 ms de dibujo.*
- [x] 3.2 Leyenda y textos: si algún tooltip o texto de guía nombra la banda, corregirlo en `es.js` y `en.js`.
  *Revisado: ningún texto de `es.js` ni `en.js` nombra la banda. Nada que cambiar.*
- [x] 3.3 `npm test` y `openspec validate conexiones-en-capas-resumidas --strict`.
  *`npm test`: 1195 en verde. `openspec validate conexiones-en-capas-resumidas --strict`: válido.*
