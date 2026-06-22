---

id: ADR-0003
título: Arquitectura Hexagonal (Ports & Adapters)
estado: Aceptada
fecha: 21/06/2026
autores:

* Rodriguez Gonzales Abad Melani
* Vargas Sandoval Christian Bernardo
  supercede: —
  relacionados:
* ADR-0001-event-driven-architecture.md
* ADR-0002-saga-pattern.md

---

# ADR-0003 — Arquitectura Hexagonal (Ports & Adapters)

## Contexto

UMSS Market es un marketplace universitario que permite a estudiantes emprendedores publicar productos y servicios dentro de una plataforma digital.

El backend será implementado utilizando Java 21, Spring Boot 3 y PostgreSQL, siguiendo una arquitectura que garantice:

* Separación de responsabilidades.
* Independencia del dominio respecto a frameworks.
* Facilidad de pruebas unitarias.
* Mantenibilidad.
* Escalabilidad futura.
* Evolución controlada del sistema.

Durante el análisis arquitectónico se identificaron los siguientes riesgos de una arquitectura tradicional basada únicamente en capas:

1. Acoplamiento entre lógica de negocio e infraestructura.
2. Dependencia excesiva de Spring Framework dentro del dominio.
3. Dificultad para realizar pruebas unitarias aisladas.
4. Complejidad para sustituir mecanismos de persistencia.
5. Riesgo de dispersión de reglas de negocio.

El proyecto requiere una arquitectura que mantenga el dominio como núcleo del sistema y permita que los cambios tecnológicos tengan impacto mínimo sobre la lógica de negocio.

---

## Decisión

Se adopta la Arquitectura Hexagonal (Ports & Adapters) como patrón estructural principal para el backend de UMSS Market.

La Arquitectura Hexagonal será complementada con principios de Clean Architecture para mantener una clara separación entre:

* Dominio
* Casos de uso
* Adaptadores
* Infraestructura

---

## Regla de Dependencia

Las dependencias deben apuntar siempre hacia el dominio.

```text
Infrastructure → Application → Domain
```

La capa Domain:

* No conoce Spring Boot.
* No conoce JPA.
* No conoce PostgreSQL.
* No conoce Controladores REST.
* No conoce DTOs.

El dominio únicamente contiene reglas de negocio.

---

## Estructura Canónica

```text
src/main/java

bo.umss.market.umss_market_api

├── application
│   ├── dto
│   ├── services
│   └── usecases
│
├── domain
│   ├── enums
│   ├── exceptions
│   ├── model
│   └── ports
│
├── infrastructure
│   ├── adapters
│   ├── config
│   ├── controllers
│   └── persistence
│       ├── entities
│       ├── mappers
│       └── repositories
│
└── shared
```

---

## Responsabilidades por Capa

### Domain

Contiene:

* Entidades de negocio.
* Enumeraciones.
* Excepciones de dominio.
* Interfaces de repositorio (Ports).

Ejemplos:

```text
User
Store
Publication

UserRepositoryPort
StoreRepositoryPort
PublicationRepositoryPort
```

No puede contener:

* Anotaciones Spring.
* Anotaciones JPA.
* Código SQL.
* Dependencias externas.

---

### Application

Contiene:

* Casos de uso.
* Servicios de aplicación.
* DTOs.

Ejemplos:

```text
RegisterEntrepreneurUseCase
LoginUseCase
CreatePublicationUseCase
UpdatePublicationUseCase
```

Responsabilidad:

Orquestar reglas de negocio utilizando los puertos definidos por el dominio.

---

### Infrastructure

Contiene implementaciones concretas.

Ejemplos:

```text
AuthController

UserEntity
StoreEntity
PublicationEntity

JpaUserRepository
JpaStoreRepository
JpaPublicationRepository
```

Responsabilidad:

Conectar el sistema con tecnologías externas.

---

## Puertos y Adaptadores

### Puertos de Salida

```text
UserRepositoryPort
StoreRepositoryPort
PublicationRepositoryPort
PointDeliveryRepositoryPort
```

### Adaptadores de Persistencia

```text
JpaUserRepositoryAdapter
JpaStoreRepositoryAdapter
JpaPublicationRepositoryAdapter
JpaPointDeliveryRepositoryAdapter
```

### Adaptadores de Entrada

```text
AuthController
StoreController
PublicationController
```

---

## Consecuencias

### Positivas

* Dominio desacoplado de Spring Boot.
* Facilidad para pruebas unitarias.
* Reemplazo sencillo de infraestructura.
* Mayor mantenibilidad.
* Organización clara del proyecto.
* Evolución controlada de la lógica de negocio.

### Negativas

* Mayor cantidad de clases.
* Curva de aprendizaje inicial.
* Más código de configuración.

### Neutrales

* La API REST permanece independiente de la arquitectura interna.
* PostgreSQL puede ser reemplazado sin modificar el dominio.

---

## Alternativas Consideradas

| Alternativa                       | Razón de rechazo                                         |
| --------------------------------- | -------------------------------------------------------- |
| Arquitectura en Capas Tradicional | Acopla negocio e infraestructura                         |
| Active Record                     | Mezcla persistencia y dominio                            |
| Transaction Script                | No modela adecuadamente el dominio                       |
| Clean Architecture estricta       | Mayor complejidad para el alcance académico del proyecto |

---

## Métricas de Cumplimiento

### Restricciones

La capa Domain no puede importar:

```java
org.springframework.*
jakarta.persistence.*
org.hibernate.*
```

### Calidad

* Cobertura mínima de pruebas unitarias: ≥ 80%.
* Ningún Controller contiene lógica de negocio.
* Todos los repositorios del dominio deben declararse como Ports.
* Toda persistencia debe implementarse mediante adaptadores.

---

## Impacto en Casos de Uso

Esta decisión impacta directamente en:

* UC-001 Compra mediante QR.
* UC-002 Publicación y Gestión de Productos y Servicios.
* UC-003 Registro y Validación de Emprendedor.

---

## Trazabilidad

| Artefacto | Relación                                       |
| --------- | ---------------------------------------------- |
| BRD v4    | Marketplace universitario                      |
| MRD Final | Necesidades de usuarios                        |
| PRD v3    | Requerimientos funcionales                     |
| FSD v3    | Especificaciones funcionales                   |
| DD-UC-001 | Registro y Validación de Emprendedor           |
| DD-UC-002 | Publicación y Gestión de Productos y Servicios |
| ADR-0001  | Event Driven Architecture                      |
| ADR-0002  | Saga Pattern                                   |

---

## Diagrama de Referencia

Ver:

```text
diagrams/hexagonal-architecture.mmd
```

---

## Registro de Cambios

| Versión | Fecha      | Cambio                                                                                 |
| ------- | ---------- | -------------------------------------------------------------------------------------- |
| 1.0     | 24/05/2026 | Definición inicial de Arquitectura Hexagonal.                                          |
| 2.0     | 21/06/2026 | Actualización para Spring Boot 3, Java 21, PostgreSQL y estructura final del proyecto. |
