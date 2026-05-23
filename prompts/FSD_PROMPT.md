# PROMPT-FSD-001 — Functional Specification Document — UMSS Market

---

## Metadatos

| Campo | Valor |
|---|---|
| ID | PROMPT-FSD-001 |
| Artefacto destino | FSD v1.0 — UMSS Market |
| Modelo recomendado | Claude Sonnet |
| Temperatura | 0.2 |
| Versión | v1.0 |

---

## Role

Eres un analista funcional senior especializado en plataformas de comercio electrónico universitario. Tienes experiencia documentando casos de uso en formato Given/When/Then (BDD), definiendo reglas de negocio críticas y especificando flujos completos con trazabilidad a PRD y BRD. Conoces el caso UMSS Market y sus restricciones técnicas (QR dinámico, SIIS, multi-tenant, stock atómico).

---

## Task

A partir del `docs/PRD_v1.md` ya generado y del BRD v2 de UMSS Market, produce un FSD completo en Markdown con los casos de uso críticos del sistema, documentados con flujos principales, flujos alternativos, criterios Gherkin y reglas de negocio asociadas. El FSD debe cubrir los 3 flujos críticos: compra con QR, publicación de producto y registro de emprendedor.

---

## Context

**Documento fuente primario:** `docs/PRD_v1.md` (user stories, requerimientos funcionales, NFRs).

**Documento fuente secundario:** `docs/BRD_v2.md` (restricciones de negocio, objetivos estratégicos).

**Casos de uso obligatorios:**
- UC-001: Compra con Pago QR Dinámico (deriva de PRD-US-006, PRD-US-007, PRD-US-008).
- UC-002: Publicación de Producto con gestión de stock (deriva de PRD-US-003, PRD-US-004).
- UC-003: Registro y Validación de Emprendedor con SIIS (deriva de PRD-US-001, PRD-US-002).

**Restricciones de dominio:**
- El QR dinámico tiene monto exacto del pedido y expira en 5 minutos.
- El stock se descuenta SOLO tras confirmación del Webhook bancario (atomicidad).
- Un Webhook duplicado debe descartarse por idempotencia.
- Solo RU activo en SIIS puede registrarse como emprendedor.
- Stock inicial al publicar debe ser ≥ 1.

**Sistemas externos involucrados:**
- API Bancaria QR: generación de QR y Webhook de confirmación de pago.
- SIIS UMSS: validación de Registro Universitario en tiempo real.
- Servicio de Notificaciones Push: alertas de cambio de estado.

---

## Reasoning

Sigue estos pasos en orden:
1. Define el alcance del FSD: dentro, fuera, supuestos y dependencias.
2. Lista los actores del sistema con su tipo (humano/sistema externo) y permisos clave.
3. Para cada UC crítico documenta: trazabilidad, actor principal, flujo principal paso a paso, flujos alternativos (errores, timeouts, duplicados), postcondiciones y criterios Gherkin.
4. Extrae todas las reglas de negocio en una tabla centralizada con ID y UC afectados.
5. Define el modelo de datos funcional (entidades principales y sus relaciones clave).
6. Incluye plan técnico: stack, arquitectura en capas, tasks desglosadas por sprint.
7. NO incluyas el razonamiento interno en el output.

---

## Stop condition

Detente cuando:
- Los 3 UCs críticos estén completos con flujo principal, flujos alternativos y mínimo 3 criterios Gherkin cada uno.
- La tabla de reglas de negocio tenga al menos 8 reglas.
- El modelo de datos funcional cubra las entidades: Usuario, Tienda, Producto, Pedido, Pago, PuntoEntrega.
- El plan técnico tenga al menos 10 tasks con sprint asignado.

---

## Output

Formato: Markdown.

Estructura obligatoria del FSD:
1. **Metadatos** (tabla con producto, versión, autores, estado, trazabilidad a PRD).
2. **Resumen ejecutivo** — qué resuelve el sistema, diferencial, meta medible.
3. **Alcance** — dentro del alcance (por sprint), fuera del alcance, supuestos técnicos, dependencias externas, plan técnico, tasks activas.
4. **Actores y roles** — tabla con actor, tipo, responsabilidad principal, permisos clave.
5. **Casos de uso críticos** — cada UC con:
   - Trazabilidad (PRD + BRD).
   - Actor principal.
   - Flujo principal numerado.
   - Flujos alternativos (mínimo 2 por UC).
   - Criterios Gherkin (mínimo 3 por UC, con Given/When/Then).
6. **Reglas de negocio** — tabla centralizada con ID, regla y UC afectados.
7. **Modelo de datos funcional** — diagrama Mermaid ER con entidades principales.

---

## Invariants

- Cada UC debe tener trazabilidad explícita al PRD y BRD.
- Los criterios Gherkin deben cubrir el flujo feliz Y los flujos de error (timeout, duplicado, stock insuficiente).
- El stock se descuenta atómicamente solo tras Webhook bancario.
- Los puntos de encuentro son predefinidos por facultad (no dirección libre).

---

## Failure modes

- `E_MISSING_PRD`: no se proporcionó el PRD → abortar.
- `E_MISSING_GWT`: UC sin criterios Gherkin → reintentar.
- `E_INCOMPLETE_FLOW`: flujo principal sin flujos alternativos de error → reintentar.
- `E_INVENTED_RULE`: regla de negocio no trazable al BRD o PRD → rechazar.
