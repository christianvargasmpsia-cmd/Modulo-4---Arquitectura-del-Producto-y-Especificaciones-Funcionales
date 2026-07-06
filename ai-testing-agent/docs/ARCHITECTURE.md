# Arquitectura

El proyecto sigue una arquitectura modular basada en responsabilidades.

```
                   AI Testing Agent

                          │

        ┌─────────────────┼──────────────────┐

        ▼                 ▼                  ▼

 Generator           Runner           Result Analyzer

        │                 │                  │

        ▼                 ▼                  ▼

 SpecWriter      Playwright CLI       AI Analysis

        │                 │                  │

        └─────────────────┼──────────────────┘

                          ▼

                    Report Generator
```

---

# Componentes

## Agent

Orquesta todo el proceso.

---

## Generator

Genera automáticamente pruebas Playwright.

---

## Runner

Ejecuta Playwright.

---

## Analyzer

Analiza resultados.

---

## Reporter

Genera reportes.

---

## Services

Comunicación con OpenAI.

---

## Utils

Funciones reutilizables.

---

# Principios

- Single Responsibility
- Separation of Concerns
- Modularidad
- Bajo acoplamiento
- Alta cohesión