---
id: PR-FSD-003
version: "1.0"
título: Contrato IA — Coordinación de Eventos Distribuidos (Saga Coreografía)
estado: Activo
fecha: 24/05/2026
flujo_cubierto: ORDER_CREATED → PAYMENT_CONFIRMED → STOCK_RESERVED → ORDER_CONFIRMED (happy path) + compensaciones
servicios_involucrados:
  - order-service
  - payment-service
  - inventory-service
autores:
  - Rodriguez Gonzales Abad Melani
  - Vargas Sandoval Christian Bernardo
invariantes_referenciados:
  - INV-001 (stock no negativo)
  - INV-002 (idempotencia de pagos)
  - INV-003 (QR con TTL)
adr_referenciados:
  - ADR-0001 (Event-Driven Architecture)
  - ADR-0002 (Saga Pattern — Coreografía)
---

# PR-FSD-003 — Contrato IA: Coordinación de Eventos Distribuidos

## Propósito

Este contrato define las reglas que el agente IA debe aplicar al generar o revisar código relacionado con la coordinación de eventos en el flujo de pedido distribuido. Cubre el ciclo completo de la Saga (ADR-0002): desde `ORDER_CREATED` hasta `ORDER_CONFIRMED`, incluyendo todos los caminos de compensación.

---

## Rol del agente en este flujo

```
Etapa: Generación de código + revisión de código (pre-merge)
Disparador: PR que modifique consumers/publishers de eventos en cualquier servicio
Acción: Verificar que el flujo de eventos cumple el contrato de la Saga y el catálogo de eventos
```

---

## Input (entradas requeridas al agente)

```json
{
  "event_type": "ORDER_CREATED",
  "order_id": "uuid-del-pedido",
  "correlation_id": "uuid-de-correlacion",
  "producer_service": "order-service",
  "payload": {
    "order_id": "uuid-del-pedido",
    "total": 150.00,
    "currency": "BOB",
    "items": [
      {"product_id": "uuid-producto", "quantity": 3, "unit_price": 50.00}
    ],
    "buyer_id": "uuid-comprador",
    "created_at": "2026-05-24T14:30:00Z"
  }
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `event_type` | string | Tipo de evento según catálogo (ver tabla abajo) |
| `order_id` | UUID | Identificador del pedido (key de correlación) |
| `correlation_id` | UUID | ID que debe propagarse en toda la cadena |
| `producer_service` | string | Servicio que origina el evento |
| `payload` | object | Cuerpo del evento (específico por tipo) |

---

## Output esperado (respuesta del agente)

```json
{
  "evento_valido": true,
  "checks": {
    "tipo_en_catalogo": true,
    "productor_correcto": true,
    "correlation_id_presente": true,
    "payload_completo": true,
    "consumidores_correctos": ["payment-service"]
  },
  "accion_recomendada": "PUBLICAR_EVENTO",
  "siguiente_evento_esperado": "PAYMENT_PENDING",
  "observaciones": ""
}
```

---

## Catálogo de eventos — contrato de la Saga

| Evento | Productor | Consumidor(es) | Siguiente evento esperado |
|---|---|---|---|
| `ORDER_CREATED` | order-service | payment-service | `PAYMENT_PENDING` |
| `PAYMENT_PENDING` | payment-service | order-service, realtime-gateway | `PAYMENT_CONFIRMED` o `QR_EXPIRED` |
| `PAYMENT_CONFIRMED` | payment-service | inventory-service | `STOCK_RESERVED` |
| `PAYMENT_FAILED` | payment-service | order-service | `ORDER_CANCELLED` |
| `STOCK_RESERVED` | inventory-service | order-service | `ORDER_CONFIRMED` |
| `STOCK_RELEASED` | inventory-service | order-service | `ORDER_CANCELLED` |
| `ORDER_CONFIRMED` | order-service | notification-service, realtime-gateway | — (fin) |
| `ORDER_CANCELLED` | order-service | notification-service | — (fin) |

---

## Reglas de validación

### R1 — Cada evento debe incluir correlationId

```python
# ✅ CORRECTO — correlationId propagado
@dataclass
class OrderCreatedEvent:
    order_id: UUID
    total: Decimal
    currency: str
    items: list[OrderItem]
    buyer_id: UUID
    created_at: datetime
    correlation_id: UUID  # OBLIGATORIO

# ❌ INCORRECTO — sin correlationId
@dataclass
class OrderCreatedEvent:
    order_id: UUID
    total: Decimal  # sin correlation_id → imposible trazabilidad
```

### R2 — El productor del evento debe coincidir con el catálogo

```python
# ✅ CORRECTO — order-service publica ORDER_CREATED
class OrderService:
    async def create_order(self, cmd: CreateOrderCommand) -> Order:
        order = Order.create(...)
        await self.event_publisher.publish(
            OrderCreatedEvent(order_id=order.id, ...)
        )

# ❌ INCORRECTO — payment-service no debe publicar ORDER_CREATED
class PaymentService:
    async def generate_qr(self, order_id: UUID):
        await self.event_publisher.publish(OrderCreatedEvent(...))  # productor incorrecto
```

### R3 — Los consumers deben ser idempotentes

```python
# ✅ CORRECTO — consumer con check de idempotencia
async def handle_payment_confirmed(event: PaymentConfirmedEvent):
    existing = await payment_repo.find_by_webhook_ref(event.webhook_ref)
    if existing and existing.status == PaymentStatus.CONFIRMED:
        logger.info("Evento duplicado ignorado", webhook_ref=event.webhook_ref)
        return  # idempotente: no reprocesar

    await process_payment_confirmation(event)
```

### R4 — Los eventos de compensación deben ejecutarse ante fallo

```python
# ✅ CORRECTO — compensación ante expiración de QR
async def handle_qr_expired(event: QRExpiredEvent):
    # Saga compensación: liberar stock reservado
    await event_publisher.publish(StockReleasedEvent(
        order_id=event.order_id,
        product_id=event.product_id,
        correlation_id=event.correlation_id,
    ))
    # Luego: order-service cancela el pedido al recibir STOCK_RELEASED
```

### R5 — Dead Letter Queue para eventos no procesables

```python
# ✅ CORRECTO — DLQ configurada en RabbitMQ
QUEUE_CONFIG = {
    "x-dead-letter-exchange": "umss.dlx",
    "x-dead-letter-routing-key": "dlq.{queue_name}",
    "x-message-ttl": 3600000,  # 1 hora en DLQ
}
```

---

## Criterios de aceptación

| # | Criterio | Resultado esperado |
|---|---|---|
| CA-001 | `event_type` no está en el catálogo | `checks.tipo_en_catalogo: false` → `RECHAZAR_EVENTO` |
| CA-002 | Productor no coincide con catálogo | `checks.productor_correcto: false` → bloqueante en CI |
| CA-003 | `correlation_id` ausente en evento | `checks.correlation_id_presente: false` → bloqueante en CI |
| CA-004 | Consumer no es idempotente | `checks.payload_completo: false` → observación en revisión |
| CA-005 | Evento válido, productor correcto, todos checks OK | `evento_valido: true` → `PUBLICAR_EVENTO` |
| CA-006 | Fallo en paso post-pago sin compensación | `accion_recomendada: COMPENSAR` → `STOCK_RELEASED` + `ORDER_CANCELLED` |

---

## Flujo Saga completo (referencia visual)

Ver: [`diagrams/saga-state.mmd`](../../diagrams/saga-state.mmd)  
Ver: [`diagrams/sequence-qr-payment.mmd`](../../diagrams/sequence-qr-payment.mmd)

---

## Trazabilidad

| Elemento | Referencia |
|---|---|
| Caso de uso origen | `docs/FSD_v2.md` — FSD-UC-001 |
| Catálogo de eventos | `docs/architecture/EVENT_CATALOG.md` |
| ADR Saga | `docs/adr/ADR-0002-saga-pattern.md` |
| ADR Event-Driven | `docs/adr/ADR-0001-event-driven-architecture.md` |
| Test guardrail | `tests/guardrails/test_pr_fsd_003.py` |
| Prompt mapping | `docs/PROMPT_MAPPINGS_v1.md` |
