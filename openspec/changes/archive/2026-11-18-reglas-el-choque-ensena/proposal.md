# Proposal

## Why

En Reglas a mano el choque es el momento que enseña: cada choque es un caso que ninguna regla cubría. Hoy pasa sin que se note:

- con "Reintentar solo" encendido, que es lo que viene por defecto, el aviso dura un segundo y medio y el auto vuelve a salir;
- con el reintento apagado, el aviso dice "Corregí el programa", pero no qué leían los sensores ni qué reglas se cumplían;
- los tres programas de ejemplo (3, 7 y 20 sensores), que muestran que más sensores piden más reglas y no por eso andan mejor, están en la cabecera del programa sin que nada lleve a probarlos;
- cargar un ejemplo reemplaza el programa propio, con una confirmación, así que comparar cuesta.

Este es el cambio 2 de los tres acordados para Reglas a mano. Se apoya en las dos zonas de `reglas-mesa-de-trabajo` (archivado): la columna de lo que percibe el auto, al costado de la escena, ya muestra los valores del choque, y el editor está al lado.

**Concepto que hace visible.** Que una regla escrita a mano cubre solo los casos que su autor imaginó: cada choque es un caso nuevo. Y que agregar sensores y reglas no alcanza: los ejemplos de 7 y de 20 sensores, comparados en el mismo tráfico, chocan igual, y el de 20 tiene el doble de reglas.

## What Changes

Decisiones del dueño (18 de noviembre de 2026):

- **El caso del choque.** Al chocar:
  - la columna de percepción queda congelada en los valores del choque;
  - el editor marca con el estado "choque" las líneas que se cumplían en ese instante, o dice "Ninguna regla se cumplía";
  - una tarjeta en la zona del escenario, en el lugar de la marcha, dice a los cuántos metros chocó, contra qué y qué reglas se cumplían.
- **"Reintentar solo" sigue encendido por defecto, pero el caso se ve más tiempo.** El auto vuelve a salir a los 5 segundos, con una cuenta regresiva a la vista, y tocar cualquier control del caso detiene la cuenta.
- **La acción principal del choque lleva a los ejemplos.** "Compará con los ejemplos" abre, en la tarjeta del programa, una comparación en el mismo tráfico: tu programa y los tres ejemplos, cada uno con sus sensores, sus reglas, la distancia, los vehículos superados y si chocó. Cada fila se puede probar con un toque.
- **Tu programa se conserva.** Probar un ejemplo ya no pide confirmación: lo que escribiste queda guardado como "Tu programa" y se recupera con un toque, con sus sensores.
- **Repetición de 3 segundos.** Un deslizador sobre la escena vuelve a mostrar los últimos 3 segundos antes del choque, con lo que percibía el auto y las líneas que se cumplían en cada instante. Son los datos que realmente se calcularon, guardados mientras el auto andaba.
- **Cuaderno de casos.** Una franja en la zona del escenario cuenta los choques y las reglas: "7 casos · 5 reglas · mejor 310 m", con un punto por choque sobre la distancia.
- **Acciones secundarias del choque:** "Escribir una regla para este caso", que agrega al final del programa una condición con los valores del choque (`si sensor1 > 0,80 y sensor2 > 0,80 entonces `) y deja que la persona elija la acción, y Reiniciar.
- **Capturas del antes y del después**, con el guion de `reglas-mesa-de-trabajo`.

Fuera de alcance:
- las misiones (siguen contando vehículos superados, no casos);
- el editor de fichas (`reglas-como-fichas`);
- El problema, que conserva su aviso de choque de hoy;
- que los ejemplos solo valgan a 20 m/s (*Prioridad 2*): la comparación lo hereda y lo avisa;
- guardar el cuaderno de casos entre visitas.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* Que cada choque es un caso que las reglas no cubrían, y que sumar sensores y reglas no hace a un programa a mano capaz de manejar siempre.
2. *¿Se entiende sin que nadie lo explique?* El choque se queda a la vista con sus datos, y la acción principal lleva a comparar. Los números de la comparación cuentan la historia sin texto: más sensores, más reglas y choques igual.
3. *¿El mentor puede ignorarla u ocultarla?* El reintento sigue siendo automático. La cuenta regresiva no exige tocar nada, y la comparación y el cuaderno no aparecen si nadie los pide (el cuaderno se oculta con la guía).
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* Probar un ejemplo no pierde el programa propio ("Tu programa" lo recupera con sus sensores). La regla agregada se deshace con Ctrl+Z. Reiniciar vuelve a salir como siempre.

**Público.** El principiante sale del choque con un camino ("probá cómo maneja un ejemplo") en lugar de un mensaje. El mentor tiene en la comparación la tabla que antes armaba de palabra: 7 sensores contra 20, en el mismo tráfico.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `pestana-reglas`:
  - el caso del choque, la repetición, la comparación con los ejemplos, "Tu programa", el cuaderno de casos y la regla para el caso;
  - el reintento automático de 5 segundos con cuenta regresiva;
  - los ejemplos sin confirmación.
- `jerarquia-visual`: en Reglas a mano, con un choque a la vista, la acción principal es "Compará con los ejemplos", y no Reiniciar.

## Impact

- `src/tabs/rules/`:
  - la tarjeta del caso y la cuenta regresiva;
  - la grabación de los últimos 3 segundos (un búfer circular de cuadros con la posición, las lecturas y las líneas que se cumplían);
  - el cuaderno;
  - la comparación;
  - el espacio de "Tu programa".
- Una función sin DOM que corre un programa en una simulación sin navegador, con la misma semilla, la misma pista y los mismos ajustes, y devuelve sus cifras. El lenguaje ya se puede correr así (`reglas`, "Lenguaje sin navegador"). Corre por tramos, para no trabar la animación.
- `src/ui/main-action.js`: la acción principal del choque en Reglas a mano.
- `src/i18n/es.js` y `en.js`: los textos y las ayudas nuevas.
- Pruebas: la comparación es determinista (misma semilla, mismas cifras), la condición de la regla para el caso, el búfer circular y "Tu programa".
- Sin dependencias nuevas, sin cambios en el núcleo de la simulación ni en el lenguaje. La preferencia de "Reintentar solo" sigue igual.
- `borradores/reglas-el-choque-ensena/`: el antes, el después y la comparación.
