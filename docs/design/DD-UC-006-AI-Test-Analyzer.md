# DD-UC-006 - AI Test Analyzer

## 1. Información General

| Campo | Valor |
| ----------- | ----------------------------------- |
| ID | DD-UC-006 |
| Caso de Uso | FSD-UC-006 |
| Nombre | AI Test Analyzer |
| Sistema | UMSS Market |
| Versión | 1.0 |
| Fecha | 06/07/2026 |
| Estado | Diseño |
| Autores | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |

---

## 2. Objetivo

Automatizar el análisis inteligente de los resultados de ejecución de pruebas End-to-End mediante Inteligencia Artificial.

El componente procesa los resultados generados por Playwright, identifica errores, clasifica su severidad, genera recomendaciones técnicas y produce reportes ejecutivos en múltiples formatos para facilitar la toma de decisiones durante el proceso de aseguramiento de calidad.

---

## 3. Arquitectura

Se implementa utilizando Arquitectura Hexagonal (Ports & Adapters) con las siguientes capas:

```text
presentation  → AnalysisController
application   → AnalyzeResultsUseCase
domain        → TestResult, Failure, Recommendation
infrastructure→ AIService, ResultAnalyzer
reporting     → HtmlReporter, MarkdownReporter, ConsoleReporter
```

### Componentes

| Componente | Capa | Responsabilidad |
| ---------------------------- | ---------------- | ------------------------------------------------ |
| AnalysisController | Presentation | Inicia el análisis de resultados |
| AnalyzeResultsUseCase | Application | Coordina el análisis completo |
| TestResult | Domain | Resultado de ejecución |
| Failure | Domain | Representa una prueba fallida |
| Recommendation | Domain | Recomendación generada |
| ResultAnalyzer | Infrastructure | Procesa resultados JSON |
| AIService | Infrastructure | Comunicación con IA |
| HtmlReporter | Infrastructure | Genera reporte HTML |
| MarkdownReporter | Infrastructure | Genera reporte Markdown |
| ConsoleReporter | Infrastructure | Genera salida por consola |

---

## 4. Flujo General

### 4.1 Lectura de resultados (T-019)

1. Finaliza la ejecución de Playwright.
2. Se carga el archivo JSON.
3. Se validan los datos.

---

### 4.2 Clasificación de errores (T-020)

1. ResultAnalyzer identifica pruebas fallidas.
2. Se calcula la severidad.
3. AIService genera recomendaciones.

---

### 4.3 Generación de reportes (T-021)

1. Se construye el resumen ejecutivo.
2. HtmlReporter genera el reporte HTML.
3. MarkdownReporter genera el reporte Markdown.
4. ConsoleReporter muestra el resumen.

---

## 5. Entidades de Dominio

### TestResult

| Campo | Tipo | Descripción |
| -------- | -------- | ----------------------------- |
| total | Integer | Total de pruebas |
| passed | Integer | Pruebas exitosas |
| failed | Integer | Pruebas fallidas |
| skipped | Integer | Pruebas omitidas |
| duration | Long | Tiempo total |

---

### Failure

| Campo | Tipo | Descripción |
| -------- | -------- | ----------------------------- |
| title | String | Nombre del caso |
| severity | String | Critical, High, Medium, Low |
| message | String | Mensaje del error |
| file | String | Archivo relacionado |

---

### Recommendation

| Campo | Tipo | Descripción |
| -------- | -------- | ----------------------------- |
| priority | String | Prioridad |
| suggestion | String | Acción recomendada |
| estimatedImpact | String | Impacto esperado |

---

## 6. Reglas de Negocio

| ID | Regla |
| ----- | ------------------------------------------------ |
| RN-001 | Todo análisis requiere un archivo JSON válido. |
| RN-002 | Solo se analizan pruebas ejecutadas. |
| RN-003 | La severidad utiliza los niveles Critical, High, Medium y Low. |
| RN-004 | Todo análisis genera reportes HTML y Markdown. |
| RN-005 | El resumen ejecutivo siempre debe generarse. |
| RN-006 | Ninguna recomendación reemplaza la validación del QA Engineer. |

---

## 7. API REST

### 7.1 Analizar resultados

```http
POST /api/testing/analyze
```

#### Request

```json
{
  "file":"playwright-results.json"
}
```

#### Response

```json
{
  "status":"completed",
  "passed":18,
  "failed":2,
  "severity":"HIGH"
}
```

---

### 7.2 Obtener reporte

```http
GET /api/testing/report
```

#### Response

```json
{
  "html":"report.html",
  "markdown":"ai-report.md"
}
```

---

## 8. Modelo Relacional

No incorpora nuevas tablas.

Los resultados son procesados directamente desde archivos JSON generados durante la ejecución de pruebas.

---

## 9. Persistencia

Artefactos generados:

```text
reports/

playwright-results.json

report.html

ai-report.md
```

Los archivos son generados automáticamente al finalizar el análisis.

---

## 10. Consideraciones Técnicas

- Arquitectura Hexagonal.
- Node.js.
- Playwright JSON Reporter.
- HTML Reporter.
- Markdown Reporter.
- AIService desacoplado del proveedor IA.
- Compatibilidad con Mock AI y OpenAI.
- Cobertura mínima de pruebas: 90%.

---

## 11. Trazabilidad

| Artefacto | Relación |
| ---------------- | --------------------------------------- |
| BRD v5 | Plataforma AI Testing |
| PRD v4 | Análisis Inteligente |
| FSD-UC-006 | AI Test Analyzer |
| ADR-0006 | Decisión arquitectónica |
| T-019 | Leer resultados |
| T-020 | Clasificar errores |
| T-021 | Generar reportes |
| PR-AI-ANALYZER-001 | Prompt AI Analyzer |
| ResultAnalyzer.js | Implementación |
| HtmlReporter.js | Reporte HTML |
| MarkdownReporter.js | Reporte Markdown |
| ConsoleReporter.js | Reporte Consola |

---

## 12. Registro de Cambios

| Versión | Fecha | Cambio |
| ------- | ---------- | ------------------ |
| 1.0 | 06/07/2026 | Diseño inicial del AI Test Analyzer |