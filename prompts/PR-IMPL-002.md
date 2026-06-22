# PR-IMPL-002

## Nombre

Implementación del Caso de Uso Publicación y Gestión de Productos y Servicios

---

## Relación

* BRD v4
* PRD v3
* FSD-UC-002
* DD-UC-002

---

## Objetivo

Implementar el caso de uso de Publicación y Gestión de Productos y Servicios para UMSS Market utilizando Spring Boot 3, Java 21 y Arquitectura Hexagonal, permitiendo a los emprendedores registrar productos y servicios asociados a sus tiendas dentro del marketplace universitario.

---

## Prompt utilizado

Actúa como Arquitecto Backend Senior especializado en Spring Boot 3, Java 21 y Arquitectura Hexagonal.

Implementa el caso de uso Publicación y Gestión de Productos y Servicios.

Requisitos:

* Soportar PRODUCTO y SERVICIO.
* Validar tienda activa.
* Validar precio mayor a cero.
* Validar stock para productos.
* Validar modalidad de cobro para servicios.
* Persistir información en PostgreSQL.
* Aplicar Arquitectura Hexagonal.
* Utilizar DTO Pattern.
* Aplicar principios SOLID.
* Implementar puertos y adaptadores.
* Mantener trazabilidad con DD-UC-002.

---

## Arquitectura Aplicada

Arquitectura Hexagonal (Ports & Adapters)

Capas implementadas:

* REST Controller
* Application Layer (Use Cases)
* Domain Layer
* Repository Ports
* Persistence Adapters
* PostgreSQL

---

## Artefactos Generados

### DTOs

* CreatePublicationRequest.java
* CreatePublicationResponse.java

### Domain

* Publication.java
* PublicationType.java
* PaymentMode.java

### Use Cases

* CreatePublicationUseCase.java

### Controllers

* PublicationController.java

### Ports

* PublicationRepositoryPort.java

### Adapters

* JpaPublicationRepositoryAdapter.java

### Persistence

* PublicationEntity.java
* JpaPublicationRepository.java
* PublicationMapper.java

---

## Reglas de Negocio Implementadas

### RN-001

Toda publicación debe pertenecer a una tienda activa.

### RN-002

El precio debe ser mayor a cero.

### RN-003

Las publicaciones tipo PRODUCTO deben poseer stock válido.

### RN-004

Las publicaciones tipo SERVICIO deben definir modalidad de cobro.

### RN-005

Solo las publicaciones activas pueden mostrarse dentro del marketplace.

### RN-006

Cada publicación queda asociada a una tienda existente.

---

## Base de Datos

Motor:

```text
PostgreSQL 18
```

Base de datos validada:

```sql
SELECT current_database();

umss_market
```

---

## Evidencia de Implementación

### Endpoint Crear Publicación

```http
POST /api/publications
```

### Producto Registrado

```json
{
  "success": true,
  "message": "Publicación creada correctamente",
  "publicationId": "616df16c-e564-42f6-9b82-e789f6755f72"
}
```

### Servicio Registrado

```json
{
  "success": true,
  "message": "Publicación creada correctamente",
  "publicationId": "d0d801e7-23ba-44d5-be4c-e9c45f2e7a9c"
}
```

### Consulta de Publicaciones

```http
GET /api/publications
```

### Resultado

```json
[
  {
    "nombre": "Empanada de Queso",
    "tipo": "PRODUCTO"
  },
  {
    "nombre": "Diseño de Logos",
    "tipo": "SERVICIO"
  }
]
```

---

## Evidencia de Commits

```text
9561532 feat: complete DD-UC-001 and DD-UC-002

a6cbb7a feat: add VSCode settings for Java build configuration
```

---

## Validación y Pruebas

### Tests Implementados

* CreatePublicationUseCaseTest
* UmssMarketApiApplicationTests

### Ejecución

```bash
./mvnw test
```

### Resultado

```text
Tests run: 7
Failures: 0
Errors: 0
Skipped: 0

BUILD SUCCESS
```

---

## Resultado Esperado

El sistema permite crear publicaciones de tipo PRODUCTO y SERVICIO, valida las reglas de negocio establecidas, almacena la información en PostgreSQL y permite consultar las publicaciones registradas dentro del marketplace.

---

## Release

release/2.0.0

---

## Autor

Rodriguez Gonzales Abad Melani

---

## Fecha

22/06/2026
