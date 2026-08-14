import { Logger } from "../utils/Logger.js";
import PlaywrightGenerator from "../generators/PlaywrightGenerator.js";
import PlaywrightRunner from "../runners/PlaywrightRunner.js";
import ResultAnalyzer from "../analyzers/ResultAnalyzer.js";
import HtmlReporter from "../reporters/HtmlReporter.js";
import MarkdownReporter from "../reporters/MarkdownReporter.js";
import ConsoleReporter from "../reporters/ConsoleReporter.js";

class PlaywrightTestingAgent {
    async execute(features = []) {
        console.clear();
        Logger.title("🎭 AI PLAYWRIGHT TESTING AGENT");
        
        if (!features || features.length === 0) {
            Logger.warning("No features proporcionadas. Usando features por defecto...\n");
            features = this.getDefaultFeatures();
        }

        try {
            Logger.info(`Procesando ${features.length} features\n`);

            const allResults = [];
            const allAnalysis = [];

            // STEP 1: Generar pruebas para cada feature
            Logger.info("Step 1: Generando pruebas Playwright con IA");
            for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                Logger.info(`  [${i + 1}/${features.length}] Generando tests para: ${feature.title}`);
                
                try {
                    const specPath = await PlaywrightGenerator.generate(feature);
                    Logger.success(`  ✓ Spec generado: ${specPath}`);
                } catch (error) {
                    Logger.error(`  ✗ Error generando spec: ${error.message}`);
                }
            }

            // STEP 2: Ejecutar pruebas
            Logger.info("\nStep 2: Ejecutando pruebas Playwright");
            const results = await PlaywrightRunner.run();
            Logger.success(`✓ Ejecución completada
  - Total: ${results.total}
  - Pasadas: ${results.passed}
  - Fallidas: ${results.failed}
  - Duración: ${results.duration}ms\n`);

            // STEP 3: Analizar resultados
            Logger.info("Step 3: Analizando resultados con IA");
            const analysis = await ResultAnalyzer.analyze(results);
            Logger.success("✓ Análisis completado\n");

            // STEP 4: Generar reportes
            Logger.info("Step 4: Generando reportes");
            await HtmlReporter.generate(results, analysis);
            Logger.success("  ✓ HTML report generado");
            
            await MarkdownReporter.generate(results, analysis);
            Logger.success("  ✓ Markdown report generado");
            
            ConsoleReporter.print(results, analysis);
            Logger.success("  ✓ Console report impreso\n");

            return {
                success: true,
                featuresProcessed: features.length,
                results,
                analysis
            };

        } catch (error) {
            Logger.error(`Error en AI Playwright Testing Agent: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    getDefaultFeatures() {
        return [
            {
                id: "FT-001",
                title: "User Login",
                description: "El usuario inicia sesión en el sistema",
                userStory: "Como usuario quiero iniciar sesión para acceder a mi cuenta",
                acceptanceCriteria: [
                    "El usuario ve el formulario de login",
                    "El usuario ingresa email y contraseña",
                    "El dashboard se muestra al usuario"
                ]
            },
            {
                id: "FT-002",
                title: "Search Products",
                description: "El usuario busca productos en el catálogo",
                userStory: "Como comprador quiero buscar productos para encontrar lo que necesito",
                acceptanceCriteria: [
                    "Se muestra el buscador",
                    "El usuario ingresa término de búsqueda",
                    "Se muestran resultados coincidentes"
                ]
            },
            {
                id: "FT-003",
                title: "Create Order",
                description: "El usuario crea un pedido",
                userStory: "Como comprador quiero crear un pedido para comprar productos",
                acceptanceCriteria: [
                    "El usuario selecciona productos",
                    "El carrito se actualiza",
                    "Se genera el QR de pago"
                ]
            }
        ];
    }
}

export default new PlaywrightTestingAgent();