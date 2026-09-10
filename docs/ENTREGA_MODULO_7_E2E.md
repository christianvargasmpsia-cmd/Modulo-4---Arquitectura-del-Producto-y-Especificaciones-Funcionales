# Módulo 7 — Un test E2E de UMSS Market

**Equipo:** G1 — UMSS Market.  
**Integrantes:** Rodriguez Gonzales Abad Melani y Vargas Sandoval Christian Bernardo.  
**Fecha:** 9 de septiembre de 2026.

## 1. Flujo elegido

Una persona agrega dos Poleras UMSS al carrito, paga el monto simulado exacto de Bs 100 y ve un único pedido CONFIRMADO con esos productos y ese total, con el carrito vacío.

Se utiliza la interfaz existente de [POC-02](../poc/umss_ecommerce.html). El alcance es el recorrido completo de compra del prototipo en el navegador; sus datos están en memoria y su pago es simulado. No acredita integración con backend, banco, SIIS, HMAC, TTL de QR o servicios distribuidos.

## 2. Archivo y autoría

- Test: [compra-poc.spec.ts](../tests/e2e/compra-poc.spec.ts).
- Configuración: [playwright.config.ts](../tests/e2e/playwright.config.ts).
- Servidor local y cierre automático: [poc-server.cjs](../tests/e2e/poc-server.cjs).
- Autor: agente Codex, a solicitud del equipo; escrito directamente, sin grabador.

Se reutiliza la dependencia Playwright instalada en el repositorio. Esta configuración selecciona únicamente el test de compra y no ejecuta el generador IA ni su ejemplo contra playwright.dev.

## 3. Preparación de la interfaz

Cambios en `poc/umss_ecommerce.html`:

| Elemento | Ancla o etiqueta agregada | Propósito |
|---|---|---|
| Contenido del carrito | `data-testid="carrito"` | Verificar contenido y vaciado |
| Total del carrito | `data-testid="total-carrito"` | Comprobar monto antes de pagar |
| Pedidos del cliente | `data-testid="pedidos-cliente"` | Acotar las comprobaciones al resultado de la compra |
| Tarjeta de producto | `role="group"` y `aria-label` con nombre del producto | Elegir Polera UMSS sin depender de su posición |
| Campo de cantidad | `aria-label="Cantidad de ${prod.nombre}"` | Completar la cantidad por nombre accesible |
| Etiqueta del monto | `for="montoPago"` | Asociar la etiqueta visible con el campo |

Los botones Agregar y Pagar ya son botones HTML y se localizan por rol y nombre. No se modificó la lógica de compra.

## 4. Auditoría de las cinco preguntas

| Pregunta | Resultado y evidencia |
|---|---|
| ¿Localizadores de persona? | Sí: `getByRole`, `getByLabel`, `getByText` y los tres `getByTestId`. Sin selectores CSS, XPath, posiciones o clases visuales. |
| ¿Sin espera fija? | Sí: acciones con espera automática y aserciones `await expect`. No hay `waitForTimeout` ni pausas manuales en el test. |
| ¿Verifica lo que promete la interfaz? | Sí: un pedido visible, dos poleras, Bs 100, estado CONFIRMADO y carrito vacío. No basta un título de página o una alerta transitoria. |
| ¿Pequeño e independiente, empieza en `page.goto`? | Sí: un solo `test`, primera acción `page.goto`, contexto de navegador nuevo y sin dependencia de otros tests. |
| ¿Datos propios del test? | Sí: el POC inicializa su catálogo en memoria en cada carga. El test elige cantidad 2 y monto 100, crea su carrito, pedido y pago por la UI. Comprueba que empieza sin pedidos y con carrito vacío. No necesita datos dejados por una persona, base de datos o sesión previa. |

### Correcciones y revisión del trabajo del agente

El ejemplo previo generado por `MockAI.service.js` visitaba playwright.dev y comprobaba su título: fallaba la pregunta 3 para este flujo porque no verificaba una compra de UMSS Market. Se creó un test específico del producto.

Antes de ejecutar se corrigieron carencias de localización de la interfaz (pregunta 1): faltaba asociación del label de pago, nombre accesible para cantidad y anclas para acotar carrito y pedidos. Las cinco preguntas pasan en la versión entregada; no se afirma que hubiera otros fallos de auditoría observados.

Durante la ejecución también se resolvieron problemas del entorno: PowerShell bloquea `npx.ps1`, por lo que se utiliza `npx.cmd`; faltaba el Chromium descargado por Playwright y se seleccionó Edge instalado; el cierre del servidor como subproceso quedaba pendiente y se sustituyó por un servidor administrado desde `globalSetup` con cierre explícito. La ejecución final terminó con código 0.

Los localizadores toleran cambios de color, tipografía, espaciado y clases CSS mientras se conserve el contrato accesible y las anclas. Un cambio funcional o de nombres accesibles puede requerir actualizar el test; no se promete resistencia a cualquier modificación.

## 5. Ejecución y evidencia

Requisitos: Node.js, dependencias del repositorio instaladas y Microsoft Edge disponible. El puerto local 4173 debe estar libre. El servidor sirve únicamente la página del POC en `127.0.0.1` y se inicia y cierra automáticamente.

Desde la raíz del repositorio, en PowerShell:

```powershell
npx.cmd playwright test --config tests/e2e/playwright.config.ts --headed
```

`--headed` permite ver el recorrido en el navegador. Para ejecución sin ventana se puede omitir. En una terminal que no bloquee el script de npm, `npx playwright test --config tests/e2e/playwright.config.ts` es equivalente para ejecutar la prueba.

Resultado real de la ejecución final con Edge visible:

```text
Running 1 test using 1 worker
  ok 1 tests\e2e\compra-poc.spec.ts:3:5 › cliente compra dos poleras y ve su pedido confirmado por Bs 100 (2.0s)

  1 passed (4.6s)
```

La salida anterior omite únicamente el aviso de Node sobre precedencia de `FORCE_COLOR` frente a `NO_COLOR`. Código de salida: **0**.

- [Reporte HTML de esa corrida](evidencias/modulo-7/reporte/index.html).
- [Traza de esa corrida](evidencias/modulo-7/resultados/compra-poc-cliente-compra--77999-edido-confirmado-por-Bs-100/trace.zip).

Abrir el reporte:

```powershell
npx.cmd playwright show-report docs/evidencias/modulo-7/reporte
```

Abrir la traza:

```powershell
npx.cmd playwright show-trace docs/evidencias/modulo-7/resultados/compra-poc-cliente-compra--77999-edido-confirmado-por-Bs-100/trace.zip
```

Entregar este documento, los archivos de `tests/e2e`, el POC actualizado y la carpeta completa `docs/evidencias/modulo-7`. Una nueva corrida actualiza el reporte y los resultados; conservar esta carpeta aparte si se desea mantener esta evidencia histórica.

Referencias técnicas: [buenas prácticas de Playwright](https://playwright.dev/docs/best-practices) y [Trace Viewer](https://playwright.dev/docs/trace-viewer-intro).
