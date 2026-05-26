# Evidencia de Prompt Engineering V2 — UMSS Market

> **Continuación de** `evidencia_prompt_v1.md` — muestra la iteración final con prompts completamente estructurados siguiendo el `PROMPT_TEMPLATE.md` del módulo (6 elementos obligatorios: Role, Task, Context, Reasoning, Stop Condition, Output).

---

# 1. Objetivo

Documentar la iteración v2 del proceso de Prompt Engineering para UMSS Market. En esta versión se incorporaron los 6 elementos estructurales obligatorios del `PROMPT_TEMPLATE.md`, los contratos funcionales IA (`PR-FSD-001/002/003`) y los mecanismos de control declarados en el DTI §9 y §23.

La v2 supera los problemas detectados en v1:

| Problema v1 | Solución v2 |
|---|---|
| Prompt genérico sin contexto de dominio | Contexto explícito con referencias FSD-UC, BR y ADRs |
| Sin Reasoning Steps | Chain-of-thought estructurado en 4-5 pasos |
| Sin Stop Conditions | 3 condiciones de parada objetivas por prompt |
| Sin invariantes verificables | Invariantes INV-001 a INV-007 codificadas |
| Output no estructurado | JSON Schema con campos obligatorios definidos |
| Sin failure modes | 3 failure modes por prompt con código de error |

---

# 2. Prompt PR-FSD-001 — Validación de Confirmación de Pago QR

**Artefacto origen**: `docs/PR-FSD-001.md` | **Flujo**: FSD-UC-001 §pago webhook

---

## 0. Metadatos

| Campo | Valor |
|---|---|
| ID del prompt | `PR-FSD-001` |
| Título | Validación de Confirmación de Pago QR (Webhook) |
| Artefacto origen | FSD-UC-001 — Compra con QR bancario |
| Tipo de prompt | revisión / auditoría |
| Modelo recomendado | Sonnet |
| Temperatura | `0.0` (determinístico) |
| Versión | `v2.0` |
| Fecha | 24/05/2026 |
| Autor(es) | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Aprobado |

---

## 1. Anatomía del Prompt

### 1.1 Role

```text
Eres un arquitecto enterprise especializado en sistemas de pago distribuidos,
seguridad de webhooks bancarios y patrones de idempotencia en microservicios.
Tienes experiencia en validación HMAC-SHA256, manejo de eventos duplicados y
procesamiento de pagos QR en el contexto universitario boliviano.
```

### 1.2 Task

```text
Valida si una solicitud de confirmación de pago QR entrante (webhook bancario)
cumple todos los invariantes de dominio de UMSS Market antes de confirmar el pedido.
Retorna un resultado de validación estructurado con acción recomendada.
```

### 1.3 Context

```text
- Documento fuente: docs/FSD_v2.md — FSD-UC-001 (compra QR), reglas BR-001 a BR-004
- Sistema: UMSS Market — marketplace universitario, integración con API Bancaria QR boliviana
- Entradas esperadas:
    order_id (UUID): identificador del pedido
    webhook_ref (string): referencia única del banco — DEBE ser idempotente
    amount (Decimal): monto recibido del banco en BOB
    currency (string): "BOB"
    timestamp (ISO-8601 UTC): marca temporal del webhook
    hmac_signature (string): firma SHA256 formato "sha256=<hex>"
    hmac_secret_env_var (string): nombre de la variable de entorno con el secreto
- Restricciones de dominio:
    INV-002: webhook_ref único — si ya existe en BD, retornar 200 sin reprocesar
    INV-003: QR TTL = 300 segundos exactos desde su creación
    INV-005: amount debe coincidir EXACTAMENTE con Pedido.total (usar Decimal, no float)
    INV-006: el secreto HMAC nunca hardcodeado — leer de os.environ[hmac_secret_env_var]
    INV-007: validar HMAC con hmac.compare_digest() ANTES de cualquier procesamiento
- Restricciones técnicas: Python 3.12, FastAPI, SQLAlchemy, Decimal para montos
```

### 1.4 Reasoning (chain-of-thought estructurado)

```text
Sigue estos pasos en orden estricto:

1. HMAC PRIMERO: Reconstruir la firma esperada con os.environ[hmac_secret_env_var]
   y comparar con hmac.compare_digest(). Si falla → STOP, retornar RECHAZAR_PAGO.

2. IDEMPOTENCIA: Consultar la tabla payments por webhook_ref.
   Si ya existe → retornar DUPLICADO_IGNORAR (HTTP 200, no reprocesar).

3. MONTO: Comparar Decimal(str(amount)) == order.total.
   Si difiere en cualquier centavo → STOP, retornar RECHAZAR_PAGO.

4. TTL: Calcular (now_utc - order.qr_created_at).total_seconds().
   Si > 300 → STOP, retornar RECHAZAR_PAGO (QR expirado).

5. CONFIRMAR: Todos los checks pasaron → retornar CONFIRMAR_PEDIDO.

No expongas el razonamiento interno en el output.
```

### 1.5 Stop Condition

```text
Detente cuando:
- La firma HMAC no coincide (no continuar con validaciones posteriores), o
- El webhook_ref ya fue procesado (retornar 200 inmediatamente), o
- El monto no coincide exactamente con Pedido.total.
No continúes produciendo validaciones si alguna de estas condiciones se cumple.
```

### 1.6 Output

```text
Formato: JSON estructurado con schema obligatorio
```

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

---

## 2. Invariantes del prompt

- La salida **debe** respetar el schema JSON declarado en §1.6.
- La salida **debe** incluir todos los campos de `checks` (true/false).
- `accion_recomendada` **debe** ser uno de: `CONFIRMAR_PEDIDO | RECHAZAR_PAGO | DUPLICADO_IGNORAR`.
- La validación HMAC **debe** ejecutarse ANTES de cualquier otra verificación.
- La salida **no debe** exponer el valor del secreto HMAC ni ningún dato sensible.

---

## 3. Failure Modes declarados

| Código | Descripción | Acción del consumidor |
|---|---|---|
| `E_HMAC_INVALID` | Firma HMAC-SHA256 no coincide | Rechazar webhook, retornar HTTP 401 |
| `E_DUPLICATE_WEBHOOK` | webhook_ref ya procesado | Retornar HTTP 200 sin reprocesar |
| `E_AMOUNT_MISMATCH` | amount ≠ Pedido.total | Rechazar pago, publicar PAYMENT_FAILED |
| `E_QR_EXPIRED` | QR superó los 300 segundos | Rechazar pago, liberar stock (STOCK_RELEASED) |
| `E_SECRET_HARDCODED` | Secreto HMAC en código fuente | Bloquear merge en CI/CD |

---

## 4. Guardrails

- **MUST**: validar HMAC antes de acceder a cualquier dato del payload.
- **MUST**: usar `hmac.compare_digest()` para comparación de firmas (evita timing attacks).
- **MUST**: usar `Decimal` para comparación de montos (nunca `float`).
- **MUST NOT**: retornar HTTP 4xx al banco ante duplicados (siempre HTTP 200).
- **MUST NOT**: hardcodear el secreto HMAC (`b"secreto"` en código es bloqueante).

---

## 5. Trazabilidad

| Origen | ID origen | Este prompt | Consumidor | Artefacto generado |
|---|---|---|---|---|
| FSD | FSD-UC-001 | PR-FSD-001 | payment-service | Código webhook handler |
| AGENTS.md | INV-002, INV-005, INV-007 | PR-FSD-001 | CI/CD guardrail | Test de aceptación |
| ADR | ADR-0002 (Saga) | PR-FSD-001 | payment-service | Evento PAYMENT_CONFIRMED |

---

## 6. Pruebas del prompt

### 6.1 Caso feliz
- **Input**: webhook con HMAC válido, webhook_ref nuevo, amount = Pedido.total, QR < 300s.
- **Output esperado**: `{"validacion_operacional": true, "accion_recomendada": "CONFIRMAR_PEDIDO"}`.

### 6.2 Caso borde — duplicado
- **Input**: webhook_ref ya procesado en la BD.
- **Output esperado**: `{"accion_recomendada": "DUPLICADO_IGNORAR"}` → HTTP 200.

### 6.3 Caso adversarial — HMAC manipulado
- **Input**: payload modificado con HMAC incorrecto intentando inyectar amount distinto.
- **Comportamiento esperado**: `{"checks": {"hmac_valido": false}}` → `E_HMAC_INVALID`, stop inmediato.

---

## 7. Versionado

| Versión | Fecha | Autor | Cambio | Modelo validado |
|---|---|---|---|---|
| v1.0 | 11/05/2026 | Rodriguez / Vargas | Prompt básico sin estructura | Sonnet |
| v2.0 | 24/05/2026 | Rodriguez / Vargas | Estructura completa + 5 failure modes + guardrails | Sonnet |

---

# 3. Prompt PR-FSD-002 — Validación de Disponibilidad y Reserva de Stock

**Artefacto origen**: `docs/PR-FSD-002.md` | **Flujo**: FSD-UC-001 §verificación stock

---

## 0. Metadatos

| Campo | Valor |
|---|---|
| ID del prompt | `PR-FSD-002` |
| Título | Validación de Disponibilidad y Reserva de Stock Atómica |
| Artefacto origen | FSD-UC-001 — paso verificación y reserva de stock |
| Tipo de prompt | revisión / generación |
| Modelo recomendado | Sonnet |
| Temperatura | `0.0` |
| Versión | `v2.0` |
| Fecha | 24/05/2026 |
| Autor(es) | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Aprobado |

---

## 1. Anatomía del Prompt

### 1.1 Role

```text
Eres un arquitecto de bases de datos y sistemas distribuidos con experiencia en
operaciones atómicas PostgreSQL, bloqueos optimistas y gestión de inventario
en tiempo real bajo alta concurrencia. Conoces los patrones TOCTOU y sus mitigaciones.
```

### 1.2 Task

```text
Valida si el código de reserva de stock cumple la invariante de stock no negativo
bajo condiciones de concurrencia. Identifica si la operación SQL es atómica
y si la reserva temporal en Redis tiene TTL = 300 segundos.
```

### 1.3 Context

```text
- Documento fuente: docs/FSD_v2.md — FSD-UC-001 §3 verificar stock, BR-003
- Entradas esperadas:
    product_id (UUID): producto a reservar
    available_stock (integer): stock actual en BD
    requested_quantity (integer): cantidad solicitada
    reservation_ttl_seconds (integer): debe ser 300
    order_id (UUID): pedido origen
    correlation_id (UUID): ID de correlación distribuida
- Restricciones de dominio:
    INV-001: stock >= 0 siempre — operación DEBE ser atómica con WHERE stock >= qty
    INV-003: reserva Redis DEBE tener TTL = 300 segundos exactos (setex key 300 value)
    AGENTS.md: correlationId NUNCA omitido en eventos publicados
- Restricciones técnicas: PostgreSQL 16, SQLAlchemy 2.0 async, Redis 7, Python 3.12
```

### 1.4 Reasoning

```text
1. VERIFICAR ATOMICIDAD: ¿La operación SQL usa UPDATE ... WHERE stock >= qty?
   Si no → flag operacion_atomica = false (TOCTOU detectado).

2. VERIFICAR TTL: ¿La reserva Redis usa setex(key, 300, value)?
   Si usa set() sin TTL → flag reserva_con_ttl = false.

3. VERIFICAR CORRELATION: ¿El evento publicado incluye correlation_id?
   Si no → flag correlation_id_incluido = false.

4. CALCULAR RESULTADO: stock_resultante = available_stock - requested_quantity
   Si < 0 → stock_no_negativo = false.

5. EMITIR RESULTADO: compilar todos los checks y accion_recomendada.
```

### 1.5 Stop Condition

```text
Detente cuando:
- available_stock < requested_quantity (stock insuficiente, no hay operación que ejecutar), o
- El código SQL no tiene cláusula WHERE stock >= qty (bloqueante inmediato).
```

### 1.6 Output

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

---

## 2. Invariantes del prompt

- `accion_recomendada` **debe** ser: `RESERVAR_STOCK | RECHAZAR_POR_STOCK_INSUFICIENTE`.
- `stock_resultante` **nunca** puede ser negativo.
- `checks.operacion_atomica = false` es **bloqueante** en CI/CD.
- `checks.reserva_con_ttl = false` es **bloqueante** en CI/CD.

---

## 3. Failure Modes

| Código | Descripción | Acción |
|---|---|---|
| `E_STOCK_INSUFICIENTE` | available_stock < requested_quantity | RECHAZAR_POR_STOCK_INSUFICIENTE |
| `E_TOCTOU_DETECTADO` | SQL sin cláusula WHERE stock >= qty | Bloqueante CI/CD |
| `E_TTL_FALTANTE` | Redis sin setex (sin TTL) | Bloqueante CI/CD |
| `E_CORRELATION_AUSENTE` | Evento sin correlation_id | Bloqueante CI/CD |

---

## 4. Guardrails

- **MUST**: operación SQL atómica con `WHERE stock >= qty` (única mitigación TOCTOU válida).
- **MUST**: `setex(key, 300, value)` — nunca `set()` sin expiración para reservas.
- **MUST**: `correlation_id` en el evento `STOCK_RESERVED`.
- **MUST NOT**: usar lectura + escritura separadas para decrementar stock.

---

## 5. Trazabilidad

| Origen | ID origen | Este prompt | Consumidor | Artefacto generado |
|---|---|---|---|---|
| FSD | FSD-UC-001 §3 | PR-FSD-002 | inventory-service | Código SQL atómico |
| AGENTS.md | INV-001 | PR-FSD-002 | CI/CD guardrail | Test de concurrencia |
| ADR | ADR-0002 (Saga) | PR-FSD-002 | inventory-service | Evento STOCK_RESERVED |

---

## 6. Pruebas del prompt

### 6.1 Caso feliz
- **Input**: available_stock=10, requested_quantity=3, SQL con WHERE, Redis con setex 300.
- **Output esperado**: `{"stock_disponible": true, "accion_recomendada": "RESERVAR_STOCK", "stock_resultante": 7}`.

### 6.2 Caso borde
- **Input**: available_stock=3, requested_quantity=3 (exactamente el límite).
- **Output esperado**: `{"stock_disponible": true, "stock_resultante": 0}` — válido.

### 6.3 Caso adversarial — TOCTOU
- **Input**: código que hace SELECT stock THEN UPDATE stock (sin WHERE en UPDATE).
- **Comportamiento esperado**: `{"checks": {"operacion_atomica": false}}` → `E_TOCTOU_DETECTADO`.

---

## 7. Versionado

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| v1.0 | 11/05/2026 | Rodriguez / Vargas | Prompt básico de validación de stock |
| v2.0 | 24/05/2026 | Rodriguez / Vargas | Atomicidad SQL + Redis TTL + correlation_id |

---

# 4. Prompt PR-FSD-003 — Coordinación de Eventos Distribuidos (Saga)

**Artefacto origen**: `docs/PR-FSD-003.md` | **Flujo**: Saga ORDER_CREATED → ORDER_CONFIRMED

---

## 0. Metadatos

| Campo | Valor |
|---|---|
| ID del prompt | `PR-FSD-003` |
| Título | Coordinación de Eventos Distribuidos — Saga Coreografía |
| Artefacto origen | ADR-0002 (Saga), EVENT_CATALOG.md, FSD-UC-001 |
| Tipo de prompt | revisión / auditoría |
| Modelo recomendado | Sonnet |
| Temperatura | `0.0` |
| Versión | `v2.0` |
| Fecha | 25/05/2026 |
| Autor(es) | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Aprobado |

---

## 1. Anatomía del Prompt

### 1.1 Role

```text
Eres un arquitecto de sistemas distribuidos especializado en Event-Driven Architecture,
patrones Saga con coreografía y trazabilidad distribuida mediante correlationId.
Tienes experiencia auditando flujos de microservicios y verificando consistencia eventual.
```

### 1.2 Task

```text
Valida si un evento del sistema UMSS Market cumple el contrato de la Saga:
productor correcto, consumidores correctos, correlationId presente, payload completo
y alineación con el catálogo de eventos oficial. Retorna la acción recomendada.
```

### 1.3 Context

```text
- Documento fuente: docs/architecture/EVENT_CATALOG.md, docs/adr/ADR-0002
- Entradas esperadas:
    event_type (string): nombre del evento en SCREAMING_SNAKE_CASE
    order_id (UUID): identificador del pedido
    correlation_id (UUID): ID de correlación — NUNCA omitir
    producer_service (string): servicio que publica el evento
    payload (object): cuerpo del evento
- Catálogo de eventos válidos (productor → consumidores):
    ORDER_CREATED: order-service → payment-service
    PAYMENT_PENDING: payment-service → order-service, realtime-gateway
    PAYMENT_CONFIRMED: payment-service → inventory-service
    PAYMENT_FAILED: payment-service → order-service
    STOCK_RESERVED: inventory-service → order-service
    STOCK_RELEASED: inventory-service → order-service
    ORDER_CONFIRMED: order-service → notification-service, realtime-gateway
    ORDER_CANCELLED: order-service → notification-service
- Restricciones de dominio:
    correlation_id NUNCA omitido (AGENTS.md restricción explícita)
    El productor declarado debe coincidir exactamente con el catálogo
    Los consumers deben ser idempotentes
```

### 1.4 Reasoning

```text
1. VALIDAR TIPO: ¿event_type está en el catálogo oficial? Si no → E_EVENTO_DESCONOCIDO.

2. VALIDAR PRODUCTOR: ¿producer_service coincide con el productor del catálogo?
   Si no → E_PRODUCTOR_INCORRECTO (bloqueante).

3. VALIDAR CORRELATION: ¿correlation_id está presente y es UUID válido?
   Si no → E_CORRELATION_AUSENTE (bloqueante).

4. VALIDAR PAYLOAD: ¿el payload tiene order_id, timestamp ISO-8601 UTC?
   Si falta alguno → E_PAYLOAD_INCOMPLETO.

5. DETERMINAR NEXT: identificar el siguiente evento esperado según el catálogo.
```

### 1.5 Stop Condition

```text
Detente cuando:
- event_type no está en el catálogo (evento desconocido), o
- producer_service no coincide con el productor del catálogo.
```

### 1.6 Output

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

## 2. Invariantes del prompt

- `accion_recomendada` **debe** ser: `PUBLICAR_EVENTO | RECHAZAR_EVENTO | COMPENSAR`.
- `checks.productor_correcto = false` es **bloqueante** en CI/CD.
- `checks.correlation_id_presente = false` es **bloqueante** en CI/CD.

---

## 3. Failure Modes

| Código | Descripción | Acción |
|---|---|---|
| `E_EVENTO_DESCONOCIDO` | event_type no en catálogo | Rechazar publicación |
| `E_PRODUCTOR_INCORRECTO` | producer_service no coincide | Bloqueante CI/CD |
| `E_CORRELATION_AUSENTE` | correlation_id faltante | Bloqueante CI/CD |
| `E_PAYLOAD_INCOMPLETO` | Faltan campos obligatorios | Observación en revisión |

---

## 4. Guardrails

- **MUST**: correlation_id en todos los eventos — sin excepción.
- **MUST**: event_type en SCREAMING_SNAKE_CASE coincidente con catálogo.
- **MUST NOT**: un servicio publicar eventos que no le corresponden según el catálogo.
- **MUST**: consumers implementar idempotencia.

---

## 5. Trazabilidad

| Origen | ID origen | Este prompt | Consumidor | Artefacto generado |
|---|---|---|---|---|
| ADR | ADR-0001, ADR-0002 | PR-FSD-003 | Todos los servicios | Consumers AMQP |
| EVENT_CATALOG | 8 eventos | PR-FSD-003 | CI/CD guardrail | Test de eventos |

---

## 6. Pruebas del prompt

### 6.1 Caso feliz
- **Input**: `ORDER_CREATED` de `order-service`, correlation_id presente, payload completo.
- **Output esperado**: `{"evento_valido": true, "siguiente_evento_esperado": "PAYMENT_PENDING"}`.

### 6.2 Caso borde
- **Input**: `ORDER_CANCELLED` (evento terminal — no tiene siguiente evento).
- **Output esperado**: `{"siguiente_evento_esperado": null, "accion_recomendada": "PUBLICAR_EVENTO"}`.

### 6.3 Caso adversarial — productor incorrecto
- **Input**: `PAYMENT_CONFIRMED` publicado por `order-service` (debería ser `payment-service`).
- **Comportamiento esperado**: `{"checks": {"productor_correcto": false}}` → `E_PRODUCTOR_INCORRECTO`.

---

## 7. Versionado

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| v1.0 | 11/05/2026 | Rodriguez / Vargas | Prompt básico de coordinación de eventos |
| v2.0 | 25/05/2026 | Rodriguez / Vargas | Catálogo completo + correlation_id + producers/consumers |

---

# 5. Resumen de la Iteración v1 → v2

| Dimensión | v1 | v2 | Mejora |
|---|---|---|---|
| Elementos del prompt | 2/6 (Role + Task básico) | 6/6 (todos los elementos) | +200% |
| Restricciones explícitas | 2 | 12+ | +500% |
| Failure Modes documentados | 0 | 12 (4 por prompt) | — |
| Stop Conditions | 0 | 6 (2 por prompt) | — |
| Guardrails | 0 | 12 (4 por prompt) | — |
| Output JSON estructurado | Parcial | Completo con schema | +100% |
| Trazabilidad con artefactos | Baja | Alta (FSD + ADR + INV) | +80% |
| Determinismo | Bajo | Alto (temperatura 0.0) | — |
