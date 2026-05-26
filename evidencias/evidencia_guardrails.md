# Evidencia de Guardrails — UMSS Market

> Documento de evidencia del sistema de guardrails declarado en el DTI §23 (Evaluación de Guardrails) y referenciado en los contratos funcionales IA `PR-FSD-001`, `PR-FSD-002` y `PR-FSD-003`.
>
> **Propósito**: demostrar que los invariantes del dominio (INV-001 a INV-007) tienen cobertura de guardrail automatizable y que los contratos IA producen outputs verificables.

---

# 1. Objetivo

Los guardrails en UMSS Market son mecanismos de **control automático** que verifican:

1. Que los outputs generados por prompts IA cumplen los contratos funcionales.
2. Que el código producido no viola los invariantes del dominio declarados en `AGENTS.md`.
3. Que los flujos críticos (pago QR, reserva stock, coordinación de eventos) son auditables.

---

# 2. Matriz de Guardrails por Invariante

| ID Guardrail | Invariante cubierto | Tipo | Bloqueante |
|---|---|---|---|
| TEST-G-001 | INV-001 — Stock no negativo | SQL audit + test concurrencia | ✅ Sí |
| TEST-G-002 | INV-002 — Idempotencia de pagos | DB constraint + test duplicado | ✅ Sí |
| TEST-G-003 | INV-003 — QR TTL = 300s | Redis TTL + test expiración | ✅ Sí |
| TEST-G-004 | INV-006 — Sin secretos hardcodeados | Static analysis (Bandit/trufflehog) | ✅ Sí |
| TEST-G-005 | INV-007 — HMAC en webhooks | Code review + test timing attack | ✅ Sí |

---

# 3. TEST-G-001 — Stock No Negativo

**Invariante**: `Product.stock >= 0` en todo momento. La operación debe ser atómica.

---

## 3.1 Descripción del guardrail

El guardrail verifica que el código de descuento de stock use la cláusula `WHERE stock >= cantidad` en la misma operación SQL, eliminando la condición de carrera TOCTOU (Time-Of-Check-Time-Of-Use).

---

## 3.2 Operación SQL esperada (correcta)

```sql
UPDATE products
SET stock = stock - :qty
WHERE id = :product_id
  AND stock >= :qty
RETURNING stock;
```

Si `RETURNING` devuelve `null` → stock insuficiente, la operación no se ejecutó.

---

## 3.3 Operación SQL prohibida (incorrecta — TOCTOU)

```sql
-- PROHIBIDO: dos operaciones separadas
SELECT stock FROM products WHERE id = ?;
-- (aquí otro proceso puede decrementar stock)
UPDATE products SET stock = stock - ? WHERE id = ?;
```

---

## 3.4 Caso de prueba

| Aspecto | Valor |
|---|---|
| Nombre | `test_stock_no_negativo_concurrencia` |
| Precondición | product.stock = 1 |
| Acción | 2 requests concurrentes solicitando qty=1 |
| Resultado esperado | Solo 1 operación tiene éxito; stock final = 0 |
| Resultado rechazado | stock = -1 (invariante violada) |
| Estado | ✅ Cubierto por PR-FSD-002 |

---

## 3.5 Vinculación

| Artefacto | Referencia |
|---|---|
| AGENTS.md | INV-001 |
| PR-FSD-002 | §checks.operacion_atomica |
| ADR-0002 | Compensación STOCK_RELEASED |
| inventory-service | `domain/aggregates/product.py` |

---

# 4. TEST-G-002 — Idempotencia de Pagos

**Invariante**: Un `webhook_ref` solo puede procesarse una vez.

---

## 4.1 Descripción del guardrail

Índice único en la columna `webhook_ref` de la tabla `payments`. Si llega un webhook duplicado → HTTP 200 sin reprocesar (no HTTP 4xx que haría reintentar al banco).

---

## 4.2 Esquema de base de datos

```sql
CREATE TABLE payments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id),
    webhook_ref VARCHAR(255) NOT NULL,
    amount      NUMERIC(12,2) NOT NULL,
    status      VARCHAR(50) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_payments_webhook_ref UNIQUE (webhook_ref)  -- guardrail DDL
);
```

---

## 4.3 Comportamiento ante duplicado

```python
try:
    db.execute(INSERT_PAYMENT_SQL, {"webhook_ref": webhook_ref, ...})
    db.commit()
    return {"status": "PROCESSED"}
except UniqueViolationError:
    # Idempotente: ya fue procesado, retornar 200 sin rehacer
    return {"status": "ALREADY_PROCESSED"}  # HTTP 200
```

---

## 4.4 Caso de prueba

| Aspecto | Valor |
|---|---|
| Nombre | `test_webhook_idempotente` |
| Precondición | webhook_ref "WH-001" ya procesado en BD |
| Acción | Reenvío del mismo webhook con webhook_ref "WH-001" |
| Resultado esperado | HTTP 200, `status: ALREADY_PROCESSED`, pedido no duplicado |
| Resultado rechazado | HTTP 200 con reprocesamiento (crea pago duplicado) |
| Estado | ✅ Cubierto por PR-FSD-001 |

---

## 4.5 Vinculación

| Artefacto | Referencia |
|---|---|
| AGENTS.md | INV-002 |
| PR-FSD-001 | §checks.idempotente |
| payment-service | `infrastructure/adapters/payment_repository.py` |

---

# 5. TEST-G-003 — QR TTL = 300 segundos

**Invariante**: Cada QR expira en exactamente 300 segundos desde su creación.

---

## 5.1 Descripción del guardrail

La reserva de stock en Redis y el QR asociado deben usar `setex(key, 300, value)`. Al expirar: pedido → CANCELADO + stock liberado automáticamente vía evento `STOCK_RELEASED`.

---

## 5.2 Código esperado (correcto)

```python
import redis.asyncio as redis

async def create_qr_reservation(order_id: str, product_id: str) -> None:
    r = redis.from_url(os.environ["REDIS_URL"])
    await r.setex(
        name=f"reservation:{order_id}:{product_id}",
        time=300,  # exactamente 300 segundos
        value="RESERVED"
    )
```

---

## 5.3 Código prohibido (sin TTL)

```python
# PROHIBIDO: sin expiración
await r.set(f"reservation:{order_id}", "RESERVED")  # no expira nunca
```

---

## 5.4 Flujo de expiración

```
t=0s   QR generado → Redis setex 300s → Estado: PENDING
t=300s Redis expira key → Listener TTL → Evento STOCK_RELEASED
       order.status → CANCELLED
       product.stock += qty_reservada  (compensación)
```

---

## 5.5 Caso de prueba

| Aspecto | Valor |
|---|---|
| Nombre | `test_qr_ttl_expiracion` |
| Precondición | QR creado con stock reservado, TTL configurado |
| Acción | Simular expiración del TTL (mock Redis keyspace notification) |
| Resultado esperado | Pedido CANCELADO + stock liberado (STOCK_RELEASED publicado) |
| Resultado rechazado | Stock bloqueado indefinidamente después de expiración |
| Estado | ✅ Cubierto por PR-FSD-001 y PR-FSD-002 |

---

## 5.6 Vinculación

| Artefacto | Referencia |
|---|---|
| AGENTS.md | INV-003 |
| PR-FSD-001 | §checks.qr_vigente |
| PR-FSD-002 | §checks.reserva_con_ttl |
| ADR-0002 | Compensación (cancelación) |

---

# 6. TEST-G-004 — Sin Secretos Hardcodeados

**Invariante**: Ningún secreto, API key, contraseña o token en código fuente.

---

## 6.1 Descripción del guardrail

Análisis estático en CI/CD usando herramientas como `bandit` (Python) o `trufflehog` para detectar credenciales en el código fuente antes del merge.

---

## 6.2 Patrones prohibidos detectables

```python
# PROHIBIDOS — detectados por el guardrail
HMAC_SECRET = b"mi_secreto_banco"              # hardcoded bytes
API_KEY = "sk-live-abc123xyz"                  # hardcoded string
DB_PASSWORD = "password123"                    # hardcoded password
JWT_SECRET = "super_secret_key"               # hardcoded JWT secret
```

---

## 6.3 Patrón correcto (variables de entorno)

```python
import os
HMAC_SECRET = os.environ["HMAC_WEBHOOK_SECRET"].encode()
API_KEY = os.environ["BANCO_API_KEY"]
DB_URL = os.environ["DATABASE_URL"]
JWT_SECRET = os.environ["JWT_SECRET_KEY"]
```

---

## 6.4 Caso de prueba

| Aspecto | Valor |
|---|---|
| Nombre | `test_no_hardcoded_secrets` |
| Herramienta | Bandit (`B105`, `B106`, `B107`) + trufflehog |
| Acción | Escanear archivos `*.py` del repositorio |
| Resultado esperado | 0 hallazgos de severidad HIGH/CRITICAL |
| Resultado rechazado | Cualquier finding de credencial hardcodeada |
| Estado | ✅ Cubierto por AGENTS.md §Restricciones — Prohibido |

---

## 6.5 Vinculación

| Artefacto | Referencia |
|---|---|
| AGENTS.md | INV-006 + §Prohibido |
| PR-FSD-001 | §checks.secreto_no_hardcodeado |
| DTI §13 | Seguridad — Secrets Management |

---

# 7. TEST-G-005 — HMAC en Webhooks Bancarios

**Invariante**: Todo webhook bancario entrante debe validar HMAC-SHA256 antes de procesar el payload.

---

## 7.1 Descripción del guardrail

La firma HMAC debe verificarse con `hmac.compare_digest()` (resistente a timing attacks) antes de cualquier acceso al payload. Cualquier código que acceda a datos del payload antes de verificar HMAC es bloqueante.

---

## 7.2 Implementación esperada

```python
import hmac
import hashlib
import os

def verify_webhook_hmac(
    payload_bytes: bytes,
    signature_header: str,   # formato "sha256=<hex>"
) -> bool:
    secret = os.environ["HMAC_WEBHOOK_SECRET"].encode()
    expected = hmac.new(secret, payload_bytes, hashlib.sha256).hexdigest()
    received = signature_header.removeprefix("sha256=")
    # compare_digest evita timing attacks
    return hmac.compare_digest(expected, received)

# En el handler del webhook:
async def webhook_handler(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Bank-Signature", "")

    if not verify_webhook_hmac(body, signature):
        raise HTTPException(status_code=401, detail="Invalid HMAC signature")

    # SOLO AQUÍ se procesa el payload (post-validación)
    payload = json.loads(body)
    ...
```

---

## 7.3 Código prohibido (sin HMAC)

```python
# PROHIBIDO: procesar payload SIN validar HMAC primero
async def webhook_handler(request: Request):
    payload = await request.json()  # payload accedido ANTES del HMAC check
    process_payment(payload)        # crítico: sin autenticación del origen
```

---

## 7.4 Caso de prueba — timing attack

| Aspecto | Valor |
|---|---|
| Nombre | `test_hmac_timing_attack_mitigation` |
| Acción | Comparar tiempos de respuesta para firmas válidas vs inválidas con 1000 iteraciones |
| Resultado esperado | Distribución de tiempos estadísticamente idéntica (p95 < 5ms diferencia) |
| Resultado rechazado | Diferencia significativa de tiempo → revela longitud de coincidencia |
| Estado | ✅ Cubierto por PR-FSD-001 |

---

## 7.5 Caso de prueba — HMAC inválido

| Aspecto | Valor |
|---|---|
| Nombre | `test_webhook_hmac_invalido` |
| Precondición | Webhook con payload alterado y HMAC original |
| Resultado esperado | HTTP 401, `E_HMAC_INVALID`, ningún dato procesado |
| Resultado rechazado | HTTP 200 con procesamiento del payload adulterado |

---

## 7.6 Vinculación

| Artefacto | Referencia |
|---|---|
| AGENTS.md | INV-007 + §Prohibido |
| PR-FSD-001 | §checks.hmac_valido |
| DTI §13 | Seguridad — Webhook Authentication |

---

# 8. Cobertura Global de Guardrails

| Invariante | Guardrail | Tipo | Estado |
|---|---|---|---|
| INV-001 Stock ≥ 0 | TEST-G-001 | SQL atómica + test concurrencia | ✅ Definido |
| INV-002 Idempotencia | TEST-G-002 | DB UNIQUE constraint + test duplicado | ✅ Definido |
| INV-003 QR TTL 300s | TEST-G-003 | Redis setex + test expiración | ✅ Definido |
| INV-004 RU obligatorio | N/A (validación SIIS externa) | Test integración SIIS mock | 📋 Planificado |
| INV-005 Monto exacto | TEST-G-001 (parcial) | Decimal comparison test | ✅ Definido en PR-FSD-001 |
| INV-006 Sin secretos | TEST-G-004 | Bandit + trufflehog CI/CD | ✅ Definido |
| INV-007 HMAC | TEST-G-005 | Timing test + HMAC invalid test | ✅ Definido |

**Cobertura**: 6/7 invariantes con guardrail definido (85.7%). INV-004 planificado para Release 2.1.

---

# 9. Integración en CI/CD

Los guardrails TEST-G-001 a TEST-G-005 se integran en el pipeline de GitHub Actions:

```yaml
# .github/workflows/guardrails.yml (referencia — no implementado en Módulo 4)
jobs:
  guardrails:
    steps:
      - name: TEST-G-004 — Secrets scan
        run: bandit -r . -ll -ii  # HIGH/CRITICAL bloqueante

      - name: TEST-G-001/002/003 — Domain invariants
        run: pytest tests/guardrails/ -v --tb=short

      - name: TEST-G-005 — HMAC coverage
        run: pytest tests/security/test_hmac.py -v
```

**Política**: `blocking: true` en los 5 guardrails — ningún merge a `release/*` si alguno falla.
