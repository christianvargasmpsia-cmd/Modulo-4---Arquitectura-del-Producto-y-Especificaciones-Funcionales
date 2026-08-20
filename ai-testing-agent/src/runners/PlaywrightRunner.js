import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

import RunnerResult from "./RunnerResult.js";
import { Logger } from "../utils/Logger.js";

const execute = promisify(exec);

class PlaywrightRunner {

    async run(specs = []) {

        Logger.title("Playwright Runner");

        try {

            /*
             * ======================================================
             * DIRECTORIO DEL PROYECTO
             * ======================================================
             */

            const __filename =
                fileURLToPath(import.meta.url);

            const __dirname =
                path.dirname(__filename);

            const projectRoot =
                path.resolve(
                    __dirname,
                    "../../"
                );

            const generatedTestsDir =
                path.join(
                    projectRoot,
                    "generated-tests"
                );

            /*
             * ======================================================
             * NORMALIZAR SPECS
             * ======================================================
             */

            let specArguments = "";

            if (
                Array.isArray(specs) &&
                specs.length > 0
            ) {

                /*
                 * Convertimos las rutas absolutas:
                 *
                 * C:\...\generated-tests\test.spec.js
                 *
                 * en:
                 *
                 * test.spec.js
                 *
                 * porque playwright.config.js utiliza:
                 *
                 * testDir: "./generated-tests"
                 */

                const relativeSpecs =
                    specs.map(spec => {

                        const absolutePath =
                            path.resolve(spec);

                        const relativePath =
                            path.relative(
                                generatedTestsDir,
                                absolutePath
                            );

                        /*
                         * Playwright utiliza / incluso
                         * en Windows.
                         */

                        return relativePath
                            .replace(/\\/g, "/");

                    });

                /*
                 * Cada archivo va entre comillas
                 * para evitar problemas con espacios
                 * en las rutas.
                 */

                specArguments =
                    relativeSpecs
                        .map(spec => `"${spec}"`)
                        .join(" ");

            }

            /*
             * ======================================================
             * COMANDO
             * ======================================================
             */

            const command =
                specArguments

                    ? `npx playwright test ${specArguments} --reporter=json`

                    : `npx playwright test --reporter=json`;

            Logger.info(
                `Executing: ${command}`
            );

            /*
             * ======================================================
             * EJECUTAR PLAYWRIGHT
             * ======================================================
             *
             * IMPORTANTE:
             *
             * cwd = projectRoot
             *
             * Esto garantiza que:
             *
             * playwright.config.js
             *
             * sea encontrado correctamente.
             */

            const {
                stdout,
                stderr
            } = await execute(
                command,
                {
                    cwd: projectRoot,
                    maxBuffer: 10 * 1024 * 1024
                }
            );

            /*
             * ======================================================
             * STDOUT
             * ======================================================
             */

            if (
                stdout &&
                stdout.trim() !== ""
            ) {

                console.log(
                    "\n========== PLAYWRIGHT STDOUT ==========\n"
                );

                console.log(stdout);

                console.log(
                    "\n=======================================\n"
                );
            }

            /*
             * ======================================================
             * STDERR
             * ======================================================
             */

            if (
                stderr &&
                stderr.trim() !== ""
            ) {

                console.log(
                    "\n========== PLAYWRIGHT STDERR ==========\n"
                );

                console.log(stderr);

                console.log(
                    "\n=======================================\n"
                );
            }

            Logger.success(
                "Execution finished."
            );

            /*
             * ======================================================
             * PARSE
             * ======================================================
             */

            return this.parse(stdout);

        } catch (error) {

            /*
             * ======================================================
             * PLAYWRIGHT FALLÓ
             * ======================================================
             *
             * IMPORTANTE:
             *
             * Exit code != 0 NO necesariamente significa
             * que el Runner falló.
             *
             * Puede significar simplemente:
             *
             *     Tests fallidos.
             *
             * Si existe stdout con JSON,
             * debemos analizarlo.
             */

            Logger.warning(
                "Playwright terminó con tests fallidos."
            );

            /*
             * Intentar parsear stdout antes
             * de lanzar el error.
             */

            if (
                error.stdout &&
                error.stdout.trim() !== ""
            ) {

                console.log(
                    "\n========== PLAYWRIGHT STDOUT ==========\n"
                );

                console.log(
                    error.stdout
                );

                console.log(
                    "\n=======================================\n"
                );

                const parsed =
                    this.parse(
                        error.stdout
                    );

                /*
                 * Si Playwright produjo un JSON válido,
                 * devolvemos el resultado.
                 */

                if (
                    parsed &&
                    (
                        parsed.total > 0 ||
                        parsed.failed > 0 ||
                        parsed.passed > 0 ||
                        parsed.skipped > 0
                    )
                ) {

                    return parsed;
                }
            }

            /*
             * Mostrar stderr si existe.
             */

            if (
                error.stderr &&
                error.stderr.trim() !== ""
            ) {

                console.log(
                    "\n========== PLAYWRIGHT STDERR ==========\n"
                );

                console.log(
                    error.stderr
                );

                console.log(
                    "\n=======================================\n"
                );
            }

            /*
             * Si realmente no existe ningún resultado
             * válido, entonces sí propagamos el error.
             */

            Logger.error(
                "Playwright execution failed."
            );

            console.log(
                "\n========== PLAYWRIGHT ERROR ==========\n"
            );

            console.log(
                "Message:"
            );

            console.log(
                error.message
            );

            console.log(
                "\n======================================\n"
            );

            throw error;
        }
    }


    /*
     * ==========================================================
     * PARSE PLAYWRIGHT JSON
     * ==========================================================
     */

    parse(jsonOutput) {

        const report =
            new RunnerResult();

        if (
            !jsonOutput ||
            jsonOutput.trim() === ""
        ) {

            return report;
        }

        try {

            /*
             * ==================================================
             * EXTRAER JSON
             * ==================================================
             *
             * Playwright normalmente devuelve JSON puro,
             * pero pueden existir logs antes/después.
             *
             * Intentamos primero parse directo.
             */

            let data;

            try {

                data =
                    JSON.parse(
                        jsonOutput
                    );

            } catch {

                /*
                 * Buscar el primer {
                 * y el último }.
                 */

                const firstBrace =
                    jsonOutput.indexOf("{");

                const lastBrace =
                    jsonOutput.lastIndexOf("}");

                if (
                    firstBrace === -1 ||
                    lastBrace === -1
                ) {

                    throw new Error(
                        "No se encontró JSON válido."
                    );
                }

                const json =
                    jsonOutput.substring(
                        firstBrace,
                        lastBrace + 1
                    );

                data =
                    JSON.parse(json);
            }

            /*
             * ==================================================
             * DURACIÓN
             * ==================================================
             */

            report.duration =
                data.stats?.duration || 0;

            /*
             * ==================================================
             * PROCESAR SUITES
             * ==================================================
             */

            if (
                Array.isArray(
                    data.suites
                )
            ) {

                this.processSuites(
                    data.suites,
                    report
                );
            }

        } catch (error) {

            Logger.warning(
                "Unable to parse Playwright JSON output."
            );

            console.log(
                "Parse error:",
                error.message
            );
        }

        return report;
    }


    /*
     * ==========================================================
     * PROCESAR SUITES
     * ==========================================================
     */

    processSuites(
        suites,
        report
    ) {

        for (
            const suite of suites
        ) {

            /*
             * ==================================================
             * SPECS
             * ==================================================
             */

            if (
                Array.isArray(
                    suite.specs
                )
            ) {

                for (
                    const spec of suite.specs
                ) {

                    if (
                        !Array.isArray(
                            spec.tests
                        )
                    ) {

                        continue;
                    }

                    for (
                        const test of spec.tests
                    ) {

                        /*
                         * Playwright puede tener
                         * múltiples results por retry.
                         *
                         * Tomamos el último resultado.
                         */

                        const results =
                            Array.isArray(
                                test.results
                            )
                                ? test.results
                                : [];

                        const result =
                            results.length > 0
                                ? results[
                                    results.length - 1
                                ]
                                : {};

                        /*
                         * ==================================================
                         * CONTADORES
                         * ==================================================
                         */

                        report.total++;

                        switch (
                            result.status
                        ) {

                            case "passed":

                                report.passed++;

                                break;

                            case "failed":

                                report.failed++;

                                break;

                            case "timedOut":

                                report.failed++;

                                break;

                            case "skipped":

                                report.skipped++;

                                break;

                            default:

                                report.skipped++;

                                break;
                        }

                        /*
                         * ==================================================
                         * ERROR
                         * ==================================================
                         */

                        let errorMessage = "";

                        if (
                            result.error?.message
                        ) {

                            errorMessage =
                                result.error.message;

                        } else if (
                            Array.isArray(
                                result.errors
                            ) &&
                            result.errors.length > 0
                        ) {

                            errorMessage =
                                result.errors[0]?.message ||
                                "";
                        }

                        /*
                         * ==================================================
                         * TEST
                         * ==================================================
                         */

                        report.tests.push({

                            id:
                                report.total,

                            title:
                                test.title ||
                                spec.title ||
                                "Unknown test",

                            status:
                                result.status ||
                                "unknown",

                            duration:
                                result.duration ||
                                0,

                            error:
                                errorMessage,

                            file:
                                spec.file ||
                                suite.file ||
                                ""

                        });
                    }
                }
            }

            /*
             * ==================================================
             * SUITES ANIDADAS
             * ==================================================
             */

            if (
                Array.isArray(
                    suite.suites
                )
            ) {

                this.processSuites(
                    suite.suites,
                    report
                );
            }
        }
    }
}


/*
 * ==========================================================
 * SINGLETON
 * ==========================================================
 */

export default new PlaywrightRunner();