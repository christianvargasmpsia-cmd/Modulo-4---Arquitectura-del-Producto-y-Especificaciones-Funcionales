import readline from "readline";
import MCPPostmanAgent from "./agents/postman.agent.enhanced.js";
import PlaywrightTestingAgent from "./agents/playwright.agent.enhanced.js";
import { Logger } from "./utils/Logger.js";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function showMainMenu() {
    console.clear();
    Logger.title("🚀 UMSS MARKET AI TESTING PLATFORM");
    console.log("\n┌─────────────────────────────────────┐");
    console.log("│  1. 🔍 MCP Postman Agent           │");
    console.log("│  2. 🎭 AI Playwright Testing Agent │");
    console.log("│  3. 🔄 Ejecutar Pipeline Completo  │");
    console.log("│  0. ❌ Salir                       │");
    console.log("└─────────────────────────────────────┘\n");
}

async function executeMCPPostman() {
    Logger.info("Iniciando MCP Postman Agent...\n");
    const result = await MCPPostmanAgent.start("UMSS Market");
    
    if (result.success) {
        Logger.success("\n✓ MCP Postman Agent ejecutado exitosamente");
        console.log(`  - Workspace: ${result.workspace}`);
        console.log(`  - Collections: ${result.collections}`);
        console.log(`  - Estado: ${result.analysis.overallStatus}`);
    } else {
        Logger.error(`✗ Error: ${result.error}`);
    }
    
    promptContinue();
}

async function executePlaywright() {
    Logger.info("Iniciando AI Playwright Testing Agent...\n");
    const result = await PlaywrightTestingAgent.execute();
    
    if (result.success) {
        Logger.success("\n✓ AI Playwright Testing Agent ejecutado exitosamente");
        console.log(`  - Features procesadas: ${result.featuresProcessed}`);
        console.log(`  - Total de pruebas: ${result.results.total}`);
        console.log(`  - Pasadas: ${result.results.passed}`);
        console.log(`  - Fallidas: ${result.results.failed}`);
    } else {
        Logger.error(`✗ Error: ${result.error}`);
    }
    
    promptContinue();
}

async function executePipeline() {
    console.clear();
    Logger.title("🔄 EJECUTANDO PIPELINE COMPLETO");
    
    try {
        Logger.info("Fase 1/2: Ejecutando MCP Postman Agent");
        const postmanResult = await MCPPostmanAgent.start("UMSS Market");
        Logger.success("✓ Fase 1 completada\n");
        
        Logger.info("Fase 2/2: Ejecutando AI Playwright Testing Agent");
        const playwrightResult = await PlaywrightTestingAgent.execute();
        Logger.success("✓ Fase 2 completada\n");
        
        Logger.success("✓ Pipeline completo ejecutado exitosamente");
        console.log("\n📊 Resumen Final:");
        console.log(`  - API Tests (Newman): ${postmanResult.testResults?.requests || 0} requests`);
        console.log(`  - Playwright Tests: ${playwrightResult.results?.total || 0} pruebas`);
        console.log(`  - Tasa de éxito global: ${playwrightResult.analysis?.successRate || 0}%`);
        
    } catch (error) {
        Logger.error(`Error en pipeline: ${error.message}`);
    }
    
    promptContinue();
}

function promptContinue() {
    console.log("\n");
    rl.question("Presiona Enter para continuar...", () => {
        main();
    });
}

async function main() {
    await showMainMenu();
    
    rl.question("Selecciona una opción: ", async option => {
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
                Logger.success("¡Hasta luego!");
                rl.close();
                process.exit(0);
                break;
            default:
                Logger.error("Opción inválida");
                promptContinue();
        }
    });
}

main().catch(error => {
    Logger.error(`Error fatal: ${error.message}`);
    process.exit(1);
});