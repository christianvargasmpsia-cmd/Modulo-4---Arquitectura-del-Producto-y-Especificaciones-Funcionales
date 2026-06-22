# PR-IMPL-003

## Nombre

Implementación del Catálogo Marketplace — Feature 3

---

## Relación

* BRD v4
* PRD v3
* FSD-UC-004
* DD-UC-003

---

## Objetivo

Implementar el Catálogo Marketplace para UMSS Market con capacidades de búsqueda y filtrado de publicaciones, detalle de publicación enriquecido y perfil público de tienda. Implementado con Spring Boot 3, Java 21 y Arquitectura Hexagonal. Cobertura de test mínima: 90%.

---

## Prompt utilizado

Actúa como Arquitecto de Software Senior especializado en Spring Boot 3, Java 21 y Arquitectura Hexagonal.

Implementa el Feature 3 — Catálogo Marketplace para UMSS Market.

Requisitos funcionales:
- `GET /api/publicaciones` con filtros opcionales: texto (búsqueda libre, case-insensitive en nombre y descripción), tipo (PRODUCTO/SERVICIO), precioMin, precioMax, storeId.
- Sin filtros, devuelve todas las publicaciones activas.
- `GET /api/publicaciones/{id}` devuelve detalle enriquecido con nombre de tienda. Si no existe o está inactiva → HTTP 404.
- `GET /api/tiendas/{id}` devuelve perfil público de tienda + lista de publicaciones activas de esa tienda. Si no existe → HTTP 404.

Requisitos técnicos:
- Arquitectura Hexagonal: dominio sin dependencias de framework.
- Value object `CatalogFilter` en el dominio.
- Puerto `PublicationRepositoryPort` extendido con `findByFilters(CatalogFilter)`.
- Consulta JPQL con todos los filtros opcionales.
- `StoreController` nuevo para el perfil público.
- DTOs: `CatalogFilterRequest`, `PublicationSummaryResponse`, `PublicationDetailResponse`, `StorePublicProfileResponse`, `PublicationInStoreResponse`.
- Excepciones de dominio: `PublicationNotFoundException`, `StoreNotFoundException`.
- `GlobalExceptionHandler` mapea excepciones de dominio a HTTP 404.
- Tests unitarios de cada use case con Mockito (>90% de líneas).
- Tests de integración del controller con MockMvc.
- JaCoCo configurado (ya en pom.xml).

---

## Arquitectura Aplicada

Arquitectura Hexagonal (Ports & Adapters)

```
presentation  →  PublicationController (actualizado), StoreController (nuevo)
application   →  SearchCatalogUseCase, GetPublicationDetailUseCase, GetStorePublicProfileUseCase
domain        →  CatalogFilter (value object), PublicationNotFoundException, StoreNotFoundException
ports         →  PublicationRepositoryPort (+ findByFilters), StoreRepositoryPort (sin cambios)
adapters      →  JpaPublicationRepositoryAdapter (actualizado)
persistence   →  JpaPublicationRepository (+ query filtrada JPQL)
```

---

## Artefactos Generados

### Domain

* `CatalogFilter.java` — value object con filtros opcionales
* `PublicationNotFoundException.java` — excepción de dominio
* `StoreNotFoundException.java` — excepción de dominio

### Ports (modificados)

* `PublicationRepositoryPort.java` — agrega `findByFilters(CatalogFilter)`

### Application / Use Cases

* `SearchCatalogUseCase.java`
* `GetPublicationDetailUseCase.java`
* `GetStorePublicProfileUseCase.java`

### DTOs (Application)

* `CatalogFilterRequest.java`
* `PublicationSummaryResponse.java`
* `PublicationDetailResponse.java`
* `StorePublicProfileResponse.java`
* `PublicationInStoreResponse.java`

### Infrastructure / Controllers

* `PublicationController.java` — actualizado para usar SearchCatalogUseCase y GetPublicationDetailUseCase
* `StoreController.java` — nuevo endpoint perfil público de tienda

### Infrastructure / Persistence

* `JpaPublicationRepository.java` — agrega `findByFilters` con JPQL
* `JpaPublicationRepositoryAdapter.java` — actualizado

### Infrastructure / Config

* `GlobalExceptionHandler.java` — maneja PublicationNotFoundException, StoreNotFoundException

### Tests

* `SearchCatalogUseCaseTest.java`
* `GetPublicationDetailUseCaseTest.java`
* `GetStorePublicProfileUseCaseTest.java`
* `PublicationControllerTest.java`
* `StoreControllerTest.java`

---

## Reglas de Negocio Verificadas

| ID    | Descripción                                                               | Verificación        |
| ----- | ------------------------------------------------------------------------- | ------------------- |
| RN-001| Solo publicaciones activas en catálogo público                            | `activa = true` en JPQL |
| RN-002| `precioMin > precioMax` → HTTP 400                                        | Validación en use case |
| RN-003| Búsqueda case-insensitive                                                 | `LOWER()` en JPQL   |
| RN-004| Publicación inactiva → HTTP 404                                           | Use case valida activa |
| RN-005| Tienda no encontrada → HTTP 404                                           | GlobalExceptionHandler |

---

## Trazabilidad

| Artefacto   | Relación                                          |
| ----------- | ------------------------------------------------- |
| DD-UC-003   | Documento de diseño que guía esta implementación  |
| FSD-UC-004  | Caso de uso funcional fuente                      |
| T-011       | Task: catálogo con filtros                        |
| T-011A      | Task: detalle publicación + perfil tienda         |
| AGENTS.md   | Regla cobertura ≥ 90%                             |

---

## Registro de Cambios

| Versión | Fecha      | Cambio             |
| ------- | ---------- | ------------------ |
| 1.0     | 22/06/2026 | Creación inicial   |
