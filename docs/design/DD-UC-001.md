# DD-UC-001 - Registro y Validación de Emprendedor

## 1. Información General

| Campo       | Valor                                |
| ----------- | ------------------------------------ |
| ID          | DD-UC-001                            |
| Caso de Uso | UC-003                               |
| Nombre      | Registro y Validación de Emprendedor |
| Sistema     | UMSS Market                          |
| Versión     | 1.0                                  |
| Estado      | Diseño                               |

---

## 2. Objetivo

Permitir el registro de emprendedores universitarios mediante la validación de RU institucional y correo universitario, garantizando que únicamente estudiantes habilitados puedan crear tiendas dentro del marketplace.

---

## 3. Arquitectura

Se implementará utilizando Arquitectura Hexagonal.

### Componentes

* REST Controller
* Use Case
* Domain Model
* Repository Port
* Persistence Adapter
* PostgreSQL

---

## 4. Flujo General

1. Usuario envía datos de registro.
2. Sistema valida formato de RU.
3. Sistema valida correo institucional.
4. Sistema verifica duplicidad.
5. Sistema crea usuario.
6. Sistema crea tienda inicial.
7. Sistema retorna respuesta exitosa.

---

## 5. Entidades de Dominio

### Usuario

Atributos:

* id
* ru
* nombre
* apellidoPaterno
* apellidoMaterno
* email
* celular
* facultad
* passwordHash
* rol
* estado
* createdAt
* updatedAt

### Tienda

Atributos:

* id
* usuarioId
* nombre
* descripcion
* telefonoContacto
* emailContacto
* estado
* createdAt
* updatedAt

---

## 6. Reglas de Negocio

RN-001: El RU debe ser único.

RN-002: El correo institucional debe ser único.

RN-003: El correo debe pertenecer al dominio UMSS.

RN-004: No se permiten usuarios duplicados.

RN-005:
Cada emprendedor puede poseer únicamente una tienda activa.

---

## 7. API REST

### Registro de Emprendedor

POST /api/entrepreneurs/register

Request:

{
"ru": "202012345",
"nombre": "Juan",
"apellidoPaterno": "Perez",
"apellidoMaterno": "Lopez",
"email": "[juan@umss.edu.bo](mailto:juan@umss.edu.bo)",
"celular": "70707070",
"facultad": "FCYT",
"password": "******"
}

Response:

{
"success": true,
"message": "Emprendedor registrado correctamente"
}

---

## 8. Modelo Relacional

USUARIO (1) ------ (1) TIENDA

---

## 9. Persistencia

Base de datos PostgreSQL.

Schema: public

Tablas:

* usuarios
* tiendas

---

## 10. Consideraciones Técnicas

* Arquitectura Hexagonal.
* Spring Boot 3.
* PostgreSQL 18.
* JPA / Hibernate.
* Validaciones Bean Validation.
