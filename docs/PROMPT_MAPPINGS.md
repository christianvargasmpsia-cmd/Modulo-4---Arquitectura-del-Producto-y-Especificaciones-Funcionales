# PROMPT_MAPPINGS.md — UMSS Market

> Documento de trazabilidad de prompts utilizados para flujos asistidos por IA, automatización y contratos funcionales dentro de UMSS Market.

---

# 0. Metadatos

| Campo | Valor |
|---|---|
| Producto | UMSS Market |
| Version | v1.0 |
| Fecha | 11/05/2026 |
| Estado | En revision |
| Autores | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Documento relacionado | LFSD.md |
| Relacion PRD | PRD v1 |
| Relacion BRD | BRD v2 |

---

# 1. Objetivo

Este documento define los Prompt Mappings utilizados en UMSS Market para:

- Automatizacion de flujos.
- Validaciones funcionales.
- Contratos IA.
- Integracion de servicios inteligentes.
- Generacion de respuestas estructuradas.

Cada prompt documenta:

- Objetivo
- Input
- Prompt
- Output esperado
- Reglas
- Riesgos
- Trazabilidad

---

# 2. Estructura General

Todos los prompts siguen la siguiente estructura:

| Campo | Descripcion |
|---|---|
| Input | Datos recibidos |
| Prompt | Instruccion principal |
| Output | Resultado esperado |
| Reglas | Restricciones funcionales |
| Riesgos | Posibles fallos |
| Trazabilidad | Relacion BRD / PRD / LFSD |

---

# 3. Prompt Mappings

---

# PROMPT-001 — Generacion QR Dinamico

## Objetivo

Generar un QR dinamico asociado a un pedido valido dentro del marketplace.

---

## Input

```json
{
  "pedido_id": "PED-001",
  "usuario_id": "USR-001",
  "monto": 25.50,
  "items": [
    {
      "producto": "Brownie",
      "cantidad": 2
    }
  ]
}
```

---

## Prompt

```text
Genera un QR dinamico para un pedido universitario.

Valida:
- monto exacto
- expiracion maxima de 5 minutos
- unicidad del pedido
- integridad del pago

Retorna una respuesta estructurada JSON.
```

---

## Output esperado

```json
{
  "qr_url": "https://bank.bo/qr/abc123",
  "expires_at": "2026-05-11T18:00:00Z",
  "status": "PENDING"
}
```

---

## Reglas

- El monto QR debe ser igual al total del pedido.
- El QR no puede reutilizarse.
- Tiempo maximo de expiracion: 5 minutos.
- El pedido debe estar en estado PENDING.

---

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| QR duplicado | Validacion idempotente |
| Monto alterado | Comparacion monto-pedido |
| Expiracion | Liberacion automatica stock |

---

## Trazabilidad

| Documento | ID |
|---|---|
| BRD | BR-002 |
| PRD | PRD-PAY-01 |
| LFSD | UC-001 |

---

# PROMPT-002 — Validacion de RU Universitario

## Objetivo

Validar identidad institucional mediante RU y correo universitario.

---

## Input

```json
{
  "ru": "202012345",
  "email": "usuario@umss.edu.bo"
}
```

---

## Prompt

```text
Valida que el RU exista en SIIS UMSS.

Verifica:
- RU activo
- correo institucional valido
- unicidad del usuario

Bloquea registros duplicados.
```

---

## Output esperado

```json
{
  "status": "VALID",
  "usuario_activo": true,
  "registro_permitido": true
}
```

---

## Reglas

- Solo RU activos.
- Solo correos institucionales.
- No permitir usuarios duplicados.
- No exponer informacion sensible.

---

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| RU falso | Verificacion SIIS |
| Email invalido | Regex institucional |
| Duplicados | Constraint unico |

---

## Trazabilidad

| Documento | ID |
|---|---|
| BRD | BR-001 |
| PRD | PRD-REQ-001 |
| LFSD | UC-003 |

---

# PROMPT-003 — Publicacion de Producto

## Objetivo

Validar productos antes de publicarlos en el catalogo.

---

## Input

```json
{
  "nombre": "Brownie",
  "precio": 10,
  "stock": 5,
  "categoria": "Postres"
}
```

---

## Prompt

```text
Valida informacion de producto antes de publicarlo.

Reglas:
- precio mayor a 0
- stock mayor o igual a 1
- categoria valida
- tienda activa

Retorna respuesta JSON estructurada.
```

---

## Output esperado

```json
{
  "producto_id": "PROD-001",
  "status": "ACTIVO"
}
```

---

## Reglas

- Precio > 0
- Stock >= 1
- Categoria obligatoria
- Tienda activa obligatoria

---

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| Stock invalido | Validacion backend |
| Precio negativo | Regla de negocio |
| Publicacion duplicada | Validacion unique |

---

## Trazabilidad

| Documento | ID |
|---|---|
| BRD | BR-003 |
| PRD | PRD-STK-01 |
| LFSD | UC-002 |

---

# PROMPT-004 — Confirmacion Automatica de Pago

## Objetivo

Procesar confirmaciones de pagos QR mediante Webhook bancario.

---

## Input

```json
{
  "pedido_id": "PED-001",
  "transaction_id": "TX-999",
  "monto": 25.50,
  "estado_pago": "SUCCESS"
}
```

---

## Prompt

```text
Procesa un Webhook bancario.

Valida:
- integridad HMAC
- unicidad transaction_id
- coincidencia de monto
- estado del pedido

Actualiza:
- pedido
- stock
- historial
- notificaciones
```

---

## Output esperado

```json
{
  "pedido_estado": "PAGADO",
  "stock_actualizado": true,
  "notificacion_enviada": true
}
```

---

## Reglas

- Webhook debe ser idempotente.
- transaction_id unico.
- No reprocesar pagos exitosos.
- Mantener atomicidad.

---

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| Webhook duplicado | Idempotencia |
| Race condition | Transaccion atomica |
| Stock inconsistente | Lock transaccional |

---

## Trazabilidad

| Documento | ID |
|---|---|
| BRD | BR-004 |
| PRD | PRD-PAY-02 |
| LFSD | UC-001 |

---

# PROMPT-005 — Recomendacion de Productos

## Objetivo

Generar recomendaciones de productos relevantes para compradores.

---

## Input

```json
{
  "usuario_id": "USR-001",
  "historial": [
    "Brownie",
    "Cafe",
    "Sandwich"
  ]
}
```

---

## Prompt

```text
Analiza historial de compras universitarias.

Genera recomendaciones considerando:
- frecuencia
- categorias
- popularidad
- productos relacionados

Retorna maximo 5 productos recomendados.
```

---

## Output esperado

```json
{
  "recomendaciones": [
    "Muffin",
    "Capuccino",
    "Cheesecake"
  ]
}
```

---

## Reglas

- Maximo 5 recomendaciones.
- No repetir productos ya comprados recientemente.
- Priorizar productos disponibles.

---

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| Recomendaciones irrelevantes | Filtrado categorias |
| Productos agotados | Verificacion stock |
| Sesgo algoritmo | Balance popularidad |

---

## Trazabilidad

| Documento | ID |
|---|---|
| BRD | BR-006 |
| PRD | PRD-REC-01 |
| LFSD | UC-004 |

---

# 4. Riesgos Generales

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Prompt ambiguo | Alto | Validaciones estrictas |
| Datos inconsistentes | Alto | Schemas JSON |
| Inputs incompletos | Medio | Campos obligatorios |
| Hallucinations IA | Alto | Outputs estructurados |
| Reprocesamiento | Alto | Idempotencia |

---

# 5. Convenciones

| Convencion | Descripcion |
|---|---|
| JSON estructurado | Todos los outputs deben ser JSON |
| Idempotencia | Eventos no deben reprocesarse |
| Validacion | Todo input debe validarse |
| Seguridad | No exponer datos sensibles |

---

# 6. Trazabilidad Global

| Prompt | BRD | PRD | LFSD |
|---|---|---|---|
| PROMPT-001 | BR-002 | PRD-PAY-01 | UC-001 |
| PROMPT-002 | BR-001 | PRD-REQ-001 | UC-003 |
| PROMPT-003 | BR-003 | PRD-STK-01 | UC-002 |
| PROMPT-004 | BR-004 | PRD-PAY-02 | UC-001 |
| PROMPT-005 | BR-006 | PRD-REC-01 | UC-004 |

---

# 7. Registro de Cambios

| Version | Fecha | Autor | Cambio |
|---|---|---|---|
| v1.0 | 11/05/2026 | Rodriguez / Vargas | Creacion inicial PROMPT_MAPPINGS |

---

# Checklist

- [x] Inputs definidos
- [x] Outputs definidos
- [x] Prompt documentado
- [x] Riesgos documentados
- [x] Reglas de negocio incluidas
- [x] JSON estructurado
- [x] Trazabilidad completa
- [x] Compatible con GitHub Preview
