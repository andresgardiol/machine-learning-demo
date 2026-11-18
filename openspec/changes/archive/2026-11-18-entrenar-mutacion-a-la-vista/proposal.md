# Proposal

## Why

La crítica de Entrenar (`borradores/sistema-de-diseno/critica-entrenar.md`, propuesta 3) eligió una sola idea de "la mutación a mano": que la fuerza de mutación se *vea* antes de que rija. Hoy es un porcentaje en un deslizador, y su efecto aparece una generación después, mezclado con todo lo demás. `entrenar-la-generacion-ensena` ya dejó en la red la forma de mostrar un hijo con sus pesos cambiados (`mutationDiff` y sus marcas). Este cambio la usa en el momento de mover el deslizador. Es el cambio 3, el último de la crítica.

**Concepto que hace visible.** Que la fuerza de mutación es cuánto se alejan los pesos de un hijo de los de su padre: con 5 % casi no se mueven, y con 80 % el hijo es casi otra red.

## What Changes

- **Vista previa de la mutación:** mientras se mueve la fuerza de mutación, y unos 2 s después, la red del líder muestra un hijo de ejemplo con esa fuerza. Lleva los pesos cambiados marcados y un renglón: "Ejemplo: un hijo con fuerza 60 % · en promedio 0,31". Después vuelve a la red en vivo.
- El hijo sale de la función de mutación real, con una semilla propia de la vista previa: no consume el azar del entrenamiento ni lo cambia.
- Con el enfriamiento encendido no hay vista previa, porque la fuerza no se edita.

Fuera de alcance:
- la vista previa de la población en la escena y el "Vos elegís" guiado de la propuesta 3 (quedan en *Ideas para más adelante*);
- la vista previa de la probabilidad de mutación, de la vista de ajustes: la red no está al lado;
- un trazo fantasma superpuesto a la red del líder: se usan las marcas que ya existen, que se leen en escala de grises.

**Filtro de entrada**
1. *¿Qué concepto hace visible?* Qué es la fuerza de mutación, en los pesos de una red real.
2. *¿Se entiende sin que nadie lo explique?* Se mueve el deslizador y la red de al lado cambia más o menos, con un renglón que dice que es un ejemplo.
3. *¿El mentor puede ignorarla u ocultarla?* Aparece solo al mover el deslizador y se va sola.
4. *¿Qué pasa si se usa mal, y cómo se vuelve atrás?* Es solo de lectura: no cambia el entrenamiento. El valor del deslizador rige desde la generación siguiente, como siempre, y "Restablecer ajustes" lo devuelve.

**Público.** Al principiante le muestra qué significa el número. Al mentor le da un gesto para explicar la mutación sin esperar una generación.

**Riesgo de Art. 7.** El ejemplo no es el hijo que va a nacer: la mutación es al azar. El renglón dice "Ejemplo" y "un hijo", nunca "la generación siguiente".

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `pestana-entrenar`: se agrega la vista previa de la mutación.

## Impact

- `src/tabs/train/index.js`: escuchar el deslizador (`input`) y mostrar la red de ejemplo con sus marcas y su renglón, con su temporizador.
- Una función pura `mutationPreview(network, { strength, rate })` con su semilla fija (junto a `cut.js` o en el núcleo), con pruebas.
- `src/i18n/es.js` y `en.js`: el renglón de la vista previa.
- No toca el bucle de simulación. Dibuja la red de ejemplo una vez por cambio del deslizador.
