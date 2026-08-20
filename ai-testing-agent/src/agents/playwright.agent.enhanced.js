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

        /*
         * ==========================================================
         * NORMALIZAR FEATURES
         * ==========================================================
         */

        const receivedFeatures =
            Array.isArray(features)
                ? features.filter(Boolean)
                : [];

        const featuresToProcess =
            receivedFeatures.length > 0
                ? receivedFeatures
                : this.getDefaultFeatures();

        if (receivedFeatures.length === 0) {

            Logger.warning(
                "No features proporcionadas. " +
                "Usando features por defecto...\n"
            );

        } else {

            Logger.success(
                `✓ ${receivedFeatures.length} features recibidas.\n`
            );
        }

        /*
         * ==========================================================
         * SPECS GENERADOS
         * ==========================================================
         */

        const generatedSpecs = [];

        try {

            Logger.info(
                `Procesando ${featuresToProcess.length} features\n`
            );

            /*
             * ======================================================
             * STEP 1
             * GENERAR PRUEBAS PLAYWRIGHT CON QWEN
             * ======================================================
             */

            Logger.info(
                "Step 1: Generando pruebas Playwright con IA"
            );

            for (
                let i = 0;
                i < featuresToProcess.length;
                i++
            ) {

                const feature =
                    featuresToProcess[i];

                Logger.info(
                    `  [${i + 1}/${featuresToProcess.length}] ` +
                    `Generando tests para: ${feature.title}`
                );

                /*
                 * Validar title.
                 */

                if (!feature.title) {

                    Logger.warning(
                        `  ⚠ Feature ${i + 1} sin title.`
                    );

                    continue;
                }

                /*
                 * Validar acceptance criteria.
                 */

                if (
                    !Array.isArray(
                        feature.acceptanceCriteria
                    )
                ) {

                    Logger.warning(
                        `  ⚠ Feature "${feature.title}" ` +
                        `sin acceptanceCriteria válido.`
                    );

                    continue;
                }

                /*
                 * Mostrar datos de prueba cuando existen.
                 */

                if (feature.testData) {

                    Logger.info(
                        `  TestData: ${JSON.stringify(
                            feature.testData
                        )}`
                    );
                }

                try {

                    /*
                     * ==================================================
                     * GENERACIÓN
                     *
                     * PlaywrightGenerator
                     *        ↓
                     * AIService
                     *        ↓
                     * OllamaService
                     *        ↓
                     * Qwen
                     * ==================================================
                     */

                    const specPath =
                        await PlaywrightGenerator.generate(
                            feature
                        );

                    /*
                     * Guardamos la ruta exacta
                     * del spec generado.
                     */

                    if (specPath) {

                        generatedSpecs.push(
                            specPath
                        );

                        Logger.success(
                            `  ✓ Spec generado: ${specPath}`
                        );

                    } else {

                        Logger.warning(
                            `  ⚠ No se obtuvo ruta para ` +
                            `"${feature.title}".`
                        );
                    }

                } catch (error) {

                    Logger.error(
                        `  ✗ Error generando spec para ` +
                        `"${feature.title}": ${error.message}`
                    );
                }
            }

            /*
             * ======================================================
             * VALIDAR GENERACIÓN
             * ======================================================
             */

            if (
                generatedSpecs.length === 0
            ) {

                throw new Error(
                    "No se pudo generar ninguna prueba Playwright."
                );
            }

            Logger.success(
                `\n✓ ${generatedSpecs.length} specs ` +
                `generados correctamente.\n`
            );

            /*
             * Mostrar specs que serán ejecutados.
             */

            Logger.info(
                "Specs que serán ejecutados:"
            );

            generatedSpecs.forEach(
                (spec, index) => {

                    console.log(
                        `  ${index + 1}. ${spec}`
                    );

                }
            );

            /*
             * ======================================================
             * STEP 2
             * EJECUTAR SOLAMENTE LOS SPECS GENERADOS
             * ======================================================
             */

            Logger.info(
                "\nStep 2: Ejecutando pruebas Playwright"
            );

            const results =
                await PlaywrightRunner.run(
                    generatedSpecs
                );

            Logger.success(
                `✓ Ejecución completada
  - Total: ${results.total ?? 0}
  - Pasadas: ${results.passed ?? 0}
  - Fallidas: ${results.failed ?? 0}
  - Skipped: ${results.skipped ?? 0}
  - Duración: ${results.duration ?? 0}ms\n`
            );

            /*
             * ======================================================
             * STEP 3
             * ANALIZAR RESULTADOS
             * ======================================================
             */

            Logger.info(
                "Step 3: Analizando resultados con IA"
            );

            const analysis =
                await ResultAnalyzer.analyze(
                    results
                );

            Logger.success(
                "✓ Análisis completado\n"
            );

            /*
             * ======================================================
             * STEP 4
             * GENERAR REPORTES
             * ======================================================
             */

            Logger.info(
                "Step 4: Generando reportes"
            );

            /*
             * HTML
             */

            await HtmlReporter.generate(
                results,
                analysis
            );

            Logger.success(
                "  ✓ HTML report generado"
            );

            /*
             * Markdown
             */

            await MarkdownReporter.generate(
                results,
                analysis
            );

            Logger.success(
                "  ✓ Markdown report generado"
            );

            /*
             * Consola
             */

            ConsoleReporter.print(
                results,
                analysis
            );

            Logger.success(
                "  ✓ Console report impreso\n"
            );

            /*
             * ======================================================
             * RESULTADO FINAL
             * ======================================================
             */

            return {

                success: true,

                featuresProcessed:
                    featuresToProcess.length,

                specsGenerated:
                    generatedSpecs.length,

                generatedSpecs,

                results,

                analysis

            };

        } catch (error) {

            /*
             * ======================================================
             * ERROR GENERAL
             * ======================================================
             */

            Logger.error(
                `Error en AI Playwright Testing Agent: ` +
                `${error.message}`
            );

            return {

                success: false,

                error:
                    error.message,

                featuresProcessed:
                    featuresToProcess.length,

                specsGenerated:
                    generatedSpecs.length,

                generatedSpecs

            };
        }
    }


    /*
     * ==========================================================
     * FEATURES POR DEFECTO
     * ==========================================================
     *
     * Estas features utilizan datos reales
     * comprobados contra el backend.
     *
     * UMSS Market actualmente se prueba como
     * BACKEND / REST API.
     *
     * No utilizamos browser automation.
     * ==========================================================
     */

    getDefaultFeatures() {

        return [

            /*
             * ======================================================
             * FT-001
             * GET PUBLICATION BY ID
             * ======================================================
             */

            {
                id: "FT-001",

                title:
                    "Get Publication By ID",

                description:
                    "Consultar una publicación existente del marketplace " +
                    "mediante su identificador.",

                userStory:
                    "Como usuario quiero consultar una publicación existente " +
                    "para obtener sus datos.",

                /*
                 * ID REAL comprobado contra el backend.
                 *
                 * GET:
                 * /api/publications/fa64e55f-7629-4ddd-8eff-04ea2f072034
                 *
                 * Resultado comprobado:
                 * HTTP 200
                 */

                testData: {

                    publicationId:
                        "fa64e55f-7629-4ddd-8eff-04ea2f072034"

                },

                acceptanceCriteria: [

                    "Debe realizar una petición GET " +
                    "a /api/publications/{id}",

                    "Debe utilizar exactamente el publicationId " +
                    "proporcionado en testData",

                    "Debe validar que la respuesta HTTP sea 200",

                    "Debe validar que la respuesta contenga " +
                    "información de la publicación",

                    "Debe validar los campos documentados " +
                    "de la publicación"

                ]
            },


            /*
             * ======================================================
             * FT-002
             * SEARCH PUBLICATIONS
             * ======================================================
             */

            {
                id: "FT-002",

                title:
                    "Search Publications",

                description:
                    "Consultar publicaciones mediante búsqueda " +
                    "por texto.",

                userStory:
                    "Como usuario quiero buscar publicaciones " +
                    "para encontrar productos o servicios.",

                /*
                 * Dato REAL comprobado contra el backend.
                 *
                 * GET:
                 * /api/publications?texto=laptop
                 *
                 * Resultado comprobado:
                 * HTTP 200
                 */

                testData: {

                    texto:
                        "laptop"

                },

                acceptanceCriteria: [

                    "Debe realizar una petición GET " +
                    "a /api/publications",

                    "Debe utilizar exactamente el parámetro " +
                    "texto=laptop",

                    "Debe validar que la respuesta HTTP sea 200",

                    "Debe validar que la respuesta sea un arreglo",

                    "Debe validar que los elementos de la respuesta " +
                    "contengan información de publicaciones"

                ]
            },


            /*
             * ======================================================
             * FT-003
             * GET PUBLIC STORE PROFILE
             * ======================================================
             */

            {
                id: "FT-003",

                title:
                    "Get Public Store Profile",

                description:
                    "Consultar el perfil público de una tienda " +
                    "existente del marketplace.",

                userStory:
                    "Como usuario quiero consultar una tienda existente " +
                    "para conocer su información pública.",

                /*
                 * ID REAL comprobado contra el backend.
                 *
                 * GET:
                 * /api/tiendas/99999999-9999-9999-9999-999999999999
                 *
                 * Resultado comprobado:
                 * HTTP 200
                 */

                testData: {

                    storeId:
                        "99999999-9999-9999-9999-999999999999"

                },

                acceptanceCriteria: [

                    "Debe realizar una petición GET " +
                    "a /api/tiendas/{id}",

                    "Debe utilizar exactamente el storeId " +
                    "proporcionado en testData",

                    "Debe validar que la respuesta HTTP sea 200",

                    "Debe validar que la respuesta contenga " +
                    "información de la tienda",

                    "Debe validar los campos documentados " +
                    "del perfil público"

                ]
            }

        ];
    }
}


/*
 * ==========================================================
 * INSTANCIA ÚNICA DEL AGENTE
 * ==========================================================
 */

const playwrightTestingAgent =
    new PlaywrightTestingAgent();


/*
 * ==========================================================
 * EXPORTACIÓN
 * ==========================================================
 */

export default playwrightTestingAgent;


/*
 * ==========================================================
 * EJECUCIÓN DIRECTA
 * ==========================================================
 */

const isMainModule =
    process.argv[1] &&
    process.argv[1]
        .replace(/\\/g, "/")
        .endsWith(
            "/src/agents/playwright.agent.enhanced.js"
        );


if (isMainModule) {

    playwrightTestingAgent
        .execute()

        .then(result => {

            if (!result.success) {

                process.exitCode = 1;
            }

        })

        .catch(error => {

            Logger.error(
                `Error fatal en Playwright Agent: ` +
                `${error.message}`
            );

            process.exitCode = 1;

        });
}