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
     * Extrae los fallos relevantes del reporte Newman
     * para construir el contexto del prompt.
     */
    extractFailures(newmanSummary) {

        const failures = [];

        newmanSummary.run.failures.forEach(failure => {

            failures.push({
                test: failure.source?.name ?? "Test desconocido",
                endpoint: failure.source?.request?.url?.path?.join("/") ?? "",
                method: failure.source?.request?.method ?? "",
                error: failure.error?.message ?? "Error desconocido",
                statusCode: failure.result?.response?.code ?? null
            });

        });

        return failures;

    }

    /**
     * Construye el prompt estructurado para el LLM.
     */
    buildPrompt(failures, stats) {

        const failuresList = failures
            .map(
                (f, i) =>
                    `${i + 1}. [${f.method} /${f.endpoint}] "${f.test}"\n` +
                    `   Error: ${f.error}` +
                    (f.statusCode ? `\n   HTTP Status: ${f.statusCode}` : "")
            )
            .join("\n\n");

        return (
            `Eres un experto en QA y testing de APIs REST. ` +
            `Analiza los siguientes resultados de pruebas automatizadas y responde ÚNICAMENTE con un objeto JSON válido.\n\n` +
            `ESTADÍSTICAS GENERALES:\n` +
            `- Total de requests: ${stats.requests}\n` +
            `- Total de assertions: ${stats.assertions}\n` +
            `- Fallos encontrados: ${stats.failed}\n\n` +
            `FALLOS DETECTADOS:\n\n${failuresList}\n\n` +
            `Responde con este JSON exacto (sin markdown, sin texto adicional):\n` +
            `{\n` +
            `  "summary": "resumen ejecutivo en 2-3 oraciones",\n` +
            `  "overallStatus": "CRITICAL | DEGRADED | STABLE",\n` +
            `  "failures": [\n` +
            `    {\n` +
            `      "test": "nombre del test",\n` +
            `      "explanation": "explicación del error en lenguaje simple",\n` +
            `      "priority": "CRITICAL | HIGH | MEDIUM | LOW",\n` +
            `      "suggestion": "acción concreta para solucionar el problema"\n` +
            `    }\n` +
            `  ]\n` +
            `}`
        );

    }

    /**
     * Envía los resultados Newman al LLM y retorna el análisis estructurado.
     */
    async analyzeResults(newmanSummary) {

        const stats = {
            requests: newmanSummary.run.stats.requests.total,
            assertions: newmanSummary.run.stats.assertions.total,
            failed: newmanSummary.run.failures.length
        };

        // Si no hay fallos, no hace falta llamar al LLM
        if (stats.failed === 0) {

            return {
                summary: "Todas las pruebas pasaron exitosamente. No se detectaron fallos.",
                overallStatus: "STABLE",
                failures: []
            };

        }

        const failures = this.extractFailures(newmanSummary);
        const prompt = this.buildPrompt(failures, stats);

        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.2
        });

        const content = response.choices[0].message.content.trim();

        // Parsear la respuesta JSON del LLM
        const analysis = JSON.parse(content);

        return analysis;

    }

}

export default new LLMService();
