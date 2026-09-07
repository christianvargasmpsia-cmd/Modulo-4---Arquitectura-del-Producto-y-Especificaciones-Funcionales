# Entrega M7 — Pirámide de pruebas de UMSS Market

Actualizado: 07/09/2026. Estado: **suite completa intentada: 113 aprobados y 17 errores de Ollama, sin omitidos; auditoría humana pendiente**.

Detalle de la revalidación: [REVALIDACION_OLLAMA.md](REVALIDACION_OLLAMA.md).
Los resultados del 05/09 se conservan como históricos y no se sobrescriben con
la cobertura de las llamadas externas.

## Alcance

Se trabajó sobre el backend Java 21/Spring Boot existente, usando el agente del IDE.
No se construyó otro generador ni se cambió el código de producción.
La funcionalidad seleccionada es el historial del asistente y el endpoint
`POST /api/ai/chat`. Las tres capas son unit, integración y contrato.

El conteo de “generados por el agente” corresponde a los casos nuevos de esta
actividad. No se atribuyen al agente ni se vuelven a contar los tests heredados.

## 1. Cobertura antes y después (comparación offline del 05/09)

JaCoCo 0.8.12, mismo código de producción, mismo denominador de 81 clases,
1.957 líneas y 587 ramas. No se cambiaron exclusiones ni umbrales del pom.

| Medición | Líneas | Ramas | Tests activos que pasaron | Omitidos |
|---|---:|---:|---:|---:|
| Suite heredada offline, antes | 595/1.957 = **30,40 %** | 93/587 = **15,84 %** | 96 | 17 |
| Misma suite + 4 unit nuevos, después | 621/1.957 = **31,73 %** | 99/587 = **16,87 %** | 100 | 17 |
| Corrida offline del 05/09, todas las capas | 680/1.957 = **34,75 %** | 106/587 = **18,06 %** | 113 | 17 |

La comparación unitaria excluye el smoke test `UmssMarketApiApplicationTests`
y las clases nuevas de integración y contrato en ambos lados. Conserva la suite
heredada, incluidos sus tests de controlador en memoria; no se reclasificaron
esos tests como si todos fueran unitarios puros.

La primera corrida diagnóstica, antes de separar las pruebas externas, obtuvo
114 casos, 97 aprobados y 17 errores de conexión a Ollama. Su cobertura fue
650/1.957 líneas (33,21 %) y 100/587 ramas (17,04 %), pero **no se usa como
comparación unitaria**: incluía llamadas externas fallidas y el smoke test.
Se conserva en `cobertura-inicial.xml/csv`.

### Feature intervenido

`GetUserInteractionsSemanticUseCase` pasó de **0/20 a 20/20 líneas (100 %)**
y de **0/6 a 6/6 ramas (100 %)** con los cuatro unit tests nuevos.
Cumple el umbral de feature de 90 % de líneas y 80 % de ramas.

El porcentaje global sigue por debajo del umbral BUNDLE configurado en el pom.
**BUILD SUCCESS aquí corresponde a `test jacoco:report`, no certifica que
`mvn verify` supere la barrera global de cobertura.** No se relajó esa barrera.

Evidencia:
- [Antes: XML](cobertura-unit-antes.xml), [CSV](cobertura-unit-antes.csv), [corrida](corrida-unit-antes.txt).
- [Después: XML](cobertura-unit-despues.xml), [CSV](cobertura-unit-despues.csv), [corrida](corrida-unit-despues.txt).
- [Offline 05/09: XML](cobertura-final-offline-20260905.xml), [CSV](cobertura-final-offline-20260905.csv), [corrida](corrida-final-offline-20260905.txt).

La nueva corrida completa con Ollama del 07/09 midió **705/1.957 líneas
(36,02 %) y 113/587 ramas (19,25 %)**. Terminó con errores de inferencia, por
lo que esta cobertura no demuestra una suite aprobada ni reemplaza el antes/
después unitario. [XML actual](cobertura-final.xml), [CSV actual](cobertura-final.csv).

## 2. Huecos identificados

El reporte unitario inicial muestra **155 métodos con líneas ejecutables y
cero líneas cubiertas**. La lista con clase, firma, línea y cantidad está en
[metodos-sin-cobertura-antes.csv](metodos-sin-cobertura-antes.csv).
Cero cobertura indica ausencia de ejecución en esta corrida; no prueba por sí
solo que jamás se haya escrito un test para ese método.

Entre los huecos están:
- `GetUserInteractionsSemanticUseCase.executeUserHistory`: cubierto en esta actividad.
- `GetRecommendationsUseCase.getRecommendations`.
- `SearchStoresBySemanticUseCase.executeSemanticSearch`.
- Casos de uso de creación, consulta y eliminación de interacciones.
- Casos de uso de actualización y eliminación de usuarios, tiendas y publicaciones.
- Controladores de usuarios, interacciones y administración de embeddings.
- `JwtAuthenticationFilter`.

Los huecos restantes se mantienen visibles; esta actividad no declara que todo
el backend esté cubierto.

## 3. Duplicados y tests omitidos

La [tabla de candidatos](AUDITORIA.md) compara test, contraparte, datos y
aserciones. Se analizaron 114 métodos previos: **0 grupos de cuerpos idénticos
detectados** y varios parecidos que requieren revisión semántica.
No se presentó semejanza de nombres como prueba de duplicación.

Se conservan los candidatos a redundancia hasta decisión humana. No se ha
confirmado ningún grupo de duplicados exactos para dejar solo uno activo.

El 05/09 se omitieron 17 pruebas externas con autorización del usuario.
El 07/09 el usuario solicitó restablecerlas: se retiró `@Disabled` en las tres
clases y se agregó `@Tag("ollama")`. Ahora hay **0 omitidos permanentes**.
Las 17 se intentaron en la corrida completa:
- 15 de `OllamaAdapterToolSelectionTest`.
- 1 de `OllamaAdapterEmbeddingTest`.
- 1 de `SearchCatalogSemanticTest`.

El servicio lista los modelos, pero la generación también queda esperando en
la terminal del usuario. Se conservaron las aserciones; las pruebas externas
tienen límites de conexión/lectura y su resultado actual es ERROR.
[Resultados de las 17 restablecidas](tests-restablecidos-ollama.csv).

La variante sin modelo usa `-DexcludedGroups=ollama`; excluir por etiqueta
para esa corrida no equivale a deshabilitar ni borrar los tests.
[Omitidos actuales: lista vacía](tests-omitidos.csv).
[Histórico de omisiones del 05/09](tests-omitidos-offline-20260905.csv).

## 4. Nuevos tests por capa

| Capa | Generados | Pasan técnicamente | Aceptados por humanos | Descartados por humanos | Pendientes |
|---|---:|---:|---:|---:|---:|
| Unit | 4 | 4 | 0 | 0 | 4 |
| Integración | 2 | 2 | 0 | 0 | 2 |
| Contrato | 10 | 10 | 0 | 0 | 10 |
| Total | 16 | 16 | 0 | 0 | 16 |

Se cuentan invocaciones JUnit, incluidos parámetros. Los 10 de contrato son
3 verificaciones HTTP (dos respuestas 200 con textos diferentes y un error 500)
más 7 mutaciones negativas del esquema.

La evidencia técnica no sustituye la aceptación humana. [AUDITORIA.md](AUDITORIA.md)
contiene una fila por caso con el checklist y espacio para aceptar o descartar
con motivo. No se cambió `@Tag("agente")` por `@Tag("auditado")` sin esa decisión.

### Unit

`HistoryUnitTest` cubre historial vacío, contexto con datos reales esperados,
publicación eliminada y error del proveedor. Mockito sustituye los repositorios
y el modelo en sus puertos. Se comprueba tanto la respuesta como el contexto
enviado, el orden y las llamadas que no deben ocurrir.

### Integración

`HistoryFlowIntegrationTest` usa:
`MockMvc → AIController → AIServiceImpl → GetUserInteractionsSemanticUseCase
→ adaptadores JPA → repositorios Spring Data → H2 temporal → respuesta`.

Son reales el controlador, router, caso de uso, adaptadores, mappers, SQL y H2.
Los spies observan los adaptadores sin sustituir sus lecturas. Solo el proveedor
de IA está simulado. La identidad se instala en SecurityContext como fixture;
esta prueba no valida la autenticación JWT.

Cada prueba usa transacción con rollback. Se comprueba:
1. Que la recuperación del usuario autenticado ocurre antes de la generación y
   no incluye registros de otro usuario.
2. Que un usuario sin historial recorre la consulta real a H2 y finaliza sin
   recuperar publicaciones ni llamar al generador, aunque otro usuario tenga datos.

No se necesita base vectorial para este flujo: el historial real del producto
consulta SQL. No se introdujo una infraestructura que el flujo no utiliza.

### Contrato

`ChatContractTest` ejecuta el controlador y el manejador de errores con MockMvc
y el serializador autoconfigurado de Spring Boot. El servicio de aplicación es
un doble para producir respuestas deterministas.

## 5. Esquema del endpoint

Esquema versionado:
[chat-response.schema.json](../../backend/umss-market-api/src/test/resources/contracts/chat-response.schema.json).

El endpoint devuelve texto, no un objeto JSON fijo. Por eso el esquema valida
una **observación HTTP de prueba** `{status, mediaType, body}`; no se cambió
el formato real del endpoint.

| Código | Media type | Cuerpo |
|---|---|---|
| 200 | text/plain | String; no se valida el contenido de la redacción. |
| 500 | application/json | Objeto con success=false, message string o null y timestamp ISO local. Sin campos extra. |

Los catálogos comprobados son los códigos y media types de esas dos respuestas;
el chat no expone un campo de enum de herramienta que pueda validarse en su cuerpo.

El alcance es la capa MVC con servicio doble, no filtros JWT ni todos los errores
posibles de infraestructura. No se inventan respuestas 400/401/403 como parte
de este contrato acotado.

El test implementa un validador local solo de las palabras clave utilizadas en
este esquema (`type, required, properties, additionalProperties, enum, const,
pattern, oneOf`); rechaza palabras clave desconocidas. No se presenta como
una implementación completa de JSON Schema. Siete mutaciones negativas
comprueban que no acepte esquemas estructuralmente incorrectos.

Durante el desarrollo, ocho invocaciones de contrato fallaron porque el montaje
standalone serializaba la fecha como un arreglo. Se corrigió el montaje para usar
la autoconfiguración Jackson de Spring Boot; no se cambió el código productivo
ni se debilitó la regla de fecha para ocultar la diferencia.

## 6. Resultado completo del 07/09 y evidencia offline

### Corrida completa con Ollama habilitado

```text
Tests run: 130, Failures: 0, Errors: 17, Skipped: 0
BUILD FAILURE
```

113 casos pasaron y los 17 externos terminaron con errores de generación o
embeddings. Se usó un límite diagnóstico de lectura de 5 segundos después de
que una petición mínima agotara 45 segundos y el usuario confirmara que la CLI
también se bloqueaba. El límite normal de los tests es 60 segundos, ampliable.
El reporte de JaCoCo se generó en un comando separado tras el fallo: el éxito
de ese comando no convierte en verde la corrida de pruebas.

[Salida completa resumida](corrida-final.txt), [resultados por caso](resultados-finales.csv).

### Nueva corrida offline del 07/09

Con `-DexcludedGroups=ollama`: **113 tests, 0 fallos, 0 errores, 0 skipped**;
`BUILD SUCCESS`. Las 17 pruebas externas se filtran antes de ejecutar y por eso
no aparecen como skipped. Permanecen activas en la suite completa.

[Salida](corrida-offline-20260907.txt), [casos](resultados-offline-20260907.csv),
[cobertura XML](cobertura-offline-20260907.xml), [CSV](cobertura-offline-20260907.csv).
Esta corrida comprueba que las tres capas de la actividad no requieren inferencia
real. No se apagó Ollama ni la conexión del sistema para ejecutarla.

### Evidencia offline histórica del 05/09

Resultado de Maven:

```text
Tests run: 130, Failures: 0, Errors: 0, Skipped: 17
BUILD SUCCESS
```

En la corrida del 05/09 equivale a **113 aprobados y 17 omitidos**. Se ejecutó Maven con `-o` (sin
descargas), las llamadas al modelo en los tests nuevos son dobles y H2 se
crea en memoria. Ollama no fue iniciado; los 17 tests que lo necesitan están
omitidos entonces; hoy están habilitados con etiqueta `ollama`. No se apagó la red del sistema operativo ni se afirma haber aplicado
un bloqueo de sockets a toda la JVM.

Resultados históricos: [resultados-finales-offline-20260905.csv](resultados-finales-offline-20260905.csv).

## 7. Reproducción

Desde `backend/umss-market-api`, con JDK 21 y dependencias ya disponibles
en la caché de Maven:

```powershell
# Antes: solo suite heredada offline (sin nuevos tests ni smoke de contexto)
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Dtest=*,!UmssMarketApiApplicationTests,!HistoryUnitTest,!HistoryFlowIntegrationTest,!ChatContractTest" "-Djacoco.destFile=target/jacoco-unit-before.exec" "-Djacoco.dataFile=target/jacoco-unit-before.exec" "-Djacoco.append=false" test jacoco:report

# Después: misma selección más HistoryUnitTest
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Dtest=*,!UmssMarketApiApplicationTests,!HistoryFlowIntegrationTest,!ChatContractTest" "-Djacoco.destFile=target/jacoco-unit-after.exec" "-Djacoco.dataFile=target/jacoco-unit-after.exec" "-Djacoco.append=false" test jacoco:report

# Offline: todas las capas sin dependencia del modelo, excluidas por etiqueta
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Djacoco.destFile=target/jacoco-final.exec" "-Djacoco.dataFile=target/jacoco-final.exec" "-Djacoco.append=false" test jacoco:report
```

Copiar `target/site/jacoco/jacoco.xml` y `jacoco.csv` tras cada comando:
la siguiente corrida sobreescribe el reporte, aunque los .exec tengan nombres
distintos. En esta sesión el wrapper no inició dentro del entorno restringido;
se ejecutó directamente el Maven 3.9.16 ya almacenado en su caché, con
`-Dmaven.repo.local=C:\Users\Edwing\.m2\repository`. No se instalaron dependencias.

Para repetir la suite completa **sin exclusiones**, usar los comandos de
[REVALIDACION_OLLAMA.md](REVALIDACION_OLLAMA.md) cuando los modelos respondan.

## 8. Pendiente para entregar

El equipo debe revisar cada caso en AUDITORIA.md, confirmar decisiones sobre
candidatos a redundancia y registrar aceptados/descartados con sus motivos.
La consigna exige al menos un test aceptado por capa. **La actividad no debe
presentarse como cerrada mientras esa auditoría humana siga pendiente.**

La revalidación de los 17 tests externos sigue pendiente de una inferencia
operativa de Ollama; no se declara corregido el servicio ni aprobados esos tests.
