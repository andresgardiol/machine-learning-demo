# Conexiones a la vista entre capas resumidas

## Por qué

Con las capas resumidas, el diagrama reemplaza todas las conexiones por una
banda gris uniforme entre cuadritos. Se pierde lo que la red tiene para
mostrar: qué conexiones pesan, de qué signo son y por dónde pasa la señal. El
filtro de conexiones (Todas, 5, 3, 1) y el flujo quedan sin nada que mostrar,
aunque sus controles sigan a la vista.

Leído en el código (no medido): `src/render/network-inspector.js` dibuja
`drawBand` cuando una de las dos capas está resumida y saltea toda conexión
que no sea de lo elegido (`if (banded && !related) continue`). La red más
grande que permite la aplicación tiene 912 conexiones, y abierta ya las dibuja
todas: no hay un motivo de rendimiento para la banda.

## Qué cambia

- Entre capas resumidas se dibujan las conexiones, de cuadrito a cuadrito, con
  el mismo aspecto que entre capas abiertas: color y trazo por signo, grosor
  por peso, filtro de conexiones, atenuado al elegir o posar el cursor.
- La banda uniforme desaparece.
- Esas líneas se comportan como las demás: se eligen con un clic, tienen
  vista previa, llevan el flujo y la animación del paso.
- El grosor se limita a la mitad del lado de un cuadrito.

## Capacidades

### Modificadas

- `inspector-de-red`: "Capas resumidas" (conexiones a la vista) y "Paso
  animado" (el escenario de la capa resumida deja de hablar de la banda).

## Impacto

- Código: `src/render/network-inspector.js` (dibujo, elegir, vista previa,
  flujo), `src/render/link-look.js` si hace falta el tope de grosor, pruebas.
- Vale para Inspeccionar y el Laboratorio, que comparten el inspector.
- **Orden**: se implementa después de `operacion-por-operacion` (tocan el
  mismo archivo) y se archiva después de él: modifica "Paso animado" a partir
  de su versión.
