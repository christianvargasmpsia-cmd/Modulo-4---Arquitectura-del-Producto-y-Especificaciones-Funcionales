# PRD v4 — UMSS Market

---

# 0. Metadatos

| Campo | Valor |
|---|---|
| Producto | UMSS Market |
| Grupo | G1 |
| Version | v4.0 |
| Fecha | 05/07/2026 |
| Product Manager-Autor | Rodriguez Gonzales Abad Melani   Vargas Sandoval Christian Bernardo|
| Revisores | Docente + Tech Lead + QA |
| Estado | Iterative Evolution |
| BRD de referencia | BRD v5 UMSS Market |
| MRD de referencia | No aplica actualmente |
| Insumos M2 | Wireframes marketplace, flujo QR, dashboard vendedor |
| Fase Spec Kit | Specify |
| Prompts utilizados | PROMPT-BRD-001, PROMPT-PRD-001, PROMPT-UX-002, PROMPT-FSD-001, PROMPT-PLAYWRIGHT-001, PROMPT-AI-ANALYZER-001 |

---

# 0.1 Constitution (Spec Kit)

## Principios no negociables

- Todo flujo critico debe completarse en maximo 3 pasos.
- Ningun dato sensible debe almacenarse sin cifrado.
- Todo pago QR debe validarse automaticamente.
- El sistema debe ser mobile-first.
- Ninguna publicación de tipo PRODUCTO debe venderse sin stock disponible.

---

# 1. Resumen del producto

UMSS Market es una plataforma marketplace multi-tenant orientada exclusivamente a la comunidad universitaria de la Universidad Mayor de San Simon.

El producto busca digitalizar y centralizar los emprendimientos universitarios mediante:

- Validacion automatica de pagos QR.
- Gestion de publicaciones.
- Gestion de productos y servicios.
- Gestion de inventario para productos físicos.
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

Permitir la comercialización digital de productos y servicios universitarios
mediante una experiencia unificada de marketplace.

## 2.1 Objetivos Estratégicos del Producto

| ID | Objetivo | BRD Vinculado | Métrica | Meta |
|---|---|---|---|---|
| OP-01 | Digitalizar emprendimientos universitarios | BO-01 | Tiendas activas | >= 50 |
| OP-02 | Reducir validaciones manuales de pagos | BO-02 | Validaciones automáticas | >= 90% |
| OP-03 | Reducir errores de stock | BO-02 | Pedidos rechazados | < 3% |
| OP-04 | Mejorar experiencia de compra | BO-03 | Tiempo promedio de compra | < 2 min |
| OP-05 | Incrementar visibilidad de emprendimientos | BO-04 | Negocios registrados | >= 100 |
| OP-06 | Automatizar el aseguramiento de calidad del Marketplace mediante generación automática de pruebas funcionales y análisis inteligente de resultados. | BR-009, BR-010, BR-011 | Cobertura automatizada | >85% |
---

## 2.2 Visión Arquitectónica del Producto

UMSS Market evoluciona como una plataforma digital modular orientada a capacidades de negocio desacopladas y escalables, permitiendo la integración progresiva de servicios comerciales, pagos digitales, notificaciones y procesos operacionales desacoplados.

La arquitectura funcional del producto contempla separación incremental de dominios, mecanismos desacoplados de comunicación funcional y evolución independiente de capacidades funcionales alineadas al crecimiento del ecosistema universitario.

El enfoque arquitectónico prioriza:

- modularidad funcional
- trazabilidad operacional
- resiliencia funcional
- monitoreo operacional
- integración desacoplada
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
| PC-03 | Gestión de Catálogo | Administrar publicaciones, categorías y disponibilidad de productos y servicios |
| PC-04 | Gestión de Pedidos | Coordinar ciclo de vida completo de órdenes |
| PC-05 | Gestión de Pagos | Validar pagos QR y validación y sincronización operacional |
| PC-06 | Gestión de Inventario | Mantener disponibilidad y actualización operativa de inventario |
| PC-07 | Gestión de Notificaciones | Informar eventos y cambios de estado relevantes |
| PC-08 | Monitoreo y Trazabilidad Operacional | Permitir monitoreo, trazabilidad y auditoría |
| PC-09 | Gestión Administrativa | Supervisar operación global del ecosistema |
| PC-10 | AI Testing Platform | Automatizar la generación, ejecución y análisis inteligente de pruebas funcionales para garantizar la calidad continua del Marketplace. |
---

## 3.2 Evolución Funcional Incremental

La estrategia evolutiva del producto contempla incorporación progresiva de capacidades funcionales mediante un enfoque modular y desacoplado.

Este modelo permite:

- evolución independiente de dominios funcionales
- integración incremental de nuevas capacidades
- reducción de impacto operativo ante cambios
- escalabilidad progresiva del ecosistema
- soporte para crecimiento distribuido de servicios

La separación funcional establecida servirá como base para futuras decisiones arquitectónicas relacionadas con bounded contexts, mecanismos desacoplados de comunicación funcional y arquitectura distribuida.
---

# 4. Alcance (Scope)

## 4.1 Dentro del alcance (release v1.0)

- Registro y autenticacion.
- Gestion de publicaciones.
- Gestion de productos y servicios.
- Gestion de inventario para productos físicos.
- Creacion de pedidos.
- Pagos QR dinamicos.
- Dashboard vendedor.
- Historial de pedidos.
- Sistema de estados.
- Notificaciones basicas.
- Automatización de pruebas funcionales sobre APIs.
- Generación automática de pruebas End-to-End.
- Ejecución automatizada de pruebas funcionales.
- Análisis inteligente de resultados mediante IA.
- Generación automática de reportes técnicos.

---

## 4.2 Fuera del alcance

- Delivery fuera del campus.
- Pagos con tarjetas internacionales.
- Marketplace publico externo.
- Sistema IA avanzado.
- Integracion con billeteras internacionales.
- Corrección automática del código fuente.
- Despliegue automático a producción.

---

## 4.3 Roadmap de versiones

| Version | Contenido | Fecha objetivo |
|---|---|---|
| v1.0 | Marketplace + QR + pedidos | Junio 2026 |
| v1.1 | Analytics + mejoras dashboard | Julio 2026 |
| v2.0 | Multi-campus + recomendaciones | Agosto 2026 |
| v3.0 | IA + chatbot + prediccion demanda | Octubre 2026 |
| v3.1 | AI Testing Platform | Noviembre 2026 |
---

## 4.4 Discovery Track

| Sprint | Hipotesis | Metodo | Criterio exito | Estado |
|---|---|---|---|---|
| S1 | Estudiantes prefieren QR sobre efectivo | Encuestas | >= 70% aceptacion | Validado |
| S2 | Dashboard mejora gestion vendedores | Entrevistas | >= 80% feedback positivo | En progreso |
| S3 | Confirmacion automatica mejora experiencia | Test usuarios | Reduccion >50% tiempo | Pendiente |

---

# 5. Personas

## Persona 1 - Emprendedor o Prestador de Servicios

- Comercializa productos o presta servicios dentro de la UMSS.
- Tiene poco tiempo para responder mensajes.
- Necesita validar pagos rapidamente.
- Necesita controlar stock.
- Puede ofrecer productos físicos o servicios especializados.

---

## Persona 2 - Estudiante Comprador

- Busca productos rapidamente.
- Desea pagos simples mediante QR.
- Quiere confirmacion inmediata.

---

## Persona 3 - QA Engineer

- Responsable de garantizar la calidad funcional del Marketplace.
- Necesita ejecutar pruebas funcionales de forma automática.
- Requiere generar pruebas End-to-End sin intervención manual.
- Analiza resultados para identificar rápidamente fallos y priorizar correcciones.
- Utiliza reportes automáticos para validar cada versión antes de su liberación.
---

# 6. Eventos Funcionales Relevantes

El ecosistema UMSS Market deberá gestionar eventos funcionales asociados a cambios críticos de estado dentro de los procesos operacionales del sistema.

La evolución funcional del producto considera mecanismos desacoplados de propagación de eventos para mantener consistencia operacional, trazabilidad distribuida y sincronización incremental entre capacidades funcionales.

## 6.1 Eventos de Dominio

| Evento | Descripción | Capacidades Relacionadas |
|---|---|---|
| usuario_validado | Usuario autenticado institucionalmente | Gestión de Usuarios |
| tienda_registrada | Nuevo emprendimiento registrado | Gestión de Tiendas |
| publicacion_creada | Nueva publicación registrada en el catálogo | Gestión de Catálogo |
| publicacion_publicada | Publicación habilitada para comercialización | Gestión de Catálogo |
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
# 7. Observabilidad y Trazabilidad Operacional

El producto deberá incorporar mecanismos de observabilidad funcional orientados al monitoreo de procesos críticos, auditoría operacional y trazabilidad distribuida de eventos relevantes dentro del ecosistema UMSS Market.

La estrategia de observabilidad permitirá identificar fallos operacionales, inconsistencias transaccionales y estados críticos asociados a pagos, pedidos, sincronización de stock y notificaciones.

## 7.1 Objetivos de Observabilidad

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

## 7.2 Eventos Operacionales Trazables

| Evento Operacional | Objetivo |
|---|---|
| Creación de pedido | Seguimiento completo del ciclo transaccional |
| Confirmación de pago | Validación y auditoría financiera |
| Actualización de stock | Verificación de consistencia operacional |
| Cambio de estado de pedido | Trazabilidad del flujo logístico |
| Generación de notificación | Validación de comunicación operacional |
| Registro de errores críticos | Diagnóstico y resiliencia operacional |

---

## 7.3 Estrategia Evolutiva de Observabilidad

La evolución del producto contempla incorporación progresiva de capacidades de monitoreo distribuido y trazabilidad operacional alineadas a arquitecturas modernas orientadas a eventos.

Este enfoque permitirá fortalecer resiliencia, auditoría y soporte operacional del ecosistema conforme aumente la complejidad funcional de la plataforma. 
---

# 8. User Stories

| ID | Historia | Prioridad |
|---|---|---|
| PRD-US-001 | Como estudiante quiero iniciar sesion para acceder al marketplace | Must |
| PRD-US-002 | Como emprendedor quiero crear una tienda para vender productos o servicios | Must |
| PRD-US-003 | Como emprendedor quiero publicar productos o servicios para comercializarlos dentro del marketplace | Must |
| PRD-US-004 | Como vendedor quiero mantener actualizada la disponibilidad de mis publicaciones | Must |
| PRD-US-005 | Como comprador quiero visualizar la disponibilidad real de productos y servicios | Must |
| PRD-US-006 | Como comprador quiero generar pedidos | Must |
| PRD-US-007 | Como comprador quiero pagar mediante QR | Must |
| PRD-US-008 | Como vendedor quiero validar pagos automaticamente | Must |
| PRD-US-009 | Como prestador de servicios quiero definir el tipo de servicio y su modalidad de cobro. | Must |
| PRD-US-010 | Como QA Engineer quiero ejecutar automáticamente pruebas funcionales sobre las APIs para validar el correcto funcionamiento del Marketplace antes de cada liberación. | Must |
| PRD-US-011 | Como QA Engineer quiero generar automáticamente pruebas End-to-End para reducir el esfuerzo manual de validación. | Must |
| PRD-US-012 | Como desarrollador quiero recibir un análisis inteligente de los resultados de las pruebas para identificar rápidamente la causa probable de los errores. | Should |
---

# 9. Criterios Gherkin

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
```gherkin
Escenario: Ejecución automática de pruebas API
Dado que existen colecciones de pruebas configuradas
Cuando el QA inicia la validación
Entonces el sistema ejecuta automáticamente todas las pruebas API.
```

```gherkin
Escenario: Generación automática de pruebas End-to-End
Dado una funcionalidad documentada
Cuando el QA solicita generar pruebas
Entonces el sistema crea automáticamente los casos de prueba End-to-End.
```

```gherkin
Escenario: Análisis inteligente de resultados
Dado que las pruebas finalizaron
Cuando existen errores
Entonces el sistema genera automáticamente un análisis técnico y recomendaciones.
```
---

# 10. Priorizacion

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

# 11. Requerimientos Funcionales

| ID | Requisito | Prioridad |
|---|---|---|
| PRD-REQ-001 | El sistema debe permitir autenticacion institucional | Must |
| PRD-REQ-002 | El sistema debe permitir crear tiendas | Must |
| PRD-REQ-003 | El sistema debe soportar CRUD de publicaciones (productos y servicios). | Must |
| PRD-REQ-004 | El sistema debe sincronizar stock para publicaciones de tipo PRODUCTO | Must |
| PRD-REQ-005 | El sistema debe generar pedidos | Must |
| PRD-REQ-006 | El sistema debe generar QR dinamico | Must |
| PRD-REQ-007 | El sistema debe permitir clasificar publicaciones como PRODUCTO o SERVICIO. | Must |
| PRD-REQ-008 | El sistema debe permitir definir modalidad de cobro para servicios. | Must |
| PRD-REQ-009 | El sistema debe ejecutar automáticamente pruebas funcionales sobre las APIs del Marketplace. | Must |
| PRD-REQ-010 | El sistema debe generar automáticamente pruebas End-to-End a partir de especificaciones funcionales. | Must |
| PRD-REQ-011 | El sistema debe analizar automáticamente los resultados de ejecución utilizando Inteligencia Artificial para clasificar errores y generar recomendaciones. | Should |
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

El proceso evolutivo del producto incorpora mecanismos AI-assisted orientados a refinamiento funcional, generación incremental de documentación y soporte arquitectónico basado en workflows AI-assisted.

El ecosistema documental integra prompts estructurados, skills especializados y procesos AI-SDLC para facilitar:

- refinamiento funcional incremental
- análisis arquitectónico
- generación de artefactos técnicos
- trazabilidad documental
- validación evolutiva de capacidades funcionales

La estrategia AI-Native incorpora agentes especializados para automatización de pruebas funcionales, generación automática de pruebas End-to-End y análisis inteligente de resultados, fortaleciendo el proceso AI-SDLC y el aseguramiento continuo de la calidad del producto.
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
| Errores stock | Alta | Validaciones operacionales y sincronización incremental |
| Resultados incorrectos generados por IA | Medio | Validación humana antes de aprobar los resultados |
| Cambios en APIs externas | Alto | Versionado de APIs y ejecución continua de pruebas automatizadas |
---

# 16. Trazabilidad

| PRD ID      | BRD     | FSD           |
| ----------- | ------- | ------------- |
| PRD-REQ-001 | BR-001  | FSD-AUTH-001  |
| PRD-REQ-002 | BR-001  | FSD-STORE-001 |
| PRD-REQ-003 | BR-003  | FSD-CAT-002   |
| PRD-REQ-004 | BR-003  | FSD-CAT-002   |
| PRD-REQ-005 | BR-004  | FSD-ORDER-001 |
| PRD-REQ-006 | BR-002  | FSD-PAY-001   |
| PRD-REQ-007 | BR-003A | FSD-CAT-002   |
| PRD-REQ-008 | BR-003A | FSD-CAT-002   |
| PRD-REQ-009 | BR-009 | FSD-MCP-POSTMAN |
| PRD-REQ-010 | BR-010 | FSD-PLAYWRIGHT |
| PRD-REQ-011 | BR-011 | FSD-AI-ANALYZER |

---

# 17. Registro de Cambios

| Version | Fecha      | Cambio                                                                                                                                                                                                                                                      |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0    | 11/05/2026 | Creacion inicial PRD                                                                                                                                                                                                                                        |
| v2.0    | 23/05/2026 | Consolidación funcional, capacidades desacopladas y evolución arquitectónica incremental del producto.                                                                                                                                                      |
| v3.0    | 21/06/2026 | Evolución del marketplace para soportar productos y servicios universitarios. Se actualizó el catálogo, alcance funcional, historias de usuario, requerimientos funcionales y eventos de dominio para incorporar publicaciones de tipo PRODUCTO y SERVICIO. |
| v4.0 | 06/07/2026 | Alineación con BRD v5, incorporación de AI Testing Platform, nuevas capacidades funcionales, historias de usuario, requerimientos funcionales, escenarios Gherkin y trazabilidad para las features MCP Postman Agent, AI Playwright Testing Agent y AI Test Analyzer. |
---

# Checklist

- [x] User stories definidas
- [x] Gherkin incluido
- [x] Priorizacion MoSCoW y RICE
- [x] Roadmap definido
- [x] Trazabilidad iniciada
- [x] Riesgos documentados
