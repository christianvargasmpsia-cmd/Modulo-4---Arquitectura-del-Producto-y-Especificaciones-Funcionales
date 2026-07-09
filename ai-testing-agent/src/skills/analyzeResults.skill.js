import llmService from "../services/llm.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

class AnalyzeResultsSkill {

    constructor() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.reportsPath = path.resolve(__dirname, "../../reports");
    }

    /**
     * Imprime el análisis del LLM en consola de forma legible.
     */
    printAnalysis(analysis) {

        const statusColors = {
            CRITICAL: "\x1b[31m", // rojo
            DEGRADED: "\x1b[33m", // amarillo
            STABLE:   "\x1b[32m"  // verde
        };

        const priorityColors = {
            CRITICAL: "\x1b[31m",
            HIGH:     "\x1b[33m",
            MEDIUM:   "\x1b[36m",
            LOW:      "\x1b[37m"
        };

        const reset = "\x1b[0m";
        const bold  = "\x1b[1m";

        const statusColor = statusColors[analysis.overallStatus] ?? reset;

        console.log("=================================");
        console.log("Skill: Análisis Inteligente (LLM)");
        console.log("=================================\n");

        console.log(
            `${bold}Estado general: ${statusColor}${analysis.overallStatus}${reset}`
        );
        console.log(`\n${bold}Resumen ejecutivo:${reset}`);
        console.log(`  ${analysis.summary}\n`);

        if (analysis.failures.length === 0) {
            console.log(`${statusColors.STABLE}  ✔ No se detectaron fallos.${reset}\n`);
            return;
        }

        console.log(`${bold}Análisis de fallos:${reset}\n`);

        analysis.failures.forEach((failure, index) => {

            const pColor = priorityColors[failure.priority] ?? reset;

            console.log(
                `  ${index + 1}. ${bold}${failure.test}${reset}`
            );
            console.log(
                `     Prioridad  : ${pColor}${failure.priority}${reset}`
            );
            console.log(
                `     Explicación: ${failure.explanation}`
            );
            console.log(
                `     Sugerencia : ${failure.suggestion}`
            );
            console.log();

        });

    }

    /**
     * Guarda el análisis como JSON en reports/ai-analysis-report.json
     */
    saveReport(analysis) {

        const report = {
            ...analysis,
            timestamp: new Date().toISOString()
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
     * Punto de entrada del skill. Recibe el resultado de NewmanService.
     */
    async execute(newmanResult) {

        console.log("=================================");
        console.log("Analizando resultados con IA...");
        console.log("=================================\n");

        const analysis = await llmService.analyzeResults(
            newmanResult.summary
        );

        this.printAnalysis(analysis);

        this.saveReport(analysis);

        return analysis;

    }

}

export default new AnalyzeResultsSkill();
