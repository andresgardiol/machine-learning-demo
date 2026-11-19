# Guion de prueba de la V2 con una persona que llega sola (tarea 16.7)

Para el dueño. Plan de prueba de `ux-research` (design.md D2), sin entrevistas: cinco tareas que una persona hace sola en la V2 mientras el dueño mira y anota. La persona no conoce el laboratorio ni sabe de machine learning.

## Antes de empezar

- Abrir `http://localhost:8000/v2/` en un navegador a la vista, de 1366×768 o más, con la guía y las ayudas encendidas (como vienen).
- Borrar lo guardado del laboratorio antes de cada persona (el almacenamiento local del sitio), así empieza de cero.
- Decirle solo esto: "Es un laboratorio para entender cómo aprende una máquina a manejar. Pensá en voz alta. No hay respuestas incorrectas; si te trabás, contame qué buscabas."
- No explicar nada durante las tareas. Si pasan dos minutos sin avance, anotar dónde y pasar a la siguiente.

## Las cinco tareas

| # | Tarea (lo que se le dice) | Se cumple si… | Qué mirar |
|---|---|---|---|
| 1 | "Manejá el auto un rato sin chocar. Después contame qué crees que recibe una máquina que maneje." | Maneja con las flechas y menciona las distancias de los rayos (o los números de las barras) y la velocidad. | ¿Encuentra las teclas por la placa? ¿Mira la banda (barras y lámparas)? ¿Lee la misión? |
| 2 | "Hacé que el auto se maneje solo con reglas y que supere a tres vehículos." | Cambia o agrega una regla (en fichas o en texto) y el auto supera 3. | ¿Usa una fila de la percepción para insertar una comparación? Al chocar, ¿lee el caso y usa "Escribir una regla para este caso" o la repetición? |
| 3 | "Dejá que la computadora aprenda a manejar sola y guardá el mejor auto." | Llega a la generación 2 o más y guarda un cerebro (hoja Cerebros, o "Mostrame" de la misión). | ¿Entiende el corte "Así nace la generación N"? ¿Encuentra "Guardar campeón"? ¿Le sirve la definición de fitness? |
| 4 | "Averiguá si el auto que guardaste maneja bien en una pista que no vio." | En Evaluar, corre una carrera con su cerebro en otra pista y lee la tabla por pista ("no la vio"). | ¿Encuentra su cerebro en Competidores? ¿Cambia la pista en la hoja Escenario? ¿Lee "practicó" y "no la vio"? |
| 5 | "Mirá por dentro la red de tu auto y apagá una neurona para ver qué pasa." | En Entender elige su cerebro, elige una neurona, la apaga y nota el cambio en la decisión. | ¿Usa "Cambiar cerebro"? ¿La hoja Neurona explica la cuenta? ¿Encuentra Deshacer o "Ver original" para volver atrás? |

## Qué anotar en cada tarea

- Tiempo hasta cumplirla (o hasta abandonarla).
- Dónde dudó: el control que buscó y no encontró, y el que tocó por error.
- Qué dijo en voz alta del concepto (¿lo puede enunciar con sus palabras al terminar la etapa? Ver *Lo que cada uno tiene que poder enunciar* en `informe.md` §1.2).
- Si abrió los tooltips, "Más sobre esta etapa" o "Mostrame".

## Al final (dos preguntas)

1. "¿Qué aprendiste de cómo aprende una máquina?" (comparar con la promesa del proyecto).
2. "¿Qué fue lo más confuso?"

## Cómo leer el resultado

- Una tarea que fallan dos de cada tres personas en el mismo lugar es un problema de la V2: anotarlo en `PENDIENTES.md`, con la etapa y el control.
- Repetir con la V1 (`http://localhost:8000/`) y otra persona sirve para la decisión de con cuál quedarse (seguimiento del cambio).
