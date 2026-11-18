# Proposal

## Why

La crítica de Reglas a mano (`borradores/sistema-de-diseno/critica-reglas-a-mano.md`) midió que el ciclo de la pestaña (escribir una regla, mirar el auto, ver el choque, corregir) atraviesa toda la pantalla: la escena está en x 0–400, el editor en 481–1040 y las misiones en 1060–1440. Lo que percibe el auto se muestra debajo del editor, lejos del auto que lo genera. La cantidad de sensores, que es la variable del concepto ("con más sensores, más reglas"), es un deslizador más de la barra de escenario. Y para escribir `sensor3 > 0,49` hay que leer la barra y copiar el número a mano. `sistema-de-diseno-base` ya dejó las piezas (alturas, acción terciaria, estados y rótulos de rol). Este es el cambio 1 de los tres acordados para Reglas a mano.

**Concepto que hace visible.** Que una regla escrita a mano es un número elegido mirando lo que percibe el auto, y que cada sensor que se agrega es vocabulario nuevo que hay que cubrir con reglas. El programa queda al lado de lo que el auto ve.

## What Changes

- **Dos zonas en lugar de cuatro, solo en Reglas a mano** (decisión del dueño, 18 de noviembre de 2026):
  - **El escenario (la zona del auto):** la escena, debajo una barra de marcha (Pausar, Reiniciar, Tráfico nuevo, Reintentar solo y los interruptores de vista), las cifras del intento y lo que percibe y acciona el auto.
  - **El tablero (la zona del programa):** ocupa también el lugar del panel, que en esta pestaña no existe. Lleva la tarjeta de consigna (sin la marcha), el texto de guía, la tarjeta del programa y las misiones.
- **El grupo de sensores pasa a la cabecera del programa** (decisión del dueño): cantidad, alcance y apertura salen de la barra de escenario en Reglas a mano y quedan arriba del editor, junto a "Reglas: N", los ejemplos, Restablecer, Exportar e Importar. En Entrenar siguen en la barra. El "Restablecer" de la barra ya no toca los sensores de Reglas a mano; los devuelve el "Restablecer" del programa, como ya lo hacía.
- **Un clic en una barra de sensor escribe la comparación**, por ejemplo `sensor3 > 0,49`, con el valor de ese instante y en el cursor del editor. Lo mismo con la barra de `velocidad`. También con el teclado. Con más de 12 sensores, las barras ya se muestran sin nombre ni valor y no son controles; ahí la paleta ofrece la palabra `sensor`.
- **La paleta queda sin sensores ni `velocidad`** (decisión del dueño): las palabras de regla, las cuatro órdenes y las constantes.
- **Capturas del antes y del después** con el guion de `sistema-de-diseno-base`.

Fuera de alcance:
- el choque que se congela y la tarjeta del caso (`reglas-el-choque-ensena`), incluido si Reintentar solo viene apagado;
- el editor de fichas (`reglas-como-fichas`);
- llevar la disposición de dos zonas a otras pestañas (queda para el lavado de cara de `PENDIENTES.md`);
- la acción principal: sigue siendo la marcha;
- que el programa recordado no recuerde los sensores y que los ejemplos solo valgan a 20 m/s (*Prioridad 2*);
- cambiar textos, salvo las ayudas de las barras que se vuelven controles.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* Que las reglas se escriben mirando lo que percibe el auto, y que cada sensor más es una palabra más para cubrir con reglas.
2. *¿Se entiende sin que nadie lo explique?* La barra de un sensor se puede tocar y escribe su comparación en el editor de al lado: se aprende tocándola. La ayuda de la barra lo dice.
3. *¿El mentor puede ignorarla u ocultarla?* No agrega nada que ocultar. La guía sigue ocultando la paleta y el texto largo; las barras siguen funcionando con la guía apagada, porque son una forma de escribir y no una ayuda.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* Insertar una comparación de más se deshace con Ctrl+Z, como cualquier texto, y el auto sigue con el último programa válido mientras haya un error. Restablecer el programa vuelve al programa y a los sensores iniciales.

**Público.** Sirve sobre todo al principiante, que tiene el auto y el programa a la vista juntos y escribe números sin copiarlos. Al mentor le sirve para explicar "mirá la barra, tocala, ahí está tu regla". No pierde ningún control.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `estructura-app`: Reglas a mano deja de tener tres zonas: escenario y tablero, sin panel.
- `consigna-de-pestana`: en Reglas a mano, la tarjeta va al principio del tablero y la marcha queda en la barra de abajo de la escena.
- `barra-escenario`: en Reglas a mano no se muestra el grupo de sensores, y su "Restablecer" no los toca.
- `pestana-reglas`: dónde va cada cosa, el grupo de sensores en la cabecera del programa, la paleta sin sensores y la inserción desde las barras.
- `jerarquia-visual`: dos barras densas nuevas (las filas de percepción y el renglón de interruptores de la marcha de Reglas a mano) y la marca de que una fila se puede tocar para insertarla.

## Impact

- `src/ui/layout.js`: una variante sin panel para las cuentas de anchos (`fitZones` y los límites), con sus pruebas.
- `src/tabs/rules/index.js`: mover la marcha, las cifras, la percepción y los interruptores de vista a la zona del auto; la consigna, la cabecera del programa y las misiones al tablero.
- La barra de escenario: mostrar el grupo de sensores en la cabecera del programa de Reglas a mano, con el mismo estado y los mismos controles.
- `src/tabs/shared/driving-cards.js` (percepción): barras que son botones cuando hay 12 sensores o menos.
- La paleta del editor (`src/ui/editor.js` o donde se arma): sin sensores ni `velocidad`, y la palabra `sensor` con más de 12.
- `src/i18n/es.js` y `en.js`: las ayudas de las barras.
- Pruebas nuevas: la inserción (formato del número por idioma, espacios y cursor) como función pura, y los anchos sin panel.
- Sin dependencias nuevas, sin cambios en el núcleo, en el lenguaje de reglas ni en los datos guardados.
- `borradores/reglas-mesa-de-trabajo/`: `antes/`, `despues/` y la comparación.
