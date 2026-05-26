---
name: c4-architect
description: >
  Genera y actualiza diagramas C4 en formato Mermaid (.mmd) para UMSS Market.
  Produce C4 Nivel 1 (contexto), Nivel 2 (contenedores), Nivel 3 (componentes
  de un servicio) y diagramas de despliegue AWS. Guarda en diagrams/*.mmd y
  sincroniza las referencias en docs/DTI.md. Activar con
  "@c4-architect nivel <1|2|3|deploy> [servicio]".
allowed-tools:
  - read
  - edit
model-tier: sonnet
fsd-version-min: v0.1
status: stable
owner: G1 — Rodriguez / Vargas
---

# Skill: c4-architect — Generar y actualizar diagramas C4 en Mermaid

> **Activación**: `@c4-architect nivel <1|2|3|deploy> [servicio]`  
> Ejemplos: `@c4-architect nivel 3 payment-service`, `@c4-architect nivel 2`

## 1. Cuándo activarlo (triggers)

- DURANTE: diseño de arquitectura, incorporación de un nuevo servicio, actualización del stack, preparación de evidencia para el DTI.
- ARRANCA cuando: el usuario invoca `"@c4-architect nivel N [servicio]"` o solicita "actualizar el diagrama de contenedores".
- NO ACTIVAR cuando: el usuario está debatiendo si adoptar un servicio (eso es trabajo del ADR); este skill genera el diagrama de la arquitectura ya decidida.

## 2. Entradas obligatorias

| Parámetro | Tipo | Descripción |
|---|---|---|
| `nivel` | `1 \| 2 \| 3 \| deploy` | Nivel C4 a generar |
| `servicio` | string (opcional) | Requerido solo para nivel 3 (ej. `order-service`) |
| `acción` | `crear \| actualizar` | Crear nuevo diagrama o actualizar el existente |

Si `nivel=3` sin `servicio`, responder: `"Indica el microservicio para el diagrama de componentes (ej. order-service, payment-service)."`

## 3. Fuentes de verdad (precedencia)

1. `diagrams/*.mmd` — diagramas existentes (base para actualizaciones).
2. `docs/DTI.md` §3 — descripción narrativa de la arquitectura.
3. `AGENTS.md` §Capas arquitectónicas + §Stack — servicios y tecnologías canónicas.
4. `docs/adr/*.md` — decisiones que justifican la estructura (ADR-0001, ADR-0003).
5. `docs/architecture/BOUNDED_CONTEXTS.md` — bounded contexts del sistema.

## 4. Actores, servicios e infraestructura canónicos de UMSS Market

### Actores (C4 N1)
- **Cliente UMSS** — comprador con RU activo
- **Vendedor** — emprendedor UMSS con tienda
- **Administrador** — gestión de la plataforma

### Sistemas externos (C4 N1)
- **API Bancaria QR** — generación de QR + webhook de confirmación
- **SIIS UMSS** — validación de RU universitario
- **FCM (Google)** — push notifications

### Contenedores/servicios (C4 N2)
| Servicio | Tecnología | Puerto |
|---|---|---|
| React PWA | React 18 + Zustand | — (CloudFront) |
| API Gateway | FastAPI + JWT | 8000 |
| order-service | FastAPI + SQLAlchemy | 8001 |
| payment-service | FastAPI + SQLAlchemy | 8002 |
| inventory-service | FastAPI + Redis | 8003 |
| catalog-service | FastAPI + SQLAlchemy | 8004 |
| notification-service | FastAPI + FCM | 8005 |
| realtime-gateway | FastAPI + WebSocket | 8006 |
| PostgreSQL 16 | RDS Multi-AZ | 5432 |
| Redis 7 | ElastiCache | 6379 |
| RabbitMQ 3.13 | Amazon MQ | 5672 |

## 5. Procedimiento

### Para nivel 1 (C4 Contexto)
1. Leer `diagrams/c4-context.mmd` si existe.
2. Generar `flowchart TB` con actores → sistema central → sistemas externos.
3. Incluir relaciones con labels descriptivos (ej. `"Compra productos con QR"`).
4. Guardar en `diagrams/c4-context.mmd`.

### Para nivel 2 (C4 Contenedores)
1. Leer `diagrams/c4-container.mmd` si existe.
2. Generar `flowchart TB` con subgraphs por capa (Edge, ECS Services, Data Layer).
3. Incluir todos los 6 microservicios + API Gateway + React PWA.
4. Mostrar flujos: Cliente → CloudFront → ALB → API GW → Servicios.
5. Guardar en `diagrams/c4-container.mmd`.

### Para nivel 3 (C4 Componentes — por servicio)
1. Identificar el servicio solicitado en la lista canónica.
2. Aplicar la estructura hexagonal (ADR-0003): Adapters/In → Application → Domain → Adapters/Out.
3. Mostrar: routers FastAPI, consumers AMQP, use cases, aggregates, repositories, publishers.
4. Guardar en `diagrams/c4-level3-<service>.mmd`.

### Para deploy (Despliegue AWS)
1. Leer `diagrams/aws-deployment.mmd` si existe.
2. Incluir: CloudFront, WAF, ALB, ECS Fargate, RDS Multi-AZ, ElastiCache, Amazon MQ.
3. Mostrar IAM roles, Secrets Manager, CloudWatch, ECR.
4. Guardar en `diagrams/aws-deployment.mmd`.

### Paso final (todos los niveles)
5. Actualizar la referencia en `docs/DTI.md` §3 o §8 si el diagrama es nuevo.
6. Verificar que el diagrama renderiza sin errores (sintaxis Mermaid válida).

## 6. Reglas de sintaxis Mermaid para UMSS Market

```
✅ Permitido:
  flowchart TB / LR
  stateDiagram-v2
  sequenceDiagram
  subgraph con nombre descriptivo
  Estilos: style NodeId fill:#color,stroke:#color,stroke-width:Npx

❌ Prohibido:
  graph TD (usar flowchart TB)
  Comentarios con // (usar %%)
  note right of en stateDiagram (no soportado en todas las versiones)
  Nodos con caracteres especiales sin comillas
```

## 7. Salida esperada

- Archivo `.mmd` en `diagrams/` con el diagrama completo.
- Si es un nuevo diagrama: referencia añadida en `docs/DTI.md` §3 o §8.
- Confirmación del path del archivo creado/actualizado.

## 8. Verificación ("bien hecho")

- El diagrama se puede renderizar en Mermaid Live Editor (mermaid.live) sin errores.
- Todos los servicios mencionados en `AGENTS.md` §Capas arquitectónicas están representados.
- Las relaciones tienen labels descriptivos (no flechas vacías).
- Para C4 N3: la separación hexagonal (domain / application / adapters) es visible.
- No hay servicios inventados que no estén en el stack declarado.

## 9. Anti-patrones específicos

- **Diagramas incompletos**: un C4 N2 sin todos los microservicios no es válido.
- **Mezclar niveles**: no incluir detalles de componentes internos en un C4 N1 o N2.
- **Relaciones sin label**: toda flecha debe describir el tipo de comunicación.
- **Ignorar la capa edge**: el diagrama de despliegue sin CloudFront/WAF/ALB está incompleto.
- **Agregar servicios no decididos**: si el servicio no está en `AGENTS.md`, requiere ADR previo.

## 10. Mini ejemplo de invocación

> "@c4-architect nivel 3 payment-service — genera el diagrama de componentes del payment-service mostrando la arquitectura hexagonal con el webhook handler, el adaptador de la API bancaria y el publisher AMQP."

> "@c4-architect nivel 2 — actualiza el diagrama de contenedores agregando el nuevo analytics-service que se decidió en ADR-0006."

## 11. Registro de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0.0 | 25/05/2026 | Rodriguez / Vargas | Versión inicial para UMSS Market release/2.0.0 |
