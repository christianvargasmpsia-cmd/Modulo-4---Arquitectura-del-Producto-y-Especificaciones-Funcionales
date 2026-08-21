import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();


class LLMService {

    constructor() {

        /*
         * ==========================================================
         * OLLAMA
         * ==========================================================
         */

        this.baseURL =
            process.env.OLLAMA_BASE_URL ||
            "http://localhost:11434/v1";


        this.model =
            process.env.OLLAMA_MODEL ||
            "qwen2.5-coder:7b";


        this.client =
            new OpenAI({

                baseURL:
                    this.baseURL,

                apiKey:
                    "ollama"

            });


        console.log(
            `🤖 LLM configurado: Ollama / ${this.model}`
        );


        console.log(
            `🔗 Ollama URL: ${this.baseURL}`
        );

    }


    /*
     * ==========================================================
     * EXTRAER FALLAS REALES DE NEWMAN
     * ==========================================================
     *
     * IMPORTANTE:
     *
     * NewmanService devuelve:
     *
     * {
     *     name,
     *     method,
     *     url,
     *     status,
     *     statusCode,
     *     failed
     * }
     *
     * Por eso debemos utilizar result.name.
     *
     * NO debemos depender de:
     *
     * result.test
     * result.request
     *
     * porque esos campos pueden no existir.
     * ==========================================================
     */

    extractFailures(
        results
    ) {

        const failures = [];


        const httpResults =
            Array.isArray(
                results?.httpResults
            )
                ? results.httpResults
                : [];


        httpResults
            .filter(
                result =>
                    result?.failed === true
            )
            .forEach(
                result => {

                    /*
                     * ==================================================
                     * NOMBRE REAL DEL REQUEST
                     * ==================================================
                     *
                     * Prioridad:
                     *
                     * 1. name
                     * 2. requestName
                     * 3. test
                     * 4. request
                     * 5. fallback
                     */

                    const testName =
                        result?.name ??
                        result?.requestName ??
                        result?.test ??
                        result?.request ??
                        "Test desconocido";


                    /*
                     * ==================================================
                     * ENDPOINT
                     * ==================================================
                     */

                    const endpoint =
                        result?.url ??
                        result?.endpoint ??
                        "Endpoint desconocido";


                    /*
                     * ==================================================
                     * MÉTODO
                     * ==================================================
                     */

                    const method =
                        String(
                            result?.method ??
                            "UNKNOWN"
                        ).toUpperCase();


                    /*
                     * ==================================================
                     * STATUS
                     * ==================================================
                     */

                    const statusCode =
                        result?.statusCode ??
                        null;


                    const status =
                        result?.status ??
                        "Unknown";


                    /*
                     * ==================================================
                     * ERROR
                     * ==================================================
                     */

                    const error =
                        statusCode !== null

                            ? `HTTP ${statusCode} ${status}`

                            : "Error HTTP desconocido";


                    /*
                     * ==================================================
                     * PRIORIDAD
                     * ==================================================
                     */

                    let priority =
                        "HIGH";


                    if (
                        statusCode !== null &&
                        statusCode >= 500
                    ) {

                        priority =
                            "CRITICAL";

                    }
                    else if (
                        statusCode !== null &&
                        statusCode >= 400
                    ) {

                        priority =
                            "HIGH";

                    }


                    /*
                     * ==================================================
                     * AGREGAR FALLA
                     * ==================================================
                     */

                    failures.push({

                        test:
                            testName,

                        endpoint,

                        method,

                        error,

                        statusCode,

                        priority,

                        responseBody:
                            result?.responseBody ??
                            result?.body ??
                            null

                    });

                }
            );


        return failures;

    }


    /*
     * ==========================================================
     * CONSTRUIR PROMPT
     * ==========================================================
     */

    buildPrompt(
        failures,
        stats
    ) {

        const failuresList =
            failures.length > 0

                ? failures
                    .map(
                        (
                            failure,
                            index
                        ) => {

                            return (

                                `${index + 1}. ` +
                                `[${failure.method} ${failure.endpoint}]\n` +

                                `   Test: ${failure.test}\n` +

                                `   Error: ${failure.error}\n` +

                                `   HTTP Status: ${
                                    failure.statusCode ??
                                    "N/A"
                                }\n` +

                                `   Priority sugerida: ${
                                    failure.priority
                                }`

                            );

                        }
                    )
                    .join(
                        "\n\n"
                    )

                : "No se detectaron fallos.";


        return `
Eres un experto en QA, testing de APIs REST
y análisis automatizado de resultados de Newman.

Analiza ÚNICAMENTE los resultados REALES
proporcionados por Newman.

==================================================
REGLAS IMPORTANTES
==================================================

1. No inventes errores.

2. No inventes endpoints.

3. No inventes respuestas del backend.

4. Utiliza únicamente la información proporcionada.

5. Conserva exactamente el nombre del test
   proporcionado en el campo "Test".

6. No cambies el nombre de ningún test.

7. No reemplaces el nombre de un test por
   "Test desconocido" si existe un nombre válido.

8. Si existe un HTTP 500:
   - El estado general DEBE ser CRITICAL.
   - La prioridad DEBE ser CRITICAL.

9. Si existe HTTP 400:
   - Representa un error de solicitud.
   - La prioridad normalmente es HIGH.

10. Si existe HTTP 404:
    - Representa un recurso no encontrado.
    - La prioridad normalmente es HIGH.

11. Si existe HTTP 409:
    - Representa un conflicto de datos.
    - La prioridad normalmente es HIGH.

12. Si existen 3 o más fallos:
    - El estado general DEBE ser CRITICAL.

13. STABLE solamente está permitido cuando:
    - failed = 0
    - y no existen fallos HTTP.

14. No marques como STABLE un sistema que
    tenga errores HTTP 4xx o 5xx.

15. Devuelve ÚNICAMENTE JSON válido.

16. No utilices Markdown.

17. No agregues texto antes o después del JSON.

==================================================
ESTADÍSTICAS DE NEWMAN
==================================================

Total de requests:
${stats.requests}

Total de assertions:
${stats.assertions}

Fallos:
${stats.failed}

Fallos HTTP:
${stats.httpFailures}

Fallos de assertions:
${stats.assertionFailures}

==================================================
FALLOS DETECTADOS
==================================================

${failuresList}

==================================================
REGLAS PARA overallStatus
==================================================

CRITICAL:

- Existe al menos un HTTP 500.
- O existen 3 o más fallos.

DEGRADED:

- Existen fallos HTTP 400, 404, 409
  u otros 4xx.
- No existe HTTP 500.
- Existen menos de 3 fallos.

STABLE:

- No existen fallos.

==================================================
ANÁLISIS
==================================================

Para cada fallo proporciona:

- test
- explanation
- priority
- suggestion

IMPORTANTE:

El campo "test" DEBE contener exactamente
el nombre proporcionado por Newman.

Ejemplos válidos:

"register Customer"
"register Entrepreneur"
"register Admin"
"PATCH update User Status"
"PUT update Store"
"PATCH patch Store"
"PUT update Publication"
"POST create Publication"
"POST create Interaction"

No escribas:

"Test desconocido"

si el nombre fue proporcionado.

La explicación debe describir únicamente
lo que puede inferirse del código HTTP
y de la información proporcionada.

La sugerencia debe ser una acción concreta
para investigar o solucionar el problema.

==================================================
RESPUESTA OBLIGATORIA
==================================================

{
  "summary": "resumen ejecutivo en 2-3 oraciones",
  "overallStatus": "CRITICAL",
  "failures": [
    {
      "test": "nombre exacto del test",
      "explanation": "explicación basada en el resultado HTTP",
      "priority": "CRITICAL",
      "suggestion": "acción concreta"
    }
  ]
}
`;

    }


    /*
     * ==========================================================
     * ANALIZAR RESULTADOS
     * ==========================================================
     */

    async analyzeResults(
        results
    ) {

        /*
         * ======================================================
         * ESTADÍSTICAS
         * ======================================================
         */

        const stats = {

            requests:
                results?.requests ??
                0,

            assertions:
                results?.assertions ??
                0,

            failed:
                results?.failed ??
                0,

            httpFailures:
                results?.httpFailures ??
                0,

            assertionFailures:
                results?.assertionFailures ??
                0

        };


        /*
         * ======================================================
         * EXTRAER FALLAS
         * ======================================================
         */

        const failures =
            this.extractFailures(
                results
            );


        /*
         * ======================================================
         * DEBUG
         * ======================================================
         *
         * Esto nos permite verificar que el nombre
         * realmente llega al LLM.
         * ======================================================
         */

        console.log(
            "\n🔎 FALLAS ENVIADAS AL ANALIZADOR IA"
        );

        console.log(
            "--------------------------------------------------"
        );


        failures.forEach(
            (
                failure,
                index
            ) => {

                console.log(
                    `${index + 1}. ${failure.method} ${failure.test}`
                );

                console.log(
                    `   Endpoint: ${failure.endpoint}`
                );

                console.log(
                    `   Status  : ${failure.statusCode}`
                );

            }
        );


        /*
         * ======================================================
         * SIN FALLOS
         * ======================================================
         */

        if (
            stats.failed === 0
        ) {

            return {

                summary:
                    "Todas las pruebas pasaron exitosamente. " +
                    "No se detectaron fallos.",

                overallStatus:
                    "STABLE",

                failures: []

            };

        }


        /*
         * ======================================================
         * PROMPT
         * ======================================================
         */

        const prompt =
            this.buildPrompt(
                failures,
                stats
            );


        /*
         * ======================================================
         * LLAMAR A QWEN
         * ======================================================
         */

        let response;


        try {

            response =
                await this.client
                    .chat
                    .completions
                    .create({

                        model:
                            this.model,

                        messages: [

                            {

                                role:
                                    "system",

                                content:
                                    "Eres un experto en QA y análisis de APIs REST. " +
                                    "Responde únicamente JSON válido."

                            },

                            {

                                role:
                                    "user",

                                content:
                                    prompt

                            }

                        ],

                        temperature:
                            0.1

                    });

        }
        catch (
            error
        ) {

            console.error(
                "\n❌ Error comunicando con Ollama/Qwen:"
            );


            console.error(
                error.message
            );


            return this.buildFallbackAnalysis(
                failures,
                stats
            );

        }


        /*
         * ======================================================
         * EXTRAER RESPUESTA
         * ======================================================
         */

        let content =
            response
                ?.choices?.[0]
                ?.message?.content
                ?.trim();


        if (
            !content
        ) {

            console.warn(
                "⚠️ Ollama no devolvió contenido."
            );


            return this.buildFallbackAnalysis(
                failures,
                stats
            );

        }


        /*
         * ======================================================
         * LIMPIAR MARKDOWN
         * ======================================================
 */

        if (
            content.startsWith(
                "```"
            )
        ) {

            content =
                content

                    .replace(
                        /^```json\s*/i,
                        ""
                    )

                    .replace(
                        /^```\s*/i,
                        ""
                    )

                    .replace(
                        /\s*```$/i,
                        ""
                    )

                    .trim();

        }


        /*
         * ======================================================
         * PARSEAR JSON
         * ======================================================
 */

        let analysis;


        try {

            analysis =
                JSON.parse(
                    content
                );

        }
        catch (
            error
        ) {

            console.warn(
                "⚠️ Qwen no devolvió JSON válido."
            );


            console.warn(
                "Respuesta recibida:"
            );


            console.warn(
                content
            );


            return this.buildFallbackAnalysis(
                failures,
                stats
            );

        }


        /*
         * ======================================================
         * VALIDAR STATUS
         * ======================================================
 */

        const hasServerError =
            failures.some(
                failure =>
                    failure.statusCode >= 500
            );


        const mustBeCritical =
            hasServerError ||
            stats.failed >= 3;


        if (
            mustBeCritical
        ) {

            analysis.overallStatus =
                "CRITICAL";

        }
        else if (
            stats.failed > 0
        ) {

            analysis.overallStatus =
                "DEGRADED";

        }
        else {

            analysis.overallStatus =
                "STABLE";

        }


        /*
         * ======================================================
         * SUMMARY
         * ======================================================
 */

        if (
            typeof analysis.summary !==
                "string" ||

            analysis.summary.trim() ===
                ""
        ) {

            analysis.summary =
                `Se detectaron ${
                    stats.failed
                } fallos durante la ejecución de las pruebas.`;

        }


        /*
         * ======================================================
         * NORMALIZAR FALLAS
         * ======================================================
         *
         * IMPORTANTE:
         *
         * La información técnica REAL siempre viene
         * de Newman.
         *
         * Qwen solamente aporta:
         *
         * - explanation
         * - suggestion
         * ======================================================
 */

        analysis.failures =
            failures.map(

                (
                    failure,
                    index
                ) => {

                    /*
                     * Primero buscamos por nombre exacto.
                     */

                    let aiFailure =
                        Array.isArray(
                            analysis.failures
                        )

                            ? analysis.failures.find(

                                item =>
                                    item?.test ===
                                    failure.test

                            )

                            : null;


                    /*
                     * Si Qwen no conservó el nombre,
                     * usamos la posición.
                     */

                    if (
                        !aiFailure &&
                        Array.isArray(
                            analysis.failures
                        )
                    ) {

                        aiFailure =
                            analysis.failures[
                                index
                            ];

                    }


                    return {

                        /*
                         * SIEMPRE usamos el nombre
                         * REAL de Newman.
                         */

                        test:
                            failure.test,


                        explanation:
                            aiFailure?.explanation ??
                            failure.error,


                        priority:
                            failure.statusCode >= 500

                                ? "CRITICAL"

                                : failure.priority,


                        suggestion:
                            aiFailure?.suggestion ??

                            "Revisar el endpoint, " +
                            "los datos enviados y " +
                            "la respuesta del backend."

                    };

                }

            );


        return analysis;

    }


    /*
     * ==========================================================
     * FALLBACK
     * ==========================================================
     */

    buildFallbackAnalysis(
        failures,
        stats
    ) {

        const overallStatus =
            stats.failed >= 3 ||

            failures.some(
                failure =>
                    failure.statusCode >= 500
            )

                ? "CRITICAL"

                : "DEGRADED";


        return {

            summary:

                `Se detectaron ${
                    stats.failed
                } fallos durante la ejecución de las pruebas. ` +

                `El análisis fue generado mediante ` +
                `reglas determinísticas porque ` +
                `Qwen no pudo completar el análisis.`,

            overallStatus,


            failures:

                failures.map(
                    failure => ({

                        test:
                            failure.test,

                        explanation:
                            failure.error,

                        priority:
                            failure.statusCode >= 500

                                ? "CRITICAL"

                                : "HIGH",

                        suggestion:

                            "Revisar el endpoint, " +
                            "los datos enviados y " +
                            "la respuesta del backend."

                    })
                )

        };

    }

}


export default new LLMService();