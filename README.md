# Machine learning demo

Un laboratorio interactivo para entender machine learning jugando, con un
autito como hilo conductor. Está pensado para dos públicos: el curioso sin
conocimiento previo, que lo usa solo, y el mentor, que lo usa para enseñar.
El proyecto se rige por [`CONSTITUCION.md`](CONSTITUCION.md).

JavaScript, HTML y CSS sin frameworks ni dependencias de terceros, sin paso de
build. El sitio es 100 % estático.

## Cómo ejecutar

Requiere Node 24 (la versión con la que se desarrolló y probó). Los módulos ES no
cargan al abrir `index.html` con doble clic: hace falta un servidor.

```bash
npm start
```

Después abrí <http://localhost:8000>. Otro puerto: `PORT=3000 npm start`.

## Cómo probar

```bash
npm test
```

Usa el ejecutor incluido en Node (`node --test`). No abre ningún navegador. La
interfaz se verifica a mano en el navegador.

## Arquitectura

Capas con dependencias que apuntan hacia el núcleo:

```
index.html
styles/          tokens.css (colores y medidas), app.css
src/
  core/          geometry, random, constants, track, car, sensors, traffic, controller, world
  input/         keyboard.js: controlador de teclado (adapta eventos al contrato)
  render/        camera.js y view.js: cámara y dibujo del escenario en canvas
  ui/            app, dom, store, loop, layout, i18n, tooltips, audit, preferences
  i18n/          es.js, en.js
  tabs/drive/    pestaña 1: index (composición), session, settings, shortcuts
  main.js
tests/           pruebas del núcleo, de textos y de arquitectura
tools/serve.mjs  servidor local de desarrollo
```

`src/core` no importa nada fuera de `core` ni usa `document`, `window`,
`Math.random`, `Date.now` ni `performance.now`; `tests/architecture.test.js`
lo verifica. El código y sus identificadores van en inglés; todo texto visible
sale de los diccionarios `es` y `en`.

Piezas del núcleo:

- `geometry.js`: vectores, intersección de segmentos y contornos de rectángulos.
- `random.js`: azar con semilla (mulberry32) y derivación por índice.
- `track.js`: pista por línea central, ancho y carriles; calle recta de 2, 3 o 4 carriles.
- `traffic.js`: tráfico como función pura de semilla, número de grupo y tiempo.
- `car.js` y `sensors.js`: física del auto y rayos de percepción.
- `world.js`: une todo y avanza en pasos fijos de 1/60 s (`step()`), con `reset()`, `pause()` y `resume()`.

Unidades: metros y segundos. Ejes matemáticos (x a la derecha, y hacia arriba,
ángulo antihorario); la vista decide cómo dibujarlos.

### Contrato de controlador

Todo lo que maneja un auto (teclado, programa, red neuronal) es un objeto con
una operación, `control(perception)`:

```js
// percepción que entra
{ sensors: [0, 0.4, 0.9, 0, 0],  // lecturas de 0 a 1, de izquierda a derecha
  speed: 0.5 }                   // entre -1 y 1 respecto de la máxima de avance

// controles que salen: cuatro sí/no
{ forward: true, reverse: false, left: false, right: true }
```

El mundo lo consulta una vez por paso. Dos controles opuestos a la vez se
anulan. Se entrega con `createWorld({ controller })` o `world.setController(c)`.
Para probar sin teclado: `constantController({ forward: true })` en `core/controller.js`.

Piezas de la interfaz:

- `ui/loop.js`: bucle de paso fijo (acumula tiempo real, máximo 5 pasos por cuadro, se detiene con la página oculta).
- `render/camera.js` y `render/view.js`: la calle recta se muestra vertical (se avanza hacia arriba); cámara que sigue al auto (zoom con rueda y botones, paneo arrastrando, tecla V para volver) y dibujo de pista, tráfico, auto y rayos con los colores de `styles/tokens.css`.
- `input/keyboard.js`: flechas y W A S D; ignora campos de texto y suelta todo al perder el foco.
- `tabs/drive/`: la pestaña 1, «El problema». `index.js` compone mundo, teclado, vista y panel; `session.js` (indicadores del intento y misiones), `settings.js` (configuración avanzada) y `shortcuts.js` (R reinicia, barra espaciadora pausa) no usan el DOM y se prueban con `node --test`.
- `ui/app.js` y `ui/layout.js`: el borde entre escenario y panel se arrastra (o se mueve con las flechas) para cambiar el ancho del panel, entre 300 px y la mitad de la ventana; se recuerda como preferencia.
- `ui/i18n.js` e `i18n/`: textos por clave (`data-i18n`); `ui/tooltips.js`: ayuda "qué hace / por qué importa" por clave (`data-help`).

Para la verificación manual, la consola del navegador expone `mlLab`: por ejemplo
`mlLab.auditTooltips()` lista los controles sin tooltip (debe devolver `[]`).

## Cómo publicar como sitio estático

No hay nada que compilar: publicá la raíz del repositorio tal cual. En GitHub
Pages: *Settings → Pages → Deploy from a branch*, elegí la rama y la carpeta
`/ (root)`. El archivo `.nojekyll` evita que Pages procese los archivos.
Habilitar el hosting es un paso manual.

## Créditos

El caso del auto que aprende a manejar está inspirado en el curso
"Self-driving Car" de Radu Mariescu-Istodor.
