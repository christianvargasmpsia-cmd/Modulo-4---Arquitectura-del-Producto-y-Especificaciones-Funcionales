import { Logger } from "../utils/Logger.js";

import postmanService
    from "../services/postman.service.js";

import dataDiscoveryService
    from "../services/dataDiscovery.service.js";

import runCollectionSkill
    from "../skills/runCollection.skill.js";

import analyzeResultsSkill
    from "../skills/analyzeResults.skill.js";


class PostmanAgentEnhanced {

    // ==========================================================
    // ENTRYPOINT
    // ==========================================================

    async start(
        request = "UMSS Market"
    ) {

        return await this.execute(
            request
        );

    }


    // ==========================================================
    // EXECUTE
    // ==========================================================

    async execute(
        userRequest = ""
    ) {

        try {

            Logger.title(
                "POSTMAN AI TESTING AGENT"
            );


            Logger.info(
                `Solicitud: ${
                    userRequest ||
                    "Ejecutar pruebas de la API"
                }`
            );


            // ==================================================
            // STEP 1
            // WORKSPACES
            // ==================================================

            Logger.info(
                "\nStep 1: Obteniendo Workspaces de Postman..."
            );


            const workspaces =
                await postmanService.getWorkspaces();


            if (
                !Array.isArray(workspaces) ||
                workspaces.length === 0
            ) {

                throw new Error(
                    "No se encontraron Workspaces en Postman."
                );

            }


            Logger.success(
                `✓ Workspaces encontrados: ${
                    workspaces.length
                }`
            );


            // ==================================================
            // STEP 2
            // COLLECTION
            // ==================================================

            Logger.info(
                "\nStep 2: Buscando Collection UMSS Market..."
            );


            let selectedWorkspace = null;
            let selectedCollection = null;
            let collections = [];


            for (
                const workspace
                of workspaces
            ) {

                Logger.info(
                    `\nConsultando Workspace: ${
                        workspace.name
                    }`
                );


                let currentCollections;


                try {

                    currentCollections =
                        await postmanService.getCollections(
                            workspace.id
                        );

                }
                catch (error) {

                    Logger.warning(
                        `No se pudo consultar ${
                            workspace.name
                        }: ${
                            error?.response?.status ??
                            error?.message ??
                            String(error)
                        }`
                    );

                    continue;

                }


                if (
                    !Array.isArray(
                        currentCollections
                    ) ||
                    currentCollections.length === 0
                ) {

                    Logger.info(
                        "   Sin Collections."
                    );

                    continue;

                }


                Logger.success(
                    `   ✓ Collections encontradas: ${
                        currentCollections.length
                    }`
                );


                const match =
                    currentCollections.find(
                        collection => {

                            const name =
                                String(
                                    collection?.name ??
                                    ""
                                )
                                    .toLowerCase()
                                    .trim();


                            return (
                                name.includes(
                                    "umss market"
                                ) ||
                                name.includes(
                                    "umss"
                                )
                            );

                        }
                    );


                if (
                    match
                ) {

                    selectedWorkspace =
                        workspace;

                    selectedCollection =
                        match;

                    collections =
                        currentCollections;

                    break;

                }

            }


            // ==================================================
            // VALIDAR COLLECTION
            // ==================================================

            if (
                !selectedCollection
            ) {

                throw new Error(
                    "No se encontró la Collection 'UMSS Market API'."
                );

            }


            Logger.success(
                `\n✓ Workspace encontrado: ${
                    selectedWorkspace.name
                }`
            );


            Logger.success(
                `✓ Collection encontrada: ${
                    selectedCollection.name
                }`
            );


            Logger.info(
                `   Collection UID: ${
                    selectedCollection.uid
                }`
            );


            // ==================================================
            // STEP 3
            // DESCARGAR COLLECTION
            // ==================================================

            Logger.info(
                "\nStep 3: Descargando Collection..."
            );


            const collection =
                await postmanService.getCollection(
                    selectedCollection.uid
                );


            if (
                !collection
            ) {

                throw new Error(
                    "Postman no devolvió la Collection."
                );

            }


            if (
                !collection.info
            ) {

                throw new Error(
                    "La Collection descargada no contiene información válida."
                );

            }


            Logger.success(
                `✓ Collection descargada: ${
                    collection.info.name
                }`
            );


            // ==================================================
            // GUARDAR COLLECTION
            // ==================================================

            const collectionPath =
                await this.saveCollection(
                    collection
                );


            Logger.success(
                `✓ Collection guardada en:\n${
                    collectionPath
                }`
            );


            // ==================================================
            // STEP 4
            // DATA DISCOVERY
            // ==================================================

            Logger.info(
                "\nStep 4: Descubriendo datos reales de prueba..."
            );


            const discovery =
                await dataDiscoveryService.discover();


            if (
                !discovery
            ) {

                throw new Error(
                    "DataDiscovery no devolvió información."
                );

            }


            if (
                !discovery.ids
            ) {

                throw new Error(
                    "DataDiscovery no devolvió los IDs."
                );

            }


            // ==================================================
            // TEST DATA
            // ==================================================

            const testData = {

                // ------------------------------------------------
                // IDS
                // ------------------------------------------------

                userId:
                    discovery.ids?.userId ??
                    null,

                storeId:
                    discovery.ids?.storeId ??
                    null,

                publicationId:
                    discovery.ids?.publicationId ??
                    null,

                interactionId:
                    discovery.ids?.interactionId ??
                    null,


                // ------------------------------------------------
                // AUTH
                // ------------------------------------------------

                email:
                    discovery.auth?.email ??
                    null,

                role:
                    discovery.auth?.role ??
                    null,

                token:
                    discovery.auth?.token ??
                    null,

                password:
                    process.env.TEST_USER_PASSWORD ??
                    "12345678"

            };


            // ==================================================
            // MOSTRAR DATOS
            // ==================================================

            Logger.info(
                "\n================================="
            );

            Logger.info(
                "DATOS PARA LAS PRUEBAS"
            );

            Logger.info(
                "=================================\n"
            );


            console.log(
                "USER_ID       :",
                testData.userId ??
                "NO ENCONTRADO"
            );


            console.log(
                "STORE_ID      :",
                testData.storeId ??
                "NO ENCONTRADO"
            );


            console.log(
                "PUBLICATION_ID:",
                testData.publicationId ??
                "NO ENCONTRADO"
            );


            console.log(
                "INTERACTION_ID:",
                testData.interactionId ??
                "NO ENCONTRADO"
            );


            console.log(
                "EMAIL         :",
                testData.email ??
                "NO ENCONTRADO"
            );


            console.log(
                "ROLE          :",
                testData.role ??
                "NO ENCONTRADO"
            );


            console.log(
                "PASSWORD      :",
                testData.password
                    ? "OK"
                    : "NO"
            );


            console.log(
                "JWT           :",
                testData.token
                    ? "OK"
                    : "NO"
            );


            // ==================================================
            // VALIDACIONES
            // ==================================================

            console.log(
                "\n🔎 VALIDANDO DATOS NECESARIOS..."
            );


            if (
                !testData.userId
            ) {

                throw new Error(
                    "Discovery no obtuvo userId."
                );

            }


            console.log(
                "   ✓ userId disponible"
            );


            if (
                !testData.storeId
            ) {

                throw new Error(
                    "Discovery no obtuvo storeId."
                );

            }


            console.log(
                "   ✓ storeId disponible"
            );


            if (
                !testData.publicationId
            ) {

                throw new Error(
                    "Discovery no obtuvo publicationId."
                );

            }


            console.log(
                "   ✓ publicationId disponible"
            );


            if (
                !testData.email
            ) {

                throw new Error(
                    "Discovery no obtuvo email del comprador."
                );

            }


            console.log(
                "   ✓ email del comprador disponible"
            );


            if (
                String(
                    testData.role ??
                    ""
                ).toUpperCase() !==
                "COMPRADOR"
            ) {

                throw new Error(
                    `El usuario de testing debe ser COMPRADOR. Role recibido: ${
                        testData.role ??
                        "N/A"
                    }`
                );

            }


            console.log(
                "   ✓ usuario COMPRADOR válido"
            );


            if (
                !testData.password
            ) {

                throw new Error(
                    "No existe password para el usuario de testing."
                );

            }


            console.log(
                "   ✓ password disponible"
            );


            if (
                !testData.token
            ) {

                throw new Error(
                    "Discovery no obtuvo JWT."
                );

            }


            console.log(
                "   ✓ JWT disponible"
            );


            if (
                testData.interactionId
            ) {

                console.log(
                    "   ✓ interactionId disponible"
                );

                console.log(
                    `   → ${testData.interactionId}`
                );

            }
            else {

                console.log(
                    "   ⚠ interactionId no encontrado"
                );

                console.log(
                    "   → Se permitirá continuar."
                );

            }


            Logger.success(
                "\n✓ Datos de Discovery validados."
            );


            // ==================================================
            // RESUMEN
            // ==================================================

            console.log("");

            Logger.info(
                "================================="
            );

            Logger.info(
                "RESUMEN DEL CONTEXTO"
            );

            Logger.info(
                "================================="
            );


            console.log(
                `Usuario        : ${
                    testData.userId
                }`
            );


            console.log(
                `Email          : ${
                    testData.email
                }`
            );


            console.log(
                `Role           : ${
                    testData.role
                }`
            );


            console.log(
                `Store          : ${
                    testData.storeId
                }`
            );


            console.log(
                `Publication    : ${
                    testData.publicationId
                }`
            );


            console.log(
                `Interaction    : ${
                    testData.interactionId ??
                    "N/A"
                }`
            );


            console.log(
                `Autenticación  : ${
                    testData.token
                        ? "✓ JWT válido"
                        : "✗ Sin JWT"
                }`
            );


            // ==================================================
            // STEP 5
            // NEWMAN
            // ==================================================

            Logger.info(
                "\nStep 5: Ejecutando Collection con Newman..."
            );


            const newmanResult =
                await runCollectionSkill.execute(
                    collectionPath,
                    testData
                );


            if (
                !newmanResult
            ) {

                throw new Error(
                    "Newman no devolvió resultados."
                );

            }


            // ==================================================
            // NORMALIZAR RESULTADO
            // ==================================================

            const executionResult =
                newmanResult?.result ??
                newmanResult ??
                {};


            const requests =
                Number(
                    executionResult?.requests ??
                    0
                );


            const assertions =
                Number(
                    executionResult?.assertions ??
                    0
                );


            const failed =
                Number(
                    executionResult?.failed ??
                    0
                );


            const httpFailures =
                Number(
                    executionResult?.httpFailures ??
                    0
                );


            const assertionFailures =
                Number(
                    executionResult?.assertionFailures ??
                    0
                );


            const skipped =
                Number(
                    executionResult?.skipped ??
                    0
                );


            // ==================================================
            // RESULTADO NEWMAN
            // ==================================================

            Logger.info(
                "\n================================="
            );

            Logger.info(
                "RESULTADO NEWMAN"
            );

            Logger.info(
                "=================================\n"
            );


            console.log(
                `Requests           : ${requests}`
            );


            console.log(
                `Assertions         : ${assertions}`
            );


            console.log(
                `Failed             : ${failed}`
            );


            console.log(
                `HTTP failures      : ${httpFailures}`
            );


            console.log(
                `Assertion failures : ${assertionFailures}`
            );


            console.log(
                `Skipped            : ${skipped}`
            );


            // ==================================================
            // STEP 6
            // AI ANALYSIS
            // ==================================================

            Logger.info(
                "\nStep 6: Analizando resultados con AI..."
            );


            let analysis = null;


            try {

                analysis =
                    await analyzeResultsSkill.execute(
                        executionResult
                    );


                Logger.success(
                    "✓ Análisis AI completado."
                );

            }
            catch (
                analysisError
            ) {

                const analysisMessage =
                    analysisError?.message ??
                    analysisError?.response?.data?.message ??
                    String(analysisError);


                Logger.warning(
                    `⚠ No se pudo realizar el análisis AI: ${
                        analysisMessage
                    }`
                );


                analysis = {

                    overallStatus:
                        failed > 0
                            ? (
                                failed >= 3
                                    ? "CRITICAL"
                                    : "DEGRADED"
                            )
                            : "STABLE",

                    summary:
                        failed > 0
                            ? `Se detectaron ${
                                failed
                            } fallos durante la ejecución de Newman.`
                            : "Las pruebas finalizaron correctamente.",

                    failures: [],

                    aiError:
                        analysisMessage

                };

            }


            // ==================================================
            // RESULTADO FINAL
            // ==================================================

            /*
             * IMPORTANTE:
             *
             * Tener pruebas fallidas NO significa que
             * el agente haya fallado.
             *
             * El agente cumplió su función si:
             *
             * 1. Ejecutó Newman.
             * 2. Detectó los fallos.
             * 3. Los entregó al Analyzer.
             * 4. Generó el análisis.
             *
             * Por eso NO lanzamos throw cuando failed > 0.
             */

            const success =
                failed === 0;


            Logger.info(
                "\n================================="
            );

            Logger.info(
                "RESULTADO FINAL DEL AGENTE"
            );

            Logger.info(
                "=================================\n"
            );


            console.log(
                `Requests ejecutados : ${requests}`
            );


            console.log(
                `Pruebas fallidas    : ${failed}`
            );


            console.log(
                `HTTP failures       : ${httpFailures}`
            );


            console.log(
                `Assertion failures  : ${assertionFailures}`
            );


            console.log(
                `Estado IA           : ${
                    analysis?.overallStatus ??
                    "N/A"
                }`
            );


            console.log(
                `Reporte IA          : ${
                    analysis
                        ? "GENERADO"
                        : "NO GENERADO"
                }`
            );


            // ==================================================
            // MENSAJE FINAL
            // ==================================================

            console.log("");


            if (
                success
            ) {

                Logger.success(
                    "✓ Todas las pruebas finalizaron correctamente."
                );

            }
            else {

                Logger.warning(
                    `⚠ Newman finalizó con ${
                        failed
                    } prueba(s) fallida(s).`
                );


                Logger.info(
                    "✓ Los fallos fueron capturados y enviados al analizador IA."
                );


                if (
                    analysis
                ) {

                    Logger.info(
                        `✓ Estado generado por IA: ${
                            analysis.overallStatus ??
                            "N/A"
                        }`
                    );

                }

            }


            Logger.success(
                "\n✓ Pipeline de testing finalizado."
            );


            // ==================================================
            // RETURN
            // ==================================================

            return {

                /*
                 * success representa el resultado de las
                 * pruebas, NO el estado del agente.
                 */

                success,

                agentCompleted:
                    true,

                hasTestFailures:
                    failed > 0,

                workspace:
                    selectedWorkspace.name,

                workspaceId:
                    selectedWorkspace.id,

                collections:
                    collections.length,

                collection: {

                    id:
                        selectedCollection.uid,

                    name:
                        selectedCollection.name,

                    path:
                        collectionPath

                },

                testData: {

                    userId:
                        testData.userId,

                    storeId:
                        testData.storeId,

                    publicationId:
                        testData.publicationId,

                    interactionId:
                        testData.interactionId,

                    email:
                        testData.email,

                    role:
                        testData.role,

                    authenticated:
                        Boolean(
                            testData.token
                        )

                },

                newman: {

                    requests,

                    assertions,

                    failed,

                    httpFailures,

                    assertionFailures,

                    skipped,

                    raw:
                        newmanResult

                },

                analysis

            };

        }
        catch (
            error
        ) {

            // ==================================================
            // ERROR REAL DEL AGENTE
            // ==================================================

            const errorMessage =
                error?.message ??
                error?.response?.data?.message ??
                error?.response?.data?.error ??
                String(error);


            Logger.error(
                "\n================================="
            );

            Logger.error(
                "ERROR EN POSTMAN AI TESTING AGENT"
            );

            Logger.error(
                "=================================\n"
            );


            Logger.error(
                errorMessage
            );


            if (
                error?.response?.data
            ) {

                console.error(
                    "\nBackend response:"
                );


                console.error(
                    JSON.stringify(
                        error.response.data,
                        null,
                        2
                    )
                );

            }


            /*
             * Aquí sí existe un error real del pipeline.
             *
             * Newman con pruebas fallidas NO llega aquí.
             */

            throw new Error(
                errorMessage
            );

        }

    }


    // ==========================================================
    // GUARDAR COLLECTION
    // ==========================================================

    async saveCollection(
        collection
    ) {

        const fs =
            await import("fs");


        const path =
            await import("path");


        const {
            fileURLToPath
        } =
            await import("url");


        const __filename =
            fileURLToPath(
                import.meta.url
            );


        const __dirname =
            path.dirname(
                __filename
            );


        const projectRoot =
            path.resolve(
                __dirname,
                "../../"
            );


        const collectionsPath =
            path.join(
                projectRoot,
                "collections"
            );


        if (
            !fs.existsSync(
                collectionsPath
            )
        ) {

            fs.mkdirSync(
                collectionsPath,
                {
                    recursive: true
                }
            );

        }


        const collectionPath =
            path.join(
                collectionsPath,
                "umss-market-api-generated.json"
            );


        fs.writeFileSync(

            collectionPath,

            JSON.stringify(
                collection,
                null,
                2
            ),

            "utf8"

        );


        return collectionPath;

    }

}


// ==========================================================
// EXPORT
// ==========================================================

export default new PostmanAgentEnhanced();