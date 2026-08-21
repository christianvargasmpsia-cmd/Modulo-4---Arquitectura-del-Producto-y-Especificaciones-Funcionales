import newmanService
    from "../services/newman.service.js";

import dataDiscoveryService
    from "../services/dataDiscovery.service.js";


class RunCollectionSkill {

    async execute(collectionPath) {

        console.log(
            "================================="
        );

        console.log(
            "Skill: Ejecutar Newman"
        );

        console.log(
            "=================================\n"
        );


        // ==================================================
        // VALIDAR COLLECTION
        // ==================================================

        if (!collectionPath) {

            throw new Error(
                "No se recibió la ruta de la Collection para ejecutar Newman."
            );

        }


        console.log(
            `Collection recibida: ${collectionPath}\n`
        );


        // ==================================================
        // DISCOVERY
        // ==================================================

        console.log(
            "================================="
        );

        console.log(
            "Preparando datos de prueba"
        );

        console.log(
            "=================================\n"
        );


        const context =
            await dataDiscoveryService.discover();


        if (!context) {

            throw new Error(
                "Discovery no devolvió ningún contexto."
            );

        }


        if (!context.ids) {

            throw new Error(
                "Discovery no devolvió los IDs de prueba."
            );

        }


        // ==================================================
        // VALIDAR IDS
        // ==================================================

        const {
            userId,
            storeId,
            publicationId,
            interactionId
        } = context.ids;


        console.log(
            "\n================================="
        );

        console.log(
            "CONTEXTO PARA NEWMAN"
        );

        console.log(
            "=================================\n"
        );


        console.log(
            "userId        :",
            userId ?? "N/A"
        );

        console.log(
            "storeId       :",
            storeId ?? "N/A"
        );

        console.log(
            "publicationId :",
            publicationId ?? "N/A"
        );

        console.log(
            "interactionId :",
            interactionId ?? "N/A"
        );


        // ==================================================
        // TOKEN
        // ==================================================

        const token =
            context.auth?.token ??
            null;


        console.log(
            "authToken     :",
            token
                ? "OK"
                : "N/A"
        );


        // ==================================================
        // VALIDACIONES MÍNIMAS
        // ==================================================

        if (!userId) {

            throw new Error(
                "Discovery no obtuvo userId."
            );

        }


        if (!storeId) {

            throw new Error(
                "Discovery no obtuvo storeId."
            );

        }


        if (!publicationId) {

            throw new Error(
                "Discovery no obtuvo publicationId."
            );

        }


        if (!interactionId) {

            throw new Error(
                "Discovery no obtuvo interactionId."
            );

        }


        if (!token) {

            throw new Error(
                "Discovery no obtuvo el JWT."
            );

        }


        // ==================================================
        // TEST DATA
        // ==================================================

        const testData = {

            userId,

            storeId,

            publicationId,

            interactionId,

            token

        };


        // ==================================================
        // EJECUTAR NEWMAN
        // ==================================================

        console.log(
            "\n================================="
        );

        console.log(
            "INICIANDO NEWMAN"
        );

        console.log(
            "=================================\n"
        );


        const result =
            await newmanService.runCollection(
                collectionPath,
                testData
            );


        // ==================================================
        // RESULTADO
        // ==================================================

        console.log(
            "\n================================="
        );

        console.log(
            "SKILL COMPLETADO"
        );

        console.log(
            "=================================\n"
        );


        console.log(
            `Requests   : ${result.requests}`
        );

        console.log(
            `Assertions : ${result.assertions}`
        );

        console.log(
            `Failed     : ${result.failed}`
        );

        console.log(
            `HTTP failures       : ${result.httpFailures}`
        );

        console.log(
            `Assertion failures  : ${result.assertionFailures}`
        );


        return {

            success:
                result.failed === 0,

            testData,

            result

        };

    }

}


export default new RunCollectionSkill();