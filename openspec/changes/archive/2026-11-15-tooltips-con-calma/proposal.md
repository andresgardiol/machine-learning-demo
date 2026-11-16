# Tooltips con calma

## Why

Los tooltips sirven al principio y después molestan: aparecen en cada control
a los 0,4 s de posar el cursor y tapan lo que se quiere tocar. Le pasó al
dueño en su demo original y le vuelve a pasar acá (anotado en `PENDIENTES.md`
el 13 de noviembre de 2026; el 14 pidió arreglarlo).

Leyendo `src/ui/tooltips.js` aparecen dos causas concretas, además de la
demora corta:

- Apretar un control no cancela su tooltip. Quien hace clic en "Paso" y deja
  el cursor ahí para seguir apretando, lo ve aparecer igual.
- Arrastrar un deslizador dura más de 0,4 s, así que el tooltip aparece
  mientras se arrastra.

**Concepto:** es infraestructura. Habilita el principio 6 de la constitución
(lo que guía al principiante se puede ocultar para no entorpecer al mentor)
sin romper el 5 (todo control tiene su tooltip).

## What Changes

- **Con la guía encendida,** los tooltips siguen apareciendo al posar el
  cursor, con más calma:
  - esperan 0,7 s en lugar de 0,4;
  - apretar un control cierra su tooltip o cancela el que estaba por
    aparecer, y no vuelve hasta que el cursor salga y vuelva a entrar;
  - mientras hay un botón del mouse apretado (arrastrando un deslizador o un
    divisor) no aparece ninguno.
- **Con la guía apagada,** los tooltips no aparecen al posar el cursor. El
  interruptor "Guía" pasa a gobernar también eso, además de los textos de
  guía y las misiones. Tres cosas siguen explicándose:
  - el propio interruptor "Guía", para que el camino de vuelta esté siempre
    a la vista;
  - un control sin acción, que sigue diciendo por qué no se puede usar;
  - cualquier control al que se llega con Tab, como hoy.
- **En los dos casos,** apretar un control sin acción muestra su tooltip en
  el momento: es la respuesta a "¿por qué no anda?".
- El tooltip del interruptor "Guía" dice lo que ahora gobierna.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Tooltips que no aparecen al apretar ni al arrastrar | Ninguno: quita un estorbo | No hay nada que entender: dejan de aparecer cuando no se los pidió | No hace falta | No tiene estado |
| La guía apagada los apaga | Ninguno: es el principio 6 | El tooltip de "Guía" lo dice, y aparece siempre | Es para el mentor: un clic | Encender "Guía" |
| Clic en un control sin acción | Ninguno: explica por qué algo no se puede | El clic que no hace nada ahora contesta | No hace falta | Se cierra al salir el cursor o con Escape |

### A quién sirve

- **Principiante:** nada cambia en lo que importa. Con la guía encendida, que
  es el valor por defecto, cada control se sigue explicando al posar el
  cursor; solo deja de taparle lo que está tocando.
- **Mentor y quien ya conoce la interfaz:** apaga "Guía" y trabaja sin
  tooltips. Para consultar uno, la enciende, o llega al control con Tab.

### Fuera de alcance

- Un interruptor propio para los tooltips, separado de "Guía". Se descartó
  para no sumar un tercer interruptor con un nombre difícil de distinguir de
  "Guía"; si el dueño lo prefiere, es la alternativa (ver `design.md`).
- Tooltips que se cansan solos según cuántas veces se vieron, y tooltips en
  dos tamaños.
- Una tecla o un modo "¿qué es esto?" para pedirlos con el mouse.
- Que los tooltips dejen de nombrar la tecla con los atajos apagados
  (anotado aparte en `PENDIENTES.md`).
- Cambiar el contenido o la ubicación de los tooltips.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `ayuda-contextual`: cuándo aparece y cuándo se cierra un tooltip.
- `estructura-app`: el interruptor de guía gobierna también los tooltips al
  posar el cursor.

## Impact

- **Código:** `src/ui/tooltips.js` (lógica de cuándo abrir, ya separada en
  funciones puras con pruebas en `tests/tooltips.test.js`) y `src/ui/app.js`
  (pasarle el estado de la guía). Textos del tooltip de "Guía" en
  `src/i18n/es.js` y `en.js`.
- **Las seis pestañas:** ningún cambio en su código. `mlLab.auditTooltips()`
  sigue comprobando que cada control tenga su ayuda.
- **Sin medir:** que 0,7 s sea la demora que deja de molestar. Es un número
  elegido; el dueño lo prueba y, si hace falta, se cambia una constante.
- **Dependencias y build:** ninguna nueva.
