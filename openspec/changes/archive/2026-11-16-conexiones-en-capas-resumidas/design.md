# Diseño

## Decisiones

### D1 · Líneas en lugar de la banda

Entre dos capas, con una o las dos resumidas, se dibuja cada conexión con
`linkLook`, igual que entre capas abiertas: mismo rol (relacionada, sin
relación, filtrada, normal), mismo color y trazo, mismas marcas de apagada,
peso cero y cambiada a mano. `drawBand` se quita.

Los extremos van al borde del cuadrito que mira a la otra capa (al borde de
la neurona si esa capa está abierta), no a su centro: así la línea no tapa el
relleno del cuadrito, que es su actividad.

Alternativa descartada: dejar la banda de fondo y las líneas encima. La banda
dice "todo conectado con todo", que las líneas ya muestran, y baja el
contraste de las líneas finas.

### D2 · Grosor

El grosor sale de la regla de siempre (`vista-de-la-red` D2: 1,5 más un rango
por peso, que se achica con la cantidad de conexiones entre las dos capas),
con un tope más cuando una punta es un cuadrito: no más que la mitad de su
lado en pantalla. El lado máximo es 14 px: el tope es 7 px, y baja con capas
más altas (con 21 cuadritos en poco alto, el lado puede ser de 8 px y el tope
de 4). El piso baja a 1 px solo si el tope queda por debajo de 1,5.

### D3 · Se comportan como las demás

- Clic sobre una línea: la elige (misma regla de la línea más cercana; con
  una neurona elegida, primero las suyas). Hoy el código sale sin hacer nada
  si alguna de las dos capas está resumida.
- Posar el cursor sobre un cuadrito o una línea: vista previa.
- Flujo: corre por esas líneas.
- Pastilla con el número: como entre capas abiertas, si entra sin tapar
  cuadritos; si no entra, el número está en el panel.
- Paso a paso: las marcas viajan por las líneas hasta el cuadrito. De a
  operaciones (`operacion-por-operacion` D5), la conexión en curso se destaca
  como línea.

### D4 · Fluidez

La red más grande (21, 16, 16, 16, 4) tiene 912 conexiones. Abierta se midió
en `vista-de-la-red` con 5,6 ms de mediana entre cuadros. Resumida dibuja las
mismas líneas, más cortas en alto: no se espera diferencia, pero **se mide**
con todo resumido, "Todas" y el flujo encendido.

## Riesgos

- Con cuadritos de 8 px, 21 líneas llegan a una columna de 168 px de alto:
  entre capas densas se van a encimar cerca de los cuadritos. Es lo mismo que
  pasa abierto con radios chicos; el filtro de conexiones es la salida. **Si
  con "Todas" y la red del usuario (21, 11, 11, 4) el resultado es una mancha
  sin capas ni conexiones fuertes reconocibles, parar y consultar** con
  capturas y una alternativa (por ejemplo, bajar la opacidad base entre capas
  resumidas).
