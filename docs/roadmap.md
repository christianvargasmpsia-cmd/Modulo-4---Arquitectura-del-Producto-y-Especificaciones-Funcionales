# Roadmap Técnico — UMSS Market

> **Documento**: Hoja de ruta de evolución del producto por módulos académicos.  
> **Sincronizado con**: `docs/DTI.md` §19 — Roadmap y evolución del sistema.  
> **Grupo**: G1 | **Release activo**: `release/2.0.0`

---

## Visión de largo plazo

**North Star**: Ser la plataforma de referencia para el comercio formal universitario en UMSS, alcanzando ≥ 95% de pedidos completados exitosamente y < 60 segundos de tiempo de compra promedio.

---

## Release 1.0.0 — Módulo 4: Fundamentos Arquitectónicos ✅

**Período**: Mayo 2026 | **Estado**: Completado

### Entregables
| Artefacto | Estado | Descripción |
|---|---|---|
| BRD v3 | ✅ | Requerimientos de negocio finales |
| MRD v2 | ✅ | Requerimientos de mercado |
| PRD v2 | ✅ | Requerimientos de producto con User Stories |
| FSD v2 | ✅ | Especificación funcional con UCs y reglas de negocio |
| ADR-0001 | ✅ | Arquitectura orientada a eventos — Aceptada |
| ADR-0002 | ✅ | Saga Pattern (Coreografía) — Propuesta |
| POC-01 | ✅ | Lógica core del dominio en CLI |
| POC-02 | ✅ | Flujo UX de pago QR en HTML |
| Diagramas C4 N1 + N2 | ✅ | c4-context.mmd + c4-container.mmd |

### KPIs objetivo al finalizar release 1.0.0
- Arquitectura definida con ≥ 3 ADRs justificados.
- Al menos 2 POCs ejecutables que validen las decisiones arquitectónicas clave.
- Especificación funcional completa con ≥ 3 casos de uso documentados.

---

## Release 2.0.0 — Módulo 4 (Final): DTI + Arquitectura Completa 🚀

**Período**: 25/05/2026 | **Estado**: En progreso

### Entregables
| Artefacto | Estado | Descripción |
|---|---|---|
| DTI vFinal | ✅ | Contrato técnico completo — 23 secciones |
| AGENTS.md | ✅ | Configuración de agentes IA sincronizada con DTI |
| ADR-0003 | ✅ | Arquitectura Hexagonal — Aceptada |
| PR-FSD-001 | ✅ | Contrato IA: validación pago QR |
| PR-FSD-002 | ✅ | Contrato IA: validación stock |
| PR-FSD-003 | ✅ | Contrato IA: eventos distribuidos |
| Diagramas C4 N3 | ✅ | c4-level3-order-service.mmd |
| Diagrama Sequence | ✅ | sequence-qr-payment.mmd |
| Diagrama Saga | ✅ | saga-state.mmd |
| Diagrama Hexagonal | ✅ | hexagonal-architecture.mmd |
| Diagrama AWS | ✅ | aws-deployment.mmd |
| Docs formales POC-01 | ✅ | poc/POC-01/README.md |
| Docs formales POC-02 | ✅ | poc/POC-02/README.md |
| Aportes release-2.0.0 | ✅ | docs/aportes/release-2.0.0.md |

### KPIs objetivo al finalizar release 2.0.0
- DTI con ≥ 18/23 secciones completadas (objetivo: 23/23).
- AGENTS.md sincronizado con DTI en el mismo commit.
- ≥ 8 diagramas `.mmd` en `diagrams/` (logrado: 8).
- ≥ 3 ADRs con estado documentado (logrado: 3 — ADR-0001 Aceptada, ADR-0002 Propuesta, ADR-0003 Aceptada).
- ≥ 2 POCs con documentación formal de evidencia.

---

## Release 3.0.0 — Módulo 5: Implementación Backend Core 🔜

**Período estimado**: Junio 2026

### Objetivos
1. Implementar `order-service` con arquitectura hexagonal (ADR-0003) siguiendo el contrato PR-FSD-003.
2. Implementar `payment-service` con webhook bancario real y validación HMAC (PR-FSD-001).
3. Implementar `inventory-service` con operación atómica de stock (PR-FSD-002).
4. Configurar RabbitMQ con exchanges y queues según el catálogo de eventos.
5. Implementar tests unitarios del dominio con cobertura ≥ 85%.

### Entregables planificados
| Artefacto | Tipo | Descripción |
|---|---|---|
| `backend/order-service/` | Código | Servicio con hexagonal architecture completa |
| `backend/payment-service/` | Código | Webhook handler + QR generator |
| `backend/inventory-service/` | Código | Stock atomic operations + Redis TTL |
| `tests/unit/domain/` | Tests | Tests de dominio (sin mocks de BD) |
| `docker-compose.yml` | Infra | Stack local: PostgreSQL + Redis + RabbitMQ |
| ADR-0004 | Doc | PostgreSQL como base de datos primaria |

### KPIs módulo 5
- Todos los tests de dominio pasan sin base de datos real.
- El flujo completo ORDER_CREATED → ORDER_CONFIRMED funciona en entorno local.
- Los contratos PR-FSD-001, PR-FSD-002, PR-FSD-003 son respetados en el código.

---

## Release 4.0.0 — Módulo 6: Frontend PWA + Integración 🔜

**Período estimado**: Julio 2026

### Objetivos
1. Implementar React 18 PWA mobile-first con Zustand.
2. Flujo completo de compra con QR real (API Bancaria sandbox).
3. WebSocket para actualizaciones en tiempo real.
4. Integración con SIIS UMSS para validación de RU.

### Entregables planificados
| Artefacto | Tipo | Descripción |
|---|---|---|
| `frontend/` | Código | React 18 PWA — 3 UCs implementados |
| `backend/catalog-service/` | Código | Catálogo multi-tenant |
| `backend/notification-service/` | Código | FCM push notifications |
| `backend/realtime-gateway/` | Código | WebSocket con AMQP consumer |
| `tests/integration/` | Tests | Tests de integración end-to-end |

### KPIs módulo 6
- Tiempo de compra promedio < 60 segundos en prueba de usuario.
- ≥ 98% de QRs generados exitosamente (sandbox).
- Diseño mobile-first validado en 3 dispositivos distintos.

---

## Release 5.0.0 — Módulo 7: Deployment AWS + Observabilidad 🔜

**Período estimado**: Agosto 2026

### Objetivos
1. Deploy completo en AWS ECS Fargate (Multi-AZ).
2. Configurar CloudWatch con alertas para los 10 NFRs definidos.
3. Tests de carga con k6: 100 usuarios concurrentes, p95 < 200ms.
4. Documentación de operaciones y runbooks.

### Entregables planificados
| Artefacto | Tipo | Descripción |
|---|---|---|
| `infra/terraform/` | IaC | Infraestructura AWS como código |
| `tests/load/` | Tests | Scripts k6 para pruebas de carga |
| `docs/runbooks/` | Doc | Runbooks de operación |
| ADR-0005 | Doc | AWS como proveedor cloud principal |
| Pipeline CI/CD completo | DevOps | GitHub Actions → ECR → ECS |

### KPIs módulo 7 (NFRs de producción)
- Disponibilidad ≥ 99.5% en ventana de evaluación.
- p95 latencia API < 200ms.
- 0 pedidos con stock negativo en toda la evaluación.
- RTO < 30 minutos en escenario de DR (Warm Standby).

---

## Hitos críticos

```
15/05/2026  release/1.0.0  ✅ Fundamentos arquitectónicos
28/05/2026  release/2.0.0  🚀 DTI vFinal + Arquitectura completa  ← ACTUAL
Jun 2026    release/3.0.0  Backend Core (3 microservicios)
Jul 2026    release/4.0.0  Frontend PWA + Integración
Ago 2026    release/5.0.0  AWS Deployment + Observabilidad
```

---

## Referencias

| Documento | Ubicación |
|---|---|
| DTI vFinal (§19 Roadmap) | `docs/DTI.md` |
| FSD v2 (casos de uso) | `docs/FSD_v2.md` |
| PRD v2 (KPIs y métricas) | `docs/PRD_v2.md` |
| ADRs vigentes | `docs/adr/` |
| Aportes por release | `docs/aportes/` |
