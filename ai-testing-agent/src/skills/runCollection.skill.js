import newmanService
    from "../services/newman.service.js";


class RunCollectionSkill {

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
        // TEST DATA RECIBIDA DESDE POSTMAN AGENT
        // ======================================================

        console.log(
            "\n🔎 Test Data recibida:"
        );


        console.log(
            `   USER_ID        : ${
                testData.userId ?? "NO"
            }`
        );

        console.log(
            `   STORE_ID       : ${
                testData.storeId ?? "NO"
            }`
        );

        console.log(
            `   PUBLICATION_ID : ${
                testData.publicationId ?? "NO"
            }`
        );

        console.log(
            `   INTERACTION_ID : ${
                testData.interactionId ?? "NO"
            }`
        );

        console.log(
            `   JWT            : ${
                testData.token
                    ? "OK"
                    : "NO"
            }`
        );


        // ======================================================
        // VALIDACIONES
        // ======================================================

        if (!testData.userId) {

            throw new Error(
                "RunCollectionSkill: falta userId."
            );

        }

        if (!testData.storeId) {

            throw new Error(
                "RunCollectionSkill: falta storeId."
            );

        }

        if (!testData.publicationId) {

            throw new Error(
                "RunCollectionSkill: falta publicationId."
            );

        }

        if (!testData.interactionId) {

            throw new Error(
                "RunCollectionSkill: falta interactionId."
            );

        }

        if (!testData.token) {

            throw new Error(
                "RunCollectionSkill: falta JWT."
            );

        }


        console.log(
            "\n✅ Test Data válida."
        );


        // ======================================================
        // EJECUTAR NEWMAN
        // ======================================================

        console.log(
            "\n=================================================="
        );

        console.log(
            "🚀 EJECUTANDO NEWMAN"
        );

        console.log(
            "==================================================\n"
        );


        const result =
            await newmanService.runCollection(
                collectionPath,
                testData
            );


        if (!result) {

            throw new Error(
                "Newman no devolvió ningún resultado."
            );

        }


        // ======================================================
        // RESULTADO
        // ======================================================

        console.log(
            "\n=================================================="
        );

        console.log(
            "📊 NEWMAN FINALIZADO"
        );

        console.log(
            "==================================================\n"
        );


        console.log(
            `Requests           : ${
                result.requests ?? 0
            }`
        );

        console.log(
            `Assertions         : ${
                result.assertions ?? 0
            }`
        );

        console.log(
            `Failed             : ${
                result.failed ?? 0
            }`
        );

        console.log(
            `HTTP failures      : ${
                result.httpFailures ?? 0
            }`
        );

        console.log(
            `Assertion failures : ${
                result.assertionFailures ?? 0
            }`
        );


        return {

            success:
                (result.failed ?? 0) === 0,

            testData,

            result

        };

    }

}


export default new RunCollectionSkill();