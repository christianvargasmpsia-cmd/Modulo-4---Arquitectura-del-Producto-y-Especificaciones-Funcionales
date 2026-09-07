# Revalidación de la suite con Ollama — 07/09/2026

El usuario solicitó volver a habilitar las 17 pruebas externas y ejecutar toda
la suite. Se retiró `@Disabled` en las tres clases y se añadió `@Tag("ollama")`.
No se modificaron las aserciones ni el código de producción.

## Disponibilidad observada

- `/api/tags` responde y lista `llama3.2:3b` y `nomic-embed-text:latest`.
- Una petición mínima de generación a `llama3.2:3b` agotó 45 segundos.
- El log de Ollama quedó en `load_tensors: loading model tensors`.
- El usuario confirmó que `ollama run llama3.2:3b` también queda esperando.

Estar listado/instalado no demuestra que el modelo pueda completar inferencia.
No se atribuye este bloqueo a las aserciones de las pruebas ni se afirma una
causa raíz de hardware confirmada.

## Límites y ejecución

Las pruebas externas ahora usan 5 segundos para conectar y 60 segundos para
leer por defecto. El límite de lectura es configurable mediante
`-Dollama.test.readTimeoutMillis=120000`, por ejemplo.

Las dos primeras corridas quedaron esperando generación; se interrumpieron.
La pasada diagnóstica posterior usa `-Dollama.test.readTimeoutMillis=5000`
para intentar todos los casos sin esperar indefinidamente a un servicio que
también quedó bloqueado en la terminal del usuario. Ese límite corto es de
diagnóstico: sus errores no demuestran un defecto funcional del modelo.

## Cómo repetir

Desde `backend/umss-market-api`, con JDK 21 y dependencias Maven en caché:

```powershell
# Suite completa: necesita inferencia operativa de Ollama
.\mvnw.cmd -o "-Dollama.test.readTimeoutMillis=120000" "-Djacoco.destFile=target/jacoco-ollama.exec" "-Djacoco.append=false" test

# Generar reporte incluso cuando la ejecución anterior terminó con errores
.\mvnw.cmd -o "-Djacoco.dataFile=target/jacoco-ollama.exec" jacoco:report

# Suite independiente del modelo: las 17 externas se excluyen por etiqueta
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Djacoco.destFile=target/jacoco-offline.exec" "-Djacoco.dataFile=target/jacoco-offline.exec" "-Djacoco.append=false" test jacoco:report
```

`-o` evita descargas de Maven; no desactiva las llamadas HTTP de los tests.
La etiqueta permite conservar las dos ejecuciones sin volver a deshabilitar
permanentemente las pruebas. No hay tests omitidos por duplicación confirmada.

## Resultados de esta revalidación

| Corrida | Pasaron | Errores | Omitidos | Resultado |
|---|---:|---:|---:|---|
| Completa, 130 casos | 113 | 17 | 0 | BUILD FAILURE: llamadas a generación/embeddings |
| Sin etiqueta ollama, 113 casos | 113 | 0 | 0 | BUILD SUCCESS; 17 externos fuera de la selección |

La corrida completa se ejecutó con el límite diagnóstico de 5 segundos. Los
15 tests de selección agotaron el tiempo de lectura; los dos de embeddings
informaron que no pudieron generar el embedding. No hubo fallos de aserción:
los 17 se registraron como errores de ejecución.

Cobertura completa: 705/1.957 líneas (36,02 %) y 113/587 ramas (19,25 %).
Es cobertura de una corrida con errores, no evidencia de aprobación.

- [Resultados completos](resultados-finales.csv) y [salida](corrida-final.txt).
- [Los 17 restablecidos](tests-restablecidos-ollama.csv).
- [Salida offline](corrida-offline-20260907.txt) y [casos offline](resultados-offline-20260907.csv).

## Evidencia histórica conservada

Los archivos terminados en `-offline-20260905` conservan la corrida anterior:
113 aprobados y 17 omitidos. La comparación unitaria **30,40 % → 31,73 %**
permanece válida para aquella selección, con el mismo denominador. La cobertura
de una corrida que intenta inferencia real se informa por separado y no se
utiliza para inflar la mejora atribuida a los cuatro tests unitarios nuevos.

La autoría de los 16 tests nuevos sigue siendo el agente del IDE, no Qwen.
Su aceptación humana continúa pendiente en `AUDITORIA.md`.
