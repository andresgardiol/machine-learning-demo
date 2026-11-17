## Why

En el Laboratorio la espiral casi no se puede aprender. El dueño lo vio el 16
de noviembre de 2026: dos capas de 7, tasa 0,10, 123 épocas y el error
clavado en 0,67 con 61 % de aciertos.

Medido ese día con el núcleo (200 puntos, ruido 10 %, 30 % apartados, cinco
semillas de pesos, hasta 1500 épocas, 90 % de aciertos en práctica y en
apartados):

| Red (tanh) | Tasa 0,03 | Tasa 0,1 (por defecto) |
|---|---|---|
| 7 + 7 | 3 de 5 semillas, 549 a 703 épocas | ninguna |
| 8 + 8 | 5 de 5, 622 a 1055 épocas | ninguna |
| 8 + 8 + 8 | 1 de 5 | ninguna |

Con ReLU, 1 de 5 como mucho. Solo una combinación exacta la aprende, y tarda
de uno a dos minutos a 10 épocas por segundo. Ya estaba anotado en
PENDIENTES.md; el tooltip lo avisa, pero la forma se ofrece como una más.

La causa es la forma, no la cuenta: cada brazo da 1,75 vueltas. Probé otro
arranque de los pesos (más chicos, y según el tamaño de la capa) y no mejora.

## What Changes

- La espiral pasa de 1,75 a 1,25 vueltas por brazo. Sigue siendo la forma
  difícil: la red por defecto (una capa de 4) no la aprende; dos capas de 7
  u 8 con tanh y la tasa por defecto, sí, en menos de 100 épocas.
- El tooltip de la espiral dice lo que pide ahora: dos capas ocultas.
- La miniatura de la forma y las pruebas siguen a la forma nueva.
- No cambia la cuenta del aprendizaje, ni la tasa ni la red por defecto.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `datos-de-ejemplo`: la espiral tiene 1,25 vueltas por brazo.
- `pestana-laboratorio`: la espiral se aprende con dos capas y los valores
  por defecto de lo demás, y no con la red por defecto.

## Impact

- `src/core/datasets.js` (la forma), su miniatura en la barra del
  Laboratorio, `src/i18n/es.js` y `en.js` (tooltip), `tools/measure-lab.mjs`
  (medición) y las pruebas de `tests/datasets.test.js` y
  `tests/lab-defaults.test.js`.
- Los puntos de la espiral cambian para todos: no hay datos guardados que
  dependan de ellos.
- PENDIENTES.md: sale la nota de la espiral.
