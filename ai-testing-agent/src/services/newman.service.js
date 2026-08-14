import newman from "newman";
import path from "path";
import { fileURLToPath } from "url";

class NewmanService {

    constructor() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        this.projectRoot = path.resolve(__dirname, "../../");
    }

    async runCollection() {

        const collectionPath = path.join(
            this.projectRoot,
            "collections",
            "openapi-collection.json"
        );

        const reportsPath = path.join(
            this.projectRoot,
            "reports"
        );

        return new Promise((resolve, reject) => {

            newman.run(
                {
                    collection: collectionPath,

                    reporters: [
                        "cli",
                        "json"
                    ],

                    reporter: {
                        json: {
                            export: path.join(
                                reportsPath,
                                "newman-report.json"
                            )
                        }
                    }
                },

                (error, summary) => {

                    if (error) {
                        return reject(error);
                    }

                    const executions =
                        summary?.run?.executions ?? [];

                    /*
                     * Newman puede no registrar como "failure"
                     * una respuesta HTTP 4xx/5xx si la colección
                     * no tiene assertions.
                     *
                     * Por eso analizamos también los códigos HTTP.
                     */

                    const httpFailures = executions.filter(execution => {

                        const response = execution?.response;

                        if (!response) {
                            return true;
                        }

                        const statusCode = response.code;

                        return statusCode >= 400;

                    });

                    const assertionFailures =
                        summary?.run?.failures?.length ?? 0;

                    /*
                     * Un fallo HTTP también cuenta como fallo
                     * del test.
                     *
                     * Usamos Set para evitar contar dos veces
                     * la misma ejecución si Newman ya la registró
                     * como failure.
                     */

                    const failedExecutions = new Set();

                    httpFailures.forEach(execution => {
                        failedExecutions.add(execution);
                    });

                    /*
                     * Si Newman registró failures pero no podemos
                     * asociarlos directamente a executions,
                     * los agregamos al contador.
                     */

                    const failed =
                        Math.max(
                            failedExecutions.size,
                            assertionFailures
                        );

                    const requests =
                        summary?.run?.stats?.requests?.total ?? 0;

                    const assertions =
                        summary?.run?.stats?.assertions?.total ?? 0;

                    /*
                     * Información adicional para el AI Analyzer.
                     */

                    const httpResults = executions.map(execution => {

                        const response = execution?.response;

                        return {
                            request:
                                execution?.item?.name ?? "Unknown request",

                            method:
                                execution?.request?.method ??
                                response?.request?.method ??
                                "UNKNOWN",

                            status:
                                response?.status ??
                                "NO RESPONSE",

                            statusCode:
                                response?.code ??
                                null,

                            failed:
                                !response ||
                                response.code >= 400
                        };

                    });

                    resolve({

                        requests,

                        assertions,

                        failed,

                        httpFailures: httpFailures.length,

                        assertionFailures,

                        httpResults,

                        summary

                    });

                }
            );

        });

    }

}

export default new NewmanService();