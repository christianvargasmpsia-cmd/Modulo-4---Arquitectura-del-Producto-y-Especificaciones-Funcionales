# Aportes Individuales — Release 2.0.0 — UMSS Market

> Documento de trazabilidad de contribuciones individuales del grupo para el release evaluable `release/2.0.0`.

---

# 0. Metadatos

| Campo | Valor |
|-------|-------|
| Producto | UMSS Market |
| Grupo | G1 |
| Release evaluable | release/2.0.0 |
| Sesión asociada | S6 |
| Fecha de cierre | 28/05/2026 |
| Integrantes del grupo (n) | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo (n = 2) |
| Branch del release | release/2.0.0 |
| Commit de cierre (HEAD) | 28e7148  |

---

# 1. Tabla de tareas atribuidas

| # | Integrante | Tarea concreta | Categoría | Referencia | Fecha |
|---|------------|----------------|-----------|------------|-------|
| 1 | Rodriguez Gonzales Abad Melani | DTI vFinal — §0 a §6 (Metadatos, Visión, C4, Arquitectura, Dominio, Hexagonal) | DTI | docs/DTI.md §0-§6 | 24/05 |
| 2 | Rodriguez Gonzales Abad Melani | DTI vFinal — §7 a §11 (Event-Driven, Deployment, IA, Prompts, NFRs) | DTI | docs/DTI.md §7-§11 | 24/05 |
| 3 | Rodriguez Gonzales Abad Melani | DTI vFinal — §12 a §17 (POCs, Seguridad, Observabilidad, DevOps, Antipatrones, Trade-offs) | DTI | docs/DTI.md §12-§17 | 24/05 |
| 4 | Rodriguez Gonzales Abad Melani | DTI vFinal — §18 a §23 (Riesgos, Roadmap, Glosario, ADRs, Auditoría IA, Guardrails) | DTI | docs/DTI.md §18-§23 | 24/05 |
| 5 | Rodriguez Gonzales Abad Melani | Contrato IA PR-FSD-001 (validación webhook pago QR) | Prompt Contract | docs/PR-FSD-001.md | 24/05 |
| 6 | Rodriguez Gonzales Abad Melani | Contrato IA PR-FSD-002 (validación stock atómico) | Prompt Contract | docs/PR-FSD-002.md | 24/05 |
| 7 | Rodriguez Gonzales Abad Melani | Contrato IA PR-FSD-003 (coordinación eventos distribuidos) | Prompt Contract | docs/PR-FSD-003.md | 25/05 |
| 8 | Rodriguez Gonzales Abad Melani | ADR-0003 Arquitectura Hexagonal (Ports & Adapters) | ADR | docs/adr/ADR-0003-hexagonal-architecture.md | 24/05 |
| 9 | Rodriguez Gonzales Abad Melani | Diagramas C4 N3 Order Service y Hexagonal Architecture | Diagrama | diagrams/c4-level3-order-service.mmd, diagrams/hexagonal-architecture.mmd | 25/05 |
| 10 | Rodriguez Gonzales Abad Melani | Documentación formal POC-01 y POC-02 (evidencia) | POC | poc/POC-01/README.md, poc/POC-02/README.md | 25/05 |
| 11 | Rodriguez Gonzales Abad Melani | Roadmap técnico multi-release (Módulos 4-7) | Roadmap | docs/roadmap.md | 25/05 |
| 12 | Vargas Sandoval Christian Bernardo | AGENTS.md sincronizado con DTI (stack, invariantes, restricciones) | Agentes IA | AGENTS.md | 25/05 |
| 13 | Vargas Sandoval Christian Bernardo | Diagrama Sequence QR Payment (flujo completo con compensaciones) | Diagrama | diagrams/sequence-qr-payment.mmd | 25/05 |
| 14 | Vargas Sandoval Christian Bernardo | Diagrama Saga State (stateDiagram-v2 con compensaciones) | Diagrama | diagrams/saga-state.mmd | 25/05 |
| 15 | Vargas Sandoval Christian Bernardo | Diagrama AWS Deployment (ECS Fargate, RDS, Redis, Amazon MQ) | Diagrama | diagrams/aws-deployment.mmd | 25/05 |
| 16 | Vargas Sandoval Christian Bernardo | Revisión y ajuste FSD v2 (reglas de negocio BR-001 a BR-008) | FSD | docs/FSD_v2.md | 24/05 |
| 17 | Vargas Sandoval Christian Bernardo | Skills de arquitectura distribuida, event catalog y saga designer | Skills | skills/*.md | 24/05 |
| 18 | Vargas Sandoval Christian Bernardo | Integración y cierre release/2.0.0 (branch + commit final) | DevOps | branch release/2.0.0 | 28/05 |

---

# 2. Resumen por integrante

| Integrante | Total de tareas | Categorías cubiertas (#) | Observación |
|------------|-----------------|--------------------------|--------------|
| Rodriguez Gonzales Abad Melani | 11 | 5 (DTI, Prompt Contracts, ADR, Diagrama, POC, Roadmap) | Lideró la elaboración del DTI vFinal y los contratos funcionales IA |
| Vargas Sandoval Christian Bernardo | 7 | 5 (AGENTS.md, Diagrama, FSD, Skills, DevOps) | Lideró la sincronización IA, diagramas de flujo y cierre del release |
| **Total grupo** | **18** | — | — |

---

# 3. Cálculo del factor de aporte individual

```text
aporte_promedio_grupo = total_tareas_grupo / n_integrantes
                      = 18 / 2 = 9.0 tareas promedio

factor_rodriguez   = 11 / 9.0 = 1.22  (aporte superior al promedio)
factor_vargas      =  7 / 9.0 = 0.78  (aporte levemente por debajo del promedio)

Nota: La diferencia en cantidad de tareas se debe a que las tareas de Rodriguez
incluyen secciones múltiples del DTI (23 secciones totales), mientras que las
tareas de Vargas incluyen el cierre del release y la integración técnica completa.
```

---

# 4. Artefactos entregados — Release 2.0.0

## Documentos técnicos nuevos

| Artefacto | Ruta | Tipo |
|---|---|---|
| DTI vFinal | `docs/DTI.md` | Contrato técnico (23 secciones) |
| AGENTS.md | `AGENTS.md` | Configuración agentes IA |
| ADR-0003 | `docs/adr/ADR-0003-hexagonal-architecture.md` | Decision record |
| PR-FSD-001 | `docs/PR-FSD-001.md` | Contrato IA |
| PR-FSD-002 | `docs/PR-FSD-002.md` | Contrato IA |
| PR-FSD-003 | `docs/PR-FSD-003.md` | Contrato IA |
| Roadmap | `docs/roadmap.md` | Hoja de ruta |

## Diagramas nuevos

| Diagrama | Ruta | Tipo |
|---|---|---|
| C4 Level 3 — Order Service | `diagrams/c4-level3-order-service.mmd` | C4 Nivel 3 |
| Sequence — QR Payment | `diagrams/sequence-qr-payment.mmd` | Secuencia |
| Saga State | `diagrams/saga-state.mmd` | Estado |
| Hexagonal Architecture | `diagrams/hexagonal-architecture.mmd` | Estructural |
| AWS Deployment | `diagrams/aws-deployment.mmd` | Despliegue |

## POCs formalizados

| POC | Ruta | Descripción |
|---|---|---|
| POC-01 | `poc/POC-01/README.md` | Evidencia lógica core CLI |
| POC-02 | `poc/POC-02/README.md` | Evidencia flujo UX QR |

---

# 5. Checklist de entrega release/2.0.0

| # | Ítem | Estado |
|---|------|--------|
| 1 | DTI vFinal completo (≥ 18 secciones) | ✅ 23/23 |
| 2 | AGENTS.md sincronizado con DTI | ✅ |
| 3 | ≥ 3 ADRs documentados | ✅ 3 (ADR-0001, ADR-0002, ADR-0003) |
| 4 | ≥ 2 POCs ejecutables con evidencia | ✅ 2 (POC-01, POC-02) |
| 5 | ≥ 8 diagramas .mmd en diagrams/ | ✅ 8 |
| 6 | Contratos funcionales IA (PR-FSD) | ✅ 3 contratos |
| 7 | Roadmap técnico multi-módulo | ✅ |
| 8 | FSD v2 completo | ✅ |
| 9 | Aportes individuales documentados | ✅ |
| 10 | Branch release/2.0.0 creado | ✅ |
