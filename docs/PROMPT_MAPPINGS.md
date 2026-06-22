# PROMPT_MAPPINGS.md — UMSS Market

> Documento de trazabilidad de prompts utilizados para flujos asistidos por IA, automatización y contratos funcionales dentro de UMSS Market.

---

# 0. Metadatos

| Campo                 | Valor                                                              |
| --------------------- | ------------------------------------------------------------------ |
| Producto              | UMSS Market                                                        |
| Version               | v2.0                                                               |
| Fecha                 | 21/06/2026                                                         |
| Estado                | Vigente                                                            |
| Autores               | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Documento relacionado | DTI.md                                                             |
| Relacion PRD          | PRD_v3.md                                                          |
| Relacion BRD          | BRD_v4.md                                                          |
| Relacion FSD          | FSD_v3.md                                                          |

---

# 1. Objetivo

Este documento establece la trazabilidad entre los prompts utilizados durante el ciclo de vida asistido por IA y los artefactos generados dentro del proyecto UMSS Market.

La trazabilidad permite relacionar:

* Requerimientos de negocio (BRD)
* Requerimientos de producto (PRD)
* Especificaciones funcionales (FSD)
* Documentos de diseño (DD)
* Prompts de implementación (PR-IMPL)
* Código generado
* Casos de prueba
* Releases

El objetivo es garantizar auditoría, reproducibilidad y cumplimiento del proceso AI-SDLC definido para el proyecto.


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
# PROMPT-006 — Registro de Emprendedor Spring Boot

## Objetivo

Implementar el registro de emprendedores universitarios utilizando Arquitectura Hexagonal.

## Trazabilidad

| Documento | ID                          |
| --------- | --------------------------- |
| DD        | DD-UC-001                   |
| Prompt    | PR-IMPL-001                 |
| Código    | RegisterEntrepreneurUseCase |
| Release   | 3.0.0                       |

---

# PROMPT-007 — Gestión de Publicaciones Spring Boot

## Objetivo

Implementar la creación y consulta de publicaciones para productos y servicios.

## Trazabilidad

| Documento | ID                       |
| --------- | ------------------------ |
| DD        | DD-UC-002                |
| Prompt    | PR-IMPL-002              |
| Código    | CreatePublicationUseCase |
| Release   | 3.0.0                    |

# 4. Riesgos Generales

| Riesgo                              | Impacto | Mitigación                                        |
| ----------------------------------- | ------- | ------------------------------------------------- |
| Prompt ambiguo                      | Alto    | Uso de plantillas PR-IMPL estandarizadas          |
| Requerimientos incompletos          | Alto    | Validación contra BRD, PRD y FSD                  |
| Generación de código inconsistente  | Alto    | Revisiones de DD y trazabilidad obligatoria       |
| Hallucinations IA                   | Alto    | Validación manual y pruebas automatizadas         |
| Incumplimiento de reglas de negocio | Alto    | Validación mediante casos de prueba               |
| Baja cobertura de pruebas           | Alto    | Cobertura mínima del 90% definida en AGENTS.md    |
| Pérdida de trazabilidad             | Medio   | Relación obligatoria DD → PR-IMPL → Código → Test |

---

# 5. Convenciones

| Convención               | Descripción                                    |
| ------------------------ | ---------------------------------------------- |
| Trazabilidad obligatoria | Todo cambio debe relacionarse con DD y PR-IMPL |
| Arquitectura Hexagonal   | Todo desarrollo debe respetar Ports & Adapters |
| DTO Pattern              | Comunicación externa mediante DTOs             |
| Validación               | Todo input debe validarse                      |
| Testing                  | Cobertura mínima 90%                           |
| Seguridad                | No exponer datos sensibles                     |
| Documentación            | Todo caso de uso debe tener DD asociado        |

---

# 6. Trazabilidad Global

| Prompt     | Documento Diseño   | Prompt Implementación | Código Principal            | Estado       |
| ---------- | ------------------ | --------------------- | --------------------------- | ------------ |
| PROMPT-001 | DD-PAYMENT-001     | PR-FSD-001            | Payment Service             | Documentado  |
| PROMPT-002 | DD-UC-001          | PR-IMPL-001           | RegisterEntrepreneurUseCase | Implementado |
| PROMPT-003 | DD-UC-002          | PR-IMPL-002           | CreatePublicationUseCase    | Implementado |
| PROMPT-004 | DD-PAYMENT-002     | PR-FSD-002            | Payment Validation          | Documentado  |
| PROMPT-005 | DD-RECOMMENDER-001 | PR-FSD-003            | Recommendation Engine       | Documentado  |
| PROMPT-006 | DD-UC-001          | PR-IMPL-001           | RegisterEntrepreneurUseCase | Implementado |
| PROMPT-007 | DD-UC-002          | PR-IMPL-002           | CreatePublicationUseCase    | Implementado |

---

# 7. Registro de Cambios

| Versión | Fecha      | Autor              | Cambio                                                                      |
| ------- | ---------- | ------------------ | --------------------------------------------------------------------------- |
| v1.0    | 11/05/2026 | Rodriguez / Vargas | Creación inicial PROMPT_MAPPINGS                                            |
| v2.0    | 21/06/2026 | Rodriguez / Vargas | Actualización para AI-SDLC, DD-UC-001, DD-UC-002, PR-IMPL-001 y PR-IMPL-002 |

---

# Checklist

* [x] Inputs definidos
* [x] Outputs definidos
* [x] Prompts documentados
* [x] Riesgos documentados
* [x] Reglas de negocio incluidas
* [x] Arquitectura Hexagonal considerada
* [x] Trazabilidad DD → Prompt → Código
* [x] Compatible con GitHub Preview
* [x] Compatible con AGENTS.md
* [x] Compatible con DTI v2.0
