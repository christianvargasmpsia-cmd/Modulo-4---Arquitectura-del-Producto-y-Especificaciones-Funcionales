# Auditoría humana — M7

**Proyecto:** UMSS Market  
**Módulo:** M7 — Pirámide de pruebas  
**Fecha:** 07/09/2026

---

## 1. Principio de auditoría

El agente propone; la aceptación corresponde al equipo.

Los nuevos tests mantienen:

```java
@Tag("agente")
```

El hecho de que una prueba pase técnicamente no constituye, por sí solo, su
aceptación. La aceptación registrada en este documento corresponde a la
revisión del equipo sobre el comportamiento, la capa y el valor de la prueba.

Las pruebas fueron revisadas utilizando el siguiente checklist:

1. ¿Una modificación incorrecta de la función o ruta haría fallar esta prueba?
2. ¿La aserción verifica el comportamiento que debe cumplir y no solamente una
   copia de la implementación?
3. ¿El nombre describe claramente el comportamiento?
4. ¿La frontera externa está sustituida cuando corresponde a la capa?
5. ¿Aporta un caso distinto de los ya existentes?

Las mutaciones del contrato se ejecutan en memoria sobre observaciones HTTP y no
modifican producción.

Las comprobaciones de sensibilidad descritas en esta auditoría corresponden a
razonamiento de revisión y no a una corrida formal de mutation testing.

---

# 2. Alcance

La actividad se realizó sobre el backend existente de UMSS Market.

La funcionalidad seleccionada corresponde al historial del asistente y al
endpoint:

```text
POST /api/ai/chat
```

Se incorporaron pruebas en tres capas:

```text
Unit
Integration
Contract
```

El agente utilizado fue Qwen3:4b ejecutado localmente mediante Ollama.

Las propuestas del agente fueron revisadas y verificadas antes de aceptarse.

No se atribuyen al agente los tests heredados del proyecto.

---

# 3. Nuevos tests revisados

## 3.1 Fuentes

### Unit

```text
../../backend/umss-market-api/src/test/java/bo/umss/market/umss_market_api/m7/HistoryUnitTest.java
```

### Integration

```text
../../backend/umss-market-api/src/test/java/bo/umss/market/umss_market_api/m7/HistoryFlowIntegrationTest.java
```

### Contract

```text
../../backend/umss-market-api/src/test/java/bo/umss/market/umss_market_api/m7/ChatContractTest.java
```

---

# 4. Resultado de ejecución de los nuevos tests

Las tres capas nuevas fueron ejecutadas individualmente y finalizaron
correctamente.

## Unit

```text
4 tests
0 failures
0 errors
0 skipped
BUILD SUCCESS
```

## Integration

```text
2 tests
0 failures
0 errors
0 skipped
BUILD SUCCESS
```

## Contract

```text
10 tests
0 failures
0 errors
0 skipped
BUILD SUCCESS
```

Total de invocaciones JUnit nuevas:

```text
16
```

---

# 5. Tabla de aceptación humana

| ID | Capa | Método / caso | Aporte y error que detecta | Evidencia técnica | Decisión humana |
|---|---|---|---|---|---|
| U01 | Unit | `emptyHistoryReturnsNoticeWithoutReadingPublicationsOrCallingModel` | Historial vacío; falla si consulta publicaciones o invoca el modelo innecesariamente. | 1/1, verde | **Aceptado por el equipo** |
| U02 | Unit | `historyIncludesStoredFactsAndQuestionBeforeCallingModel` | Comprueba nombre, tipo, precio, fecha y pregunta enviados al modelo, además del orden de llamadas. | 1/1, verde | **Aceptado por el equipo** |
| U03 | Unit | `removedPublicationDoesNotInventFactsInModelContext` | Una publicación eliminada no incorpora nombre, precio, etiqueta `Precio:` ni `null` al contexto. | 1/1, verde | **Aceptado por el equipo** |
| U04 | Unit | `modelFailureIsPropagatedInsteadOfReturningInventedSuccess` | Conserva el error de la frontera; no inventa éxito ni reintenta silenciosamente. No afirma que exista fallback general. | 1/1, verde | **Aceptado por el equipo** |
| I01 | Integration | `authenticatedRequestRetrievesOwnH2HistoryBeforeGeneratingResponse` | Controlador, router, caso de uso, adaptadores, repositorios JPA y H2 reales; verifica usuario, orden y ausencia de datos ajenos. | 1/1, verde | **Aceptado por el equipo** |
| I02 | Integration | `emptyOwnHistoryStopsAfterH2LookupEvenWhenAnotherUserHasRecords` | Confirma el camino corto con consulta SQL real y ningún llamado a generación. | 1/1, verde | **Aceptado por el equipo** |
| C01a | Contract | `successHasPlainTextContractRegardlessOfGeneratedWords` / frase | HTTP 200 y cuerpo `String` con `text/plain`, sin comparar la redacción del modelo. | 1/1, verde | **Aceptado por el equipo** |
| C01b | Contract | `successHasPlainTextContractRegardlessOfGeneratedWords` / texto parecido a JSON | Un texto parecido a JSON continúa siendo una respuesta de texto y no se convierte en objeto. | 1/1, verde | **Aceptado por el equipo** |
| C02 | Contract | `providerFailureHas500ErrorObjectContract` | HTTP 500 y JSON con campos, tipos y `success=false`; el timestamp utiliza el formato acordado. | 1/1, verde | **Aceptado por el equipo** |
| C03a | Contract | `schemaRejectsStructuralMutationsOfAnActualErrorResponse` / `status` | Rechaza código HTTP 201 fuera del catálogo permitido. | 1/1, verde | **Aceptado por el equipo** |
| C03b | Contract | `schemaRejectsStructuralMutationsOfAnActualErrorResponse` / `mediaType` | Rechaza `text/html` cuando el contrato exige JSON para el error. | 1/1, verde | **Aceptado por el equipo** |
| C03c | Contract | `schemaRejectsStructuralMutationsOfAnActualErrorResponse` / `missingField` | Rechaza la ausencia del campo obligatorio `message`. | 1/1, verde | **Aceptado por el equipo** |
| C03d | Contract | `schemaRejectsStructuralMutationsOfAnActualErrorResponse` / `messageType` | Rechaza un `message` numérico cuando el contrato exige el tipo correspondiente. | 1/1, verde | **Aceptado por el equipo** |
| C03e | Contract | `schemaRejectsStructuralMutationsOfAnActualErrorResponse` / `successValue` | Rechaza `success=true` en una respuesta de error. | 1/1, verde | **Aceptado por el equipo** |
| C03f | Contract | `schemaRejectsStructuralMutationsOfAnActualErrorResponse` / `timestamp` | Rechaza un timestamp que no cumple el formato acordado. | 1/1, verde | **Aceptado por el equipo** |
| C03g | Contract | `schemaRejectsStructuralMutationsOfAnActualErrorResponse` / `extraField` | Rechaza campos adicionales no definidos por el contrato. | 1/1, verde | **Aceptado por el equipo** |

Los siete casos C03 son controles negativos del esquema y no representan siete
endpoints diferentes.

---

# 6. Checklist de revisión por capa

## 6.1 Unit

### U01

**Comportamiento:** historial vacío.

**Fronteras sustituidas:**

- `InteractionRepositoryPort`
- `PublicationRepositoryPort`
- `AIProviderPort`

**Verificaciones:**

- devuelve el mensaje de historial vacío;
- consulta el historial;
- no consulta publicaciones;
- no invoca el modelo.

**Resultado:** aceptado.

---

### U02

**Comportamiento:** historial con publicación existente.

**Verificaciones:**

- nombre;
- tipo de interacción;
- precio;
- fecha;
- pregunta del usuario;
- orden de llamadas;
- resultado del proveedor.

**Resultado:** aceptado.

---

### U03

**Comportamiento:** publicación asociada a la interacción ya no existe.

**Verificaciones:**

- no se inventan datos;
- no aparece el nombre eliminado;
- no aparece el precio;
- no aparece `Precio:`;
- no aparece `null`.

**Resultado:** aceptado.

---

### U04

**Comportamiento:** el proveedor de IA produce una excepción.

**Verificaciones:**

- la excepción se propaga;
- no se genera un éxito falso;
- el proveedor se invoca una sola vez.

No se afirma la existencia de un mecanismo general de fallback.

**Resultado:** aceptado.

---

# 7. Evidencia de Integration

Archivo:

```text
HistoryFlowIntegrationTest.java
```

La integración ejecuta el siguiente flujo:

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
Respuesta
```

Los componentes reales incluyen:

- controlador;
- router;
- caso de uso;
- adaptadores JPA;
- repositorios Spring Data;
- mappers;
- SQL;
- base H2 temporal.

El proveedor de IA se mantiene simulado para hacer determinista la prueba.

La identidad del usuario se instala en `SecurityContext` como fixture.

Esta prueba no pretende validar la autenticación JWT.

---

## I01

### Objetivo

Verificar que un usuario autenticado consulte solamente su propio historial.

### Verificaciones

- usuario autenticado;
- recuperación de interacciones;
- recuperación de publicaciones;
- ausencia de información de otro usuario;
- orden de llamadas;
- generación posterior a la recuperación del historial.

### Resultado

```text
PASS
```

**Decisión:** aceptado por el equipo.

---

## I02

### Objetivo

Verificar el camino corto de un usuario sin historial.

### Verificaciones

- consulta real contra H2;
- ausencia de historial propio;
- existencia de registros pertenecientes a otro usuario;
- no recuperación innecesaria de publicaciones;
- no llamada al generador.

### Resultado

```text
PASS
```

**Decisión:** aceptado por el equipo.

---

# 8. Evidencia de Contract

Archivo:

```text
ChatContractTest.java
```

Endpoint:

```text
POST /api/ai/chat
```

El servicio de aplicación se sustituye por un doble para producir respuestas
deterministas.

El objetivo del contrato es verificar la estructura de la respuesta HTTP y no
la redacción generada por el modelo.

---

## C01a

Verifica:

```text
HTTP 200
Content-Type: text/plain
Body: String
```

No compara el contenido semántico generado.

**Resultado:** aceptado.

---

## C01b

Utiliza un texto con apariencia de JSON.

La prueba verifica que continúe siendo:

```text
text/plain
```

y no se transforme artificialmente en un objeto JSON.

**Resultado:** aceptado.

---

## C02

Verifica el error del proveedor:

```text
HTTP 500
Content-Type: application/json
```

El cuerpo debe contener:

```text
success = false
message = string o null
timestamp = formato acordado
```

No se permiten propiedades adicionales.

**Resultado:** aceptado.

---

# 9. Mutaciones negativas del contrato

Las siete mutaciones se realizan sobre una observación HTTP en memoria.

No se modifica producción.

| ID | Mutación | Resultado esperado |
|---|---|---|
| C03a | HTTP status `201` | Rechazar |
| C03b | Media type `text/html` | Rechazar |
| C03c | Ausencia de `message` | Rechazar |
| C03d | `message` numérico | Rechazar |
| C03e | `success=true` en error | Rechazar |
| C03f | Timestamp inválido | Rechazar |
| C03g | Campo adicional | Rechazar |

Las siete mutaciones fueron aceptadas como controles negativos del contrato.

---

# 10. Conteo por capa

| Capa | Tests generados/propuestos | Ejecutados | Aceptados | Descartados | Pendientes |
|---|---:|---:|---:|---:|---:|
| Unit | 4 | 4 | 4 | 0 | 0 |
| Integration | 2 | 2 | 2 | 0 | 0 |
| Contract | 10 | 10 | 10 | 0 | 0 |
| **Total** | **16** | **16** | **16** | **0** | **0** |

Resultado:

```text
16 tests nuevos aceptados
0 descartados
0 pendientes
```

---

# 11. Duplicados

Se analizaron 114 métodos de la suite previa.

Resultado:

```text
0 grupos de cuerpos idénticos detectados
```

No se utilizó la similitud de nombres como evidencia suficiente de duplicación.

Los candidatos que presentan similitud semántica se mantienen documentados para
revisión futura.

No se eliminaron pruebas existentes.

No se confirmó ningún grupo de duplicados exactos que requiriera dejar solamente
una prueba activa.

---

# 12. Huecos de cobertura

El reporte inicial identificó:

```text
155 métodos con líneas ejecutables y cero líneas cubiertas
```

La lista detallada se conserva en:

```text
metodos-sin-cobertura-antes.csv
```

Entre los huecos identificados se encuentran:

```text
GetRecommendationsUseCase.getRecommendations
SearchStoresBySemanticUseCase.executeSemanticSearch
GetInteractionByIdUseCase.execute
CreateInteractionUseCase.execute
DeleteInteractionUseCase.execute
GetUserInteractionsUseCase.execute
UpdateUserUseCase.execute
LoginUseCase.execute
RegisterCustomerUseCase.execute
SearchCatalogUseCase.executeSemanticSearch
```

También se identificaron huecos en:

- controladores;
- adaptadores;
- seguridad;
- operaciones CRUD;
- actualización y eliminación de usuarios;
- actualización y eliminación de tiendas;
- actualización y eliminación de publicaciones.

Los huecos restantes se mantienen visibles.

Esta actividad no declara cobertura completa del backend.

---

# 13. Cobertura de la funcionalidad intervenida

La funcionalidad:

```text
GetUserInteractionsSemanticUseCase
```

presentaba inicialmente:

```text
0/20 líneas
0/6 ramas
```

Después de los cuatro tests unitarios:

```text
20/20 líneas
6/6 ramas
```

Resultado:

```text
100 % líneas
100 % ramas
```

La cobertura completa de esta funcionalidad demuestra el cumplimiento del
objetivo de cobertura de la feature intervenida.

---

# 14. Cobertura global

La comparación documentada utiliza:

```text
81 clases
1.957 líneas
587 ramas
```

Resultados:

| Medición | Líneas | Ramas |
|---|---:|---:|
| Antes | 30,40 % | 15,84 % |
| Después de unitarias | 31,73 % | 16,87 % |
| Offline todas las capas | 34,75 % | 18,06 % |

La última interfaz HTML de JaCoCo muestra los valores redondeados:

```text
35 % líneas
18 % ramas
```

No se modificaron artificialmente los umbrales del proyecto.

La cobertura global restante se mantiene documentada como deuda de testing.

---

# 15. Pruebas externas de Ollama

Se identificaron 17 pruebas que requieren el servicio/modelo externo:

```text
15 OllamaAdapterToolSelectionTest
1 OllamaAdapterEmbeddingTest
1 SearchCatalogSemanticTest
```

Las pruebas se mantienen activas y se identifican mediante:

```java
@Tag("ollama")
```

Para la ejecución offline se utilizó:

```powershell
-DexcludedGroups=ollama
```

Esto significa que las pruebas:

- no fueron eliminadas;
- no fueron borradas;
- no fueron convertidas en tests permanentemente deshabilitados;
- permanecen disponibles para ejecución con Ollama.

---

# 16. Corrida completa con Ollama

La corrida completa con las pruebas externas habilitadas produjo:

```text
Tests run: 130
Failures: 0
Errors: 17
Skipped: 0

BUILD FAILURE
```

Los resultados fueron:

```text
113 pruebas aprobadas
17 errores externos
```

Los errores corresponden a las pruebas que dependen de generación,
embeddings o comunicación con Ollama.

No se presentan esas 17 pruebas como aprobadas.

---

# 17. Corrida final offline

La corrida final reproducible se ejecutó con:

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

Esta ejecución demuestra que las tres capas de la actividad funcionan sin
inferencia real.

La exclusión mediante etiqueta no significa que la red del sistema operativo
haya sido bloqueada.

No se afirma que se haya realizado un bloqueo de sockets de toda la JVM.

---

# 18. Ejecución limpia de JaCoCo

Para evitar inconsistencias entre clases compiladas y datos de ejecución se
realizó previamente:

```powershell
.\mvnw.cmd -o clean
```

seguido de:

```powershell
.\mvnw.cmd -o "-DexcludedGroups=ollama" test jacoco:report
```

La ejecución final terminó con:

```text
113 tests
0 failures
0 errors
0 skipped

BUILD SUCCESS
```

El reporte JaCoCo final se generó sin la advertencia anterior de incompatibilidad
entre clases y datos de ejecución.

Reporte:

```text
backend/umss-market-api/target/site/jacoco/index.html
```

---

# 19. Evidencia del agente

El agente utilizado fue:

```text
Qwen3:4b
```

ejecutado localmente mediante:

```text
Ollama
```

El flujo metodológico fue:

```text
Qwen3:4b
    ↓
Propuesta de casos
    ↓
Verificación contra repositorio / cobertura
    ↓
Revisión humana
    ↓
Aceptación
    ↓
Implementación
    ↓
Ejecución
```

El agente no se utilizó como autoridad automática.

Las propuestas que no coincidían con clases, métodos o métricas reales del
repositorio fueron rechazadas.

Esto permitió evitar incorporar como evidencia datos no pertenecientes al
proyecto.

---

# 20. Limitación de integración IDE

La conexión de Qwen con VS Code fue comprobada mediante:

```text
/ide status
```

con resultado:

```text
✓ Connected to VS Code
```

Sin embargo, la sesión utilizada no dispuso de una herramienta para recorrer
directamente todos los archivos del workspace.

Por esta razón, esta auditoría **no afirma que Qwen haya inspeccionado
automáticamente todos los archivos fuente del proyecto**.

La verificación final de los tests, clases, métodos y métricas se realizó
contra el repositorio real y los reportes generados por Maven y JaCoCo.

---

# 21. Criterio de aceptación final

La revisión humana considera aceptado un test cuando:

- ejecuta el comportamiento correcto;
- puede detectar una modificación incorrecta relevante;
- verifica una propiedad de comportamiento;
- utiliza una frontera adecuada para su capa;
- aporta valor adicional;
- no constituye un duplicado exacto de una prueba existente.

Aplicando estos criterios:

```text
Unit:        4 aceptados
Integration: 2 aceptados
Contract:   10 aceptados
```

Resultado:

```text
16 aceptados
0 descartados
0 pendientes
```

---

# 22. Estado final de la auditoría

## Unit

```text
4/4 ejecutados
4/4 aceptados
0 descartados
0 pendientes
```

## Integration

```text
2/2 ejecutados
2/2 aceptados
0 descartados
0 pendientes
```

## Contract

```text
10/10 ejecutados
10/10 aceptados
0 descartados
0 pendientes
```

## Total

```text
16 tests nuevos
16 ejecutados
16 aceptados
0 descartados
0 pendientes
```

---

# 23. Conclusión

La auditoría humana confirma la aceptación de los nuevos tests incorporados en
las tres capas de la pirámide:

```text
UNIT
  ↓
INTEGRATION
  ↓
CONTRACT
```

La suite final offline ejecutó:

```text
113 tests
0 failures
0 errors
0 skipped
BUILD SUCCESS
```

La funcionalidad intervenida:

```text
GetUserInteractionsSemanticUseCase
```

alcanzó:

```text
100 % líneas
100 % ramas
```

La cobertura global final se mantiene documentada en:

```text
34,75 % líneas
18,06 % ramas
```

y JaCoCo la muestra redondeada como:

```text
35 % líneas
18 % ramas
```

Los huecos de cobertura restantes no fueron ocultados.

Las pruebas externas de Ollama permanecen activas y separadas mediante
`@Tag("ollama")`, documentándose sus errores de inferencia/embeddings sin
presentarlos como pruebas aprobadas.

La decisión final de aceptación corresponde al equipo y queda registrada en
esta auditoría.

**Resultado de auditoría:**

```text
16 tests aceptados
0 descartados
0 pendientes
```

**Estado: AUDITORÍA HUMANA COMPLETADA.**