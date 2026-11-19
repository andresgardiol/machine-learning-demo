# Diseño: interfaz-v2

## Context

El motivo está en `proposal.md` (Why). Lo que define este diseño:

- **Qué se reutiliza tal cual.** La V1 tiene un núcleo sin DOM, determinista y bien probado:
  - `src/core`, con unas 30 pruebas de núcleo;
  - un contrato único de controlador;
  - una biblioteca de cerebros sin DOM (`src/ui/library.js`);
  - lógica pura de pestaña en `src/tabs/*/session.js`, `settings.js` y `shortcuts.js` (misiones, indicadores, rangos y atajos).

  La V2 reutiliza todo eso tal cual.
- **Lo que se rehace.** Lo que no funcionó vive en el armazón y en la composición de las pestañas:
  - `src/ui/app.js`, `src/tabs/*/index.js` (de 480 a 1981 líneas cada uno) y `styles/app.css` (2174 líneas);
  - diccionarios de 2178 líneas por idioma.

  Eso es lo que la V2 hace de nuevo.
- **Dibujo en canvas.** `src/render/view.js`, `network-view.js`, `network-inspector.js` y `plane-view.js` leen los colores de variables CSS del documento (`getComputedStyle`). Para usarlos en la V2, los tokens de la V2 tienen que definir esas variables.
- **Almacenamiento.** La biblioteca usa sus propias claves (`STORAGE_KEYS` en `library.js`) y las preferencias de la V1 usan `mlLab.*`.
- **Lo que ya se aprendió.** Está en `borradores/analisis-ux/informe.md` (P1 a P14 y propuestas 5.1 a 5.13), en `borradores/sistema-de-diseno/critica-reglas-a-mano.md` y `critica-entrenar.md`, y en las notas por área de `PENDIENTES.md`, entre otras:
  - la escena encerrada en 400 px;
  - 800×600 roto en Reglas a mano;
  - acciones terciarias que no se ven tocables;
  - el pedido de dirección de arte;
  - el auto como el de `assets/og-image.png`.

  Todo eso es evidencia de entrada para la fase 1, no plantilla.

## Goals / Non-Goals

**Goals:**
- Que la decisión de diseño la tome el dueño viendo tres maquetas reales, no leyendo una especificación.
- Una V2 que el dueño pueda comparar con la V1 en el mismo navegador, con los mismos cerebros, pestaña por pestaña.
- Que la V2 sea más chica por dentro que la V1: componentes compartidos entre etapas y ninguna etapa de más de unas 600 líneas de composición.
- Que la paridad se pueda revisar, con una matriz de requisito por requisito.

**Non-Goals:**
- Unificar la V1 y la V2 en un solo código con "temas". Son dos armazones, a propósito.
- Retocar la V1 durante el trabajo, más allá del enlace y de arreglos de errores.
- Elegir ahora la disposición, la navegación o la dirección de arte. Eso sale de la fase 2.

## Decisions

### D1. Tres fases con una parada del dueño

Las tres fases son análisis, maquetas e implementación. Entre la 2 y la 3, el trabajo **para** hasta que el dueño elige una propuesta, o una mezcla explícita ("la disposición de A con la dirección de arte de C"). La regla general de seguir con la recomendada sin esperar no se aplica a esta parada: el pedido dice "la propuesta elegida por nosotros".

Después de la elección, `/opsx:update` vuelca la propuesta en el cambio:
- este diseño, con una sección *D-elegida*: disposición, navegación, tokens y componentes;
- los requisitos de disposición de `specs/interfaz-v2`;
- el detalle de los grupos de la fase 3 de `tasks.md`.

*Alternativa descartada:* especificar la disposición ahora y hacer maquetas solo de variantes visuales. Es lo que pasó con `sistema-de-diseno-base`: las tres muestras solo variaban el color y el dueño no vio un cambio notable.

### D2. Skills por fase, y por qué cada una

| Fase | Skill | Para qué |
|---|---|---|
| 1 | `design-skills:ux-strategy` | Trabajos de los dos públicos (*jobs to be done*) y resultados esperables por etapa: qué tiene que poder enunciar la persona al salir. |
| 1 | `design-skills:journey-mapping` | Dos mapas del recorrido: principiante solo (30 a 45 min) y mentor en una clase (preparar, mostrar, ocultar, volver atrás). Con emociones, dudas y puntos de quiebre. |
| 1 | `design-skills:design-critique` | Evaluación heurística de la V1 (Nielsen, leyes de UX, excise, arquitectura de información), con evidencia medida. |
| 1 | `design-skills:interaction-design` | Máquina de estados de cada etapa: en marcha, en pausa, choque, fin, algo elegido. Retroalimentación, prevención de errores y deshacer. |
| 1 | `design-skills:ux-writing` | Voz y tono, escalera de vocabulario (qué término aparece en qué etapa y con qué definición), y verbos de Reiniciar y Restablecer. |
| 1 | `design-skills:accessibility-audit` | Auditoría WCAG 2.2 AA de la V1, que sirve de línea de base: contraste, foco, nombres, objetivos y teclado. |
| 2 | `frontend-design:frontend-design` | Dirección de arte distinta en cada propuesta, que no parezca plantilla. |
| 2 | `design-superpowers:creative` | Paleta, tipografía y estrategia de disposición por propuesta, con `assets/og-image.png` como referencia. |
| 2 | `design-skills:design-systems` | Tokens en tres capas y lista de componentes de cada propuesta, para estimar el costo de la fase 3. |
| 2 | `design-skills:design-critique` | Crítica de las tres maquetas antes de mostrarlas. Si hay defectos, se corrigen o se declaran. |
| 3 | `design-skills:interaction-design`, `design-skills:accessibility-audit`, `design-skills:design-critique` | Microinteracciones por etapa, auditoría final de la V2 y crítica de la V2 contra la V1 con las mismas heurísticas de la fase 1. |

*Descartadas:*
- `ux-research` y `user-research`: no hay usuarios para entrevistar. Solo se usa la parte de plan de prueba, para dejarle al dueño un guion de cinco tareas que pueda probar con una persona (D4).
- Las skills de Figma: el servidor no está autorizado, y las maquetas son HTML.

### D3. El análisis parte del recorrido, no de los paneles

El orden de la fase 1 cuida que lo construido no influya:

1. **A ciegas.** Primero se trabaja solo con la constitución (ADN, promesa, públicos) y la lista de conceptos que la app enseña, sin mirar la V1:
   - trabajos de los públicos;
   - mapa ideal del recorrido;
   - arquitectura de información de las cinco etapas;
   - escalera de vocabulario.
2. **Contraste.** Después se recorre la V1 con las skills de crítica y accesibilidad, y se cruza con lo ya aprendido (el informe, las críticas y `PENDIENTES.md`). Lo que la V1 hace bien queda como "a conservar", con evidencia. Lo que traba, como "a resolver".
3. **Síntesis.** Salen:
   - los principios de diseño de la V2, de 8 a 12, cada uno con la evidencia que lo justifica;
   - la matriz de paridad;
   - los criterios con que se van a comparar las maquetas.

Cada afirmación lleva **[Medido]**, **[Observado]**, **[Hipótesis]** o **[Propuesta]**. Nada se da por hecho por trabajos anteriores sin volver a verlo.

**Dónde queda cada cosa:**
- `openspec/changes/interfaz-v2/analisis/`, versionado y archivado con el cambio:
  - `informe.md`, el análisis;
  - `paridad.md`, la matriz;
  - `principios.md`.
- `borradores/interfaz-v2/` (local, no va a git): las capturas pesadas.

### D4. Maquetas: tres direcciones de verdad distintas

**Ejes en que tienen que diferir.** Cada propuesta toma una postura distinta en al menos tres de estos cuatro ejes:
1. disposición: escena a pantalla completa con paneles flotantes, mesa de trabajo de dos zonas, o lectura narrativa con escenas incrustadas;
2. navegación del recorrido: riel lateral de etapas, línea de tiempo arriba, o capítulos;
3. manejo de los ajustes: cajón, inspector acoplado, o ajustes en el lugar del objeto;
4. dirección de arte: paleta, tipografía, volumen del dibujo y superficies.

Las tres direcciones semilla son **[Hipótesis]** y la fase 1 las puede cambiar:

- **A. "Cabina".** La escena a pantalla completa. Encima, la pregunta y la acción como un HUD; los ajustes en un cajón lateral; las etapas en un riel.
- **B. "Cuaderno de laboratorio".** Cada etapa es una página con un texto corto que acompaña y escenas vivas incrustadas, en la línea de las explicaciones interactivas. Se avanza leyendo y tocando.
- **C. "Mesa de trabajo".** Dos zonas fijas en todas las etapas: el objeto (escena o red) y el banco de trabajo, con un inspector que cambia según lo elegido. Cuenta con la mayor consistencia entre etapas.

**Qué entrega cada maqueta.** HTML y CSS estáticos, sin dependencias, con lo mínimo de JS para navegar entre pantallas y abrir o cerrar paneles:
- el armazón (navegación, ayudas, idioma y versión);
- El problema;
- Entrenar con "Avanzado" abierto;
- Inspeccionar con una neurona elegida;
- uno de los tres estados mentor (guía oculta), a elección.

La escena es una imagen o un SVG estático sacado de la V1. No hace falta simular.

**Dónde viven y cómo se comparan.**
- Las maquetas están en `borradores/interfaz-v2/maquetas/{a,b,c}/index.html`, servidas con `npm start`.
- Cada una lleva capturas a 1440×900 y 1366×768.
- `analisis/comparacion.md` las compara con los criterios de D3: claridad didáctica, usabilidad, convivencia de los dos públicos, costo de la paridad, esfuerzo de la fase 3, riesgo para la fluidez y accesibilidad. Termina con la recomendación de Claude y el porqué.
- Se puede publicar una página privada de comparación (artifact), si el dueño la quiere para revisar con otra persona.

### D5. La V2 como armazón aparte sobre el mismo núcleo

```
v2/index.html                 entrada; carga ../styles/v2/*.css y ../src/v2/main.js
src/v2/
  main.js                     arranque: i18n, preferencias v2, biblioteca, armazón
  shell/                      navegación del recorrido, barra superior, guía, idioma, enlace a la V1
  components/                 botón (4 niveles), deslizador, grupo de opciones, niveles de ajustes,
                              aviso con deshacer, tarjeta de misión, "Mostrame", tooltip con indicio
  stages/<etapa>/index.js     composición de cada etapa (problema, reglas, aprender…, según D-elegida)
  scenario.js                 escenario compartido entre etapas (D7), sin DOM
  i18n/es.js, i18n/en.js      diccionarios propios de la V2
  render/                     solo lo que la dirección de arte elegida dibuje distinto (D8)
styles/v2/tokens.css, app.css
tests/v2/                     textos, arquitectura, escenario, paridad de resultados
```

**Regla de dependencias** (la verifica `tests/architecture.test.js`):
- `src/v2/**` importa de `src/core`, `src/data`, `src/render` y `src/input`.
- De `src/ui` y `src/tabs`, solo módulos sin DOM: que no usen `document` ni `window` y que no armen pantalla. Así puede usar la lógica de misiones, indicadores y rangos sin importar la pantalla de la V1.
- Ningún archivo fuera de `src/v2` importa de `src/v2`.

*Alternativa descartada:* copiar la lógica pura dentro de `src/v2`. Duplica las reglas de las misiones y abre la puerta a resultados distintos entre versiones.

*Alternativa descartada:* mover la lógica pura a `src/shared`. Toca imports de la V1 sin necesidad. Se puede hacer cuando el dueño decida con qué versión se queda.

**Excepciones que se justifican:**
- Si la V2 necesita del núcleo algo que hoy está dentro de un módulo con DOM de la V1, se extrae a un módulo sin DOM y la V1 lo importa de ahí. El comportamiento de la V1 no cambia, y lo cuidan sus pruebas.
- Cualquier agregado al núcleo es aditivo.

### D6. Almacenamiento

| Qué | Clave | Por qué |
|---|---|---|
| Biblioteca de cerebros y autoguardados | Las mismas de la V1 (`STORAGE_KEYS` de `library.js`) | Para comparar con los mismos cerebros (spec *Cerebros compartidos entre versiones*). |
| Idioma | `mlLab.language`, compartida | Se conserva al cambiar de versión. |
| Guía, ayudas, atajos, "Avanzado" abierto, programa de Reglas, escenario | `mlLab.v2.*` | La V2 no altera la V1. |

`createPreferences` de la V1 tiene las claves fijas. La V2 tiene su propio módulo de preferencias, sin DOM, con la misma tolerancia a fallas.

*Riesgo:* las dos versiones abiertas en dos pestañas a la vez escriben la misma biblioteca. Es el mismo caso que dos pestañas de la V1. La biblioteca ya relee al guardar; si no lo hace, se anota y no se arregla en este cambio.

### D7. Escenario compartido entre etapas

Un módulo sin DOM (`src/v2/scenario.js`) guarda el escenario de la V2: pista, carriles, densidad, irregularidad y velocidad máxima. Cada etapa declara qué valores fija para su concepto, por ejemplo la irregularidad 0 de Entrenar, que hoy es un valor por defecto distinto. La interfaz los rotula "de esta etapa".

Es el camino (a) de la propuesta 5.7 del informe, con una excepción explícita. Lo elijo porque la hipótesis P6 dice que el principiante cree que el ajuste es global. El rótulo resuelve el caso en que no lo es.

### D8. Dibujo y dirección de arte

- La V2 arranca usando `src/render` tal cual. `styles/v2/tokens.css` define las variables de color que leen los pintores (`COLOR_VARS`), con los valores de la paleta de la V2.
- Si la propuesta elegida cambia el dibujo (el auto con volumen como el de `og-image.png`, rayos con brillo), el dibujo nuevo va en `src/v2/render/` y la V1 no se toca.
- Dos dibujos: uno rico para el auto seguido y uno simple para la población. Se mide contra la fluidez (spec *Fluidez de la V2*).
- La forma de choque no cambia (Art. 7).

**Rendimiento:** la V2 no toca el bucle de simulación (`src/ui/loop.js` se reutiliza). El costo nuevo está en el dibujo y en el DOM del armazón. Se mide como en la V1: 10 s con el navegador a la vista, en Entrenar con 100 y con 500 autos, en Competir con seis competidores y en Inspeccionar con la red más grande.

### D9. Cómo se construye la fase 3

- **Quién implementa.** La implementación, las pruebas en el navegador y las mediciones las hace una sub-sesión con Opus 5.5 y esfuerzo medio. Esta sesión diseña, revisa y orquesta (preferencia del dueño).
- **Orden.** Primero el armazón y los componentes. Después una etapa por vez, en el orden del recorrido.
- **Mientras falten etapas.** Una etapa que todavía no existe muestra su pregunta y "Por ahora, en la V1", con un enlace a la pestaña equivalente. Así la V2 se puede comparar desde la primera etapa terminada.
- **Al cerrar cada etapa:**
  - capturas de la V1 y la V2 en el mismo estado, a 1440×900 y 1366×768, en `borradores/interfaz-v2/comparacion/`;
  - su parte de la matriz de paridad marcada;
  - las auditorías en 0: tooltips, una sola acción principal, y cortes con desbordes.
- **Pruebas de igualdad.** Las pruebas de `tests/v2/` comprueban que la configuración por defecto que arma cada etapa de la V2 es la misma que la de la V1: escenario, entrenamiento, carrera y red. Así, misma semilla da mismos resultados, sin medir aprendizaje.

### D10. Auditorías de la V2

`src/v2/audit.js`, en la consola como `mlLab.v2.audit*()`, verifica:
- los controles sin tooltip;
- más de una acción principal a la vista;
- texto cortado o zonas que desbordan;
- objetivos de menos de 24×24 px;
- textos fijos fuera de los diccionarios.

Es el mismo enfoque que `src/ui/audit.js`, en un módulo propio, porque las clases y los componentes son otros.

## Risks / Trade-offs

- **[Riesgo] El alcance es enorme: más de 400 requisitos y seis experiencias.** → La parada del dueño en D1, una etapa por vez en D9 y la matriz de paridad. La V2 se puede comparar con la primera etapa terminada. Si el dueño elige la V1 a mitad de camino, se archiva lo hecho sin tocar la V1.
- **[Riesgo] Dos interfaces que mantener durante el trabajo.** → Mientras dure la fase 3, la V1 recibe solo arreglos de errores. Las ideas nuevas se anotan en `PENDIENTES.md` para la versión que quede.
- **[Riesgo] Que lo construido influya en el análisis.** → El orden de D3, con la parte a ciegas escrita antes de abrir la V1.
- **[Riesgo] Tres maquetas parecidas.** → Los ejes de D4, revisados con `design-critique` antes de mostrarlas. Si dos coinciden en más de un eje, se rehace una.
- **[Riesgo] Una dirección de arte con más brillo o volumen que degrade la fluidez o rompa el límite de destellos.** → D8: dos dibujos, medición, y el guardián de destellos de la V1 (`src/render/flash-guard.js`) reutilizado.
- **[Riesgo] Los diccionarios se duplican.** Los tooltips de la V1 son buenos (informe, §1). → La V2 arranca de sus textos cuando el control es el mismo y los revisa con `ux-writing`. Las claves son propias. La prueba de textos de la V2 exige las mismas claves en los dos idiomas.
- **[Trade-off] Reutilizar los pintores de canvas ata parte de la paleta de la V2 a los nombres de variables de la V1.** → Se acepta para la primera versión. Si la propuesta elegida lo impide, se usa `src/v2/render/` (D8).
- **[Trade-off] Compartir la biblioteca.** Un cerebro borrado en una versión desaparece en la otra. → El tooltip del enlace lo dice (spec), y eliminar sigue pidiendo confirmación.

## Migration Plan

1. Las fases 1 y 2 no tocan código de la app.
2. La fase 3 suma `v2/`, `src/v2/`, `styles/v2/` y `tests/v2/`, y el enlace en la V1. Para publicar no hace falta nada nuevo: GitHub Pages sirve `/v2/` como cualquier carpeta.
3. **Vuelta atrás:** se quita el enlace de la V1 y se borran las carpetas de la V2. Las claves `mlLab.v2.*` quedan en el navegador sin efecto.
4. Hacer de la V2 la versión por defecto, o quitar la V1, es otro cambio, que decide el dueño después de comparar.

## Open Questions

Las que se responden en la fase 1 sin cambiar los grupos de tareas:
- Cómo se reparten las seis experiencias en las cinco etapas. ¿El Laboratorio va en "aprender", junto a Entrenar, como el otro modo de aprender (gradiente en lugar de evolución), o en "entender", junto a Inspeccionar? La hipótesis inicial es "aprender".
- Si el modo proyector entra en alguna propuesta. Si entra, se anota en la comparación y la decisión pasa al dueño junto con la elección.
