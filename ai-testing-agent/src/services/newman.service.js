import newman from "newman";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

class NewmanService {

    constructor() {

        const __filename =
            fileURLToPath(import.meta.url);

        const __dirname =
            path.dirname(__filename);

        this.projectRoot =
            path.resolve(
                __dirname,
                "../../"
            );

        this.collectionPath =
            path.join(
                this.projectRoot,
                "collections",
                "openapi-collection.json"
            );

        this.reportsPath =
            path.join(
                this.projectRoot,
                "reports"
            );

        /*
         * Nos aseguramos de que exista
         * la carpeta de reportes.
         */
        if (!fs.existsSync(this.reportsPath)) {

            fs.mkdirSync(
                this.reportsPath,
                {
                    recursive: true
                }
            );
        }
    }


    /*
     * ==========================================================
     * EJECUTAR COLLECTION
     * ==========================================================
     */

    async runCollection() {

        console.log(
            "================================="
        );

        console.log(
            "Ejecutando Newman"
        );

        console.log(
            "=================================\n"
        );

        /*
         * Validación de collection.
         */
        if (
            !fs.existsSync(
                this.collectionPath
            )
        ) {

            throw new Error(
                `No se encontró la colección de Postman: ` +
                `${this.collectionPath}`
            );
        }

        return new Promise(
            (resolve, reject) => {

                newman.run(

                    {

                        /*
                         * Collection real.
                         */
                        collection:
                            this.collectionPath,

                        /*
                         * Reporters.
                         */
                        reporters: [
                            "cli",
                            "json"
                        ],

                        reporter: {

                            json: {

                                export:
                                    path.join(
                                        this.reportsPath,
                                        "newman-report.json"
                                    )
                            }
                        }

                    },

                    (
                        error,
                        summary
                    ) => {

                        /*
                         * Newman puede devolver error
                         * de ejecución.
                         */
                        if (error) {

                            return reject(
                                error
                            );
                        }


                        /*
                         * ==================================================
                         * EXECUTIONS
                         * ==================================================
                         */

                        const executions =
                            summary
                                ?.run
                                ?.executions ??
                            [];


                        /*
                         * ==================================================
                         * REQUESTS
                         * ==================================================
                         */

                        const requests =
                            summary
                                ?.run
                                ?.stats
                                ?.requests
                                ?.total ??
                            executions.length ??
                            0;


                        /*
                         * ==================================================
                         * ASSERTIONS
                         * ==================================================
                         */

                        const assertions =
                            summary
                                ?.run
                                ?.stats
                                ?.assertions
                                ?.total ??
                            0;


                        /*
                         * ==================================================
                         * ASSERTION FAILURES
                         * ==================================================
                         */

                        const assertionFailures =
                            summary
                                ?.run
                                ?.failures
                                ?.length ??
                            0;


                        /*
                         * ==================================================
                         * ANALIZAR RESPUESTAS HTTP
                         * ==================================================
                         *
                         * Newman puede no marcar como failure
                         * una respuesta 4xx/5xx cuando no existen
                         * assertions.
                         *
                         * Por eso analizamos explícitamente
                         * los códigos HTTP.
                         */

                        const httpResults =
                            executions.map(
                                (execution, index) => {

                                    const response =
                                        execution?.response;

                                    const request =
                                        execution?.request;

                                    const item =
                                        execution?.item;


                                    const statusCode =
                                        response?.code ??
                                        null;


                                    const failed =
                                        !response ||
                                        (
                                            statusCode !== null &&
                                            statusCode >= 400
                                        );


                                    return {

                                        id:
                                            index + 1,

                                        test:
                                            item?.name ??
                                            "Unknown request",

                                        request:
                                            item?.name ??
                                            "Unknown request",

                                        method:
                                            request?.method ??
                                            "UNKNOWN",

                                        url:
                                            request?.url
                                                ?.toString?.() ??
                                            "",

                                        status:
                                            response?.status ??
                                            "NO RESPONSE",

                                        statusCode,

                                        failed,

                                        responseTime:
                                            response?.responseTime ??
                                            null

                                    };

                                }
                            );


                        /*
                         * ==================================================
                         * HTTP FAILURES
                         * ==================================================
                         */

                        const httpFailures =
                            httpResults.filter(
                                result =>
                                    result.failed
                            );


                        /*
                         * ==================================================
                         * FAILED TOTAL
                         * ==================================================
                         *
                         * Un request HTTP 4xx/5xx debe contar
                         * como fallo aunque no tenga assertion.
                         *
                         * No sumamos:
                         *
                         * httpFailures + assertionFailures
                         *
                         * porque el mismo request podría aparecer
                         * en ambos grupos.
                         *
                         * Tomamos el número real de ejecuciones
                         * fallidas.
                         */

                        const failed =
                            httpFailures.length;


                        /*
                         * ==================================================
                         * RESULTADO FINAL
                         * ==================================================
                         */

                        const result = {

                            requests,

                            assertions,

                            failed,

                            httpFailures:
                                httpFailures.length,

                            assertionFailures,

                            httpResults,

                            summary

                        };


                        /*
                         * ==================================================
                         * LOG
                         * ==================================================
                         */

                        console.log(
                            "\nResultado Newman:"
                        );

                        console.log(
                            `Requests      : ${requests}`
                        );

                        console.log(
                            `Assertions    : ${assertions}`
                        );

                        console.log(
                            `HTTP failures : ${httpFailures.length}`
                        );

                        console.log(
                            `Failed        : ${failed}`
                        );


                        /*
                         * Mostrar fallos.
                         */

                        if (
                            httpFailures.length > 0
                        ) {

                            console.log(
                                "\nFallos detectados:"
                            );

                            httpFailures.forEach(
                                failure => {

                                    console.log(
                                        `  ${failure.method} ` +
                                        `${failure.url || failure.request} ` +
                                        `→ HTTP ${failure.statusCode ?? "N/A"}`
                                    );

                                }
                            );
                        }


                        resolve(
                            result
                        );

                    }
                );

            }
        );
    }
}

export default new NewmanService();