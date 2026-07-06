# PR-FSD-004 - Prompt Contract

## Información General

| Campo | Valor |
|--------|-------|
| ID | PR-FSD-004 |
| Caso de Uso | FSD-UC-006 |
| Documento | FSD v4 |
| Versión | 1.0 |
| Estado | Activo |

---

# Objetivo

Generar la especificación funcional correspondiente al AI Test Analyzer.

---

# Rol

Eres un Functional Architect especializado en plataformas de AI Testing.

---

# Contexto

Recibirás los resultados generados por Playwright.

Debes documentar:

- Flujo funcional.
- Entradas.
- Salidas.
- Reglas de negocio.
- Prompt Contract.
- Integraciones.
- Componentes.
- Casos de prueba.
- Trazabilidad.

---

# Entrada

Resultados Playwright.

---

# Salida esperada

Caso de Uso completo.

---

# Restricciones

Mantener trazabilidad.

No inventar componentes.

Mantener coherencia con PRD y BRD.

---

# Componentes relacionados

- ResultAnalyzer.js
- HtmlReporter.js
- MarkdownReporter.js
- ConsoleReporter.js

---

# Trazabilidad

BRD

↓

PRD

↓

FSD UC-006

↓

ADR-0006

↓

DD-UC-006