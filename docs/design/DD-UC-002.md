# DD-UC-002 - Publicación y Gestión de Productos y Servicios

## 1. Información General

| Campo       | Valor                                          |
| ----------- | ---------------------------------------------- |
| ID          | DD-UC-002                                      |
| Caso de Uso | UC-002                                         |
| Nombre      | Publicación y Gestión de Productos y Servicios |
| Sistema     | UMSS Market                                    |
| Versión     | 2.0                                            |
| Estado      | Diseño                                         |

---

## 2. Objetivo

Permitir que los emprendedores registrados publiquen y administren productos y servicios dentro del marketplace UMSS Market, garantizando el cumplimiento de las reglas de negocio, la disponibilidad de información y la correcta asociación con puntos de entrega.

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

1. El emprendedor inicia sesión.
2. El sistema valida que posee una tienda activa.
3. El emprendedor selecciona el tipo de publicación.
4. El emprendedor completa los datos requeridos.
5. El sistema valida las reglas de negocio.
6. El sistema registra la publicación.
7. El sistema asocia los puntos de entrega.
8. El sistema publica el registro en estado ACTIVO.
9. El sistema retorna respuesta exitosa.

---

## 5. Entidades de Dominio

### Publicacion

#### Atributos

* id
* tiendaId
* tipo
* nombre
* descripcion
* precio
* stock
* modalidadCobro
* estado
* createdAt
* updatedAt

---

### PuntoEntrega

#### Atributos

* id
* nombre
* ubicacion
* facultad
* activo

---

### PublicacionPunto

#### Atributos

* publicacionId
* puntoEntregaId

---

## 6. Reglas de Negocio

### RN-001

Toda publicación debe pertenecer a una tienda activa.

### RN-002

El precio debe ser mayor a cero.

### RN-003

Toda publicación debe tener al menos un punto de entrega asociado.

### RN-004

Las publicaciones tipo PRODUCTO deben tener stock inicial mayor o igual a 1.

### RN-005

Las publicaciones tipo SERVICIO deben definir modalidad de cobro.

### RN-006

Solo las publicaciones tipo PRODUCTO utilizan control de stock.

### RN-007

Los puntos de entrega deben existir y estar activos.

### RN-008

Solo los emprendedores propietarios de la tienda pueden gestionar sus publicaciones.

---

## 7. API REST

### Crear Publicación

#### Endpoint

```http
POST /api/publicaciones
```

### Request Producto

```json
{
  "tipo": "PRODUCTO",
  "nombre": "Brownie Artesanal",
  "descripcion": "Brownie elaborado de forma artesanal",
  "precio": 10.50,
  "stock": 20,
  "puntosEntregaIds": [
    "uuid-1",
    "uuid-2"
  ]
}
```

### Request Servicio

```json
{
  "tipo": "SERVICIO",
  "nombre": "Clases Particulares de Matemática",
  "descripcion": "Clases de reforzamiento para cálculo",
  "precio": 50,
  "modalidadCobro": "POR_HORA",
  "puntosEntregaIds": [
    "uuid-1"
  ]
}
```

### Response Exitosa

```json
{
  "success": true,
  "message": "Publicación creada correctamente",
  "publicacionId": "uuid"
}
```

---

### Obtener Publicaciones

```http
GET /api/publicaciones
```

---

### Obtener Publicación por ID

```http
GET /api/publicaciones/{id}
```

---

### Actualizar Publicación

```http
PUT /api/publicaciones/{id}
```

---

### Desactivar Publicación

```http
PATCH /api/publicaciones/{id}/desactivar
```

---

### Activar Publicación

```http
PATCH /api/publicaciones/{id}/activar
```

---

## 8. Modelo Relacional

```text
TIENDA (1) -------- (N) PUBLICACION

PUBLICACION (N) -------- (N) PUNTO_ENTREGA

PUBLICACION (1) -------- (N) PUBLICACION_PUNTO
```

---

## 9. Persistencia

### Base de Datos

PostgreSQL

### Schema

```sql
public
```

### Tablas

* publicaciones
* punto_entrega
* publicacion_punto

---

## 10. Consideraciones Técnicas

* Arquitectura Hexagonal.
* Java 21.
* Spring Boot 3.
* PostgreSQL 18.
* Spring Data JPA.
* Hibernate.
* Bean Validation.
* DTO Pattern.
* Global Exception Handler.
* Soft Delete para publicaciones.
* Auditoría mediante createdAt y updatedAt.

---

## 11. Trazabilidad

| Artefacto  | Relación                                       |
| ---------- | ---------------------------------------------- |
| BRD v4     | Marketplace universitario                      |
| PRD v3     | Gestión de publicaciones                       |
| FSD-UC-002 | Publicación y Gestión de Productos y Servicios |
| T-004      | CRUD de Publicaciones                          |
| T-004A     | Gestión de modalidades de cobro                |

---

## 12. Registro de Cambios

| Versión | Fecha      | Cambio                                                                                                                                                       |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.0     | 20/06/2026 | Diseño inicial para gestión de productos.                                                                                                                    |
| 2.0     | 21/06/2026 | Evolución al modelo unificado PUBLICACION para soportar productos y servicios, incorporación de modalidad de cobro y alineación con BRD v4, PRD v3 y FSD v3. |

```
```
