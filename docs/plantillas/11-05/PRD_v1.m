# PRD v1 — UMSS Market

---

# 0. Metadatos

| Campo | Valor |
|---|---|
| Producto | UMSS Market |
| Grupo | G1 |
| Version | v1.0 |
| Fecha | 11/05/2026 |
| Product Manager | Rodriguez Gonzales Abad Melani |
| Co-Autor | Vargas Sandoval Christian Bernardo |
| Revisores | Docente + Tech Lead + QA |
| Estado | En revision |
| BRD de referencia | BRD v2 UMSS Market |
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

# 2. Objetivos del producto

| ID | Objetivo | BRD vinculado | Metrica | Meta |
|---|---|---|---|---|
| OP-01 | Digitalizar emprendimientos universitarios | BO-01 | Tiendas activas | >= 50 |
| OP-02 | Reducir validaciones manuales de pagos | BO-02 | Validaciones automaticas | >= 90% |
| OP-03 | Reducir errores de stock | BO-02 | Pedidos rechazados | < 3% |
| OP-04 | Mejorar experiencia de compra | BO-03 | Tiempo promedio compra | < 2 min |
| OP-05 | Incrementar visibilidad de emprendimientos | BO-04 | Negocios registrados | >= 100 |

---

# 3. Alcance (Scope)

## 3.1 Dentro del alcance (release v1.0)

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

## 3.2 Fuera del alcance

- Delivery fuera del campus.
- Pagos con tarjetas internacionales.
- Marketplace publico externo.
- Sistema IA avanzado.
- Integracion con billeteras internacionales.

---

## 3.3 Roadmap de versiones

| Version | Contenido | Fecha objetivo |
|---|---|---|
| v1.0 | Marketplace + QR + pedidos | Junio 2026 |
| v1.1 | Analytics + mejoras dashboard | Julio 2026 |
| v2.0 | Multi-campus + recomendaciones | Agosto 2026 |
| v3.0 | IA + chatbot + prediccion demanda | Octubre 2026 |

---

## 3.4 Discovery Track

| Sprint | Hipotesis | Metodo | Criterio exito | Estado |
|---|---|---|---|---|
| S1 | Estudiantes prefieren QR sobre efectivo | Encuestas | >= 70% aceptacion | Validado |
| S2 | Dashboard mejora gestion vendedores | Entrevistas | >= 80% feedback positivo | En progreso |
| S3 | Confirmacion automatica mejora experiencia | Test usuarios | Reduccion >50% tiempo | Pendiente |

---

# 4. Personas

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

# 5. User Stories

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

# 6. Criterios Gherkin

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

# 7. Priorizacion

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

# 8. Requerimientos Funcionales

| ID | Requisito | Prioridad |
|---|---|---|
| PRD-REQ-001 | El sistema debe permitir autenticacion institucional | Must |
| PRD-REQ-002 | El sistema debe permitir crear tiendas | Must |
| PRD-REQ-003 | El sistema debe soportar CRUD productos | Must |
| PRD-REQ-004 | El sistema debe sincronizar stock | Must |
| PRD-REQ-005 | El sistema debe generar pedidos | Must |
| PRD-REQ-006 | El sistema debe generar QR dinamico | Must |

---

# 9. Requerimientos No Funcionales

| ID | Categoria | Requerimiento | Umbral |
|---|---|---|---|
| PRD-NFR-001 | Rendimiento | Tiempo respuesta API | < 500 ms |
| PRD-NFR-002 | Seguridad | Proteccion datos | AES-256 |
| PRD-NFR-003 | Escalabilidad | Usuarios concurrentes | > 1000 |
| PRD-NFR-004 | Disponibilidad | Uptime sistema | 99% |

---

# 10. Dependencias

| Sistema | Tipo | Proposito |
|---|---|---|
| API bancaria QR | Consumo | Validacion pagos |
| Sistema identidad UMSS | Consumo | Login institucional |
| PostgreSQL | Persistencia | Base de datos |

---

# 11. Riesgos

| Riesgo | Impacto | Mitigacion |
|---|---|---|
| Baja adopcion | Alta | Campanas universitarias |
| Fallos QR | Critico | Retry + fallback |
| Errores stock | Alta | Transacciones ACID |

---

# 12. Trazabilidad

| PRD ID | BRD | FSD |
|---|---|---|
| PRD-REQ-001 | BR-001 | FSD-AUTH-001 |
| PRD-REQ-002 | BR-002 | FSD-PAY-001 |
| PRD-REQ-003 | BR-003 | FSD-STOCK-001 |

---

# 13. Registro de Cambios

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
