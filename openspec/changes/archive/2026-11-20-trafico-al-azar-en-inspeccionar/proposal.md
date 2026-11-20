## Why

En la pestaña 5 (Inspeccionar en la V1, Entender en la V2) el tráfico de la calle recta es siempre el mismo, porque las dos usan una semilla fija (`SEED = 1`). Al reiniciar, el cerebro enfrenta exactamente la misma situación, y la persona termina viendo un recorrido memorizado en vez de cómo decide la red ante casos nuevos. Hace visible un concepto de ML: **generalización**. Una red se entiende mirándola decidir en situaciones que no vio, no repitiendo siempre la misma.

## What Changes

- Por defecto, el tráfico de la calle recta en la pestaña 5 es **al azar**. Se elige una semilla nueva al abrir la pestaña, al cambiar de cerebro o de ajustes y al reiniciar (R o el botón "Reiniciar").
- Nueva opción **"Tráfico"** en el panel de la pestaña, con dos valores:
  - "Nuevo", el valor por defecto;
  - "Repetir", que conserva el tráfico que se está viendo para que reiniciar lo repita, cuando se quiere probar algo en particular.
- Estas acciones siempre conservan el tráfico, sea cual sea la opción, porque son repeticiones del mismo intento: "Atrás", seguir desde un cuadro anterior, "Reintentar desde acá" y la repetición del choque.
- En los circuitos no hay tráfico, así que la opción se oculta.
- La opción no se guarda entre sesiones: cada vez que se abre la aplicación vuelve a "Nuevo".
- **BREAKING (de especificación)**: deja de valer que dos personas que abren la pestaña con el mismo cerebro y los mismos ajustes vean la misma escena. El reinicio del caso del choque ya no vuelve "con el mismo tráfico", salvo en "Repetir".

Filtro de entrada para la opción "Tráfico":
1. **¿Qué concepto hace visible?** La generalización: un tráfico nuevo en cada intento muestra si la red sabe manejar o solo recuerda un recorrido.
2. **¿Funciona sin configurar nada?** Sí. "Nuevo" es el valor por defecto y no hace falta tocar nada.
3. **¿Se puede volver atrás?** Sí. Elegir "Nuevo" otra vez vuelve al comportamiento por defecto, y reiniciar la aplicación también.
4. **¿Estorba a alguien?** No. Es un solo grupo de dos opciones en el panel, el mismo patrón que "Tráfico de la carrera" de Competir.

**Público:** sirve a los dos. Al principiante le muestra situaciones variadas sin que lo pida. Al mentor le da "Repetir" para preparar y mostrar un caso concreto. La opción es chica y está en el panel, así que no compite con la red, que sigue siendo lo central.

**Fuera de alcance:**
- Laboratorio: sigue con semilla fija.
- Competir, Conducir y Reglas no cambian.
- No se puede escribir un número de semilla a mano.
- No se puede compartir un tráfico entre personas.
- La opción no se guarda en las preferencias.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `pestana-inspeccionar`:
  - un requisito nuevo, "Tráfico nuevo o repetido";
  - "Lista para mirar al abrir" cambia, porque ya no hay misma escena para todos;
  - "Manejar vos" cambia en su estado por defecto;
  - "Caso del choque en Inspeccionar" cambia, porque reiniciar sigue la opción "Tráfico".

Entender, en la V2, implementa estos mismos requisitos, porque `interfaz-v2` la define como la versión V2 de Inspeccionar. `interfaz-v2` no cambia: su equivalencia con la V1 sigue valiendo con la misma semilla.

## Impact

- `src/tabs/inspect/index.js` y `src/v2/stages/entender/index.js`:
  - la semilla pasa a ser estado de la pestaña;
  - cambian `buildWorld` y `restart`;
  - se agrega la opción al panel.
- Un módulo puro nuevo de semillas para la pestaña, en `src/tabs/inspect/`, compartido con la V2. Usa `Math.random` solo fuera del núcleo, para elegir la semilla.
- `src/i18n/es.js` y `src/i18n/en.js`, más los de la V2 si corresponde: etiquetas y tooltips.
- Pruebas:
  - las que hoy dependen de `SEED = 1` en Inspeccionar y en Entender;
  - pruebas nuevas del módulo de semillas.
- El núcleo de simulación no cambia: con una semilla dada, el mundo sigue siendo determinista.
