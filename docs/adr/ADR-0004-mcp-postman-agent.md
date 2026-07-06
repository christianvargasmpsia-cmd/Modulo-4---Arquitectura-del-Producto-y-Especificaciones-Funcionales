# ADR-0004: Adopción del MCP Postman Agent para Automatización de Pruebas API

## Metadatos

| Campo | Valor |
|---|---|
| Número | 0004 |
| Título | Adopción del MCP Postman Agent para Automatización de Pruebas API |
| Fecha | 06/07/2026 |
| Autor(es) | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Aceptada |
| Alcance | Plataforma AI Testing UMSS Market |
| Stakeholders consultados | Equipo del proyecto, docente del módulo, revisión académica |

---

## 1. Contexto

La plataforma AI Testing requiere automatizar la ejecución de pruebas funcionales sobre las APIs del sistema UMSS Market.

Inicialmente la ejecución de colecciones Postman era un proceso manual que implicaba seleccionar Workspaces, localizar Collections y ejecutar Newman de forma independiente, aumentando el tiempo de validación y el riesgo de errores humanos.

Con la incorporación de capacidades AI-assisted dentro del proceso AI-SDLC se identificó la necesidad de desacoplar la interacción con Postman mediante un agente especializado capaz de descubrir automáticamente Workspaces, obtener Collections y ejecutar pruebas API de forma estandarizada.

Las principales fuerzas en tensión fueron:

- automatización vs. simplicidad
- desacoplamiento vs. integración directa
- reutilización vs. implementación rápida
- mantenibilidad vs. complejidad inicial

---

## 2. Alternativas consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|---|---|---|---|
| A. Consumir directamente la API REST de Postman | Implementación sencilla | Alto acoplamiento entre módulos | Bajo |
| B. Ejecutar Newman manualmente | Baja complejidad | Sin automatización ni descubrimiento dinámico | Bajo |
| C. Implementar un MCP Postman Agent | Desacoplamiento, reutilización y automatización completa | Mayor esfuerzo inicial de implementación | Medio |

---

## 3. Decisión

> **Se adopta un MCP Postman Agent como componente responsable de la integración entre la plataforma AI Testing y Postman.**

El agente encapsula completamente la comunicación con Postman mediante Model Context Protocol (MCP), permitiendo:

- Descubrir automáticamente Workspaces.
- Obtener Collections disponibles.
- Ejecutar Collections mediante Newman.
- Generar resultados estructurados.
- Desacoplar la lógica de negocio de la infraestructura de integración.

Esta decisión favorece la mantenibilidad, la reutilización y la evolución futura del ecosistema AI Testing.

---

## 4. Consecuencias

### 4.1 Positivas

- Automatización completa de pruebas API.
- Bajo acoplamiento con Postman.
- Mayor reutilización de componentes.
- Integración estandarizada mediante MCP.
- Mejor trazabilidad del proceso de ejecución.
- Facilita futuras integraciones con otros proveedores.

### 4.2 Negativas / costos

- Incremento de complejidad arquitectónica.
- Dependencia de la disponibilidad de Postman API.
- Necesidad de mantener compatibilidad con MCP.
- Dependencia de Newman para la ejecución.

### 4.3 Neutras / observables

- Incremento moderado de documentación técnica.
- Necesidad de administrar API Keys.
- Nuevos componentes dentro de la plataforma AI Testing.

---

## 5. Impacto en el sistema

### Código

Componentes afectados:

- postman.agent.js
- getWorkspacesSkill.js
- getCollectionsSkill.js
- runCollectionSkill.js

### Operaciones

- Descubrimiento automático de Workspaces.
- Descubrimiento automático de Collections.
- Ejecución automática mediante Newman.
- Generación de resultados JSON.

### Seguridad

- Uso de API Keys.
- Validación de autenticación.
- Protección de credenciales.
- Validación de respuestas externas.

### Equipo

- Reduce tareas manuales repetitivas.
- Simplifica la ejecución de pruebas API.
- Facilita el mantenimiento de integraciones.

### Costo

- Incremento moderado de desarrollo inicial.
- Bajo costo operativo posterior.

---

## 6. Plan de reversión

### Señales tempranas

- Cambios incompatibles en Postman API.
- Fallos recurrentes de autenticación.
- Problemas de compatibilidad con Newman.
- Baja disponibilidad del servicio.

### Costo de reversión

Moderado, debido al desacoplamiento logrado mediante MCP.

### Plan B

Sustituir temporalmente el MCP Postman Agent por ejecución directa mediante Newman o integración REST tradicional mientras se adapta la nueva versión del proveedor.

---

## 7. Validación

La decisión será considerada exitosa si:

- Los Workspaces son descubiertos automáticamente.
- Las Collections son obtenidas correctamente.
- Newman ejecuta las pruebas sin intervención manual.
- Se generan resultados JSON reutilizables.
- La integración permanece desacoplada del resto del sistema.

### Métricas

- Descubrimiento de Workspaces ≥ 99 %
- Descubrimiento de Collections ≥ 99 %
- Ejecución exitosa de pruebas ≥ 95 %
- Generación correcta de resultados JSON = 100 %

### Responsable

Equipo UMSS Market.

---

## 8. Referencias

- BRD_v5
- PRD_v4
- FSD_v4
- ADR-0001
- Arquitectura de Agentes IA
- Model Context Protocol (MCP)
- Documentación oficial de Postman
- Newman CLI Documentation

---

## 9. Historial

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 06/07/2026 | Rodriguez / Vargas | Creación inicial del ADR para la adopción del MCP Postman Agent |