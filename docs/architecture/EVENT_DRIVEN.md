# EVENT_DRIVEN — UMSS Market

## 0. Metadatos

| Campo | Valor |
|---|---|
| Documento | EVENT_DRIVEN |
| Producto | UMSS Market |
| Versión | v1.0 |
| Fecha | 24/05/2026 |
| Autores | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Propuesta |
| Arquitectura relacionada | Event-Driven Architecture |
| Documentos relacionados | ADR-0001, ADR-0002, EVENT_CATALOG, BOUNDED_CONTEXTS |

---

# 1. Introducción

UMSS Market utiliza una arquitectura orientada a eventos para desacoplar procesos operacionales distribuidos y mejorar la coordinación entre módulos funcionales.

La arquitectura Event-Driven permite:

- desacoplamiento operacional
- resiliencia ante fallos
- integración distribuida
- coordinación asíncrona
- evolución incremental
- trazabilidad operacional
- sincronización realtime

Los módulos funcionales se comunican mediante eventos propagados de forma asíncrona.

---

# 2. Objetivos arquitectónicos

La arquitectura orientada a eventos busca:

- reducir dependencias síncronas
- mejorar tolerancia a fallos
- desacoplar bounded contexts
- soportar procesamiento asíncrono
- facilitar escalabilidad operacional
- permitir coordinación Saga
- soportar actualizaciones realtime

---

# 3. Componentes principales

| Componente | Responsabilidad |
|---|---|
| Event Producers | Publicación de eventos |
| Event Bus | Propagación operacional |
| Event Consumers | Procesamiento de eventos |
| Realtime Gateway | Actualización WebSocket |
| Saga Coordination | Coordinación distribuida |
| Outbox Mechanism | Consistencia operacional |

---

# 4. Productores de eventos

Los siguientes módulos publican eventos operacionales:

| Servicio | Eventos principales |
|---|---|
| Order Service | ORDER_CREATED, ORDER_CONFIRMED |
| Payment Service | PAYMENT_PENDING, PAYMENT_CONFIRMED |
| Inventory Service | STOCK_RESERVED, STOCK_RELEASED |
| Catalog Service | PRODUCT_UPDATED |
| Notification Service | NOTIFICATION_SENT |
| Realtime Gateway | REALTIME_UPDATE_SENT |

---

# 5. Consumidores de eventos

Los consumidores reaccionan a eventos distribuidos para ejecutar acciones desacopladas.

| Servicio | Eventos consumidos |
|---|---|
| Payment Service | ORDER_CREATED |
| Inventory Service | PAYMENT_CONFIRMED |
| Notification Service | ORDER_CONFIRMED |
| Realtime Gateway | PRODUCT_UPDATED, ORDER_CONFIRMED |
| Orders | STOCK_RESERVED, PAYMENT_FAILED |

---

# 6. Flujo operacional principal

La coordinación principal del sistema sigue el siguiente flujo:

```text
ORDER_CREATED
↓
PAYMENT_PENDING
↓
PAYMENT_CONFIRMED
↓
STOCK_RESERVED
↓
ORDER_CONFIRMED
↓
REALTIME_UPDATE_SENT
↓
NOTIFICATION_SENT
```

---

# 7. Compensaciones operacionales

Cuando ocurre un fallo parcial, se ejecutan compensaciones distribuidas.

## Ejemplo

```text
PAYMENT_FAILED
↓
ORDER_CANCELLED
↓
STOCK_RELEASED
↓
NOTIFICATION_SENT
```

Las compensaciones permiten mantener consistencia operacional sin utilizar transacciones distribuidas bloqueantes.

---

# 8. Integración con Saga

La arquitectura Event-Driven soporta la coordinación distribuida mediante el patrón Saga.

La Saga principal coordina:

1. creación de pedido
2. validación de pago
3. reserva de stock
4. confirmación operacional
5. actualización realtime
6. notificación final

Las interacciones entre bounded contexts se realizan mediante eventos desacoplados.

---

# 9. Integración con Outbox Pattern

UMSS Market utiliza Outbox Pattern para garantizar consistencia entre:

- persistencia operacional
- publicación de eventos
- procesamiento asíncrono

Esto reduce riesgos de:

- pérdida de eventos
- inconsistencias operacionales
- duplicación de procesamiento

---

# 10. Integración con CQRS

CQRS se utiliza parcialmente para separar:

- comandos operacionales
- consultas optimizadas
- vistas de lectura desacopladas

Los casos principales incluyen:

- consultas de catálogo
- estado de pedidos
- historial operacional
- monitoreo realtime

---

# 11. Relación con Realtime Architecture

Realtime Gateway propaga eventos operacionales hacia clientes conectados mediante WebSockets.

Esto permite:

- actualización inmediata de pedidos
- sincronización operacional
- visualización realtime
- desacoplamiento frontend-backend

---

# 12. Relación con Clean Architecture

La arquitectura Event-Driven respeta la Dependency Rule:

- el dominio no depende del mecanismo de mensajería
- los eventos son abstraídos mediante puertos
- los adaptadores implementan propagación de eventos
- la infraestructura permanece desacoplada

---

# 13. Riesgos arquitectónicos

| Riesgo | Mitigación |
|---|---|
| Eventos duplicados | Consumo idempotente |
| Eventos perdidos | Outbox Pattern |
| Inconsistencia temporal | Compensaciones Saga |
| Latencia operacional | Procesamiento asíncrono |
| Acoplamiento accidental | Contratos de eventos |

---

# 14. Beneficios esperados

| Beneficio | Impacto |
|---|---|
| Desacoplamiento | Alto |
| Resiliencia | Alto |
| Escalabilidad | Medio-Alto |
| Integración distribuida | Alto |
| Evolución incremental | Alto |
| Realtime operacional | Alto |

---

# 15. Limitaciones

La arquitectura orientada a eventos introduce:

- mayor complejidad operacional
- necesidad de trazabilidad distribuida
- consistencia eventual
- monitoreo de eventos
- coordinación asíncrona

---

# 16. Referencias

- ADR-0001-event-driven-architecture
- ADR-0002-saga-pattern
- EVENT_CATALOG.md
- BOUNDED_CONTEXTS.md
- ASYNC_PATTERNS.md
- FSD_v2

---

# 17. Registro de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 24/05/2026 | Rodriguez / Vargas | Creación inicial del documento Event-Driven |

