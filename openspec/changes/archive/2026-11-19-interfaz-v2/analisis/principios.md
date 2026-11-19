# Principios de diseño de la V2

Doce principios para la V2. Cada uno cita lo que lo justifica: los puntos de quiebre a ciegas (Q1–Q12) y la arquitectura de la Parte 1, y los hallazgos de la V1 de la Parte 2 (T, E, R, N, C, I, L, la tabla de medidas 2.1 y la auditoría 2.5), todos en `informe.md`. Cada principio dice también a qué artículo de la constitución sirve. Los principios son **[Propuesta]**; la evidencia lleva su propio rótulo en el informe.

Sirven para tres cosas: orientar las tres maquetas (todas los cumplen, cada una a su manera), criticarlas (4.8) y compararlas (`comparacion.md`).

---

### 1. Primero la pregunta

Cada pantalla abre con la pregunta de la etapa ("¿Podés programarlo vos?") y una consigna de una frase. Nada queda arriba de ellas: ni la barra del escenario ni los ajustes.

- **Evidencia:** T1 (la barra del escenario está arriba de todo en las seis pestañas, y la pregunta no aparece en ninguna); C3; Q1; la tabla de 1.4.
- **Constitución:** Art. 13 (consigna antes que ajustes) y la cadena de preguntas del ADN.

### 2. La escena manda

En las etapas con auto, la escena es la zona más grande: al menos el 40 % de la ventana a 1366×768. En Entender y Reglas a mano comparte el protagonismo, sin bajar de un tercio del ancho.

- **Evidencia:** T2 y la tabla 2.1 [Medido]: hoy, entre el 14,5 % (Reglas) y el 24,7 % (El problema y Competir) de la ventana a 1366×768. A 800×600, 80 px de ancho en Reglas (R2) y 42 px de alto en Entrenar (N5).
- **Constitución:** Art. 2 (mostrar antes que explicar) y Art. 10 (la animación es parte de la experiencia).

### 3. Un mismo esqueleto en todas las etapas

Las zonas (pregunta, objeto, acción, ajustes y guía) están en el mismo lugar en todas las etapas. Lo que cambia es el contenido, no el plano.

- **Evidencia:** T3 (cuatro disposiciones distintas en seis pestañas); I1 (Inspeccionar ya se alineó y mejoró).
- **Constitución:** Art. 9 (consistencia).

### 4. Una acción principal, la que pide la consigna

Una sola acción principal a la vista, y es la que pide la consigna. Si la consigna es manipular (manejar, escribir, arrastrar), eso es lo destacado y ningún botón compite con ello.

- **Evidencia:** P1 resuelto [Medido]: una sola acción principal en 33 de 36 vistas. E1 y R3: en El problema y en Reglas a mano, la acción principal es "Pausar" mientras la consigna pide manejar o escribir. L2 lo hace bien. I4: a 800×600 no se ve ninguna.
- **Constitución:** Art. 13.

### 5. Un ajuste, un lugar, tres niveles

Cada ajuste vive en un solo lugar de la etapa: "Probá esto" (a lo sumo tres, a la vista), "Más" y "Avanzado" (plegado y recordado). La marcha no se mueve al cambiar de nivel.

- **Evidencia:** N2 (Entrenar reparte sus ajustes en tres lugares, más Cerebros); P3 "cambió"; Q4 y Q8; 71 controles en Reglas a mano y 98 en Inspeccionar (tabla 2.1).
- **Constitución:** Art. 4 (lo avanzado va colapsado) y Art. 6 (lo del mentor no abruma).

### 6. Un escenario, rotulado cuando cambia

La pista, el tráfico y el auto son uno solo para todo el recorrido. Lo que una etapa fija para su concepto se rotula "de esta etapa", y un ejemplo que cambia los sensores lo avisa en el momento.

- **Evidencia:** T4 y P6 "sigue": Irregularidad 50 % o 0 % según la pestaña, sin rótulo. La hipótesis P6 de que se cree global.
- **Constitución:** Art. 9 y Art. 3 (causa y efecto).

### 7. El momento que enseña se queda

El choque, el fin de una generación, el fin de la carrera y la red resuelta se detienen y se explican antes de seguir, con la causa a la vista. Nada que enseñe se va solo.

- **Evidencia:** R5 y N1 (lo que mejor anda hoy); R6 ("Reintentar solo" viene encendido y el choque se va); C1. Los momentos de la verdad del mapa 1.3 y la regla del pico y el final.
- **Constitución:** Art. 2 y Art. 7 (lo que se ve es el cálculo real).

### 8. Deshacer antes que confirmar; verbos con alcance

"Reiniciar" vuelve a empezar la corrida; "Restablecer" lleva siempre su objeto escrito. Lo que pierde trabajo ofrece Deshacer durante 8 s o más, en lugar de un diálogo.

- **Evidencia:** T6 y L3 (hasta cuatro vueltas atrás con nombres distintos en el Laboratorio); 2.4, punto 1 (diálogos de confirmación, sin deshacer); Q9; la tabla de verbos de 1.5.
- **Constitución:** Art. 8 (siempre hay forma de volver atrás).

### 9. Nombrar al usar

Cada término técnico se define en una línea la primera vez que aparece, en el lugar donde aparece, con su nombre real. Sin depender del tooltip.

- **Evidencia:** N3 ("Función de fitness" sin definir); L4 (tanh, ReLU, tasa); P12 "sigue"; la escalera de 1.5.
- **Constitución:** Art. 5 (los términos se definen la primera vez) y Art. 7.

### 10. La guía se quita y se pone de una vez

Un solo control con nombre claro, siempre en el mismo lugar, oculta lo que guía al principiante. La pregunta y la acción principal quedan. Los tooltips son aparte.

- **Evidencia:** T9 y P8 "cambió" (los nombres están, pero en pantalla no dicen qué ocultan); Q10; el mapa del mentor (columna 2, "¿Dónde se apaga la guía?").
- **Constitución:** Art. 6 (dos públicos, una app).

### 11. La ayuda se anuncia

Todo control con tooltip lo muestra con un indicio constante, sin pasar el cursor. Los tooltips conservan el formato "Qué hace / Por qué importa", que funciona.

- **Evidencia:** T7 y P11 "sigue"; tooltips en 0 faltantes en las 36 vistas [Medido] (2.6, a conservar).
- **Constitución:** Art. 5 (autoexplicable).

### 12. Entra y se recorre

A 1366×768 se ven sin desplazar la pregunta, la consigna, la acción, la escena (o la red) y la misión. A 800×600 todo sigue usable. El foco con Tab sigue el orden de lectura y no hay objetivos de menos de 24 px.

- **Evidencia:** I3 (la tarjeta de la neurona muestra 263 de 420 px a 1366×768) y R4 (a Reglas le faltan 141 px a 1440); T8 (a 800 se ven 3 de 6 pestañas); 2.5: falla de orden del foco (2.4.3) y cuatro objetivos chicos (2.5.8) [Medido].
- **Constitución:** el orden de prioridades (la usabilidad va segunda) y Art. 13.

---

## Cómo se usan en las maquetas

| Principio | Qué tiene que poder verse en una maqueta estática |
|---|---|
| 1 | La pregunta arriba de todo en El problema, Entrenar e Inspeccionar |
| 2 | La escena medida a 1366×768 (% de la ventana) |
| 3 | Las mismas zonas en las cinco pantallas |
| 4 | Una sola acción principal por pantalla |
| 5 | Entrenar con "Avanzado" abierto: los tres niveles y la marcha a la vista |
| 6 | El rótulo "de esta etapa" en al menos un ajuste |
| 7 | (estado, no se ve en estático; se describe en la comparación) |
| 8 | Un "Restablecer …" con su objeto y su tooltip |
| 9 | Una definición de una línea junto a "fitness" en Entrenar |
| 10 | El estado mentor: la guía oculta con un control con nombre |
| 11 | El indicio de tooltip en los controles |
| 12 | Las capturas a 1366×768 sin desplazar |
