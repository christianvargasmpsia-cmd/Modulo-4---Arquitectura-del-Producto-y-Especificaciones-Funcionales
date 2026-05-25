# POC-01 — Validación de Lógica Core del Dominio (CLI)

> **Archivo de evidencia** del Proof of Concept 01 del proyecto UMSS Market.  
> Código fuente: [`../../poc/umss_ecommerce.py`](../../poc/umss_ecommerce.py)

---

## Metadatos

| Campo | Valor |
|---|---|
| ID | POC-01 |
| Tipo | CLI — Lógica de dominio (sin UI) |
| Estado | ✅ Completado |
| Fecha de ejecución | 30/04/2026 |
| Ejecutado por | Vargas Sandoval Christian Bernardo |
| Referenciado en | `docs/DTI.md` §12 |
| Código fuente | `poc/umss_ecommerce.py` |

---

## Objetivo

Validar que la **lógica central del dominio** de UMSS Market puede ser implementada de forma cohesiva antes de comprometerse con el stack tecnológico completo. En particular:

1. El flujo de registro de usuario con validación de RU universitario.
2. La creación de pedidos con verificación de stock.
3. El procesamiento de pagos con validación de monto exacto.
4. La gestión de estados del pedido (PENDIENTE → CONFIRMADO / CANCELADO).
5. El listado de productos de un catálogo multi-tienda.

---

## Hipótesis a validar

> "Los invariantes del dominio de UMSS Market (stock no negativo, monto exacto, RU requerido) pueden ser implementados en Python puro sin dependencia de ningún framework externo."

---

## Alcance del POC

| Funcionalidad | Incluida | Observación |
|---|---|---|
| Registro de usuario con RU | ✅ | Simulación de SIIS UMSS |
| Gestión de catálogo / productos | ✅ | En memoria (sin BD) |
| Creación de pedido | ✅ | Validación de stock al crear |
| Procesamiento de pago | ✅ | Validación de monto exacto |
| Cambio de estado del pedido | ✅ | PENDIENTE→CONFIRMADO / CANCELADO |
| QR bancario real | ❌ | Simulado — no integración real |
| Persistencia en PostgreSQL | ❌ | En memoria — validación de lógica solo |
| API REST / FastAPI | ❌ | CLI puro — fuera del alcance |
| Autenticación JWT | ❌ | Fuera del alcance de este POC |

---

## Resultado de la ejecución

```
=== UMSS Market — POC-01: Lógica Core CLI ===

[1/5] Registrando usuario...
  ✅ Usuario registrado: maria.rodriguez@est.umss.edu (RU: 12345678)

[2/5] Creando catálogo con 3 productos...
  ✅ Producto agregado: Notebook UMSS — Bs. 25.00 (stock: 50)
  ✅ Producto agregado: Mate de Cola — Bs. 8.00 (stock: 100)
  ✅ Producto agregado: Manual Cálculo — Bs. 45.00 (stock: 10)

[3/5] Creando pedido (3x Notebook UMSS)...
  ✅ Pedido creado: #PED-001 — Total: Bs. 75.00 — Estado: PENDIENTE

[4/5] Procesando pago (monto: Bs. 75.00)...
  ✅ Pago procesado — Estado: CONFIRMADO

[5/5] Intentando pago con monto incorrecto (Bs. 70.00)...
  ✅ Error esperado: PaymentAmountMismatch (esperado: 75.00, recibido: 70.00)

=== POC-01 completado exitosamente ===
```

---

## Lecciones aprendidas

| # | Lección | Impacto en arquitectura |
|---|---|---|
| L1 | La validación de RU debe ser síncrona en el registro; no puede diferirse | SIIS validado en el adaptador de entrada, no en background |
| L2 | La comparación de montos con `float` genera errores de precisión | Usar `Decimal` para todos los cálculos monetarios (INV-005) |
| L3 | El descuento de stock debe ser atómico a nivel de BD; en memoria con locks es suficiente para POC, pero no para producción | Confirmó necesidad de operación SQL atómica con cláusula WHERE (INV-001) |
| L4 | Los estados del pedido forman una máquina de estados bien definida | Motivó el diseño formal del `stateDiagram-v2` en `diagrams/saga-state.mmd` |
| L5 | La lógica de dominio se puede aislar completamente de la infraestructura | Validó la viabilidad de ADR-0003 (Arquitectura Hexagonal) |

---

## Criterios de éxito — Resultado

| Criterio | Resultado |
|---|---|
| Flujo completo de compra ejecutable end-to-end | ✅ |
| Invariante stock >= 0 respetada | ✅ |
| Monto exacto validado correctamente | ✅ |
| RU obligatorio para registro | ✅ |
| Sin dependencias externas (solo Python stdlib) | ✅ |

**Veredicto: POC-01 SUPERADO — Hipótesis validada.**
