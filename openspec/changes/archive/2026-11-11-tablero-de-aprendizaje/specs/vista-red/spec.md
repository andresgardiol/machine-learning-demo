# Spec Delta

## ADDED Requirements

### Requirement: Diagrama que ocupa su zona
El diagrama SHALL ocupar el ancho y el alto de su zona y volver a acomodarse
cuando la zona cambia de tamaño, con los nodos siempre circulares y los
rótulos con un tamaño de letra constante de 12 píxeles.

#### Scenario: Zona grande
- **WHEN** se muestra la red por defecto, de 6 entradas, 6 neuronas ocultas y 4 salidas, en una zona de 640 por 380 píxeles
- **THEN** las columnas se reparten a lo ancho de la zona, los nodos a lo alto, y todos los rótulos de entradas y salidas se leen completos

#### Scenario: Cambio de tamaño
- **WHEN** la zona del diagrama se agranda o se achica porque la persona movió un borde o plegó otra tarjeta
- **THEN** el diagrama se vuelve a dibujar ocupando la zona nueva, sin deformar los nodos ni cambiar el tamaño de los rótulos

#### Scenario: Zona mínima
- **WHEN** la zona mide 328 por 120 píxeles y la red es la por defecto
- **THEN** el diagrama se ve completo dentro de la zona, sin barras de desplazamiento
