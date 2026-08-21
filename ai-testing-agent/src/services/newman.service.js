import newman from "newman";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

class NewmanService {

    constructor() {

        const __filename =
            fileURLToPath(import.meta.url);

        const __dirname =
            path.dirname(__filename);

        this.projectRoot =
            path.resolve(
                __dirname,
                "../../"
            );

        this.reportsPath =
            path.join(
                this.projectRoot,
                "reports"
            );

        if (!fs.existsSync(this.reportsPath)) {

            fs.mkdirSync(
                this.reportsPath,
                {
                    recursive: true
                }
            );
        }
    }


    // ==========================================================
    // EJECUTAR COLLECTION
    // ==========================================================

    async runCollection(
        collectionPath,
        testData = {}
    ) {

        console.log("=================================");
        console.log("Ejecutando Newman");
        console.log("=================================\n");


        // ======================================================
        // VALIDACIONES
        // ======================================================

        if (!collectionPath) {

            throw new Error(
                "No se recibió la ruta de la Collection."
            );

        }


        if (!fs.existsSync(collectionPath)) {

            throw new Error(
                `La Collection no existe: ${collectionPath}`
            );

        }


        // ======================================================
        // LEER COLLECTION
        // ======================================================

        const collection =
            JSON.parse(
                fs.readFileSync(
                    collectionPath,
                    "utf8"
                ).replace(
                    /^\uFEFF/,
                    ""
                )
            );


        console.log(
            `Collection: ${
                collection?.info?.name ??
                "Unknown"
            }`
        );


        const requestsInCollection =
            this.countRequests(
                collection.item
            );


        console.log(
            `Requests encontrados: ${requestsInCollection}\n`
        );


        if (requestsInCollection === 0) {

            throw new Error(
                `La Collection "${
                    collection?.info?.name ??
                    "Unknown"
                }" está vacía.`
            );

        }


        // ======================================================
        // DATOS DESCUBIERTOS
        // ======================================================

        console.log(
            "Datos para ejecución:"
        );

        console.log(
            `  userId        : ${
                testData.userId ?? "N/A"
            }`
        );

        console.log(
            `  storeId       : ${
                testData.storeId ?? "N/A"
            }`
        );

        console.log(
            `  publicationId : ${
                testData.publicationId ?? "N/A"
            }`
        );

        console.log(
            `  interactionId : ${
                testData.interactionId ?? "N/A"
            }`
        );

        console.log(
            `  authToken     : ${
                testData.token ? "OK" : "N/A"
            }`
        );

        console.log();


        // ======================================================
        // VARIABLES
        // ======================================================

        collection.variable =
            collection.variable ?? [];


        this.setCollectionVariable(
            collection,
            "baseUrl",
            "http://localhost:8080"
        );


        this.setCollectionVariable(
            collection,
            "userId",
            testData.userId ?? ""
        );


        this.setCollectionVariable(
            collection,
            "storeId",
            testData.storeId ?? ""
        );


        this.setCollectionVariable(
            collection,
            "publicationId",
            testData.publicationId ?? ""
        );


        this.setCollectionVariable(
            collection,
            "interactionId",
            testData.interactionId ?? ""
        );


        this.setCollectionVariable(
            collection,
            "authToken",
            testData.token ?? ""
        );


        // ======================================================
        // PREPARAR REQUESTS
        // ======================================================

        this.prepareCollection(
            collection.item,
            testData
        );


        // ======================================================
        // COLLECTION TEMPORAL
        // ======================================================

        const preparedPath =
            path.join(
                this.projectRoot,
                "collections",
                "umss-market-api-newman.json"
            );


        fs.writeFileSync(
            preparedPath,
            JSON.stringify(
                collection,
                null,
                2
            ),
            "utf8"
        );


        console.log(
            `Collection preparada: ${preparedPath}`
        );


        console.log(
            `Requests a ejecutar: ${
                this.countRequests(
                    collection.item
                )
            }\n`
        );


        // ======================================================
        // NEWMAN
        // ======================================================

        return new Promise(
            (resolve, reject) => {

                newman.run(
                    {

                        collection:
                            preparedPath,

                        reporters:
                            [
                                "cli",
                                "json"
                            ],

                        reporter:
                            {
                                json:
                                    {
                                        export:
                                            path.join(
                                                this.reportsPath,
                                                "newman-report.json"
                                            )
                                    }
                            },

                        timeoutRequest:
                            15000,

                        timeoutScript:
                            15000,

                        bail:
                            false

                    },

                    (
                        error,
                        summary
                    ) => {

                        if (error) {

                            reject(error);
                            return;

                        }


                        const executions =
                            summary?.run?.executions ??
                            [];


                        const requests =
                            summary?.run?.stats
                                ?.requests
                                ?.total ??
                            executions.length;


                        const assertions =
                            summary?.run?.stats
                                ?.assertions
                                ?.total ??
                            0;


                        const assertionFailures =
                            summary?.run?.failures
                                ?.length ??
                            0;


                        const httpResults =
                            executions.map(
                                (
                                    execution,
                                    index
                                ) => {

                                    const response =
                                        execution?.response;

                                    const request =
                                        execution?.request;

                                    const item =
                                        execution?.item;


                                    const statusCode =
                                        response?.code ??
                                        null;


                                    const failed =
                                        !response ||
                                        (
                                            statusCode !== null &&
                                            statusCode >= 400
                                        );


                                    return {

                                        id:
                                            index + 1,

                                        test:
                                            item?.name ??
                                            "Unknown request",

                                        request:
                                            item?.name ??
                                            "Unknown request",

                                        method:
                                            request?.method ??
                                            "UNKNOWN",

                                        url:
                                            request?.url
                                                ?.toString?.() ??
                                            "",

                                        status:
                                            response?.status ??
                                            "NO RESPONSE",

                                        statusCode,

                                        failed,

                                        responseTime:
                                            response?.responseTime ??
                                            null

                                    };

                                }
                            );


                        const httpFailures =
                            httpResults.filter(
                                result =>
                                    result.failed
                            );


                        const failed =
                            httpFailures.length;


                        const result = {

                            requests,

                            assertions,

                            failed,

                            httpFailures:
                                httpFailures.length,

                            assertionFailures,

                            httpResults,

                            summary

                        };


                        // ==================================================
                        // RESULTADO
                        // ==================================================

                        console.log(
                            "\n================================="
                        );

                        console.log(
                            "Resultado Newman"
                        );

                        console.log(
                            "=================================\n"
                        );

                        console.log(
                            `Requests      : ${requests}`
                        );

                        console.log(
                            `Assertions    : ${assertions}`
                        );

                        console.log(
                            `HTTP failures : ${httpFailures.length}`
                        );

                        console.log(
                            `Failed        : ${failed}`
                        );


                        // ==================================================
                        // FALLAS
                        // ==================================================

                        if (
                            httpFailures.length > 0
                        ) {

                            console.log(
                                "\nFallos detectados:"
                            );


                            httpFailures.forEach(
                                failure => {

                                    console.log(
                                        `  ${
                                            failure.method
                                        } ${
                                            failure.url ||
                                            failure.request
                                        } → HTTP ${
                                            failure.statusCode ??
                                            "N/A"
                                        }`
                                    );

                                }
                            );

                        }


                        // ==================================================
                        // DETALLE
                        // ==================================================

                        console.log(
                            "\n================================="
                        );

                        console.log(
                            "Detalle de ejecución"
                        );

                        console.log(
                            "=================================\n"
                        );


                        httpResults.forEach(
                            execution => {

                                console.log(
                                    `${
                                        execution.failed
                                            ? "❌"
                                            : "✅"
                                    } ${
                                        execution.method
                                    } ${
                                        execution.test
                                    } → HTTP ${
                                        execution.statusCode ??
                                        "N/A"
                                    }`
                                );

                            }
                        );


                        resolve(
                            result
                        );

                    }

                );

            }

        );

    }


    // ==========================================================
    // PREPARAR COLLECTION
    // ==========================================================

    prepareCollection(
        items = [],
        testData = {}
    ) {

        for (
            const item of items
        ) {

            if (item.request) {

                this.prepareRequest(
                    item.request,
                    testData
                );

            }


            if (
                Array.isArray(
                    item.item
                )
            ) {

                this.prepareCollection(
                    item.item,
                    testData
                );

            }

        }

    }


    // ==========================================================
    // PREPARAR REQUEST
    // ==========================================================

    prepareRequest(
        request,
        testData
    ) {

        if (!request) {
            return;
        }


        // ======================================================
        // URL
        // ======================================================

        if (request.url) {

            request.url =
                this.prepareUrl(
                    request.url,
                    testData
                );

        }


        // ======================================================
        // BODY
        // ======================================================

        if (request.body?.raw) {

            request.body.raw =
                this.replaceGenericValues(
                    request.body.raw,
                    testData
                );

        }


        // ======================================================
        // HEADERS
        // ======================================================

        if (
            Array.isArray(
                request.header
            )
        ) {

            request.header =
                request.header.map(
                    header => {

                        if (header.value) {

                            header.value =
                                this.replaceGenericValues(
                                    header.value,
                                    testData
                                );

                        }

                        return header;

                    }
                );

        }


        // ======================================================
        // JWT
        // ======================================================

        if (
            testData.token
        ) {

            const hasAuthorization =
                Array.isArray(
                    request.header
                ) &&
                request.header.some(
                    header =>
                        String(
                            header.key ?? ""
                        ).toLowerCase() ===
                        "authorization"
                );


            if (!hasAuthorization) {

                request.header =
                    request.header ?? [];


                request.header.push(
                    {
                        key:
                            "Authorization",

                        value:
                            `Bearer ${testData.token}`,

                        type:
                            "text"
                    }
                );

            }
            else {

                request.header =
                    request.header.map(
                        header => {

                            if (
                                String(
                                    header.key ?? ""
                                ).toLowerCase() ===
                                "authorization"
                            ) {

                                header.value =
                                    `Bearer ${testData.token}`;

                            }

                            return header;

                        }
                    );

            }

        }

    }


    // ==========================================================
    // PREPARAR URL
    // ==========================================================

    prepareUrl(
        url,
        testData
    ) {

        if (
            typeof url === "string"
        ) {

            return this.replaceGenericValues(
                url,
                testData
            );

        }


        if (
            typeof url !== "object" ||
            url === null
        ) {

            return url;

        }


        // Guardamos los segmentos originales
        // antes de modificarlos.

        const originalPath =
            Array.isArray(url.path)
                ? [...url.path]
                : [];


        // ======================================================
        // PATH
        // ======================================================

        if (
            Array.isArray(url.path)
        ) {

            url.path =
                url.path.map(
                    segment => {

                        if (
                            segment === ":id" ||
                            segment === "<uuid>"
                        ) {

                            return this.resolvePathId(
                                originalPath,
                                testData
                            );

                        }


                        return this.replaceGenericValues(
                            segment,
                            testData
                        );

                    }
                );

        }


        // ======================================================
        // QUERY
        // ======================================================

        if (
            Array.isArray(url.query)
        ) {

            url.query =
                url.query.map(
                    parameter => {

                        if (
                            parameter.value
                        ) {

                            parameter.value =
                                this.replaceGenericValues(
                                    parameter.value,
                                    testData
                                );

                        }

                        return parameter;

                    }
                );

        }


        // ======================================================
        // VARIABLES
        // ======================================================

        if (
            Array.isArray(url.variable)
        ) {

            url.variable =
                url.variable.map(
                    variable => {

                        if (
                            variable.value ===
                            "<uuid>"
                        ) {

                            variable.value =
                                this.resolveVariableId(
                                    variable.key,
                                    testData
                                );

                        }

                        return variable;

                    }
                );

        }


        return url;

    }


    // ==========================================================
    // RESOLVER ID DEL PATH
    // ==========================================================

    resolvePathId(
        pathSegments,
        testData
    ) {

        const normalizedPath =
            pathSegments
                .join("/")
                .toLowerCase();


        if (
            normalizedPath.includes(
                "/users/"
            )
        ) {

            return (
                testData.userId ??
                ""
            );

        }


        if (
            normalizedPath.includes(
                "/stores/"
            )
        ) {

            return (
                testData.storeId ??
                ""
            );

        }


        if (
            normalizedPath.includes(
                "/publications/"
            )
        ) {

            return (
                testData.publicationId ??
                ""
            );

        }


        if (
            normalizedPath.includes(
                "/interactions/"
            )
        ) {

            return (
                testData.interactionId ??
                ""
            );

        }


        return "";

    }


    // ==========================================================
    // RESOLVER VARIABLE ID
    // ==========================================================

    resolveVariableId(
        key,
        testData
    ) {

        const normalizedKey =
            String(
                key ?? ""
            ).toLowerCase();


        if (
            normalizedKey.includes(
                "user"
            )
        ) {

            return testData.userId ?? "";

        }


        if (
            normalizedKey.includes(
                "store"
            )
        ) {

            return testData.storeId ?? "";

        }


        if (
            normalizedKey.includes(
                "publication"
            )
        ) {

            return testData.publicationId ?? "";

        }


        if (
            normalizedKey.includes(
                "interaction"
            )
        ) {

            return testData.interactionId ?? "";

        }


        return "";

    }


    // ==========================================================
    // REEMPLAZAR VALORES
    // ==========================================================

    replaceGenericValues(
        value,
        testData
    ) {

        if (
            typeof value !== "string"
        ) {

            return value;

        }


        return value

            .replace(
                /<string>/gi,
                "laptop"
            )

            .replace(
                /<number>/gi,
                "100"
            )

            .replace(
                /<uuid>/gi,
                testData.publicationId ??
                testData.storeId ??
                testData.userId ??
                ""
            )

            .replace(
                /{{userId}}/gi,
                testData.userId ??
                ""
            )

            .replace(
                /{{storeId}}/gi,
                testData.storeId ??
                ""
            )

            .replace(
                /{{publicationId}}/gi,
                testData.publicationId ??
                ""
            )

            .replace(
                /{{interactionId}}/gi,
                testData.interactionId ??
                ""
            )

            .replace(
                /{{authToken}}/gi,
                testData.token ??
                ""
            );

    }


    // ==========================================================
    // SET COLLECTION VARIABLE
    // ==========================================================

    setCollectionVariable(
        collection,
        key,
        value
    ) {

        const existing =
            collection.variable.find(
                variable =>
                    variable.key === key
            );


        if (existing) {

            existing.value =
                value;

        }
        else {

            collection.variable.push(
                {
                    key,
                    value
                }
            );

        }

    }


    // ==========================================================
    // CONTAR REQUESTS
    // ==========================================================

    countRequests(
        items = []
    ) {

        let count = 0;


        for (
            const item of items
        ) {

            if (item.request) {

                count++;

            }


            if (item.item) {

                count +=
                    this.countRequests(
                        item.item
                    );

            }

        }


        return count;

    }

}


export default new NewmanService();