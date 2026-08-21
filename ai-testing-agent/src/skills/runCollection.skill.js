import newmanService
    from "../services/newman.service.js";


class RunCollectionSkill {

    // ==========================================================
    // EJECUTAR COLLECTION
    // ==========================================================

    async execute(
        collectionPath,
        testData = {}
    ) {

        console.log(
            "\n=================================================="
        );

        console.log(
            "🧪 RUN COLLECTION SKILL"
        );

        console.log(
            "==================================================\n"
        );


        // ======================================================
        // VALIDAR COLLECTION
        // ======================================================

        if (!collectionPath) {

            throw new Error(
                "No se recibió la ruta de la Collection."
            );

        }


        console.log(
            "📦 Collection:"
        );

        console.log(
            `   ${collectionPath}`
        );


        // ======================================================
        // MOSTRAR TEST DATA
        // ======================================================

        this.printTestData(
            testData
        );


        // ======================================================
        // VALIDAR DATOS BASE
        //
        // IMPORTANTE:
        //
        // interactionId NO es obligatorio.
        //
        // storeId y publicationId tampoco deben bloquear
        // toda la colección si alguna prueba específica
        // no los necesita.
        // ======================================================

        this.validateBaseData(
            testData
        );


        // ======================================================
        // INTERACTION OPCIONAL
        // ======================================================

        this.printInteractionStatus(
            testData
        );


        // ======================================================
        // DATOS VÁLIDOS
        // ======================================================

        this.printValidData(
            testData
        );


        // ======================================================
        // EJECUTAR NEWMAN
        // ======================================================

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "🚀 EJECUTANDO NEWMAN"
        );

        console.log(
            "=================================================="
        );

        console.log("");


        let result;


        try {

            result =
                await newmanService.runCollection(
                    collectionPath,
                    testData
                );

        }
        catch (error) {

            console.log("");

            console.log(
                "❌ NEWMAN FALLÓ"
            );

            console.log(
                `   ${error.message}`
            );


            throw error;

        }


        // ======================================================
        // VALIDAR RESULTADO
        // ======================================================

        if (!result) {

            throw new Error(
                "Newman no devolvió ningún resultado."
            );

        }


        // ======================================================
        // NORMALIZAR RESULTADOS
        // ======================================================

        const requests =
            result.requests ?? 0;


        const assertions =
            result.assertions ?? 0;


        const failed =
            result.failed ?? 0;


        const httpFailures =
            result.httpFailures ??
            failed;


        const assertionFailures =
            result.assertionFailures ??
            0;


        const skipped =
            result.skipped ??
            0;


        // ======================================================
        // RESULTADO
        // ======================================================

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "📊 NEWMAN FINALIZADO"
        );

        console.log(
            "=================================================="
        );

        console.log("");


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


        // ======================================================
        // MOSTRAR DETALLE
        // ======================================================

        this.printResults(
            result
        );


        // ======================================================
        // ESTADO FINAL
        // ======================================================

        const success =
            failed === 0 &&
            assertionFailures === 0;


        console.log("");


        if (success) {

            console.log(
                "=================================================="
            );

            console.log(
                "✅ PIPELINE DE NEWMAN COMPLETADO"
            );

            console.log(
                "=================================================="
            );

        }
        else {

            console.log(
                "=================================================="
            );

            console.log(
                "⚠️ PIPELINE COMPLETADO CON FALLAS"
            );

            console.log(
                "=================================================="
            );

        }


        // ======================================================
        // RETORNO
        // ======================================================

        return {

            success,

            testData: {

                ...testData,

                interactionId:
                    testData.interactionId ??
                    null

            },

            result

        };

    }


    // ==========================================================
    // MOSTRAR TEST DATA
    // ==========================================================

    printTestData(
        testData
    ) {

        console.log(
            "\n🔎 Test Data recibida:"
        );

        console.log(
            "--------------------------------------------------"
        );


        console.log(
            `   USER_ID        : ${
                testData.userId ??
                "NO"
            }`
        );


        console.log(
            `   STORE_ID       : ${
                testData.storeId ??
                "NO"
            }`
        );


        console.log(
            `   PUBLICATION_ID : ${
                testData.publicationId ??
                "NO"
            }`
        );


        console.log(
            `   INTERACTION_ID : ${
                testData.interactionId ??
                "NO"
            }`
        );


        console.log(
            `   EMAIL          : ${
                testData.email ??
                "NO"
            }`
        );


        console.log(
            `   ROLE           : ${
                testData.role ??
                "NO"
            }`
        );


        console.log(
            `   JWT            : ${
                testData.token
                    ? "OK"
                    : "NO"
            }`
        );

    }


    // ==========================================================
    // VALIDAR DATOS BASE
    // ==========================================================

    validateBaseData(
        testData
    ) {

        const missing =
            [];


        // ------------------------------------------------------
        // USER
        // ------------------------------------------------------

        if (
            !testData.userId
        ) {

            missing.push(
                "userId"
            );

        }


        // ------------------------------------------------------
        // JWT
        // ------------------------------------------------------

        if (
            !testData.token
        ) {

            missing.push(
                "JWT"
            );

        }


        // ------------------------------------------------------
        // EMAIL
        //
        // No es estrictamente obligatorio para Newman,
        // pero sí es necesario para el POST /login que queremos
        // probar.
        // ------------------------------------------------------

        if (
            !testData.email
        ) {

            console.log(
                "⚠️ No se recibió email de testing."
            );

            console.log(
                "   POST /login podría no ejecutarse correctamente."
            );

        }


        // ------------------------------------------------------
        // VALIDACIÓN FINAL
        // ------------------------------------------------------

        if (
            missing.length > 0
        ) {

            console.log("");

            console.log(
                "❌ DATOS BASE OBLIGATORIOS FALTANTES"
            );


            missing.forEach(
                field => {

                    console.log(
                        `   ❌ ${field}`
                    );

                }
            );


            throw new Error(
                `RunCollectionSkill: faltan datos obligatorios: ${
                    missing.join(", ")
                }.`
            );

        }


        console.log("");

        console.log(
            "✓ Datos base válidos."
        );

    }


    // ==========================================================
    // ESTADO DE INTERACTION
    // ==========================================================

    printInteractionStatus(
        testData
    ) {

        console.log("");


        if (
            testData.interactionId
        ) {

            console.log(
                "✓ Interaction disponible."
            );


            console.log(
                `  ID: ${testData.interactionId}`
            );

        }
        else {

            console.log(
                "⚠️ No existe interactionId."
            );


            console.log(
                "   Esto NO detiene la ejecución."
            );


            console.log(
                "   Las pruebas que requieran interaction serán omitidas."
            );

        }

    }


    // ==========================================================
    // MOSTRAR DATOS VÁLIDOS
    // ==========================================================

    printValidData(
        testData
    ) {

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "✅ DATOS BASE VÁLIDOS"
        );

        console.log(
            "=================================================="
        );


        console.log(
            `✓ Usuario       : ${
                testData.email ??
                testData.userId
            }`
        );


        console.log(
            `✓ Rol           : ${
                testData.role ??
                "N/A"
            }`
        );


        console.log(
            `✓ User ID       : ${
                testData.userId
            }`
        );


        console.log(
            `✓ Store ID      : ${
                testData.storeId ??
                "N/A — pruebas dependientes serán omitidas"
            }`
        );


        console.log(
            `✓ Publication ID: ${
                testData.publicationId ??
                "N/A — pruebas dependientes serán omitidas"
            }`
        );


        console.log(
            `✓ Interaction ID: ${
                testData.interactionId ??
                "N/A — pruebas dependientes serán omitidas"
            }`
        );


        console.log(
            `✓ Discovery JWT  : ${
                testData.token
                    ? "OK"
                    : "NO"
            }`
        );

    }


    // ==========================================================
    // MOSTRAR RESULTADOS
    // ==========================================================

    printResults(
        result
    ) {

        const results =
            result.httpResults ??
            [];


        if (
            !Array.isArray(results) ||
            results.length === 0
        ) {

            return;

        }


        console.log("");

        console.log(
            "📋 DETALLE DE REQUESTS"
        );

        console.log(
            "--------------------------------------------------"
        );


        results.forEach(
            request => {

                const icon =
                    request.failed
                        ? "❌"
                        : "✅";


                const status =
                    request.statusCode ??
                    "N/A";


                console.log(

                    `${icon} ` +
                    `${request.method} ` +
                    `${request.name} ` +
                    `→ ${status}`

                );


                if (
                    request.failed
                ) {

                    if (
                        request.url
                    ) {

                        console.log(
                            `   URL: ${request.url}`
                        );

                    }

                }

            }
        );

    }

}


export default new RunCollectionSkill();