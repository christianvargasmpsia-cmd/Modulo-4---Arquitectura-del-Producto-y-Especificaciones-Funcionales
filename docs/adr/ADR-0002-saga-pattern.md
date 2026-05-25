# ADR-0002: Adopción del Patrón Saga para Coordinación Operacional

## Metadatos

| Campo | Valor |
|---|---|
| Número | 0002 |
| Título | Adopción del Patrón Saga para Coordinación Operacional |
| Fecha | 24/05/2026 |
| Autor(es) | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Propuesta |
| Alcance | Flujos críticos de pedidos, pagos y stock |
| Stakeholders consultados | Equipo del proyecto, docente del módulo |

---

## 1. Contexto

UMSS Market requiere coordinar múltiples procesos operacionales distribuidos relacionados con pedidos, pagos QR, actualización de stock y notificaciones dentro de un entorno desacoplado orientado a eventos.

Los flujos críticos del sistema involucran múltiples bounded contexts:

- Orders
- Payments
- Inventory
- Notifications

La coordinación síncrona tradicional generaba riesgos de:

- acoplamiento fuerte
- bloqueo operacional
- baja tolerancia a fallos
- dificultad de escalabilidad
- inconsistencia operacional entre módulos

Además, los procesos asociados a pagos QR y actualización de stock requieren manejo de compensaciones operacionales cuando ocurren errores parciales durante el flujo distribuido.

Las fuerzas en tensión identificadas fueron:

- consistencia operacional vs. complejidad
- desacoplamiento vs. control centralizado
- resiliencia vs. simplicidad
- coordinación distribuida vs. mantenibilidad

---

## 2. Alternativas consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|---|---|---|---|
| A. Transacciones síncronas tradicionales | Simplicidad inicial | Alto acoplamiento y baja tolerancia a fallos | Bajo |
| B. Saga coreografiada | Alto desacoplamiento y flexibilidad | Mayor dificultad de trazabilidad | Medio |
| C. Saga orquestada orientada a eventos | Mejor control operacional y trazabilidad | Mayor complejidad del coordinador | Medio |

---

## 3. Decisión

> **Elegimos la alternativa C: utilizar Saga Orquestada Orientada a Eventos para coordinar procesos críticos entre pedidos, pagos y stock dentro de UMSS Market.**

La arquitectura basada en Saga permite coordinar procesos distribuidos manteniendo consistencia operacional sin utilizar bloqueos transaccionales distribuidos.

La decisión prioriza:

- coordinación desacoplada
- resiliencia operacional
- manejo de compensaciones
- trazabilidad distribuida
- integración orientada a eventos
- evolución incremental

La saga será utilizada principalmente en flujos críticos donde participan múltiples módulos operacionales relacionados con pedidos, pagos y disponibilidad de stock.

---

## 4. Consecuencias

### 4.1 Positivas

- Mejor coordinación de procesos distribuidos.
- Reducción de acoplamiento entre módulos.
- Mayor tolerancia a fallos parciales.
- Posibilidad de compensaciones operacionales.
- Mejor trazabilidad de flujos críticos.
- Compatibilidad con arquitectura orientada a eventos.

### 4.2 Negativas / costos

- Mayor complejidad arquitectónica.
- Necesidad de manejo explícito de compensaciones.
- Incremento en dificultad de debugging distribuido.
- Necesidad de monitoreo de eventos y correlación operacional.
- Curva de aprendizaje para coordinación asíncrona.

### 4.3 Neutras / observables

- Mayor volumen de eventos operacionales.
- Necesidad de catálogo de eventos.
- Dependencia de correlation IDs para trazabilidad.

---

## 5. Impacto en el sistema

### Código

Módulos afectados:

- Order Service
- Payment Service
- Inventory Service
- Notification Service
- Event Handlers
- Contratos funcionales IA relacionados

### Operaciones

- Monitoreo de eventos distribuidos.
- Seguimiento de correlation IDs.
- Registro de compensaciones operacionales.

### Seguridad

- Validación estructural de eventos.
- Prevención de duplicación operacional.
- Validación de integridad de mensajes.

### Equipo

- Requiere comprensión de patrones Saga.
- Necesidad de prácticas de trazabilidad distribuida.
- Capacitación básica en coordinación asíncrona.

### Costo

- Incremento moderado de complejidad técnica.
- Sin dependencia obligatoria de infraestructura enterprise avanzada.

---

## 6. Plan de reversión

### Señales tempranas

- Compensaciones excesivamente complejas.
- Problemas frecuentes de coordinación.
- Dificultad alta de mantenimiento.
- Incremento de inconsistencias operacionales.

### Costo de reversión

Moderado, debido a dependencias entre eventos y compensaciones operacionales.

### Plan B

Migrar parcialmente ciertos flujos críticos hacia coordinación síncrona controlada manteniendo eventos para notificaciones y procesos secundarios.

---

## 7. Validación

La decisión será considerada exitosa si:

- Los flujos críticos mantienen consistencia operacional.
- Las compensaciones operacionales funcionan correctamente.
- Los eventos distribuidos mantienen trazabilidad completa.
- Los módulos permanecen desacoplados.
- Los errores parciales no bloquean el sistema completo.

### Métricas

- Flujos completados correctamente ≥ 95 %
- Compensaciones ejecutadas correctamente
- Eventos trazables mediante correlation IDs
- Reducción de acoplamiento operacional

### Responsable

Equipo UMSS Market.

---

## 8. Referencias

- BRD_v3
- MRD_v2
- PRD_v2
- FSD_v2
- EVENT_DRIVEN.md
- ASYNC_PATTERNS.md
- saga_designer_SKILL.md
- Arquitecturas Asíncronas y Orientadas a Eventos — Módulo 4
- Patrones Saga vistos en clase

---

## 9. Historial

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 24/05/2026 | Rodriguez / Vargas | Creación inicial del ADR del patrón Saga |