# Design

## Context

La barra de escenario (`src/tabs/shared/scenario-bar.js`) ya admite que una
pestaña no muestre un grupo: Competir no muestra los sensores. El problema
(`src/tabs/drive/`) la usa hoy con todos sus grupos.

## Goals / Non-Goals

**Goals:** que El problema no muestre ajustes de sensores, sin cambiar lo que
se ve en el escenario ni en el tablero.

**Non-Goals:** tocar la percepción visible, "ver como la máquina" o las
otras pestañas.

## Decisions

### D1. Se usa lo que la barra ya sabe hacer

El problema arma la barra sin el grupo de sensores, igual que Competir. El
grupo no se crea: no queda oculto con un hueco ni en el orden del foco.

### D2. Sensores fijos en El problema

Los ajustes de El problema dejan de incluir `sensorCount`, `sensorRange` y
`sensorSpread`: el auto usa siempre `DEFAULT_SENSORS`. "Restablecer" no los
toca. Un cambio de sensores hecho en otra pestaña no llega a El problema.

### D3. Textos

Las ayudas y la guía de El problema no nombran ajustes de sensores. Las de
los rayos, las barras y "ver como la máquina" no cambian.

## Risks / Trade-offs

- **Pruebas que cambian.** Las de El problema que cambian los sensores desde
  la barra dejan de tener sentido. → Se reemplazan por las de los escenarios
  nuevos; es un cambio de comportamiento pedido, no una prueba que se afloja.
- **El tablero muestra hasta 12 barras con su número.** Con 5 sensores fijos
  ese caso ya no se da en El problema. → El bloque es compartido con Reglas a
  mano y no se toca.

## Migration Plan

Sin datos que migrar: los ajustes de El problema no se guardan entre visitas.

## Open Questions

Ninguna.
