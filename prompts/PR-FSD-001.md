---
id: PR-FSD-001
version: "1.0"
título: Contrato IA — Validación de Confirmación de Pago QR (Webhook)
estado: Activo
fecha: 24/05/2026
flujo_cubierto: FSD-UC-001 — Compra con QR bancario (paso: recepción webhook)
servicio_responsable: payment-service
autores:
  - Rodriguez Gonzales Abad Melani
  - Vargas Sandoval Christian Bernardo
invariantes_referenciados:
  - INV-002 (idempotencia de pagos)
  - INV-003 (QR con TTL)
  - INV-005 (monto exacto)
  - INV-007 (HMAC en webhooks)
---

# PR-FSD-001 — Contrato IA: Validación de Confirmación de Pago QR

## Propósito

Este contrato define el comportamiento esperado del agente IA (o del sistema automatizado) al validar una solicitud de confirmación de pago proveniente del webhook bancario. Es utilizado en el ciclo SDLC para verificar que el código generado cumple con los invariantes del dominio antes de mergear a `release/`.

---

## Rol del agente en este flujo

```
Etapa: Revisión de código (pre-merge)
Disparador: PR que modifique payment-service/domain/ o payment-service/infrastructure/adapters/in/
Acción: Evaluar si el código cumple las validaciones del webhook de confirmación de pago
```

---

## Input (entradas requeridas al agente)

```json
{
  "order_id": "uuid-del-pedido",
  "webhook_ref": "referencia-única-del-banco",
  "amount": 150.00,
  "currency": "BOB",
  "timestamp": "2026-05-24T14:30:00Z",
  "hmac_signature": "sha256=abc123...",
  "hmac_secret_env_var": "BANK_WEBHOOK_SECRET"
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `order_id` | UUID | Identificador del pedido asociado |
| `webhook_ref` | string | Referencia única del banco (debe ser idempotente) |
| `amount` | decimal | Monto recibido del banco |
| `currency` | string | Moneda del pago (`BOB`) |
| `timestamp` | ISO 8601 | Marca temporal del webhook |
| `hmac_signature` | string | Firma HMAC-SHA256 del banco (`sha256=<hex>`) |
| `hmac_secret_env_var` | string | Variable de entorno que contiene el secreto HMAC |

---

## Output esperado (respuesta del agente)

```json
{
  "validacion_operacional": true,
  "checks": {
    "hmac_valido": true,
    "idempotente": true,
    "monto_exacto": true,
    "qr_vigente": true,
    "secreto_no_hardcodeado": true
  },
  "accion_recomendada": "CONFIRMAR_PEDIDO",
  "evento_a_publicar": "PAYMENT_CONFIRMED",
  "observaciones": ""
}
```

| Campo | Descripción |
|---|---|
| `validacion_operacional` | `true` si todos los checks pasan; `false` si alguno falla |
| `checks.hmac_valido` | La firma HMAC-SHA256 fue verificada correctamente |
| `checks.idempotente` | El `webhook_ref` no existe previamente en la tabla `payments` |
| `checks.monto_exacto` | `amount` == `Pedido.total` (sin diferencia de centavos) |
| `checks.qr_vigente` | El QR no ha superado los 300 segundos desde su creación |
| `checks.secreto_no_hardcodeado` | El secreto HMAC se lee de variable de entorno, no literal en código |
| `accion_recomendada` | `CONFIRMAR_PEDIDO` / `RECHAZAR_PAGO` / `DUPLICADO_IGNORAR` |
| `evento_a_publicar` | `PAYMENT_CONFIRMED` / `PAYMENT_FAILED` |

---

## Reglas de validación (invariantes)

### R1 — Validación HMAC obligatoria (INV-007)

```python
# ✅ CORRECTO — secreto desde variable de entorno
import hmac, hashlib, os

secret = os.environ["BANK_WEBHOOK_SECRET"].encode()
expected = hmac.new(secret, payload_bytes, hashlib.sha256).hexdigest()
if not hmac.compare_digest(f"sha256={expected}", received_signature):
    raise WebhookSignatureInvalidError()

# ❌ INCORRECTO — secreto hardcodeado
secret = b"mi_secreto_banco_123"  # PROHIBIDO por INV-006
```

### R2 — Idempotencia de webhook_ref (INV-002)

```python
# ✅ CORRECTO — verificar unicidad antes de procesar
existing = await payment_repo.find_by_webhook_ref(webhook_ref)
if existing:
    return HTTP_200_OK  # ya procesado, retornar 200 sin reprocesar

# ❌ INCORRECTO — procesar sin verificar duplicados
await process_payment(webhook_ref, amount)  # podría doble-procesar
```

### R3 — Verificación de monto exacto (INV-005)

```python
# ✅ CORRECTO — comparación exacta con Decimal
from decimal import Decimal
if Decimal(str(received_amount)) != order.total:
    raise PaymentAmountMismatchError(expected=order.total, received=received_amount)

# ❌ INCORRECTO — comparación con float (riesgo de errores de precisión)
if received_amount != float(order.total):  # nunca usar float para dinero
    ...
```

### R4 — Verificación de TTL del QR (INV-003)

```python
# ✅ CORRECTO — verificar que el QR no haya expirado
from datetime import datetime, timezone
elapsed = (datetime.now(timezone.utc) - order.qr_created_at).total_seconds()
if elapsed > 300:
    raise QRExpiredError(order_id=order.order_id)
```

---

## Criterios de aceptación

| # | Criterio | Resultado esperado |
|---|---|---|
| CA-001 | Webhook con HMAC inválido | `checks.hmac_valido: false` → `RECHAZAR_PAGO` |
| CA-002 | `webhook_ref` ya existente en DB | `checks.idempotente: false` → `DUPLICADO_IGNORAR` (HTTP 200) |
| CA-003 | Monto diferente al total del pedido | `checks.monto_exacto: false` → `RECHAZAR_PAGO` |
| CA-004 | QR con más de 300 segundos | `checks.qr_vigente: false` → `RECHAZAR_PAGO` |
| CA-005 | Secreto HMAC hardcodeado en código | `checks.secreto_no_hardcodeado: false` → bloqueante en CI |
| CA-006 | Todos los checks válidos | `validacion_operacional: true` → `CONFIRMAR_PEDIDO` |

---

## Trazabilidad

| Elemento | Referencia |
|---|---|
| Caso de uso origen | `docs/FSD_v2.md` — FSD-UC-001 |
| Invariantes | `AGENTS.md` §Invariantes del dominio INV-002, INV-003, INV-005, INV-007 |
| Evento producido | `docs/architecture/EVENT_CATALOG.md` — `PAYMENT_CONFIRMED` |
| Diagrama de flujo | `diagrams/sequence-qr-payment.mmd` |
| Test guardrail | `tests/guardrails/test_pr_fsd_001.py` |
| Prompt mapping | `docs/PROMPT_MAPPINGS_v1.md` |
