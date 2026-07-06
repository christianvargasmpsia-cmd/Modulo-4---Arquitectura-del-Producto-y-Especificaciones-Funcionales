# ADR-0005: Adopción del AI Playwright Testing Agent para Generación Automática de Pruebas End-to-End

## Metadatos

| Campo | Valor |
|---|---|
| Número | 0005 |
| Título | Adopción del AI Playwright Testing Agent para Generación Automática de Pruebas End-to-End |
| Fecha | 06/07/2026 |
| Autor(es) | Rodriguez Gonzales Abad Melani, Vargas Sandoval Christian Bernardo |
| Estado | Aceptada |
| Alcance | Plataforma AI Testing UMSS Market |
| Stakeholders consultados | Equipo del proyecto, docente del módulo, revisión académica |

---

## 1. Contexto

Durante el desarrollo del proyecto UMSS Market se identificó que la construcción manual de pruebas End-to-End representa una de las actividades con mayor consumo de tiempo dentro del proceso de aseguramiento de calidad.

La elaboración manual de archivos Playwright implica interpretar las especificaciones funcionales, construir escenarios de prueba, implementar assertions y mantener los scripts conforme evoluciona el sistema.

Con la incorporación del enfoque AI-SDLC se decidió automatizar esta actividad mediante un agente inteligente capaz de transformar especificaciones funcionales en pruebas ejecutables utilizando Playwright.

Las principales fuerzas en tensión identificadas fueron:

- automatización vs. control manual
- velocidad de desarrollo vs. calidad del código
- productividad vs. mantenibilidad
- generación automática vs. revisión humana

---

## 2. Alternativas consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|---|---|---|---|
| A. Desarrollo manual de pruebas Playwright | Control total del código | Alto tiempo de desarrollo y mantenimiento | Alto |
| B. Plantillas estáticas reutilizables | Implementación sencilla | Baja flexibilidad y poca adaptación | Medio |
| C. AI Playwright Testing Agent | Automatización, rapidez y reutilización | Dependencia de un proveedor LLM | Medio |

---

## 3. Decisión

> **Se adopta un AI Playwright Testing Agent para generar automáticamente pruebas End-to-End a partir de las especificaciones funcionales del sistema.**

El agente interpreta las Features y los criterios de aceptación para construir automáticamente archivos `.spec.js` compatibles con Playwright.

La solución incorpora una capa de abstracción mediante `AIService`, permitiendo utilizar tanto OpenAI como un proveedor Mock durante el desarrollo, reduciendo la dependencia directa de servicios externos.

La decisión prioriza:

- automatización del proceso de testing
- reutilización de componentes
- reducción del tiempo de desarrollo
- mantenibilidad evolutiva
- integración con el enfoque AI-SDLC

---

## 4. Consecuencias

### 4.1 Positivas

- Reducción significativa del tiempo de generación de pruebas.
- Mayor uniformidad en los casos de prueba.
- Integración con Playwright.
- Posibilidad de utilizar IA real o Mock AI.
- Mayor productividad del equipo.
- Facilita la evolución continua del sistema.

### 4.2 Negativas / costos

- Dependencia de un proveedor LLM.
- Necesidad de validar manualmente las pruebas generadas.
- Incremento moderado en complejidad arquitectónica.
- Posibles cambios futuros en la API del proveedor IA.

### 4.3 Neutras / observables

- Incorporación de nuevos componentes especializados.
- Necesidad de administrar prompts.
- Evolución continua de los modelos de IA.

---

## 5. Impacto en el sistema

### Código

Componentes afectados:

- AIService.js
- MockAIService.js
- OpenAIService.js
- PlaywrightGenerator.js
- SpecWriter.js

### Operaciones

- Interpretación automática de Features.
- Generación de código Playwright.
- Creación automática de archivos `.spec.js`.
- Persistencia de pruebas generadas.

### Seguridad

- Protección de API Keys.
- Validación de entradas.
- Control de generación de archivos.
- Aislamiento entre proveedor IA y lógica del negocio.

### Equipo

- Disminuye tareas repetitivas.
- Incrementa la productividad.
- Facilita el mantenimiento de pruebas.
- Reduce el esfuerzo manual.

### Costo

- Incremento moderado durante la implementación.
- Bajo costo operativo utilizando Mock AI durante el desarrollo.

---

## 6. Plan de reversión

### Señales tempranas

- Baja calidad de pruebas generadas.
- Incompatibilidad con nuevas versiones de Playwright.
- Problemas de disponibilidad del proveedor IA.
- Incremento excesivo del tiempo de generación.

### Costo de reversión

Moderado, debido al desacoplamiento mediante AIService.

### Plan B

Utilizar generación basada en plantillas estáticas o mantener temporalmente la generación manual de pruebas hasta resolver la integración con el proveedor IA.

---

## 7. Validación

La decisión será considerada exitosa si:

- Las Features generan automáticamente archivos `.spec.js`.
- Las pruebas son ejecutables mediante Playwright.
- El código generado mantiene consistencia.
- El proceso reduce el tiempo de creación de pruebas.
- Se mantiene independencia entre la lógica de negocio y el proveedor IA.

### Métricas

- Generación exitosa de pruebas ≥ 95 %
- Tiempo promedio de generación < 20 segundos
- Compatibilidad Playwright = 100 %
- Reducción del tiempo de desarrollo ≥ 70 %

### Responsable

Equipo UMSS Market.

---

## 8. Referencias

- BRD_v5
- PRD_v4
- FSD_v4
- ADR-0001
- ADR-0004
- AI-SDLC Blueprint
- Arquitectura de Agentes IA
- Documentación oficial de Playwright
- OpenAI API Documentation

---

## 9. Historial

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0 | 06/07/2026 | Rodriguez / Vargas | Creación inicial del ADR para la adopción del AI Playwright Testing Agent |