---
name: dti-author
description: >
  Puebla y mantiene secciones del Documento Técnico Inicial (docs/DTI.md)
  siguiendo las 23 secciones del DTI vFinal de UMSS Market. Mantiene sincronía
  atómica ADR ↔ DTI ↔ AGENTS.md en un único commit. Activar cuando el usuario
  invoca "@dti-author §N <tema>" o solicita "actualizar AGENTS.md desde el DTI"
  o "reflejar ADR-NNNN en el DTI".
allowed-tools:
  - read
  - edit
model-tier: sonnet
fsd-version-min: v0.1
status: stable
owner: G1 — Rodriguez / Vargas
---

# Skill: dti-author — Poblar DTI y sincronizar con AGENTS.md

> **Activación**: `@dti-author §N <tema>` en el chat o al abrir `docs/DTI.md`.  
> **Alcance**: `docs/DTI.md` + `AGENTS.md` (siempre sincrónicos).

## 1. Cuándo activarlo (triggers)

- DURANTE: redacción inicial, actualización de secciones, reflejo de ADRs.
- ARRANCA cuando: el usuario invoca `"@dti-author §N <tema>"` o abre `docs/DTI.md`.
- NO ACTIVAR cuando: el usuario está definiendo capacidades de producto (PRD/FSD); este skill asume que el FSD ya existe como fuente de verdad.

## 2. Entradas obligatorias

El usuario MUST proporcionar al menos una de:

- Sección del DTI a poblar (§0 a §23).
- Ruta a un ADR nuevo o actualizado: `docs/adr/ADR-NNNN-<slug>.md`.
- Decisión arquitectónica que debe reflejarse en DTI + AGENTS.md.

Si falta, responder: `"Necesito la sección del DTI (§N) o el ADR fuente antes de redactar."`

## 3. Fuentes de verdad (precedencia)

1. `docs/DTI.md` — estructura de 23 secciones existente (frontmatter YAML obligatorio).
2. `docs/FSD_v2.md` — casos de uso y reglas de negocio (FSD-UC-001 a FSD-UC-003).
3. `docs/adr/*.md` — ADRs vigentes (ADR-0001 Aceptada, ADR-0002 Propuesta, ADR-0003 Aceptada).
4. `AGENTS.md` — estado declarado para los agentes (sincronizar cuando cambia arquitectura).
5. `docs/architecture/EVENT_CATALOG.md` — eventos del sistema.
6. `diagrams/*.mmd` — diagramas Mermaid como evidencia visual.

## 4. Procedimiento

1. **Verificar frontmatter**: confirmar que `docs/DTI.md` tiene frontmatter YAML válido con todos los campos del template (`producto`, `grupo`, `version`, `stack`, `adrs_vigentes`, `release_objetivo`).
2. **Identificar audiencia de la sección**:
   - `[humano]`: prosa estructurada — §1 Visión, §17 Trade-offs, §18 Riesgos, §19 Roadmap.
   - `[máquina]`: YAML/tablas semánticas — §0 frontmatter, §4 Modelo de Dominio, §7 Event-Driven, §11 NFRs.
   - `[humano+máquina]`: narrativa breve + tabla — §3 Arquitectura, §5 Hexagonal, §8 Deployment.
3. **Poblar la sección** con datos derivados de las fuentes de verdad; cero invención.
4. **Detectar drift DTI ↔ AGENTS.md**: si la decisión implica nuevo stack, nuevo invariante, nueva ruta crítica → proponer diff de `AGENTS.md` en el **mismo commit**.
5. **Verificar referencias cruzadas**: cada decisión arquitectónica debe citar su `[ADR-NNNN]`.
6. **Sugerir mensaje de commit** en formato:
   ```
   docs(dti+agents): <decisión> [ADR-NNNN]
   ```

## 5. Salida esperada

- Sección del DTI poblada con tag de audiencia correcto.
- Si la sección implica cambio arquitectónico:
  - Diff de `AGENTS.md` (sección afectada: Stack / Invariantes / Eventos / ADRs).
  - Mensaje de commit sugerido.
- Tabla de trazabilidad cuando aplique:

| Decisión | ADR fuente | Sección DTI | Sección AGENTS.md |
|---|---|---|---|
| Arquitectura hexagonal | ADR-0003 | §3.1, §5 | `## Capas arquitectónicas` |
| Event-Driven con RabbitMQ | ADR-0001 | §7 | `## Eventos del sistema` |

## 6. Verificación ("bien hecho")

- Frontmatter YAML del DTI parseable sin errores.
- Cada decisión nueva cita su `[ADR-NNNN]`; cero decisiones huérfanas.
- `AGENTS.md` y DTI coherentes en el mismo commit (`git show` lo demuestra).
- Los 7 invariantes del dominio en `AGENTS.md` no fueron alterados sin ADR justificatorio.
- Cero secretos ni PII en el documento.
- Secciones que no aplican marcadas `N/A` con 1 línea de justificación.

## 7. Anti-patrones específicos

- **Decisiones sin ADR**: si va al DTI, va con ADR. Sin ADR, no entra.
- **Drift silencioso**: actualizar DTI sin tocar `AGENTS.md` cuando la decisión afecta a ambos.
- **Inventar lógica de negocio**: si no está en FSD o ADR, crear `TODO(spec)`.
- **Sobre-poblar secciones N/A**: §3.5 (runtime IA) y §15.3 (agentes runtime) son N/A justificado en UMSS Market.
- **Tablas decorativas**: usar tablas solo cuando aportan estructura semántica, no de relleno.

## 8. Mini ejemplo de invocación

> "@dti-author Pobla §7 (Event-Driven) del DTI incorporando el evento `STOCK_RELEASED` recién añadido al EVENT_CATALOG. Propón el diff correspondiente de AGENTS.md."

> "@dti-author Refleja ADR-0003 (Hexagonal Architecture) en §3.1 y §5 del DTI."

## 9. Modos de fallo conocidos

- ADR fuente en estado `Propuesta` (no `Aceptada`) → STOP, pedir confirmación humana antes de propagar al DTI.
- Conflicto entre FSD y un ADR → STOP, escalar; no resolver por cuenta propia.
- Frontmatter con campos faltantes → completar con `<pendiente>` y crear `TODO(spec)`.
- Los invariantes del dominio (INV-001 a INV-007 en `AGENTS.md`) están siendo modificados → STOP, requerir revisión del equipo.

## 10. Secciones de referencia UMSS Market

| Sección | Audiencia | Contenido clave |
|---|---|---|
| §0 | máquina | frontmatter YAML completo |
| §1 | humano | Visión, North Star, KPIs |
| §3 | humano+máquina | C4 N1/N2/N3, sequence, hexagonal |
| §7 | máquina | catálogo 8 eventos, saga stateDiagram |
| §9 | humano+máquina | capa IA SDLC-only, PR-FSD-001/002/003 |
| §11 | máquina | 10 NFRs con umbrales y mecanismos |
| §13 | máquina | STRIDE, JWT+RBAC, HMAC, bcrypt cost=12 |
| §21 | máquina | tabla ADRs vigentes |
| §23 | máquina | guardrails de evaluación IA |

## 11. Registro de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0.0 | 25/05/2026 | Rodriguez / Vargas | Versión inicial para UMSS Market release/2.0.0 |
