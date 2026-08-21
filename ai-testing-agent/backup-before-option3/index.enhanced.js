import readline from "readline";

import MCPPostmanAgent
    from "./agents/postman.agent.enhanced.js";

import PlaywrightTestingAgent
    from "./agents/playwright.agent.enhanced.js";

import { Logger }
    from "./utils/Logger.js";


/*
 * ==========================================================
 * READLINE
 * ==========================================================
 */

const rl =
    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


/*
 * ==========================================================
 * FEATURES DEL PRODUCTO
 * ==========================================================
 */

const PLAYWRIGHT_FEATURES = [

    {
        id: "FT-001",

        title: "User Login",

        description:
            "El usuario inicia sesión en UMSS Market " +
            "utilizando sus credenciales.",

        userStory:
            "Como usuario de UMSS Market quiero iniciar " +
            "sesión para acceder a mi cuenta.",

        acceptanceCriteria: [

            "Debe mostrarse el formulario de inicio de sesión",

            "El usuario debe poder ingresar su correo electrónico",

            "El usuario debe poder ingresar su contraseña",

            "El usuario debe poder enviar el formulario",

            "Después de autenticarse debe acceder al sistema"

        ]
    },

    {
        id: "FT-002",

        title: "Search Products",

        description:
            "El usuario busca publicaciones y productos " +
            "dentro del catálogo de UMSS Market.",

        userStory:
            "Como comprador quiero buscar productos " +
            "para encontrar publicaciones disponibles.",

        acceptanceCriteria: [

            "Debe mostrarse el buscador de productos",

            "El usuario debe poder ingresar un término de búsqueda",

            "La aplicación debe ejecutar la búsqueda",

            "Deben mostrarse los resultados encontrados"

        ]
    },

    {
        id: "FT-003",

        title: "Create Order",

        description:
            "El usuario selecciona productos y crea " +
            "un pedido dentro de UMSS Market.",

        userStory:
            "Como comprador quiero crear un pedido " +
            "para completar una compra.",

        acceptanceCriteria: [

            "El usuario debe poder seleccionar un producto",

            "El producto debe poder agregarse al carrito",

            "El carrito debe mostrar los productos seleccionados",

            "El usuario debe poder iniciar el proceso de compra",

            "Debe generarse el flujo correspondiente al pedido"

        ]
    }

];


/*
 * ==========================================================
 * MENU PRINCIPAL
 * ==========================================================
 */

async function showMainMenu() {

    console.clear();

    Logger.title(
        "🚀 UMSS MARKET AI TESTING PLATFORM"
    );

    console.log(
        "\n┌─────────────────────────────────────┐"
    );

    console.log(
        "│  1. 🔍 MCP Postman Agent            │"
    );

    console.log(
        "│  2. 🎭 AI Playwright Testing Agent  │"
    );

    console.log(
        "│  3. 🔄 Ejecutar Pipeline Completo   │"
    );

    console.log(
        "│  0. ❌ Salir                         │"
    );

    console.log(
        "└─────────────────────────────────────┘\n"
    );
}


/*
 * ==========================================================
 * MCP POSTMAN
 * ==========================================================
 */

async function executeMCPPostman() {

    try {

        Logger.info(
            "Iniciando MCP Postman Agent...\n"
        );

        const result =
            await MCPPostmanAgent.start(
                "UMSS Market"
            );


        if (!result) {

            Logger.error(
                "❌ MCP Postman Agent no devolvió resultado."
            );

            promptContinue();

            return;
        }


        if (result.success) {

            Logger.success(
                "\n✓ MCP Postman Agent ejecutado exitosamente"
            );

            console.log(
                `  - Workspace: ${
                    result.workspace ??
                    "N/A"
                }`
            );

            console.log(
                `  - Collections: ${
                    result.collections ??
                    "N/A"
                }`
            );

            console.log(
                `  - Estado: ${
                    result.analysis?.overallStatus ??
                    "N/A"
                }`
            );

        }
        else {

            Logger.error(
                `✗ Error: ${
                    result.error ??
                    "Error desconocido"
                }`
            );
        }

    }
    catch (error) {

        Logger.error(
            `✗ Error ejecutando MCP Postman Agent: ${
                error?.message ??
                String(error)
            }`
        );

    }

    promptContinue();
}


/*
 * ==========================================================
 * PLAYWRIGHT
 * ==========================================================
 */

async function executePlaywright() {

    try {

        Logger.info(
            "Iniciando AI Playwright Testing Agent...\n"
        );

        const result =
            await PlaywrightTestingAgent.execute(
                PLAYWRIGHT_FEATURES
            );


        if (!result) {

            Logger.error(
                "❌ AI Playwright Testing Agent no devolvió resultado."
            );

            promptContinue();

            return;
        }


        if (result.success) {

            Logger.success(
                "\n✓ AI Playwright Testing Agent ejecutado exitosamente"
            );

            console.log(
                `  - Features procesadas: ${
                    result.featuresProcessed ??
                    0
                }`
            );

            console.log(
                `  - Specs generados: ${
                    result.specsGenerated ??
                    0
                }`
            );

            console.log(
                `  - Total de pruebas: ${
                    result.results?.total ??
                    0
                }`
            );

            console.log(
                `  - Pasadas: ${
                    result.results?.passed ??
                    0
                }`
            );

            console.log(
                `  - Fallidas: ${
                    result.results?.failed ??
                    0
                }`
            );

        }
        else {

            Logger.error(
                `✗ Error: ${
                    result.error ??
                    "Error desconocido"
                }`
            );
        }

    }
    catch (error) {

        Logger.error(
            `✗ Error ejecutando AI Playwright Testing Agent: ${
                error?.message ??
                String(error)
            }`
        );

    }

    promptContinue();
}


/*
 * ==========================================================
 * PIPELINE COMPLETO
 * ==========================================================
 *
 * IMPORTANTE:
 *
 * La Opción 3 NO considera que el agente haya fallado
 * solamente porque existan pruebas fallidas.
 *
 * Diferenciamos:
 *
 * 1. FALLA DEL AGENTE
 *    → detener pipeline
 *
 * 2. FALLA DE UNA PRUEBA
 *    → registrar resultado
 *    → analizar con IA
 *    → continuar pipeline
 *
 * Esto permite la verdadera orquestación:
 *
 * Postman
 *    ↓
 * Analyzer IA
 *    ↓
 * Playwright
 *    ↓
 * Analyzer IA
 *    ↓
 * Reportes
 *
 * ==========================================================
 */

async function executePipeline() {

    console.clear();

    Logger.title(
        "🔄 EJECUTANDO PIPELINE COMPLETO"
    );


    let postmanResult = null;
    let playwrightResult = null;


    try {

        /*
         * ==================================================
         * FASE 1
         * MCP POSTMAN
         * ==================================================
         */

        Logger.info(
            "Fase 1/2: Ejecutando MCP Postman Agent"
        );


        postmanResult =
            await MCPPostmanAgent.start(
                "UMSS Market"
            );


        /*
         * ==================================================
         * VALIDACIÓN ESTRUCTURAL
         * ==================================================
         */

        if (!postmanResult) {

            throw new Error(
                "MCP Postman Agent no devolvió ningún resultado."
            );

        }


        /*
         * ==================================================
         * ERROR REAL DEL AGENTE
         * ==================================================
         *
         * Si el agente explícitamente informa que no pudo
         * completar su ejecución, detenemos el pipeline.
         *
         * NO utilizamos solamente result.success porque
         * success puede representar el resultado de Newman.
         */

        if (
            postmanResult.agentCompleted === false
        ) {

            throw new Error(
                `MCP Postman Agent: ${
                    postmanResult.error ??
                    "El agente no pudo completar su ejecución."
                }`
            );

        }


        /*
         * ==================================================
         * MÉTRICAS POSTMAN
         * ==================================================
         */

        const postmanRequests =
            postmanResult.testResults?.requests ??
            postmanResult.results?.requests ??
            postmanResult.requests ??
            0;


        const postmanFailed =
            postmanResult.testResults?.failed ??
            postmanResult.results?.failed ??
            postmanResult.failed ??
            0;


        const postmanHttpFailures =
            postmanResult.testResults?.httpFailures ??
            postmanResult.results?.httpFailures ??
            postmanResult.httpFailures ??
            0;


        const postmanAssertionFailures =
            postmanResult.testResults?.assertionFailures ??
            postmanResult.results?.assertionFailures ??
            postmanResult.assertionFailures ??
            0;


        /*
         * ==================================================
         * RESULTADO FASE 1
         * ==================================================
         */

        console.log("");

        Logger.info(
            "================================="
        );

        Logger.info(
            "RESULTADO FASE 1 — MCP POSTMAN"
        );

        Logger.info(
            "================================="
        );


        console.log(
            `  - Requests Newman: ${
                postmanRequests
            }`
        );

        console.log(
            `  - Fallos totales: ${
                postmanFailed
            }`
        );

        console.log(
            `  - HTTP failures: ${
                postmanHttpFailures
            }`
        );

        console.log(
            `  - Assertion failures: ${
                postmanAssertionFailures
            }`
        );


        /*
         * ==================================================
         * FALLAS DE PRUEBAS
         * ==================================================
         *
         * Las pruebas pueden fallar y el pipeline CONTINÚA.
         */

        if (
            postmanFailed > 0
        ) {

            Logger.warning(
                `⚠ Fase 1 completada con ${
                    postmanFailed
                } prueba(s) fallida(s).`
            );

            Logger.info(
                "Los fallos fueron procesados por el analizador IA."
            );

            Logger.info(
                "El pipeline continuará con Playwright."
            );

        }
        else {

            Logger.success(
                "✓ Fase 1 completada sin fallos de pruebas."
            );

        }


        Logger.success(
            "✓ MCP Postman Agent finalizado correctamente.\n"
        );


        /*
         * ==================================================
         * FASE 2
         * AI PLAYWRIGHT
         * ==================================================
         */

        Logger.info(
            "Fase 2/2: Ejecutando AI Playwright Testing Agent"
        );


        playwrightResult =
            await PlaywrightTestingAgent.execute(
                PLAYWRIGHT_FEATURES
            );


        /*
         * ==================================================
         * VALIDACIÓN ESTRUCTURAL
         * ==================================================
         */

        if (!playwrightResult) {

            throw new Error(
                "AI Playwright Testing Agent no devolvió ningún resultado."
            );

        }


        /*
         * ==================================================
         * ERROR REAL DEL AGENTE
         * ==================================================
         */

        if (
            playwrightResult.agentCompleted === false
        ) {

            throw new Error(
                `AI Playwright Testing Agent: ${
                    playwrightResult.error ??
                    "El agente no pudo completar su ejecución."
                }`
            );

        }


        /*
         * ==================================================
         * MÉTRICAS PLAYWRIGHT
         * ==================================================
         */

        const playwrightTotal =
            playwrightResult.results?.total ??
            playwrightResult.testResults?.total ??
            0;


        const playwrightPassed =
            playwrightResult.results?.passed ??
            playwrightResult.testResults?.passed ??
            0;


        const playwrightFailed =
            playwrightResult.results?.failed ??
            playwrightResult.testResults?.failed ??
            0;


        /*
         * ==================================================
         * RESULTADO FASE 2
         * ==================================================
         */

        console.log("");

        Logger.info(
            "================================="
        );

        Logger.info(
            "RESULTADO FASE 2 — PLAYWRIGHT"
        );

        Logger.info(
            "================================="
        );


        console.log(
            `  - Total: ${
                playwrightTotal
            }`
        );

        console.log(
            `  - Pasadas: ${
                playwrightPassed
            }`
        );

        console.log(
            `  - Fallidas: ${
                playwrightFailed
            }`
        );


        /*
         * ==================================================
         * FALLAS PLAYWRIGHT
         * ==================================================
         */

        if (
            playwrightFailed > 0
        ) {

            Logger.warning(
                `⚠ Fase 2 completada con ${
                    playwrightFailed
                } prueba(s) fallida(s).`
            );

            Logger.info(
                "Los resultados fueron procesados por el analizador IA."
            );

        }
        else {

            Logger.success(
                "✓ Fase 2 completada sin fallos de pruebas."
            );

        }


        Logger.success(
            "✓ AI Playwright Testing Agent finalizado correctamente.\n"
        );


        /*
         * ==================================================
         * RESULTADO FINAL
         * ==================================================
         */

        Logger.success(
            "================================="
        );

        Logger.success(
            "✓ PIPELINE COMPLETO EJECUTADO"
        );

        Logger.success(
            "================================="
        );


        console.log(
            "\n📊 Resumen Final:"
        );


        console.log(
            `  - API Tests (Newman): ${
                postmanRequests
            } requests`
        );


        console.log(
            `  - API Tests fallidos: ${
                postmanFailed
            }`
        );


        console.log(
            `  - HTTP failures: ${
                postmanHttpFailures
            }`
        );


        console.log(
            `  - Assertion failures: ${
                postmanAssertionFailures
            }`
        );


        console.log(
            `  - Playwright Tests: ${
                playwrightTotal
            } pruebas`
        );


        console.log(
            `  - Playwright Pasadas: ${
                playwrightPassed
            }`
        );


        console.log(
            `  - Playwright Fallidas: ${
                playwrightFailed
            }`
        );


        console.log(
            `  - Estado del análisis IA: ${
                playwrightResult.analysis
                    ?.overallStatus ??
                "N/A"
            }`
        );


        console.log(
            `  - Tasa de éxito: ${
                playwrightResult.analysis
                    ?.successRate ??
                "N/A"
            }`
        );


        /*
         * ==================================================
         * ESTADO DE LA ORQUESTACIÓN
         * ==================================================
         */

        console.log("");

        Logger.success(
            "✓ Fase 1 — MCP Postman Agent"
        );

        Logger.success(
            "✓ Fase 2 — AI Playwright Testing Agent"
        );

        Logger.success(
            "✓ Orquestación del Pipeline"
        );


        /*
         * ==================================================
         * ESTADO DE PRUEBAS
         * ==================================================
         */

        if (
            postmanFailed > 0 ||
            playwrightFailed > 0
        ) {

            Logger.warning(
                "\n⚠ Pipeline completado con fallos de pruebas."
            );

            Logger.info(
                "Los fallos fueron detectados y analizados por IA."
            );

        }
        else {

            Logger.success(
                "\n✓ Pipeline completado sin fallos de pruebas."
            );

        }


        /*
         * ==================================================
         * RESULTADO
         * ==================================================
         */

        return {

            success:
                true,

            agentCompleted:
                true,

            pipelineCompleted:
                true,

            hasTestFailures:
                (
                    postmanFailed > 0 ||
                    playwrightFailed > 0
                ),

            postman: {

                requests:
                    postmanRequests,

                failed:
                    postmanFailed,

                httpFailures:
                    postmanHttpFailures,

                assertionFailures:
                    postmanAssertionFailures,

                result:
                    postmanResult

            },

            playwright: {

                total:
                    playwrightTotal,

                passed:
                    playwrightPassed,

                failed:
                    playwrightFailed,

                result:
                    playwrightResult

            }

        };

    }
    catch (error) {

        /*
         * ==================================================
         * ERROR REAL DE ORQUESTACIÓN
         * ==================================================
         */

        const errorMessage =
            error?.message ??
            error?.response?.data?.message ??
            error?.response?.data?.error ??
            String(error);


        Logger.error(
            "\n================================="
        );

        Logger.error(
            "❌ ERROR EN PIPELINE COMPLETO"
        );

        Logger.error(
            "================================="
        );


        Logger.error(
            errorMessage
        );


        return {

            success:
                false,

            agentCompleted:
                false,

            pipelineCompleted:
                false,

            hasTestFailures:
                false,

            error:
                errorMessage

        };

    }
    finally {

        /*
         * ==================================================
         * CONTINUAR
         * ==================================================
         */

        promptContinue();

    }

}


/*
 * ==========================================================
 * CONTINUAR
 * ==========================================================
 */

function promptContinue() {

    console.log("\n");

    rl.question(
        "Presiona Enter para continuar...",
        () => {

            main();

        }
    );

}


/*
 * ==========================================================
 * MAIN
 * ==========================================================
 */

async function main() {

    await showMainMenu();


    rl.question(
        "Selecciona una opción: ",
        async option => {

            try {

                switch (option.trim()) {

                    /*
                     * ======================================
                     * OPCIÓN 1
                     * ======================================
                     */

                    case "1":

                        await executeMCPPostman();

                        break;


                    /*
                     * ======================================
                     * OPCIÓN 2
                     * ======================================
                     */

                    case "2":

                        await executePlaywright();

                        break;


                    /*
                     * ======================================
                     * OPCIÓN 3
                     * ======================================
                     */

                    case "3":

                        await executePipeline();

                        break;


                    /*
                     * ======================================
                     * SALIR
                     * ======================================
                     */

                    case "0":

                        Logger.success(
                            "¡Hasta luego!"
                        );

                        rl.close();

                        process.exit(0);

                        break;


                    /*
                     * ======================================
                     * OPCIÓN INVÁLIDA
                     * ======================================
                     */

                    default:

                        Logger.error(
                            "❌ Opción inválida."
                        );

                        promptContinue();

                        break;

                }

            }
            catch (error) {

                Logger.error(
                    `❌ Error inesperado: ${
                        error?.message ??
                        String(error)
                    }`
                );

                promptContinue();

            }

        }
    );

}


/*
 * ==========================================================
 * INICIAR APLICACIÓN
 * ==========================================================
 */

main();