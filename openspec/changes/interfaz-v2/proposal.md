# Propuesta: interfaz-v2

## Why

En una semana la interfaz creció a fuerza de cambios chicos: seis pestañas, más de 400 requisitos y unos 60 controles a la vista por pantalla. Cada cambio ordenó lo que ya había, pero ninguno cambió el esqueleto, y el dueño lo dijo el 18 de noviembre: "esperaba un cambio más notable". El análisis de UX del 17 de noviembre (`borradores/analisis-ux/informe.md`) y las críticas de Reglas a mano y de Entrenar dejaron problemas que el esqueleto actual no deja resolver:

- la escena encerrada en una columna;
- ajustes repartidos en cuatro lugares;
- disposiciones que cambian de una pestaña a otra;
- vocabulario sin escalonar;
- reinicios con alcances confusos;
- desbordes a 1366×768 y 800×600.

Este cambio diseña la interfaz de nuevo, desde el recorrido y no desde los paneles, como una **V2** que convive con la actual. Así el dueño compara las dos lado a lado y decide con cuál se queda.

**Concepto de ML que hace visible:** la V2 no agrega conceptos nuevos. Es la infraestructura que deja ver la cadena completa en un solo recorrido: por qué las reglas a mano no escalan, cómo aprende una red, por qué falla fuera de lo que vio y qué tiene adentro. Cada etapa responde la pregunta que dejó abierta la anterior.

## What Changes

El cambio tiene tres fases, en este orden, con una parada obligada entre la segunda y la tercera:

1. **Análisis de UX en profundidad.** Se trabaja con las skills de buenas prácticas de UX y UI (lista y motivo en `design.md`) y se llega a:
   - los trabajos que vienen a hacer los dos públicos (*jobs to be done*);
   - el mapa del recorrido del principiante y el del mentor;
   - la evaluación heurística de la V1 con evidencia;
   - la escalera de vocabulario;
   - la auditoría de accesibilidad WCAG 2.2;
   - la **matriz de paridad**: cada requisito de la V1 con su lugar en la V2, o con el motivo de que se fusione o se quite.

   El análisis parte del recorrido y de los públicos, no de los paneles actuales. La V1 entra como evidencia de lo que funciona y lo que no, no como plantilla.
2. **Tres propuestas en maquetas.** Son tres direcciones distintas de verdad: disposición, navegación, dirección de arte y manejo de los ajustes. Cada una viene como maqueta HTML estática navegable con al menos el armazón y tres pantallas clave, con capturas a 1440×900 y 1366×768, y se comparan en una tabla de pros y contras con una recomendación. **La implementación no empieza hasta que el dueño elige** una propuesta, o una mezcla explícita.
3. **Implementación de la V2 elegida**, con todas las features de la V1:
   - **Dónde vive:** en `v2/` (se abre en `/v2/`), con su código en `src/v2/` y sus estilos en `styles/v2/`.
   - **Qué reutiliza:** el mismo núcleo de simulación (`src/core`), los cerebros y la biblioteca.
   - **Qué hace nuevo:** el armazón, la navegación, los componentes, los textos y el sistema visual.
   - **Cómo se compara:** un enlace visible en cada versión lleva a la otra.

La V1 no cambia, salvo por el enlace "Probar la V2". Ninguna de estas cosas se rompe para la V1:

- la URL raíz;
- las preferencias;
- los programas guardados;
- las pruebas.

## Capabilities

### New Capabilities

- `interfaz-v2`: la segunda versión de la interfaz. Cubre:
  - su lugar y su convivencia con la V1;
  - el núcleo y la biblioteca que comparte con ella;
  - la paridad de features con la V1;
  - el recorrido como cadena de preguntas;
  - la jerarquía de cada pantalla (consigna, una acción principal, ajustes en niveles);
  - los reinicios con alcance;
  - las ayudas y los tooltips;
  - los dos idiomas, la accesibilidad, los tamaños de ventana, la fluidez y el determinismo.

  Lo que depende de la propuesta elegida (la disposición exacta, la navegación, la dirección de arte) se especifica en esta capacidad con `/opsx:update` después de elegir.

### Modified Capabilities

- `estructura-app`: suma un enlace visible a la V2 en la barra superior de la V1, con tooltip y textos en los dos idiomas.

## Impact

- **Código nuevo:**
  - `v2/index.html`;
  - `src/v2/` (armazón, estaciones, componentes, diccionarios `es` y `en` propios);
  - `styles/v2/` (tokens y estilos propios);
  - pruebas en `tests/v2/`.
- **Código compartido sin cambios de comportamiento:**
  - `src/core` y `src/data`;
  - las partes puras de `src/render` e `src/input` que la V2 decida usar;
  - el motor de textos de `src/ui/i18n.js`, la biblioteca de `src/ui/library.js` y las preferencias de `src/ui/preferences.js`, solo si se reusan tal cual.

  Si la V2 necesita algo nuevo en el núcleo, se agrega sin cambiar lo que la V1 usa, y las pruebas actuales siguen pasando.
- **V1:** solo cambia el enlace a la V2 en `src/ui/app.js`, con sus textos en `src/i18n/`.
- **Almacenamiento:** las dos versiones comparten la biblioteca de cerebros, para comparar con los mismos cerebros. La V2 guarda sus preferencias con claves propias (`mlLab.v2.*`), así no cambia las de la V1.
- **Pruebas:** `tests/architecture.test.js` suma tres reglas:
  - la V1 no importa nada de `src/v2`;
  - la V2 importa de la V1 solo módulos sin DOM (la lógica pura de misiones, indicadores, ajustes y atajos), nunca los que arman la pantalla de la V1;
  - el núcleo sigue sin DOM.
- **Sin dependencias nuevas** y sin paso de build. Las maquetas de la fase 2 también son HTML y CSS estáticos.
- **Documentación:** `README.md` explica cómo abrir y comparar las dos versiones.

## Filtro de entrada

La V2 no suma features: las rediseña. El filtro se responde para lo que es nuevo para el usuario.

| Feature visible | 1. ¿Qué concepto hace visible? | 2. ¿Se entiende sola? | 3. ¿El mentor la ignora u oculta? | 4. ¿Uso indebido y vuelta atrás? |
|---|---|---|---|---|
| La V2 como recorrido de cinco preguntas | Que cada técnica nace de la limitación de la anterior: manejar, programar, aprender, evaluar, entender. | Sí, si cada etapa abre con su pregunta y cierra con la que sigue. Se verifica en las maquetas. | Sí. Puede saltar a cualquier etapa en cualquier momento, sin bloqueos ni orden obligado. | No hay forma de romperla: cada etapa arranca sola y se reinicia. El enlace "Volver a la V1" siempre está. |
| Cuaderno de ajustes en hojas por tema (elegido en la maqueta D) | Qué perilla importa para el concepto de la etapa y a qué pregunta responde cada grupo. | Sí: la primera hoja trae la misión y a lo sumo tres ajustes, y ninguna hoja desplaza. | Sí. Abre cualquier hoja, la V2 recuerda cuál, y pliega el cuaderno para mostrar la escena. | Cada hoja tiene "Restablecer" con su alcance escrito, y "Deshacer" si se pierde trabajo. |
| Enlace entre versiones | Ninguno: es para comparar. | Sí, es un enlace con su nombre. | Sí: es chico y está en la barra superior. | Ninguno de los dos enlaces pierde lo que se aprendió, porque los cerebros se comparten. |

## Públicos

- **Principiante que llega solo:** es para quien se diseña primero. Ve una pregunta, una acción y la escena grande. Lo técnico aparece cuando lo necesita, con su nombre real y su definición.
- **Mentor:** salta a cualquier etapa, prepara cerebros, oculta las guías con un solo control con nombre claro y encuentra todos los ajustes en "Avanzado" sin que estorben al principiante.
- **Cómo no se estorban:** la guía se apaga de una vez y lo avanzado queda plegado, pero a un clic. La matriz de paridad asegura que el mentor no pierda nada de lo que hoy usa.

## Fuera de alcance

- Cambiar la física, los sensores, el tráfico, el entrenamiento o la red neuronal. El núcleo solo admite agregados que la V2 necesite, sin cambiar resultados.
- Borrar la V1 o hacer de la V2 la versión por defecto. Lo decide el dueño después de comparar, en otro cambio.
- Un recorrido guiado paso a paso (*walkthrough*) sobre la V2. Queda pendiente como *Prioridad 1.3*. La V2 deja el lugar para que hable (la pregunta de cada etapa), pero no lo implementa.
- Uso con pantalla táctil o en el teléfono. Sigue siendo solo para escritorio, con un aviso en ventanas angostas como en la V1.
- El modo proyector (`modo-proyector`). Si la propuesta elegida lo resuelve, se anota; si no, sigue pendiente.
- Pruebas con usuarios reales. Las hipótesis de recorrido se rotulan como hipótesis.
- Medir si las redes aprenden (convergencia). Eso lo verifica el dueño.
