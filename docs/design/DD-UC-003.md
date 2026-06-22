# DD-UC-003 - Catálogo Marketplace

## 1. Información General

| Campo       | Valor                               |
| ----------- | ----------------------------------- |
| ID          | DD-UC-003                           |
| Caso de Uso | FSD-UC-004                          |
| Nombre      | Catálogo Marketplace                |
| Sistema     | UMSS Market                         |
| Versión     | 1.0                                 |
| Fecha       | 22/06/2026                          |
| Estado      | Diseño                              |
| Autores     | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |

---

## 2. Objetivo

Exponer el catálogo público de publicaciones del marketplace UMSS Market con capacidades de búsqueda y filtrado por texto libre, tipo de publicación, rango de precio y tienda. Adicionalmente, proveer un endpoint de detalle de publicación y un endpoint de perfil público de tienda con sus publicaciones activas.

---

## 3. Arquitectura

Se implementa utilizando Arquitectura Hexagonal (Ports & Adapters) con las siguientes capas:

```
presentation  →  PublicationController, StoreController
application   →  SearchCatalogUseCase, GetPublicationDetailUseCase, GetStorePublicProfileUseCase
domain        →  Publication, Store, CatalogFilter (value object)
infrastructure→  JpaPublicationRepositoryAdapter, JpaStoreRepositoryAdapter
persistence   →  JpaPublicationRepository (Spring Data JPA + JPQL)
```

### Componentes

| Componente                      | Capa           | Responsabilidad                                               |
| ------------------------------- | -------------- | ------------------------------------------------------------- |
| `PublicationController`         | Infrastructure | Recibe parámetros de filtro y delega a SearchCatalogUseCase   |
| `StoreController`               | Infrastructure | Expone el perfil público de una tienda                        |
| `SearchCatalogUseCase`          | Application    | Aplica filtros y devuelve el catálogo paginado                |
| `GetPublicationDetailUseCase`   | Application    | Devuelve detalle enriquecido de una publicación               |
| `GetStorePublicProfileUseCase`  | Application    | Devuelve perfil público de tienda + sus publicaciones activas |
| `CatalogFilter`                 | Domain         | Value object con los parámetros de búsqueda                   |
| `PublicationRepositoryPort`     | Domain         | Puerto de salida — agrega `findByFilters`                     |
| `StoreRepositoryPort`           | Domain         | Puerto de salida — ya expone `findById`                       |
| `JpaPublicationRepositoryAdapter` | Infrastructure | Adapta JPQL a dominio                                       |
| `JpaPublicationRepository`      | Infrastructure | Consulta filtrada via JPQL `@Query`                           |

---

## 4. Flujo General

### 4.1 Buscar en Catálogo (T-011)

1. El comprador (o usuario anónimo) realiza `GET /api/publicaciones` con parámetros de filtro opcionales.
2. El controller construye un `CatalogFilter` con los query params recibidos.
3. `SearchCatalogUseCase` invoca `PublicationRepositoryPort.findByFilters(filter)`.
4. El repositorio ejecuta una consulta JPQL filtrando por: tipo, texto en nombre/descripción, rango de precio, storeId (todos opcionales).
5. Solo se retornan publicaciones con `activa = true`.
6. Se retorna la lista en formato `PublicationSummaryResponse`.

### 4.2 Ver Detalle de Publicación (T-011A)

1. El comprador realiza `GET /api/publicaciones/{id}`.
2. `GetPublicationDetailUseCase` busca la publicación por ID.
3. Si no existe → `PublicationNotFoundException` → HTTP 404.
4. Si existe pero `activa = false` → `PublicationNotFoundException` → HTTP 404.
5. Se enriquece el resultado con el nombre de la tienda.
6. Se retorna `PublicationDetailResponse`.

### 4.3 Ver Perfil Público de Tienda (T-011A)

1. El comprador realiza `GET /api/tiendas/{id}`.
2. `GetStorePublicProfileUseCase` busca la tienda por ID.
3. Si no existe → `StoreNotFoundException` → HTTP 404.
4. Se obtienen las publicaciones activas de la tienda (`findByFilters` con storeId).
5. Se retorna `StorePublicProfileResponse` (datos de tienda + lista de publicaciones activas).

---

## 5. Entidades de Dominio

### Publication (existente — sin cambios de modelo)

| Atributo        | Tipo           | Descripción                          |
| --------------- | -------------- | ------------------------------------ |
| id              | UUID           | Identificador único                  |
| storeId         | UUID           | FK tienda propietaria                |
| nombre          | String         | Nombre de la publicación             |
| descripcion     | String         | Descripción detallada                |
| precio          | BigDecimal     | Precio de venta (> 0)                |
| tipo            | PublicationType| PRODUCTO / SERVICIO                  |
| stock           | Integer        | Stock disponible (solo PRODUCTO)     |
| modalidadCobro  | PaymentMode    | Modalidad (solo SERVICIO)            |
| activa          | Boolean        | Publicación visible en catálogo      |
| createdAt       | LocalDateTime  | Fecha de creación                    |
| updatedAt       | LocalDateTime  | Fecha de última actualización        |

### Store (existente — sin cambios de modelo)

| Atributo          | Tipo        | Descripción                     |
| ----------------- | ----------- | ------------------------------- |
| id                | UUID        | Identificador único             |
| userId            | UUID        | FK propietario                  |
| nombre            | String      | Nombre de la tienda             |
| descripcion       | String      | Descripción de la tienda        |
| categoria         | String      | Categoría del negocio           |
| telefonoContacto  | String      | Teléfono de contacto            |
| emailContacto     | String      | Email de contacto               |
| status            | StoreStatus | ACTIVE / INACTIVE               |
| createdAt         | LocalDateTime | Fecha de creación             |
| updatedAt         | LocalDateTime | Última actualización          |

### CatalogFilter (nuevo — value object)

| Campo       | Tipo           | Requerido | Descripción                          |
| ----------- | -------------- | --------- | ------------------------------------ |
| textoBusqueda | String       | No        | Busca en nombre y descripción (LIKE) |
| tipo        | PublicationType| No        | Filtra por PRODUCTO o SERVICIO       |
| precioMin   | BigDecimal     | No        | Precio mínimo (inclusive)            |
| precioMax   | BigDecimal     | No        | Precio máximo (inclusive)            |
| storeId     | UUID           | No        | Filtra publicaciones de una tienda   |

---

## 6. Reglas de Negocio

| ID    | Regla                                                                              |
| ----- | ---------------------------------------------------------------------------------- |
| RN-001| Solo se retornan publicaciones con `activa = true` en el catálogo público          |
| RN-002| Si `precioMin > precioMax`, se devuelve error de validación HTTP 400               |
| RN-003| El `textoBusqueda` se normaliza (trim, case-insensitive)                           |
| RN-004| El detalle de una publicación inactiva devuelve HTTP 404                           |
| RN-005| El perfil de una tienda INACTIVE devuelve el perfil pero sin publicaciones         |
| RN-006| Sin filtros, se retornan todas las publicaciones activas (catálogo completo)       |

---

## 7. API REST

### 7.1 Buscar publicaciones en el catálogo

```http
GET /api/publicaciones?texto=brownie&tipo=PRODUCTO&precioMin=5.00&precioMax=30.00&storeId={uuid}
```

#### Query Parameters (todos opcionales)

| Parámetro  | Tipo           | Descripción                           |
| ---------- | -------------- | ------------------------------------- |
| texto      | String         | Búsqueda libre en nombre/descripción  |
| tipo       | PublicationType| PRODUCTO o SERVICIO                   |
| precioMin  | BigDecimal     | Precio mínimo                         |
| precioMax  | BigDecimal     | Precio máximo                         |
| storeId    | UUID           | ID de tienda específica               |

#### Response 200

```json
[
  {
    "id": "uuid",
    "nombre": "Brownie Artesanal",
    "descripcion": "Brownie elaborado de forma artesanal",
    "precio": 10.50,
    "tipo": "PRODUCTO",
    "stock": 15,
    "modalidadCobro": null,
    "storeId": "uuid-tienda",
    "nombreTienda": "El Rincón Dulce",
    "activa": true
  }
]
```

---

### 7.2 Ver detalle de publicación

```http
GET /api/publicaciones/{id}
```

#### Response 200

```json
{
  "id": "uuid",
  "nombre": "Brownie Artesanal",
  "descripcion": "Descripción completa",
  "precio": 10.50,
  "tipo": "PRODUCTO",
  "stock": 15,
  "modalidadCobro": null,
  "storeId": "uuid-tienda",
  "nombreTienda": "El Rincón Dulce",
  "activa": true,
  "createdAt": "2026-06-22T10:00:00"
}
```

#### Response 404

```json
{
  "error": "Publicación no encontrada"
}
```

---

### 7.3 Ver perfil público de tienda

```http
GET /api/tiendas/{id}
```

#### Response 200

```json
{
  "id": "uuid",
  "nombre": "El Rincón Dulce",
  "descripcion": "Repostería artesanal universitaria",
  "categoria": "Alimentación",
  "telefonoContacto": "+591 70000000",
  "emailContacto": "contacto@example.com",
  "status": "ACTIVE",
  "publicaciones": [
    {
      "id": "uuid-pub",
      "nombre": "Brownie Artesanal",
      "precio": 10.50,
      "tipo": "PRODUCTO",
      "stock": 15,
      "activa": true
    }
  ]
}
```

#### Response 404

```json
{
  "error": "Tienda no encontrada"
}
```

---

## 8. Modelo Relacional (sin cambios de esquema)

```text
TIENDA (1) -------- (N) PUBLICACION
```

Las consultas de catálogo son solo de lectura sobre las tablas existentes `stores` y `publications`.

---

## 9. Persistencia

### Base de Datos: PostgreSQL

### Consulta JPQL para catálogo filtrado

```sql
SELECT p FROM PublicationEntity p
WHERE p.activa = true
  AND (:tipo IS NULL OR p.tipo = :tipo)
  AND (:storeId IS NULL OR p.storeId = :storeId)
  AND (:precioMin IS NULL OR p.precio >= :precioMin)
  AND (:precioMax IS NULL OR p.precio <= :precioMax)
  AND (:texto IS NULL OR 
       LOWER(p.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) OR 
       LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :texto, '%')))
```

---

## 10. Consideraciones Técnicas

- Arquitectura Hexagonal — ningún componente de dominio depende de Spring o JPA.
- Java 21, Spring Boot 3.5.
- Todos los filtros son opcionales; sin parámetros devuelve catálogo completo.
- La búsqueda de texto es case-insensitive vía `LOWER(...)`.
- Las excepciones `PublicationNotFoundException` y `StoreNotFoundException` son del dominio.
- El `GlobalExceptionHandler` mapea las excepciones de dominio a HTTP 404.
- Cobertura de test mínima: **90%** de líneas sobre todas las capas del feature.

---

## 11. Trazabilidad

| Artefacto      | Relación                                              |
| -------------- | ----------------------------------------------------- |
| BRD v4         | Marketplace universitario con catálogo público        |
| PRD v3         | Catálogo de productos y tiendas                       |
| FSD-UC-004     | Catálogo Marketplace (este feature)                   |
| T-011          | `GET /publicaciones` con filtros                      |
| T-011A         | Detalle publicación + perfil público de tienda        |
| PR-IMPL-003    | Prompt de implementación del catálogo                 |
| AGENTS.md      | Regla: cobertura de test ≥ 90%                        |

---

## 12. Registro de Cambios

| Versión | Fecha      | Cambio             |
| ------- | ---------- | ------------------ |
| 1.0     | 22/06/2026 | Diseño inicial     |
