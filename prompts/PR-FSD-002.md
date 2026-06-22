---
id: PR-FSD-002
version: "1.0"
título: Contrato IA — Validación de Disponibilidad y Reserva de Stock
estado: Activo
fecha: 24/05/2026
flujo_cubierto: FSD-UC-001 — Compra con QR bancario (paso: verificación de stock)
servicio_responsable: inventory-service
autores:
  - Rodriguez Gonzales Abad Melani
  - Vargas Sandoval Christian Bernardo
invariantes_referenciados:
  - INV-001 (stock no negativo)
---

# PR-FSD-002 — Contrato IA: Validación de Disponibilidad y Reserva de Stock

## Propósito

Este contrato define el comportamiento esperado del agente IA al evaluar si el código del `inventory-service` garantiza correctamente la disponibilidad de stock y su reserva atómica durante el flujo de compra. Es utilizado en CI/CD pre-merge para asegurar que la invariante `Product.stock >= 0` no pueda ser violada bajo ninguna condición de carrera.

---

## Rol del agente en este flujo

```
Etapa: Revisión de código (pre-merge) + generación de código
Disparador: PR que modifique inventory-service/domain/ o inventory-service/infrastructure/
Acción: Evaluar si el código de reserva de stock es atómico y no permite stock negativo
```

---

## Input (entradas requeridas al agente)

```json
{
  "product_id": "uuid-del-producto",
  "available_stock": 10,
  "requested_quantity": 3,
  "reservation_ttl_seconds": 300,
  "order_id": "uuid-del-pedido",
  "correlation_id": "uuid-de-correlacion"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `product_id` | UUID | Producto a reservar |
| `available_stock` | integer | Stock actual en base de datos |
| `requested_quantity` | integer | Cantidad solicitada por el comprador |
| `reservation_ttl_seconds` | integer | TTL de la reserva temporal en Redis (300s) |
| `order_id` | UUID | Pedido que origina la reserva |
| `correlation_id` | UUID | ID de correlación del flujo distribuido |

---

## Output esperado (respuesta del agente)

```json
{
  "stock_disponible": true,
  "checks": {
    "stock_no_negativo": true,
    "operacion_atomica": true,
    "reserva_con_ttl": true,
    "correlation_id_incluido": true
  },
  "accion_recomendada": "RESERVAR_STOCK",
  "evento_a_publicar": "STOCK_RESERVED",
  "stock_resultante": 7,
  "observaciones": ""
}
```

| Campo | Descripción |
|---|---|
| `stock_disponible` | `true` si `available_stock >= requested_quantity` |
| `checks.stock_no_negativo` | La operación SQL garantiza `stock - qty >= 0` (cláusula WHERE) |
| `checks.operacion_atomica` | El decremento es atómico (no hay TOCTOU entre lectura y escritura) |
| `checks.reserva_con_ttl` | La reserva en Redis tiene TTL = 300 segundos |
| `checks.correlation_id_incluido` | El `correlation_id` se propaga en el evento publicado |
| `accion_recomendada` | `RESERVAR_STOCK` / `RECHAZAR_POR_STOCK_INSUFICIENTE` |
| `evento_a_publicar` | `STOCK_RESERVED` / `STOCK_UNAVAILABLE` |
| `stock_resultante` | Stock esperado después de la reserva |

---

## Reglas de validación (invariantes)

### R1 — Operación atómica con cláusula de guarda (INV-001)

```python
# ✅ CORRECTO — atómico con WHERE guarda
result = await session.execute(
    update(Product)
    .where(Product.id == product_id)
    .where(Product.stock >= requested_quantity)   # guarda atómica
    .values(stock=Product.stock - requested_quantity)
    .returning(Product.stock)
)
if result.rowcount == 0:
    raise InsufficientStockError(product_id=product_id, requested=requested_quantity)

# ❌ INCORRECTO — TOCTOU: leer y luego actualizar en pasos separados
product = await session.get(Product, product_id)
if product.stock >= requested_quantity:
    product.stock -= requested_quantity  # condición de carrera!
    await session.commit()
```

### R2 — Reserva temporal en Redis con TTL (INV-003)

```python
# ✅ CORRECTO — reserva con TTL exacto de 300 segundos
reservation_key = f"stock:reservation:{order_id}:{product_id}"
await redis.setex(
    reservation_key,
    300,  # TTL = 300 segundos exactos
    requested_quantity
)

# ❌ INCORRECTO — sin TTL (la reserva nunca expira)
await redis.set(reservation_key, requested_quantity)  # sin expiración
```

### R3 — Liberación automática al expirar TTL

```python
# ✅ CORRECTO — scheduler que detecta reservas expiradas y libera stock
async def release_expired_reservations():
    expired_keys = await redis.scan_match("stock:reservation:*")
    for key in expired_keys:
        ttl = await redis.ttl(key)
        if ttl <= 0:
            order_id, product_id = parse_reservation_key(key)
            await publish_event(STOCK_RELEASED, order_id=order_id)
```

### R4 — correlationId propagado en evento (AGENTS.md restricción)

```python
# ✅ CORRECTO — correlationId incluido en el evento
await event_publisher.publish(StockReservedEvent(
    order_id=order_id,
    product_id=product_id,
    quantity=requested_quantity,
    correlation_id=correlation_id,  # NUNCA omitir
))
```

---

## Criterios de aceptación

| # | Criterio | Resultado esperado |
|---|---|---|
| CA-001 | `available_stock < requested_quantity` | `stock_disponible: false` → `RECHAZAR_POR_STOCK_INSUFICIENTE` |
| CA-002 | Operación SQL sin cláusula `WHERE stock >= qty` | `checks.operacion_atomica: false` → bloqueante en CI |
| CA-003 | Reserva Redis sin TTL | `checks.reserva_con_ttl: false` → bloqueante en CI |
| CA-004 | `correlation_id` ausente en evento | `checks.correlation_id_incluido: false` → bloqueante en CI |
| CA-005 | `available_stock >= requested_quantity` y código correcto | `accion_recomendada: RESERVAR_STOCK` → `STOCK_RESERVED` publicado |
| CA-006 | Stock resultante sería negativo | `stock_no_negativo: false` → operación rechazada por guarda SQL |

---

## Trazabilidad

| Elemento | Referencia |
|---|---|
| Caso de uso origen | `docs/FSD_v2.md` — FSD-UC-001 (paso 3: verificar stock) |
| Invariante principal | `AGENTS.md` §Invariantes del dominio INV-001 |
| Evento producido | `docs/architecture/EVENT_CATALOG.md` — `STOCK_RESERVED` |
| Evento compensación | `docs/architecture/EVENT_CATALOG.md` — `STOCK_RELEASED` |
| Diagrama saga | `diagrams/saga-state.mmd` |
| Diagrama secuencia | `diagrams/sequence-qr-payment.mmd` |
| Test guardrail | `tests/guardrails/test_pr_fsd_002.py` |
| Prompt mapping | `docs/PROMPT_MAPPINGS_v1.md` |
