# §3. Flujos Asíncronos Candidatos — Saga, Outbox y CQRS

---

# 3.1 Introducción

UMSS Market posee múltiples procesos distribuidos que requieren coordinación entre módulos internos y servicios externos.

Para mejorar:

- escalabilidad
- resiliencia
- consistencia eventual
- desacoplamiento

se identificaron flujos candidatos para aplicar:

- Saga Pattern
- Outbox Pattern
- CQRS

---

# 3.2 Conceptos arquitectónicos aplicados

| Patrón | Objetivo |
|---|---|
| Saga Pattern | Coordinar procesos distribuidos mediante compensaciones |
| Outbox Pattern | Garantizar publicación consistente de eventos |
| CQRS | Separar comandos y consultas |

---

# 3.3 Flujo asíncrono #1 — Confirmación de pago QR

## Descripción

Cuando un comprador realiza un pago QR, el sistema debe validar el pago mediante una API bancaria y posteriormente actualizar el pedido.

---

## Componentes involucrados

- Checkout Service
- Banco QR API
- Order Service
- Notification Service

---

## Patrones aplicables

| Patrón | Aplicación |
|---|---|
| Saga Pattern | Coordinación del flujo de pago |
| Outbox Pattern | Publicación evento PaymentConfirmed |
| CQRS | Lecturas separadas de estado pagos |

---
## Flujo

```text
Cliente genera QR
↓
Proveedor QR procesa validación de pago
↓
Webhook confirma pago
↓
Payment Service publica PAYMENT_CONFIRMED
↓
Event Bus propaga evento
↓
Order Service actualiza pedido
↓
Notification Service envía notificación
```

### Evento candidato

```text
PAYMENT_CONFIRMED
```

### Beneficios

- consistencia eventual
- desacoplamiento
- resiliencia ante fallos
- recuperación operacional controlada

---

# 3.4 Flujo asíncrono #2 — Creación de pedido e inventario

## Descripción

Al crear un pedido, el sistema debe validar stock y actualizar inventario sin bloquear toda la operación.

---

## Componentes involucrados

- Order Service
- Inventory Service
- Product Service

---

## Patrones aplicables

| Patrón | Aplicación |
|---|---|
| Saga Pattern | Coordinación pedido-stock |
| Outbox Pattern | Publicación evento ORDER_CREATED |
| CQRS | Consultas optimizadas de catálogo |

---

## Flujo

```text
Cliente crea pedido
↓
Order Service genera pedido
↓
Order Service publica ORDER_CREATED
↓
Event Bus propaga evento
↓
Inventory Service reserva stock
↓
Inventory Service confirma reserva de stock
↓
Pedido queda aprobado
```

### Evento candidato

```text
ORDER_CREATED
```

### Beneficios

- reducción de bloqueo transaccional
- mejor escalabilidad
- desacoplamiento de inventario
- tolerancia a fallos

---

# 3.5 Flujo asíncrono #3 — Notificaciones y actualizaciones realtime

## Descripción

El envío de correos y notificaciones no debe bloquear procesos críticos del sistema.

Realtime Gateway propaga actualizaciones operacionales mediante WebSockets hacia clientes conectados, permitiendo sincronización en tiempo real sin acoplar directamente los módulos funcionales.

---

## Componentes involucrados

- Notification Service
- SMTP Service
- Realtime Gateway
- Order Service

---

## Patrones aplicables

| Patrón | Aplicación |
|---|---|
| Outbox Pattern | Garantizar envío consistente |
| CQRS | Consultas optimizadas de historial |
| Saga Pattern | Coordinación de estados críticos |

---

## Flujo

```text
Pedido confirmado
↓
Order Service publica NOTIFICATION_REQUESTED
↓
Event Bus propaga evento
↓
Notification Service consume evento
↓
SMTP envía correo
↓
Realtime Gateway publica actualización
↓
Sistema registra entrega
```

### Evento candidato

```text
NOTIFICATION_REQUESTED
```

### Beneficios

- desacoplamiento SMTP
- menor latencia operacional
- mayor resiliencia
- reintentos controlados
- sincronización realtime

---

# 3.6 Relación con Clean Architecture

Los flujos asíncronos respetan la Dependency Rule:

- los eventos son publicados mediante abstracciones desacopladas
- el dominio no depende directamente del broker de eventos
- los eventos son abstraídos mediante puertos
- los adaptadores implementan mecanismos de mensajería
- la infraestructura permanece desacoplada del dominio

---

# 3.7 Riesgos arquitectónicos

| Riesgo | Mitigación |
|---|---|
| Duplicación de eventos | Consumo idempotente |
| Eventos perdidos | Outbox Pattern |
| Inconsistencia temporal | Compensaciones Saga |
| Latencia de procesamiento | Reintentos controlados y colas de eventos |

---

# 3.8 Próximos pasos

- evaluar mecanismo de propagación de eventos compatible con despliegue incremental
- elaborar ADR Event-Driven
- diseñar contratos de eventos
- definir compensaciones operacionales
- diseñar estrategia CQRS detallada

