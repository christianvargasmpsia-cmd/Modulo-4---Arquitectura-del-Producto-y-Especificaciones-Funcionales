# Aportes Individuales — Release 1.0.0 — UMSS Market

> Documento de trazabilidad de contribuciones individuales del grupo para el release evaluable `release/1.0.0`.

---

# 0. Metadatos

| Campo | Valor |
|-------|-------|
| Producto | UMSS Market |
| Grupo | G1 |
| Release evaluable | release/1.0.0 |
| Sesión asociada | S5 |
| Fecha de cierre | 15/05/2026 |
| Integrantes del grupo (n) | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo (n = 2) |
| Branch del release | release/1.0.0 |
| Commit de cierre (HEAD) | a5dc7cb |

---

# 1. Tabla de tareas atribuidas

| # | Integrante | Tarea concreta | Categoría | Referencia | Fecha |
|---|------------|----------------|-----------|------------|-------|
| 1 | Rodriguez Gonzales Abad Melani | Refinamiento completo BRD v2 | BRD | docs/BRD_v2.md | 11/05 |
| 2 | Rodriguez Gonzales Abad Melani | Business Case, stakeholders y KPIs | BRD | docs/BRD_v2.md §2-§5 | 11/05 |
| 3 | Rodriguez Gonzales Abad Melani | User Stories INVEST con criterios aceptación | PRD | docs/PRD_v1.md §5 | 11/05 |
| 4 | Rodriguez Gonzales Abad Melani | Roadmap y trazabilidad PRD | PRD | docs/PRD_v1.md §12-§13 | 11/05 |
| 5 | Rodriguez Gonzales Abad Melani | Prompt Contracts QR y pagos | Prompt | docs/PROMPT_MAPPINGS.md | 11/05 |
| 6 | Rodriguez Gonzales Abad Melani | Prompt Contracts recomendaciones | Prompt | docs/PROMPT_MAPPINGS.md §5 | 11/05 |
| 7 | Rodriguez Gonzales Abad Melani | Arquitectura C4 Nivel 1 | ADR | docs/dti/DTI_borrador.md §1 | 13/05 |
| 8 | Rodriguez Gonzales Abad Melani | ADR Multi-tenant y PostgreSQL | ADR | docs/dti/DTI_borrador.md §2 | 13/05 |
| 9 | Rodriguez Gonzales Abad Melani | ADR API bancaria QR y SMTP | ADR | docs/dti/DTI_borrador.md §2 | 13/05 |
| 10 | Rodriguez Gonzales Abad Melani | Core Domain Analysis | ADR | docs/architecture/CORE_DOMAIN.md | 15/05 |
| 11 | Rodriguez Gonzales Abad Melani | Dependency Rule y Ports & Adapters | ADR | docs/architecture/CORE_DOMAIN.md §2.4-§2.5 | 15/05 |
| 12 | Vargas Sandoval Christian Bernardo | Desarrollo inicial ecommerce UMSS | Código | umss_ecommerce.py | 30/04 |
| 13 | Vargas Sandoval Christian Bernardo | Elaboración inicial BRD | BRD | docs/BRD.md | 01/05 |
| 14 | Vargas Sandoval Christian Bernardo | Elaboración FSD inicial | FSD | docs/FSD_v1.md | 11/05 |
| 15 | Vargas Sandoval Christian Bernardo | Elaboración LFSD | FSD | docs/LFSD.md | 11/05 |
| 16 | Vargas Sandoval Christian Bernardo | Diseño estructura Mermaid diagrams | Diagrama | docs/diagrams | 11/05 |
| 17 | Vargas Sandoval Christian Bernardo | Revisión arquitectura backend | ADR | docs/dti/DTI_borrador.md | 13/05 |
| 18 | Vargas Sandoval Christian Bernardo | Integración release/1.0.0 | Código | branch release/1.0.0 | 15/05 |

---

# 2. Resumen por integrante

| Integrante | Total de tareas | Categorías cubiertas (#) | Observación |
|------------|-----------------|--------------------------|--------------|
| Rodriguez Gonzales Abad Melani | 11 | 4 | Lideró documentación, arquitectura y prompt contracts |
| Vargas Sandoval Christian Bernardo | 7 | 5 | Lideró implementación técnica y estructura funcional |
| **Total grupo** | **18** | — | — |

---

# 3. Cálculo del factor de aporte individual

```text
aporte_promedio_grupo = total_tareas_grupo / n_integrantes

18 / 2 = 9
factor_i = clamp(tareas_i / aporte_promedio_grupo, 0.5, 1.1)
Aplicación
Integrante	Tareas	factor sin clamp	factor final
Rodriguez Gonzales Abad Melani	11	11/9 = 1.22	1.10
Vargas Sandoval Christian Bernardo	7	7/9 = 0.77	0.77
4. Reglas del grupo sobre qué cuenta como tarea

El grupo adoptó la granularidad estándar definida por el módulo.

Se consideró como tarea válida:

User Stories INVEST
Prompt Contracts completos
ADRs documentados
Diagramas arquitectónicos
Secciones sustantivas BRD/PRD/FSD
Arquitectura C4
Core Domain Analysis
Código funcional verificable

No se contabilizaron:

cambios cosméticos
correcciones tipográficas
renombrados
cambios menores de formato
5. Auditoría del docente (opcional)
Integrante	Factor calculado (§3)	Factor final aplicado	Justificación del ajuste
Rodriguez Gonzales Abad Melani	1.10	—	—
Vargas Sandoval Christian Bernardo	0.77	—	—
6. Checklist de cierre del release
 Metadatos completos
 Tareas verificables
 Factores calculados
 Evidencia en release/1.0.0
 Compatible con GitHub Preview
