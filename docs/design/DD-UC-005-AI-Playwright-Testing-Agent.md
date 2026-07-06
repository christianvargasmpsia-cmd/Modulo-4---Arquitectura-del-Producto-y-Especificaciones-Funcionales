# DD-UC-005 - AI Playwright Testing Agent

## 1. Información General

| Campo | Valor |
| ----------- | ----------------------------------- |
| ID | DD-UC-005 |
| Caso de Uso | FSD-UC-005 |
| Nombre | AI Playwright Testing Agent |
| Sistema | UMSS Market |
| Versión | 1.0 |
| Fecha | 06/07/2026 |
| Estado | Diseño |
| Autores | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |

---

## 2. Objetivo

Automatizar la generación de pruebas End-to-End mediante Inteligencia Artificial a partir de las especificaciones funcionales del sistema.

El agente interpreta las Features, construye un Prompt estructurado, consulta el proveedor de IA y genera automáticamente archivos Playwright listos para su ejecución.

---

## 3. Arquitectura

Se implementa utilizando Arquitectura Hexagonal (Ports & Adapters) con las siguientes capas:

```text
presentation  → PlaywrightController
application   → GeneratePlaywrightSpecUseCase
domain        → Feature, Prompt, PlaywrightSpec
infrastructure→ AIService, MockAIService, OpenAIService
filesystem     → SpecWriter
```

### Componentes

| Componente | Capa | Responsabilidad |
| ------------------------ | ---------------- | ----------------------------------------- |
| PlaywrightController | Presentation | Inicia la generación de pruebas |
| GeneratePlaywrightSpecUseCase | Application | Coordina todo el proceso |
| Feature | Domain | Representa una Feature funcional |
| Prompt | Domain | Prompt enviado al modelo IA |
| PlaywrightSpec | Domain | Código generado |
| AIService | Infrastructure | Abstracción del proveedor IA |
| MockAIService | Infrastructure | Generación simulada |
| OpenAIService | Infrastructure | Integración OpenAI |
| PlaywrightGenerator | Infrastructure | Construcción del código |
| SpecWriter | Infrastructure | Guarda archivos `.spec.js` |

---

## 4. Flujo General

### 4.1 Interpretación de Feature (T-016)

1. El QA Engineer selecciona una Feature.
2. Se validan criterios de aceptación.
3. Se construye el Prompt.

---

### 4.2 Generación IA (T-017)

1. AIService recibe el Prompt.
2. Se consulta Mock AI u OpenAI.
3. Se genera código Playwright.

---

### 4.3 Persistencia del Spec (T-018)

1. PlaywrightGenerator valida el código.
2. SpecWriter crea el archivo.
3. El archivo queda listo para ejecución.

---

## 5. Entidades de Dominio

### Feature

| Campo | Tipo | Descripción |
| -------- | -------- | ----------------------------- |
| id | String | Identificador |
| title | String | Nombre |
| description | String | Descripción funcional |
| acceptanceCriteria | Array | Lista de criterios |

---

### Prompt

| Campo | Tipo | Descripción |
| -------- | -------- | ----------------------------- |
| role | String | Rol IA |
| task | String | Objetivo |
| context | String | Contexto |
| output | String | Resultado esperado |

---

### PlaywrightSpec

| Campo | Tipo | Descripción |
| -------- | -------- | ----------------------------- |
| filename | String | Nombre del archivo |
| language | String | JavaScript |
| code | Text | Código generado |

---

## 6. Reglas de Negocio

| ID | Regla |
| ----- | ------------------------------------------------ |
| RN-001 | Toda Feature debe tener criterios de aceptación. |
| RN-002 | Solo se genera código JavaScript válido. |
| RN-003 | El archivo generado utiliza extensión `.spec.js`. |
| RN-004 | No se sobrescriben archivos sin confirmación. |
| RN-005 | El proveedor IA puede ser Mock AI u OpenAI. |
| RN-006 | El código generado debe ser compatible con Playwright Test. |

---

## 7. API REST

### 7.1 Generar prueba Playwright

```http
POST /api/testing/playwright/generate
```

#### Request

```json
{
  "feature":"Login Usuario"
}
```

#### Response 200

```json
{
  "status":"generated",
  "file":"generated-tests/login.spec.js"
}
```

---

### 7.2 Obtener pruebas generadas

```http
GET /api/testing/playwright/specs
```

#### Response

```json
[
  {
    "file":"login.spec.js"
  }
]
```

---

## 8. Modelo Relacional

No incorpora nuevas tablas.

Los archivos son generados dinámicamente dentro del proyecto.

---

## 9. Persistencia

Archivos generados:

```text
generated-tests/

login.spec.js
payment.spec.js
store.spec.js
```

La persistencia se realiza mediante SpecWriter.

---

## 10. Consideraciones Técnicas

- Arquitectura Hexagonal.
- Playwright Test.
- JavaScript ES Modules.
- Mock AI para desarrollo.
- OpenAI para producción.
- Node.js.
- Cobertura mínima de pruebas: 90%.

---

## 11. Trazabilidad

| Artefacto | Relación |
| ---------------- | --------------------------------------- |
| BRD v5 | Plataforma AI Testing |
| PRD v4 | Automatización End-to-End |
| FSD-UC-005 | AI Playwright Testing Agent |
| ADR-0005 | Decisión arquitectónica |
| T-016 | Interpretar Feature |
| T-017 | Generar Prompt |
| T-018 | Crear archivo Playwright |
| PR-PLAYWRIGHT-001 | Prompt Playwright |
| PlaywrightGenerator.js | Implementación |
| SpecWriter.js | Persistencia |

---

## 12. Registro de Cambios

| Versión | Fecha | Cambio |
| ------- | ---------- | ------------------ |
| 1.0 | 06/07/2026 | Diseño inicial del AI Playwright Testing Agent |