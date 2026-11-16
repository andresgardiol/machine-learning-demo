# Spec Delta

## ADDED Requirements

### Requirement: La espiral se puede aprender
La espiral SHALL ser la forma difícil del Laboratorio, pero aprendible sin
buscar una combinación exacta: con dos capas ocultas y lo demás por defecto
la red MUST aprenderla en un tiempo que se puede esperar mirando, y con la
red por defecto no. El tooltip de la forma SHALL decir qué pide.

#### Scenario: Con dos capas de 8
- **WHEN** la persona elige la espiral, con 200 puntos y ruido 10 %, arma dos capas de 8 con tanh y deja la tasa por defecto
- **THEN** la red llega a 90 % de aciertos en práctica y en apartados en menos de 200 épocas, con cada una de cinco semillas de pesos

#### Scenario: Con dos capas de 7
- **WHEN** hace lo mismo con dos capas de 7
- **THEN** la red llega a 90 % en menos de 200 épocas, con cada una de cinco semillas

#### Scenario: Con la red por defecto
- **WHEN** la persona elige la espiral con la red por defecto, una capa de 4
- **THEN** la red no llega a 90 % en 600 épocas con ninguna de cinco semillas, y el plano muestra que una sola capa no alcanza

#### Scenario: Tooltip de la forma
- **WHEN** la persona posa el cursor sobre la espiral, en español o en inglés
- **THEN** el tooltip dice que es la difícil y que pide dos capas ocultas, sin nombrar una tasa

#### Scenario: Miniatura
- **WHEN** la persona mira la miniatura de la espiral en la barra
- **THEN** muestra la forma que se genera
