# POC-02 — Validación del Flujo UX de Pago QR (Frontend)

> **Archivo de evidencia** del Proof of Concept 02 del proyecto UMSS Market.  
> Código fuente: [`../../poc/umss_ecommerce.html`](../../poc/umss_ecommerce.html)

---

## Metadatos

| Campo | Valor |
|---|---|
| ID | POC-02 |
| Tipo | HTML/JS — Flujo UX QR (sin backend) |
| Estado | ✅ Completado |
| Fecha de ejecución | 11/05/2026 |
| Ejecutado por | Vargas Sandoval Christian Bernardo |
| Referenciado en | `docs/DTI.md` §12 |
| Código fuente | `poc/umss_ecommerce.html` |

---

## Objetivo

Validar que el **flujo de experiencia de usuario (UX) del pago con QR bancario** es viable y comprensible para el usuario final antes de implementar el backend completo. En particular:

1. La presentación del código QR con countdown de 5 minutos es visible y comprensible.
2. El flujo de estados de la compra (carrito → QR → confirmación / expiración) es intuitivo.
3. El diseño mobile-first (PWA) es adecuado para el contexto universitario.
4. La retroalimentación en tiempo real del estado del pago (simulada) reduce la ansiedad del usuario.

---

## Hipótesis a validar

> "Un usuario universitario sin experiencia en pagos QR puede completar el flujo de compra en UMSS Market en menos de 60 segundos, guiado únicamente por la interfaz."

---

## Alcance del POC

| Funcionalidad | Incluida | Observación |
|---|---|---|
| Vista de catálogo de productos | ✅ | Datos simulados en JS |
| Carrito de compras básico | ✅ | Estado local en memoria |
| Generación de QR (simulado) | ✅ | QR estático como placeholder |
| Countdown de 5 minutos (300s) | ✅ | Countdown visual con JS |
| Pantalla de confirmación exitosa | ✅ | Simulada al "escanear" |
| Pantalla de QR expirado | ✅ | Automática al llegar a 0s |
| Backend / API real | ❌ | Todo simulado en frontend |
| WebSocket real | ❌ | Simulado con setTimeout |
| Autenticación | ❌ | Fuera del alcance |
| Diseño responsivo mobile | ✅ | CSS mobile-first |

---

## Capturas de estados (descripción)

| Estado | Descripción |
|---|---|
| `CATÁLOGO` | Lista de productos con precio, stock y botón "Agregar al carrito" |
| `CARRITO` | Resumen del pedido con total calculado y botón "Pagar con QR" |
| `QR_ACTIVO` | Código QR visible con countdown (5:00 → 0:00), instrucciones de escaneo |
| `CONFIRMADO` | Pantalla verde "¡Pedido confirmado!" con número de pedido |
| `EXPIRADO` | Pantalla naranja "QR vencido — pedido cancelado" con opción de reintentar |

---

## Resultado de la evaluación UX

El POC fue evaluado con 5 usuarios universitarios (no técnicos) en sesión de prueba de usabilidad informal:

| Métrica | Resultado | Objetivo |
|---|---|---|
| Tiempo promedio de compra (desde catálogo hasta QR escaneado) | 38 segundos | < 60 segundos |
| Usuarios que completaron sin asistencia | 4/5 (80%) | ≥ 4/5 |
| Usuarios que entendieron el countdown | 5/5 (100%) | 5/5 |
| Usuarios que retomaron tras QR expirado | 5/5 (100%) | 5/5 |
| Satisfacción general (1-5) | 4.2 | ≥ 4.0 |

---

## Lecciones aprendidas

| # | Lección | Impacto en arquitectura |
|---|---|---|
| L1 | El countdown debe ser prominente (> 48px) para que el usuario sienta urgencia adecuada sin ansiedad excesiva | Definido en FSD §UI: countdown visual con color cambiante |
| L2 | La pantalla de "QR expirado" debe ofrecer reintentar con un clic (no obligar a reiniciar el flujo) | Flujo de compensación incluido en `diagrams/saga-state.mmd` |
| L3 | Los usuarios esperan confirmación instantánea tras escanear (< 3 segundos) | Motivó el uso de WebSocket (realtime-gateway) para ORDER_CONFIRMED |
| L4 | El flujo mobile-first requiere mínimo 2 pasos para confirmar una compra (carrito + QR) | Validó la arquitectura React PWA + Zustand (estado mínimo) |
| L5 | La información del QR (monto + tienda) reduce dudas del usuario antes de escanear | QR payload debe incluir descripción y monto en la API Bancaria |

---

## Criterios de éxito — Resultado

| Criterio | Resultado |
|---|---|
| Flujo de compra completable sin documentación | ✅ |
| Countdown de 300s visible y comprensible | ✅ |
| Feedback inmediato de confirmación/expiración | ✅ |
| Diseño usable en pantalla móvil (320px) | ✅ |
| Tiempo promedio < 60 segundos | ✅ (38s) |

**Veredicto: POC-02 SUPERADO — Hipótesis validada.**
