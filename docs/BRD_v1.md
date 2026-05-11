##### **0. Metadatos**



|**Campo**|**Valor**|
|-|-|
|**Producto**|UMSS Market|
|**Grupo**||
|**Versión**|v0.1|
|**Fecha**|30/04/2026|
|**Sponsor de negocio**|DTIC UMSS|
|**Stakeholders**|Emprendedores universitarios, DTIC UMSS, CUB/FUL|
|**Autores**|Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo|
|**Revisores**|Docente|
|**Estado**|Borrador|



##### **1. Resumen ejecutivo**

**Problema:** El comercio en la UMSS es informal y fragmentado; el 70% de las ventas se pierden o se gestionan ineficientemente por WhatsApp, generando desconfianza en los pagos y errores críticos de stock que dañan la reputación de los emprendedores.



**Propuesta:** Construiremos un Marketplace Multi-tenant exclusivo para la comunidad UMSS, que centraliza la oferta y automatiza la validación de pagos mediante QR Dinámico sincronizado con el inventario.



**Valor esperado:** Reducción del 100% en la validación manual de comprobantes, disminución del tiempo de compra en un 60% y eliminación total de ventas sin stock real.



**Métricas clave de éxito:** Tasa de éxito de pagos (Meta: >98%) y Reducción del tiempo de procesamiento de pedidos (Meta: <2 min).



**Llamada a la acción:** Se requiere aprobación de la integración con el sistema de identidad universitaria (SIIS) y presupuesto para infraestructura de servidores.



##### **2. Contexto del negocio**

**Organización:** Universidad Mayor de San Simón (UMSS).



**Unidad impactada:** Emprendimientos estudiantiles y departamentos de tesorería/bienestar.



**Procesos de negocio afectados:** Venta minorista, gestión de inventarios, validación de transferencias bancarias y logística de entrega en campus.



**Estrategia:** Digitalización institucional y apoyo al emprendimiento joven como parte del plan de desarrollo universitario 2026.



##### **3. Problema y oportunidad de negocio**

###### **3.1 Problema**

Actualmente, los emprendedores de la UMSS gestionan pedidos manualmente. Esto causa:



**Falta de Trazabilidad:** No hay registro histórico de ventas.



**Inseguridad en el Pago:** El vendedor debe revisar su extracto bancario cada vez que recibe un comprobante (muchas veces falso).



**Quiebre de Stock:** Se venden productos que ya no existen, generando devoluciones y molestias.



**Barrera de Descubrimiento:** El estudiante no sabe qué se vende en otras facultades.

Evidencia: Según entrevistas, completar una compra toma más de 3:40 min por la falta de feedback y la confusión en el flujo de pago.



###### **3.2 Oportunidad**

**Valor económico:** Captura de comisiones mínimas o cuotas de suscripción que pueden reinvertirse en becas.



**Valor estratégico:** Creación de un ecosistema económico formal dentro de la universidad.



**Ventana:** Alto crecimiento de pagos digitales en Bolivia (QR) no aprovechado por el sector informal universitario.



##### **4. Usuarios objetivo / Personas clave**

###### **4.1 Persona principal: El Emprendedor Estudiante**

|**Atributo**|**Valor**|
|-|-|
|**Nombre / rol**|Estudiante Emprendedor (Ej. "Vale" de repostería)|
|**Contexto**|Vende entre clases; tiene poco tiempo para responder mensajes.|
|**JTBD**|Registrar productos, validar pagos rápido, ver cuánto ganó al día.|
|**Dolores**|Perder mensajes en WhatsApp, que le envíen QRs falsos, quedarse sin stock.|
|**Ganancia**|Ordenar su negocio y vender más sin estar pegada al celular.|



###### **4.2 Persona secundaria: El Estudiante Comprador**

|Atributo|Valor|
|-|-|
|**Nombre / rol**|Estudiante de pregrado (Comprador)|
|**Contexto**|Camina por el campus; necesita comida o materiales de inmediato.|
|**JTBD**|Buscar productos por facultad, pagar con QR, saber dónde recoger.|
|**Dolores**|No saber si el vendedor tiene el producto, esperar mucho para confirmar el pago.|
|**Ganancia**|Comprar en segundos y retirar su producto sin dudas.|



##### **5. Propuesta de valor**

|**Eje**|**Contenido**|
|-|-|
|**Para quién**|Emprendedores y estudiantes de la UMSS.|
|**Que necesita**|Un canal de venta formal y automatizado dentro del campus.|
|**Nuestra propuesta**|Un Marketplace con validación de pagos QR dinámica e inventario real.|
|**Que le aporta**|Seguridad en cobros, control total de stock y visibilidad en toda la universidad.|
|**A diferencia de**|Grupos de WhatsApp, Facebook Marketplace o ventas por "DM".|
|**Nuestro diferencial**|Integración directa con la identidad UMSS y validación automática de pagos sin intervención humana.|



##### **6. Panorama competitivo (resumen)**

|**Competidor / alternativa**|**Tipo**|**Fortaleza**|**Debilidad**|
|-|-|-|-|
|Grupos de WhatsApp|do-nothing|Gratuito y conocido.|Caótico, sin stock ni seguridad.|
|PedidosYa|Directo|Logística robusta.|Comisiones altas, no enfocado en campus.|
|Pagos manuales QR|Directo|Sin efectivo.|Requiere validación manual lenta.|



##### **7. Business Model Canvas**

|**Bloque**|**Elementos**|
|-|-|
|**1. Segmentos de clientes**|Estudiantes emprendedores / Estudiantes compradores / Proveedores de servicios (fotocopias).|
|**2. Propuesta de valor**|Automatización de ventas / Seguridad en pagos / Visibilidad centralizada.|
|**3. Canales**|Aplicación Web móvil / Redes sociales institucionales / QRs físicos en facultades.|
|**4. Relación con clientes**|Autoservicio (Self-service) / Soporte vía chatbot / Comunidad de feedback.|
|**5. Fuentes de ingresos**|Comisión por transacción / Espacios publicitarios destacados / Suscripción para tiendas externas.|
|**6. Recursos clave**|Plataforma de software / Infraestructura de red UMSS / Base de datos de estudiantes.|
|**7. Actividades clave**|Mantenimiento de la plataforma / Validación de nuevos emprendedores / Marketing interno.|
|**8. Socios clave**|Bancos (API QR) / DTIC UMSS / Consejos de Facultad.|
|**9. Estructura de costos**|Desarrollo y mantenimiento / Servidores (Cloud) / Personal de soporte administrativo.|



##### **8. Métricas clave de éxito**

|**ID**|**KPI**|**North Star?**|**Línea base**|
|-|-|-|-|
|KPI-01|Tasa de pedidos pagados vs. entregados|Sí|Desconocida|
|KPI-02|Tiempo medio de confirmación de pago|No|2-5 min (manual)|
|KPI-03|NPS (Satisfacción del cliente)|No|Por medir|



##### **9. Objetivos de negocio (SMART)**

|ID|Objetivo|Métrica|Línea base|
|-|-|-|-|
|BO-01|Digitalizar emprendimientos|# Tiendas activas|0|
|BO-02|Reducir errores de stock|% Pedidos rechazados por stock|\~15% (est.)|



##### **10. Stakeholders y roles (RACI)**

|**Stakeholder**|**Interés**|**R/A/C/I**|
|-|-|-|
|Rectorado / Sponsor|Estratégico|A|
|Equipo de Desarrollo|Ejecución|R|
|Emprendedores|Operativo|C|
|Estudiantes|Usuario Final|I|
|DTIC (Tecnología)|Seguridad/Infra|C|



##### **11. Requerimientos de negocio**

|**ID**|**Requerimiento de negocio**|**Prioridad**|**Justificación**|**Métrica de aceptación**|
|-|-|-|-|-|
|BR-001|Registro validado de emprendedores|Must|Evitar spam y perfiles falsos.|100% de tiendas con RU verificado.|
|BR-002|Generación de QR dinámico único|Must|Elimina el error manual de monto.|El QR debe incluir el monto exacto.|
|BR-003|Sincronización de stock en tiempo real|Must|Prevenir ventas de productos inexistentes.|Stock disminuye al confirmar pago.|
|BR-004|Definición de puntos de encuentro|Must|Logística clara dentro del campus.|Todo pedido debe tener un punto de entrega.|
|BR-005|Panel de métricas para el vendedor|Should|Ayuda a la toma de decisiones.|El vendedor ve sus ventas diarias.|
|BR-006|Notificaciones automáticas de estado|Should|Mejora la experiencia del usuario.|Usuario recibe alerta al cambiar estado.|
|BR-007|Historial de transacciones para Admin|Must|Auditoría y control.|Registro inalterable de pedidos.|
|BR-008|Calificación de tiendas y productos|Could|Fomenta la confianza.|Sistema de estrellas habilitado.|



##### **12. Reglas de negocio y políticas**

|**ID**|**Regla**|**Tipo**|**Origen**|
|-|-|-|-|
|RB-01|Pago previo a la preparación|Política|Garantizar el ingreso al vendedor.|
|RB-02|Coincidencia de monto QR|Restricción|Evitar pagos parciales erróneos.|
|RB-03|Unicidad de transacción|Restricción|Un QR solo puede pagar un pedido.|



##### **13. Supuestos, restricciones y dependencias**

* **Supuestos:** Los estudiantes tienen smartphones con acceso a apps bancarias y datos móviles.
* **Restricciones:** El sistema debe cumplir con la Ley de Servicios Financieros para el manejo de QRs.
* **Dependencias:** Integración necesaria con la API de generación de QRs de un banco local (o agregador) y el sistema de login de la UMSS.



##### **14. Alcance de negocio**

###### **14.1 En alcance**

* Gestión de tiendas, productos, pedidos y pagos QR para la comunidad UMSS (Campus Central).



###### **14.2 Fuera de alcance**

* Logística de delivery fuera del campus universitario (solo puntos de encuentro internos).
* Pagos con tarjeta de crédito en esta fase inicial.



##### **15. Beneficios esperados y business case resumido**

|Tipo|Año 1 (Lanzamiento)|Año 2 (Crecimiento)|Año 3 (Madurez)|
|-|-|-|-|
|Ahorro operativo (Eficiencia en validación)|Bs 1,200|Bs 2,500|Bs 3,800|
|Ingresos adicionales (Comisiones/Publicidad)|Bs 800|Bs 3,200|Bs 5,500|
|Inversión (CAPEX) (Desarrollo inicial)|Bs 5,000|Bs 1,000|Bs 500|
|Costo operación (OPEX) (Servidores/Soporte)|Bs 600|Bs 800|Bs 1,000|
|VAN (Valor Actual Neto)|Bs 2,450 (Est.)|||
|TIR (Tasa Interna de Retorno)|22% (Est.)|||



##### **16. Riesgos de negocio**

|**Riesgo**|**Probabilidad**|**Impacto**|**Mitigación**|
|-|-|-|-|
|Baja adopción inicial|Media|Alta|Alianzas con centros de estudiantes y FUL.|
|QRs falsos o hackeados|Baja|Crítica|Encriptación y validación directa con el banco.|
|Falta de conectividad en facultades|Alta|Media|Habilitar zonas de WiFi gratuito cerca de puntos de entrega.|



##### **17. Criterios de éxito del proyecto de negocio**

Para considerar que el proyecto ha cumplido su propósito comercial, se deben alcanzar los siguientes hitos:



* **Cumplimiento de Objetivos:** Lograr al menos el 85% de los objetivos SMART definidos en la sección 9.
* **Eficiencia en Transacciones:** Que el 90% de los pagos realizados se validen automáticamente sin intervención del administrador.
* **Adopción Crítica:** Contar con al menos 50 emprendedores activos de 3 facultades distintas en los primeros 6 meses.
* **Satisfacción del Sponsor:** Obtener una calificación de satisfacción de la Dirección de Bienestar Estudiantil de ≥ 4/5.
* **Sostenibilidad:** Que el ingreso por comisiones cubra el 100% de los costos de OPEX (servidores) al finalizar el año 1.



##### **18. Trazabilidad a documentos hijos**

|**BRD ID**|**Requerimiento de Negocio**|**MRD (Mercado)**|**PRD (Producto)**|
|-|-|-|-|
|BR-001|Registro validado de emprendedores|MRD-SEG-01|PRD-REQ-01|
|BR-002|Pago con QR dinámico|MRD-TEC-02|PRD-PAY-05|
|BR-003|Sincronización de stock|MRD-OPE-01|PRD-INV-03|
|BR-004|Definición de puntos de encuentro|MRD-LOG-01|PRD-LOG-02|



##### **19. Aprobaciones**

|Rol|Nombre|
|-|-|
|Sponsor (Bienestar Estudiantil)|Ing. Valentin Laime|
|Project Manager|Vargas Sandoval Christian Bernardo|
|Arquitecto de Software|Rodriguez Gonzales Abad Melani|



##### **20. Registro de cambios**

|**Versión**|**Fecha**|**Autor**|**Cambio**|
|-|-|-|-|
|v0.1|27/04/2026|Rodriguez G. / Vargas S.|Creación del documento inicial.|



