# Entrega M7 — Pirámide de pruebas de UMSS Market

**Actualizado:** 07/09/2026  
**Estado:** **CERRADO PARA LAS TRES CAPAS DE TESTING**

La actividad fue desarrollada sobre el backend existente de UMSS Market utilizando
un agente de IA como apoyo para la identificación y priorización de casos de
prueba. Las propuestas generadas por el agente fueron verificadas contra el
código fuente, los reportes de cobertura y la ejecución real antes de ser
incorporadas.

La aceptación de los nuevos tests corresponde al equipo y se encuentra
registrada en `AUDITORIA.md`.

---

## Alcance

Se trabajó sobre el backend Java 21 / Spring Boot existente.

La funcionalidad seleccionada para la ampliación de pruebas es el historial
del asistente y el endpoint:

```text
POST /api/ai/chat
```

Se implementaron y revisaron tres capas de pruebas:

1. **Unit testing**
2. **Integration testing**
3. **Contract testing**

No se construyó un generador de pruebas adicional ni se modificó el código de
producción para satisfacer artificialmente los tests.

Los nuevos tests mantienen:

```java
@Tag("agente")
```

El conteo de tests generados corresponde únicamente a los casos nuevos de esta
actividad. Los tests heredados del proyecto no se atribuyen al agente ni se
vuelven a contabilizar como nuevos.

---

# 1. Cobertura antes y después

La medición se realizó con JaCoCo 0.8.12.

La comparación unitaria utiliza el mismo código de producción y el mismo
denominador:

- **81 clases**
- **1.957 líneas**
- **587 ramas**

No se modificaron exclusiones ni umbrales del `pom.xml`.

| Medición | Líneas | Ramas | Tests activos que pasaron | Omitidos |
|---|---:|---:|---:|---:|
| Suite heredada offline, antes | 595/1.957 = **30,40 %** | 93/587 = **15,84 %** | 96 | 17 |
| Misma suite + 4 unit nuevos, después | 621/1.957 = **31,73 %** | 99/587 = **16,87 %** | 100 | 17 |
| Corrida offline del 05/09, todas las capas | 680/1.957 = **34,75 %** | 106/587 = **18,06 %** | 113 | 17 |

La comparación unitaria excluye el smoke test
`UmssMarketApiApplicationTests` y las clases nuevas de integración y contrato
en ambos lados.

Se conserva la suite heredada, incluidos sus tests de controlador en memoria;
no se reclasificaron esos tests como si todos fueran unitarios puros.

La primera corrida diagnóstica, antes de separar las pruebas externas, obtuvo:

```text
114 casos
97 aprobados
17 errores de conexión a Ollama
```

Su cobertura fue:

```text
650/1.957 líneas = 33,21 %
100/587 ramas = 17,04 %
```

Esta corrida diagnóstica **no se utiliza como comparación unitaria**, porque
incluía llamadas externas fallidas y el smoke test.

---

## 1.1 Cobertura final después de `clean`

La ejecución final del 07/09 se realizó después de limpiar y recompilar el
proyecto desde cero:

```powershell
.\mvnw.cmd -o clean
```

seguido de:

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" test jacoco:report
```

Resultado de la ejecución:

```text
Tests run: 113, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

JaCoCo analizó:

```text
81 clases
```

El reporte final muestra:

```text
Cobertura de líneas: 35 %
Cobertura de ramas: 18 %
```

Los valores exactos de la medición corresponden aproximadamente a:

```text
Líneas: 34,75 %
Ramas: 18,06 %
```

JaCoCo muestra estos valores redondeados en la interfaz.

La ejecución final ya no presentó la advertencia anterior de incompatibilidad
entre clases compiladas y datos de ejecución.

---

## 1.2 Feature intervenido

La funcionalidad principal cubierta en esta actividad fue:

```text
GetUserInteractionsSemanticUseCase
```

Antes de la actividad:

```text
0/20 líneas cubiertas
0/6 ramas cubiertas
```

Después de incorporar los cuatro tests unitarios:

```text
20/20 líneas cubiertas
6/6 ramas cubiertas
```

Resultado:

```text
Líneas: 100 %
Ramas: 100 %
```

Esto permite demostrar cobertura completa de la funcionalidad intervenida,
aunque la cobertura global del bundle permanezca por debajo del umbral general
configurado en el proyecto.

El objetivo de esta actividad no fue ocultar los huecos globales ni modificar
artificialmente el umbral de JaCoCo.

**Importante:** `BUILD SUCCESS` corresponde a la ejecución de
`test jacoco:report`. No certifica que `mvn verify` supere necesariamente la
barrera global de cobertura configurada en el proyecto.

---

## 1.3 Evidencias de cobertura

Se conservan los siguientes artefactos:

- `cobertura-unit-antes.xml`
- `cobertura-unit-antes.csv`
- `corrida-unit-antes.txt`
- `cobertura-unit-despues.xml`
- `cobertura-unit-despues.csv`
- `corrida-unit-despues.txt`
- `cobertura-final-offline-20260905.xml`
- `cobertura-final-offline-20260905.csv`
- `corrida-final-offline-20260905.txt`
- `cobertura-offline-20260907.xml`
- `cobertura-offline-20260907.csv`
- `corrida-offline-20260907.txt`

El reporte HTML final se encuentra en:

```text
backend/umss-market-api/target/site/jacoco/index.html
```

---

# 2. Huecos identificados

El reporte unitario inicial mostró:

```text
155 métodos con líneas ejecutables y cero líneas cubiertas
```

La lista detallada se conserva en:

```text
metodos-sin-cobertura-antes.csv
```

Cero cobertura indica ausencia de ejecución en la corrida analizada; no prueba
por sí sola que nunca haya existido un test para ese método.

Entre los huecos identificados se encuentran:

- `GetRecommendationsUseCase.getRecommendations`
- `SearchStoresBySemanticUseCase.executeSemanticSearch`
- casos de uso de creación, consulta y eliminación de interacciones
- casos de uso de actualización y eliminación de usuarios, tiendas y publicaciones
- controladores de usuarios, interacciones y administración de embeddings
- `JwtAuthenticationFilter`

La actividad no declara que todo el backend esté cubierto.

Los huecos restantes se mantienen visibles para futuras iteraciones de testing.

---

# 3. Duplicados y tests omitidos

Se analizaron:

```text
114 métodos previos
```

El análisis detectó:

```text
0 grupos de cuerpos idénticos
```

No se utilizó la semejanza de nombres como prueba suficiente de duplicación.

Los candidatos a posible redundancia semántica se conservaron para revisión
humana y no se eliminaron tests existentes.

No se confirmó ningún grupo de duplicados exactos que requiriera eliminar
una prueba.

---

## 3.1 Pruebas externas de Ollama

Durante la actividad se identificaron 17 pruebas que dependen de un servicio
externo de Ollama:

- 15 de `OllamaAdapterToolSelectionTest`
- 1 de `OllamaAdapterEmbeddingTest`
- 1 de `SearchCatalogSemanticTest`

Estas pruebas fueron separadas mediante:

```java
@Tag("ollama")
```

La variante offline utiliza:

```powershell
-DexcludedGroups=ollama
```

La exclusión por etiqueta:

- no elimina los tests;
- no los borra;
- no los marca como permanentemente deshabilitados;
- únicamente evita ejecutarlos en la corrida offline.

Las 17 pruebas permanecen activas en la suite completa.

---

# 4. Nuevos tests por capa

La actividad incorporó 16 invocaciones JUnit nuevas.

| Capa | Generados / propuestos | Ejecutados | Aceptados por humanos | Descartados | Pendientes |
|---|---:|---:|---:|---:|---:|
| Unit | 4 | 4 | 4 | 0 | 0 |
| Integración | 2 | 2 | 2 | 0 | 0 |
| Contrato | 10 | 10 | 10 | 0 | 0 |
| **Total** | **16** | **16** | **16** | **0** | **0** |

La aceptación humana se encuentra registrada en:

```text
AUDITORIA.md
```

Cada caso fue revisado considerando:

1. si una modificación incorrecta del comportamiento haría fallar la prueba;
2. si la aserción verifica comportamiento y no únicamente una copia de la implementación;
3. si el nombre describe correctamente el comportamiento;
4. si la frontera externa está sustituida cuando corresponde;
5. si el caso aporta valor distinto respecto de las pruebas existentes.

---

# 5. Evidencia de la capa Unit

Archivo:

```text
backend/umss-market-api/src/test/java/bo/umss/market/umss_market_api/m7/HistoryUnitTest.java
```

Prueba ejecutada:

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Dtest=HistoryUnitTest" test
```

Resultado:

```text
Tests run: 4
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

Los cuatro casos cubren:

### U01 — Historial vacío

Verifica que:

- se consulte el historial del usuario;
- se devuelva el mensaje correspondiente;
- no se consulten publicaciones;
- no se invoque el proveedor de IA.

### U02 — Historial con datos

Verifica que el contexto enviado al proveedor contenga:

- nombre de publicación;
- tipo de interacción;
- precio;
- fecha;
- pregunta del usuario.

También verifica el orden de las llamadas:

```text
InteractionRepository
→ PublicationRepository
→ AIProvider
```

### U03 — Publicación inexistente

Verifica que una publicación eliminada no genere información inventada en el
contexto del modelo.

Se comprueba específicamente la ausencia de:

```text
nombre de publicación
precio
"Precio:"
"null"
```

### U04 — Error del proveedor

Verifica que una excepción del proveedor de IA se propague correctamente y que
el caso de uso no transforme el error en un éxito inventado.

No se afirma que exista un mecanismo general de fallback.

---

# 6. Evidencia de la capa Integration

Archivo:

```text
backend/umss-market-api/src/test/java/bo/umss/market/umss_market_api/m7/HistoryFlowIntegrationTest.java
```

Prueba ejecutada:

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Dtest=HistoryFlowIntegrationTest" test
```

Resultado:

```text
Tests run: 2
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

La integración utiliza componentes reales:

```text
MockMvc
  ↓
AIController
  ↓
AIServiceImpl
  ↓
GetUserInteractionsSemanticUseCase
  ↓
Adaptadores JPA
  ↓
Repositorios Spring Data
  ↓
H2 temporal
  ↓
Respuesta HTTP
```

Durante la ejecución se creó una base de datos H2 en memoria:

```text
jdbc:h2:mem:...
```

Son reales:

- controlador;
- router;
- caso de uso;
- adaptadores JPA;
- repositorios Spring Data;
- mappers;
- SQL;
- base de datos H2.

El proveedor de IA se mantiene simulado para que la integración sea
determinista y no dependa de inferencia externa.

La identidad del usuario se instala en `SecurityContext` como fixture. Esta
prueba **no valida la autenticación JWT**.

Cada prueba utiliza una transacción con rollback.

---

## I01 — Usuario autenticado recupera su historial

Verifica que:

1. se identifique correctamente al usuario autenticado;
2. se consulten sus interacciones;
3. se recuperen las publicaciones correspondientes;
4. no se incorporen datos pertenecientes a otro usuario;
5. la recuperación ocurra antes de la generación de respuesta.

---

## I02 — Usuario sin historial

Verifica que:

1. se ejecute la consulta real contra H2;
2. un usuario sin historial reciba el camino corto;
3. no se recuperen publicaciones innecesariamente;
4. no se invoque el generador de IA.

El escenario también contiene datos de otro usuario para demostrar que la
consulta respeta la identidad autenticada.

No se utiliza una base vectorial en este flujo porque el historial implementado
consulta datos mediante SQL. No se introdujo infraestructura artificial que el
flujo real no utiliza.

---

# 7. Evidencia de la capa Contract

Archivo:

```text
backend/umss-market-api/src/test/java/bo/umss/market/umss_market_api/m7/ChatContractTest.java
```

Prueba ejecutada:

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Dtest=ChatContractTest" test
```

Resultado:

```text
Tests run: 10
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

El contrato se prueba sobre:

```text
POST /api/ai/chat
```

El servicio de aplicación se sustituye por un doble para producir respuestas
deterministas.

El objetivo del contrato es verificar la forma de la respuesta HTTP y no la
redacción generada por el modelo.

---

## Casos positivos

### C01a

Verifica:

```text
HTTP 200
Content-Type: text/plain
Body: String
```

No se compara el contenido semántico de la respuesta.

### C01b

Utiliza un texto generado que tiene apariencia de JSON y verifica que la
respuesta continúe siendo un texto plano.

Esto evita acoplar el contrato al contenido generado.

---

## Caso de error

### C02

Verifica:

```text
HTTP 500
Content-Type: application/json
```

y un cuerpo estructurado con:

```text
success = false
message = string o null
timestamp = formato acordado
```

No se permiten campos adicionales.

---

# 8. Esquema del endpoint

El esquema versionado se encuentra en:

```text
backend/umss-market-api/src/test/resources/contracts/chat-response.schema.json
```

El endpoint no devuelve un objeto JSON fijo en caso de éxito. Devuelve texto.

Por ese motivo, el esquema de prueba valida una observación HTTP con la forma:

```text
{
    status,
    mediaType,
    body
}
```

No se modificó el formato real del endpoint para satisfacer el esquema.

| Código | Media type | Cuerpo |
|---|---|---|
| 200 | `text/plain` | `String`; no se valida la redacción |
| 500 | `application/json` | Objeto con `success=false`, `message` string o null y `timestamp` con formato acordado |

Los catálogos comprobados corresponden a los códigos HTTP y media types de las
respuestas incluidas en el alcance.

El chat no expone en el cuerpo un campo enum correspondiente a la herramienta
seleccionada, por lo que no se inventó dicho catálogo en el contrato.

El alcance es la capa MVC con servicio doble. No se incorporan artificialmente
respuestas 400, 401 o 403 que no formen parte del contrato probado.

---

## 8.1 Validador utilizado

El test utiliza un validador local limitado a las palabras clave empleadas en
el esquema:

```text
type
required
properties
additionalProperties
enum
const
pattern
oneOf
```

El validador rechaza palabras clave desconocidas.

No se presenta como una implementación completa del estándar JSON Schema.

---

## 8.2 Mutaciones negativas

Se implementaron siete verificaciones negativas sobre una respuesta real:

| ID | Mutación | Comportamiento esperado |
|---|---|---|
| C03a | `status` | Rechaza HTTP 201 |
| C03b | `mediaType` | Rechaza `text/html` |
| C03c | `missingField` | Rechaza ausencia de `message` |
| C03d | `messageType` | Rechaza `message` numérico |
| C03e | `successValue` | Rechaza `success=true` en error |
| C03f | `timestamp` | Rechaza timestamp con formato inválido |
| C03g | `extraField` | Rechaza propiedades no definidas |

Los siete casos C03 representan controles negativos del esquema y no siete
endpoints diferentes.

---

# 9. Corrección realizada durante el desarrollo del contrato

Durante el desarrollo se detectó que ocho invocaciones de contrato fallaban
porque el montaje standalone serializaba la fecha como un arreglo.

La solución fue utilizar la autoconfiguración Jackson de Spring Boot para el
montaje de prueba.

No se modificó el código productivo.

Tampoco se debilitó la regla del timestamp para ocultar la diferencia.

Después de la corrección:

```text
ChatContractTest
10/10 PASS
```

---

# 10. Resultado completo del 07/09

## 10.1 Corrida completa con Ollama habilitado

La suite completa, sin excluir las pruebas externas, produjo:

```text
Tests run: 130
Failures: 0
Errors: 17
Skipped: 0

BUILD FAILURE
```

Los resultados fueron:

```text
113 casos aprobados
17 errores de pruebas externas
```

Los 17 errores corresponden a pruebas que requieren inferencia, embeddings o
comunicación con Ollama.

Estas pruebas no se declaran aprobadas ni corregidas como consecuencia de la
corrida offline.

El reporte de cobertura generado después de una corrida con errores no se
utiliza para declarar una suite verde.

---

# 11. Corrida final offline del 07/09

Para verificar las tres capas de la actividad sin depender de inferencia real
se ejecutó:

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" test jacoco:report
```

Resultado final:

```text
Tests run: 113
Failures: 0
Errors: 0
Skipped: 0

BUILD SUCCESS
```

Las 17 pruebas externas se filtran antes de la ejecución mediante la etiqueta:

```text
ollama
```

Por ese motivo no aparecen como `skipped`.

Permanecen activas en la suite completa.

Esta ejecución demuestra que:

- los tests unitarios nuevos no requieren inferencia real;
- los tests de integración nuevos no requieren inferencia real;
- los tests de contrato nuevos no requieren inferencia real;
- la suite seleccionada para la entrega puede ejecutarse offline con las
  dependencias disponibles localmente.

No se apagó Ollama ni se aplicó un bloqueo de sockets al sistema operativo para
esta corrida.

---

# 12. Evidencia histórica offline del 05/09

Se conserva como evidencia histórica:

```text
Tests run: 130
Failures: 0
Errors: 0
Skipped: 17

BUILD SUCCESS
```

Equivalente a:

```text
113 aprobados
17 omitidos
```

La ejecución utilizó Maven offline:

```text
-o
```

Las pruebas nuevas utilizaron dobles para el proveedor de IA y la integración
utilizó H2 en memoria.

Las 17 pruebas externas se encontraban omitidas en esa medición histórica.

Posteriormente fueron reactivadas y etiquetadas como:

```java
@Tag("ollama")
```

No se debe interpretar la evidencia histórica como una omisión permanente
actual.

---

# 13. Reproducción

Desde:

```text
backend/umss-market-api
```

con JDK 21 y las dependencias disponibles en la caché local de Maven:

## 13.1 Antes — suite heredada

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Dtest=*,!UmssMarketApiApplicationTests,!HistoryUnitTest,!HistoryFlowIntegrationTest,!ChatContractTest" "-Djacoco.destFile=target/jacoco-unit-before.exec" "-Djacoco.dataFile=target/jacoco-unit-before.exec" "-Djacoco.append=false" test jacoco:report
```

## 13.2 Después — suite heredada + unit nuevo

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Dtest=*,!UmssMarketApiApplicationTests,!HistoryFlowIntegrationTest,!ChatContractTest" "-Djacoco.destFile=target/jacoco-unit-after.exec" "-Djacoco.dataFile=target/jacoco-unit-after.exec" "-Djacoco.append=false" test jacoco:report
```

## 13.3 Corrida offline final

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" "-Djacoco.destFile=target/jacoco-final.exec" "-Djacoco.dataFile=target/jacoco-final.exec" "-Djacoco.append=false" test jacoco:report
```

## 13.4 Ejecución final limpia utilizada para la evidencia

Antes de la última medición se ejecutó:

```powershell
.\mvnw.cmd -o clean
```

y posteriormente:

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" test jacoco:report
```

Resultado:

```text
Tests run: 113
Failures: 0
Errors: 0
Skipped: 0
BUILD SUCCESS
```

La limpieza permitió recompilar las clases de producción y eliminar posibles
inconsistencias entre clases compiladas y datos anteriores de JaCoCo.

---

# 14. Artefactos de la entrega

Los principales artefactos generados o modificados son:

```text
backend/umss-market-api/src/test/java/
└── bo/umss/market/umss_market_api/m7/
    ├── HistoryUnitTest.java
    ├── HistoryFlowIntegrationTest.java
    └── ChatContractTest.java
```

Schema:

```text
backend/umss-market-api/src/test/resources/contracts/
└── chat-response.schema.json
```

Documentación:

```text
docs/testing-m7/
├── AUDITORIA.md
├── ENTREGA_M7.md
├── cobertura-unit-antes.xml
├── cobertura-unit-antes.csv
├── cobertura-unit-despues.xml
├── cobertura-unit-despues.csv
├── cobertura-offline-20260907.xml
├── cobertura-offline-20260907.csv
├── metodos-sin-cobertura-antes.csv
└── ...
```

Reporte HTML:

```text
backend/umss-market-api/target/site/jacoco/index.html
```

---

# 15. Participación del agente

El agente utilizado en la actividad fue Qwen3:4b ejecutado localmente mediante
Ollama.

El flujo utilizado fue:

```text
Qwen3:4b
    ↓
Ollama
    ↓
Análisis / propuesta de casos
    ↓
Verificación contra repositorio y JaCoCo
    ↓
Revisión humana
    ↓
Aceptación de tests
    ↓
Ejecución
```

El agente se utilizó como apoyo para identificar y priorizar casos de prueba.

Las propuestas del agente no se aceptaron automáticamente.

Durante la revisión se detectaron propuestas que no correspondían con clases,
métodos o métricas reales del repositorio. Dichas propuestas no fueron
incorporadas como evidencia válida.

La integración IDE de Qwen fue comprobada mediante:

```text
/ide status
✓ Connected to VS Code
```

Sin embargo, la sesión de Qwen utilizada no dispuso de una herramienta para
recorrer directamente el contenido del workspace. Por este motivo no se afirma
que Qwen haya inspeccionado automáticamente todos los archivos del proyecto.

La verificación final de los casos y de las métricas se realizó contra el
repositorio real y los reportes generados por Maven/JaCoCo.

---

# 16. Auditoría humana

La aceptación corresponde al equipo.

El agente propone; el equipo acepta, modifica o descarta.

La auditoría humana se encuentra en:

```text
AUDITORIA.md
```

Resultado:

| Capa | Generados | Ejecutados | Aceptados | Descartados | Pendientes |
|---|---:|---:|---:|---:|---:|
| Unit | 4 | 4 | 4 | 0 | 0 |
| Integración | 2 | 2 | 2 | 0 | 0 |
| Contrato | 10 | 10 | 10 | 0 | 0 |
| **Total** | **16** | **16** | **16** | **0** | **0** |

Por tanto:

```text
16 tests nuevos aceptados
0 descartados
0 pendientes
```

---

# 17. Estado final

La actividad queda cerrada para las tres capas requeridas:

```text
UNIT          ✅
INTEGRATION   ✅
CONTRACT      ✅
```

Ejecución final:

```text
113 tests
0 failures
0 errors
0 skipped
BUILD SUCCESS
```

Cobertura global final mostrada por JaCoCo:

```text
Líneas: 35 %
Ramas: 18 %
```

Valores exactos documentados:

```text
Líneas: 34,75 %
Ramas: 18,06 %
```

Cobertura de la funcionalidad intervenida:

```text
GetUserInteractionsSemanticUseCase

Líneas: 100 %
Ramas: 100 %
```

La cobertura global restante se mantiene visible y documentada. No se
eliminaron ni ocultaron los huecos existentes para mejorar artificialmente el
porcentaje.

Las pruebas externas de Ollama permanecen activas y separadas mediante
`@Tag("ollama")`. Su ejecución requiere un servicio/modelo externo y no forma
parte de la corrida offline verde.

---

# 18. Conclusión

La ampliación de pruebas de UMSS Market demuestra una pirámide de testing con
tres capas:

```text
              CONTRACT
                 ▲
                 │
            INTEGRATION
                 ▲
                 │
               UNIT
```

Se incorporaron:

```text
4 pruebas unitarias
2 pruebas de integración
10 verificaciones de contrato
-------------------------------
16 invocaciones nuevas
```

Todas las pruebas nuevas fueron ejecutadas correctamente y aceptadas mediante
revisión humana.

La integración utiliza componentes reales y una base H2 temporal, mientras que
las pruebas unitarias sustituyen las fronteras externas mediante doubles.

El contrato valida estructura HTTP, tipos, campos obligatorios, catálogos y
formato del timestamp sin acoplarse al contenido textual generado por el
modelo.

La ejecución final offline fue reproducible y terminó con:

```text
113 tests
0 failures
0 errors
0 skipped
BUILD SUCCESS
```

Con ello se considera cerrada la actividad M7 en sus tres capas de testing,
manteniendo explícitamente documentados tanto los huecos de cobertura
remanentes como las dependencias externas de Ollama.