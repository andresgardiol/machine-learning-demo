# interfaz-v2 Specification

## Purpose

Define la segunda versión de la interfaz del laboratorio. Es un rediseño completo del recorrido, que convive con la primera para poder compararlas. Comparte con ella el núcleo de simulación y los cerebros, y conserva todas sus features.

## Requirements

### Requirement: V2 en su propia dirección
La V2 SHALL abrirse en la dirección `v2/` del sitio, como página estática y sin paso de build. La dirección raíz SHALL seguir abriendo la V1 sin cambios. Las dos versiones SHALL funcionar igual servidas en local o publicadas como sitio estático.

#### Scenario: Abrir la V2
- **WHEN** la persona abre `/v2/` con el servidor local en marcha
- **THEN** ve la V2 lista para usar, sin errores en la consola

#### Scenario: La raíz sigue siendo la V1
- **WHEN** la persona abre `/`
- **THEN** ve la V1 como antes del cambio

#### Scenario: Abrir la V2 como archivo
- **WHEN** la persona abre `v2/index.html` con doble clic
- **THEN** ve, en los dos idiomas, el aviso de que hace falta un servidor local, igual que en la V1

### Requirement: Pasar de una versión a la otra
Cada versión SHALL mostrar en su barra superior un enlace con nombre, que lleva a la otra: "Probar la V2" en la V1 y "Volver a la V1" en la V2. Cada enlace SHALL tener tooltip ("qué hace / por qué importa") y textos en español e inglés. El idioma elegido SHALL conservarse al pasar de una versión a la otra.

#### Scenario: De la V1 a la V2
- **WHEN** la persona usa "Probar la V2" en la V1 con el idioma en inglés
- **THEN** se abre la V2 en inglés

#### Scenario: De la V2 a la V1
- **WHEN** la persona usa "Volver a la V1" desde cualquier etapa de la V2
- **THEN** se abre la V1 en el idioma activo

#### Scenario: Tooltip del enlace
- **WHEN** la persona posa el cursor sobre el enlace
- **THEN** un tooltip dice que abre la otra versión de la interfaz y que sirve para compararlas, y que los cerebros guardados se comparten

### Requirement: Cerebros compartidos entre versiones
La V2 SHALL usar la misma biblioteca de cerebros que la V1: un cerebro guardado, importado o autoguardado en una versión SHALL aparecer en la otra. Las demás preferencias de la V2 (idioma aparte) SHALL guardarse con claves propias, sin cambiar las de la V1.

#### Scenario: Guardar en la V2 y ver en la V1
- **WHEN** la persona guarda un campeón en la V2 y abre la V1
- **THEN** la biblioteca de la V1 muestra ese cerebro con su nombre y sus datos

#### Scenario: Preferencias independientes
- **WHEN** la persona apaga las guías en la V2
- **THEN** la V1 sigue mostrando sus guías como estaban

#### Scenario: Almacenamiento no disponible
- **WHEN** el navegador no permite guardar
- **THEN** la V2 funciona en memoria y lo informa en lenguaje llano, como la V1

### Requirement: Mismo núcleo, mismos resultados
La V2 SHALL simular con el mismo núcleo que la V1. Con la misma semilla y la misma configuración, la V2 SHALL dar los mismos resultados que la V1: el mismo recorrido de un programa, el mismo historial y campeón de un entrenamiento, la misma carrera y la misma cuenta de la red. La V2 MUST NOT cambiar el comportamiento del núcleo que usa la V1.

#### Scenario: Entrenamiento igual en las dos versiones
- **GIVEN** la semilla 1 y la configuración por defecto de Entrenar
- **WHEN** se corren 5 generaciones en la V1 y en la V2
- **THEN** el historial de fitness y el campeón son idénticos

#### Scenario: Las pruebas de la V1 siguen pasando
- **WHEN** se corre `npm test` después de implementar la V2
- **THEN** todas las pruebas que existían antes del cambio pasan sin modificarse

### Requirement: Paridad de features con la V1
Cada requisito de las capacidades de la V1 SHALL tener un lugar en la V2, o una decisión explícita del dueño de fusionarlo, cambiarlo o quitarlo, con su motivo. La correspondencia SHALL quedar en la matriz de paridad del cambio. Ninguna feature de la V1 MUST faltar en la V2 sin esa decisión.

#### Scenario: Feature encontrada
- **WHEN** el mentor busca en la V2 una feature que usa en la V1, por ejemplo exportar un cerebro, la selección manual del padre o la operación por operación
- **THEN** la encuentra en el lugar que indica la matriz de paridad

#### Scenario: Feature quitada
- **WHEN** la matriz marca una feature como quitada
- **THEN** la matriz trae el motivo y la fecha de la aprobación del dueño

### Requirement: El recorrido como cadena de preguntas
La V2 SHALL presentar las seis experiencias de la V1 dentro de las cinco etapas de la constitución: problema (El problema), reglas a mano (Reglas a mano), aprender (Entrenar y el Laboratorio), evaluar (Competir) y entender (Inspeccionar). Cada etapa SHALL abrir con la pregunta que responde y cerrar ofreciendo la que sigue. La posición en el recorrido SHALL estar siempre a la vista.

#### Scenario: Pregunta de la etapa
- **WHEN** la persona entra a una etapa
- **THEN** lo primero que lee es la pregunta de la etapa, por ejemplo "¿Podés programarlo vos?" en Reglas a mano

#### Scenario: Paso a la etapa siguiente
- **WHEN** la persona cumple la misión principal de una etapa
- **THEN** la V2 ofrece, sin forzarla, ir a la etapa siguiente con la pregunta que esa etapa responde

#### Scenario: Recorrido libre
- **WHEN** la persona elige cualquier etapa desde la navegación, sin haber pasado por las anteriores
- **THEN** la etapa se abre lista para usar, sin bloqueos

### Requirement: Cada etapa lista al abrirla
Cada etapa de la V2 SHALL funcionar al abrirla, sin configurar nada, con valores por defecto que ya muestran algo interesante, como en la V1.

#### Scenario: Estado por defecto
- **WHEN** la persona abre por primera vez cualquier etapa de la V2
- **THEN** la etapa muestra su escena o su red en marcha, o lista para la acción principal, sin pedir ningún ajuste

### Requirement: Una consigna y una acción principal
Cada pantalla de la V2 SHALL mostrar, antes que cualquier ajuste, una consigna de una frase y una sola acción principal reconocible sin leer. Si la consigna pide manipular algo directamente (manejar, arrastrar un peso, elegir una neurona), eso SHALL ser lo destacado, y ningún botón MUST competir con ello.

#### Scenario: Una sola acción principal a la vista
- **WHEN** se audita cualquier pantalla de la V2 en cualquier estado
- **THEN** hay a lo sumo un control con el estilo de acción principal a la vista

#### Scenario: Manipulación directa destacada
- **WHEN** la consigna de la pantalla pide arrastrar un peso
- **THEN** el peso se ve como algo que se arrastra (forma y cursor) y ningún botón tiene el estilo de acción principal

### Requirement: La escena como protagonista
En las etapas con auto, la escena SHALL ser la zona más grande de la pantalla, salvo donde el concepto de la etapa es la red (entender) o el programa (reglas a mano), que comparten el protagonismo con la escena sin achicarla por debajo de un tercio del ancho.

#### Scenario: Escena en El problema
- **WHEN** se abre El problema a 1366×768
- **THEN** la escena ocupa más área que cualquier otra zona de la pantalla

### Requirement: Disposición de la V2
Todas las etapas de la V2 SHALL compartir cuatro zonas, siempre en el mismo lugar:
- a la izquierda, el riel vertical de etapas;
- al centro, la escena (o la red), con solo la pregunta y la acción principal encima;
- debajo de la escena, una banda con lo que percibe, lo que acciona, las cifras y la marcha;
- a la derecha, el cuaderno de ajustes.

Lo que acciona SHALL verse como estado, no como botón.

#### Scenario: Mismas zonas en todas las etapas
- **WHEN** la persona pasa de El problema a Evaluar y después a Entender
- **THEN** el riel, la banda y el cuaderno quedan en el mismo lugar, y solo cambia lo que hay adentro

#### Scenario: Nada tapa la escena
- **WHEN** se audita la escena de cualquier etapa
- **THEN** sobre ella solo están la pregunta y la acción principal, y en El problema, a 1366×768, la escena visible ocupa al menos el 45 % de la ventana

### Requirement: Riel de etapas
El riel SHALL mostrar las cinco etapas en orden, con su número, la marca de la etapa en curso y su pregunta al posar el cursor o enfocarla. Aprender SHALL tener dos sub-pasos: "Por evolución" (Entrenar) y "Por gradiente" (el Laboratorio). Cada etapa y cada sub-paso SHALL tener tooltip y textos en español e inglés.

#### Scenario: Ver hacia dónde sigue el recorrido
- **WHEN** la persona está en El problema
- **THEN** el riel muestra las cinco etapas, con la primera marcada como en curso

#### Scenario: Pregunta en el riel
- **WHEN** la persona llega con el teclado a la etapa 4 del riel
- **THEN** ve su pregunta, "¿Funciona en lo que no vio?", sin abrir la etapa

### Requirement: Cuaderno plegable
El cuaderno SHALL plegarse a una lengüeta con "Plegar cuaderno" y volver a abrirse desde ella, sin detener lo que está en marcha. Plegado, la escena SHALL ocupar el espacio libre. La V2 SHALL recordar si quedó plegado. Los dos controles SHALL tener tooltip y textos en los dos idiomas.

#### Scenario: Plegar para mostrar
- **WHEN** el mentor pliega el cuaderno durante un entrenamiento
- **THEN** la escena se agranda y el entrenamiento sigue sin reiniciarse

#### Scenario: Volver a abrir
- **WHEN** la persona usa la lengüeta
- **THEN** el cuaderno vuelve con la misma hoja que tenía abierta

### Requirement: Ajustes en hojas por tema
El cuaderno de cada etapa SHALL ordenar sus ajustes en hojas:
- la primera hoja es la de la etapa, con la misión y "Probá esto" (a lo sumo tres ajustes, los que mejor muestran el concepto);
- después vienen las hojas del tema, cada una con un nombre que dice qué agrupa;
- al final va la del escenario, cuando es compartido.

Un mismo ajuste SHALL estar en una sola hoja. Ninguna hoja SHALL desplazarse a 1366×768. Lo que no aplica SHALL ocultarse, no deshabilitarse.

#### Scenario: Pocos ajustes a la vista
- **WHEN** se abre una etapa con la configuración por defecto
- **THEN** se ve la hoja de la etapa, con a lo sumo tres ajustes en "Probá esto"

#### Scenario: Hojas sin desplazar
- **WHEN** se abre cada hoja de cada etapa a 1366×768, en español y en inglés
- **THEN** ninguna pide desplazar

#### Scenario: El mentor vuelve a su hoja
- **WHEN** el mentor abre la hoja "Red y pista" en Aprender y vuelve a la etapa más tarde
- **THEN** el cuaderno abre en "Red y pista"

#### Scenario: Misión que pide un ajuste de otra hoja
- **WHEN** la persona usa "Mostrame" en una misión cuyo ajuste está en otra hoja, o con el cuaderno plegado
- **THEN** la V2 abre el cuaderno en esa hoja, marca el ajuste y le pasa el foco

#### Scenario: Lo que no aplica, oculto
- **WHEN** la red de Aprender tiene una sola capa oculta
- **THEN** los ajustes de neuronas de las capas 2 y 3 no se ven, y aparecen al sumar capas

### Requirement: El escenario se comparte entre etapas
La pista, los carriles, el tráfico y la velocidad máxima del auto SHALL ser los mismos en todas las etapas con auto, salvo los valores que una etapa fije para su concepto, que SHALL mostrarse como "de esta etapa". Un ejemplo que cambie los sensores o el escenario SHALL avisarlo en el momento.

#### Scenario: Cambio de densidad que se conserva
- **WHEN** la persona sube la densidad de tráfico en El problema y abre Competir
- **THEN** Competir usa la misma densidad

#### Scenario: Ejemplo que cambia los sensores
- **WHEN** la persona elige en Reglas a mano un ejemplo con 7 sensores
- **THEN** un aviso breve dice "Este ejemplo usa 7 sensores" junto al control de sensores

### Requirement: Reinicios con alcance explícito
La V2 SHALL usar "Reiniciar" para volver a empezar una corrida y "Restablecer" para volver a los valores de fábrica. Cada uno SHALL decir en su etiqueta o en su tooltip qué toca. Si se pierde trabajo de la persona (un programa, cambios a mano en una red, un entrenamiento con generaciones), la V2 SHALL ofrecer "Deshacer" durante al menos 8 segundos.

#### Scenario: Restablecer un programa escrito
- **WHEN** la persona restablece el programa de Reglas a mano después de escribir
- **THEN** el programa vuelve al de fábrica y aparece "Deshacer", que devuelve lo escrito

#### Scenario: Reiniciar no toca los ajustes
- **WHEN** la persona reinicia el intento en El problema
- **THEN** el auto vuelve a la salida y los ajustes del escenario no cambian

### Requirement: Ayudas con nombre claro
La V2 SHALL ofrecer un único control con nombre claro para ocultar lo que guía al principiante (consignas largas, misiones y explicaciones), con nombre accesible y tooltip. Los tooltips SHALL seguir disponibles con la guía oculta.

#### Scenario: Ocultar la guía
- **WHEN** el mentor oculta la guía
- **THEN** desaparecen las explicaciones largas y las misiones de todas las etapas, y la pregunta de la etapa y la acción principal siguen a la vista

#### Scenario: Volver a mostrar la guía
- **WHEN** el mentor vuelve a mostrarla
- **THEN** todo lo oculto reaparece en el mismo lugar

### Requirement: Aviso de que hay ayuda
Que los controles tienen ayuda SHALL anunciarse sin marcas sobre cada control. La primera vez que se abre la V2, un aviso breve que se puede cerrar SHALL decir que todo control explica qué hace al posar el cursor o al llegar con el teclado. Los nombres de los ajustes (los textos que nombran un concepto) SHALL llevar un subrayado punteado tenue. El aviso SHALL estar en los dos idiomas, y su botón de cerrar, tener tooltip.

#### Scenario: Aviso de las ayudas
- **WHEN** la persona abre la V2 por primera vez
- **THEN** ve un aviso breve que dice que todo control explica qué hace al posar el cursor; al cerrarlo, no vuelve a aparecer

#### Scenario: Sin marcas sobre los controles
- **WHEN** la persona mira cualquier pantalla de la V2
- **THEN** ningún botón, interruptor ni zona lleva un punto, ícono u otra marca de ayuda, y solo los nombres de los ajustes llevan el subrayado punteado

### Requirement: Tooltip en todo control de la V2
Todo control de la V2 SHALL tener un tooltip con "qué hace" y "por qué importa", en lenguaje llano y en el idioma activo, que aparece al posar el cursor y al llegar con el teclado. Los botones de solo ícono SHALL tener nombre accesible y tooltip.

#### Scenario: Auditoría de tooltips
- **WHEN** se ejecuta la auditoría de tooltips de la V2 en cada etapa
- **THEN** no hay ningún control sin tooltip

### Requirement: Vocabulario escalonado
Cada término técnico (fitness, élite, mutación, cruce, activación, época, tasa de aprendizaje, apartados, sesgo, peso) SHALL definirse en pantalla, en una línea, la primera vez que aparece visible en el recorrido, con su nombre real, sin depender solo del tooltip.

#### Scenario: Primera vez que aparece "fitness"
- **WHEN** la persona ve por primera vez el término "fitness" en la V2
- **THEN** junto al término hay una definición de una línea en lenguaje llano

### Requirement: Dos idiomas completos en la V2
Todo texto visible de la V2 SHALL salir de diccionarios en español y en inglés, con las mismas claves, y SHALL cambiar en vivo al elegir el idioma. Los números SHALL escribirse según el idioma, como en la V1.

#### Scenario: Diccionarios a la par
- **WHEN** se corren las pruebas de textos de la V2
- **THEN** las claves de español y de inglés coinciden y ningún texto visible está fijo en el código

#### Scenario: Cambio de idioma en vivo
- **WHEN** la persona cambia a inglés con un entrenamiento en marcha
- **THEN** todos los textos pasan a inglés y el entrenamiento sigue sin reiniciarse

### Requirement: Accesibilidad de la V2
La V2 SHALL cumplir WCAG 2.2 nivel AA en contraste, foco visible, nombres accesibles, objetivos de al menos 24×24 px y navegación por teclado. También SHALL conservar lo que pide la capacidad `accesibilidad` de la V1: atajos de una tecla desactivables, escenario descrito en texto y nada que destelle más de tres veces por segundo.

#### Scenario: Recorrido con teclado
- **WHEN** la persona recorre una etapa solo con Tab, Mayús+Tab, Enter y la barra espaciadora
- **THEN** llega a todos los controles en un orden que sigue la lectura, con el foco siempre visible y sin quedar atrapada en el editor

#### Scenario: Atajos apagados
- **WHEN** la persona apaga los atajos de una tecla
- **THEN** ninguna tecla suelta dispara una acción, y los tooltips y las etiquetas dejan de nombrar teclas

### Requirement: Tamaños de ventana de la V2
A 1440×900 y a 1366×768, cada pantalla de la V2 SHALL mostrar sin desplazarse la pregunta de la etapa, la consigna, la acción principal, la escena (o la red, donde es la protagonista) y la misión en curso, sin textos cortados. A 1280×720 y a 800×600 SHALL seguir siendo usable, sin controles superpuestos. Por debajo de 600 px de ancho, SHALL mostrar el aviso de uso en escritorio.

#### Scenario: 1366×768 sin cortes
- **WHEN** se abre cualquier etapa a 1366×768 en cualquier estado medido
- **THEN** la pregunta, la consigna, la acción principal, la escena y la misión en curso se ven sin desplazar, y no hay texto cortado

#### Scenario: Ventana angosta
- **WHEN** se abre la V2 en una ventana de 500 px de ancho
- **THEN** se ve el aviso de uso en escritorio en el idioma activo

#### Scenario: 800×600 usable
- **WHEN** se abre Reglas a mano a 800×600
- **THEN** la escena, la percepción y el editor se ven sin superponerse y la marcha queda en un solo renglón

### Requirement: Fluidez de la V2
La V2 SHALL mantener, como mínimo, la fluidez de la V1 en las mismas condiciones: 50 cuadros por segundo con 100 autos y 30 con 500 en el entrenamiento, con el diagrama de la red a la vista.

#### Scenario: Entrenar con 500 autos
- **WHEN** se mide la tasa de cuadros 10 segundos en el entrenamiento con 500 autos, la red visible y el navegador a la vista
- **THEN** la tasa es de al menos 30 cuadros por segundo

### Requirement: Errores y vuelta atrás en la V2
Ninguna acción de la persona en la V2 MUST dejarla rota. Los errores SHALL explicarse en lenguaje humano, y cada etapa SHALL tener una forma visible de reiniciar.

#### Scenario: Importar un archivo que no es un cerebro
- **WHEN** la persona importa en la V2 un archivo que no es un cerebro
- **THEN** ve en lenguaje llano por qué no se pudo, y la biblioteca no cambia

#### Scenario: Falla al abrir una etapa
- **WHEN** una etapa falla al montarse
- **THEN** la V2 muestra un mensaje en lenguaje llano con la opción de reintentar, y las demás etapas siguen funcionando
