# AI Testing Agent

## Descripción

AI Testing Agent es un agente inteligente que automatiza el ciclo completo de pruebas funcionales utilizando Inteligencia Artificial y Playwright.

El agente recibe una descripción funcional o una User Story, genera automáticamente pruebas con Playwright mediante un LLM, ejecuta las pruebas, analiza los resultados y genera reportes técnicos con recomendaciones.

---

# Objetivos

- Automatizar la creación de pruebas.
- Reducir el tiempo de desarrollo de casos de prueba.
- Detectar errores automáticamente.
- Analizar fallos utilizando IA.
- Generar reportes técnicos.
- Permitir la reejecución automática de pruebas.

---

# Funcionalidades

## 1. Generación automática de pruebas

Entrada

- User Story
- Feature
- Criterios de aceptación

Salida

- Archivo Playwright (.spec.js)

---

## 2. Ejecución automática

El agente ejecuta todas las pruebas mediante Playwright.

---

## 3. Análisis inteligente

La IA interpreta los resultados obtenidos por Playwright.

Analiza:

- Errores
- Stack Trace
- Timeouts
- Prioridad
- Posible causa

---

## 4. Reportes

El agente genera:

- Reporte HTML
- Reporte Markdown
- Reporte para consola

---

## 5. ReRun

Permite volver a ejecutar las pruebas automáticamente.

---

# Tecnologías

- Node.js
- Playwright
- OpenAI API
- JavaScript ES Modules

---

# Beneficios

- Mayor productividad
- Menor tiempo de creación de pruebas
- Mejor calidad del software
- Automatización del testing