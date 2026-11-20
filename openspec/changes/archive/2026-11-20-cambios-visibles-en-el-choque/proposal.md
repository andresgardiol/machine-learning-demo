## Why

Con el caso del choque abierto en la pestaña 5, mover el deslizador de un peso o de un sesgo no cambia nada de lo que se ve. La red y la tarjeta de la neurona siguen mostrando la cuenta con la red de antes del cambio, y el aviso de que el cambio rige al reintentar queda lejos, en la tarjeta del choque. Hasta el dueño lo tomó por un error.

El concepto de ML que hace visible es la **sensibilidad de la decisión a un parámetro**: cambiás un peso y ves al instante si, en ese mismo cuadro, la red habría decidido otra cosa. Es lo mismo que pasa fuera del caso del choque.

## What Changes

- Con el caso del choque a la vista, la red, la tarjeta de la neurona elegida y la decisión debajo de la escena calculan el cuadro que muestra el deslizador con la red **de ahora**, con los cambios de prueba aplicados. La escena y lo que ven los sensores siguen siendo los de ese cuadro.
- La tarjeta del choque sigue diciendo lo que la red decidió de verdad en ese cuadro y qué neurona aportó más. Si hay cambios, agrega una línea con lo que decidiría ahora: "Con tus cambios, en este cuadro decidiría: Izquierda", o "…decidiría lo mismo".
- El aviso "Se ve la red de antes de tus cambios: rigen al reintentar" se quita, porque ya no es cierto.
- "Reintentar desde acá", "Reiniciar" y "Elegir esta neurona" no cambian.
- **BREAKING (de especificación)**: el escenario "Red cambiada después del choque" pasa a pedir lo contrario.

Filtro de entrada:
1. **¿Qué concepto hace visible?** La sensibilidad de la decisión a un peso o a un sesgo, en el cuadro exacto del choque.
2. **¿Funciona sin configurar nada?** Sí. Sin cambios de prueba se ve igual que hoy.
3. **¿Se puede volver atrás?** Sí, con "Deshacer", "Restablecer red" o "Ver original", que ya existen.
4. **¿Estorba a alguien?** No. Quita un aviso y agrega una sola línea, que aparece solo cuando hay cambios.

**Público:** a los dos. El principiante ve que su cambio hace algo. El mentor puede mostrar "si este peso fuera otro, no chocaba" sin reintentar.

**Fuera de alcance:**
- Volver a simular el intento con la red cambiada: para eso está "Reintentar desde acá".
- Cambiar "Atrás" o la reproducción normal, que ya usan la red de ahora.
- Laboratorio.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `pestana-inspeccionar`: cambia "Repetición del choque en Inspeccionar", porque la red de lo que se ve pasa a ser la de ahora, y se agrega el requisito "Decisión con tus cambios en el caso".

Entender, en la V2, implementa lo mismo.

## Impact

- `src/tabs/inspect/index.js` y `src/v2/stages/entender/index.js`:
  - `traceNow()` deja de usar `changesOf(caseFrame().epoch)` con el caso abierto;
  - la tarjeta del choque calcula la decisión "de verdad" con la red de la época del cuadro y la de ahora con `changes`;
  - se quita `inspect.case.changed`.
- `src/i18n/es.js` y `src/i18n/en.js`: una clave nueva para la línea "con tus cambios…", y se borra la del aviso.
- Pruebas de Inspeccionar y de Entender que cubren el caso del choque.
- El núcleo no cambia.
