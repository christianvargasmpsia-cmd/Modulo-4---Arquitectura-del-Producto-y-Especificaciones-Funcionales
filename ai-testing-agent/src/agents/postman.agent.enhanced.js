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
    // Compatible con index.enhanced.js
    // ==========================================================

    async start(request = "UMSS Market") {

        const result =
            await this.execute(request);

        return result;

    }


    // ==========================================================
    // EJECUTAR AGENTE
    // ==========================================================

    async execute(userRequest = "") {

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
            // OBTENER TODOS LOS WORKSPACES
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
            // BUSCAR COLLECTION EN TODOS LOS WORKSPACES
            // ==================================================

            Logger.info(
                "\nStep 2: Buscando Collection UMSS Market..."
            );


            let selectedWorkspace =
                null;

            let selectedCollection =
                null;

            let collections =
                [];


            for (
                const workspace of workspaces
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
                            error.response?.status ??
                            error.message
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
                        "  Sin Collections."
                    );

                    continue;

                }


                Logger.success(
                    `  ✓ Collections encontradas: ${
                        currentCollections.length
                    }`
                );


                // ----------------------------------------------
                // BUSCAR UMSS MARKET
                // ----------------------------------------------

                const match =
                    currentCollections.find(
                        collection => {

                            const name =
                                collection?.name
                                    ?.toLowerCase()
                                    ?.trim() ??
                                "";

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


                if (match) {

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
                    "No se encontró la Collection 'UMSS Market API' en ninguno de los Workspaces disponibles."
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
                `  Collection UID: ${
                    selectedCollection.uid
                }`
            );


            // ==================================================
            // STEP 3
            // DESCARGAR COLLECTION COMPLETA
            // ==================================================

            Logger.info(
                "\nStep 3: Descargando Collection..."
            );


            const collection =
                await postmanService.getCollection(
                    selectedCollection.uid
                );


            if (!collection) {

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
            // GUARDAR COLLECTION LOCAL
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
            // DISCOVERY
            // ==================================================

            Logger.info(
                "\nStep 4: Descubriendo datos reales de prueba..."
            );


            const discovery =
                await dataDiscoveryService.discover();


            if (!discovery) {

                throw new Error(
                    "DataDiscovery no devolvió información."
                );

            }


            if (!discovery.ids) {

                throw new Error(
                    "DataDiscovery no devolvió los IDs."
                );

            }


            // ==================================================
            // CONSTRUIR TEST DATA
            // ==================================================

            const testData = {

                userId:
                    discovery.ids.userId ??
                    null,

                storeId:
                    discovery.ids.storeId ??
                    null,

                publicationId:
                    discovery.ids.publicationId ??
                    null,

                interactionId:
                    discovery.ids.interactionId ??
                    null,

                token:
                    discovery.auth?.token ??
                    null

            };


            // ==================================================
            // MOSTRAR DATOS DESCUBIERTOS
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
                testData.userId
            );


            console.log(
                "STORE_ID      :",
                testData.storeId
            );


            console.log(
                "PUBLICATION_ID:",
                testData.publicationId
            );


            console.log(
                "INTERACTION_ID:",
                testData.interactionId
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

            if (!testData.userId) {

                throw new Error(
                    "Discovery no obtuvo userId."
                );

            }


            if (!testData.storeId) {

                throw new Error(
                    "Discovery no obtuvo storeId."
                );

            }


            if (!testData.publicationId) {

                throw new Error(
                    "Discovery no obtuvo publicationId."
                );

            }


            if (!testData.interactionId) {

                throw new Error(
                    "Discovery no obtuvo interactionId."
                );

            }


            if (!testData.token) {

                throw new Error(
                    "Discovery no obtuvo JWT."
                );

            }


            Logger.success(
                "\n✓ Datos de prueba válidos."
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


            if (!newmanResult) {

                throw new Error(
                    "Newman no devolvió resultados."
                );

            }


            // ==================================================
            // NORMALIZAR RESULTADO
            // ==================================================

            const executionResult =
                newmanResult.result ??
                newmanResult;


            const requests =
                executionResult.requests ??
                0;


            const assertions =
                executionResult.assertions ??
                0;


            const failed =
                executionResult.failed ??
                0;


            const httpFailures =
                executionResult.httpFailures ??
                0;


            const assertionFailures =
                executionResult.assertionFailures ??
                0;


            // ==================================================
            // MOSTRAR RESULTADO NEWMAN
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


            // ==================================================
            // STEP 6
            // AI ANALYSIS
            // ==================================================

            Logger.info(
                "\nStep 6: Analizando resultados con AI..."
            );


            let analysis =
                null;


            try {

                analysis =
                    await analyzeResultsSkill.execute(
                        executionResult
                    );


                Logger.success(
                    "✓ Análisis AI completado."
                );

            }
            catch (analysisError) {

                Logger.warning(
                    `No se pudo realizar el análisis AI: ${
                        analysisError.message
                    }`
                );

            }


            // ==================================================
            // RESULTADO FINAL
            // ==================================================

            const success =
                failed === 0;


            Logger.info(
                "\n================================="
            );

            Logger.info(
                "RESULTADO FINAL"
            );

            Logger.info(
                "=================================\n"
            );


            if (success) {

                Logger.success(
                    "✓ Todas las pruebas HTTP pasaron."
                );

            }
            else {

                Logger.warning(
                    `⚠ Se detectaron ${
                        failed
                    } pruebas fallidas.`
                );

            }


            // ==================================================
            // RETURN
            // ==================================================

            return {

                success,

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

                    authenticated:
                        Boolean(
                            testData.token
                        )

                },

                newman:
                    newmanResult,

                analysis

            };

        }
        catch (error) {

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
                error?.message ??
                String(error)
            );


            if (
                error?.response?.data
            ) {

                console.error(
                    "\nBackend response:"
                );

                console.error(
                    error.response.data
                );

            }


            throw error;

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