# Tareas

## 1. Medir

- [x] 1.1 Medir en el navegador (D1), antes de cambiar nada: Inspeccionar con el cerebro "5s - traffic" de la captura (si está guardado) y con el de ejemplo de la calle, y el Laboratorio con tu manejo aprendiendo. Un minuto cada uno: cambios grandes de brillo por segundo en el centro de cada neurona y de cada tecla de la decisión. Anotar el peor elemento y su frecuencia. **Si lo que destella no es lo que supone el diseño, parar y consultar.**
  *Hecho, medido (Chrome sin ventana por CDP, 1440×900; el panel integrado estaba oculto y ahí los cuadros se frenan). En cada cuadro, la luminancia del lienzo dentro de cada neurona (a 0,75 del radio a la izquierda del centro, fuera del número y la curva) y el `data-on` de cada tecla; cambio grande: la mitad del rango. "5s - traffic" no está guardado en este navegador (0 cerebros): se midieron los cuatro de ejemplo, 60 s cada uno, reproduciendo en tiempo real. Peor elemento y frecuencia (máximo en una ventana móvil de 1 s): "Calle, tráfico nuevo" (el de por defecto), la oculta 1·5, la salida "derecha" y su tecla, 20 por segundo (9 de 20 elementos pasan de 3); "Calle, mismo tráfico", oculta 1·2 y salidas y teclas izquierda/derecha, 61 por segundo, cada cuadro los 60 s; "Solo óvalo", 59; "Cuatro pistas", 58. Laboratorio con "Tu manejo" aprendiendo de a épocas: la salida "derecha", 18 por segundo (8 de 14 neuronas); ahí las teclas no se ven (el bloque del ejemplo se oculta de a épocas). Coincide con el diseño: neuronas de escalón y teclas de la decisión. Además destellan entradas (sensores), hasta 10 por segundo, porque la lectura del rayo salta cuando un auto entra y sale de él; no es escalón, pero la guarda va por neurona y las cubre, así que se siguió sin consultar. No medido: el Laboratorio con una grabación propia (manejar a mano sin ventana); el dibujo es el mismo. Detalle en la nota `destellos-1-medidas-antes.md` de la carpeta de notas.*
- [x] 1.2 Medir la fluidez de base en Inspeccionar con la red más grande disponible (mediana y peor intervalo entre cuadros, 10 s).
  *Hecho, medido. Los cerebros de ejemplo son todos 6 → 6 → 4: se guardó en el navegador de prueba un cerebro sintético 6 → 16 → 16 → 16 → 4 (la red más grande que admite la app, pesos con semilla fija, escalón) y se reprodujo en Inspeccionar, 3 veces 10 s. Intervalo entre cuadros: mediana 16,7 ms y peor 16,8 ms; está atado a la sincronía vertical, así que no mostraría 1 ms más. Por eso se midió también el trabajo de los callbacks de cuadro (simulación y dibujo): mediana 1,0–1,1 ms, p95 2,0–2,1 ms. Solo sin ventana.*

## 2. Guarda

- [ ] 2.1 `src/render/flash-guard.js` (D2) con pruebas en `tests/`: tres cambios en un segundo se ven exactos; el cuarto da `flicker` y el promedio; sale tras 1 s sin cambios; `reset` vuelve a lo exacto; un cambio chico nunca cuenta; el promedio pesado por tiempo; misma secuencia, mismo resultado.
- [ ] 2.2 Fracción del último segundo en cada lado, para la tarjeta (D5), con su prueba.

## 3. Vistas

- [ ] 3.1 `network-inspector.js`: neuronas y conexiones pasan por la guarda en marcha y se dibujan exactas en pausa (D3, D4); patrón rayado creado una vez. Verificar "Neurona en el borde", "Los primeros cambios se ven", "Se calma", "Pausa exacta" y "Conexiones".
- [ ] 3.2 `weight-table.js`: mismas reglas en la tabla de pesos. Verificar "Conexiones" con la vista de pesos.
- [ ] 3.3 `network-view.js` (vista chica de las otras pestañas): mismas reglas. Verificar "Otras pestañas" en El problema, Reglas a mano, Entrenar y Competir donde se vea una red en vivo.
- [ ] 3.4 `actionBlock`: estado `mixed` con rayado por CSS y nombre accesible (D4), en Inspeccionar y en el Laboratorio. Verificar "Acción que titubea" y "En pausa".
- [ ] 3.5 Tarjeta de la neurona: texto de "titubea" (D5). Verificar "Tarjeta de la neurona".

## 4. Textos y leyenda

- [ ] 4.1 Leyenda "titubea" y tooltip en `es.js` y `en.js`; `mlLab.auditTooltips()` no informa nada. Verificar "Qué es el rayado".
- [ ] 4.2 Medir a 1440×900 y 1366×768, en es y en: la leyenda y el tablero de Inspeccionar y del Laboratorio siguen entrando sin desplazar. **Si algo deja de entrar, parar y consultar.**

## 5. Cierre

- [ ] 5.1 Repetir la medida de 1.1 después del cambio: ningún elemento pasa de tres cambios grandes en ningún segundo. Verificar "Estado por defecto", "Peor caso medido", "Laboratorio con tu manejo" y "La red decide igual" (mismo recorrido del auto con la misma semilla antes y después).
- [ ] 5.2 Repetir la medida de fluidez de 1.2; la mediana no empeora más de 1 ms.
- [ ] 5.3 Verificación manual en el navegador contra el filtro de entrada de la propuesta; capturas de una neurona rayada, una tecla rayada y la misma neurona exacta en pausa.
- [ ] 5.4 PENDIENTES.md: lo no probado (por ejemplo, con un lector de pantalla real).
- [ ] 5.5 `npm test` y `openspec validate sin-destellos-en-la-red --strict`.
