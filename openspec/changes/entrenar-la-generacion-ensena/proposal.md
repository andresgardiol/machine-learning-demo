# Proposal

## Why

La crítica de Entrenar (`borradores/sistema-de-diseno/critica-entrenar.md`) observó que el momento que enseña, el fin de una generación, es hoy una línea de texto y un punto nuevo en la curva. La generación siguiente arranca enseguida. Ahí pasan la selección y la mutación, que son *cómo aprende* la población, y no se ven: se puede mirar la pestaña un buen rato sin entender que "aprender" es copiar a los mejores y cambiarles un poco los números. Además, cambiar un ajuste rige una generación después, y la curva no muestra cuándo se cambió nada, así que causa y efecto quedan separados.

Es el cambio 2 de los cuatro que eligió la crítica, después de `entrenar-red-primero` y `entrenar-mesa-de-trabajo`.

**Concepto que hace visible.** Que una red aprende por neuroevolución así: los mejores pasan tal cual (élite), los demás son hijos de los mejores (selección) con pesos cambiados al azar (mutación). Y que cada ajuste que se cambia deja su marca en la curva.

## What Changes

- **Corte de generación:** con la guía activa y a 1× o 2×, al terminar una generación la simulación espera unos 2 s antes de arrancar la siguiente.
  - La escena muestra la generación nueva en la largada, con la élite resaltada y los demás atenuados.
  - A 4× o más, o con la guía apagada, no hay corte.
  - Pausar lo deja a la vista y Siguiente lo termina.
  - No cambia el entrenamiento: es solo tiempo de reloj.
- **Tarjeta de generación** al lado de la escena, con los números reales: cuántos pasan tal cual, de qué parte de la población salen los padres y con qué fuerza mutan. Con la selección manual, que la población es hija del padre elegido.
- **La mutación en la red:** durante el corte, la tarjeta de la red muestra un hijo con los pesos y sesgos que cambió la mutación marcados, y cuántos de cuántos.
- **Marcas en la curva:** cada generación en la que empezó a regir un cambio de la persona lleva una marca. Al señalarla se lee "Fuerza de mutación: 29 % → 40 %".
- **En el núcleo (`neuroevolucion`)**, para que lo anterior muestre el cálculo real:
  - una muestra de la mutación: el primer hijo no élite y su red antes de mutar;
  - los cambios de la persona que rigen en cada generación, en el historial.

  Ninguno de los dos consume azar ni cambia redes.
- **Capturas del antes y del después.**

Fuera de alcance:
- el promedio móvil en la curva, que la crítica sugería: es una cifra nueva que hay que explicar, y queda en *Ideas para más adelante*;
- misiones nuevas que cuenten experimentos;
- el trazo fantasma de la mutación al mover el deslizador (`entrenar-mutacion-a-la-vista`);
- mostrar a los padres no élite en la escena: la escena muestra la generación nueva, y de esa solo se sabe con certeza quién es copia de la élite;
- cambiar Competir, Inspeccionar o el Laboratorio.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* La selección, la élite y la mutación, con los números del entrenamiento real.
2. *¿Se entiende sin que nadie lo explique?* La tarjeta lo dice en una frase con los números, la escena resalta a los que pasan tal cual y la red marca los pesos que cambiaron.
3. *¿El mentor puede ignorarla u ocultarla?* Sí: con la guía apagada, o a 4× o más, no hay corte. Las marcas de la curva no estorban.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* No hay nada que usar mal: el corte termina solo o con Siguiente, y no cambia el entrenamiento. Reiniciar borra las marcas con la curva.

**Público.** Al principiante le muestra el mecanismo en el momento en que ocurre. Al mentor le da una pausa natural para explicar cada generación, y la puede saltear con la velocidad.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `neuroevolucion`: se agregan la muestra de la mutación y los cambios que rigen en cada generación, en el historial.
- `pestana-entrenar`: se agregan el corte de generación, la tarjeta de generación, la mutación en la red y las marcas en la curva.

## Impact

- `src/core/evolution.js` (`nextGeneration`, `childrenOf`): devolver la red de antes de mutar del primer hijo no élite, sin consumir azar.
- `src/core/training.js`: guardar la muestra al cerrar la generación y registrar los cambios aplicados (`changedKeys`), sin contar el enfriamiento.
- `src/tabs/train/index.js`: el corte en el bucle, la tarjeta, el resaltado de la élite en la escena y la red de la muestra.
- `src/render/network-view.js` o la marca de lo cambiado de `network-inspector.js`: los pesos marcados en la red del líder.
- `src/ui/chart.js`: las marcas y la línea de valores con los cambios.
- `src/i18n/es.js` y `en.js`: la tarjeta, el renglón de la red y los nombres de los ajustes en la curva.
- Pruebas del núcleo (muestra, cambios y determinismo) y del modelo de la curva.
- Rendimiento: el corte no dibuja de más (la escena queda quieta). La red de la muestra se dibuja una vez por corte.
