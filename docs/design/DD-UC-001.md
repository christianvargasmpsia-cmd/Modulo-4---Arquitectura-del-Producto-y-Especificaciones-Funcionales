# DD-UC-001 - Registro y Validación de Emprendedor

## 1. Información General

| Campo       | Valor                                |
| ----------- | ------------------------------------ |
| ID          | DD-UC-001                            |
| Caso de Uso | UC-003                               |
| Nombre      | Registro y Validación de Emprendedor |
| Sistema     | UMSS Market                          |
| Versión     | 2.0                                  |
| Estado      | Diseño                               |

---

## 2. Objetivo

Permitir el registro de emprendedores universitarios mediante el registro de RU, correo institucional y datos personales, garantizando la unicidad de la información y la creación de una tienda asociada dentro del marketplace UMSS Market.

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

1. El usuario envía los datos de registro.
2. El sistema valida el formato del RU.
3. El sistema valida el correo institucional.
4. El sistema verifica que RU y correo no existan previamente.
5. El sistema cifra la contraseña.
6. El sistema crea el usuario con rol EMPRENDEDOR.
7. El sistema crea una tienda asociada.
8. El sistema retorna respuesta exitosa.

---

## 5. Entidades de Dominio

### Usuario

**Atributos**

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
* ultimoLogin
* createdAt
* updatedAt

### Tienda

**Atributos**

* id
* usuarioId
* nombre
* descripcion
* categoria
* telefonoContacto
* emailContacto
* estado
* createdAt
* updatedAt

---

## 6. Reglas de Negocio

### RN-001

El RU debe ser único dentro del sistema.

### RN-002

El correo institucional debe ser único dentro del sistema.

### RN-003

El correo debe pertenecer al dominio institucional permitido por la UMSS.

### RN-004

No se permiten usuarios duplicados.

### RN-005

Cada emprendedor puede poseer únicamente una tienda registrada dentro del marketplace.

### RN-006

La contraseña debe almacenarse cifrada utilizando BCrypt.

### RN-007

La tienda creada durante el registro queda asociada automáticamente al emprendedor.

---

## 7. API REST

### Registro de Emprendedor

**Endpoint**

```http
POST /api/entrepreneurs/register
```

### Request

```json
{
  "ru": "202012345",
  "nombre": "Juan",
  "apellidoPaterno": "Perez",
  "apellidoMaterno": "Lopez",
  "email": "juan@umss.edu.bo",
  "celular": "70707070",
  "facultad": "FCYT",
  "password": "******",
  "nombreTienda": "Juan Tech"
}
```

### Response Exitosa

```json
{
  "success": true,
  "message": "Emprendedor registrado correctamente",
  "usuarioId": "uuid",
  "tiendaId": "uuid"
}
```

### Errores Posibles

```json
{
  "success": false,
  "message": "El RU ya se encuentra registrado"
}
```

```json
{
  "success": false,
  "message": "El correo ya se encuentra registrado"
}
```

```json
{
  "success": false,
  "message": "Dominio de correo inválido"
}
```

---

## 8. Modelo Relacional

```text
USUARIO (1) -------- (1) TIENDA
```

### Cardinalidad

* Un usuario emprendedor posee una única tienda.
* Una tienda pertenece a un único emprendedor.

---

## 9. Persistencia

### Base de Datos

PostgreSQL

### Schema

```sql
public
```

### Tablas

* usuarios
* tiendas

---

## 10. Consideraciones Técnicas

* Arquitectura Hexagonal.
* Java 21.
* Spring Boot 3.
* PostgreSQL 18.
* Spring Data JPA.
* Hibernate.
* Bean Validation.
* BCrypt Password Encoder.
* JWT Authentication.
* Manejo global de excepciones mediante Controller Advice.

---

## 11. Trazabilidad

| Artefacto  | Relación                             |
| ---------- | ------------------------------------ |
| BRD v4     | Marketplace universitario            |
| PRD v3     | Gestión de emprendedores             |
| FSD-UC-003 | Registro y Validación de Emprendedor |
| T-002      | Gestión de usuarios                  |
| T-003      | Gestión de tiendas                   |

---

## 12. Registro de Cambios

| Versión | Fecha      | Cambio                                                                                                     |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| 1.0     | 20/06/2026 | Creación inicial del diseño detallado.                                                                     |
| 2.0     | 21/06/2026 | Actualización para Spring Boot, mejoras de dominio, trazabilidad y alineación con BRD v4, PRD v3 y FSD v3. |

```
```
