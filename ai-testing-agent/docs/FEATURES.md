# FEATURES – UMSS Market

---

# Información General

| Campo | Valor |
|--------|--------|
| Documento | FEATURES.md |
| Proyecto | UMSS Market |
| Versión | 1.0 |
| Fecha | 06/07/2026 |
| Estado | Activo |

---

# 1. Objetivo

Este documento consolida todas las funcionalidades implementadas dentro del proyecto UMSS Market, manteniendo trazabilidad entre los requerimientos de negocio, especificaciones funcionales, decisiones arquitectónicas y componentes implementados.

---

# 2. Clasificación de Features

Las funcionalidades del proyecto se clasifican en:

- Features de Negocio
- Features de Plataforma
- Features de AI Testing

---

# 3. Catálogo de Features

| ID | Feature | Tipo | Estado | Prioridad |
|----|---------|------|---------|-----------|
| FT-001 | Registro y Validación de Emprendedor | Negocio | Implementado | Alta |
| FT-002 | Publicación de Productos | Negocio | Implementado | Alta |
| FT-003 | Compra con Pago QR | Negocio | Implementado | Crítica |
| FT-004 | MCP Postman Agent | AI Testing | Implementado | Alta |
| FT-005 | AI Playwright Testing Agent | AI Testing | Implementado | Alta |
| FT-006 | AI Test Analyzer | AI Testing | Implementado | Alta |

---

# 4. Descripción de Features

## FT-001 – Registro y Validación de Emprendedor

### Objetivo

Permitir el registro de nuevos emprendedores validando la información académica mediante SIIS.

### Componentes

- Registro
- Validación RU
- Perfil

### Documentación

- BRD
- PRD
- FSD UC-003

---

## FT-002 – Publicación de Productos

### Objetivo

Permitir a un emprendedor administrar su catálogo de productos y controlar inventario.

### Componentes

- Productos
- Categorías
- Stock

### Documentación

- BRD
- PRD
- FSD UC-002

---

## FT-003 – Compra con Pago QR

### Objetivo

Gestionar el proceso completo de compra utilizando QR interoperable.

### Componentes

- Pedido
- Pago
- Confirmación
- Stock

### Documentación

- BRD
- PRD
- FSD UC-001

---

## FT-004 – MCP Postman Agent

### Objetivo

Automatizar la ejecución de pruebas API mediante integración con Postman utilizando Model Context Protocol.

### Componentes

- Postman Agent
- Workspace Discovery
- Collection Discovery
- Newman Runner

### Archivos

- postman.agent.js
- getWorkspacesSkill.js
- getCollectionsSkill.js
- runCollectionSkill.js

### Documentación

- BRD v5
- PRD v4
- FSD UC-004
- ADR-0004
- DD-UC-004

---

## FT-005 – AI Playwright Testing Agent

### Objetivo

Generar automáticamente pruebas End-to-End utilizando Inteligencia Artificial.

### Componentes

- Prompt Builder
- AI Service
- Playwright Generator
- Spec Writer
- Playwright Runner

### Archivos

- AIService.js
- MockAIService.js
- OpenAIService.js
- PlaywrightGenerator.js
- SpecWriter.js
- PlaywrightRunner.js

### Documentación

- BRD v5
- PRD v4
- FSD UC-005
- ADR-0005
- DD-UC-005

---

## FT-006 – AI Test Analyzer

### Objetivo

Procesar automáticamente los resultados de Playwright, clasificar errores y generar reportes inteligentes.

### Componentes

- Result Analyzer
- HTML Reporter
- Markdown Reporter
- Console Reporter

### Archivos

- ResultAnalyzer.js
- RunnerResult.js
- HtmlReporter.js
- MarkdownReporter.js
- ConsoleReporter.js

### Documentación

- BRD v5
- PRD v4
- FSD UC-006
- ADR-0006
- DD-UC-006

---

# 5. Dependencias entre Features

```text
FT-001

FT-002

FT-003

      │

      ▼

FT-004

      │

      ▼

FT-005

      │

      ▼

FT-006
```

Las Features FT-004, FT-005 y FT-006 conforman la plataforma AI Testing y trabajan de manera integrada.

---

# 6. Trazabilidad

| Feature | BRD | PRD | FSD | ADR | DD | Evidencia |
|----------|-----|-----|-----|-----|----|-----------|
| FT-001 | ✓ | ✓ | UC-003 | — | — | — |
| FT-002 | ✓ | ✓ | UC-002 | — | — | — |
| FT-003 | ✓ | ✓ | UC-001 | ADR-0001 / ADR-0002 | — | — |
| FT-004 | ✓ | ✓ | UC-004 | ADR-0004 | DD-UC-004 | Sí |
| FT-005 | ✓ | ✓ | UC-005 | ADR-0005 | DD-UC-005 | Sí |
| FT-006 | ✓ | ✓ | UC-006 | ADR-0006 | DD-UC-006 | Sí |

---

# 7. Roadmap

## Versión 1

- Registro
- Productos
- Compra QR

## Versión 2

- Arquitectura Event Driven
- Arquitectura Hexagonal

## Versión 3

- MCP Postman Agent
- AI Playwright Testing Agent
- AI Test Analyzer

---

# 8. Conclusiones

La incorporación de las Features FT-004, FT-005 y FT-006 amplía las capacidades del proyecto UMSS Market mediante una plataforma de AI Testing que automatiza la generación, ejecución y análisis de pruebas de software. Estas funcionalidades complementan las capacidades de negocio existentes y fortalecen el proceso de aseguramiento de calidad dentro del enfoque AI-SDLC.