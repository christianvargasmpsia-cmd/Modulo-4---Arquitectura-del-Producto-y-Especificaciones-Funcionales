# DD-UC-004 - MCP Postman Agent

## 1. Información General

| Campo | Valor |
| ----------- | ----------------------------------- |
| ID | DD-UC-004 |
| Caso de Uso | FSD-UC-004 |
| Nombre | MCP Postman Agent |
| Sistema | UMSS Market |
| Versión | 1.0 |
| Fecha | 06/07/2026 |
| Estado | Diseño |
| Autores | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |

---

## 2. Objetivo

Automatizar el descubrimiento de Workspaces, Collections y la ejecución de pruebas API mediante Postman utilizando Model Context Protocol (MCP), desacoplando completamente la interacción con Postman del resto de la plataforma AI Testing.

El componente permitirá reutilizar la infraestructura de pruebas API y generar resultados estructurados para su posterior procesamiento.

---

## 3. Arquitectura

Se implementa utilizando Arquitectura Hexagonal (Ports & Adapters) con las siguientes capas:

```text
presentation  → MCPController
application   → ExecuteCollectionUseCase
domain        → Workspace, Collection, ExecutionResult
infrastructure→ PostmanAgentAdapter
external       → Postman API + Newman
```

### Componentes

| Componente | Capa | Responsabilidad |
| ---------------------------- | -------------- | ------------------------------------------------ |
| MCPController | Presentation | Punto de entrada para ejecutar pruebas |
| ExecuteCollectionUseCase | Application | Coordina la ejecución completa |
| Workspace | Domain | Representa un Workspace |
| Collection | Domain | Representa una Collection |
| ExecutionResult | Domain | Resultado de la ejecución |
| PostmanAgentAdapter | Infrastructure | Comunicación mediante MCP |
| getWorkspacesSkill | Infrastructure | Obtiene Workspaces |
| getCollectionsSkill | Infrastructure | Obtiene Collections |
| runCollectionSkill | Infrastructure | Ejecuta Newman |

---

## 4. Flujo General

### 4.1 Descubrimiento de Workspaces (T-013)

1. El QA Engineer solicita ejecutar pruebas.
2. MCP consulta la API de Postman.
3. Se recuperan los Workspaces disponibles.
4. Se devuelve la lista al caso de uso.

---

### 4.2 Descubrimiento de Collections (T-014)

1. Se selecciona un Workspace.
2. MCP obtiene todas las Collections.
3. Se valida la respuesta.
4. Se devuelve la lista.

---

### 4.3 Ejecución de Collection (T-015)

1. Se selecciona una Collection.
2. MCP invoca Newman.
3. Newman ejecuta todos los Requests.
4. Se generan resultados JSON.
5. El resultado queda disponible para AI Test Analyzer.

---

## 5. Entidades de Dominio

### Workspace

| Campo | Tipo | Descripción |
| -------- | -------- | ------------------------------ |
| id | String | Identificador del Workspace |
| name | String | Nombre del Workspace |

---

### Collection

| Campo | Tipo | Descripción |
| -------- | -------- | ----------------------------- |
| id | String | Identificador |
| name | String | Nombre |
| workspaceId | String | Workspace propietario |

---

### ExecutionResult

| Campo | Tipo | Descripción |
| -------- | -------- | -------------------------- |
| total | Integer | Total de Requests |
| passed | Integer | Requests exitosos |
| failed | Integer | Requests fallidos |
| duration | Long | Tiempo total |
| report | JSON | Resultado Newman |

---

## 6. Reglas de Negocio

| ID | Regla |
| ----- | ------------------------------------------------ |
| RN-001 | Toda ejecución requiere API Key válida. |
| RN-002 | El Workspace debe existir. |
| RN-003 | La Collection debe pertenecer al Workspace. |
| RN-004 | La ejecución utiliza Newman. |
| RN-005 | El resultado siempre se almacena en JSON. |
| RN-006 | Ninguna Collection es modificada durante la ejecución. |

---

## 7. API REST

### 7.1 Obtener Workspaces

```http
GET /api/testing/workspaces
```

#### Response 200

```json
[
  {
    "id":"workspace-id",
    "name":"UMSS Market"
  }
]
```

---

### 7.2 Obtener Collections

```http
GET /api/testing/workspaces/{workspaceId}/collections
```

#### Response 200

```json
[
  {
    "id":"collection-id",
    "name":"Marketplace API"
  }
]
```

---

### 7.3 Ejecutar Collection

```http
POST /api/testing/collections/{collectionId}/execute
```

#### Response 200

```json
{
  "passed":45,
  "failed":2,
  "duration":3250
}
```

---

## 8. Modelo Relacional

No incorpora nuevas tablas.

La información es obtenida dinámicamente desde Postman API mediante MCP.

Los resultados se generan temporalmente durante la ejecución.

---

## 9. Persistencia

No existe persistencia en base de datos.

Los resultados son almacenados como artefactos de ejecución.

Archivos generados:

```text
reports/playwright-results.json
reports/postman-results.json
```

---

## 10. Consideraciones Técnicas

- Arquitectura Hexagonal.
- Model Context Protocol.
- Newman CLI.
- Node.js.
- Comunicación HTTPS.
- API Key protegida mediante variables de entorno.
- Cobertura mínima de pruebas: 90%.

---

## 11. Trazabilidad

| Artefacto | Relación |
| ---------------- | --------------------------------------- |
| BRD v5 | Plataforma AI Testing |
| PRD v4 | Automatización de pruebas API |
| FSD-UC-004 | MCP Postman Agent |
| ADR-0004 | Decisión arquitectónica |
| T-013 | Descubrir Workspaces |
| T-014 | Descubrir Collections |
| T-015 | Ejecutar Collection |
| PR-MCP-001 | Prompt MCP |
| postman.agent.js | Implementación |

---

## 12. Registro de Cambios

| Versión | Fecha | Cambio |
| ------- | ---------- | ------------------ |
| 1.0 | 06/07/2026 | Diseño inicial del MCP Postman Agent |