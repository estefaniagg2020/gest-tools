# Agenda – Funcionalidades futuras

## Algoritmo de huecos disponibles (Acciones Rápidas)

En Acciones Rápidas debe existir un algoritmo que permita encontrar los primeros huecos disponibles según las restricciones del usuario.

**Ejemplo de restricciones:**
- Usuario disponible solo de 9 a 10 los martes y jueves
- De 8 a 9 los viernes
- Por la mañana los sábados

**Comportamiento esperado:** mostrar las primeras citas disponibles que cumplan esas restricciones.

**Implementación sugerida:**
1. Definir un modelo de "disponibilidad" por empleado (día de semana + rango horario)
2. Dado un rango de fechas a buscar, iterar por días y franjas
3. Para cada franja, comprobar solapamientos con bloques y citas existentes
4. Devolver las primeras N franjas libres ordenadas por fecha/hora
