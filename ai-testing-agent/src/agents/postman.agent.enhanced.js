import getWorkspacesSkill from "../skills/getWorkspaces.skill.js";
import getCollectionsSkill from "../skills/getCollections.skill.js";
import runCollectionSkill from "../skills/runCollection.skill.js";
import analyzeResultsSkill from "../skills/analyzeResults.skill.js";
import { Logger } from "../utils/Logger.js";


class MCPPostmanAgent {

    async start(workspaceName = "UMSS Market") {

        console.clear();

        Logger.title("🔍 MCP POSTMAN AGENT");

        Logger.info(
            "Iniciando descubrimiento de Workspaces...\n"
        );

        try {

            // ==================================================
            // STEP 1: OBTENER WORKSPACES
            // ==================================================

            Logger.info(
                "Step 1: Descubriendo Workspaces desde Postman API"
            );

            const workspaces =
                await getWorkspacesSkill.execute();


            if (
                !workspaces ||
                workspaces.length === 0
            ) {

                Logger.error(
                    "No workspaces encontrados"
                );

                return {
                    success: false,
                    error: "No workspaces"
                };
            }


            Logger.success(
                `✓ ${workspaces.length} workspaces encontrados\n`
            );


            workspaces.forEach(
                (w, i) => {

                    console.log(
                        `  ${i + 1}. ${w.name} (ID: ${w.id})`
                    );

                }
            );


            // ==================================================
            // STEP 2: SELECCIONAR WORKSPACE
            // ==================================================

            Logger.info(
                `\nStep 2: Seleccionando workspace "${workspaceName}"`
            );


            const workspace =
                workspaces.find(
                    w => w.name === workspaceName
                );


            if (!workspace) {

                Logger.error(
                    `Workspace "${workspaceName}" no encontrado`
                );

                return {
                    success: false,
                    error:
                        `Workspace not found: ${workspaceName}`
                };
            }


            Logger.success(
                `✓ Workspace seleccionado: ${workspace.name}\n`
            );


            // ==================================================
            // STEP 3: OBTENER COLLECTIONS
            // ==================================================

            Logger.info(
                "Step 3: Descubriendo Collections"
            );


            const collections =
                await getCollectionsSkill.execute(
                    workspace.id
                );


            if (
                !collections ||
                collections.length === 0
            ) {

                Logger.error(
                    "No collections encontradas"
                );

                return {
                    success: false,
                    error: "No collections"
                };
            }


            Logger.success(
                `✓ ${collections.length} collections encontradas\n`
            );


            collections.forEach(
                (c, i) => {

                    console.log(
                        `  ${i + 1}. ${c.name} (ID: ${c.id})`
                    );

                }
            );


            // ==================================================
            // STEP 4: EJECUTAR PRUEBAS CON NEWMAN
            // ==================================================

            Logger.info(
                "\nStep 4: Ejecutando pruebas con Newman"
            );


            const newmanResult =
                await runCollectionSkill.execute();


            Logger.success(
                `✓ Ejecución completada
  - Requests totales: ${newmanResult.requests}
  - Assertions: ${newmanResult.assertions}
  - Fallos: ${newmanResult.failed}\n`
            );


            // ==================================================
            // STEP 5: ANALIZAR RESULTADOS CON IA
            // ==================================================

            Logger.info(
                "Step 5: Analizando resultados con AI"
            );


            const analysis =
                await analyzeResultsSkill.execute(
                    newmanResult
                );


            Logger.success(
                "✓ Análisis completado\n"
            );


            Logger.info(
                `Estado General: ${analysis.overallStatus}`
            );


            Logger.info(
                `Resumen: ${analysis.summary}\n`
            );


            // ==================================================
            // RESULTADO FINAL DEL AGENTE
            // ==================================================

            return {

                success: true,

                workspace:
                    workspace.name,

                collections:
                    collections.length,

                testResults:
                    newmanResult,

                analysis

            };


        } catch (error) {

            Logger.error(
                `Error en MCP Postman Agent: ${error.message}`
            );


            return {

                success: false,

                error:
                    error.message

            };

        }

    }

}


// ==========================================================
// CREAR INSTANCIA DEL AGENTE
// ==========================================================

const agent =
    new MCPPostmanAgent();


// ==========================================================
// EXPORTAR AGENTE
// ==========================================================
//
// Esto mantiene compatible:
//
// npm run start:enhanced
//
// porque index.enhanced.js puede importar:
//
// MCPPostmanAgent.start(...)
// ==========================================================

export default agent;


// ==========================================================
// EJECUCIÓN DIRECTA
// ==========================================================
//
// Esto permite:
//
// npm run mcp
//
// ejecutar directamente:
//
// agent.start("UMSS Market")
//
// IMPORTANTE:
//
// Cuando este archivo es importado desde
// index.enhanced.js, esta condición evita
// ejecutar automáticamente el agente.
//
// ==========================================================

if (
    process.argv[1] &&
    process.argv[1].endsWith(
        "postman.agent.enhanced.js"
    )
) {

    agent
        .start("UMSS Market")

        .then(result => {

            if (!result.success) {

                process.exitCode = 1;

            }

        })

        .catch(error => {

            Logger.error(
                `Error fatal ejecutando MCP Postman Agent: ${error.message}`
            );

            process.exitCode = 1;

        });

}