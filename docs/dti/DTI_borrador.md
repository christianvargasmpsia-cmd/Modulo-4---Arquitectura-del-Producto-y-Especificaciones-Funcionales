DTI — Borrador Arquitectónico Inicial — UMSS Market
§0. Contexto General
0.1 Objetivo

Definir el contexto arquitectónico inicial de UMSS Market utilizando el modelo C4 Nivel 1 (System Context Diagram).

El documento describe:

actores principales
sistemas externos
relaciones principales
límites del sistema
decisiones arquitectónicas iniciales
0.2 Descripción del sistema

UMSS Market es una plataforma marketplace multi-tenant orientada a la comunidad universitaria UMSS.

El sistema permitirá:

gestión de tiendas
publicación de productos
creación de pedidos
pagos QR dinámicos
validación automática de pagos
gestión de inventario
notificaciones por correo electrónico
validación de emprendedores autorizados

El objetivo principal es digitalizar los emprendimientos universitarios mediante una plataforma centralizada de comercio electrónico.

0.3 Stakeholders técnicos
Stakeholder	Rol
Estudiantes compradores	Usuarios finales
Emprendedores universitarios	Gestión de tiendas
DTIC UMSS	Supervisión técnica
Banco QR API	Integración pagos
Equipo desarrollo	Implementación sistema
§1. C4 Model — Nivel 1 — System Context
1.1 Objetivo del diagrama

Representar el ecosistema general del sistema mostrando:

usuarios
sistema principal
sistemas externos
relaciones de interacción
1.2 Abstracciones C4 utilizadas
Abstracción	Uso
Person	Compradores y emprendedores
Software System	UMSS Market
External System	APIs y servicios externos
1.3 Diagrama C4 Nivel 1
+--------------------------------------------------+
|                 UMSS MARKET                      |
| Marketplace universitario multi-tenant           |
+--------------------------------------------------+

        ↑                           ↑
        |                           |
        |                           |

+----------------+       +----------------------+
| Estudiante     |       | Emprendedor          |
| Comprador      |       | Universitario        |
+----------------+       +----------------------+

                ↓
                |
                |

       +----------------------+
       | Banco QR API         |
       | Validacion pagos QR  |
       +----------------------+

                ↓

       +----------------------+
       | SMTP / Email Service |
       | Envio notificaciones |
       +----------------------+
1.4 Relaciones principales
Origen	Destino	Relación
Comprador	UMSS Market	Compra productos
Emprendedor	UMSS Market	Gestiona tienda
UMSS Market	Banco QR API	Genera y valida pagos
UMSS Market	SMTP / Email Service	Envía notificaciones
§2. Decisiones arquitectónicas candidatas a ADR
ADR-001 — Uso de arquitectura multi-tenant
Contexto

El sistema debe soportar múltiples emprendimientos universitarios utilizando una única plataforma.

Decisión candidata

Implementar arquitectura multi-tenant lógica mediante separación por business_id.

Justificación
escalabilidad
menor costo infraestructura
administración centralizada
reutilización recursos
facilidad mantenimiento
ADR-002 — Uso de PostgreSQL como base principal
Contexto

El sistema requiere consistencia transaccional para pagos y stock.

Decisión candidata

Utilizar PostgreSQL como motor relacional principal.

Justificación
soporte ACID
integridad transaccional
concurrencia segura
estabilidad
escalabilidad
ADR-003 — Validación QR mediante API bancaria
Contexto

Los pagos QR requieren validación automática en tiempo real.

Decisión candidata

Integrar una API bancaria QR mediante Webhooks y validaciones server-side.

Justificación
automatización pagos
reducción validaciones manuales
validación tiempo real
reducción fraude
ADR-004 — Notificaciones mediante correo electrónico
Contexto

Los usuarios deben recibir confirmaciones de pedidos y pagos.

Decisión candidata

Utilizar notificaciones mediante servicio SMTP/email.

Justificación
simplicidad implementación
compatibilidad universal
menor complejidad
facilidad mantenimiento
ADR-005 — Validación interna de emprendedores
Contexto

Solo emprendedores aprobados podrán crear tiendas dentro del marketplace.

Decisión candidata

Implementar validación mediante una tabla interna de emprendedores autorizados.

Justificación
control administrativo
menor dependencia externa
simplicidad integración
gestión centralizada
§3. Riesgos arquitectónicos iniciales
Riesgo	Impacto	Mitigación
Caída API bancaria	Alto	Retry + fallback
Errores concurrencia stock	Alto	Transacciones ACID
Latencia validación QR	Medio	Webhooks
Sobrecarga sistema	Medio	Arquitectura escalable
Correos no entregados	Medio	Retry SMTP
Acceso incorrecto tenants	Alto	Middleware RBAC
§4. Tecnologías iniciales
Componente	Tecnología
Frontend	Angular
Backend	Go
Base de datos	PostgreSQL
Arquitectura API	REST
Autenticación	JWT
Notificaciones	SMTP
Integración pagos	Banco QR API
§5. Próximos pasos
Elaborar C4 Nivel 2
Definir containers
Definir APIs principales
Elaborar ADRs formales
Diseñar modelo entidad-relación
Refinar arquitectura backend
Definir estrategia despliegue
Definir políticas seguridad
§6. Registro de cambios
Version	Fecha	Cambio
v1.0	11/05/2026	Creación inicial DTI borrador
Checklist
 C4 Nivel 1 definido
 Actores identificados
 Sistemas externos definidos
 Relaciones documentadas
 ADRs candidatos identificados
 Riesgos arquitectónicos definidos
 Tecnologías iniciales documentadas
 Compatible con GitHub Preview