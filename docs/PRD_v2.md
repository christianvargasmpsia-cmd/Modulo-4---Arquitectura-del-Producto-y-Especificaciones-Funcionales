# PRD v2 — UMSS Market

---

# 0. Metadatos

| Campo | Valor |
|---|---|
| Producto | UMSS Market |
| Grupo | G1 |
| Version | v2.0 |
| Fecha | 23/05/2026 |
| Product Manager-Autor | Rodriguez Gonzales Abad Melani   Vargas Sandoval Christian Bernardo|
| Revisores | Docente + Tech Lead + QA |
| Estado | Iterative Evolution |
| BRD de referencia | BRD v3 UMSS Market |
| MRD de referencia | No aplica actualmente |
| Insumos M2 | Wireframes marketplace, flujo QR, dashboard vendedor |
| Fase Spec Kit | Specify |
| Prompts utilizados | PROMPT-PRD-001, PROMPT-UX-002 |

---

# 0.1 Constitution (Spec Kit)

## Principios no negociables

- Todo flujo critico debe completarse en maximo 3 pasos.
- Ningun dato sensible debe almacenarse sin cifrado.
- Todo pago QR debe validarse automaticamente.
- El sistema debe ser mobile-first.
- Ningun producto debe venderse sin stock disponible.

---

# 1. Resumen del producto

UMSS Market es una plataforma marketplace multi-tenant orientada exclusivamente a la comunidad universitaria de la Universidad Mayor de San Simon.

El producto busca digitalizar y centralizar los emprendimientos universitarios mediante:

- Validacion automatica de pagos QR.
- Gestion de productos.
- Gestion de inventario.
- Gestion de pedidos.
- Dashboard de ventas.
- Descubrimiento de negocios universitarios.

Actualmente gran parte de las ventas universitarias se realizan mediante grupos de WhatsApp y mensajes privados, generando problemas como:

- Desorganizacion.
- Pagos falsos.
- Perdida de pedidos.
- Falta de control de stock.

UMSS Market permitira a estudiantes emprendedores administrar tiendas digitales y recibir pagos seguros mediante QR dinamico.

Asimismo, los estudiantes compradores podran descubrir productos facilmente, realizar pedidos rapidos y recibir confirmaciones automaticas.

---

# 2. Objetivos del Producto

El producto UMSS Market tiene como objetivo construir un ecosistema digital universitario orientado a la gestión eficiente de emprendimientos, pedidos, pagos y operaciones comerciales dentro de la Universidad Mayor de San Simón.

La estrategia funcional del producto prioriza digitalización operativa, reducción de fricción comercial, trazabilidad transaccional y escalabilidad evolutiva mediante capacidades desacopladas y procesos automatizados.

La evolución del sistema contempla integración progresiva de capacidades funcionales, automatización de procesos críticos y soporte para crecimiento incremental del ecosistema comercial universitario.

## 2.1 Objetivos Estratégicos del Producto

| ID | Objetivo | BRD Vinculado | Métrica | Meta |
|---|---|---|---|---|
| OP-01 | Digitalizar emprendimientos universitarios | BO-01 | Tiendas activas | >= 50 |
| OP-02 | Reducir validaciones manuales de pagos | BO-02 | Validaciones automáticas | >= 90% |
| OP-03 | Reducir errores de stock | BO-02 | Pedidos rechazados | < 3% |
| OP-04 | Mejorar experiencia de compra | BO-03 | Tiempo promedio de compra | < 2 min |
| OP-05 | Incrementar visibilidad de emprendimientos | BO-04 | Negocios registrados | >= 100 |

---

## 2.2 Visión Arquitectónica del Producto

UMSS Market evoluciona como una plataforma digital modular orientada a capacidades de negocio desacopladas y escalables, permitiendo la integración progresiva de servicios comerciales, pagos digitales, notificaciones y procesos operacionales distribuidos.

La arquitectura funcional del producto contempla separación incremental de dominios, integración basada en eventos y evolución independiente de capacidades funcionales alineadas al crecimiento del ecosistema universitario.

El enfoque arquitectónico prioriza:

- modularidad funcional
- trazabilidad operacional
- resiliencia
- observabilidad
- integración distribuida
- evolución incremental
- consistencia operacional

La estrategia evolutiva del producto permitirá incorporar nuevas capacidades funcionales sin afectar la continuidad operativa del ecosistema, favoreciendo escalabilidad y desacoplamiento progresivo entre componentes funcionales.
# 3. Capacidades Funcionales del Producto

Las capacidades funcionales representan agrupaciones evolutivas de responsabilidades de negocio necesarias para soportar la operación integral del ecosistema UMSS Market.

La arquitectura funcional del producto se encuentra organizada mediante capacidades desacopladas que permiten evolución incremental, escalabilidad independiente y separación clara de dominios operacionales.

## 3.1 Capacidades Funcionales

| ID | Capacidad | Objetivo |
|---|---|---|
| PC-01 | Gestión de Usuarios | Administrar autenticación, perfiles y validación institucional |
| PC-02 | Gestión de Tiendas | Permitir operación de emprendimientos universitarios |
| PC-03 | Gestión de Catálogo | Administrar productos, categorías y disponibilidad |
| PC-04 | Gestión de Pedidos | Coordinar ciclo de vida completo de órdenes |
| PC-05 | Gestión de Pagos | Validar pagos QR y sincronización transaccional |
| PC-06 | Gestión de Inventario | Mantener consistencia y sincronización de stock |
| PC-07 | Gestión de Notificaciones | Informar eventos y cambios de estado relevantes |
| PC-08 | Observabilidad Operacional | Permitir monitoreo, trazabilidad y auditoría |
| PC-09 | Gestión Administrativa | Supervisar operación global del ecosistema |

---

## 3.2 Evolución Funcional Incremental

La estrategia evolutiva del producto contempla incorporación progresiva de capacidades funcionales mediante un enfoque modular y desacoplado.

Este modelo permite:

- evolución independiente de dominios funcionales
- integración incremental de nuevas capacidades
- reducción de impacto operativo ante cambios
- escalabilidad progresiva del ecosistema
- soporte para crecimiento distribuido de servicios

La separación funcional establecida servirá como base para futuras decisiones arquitectónicas relacionadas con bounded contexts, integración basada en eventos y arquitectura distribuida.
---

# 4. Alcance (Scope)

## 4.1 Dentro del alcance (release v1.0)

- Registro y autenticacion.
- Gestion de tiendas.
- Gestion de productos.
- Gestion de inventario.
- Creacion de pedidos.
- Pagos QR dinamicos.
- Dashboard vendedor.
- Historial de pedidos.
- Sistema de estados.
- Notificaciones basicas.

---

## 4.2 Fuera del alcance

- Delivery fuera del campus.
- Pagos con tarjetas internacionales.
- Marketplace publico externo.
- Sistema IA avanzado.
- Integracion con billeteras internacionales.

---

## 4.3 Roadmap de versiones

| Version | Contenido | Fecha objetivo |
|---|---|---|
| v1.0 | Marketplace + QR + pedidos | Junio 2026 |
| v1.1 | Analytics + mejoras dashboard | Julio 2026 |
| v2.0 | Multi-campus + recomendaciones | Agosto 2026 |
| v3.0 | IA + chatbot + prediccion demanda | Octubre 2026 |

---

## 4.4 Discovery Track

| Sprint | Hipotesis | Metodo | Criterio exito | Estado |
|---|---|---|---|---|
| S1 | Estudiantes prefieren QR sobre efectivo | Encuestas | >= 70% aceptacion | Validado |
| S2 | Dashboard mejora gestion vendedores | Entrevistas | >= 80% feedback positivo | En progreso |
| S3 | Confirmacion automatica mejora experiencia | Test usuarios | Reduccion >50% tiempo | Pendiente |

---

# 5. Personas

## Persona 1 - Emprendedor Estudiante

- Vende productos dentro de la UMSS.
- Tiene poco tiempo para responder mensajes.
- Necesita validar pagos rapidamente.
- Necesita controlar stock.

---

## Persona 2 - Estudiante Comprador

- Busca productos rapidamente.
- Desea pagos simples mediante QR.
- Quiere confirmacion inmediata.

---

# 6. Eventos Funcionales Relevantes

El ecosistema UMSS Market deberá gestionar eventos funcionales asociados a cambios críticos de estado dentro de los procesos operacionales del sistema.

La evolución funcional del producto considera mecanismos desacoplados de propagación de eventos para mantener consistencia operacional, trazabilidad distribuida y sincronización incremental entre capacidades funcionales.

## 6.1 Eventos de Dominio

| Evento | Descripción | Capacidades Relacionadas |
|---|---|---|
| usuario_validado | Usuario autenticado institucionalmente | Gestión de Usuarios |
| tienda_registrada | Nuevo emprendimiento registrado | Gestión de Tiendas |
| producto_publicado | Producto disponible para comercialización | Gestión de Catálogo |
| pedido_creado | Orden generada por consumidor | Gestión de Pedidos |
| pago_confirmado | Pago QR validado exitosamente | Gestión de Pagos |
| stock_actualizado | Inventario sincronizado después de compra | Gestión de Inventario |
| pedido_preparado | Pedido listo para entrega | Gestión de Pedidos |
| pedido_entregado | Entrega completada | Gestión de Pedidos |
| notificacion_generada | Comunicación emitida | Gestión de Notificaciones |

---

## 6.2 Objetivos del Modelo Basado en Eventos

La incorporación de eventos funcionales busca:

- desacoplar capacidades funcionales
- mejorar trazabilidad operacional
- soportar escalabilidad incremental
- facilitar integración distribuida
- permitir observabilidad de procesos críticos
- reducir dependencias síncronas entre componentes
# 6. Observabilidad y Trazabilidad Operacional

El producto deberá incorporar mecanismos de observabilidad funcional orientados al monitoreo de procesos críticos, auditoría operacional y trazabilidad distribuida de eventos relevantes dentro del ecosistema UMSS Market.

La estrategia de observabilidad permitirá identificar fallos operacionales, inconsistencias transaccionales y estados críticos asociados a pagos, pedidos, sincronización de stock y notificaciones.

## 6.1 Objetivos de Observabilidad

La solución deberá permitir:

- monitoreo de eventos críticos
- trazabilidad completa de pedidos
- seguimiento de cambios de estado
- auditoría operacional
- identificación de fallos distribuidos
- análisis de consistencia operacional
- seguimiento de validaciones de pago
- monitoreo de sincronización de inventario

---

## 6.2 Eventos Operacionales Trazables

| Evento Operacional | Objetivo |
|---|---|
| Creación de pedido | Seguimiento completo del ciclo transaccional |
| Confirmación de pago | Validación y auditoría financiera |
| Actualización de stock | Verificación de consistencia operacional |
| Cambio de estado de pedido | Trazabilidad del flujo logístico |
| Generación de notificación | Validación de comunicación operacional |
| Registro de errores críticos | Diagnóstico y resiliencia operacional |

---

## 6.3 Estrategia Evolutiva de Observabilidad

La evolución del producto contempla incorporación progresiva de capacidades de monitoreo distribuido y trazabilidad operacional alineadas a arquitecturas modernas orientadas a eventos.

Este enfoque permitirá fortalecer resiliencia, auditoría y soporte operacional del ecosistema conforme aumente la complejidad funcional de la plataforma. 
---

# 7. User Stories

| ID | Historia | Prioridad |
|---|---|---|
| PRD-US-001 | Como estudiante quiero iniciar sesion para acceder al marketplace | Must |
| PRD-US-002 | Como emprendedor quiero crear una tienda para vender productos | Must |
| PRD-US-003 | Como vendedor quiero crear productos para publicarlos | Must |
| PRD-US-004 | Como vendedor quiero actualizar stock automaticamente | Must |
| PRD-US-005 | Como comprador quiero visualizar disponibilidad real | Must |
| PRD-US-006 | Como comprador quiero generar pedidos | Must |
| PRD-US-007 | Como comprador quiero pagar mediante QR | Must |
| PRD-US-008 | Como vendedor quiero validar pagos automaticamente | Must |

---

# 8. Criterios Gherkin

```gherkin
Escenario: Login exitoso
Dado un usuario registrado
Cuando ingresa credenciales validas
Entonces el sistema permite acceso
Y redirige al dashboard
```

```gherkin
Escenario: Generar QR
Dado un pedido valido
Cuando el usuario confirma compra
Entonces el sistema genera un QR dinamico
```

```gherkin
Escenario: Actualizacion stock
Dado un pedido confirmado
Cuando el pago es validado
Entonces el stock disminuye automaticamente
```

---

# 9. Priorizacion

## MoSCoW

- Must
- Should
- Could
- Wont

---

## Tabla RICE

| ID | Reach | Impact | Confidence | Effort | RICE |
|---|---|---|---|---|---|
| PRD-US-006 | 10000 | 3 | 90 | 5 | 5400 |
| PRD-US-007 | 10000 | 3 | 95 | 5 | 5700 |
| PRD-US-008 | 9000 | 3 | 85 | 6 | 3825 |

---

# 10. Requerimientos Funcionales

| ID | Requisito | Prioridad |
|---|---|---|
| PRD-REQ-001 | El sistema debe permitir autenticacion institucional | Must |
| PRD-REQ-002 | El sistema debe permitir crear tiendas | Must |
| PRD-REQ-003 | El sistema debe soportar CRUD productos | Must |
| PRD-REQ-004 | El sistema debe sincronizar stock | Must |
| PRD-REQ-005 | El sistema debe generar pedidos | Must |
| PRD-REQ-006 | El sistema debe generar QR dinamico | Must |

---
# 11. Eventos Funcionales Relevantes

| Evento | Descripción |
|---|---|
| pedido_creado | Orden generada por consumidor |
| pago_confirmado | Pago QR validado |
| stock_actualizado | Inventario sincronizado |
| pedido_preparado | Pedido listo |
| pedido_entregado | Entrega completada |
| notificacion_generada | Comunicación emitida |

---
# 12. Requerimientos No Funcionales

| ID | Categoria | Requerimiento | Umbral |
|---|---|---|---|
| PRD-NFR-001 | Rendimiento | Tiempo respuesta API | < 500 ms |
| PRD-NFR-002 | Seguridad | Proteccion datos | AES-256 |
| PRD-NFR-003 | Escalabilidad | Usuarios concurrentes | > 1000 |
| PRD-NFR-004 | Disponibilidad | Uptime sistema | 99% |

---
# 13. Estrategia AI-Native y AI-Assisted

El proceso evolutivo del producto incorpora mecanismos AI-assisted orientados a refinamiento funcional, generación incremental de documentación y soporte arquitectónico basado en workflows agénticos.

El ecosistema documental integra prompts estructurados, skills especializados y procesos AI-SDLC para facilitar:

- refinamiento funcional incremental
- análisis arquitectónico
- generación de artefactos técnicos
- trazabilidad documental
- validación evolutiva de capacidades funcionales

---
# 14. Dependencias

| Sistema | Tipo | Proposito |
|---|---|---|
| API bancaria QR | Consumo | Validacion pagos |
| Sistema identidad UMSS | Consumo | Login institucional |
| PostgreSQL | Persistencia | Base de datos |

---

# 15. Riesgos

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Baja adopcion | Alta | Campanas universitarias |
| Fallos QR | Critico | Retry + fallback |
| Errores stock | Alta | Transacciones ACID |

---

# 16. Trazabilidad

| PRD ID | BRD | FSD |
|---|---|---|
| PRD-REQ-001 | BR-001 | FSD-AUTH-001 |
| PRD-REQ-002 | BR-002 | FSD-PAY-001 |
| PRD-REQ-003 | BR-003 | FSD-STOCK-001 |

---

# 17. Registro de Cambios

| Version | Fecha | Cambio |
|---|---|---|
| v1.0 | 11/05/2026 | Creacion inicial PRD |

---

# Checklist

- [x] User stories definidas
- [x] Gherkin incluido
- [x] Priorizacion MoSCoW y RICE
- [x] Roadmap definido
- [x] Trazabilidad iniciada
- [x] Riesgos documentados
