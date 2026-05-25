---
id: ADR-0003
título: Arquitectura Hexagonal (Ports & Adapters) en cada microservicio
estado: Aceptada
fecha: 24/05/2026
autores:
  - Rodriguez Gonzales Abad Melani
  - Vargas Sandoval Christian Bernardo
supercede: —
relacionados:
  - ADR-0001-event-driven-architecture.md
  - ADR-0002-saga-pattern.md
---

# ADR-0003 — Arquitectura Hexagonal / Clean Architecture en cada microservicio

## Contexto

El sistema UMSS Market está compuesto por 6 microservicios independientes (order-service, payment-service, inventory-service, catalog-service, notification-service, realtime-gateway). Cada servicio encapsula una bounded context con lógica de negocio crítica y reglas de dominio no negociables.

El equipo identificó los siguientes problemas con un enfoque de capas clásico (Layered Architecture):

1. **Mezcla de responsabilidades**: modelos SQLAlchemy usados directamente como entidades de dominio, mezclando persistencia y lógica de negocio.
2. **Tests lentos y frágiles**: para testear un caso de uso se requería instanciar la base de datos completa.
3. **Acoplamiento a frameworks**: lógica de negocio dentro de routers FastAPI, haciendo el dominio dependiente del framework.
4. **Dificultad para validar invariantes**: las reglas críticas (stock >= 0, idempotencia de pagos, HMAC) estaban dispersas en múltiples capas.

El proyecto necesita una arquitectura que:
- Aísle completamente el dominio de cualquier infraestructura externa.
- Permita testear los casos de uso con mocks simples de los puertos de salida.
- Facilite el intercambio de adaptadores (ej. PostgreSQL → Aurora) sin tocar el dominio.
- Garantice que los invariantes del dominio sean la única fuente de verdad.

## Decisión

Se adopta la **Arquitectura Hexagonal (Ports & Adapters)** de Alistair Cockburn como patrón estructural interno para cada microservicio, complementado con principios de Clean Architecture de Robert C. Martin para la organización de capas.

### Regla de dependencia (estricta)

```
Infraestructura → Aplicación → Dominio
```

Las dependencias solo pueden apuntar hacia adentro. El dominio no importa nada de FastAPI, SQLAlchemy, aio-pika, Redis ni ningún framework.

### Estructura canónica por servicio

```
<service-name>/
├── domain/                     # Puro Python — cero imports de framework
│   ├── aggregates/             # Order, Payment, Product, User
│   ├── entities/               # OrderItem, ProductVariant
│   ├── value_objects/          # Money, QRCode, RU, OrderStatus, CorrelationId
│   ├── events/                 # Domain events (dataclasses inmutables)
│   └── ports/
│       ├── input/              # Interfaces de los casos de uso (ABC)
│       └── output/             # IOrderRepository, IEventPublisher, IStockService
│
├── application/                # Orquesta dominio; NO importa infraestructura
│   ├── commands/               # CreateOrder, CancelOrder, ConfirmOrder
│   ├── queries/                # GetOrder, ListOrdersByUser
│   └── services/               # Saga coordinator (coreografía)
│
└── infrastructure/             # Implementaciones concretas de los puertos
    ├── adapters/
    │   ├── in/                 # FastAPI routers, RabbitMQ consumers, WebSocket
    │   └── out/                # SQLAlchemy repos, aio-pika publishers, HTTP clients
    └── config/                 # Dependency Injection container, settings
```

### Puertos y adaptadores por servicio (resumen)

| Puerto de Salida | Adaptador concreto | Servicio(s) |
|---|---|---|
| `IOrderRepository` | `SQLAlchemyOrderRepo` | order-service |
| `IPaymentRepository` | `SQLAlchemyPaymentRepo` | payment-service |
| `IProductRepository` | `SQLAlchemyProductRepo` | inventory-service, catalog-service |
| `IEventPublisher` | `RabbitMQPublisher` (aio-pika) | todos los servicios |
| `IStockLock` | `RedisStockLock` | inventory-service |
| `IQRGateway` | `BancoAPIHTTPAdapter` | payment-service |
| `IIdentityValidator` | `SIISHTTPAdapter` | order-service (registro) |
| `INotificationSender` | `FCMHTTPAdapter` | notification-service |

## Consecuencias

### Positivas

- Los invariantes del dominio (stock >= 0, idempotencia de `webhook_ref`, HMAC) se validan en la capa de dominio, independiente del adaptador de entrada.
- Los casos de uso son testeables con mocks de los puertos de salida, sin base de datos real (tests unitarios rápidos < 50ms).
- El intercambio de infraestructura (ej. Redis → Memcached para locks) no afecta el dominio ni los casos de uso.
- Facilita el cumplimiento de los contratos funcionales IA `PR-FSD-001`, `PR-FSD-002` y `PR-FSD-003`, ya que la lógica de validación vive en el dominio y es observable de forma aislada.
- La arquitectura es coherente con ADR-0001 (los eventos de dominio son publicados por adaptadores de salida) y ADR-0002 (el Saga Coordinator es un servicio de aplicación).

### Negativas

- Mayor cantidad de archivos y abstracciones iniciales.
- Curva de aprendizaje para desarrolladores nuevos en el patrón.
- Riesgo de over-engineering en servicios simples como `catalog-service` (mitigado: se permite simplificar los puertos en servicios CRUD sin lógica compleja).

### Neutrales

- La API pública REST y los eventos AMQP no cambian con esta arquitectura interna.
- La DI (Dependency Injection) se resuelve en el container de infraestructura; el dominio no la conoce.

## Alternativas consideradas

| Alternativa | Razón de rechazo |
|---|---|
| **Active Record** (SQLAlchemy ORM directo) | Mezcla infraestructura y dominio; imposibilita tests unitarios rápidos; los invariantes quedan dispersos en los models |
| **Clean Architecture estricta (Uncle Bob)** | 4 círculos concéntricos con más indirección (Entities/Use Cases/Interface Adapters/Frameworks) sin beneficio adicional claro para un equipo de 2 personas |
| **Layered Architecture clásica** | No protege el dominio de dependencias externas; facilita la "corrupción de capas"; ya fue evaluado y descartado en el análisis inicial |
| **Transaction Script** | Sin modelado del dominio; imposible garantizar los invariantes del negocio de forma declarativa |

## Métricas de cumplimiento (guardrails)

Los siguientes checks deben pasar en CI/CD:

```python
# domain/ no debe importar nada de estos módulos
FORBIDDEN_IMPORTS_IN_DOMAIN = [
    "fastapi", "sqlalchemy", "aio_pika", "redis",
    "aiohttp", "pydantic",  # solo se permite en adaptadores
]
```

- Cobertura de tests unitarios del dominio: **≥ 85%** (sin mocks de BD).
- Tiempo máximo de tests unitarios del dominio: **< 100ms** por servicio.
- Cada puerto declarado como `ABC` (Abstract Base Class) en `domain/ports/`.
- Ningún router FastAPI contiene lógica de negocio (solo validación de entrada y delegación al use case).

## Diagrama de referencia

Ver: [`diagrams/hexagonal-architecture.mmd`](../../diagrams/hexagonal-architecture.mmd)
