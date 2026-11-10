# Constitución del proyecto

Este documento define qué es el proyecto y las reglas que toda decisión debe
respetar. Si una feature, un diseño o una línea de código contradice lo que
está acá, lo que cambia es la feature, no la constitución.

## ADN

- **Qué es:** un laboratorio interactivo para entender machine learning
  jugando, con un autito como hilo conductor.
- **Para quién:** el curioso sin conocimiento previo, que lo usa solo, y el
  mentor, que lo usa como herramienta para enseñar.
- **Promesa:** quien lo recorre sale entendiendo por qué las reglas a mano no
  escalan, cómo aprende una red neuronal, por qué falla fuera de lo que vio y
  qué tiene adentro.
- **Qué no es:** un simulador realista, un framework de ML, un curso de texto,
  ni un juego de carreras.

El recorrido es una cadena de preguntas, donde cada etapa responde la que dejó
abierta la anterior:

```
 PROBLEMA --> REGLAS A MANO --> APRENDER --> EVALUAR --> ENTENDER
 "manejalo"   "programalo"     "que aprenda" "generaliza?" "que aprendio?"
```

## Orden de prioridades

Cuando dos principios chocan, gana el que está más arriba:

1. Claridad didáctica.
2. Usabilidad.
3. Cantidad de features.
4. Realismo.

## Artículos

### 1. Enseñar primero

Toda feature hace visible un concepto que se puede enunciar en una oración. Si
no se puede, no entra.

### 2. Mostrar antes que explicar

Primero se ve, después se toca, al final se nombra. El texto acompaña a lo
visual; nunca es el contenido principal.

### 3. Causa y efecto inmediatos

Todo control produce un cambio visible al instante. Nada de ajustar un valor y
no saber qué pasó.

### 4. Un concepto por vez

Cada pestaña funciona al abrirla, sin configurar nada, con valores por defecto
que ya muestran algo interesante. Lo avanzado va colapsado.

### 5. Autoexplicable

Todo control tiene un tooltip que dice qué hace y por qué importa, en lenguaje
llano. Los términos técnicos se usan con su nombre real y se definen la primera
vez que aparecen.

### 6. Dos públicos, una app

Lo que guía al principiante se puede ocultar para no entorpecer al mentor. Lo
que necesita el mentor no abruma al principiante.

### 7. Honestidad técnica

Simplificamos, pero no mentimos. Los conceptos llevan su nombre correcto y lo
que se visualiza es el cálculo que realmente se ejecuta, no una animación
decorativa.

### 8. Nunca falla en vivo

La simulación es determinista: misma semilla, mismo resultado. La app incluye
cerebros preentrenados, siempre hay una forma de reiniciar o volver atrás, nada
de lo que haga el usuario la rompe, y los errores se explican en lenguaje
humano.

### 9. Consistencia

Misma disposición, mismos colores con el mismo significado y mismos controles
de cámara en toda la app. Lo aprendido en una pestaña sirve en las demás.

### 10. Fluidez

La animación fluida es parte de la experiencia. Una feature que la degrada de
forma visible se rediseña.

### 11. Bilingüe de origen

Ningún texto visible vive fijo en el código. Español e inglés van siempre a la
par; una feature no está terminada si le falta un idioma.

### 12. Simple por dentro

JavaScript, HTML y CSS sin frameworks ni dependencias de terceros. El núcleo de
simulación no conoce el DOM. Los módulos son cohesivos y desacoplados, con
dependencias que apuntan hacia el núcleo. El sitio es 100% estático y se
publica sin paso de build obligatorio.

## Filtro de entrada

Toda feature nueva responde estas cuatro preguntas antes de aceptarse:

1. ¿Qué concepto hace visible?
2. ¿Se entiende sin que nadie lo explique?
3. ¿El mentor puede ignorarla u ocultarla?
4. ¿Qué pasa si se usa mal, y cómo se vuelve atrás?

## Enmiendas

La constitución se cambia solo por decisión explícita del dueño del proyecto, y
el cambio se refleja también en el contexto de `openspec/config.yaml`.

## Créditos

El caso del auto que aprende a manejar está inspirado en el curso
"Self-driving Car" de Radu Mariescu-Istodor. La app le da crédito visible.
