# ADR-0001: Adopción de Arquitectura Orientada a Eventos

## Metadatos

| Campo | Valor |
|---|---|
| Número | 0001 |
| Título | Adopción de Arquitectura Orientada a Eventos |
| Fecha | 24/05/2026 |
| Autor(es) | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Aceptada |
| Alcance | Ecosistema completo UMSS Market |
| Stakeholders consultados | Equipo del proyecto, docente del módulo, revisión académica |

---

## 1. Contexto

UMSS Market requiere coordinar múltiples procesos operacionales relacionados con pedidos, pagos QR, actualización de stock y notificaciones dentro de un entorno universitario con alta concurrencia operacional.

El sistema necesita soportar:

- procesamiento desacoplado de eventos
- integración distribuida entre módulos
- consistencia operacional entre pedido, pago y stock
- actualización operacional de estados
- trazabilidad funcional
- crecimiento incremental del sistema

La arquitectura tradicional síncrona generaba riesgos de acoplamiento fuerte entre módulos críticos, especialmente en flujos relacionados con pagos QR y validación de stock.

Además, el proyecto incorpora capacidades AI-assisted y contratos funcionales IA que requieren trazabilidad clara entre eventos operacionales y validaciones funcionales.

Las principales fuerzas en tensión identificadas fueron:

- simplicidad vs. escalabilidad
- acoplamiento vs. flexibilidad
- sincronía inmediata vs. consistencia operacional
- velocidad de implementación vs. mantenibilidad evolutiva

---

## 2. Alternativas consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|---|---|---|---|
| A. Arquitectura monolítica síncrona | Implementación simple | Alto acoplamiento y baja flexibilidad operacional | Bajo |
| B. Arquitectura orientada a eventos | Desacoplamiento, escalabilidad y resiliencia operacional | Mayor complejidad de coordinación | Medio |
| C. Microservicios totalmente distribuidos | Alta independencia de módulos | Complejidad excesiva para el alcance académico | Alto |

---

## 3. Decisión

> **Elegimos la alternativa B: Arquitectura Orientada a Eventos para coordinar flujos operacionales desacoplados dentro del ecosistema UMSS Market.**

La arquitectura orientada a eventos permite desacoplar procesamiento de pedidos, validación de pagos, actualización de stock y generación de notificaciones sin depender de comunicación síncrona estricta entre módulos.

La decisión prioriza:

- desacoplamiento funcional
- resiliencia operacional
- integración distribuida
- trazabilidad de eventos
- evolución incremental del sistema

El modelo Event-Driven también facilita integración futura con capacidades AI-assisted, contratos funcionales IA y automatización operacional basada en eventos.

---

## 4. Consecuencias

### 4.1 Positivas

- Desacoplamiento entre módulos operacionales.
- Mejor tolerancia a fallos parciales.
- Mayor escalabilidad funcional.
- Integración más flexible entre pagos, pedidos y stock.
- Mejor trazabilidad operacional mediante eventos distribuidos.
- Mayor compatibilidad con flujos AI-assisted y automatización documental.

### 4.2 Negativas / costos

- Mayor complejidad arquitectónica.
- Necesidad de monitoreo de eventos.
- Mayor dificultad de depuración distribuida.
- Riesgo de duplicación de eventos si no existe control idempotente.
- Curva de aprendizaje mayor para coordinación asíncrona.

### 4.3 Neutras / observables

- Incremento moderado en documentación arquitectónica.
- Necesidad de definir catálogo de eventos.
- Dependencia de convenciones de trazabilidad operacional.

---

## 5. Impacto en el sistema

### Código

Módulos afectados:

- Order Service
- Payment Service
- Stock Service
- Notification Service
- Contratos IA relacionados con validación operacional

### Operaciones

- Necesidad de monitoreo de eventos.
- Seguimiento de correlación operacional.
- Registro de trazabilidad distribuida.

### Seguridad

- Validación de eventos entrantes.
- Control de duplicación operacional.
- Validación estructural de payloads.

### Equipo

- Requiere comprensión de asincronía y eventos.
- Necesidad de prácticas de trazabilidad operacional.
- Capacitación básica en arquitectura distribuida.

### Costo

- Incremento moderado en complejidad técnica.
- Sin dependencia obligatoria de infraestructura cloud avanzada.

---

## 6. Plan de reversión

### Señales tempranas

- Alta complejidad operacional.
- Problemas recurrentes de trazabilidad.
- Incremento excesivo de fallos distribuidos.
- Dificultad de mantenimiento.

### Costo de reversión

Moderado, debido a dependencias entre eventos y módulos desacoplados.

### Plan B

Migrar parcialmente ciertos flujos críticos hacia integración síncrona controlada manteniendo eventos únicamente para notificaciones y procesos secundarios.

---

## 7. Validación

La decisión será considerada exitosa si:

- Los módulos mantienen desacoplamiento funcional.
- Los eventos permiten trazabilidad operacional clara.
- Los flujos de pedido, pago y stock mantienen consistencia operacional.
- Los eventos duplicados son controlados mediante idempotencia.
- El sistema permite evolución incremental sin acoplamiento fuerte.

### Métricas

- Eventos procesados correctamente ≥ 95 %
- Errores de duplicación controlados
- Tiempo de propagación operacional aceptable
- Trazabilidad operacional completa en flujos críticos

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
- Arquitectura Distribuida — Módulo 4
- Patrones Saga y Event-Driven vistos en clase

---

 ## 9. Historial

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 24/05/2026 | Rodriguez / Vargas | Creación inicial del ADR de arquitectura orientada a eventos |