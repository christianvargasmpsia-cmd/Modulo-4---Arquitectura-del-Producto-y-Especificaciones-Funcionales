# Product Requirements Document (PRD) — UMSS Market

---

## 0. Metadatos

| Campo | Valor |
| :--- | :--- |
| Producto | **UMSS Market** |
| Versión | v1.0 |
| Fecha | 11/05/2026 |
| PM / Autor | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Final para Desarrollo |
| BRD Ref | v2.0 |
| MRD Ref | v1.0 |
| Insumos M2 (UI/UX) | `informe_heuristica_ecommerce.docx`, `entrevistas_usuarios.docx` |

---

## 1. Resumen Ejecutivo

UMSS Market es una plataforma de comercio electrónico diseñada para formalizar y asegurar las transacciones dentro de la comunidad universitaria. El producto se enfoca en eliminar la incertidumbre del pago y la entrega mediante un flujo automatizado de QR dinámico y control estricto de inventario. Basado en pruebas de usabilidad, el PRD prioriza el feedback constante al usuario y la prevención de errores en el proceso de pago, reduciendo el tiempo de transacción de los actuales 3:40 min a menos de 60 segundos.

---

## 2. Objetivos del Producto

* **North Star:** Tasa de pedidos pagados y entregados exitosamente (Meta: 95%).
* **KPI Calidad:** 0% de pedidos confirmados sin stock físico real (Consistencia atómica).
* **KPI UX:** Puntaje de usabilidad (SUS) superior a 80 puntos tras implementar mejoras de feedback.

---

## 3. User Personas

1.  **Emprendedor (Vale):** Necesita una herramienta que "venda por ella" mientras está en clases, gestionando el stock automáticamente.
2.  **Comprador Estudiante:** Busca comprar comida o materiales rápido entre periodos. Su mayor temor es perder su dinero en un QR que no se valida.

---

## 4. Historias de Usuario (Priorizadas)

| ID | Historia de Usuario | Prioridad |
| :--- | :--- | :--- |
| **US-01** | Como comprador, quiero pagar con QR dinámico y recibir confirmación inmediata para sentir seguridad en mi dinero. | P0 (Must) |
| **US-02** | Como vendedora, quiero que el sistema bloquee ventas si no hay stock para no quedar mal con mis clientes. | P0 (Must) |
| **US-03** | Como usuario, quiero ver un indicador de progreso en el pago para saber en qué paso de la compra estoy. | P1 (Should) |
| **US-04** | Como vendedora, quiero elegir puntos de encuentro predefinidos para evitar el caos de coordinar horarios por chat. | P1 (Should) |

---

## 5. Requerimientos Funcionales

### 5.1 Gestión de Pedidos y Pagos
* **RF-01 (QR Dinámico):** El sistema debe generar un QR único por pedido con el monto exacto. No se permite edición manual del monto.
* **RF-02 (Feedback H1):** Durante la validación del pago, el sistema debe mostrar un estado de "Procesando" con un loader visual.
* **RF-03 (Consistencia):** El descuento de stock debe ocurrir únicamente tras la confirmación exitosa del banco (vía Webhook).

### 5.2 Experiencia de Usuario (Basado en M2)
* **RF-04 (Navegación H3):** El flujo de compra debe permitir "Volver" en cualquier etapa previa al pago final.
* **RF-05 (Validación H5):** El formulario de Login y Registro debe validar campos en tiempo real (ej: formato de correo institucional).
* **RF-06 (Visibilidad H4):** Botones de acción principal (Pagar, Agregar) deben tener un contraste mínimo de 4.5:1.

---

## 6. Especificaciones de Casos de Uso

### UC-01: Proceso de Compra "Blindada"
1.  **Actor:** Cliente.
2.  **Flujo:** Carrito -> Generar Pedido (Estado: Pendiente) -> Mostrar QR -> Recibir Notificación Bancaria -> Validar Stock -> Confirmar Pedido (Estado: Pagado) -> Notificar Vendedor.
3.  **Excepción:** Si el banco confirma pero el stock se agotó en ese instante (race condition), el sistema debe disparar un reembolso automático y notificar al usuario.

### UC-02: Publicación de Producto
1.  **Actor:** Emprendedor.
2.  **Flujo:** Dashboard -> Cargar Imágenes/Precio -> Definir Stock -> Seleccionar Puntos de Entrega -> Publicar.
3.  **Restricción:** El stock inicial no puede ser inferior a 1.

---

## 7. Requerimientos No Funcionales (NFR)

* **Disponibilidad:** 99.5% durante periodos académicos.
* **Tiempo de Respuesta:** La validación del pago no debe exceder los 3 segundos tras recibir el webhook bancario.
* **Seguridad:** Autenticación obligatoria mediante Registro Universitario (RU).

---

## 8. Reglas de Negocio (RB)

* **RB-01:** Todo pedido requiere un pago verificado para existir en el dashboard del vendedor.
* **RB-02:** Los puntos de encuentro son fijos y seleccionables, no negociables por texto libre (para evitar caos logístico).
* **RB-03:** Un QR caduca a los 5 minutos si no es pagado, liberando el "bloqueo temporal" de stock.

---

## 9. Métricas de Éxito del Producto

* **Tasa de Conversión:** % de usuarios que inician el carrito y completan el pago.
* **Reducción de Tiempo:** Bajar de 3.6 min a < 1 min el flujo completo de compra.
* **Tasa de Retorno:** % de compradores que realizan una segunda compra en el mes.

---

## 10. Riesgos del Producto

| Riesgo | Impacto | Mitigación |
| :--- | :--- | :--- |
| Latencia en API Bancaria | Alto | Implementar comunicación asíncrona y notificaciones push al confirmar. |
| Errores de usuario en Login | Medio | Validaciones *inline* y mensajes de error claros (UX M2). |

---

## 11. Trazabilidad

| PRD ID | BRD ID | MRD ID | FSD Ref |
| :--- | :--- | :--- | :--- |
| PRD-PAY-01 | BR-002 | MRD-N-02 | FSD-PAYMENT |
| PRD-STK-01 | BR-003 | MRD-N-03 | FSD-INVENTORY |
| PRD-UX-01 | BR-004 | MRD-N-04 | FSD-UI-FLOW |

---

## 12. Registro de Cambios

| Versión | Fecha | Autor | Cambio |
| :--- | :--- | :--- | :--- |
| v1.0 | 11/05/2026 | Rodriguez / Vargas | Versión inicial con casos de uso técnicos y mejoras de UX. |