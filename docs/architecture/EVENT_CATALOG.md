# EVENT_CATALOG — UMSS Market

## 0. Metadatos

| Campo | Valor |
|---|---|
| Documento | EVENT_CATALOG |
| Producto | UMSS Market |
| Versión | v1.0 |
| Fecha | 24/05/2026 |
| Autores | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Propuesta |
| Arquitectura relacionada | Event-Driven Architecture + Saga |
| Documentos relacionados | ADR-0001, ADR-0002, FSD_v2, PRD_v2 |
| Objetivo | Definir eventos operacionales distribuidos dentro del ecosistema UMSS Market |

---

# 1. Introducción

Este documento define el catálogo de eventos operacionales utilizados dentro de la arquitectura orientada a eventos de UMSS Market.

El catálogo permite:

- desacoplar módulos funcionales
- mantener trazabilidad operacional
- coordinar procesos distribuidos
- soportar flujos asíncronos
- facilitar integración entre bounded contexts
- mantener consistencia operacional

Los eventos definidos forman parte de la arquitectura Event-Driven y de la coordinación Saga utilizada en los flujos críticos del sistema.

---

# 2. Convenciones generales

## 2.1 Naming convention

Los eventos siguen la convención:

```text
ENTIDAD_ACCION
```

Ejemplos:

- ORDER_CREATED
- PAYMENT_CONFIRMED
- STOCK_RESERVED

---

## 2.2 Correlation ID

Todos los eventos deben propagar:

```text
correlationId
```

para mantener trazabilidad operacional distribuida.

---

## 2.3 Idempotencia

Todos los consumidores deben manejar eventos de forma idempotente para evitar:

- reprocesamiento
- duplicación operacional
- inconsistencias distribuidas

---

## 2.4 Timestamp

Todos los eventos deben incluir:

```text
timestamp
```

en formato ISO-8601.

---

# 3. Bounded Contexts relacionados

| Bounded Context | Responsabilidad |
|---|---|
| Orders | Gestión de pedidos |
| Payments | Validación de pagos QR |
| Inventory | Gestión de stock |
| Catalog | Gestión de productos |
| Notifications | Notificaciones operacionales |
| Realtime Gateway | Actualización operacional en tiempo real |
| AI Contracts | Validación operacional AI-assisted |

---

# 4. Catálogo de eventos

## 4.1 ORDER_CREATED

| Campo | Valor |
|---|---|
| Evento | ORDER_CREATED |
| Producer | Order Service |
| Consumer | Payment Service |
| Trigger | Creación de pedido |
| Tipo | Dominio |
| Prioridad | Alta |
| Acciones posteriores | Iniciar validación de pago |

### Payload principal

```json
{
  "event": "ORDER_CREATED",
  "orderId": "UUID",
  "customerId": "UUID",
  "total": 120.50,
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Cancelar pedido
- Registrar trazabilidad operacional
- Notificar error operacional

---

## 4.2 PAYMENT_PENDING

| Campo | Valor |
|---|---|
| Evento | PAYMENT_PENDING |
| Producer | Payment Service |
| Consumer | Orders |
| Trigger | QR generado |
| Tipo | Integración |
| Prioridad | Alta |
| Acciones posteriores | Esperar confirmación bancaria |

### Payload principal

```json
{
  "event": "PAYMENT_PENDING",
  "paymentId": "UUID",
  "orderId": "UUID",
  "qrReference": "string",
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Expirar QR
- Liberar recursos temporales
- Registrar incidente operacional

---

## 4.3 PAYMENT_CONFIRMED

| Campo | Valor |
|---|---|
| Evento | PAYMENT_CONFIRMED |
| Producer | Payment Service |
| Consumer | Inventory Service |
| Trigger | Confirmación bancaria |
| Tipo | Integración |
| Prioridad | Crítica |
| Acciones posteriores | Reservar stock |

### Payload principal

```json
{
  "event": "PAYMENT_CONFIRMED",
  "paymentId": "UUID",
  "orderId": "UUID",
  "amount": 120.50,
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Reintento operacional
- Escalamiento manual
- Registrar trazabilidad distribuida

---

## 4.4 PAYMENT_FAILED

| Campo | Valor |
|---|---|
| Evento | PAYMENT_FAILED |
| Producer | Payment Service |
| Consumer | Saga Coordinator |
| Trigger | Fallo de pago |
| Tipo | Error operacional |
| Prioridad | Alta |
| Acciones posteriores | Cancelar pedido |

### Payload principal

```json
{
  "event": "PAYMENT_FAILED",
  "paymentId": "UUID",
  "orderId": "UUID",
  "reason": "string",
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Cancelar flujo operacional
- Liberar stock reservado
- Notificar usuario

---

## 4.5 STOCK_RESERVED

| Campo | Valor |
|---|---|
| Evento | STOCK_RESERVED |
| Producer | Inventory Service |
| Consumer | Orders |
| Trigger | Stock validado |
| Tipo | Dominio |
| Prioridad | Alta |
| Acciones posteriores | Confirmar pedido |

### Payload principal

```json
{
  "event": "STOCK_RESERVED",
  "orderId": "UUID",
  "items": [],
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Liberar stock
- Cancelar pedido
- Registrar inconsistencia operacional

---

## 4.6 STOCK_RELEASED

| Campo | Valor |
|---|---|
| Evento | STOCK_RELEASED |
| Producer | Inventory Service |
| Consumer | Orders |
| Trigger | Cancelación operacional |
| Tipo | Compensación |
| Prioridad | Media |
| Acciones posteriores | Actualizar disponibilidad |

### Payload principal

```json
{
  "event": "STOCK_RELEASED",
  "orderId": "UUID",
  "items": [],
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Reintento operacional
- Validación manual
- Registro de incidente

---

## 4.7 ORDER_CONFIRMED

| Campo | Valor |
|---|---|
| Evento | ORDER_CONFIRMED |
| Producer | Saga Coordinator |
| Consumer | Notifications |
| Trigger | Flujo completado |
| Tipo | Dominio |
| Prioridad | Alta |
| Acciones posteriores | Notificar usuario |

### Payload principal

```json
{
  "event": "ORDER_CONFIRMED",
  "orderId": "UUID",
  "status": "CONFIRMED",
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Reintento de notificación
- Registro operacional

---

## 4.8 ORDER_CANCELLED

| Campo | Valor |
|---|---|
| Evento | ORDER_CANCELLED |
| Producer | Saga Coordinator |
| Consumer | Notifications |
| Trigger | Compensación operacional |
| Tipo | Compensación |
| Prioridad | Alta |
| Acciones posteriores | Notificar cancelación |

### Payload principal

```json
{
  "event": "ORDER_CANCELLED",
  "orderId": "UUID",
  "reason": "string",
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Reintento operacional
- Escalamiento manual

---

## 4.9 PRODUCT_UPDATED

| Campo | Valor |
|---|---|
| Evento | PRODUCT_UPDATED |
| Producer | Catalog Service |
| Consumer | Realtime Gateway |
| Trigger | Actualización de producto |
| Tipo | Dominio |
| Prioridad | Media |
| Acciones posteriores | Sincronizar catálogo |

### Payload principal

```json
{
  "event": "PRODUCT_UPDATED",
  "productId": "UUID",
  "changes": [],
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Reintento operacional
- Registro de incidente

---

## 4.10 REALTIME_UPDATE_SENT

| Campo | Valor |
|---|---|
| Evento | REALTIME_UPDATE_SENT |
| Producer | Realtime Gateway |
| Consumer | Clientes conectados |
| Trigger | Cambio operacional |
| Tipo | Operacional |
| Prioridad | Media |
| Acciones posteriores | Actualizar interfaz cliente |

### Payload principal

```json
{
  "event": "REALTIME_UPDATE_SENT",
  "channel": "WEBSOCKET",
  "entity": "ORDER",
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Reintento operacional
- Reconexión automática

---

## 4.11 NOTIFICATION_SENT

| Campo | Valor |
|---|---|
| Evento | NOTIFICATION_SENT |
| Producer | Notification Service |
| Consumer | Observabilidad operacional |
| Trigger | Notificación enviada |
| Tipo | Auditoría |
| Prioridad | Baja |
| Acciones posteriores | Registrar trazabilidad |

### Payload principal

```json
{
  "event": "NOTIFICATION_SENT",
  "notificationId": "UUID",
  "orderId": "UUID",
  "channel": "PUSH",
  "timestamp": "ISO-8601",
  "correlationId": "UUID"
}
```

### Acción ante fallo

- Reintento operacional
- Registro de incidente

---

# 5. Relación con Saga

Los eventos definidos participan en la coordinación operacional distribuida implementada mediante el patrón Saga.

La saga principal coordina:

1. creación de pedido
2. validación de pago
3. reserva de stock
4. confirmación operacional
5. actualización realtime
6. notificación final

Las compensaciones operacionales incluyen:

- cancelación de pedido
- liberación de stock
- invalidación operacional del flujo
- notificación de error

---

# 6. Relación con AI-SDLC

El catálogo de eventos forma parte del ecosistema AI-assisted utilizado para:

- trazabilidad operacional
- validación funcional IA
- contratos funcionales IA
- automatización documental
- coordinación distribuida

Los contratos IA relacionados incluyen:

- PR-FSD-001
- PR-FSD-002
- PR-FSD-003

---

# 7. Riesgos arquitectónicos

| Riesgo | Mitigación |
|---|---|
| Eventos duplicados | Consumo idempotente |
| Pérdida de trazabilidad | Correlation ID |
| Desorden temporal | Validación de timestamps |
| Compensaciones inconsistentes | Reintentos controlados |
| Acoplamiento accidental | Boundaries claros |

---

# 8. Referencias

- ADR-0001-event-driven-architecture
- ADR-0002-saga-pattern
- FSD_v2
- PRD_v2
- ASYNC_PATTERNS.md
- EVENT_DRIVEN.md
- BOUNDED_CONTEXTS.md

---

# 9. Registro de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 24/05/2026 | Rodriguez / Vargas | Creación inicial del catálogo de eventos |

