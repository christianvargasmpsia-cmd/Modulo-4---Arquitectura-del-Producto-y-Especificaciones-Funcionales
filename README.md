# UMSS Market
## AI-Native Product Architecture & Functional Specifications
## 1. Introducción
UMSS Market es una plataforma ecommerce orientada a la gestión digital de productos, pedidos, pagos y operaciones comerciales dentro del ecosistema universitario de la Universidad Mayor de San Simón.

El proyecto evoluciona bajo un enfoque AI-Native Engineering, integrando arquitectura distribuida, documentación evolutiva, decisiones arquitectónicas trazables y flujos de especificación funcional alineados a metodologías modernas de ingeniería de software asistida por inteligencia artificial.

Este repositorio concentra la arquitectura documental, especificaciones funcionales, decisiones arquitectónicas, prompts especializados, artefactos AI-assisted y diagramas asociados al ciclo de vida arquitectónico del sistema.

## 2. Objetivo del módulo
El objetivo de este módulo consiste en construir la arquitectura funcional y documental del sistema UMSS Market mediante un enfoque AI-SDLC, integrando procesos de modelado de negocio, especificación de producto, diseño arquitectónico, documentación técnica y generación asistida por inteligencia artificial.

La estructura del repositorio busca mantener trazabilidad entre necesidades de negocio, capacidades funcionales, decisiones arquitectónicas y artefactos técnicos derivados durante el ciclo evolutivo del producto.

## 3. Contexto del sistema
UMSS Market opera como una plataforma ecommerce multiusuario orientada a consumidores, administradores y unidades comerciales universitarias.

El sistema contempla procesos asociados a:

- gestión de catálogo
- procesamiento de órdenes
- pagos digitales
- notificaciones
- seguimiento de pedidos
- administración comercial
- trazabilidad operativa

Debido al crecimiento funcional esperado, el sistema requiere una arquitectura desacoplada, resiliente y evolutiva que permita escalar capacidades de negocio de forma independiente.

## 4. Arquitectura objetivo
La arquitectura objetivo del sistema se encuentra alineada a principios de arquitectura distribuida moderna, microservicios orientados a eventos y patrones de integración asíncrona.

El enfoque arquitectónico prioriza:

- desacoplamiento funcional
- consistencia eventual
- resiliencia
- observabilidad
- escalabilidad horizontal
- integración basada en eventos
- separación por bounded contexts
- evolución incremental del sistema

La solución arquitectónica incorpora principios de Clean Architecture, Domain-Driven Design (DDD) y Event-Driven Architecture (EDA) como base estructural del ecosistema.

## 5. Arquitectura documental
La arquitectura documental del proyecto sigue un enfoque incremental y trazable alineado al ciclo AI-SDLC planteado durante el módulo.

El flujo documental implementado contempla la evolución de los siguientes artefactos:

```text
BRD → MRD → PRD → ADR → FSD → DTI → POC 
```

## 6. Estructura del repositorio
El repositorio se organiza siguiendo separación de responsabilidades entre documentación funcional, arquitectura, prompts, evidencias y artefactos AI-assisted.

```text
docs/
├── adr/
├── aportes/
├── architecture/
├── dti/
├── plantillas/

prompts/
skills/
diagrams/
evidencias/
poc/
research/
```

## 7. Documentos principales
| Documento | Propósito |
|---|---|
| BRD | Definición de necesidades de negocio |
| MRD | Modelado de requerimientos del mercado |
| PRD | Especificación funcional del producto |
| ADR | Registro de decisiones arquitectónicas |
| FSD | Especificación funcional detallada |
| DTI | Documento técnico inicial |
| POC | Validaciones técnicas y prototipos |

## 8. Arquitectura distribuida
La arquitectura distribuida propuesta adopta principios de Event-Driven Architecture (EDA) y microservicios desacoplados mediante comunicación asíncrona.

La solución busca minimizar dependencias rígidas entre componentes, facilitando:

- evolución incremental
- despliegues independientes
- tolerancia a fallos
- resiliencia operacional
- integración distribuida
- escalabilidad por dominio funcional

Se consideran patrones modernos como Saga Pattern, mensajería basada en eventos y bounded contexts derivados de capacidades de negocio.

## 9. AI-native engineering
El proyecto incorpora un enfoque AI-Native Engineering basado en prompts estructurados, documentación asistida por IA y especialización funcional mediante skills reutilizables.

La estrategia implementa:

- generación asistida de documentación
- prompts como contratos funcionales
- arquitectura guiada por IA
- workflows agénticos
- trazabilidad evolutiva
- automatización documental incremental

Los prompts y skills contenidos en el repositorio funcionan como artefactos operacionales para procesos de diseño arquitectónico, validación funcional y especificación técnica.

## 10. Diagramas
El repositorio incorpora diagramas arquitectónicos orientados a modelar:

- contexto del sistema
- contenedores C4
- bounded contexts
- flujos asíncronos
- integración distribuida
- eventos de dominio
- relaciones entre servicios

Los diagramas se desarrollan utilizando Mermaid como mecanismo declarativo de documentación arquitectónica.

## 11. ADRs
Los Architecture Decision Records (ADR) documentan las decisiones arquitectónicas relevantes adoptadas durante el diseño evolutivo del sistema.

Cada ADR registra:

- contexto
- problema arquitectónico
- alternativas evaluadas
- decisión adoptada
- tradeoffs
- impacto técnico
- consecuencias evolutivas

Este enfoque permite mantener trazabilidad sobre la evolución técnica y funcional de la solución.

## 12. Prompts y Skills
El ecosistema documental incorpora prompts especializados y skills reutilizables orientados a automatizar tareas de análisis arquitectónico, especificación funcional y diseño distribuido.

Los skills implementan responsabilidades específicas como:

- diseño de sagas
- revisión de arquitectura distribuida
- modelado orientado a eventos
- análisis de resiliencia
- diseño de integración async
- generación de catálogos de eventos

Este enfoque permite construir workflows AI-assisted alineados a metodologías modernas de ingeniería de software.

## 13. Flujo documental
El flujo documental del proyecto sigue una evolución incremental desde necesidades de negocio hasta especificaciones funcionales y decisiones arquitectónicas.

```text
Business Need
   ↓
BRD
   ↓
MRD
   ↓
PRD
   ↓
ADR
   ↓
FSD
   ↓
DTI
   ↓
POC
```
## 14. Tecnologías
Las tecnologías y herramientas utilizadas dentro del proceso documental y arquitectónico incluyen:

- Markdown
- Mermaid
- Git
- GitHub
- Python
- Arquitectura orientada a eventos
- Clean Architecture
- Domain-Driven Design
- AI-assisted engineering
- Agentic workflows

## 15. Estado actual
El proyecto se encuentra en evolución incremental bajo un enfoque AI-SDLC, integrando refinamiento continuo de arquitectura, documentación funcional y automatización asistida por inteligencia artificial.

Las iteraciones actuales contemplan mejoras progresivas sobre:

- arquitectura distribuida
- modelado funcional
- decisiones arquitectónicas
- observabilidad
- resiliencia
- integración async
- workflows agénticos