import llmService from "../services/llm.service.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


class AnalyzeResultsSkill {

    constructor() {

        const __filename =
            fileURLToPath(import.meta.url);

        const __dirname =
            path.dirname(__filename);

        this.reportsPath =
            path.resolve(
                __dirname,
                "../../reports"
            );

    }


    // ==========================================================
    // NORMALIZAR RESULTADO
    // ==========================================================

    normalizeResult(result = {}) {

        /*
         * NewmanService actualmente genera:
         *
         * {
         *   name,
         *   method,
         *   url,
         *   status,
         *   statusCode,
         *   failed,
         *   responseTime
         * }
         *
         * Versiones anteriores podían utilizar:
         *
         * {
         *   request,
         *   method,
         *   status,
         *   statusCode
         * }
         *
         * Por eso soportamos ambas estructuras.
         */


        const method =
            result.method ??
            result.request?.method ??
            "UNKNOWN";


        const url =
            result.url ??
            result.request?.url ??
            result.request ??
            "UNKNOWN";


        const name =
            result.name ??
            result.test ??
            result.requestName ??
            "Unnamed request";


        const statusCode =
            result.statusCode ??
            result.response?.code ??
            null;


        const status =
            result.status ??
            result.response?.status ??
            "NO RESPONSE";


        const failed =
            typeof result.failed === "boolean"
                ? result.failed
                : (
                    !statusCode ||
                    statusCode >= 400
                );


        const responseTime =
            result.responseTime ??
            result.response?.responseTime ??
            null;


        return {

            ...result,

            name,

            test:
                name,

            method,

            url,

            request:
                url,

            status,

            statusCode,

            failed,

            responseTime

        };

    }


    // ==========================================================
    // NORMALIZAR TODOS
    // ==========================================================

    normalizeResults(
        results = []
    ) {

        if (
            !Array.isArray(
                results
            )
        ) {

            return [];

        }


        return results.map(
            result =>
                this.normalizeResult(
                    result
                )
        );

    }


    // ==========================================================
    // IMPRIMIR FALLAS
    // ==========================================================

    printFailures(
        results = []
    ) {

        const failures =
            results.filter(
                result =>
                    result.failed
            );


        if (
            failures.length === 0
        ) {

            console.log(
                "✓ No existen fallos HTTP para enviar al analizador."
            );

            return;

        }


        console.log(
            "\n🔎 FALLAS ENVIADAS AL ANALIZADOR IA"
        );

        console.log(
            "--------------------------------------------------"
        );


        failures.forEach(
            (
                result,
                index
            ) => {

                console.log(
                    `${index + 1}. ${result.method} ${result.url}`
                );

                console.log(
                    `   Nombre : ${result.name}`
                );

                console.log(
                    `   Status : ${result.statusCode ?? "N/A"} ${
                        result.status ?? ""
                    }`
                );


                if (
                    result.responseTime !== null &&
                    result.responseTime !== undefined
                ) {

                    console.log(
                        `   Tiempo : ${result.responseTime} ms`
                    );

                }


                console.log("");

            }
        );

    }


    // ==========================================================
    // IMPRIMIR ANALISIS
    // ==========================================================

    printAnalysis(
        analysis
    ) {

        const statusColors = {

            CRITICAL:
                "\x1b[31m",

            DEGRADED:
                "\x1b[33m",

            STABLE:
                "\x1b[32m"

        };


        const priorityColors = {

            CRITICAL:
                "\x1b[31m",

            HIGH:
                "\x1b[33m",

            MEDIUM:
                "\x1b[36m",

            LOW:
                "\x1b[37m"

        };


        const reset =
            "\x1b[0m";


        const bold =
            "\x1b[1m";


        const statusColor =
            statusColors[
                analysis.overallStatus
            ] ??
            reset;


        console.log(
            "================================="
        );

        console.log(
            "Skill: Análisis Inteligente (LLM)"
        );

        console.log(
            "=================================\n"
        );


        console.log(
            `${bold}Estado general: ` +
            `${statusColor}` +
            `${analysis.overallStatus}` +
            `${reset}`
        );


        console.log(
            `\n${bold}Resumen ejecutivo:${reset}`
        );


        console.log(
            `  ${
                analysis.summary ??
                "Sin resumen disponible."
            }\n`
        );


        const failures =
            Array.isArray(
                analysis.failures
            )
                ? analysis.failures
                : [];


        if (
            failures.length === 0
        ) {

            console.log(
                `${statusColors.STABLE}` +
                `  ✔ No se detectaron fallos.` +
                `${reset}\n`
            );


            return;

        }


        console.log(
            `${bold}Análisis de fallos:${reset}\n`
        );


        failures.forEach(
            (
                failure,
                index
            ) => {

                const priority =
                    failure.priority ??
                    "MEDIUM";


                const pColor =
                    priorityColors[
                        priority
                    ] ??
                    reset;


                console.log(
                    `  ${index + 1}. ` +
                    `${bold}` +
                    `${failure.test ?? "Unknown test"}` +
                    `${reset}`
                );


                console.log(
                    `     Prioridad  : ` +
                    `${pColor}` +
                    `${priority}` +
                    `${reset}`
                );


                console.log(
                    `     Explicación: ` +
                    `${failure.explanation ?? "Sin explicación"}`
                );


                console.log(
                    `     Sugerencia : ` +
                    `${failure.suggestion ?? "Sin sugerencia"}`
                );


                console.log();

            }
        );

    }


    // ==========================================================
    // GUARDAR REPORTE
    // ==========================================================

    saveReport(
        analysis,
        newmanResult
    ) {

        const normalizedHttpResults =
            this.normalizeResults(
                newmanResult.httpResults ?? []
            );


        const report = {

            timestamp:
                new Date().toISOString(),


            // ----------------------------------------------
            // ANALISIS IA
            // ----------------------------------------------

            analysis,


            // ----------------------------------------------
            // METRICAS NEWMAN
            // ----------------------------------------------

            testExecution: {

                requests:
                    newmanResult.requests ??
                    0,

                assertions:
                    newmanResult.assertions ??
                    0,

                failed:
                    newmanResult.failed ??
                    0,

                httpFailures:
                    newmanResult.httpFailures ??
                    0,

                assertionFailures:
                    newmanResult.assertionFailures ??
                    0

            },


            // ----------------------------------------------
            // RESULTADOS HTTP
            // ----------------------------------------------

            httpResults:
                normalizedHttpResults

        };


        if (
            !fs.existsSync(
                this.reportsPath
            )
        ) {

            fs.mkdirSync(
                this.reportsPath,
                {
                    recursive: true
                }
            );

        }


        const reportPath =
            path.join(
                this.reportsPath,
                "ai-analysis-report.json"
            );


        fs.writeFileSync(

            reportPath,

            JSON.stringify(
                report,
                null,
                2
            ),

            "utf-8"

        );


        console.log(
            `Reporte guardado en: ` +
            `reports/ai-analysis-report.json\n`
        );

    }


    // ==========================================================
    // EJECUTE
    // ==========================================================

    async execute(
        newmanResult
    ) {

        console.log(
            "================================="
        );

        console.log(
            "Analizando resultados con IA..."
        );

        console.log(
            "=================================\n"
        );


        // ======================================================
        // VALIDAR RESULTADO NEWMAN
        // ======================================================

        if (
            !newmanResult
        ) {

            throw new Error(
                "AnalyzeResultsSkill recibió un resultado Newman vacío."
            );

        }


        // ======================================================
        // NORMALIZAR RESULTADOS
        // ======================================================

        const normalizedHttpResults =
            this.normalizeResults(
                newmanResult.httpResults ?? []
            );


        // ======================================================
        // CALCULAR FALLAS REALES
        // ======================================================

        const realHttpFailures =
            normalizedHttpResults.filter(
                result =>
                    result.failed
            );


        // ======================================================
        // RESULTADO PARA IA
        // ======================================================

        const resultsForAI = {

            requests:
                newmanResult.requests ??
                normalizedHttpResults.length,


            assertions:
                newmanResult.assertions ??
                0,


            failed:
                newmanResult.failed ??
                realHttpFailures.length,


            httpFailures:
                newmanResult.httpFailures ??
                realHttpFailures.length,


            assertionFailures:
                newmanResult.assertionFailures ??
                0,


            httpResults:
                normalizedHttpResults

        };


        // ======================================================
        // MOSTRAR FALLAS
        // ======================================================

        if (
            resultsForAI.httpFailures > 0
        ) {

            console.log(
                `⚠️ Se detectaron ` +
                `${resultsForAI.httpFailures} ` +
                `errores HTTP.\n`
            );


            this.printFailures(
                normalizedHttpResults
            );

        }
        else {

            console.log(
                "✓ Newman no reportó errores HTTP.\n"
            );

        }


        // ======================================================
        // DEBUG DE DATOS ENVIADOS
        // ======================================================

        console.log(
            "\n📦 DATOS NORMALIZADOS PARA IA"
        );

        console.log(
            "--------------------------------------------------"
        );


        normalizedHttpResults.forEach(
            (
                result,
                index
            ) => {

                console.log(

                    `${index + 1}. ` +

                    `${result.method} ` +

                    `${result.url} ` +

                    `→ ` +

                    `${result.statusCode ?? "N/A"}`

                );

            }
        );


        console.log(
            "--------------------------------------------------"
        );


        // ======================================================
        // LLAMAR AL LLM
        // ======================================================

        let analysis;


        try {

            analysis =
                await llmService.analyzeResults(
                    resultsForAI
                );

        }
        catch (error) {

            console.error(
                "\n❌ Error durante el análisis IA:"
            );

            console.error(
                error.message
            );


            // ----------------------------------------------
            // FALLBACK
            // ----------------------------------------------

            analysis =
                this.createFallbackAnalysis(
                    resultsForAI
                );

        }


        // ======================================================
        // VALIDAR RESPUESTA DEL LLM
        // ======================================================

        if (
            !analysis ||
            typeof analysis !==
            "object"
        ) {

            analysis =
                this.createFallbackAnalysis(
                    resultsForAI
                );

        }


        if (
            !Array.isArray(
                analysis.failures
            )
        ) {

            analysis.failures =
                [];

        }


        // ======================================================
        // PROTECCIÓN STABLE
        // ======================================================

        if (

            resultsForAI.failed > 0 &&

            analysis.overallStatus ===
                "STABLE"

        ) {

            analysis.overallStatus =
                resultsForAI.failed >= 3
                    ? "CRITICAL"
                    : "DEGRADED";


            analysis.summary =
                `Se detectaron ` +
                `${resultsForAI.failed} ` +
                `fallos durante la ejecución ` +
                `de las pruebas.`;


            if (
                analysis.failures.length === 0
            ) {

                analysis.failures =
                    this.buildFallbackFailures(
                        normalizedHttpResults
                    );

            }

        }


        // ======================================================
        // SI LLM NO DEVUELVE ESTADO
        // ======================================================

        if (
            !analysis.overallStatus
        ) {

            analysis.overallStatus =

                resultsForAI.failed > 0

                    ? (
                        resultsForAI.failed >= 3
                            ? "CRITICAL"
                            : "DEGRADED"
                    )

                    : "STABLE";

        }


        // ======================================================
        // SI NO HAY SUMMARY
        // ======================================================

        if (
            !analysis.summary
        ) {

            analysis.summary =

                resultsForAI.failed > 0

                    ? `Se detectaron ${
                        resultsForAI.failed
                    } fallos durante la ejecución.`

                    : "Todas las pruebas finalizaron correctamente.";

        }


        // ======================================================
        // IMPRIMIR
        // ======================================================

        this.printAnalysis(
            analysis
        );


        // ======================================================
        // GUARDAR
        // ======================================================

        this.saveReport(

            analysis,

            {

                ...newmanResult,

                httpResults:
                    normalizedHttpResults

            }

        );


        // ======================================================
        // RETURN
        // ======================================================

        return analysis;

    }


    // ==========================================================
    // FALLBACK ANALYSIS
    // ==========================================================

    createFallbackAnalysis(
        results
    ) {

        const failures =
            this.buildFallbackFailures(
                results.httpResults ?? []
            );


        const failed =
            results.failed ??
            failures.length;


        return {

            overallStatus:

                failed === 0

                    ? "STABLE"

                    : failed >= 3
                        ? "CRITICAL"
                        : "DEGRADED",


            summary:

                failed === 0

                    ? "Todas las pruebas finalizaron correctamente."

                    : `Se detectaron ${
                        failed
                    } fallos durante la ejecución.`,


            failures

        };

    }


    // ==========================================================
    // FALLBACK FAILURES
    // ==========================================================

    buildFallbackFailures(
        results = []
    ) {

        return results

            .filter(
                result =>
                    result.failed
            )

            .map(
                result => {

                    const statusCode =
                        Number(
                            result.statusCode ??
                            0
                        );


                    let priority =
                        "MEDIUM";


                    if (
                        statusCode >= 500
                    ) {

                        priority =
                            "CRITICAL";

                    }
                    else if (
                        statusCode >= 400
                    ) {

                        priority =
                            "HIGH";

                    }


                    const testName =
                        result.name ??
                        `${result.method} ${result.url}`;


                    const endpoint =
                        `${result.method} ${result.url}`;


                    return {

                        test:
                            testName,


                        priority,


                        explanation:
                            `El endpoint ${endpoint} ` +
                            `respondió con HTTP ` +
                            `${statusCode} ` +
                            `${result.status ?? ""}.`,


                        suggestion:
                            statusCode >= 500

                                ? "Revisar logs del backend, DTO, validaciones, base de datos y excepciones del endpoint."

                                : "Revisar los datos enviados y el contrato esperado por el endpoint."

                    };

                }
            );

    }

}


export default new AnalyzeResultsSkill();