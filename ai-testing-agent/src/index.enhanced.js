import readline from "readline";

import MCPPostmanAgent
    from "./agents/postman.agent.enhanced.js";

import PlaywrightTestingAgent
    from "./agents/playwright.agent.enhanced.js";

import { Logger }
    from "./utils/Logger.js";


const rl =
    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


/*
 * ==========================================================
 * FEATURES DEL PRODUCTO
 * ==========================================================
 *
 * Estas features se utilizan para generar las pruebas
 * Playwright mediante:
 *
 * Feature
 *    ↓
 * PlaywrightGenerator
 *    ↓
 * AIService
 *    ↓
 * Ollama
 *    ↓
 * Qwen
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
        "│  1. 🔍 MCP Postman Agent           │"
    );

    console.log(
        "│  2. 🎭 AI Playwright Testing Agent │"
    );

    console.log(
        "│  3. 🔄 Ejecutar Pipeline Completo  │"
    );

    console.log(
        "│  0. ❌ Salir                       │"
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

    Logger.info(
        "Iniciando MCP Postman Agent...\n"
    );

    const result =
        await MCPPostmanAgent.start(
            "UMSS Market"
        );

    if (result.success) {

        Logger.success(
            "\n✓ MCP Postman Agent ejecutado exitosamente"
        );

        console.log(
            `  - Workspace: ${result.workspace}`
        );

        console.log(
            `  - Collections: ${result.collections}`
        );

        console.log(
            `  - Estado: ${
                result.analysis?.overallStatus ??
                "N/A"
            }`
        );

    } else {

        Logger.error(
            `✗ Error: ${result.error}`
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

    Logger.info(
        "Iniciando AI Playwright Testing Agent...\n"
    );

    const result =
        await PlaywrightTestingAgent.execute(
            PLAYWRIGHT_FEATURES
        );

    if (result.success) {

        Logger.success(
            "\n✓ AI Playwright Testing Agent " +
            "ejecutado exitosamente"
        );

        console.log(
            `  - Features procesadas: ${
                result.featuresProcessed
            }`
        );

        console.log(
            `  - Specs generados: ${
                result.specsGenerated
            }`
        );

        console.log(
            `  - Total de pruebas: ${
                result.results?.total ?? 0
            }`
        );

        console.log(
            `  - Pasadas: ${
                result.results?.passed ?? 0
            }`
        );

        console.log(
            `  - Fallidas: ${
                result.results?.failed ?? 0
            }`
        );

    } else {

        Logger.error(
            `✗ Error: ${result.error}`
        );
    }

    promptContinue();
}


/*
 * ==========================================================
 * PIPELINE COMPLETO
 * ==========================================================
 */
async function executePipeline() {

    console.clear();

    Logger.title(
        "🔄 EJECUTANDO PIPELINE COMPLETO"
    );

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

        const postmanResult =
            await MCPPostmanAgent.start(
                "UMSS Market"
            );

        if (!postmanResult.success) {

            throw new Error(
                `MCP Postman Agent: ${
                    postmanResult.error
                }`
            );
        }

        Logger.success(
            "✓ Fase 1 completada\n"
        );


        /*
         * ==================================================
         * FASE 2
         * PLAYWRIGHT
         * ==================================================
         */
        Logger.info(
            "Fase 2/2: Ejecutando AI Playwright Testing Agent"
        );

        const playwrightResult =
            await PlaywrightTestingAgent.execute(
                PLAYWRIGHT_FEATURES
            );

        if (!playwrightResult.success) {

            throw new Error(
                `AI Playwright Testing Agent: ${
                    playwrightResult.error
                }`
            );
        }

        Logger.success(
            "✓ Fase 2 completada\n"
        );


        /*
         * ==================================================
         * RESULTADO FINAL
         * ==================================================
         */
        Logger.success(
            "✓ Pipeline completo ejecutado exitosamente"
        );

        console.log(
            "\n📊 Resumen Final:"
        );

        console.log(
            `  - API Tests (Newman): ${
                postmanResult.testResults?.requests ??
                postmanResult.results?.requests ??
                0
            } requests`
        );

        console.log(
            `  - Playwright Tests: ${
                playwrightResult.results?.total ??
                0
            } pruebas`
        );

        console.log(
            `  - Playwright Pasadas: ${
                playwrightResult.results?.passed ??
                0
            }`
        );

        console.log(
            `  - Playwright Fallidas: ${
                playwrightResult.results?.failed ??
                0
            }`
        );

        console.log(
            `  - Estado del análisis: ${
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

    } catch (error) {

        Logger.error(
            `Error en pipeline: ${error.message}`
        );
    }

    promptContinue();
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

            switch (option) {

                case "1":

                    await executeMCPPostman();

                    break;


                case "2":

                    await executePlaywright();

                    break;


                case "3":

                    await executePipeline();

                    break;


                case "0":

                    Logger.success(
                        "¡Hasta luego!"
                    );

                    rl.close();

                    process.exit(0);

                    break;


                default:

                    Logger.error(
                        "Opción inválida"
                    );

                    promptContinue();
            }
        }
    );
}


main().catch(
    error => {

        Logger.error(
            `Error fatal: ${error.message}`
        );

        process.exit(1);
    }
);