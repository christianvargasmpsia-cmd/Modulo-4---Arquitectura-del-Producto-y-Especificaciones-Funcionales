# PROMPT-PRD-001 — Product Requirements Document — UMSS Market

---

## Metadatos

| Campo | Valor |
|---|---|
| ID | PROMPT-PRD-001 |
| Artefacto destino | PRD v1.0 — UMSS Market |
| Modelo recomendado | Claude Sonnet |
| Temperatura | 0.2 |
| Versión | v1.0 |

---

## Role

Eres un Product Manager senior con experiencia en plataformas de comercio electrónico universitario y marketplaces multi-tenant. Conoces los principios de Spec Kit (Specify → Plan → Tasks → Implement), priorización MoSCoW y RICE, y documentación de requerimientos funcionales y no funcionales trazables a objetivos de negocio.

---

## Task

Genera un PRD completo en formato Markdown para el sistema **UMSS Market**, una plataforma marketplace multi-tenant orientada exclusivamente a la comunidad universitaria de la Universidad Mayor de San Simón (UMSS). El PRD debe servir como entrada directa para el FSD y para las decisiones arquitectónicas (ADRs).

---

## Context

**Problema de negocio:**
Los emprendedores universitarios de la UMSS gestionan sus ventas mediante grupos de WhatsApp e Instagram, lo que genera pérdida de pedidos, errores en stock, validaciones manuales de pagos QR y falta de trazabilidad. Más de 80,000 usuarios potenciales están afectados.

**Stakeholders:**
- Emprendedor Estudiante: vende productos en el campus, necesita automatizar validación de pagos y control de stock.
- Estudiante Comprador: busca productos rápidamente, quiere pago simple por QR con confirmación inmediata.
- Administrador UMSS: supervisa actividad comercial, aprueba tiendas, audita transacciones.
- DTIC UMSS: supervisa infraestructura tecnológica.

**Restricciones técnicas:**
- Integración con API bancaria QR boliviana (interoperabilidad QR).
- Integración con SIIS UMSS para validación de Registro Universitario (RU).
- Sistema mobile-first (la mayoría de usuarios usan smartphones).
- Stack preferido: Python/FastAPI + React + PostgreSQL.
- Multi-tenant: cada tienda tiene aislamiento de datos.

**Restricciones de negocio:**
- Ningún pedido puede confirmarse sin validación de pago real.
- Ningún producto puede venderse sin stock disponible (stock ≥ 1).
- Solo usuarios con RU activo en SIIS pueden registrarse como emprendedores.

---

## Reasoning

Sigue estos pasos en orden:
1. Define los objetivos del producto con métricas cuantificables y vinculación a objetivos de negocio (BO).
2. Documenta el alcance: dentro y fuera para release v1.0.
3. Define las personas (Emprendedor y Comprador) con sus necesidades principales.
4. Escribe las user stories priorizadas con MoSCoW.
5. Documenta requerimientos funcionales trazables a las user stories.
6. Documenta NFRs con umbrales medibles (rendimiento, seguridad, escalabilidad, disponibilidad).
7. Incluye tabla RICE para las 3 funcionalidades más críticas.
8. Define trazabilidad PRD → BRD → FSD.
9. NO incluyas el razonamiento interno en el output.

---

## Stop condition

Detente cuando:
- El PRD tenga las secciones: Metadatos, Objetivos, Alcance, Personas, User Stories, Criterios Gherkin, Priorización, Requerimientos Funcionales, NFRs, Dependencias, Riesgos, Trazabilidad.
- Cada NFR tenga umbral medible.
- Al menos 3 user stories tengan criterios Gherkin.
- Las 3 funcionalidades críticas (pedido, pago QR, stock) tengan score RICE.

---

## Output

Formato: Markdown.

Secciones obligatorias:
1. **Metadatos** (tabla con producto, grupo, versión, fecha, autores, estado).
2. **Constitution** — principios no negociables del sistema.
3. **Resumen del producto** — qué es, qué resuelve, diferencial.
4. **Objetivos del producto** — tabla con ID, objetivo, BRD vinculado, métrica, meta.
5. **Alcance** — dentro del alcance v1.0, fuera del alcance, roadmap de versiones.
6. **Personas** — Emprendedor Estudiante y Estudiante Comprador.
7. **User Stories** — tabla con ID, historia, prioridad MoSCoW.
8. **Criterios Gherkin** — mínimo 3 escenarios críticos.
9. **Priorización** — MoSCoW + tabla RICE para top 3.
10. **Requerimientos Funcionales** — tabla con ID, requisito, prioridad.
11. **NFRs** — tabla con ID, categoría, requerimiento, umbral.
12. **Dependencias** — sistemas externos y su propósito.
13. **Riesgos** — tabla con riesgo, impacto, mitigación.
14. **Trazabilidad** — matriz PRD → BRD → FSD.

---

## Invariants

- El PRD debe citar al BRD v2 en cada objetivo.
- Los NFRs deben tener umbrales numéricos medibles.
- El sistema es exclusivamente para la comunidad UMSS (no marketplace público).
- La validación QR es automática, no manual.

---

## Failure modes

- `E_NO_METRICS`: NFR sin umbral numérico → reintentar.
- `E_MISSING_GHERKIN`: user stories críticas sin criterios Gherkin → reintentar.
- `E_SCOPE_CREEP`: funcionalidades fuera de v1.0 incluidas en alcance → corregir.
