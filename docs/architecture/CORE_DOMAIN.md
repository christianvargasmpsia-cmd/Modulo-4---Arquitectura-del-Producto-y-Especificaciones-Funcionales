# §2. Core Domain

## 2.1 Dominio Core

El dominio core de UMSS Market es la gestión de emprendimientos universitarios mediante un marketplace centralizado que permite publicar productos, gestionar pedidos y procesar compras digitales.

---

## 2.2 Entidades principales

| Entidad | Descripción |
|---|---|
| Emprendedor | Usuario autorizado que administra una tienda dentro del marketplace |
| Producto | Artículo publicado para venta dentro de una tienda |
| Pedido | Transacción generada por la compra de productos |

---

## 2.3 Relación con Clean Architecture

Siguiendo los principios de Clean Architecture de Robert C. Martin:

- el dominio debe permanecer independiente de frameworks
- las reglas de negocio no deben depender de infraestructura
- la lógica core debe estar aislada de detalles externos

El sistema prioriza la separación entre:

- dominio
- infraestructura
- interfaces externas
- servicios técnicos

---

## 2.4 Dependency Rule

La Dependency Rule establece que las dependencias deben apuntar hacia adentro, hacia las políticas y reglas de negocio.

En UMSS Market:

- Angular depende del backend
- el backend depende del dominio
- el dominio no depende de frameworks
- el core no depende de PostgreSQL ni APIs externas

---

## 2.5 Ports & Adapters

La arquitectura Ports & Adapters permitirá desacoplar el dominio principal de servicios externos.

Ejemplos:

| Puerto | Adaptador |
|---|---|
| Pago QR | Banco QR API |
| Notificaciones | SMTP Service |
| Persistencia | PostgreSQL Repository |
| Autenticación | JWT Adapter |

Esto permitirá cambiar tecnologías sin afectar las reglas de negocio del sistema.
