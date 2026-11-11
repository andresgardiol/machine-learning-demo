# Proposal

## Why

En la pestaña Entrenar siempre elige la función de fitness: al terminar cada
generación, los padres de la siguiente son el 10 % de mayor fitness. Con esa
regla la población tarda en aprender a manejar y tiende a quedarse siguiendo
al tráfico (ver PENDIENTES.md). En el tutorial que inspira el proyecto, y en
la versión anterior de esta app, elegía la persona: guardaba al mejor auto
recién cuando lo veía hacer algo prometedor, la generación siguiente salía de
ese auto, y podía deshacer la última elección. El dueño del proyecto lograba
así mejoras visibles en cinco o seis generaciones, con tráfico al azar.

Falta esa forma de elegir. Sirve de inmediato para entrenar mejores cerebros
a mano, y sirve como prueba: si eligiendo a mano los autos aprenden a pasar en
pocas generaciones, el problema es la fitness automática y no los sensores ni
las velocidades. Mejorar la fitness automática queda para un cambio posterior.

Concepto que hace visible: **la función de fitness es un juicio automatizado.
Cuando la persona elige al padre de la generación siguiente, ve qué estaba
premiando la máquina, qué premiaría ella, y que decidir qué premiar es el
problema de fondo.**

## What Changes

- **Quién elige al padre: la fitness o vos.** Un ajuste nuevo, a la vista
  junto a la población y la mutación, con la selección automática por
  defecto (el comportamiento actual no cambia).
- **Elegir al líder.** Con selección manual aparece un botón, con el atajo E,
  que toma al líder de ese momento como padre. Funciona en cualquier momento
  de la generación, también en pausa.
- **La generación siguiente sale del padre elegido:** una copia exacta más
  hijos mutados con la fuerza de mutación vigente. Si en una generación no se
  elige a nadie, sigue el mismo padre.
- **Sin padre elegido, cada generación es una población al azar nueva**, que
  nunca se repite.
- **Deshacer**, con el atajo Z: vuelve al padre anterior y, si no había, a
  ninguno. Se recuerdan las últimas 20 elecciones.
- **La generación termina con las reglas de siempre** (todos fuera de
  carrera, tiempo, nadie avanza o a pedido); la selección manual solo cambia
  de quién sale la siguiente.
- **Estado a la vista:** una línea dice quién es el padre elegido y qué va a
  pasar al terminar la generación.
- **Cambiar de modo no pierde lo aprendido:** al pasar de automática a manual,
  el padre inicial es el campeón de la generación que termina.
- **Selección, élite y cruce se deshabilitan** con selección manual, con una
  explicación: hay un solo padre.
- **Guardar y autoguardado** usan al padre elegido cuando la selección es
  manual. Un cerebro registra con qué modo de selección se entrenó.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Quién elige al padre | La selección es una decisión, y puede tomarla una regla o una persona | Dos opciones con nombre llano y tooltip; por defecto todo sigue como hoy | Es un ajuste más; en automática no aparece nada nuevo | Elegir manual sin querer: se vuelve a automática con el mismo ajuste o con restablecer |
| Elegir al líder | Qué auto merece ser padre, y por qué | El botón aparece solo en manual; la línea de estado cambia al instante | Solo existe en manual | Elegir mal: deshacer vuelve al padre anterior |
| Deshacer | Una mala elección empeora la generación siguiente | Botón junto al de elegir, deshabilitado y explicado cuando no hay nada que deshacer | Solo existe en manual | Deshacer de más: se vuelve a elegir; sin padre, la línea de estado avisa que la próxima generación será al azar |
| Sin padre, población al azar | Sin selección no hay herencia: cada generación empieza de cero | La línea de estado lo dice antes de que pase | No aplica | Se elige un padre |
| Estado del padre elegido | De dónde va a salir la generación siguiente | Una oración junto a los botones | Solo existe en manual | No tiene estado propio |
| Ajustes que no aplican en manual | Selección, élite y cruce son reglas para elegir entre muchos padres | Se ven deshabilitados y su tooltip dice por qué | Están en la sección avanzada | Vuelven a valer al pasar a automática |

### A quién sirve

- **Mentor:** puede entrenar a mano los cerebros de una demostración y
  mostrar en vivo la diferencia entre lo que premia la fitness y lo que
  elegiría una persona.
- **Principiante:** al abrir la pestaña no cambia nada; la selección manual
  es una opción con nombre claro. Si la prueba, la línea de estado le dice en
  todo momento qué eligió y qué va a pasar.

### Fuera de alcance

- Mejorar la función de fitness automática o agregar funciones nuevas: es el
  cambio siguiente.
- Elegir cualquier auto con un clic: solo se puede elegir al líder.
- Elegir varios padres o cruzarlos a mano.
- Pausar sola al terminar una generación para esperar la elección.
- Marcar en la curva de fitness las generaciones donde cambió el padre.
- Una misión nueva sobre la selección manual.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `neuroevolucion`: se agrega el modo de selección manual (padre elegido,
  generación siguiente desde el padre, población al azar sin padre, deshacer,
  padre al cambiar de modo y cerebro del entrenamiento); la selección de los
  padres y la élite pasan a valer para la selección automática; los cambios
  de configuración y la reproducibilidad incluyen el modo y las elecciones.
- `pestana-entrenar`: se agregan el ajuste de quién elige, los botones de
  elegir al líder y deshacer, la línea de estado y los ajustes que no aplican;
  cambian la configuración básica, los controles de marcha, guardar el
  campeón y el panel a la vista.
- `cerebros`: los datos de entrenamiento registran el modo de selección y el
  autoguardado usa al padre elegido.

## Impact

- **Núcleo:** `src/core/training.js` (modo, padre elegido, historial de
  elecciones, cría manual, cerebro del entrenamiento) y
  `src/core/evolution.js` (hijos de un solo padre). Sin DOM, deterministas.
- **Pestaña:** `src/tabs/train/index.js`, `settings.js`, `session.js` y
  `shortcuts.js`.
- **Biblioteca:** `src/ui/library-view.js` muestra el modo de selección en el
  detalle de un cerebro. El formato de los cerebros sigue en la versión 1: el
  dato nuevo es opcional y los cerebros existentes siguen valiendo.
- **Textos:** `src/i18n/es.js` y `en.js`.
- **Dependencias y build:** ninguna nueva.
- **Pruebas:** nuevas para el núcleo y la lógica sin DOM de la pestaña. De
  las existentes cambian solo las tres aserciones que enumeran la
  configuración o los ajustes completos, para sumar la clave nueva; el
  comportamiento por defecto es el actual y ninguna otra prueba cambia.
- **Rendimiento:** la cría manual es más barata que la automática (no ordena
  ni cruza); no toca el bucle de simulación ni el de dibujo.
