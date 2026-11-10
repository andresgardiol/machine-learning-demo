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
  input/         controlador de teclado (adapta eventos al contrato)      [pendiente]
  render/        cámara y dibujo del escenario en canvas                  [pendiente]
  ui/            estructura, pestañas, tooltips, idiomas, preferencias    [pendiente]
  i18n/          es.js, en.js                                             [pendiente]
  tabs/drive/    composición de la pestaña 1                              [pendiente]
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

## Cómo publicar como sitio estático

No hay nada que compilar: publicá la raíz del repositorio tal cual. En GitHub
Pages: *Settings → Pages → Deploy from a branch*, elegí la rama y la carpeta
`/ (root)`. El archivo `.nojekyll` evita que Pages procese los archivos.
Habilitar el hosting es un paso manual.

## Créditos

El caso del auto que aprende a manejar está inspirado en el curso
"Self-driving Car" de Radu Mariescu-Istodor.
