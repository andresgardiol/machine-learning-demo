# Design

## Context

- Después de `entrenar-la-generacion-ensena`, la tarjeta de la red puede mostrar una red que no es la del líder en vivo: la muestra del corte. Usa las marcas de `mutationDiff` (rombos) y el renglón `sampleLine`.
- `mutate(net, { strength, rate }, random)` (`core/evolution.js`) es pura y no modifica `net`.
- La fuerza de mutación está en "Probá esto", en el panel, y la red en el tablero de al lado. Con el enfriamiento encendido, el deslizador está deshabilitado (`aria-disabled`).

## Decisions

### D1. El hijo de ejemplo, sin el azar del entrenamiento

`mutationPreview(network, { strength, rate })` devuelve `{ network: mutate(network, …, random), diff: mutationDiff(network, child) }`. `random` es un generador nuevo con una semilla constante de la vista previa (por ejemplo, la de `randomFor(PREVIEW_SEED, 0)`).

Con la misma red, la fuerza y la probabilidad, sale el mismo hijo, así que mover el deslizador ida y vuelta da siempre lo mismo y no parpadea. No se toca el generador del entrenamiento.

*Alternativa descartada:* un hijo distinto cada vez. Se vería un temblor sin sentido al arrastrar.

### D2. La red del líder se congela durante la vista previa

- La vista previa toma la red del líder en el momento en que empieza el arrastre y la usa hasta que termina. Si el líder cambia en medio, el ejemplo no salta.
- Se recalcula en cada `input` del deslizador, como mucho una vez por cuadro.
- Termina a los 2000 ms del último `input`. Entonces la tarjeta vuelve a lo que corresponde: la muestra del corte si el corte sigue, o la red en vivo.

### D3. Estados de la tarjeta de la red

Hay tres estados, con prioridad: vista previa, después la muestra del corte, después la red en vivo. Se arma como una función chica sin DOM (`networkCardMode({ preview, cut })`), con sus pruebas, para que no se pisen los temporizadores.

### D4. Renglón

- Con cambios: "Ejemplo: un hijo con fuerza {strength} % · cambió {changed} de {total}, en promedio {mean}".
- Con fuerza 0: "Ejemplo: con fuerza 0 % el hijo es igual al líder".

Usa el mismo `sampleLine`, con `role="status"`. Para no anunciar cada paso del arrastre, el anuncio se hace al soltar o a los 500 ms sin cambios, no en cada `input`.

### D5. Capturas

Se copia el guion de `entrenar-la-generacion-ensena` y se suman estas vistas: la vista previa con fuerza 5 %, 40 % y 80 %, con el enfriamiento apagado y a 1440×900; y la vista previa en inglés.

## Risks / Trade-offs

- [Se confunde el ejemplo con el hijo que va a nacer (Art. 7).] → El renglón dice "Ejemplo" y "un hijo". La red no tiene actividad en vivo mientras dura la vista previa.
- [El enfriamiento está encendido por defecto, así que la vista previa no se ve hasta apagarlo.] → Es coherente: con el enfriamiento la fuerza no se elige. El tooltip del deslizador ya dice cómo fijarla a mano. Si la crítica del dueño lo pide, se puede mostrar la vista previa al pasar el cursor; queda como pregunta para después.
- Rendimiento: una mutación de una red chica (unos 70 valores) por `input` es despreciable.
