import llmService from "../services/llm.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

class AnalyzeResultsSkill {

    constructor() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        this.reportsPath = path.resolve(
            __dirname,
            "../../reports"
        );
    }

    /**
     * Imprime el análisis del LLM en consola.
     */
    printAnalysis(analysis) {

        const statusColors = {
            CRITICAL: "\x1b[31m",
            DEGRADED: "\x1b[33m",
            STABLE: "\x1b[32m"
        };

        const priorityColors = {
            CRITICAL: "\x1b[31m",
            HIGH: "\x1b[33m",
            MEDIUM: "\x1b[36m",
            LOW: "\x1b[37m"
        };

        const reset = "\x1b[0m";
        const bold = "\x1b[1m";

        const statusColor =
            statusColors[analysis.overallStatus] ?? reset;

        console.log("=================================");
        console.log("Skill: Análisis Inteligente (LLM)");
        console.log("=================================\n");

        console.log(
            `${bold}Estado general: ${statusColor}${analysis.overallStatus}${reset}`
        );

        console.log(`\n${bold}Resumen ejecutivo:${reset}`);
        console.log(`  ${analysis.summary}\n`);

        const failures = Array.isArray(analysis.failures)
            ? analysis.failures
            : [];

        if (failures.length === 0) {

            console.log(
                `${statusColors.STABLE}  ✔ No se detectaron fallos.${reset}\n`
            );

            return;
        }

        console.log(
            `${bold}Análisis de fallos:${reset}\n`
        );

        failures.forEach((failure, index) => {

            const priority =
                failure.priority ?? "MEDIUM";

            const pColor =
                priorityColors[priority] ?? reset;

            console.log(
                `  ${index + 1}. ${bold}${failure.test ?? "Unknown test"}${reset}`
            );

            console.log(
                `     Prioridad  : ${pColor}${priority}${reset}`
            );

            console.log(
                `     Explicación: ${failure.explanation ?? "Sin explicación"}`
            );

            console.log(
                `     Sugerencia : ${failure.suggestion ?? "Sin sugerencia"}`
            );

            console.log();

        });

    }

    /**
     * Guarda el análisis como JSON.
     */
    saveReport(analysis, newmanResult) {

        const report = {

            timestamp: new Date().toISOString(),

            // Resumen del análisis realizado por IA
            analysis,

            // Métricas reales de Newman
            testExecution: {
                requests: newmanResult.requests,
                assertions: newmanResult.assertions,
                failed: newmanResult.failed,
                httpFailures: newmanResult.httpFailures,
                assertionFailures: newmanResult.assertionFailures
            },

            // Resultado individual de cada request
            httpResults: newmanResult.httpResults ?? []

        };

        const reportPath = path.join(
            this.reportsPath,
            "ai-analysis-report.json"
        );

        fs.writeFileSync(
            reportPath,
            JSON.stringify(report, null, 2),
            "utf-8"
        );

        console.log(
            `Reporte guardado en: reports/ai-analysis-report.json\n`
        );
    }

    /**
     * Punto de entrada del skill.
     *
     * Recibe el resultado completo de NewmanService.
     */
    async execute(newmanResult) {

        console.log("=================================");
        console.log("Analizando resultados con IA...");
        console.log("=================================\n");

        /*
         * Construimos un objeto reducido con la información
         * que realmente necesita el LLM.
         *
         * Importante:
         * NO enviamos solamente summary.
         */
        const resultsForAI = {

            requests: newmanResult.requests,

            assertions: newmanResult.assertions,

            failed: newmanResult.failed,

            httpFailures:
                newmanResult.httpFailures ?? 0,

            assertionFailures:
                newmanResult.assertionFailures ?? 0,

            httpResults:
                newmanResult.httpResults ?? []

        };

        /*
         * Si existen errores HTTP, los mostramos antes
         * de llamar al LLM para poder verificar fácilmente
         * qué información está recibiendo el analizador.
         */
        if (resultsForAI.httpFailures > 0) {

            console.log(
                `⚠️ Se detectaron ${resultsForAI.httpFailures} errores HTTP.\n`
            );

            resultsForAI.httpResults
                .filter(result => result.failed)
                .forEach(result => {

                    console.log(
                        `   ${result.method} ${result.request}`
                    );

                    console.log(
                        `   → ${result.statusCode} ${result.status}\n`
                    );

                });
        }

        const analysis =
            await llmService.analyzeResults(
                resultsForAI
            );

        /*
         * Protección adicional:
         *
         * Si Newman detectó fallos pero el LLM devuelve
         * STABLE por alguna razón, NO permitimos que el
         * reporte final diga que todo está bien.
         */
        if (
            resultsForAI.failed > 0 &&
            analysis.overallStatus === "STABLE"
        ) {

            analysis.overallStatus =
                resultsForAI.failed >= 3
                    ? "CRITICAL"
                    : "DEGRADED";

            analysis.summary =
                `Se detectaron ${resultsForAI.failed} ` +
                `fallos durante la ejecución de las pruebas.`;

            if (
                !Array.isArray(analysis.failures) ||
                analysis.failures.length === 0
            ) {

                analysis.failures =
                    resultsForAI.httpResults
                        .filter(result => result.failed)
                        .map(result => ({

                            test:
                                result.request,

                            priority:
                                result.statusCode >= 500
                                    ? "CRITICAL"
                                    : result.statusCode >= 400
                                        ? "HIGH"
                                        : "MEDIUM",

                            explanation:
                                `El endpoint respondió con HTTP ` +
                                `${result.statusCode} ${result.status}.`,

                            suggestion:
                                "Revisar el endpoint, sus datos de entrada " +
                                "y la respuesta del backend."

                        }));
            }
        }

        this.printAnalysis(analysis);

        this.saveReport(
            analysis,
            newmanResult
        );

        return analysis;

    }

}

export default new AnalyzeResultsSkill();