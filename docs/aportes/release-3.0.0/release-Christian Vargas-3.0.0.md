# Aportes Individuales — Release 3.0.0 — UMSS Market

> Documento de trazabilidad de contribuciones individuales para el release evaluable `release/3.0.0`.

---

# 0. Metadatos


| Campo                   | Valor                              |
| ----------------------- | ---------------------------------- |
| Producto                | UMSS Market                        |
| Integrante              | Vargas Sandoval Christian Bernardo |
| Release evaluable       | release/3.0.0                      |
| Fecha de cierre         | 22/06/2026                         |
| Branch del release      | release/3.0.0                      |
| Commit de cierre (HEAD) | 07204e6                            |

---

# 1. Tabla de tareas realizadas


| #  | Tarea concreta                                                                                                                   | Categoría         | Referencia                                                                    | Fecha |
| -- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------- | ----- |
| 1  | Elaboración del Diseño Detallado DD-UC-003 Catálogo Marketplace                                                               | Diseño            | docs/design/DD-UC-003.md                                                      | 22/06 |
| 2  | Elaboración del Prompt Implementation PR-IMPL-003                                                                               | Prompt Engineering | prompts/PR-IMPL-003.md                                                        | 22/06 |
| 3  | Implementación del value object CatalogFilter en el dominio                                                                     | Backend            | domain/model/CatalogFilter.java                                               | 22/06 |
| 4  | Extensión del puerto PublicationRepositoryPort con findByFilters(CatalogFilter)                                                 | Arquitectura       | domain/ports/PublicationRepositoryPort.java                                   | 22/06 |
| 5  | Implementación del caso de uso SearchCatalogUseCase                                                                             | Backend            | application/usecases/SearchCatalogUseCase.java                                | 22/06 |
| 6  | Implementación del caso de uso GetPublicationDetailUseCase                                                                      | Backend            | application/usecases/GetPublicationDetailUseCase.java                         | 22/06 |
| 7  | Implementación del caso de uso GetStorePublicProfileUseCase                                                                     | Backend            | application/usecases/GetStorePublicProfileUseCase.java                        | 22/06 |
| 8  | Implementación del controlador StoreController                                                                                  | Backend            | infrastructure/controllers/StoreController.java                               | 22/06 |
| 9  | Implementación de DTOs: CatalogFilterRequest, PublicationDetailResponse, StorePublicProfileResponse, PublicationInStoreResponse | Backend            | application/dto/                                                              | 22/06 |
| 10 | Implementación de SearchCatalogUseCaseTest                                                                                      | Testing            | src/test/.../application/usecases/SearchCatalogUseCaseTest.java               | 22/06 |
| 11 | Implementación de GetPublicationDetailUseCaseTest                                                                               | Testing            | src/test/.../application/usecases/GetPublicationDetailUseCaseTest.java        | 22/06 |
| 12 | Implementación de GetStorePublicProfileUseCaseTest                                                                              | Testing            | src/test/.../application/usecases/GetStorePublicProfileUseCaseTest.java       | 22/06 |
| 13 | Implementación de JpaUserRepositoryAdapterTest                                                                                  | Testing            | src/test/.../infrastructure/adapters/JpaUserRepositoryAdapterTest.java        | 22/06 |
| 14 | Implementación de JpaStoreRepositoryAdapterTest                                                                                 | Testing            | src/test/.../infrastructure/adapters/JpaStoreRepositoryAdapterTest.java       | 22/06 |
| 15 | Implementación de JpaPublicationRepositoryAdapterTest                                                                           | Testing            | src/test/.../infrastructure/adapters/JpaPublicationRepositoryAdapterTest.java | 22/06 |
| 16 | Implementación de GlobalExceptionHandlerTest                                                                                    | Testing            | src/test/.../shared/GlobalExceptionHandlerTest.java                           | 22/06 |
| 17 | Generación y validación del reporte JaCoCo integrado (Features 1-2-3)                                                          | Calidad            | target/site/jacoco/index.html                                                 | 22/06 |

---

# 2. Resumen de contribución


| Integrante                         | Total tareas |
| ---------------------------------- | ------------ |
| Vargas Sandoval Christian Bernardo | 17           |

---

# 3. Artefactos entregados

## Diseño

* DD-UC-003 — Catálogo Marketplace

## Prompt Engineering

* PR-IMPL-003

## Implementación Backend (Feature 3 — Catálogo Marketplace)

**Dominio:**

* CatalogFilter.java (value object)
* PublicationRepositoryPort.java (extensión: findByFilters)
* StoreRepositoryPort.java (extensión: findById)

**Application (Use Cases):**

* SearchCatalogUseCase.java
* GetPublicationDetailUseCase.java
* GetStorePublicProfileUseCase.java

**DTOs:**

* CatalogFilterRequest.java
* PublicationDetailResponse.java
* StorePublicProfileResponse.java
* PublicationInStoreResponse.java

**Infrastructure:**

* StoreController.java (GET /api/tiendas/{id})
* JpaPublicationRepositoryAdapter.java (extensión con JPQL dinámica)

## Testing

* SearchCatalogUseCaseTest.java
* GetPublicationDetailUseCaseTest.java
* GetStorePublicProfileUseCaseTest.java
* JpaUserRepositoryAdapterTest.java
* JpaStoreRepositoryAdapterTest.java
* JpaPublicationRepositoryAdapterTest.java
* GlobalExceptionHandlerTest.java

## Calidad

* Reporte JaCoCo final integrado (Features 1 + 2 + 3)

---

# 4. Evidencia de calidad


| Métrica                      | Resultado                |
| ----------------------------- | ------------------------ |
| Cobertura de instrucciones    | **93 %** (1.064 / 1.142) |
| Cobertura de ramas (Branches) | **88 %** (32 / 36)       |
| Clases cubiertas              | 29 de 31                 |
| Tests ejecutados (acumulado)  | Todos los features       |
| Fallos                        | 0                        |
| Build Maven                   | EXITOSO                  |
| Estado final                  | APROBADO ✔              |

> Umbrales mínimos del proyecto: 90 % líneas / 80 % ramas — **ambos superados**.

---

# 5. Trazabilidad


| Artefacto                    | Relación                                                         |
| ---------------------------- | ----------------------------------------------------------------- |
| DD-UC-003                    | Diseño detallado → FSD-UC-004 Catálogo Marketplace             |
| PR-IMPL-003                  | Prompt de implementación → código generado Feature 3           |
| SearchCatalogUseCase         | Implementa reglas de negocio BR-005 (búsqueda catálogo)         |
| GetPublicationDetailUseCase  | Implementa reglas de negocio BR-006 (detalle publicación)        |
| GetStorePublicProfileUseCase | Implementa reglas de negocio BR-007 (perfil público tienda)      |
| StoreController              | Adapter/in/web → expone GET /api/tiendas/{id}                    |
| Tests JaCoCo                 | Validación de umbral mínimo 90 % líneas declarado en AGENTS.md |


6. Checklist de entrega


| Ítem                            | Estado |
| -------------------------------- | ------ |
| DD-UC-003 completado             | ✅     |
| PR-IMPL-003 completado           | ✅     |
| PROMPT_MAPPINGS actualizado      | ✅     |
| Arquitectura Hexagonal aplicada  | ✅     |
| Casos de uso implementados       | ✅     |
| Controladores REST implementados | ✅     |
| Adaptadores implementados        | ✅     |
| Tests unitarios implementados    | ✅     |
| Reporte JaCoCo generado          | ✅     |
| Cobertura mínima 90% alcanzada  | ✅     |
| Build Maven exitoso              | ✅     |

---

# 7. Registro de cambios


| Versión | Fecha      | Cambio                                                        |
| -------- | ---------- | ------------------------------------------------------------- |
| v3.0.0   | 22/06/2026 | Implementación de DD-UC-003, PR-IMPL-003, pruebas unitarias |
