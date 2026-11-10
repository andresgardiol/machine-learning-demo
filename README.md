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

## Cómo publicar como sitio estático

No hay nada que compilar: publicá la raíz del repositorio tal cual. En GitHub
Pages: *Settings → Pages → Deploy from a branch*, elegí la rama y la carpeta
`/ (root)`. El archivo `.nojekyll` evita que Pages procese los archivos.
Habilitar el hosting es un paso manual.

## Créditos

El caso del auto que aprende a manejar está inspirado en el curso
"Self-driving Car" de Radu Mariescu-Istodor.
