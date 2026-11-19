# Matriz de paridad: interfaz-v2

Cada requisito de las capacidades de `openspec/specs/` (commit `767f239`) con su lugar previsto en la V2 y su estado. Generada por `borradores/interfaz-v2/paridad.py` (local) y revisada a mano; la verificación es `python3 borradores/interfaz-v2/paridad.py --contar`.

**Estados.** *igual*: la V2 reutiliza la misma lógica o la misma regla sin cambio visible de conducta. *rediseñado*: la misma conducta en otro lugar o con otro componente. *fusionado con…*: se cumple a través de un requisito de `specs/interfaz-v2`. *propuesto quitar*: necesita la decisión del dueño, con fecha (spec *Paridad de features con la V1*).

**Lugar previsto** [Propuesta]: la etapa de la arquitectura del informe (1.4) y, cuando se sabe, la zona. La zona exacta depende de la propuesta elegida y se completa con `/opsx:update` (tareas 6.2 y 16.1).

**Experiencia**: la pestaña de la V1 donde vive hoy.

## Resumen

- Requisitos: **526** en 33 capacidades.
- igual: 284
- rediseñado: 226
- fusionado con: 15
- propuesto quitar: 1

Lo que necesita al dueño antes de la fase 3 [Propuesta]:

- *Panel ajustable* (`estructura-app`): propuesto quitar.
- *Reintento automático* (`pestana-reglas`): apagado por defecto.
- *La marcha es la acción principal* (`jerarquia-visual`): la acción principal sale de la consigna.
- *Interruptor de guía sin tooltips* y *Interruptor de ayudas*: un control de guía con nombre y otro, aparte, para los tooltips.

## Matriz

| # | Capacidad | Requisito | Experiencia (V1) | Lugar previsto en la V2 | Estado | Motivo |
|---|---|---|---|---|---|---|
| 1 | `accesibilidad` | Atajos de una tecla desactivables | todas | Armazón y componentes | igual | mismos atajos, desactivables |
| 2 | `accesibilidad` | Límites de los controles con contraste | todas | Armazón y componentes | igual | se conserva (spec *Accesibilidad de la V2*) |
| 3 | `accesibilidad` | Tamaño mínimo de los controles | todas | Armazón y componentes | igual | se conserva (spec *Accesibilidad de la V2*) |
| 4 | `accesibilidad` | Escenario descrito en texto | todas | Armazón y componentes | igual | se conserva (spec *Accesibilidad de la V2*) |
| 5 | `accesibilidad` | Sin destellos | todas | Armazón y componentes | igual | se conserva (spec *Accesibilidad de la V2*) |
| 6 | `ayuda-contextual` | Tooltip en todo control | todas | Armazón · tooltip con indicio | igual | misma regla; se suma el indicio constante (spec *Ayudas con nombre claro*) |
| 7 | `ayuda-contextual` | Aparición y cierre del tooltip | todas | Armazón · tooltip con indicio | igual | misma regla; se suma el indicio constante (spec *Ayudas con nombre claro*) |
| 8 | `ayuda-contextual` | Ubicación del tooltip | todas | Armazón · tooltip con indicio | igual | misma regla; se suma el indicio constante (spec *Ayudas con nombre claro*) |
| 9 | `ayuda-contextual` | Tooltips en el idioma activo | todas | Armazón · tooltip con indicio | igual | misma regla; se suma el indicio constante (spec *Ayudas con nombre claro*) |
| 10 | `ayuda-contextual` | Controles no disponibles explicados | todas | Armazón · tooltip con indicio | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 11 | `ayuda-contextual` | Lenguaje llano | todas | Armazón · tooltip con indicio | igual | misma regla; se suma el indicio constante (spec *Ayudas con nombre claro*) |
| 12 | `ayuda-contextual` | Apretar un control sin acción lo explica | todas | Armazón · tooltip con indicio | igual | misma regla; se suma el indicio constante (spec *Ayudas con nombre claro*) |
| 13 | `ayuda-contextual` | Tooltips con las ayudas apagadas | todas | Armazón · tooltip con indicio | igual | misma regla; se suma el indicio constante (spec *Ayudas con nombre claro*) |
| 14 | `barra-escenario` | Barra de escenario | todas menos el Laboratorio | Escenario compartido (D7) | fusionado con *El escenario se comparte entre etapas* | una sola barra de escenario con valores "de esta etapa" |
| 15 | `barra-escenario` | Pista en la barra | todas menos el Laboratorio | Escenario compartido (D7) | fusionado con *El escenario se comparte entre etapas* | una sola barra de escenario con valores "de esta etapa" |
| 16 | `barra-escenario` | Cambios del escenario en el momento | todas menos el Laboratorio | Escenario compartido (D7) | rediseñado | un solo escenario común con valores "de esta etapa" |
| 17 | `barra-escenario` | Ajustes de tráfico en un circuito | todas menos el Laboratorio | Escenario compartido (D7) | rediseñado | un solo escenario común con valores "de esta etapa" |
| 18 | `barra-escenario` | Restablecer el escenario | todas menos el Laboratorio | "Restablecer ajustes de esta etapa" | fusionado con *Reinicios con alcance explícito* | un verbo con objeto escrito y Deshacer |
| 19 | `barra-escenario` | Barra explicada y accesible | todas menos el Laboratorio | Escenario compartido (D7) | fusionado con *El escenario se comparte entre etapas* | una sola barra de escenario con valores "de esta etapa" |
| 20 | `barra-escenario` | Grupo que no aplica en una pestaña | todas menos el Laboratorio | Escenario compartido (D7) | fusionado con *El escenario se comparte entre etapas* | una sola barra de escenario con valores "de esta etapa" |
| 21 | `barra-escenario` | Grupo propio de una pestaña | todas menos el Laboratorio | Escenario compartido (D7) | fusionado con *El escenario se comparte entre etapas* | una sola barra de escenario con valores "de esta etapa" |
| 22 | `carrera` | Carrera de varios competidores | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 23 | `carrera` | Meta de la carrera | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 24 | `carrera` | Chocar no saca de la carrera | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 25 | `carrera` | Protegido al reaparecer | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 26 | `carrera` | Un vehículo choca una sola vez | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 27 | `carrera` | Competidor que no avanza | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 28 | `carrera` | Fin de la carrera | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 29 | `carrera` | Resultado de cada competidor | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 30 | `carrera` | Mejor vuelta | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 31 | `carrera` | Orden de la carrera | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 32 | `carrera` | Carrera reproducible | Competir | Evaluar · núcleo | igual | núcleo reutilizado tal cual |
| 33 | `cerebros` | Contenido de un cerebro | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 34 | `cerebros` | Entradas y salidas de un cerebro | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 35 | `cerebros` | Datos de entrenamiento | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 36 | `cerebros` | Compatibilidad con el auto | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 37 | `cerebros` | Validación de un cerebro | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 38 | `cerebros` | Nombre propio | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 39 | `cerebros` | Biblioteca recordada | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 40 | `cerebros` | Lista de cerebros | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 41 | `cerebros` | Renombrar | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 42 | `cerebros` | Eliminar con confirmación | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 43 | `cerebros` | Actualizar un cerebro guardado | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 44 | `cerebros` | Exportar | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 45 | `cerebros` | Importar | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 46 | `cerebros` | Autoguardado | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 47 | `cerebros` | Controles de la biblioteca explicados | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 48 | `cerebros` | Pistas en los datos de entrenamiento | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 49 | `cerebros` | Cerebro que aprendió imitando | Entrenar, Competir, Inspeccionar, Laboratorio | Biblioteca compartida (todas las etapas) | igual | misma biblioteca y mismas claves (spec *Cerebros compartidos*) |
| 50 | `cerebros-de-ejemplo` | Cuatro cerebros incluidos | Competir, Inspeccionar | Núcleo y datos compartidos | igual | datos versionados reutilizados |
| 51 | `cerebros-de-ejemplo` | Ejemplos que no cambian | Competir, Inspeccionar | Núcleo y datos compartidos | igual | datos versionados reutilizados |
| 52 | `cerebros-de-ejemplo` | Ejemplos que se pueden regenerar | Competir, Inspeccionar | Núcleo y datos compartidos | igual | datos versionados reutilizados |
| 53 | `cerebros-de-ejemplo` | Lo que muestran los ejemplos | Competir, Inspeccionar | Núcleo y datos compartidos | igual | datos versionados reutilizados |
| 54 | `consigna-de-pestana` | Tarjeta al principio del panel | todas | Tarjeta de la etapa, según la propuesta | rediseñado | la tarjeta suma la pregunta; su lugar sale de la disposición |
| 55 | `consigna-de-pestana` | Consigna | todas | Armazón · pregunta de la etapa + consigna + misión | rediseñado | la tarjeta suma la pregunta de la etapa (spec *El recorrido como cadena de preguntas*) |
| 56 | `consigna-de-pestana` | Acción principal en la tarjeta | todas | Tarjeta de la etapa, según la propuesta | rediseñado | la tarjeta suma la pregunta; su lugar sale de la disposición |
| 57 | `consigna-de-pestana` | Misión en curso | todas | Armazón · pregunta de la etapa + consigna + misión | rediseñado | la tarjeta suma la pregunta de la etapa (spec *El recorrido como cadena de preguntas*) |
| 58 | `consigna-de-pestana` | Tarjeta con la guía apagada | todas | Tarjeta de la etapa, según la propuesta | rediseñado | la tarjeta suma la pregunta; su lugar sale de la disposición |
| 59 | `consigna-de-pestana` | Tarjeta al elegir en Inspeccionar y en el Laboratorio | todas | Tarjeta de la etapa, según la propuesta | rediseñado | la tarjeta suma la pregunta; su lugar sale de la disposición |
| 60 | `consigna-de-pestana` | Tarjeta accesible | todas | Armazón · pregunta de la etapa + consigna + misión | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 61 | `consigna-de-pestana` | Texto de guía plegado | todas | Tarjeta de la etapa, según la propuesta | rediseñado | la tarjeta suma la pregunta; su lugar sale de la disposición |
| 62 | `consigna-de-pestana` | Mostrar el control de la misión | todas | Armazón · pregunta de la etapa + consigna + misión | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 63 | `consigna-de-pestana` | Controles de las misiones de El problema | todas | Armazón · pregunta de la etapa + consigna + misión | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 64 | `consigna-de-pestana` | Controles de las misiones de Reglas a mano | todas | Armazón · pregunta de la etapa + consigna + misión | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 65 | `consigna-de-pestana` | Controles de las misiones de Entrenar | todas | Armazón · pregunta de la etapa + consigna + misión | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 66 | `consigna-de-pestana` | Controles de las misiones de Competir | todas | Armazón · pregunta de la etapa + consigna + misión | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 67 | `consigna-de-pestana` | Controles de las misiones de Inspeccionar | todas | Armazón · pregunta de la etapa + consigna + misión | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 68 | `consigna-de-pestana` | Controles de las misiones de compuertas del Laboratorio | todas | Armazón · pregunta de la etapa + consigna + misión | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 69 | `consigna-de-pestana` | Controles de las misiones de puntos y tu manejo del Laboratorio | todas | Armazón · pregunta de la etapa + consigna + misión | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 70 | `consigna-de-pestana` | Cómo se muestra un control | todas | Armazón · pregunta de la etapa + consigna + misión | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 71 | `controladores` | Contrato único de controlador | todas | Núcleo compartido | igual | contrato único reutilizado |
| 72 | `controladores` | Contenido de la percepción | todas | Núcleo compartido | igual | contrato único reutilizado |
| 73 | `controladores` | Controles contradictorios | todas | Núcleo compartido | igual | contrato único reutilizado |
| 74 | `controladores` | Controlador de teclado | todas | Núcleo compartido | igual | contrato único reutilizado |
| 75 | `controladores` | El teclado no interfiere con la página | todas | Núcleo compartido | igual | contrato único reutilizado |
| 76 | `controladores` | Controlador de red neuronal | todas | Núcleo compartido | igual | contrato único reutilizado |
| 77 | `controladores` | Red que no corresponde a la percepción | todas | Núcleo compartido | igual | contrato único reutilizado |
| 78 | `controladores` | Controlador de reglas | todas | Núcleo compartido | igual | contrato único reutilizado |
| 79 | `controladores` | Programa que no corresponde al auto | todas | Núcleo compartido | igual | contrato único reutilizado |
| 80 | `controladores` | Controlador con observador | todas | Núcleo compartido | igual | contrato único reutilizado |
| 81 | `controladores` | Volante suave | todas | Núcleo compartido | igual | quitada de las specs; decisión del dueño: queda el volante actual (tarea 6.2); confirmada por el dueño el 19-11-2026 |
| 82 | `cuenta-de-la-red` | Cuenta desglosada | Inspeccionar | Entender · tarjeta de la neurona | igual | lógica sin DOM reutilizada |
| 83 | `cuenta-de-la-red` | Recorrido paso a paso | Inspeccionar | Entender · tarjeta de la neurona | igual | lógica sin DOM reutilizada |
| 84 | `cuenta-de-la-red` | Cambios de prueba | Inspeccionar | Entender · tarjeta de la neurona | igual | lógica sin DOM reutilizada |
| 85 | `cuenta-de-la-red` | Cambios que se deshacen | Inspeccionar | Entender · tarjeta de la neurona | igual | lógica sin DOM reutilizada |
| 86 | `cuenta-de-la-red` | Cuenta reproducible y sin navegador | Inspeccionar | Entender · tarjeta de la neurona | igual | lógica sin DOM reutilizada |
| 87 | `cuenta-de-la-red` | De dónde viene lo que recibe una neurona | Inspeccionar | Entender · tarjeta de la neurona | igual | lógica sin DOM reutilizada |
| 88 | `cuenta-de-la-red` | Respuesta de una neurona a una entrada | Inspeccionar | Entender · tarjeta de la neurona | igual | lógica sin DOM reutilizada |
| 89 | `datos-de-ejemplo` | Puntos de dos colores | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 90 | `datos-de-ejemplo` | Ejemplos de manejo | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 91 | `datos-de-ejemplo` | Maestro | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 92 | `datos-de-ejemplo` | Apartar ejemplos | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 93 | `datos-de-ejemplo` | Resumen de los datos | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 94 | `datos-de-ejemplo` | Ejemplos evaluados | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 95 | `datos-de-ejemplo` | Compuertas lógicas | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 96 | `estructura-app` | Pestañas del recorrido | todas | Armazón · navegación de cinco etapas | rediseñado | seis pestañas → cinco etapas con su pregunta (informe 1.4) |
| 97 | `estructura-app` | Lista para usar al abrir | todas | Armazón | igual | misma regla en el armazón nuevo |
| 98 | `estructura-app` | Disposición común | todas | Disposición de la propuesta elegida | rediseñado | la disposición sale de la fase 2 (D4, eje 1) |
| 99 | `estructura-app` | Panel ajustable | todas | — | propuesto quitar | decisión del dueño: eligió D (tarea 6.1), que fija las zonas; lo reemplaza plegar el cuaderno; confirmada por el dueño el 19-11-2026 |
| 100 | `estructura-app` | Preferencias recordadas | todas | Armazón · preferencias `mlLab.v2.*` | rediseñado | claves propias (D6) |
| 101 | `estructura-app` | Créditos | todas | Armazón | igual | misma regla en el armazón nuevo |
| 102 | `estructura-app` | Aviso en pantallas angostas | todas | Armazón | igual | misma regla en el armazón nuevo |
| 103 | `estructura-app` | Errores en lenguaje humano | todas | Armazón | igual | misma regla en el armazón nuevo |
| 104 | `estructura-app` | Biblioteca de cerebros compartida | todas | Biblioteca compartida | igual | misma biblioteca (D6) |
| 105 | `estructura-app` | Una sola pestaña en marcha | todas | Armazón | igual | misma regla en el armazón nuevo |
| 106 | `estructura-app` | Escenario ajustable | todas | Escenario compartido (D7) | fusionado con *El escenario se comparte entre etapas* | una sola barra de escenario con valores "de esta etapa" |
| 107 | `estructura-app` | Anchos que se adaptan a la ventana | todas | Disposición de la propuesta elegida | rediseñado | la disposición sale de la fase 2 (D4, eje 1) |
| 108 | `estructura-app` | Disposición en ventanas medianas | todas | Disposición de la propuesta elegida | rediseñado | la disposición sale de la fase 2 (D4, eje 1) |
| 109 | `estructura-app` | Orden común del panel | todas | Disposición de la propuesta elegida | rediseñado | la disposición sale de la fase 2 (D4, eje 1) |
| 110 | `estructura-app` | Interruptor de guía sin tooltips | todas | Barra superior · "Guía" | fusionado con *Ayudas con nombre claro* | un solo control con nombre para la guía; los tooltips siguen |
| 111 | `estructura-app` | Interruptor de ayudas | todas | Barra superior · preferencias | rediseñado | se conserva aparte de la guía, con nombre que diga que apaga los tooltips |
| 112 | `estructura-app` | Disposición de Reglas a mano | todas | Disposición de la propuesta elegida | rediseñado | la disposición sale de la fase 2 (D4, eje 1) |
| 113 | `inspector-de-red` | Dos vistas de la misma red | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 114 | `inspector-de-red` | Actividad en el momento | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 115 | `inspector-de-red` | Paso animado | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 116 | `inspector-de-red` | Elegir una neurona o una conexión | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 117 | `inspector-de-red` | Capas resumidas | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 118 | `inspector-de-red` | Conexiones más importantes | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 119 | `inspector-de-red` | Acercar y moverse | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 120 | `inspector-de-red` | Marcas de lo apagado y lo cambiado | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 121 | `inspector-de-red` | Redes grandes en el inspector | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 122 | `inspector-de-red` | Inspector accesible | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 123 | `inspector-de-red` | La vuelta en la red | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 124 | `inspector-de-red` | Vuelta animada | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 125 | `inspector-de-red` | Estado sin nada elegido | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 126 | `inspector-de-red` | Conexiones siempre visibles | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 127 | `inspector-de-red` | Neuronas que usan el espacio | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 128 | `inspector-de-red` | Neurona por dentro | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 129 | `inspector-de-red` | Vista previa al posar el cursor | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 130 | `inspector-de-red` | Números sobre las conexiones | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 131 | `inspector-de-red` | Cambiar un peso en el lugar | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 132 | `inspector-de-red` | De dónde viene una neurona | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 133 | `inspector-de-red` | Flujo de la señal | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 134 | `inspector-de-red` | Pocos colores con significado | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 135 | `inspector-de-red` | Mapa dentro de la neurona | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 136 | `inspector-de-red` | Perillas de pesos y sesgos sobre la red | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 137 | `inspector-de-red` | Perillas de las entradas | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 138 | `inspector-de-red` | Lo que titubea, quieto | Inspeccionar y Laboratorio | Entender y Aprender · por gradiente · vista de la red | igual | pintor de canvas reutilizado (`src/render`); la V2 define sus colores |
| 139 | `internacionalizacion` | Dos idiomas completos | todas | Armazón · diccionarios propios de la V2 | igual | mismo motor de i18n, claves propias |
| 140 | `internacionalizacion` | Selector de idioma | todas | Armazón · diccionarios propios de la V2 | igual | mismo motor de i18n, claves propias |
| 141 | `internacionalizacion` | Cambio de idioma en vivo | todas | Armazón · diccionarios propios de la V2 | igual | mismo motor de i18n, claves propias |
| 142 | `internacionalizacion` | Idioma inicial | todas | Armazón · diccionarios propios de la V2 | igual | mismo motor de i18n, claves propias |
| 143 | `internacionalizacion` | Texto faltante | todas | Armazón · diccionarios propios de la V2 | igual | mismo motor de i18n, claves propias |
| 144 | `internacionalizacion` | Números según el idioma | todas | Armazón · diccionarios propios de la V2 | igual | mismo motor de i18n, claves propias |
| 145 | `jerarquia-visual` | Cinco estilos con un significado cada uno | todas | Componentes | igual | misma regla, con los componentes de la V2 |
| 146 | `jerarquia-visual` | La salida de la red no parece botón | todas | Componentes | igual | misma regla, con los componentes de la V2 |
| 147 | `jerarquia-visual` | Una sola acción principal a la vista | todas | Componentes | igual | misma regla, con los componentes de la V2 |
| 148 | `jerarquia-visual` | La marcha es la acción principal | todas | Componentes · acción principal | rediseñado | la acción principal sale de la consigna: en Reglas a mano es escribir, no pausar (informe R3). Decide el dueño |
| 149 | `jerarquia-visual` | Estados que cambian la acción principal | todas | Componentes | igual | misma regla, con los componentes de la V2 |
| 150 | `jerarquia-visual` | Guardar no compite con la marcha | todas | Componentes | igual | misma regla, con los componentes de la V2 |
| 151 | `jerarquia-visual` | Opciones elegidas con un mismo aspecto | todas | Componentes | igual | misma regla, con los componentes de la V2 |
| 152 | `neuroevolucion` | Población evaluada en el mismo escenario | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 153 | `neuroevolucion` | Tamaño de la población | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 154 | `neuroevolucion` | Fin de la generación | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 155 | `neuroevolucion` | Eliminar a los lentos | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 156 | `neuroevolucion` | Pasar de generación a pedido | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 157 | `neuroevolucion` | Funciones de fitness | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 158 | `neuroevolucion` | Selección de los padres | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 159 | `neuroevolucion` | Élite | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 160 | `neuroevolucion` | Mutación | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 161 | `neuroevolucion` | Cruce opcional | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 162 | `neuroevolucion` | Tráfico por generación | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 163 | `neuroevolucion` | Entrenamiento reproducible | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 164 | `neuroevolucion` | El mejor nunca empeora con élite y mismo tráfico | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 165 | `neuroevolucion` | Historial de generaciones | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 166 | `neuroevolucion` | Campeón | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 167 | `neuroevolucion` | Líder | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 168 | `neuroevolucion` | Cambios de configuración durante el entrenamiento | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 169 | `neuroevolucion` | Continuar desde un cerebro | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 170 | `neuroevolucion` | Modo de selección | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 171 | `neuroevolucion` | Elegir al líder como padre | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 172 | `neuroevolucion` | Generación siguiente desde el padre elegido | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 173 | `neuroevolucion` | Sin padre elegido | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 174 | `neuroevolucion` | Deshacer la elección | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 175 | `neuroevolucion` | Padre al cambiar de modo | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 176 | `neuroevolucion` | Padre al continuar desde un cerebro | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 177 | `neuroevolucion` | Cerebro del entrenamiento | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 178 | `neuroevolucion` | Vehículos superados | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 179 | `neuroevolucion` | Escenario por defecto del entrenamiento | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 180 | `neuroevolucion` | Enfriamiento de la mutación | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 181 | `neuroevolucion` | Aprendizaje con los valores por defecto | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 182 | `neuroevolucion` | Pistas del entrenamiento | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 183 | `neuroevolucion` | Ventaja en un circuito | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 184 | `neuroevolucion` | Vueltas de un individuo | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 185 | `neuroevolucion` | Aprendizaje en el óvalo | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 186 | `neuroevolucion` | Reiniciar la generación en curso | Entrenar | Aprender · por evolución · núcleo | rediseñado | "Reiniciar" con alcance y Deshacer si se pierde trabajo |
| 187 | `neuroevolucion` | Muestra de la mutación | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 188 | `neuroevolucion` | Cambios que rigen en cada generación | Entrenar | Aprender · por evolución · núcleo | igual | núcleo reutilizado tal cual (`src/core`) |
| 189 | `paisaje` | Paisaje de la calle | todas | Escena (dibujo) | igual | pintor reutilizado; colores de la propuesta |
| 190 | `paisaje` | Paisaje de los circuitos | todas | Escena (dibujo) | igual | pintor reutilizado; colores de la propuesta |
| 191 | `paisaje` | Paisaje solo estético | todas | Escena (dibujo) | igual | pintor reutilizado; colores de la propuesta |
| 192 | `paisaje` | Paisaje reproducible | todas | Escena (dibujo) | igual | pintor reutilizado; colores de la propuesta |
| 193 | `paisaje` | Colores del paisaje | todas | Escena (dibujo) | igual | pintor reutilizado; colores de la propuesta |
| 194 | `paisaje` | Mostrar u ocultar el paisaje | todas | Escena (dibujo) | igual | pintor reutilizado; colores de la propuesta |
| 195 | `paisaje` | Paisaje fluido | todas | Escena (dibujo) | igual | pintor reutilizado; colores de la propuesta |
| 196 | `pestana-competir` | Carrera lista al abrir | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 197 | `pestana-competir` | Guía de inicio | Competir | Pregunta de la etapa + consigna | fusionado con *Una consigna y una acción principal* | la guía de inicio pasa a la pregunta y la consigna |
| 198 | `pestana-competir` | Elegir a los competidores | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 199 | `pestana-competir` | Agregar competidores | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 200 | `pestana-competir` | Sensores de cada competidor | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 201 | `pestana-competir` | Tu programa como competidor | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 202 | `pestana-competir` | Programas de ejemplo como competidores | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 203 | `pestana-competir` | Vos como competidor | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 204 | `pestana-competir` | Cuenta regresiva al largar | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 205 | `pestana-competir` | Controles de la carrera | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 206 | `pestana-competir` | Chocar y seguir | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 207 | `pestana-competir` | Meta y espera | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 208 | `pestana-competir` | Tráfico de la carrera | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 209 | `pestana-competir` | Barra de escenario en Competir | Competir | Escenario compartido (D7) | fusionado con *El escenario se comparte entre etapas* | una sola barra de escenario con valores "de esta etapa" |
| 210 | `pestana-competir` | Meta configurable | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 211 | `pestana-competir` | Panel sin desplazamiento lateral | Competir | Evaluar | rediseñado | lo cubre la spec *Tamaños de ventana de la V2* |
| 212 | `pestana-competir` | Indicadores de la carrera | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 213 | `pestana-competir` | Marcador de la carrera | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 214 | `pestana-competir` | Seguir a un competidor | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 215 | `pestana-competir` | Tabla por pista | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 216 | `pestana-competir` | Dónde entrenó cada cerebro | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 217 | `pestana-competir` | Resultado de la calle con su tráfico | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 218 | `pestana-competir` | Misiones | Competir | Evaluar | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 219 | `pestana-competir` | La carrera se conserva al cambiar de pestaña | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 220 | `pestana-competir` | Pestaña a la vista sin desplazarse | Competir | Evaluar | rediseñado | lo cubre la spec *Tamaños de ventana de la V2* |
| 221 | `pestana-competir` | Controles de la pestaña explicados | Competir | Evaluar | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 222 | `pestana-competir` | Cerebros que aprendieron imitando | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 223 | `pestana-competir` | Marcador y tabla sin cortes | Competir | Evaluar | rediseñado | lo cubre la spec *Tamaños de ventana de la V2* |
| 224 | `pestana-competir` | Botones de solo ícono con nombre | Competir | Evaluar | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 225 | `pestana-competir` | Panel a la vista en 1366×768 | Competir | Evaluar | rediseñado | lo cubre la spec *Tamaños de ventana de la V2* |
| 226 | `pestana-conducir` | Manejo inmediato | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 227 | `pestana-conducir` | Guía de inicio | El problema | Pregunta de la etapa + consigna | fusionado con *Una consigna y una acción principal* | la guía de inicio pasa a la pregunta y la consigna |
| 228 | `pestana-conducir` | Indicadores del intento | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 229 | `pestana-conducir` | Fin del intento por choque | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 230 | `pestana-conducir` | Reiniciar el intento | El problema | Problema | rediseñado | "Reiniciar" con alcance y Deshacer si se pierde trabajo |
| 231 | `pestana-conducir` | Tráfico nuevo | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 232 | `pestana-conducir` | Pausa | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 233 | `pestana-conducir` | Percepción visible | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 234 | `pestana-conducir` | Acción visible | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 235 | `pestana-conducir` | Ver como la máquina | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 236 | `pestana-conducir` | Misiones | El problema | Problema | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 237 | `pestana-conducir` | Configuración avanzada | El problema | "Avanzado" de la etapa (plegado y recordado) | rediseñado | spec *Ajustes en tres niveles* |
| 238 | `pestana-conducir` | Restablecer la configuración | El problema | "Restablecer ajustes de esta etapa" | fusionado con *Reinicios con alcance explícito* | un verbo con objeto escrito y Deshacer |
| 239 | `pestana-conducir` | Controles de la pestaña explicados | El problema | Problema | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 240 | `pestana-conducir` | Panel a la vista sin desplazarse | El problema | Problema | rediseñado | lo cubre la spec *Tamaños de ventana de la V2* |
| 241 | `pestana-conducir` | Elegir la pista | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 242 | `pestana-conducir` | Pestaña en un circuito | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 243 | `pestana-conducir` | Cinta del manejo | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 244 | `pestana-conducir` | Cartel de primer manejo | El problema | Problema | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 245 | `pestana-entrenar` | Entrenamiento en marcha al abrir | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 246 | `pestana-entrenar` | Guía de inicio | Entrenar | Pregunta de la etapa + consigna | fusionado con *Una consigna y una acción principal* | la guía de inicio pasa a la pregunta y la consigna |
| 247 | `pestana-entrenar` | Indicadores del entrenamiento | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 248 | `pestana-entrenar` | Pausa | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 249 | `pestana-entrenar` | Velocidad del entrenamiento | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 250 | `pestana-entrenar` | Pasar a la siguiente generación | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 251 | `pestana-entrenar` | Reiniciar el entrenamiento | Entrenar | Aprender · por evolución | rediseñado | "Reiniciar" con alcance y Deshacer si se pierde trabajo |
| 252 | `pestana-entrenar` | Población nueva | Entrenar | Aprender · por evolución | rediseñado | con Deshacer en lugar del diálogo |
| 253 | `pestana-entrenar` | Curva de fitness | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 254 | `pestana-entrenar` | Red del líder | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 255 | `pestana-entrenar` | Sensores del líder | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 256 | `pestana-entrenar` | Configuración básica | Entrenar | "Probá esto" de la etapa | rediseñado | spec *Ajustes en tres niveles* |
| 257 | `pestana-entrenar` | Configuración avanzada | Entrenar | "Avanzado" de la etapa (plegado y recordado) | rediseñado | spec *Ajustes en tres niveles* |
| 258 | `pestana-entrenar` | Red y sensores | Entrenar | "Avanzado" de la etapa (plegado y recordado) | rediseñado | spec *Ajustes en tres niveles* |
| 259 | `pestana-entrenar` | Restablecer la configuración | Entrenar | "Restablecer ajustes de esta etapa" | fusionado con *Reinicios con alcance explícito* | un verbo con objeto escrito y Deshacer |
| 260 | `pestana-entrenar` | Guardar el campeón | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 261 | `pestana-entrenar` | Biblioteca de cerebros en la pestaña | Entrenar | Biblioteca compartida · en la etapa | rediseñado | misma biblioteca; su lugar sale de la propuesta |
| 262 | `pestana-entrenar` | Seguir entrenando un cerebro | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 263 | `pestana-entrenar` | El entrenamiento se conserva al cambiar de pestaña | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 264 | `pestana-entrenar` | Misiones | Entrenar | Aprender · por evolución | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 265 | `pestana-entrenar` | Controles de la pestaña explicados | Entrenar | Aprender · por evolución | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 266 | `pestana-entrenar` | Controles de marcha agrupados | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 267 | `pestana-entrenar` | Panel a la vista sin desplazarse | Entrenar | Aprender · por evolución | rediseñado | lo cubre la spec *Tamaños de ventana de la V2* |
| 268 | `pestana-entrenar` | Avanzado por grupos | Entrenar | "Avanzado" de la etapa (plegado y recordado) | rediseñado | spec *Ajustes en tres niveles* |
| 269 | `pestana-entrenar` | Quién elige al padre | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 270 | `pestana-entrenar` | Elegir al líder | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 271 | `pestana-entrenar` | Deshacer la elección | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 272 | `pestana-entrenar` | Estado del padre elegido | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 273 | `pestana-entrenar` | Ajustes que no aplican con selección manual | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 274 | `pestana-entrenar` | Selección manual explicada | Entrenar | Aprender · por evolución | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 275 | `pestana-entrenar` | Funciones de fitness a elegir | Entrenar | "Probá esto" de la etapa | rediseñado | spec *Ajustes en tres niveles* |
| 276 | `pestana-entrenar` | Valores de ventaja con su unidad | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 277 | `pestana-entrenar` | Pistas del entrenamiento | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 278 | `pestana-entrenar` | Generación en un circuito | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 279 | `pestana-entrenar` | Ver como la máquina | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 280 | `pestana-entrenar` | Vistas del panel | Entrenar | Banco o inspector de la etapa | rediseñado | las subpestañas Entrenamiento/Ajustes/Cerebros se reparten en los tres niveles (informe N2) |
| 281 | `pestana-entrenar` | Cambios pendientes a la vista | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 282 | `pestana-entrenar` | Textos de la pestaña coherentes | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 283 | `pestana-entrenar` | Corte de generación | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 284 | `pestana-entrenar` | Tarjeta de generación | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 285 | `pestana-entrenar` | La mutación en la red | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 286 | `pestana-entrenar` | Cambios marcados en la curva | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 287 | `pestana-entrenar` | Vista previa de la mutación | Entrenar | Aprender · por evolución | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 288 | `pestana-inspeccionar` | Lista para mirar al abrir | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 289 | `pestana-inspeccionar` | La red en el centro | Inspeccionar | Disposición de la propuesta elegida | rediseñado | la disposición sale de la fase 2 (D4, eje 1) |
| 290 | `pestana-inspeccionar` | Escena del auto en segundo plano | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 291 | `pestana-inspeccionar` | Elegir el cerebro | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 292 | `pestana-inspeccionar` | Barra de reproducción junto a la red | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 293 | `pestana-inspeccionar` | Ritmo de la reproducción | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 294 | `pestana-inspeccionar` | Avance paso a paso | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 295 | `pestana-inspeccionar` | Operación en curso | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 296 | `pestana-inspeccionar` | Tarjeta de la neurona | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 297 | `pestana-inspeccionar` | Decisión de la red | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 298 | `pestana-inspeccionar` | Entradas a mano | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 299 | `pestana-inspeccionar` | Apagar una parte de la red | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 300 | `pestana-inspeccionar` | Cambiar pesos y sesgos | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 301 | `pestana-inspeccionar` | Deshacer y restablecer la red | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 302 | `pestana-inspeccionar` | Vista de la red a la vista | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 303 | `pestana-inspeccionar` | Guía, leyenda y misiones | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 304 | `pestana-inspeccionar` | Estado conservado | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 305 | `pestana-inspeccionar` | Atajos de la pestaña | Inspeccionar | Entender | igual | mismos atajos, desactivables |
| 306 | `pestana-inspeccionar` | Pestaña a la vista sin desplazarse | Inspeccionar | Entender | rediseñado | lo cubre la spec *Tamaños de ventana de la V2* |
| 307 | `pestana-inspeccionar` | Controles explicados y accesibles | Inspeccionar | Entender | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 308 | `pestana-inspeccionar` | Detalle de una conexión | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 309 | `pestana-inspeccionar` | Panel sin nada elegido | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 310 | `pestana-inspeccionar` | Comparar con el original | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 311 | `pestana-inspeccionar` | Flujo de la señal en Inspeccionar | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 312 | `pestana-inspeccionar` | Curva de respuesta | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 313 | `pestana-inspeccionar` | La tarjeta sigue la cuenta de a una operación | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 314 | `pestana-inspeccionar` | La entrada que se lee, en la escena | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 315 | `pestana-inspeccionar` | Manejar vos | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 316 | `pestana-inspeccionar` | Tu decisión y la de la red | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 317 | `pestana-inspeccionar` | Devolver el volante | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 318 | `pestana-inspeccionar` | Caso del choque en Inspeccionar | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 319 | `pestana-inspeccionar` | Repetición del choque en Inspeccionar | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 320 | `pestana-inspeccionar` | Reintentar desde un cuadro | Inspeccionar | Entender | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 321 | `pestana-laboratorio` | Disposición del Laboratorio | Laboratorio | Disposición de la propuesta elegida | rediseñado | la disposición sale de la fase 2 (D4, eje 1) |
| 322 | `pestana-laboratorio` | Elegir los datos | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 323 | `pestana-laboratorio` | Plano de puntos | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 324 | `pestana-laboratorio` | Reproducción del aprendizaje | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 325 | `pestana-laboratorio` | Un ejemplo, paso a paso | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 326 | `pestana-laboratorio` | Operación en curso del aprendizaje | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 327 | `pestana-laboratorio` | Ejemplo en curso | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 328 | `pestana-laboratorio` | Curvas de aprendizaje | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 329 | `pestana-laboratorio` | Ejemplos apartados y sobreajuste | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 330 | `pestana-laboratorio` | Armar la red | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 331 | `pestana-laboratorio` | Tasa de aprendizaje | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 332 | `pestana-laboratorio` | Empezar de nuevo | Laboratorio | Aprender · por gradiente | rediseñado | "Reiniciar" con alcance y Deshacer si se pierde trabajo |
| 333 | `pestana-laboratorio` | Aprender a manejar imitando | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 334 | `pestana-laboratorio` | Grabar tu propio manejo | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 335 | `pestana-laboratorio` | Guardar lo aprendido como cerebro | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 336 | `pestana-laboratorio` | Tabla de datos | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 337 | `pestana-laboratorio` | Cambiar la red a mano | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 338 | `pestana-laboratorio` | Deshacer y restablecer los cambios a mano | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 339 | `pestana-laboratorio` | Guía y misiones del Laboratorio | Laboratorio | Aprender · por gradiente | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 340 | `pestana-laboratorio` | Estado conservado en el Laboratorio | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 341 | `pestana-laboratorio` | Atajos del Laboratorio | Laboratorio | Aprender · por gradiente | igual | mismos atajos, desactivables |
| 342 | `pestana-laboratorio` | Controles del Laboratorio explicados y accesibles | Laboratorio | Aprender · por gradiente | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 343 | `pestana-laboratorio` | Qué detecta cada neurona | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 344 | `pestana-laboratorio` | Panel del Laboratorio con algo elegido | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 345 | `pestana-laboratorio` | Filtro de conexiones en el Laboratorio | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 346 | `pestana-laboratorio` | Detalle de una conexión en el Laboratorio | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 347 | `pestana-laboratorio` | Historia de un peso | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 348 | `pestana-laboratorio` | Lo que el Laboratorio no usa de la vista | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 349 | `pestana-laboratorio` | La espiral se puede aprender | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 350 | `pestana-laboratorio` | Punto de prueba en el plano | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 351 | `pestana-laboratorio` | La red muestra el punto de prueba | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 352 | `pestana-laboratorio` | Compuertas al abrir | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 353 | `pestana-laboratorio` | Nada aprende sin pedirlo | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 354 | `pestana-laboratorio` | Tabla de verdad | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 355 | `pestana-laboratorio` | Plano de las compuertas | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 356 | `pestana-laboratorio` | Elegir la compuerta | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 357 | `pestana-laboratorio` | Perillas en la red del Laboratorio | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 358 | `pestana-laboratorio` | Se ve en el momento si va mejor | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 359 | `pestana-laboratorio` | XOR no se separa con una recta | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 360 | `pestana-laboratorio` | De la mano a backpropagation | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 361 | `pestana-laboratorio` | Ver una solución | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 362 | `pestana-laboratorio` | Cada clase de datos con lo suyo | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 363 | `pestana-laboratorio` | Textos de las compuertas | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 364 | `pestana-laboratorio` | A mano primero en Compuertas | Laboratorio | Aprender · por gradiente | rediseñado | misma conducta; pasa a la etapa Aprender (informe 1.4) |
| 365 | `pestana-reglas` | Programa en marcha al abrir | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 366 | `pestana-reglas` | Guía de inicio | Reglas a mano | Pregunta de la etapa + consigna | fusionado con *Una consigna y una acción principal* | la guía de inicio pasa a la pregunta y la consigna |
| 367 | `pestana-reglas` | Editor del programa | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 368 | `pestana-reglas` | Escribir con comodidad | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 369 | `pestana-reglas` | El programa rige mientras se escribe | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 370 | `pestana-reglas` | Errores a la vista | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 371 | `pestana-reglas` | Líneas que se cumplen resaltadas | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 372 | `pestana-reglas` | Paleta de palabras | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 373 | `pestana-reglas` | Indicadores del programa | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 374 | `pestana-reglas` | Percepción y acción con los nombres del lenguaje | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 375 | `pestana-reglas` | Controles del intento | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 376 | `pestana-reglas` | Reintento automático | Reglas a mano | Reglas a mano · interruptor "Reintentar solo" | rediseñado | propuesta: apagado por defecto para que el choque se quede (informe R6). Decide el dueño |
| 377 | `pestana-reglas` | Programas de ejemplo | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 378 | `pestana-reglas` | Restablecer el programa | Reglas a mano | Reglas a mano · "Restablecer programa" | rediseñado | con Deshacer de 8 s en lugar del diálogo |
| 379 | `pestana-reglas` | Programa recordado | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 380 | `pestana-reglas` | Exportar e importar el programa | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 381 | `pestana-reglas` | Misiones | Reglas a mano | Reglas a mano | igual | lógica de misiones reutilizada (`session.js`); cambia solo dónde se ve la tarjeta |
| 382 | `pestana-reglas` | Configuración avanzada | Reglas a mano | "Avanzado" de la etapa (plegado y recordado) | rediseñado | spec *Ajustes en tres niveles* |
| 383 | `pestana-reglas` | Fluidez con el programa en marcha | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 384 | `pestana-reglas` | Controles de la pestaña explicados | Reglas a mano | Reglas a mano | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 385 | `pestana-reglas` | Elegir la pista | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 386 | `pestana-reglas` | Ejemplos en la calle recta | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 387 | `pestana-reglas` | Ver como la máquina | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 388 | `pestana-reglas` | Insertar un dato desde su barra | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 389 | `pestana-reglas` | Mesa de trabajo | Reglas a mano | Disposición de la propuesta elegida | rediseñado | la disposición sale de la fase 2 (D4, eje 1) |
| 390 | `pestana-reglas` | Caso del choque | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 391 | `pestana-reglas` | Repetición del choque | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 392 | `pestana-reglas` | Comparar con los ejemplos | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 393 | `pestana-reglas` | Tu programa | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 394 | `pestana-reglas` | Cuaderno de casos | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 395 | `pestana-reglas` | Regla para el caso | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 396 | `pestana-reglas` | Vista de fichas | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 397 | `pestana-reglas` | Ficha de regla | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 398 | `pestana-reglas` | Ficha escrita a mano | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 399 | `pestana-reglas` | Editar con fichas | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 400 | `pestana-reglas` | Agregar y borrar fichas | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 401 | `pestana-reglas` | Reordenar fichas | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 402 | `pestana-reglas` | Constantes como deslizadores | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 403 | `pestana-reglas` | Fichas que se cumplen | Reglas a mano | Reglas a mano | rediseñado | misma conducta; cambia el lugar en la pantalla |
| 404 | `pista` | Pista definida por línea central, ancho y carriles | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 405 | `pista` | Calle recta de 2, 3 o 4 carriles | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 406 | `pista` | Bordes de la pista | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 407 | `pista` | Centro de carril | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 408 | `pista` | Progreso sobre la pista | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 409 | `pista` | Pista cerrada | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 410 | `pista` | Progreso por vueltas | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 411 | `pista` | Catálogo de circuitos | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 412 | `pista` | Circuitos manejables | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 413 | `pista` | Nombres de las pistas | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 414 | `red-neuronal` | Estructura por capas | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 415 | `red-neuronal` | Cálculo de las salidas | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 416 | `red-neuronal` | Salidas sí/no | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 417 | `red-neuronal` | Activación de las capas ocultas | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 418 | `red-neuronal` | Inicialización reproducible | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 419 | `red-neuronal` | Valores de todas las neuronas | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 420 | `red-neuronal` | Cálculo sin efectos | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 421 | `reglas` | Programa por líneas | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 422 | `reglas` | Órdenes | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 423 | `reglas` | Reglas | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 424 | `reglas` | Condiciones | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 425 | `reglas` | Constantes | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 426 | `reglas` | Datos disponibles | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 427 | `reglas` | Ejecución en cada instante | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 428 | `reglas` | Vocabulario en español y en inglés | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 429 | `reglas` | Errores explicados | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 430 | `reglas` | Errores de constantes | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 431 | `reglas` | Tamaño de un programa | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 432 | `reglas` | Cantidad de reglas | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 433 | `reglas` | Líneas que se cumplen | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 434 | `reglas` | Lenguaje sin navegador | Reglas a mano | Reglas a mano · núcleo del lenguaje | igual | lógica sin DOM reutilizada tal cual |
| 435 | `retropropagacion` | Respuesta suave | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 436 | `retropropagacion` | Error de un ejemplo | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 437 | `retropropagacion` | Culpa de cada neurona | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 438 | `retropropagacion` | Corrección de los pesos | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 439 | `retropropagacion` | La corrección achica el error | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 440 | `retropropagacion` | Una época | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 441 | `retropropagacion` | Recorrido paso a paso del aprendizaje | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 442 | `retropropagacion` | Aprender con partes apagadas | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 443 | `retropropagacion` | Cambios a mano durante el aprendizaje | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 444 | `retropropagacion` | Valores de cada neurona sobre una grilla | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 445 | `retropropagacion` | Historia de los pesos | Laboratorio | Aprender · por gradiente · núcleo | igual | núcleo reutilizado tal cual |
| 446 | `sensores` | Rayos distribuidos en un abanico | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 447 | `sensores` | Lectura normalizada | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 448 | `sensores` | Obstáculos detectados | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 449 | `sensores` | Orden estable de las lecturas | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 450 | `sensores` | Configuración de los sensores | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 451 | `simulacion` | Avance en pasos fijos | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 452 | `simulacion` | Resultado reproducible | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 453 | `simulacion` | Ejecución sin navegador | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 454 | `simulacion` | Aceleración y velocidad máxima | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 455 | `simulacion` | Velocidad máxima configurable | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 456 | `simulacion` | Fricción | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 457 | `simulacion` | Giro | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 458 | `simulacion` | Choque | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 459 | `simulacion` | Reinicio | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 460 | `simulacion` | Pausa | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 461 | `simulacion` | Sacar un auto de carrera | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 462 | `simulacion` | Varios autos en un mismo mundo | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 463 | `simulacion` | Los autos no chocan entre sí | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 464 | `simulacion` | Un auto se comporta igual solo o acompañado | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 465 | `simulacion` | Reproducibilidad con varios autos | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 466 | `simulacion` | Reinicio con varios autos | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 467 | `simulacion` | Velocidad de simulación | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 468 | `simulacion` | Mundo sobre un circuito | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 469 | `sistema-de-diseno` | Escala tipográfica acotada | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 470 | `sistema-de-diseno` | Tres alturas de control | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 471 | `sistema-de-diseno` | Espaciado en pasos | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 472 | `sistema-de-diseno` | Superficies con nombre | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 473 | `sistema-de-diseno` | Un color, un significado | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 474 | `sistema-de-diseno` | Cuatro roles con un color y una forma | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 475 | `sistema-de-diseno` | Rótulos de rol | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 476 | `sistema-de-diseno` | Estado "se cumple" | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 477 | `sistema-de-diseno` | Estado "error" | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 478 | `sistema-de-diseno` | Estado "choque" | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 479 | `sistema-de-diseno` | Deslizadores de la app | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 480 | `sistema-de-diseno` | El sistema no cambia el comportamiento | todas | Tokens de la propuesta elegida | rediseñado | la V2 trae su propio sistema (D4, eje 4) |
| 481 | `tablero` | Zona de tablero | El problema, Entrenar, Competir | Zona del objeto o banco, según la propuesta | rediseñado | el tablero de la V1 se reparte según la disposición elegida |
| 482 | `tablero` | Renglón de indicadores | El problema, Entrenar, Competir | Zona del objeto o banco, según la propuesta | rediseñado | el tablero de la V1 se reparte según la disposición elegida |
| 483 | `tablero` | Tarjetas del tablero | El problema, Entrenar, Competir | Zona del objeto o banco, según la propuesta | rediseñado | el tablero de la V1 se reparte según la disposición elegida |
| 484 | `tablero` | Las tarjetas se reparten el alto | El problema, Entrenar, Competir | Zona del objeto o banco, según la propuesta | rediseñado | el tablero de la V1 se reparte según la disposición elegida |
| 485 | `tablero` | Renglones de ayuda | El problema, Entrenar, Competir | Zona del objeto o banco, según la propuesta | rediseñado | el tablero de la V1 se reparte según la disposición elegida |
| 486 | `tablero` | Tarjetas operables con el teclado | El problema, Entrenar, Competir | Zona del objeto o banco, según la propuesta | rediseñado | el tablero de la V1 se reparte según la disposición elegida |
| 487 | `tablero` | Tablero explicado | El problema, Entrenar, Competir | Zona del objeto o banco, según la propuesta | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 488 | `tablero` | Tarjeta con editor | El problema, Entrenar, Competir | Zona del objeto o banco, según la propuesta | rediseñado | el tablero de la V1 se reparte según la disposición elegida |
| 489 | `trafico` | Tráfico reproducible | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 490 | `trafico` | Tráfico siempre superable | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 491 | `trafico` | Densidad configurable | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 492 | `trafico` | Irregularidad configurable | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 493 | `trafico` | Cambio de configuración en marcha | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 494 | `trafico` | Movimiento del tráfico | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 495 | `trafico` | Tráfico sin fin | todas | Núcleo compartido | igual | núcleo sin DOM reutilizado |
| 496 | `vista-escenario` | Dibujo del escenario | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 497 | `vista-escenario` | Colores con significado constante | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 498 | `vista-escenario` | Sensores visibles | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 499 | `vista-escenario` | Cámara que sigue al auto | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 500 | `vista-escenario` | Zoom | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 501 | `vista-escenario` | Paneo | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 502 | `vista-escenario` | Restablecer la vista | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 503 | `vista-escenario` | Controles de cámara explicados | todas | Escena (dibujo y cámara) | igual | tooltips y nombres se conservan; los textos se revisan con `ux-writing` |
| 504 | `vista-escenario` | Adaptación al tamaño de la ventana | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 505 | `vista-escenario` | Fluidez | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 506 | `vista-escenario` | Dibujo de una población | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 507 | `vista-escenario` | Marca de la élite | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 508 | `vista-escenario` | Seguimiento del líder | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 509 | `vista-escenario` | Fluidez con una población | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 510 | `vista-escenario` | Dibujo de un circuito | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 511 | `vista-escenario` | Circuito entero a la vista | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 512 | `vista-escenario` | Fluidez en un circuito | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 513 | `vista-escenario` | Competidores distinguibles | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 514 | `vista-escenario` | Meta a la vista | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 515 | `vista-escenario` | Fluidez en una carrera | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 516 | `vista-escenario` | Escena chica | todas | Escena | rediseñado | la escena pasa a protagonista (spec *La escena como protagonista*) |
| 517 | `vista-escenario` | Rayos que se mueven a mano | todas | Escena (dibujo y cámara) | igual | pintor reutilizado; colores de la propuesta (D8) |
| 518 | `vista-red` | Diagrama por capas | Entrenar | Aprender · por evolución · red del líder | igual | pintor reutilizado |
| 519 | `vista-red` | Entradas y salidas con nombre | Entrenar | Aprender · por evolución · red del líder | igual | pintor reutilizado |
| 520 | `vista-red` | Pesos visibles | Entrenar | Aprender · por evolución · red del líder | igual | pintor reutilizado |
| 521 | `vista-red` | Sesgos visibles | Entrenar | Aprender · por evolución · red del líder | igual | pintor reutilizado |
| 522 | `vista-red` | Actividad en vivo | Entrenar | Aprender · por evolución · red del líder | igual | pintor reutilizado |
| 523 | `vista-red` | Colores propios y constantes | Entrenar | Aprender · por evolución · red del líder | igual | pintor reutilizado |
| 524 | `vista-red` | Redes grandes | Entrenar | Aprender · por evolución · red del líder | igual | pintor reutilizado |
| 525 | `vista-red` | Diagrama solo de lectura | Entrenar | Aprender · por evolución · red del líder | igual | pintor reutilizado |
| 526 | `vista-red` | Diagrama que ocupa su zona | Entrenar | Aprender · por evolución · red del líder | igual | pintor reutilizado |

## Avance en la V2

Filas ya hechas en la V2, con dónde quedaron. [Medido] en el navegador una por una. Va como lista, no como tabla, para que `paridad.py --contar` siga contando solo las filas de la matriz.

- **226 · Manejo inmediato** (grupo 10): la etapa abre con el auto listo y las flechas manejan sin otro paso; la escena toma el foco al mostrarse.
- **227 · Guía de inicio** (grupo 10): la pregunta y la consigna en la placa; el párrafo de la V1 en "Más sobre esta etapa".
- **228 · Indicadores del intento** (grupo 10): cifras de la banda: distancia, superados (vueltas en un circuito), intentos y mejor distancia.
- **229 · Fin del intento por choque** (grupo 10): aviso de choque sobre la escena, con la causa, los metros y Reiniciar como acción principal.
- **230 · Reiniciar el intento** (grupo 10): Reiniciar en la banda y en el aviso, y la tecla R; vacía la cinta y suma un intento, como la V1. No pierde trabajo, así que no lleva Deshacer.
- **231 · Tráfico nuevo** (grupo 10): "Vista y tráfico" de la hoja Manejar; se oculta en un circuito.
- **232 · Pausa** (grupo 10): Pausar/Reanudar en la banda, con espacio, y el rótulo "En pausa" en la escena.
- **233 · Percepción visible** (grupo 10): barras de la banda con la lectura de dos decimales debajo (hasta 12 sensores) y la velocidad aparte.
- **234 · Acción visible** (grupo 10): las cuatro lámparas de la banda, como estado y no como botón.
- **235 · Ver como la máquina** (grupo 10): "Probá esto"; rótulo en la escena y descripción para lectores de pantalla.
- **236 · Misiones** (grupo 10): la misión en curso en la nota de la hoja Manejar, con su progreso; Mostrame en la de "ver como la máquina".
- **237 · Configuración avanzada** (grupo 10): hoja Escenario: pista, carriles y velocidad (densidad e irregularidad, en "Probá esto").
- **238 · Restablecer la configuración** (grupo 10): "Restablecer escenario" con Deshacer.
- **239 · Controles de la pestaña explicados** (grupo 10): todo control con tooltip (auditoría en 0) y textos de la V1 copiados.
- **240 · Panel a la vista sin desplazarse** (grupo 10): ninguna hoja desplaza a 1366×768 en los dos idiomas.
- **241 · Elegir la pista** (grupo 10): hoja Escenario.
- **242 · Pestaña en un circuito** (grupo 10): consigna de circuito, vueltas en las cifras, sin misiones, tráfico ni carriles (se ocultan).
- **243 · Cinta del manejo** (grupo 10): al pie de la hoja Manejar, con el alto que queda y la marca del choque.
- **244 · Cartel de primer manejo** (grupo 10): sobre la escena, con la guía, hasta la primera tecla de manejo.
- **365 · Programa en marcha al abrir** (grupo 11): el programa (el recordado o el de fábrica) maneja al abrir la etapa.
- **366 · Guía de inicio** (grupo 11): pregunta y consigna en la placa de la columna; el párrafo de la V1 en "Más sobre esta etapa".
- **367 · Editor del programa** (grupo 11): editor de texto copiado de la V1, en la columna de la zona.
- **368 · Escribir con comodidad** (grupo 11): mismo editor (resaltado por tipo de palabra, números de línea, deshacer); Tab sale del editor en la V2 (11.2).
- **369 · El programa rige mientras se escribe** (grupo 11): análisis a los 250 ms de la última tecla, como la V1.
- **370 · Errores a la vista** (grupo 11): estado y lista de errores arriba de las fichas o del texto.
- **371 · Líneas que se cumplen resaltadas** (grupo 11): marcas en el editor y en las fichas, también en la repetición.
- **372 · Paleta de palabras** (grupo 11): debajo del editor en la vista de texto.
- **373 · Indicadores del programa** (grupo 11): "Reglas N" en la cabecera del programa; distancia, superados y mejor en la banda.
- **374 · Percepción y acción con los nombres del lenguaje** (grupo 11): percepción compacta con `sensorN` y `velocidad`, y las lámparas.
- **375 · Controles del intento** (grupo 11): Pausar y Reiniciar en la banda, con espacio y R.
- **376 · Reintento automático** (grupo 11): interruptor "Reintentar solo" en "Probá esto", apagado por defecto (maqueta D).
- **377 · Programas de ejemplo** (grupo 11): la franja de programas de "Probá esto", con su cifra de superados.
- **378 · Restablecer el programa** (grupo 11): "Restablecer" con Deshacer (11.2).
- **379 · Programa recordado** (grupo 11): texto, sensores y vista en `mlLab.v2.rules.*`.
- **380 · Exportar e importar el programa** (grupo 11): botones en "Programa y tráfico"; misma lógica de la V1. No medido en el navegador (bajaría un archivo o pide elegir uno).
- **381 · Misiones** (grupo 11): nota de misión con su progreso y Mostrame (al editor o a Tráfico nuevo).
- **382 · Configuración avanzada** (grupo 11): "Sensores del auto" (de esta etapa) en Programar; la calle, en la hoja Escenario.
- **383 · Fluidez con el programa en marcha** (grupo 11): no medido aquí (el panel del navegador de esta sesión no pide cuadros); queda para la 16.2.
- **384 · Controles de la pestaña explicados** (grupo 11): tooltips en todo (auditoría en 0) y textos de la V1.
- **385 · Elegir la pista** (grupo 11): hoja Escenario.
- **386 · Ejemplos en la calle recta** (grupo 11): un ejemplo pone la calle recta; desde un circuito ofrece Deshacer.
- **387 · Ver como la máquina** (grupo 11): interruptor en "Probá esto", con su rótulo en la escena.
- **388 · Insertar un dato desde su barra** (grupo 11): cada fila de la percepción inserta su comparación (en las fichas, una ficha nueva).
- **389 · Mesa de trabajo** (grupo 11): la escena, la percepción y el editor juntos en la zona (KD1).
- **390 · Caso del choque** (grupo 11): el caso en la banda, con Compará como acción principal.
- **391 · Repetición del choque** (grupo 11): deslizador sobre la escena, con Mayús+flecha de a 10 cuadros.
- **392 · Comparar con los ejemplos** (grupo 11): la tabla sobre el editor; se calcula sola por tramos.
- **393 · Tu programa** (grupo 11): en la franja de programas cuando hay un texto propio guardado.
- **394 · Cuaderno de casos** (grupo 11): en la banda, con la guía; se oculta mientras el caso está a la vista.
- **395 · Regla para el caso** (grupo 11): "Escribir una regla para este caso" agrega la condición sin acción.
- **396 · Vista de fichas** (grupo 11): vista por defecto, copia de la de la V1.
- **397 · Ficha de regla** (grupo 11): igual que la V1; el asa mide 24 px de ancho en la V2.
- **398 · Ficha escrita a mano** (grupo 11): igual que la V1; su texto se parte en líneas en lugar de desplazar de costado.
- **399 · Editar con fichas** (grupo 11): selectores, números y deslizadores, como la V1.
- **400 · Agregar y borrar fichas** (grupo 11): como la V1.
- **401 · Reordenar fichas** (grupo 11): con Alt+↑/↓ medido; el arrastre con el mouse, no medido.
- **402 · Constantes como deslizadores** (grupo 11): como la V1.
- **403 · Fichas que se cumplen** (grupo 11): marcas de "se cumple" y "choque" en las fichas.
- **421 · Programa por líneas** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **422 · Órdenes** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **423 · Reglas** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **424 · Condiciones** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **425 · Constantes** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **426 · Datos disponibles** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **427 · Ejecución en cada instante** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **428 · Vocabulario en español y en inglés** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **429 · Errores explicados** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **430 · Errores de constantes** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **431 · Tamaño de un programa** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **432 · Cantidad de reglas** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **433 · Líneas que se cumplen** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **434 · Lenguaje sin navegador** (grupo 11): núcleo de reglas reutilizado sin cambios (`src/core/rules.js`); se ve en la etapa Reglas a mano.
- **33 · Contenido de un cerebro** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **34 · Entradas y salidas de un cerebro** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **35 · Datos de entrenamiento** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **36 · Compatibilidad con el auto** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **37 · Validación de un cerebro** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **38 · Nombre propio** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **39 · Biblioteca recordada** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **40 · Lista de cerebros** (grupo 12): lista en la hoja Cerebros, desplazable por dentro.
- **41 · Renombrar** (grupo 12): Renombrar de la biblioteca; no medido en el navegador.
- **42 · Eliminar con confirmación** (grupo 12): Eliminar con confirmación en línea; no medido en el navegador.
- **43 · Actualizar un cerebro guardado** (grupo 12): Actualizar «nombre» al seguir un cerebro guardado; medido.
- **44 · Exportar** (grupo 12): no medido en el navegador (bajaría un archivo).
- **45 · Importar** (grupo 12): medido con un archivo que no es un cerebro: aviso y la biblioteca no cambia.
- **46 · Autoguardado** (grupo 12): el autoguardado aparece en la lista al terminar una generación.
- **47 · Controles de la biblioteca explicados** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **48 · Pistas en los datos de entrenamiento** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **49 · Cerebro que aprendió imitando** (grupo 12): biblioteca compartida con la V1 (`src/ui/library.js`) y su vista copiada en la hoja Cerebros.
- **152 · Población evaluada en el mismo escenario** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **153 · Tamaño de la población** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **154 · Fin de la generación** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **155 · Eliminar a los lentos** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **156 · Pasar de generación a pedido** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **157 · Funciones de fitness** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **158 · Selección de los padres** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **159 · Élite** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **160 · Mutación** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **161 · Cruce opcional** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **162 · Tráfico por generación** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **163 · Entrenamiento reproducible** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **164 · El mejor nunca empeora con élite y mismo tráfico** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **165 · Historial de generaciones** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **166 · Campeón** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **167 · Líder** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **168 · Cambios de configuración durante el entrenamiento** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **169 · Continuar desde un cerebro** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **170 · Modo de selección** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **171 · Elegir al líder como padre** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **172 · Generación siguiente desde el padre elegido** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **173 · Sin padre elegido** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **174 · Deshacer la elección** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **175 · Padre al cambiar de modo** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **176 · Padre al continuar desde un cerebro** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **177 · Cerebro del entrenamiento** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **178 · Vehículos superados** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **179 · Escenario por defecto del entrenamiento** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **180 · Enfriamiento de la mutación** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **181 · Aprendizaje con los valores por defecto** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **182 · Pistas del entrenamiento** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **183 · Ventaja en un circuito** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **184 · Vueltas de un individuo** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **185 · Aprendizaje en el óvalo** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **186 · Reiniciar la generación en curso** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **187 · Muestra de la mutación** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **188 · Cambios que rigen en cada generación** (grupo 12): núcleo de entrenamiento reutilizado sin cambios (`src/core/training.js`); prueba de igualdad 9.2.
- **245 · Entrenamiento en marcha al abrir** (grupo 12): el entrenamiento arranca al abrir la etapa.
- **246 · Guía de inicio** (grupo 12): pregunta y consigna en la placa; el párrafo de la V1 en "Más sobre esta etapa".
- **247 · Indicadores del entrenamiento** (grupo 12): cifras de la banda: generación, en carrera, líder (con la unidad del fitness) y superados o vueltas.
- **248 · Pausa** (grupo 12): Pausar en la placa (acción principal) y espacio.
- **249 · Velocidad del entrenamiento** (grupo 12): velocidades 1× a Máx. en la banda, con T.
- **250 · Pasar a la siguiente generación** (grupo 12): Siguiente en la placa y N.
- **251 · Reiniciar el entrenamiento** (grupo 12): Reiniciar en "Vista y marcha"; empieza ya y ofrece Deshacer si había generaciones (12.3).
- **252 · Población nueva** (grupo 12): Población nueva, con Deshacer como Reiniciar.
- **253 · Curva de fitness** (grupo 12): curva con sus marcas de ajuste en la franja debajo de la escena (KD6).
- **254 · Red del líder** (grupo 12): red del líder en la franja debajo de la escena (KD6).
- **255 · Sensores del líder** (grupo 12): los rayos del líder en la escena y en su red.
- **256 · Configuración básica** (grupo 12): "Probá esto" de la hoja Entrenamiento: fitness, población y fuerza.
- **257 · Configuración avanzada** (grupo 12): hojas Evolución y Red y pista.
- **258 · Red y sensores** (grupo 12): hoja Red y pista, con la confirmación de entrenamiento nuevo flotando al pie.
- **259 · Restablecer la configuración** (grupo 12): "Restablecer ajustes" en la hoja Evolución, con su confirmación.
- **260 · Guardar el campeón** (grupo 12): hoja Cerebros: Guardar campeón o Actualizar, y Guardar como nuevo.
- **261 · Biblioteca de cerebros en la pestaña** (grupo 12): hoja Cerebros.
- **262 · Seguir entrenando un cerebro** (grupo 12): "Seguir entrenando" de la biblioteca; no medido con un cerebro guardado.
- **263 · El entrenamiento se conserva al cambiar de pestaña** (grupo 12): el estado vive en la etapa mientras la página está abierta.
- **264 · Misiones** (grupo 12): nota de misión y "Todas las misiones"; Mostrame para guardar y para el fitness.
- **265 · Controles de la pestaña explicados** (grupo 12): tooltips en todo (auditoría en 0).
- **266 · Controles de marcha agrupados** (grupo 12): Pausar y Siguiente en la placa; velocidad en la banda; Reiniciar y Población nueva en la hoja.
- **267 · Panel a la vista sin desplazarse** (grupo 12): ninguna hoja desplaza a 1366×768 en los dos idiomas.
- **268 · Avanzado por grupos** (grupo 12): grupos Quién pasa, Cómo cambian y Cada generación.
- **269 · Quién elige al padre** (grupo 12): en "Quién pasa", con el aviso de que rige desde la próxima generación.
- **270 · Elegir al líder** (grupo 12): Elegir al líder (E) en la banda.
- **271 · Deshacer la elección** (grupo 12): Deshacer (Z) en la banda, oculto sin elección.
- **272 · Estado del padre elegido** (grupo 12): renglón del padre en la banda.
- **273 · Ajustes que no aplican con selección manual** (grupo 12): élite, selección, cruce y enfriar se ocultan con selección manual (antes, deshabilitados).
- **274 · Selección manual explicada** (grupo 12): consigna y guía propias de la selección manual.
- **275 · Funciones de fitness a elegir** (grupo 12): las cuatro funciones en "Probá esto", con la definición de fitness.
- **276 · Valores de ventaja con su unidad** (grupo 12): cifras con la unidad del fitness elegido.
- **277 · Pistas del entrenamiento** (grupo 12): la pista del escenario compartido es la pista del entrenamiento (hoja Red y pista).
- **278 · Generación en un circuito** (grupo 12): en el óvalo, vueltas del líder y sin modo de tráfico.
- **279 · Ver como la máquina** (grupo 12): interruptor en "Vista y marcha".
- **280 · Vistas del panel** (grupo 12): las tres vistas del panel pasan a cuatro hojas del cuaderno, recordadas.
- **281 · Cambios pendientes a la vista** (grupo 12): avisos de cambios pendientes en Probá esto y en Evolución.
- **282 · Textos de la pestaña coherentes** (grupo 12): textos de la V1 copiados tal cual.
- **283 · Corte de generación** (grupo 12): medido en las capturas de Chrome sin ventana (en el panel oculto de esta sesión no aparece, como en la V1 con la página oculta).
- **284 · Tarjeta de generación** (grupo 12): tarjeta del corte con la élite contada, en las capturas.
- **285 · La mutación en la red** (grupo 12): la muestra del hijo en la red durante el corte, en las capturas.
- **286 · Cambios marcados en la curva** (grupo 12): curva copiada de la V1 con sus marcas.
- **287 · Vista previa de la mutación** (grupo 12): vista previa al mover la fuerza de mutación.
- **22 · Carrera de varios competidores** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **23 · Meta de la carrera** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **24 · Chocar no saca de la carrera** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **25 · Protegido al reaparecer** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **26 · Un vehículo choca una sola vez** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **27 · Competidor que no avanza** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **28 · Fin de la carrera** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **29 · Resultado de cada competidor** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **30 · Mejor vuelta** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **31 · Orden de la carrera** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **32 · Carrera reproducible** (grupo 13): núcleo de la carrera reutilizado sin cambios (`src/core/race.js`); medido una carrera completa en la etapa Evaluar.
- **196 · Carrera lista al abrir** (grupo 13): la carrera se arma al abrir la etapa, con "Vos", el programa de Reglas y un ejemplo.
- **197 · Guía de inicio** (grupo 13): pregunta y consigna en la placa; el párrafo de la V1 en "Más sobre esta etapa".
- **198 · Elegir a los competidores** (grupo 13): hoja Competidores: la lista de los que corren, con quitar.
- **199 · Agregar competidores** (grupo 13): "Agregar" abre el selector (copia del de la V1); no medido abrir el selector en el navegador.
- **200 · Sensores de cada competidor** (grupo 13): botón 👁 por competidor, con nombre accesible.
- **201 · Tu programa como competidor** (grupo 13): el programa recordado de Reglas a mano de la V2 corre como competidor (medido: "7 sensores").
- **202 · Programas de ejemplo como competidores** (grupo 13): ejemplos de la V1 como competidores.
- **203 · Vos como competidor** (grupo 13): "Vos" maneja con las flechas; medido quitarlo y volver a agregarlo.
- **204 · Cuenta regresiva al largar** (grupo 13): medido: Largar con "Vos" muestra 3, 2, 1 y arranca; el botón queda deshabilitado mientras cuenta.
- **205 · Controles de la carrera** (grupo 13): en la placa: Largar (solo antes de la carrera, KD11), Pausar/Reanudar u Otra carrera; Reiniciar y Otra carrera al lado.
- **206 · Chocar y seguir** (grupo 13): lógica de la carrera sin cambios.
- **207 · Meta y espera** (grupo 13): aviso de la espera en la escena y en el tiempo de las cifras.
- **208 · Tráfico de la carrera** (grupo 13): "Tráfico de la carrera" en la hoja Carrera; oculto en un circuito.
- **209 · Barra de escenario en Competir** (grupo 13): hoja Escenario (escenario compartido, irregularidad "de esta etapa").
- **210 · Meta configurable** (grupo 13): "Distancia" o "Vueltas" en la hoja Carrera, por pista.
- **211 · Panel sin desplazamiento lateral** (grupo 13): el cuaderno no desplaza de costado.
- **212 · Indicadores de la carrera** (grupo 13): tiempo, meta y primero (o ganador) en la cabecera del marcador.
- **213 · Marcador de la carrera** (grupo 13): marcador en la banda, debajo de la escena.
- **214 · Seguir a un competidor** (grupo 13): el nombre en el marcador es un botón para seguir (medido).
- **215 · Tabla por pista** (grupo 13): tabla por pista en la banda, con "practicó" y "no la vio".
- **216 · Dónde entrenó cada cerebro** (grupo 13): en la hoja Competidores, "Calle + Óvalo" junto al nombre.
- **217 · Resultado de la calle con su tráfico** (grupo 13): el tráfico ("nuevo" o "de práctica") delante del resultado de la calle.
- **218 · Misiones** (grupo 13): nota de misión con Mostrame (a la pista o a Largar).
- **219 · La carrera se conserva al cambiar de pestaña** (grupo 13): al cambiar de etapa la carrera queda en pausa y se retoma.
- **220 · Pestaña a la vista sin desplazarse** (grupo 13): escena, placa, marcador y tabla a la vista a 1366×768.
- **221 · Controles de la pestaña explicados** (grupo 13): tooltips en todo (auditoría en 0).
- **222 · Cerebros que aprendieron imitando** (grupo 13): los marca la lógica de la V1 (competitors.js).
- **223 · Marcador y tabla sin cortes** (grupo 13): el ganador se parte en dos renglones en lugar de cortarse.
- **224 · Botones de solo ícono con nombre** (grupo 13): 👁 y ✕ con aria-label con el nombre.
- **225 · Panel a la vista en 1366×768** (grupo 13): ninguna hoja desplaza a 1366×768.
- **82 · Cuenta desglosada** (grupo 14): lógica sin DOM reutilizada; la tarjeta de la neurona es la copia de la V1 en la hoja Neurona.
- **83 · Recorrido paso a paso** (grupo 14): lógica sin DOM reutilizada; la tarjeta de la neurona es la copia de la V1 en la hoja Neurona.
- **84 · Cambios de prueba** (grupo 14): lógica sin DOM reutilizada; la tarjeta de la neurona es la copia de la V1 en la hoja Neurona.
- **85 · Cambios que se deshacen** (grupo 14): lógica sin DOM reutilizada; la tarjeta de la neurona es la copia de la V1 en la hoja Neurona.
- **86 · Cuenta reproducible y sin navegador** (grupo 14): lógica sin DOM reutilizada; la tarjeta de la neurona es la copia de la V1 en la hoja Neurona.
- **87 · De dónde viene lo que recibe una neurona** (grupo 14): lógica sin DOM reutilizada; la tarjeta de la neurona es la copia de la V1 en la hoja Neurona.
- **88 · Respuesta de una neurona a una entrada** (grupo 14): lógica sin DOM reutilizada; la tarjeta de la neurona es la copia de la V1 en la hoja Neurona.
- **113 · Dos vistas de la misma red** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **114 · Actividad en el momento** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **115 · Paso animado** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **116 · Elegir una neurona o una conexión** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **117 · Capas resumidas** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **118 · Conexiones más importantes** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **119 · Acercar y moverse** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **120 · Marcas de lo apagado y lo cambiado** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **121 · Redes grandes en el inspector** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **122 · Inspector accesible** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **123 · La vuelta en la red** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **124 · Vuelta animada** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **125 · Estado sin nada elegido** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **126 · Conexiones siempre visibles** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **127 · Neuronas que usan el espacio** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **128 · Neurona por dentro** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **129 · Vista previa al posar el cursor** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **130 · Números sobre las conexiones** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **131 · Cambiar un peso en el lugar** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **132 · De dónde viene una neurona** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **133 · Flujo de la señal** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **134 · Pocos colores con significado** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **135 · Mapa dentro de la neurona** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **136 · Perillas de pesos y sesgos sobre la red** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **137 · Perillas de las entradas** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **138 · Lo que titubea, quieto** (grupo 14): el inspector de la V1 sin cambios (`src/render/network-inspector.js`), en la zona de la escena de Entender.
- **288 · Lista para mirar al abrir** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **289 · La red en el centro** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **290 · Escena del auto en segundo plano** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **291 · Elegir el cerebro** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **292 · Barra de reproducción junto a la red** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **293 · Ritmo de la reproducción** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **294 · Avance paso a paso** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **295 · Operación en curso** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **296 · Tarjeta de la neurona** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **297 · Decisión de la red** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **298 · Entradas a mano** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **299 · Apagar una parte de la red** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **300 · Cambiar pesos y sesgos** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **301 · Deshacer y restablecer la red** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **302 · Vista de la red a la vista** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **303 · Guía, leyenda y misiones** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **304 · Estado conservado** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **305 · Atajos de la pestaña** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **306 · Pestaña a la vista sin desplazarse** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **307 · Controles explicados y accesibles** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **308 · Detalle de una conexión** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **309 · Panel sin nada elegido** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **310 · Comparar con el original** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **311 · Flujo de la señal en Inspeccionar** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **312 · Curva de respuesta** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **313 · La tarjeta sigue la cuenta de a una operación** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **314 · La entrada que se lee, en la escena** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **315 · Manejar vos** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **316 · Tu decisión y la de la red** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **317 · Devolver el volante** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **318 · Caso del choque en Inspeccionar** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **319 · Repetición del choque en Inspeccionar** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **320 · Reintentar desde un cuadro** (grupo 14): copia de la pestaña de la V1 con la misma conducta; la red en la zona de la escena, el auto en la viñeta, la reproducción en la banda y el panel en las hojas Neurona y Etapa (medido en el navegador: elegir, apagar, cambiar pesos con deshacer, paso por operación, vista de pesos, manejar vos y caso del choque).
- **518 · Diagrama por capas** (grupo 14): la vista de la red de la V1 (diagrama y pesos, flujo, filtros, acercar) en la zona de la escena de Entender.
- **519 · Entradas y salidas con nombre** (grupo 14): la vista de la red de la V1 (diagrama y pesos, flujo, filtros, acercar) en la zona de la escena de Entender.
- **520 · Pesos visibles** (grupo 14): la vista de la red de la V1 (diagrama y pesos, flujo, filtros, acercar) en la zona de la escena de Entender.
- **521 · Sesgos visibles** (grupo 14): la vista de la red de la V1 (diagrama y pesos, flujo, filtros, acercar) en la zona de la escena de Entender.
- **522 · Actividad en vivo** (grupo 14): la vista de la red de la V1 (diagrama y pesos, flujo, filtros, acercar) en la zona de la escena de Entender.
- **523 · Colores propios y constantes** (grupo 14): la vista de la red de la V1 (diagrama y pesos, flujo, filtros, acercar) en la zona de la escena de Entender.
- **524 · Redes grandes** (grupo 14): la vista de la red de la V1 (diagrama y pesos, flujo, filtros, acercar) en la zona de la escena de Entender.
- **525 · Diagrama solo de lectura** (grupo 14): la vista de la red de la V1 (diagrama y pesos, flujo, filtros, acercar) en la zona de la escena de Entender.
- **526 · Diagrama que ocupa su zona** (grupo 14): la vista de la red de la V1 (diagrama y pesos, flujo, filtros, acercar) en la zona de la escena de Entender.
- **89 · Puntos de dos colores** (grupo 15): núcleo reutilizado sin cambios (`src/core/datasets.js`); se ve en los tres experimentos de Por gradiente.
- **90 · Ejemplos de manejo** (grupo 15): núcleo reutilizado sin cambios (`src/core/datasets.js`); se ve en los tres experimentos de Por gradiente.
- **91 · Maestro** (grupo 15): núcleo reutilizado sin cambios (`src/core/datasets.js`); se ve en los tres experimentos de Por gradiente.
- **92 · Apartar ejemplos** (grupo 15): núcleo reutilizado sin cambios (`src/core/datasets.js`); se ve en los tres experimentos de Por gradiente.
- **93 · Resumen de los datos** (grupo 15): núcleo reutilizado sin cambios (`src/core/datasets.js`); se ve en los tres experimentos de Por gradiente.
- **94 · Ejemplos evaluados** (grupo 15): núcleo reutilizado sin cambios (`src/core/datasets.js`); se ve en los tres experimentos de Por gradiente.
- **95 · Compuertas lógicas** (grupo 15): núcleo reutilizado sin cambios (`src/core/datasets.js`); se ve en los tres experimentos de Por gradiente.
- **321 · Disposición del Laboratorio** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **322 · Elegir los datos** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **323 · Plano de puntos** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **324 · Reproducción del aprendizaje** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **325 · Un ejemplo, paso a paso** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **326 · Operación en curso del aprendizaje** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **327 · Ejemplo en curso** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **328 · Curvas de aprendizaje** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **329 · Ejemplos apartados y sobreajuste** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **330 · Armar la red** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **331 · Tasa de aprendizaje** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **332 · Empezar de nuevo** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **333 · Aprender a manejar imitando** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **334 · Grabar tu propio manejo** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **335 · Guardar lo aprendido como cerebro** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **336 · Tabla de datos** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **337 · Cambiar la red a mano** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **338 · Deshacer y restablecer los cambios a mano** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **339 · Guía y misiones del Laboratorio** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **340 · Estado conservado en el Laboratorio** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **341 · Atajos del Laboratorio** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **342 · Controles del Laboratorio explicados y accesibles** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **343 · Qué detecta cada neurona** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **344 · Panel del Laboratorio con algo elegido** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **345 · Filtro de conexiones en el Laboratorio** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **346 · Detalle de una conexión en el Laboratorio** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **347 · Historia de un peso** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **348 · Lo que el Laboratorio no usa de la vista** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **349 · La espiral se puede aprender** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **350 · Punto de prueba en el plano** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **351 · La red muestra el punto de prueba** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **352 · Compuertas al abrir** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **353 · Nada aprende sin pedirlo** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **354 · Tabla de verdad** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **355 · Plano de las compuertas** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **356 · Elegir la compuerta** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **357 · Perillas en la red del Laboratorio** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **358 · Se ve en el momento si va mejor** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **359 · XOR no se separa con una recta** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **360 · De la mano a backpropagation** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **361 · Ver una solución** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **362 · Cada clase de datos con lo suyo** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **363 · Textos de las compuertas** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **364 · A mano primero en Compuertas** (grupo 15): copia de la pestaña de la V1 con la misma conducta, ubicada según la maqueta aprobada (15.1): la red en la zona de la escena; la placa con los tres experimentos y los datos al costado; el ejemplo y las curvas debajo de la red; la reproducción en la banda; y las hojas Etapa, Datos, Red y Aprendizaje (medido en el navegador: compuertas, solución, aprender de a épocas en Puntos, elegir una neurona, grabar tu manejo, imitar y guardar como cerebro).
- **435 · Respuesta suave** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **436 · Error de un ejemplo** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **437 · Culpa de cada neurona** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **438 · Corrección de los pesos** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **439 · La corrección achica el error** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **440 · Una época** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **441 · Recorrido paso a paso del aprendizaje** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **442 · Aprender con partes apagadas** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **443 · Cambios a mano durante el aprendizaje** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **444 · Valores de cada neurona sobre una grilla** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **445 · Historia de los pesos** (grupo 15): núcleo reutilizado sin cambios (`src/core/backprop.js`); medido aprender de a épocas en Puntos (20 épocas, 99 % de aciertos en práctica).
- **1 · Atajos de una tecla desactivables** (grupo 16): atajos de una tecla desactivables (interruptor "Atajos"), foco visible, objetivos de al menos 24 px (auditoría en 0) y textos alternativos; ver la auditoría de la tarea 16.3.
- **2 · Límites de los controles con contraste** (grupo 16): atajos de una tecla desactivables (interruptor "Atajos"), foco visible, objetivos de al menos 24 px (auditoría en 0) y textos alternativos; ver la auditoría de la tarea 16.3.
- **3 · Tamaño mínimo de los controles** (grupo 16): atajos de una tecla desactivables (interruptor "Atajos"), foco visible, objetivos de al menos 24 px (auditoría en 0) y textos alternativos; ver la auditoría de la tarea 16.3.
- **4 · Escenario descrito en texto** (grupo 16): atajos de una tecla desactivables (interruptor "Atajos"), foco visible, objetivos de al menos 24 px (auditoría en 0) y textos alternativos; ver la auditoría de la tarea 16.3.
- **5 · Sin destellos** (grupo 16): atajos de una tecla desactivables (interruptor "Atajos"), foco visible, objetivos de al menos 24 px (auditoría en 0) y textos alternativos; ver la auditoría de la tarea 16.3.
- **6 · Tooltip en todo control** (grupo 16): tooltips de la V2 (`components/tooltip.js`) con qué hace y por qué importa, el punto constante en cada control y el interruptor "Ayudas"; auditoría de tooltips en 0.
- **7 · Aparición y cierre del tooltip** (grupo 16): tooltips de la V2 (`components/tooltip.js`) con qué hace y por qué importa, el punto constante en cada control y el interruptor "Ayudas"; auditoría de tooltips en 0.
- **8 · Ubicación del tooltip** (grupo 16): tooltips de la V2 (`components/tooltip.js`) con qué hace y por qué importa, el punto constante en cada control y el interruptor "Ayudas"; auditoría de tooltips en 0.
- **9 · Tooltips en el idioma activo** (grupo 16): tooltips de la V2 (`components/tooltip.js`) con qué hace y por qué importa, el punto constante en cada control y el interruptor "Ayudas"; auditoría de tooltips en 0.
- **10 · Controles no disponibles explicados** (grupo 16): tooltips de la V2 (`components/tooltip.js`) con qué hace y por qué importa, el punto constante en cada control y el interruptor "Ayudas"; auditoría de tooltips en 0.
- **11 · Lenguaje llano** (grupo 16): tooltips de la V2 (`components/tooltip.js`) con qué hace y por qué importa, el punto constante en cada control y el interruptor "Ayudas"; auditoría de tooltips en 0.
- **12 · Apretar un control sin acción lo explica** (grupo 16): tooltips de la V2 (`components/tooltip.js`) con qué hace y por qué importa, el punto constante en cada control y el interruptor "Ayudas"; auditoría de tooltips en 0.
- **13 · Tooltips con las ayudas apagadas** (grupo 16): tooltips de la V2 (`components/tooltip.js`) con qué hace y por qué importa, el punto constante en cada control y el interruptor "Ayudas"; auditoría de tooltips en 0.
- **14 · Barra de escenario** (grupo 16): la hoja Escenario del cuaderno (escenario compartido, D7), con los valores fijados "de esta etapa" (grupo 9).
- **15 · Pista en la barra** (grupo 16): la hoja Escenario del cuaderno (escenario compartido, D7), con los valores fijados "de esta etapa" (grupo 9).
- **16 · Cambios del escenario en el momento** (grupo 16): la hoja Escenario del cuaderno (escenario compartido, D7), con los valores fijados "de esta etapa" (grupo 9).
- **17 · Ajustes de tráfico en un circuito** (grupo 16): la hoja Escenario del cuaderno (escenario compartido, D7), con los valores fijados "de esta etapa" (grupo 9).
- **18 · Restablecer el escenario** (grupo 16): la hoja Escenario del cuaderno (escenario compartido, D7), con los valores fijados "de esta etapa" (grupo 9).
- **19 · Barra explicada y accesible** (grupo 16): la hoja Escenario del cuaderno (escenario compartido, D7), con los valores fijados "de esta etapa" (grupo 9).
- **20 · Grupo que no aplica en una pestaña** (grupo 16): la hoja Escenario del cuaderno (escenario compartido, D7), con los valores fijados "de esta etapa" (grupo 9).
- **21 · Grupo propio de una pestaña** (grupo 16): la hoja Escenario del cuaderno (escenario compartido, D7), con los valores fijados "de esta etapa" (grupo 9).
- **50 · Cuatro cerebros incluidos** (grupo 16): cerebros de ejemplo de la V1 (`src/data/example-brains.js`) sin cambios, en Evaluar, Entender y Por gradiente.
- **51 · Ejemplos que no cambian** (grupo 16): cerebros de ejemplo de la V1 (`src/data/example-brains.js`) sin cambios, en Evaluar, Entender y Por gradiente.
- **52 · Ejemplos que se pueden regenerar** (grupo 16): cerebros de ejemplo de la V1 (`src/data/example-brains.js`) sin cambios, en Evaluar, Entender y Por gradiente.
- **53 · Lo que muestran los ejemplos** (grupo 16): cerebros de ejemplo de la V1 (`src/data/example-brains.js`) sin cambios, en Evaluar, Entender y Por gradiente.
- **54 · Tarjeta al principio del panel** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **55 · Consigna** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **56 · Acción principal en la tarjeta** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **57 · Misión en curso** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **58 · Tarjeta con la guía apagada** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **59 · Tarjeta al elegir en Inspeccionar y en el Laboratorio** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **60 · Tarjeta accesible** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **61 · Texto de guía plegado** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **62 · Mostrar el control de la misión** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **63 · Controles de las misiones de El problema** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **64 · Controles de las misiones de Reglas a mano** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **65 · Controles de las misiones de Entrenar** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **66 · Controles de las misiones de Competir** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **67 · Controles de las misiones de Inspeccionar** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **68 · Controles de las misiones de compuertas del Laboratorio** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **69 · Controles de las misiones de puntos y tu manejo del Laboratorio** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **70 · Cómo se muestra un control** (grupo 16): la placa de cada etapa (pregunta y consigna) y la nota de misión con "Mostrame" en la primera hoja (grupos 8 y 10 a 15).
- **71 · Contrato único de controlador** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **72 · Contenido de la percepción** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **73 · Controles contradictorios** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **74 · Controlador de teclado** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **75 · El teclado no interfiere con la página** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **76 · Controlador de red neuronal** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **77 · Red que no corresponde a la percepción** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **78 · Controlador de reglas** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **79 · Programa que no corresponde al auto** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **80 · Controlador con observador** (grupo 16): contrato de controladores reutilizado sin cambios (`src/core/controller.js` y afines).
- **81 · Volante suave** (grupo 16): quitada: el volante suave salió de las specs; decisión del dueño: el volante es el actual (`volante-directo`, tarea 6.2). Confirmada por el dueño el 19 de noviembre de 2026 ("Sí, decididas").
- **96 · Pestañas del recorrido** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **97 · Lista para usar al abrir** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **98 · Disposición común** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **99 · Panel ajustable** (grupo 16): decisión del dueño: eligió la maqueta D (tarea 6.1), que fija las zonas; plegar el cuaderno reemplaza al panel ajustable. Confirmada por el dueño el 19 de noviembre de 2026 ("Sí, decididas").
- **100 · Preferencias recordadas** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **101 · Créditos** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **102 · Aviso en pantallas angostas** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **103 · Errores en lenguaje humano** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **104 · Biblioteca de cerebros compartida** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **105 · Una sola pestaña en marcha** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **106 · Escenario ajustable** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **107 · Anchos que se adaptan a la ventana** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **108 · Disposición en ventanas medianas** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **109 · Orden común del panel** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **110 · Interruptor de guía sin tooltips** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **111 · Interruptor de ayudas** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **112 · Disposición de Reglas a mano** (grupo 16): armazón de la V2: riel de etapas, barra de arriba, cuaderno plegable, preferencias `mlLab.v2.*` y biblioteca compartida (grupo 7).
- **139 · Dos idiomas completos** (grupo 16): motor de idiomas de la V1 con diccionarios propios de la V2 en español e inglés, mismas claves (prueba `tests/v2/i18n.test.js`) y cambio en vivo.
- **140 · Selector de idioma** (grupo 16): motor de idiomas de la V1 con diccionarios propios de la V2 en español e inglés, mismas claves (prueba `tests/v2/i18n.test.js`) y cambio en vivo.
- **141 · Cambio de idioma en vivo** (grupo 16): motor de idiomas de la V1 con diccionarios propios de la V2 en español e inglés, mismas claves (prueba `tests/v2/i18n.test.js`) y cambio en vivo.
- **142 · Idioma inicial** (grupo 16): motor de idiomas de la V1 con diccionarios propios de la V2 en español e inglés, mismas claves (prueba `tests/v2/i18n.test.js`) y cambio en vivo.
- **143 · Texto faltante** (grupo 16): motor de idiomas de la V1 con diccionarios propios de la V2 en español e inglés, mismas claves (prueba `tests/v2/i18n.test.js`) y cambio en vivo.
- **144 · Números según el idioma** (grupo 16): motor de idiomas de la V1 con diccionarios propios de la V2 en español e inglés, mismas claves (prueba `tests/v2/i18n.test.js`) y cambio en vivo.
- **145 · Cinco estilos con un significado cada uno** (grupo 16): una sola acción principal por pantalla (auditoría de la V2 en 0) y los cuatro niveles de botón del grupo 8.
- **146 · La salida de la red no parece botón** (grupo 16): una sola acción principal por pantalla (auditoría de la V2 en 0) y los cuatro niveles de botón del grupo 8.
- **147 · Una sola acción principal a la vista** (grupo 16): una sola acción principal por pantalla (auditoría de la V2 en 0) y los cuatro niveles de botón del grupo 8.
- **148 · La marcha es la acción principal** (grupo 16): una sola acción principal por pantalla (auditoría de la V2 en 0) y los cuatro niveles de botón del grupo 8.
- **149 · Estados que cambian la acción principal** (grupo 16): una sola acción principal por pantalla (auditoría de la V2 en 0) y los cuatro niveles de botón del grupo 8.
- **150 · Guardar no compite con la marcha** (grupo 16): una sola acción principal por pantalla (auditoría de la V2 en 0) y los cuatro niveles de botón del grupo 8.
- **151 · Opciones elegidas con un mismo aspecto** (grupo 16): una sola acción principal por pantalla (auditoría de la V2 en 0) y los cuatro niveles de botón del grupo 8.
- **189 · Paisaje de la calle** (grupo 16): el paisaje de la V1 (`render/scenery`) sin cambios; el botón "Paisaje" de la cámara, recordado en `mlLab.v2.scenery`.
- **190 · Paisaje de los circuitos** (grupo 16): el paisaje de la V1 (`render/scenery`) sin cambios; el botón "Paisaje" de la cámara, recordado en `mlLab.v2.scenery`.
- **191 · Paisaje solo estético** (grupo 16): el paisaje de la V1 (`render/scenery`) sin cambios; el botón "Paisaje" de la cámara, recordado en `mlLab.v2.scenery`.
- **192 · Paisaje reproducible** (grupo 16): el paisaje de la V1 (`render/scenery`) sin cambios; el botón "Paisaje" de la cámara, recordado en `mlLab.v2.scenery`.
- **193 · Colores del paisaje** (grupo 16): el paisaje de la V1 (`render/scenery`) sin cambios; el botón "Paisaje" de la cámara, recordado en `mlLab.v2.scenery`.
- **194 · Mostrar u ocultar el paisaje** (grupo 16): el paisaje de la V1 (`render/scenery`) sin cambios; el botón "Paisaje" de la cámara, recordado en `mlLab.v2.scenery`.
- **195 · Paisaje fluido** (grupo 16): el paisaje de la V1 (`render/scenery`) sin cambios; el botón "Paisaje" de la cámara, recordado en `mlLab.v2.scenery`.
- **404 · Pista definida por línea central, ancho y carriles** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **405 · Calle recta de 2, 3 o 4 carriles** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **406 · Bordes de la pista** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **407 · Centro de carril** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **408 · Progreso sobre la pista** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **409 · Pista cerrada** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **410 · Progreso por vueltas** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **411 · Catálogo de circuitos** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **412 · Circuitos manejables** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **413 · Nombres de las pistas** (grupo 16): pistas y circuitos del núcleo sin cambios (`src/core/circuits.js`), en la hoja Escenario.
- **414 · Estructura por capas** (grupo 16): núcleo de la red reutilizado sin cambios (`src/core/network.js`).
- **415 · Cálculo de las salidas** (grupo 16): núcleo de la red reutilizado sin cambios (`src/core/network.js`).
- **416 · Salidas sí/no** (grupo 16): núcleo de la red reutilizado sin cambios (`src/core/network.js`).
- **417 · Activación de las capas ocultas** (grupo 16): núcleo de la red reutilizado sin cambios (`src/core/network.js`).
- **418 · Inicialización reproducible** (grupo 16): núcleo de la red reutilizado sin cambios (`src/core/network.js`).
- **419 · Valores de todas las neuronas** (grupo 16): núcleo de la red reutilizado sin cambios (`src/core/network.js`).
- **420 · Cálculo sin efectos** (grupo 16): núcleo de la red reutilizado sin cambios (`src/core/network.js`).
- **446 · Rayos distribuidos en un abanico** (grupo 16): sensores del núcleo sin cambios (`src/core/sensors.js`), con sus ajustes en Reglas a mano y en Aprender por evolución.
- **447 · Lectura normalizada** (grupo 16): sensores del núcleo sin cambios (`src/core/sensors.js`), con sus ajustes en Reglas a mano y en Aprender por evolución.
- **448 · Obstáculos detectados** (grupo 16): sensores del núcleo sin cambios (`src/core/sensors.js`), con sus ajustes en Reglas a mano y en Aprender por evolución.
- **449 · Orden estable de las lecturas** (grupo 16): sensores del núcleo sin cambios (`src/core/sensors.js`), con sus ajustes en Reglas a mano y en Aprender por evolución.
- **450 · Configuración de los sensores** (grupo 16): sensores del núcleo sin cambios (`src/core/sensors.js`), con sus ajustes en Reglas a mano y en Aprender por evolución.
- **451 · Avance en pasos fijos** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **452 · Resultado reproducible** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **453 · Ejecución sin navegador** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **454 · Aceleración y velocidad máxima** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **455 · Velocidad máxima configurable** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **456 · Fricción** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **457 · Giro** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **458 · Choque** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **459 · Reinicio** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **460 · Pausa** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **461 · Sacar un auto de carrera** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **462 · Varios autos en un mismo mundo** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **463 · Los autos no chocan entre sí** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **464 · Un auto se comporta igual solo o acompañado** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **465 · Reproducibilidad con varios autos** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **466 · Reinicio con varios autos** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **467 · Velocidad de simulación** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **468 · Mundo sobre un circuito** (grupo 16): núcleo de la simulación reutilizado sin cambios (`src/core/world.js` y afines); prueba de igualdad 9.2.
- **469 · Escala tipográfica acotada** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **470 · Tres alturas de control** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **471 · Espaciado en pasos** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **472 · Superficies con nombre** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **473 · Un color, un significado** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **474 · Cuatro roles con un color y una forma** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **475 · Rótulos de rol** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **476 · Estado "se cumple"** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **477 · Estado "error"** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **478 · Estado "choque"** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **479 · Deslizadores de la app** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **480 · El sistema no cambia el comportamiento** (grupo 16): tokens propios de la V2 (`styles/v2/tokens.css`, maqueta D) y componentes del grupo 8; las auditorías de la V2 dan 0.
- **481 · Zona de tablero** (grupo 16): la banda de cada etapa (cifras, percepción y acción) y la franja de la red y la curva (grupos 10 a 15).
- **482 · Renglón de indicadores** (grupo 16): la banda de cada etapa (cifras, percepción y acción) y la franja de la red y la curva (grupos 10 a 15).
- **483 · Tarjetas del tablero** (grupo 16): la banda de cada etapa (cifras, percepción y acción) y la franja de la red y la curva (grupos 10 a 15).
- **484 · Las tarjetas se reparten el alto** (grupo 16): la banda de cada etapa (cifras, percepción y acción) y la franja de la red y la curva (grupos 10 a 15).
- **485 · Renglones de ayuda** (grupo 16): la banda de cada etapa (cifras, percepción y acción) y la franja de la red y la curva (grupos 10 a 15).
- **486 · Tarjetas operables con el teclado** (grupo 16): la banda de cada etapa (cifras, percepción y acción) y la franja de la red y la curva (grupos 10 a 15).
- **487 · Tablero explicado** (grupo 16): la banda de cada etapa (cifras, percepción y acción) y la franja de la red y la curva (grupos 10 a 15).
- **488 · Tarjeta con editor** (grupo 16): la banda de cada etapa (cifras, percepción y acción) y la franja de la red y la curva (grupos 10 a 15).
- **489 · Tráfico reproducible** (grupo 16): tráfico del núcleo sin cambios (`src/core/traffic.js`), con densidad e irregularidad en la hoja Escenario.
- **490 · Tráfico siempre superable** (grupo 16): tráfico del núcleo sin cambios (`src/core/traffic.js`), con densidad e irregularidad en la hoja Escenario.
- **491 · Densidad configurable** (grupo 16): tráfico del núcleo sin cambios (`src/core/traffic.js`), con densidad e irregularidad en la hoja Escenario.
- **492 · Irregularidad configurable** (grupo 16): tráfico del núcleo sin cambios (`src/core/traffic.js`), con densidad e irregularidad en la hoja Escenario.
- **493 · Cambio de configuración en marcha** (grupo 16): tráfico del núcleo sin cambios (`src/core/traffic.js`), con densidad e irregularidad en la hoja Escenario.
- **494 · Movimiento del tráfico** (grupo 16): tráfico del núcleo sin cambios (`src/core/traffic.js`), con densidad e irregularidad en la hoja Escenario.
- **495 · Tráfico sin fin** (grupo 16): tráfico del núcleo sin cambios (`src/core/traffic.js`), con densidad e irregularidad en la hoja Escenario.
- **496 · Dibujo del escenario** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **497 · Colores con significado constante** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **498 · Sensores visibles** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **499 · Cámara que sigue al auto** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **500 · Zoom** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **501 · Paneo** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **502 · Restablecer la vista** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **503 · Controles de cámara explicados** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **504 · Adaptación al tamaño de la ventana** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **505 · Fluidez** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **506 · Dibujo de una población** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **507 · Marca de la élite** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **508 · Seguimiento del líder** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **509 · Fluidez con una población** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **510 · Dibujo de un circuito** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **511 · Circuito entero a la vista** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **512 · Fluidez en un circuito** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **513 · Competidores distinguibles** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **514 · Meta a la vista** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **515 · Fluidez en una carrera** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **516 · Escena chica** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
- **517 · Rayos que se mueven a mano** (grupo 16): la vista de la escena de la V1 (`src/render/view.js`, `createStageView`) sin cambios, con sus controles de cámara, en todas las etapas con auto (grupos 10 a 15).
