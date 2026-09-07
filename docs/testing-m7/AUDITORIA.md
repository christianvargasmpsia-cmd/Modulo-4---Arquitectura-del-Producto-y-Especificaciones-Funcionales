# Auditoría humana — M7

El agente propone; la aceptación corresponde al equipo. Los nuevos tests mantienen
`@Tag("agente")`. No se deben registrar como aceptados/auditados por el mero hecho
de pasar. Decisión inicial por caso: **pendiente**.

## Checklist por caso

1. ¿Una modificación incorrecta de la función o ruta haría fallar esta prueba?
2. ¿La aserción verifica el comportamiento que debe cumplir, no solo una copia de la implementación?
3. ¿El nombre describe el comportamiento?
4. ¿La frontera externa está sustituida y las comprobaciones corresponden a la capa?
5. ¿Aporta un caso distinto de los ya existentes?

Las mutaciones del contrato se ejecutan en memoria sobre observaciones HTTP; no
modifican producción. Las demás comprobaciones de sensibilidad que se describen
abajo son razonamiento de revisión, no una corrida de mutation testing.

## Nuevos tests a revisar

Fuentes:
- [HistoryUnitTest.java](../../backend/umss-market-api/src/test/java/bo/umss/market/umss_market_api/m7/HistoryUnitTest.java)
- [HistoryFlowIntegrationTest.java](../../backend/umss-market-api/src/test/java/bo/umss/market/umss_market_api/m7/HistoryFlowIntegrationTest.java)
- [ChatContractTest.java](../../backend/umss-market-api/src/test/java/bo/umss/market/umss_market_api/m7/ChatContractTest.java)

| ID | Capa | Método / caso | Aporte y error que detecta | Decisión humana |
|---|---|---|---|---|
| U01 | Unit | emptyHistoryReturnsNoticeWithoutReadingPublicationsOrCallingModel | Historial vacío; falla si consulta publicaciones o invoca el modelo innecesariamente. | Pendiente |
| U02 | Unit | historyIncludesStoredFactsAndQuestionBeforeCallingModel | Comprueba precio, nombre, tipo, fecha y pregunta enviados al modelo, y el orden de llamadas. | Pendiente |
| U03 | Unit | removedPublicationDoesNotInventFactsInModelContext | Una publicación eliminada no produce precio inventado ni texto null en el contexto. | Pendiente |
| U04 | Unit | modelFailureIsPropagatedInsteadOfReturningInventedSuccess | Conserva el error de la frontera; no inventa éxito ni reintenta silenciosamente. No afirma que exista fallback general. | Pendiente |
| I01 | Integración | authenticatedRequestRetrievesOwnH2HistoryBeforeGeneratingResponse | Controlador, router, caso de uso, adaptadores, mappers y H2 reales; verifica usuario, orden y ausencia de datos ajenos. | Pendiente |
| I02 | Integración | emptyOwnHistoryStopsAfterH2LookupEvenWhenAnotherUserHasRecords | Confirma el camino corto con lectura SQL real y ningún llamado a generación. | Pendiente |
| C01a | Contrato | successHasPlainTextContractRegardlessOfGeneratedWords / frase | HTTP 200 y cuerpo string text/plain, sin comparar la redacción del modelo. | Pendiente |
| C01b | Contrato | successHasPlainTextContractRegardlessOfGeneratedWords / texto parecido a JSON | Un texto parecido a JSON sigue siendo una respuesta de texto; no se convierte en objeto. | Pendiente |
| C02 | Contrato | providerFailureHas500ErrorObjectContract | HTTP 500, JSON con campos, tipos y success=false; fecha serializada por Spring Boot. | Pendiente |
| C03a | Contrato | schemaRejectsStructuralMutationsOfAnActualErrorResponse / status | Rechaza código 201 fuera del catálogo. | Pendiente |
| C03b | Contrato | schemaRejectsStructuralMutationsOfAnActualErrorResponse / mediaType | Rechaza text/html. | Pendiente |
| C03c | Contrato | schemaRejectsStructuralMutationsOfAnActualErrorResponse / missingField | Rechaza falta de message. | Pendiente |
| C03d | Contrato | schemaRejectsStructuralMutationsOfAnActualErrorResponse / messageType | Rechaza message numérico. | Pendiente |
| C03e | Contrato | schemaRejectsStructuralMutationsOfAnActualErrorResponse / successValue | Rechaza success=true en error. | Pendiente |
| C03f | Contrato | schemaRejectsStructuralMutationsOfAnActualErrorResponse / timestamp | Rechaza una fecha sin el formato acordado. | Pendiente |
| C03g | Contrato | schemaRejectsStructuralMutationsOfAnActualErrorResponse / extraField | Rechaza campos adicionales. | Pendiente |

Los siete C03 son controles negativos del esquema, no siete nuevos endpoints.
El conteo usa invocaciones de JUnit: 4 unit + 2 integración + 10 contrato = 16.

## Posibles duplicados revisados por el agente

Se compararon 114 métodos existentes mediante normalización de cuerpos y revisión
de candidatos semánticos. No se encontraron cuerpos idénticos; ese análisis
textual por sí solo no demuestra que no exista ningún duplicado semántico.

Criterio del docente: misma función bajo prueba, mismos datos de entrada y mismo
assert. Los siguientes parecidos **no se marcan automáticamente como duplicados**.

| Test | Comparado con | Hallazgo | Propuesta | Decisión humana |
|---|---|---|---|---|
| AIServiceImplTest.chatNoDebeDevolverNull | chatDebeRetornarNoToolParaConsultasFueraDeAlcance | Misma rama NO_TOOL; mensajes distintos y aserciones parcialmente solapadas. El primero es candidato a redundancia, no duplicado exacto. | Conservar hasta revisión. | Pendiente |
| GlobalExceptionHandlerTest.shouldHandleUserAlreadyExists | GlobalExceptionHandlerConfigTest.shouldHandle_UserAlreadyExists_with409 | Mismo handler/409; excepciones con mensaje predeterminado vs mensaje explícito. | Conservar: entradas distintas. | Pendiente |
| GlobalExceptionHandlerTest.shouldHandleEmailAlreadyExists | GlobalExceptionHandlerConfigTest.shouldHandle_EmailAlreadyExists_with409 | Misma salida HTTP, pero mensajes de entrada distintos. | Conservar: no duplicado exacto. | Pendiente |
| GlobalExceptionHandlerTest.shouldHandleStoreAlreadyExists | GlobalExceptionHandlerConfigTest.shouldHandle_StoreAlreadyExists_with409 | Misma salida HTTP, pero mensajes de entrada distintos. | Conservar: no duplicado exacto. | Pendiente |
| SearchCatalogUseCaseTest.shouldHandleNullTextoFilter | shouldReturnEmptyListWhenNoPublicationsFound | Valor texto null equivalente; assertDoesNotThrow vs assertTrue(isEmpty), propósitos solapados. | Conservar hasta revisión de redundancia. | Pendiente |
| GetPublicationDetailSemanticUseCaseTest.debeIncluirPrecioEnContexto | debeIncluirStockEnContexto | Pregunta y dato comprobado distintos. | Conservar: casos complementarios. | Pendiente |
| HistoryUnitTest.historyIncludesStoredFactsAndQuestionBeforeCallingModel | HistoryFlowIntegrationTest.authenticatedRequestRetrievesOwnH2HistoryBeforeGeneratingResponse | Unit usa repositorios dobles; integración usa SQL, adaptadores y router reales. | Conservar: capas y fallos detectados distintos. | Pendiente |

## Estado de las pruebas externas (actualizado 07/09/2026)

El 05/09 se confirmó omitir temporalmente las 17 pruebas que necesitan Ollama:
15 en OllamaAdapterToolSelectionTest, 1 en OllamaAdapterEmbeddingTest y 1 en
SearchCatalogSemanticTest. El 07/09 el usuario pidió habilitarlas y repetir toda
la suite con Ollama levantado. Se retiró @Disabled y se añadió @Tag("ollama").
Están activas en la ejecución completa. La variante sin modelo se selecciona
con -DexcludedGroups=ollama; esa exclusión de ejecución no declara duplicados
ni elimina pruebas. Los resultados del 05/09 se conservan como históricos.

No se borraron archivos. Estas pruebas no se declaran inútiles o duplicadas:
se conservan como pruebas externas. Ningún candidato a duplicado fue omitido
sin confirmación.
