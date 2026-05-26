---
name: distributed-architecture-reviewer
description: >
  Revisa decisiones de arquitectura distribuida en UMSS Market contra los ADRs
  vigentes, invariantes del dominio y patrones de resiliencia declarados.
  Evalúa PRs, fragmentos de código o propuestas arquitectónicas e identifica
  violaciones de idempotencia, condiciones de carrera, ausencia de compensaciones
  y anti-patrones de sistemas distribuidos. Activar con
  "@distributed-arch-reviewer revisar <código|decisión|PR>".
allowed-tools:
  - read
  - edit
model-tier: sonnet
fsd-version-min: v0.1
status: stable
owner: G1 — Rodriguez / Vargas
---

# Skill: distributed-architecture-reviewer — Revisar decisiones de arquitectura distribuida

> **Activación**: `@distributed-arch-reviewer revisar <código|decisión|PR>`  
> Ejemplo: `@distributed-arch-reviewer revisar el handler del webhook en payment-service`

## 1. Cuándo activarlo (triggers)

- DURANTE: revisión de PRs que toquen consumers/publishers de eventos, handlers de webhooks, operaciones de stock o cualquier flujo distribuido.
- ARRANCA cuando: el usuario invoca `"@distributed-arch-reviewer"` o adjunta código de un microservicio para revisión.
- NO ACTIVAR cuando: la revisión es solo de lógica de negocio sin componente distribuido; usar la lógica de dominio directamente.

## 2. Entradas obligatorias

El usuario MUST proporcionar al menos una de:

- Fragmento de código Python (FastAPI handler, consumer AMQP, repository).
- Descripción de una decisión arquitectónica propuesta.
- ID de PR o descripción de los cambios a revisar.

Si no hay código ni descripción concreta, responder: `"Necesito el fragmento de código o la descripción de la decisión para revisar."`

## 3. Fuentes de verdad (precedencia)

1. `AGENTS.md` §Invariantes del dominio — los 7 invariantes no negociables.
2. `docs/adr/ADR-0001-event-driven-architecture.md` — patrones de eventos.
3. `docs/adr/ADR-0002-saga-pattern.md` — flujos Saga y compensaciones.
4. `docs/adr/ADR-0003-hexagonal-architecture.md` — regla de dependencia.
5. `docs/architecture/EVENT_CATALOG.md` — productores/consumidores canónicos.
6. `docs/PR-FSD-001.md`, `docs/PR-FSD-002.md`, `docs/PR-FSD-003.md` — contratos funcionales IA.

## 4. Checklist de revisión

### Bloque A — Invariantes del dominio (bloqueantes)

| # | Invariante | Verificación |
|---|---|---|
| INV-001 | Stock no negativo | `UPDATE ... WHERE stock >= qty` (cláusula de guarda atómica) |
| INV-002 | Idempotencia de pagos | Check de `webhook_ref` único ANTES de procesar |
| INV-003 | QR TTL = 300s | Reserva Redis con `setex(key, 300, value)` |
| INV-004 | RU obligatorio | Validación SIIS en el adaptador de entrada, no salteable |
| INV-005 | Monto exacto | Comparación `Decimal` (no `float`) con `==` |
| INV-006 | Sin secretos hardcodeados | `os.environ["KEY"]` — no literales en código |
| INV-007 | HMAC en webhooks | `hmac.compare_digest()` antes de cualquier procesamiento |

### Bloque B — Patrones de resiliencia

| Patrón | Verificación |
|---|---|
| Retry con backoff | Reintentos con exponential backoff en publishers AMQP |
| Dead Letter Queue | Cola DLQ configurada para eventos no procesables |
| Circuit Breaker | Protección en llamadas a API Bancaria y SIIS UMSS |
| Idempotency Key | Presente en todos los handlers de eventos |
| Bloqueo optimista | `version` field en aggregates con múltiples escrituras |

### Bloque C — Arquitectura hexagonal (ADR-0003)

| Regla | Verificación |
|---|---|
| Regla de dependencia | `domain/` no importa de `fastapi`, `sqlalchemy`, `aio_pika`, `redis` |
| Puertos como ABC | Interfaces de salida definidas como `ABC` en `domain/ports/` |
| Lógica en use cases | Los routers FastAPI no contienen lógica de negocio |
| Aggregates puros | Los aggregates no tienen imports de infraestructura |

### Bloque D — Event-Driven (ADR-0001)

| Regla | Verificación |
|---|---|
| Productor correcto | El servicio que publica el evento coincide con el catálogo |
| correlationId presente | Todos los eventos incluyen `correlation_id` |
| Payload completo | El payload tiene todos los campos requeridos por el contrato |
| Consumidores correctos | Los servicios que consumen el evento coinciden con el catálogo |

## 5. Procedimiento de revisión

1. **Identificar el tipo de código**: handler de webhook, consumer AMQP, repository, use case.
2. **Aplicar Bloque A** (invariantes): cualquier violación es **bloqueante** — el código no debe mergear.
3. **Aplicar Bloque B** (resiliencia): observaciones de severidad media — recomendar corrección.
4. **Aplicar Bloque C** (hexagonal): si el código toca la capa de dominio.
5. **Aplicar Bloque D** (eventos): si el código produce o consume eventos AMQP.
6. **Generar reporte** con formato estándar (ver §6 Salida esperada).

## 6. Salida esperada

```markdown
## Resultado de revisión — distributed-architecture-reviewer

### 🔴 Bloqueantes (INV violados)
- [ ] INV-002: El handler no verifica idempotencia de webhook_ref antes de procesar
  → Línea 42: `await process_payment(data)` sin check previo

### 🟡 Observaciones (resiliencia)
- [ ] Retry no implementado en el publisher AMQP (líneas 78-85)
- [ ] DLQ no configurada para la cola `payment.webhook.queue`

### 🟢 Correcto
- [x] INV-001: Operación de stock atómica con cláusula WHERE (línea 23)
- [x] INV-007: HMAC validado con hmac.compare_digest() (línea 15)
- [x] correlationId presente en todos los eventos (líneas 91, 105)

### Veredicto: RECHAZAR / APROBAR CON OBSERVACIONES / APROBAR
```

## 7. Anti-patrones específicos de UMSS Market

- **TOCTOU en stock**: leer stock y luego decrementarlo en pasos separados → siempre atómico con WHERE.
- **Float para dinero**: `float(150.00) != 150.00` en precisión → siempre `Decimal`.
- **Secreto HMAC en código**: `secret = b"mi_clave"` → siempre `os.environ["BANK_HMAC_SECRET"]`.
- **HTTP 4xx en webhook bancario**: responder 4xx al banco ante duplicado → responder siempre HTTP 200.
- **Saga sin compensación**: flujo de pago sin manejo del caso TTL expirado → STOCK_RELEASED obligatorio.
- **Eventos sin correlationId**: imposibilita trazabilidad distribuida → campo obligatorio.
- **Lógica en router FastAPI**: validaciones de negocio en el router → mover al use case.

## 8. Mini ejemplo de invocación

> "@distributed-arch-reviewer revisa este handler de webhook:
> ```python
> @router.post('/webhooks/payment')
> async def handle_payment(data: PaymentWebhook):
>     # Procesar directamente sin verificar idempotencia
>     await payment_service.confirm(data.order_id, data.amount)
>     return {'status': 'ok'}
> ```"

## 9. Modos de fallo conocidos

- Código sin contexto suficiente (solo un método sin imports) → pedir el archivo completo o la clase.
- Decisión arquitectónica que contradice un ADR `Aceptada` → STOP, no aprobar; escalar para revisión de ADR.
- INV violado en código crítico de producción → STOP, bloqueante inmediato; no mergear.

## 10. Registro de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0.0 | 25/05/2026 | Rodriguez / Vargas | Versión inicial para UMSS Market release/2.0.0 |
