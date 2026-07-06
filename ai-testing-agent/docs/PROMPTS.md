# Prompt Engineering

El proyecto utiliza Prompt Engineering para generar automáticamente pruebas de Playwright.

---

# Prompt Principal

El modelo recibe:

- Nombre de la funcionalidad
- Descripción
- User Story
- Criterios de aceptación

El modelo debe responder únicamente con código Playwright.

---

# Prompt de Análisis

El modelo recibe:

- Resultados Playwright
- Errores
- Stack Trace

Debe responder:

## Resumen

## Causa raíz

## Severidad

- Critical
- High
- Medium
- Low

## Recomendaciones

## Próximos pasos

---

# Buenas prácticas

- No inventar datos.
- Responder únicamente con información técnica.
- Priorizar claridad.
- Mantener formato consistente.