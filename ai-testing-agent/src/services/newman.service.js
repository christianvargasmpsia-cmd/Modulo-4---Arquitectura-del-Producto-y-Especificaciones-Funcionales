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

        this.collectionsPath =
            path.join(
                this.projectRoot,
                "collections"
            );

        fs.mkdirSync(
            this.reportsPath,
            {
                recursive: true
            }
        );

        fs.mkdirSync(
            this.collectionsPath,
            {
                recursive: true
            }
        );

    }


    // ==========================================================
    // RUN COLLECTION
    // ==========================================================

    async runCollection(
        collectionPath,
        testData = {}
    ) {

        this.title(
            "NEWMAN TEST RUNNER"
        );


        // ======================================================
        // VALIDAR COLLECTION
        // ======================================================

        if (!collectionPath) {

            throw new Error(
                "No se recibió la ruta de la Collection."
            );

        }


        if (!fs.existsSync(collectionPath)) {

            throw new Error(
                `Collection no encontrada: ${collectionPath}`
            );

        }


        // ======================================================
        // MOSTRAR TEST DATA
        // ======================================================

        console.log(
            "\n📦 TEST DATA"
        );

        console.log(
            "--------------------------------------------------"
        );

        console.log(
            `USER_ID        : ${testData.userId ?? "N/A"}`
        );

        console.log(
            `STORE_ID       : ${testData.storeId ?? "N/A"}`
        );

        console.log(
            `PUBLICATION_ID : ${testData.publicationId ?? "N/A"}`
        );

        console.log(
            `INTERACTION_ID : ${testData.interactionId ?? "N/A"}`
        );

        console.log(
            `JWT            : ${testData.token ? "OK" : "NO"}`
        );


        this.validateTestData(
            testData
        );


        // ======================================================
        // LEER COLLECTION
        // ======================================================

        console.log(
            "\n📖 Leyendo Collection..."
        );


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


        const totalRequests =
            this.countRequests(
                collection.item
            );


        console.log(
            `✓ Collection: ${
                collection.info?.name ??
                "Sin nombre"
            }`
        );

        console.log(
            `✓ Requests: ${totalRequests}`
        );


        // ======================================================
        // VARIABLES
        // ======================================================

        collection.variable =
            Array.isArray(
                collection.variable
            )
                ? collection.variable
                : [];


        this.setVariable(
            collection,
            "baseUrl",
            "http://localhost:8080"
        );

        this.setVariable(
            collection,
            "userId",
            testData.userId
        );

        this.setVariable(
            collection,
            "storeId",
            testData.storeId
        );

        this.setVariable(
            collection,
            "publicationId",
            testData.publicationId
        );

        this.setVariable(
            collection,
            "interactionId",
            testData.interactionId
        );

        this.setVariable(
            collection,
            "authToken",
            testData.token
        );

        this.setVariable(
            collection,
            "token",
            testData.token
        );


        // ======================================================
        // PREPARAR REQUESTS
        // ======================================================

        console.log(
            "\n🔧 PREPARANDO REQUESTS"
        );

        console.log(
            "--------------------------------------------------"
        );


        this.prepareItems(
            collection.item,
            testData
        );


        // ======================================================
        // ORDENAR WORKFLOW
        // ======================================================

        console.log(
            "\n🧠 ORGANIZANDO WORKFLOW DE PRUEBAS..."
        );

        console.log(
            "--------------------------------------------------"
        );


        collection.item =
            this.organizeCollection(
                collection.item
            );


        // ======================================================
        // MOSTRAR ORDEN FINAL
        // ======================================================

        console.log(
            "\n📋 ORDEN FINAL DE EJECUCIÓN"
        );

        console.log(
            "=================================================="
        );


        const order = [];

        this.collectRequests(
            collection.item,
            order
        );


        order.forEach(
            (
                request,
                index
            ) => {

                console.log(
                    `${String(index + 1).padStart(2, "0")}. ` +
                    `${request.method.padEnd(6)} ` +
                    `${request.name}`
                );

            }
        );


        // ======================================================
        // GUARDAR COLLECTION
        // ======================================================

        const preparedPath =
            path.join(
                this.collectionsPath,
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
            "\n✓ Collection preparada:"
        );

        console.log(
            preparedPath
        );


        // ======================================================
        // EJECUTAR NEWMAN
        // ======================================================

        console.log(
            "\n🚀 EJECUTANDO NEWMAN"
        );

        console.log(
            "=================================================="
        );


        return new Promise(
            (
                resolve,
                reject
            ) => {

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

                            reject(
                                error
                            );

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


                        // ==================================================
                        // RESULTADOS
                        // ==================================================

                        const results =
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


                                    const code =
                                        response?.code ??
                                        null;


                                    const failed =
                                        !response ||
                                        code >= 400;


                                    let url = "";


                                    try {

                                        if (
                                            typeof request?.url ===
                                            "string"
                                        ) {

                                            url =
                                                request.url;

                                        }
                                        else if (
                                            request?.url?.toString
                                        ) {

                                            url =
                                                request.url.toString();

                                        }

                                    }
                                    catch {

                                        url = "";

                                    }


                                    return {

                                        index:
                                            index + 1,

                                        name:
                                            item?.name ??
                                            "Unnamed",

                                        method:
                                            request?.method ??
                                            "UNKNOWN",

                                        url,

                                        status:
                                            response?.status ??
                                            "NO RESPONSE",

                                        statusCode:
                                            code,

                                        failed,

                                        responseTime:
                                            response?.responseTime ??
                                            null

                                    };

                                }
                            );


                        const httpFailures =
                            results.filter(
                                result =>
                                    result.failed
                            );


                        const result = {

                            requests,

                            assertions,

                            failed:
                                httpFailures.length,

                            httpFailures:
                                httpFailures.length,

                            assertionFailures,

                            httpResults:
                                results,

                            summary

                        };


                        // ==================================================
                        // RESUMEN
                        // ==================================================

                        this.title(
                            "RESULTADO NEWMAN"
                        );


                        console.log(
                            `📡 Requests      : ${requests}`
                        );

                        console.log(
                            `🧪 Assertions    : ${assertions}`
                        );

                        console.log(
                            `❌ HTTP failures : ${httpFailures.length}`
                        );

                        console.log(
                            `⚠️ Assertions    : ${assertionFailures}`
                        );


                        console.log(
                            "\n📋 RESULTADOS"
                        );

                        console.log(
                            "--------------------------------------------------"
                        );


                        results.forEach(
                            item => {

                                console.log(
                                    `${item.failed ? "❌" : "✅"} ` +
                                    `${item.method} ` +
                                    `${item.name} ` +
                                    `→ ${item.statusCode ?? "N/A"}`
                                );


                                if (
                                    item.failed
                                ) {

                                    console.log(
                                        `   ${item.url}`
                                    );

                                }

                            }
                        );


                        console.log(
                            "\n=================================================="
                        );

                        console.log(
                            "📊 NEWMAN FINALIZADO"
                        );

                        console.log(
                            "=================================================="
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
    // ORGANIZAR COLLECTION
    // ==========================================================

    organizeCollection(
        items = []
    ) {

        const requests = [];


        // ------------------------------------------------------
        // APLANAR TODO
        // ------------------------------------------------------

        this.flattenRequests(
            items,
            requests
        );


        console.log(
            `✓ Requests detectados: ${requests.length}`
        );


        // ------------------------------------------------------
        // ORDEN DE WORKFLOW
        // ------------------------------------------------------

        const ordered =
            requests.sort(
                (
                    a,
                    b
                ) => {

                    const priorityA =
                        this.getRequestPriority(
                            a
                        );

                    const priorityB =
                        this.getRequestPriority(
                            b
                        );


                    if (
                        priorityA !==
                        priorityB
                    ) {

                        return (
                            priorityA -
                            priorityB
                        );

                    }


                    return (
                        a.originalIndex -
                        b.originalIndex
                    );

                }
            );


        // ------------------------------------------------------
        // MOSTRAR CATEGORÍAS
        // ------------------------------------------------------

        console.log(
            "\n✓ Workflow organizado:"
        );


        let previousPriority =
            null;


        for (
            const request of ordered
        ) {

            const priority =
                this.getRequestPriority(
                    request
                );


            if (
                priority !==
                previousPriority
            ) {

                console.log(
                    `\n  [FASE ${priority}]`
                );

                previousPriority =
                    priority;

            }


            console.log(
                `    ${request.method.padEnd(6)} ` +
                `${request.name}`
            );

        }


        // ------------------------------------------------------
        // DEVOLVER ITEMS
        // ------------------------------------------------------

        return ordered.map(
            request =>
                request.item
        );

    }


    // ==========================================================
    // APLANAR REQUESTS
    // ==========================================================

    flattenRequests(
        items = [],
        result = [],
        parentFolder = ""
    ) {

        for (
            const item of items
        ) {

            if (
                item?.request
            ) {

                result.push(
                    {

                        item,

                        name:
                            item.name ??
                            "Unnamed",

                        method:
                            String(
                                item.request.method ??
                                "UNKNOWN"
                            ).toUpperCase(),

                        url:
                            this.getItemUrl(
                                item
                            ),

                        folder:
                            parentFolder,

                        originalIndex:
                            result.length

                    }
                );

            }


            if (
                Array.isArray(
                    item?.item
                )
            ) {

                this.flattenRequests(
                    item.item,
                    result,
                    item.name ??
                    parentFolder
                );

            }

        }

    }


    // ==========================================================
    // PRIORIDAD DEL REQUEST
    // ==========================================================

    getRequestPriority(
        request
    ) {

        const method =
            String(
                request.method ??
                ""
            ).toUpperCase();


        const name =
            String(
                request.name ??
                ""
            ).toLowerCase();


        const url =
            String(
                request.url ??
                ""
            ).toLowerCase();


        // ======================================================
        // FASE 1
        // REGISTROS
        // ======================================================

        if (
            url.includes(
                "/api/auth/register/"
            )
        ) {

            return 1;

        }


        // ======================================================
        // FASE 2
        // LOGIN
        // ======================================================

        if (
            url.includes(
                "/api/auth/login"
            )
        ) {

            return 2;

        }


        // ======================================================
        // FASE 3
        // ME
        // ======================================================

        if (
            url.includes(
                "/api/auth/me"
            )
        ) {

            return 3;

        }


        // ======================================================
        // FASE 4
        // USERS
        // ======================================================

        if (
            url.includes(
                "/api/users"
            ) &&
            method !== "DELETE"
        ) {

            return 4;

        }


        // ======================================================
        // FASE 5
        // STORES
        // ======================================================

        if (
            url.includes(
                "/api/stores"
            ) &&
            method !== "DELETE"
        ) {

            return 5;

        }


        // ======================================================
        // FASE 6
        // PUBLICATIONS
        // ======================================================

        if (
            url.includes(
                "/api/publications"
            ) &&
            method !== "DELETE"
        ) {

            return 6;

        }


        // ======================================================
        // FASE 7
        // INTERACTIONS
        // ======================================================

        if (
            url.includes(
                "/api/interactions"
            ) &&
            method !== "DELETE"
        ) {

            return 7;

        }


        // ======================================================
        // FASE 8
        // AI
        // ======================================================

        if (
            url.includes(
                "/api/ai/"
            )
        ) {

            return 8;

        }


        // ======================================================
        // FASE 9
        // EMBEDDINGS
        // ======================================================

        if (
            url.includes(
                "/api/admin/embeddings/"
            )
        ) {

            return 9;

        }


        // ======================================================
        // FASE 10
        // DELETE
        // ======================================================

        if (
            method === "DELETE"
        ) {

            return 10;

        }


        // ======================================================
        // FASE 11
        // LOGOUT
        // ======================================================

        if (
            url.includes(
                "/api/auth/logout"
            )
        ) {

            return 11;

        }


        // ======================================================
        // DESCONOCIDOS
        // ======================================================

        return 12;

    }


    // ==========================================================
    // OBTENER URL
    // ==========================================================

    getItemUrl(
        item
    ) {

        const url =
            item?.request?.url;


        if (
            typeof url ===
            "string"
        ) {

            return url;

        }


        if (
            url?.path &&
            Array.isArray(
                url.path
            )
        ) {

            return (
                "/" +
                url.path.join("/")
            );

        }


        return "";

    }


    // ==========================================================
    // VALIDAR TEST DATA
    // ==========================================================

    validateTestData(
        testData
    ) {

        const required = [

            "userId",

            "storeId",

            "publicationId",

            "interactionId",

            "token"

        ];


        for (
            const field of required
        ) {

            if (
                !testData[field]
            ) {

                throw new Error(
                    `Falta testData.${field}`
                );

            }

        }

    }


    // ==========================================================
    // PREPARAR ITEMS
    // ==========================================================

    prepareItems(
        items = [],
        testData
    ) {

        for (
            const item of items
        ) {

            if (
                item?.request
            ) {

                this.prepareRequest(
                    item,
                    testData
                );

            }


            if (
                Array.isArray(
                    item?.item
                )
            ) {

                this.prepareItems(
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
        item,
        testData
    ) {

        const request =
            item?.request;


        if (!request) {

            return;

        }


        console.log(
            `🔧 ${request.method ?? "UNKNOWN"} ` +
            `${item.name ?? "Unnamed"}`
        );


        // ======================================================
        // URL
        // ======================================================

        if (
            request.url
        ) {

            request.url =
                this.prepareUrl(
                    request.url,
                    testData
                );

        }


        // ======================================================
        // BODY
        // ======================================================

        if (
            request.body?.raw
        ) {

            request.body.raw =
                this.replaceBody(
                    request.body.raw,
                    testData
                );

        }


        // ======================================================
        // HEADERS
        // ======================================================

        request.header =
            Array.isArray(
                request.header
            )
                ? request.header
                : [];


        request.header =
            request.header.map(
                header => {

                    if (
                        typeof header?.value ===
                        "string"
                    ) {

                        header.value =
                            this.replaceVariables(
                                header.value,
                                testData
                            );

                    }

                    return header;

                }
            );


        // ======================================================
        // JWT
        // ======================================================

        this.setAuthorization(
            request,
            testData.token
        );

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

            return this.replaceVariables(
                this.replaceStaticUuid(
                    url,
                    testData
                ),
                testData
            );

        }


        if (
            !url ||
            typeof url !== "object"
        ) {

            return url;

        }


        // ======================================================
        // PATH
        // ======================================================

        if (
            Array.isArray(
                url.path
            )
        ) {

            const completePath =
                url.path.join(
                    "/"
                );


            url.path =
                url.path.map(
                    segment => {

                        return this.replacePathSegment(
                            segment,
                            completePath,
                            testData
                        );

                    }
                );

        }


        // ======================================================
        // QUERY
        // ======================================================

        if (
            Array.isArray(
                url.query
            )
        ) {

            url.query =
                url.query.map(
                    parameter => {

                        if (
                            typeof parameter?.value ===
                            "string"
                        ) {

                            parameter.value =
                                this.replaceVariables(
                                    parameter.value,
                                    testData
                                );

                        }

                        return parameter;

                    }
                );

        }


        return url;

    }


    // ==========================================================
    // REEMPLAZAR SEGMENTO
    // ==========================================================

    replacePathSegment(
        segment,
        completePath,
        testData
    ) {

        const value =
            String(
                segment ?? ""
            );


        if (
            value.includes(
                "{{userId}}"
            )
        ) {

            return testData.userId;

        }


        if (
            value.includes(
                "{{storeId}}"
            )
        ) {

            return testData.storeId;

        }


        if (
            value.includes(
                "{{publicationId}}"
            )
        ) {

            return testData.publicationId;

        }


        if (
            value.includes(
                "{{interactionId}}"
            )
        ) {

            return testData.interactionId;

        }


        if (
            this.isUuid(value)
        ) {

            return this.resolveUuidByPath(
                completePath,
                testData
            );

        }


        if (
            value === "<uuid>" ||
            value === ":id"
        ) {

            return this.resolveUuidByPath(
                completePath,
                testData
            );

        }


        return this.replaceVariables(
            value,
            testData
        );

    }


    // ==========================================================
    // UUID ESTÁTICO
    // ==========================================================

    replaceStaticUuid(
        url,
        testData
    ) {

        const uuidRegex =
            /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;


        if (
            !uuidRegex.test(
                url
            )
        ) {

            return url;

        }


        if (
            /\/api\/users\//i.test(
                url
            )
        ) {

            return url.replace(
                uuidRegex,
                testData.userId
            );

        }


        if (
            /\/api\/stores\//i.test(
                url
            )
        ) {

            return url.replace(
                uuidRegex,
                testData.storeId
            );

        }


        if (
            /\/api\/publications\//i.test(
                url
            )
        ) {

            return url.replace(
                uuidRegex,
                testData.publicationId
            );

        }


        if (
            /\/api\/interactions\//i.test(
                url
            )
        ) {

            return url.replace(
                uuidRegex,
                testData.interactionId
            );

        }


        return url;

    }


    // ==========================================================
    // RESOLVER UUID
    // ==========================================================

    resolveUuidByPath(
        completePath,
        testData
    ) {

        const pathValue =
            String(
                completePath ?? ""
            ).toLowerCase();


        if (
            pathValue.includes(
                "interactions"
            )
        ) {

            return testData.interactionId;

        }


        if (
            pathValue.includes(
                "publications"
            )
        ) {

            return testData.publicationId;

        }


        if (
            pathValue.includes(
                "stores"
            )
        ) {

            return testData.storeId;

        }


        if (
            pathValue.includes(
                "users"
            )
        ) {

            return testData.userId;

        }


        return "";

    }


    // ==========================================================
    // BODY
    // ==========================================================

    replaceBody(
        body,
        testData
    ) {

        let result =
            this.replaceVariables(
                body,
                testData
            );


        result =
            result.replace(
                /<string>/gi,
                "Testing UMSS Market"
            );


        result =
            result.replace(
                /<number>/gi,
                "100"
            );


        result =
            result.replace(
                /<integer>/gi,
                "10"
            );


        result =
            result.replace(
                /<boolean>/gi,
                "true"
            );


        result =
            result.replace(
                /<uuid>/gi,
                testData.userId ?? ""
            );


        return result;

    }


    // ==========================================================
    // VARIABLES
    // ==========================================================

    replaceVariables(
        value,
        testData
    ) {

        if (
            typeof value !==
            "string"
        ) {

            return value;

        }


        return value

            .replace(
                /{{baseUrl}}/gi,
                "http://localhost:8080"
            )

            .replace(
                /{{userId}}/gi,
                testData.userId ?? ""
            )

            .replace(
                /{{storeId}}/gi,
                testData.storeId ?? ""
            )

            .replace(
                /{{publicationId}}/gi,
                testData.publicationId ?? ""
            )

            .replace(
                /{{interactionId}}/gi,
                testData.interactionId ?? ""
            )

            .replace(
                /{{authToken}}/gi,
                testData.token ?? ""
            )

            .replace(
                /{{token}}/gi,
                testData.token ?? ""
            );

    }


    // ==========================================================
    // AUTHORIZATION
    // ==========================================================

    setAuthorization(
        request,
        token
    ) {

        if (!token) {

            return;

        }


        const headers =
            Array.isArray(
                request.header
            )
                ? request.header
                : [];


        const authorization =
            headers.find(
                header =>
                    String(
                        header?.key ?? ""
                    ).toLowerCase() ===
                    "authorization"
            );


        if (
            authorization
        ) {

            authorization.value =
                `Bearer ${token}`;

        }
        else {

            headers.push(
                {

                    key:
                        "Authorization",

                    value:
                        `Bearer ${token}`,

                    type:
                        "text"

                }
            );

        }


        request.header =
            headers;

    }


    // ==========================================================
    // VARIABLES DE COLLECTION
    // ==========================================================

    setVariable(
        collection,
        key,
        value
    ) {

        const existing =
            collection.variable.find(
                variable =>
                    variable.key ===
                    key
            );


        if (
            existing
        ) {

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
    // COLECTAR REQUESTS
    // ==========================================================

    collectRequests(
        items = [],
        result = []
    ) {

        for (
            const item of items
        ) {

            if (
                item?.request
            ) {

                result.push(
                    {

                        name:
                            item.name ??
                            "Unnamed",

                        method:
                            String(
                                item.request.method ??
                                "UNKNOWN"
                            ).toUpperCase()

                    }
                );

            }


            if (
                Array.isArray(
                    item?.item
                )
            ) {

                this.collectRequests(
                    item.item,
                    result
                );

            }

        }


        return result;

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

            if (
                item?.request
            ) {

                count++;

            }


            if (
                Array.isArray(
                    item?.item
                )
            ) {

                count +=
                    this.countRequests(
                        item.item
                    );

            }

        }


        return count;

    }


    // ==========================================================
    // UUID
    // ==========================================================

    isUuid(
        value
    ) {

        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            .test(
                String(
                    value
                )
            );

    }


    // ==========================================================
    // TITLE
    // ==========================================================

    title(
        text
    ) {

        console.log(
            "\n=================================================="
        );

        console.log(
            `🚀 ${text}`
        );

        console.log(
            "=================================================="
        );

    }

}


export default new NewmanService();