# Proposal

## Why

En El problema maneja una persona con el teclado. Los ajustes de sensores de
la barra de escenario (cantidad, alcance y apertura) no cambian nada de lo
que la persona hace ahí: ocupan lugar y distraen. El criterio del proyecto es
que un ajuste que no sirve en una pestaña no se muestra.

Es infraestructura de interfaz. Lo que habilita: que la primera pestaña
muestre solo lo que hace falta para manejar, y que los sensores aparezcan
recién donde importan, cuando hay que programar el auto o entrenarlo.

## What Changes

- **La barra de escenario de El problema deja de mostrar el grupo de
  sensores.** Quedan la pista, el tráfico, la velocidad y restablecer.
- **El auto de El problema lleva siempre los sensores por defecto:** 5 rayos,
  3 largos de auto y 90 grados.
- **No cambia nada más:** los rayos, las barras de percepción, el interruptor
  de sensores y "ver como la máquina" siguen igual, porque muestran qué
  recibiría una máquina. Reglas a mano y Entrenar conservan sus ajustes de
  sensores.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| El problema sin ajustes de sensores | Manejar es de la persona; los sensores son lo que necesita una máquina | Es quitar controles: no hay nada nuevo que entender | No hay nada que ocultar | No tiene estado; los sensores se cambian en Reglas a mano y en Entrenar |

### A quién sirve

A los dos: el principiante ve menos controles en la primera pantalla y el
mentor no tiene que explicar ajustes que ahí no hacen nada.

### Fuera de alcance

- Quitar los rayos, las barras de percepción o "ver como la máquina" de El
  problema.
- Cambiar los sensores de Reglas a mano, Entrenar, Competir o Inspeccionar.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `pestana-conducir`: la pestaña ya no ofrece ajustes de sensores y
  restablecer ya no los nombra.
- `barra-escenario`: el grupo de sensores no se muestra en El problema.

## Impact

- `src/tabs/drive/`: la barra se arma sin el grupo de sensores y los ajustes
  de la pestaña dejan de incluirlos.
- `src/tabs/shared/scenario-bar.js`: ya admite no mostrar un grupo; no cambia.
- Textos de ayuda de El problema que nombren los ajustes de sensores.
- Pruebas de El problema y de la barra que den por hecho esos ajustes.
- Sin dependencias ni build nuevos.
