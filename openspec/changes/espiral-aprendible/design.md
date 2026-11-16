## Context

`cleanPoint` de `src/core/datasets.js` arma la espiral con `a = 1,75 × t × 2π`
para cada brazo. El aprendizaje es descenso por gradiente ejemplo por
ejemplo, sin impulso, con pesos iniciales al azar entre −1 y 1; eso es lo que
el Laboratorio muestra paso a paso y no se toca.

## Goals / Non-Goals

- Que la espiral se aprenda con una red razonable y la tasa por defecto, en
  segundos, sin dejar de ser la forma que la red por defecto no puede.
- No cambiar la cuenta del aprendizaje, la tasa por defecto ni la red por
  defecto.

## Decisions

### D1. Una vuelta y cuarto

Medido el 16 de noviembre de 2026 con el núcleo, cinco semillas de pesos,
200 puntos, ruido 10 %, tanh, épocas hasta 90 % en práctica y en apartados:

| Vueltas | Una capa de 4, tasa 0,1 | Dos de 8, tasa 0,03 | Dos de 8, tasa 0,1 |
|---|---|---|---|
| 1 | 5 de 5 (49 a 92) | 5 de 5 (20 a 47) | 5 de 5 (7 a 27) |
| 1,25 | ninguna | 5 de 5 (75 a 115) | 5 de 5 (43 a 90) |
| 1,5 | ninguna | 4 de 5 (180 a 388) | 3 de 5 |
| 1,75 (hoy) | ninguna | 4 de 5 en 1000 épocas | ninguna |

Con 1,25 vueltas además: dos capas de 7, 5 de 5 (46 a 98); con 500 puntos,
5 de 5 (18 a 31); con 100 puntos, 5 de 5 (71 a 171).

- Con una vuelta deja de ser la difícil: la aprende la red por defecto.
- Con 1,5 no es confiable.
- **Se elige 1,25.**

**[Sin medir con el generador real]** Las filas de 1, 1,25 y 1,5 las medí
con una copia del generador, que usa otra secuencia para el ruido. La tarea
1.2 las repite con `pointsDataset`.

### D2. Lo que sigue sin andar, a propósito de qué

Medido con 1,25 vueltas y tasa 0,1:

- Tres capas de 8 con tanh: 2 de 5.
- ReLU: dos de 7, 2 de 5; dos de 8, 1 de 5.
- Sigmoide: 1 de 5 como mucho.
- Ruido 20 %: 2 de 5 con dos de 8.

No se arregla acá. El tooltip promete lo que está medido: dos capas con
tanh. Queda anotado en PENDIENTES.md.

### D3. Lo que no se hace

- **Otro arranque de los pesos.** Medido con 1,75 vueltas: con pesos a la
  mitad o escalados por el tamaño de la capa, peor o igual.
- **Impulso u otro optimizador.** Cambia la cuenta que el Laboratorio
  enseña paso a paso (corrección = −tasa × culpa × entrada).
- **Cambiar la tasa por defecto al elegir la espiral.** Un ajuste que se
  mueve solo confunde, y con 1,25 vueltas no hace falta.

## Risks / Trade-offs

- **Los puntos de la espiral cambian.** → No hay nada guardado que dependa
  de ellos; las pruebas que fijan valores se actualizan.
- **La medición con el generador real puede dar distinto.** → Tarea 1.2; si
  dos capas de 8 no llegan en las cinco semillas, se consulta.
