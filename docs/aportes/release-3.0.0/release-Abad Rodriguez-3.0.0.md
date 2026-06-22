# Aportes Individuales — Release 3.0.0 — UMSS Market

> Documento de trazabilidad de contribuciones individuales para el release evaluable `release/3.0.0`.

---

# 0. Metadatos

| Campo                   | Valor                          |
| ----------------------- | ------------------------------ |
| Producto                | UMSS Market                    |
| Integrante              | Rodriguez Gonzales Abad Melani |
| Release evaluable       | release/3.0.0                  |
| Fecha de cierre         | 22/06/2026                     |
| Branch del release      | release/3.0.0                  |
| Commit de cierre (HEAD) | 07204e6                        |

---

# 1. Tabla de tareas realizadas

| #  | Tarea concreta                                                                            | Categoría          | Referencia                             | Fecha |
| -- | ----------------------------------------------------------------------------------------- | ------------------ | -------------------------------------- | ----- |
| 1  | Elaboración del Diseño Detallado DD-UC-001 Registro y Validación de Emprendedor           | Diseño             | DD-UC-001                              | 21/06 |
| 2  | Elaboración del Diseño Detallado DD-UC-002 Publicación y Gestión de Productos y Servicios | Diseño             | DD-UC-002                              | 21/06 |
| 3  | Elaboración del Prompt Implementation PR-IMPL-001                                         | Prompt Engineering | prompts/PR-IMPL-001.md                 | 21/06 |
| 4  | Elaboración del Prompt Implementation PR-IMPL-002                                         | Prompt Engineering | prompts/PR-IMPL-002.md                 | 21/06 |
| 5  | Actualización del documento PROMPT_MAPPINGS                                               | Documentación      | docs/PROMPT_MAPPINGS.md                | 21/06 |
| 6  | Implementación del caso de uso RegisterEntrepreneurUseCase                                | Backend            | RegisterEntrepreneurUseCase.java       | 21/06 |
| 7  | Implementación del caso de uso CreatePublicationUseCase                                   | Backend            | CreatePublicationUseCase.java          | 21/06 |
| 8  | Implementación de puertos y adaptadores bajo Arquitectura Hexagonal                       | Arquitectura       | domain/ports e infrastructure/adapters | 21/06 |
| 9  | Implementación del controlador AuthController                                             | Backend            | AuthController.java                    | 21/06 |
| 10 | Implementación del controlador PublicationController                                      | Backend            | PublicationController.java             | 21/06 |
| 11 | Implementación de UserMapper, StoreMapper y PublicationMapper                             | Backend            | infrastructure/persistence/mappers     | 21/06 |
| 12 | Implementación de RegisterEntrepreneurUseCaseTest                                         | Testing            | src/test                               | 22/06 |
| 13 | Implementación de CreatePublicationUseCaseTest                                            | Testing            | src/test                               | 22/06 |
| 14 | Implementación de UserMapperTest                                                          | Testing            | src/test                               | 22/06 |
| 15 | Implementación de StoreMapperTest                                                         | Testing            | src/test                               | 22/06 |
| 16 | Implementación de PublicationMapperTest                                                   | Testing            | src/test                               | 22/06 |
| 17 | Generación y validación de reporte JaCoCo                                                 | Calidad            | target/site/jacoco                     | 22/06 |

---

# 2. Resumen de contribución

| Integrante                     | Total tareas |
| ------------------------------ | ------------ |
| Rodriguez Gonzales Abad Melani | 17           |

---

# 3. Artefactos entregados

## Diseño

* DD-UC-001 — Registro y Validación de Emprendedor
* DD-UC-002 — Publicación y Gestión de Productos y Servicios

## Prompt Engineering

* PR-IMPL-001
* PR-IMPL-002
* PROMPT_MAPPINGS.md actualizado

## Implementación Backend

* User.java
* Store.java
* Publication.java
* RegisterEntrepreneurUseCase.java
* CreatePublicationUseCase.java
* GetAllPublicationsUseCase.java
* GetPublicationByIdUseCase.java
* AuthController.java
* PublicationController.java
* JpaUserRepositoryAdapter.java
* JpaStoreRepositoryAdapter.java
* JpaPublicationRepositoryAdapter.java
* UserMapper.java
* StoreMapper.java
* PublicationMapper.java
* GlobalExceptionHandler.java

## Testing

* RegisterEntrepreneurUseCaseTest.java
* CreatePublicationUseCaseTest.java
* UserMapperTest.java
* StoreMapperTest.java
* PublicationMapperTest.java
* UmssMarketApiApplicationTests.java

## Calidad

* Maven Test Execution
* JaCoCo Coverage Report
* Validación de Arquitectura Hexagonal
* Verificación de reglas de negocio

---

# 4. Evidencia de calidad

| Métrica                       | Resultado |
| ----------------------------- | --------- |
| Tests ejecutados              | 7         |
| Fallos                        | 0         |
| Errores                       | 0         |
| Build Maven                   | EXITOSO   |
| Cobertura JaCoCo              | 92%       |
| Cobertura de ramas (Branches) | 84%       |
| Clases cubiertas              | 21 de 23  |
| Estado final                  | APROBADO  |

---

# 5. Trazabilidad

| Artefacto       | Relación                                       |
| --------------- | ---------------------------------------------- |
| DD-UC-001       | Registro y Validación de Emprendedor           |
| DD-UC-002       | Publicación y Gestión de Productos y Servicios |
| PR-IMPL-001     | Implementación de registro de emprendedores    |
| PR-IMPL-002     | Implementación de publicaciones                |
| PROMPT_MAPPINGS | Actualizado con PROMPT-006 y PROMPT-007        |
| AGENTS.md       | Cobertura mínima ≥ 90% cumplida                |
| FSD-UC-003      | Registro de emprendedores                      |
| FSD-UC-002      | Gestión de publicaciones                       |

---

# 6. Checklist de entrega

| Ítem                             | Estado |
| -------------------------------- | ------ |
| DD-UC-001 completado             | ✅      |
| DD-UC-002 completado             | ✅      |
| PR-IMPL-001 completado           | ✅      |
| PR-IMPL-002 completado           | ✅      |
| PROMPT_MAPPINGS actualizado      | ✅      |
| Arquitectura Hexagonal aplicada  | ✅      |
| Casos de uso implementados       | ✅      |
| Controladores REST implementados | ✅      |
| Adaptadores implementados        | ✅      |
| Tests unitarios implementados    | ✅      |
| Reporte JaCoCo generado          | ✅      |
| Cobertura mínima 90% alcanzada   | ✅      |
| Build Maven exitoso              | ✅      |

---

# 7. Registro de cambios

| Versión | Fecha      | Cambio                                                                                                                                                                                                   |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v3.0.0 | 22/06/2026 | Implementación de DD-UC-001 y DD-UC-002, PR-IMPL-001, PR-IMPL-002, pruebas unitarias, mappers y cobertura JaCoCo del 92% (commit 07204e6) |
