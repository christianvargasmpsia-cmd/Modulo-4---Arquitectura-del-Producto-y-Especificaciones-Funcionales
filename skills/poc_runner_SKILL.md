---
name: poc-runner
description: >
  Bootstrapea, documenta y valida Proofs of Concept (POCs) para UMSS Market.
  Toma un objetivo de validación técnica, genera el scaffold ejecutable y
  registra evidencia en poc/POC-NN/README.md. Si la POC falla, propone diffs a
  los ADRs y al DTI §12. Activar con "@poc-runner POC-NN" o
  "@poc-runner nueva <hipótesis>".
allowed-tools:
  - read
  - edit
  - run-tests
model-tier: sonnet
fsd-version-min: v0.1
status: stable
owner: G1 — Rodriguez / Vargas
---

# Skill: poc-runner — Bootstrapear y validar POCs ejecutables

> **Activación**: `@poc-runner POC-NN` (POC existente) o `@poc-runner nueva <hipótesis>`  
> Ejemplos: `@poc-runner POC-03`, `@poc-runner nueva "validar latencia Redis < 10ms"`

## 1. Cuándo activarlo (triggers)

- DURANTE: validación de una decisión arquitectónica antes de comprometerse con ella, o verificación de una hipótesis técnica time-boxed.
- ARRANCA cuando: el usuario invoca `"@poc-runner POC-NN"` o `"@poc-runner nueva <hipótesis>"`.
- NO ACTIVAR cuando: la hipótesis no tiene criterio SMART verificable o no hay *time-box* definido; pedir refinar antes de bootstrapear.

## 2. Entradas obligatorias

Para una POC existente (`@poc-runner POC-NN`):
- Directorio `poc/POC-NN/` con código fuente.
- `poc/POC-NN/README.md` con hipótesis, alcance y criterios documentados.

Para una POC nueva (`@poc-runner nueva <hipótesis>`):
- Hipótesis clara (1 línea con criterio verificable).
- Alcance: qué entra y qué queda fuera.
- *Time-box* explícito (máximo horas-persona).
- Decisión que se desbloquea si pasa o falla.

Si falta cualquiera, responder: `"Necesito hipótesis + criterio SMART + time-box antes de bootstrapear."`

## 3. Fuentes de verdad (precedencia)

1. `poc/POC-NN/README.md` — ficha de la POC (autoritativa para alcance y criterio).
2. `docs/DTI.md` §12 — POCs existentes y sus lecciones aprendidas.
3. `docs/FSD_v2.md` §NFRs — umbrales medibles que la POC debe validar.
4. `AGENTS.md` §Stack — tecnologías canónicas (no usar tecnología fuera del stack sin ADR).
5. `docs/adr/*.md` — ADRs vigentes (la POC valida o cuestiona alguna decisión).

## 4. POCs vigentes de UMSS Market

| POC | Hipótesis | Estado | Código |
|---|---|---|---|
| POC-01 | Lógica de dominio en Python puro, sin frameworks | ✅ Superado | `poc/umss_ecommerce.py` |
| POC-02 | Flujo UX QR comprensible en < 60s para usuario universitario | ✅ Superado | `poc/umss_ecommerce.html` |
| POC-03+ | Pendiente de definición según necesidades del módulo siguiente | — | — |

## 5. Procedimiento

### Para POC nueva
1. Crear directorio `poc/POC-NN/`.
2. Crear `poc/POC-NN/README.md` con la estructura estándar (ver §6 Salida esperada).
3. Crear `poc/POC-NN/<nombre>.py` (o `.html`, `.js`) con el código mínimo.
4. El código debe ser ejecutable con un comando simple (no requiere stack completo).
5. Incluir una función `assert_criteria()` que evalúe el criterio SMART automáticamente.

### Para POC existente
1. Leer el código fuente en `poc/POC-NN/`.
2. Ejecutar el script de validación si existe.
3. Capturar el output y comparar con el criterio SMART documentado.
4. Completar/actualizar `poc/POC-NN/README.md` con el resultado real.

### Paso final (ambos casos)
5. Si la POC PASA: actualizar `docs/DTI.md` §12 con el resultado y las lecciones.
6. Si la POC FALLA: proponer diffs a los ADRs afectados y a `docs/DTI.md` §12.
7. Siempre: asegurarse de que el `README.md` tiene el veredicto explícito.

## 6. Salida esperada — Estructura del README.md de una POC

```markdown
# POC-NN — <Título de la hipótesis>

## Metadatos
| Campo | Valor |
|---|---|
| ID | POC-NN |
| Hipótesis | <Una línea con criterio verificable> |
| Time-box | <N horas-persona> |
| Estado | ✅ Superado / ❌ Fallido / 🔄 En progreso |
| Decisión desbloqueada | <ADR-NNNN o decisión concreta> |

## Alcance
- Incluido: ...
- Excluido: ...

## Criterio SMART
> "<monto / latencia / tasa de éxito> en condición <X>" — verificable por script

## Resultado
```<output del script o ejecución>```

## Lecciones aprendidas
| # | Lección | Impacto en arquitectura |
|---|---|---|
| L1 | ... | ... |

## Veredicto: POC-NN [SUPERADO / FALLIDO]
```

## 7. Verificación ("bien hecho")

- El script de la POC se ejecuta en un solo comando (ej. `python poc/POC-NN/script.py`).
- El criterio SMART se evalúa automáticamente (no requiere interpretación humana).
- El `README.md` tiene veredicto explícito: SUPERADO o FALLIDO.
- Las lecciones aprendidas tienen impacto concreto en la arquitectura.
- Si la POC está referenciada en `docs/DTI.md` §12, el resultado es coherente.
- Cero dependencias externas no declaradas en `AGENTS.md` §Stack sin justificación.

## 8. Anti-patrones específicos

- **POC sin criterio SMART**: "validar que funciona" no es un criterio; necesita umbral numérico.
- **POC que requiere el stack completo**: si necesita PostgreSQL + RabbitMQ + Redis para ejecutar, ya no es una POC.
- **Hardcodear resultados**: el script debe ejecutar la lógica real, no retornar valores fijos.
- **POC sin time-box**: sin límite de tiempo, una POC se convierte en un desarrollo sin fin.
- **Ignorar los fallos**: si la POC falla, es información valiosa — documentar y proponer alternativa.
- **Usar tecnología fuera del stack**: si la POC requiere una tecnología nueva, primero el ADR.

## 9. Modos de fallo conocidos

- El criterio SMART referencia un NFR inexistente en `docs/FSD_v2.md` → STOP, pedir que se defina el NFR.
- La POC requiere credenciales reales (API bancaria, SIIS) → usar mocks/stubs; nunca credenciales reales en POC.
- Conflicto entre el resultado de la POC y un ADR `Aceptada` → STOP, escalar; requiere revisión del equipo.

## 10. Mini ejemplo de invocación

> "@poc-runner nueva 'Validar que la operación de decremento atómico de stock en PostgreSQL rechaza concurrencia con 50 workers simultáneos sin generar stock negativo'"

> "@poc-runner POC-01 — ejecuta el script y documenta el resultado en el README."

## 11. Registro de cambios

| Versión | Fecha | Autor | Cambio |
|---|---|---|---|
| 1.0.0 | 25/05/2026 | Rodriguez / Vargas | Versión inicial para UMSS Market release/2.0.0 |
