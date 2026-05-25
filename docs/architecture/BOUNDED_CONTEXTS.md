# BOUNDED_CONTEXTS — UMSS Market

## 0. Metadatos

| Campo | Valor |
|---|---|
| Documento | BOUNDED_CONTEXTS |
| Producto | UMSS Market |
| Versión | v1.0 |
| Fecha | 24/05/2026 |
| Autores | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Propuesta |
| Arquitectura relacionada | Event-Driven Architecture + Saga |
| Documentos relacionados | ADR-0001, ADR-0002, EVENT_CATALOG, FSD_v2 |

---

# 1. Introducción

Este documento define los bounded contexts identificados dentro de la arquitectura de UMSS Market.

La separación de contextos permite:

- desacoplamiento funcional
- separación de responsabilidades
- evolución incremental
- integración distribuida
- trazabilidad operacional
- escalabilidad arquitectónica

Cada bounded context encapsula responsabilidades específicas del dominio y se comunica mediante eventos operacionales desacoplados.

---

# 2. Objetivos arquitectónicos

La definición de bounded contexts busca:

- reducir acoplamiento entre módulos
- separar responsabilidades del dominio
- facilitar integración orientada a eventos
- permitir evolución independiente de servicios
- mejorar mantenibilidad
- soportar coordinación distribuida mediante Saga

---

# 3. Bounded Contexts identificados

| Bounded Context | Responsabilidad principal |
|---|---|
| Orders | Gestión de pedidos |
| Payments | Validación de pagos QR |
| Inventory | Gestión y reserva de stock |
| Catalog | Gestión de productos |
| Notifications | Gestión de notificaciones |
| Realtime Gateway | Sincronización realtime |
| AI Contracts | Validación operacional AI-assisted |

---

# 4. Orders Context

## Responsabilidades

- creación de pedidos
- actualización de estado
- coordinación operacional
- emisión de eventos de pedido

---

## Eventos principales

- ORDER_CREATED
- ORDER_CONFIRMED
- ORDER_CANCELLED

---

## Dependencias

| Dependencia | Tipo |
|---|---|
| Payments | Event-driven |
| Inventory | Event-driven |
| Notifications | Event-driven |

---

## Riesgos

- inconsistencias de estado
- duplicación operacional
- dependencia temporal de eventos

---

# 5. Payments Context

## Responsabilidades

- generación QR
- validación de pagos
- integración bancaria
- confirmación operacional

---

## Eventos principales

- PAYMENT_PENDING
- PAYMENT_CONFIRMED
- PAYMENT_FAILED

---

## Dependencias

| Dependencia | Tipo |
|---|---|
| Orders | Event-driven |
| Notification Service | Event-driven |
| QR Provider | Integración externa |

---

## Riesgos

- timeout bancario
- duplicación de confirmaciones
- fallos de webhook

---

# 6. Inventory Context

## Responsabilidades

- validación de stock
- reserva operacional
- liberación de stock
- sincronización de disponibilidad

---

## Eventos principales

- STOCK_RESERVED
- STOCK_RELEASED
- STOCK_UPDATED

---

## Dependencias

| Dependencia | Tipo |
|---|---|
| Orders | Event-driven |
| Catalog | Event-driven |

---

## Riesgos

- sobreventa
- inconsistencias temporales
- conflictos concurrentes

---

# 7. Catalog Context

## Responsabilidades

- gestión de productos
- actualización de catálogo
- publicación de disponibilidad
- sincronización operacional

---

## Eventos principales

- PRODUCT_UPDATED

---

## Dependencias

| Dependencia | Tipo |
|---|---|
| Inventory | Event-driven |
| Realtime Gateway | Event-driven |

---

## Riesgos

- desactualización de catálogo
- inconsistencias de visualización

---

# 8. Notifications Context

## Responsabilidades

- envío de correos
- notificaciones operacionales
- confirmaciones de pedido
- auditoría operacional

---

## Eventos principales

- NOTIFICATION_REQUESTED
- NOTIFICATION_SENT

---

## Dependencias

| Dependencia | Tipo |
|---|---|
| Orders | Event-driven |
| SMTP Provider | Integración externa |

---

## Riesgos

- pérdida de notificaciones
- latencia operacional
- duplicación de mensajes

---

# 9. Realtime Gateway Context

## Responsabilidades

- sincronización realtime
- actualización mediante WebSockets
- propagación de eventos operacionales
- conexión con clientes activos

---

## Eventos principales

- REALTIME_UPDATE_SENT

---

## Dependencias

| Dependencia | Tipo |
|---|---|
| Event Bus | Event-driven |
| Frontend | WebSocket |

---

## Riesgos

- desconexiones websocket
- pérdida temporal de sincronización
- reconexiones concurrentes

---

# 10. AI Contracts Context

## Responsabilidades

- validación AI-assisted
- trazabilidad documental
- contratos funcionales IA
- gobernanza operacional IA

---

## Contratos relacionados

- PR-FSD-001
- PR-FSD-002
- PR-FSD-003

---

## Dependencias

| Dependencia | Tipo |
|---|---|
| FSD_v2 | Trazabilidad |
| Prompt Mappings | Gobernanza IA |

---

## Riesgos

- inconsistencias documentales
- pérdida de trazabilidad
- dependencia de prompts mal definidos

---

# 11. Relación con Event-Driven Architecture

Los bounded contexts interactúan mediante eventos desacoplados propagados a través de mecanismos de mensajería asincrónica.

Esto permite:

- reducción de dependencias directas
- mejor resiliencia operacional
- integración distribuida
- tolerancia a fallos
- coordinación Saga

---

# 12. Relación con Saga

La coordinación distribuida entre bounded contexts se realiza mediante el patrón Saga.

La Saga principal coordina:

1. creación de pedido
2. validación de pago
3. reserva de stock
4. confirmación operacional
5. actualización realtime
6. notificación final

Las compensaciones incluyen:

- cancelación de pedido
- liberación de stock
- invalidación operacional
- notificación de fallo

---

# 13. Riesgos arquitectónicos globales

| Riesgo | Mitigación |
|---|---|
| Acoplamiento accidental | Contratos claros |
| Eventos inconsistentes | Event Catalog |
| Fallos distribuidos | Saga compensation |
| Reprocesamiento | Consumo idempotente |
| Latencia operacional | Procesamiento asíncrono |

---

# 14. Referencias

- ADR-0001-event-driven-architecture
- ADR-0002-saga-pattern
- EVENT_CATALOG.md
- FSD_v2
- EVENT_DRIVEN.md
- ASYNC_PATTERNS.md

---

# 15. Registro de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 24/05/2026 | Rodriguez / Vargas | Creación inicial de bounded contexts |