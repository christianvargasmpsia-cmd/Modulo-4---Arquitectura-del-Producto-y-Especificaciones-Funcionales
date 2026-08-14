import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class LLMService {

    constructor() {

        if (!process.env.OPENAI_API_KEY) {
            throw new Error(
                "No se encontró la variable OPENAI_API_KEY en el archivo .env"
            );
        }

        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        this.model = "gpt-4o-mini";
    }

    /**
     * Convierte los resultados HTTP detectados por Newman
     * en una estructura de fallos que pueda analizar la IA.
     */
    extractFailures(results) {

        const failures = [];

        const httpResults = Array.isArray(results.httpResults)
            ? results.httpResults
            : [];

        httpResults
            .filter(result => result.failed)
            .forEach(result => {

                failures.push({

                    test:
                        result.request ??
                        "Test desconocido",

                    endpoint:
                        result.request ??
                        "",

                    method:
                        result.method ??
                        "",

                    error:
                        result.statusCode
                            ? `HTTP ${result.statusCode} ${result.status}`
                            : "Error HTTP desconocido",

                    statusCode:
                        result.statusCode ?? null

                });

            });

        return failures;
    }

    /**
     * Construye el prompt para el LLM.
     */
    buildPrompt(failures, stats) {

        const failuresList = failures.length > 0

            ? failures
                .map(
                    (failure, index) =>
                        `${index + 1}. ` +
                        `[${failure.method} ${failure.endpoint}] ` +
                        `"${failure.test}"\n` +
                        `   Error: ${failure.error}\n` +
                        `   HTTP Status: ${failure.statusCode ?? "N/A"}`
                )
                .join("\n\n")

            : "No se detectaron fallos.";

        return `
Eres un experto en QA, testing de APIs REST y análisis
automatizado de resultados.

Analiza los resultados reales de Newman proporcionados
a continuación.

IMPORTANTE:
- Si existen fallos HTTP 4xx o 5xx, NO debes considerar
  el sistema como STABLE.
- HTTP 500 debe considerarse un error crítico.
- HTTP 400 debe considerarse un error de solicitud.
- HTTP 404 debe considerarse un recurso no encontrado.
- HTTP 409 puede representar un conflicto de datos.
- Si existen varios errores, debes reflejarlos en el análisis.
- No inventes errores que no estén presentes.
- Devuelve ÚNICAMENTE JSON válido.

ESTADÍSTICAS GENERALES:

- Total de requests: ${stats.requests}
- Total de assertions: ${stats.assertions}
- Fallos encontrados: ${stats.failed}
- Fallos HTTP: ${stats.httpFailures}

FALLOS DETECTADOS:

${failuresList}

REGLAS PARA overallStatus:

1. CRITICAL:
   - Si existe al menos un HTTP 500.
   - O existen 3 o más fallos.

2. DEGRADED:
   - Si existen fallos 400, 404, 409 u otros 4xx.
   - Pero no existe HTTP 500 y hay menos de 3 fallos.

3. STABLE:
   - Únicamente cuando no existen fallos.

Para cada fallo proporciona una explicación clara
y una sugerencia concreta.

RESPONDE EXACTAMENTE CON ESTE FORMATO:

{
  "summary": "resumen ejecutivo en 2-3 oraciones",
  "overallStatus": "CRITICAL",
  "failures": [
    {
      "test": "nombre del test",
      "explanation": "explicación del error",
      "priority": "CRITICAL",
      "suggestion": "acción concreta para solucionar el problema"
    }
  ]
}
`;
    }

    /**
     * Analiza los resultados recibidos desde Newman.
     */
    async analyzeResults(results) {

        /*
         * Normalizamos las estadísticas.
         */
        const stats = {

            requests:
                results.requests ?? 0,

            assertions:
                results.assertions ?? 0,

            failed:
                results.failed ?? 0,

            httpFailures:
                results.httpFailures ?? 0,

            assertionFailures:
                results.assertionFailures ?? 0
        };

        /*
         * Extraemos los fallos HTTP.
         */
        const failures =
            this.extractFailures(results);

        /*
         * Si Newman dice que no hay fallos,
         * no necesitamos llamar al LLM.
         */
        if (stats.failed === 0) {

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
         * Construimos el prompt.
         */
        const prompt =
            this.buildPrompt(
                failures,
                stats
            );

        /*
         * Llamamos al modelo.
         */
        const response =
            await this.client.chat.completions.create({

                model: this.model,

                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0.2

            });

        /*
         * Extraemos respuesta.
         */
        let content =
            response
                .choices[0]
                .message
                .content
                .trim();

        /*
         * Eliminamos posibles bloques Markdown
         * aunque el prompt solicite solamente JSON.
         */
        if (content.startsWith("```")) {

            content =
                content
                    .replace(/^```json\s*/i, "")
                    .replace(/^```\s*/i, "")
                    .replace(/\s*```$/i, "")
                    .trim();
        }

        let analysis;

        try {

            analysis =
                JSON.parse(content);

        } catch (error) {

            /*
             * Si el LLM devuelve algo que no es JSON,
             * generamos un resultado seguro.
             */
            analysis = {

                summary:
                    `Se detectaron ${stats.failed} ` +
                    `fallos durante la ejecución de las pruebas.`,

                overallStatus:
                    stats.failed >= 3 ||
                    failures.some(
                        failure =>
                            failure.statusCode >= 500
                    )
                        ? "CRITICAL"
                        : "DEGRADED",

                failures:
                    failures.map(failure => ({

                        test:
                            failure.test,

                        explanation:
                            failure.error,

                        priority:
                            failure.statusCode >= 500
                                ? "CRITICAL"
                                : "HIGH",

                        suggestion:
                            "Revisar el endpoint y validar " +
                            "la solicitud y respuesta del backend."

                    }))

            };
        }

        /*
         * Validación final de seguridad.
         *
         * Nunca permitimos STABLE si Newman
         * reportó fallos.
         */
        if (
            stats.failed > 0 &&
            analysis.overallStatus === "STABLE"
        ) {

            analysis.overallStatus =
                stats.failed >= 3 ||
                failures.some(
                    failure =>
                        failure.statusCode >= 500
                )
                    ? "CRITICAL"
                    : "DEGRADED";
        }

        /*
         * Garantizamos que failures exista.
         */
        if (!Array.isArray(analysis.failures)) {

            analysis.failures =
                failures.map(failure => ({

                    test:
                        failure.test,

                    explanation:
                        failure.error,

                    priority:
                        failure.statusCode >= 500
                            ? "CRITICAL"
                            : "HIGH",

                    suggestion:
                        "Revisar el endpoint y validar " +
                        "la implementación del backend."

                }));
        }

        return analysis;
    }
}

export default new LLMService();