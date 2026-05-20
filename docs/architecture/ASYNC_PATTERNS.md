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
| Saga Pattern | Coordinar transacciones distribuidas |
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
Cliente → Generar QR
↓
Banco procesa pago
↓
Webhook confirma pago
↓
Order Service actualiza pedido
↓
Notification Service envía correo

Evento candidato
PaymentConfirmed
Beneficios
consistencia eventual
desacoplamiento
resiliencia ante fallos
recuperación automática
3.4 Flujo asíncrono #2 — Creación de pedido e inventario
Descripción

Al crear un pedido, el sistema debe validar stock y actualizar inventario sin bloquear toda la operación.

Componentes involucrados
Order Service
Inventory Service
Product Service
Patrones aplicables
Patrón	Aplicación
Saga Pattern	Coordinación pedido-stock
Outbox Pattern	Publicación evento OrderCreated
CQRS	Consultas optimizadas catálogo
Flujo
Cliente crea pedido
↓
Order Service genera pedido
↓
Inventory Service reserva stock
↓
Sistema confirma disponibilidad
↓
Pedido queda aprobado
Evento candidato
OrderCreated
Beneficios
reducción bloqueo transaccional
mejor escalabilidad
desacoplamiento inventario
tolerancia a fallos
3.5 Flujo asíncrono #3 — Notificaciones y correos
Descripción

El envío de correos y notificaciones no debe bloquear procesos críticos del sistema.

Componentes involucrados
Notification Service
SMTP Service
Reservation Service
Order Service
Patrones aplicables
Patrón	Aplicación
Outbox Pattern	Garantizar envío consistente
CQRS	Consultas optimizadas historial
Saga Pattern	Coordinación estados críticos
Flujo
Pedido confirmado
↓
Evento NotificationRequested
↓
Notification Service consume evento
↓
SMTP envía correo
↓
Sistema registra entrega
Evento candidato
NotificationRequested
Beneficios
desacoplamiento SMTP
menor latencia
mayor resiliencia
retry automático
3.6 Relación con Clean Architecture

Los flujos asíncronos respetan la Dependency Rule:

el dominio no depende del broker
eventos son abstraídos mediante puertos
adaptadores implementan mensajería
infraestructura permanece desacoplada
3.7 Riesgos arquitectónicos
Riesgo	Mitigación
Duplicación eventos	Idempotencia
Eventos perdidos	Outbox Pattern
Inconsistencia temporal	Saga compensation
Latencia procesamiento	Retry + Queue
3.8 Próximos pasos
Definir broker de eventos
Elaborar ADR Event-Driven
Diseñar Event Contracts
Definir compensating transactions
Diseñar arquitectura CQRS detallada
