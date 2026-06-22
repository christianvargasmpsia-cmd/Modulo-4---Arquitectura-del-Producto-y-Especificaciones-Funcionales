# PR-IMPL-001

## Nombre

Implementación del Caso de Uso Registro y Validación de Emprendedor

---

## Relación

* BRD v4
* PRD v3
* FSD-UC-003
* DD-UC-001

---

## Objetivo

Implementar el caso de uso de Registro y Validación de Emprendedor para UMSS Market utilizando Spring Boot 3, Java 21 y Arquitectura Hexagonal, garantizando la validación de identidad institucional, la creación automática de una tienda asociada y la persistencia de información en PostgreSQL.

---

## Prompt utilizado

Actúa como Arquitecto de Software Senior especializado en Spring Boot 3, Java 21 y Arquitectura Hexagonal.

Implementa el caso de uso Registro y Validación de Emprendedor.

Requisitos:

* Validar RU único.
* Validar correo institucional @umss.edu.bo.
* Validar formato RU (9 dígitos).
* Cifrar contraseña utilizando BCrypt.
* Crear automáticamente una tienda asociada.
* Persistir información en PostgreSQL.
* Utilizar puertos y adaptadores.
* Generar DTOs Request y Response.
* Aplicar buenas prácticas SOLID.
* Implementar manejo global de excepciones.
* Mantener trazabilidad con DD-UC-001.

---

## Arquitectura Aplicada

Arquitectura Hexagonal (Ports & Adapters)

Capas implementadas:

* Controller Layer
* Application Layer (Use Cases)
* Domain Layer
* Repository Ports
* Persistence Adapters
* PostgreSQL

---

## Artefactos Generados

### DTOs

* RegisterEntrepreneurRequest.java
* RegisterEntrepreneurResponse.java
* ErrorResponse.java

### Domain

* User.java
* Store.java
* Role.java
* UserStatus.java
* StoreStatus.java

### Exceptions

* UserAlreadyExistsException.java
* EmailAlreadyExistsException.java
* StoreAlreadyExistsException.java

### Use Cases

* RegisterEntrepreneurUseCase.java

### Controllers

* AuthController.java

### Ports

* UserRepositoryPort.java
* StoreRepositoryPort.java

### Adapters

* JpaUserRepositoryAdapter.java
* JpaStoreRepositoryAdapter.java

### Persistence

* UserEntity.java
* StoreEntity.java
* JpaUserRepository.java
* JpaStoreRepository.java
* UserMapper.java
* StoreMapper.java

### Shared

* GlobalExceptionHandler.java

### Security

* SecurityConfig.java

---

## Reglas de Negocio Implementadas

### RN-001

El RU debe ser único dentro del sistema.

### RN-002

El correo institucional debe ser único.

### RN-003

El correo debe pertenecer al dominio:

```text
@umss.edu.bo
```

### RN-004

No se permiten usuarios duplicados.

### RN-005

Cada emprendedor puede tener únicamente una tienda.

### RN-006

La contraseña se almacena utilizando BCrypt.

### RN-007

La tienda se crea automáticamente durante el registro.

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

### Endpoint

```http
POST /api/auth/register
```

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Emprendedor registrado correctamente",
  "usuarioId": "86c9d8df-5651-4830-ba3b-8cfa6c8fccfe",
  "tiendaId": "6edbaf5c-d8c2-45ae-b86f-b2eaba829fbd"
}
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

* RegisterEntrepreneurUseCaseTest
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

El sistema registra correctamente al emprendedor universitario, valida unicidad de RU y correo institucional, cifra la contraseña mediante BCrypt y crea automáticamente una tienda asociada.

---

## Release

release/2.0.0

---

## Autor

Rodriguez Gonzales Abad Melani

---

## Fecha

22/06/2026
