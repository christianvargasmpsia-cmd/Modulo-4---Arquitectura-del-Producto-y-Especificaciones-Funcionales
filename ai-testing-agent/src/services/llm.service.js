import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class LLMService {

    constructor() {

        /*
         * ==========================================================
         * OLLAMA
         * ==========================================================
         *
         * Ollama expone una API compatible con OpenAI.
         *
         * IMPORTANTE:
         * El modelo NO es OpenAI.
         *
         * El flujo real es:
         *
         * LLMService
         *      ↓
         * OpenAI SDK
         *      ↓
         * Ollama
         *      ↓
         * Qwen 2.5 Coder 7B
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

                /*
                 * Ollama no necesita una API key real.
                 * El SDK requiere un valor.
                 */
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
     * EXTRAER FALLAS
     * ==========================================================
     */

    extractFailures(results) {

        const failures = [];

        const httpResults =
            Array.isArray(
                results.httpResults
            )
                ? results.httpResults
                : [];

        httpResults
            .filter(
                result =>
                    result.failed === true
            )
            .forEach(
                result => {

                    const statusCode =
                        result.statusCode ??
                        null;

                    const status =
                        result.status ??
                        "Unknown";

                    /*
                     * Utilizamos la URL real proporcionada
                     * por Newman cuando está disponible.
                     */
                    const endpoint =
                        result.url ||
                        result.request ||
                        "Endpoint desconocido";

                    /*
                     * Determinamos prioridad base.
                     */
                    let priority = "HIGH";

                    if (
                        statusCode !== null &&
                        statusCode >= 500
                    ) {

                        priority = "CRITICAL";

                    } else if (
                        statusCode !== null &&
                        statusCode >= 400
                    ) {

                        priority = "HIGH";
                    }

                    failures.push({

                        test:
                            result.test ||
                            result.request ||
                            "Test desconocido",

                        endpoint,

                        method:
                            result.method ||
                            "UNKNOWN",

                        error:
                            statusCode !== null
                                ? `HTTP ${statusCode} ${status}`
                                : "Error HTTP desconocido",

                        statusCode,

                        priority

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
                                `   HTTP Status: ${failure.statusCode ?? "N/A"}\n` +
                                `   Priority sugerida: ${failure.priority}`
                            );

                        }
                    )
                    .join("\n\n")

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

5. Si existe un HTTP 500:
   - El estado general DEBE ser CRITICAL.
   - La prioridad DEBE ser CRITICAL.

6. Si existe HTTP 400:
   - Representa un error de solicitud.
   - La prioridad normalmente es HIGH.

7. Si existe HTTP 404:
   - Representa un recurso no encontrado.
   - La prioridad normalmente es HIGH.

8. Si existe HTTP 409:
   - Representa un conflicto de datos.
   - La prioridad normalmente es HIGH.

9. Si existen 3 o más fallos:
   - El estado general DEBE ser CRITICAL.

10. STABLE solamente está permitido cuando:
    - failed = 0
    - y no existen fallos HTTP.

11. No marques como STABLE un sistema que
    tenga errores HTTP 4xx o 5xx.

12. Devuelve ÚNICAMENTE JSON válido.

13. No utilices Markdown.

14. No agregues texto antes o después del JSON.

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
      "test": "nombre del test",
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
         * Normalizamos estadísticas.
         */
        const stats = {

            requests:
                results.requests ??
                0,

            assertions:
                results.assertions ??
                0,

            failed:
                results.failed ??
                0,

            httpFailures:
                results.httpFailures ??
                0,

            assertionFailures:
                results.assertionFailures ??
                0

        };


        /*
         * Extraemos fallos reales.
         */
        const failures =
            this.extractFailures(
                results
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

        } catch (error) {

            console.error(
                "\n❌ Error comunicando con Ollama/Qwen:"
            );

            console.error(
                error.message
            );

            /*
             * Si Qwen no responde,
             * generamos análisis determinístico.
             */
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


        if (!content) {

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

        } catch (error) {

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

        } else if (
            stats.failed > 0
        ) {

            analysis.overallStatus =
                "DEGRADED";

        } else {

            analysis.overallStatus =
                "STABLE";
        }


        /*
         * ======================================================
         * VALIDAR SUMMARY
         * ======================================================
         */

        if (
            typeof analysis.summary !== "string" ||
            analysis.summary.trim() === ""
        ) {

            analysis.summary =
                `Se detectaron ${stats.failed} ` +
                `fallos durante la ejecución de las pruebas.`;
        }


        /*
         * ======================================================
         * VALIDAR FAILURES
         * ======================================================
         */

        if (
            !Array.isArray(
                analysis.failures
            )
        ) {

            analysis.failures =
                [];
        }


        /*
         * ======================================================
         * NORMALIZAR FALLAS
         * ======================================================
         *
         * El LLM interpreta los resultados,
         * pero los datos técnicos reales vienen
         * de Newman.
         */

        analysis.failures =
            failures.map(
                (
                    failure,
                    index
                ) => {

                    const aiFailure =
                        analysis.failures
                            .find(
                                item =>
                                    item.test ===
                                    failure.test
                            ) ||
                        analysis.failures[index] ||
                        {};


                    return {

                        test:
                            failure.test,

                        explanation:
                            aiFailure.explanation ||
                            failure.error,

                        priority:
                            failure.statusCode >= 500
                                ? "CRITICAL"
                                : failure.priority,

                        suggestion:
                            aiFailure.suggestion ||
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
                `Se detectaron ${stats.failed} ` +
                `fallos durante la ejecución de las pruebas. ` +
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