---
name: event-catalog-author
description: >
  Crea y actualiza el catálogo de eventos de UMSS Market en
  docs/architecture/EVENT_CATALOG.md. Valida que cada evento tenga productor
  correcto, consumidores correctos, payload completo con correlationId y
  alineación con los ADRs vigentes. También genera fragmentos de código Python
  (dataclass) para los domain events. Activar con
  "@event-catalog-author <nuevo-evento|actualizar|validar>".
allowed-tools:
  - read
  - edit
model-tier: sonnet
fsd-version-min: v0.1
status: stable
owner: G1 — Rodriguez / Vargas
---

# Skill: event-catalog-author — Crear y mantener el catálogo de eventos

> **Activación**: `@event-catalog-author nuevo <NOMBRE_EVENTO>` o `@event-catalog-author validar`  
> Ejemplo: `@event-catalog-author nuevo PRODUCT_UPDATED`

## 1. Cuándo activarlo (triggers)

- DURANTE: incorporación de un nuevo evento al sistema, modificación del payload de un evento existente, o validación del catálogo antes de un release.
- ARRANCA cuando: el usuario invoca `"@event-catalog-author"` o solicita "agregar evento X" o "validar el catálogo".
- NO ACTIVAR cuando: el evento aún no tiene productor y consumidor definidos; este skill documenta eventos de arquitectura decidida, no inventa flujos.

## 2. Entradas obligatorias

Para **nuevo evento**:
- Nombre del evento (`SCREAMING_SNAKE_CASE`).
- Servicio productor.
- Servicios consumidores.
- Campos del payload (nombre + tipo + descripción).
- Trigger (qué acción lo genera).

Para **validar catálogo**:
- Sin entradas adicionales; el skill lee `docs/architecture/EVENT_CATALOG.md`.

Si falta productor o consumidor para un nuevo evento, responder: `"Necesito el productor y al menos un consumidor antes de documentar el evento."`

## 3. Fuentes de verdad (precedencia)

1. `docs/architecture/EVENT_CATALOG.md` — catálogo autoritativo vigente.
2. `AGENTS.md` §Eventos del sistema — tabla de referencia rápida (sincronizar si hay cambios).
3. `docs/adr/ADR-0001-event-driven-architecture.md` — patrones de publicación/suscripción.
4. `docs/adr/ADR-0002-saga-pattern.md` — secuencia de eventos de la Saga.
5. `docs/DTI.md` §7 — catálogo resumido en el DTI.
6. `diagrams/event-flow.mmd` y `diagrams/saga-state.mmd` — representación visual.

## 4. Catálogo vigente de UMSS Market (v2.0)

| Evento | Productor | Consumidor(es) | Estado |
|---|---|---|---|
| `ORDER_CREATED` | order-service | payment-service | ✅ Activo |
| `PAYMENT_PENDING` | payment-service | order-service, realtime-gateway | ✅ Activo |
| `PAYMENT_CONFIRMED` | payment-service | inventory-service | ✅ Activo |
| `PAYMENT_FAILED` | payment-service | order-service | ✅ Activo |
| `STOCK_RESERVED` | inventory-service | order-service | ✅ Activo |
| `STOCK_RELEASED` | inventory-service | order-service | ✅ Activo |
| `ORDER_CONFIRMED` | order-service | notification-service, realtime-gateway | ✅ Activo |
| `ORDER_CANCELLED` | order-service | notification-service | ✅ Activo |

## 5. Estructura canónica de una entrada del catálogo

```markdown
### EVENT_NAME

| Campo | Valor |
|---|---|
| Tipo | EVENT_NAME |
| Productor | <servicio> |
| Consumidor(es) | <servicio1>, <servicio2> |
| Exchange RabbitMQ | umss.<dominio>.exchange |
| Routing Key | <dominio>.<accion>.<resultado> |
| Trigger | <qué acción lo genera> |
| Idempotente | Sí / No |

#### Payload
```python
@dataclass
class EventNameEvent:
    event_id: UUID          # identificador único del evento
    event_type: str         # "EVENT_NAME"
    order_id: UUID          # FK al aggregate Order
    correlation_id: UUID    # propagado desde el evento origen
    timestamp: datetime     # UTC
    # campos específicos del evento...
```

#### Flujo Saga
- Precede a: `SIGUIENTE_EVENTO`
- Compensación: `EVENTO_COMPENSACION` (si el flujo falla)
```

## 6. Procedimiento

### Para nuevo evento
1. Verificar que el nombre sigue `SCREAMING_SNAKE_CASE`.
2. Confirmar que el productor está en la lista de servicios de `AGENTS.md` §Capas arquitectónicas.
3. Confirmar que todos los consumidores están en la misma lista.
4. Verificar que el `correlationId` está incluido en el payload.
5. Verificar posición en la Saga: identificar el evento que lo precede y el que lo sigue.
6. Identificar el evento de compensación (si aplica).
7. Añadir la entrada al `docs/architecture/EVENT_CATALOG.md` con la estructura canónica.
8. Actualizar `AGENTS.md` §Eventos del sistema (tabla de referencia rápida).
9. Actualizar `docs/DTI.md` §7 si el evento es parte del happy path principal.
10. Actualizar `diagrams/event-flow.mmd` o `diagrams/saga-state.mmd` si aplica.

### Para validar catálogo
1. Leer `docs/architecture/EVENT_CATALOG.md`.
2. Para cada evento, verificar:
   - El payload incluye `event_id`, `event_type`, `correlation_id`, `timestamp`.
   - El productor coincide con la tabla de `AGENTS.md`.
   - Los consumidores coinciden con la tabla de `AGENTS.md`.
   - Existe un evento de compensación para todos los eventos que pueden fallar.
3. Generar reporte de validación.

## 7. Reglas de naming para eventos

```
✅ Correcto:
  ORDER_CREATED, PAYMENT_CONFIRMED, STOCK_RESERVED
  → Patrón: AGGREGATE_PAST_PARTICIPIO

❌ Incorrecto:
  createOrder       → no es un evento de dominio, es un comando
  OrderCreated      → usar SCREAMING_SNAKE_CASE
  ORDER_CREATE      → usar participio pasado (CREATED, no CREATE)
  ProcessPayment    → es un comando, no un evento
```

## 8. Salida esperada

- Entrada añadida en `docs/architecture/EVENT_CATALOG.md` con estructura completa.
- Actualización de `AGENTS.md` §Eventos del sistema.
- Dataclass Python generada para el domain event.
- Si es un evento de Saga: actualización de `diagrams/saga-state.mmd` propuesta.

## 9. Verificación ("bien hecho")

- El evento tiene productor y consumidores correctos según `AGENTS.md`.
- El payload incluye `event_id`, `event_type`, `correlation_id` y `timestamp` (UTC).
- El naming sigue el patrón `AGGREGATE_PAST_PARTICIPIO`.
- Si el evento puede fallar, tiene evento de compensación definido.
- La tabla en `AGENTS.md` §Eventos del sistema está sincronizada.
- `docs/DTI.md` §7 está actualizado si el evento es del happy path.

## 10. Anti-patrones específicos

- **Evento sin correlationId**: imposibilita trazabilidad distribuida — siempre incluir.
- **Comando disfrazado de evento**: `PROCESS_PAYMENT` es un comando; `PAYMENT_CONFIRMED` es un evento.
- **Productor incorrecto**: order-service no puede publicar `PAYMENT_CONFIRMED` — verificar siempre.
- **Sin compensación**: todo evento que puede fallar en mitad de una Saga necesita su compensación.
- **Payload con datos mutables**: los eventos son inmutables — no incluir referencias a objetos modificables.
- **Timestamp sin zona horaria**: siempre `datetime` con `timezone.utc` — nunca naive datetime.

## 11. Mini ejemplo de invocación

> "@event-catalog-author nuevo PRODUCT_RESTOCKED — publicado por inventory-service cuando el stock de un producto se repone manualmente por el vendedor, consumido por catalog-service para actualizar disponibilidad y notification-service para alertar a compradores en espera."

> "@event-catalog-author validar — revisa el catálogo completo y reporta cualquier evento sin compensación o con campos faltantes en el payload."

## 12. Registro de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0.0 | 25/05/2026 | Rodriguez / Vargas | Versión inicial para UMSS Market release/2.0.0 |
