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
        // TEST DATA
        // ======================================================

        console.log(
            "\n📦 TEST DATA"
        );

        console.log(
            "--------------------------------------------------"
        );

        console.log(
            `USER_ID        : ${
                testData.userId ?? "N/A"
            }`
        );

        console.log(
            `STORE_ID       : ${
                testData.storeId ?? "N/A"
            }`
        );

        console.log(
            `PUBLICATION_ID : ${
                testData.publicationId ?? "N/A"
            }`
        );

        console.log(
            `INTERACTION_ID : ${
                testData.interactionId ?? "N/A"
            }`
        );

        console.log(
            `EMAIL          : ${
                testData.email ?? "N/A"
            }`
        );

        console.log(
            `ROLE           : ${
                testData.role ?? "N/A"
            }`
        );

        console.log(
            `DISCOVERY JWT  : ${
                testData.token
                    ? "OK"
                    : "NO"
            }`
        );


        // ======================================================
        // VALIDAR
        // ======================================================

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
            `✓ Requests originales: ${totalRequests}`
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


        // ======================================================
        // IDS DISCOVERY
        // ======================================================

        this.setVariable(
            collection,
            "userId",
            testData.userId ?? ""
        );

        this.setVariable(
            collection,
            "storeId",
            testData.storeId ?? ""
        );

        this.setVariable(
            collection,
            "publicationId",
            testData.publicationId ?? ""
        );

        this.setVariable(
            collection,
            "interactionId",
            testData.interactionId ?? ""
        );


        // ======================================================
        // IDS CREADOS
        // ======================================================

        this.setVariable(
            collection,
            "createdUserId",
            testData.userId ?? ""
        );

        this.setVariable(
            collection,
            "createdStoreId",
            testData.storeId ?? ""
        );

        this.setVariable(
            collection,
            "createdPublicationId",
            testData.publicationId ?? ""
        );

        this.setVariable(
            collection,
            "createdInteractionId",
            testData.interactionId ?? ""
        );


        // ======================================================
        // JWT
        // ======================================================

        this.setVariable(
            collection,
            "discoveryToken",
            testData.token ?? ""
        );

        this.setVariable(
            collection,
            "testToken",
            ""
        );

        this.setVariable(
            collection,
            "authToken",
            ""
        );

        this.setVariable(
            collection,
            "token",
            ""
        );


        // ======================================================
        // CREDENCIALES
        // ======================================================

        this.setVariable(
            collection,
            "testEmail",
            testData.email ?? ""
        );

        this.setVariable(
            collection,
            "testPassword",
            testData.password ??
            process.env.TEST_USER_PASSWORD ??
            "12345678"
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
        // SCRIPTS
        // ======================================================

        this.ensureAuthenticationScripts(
            collection.item
        );


        // ======================================================
        // ORGANIZAR
        // ======================================================

        console.log(
            "\n🧠 ORGANIZANDO WORKFLOW..."
        );


        collection.item =
            this.organizeCollection(
                collection.item
            );


        const preparedRequests =
            this.countRequests(
                collection.item
            );


        console.log(
            `✓ Requests después de preparación: ${
                preparedRequests
            }`
        );


        // ======================================================
        // ORDEN
        // ======================================================

        this.printFinalOrder(
            collection.item
        );


        // ======================================================
        // GUARDAR
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
        // NEWMAN
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
                            60000,

                        timeoutScript:
                            30000,

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


                                    let url =
                                        "";


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

                                        url =
                                            "";

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
                            `❌ HTTP failures : ${
                                httpFailures.length
                            }`
                        );

                        console.log(
                            `⚠️ Assertions    : ${
                                assertionFailures
                            }`
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

                                    `${
                                        item.failed
                                            ? "❌"
                                            : "✅"
                                    } ` +

                                    `${item.method} ` +

                                    `${item.name} ` +

                                    `→ ${
                                        item.statusCode ??
                                        "N/A"
                                    }`

                                );


                                console.log(
                                    `   URL: ${
                                        item.url ||
                                        "N/A"
                                    }`
                                );

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
    // VALIDAR TEST DATA
    // ==========================================================

    validateTestData(
        testData
    ) {

        const required = [

            "userId",
            "storeId",
            "publicationId",
            "token",
            "email"

        ];


        for (
            const field
            of required
        ) {

            if (
                !testData[field]
            ) {

                throw new Error(
                    `Falta testData.${field}`
                );

            }

        }


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
            "✓ TestData básica válida."
        );


        if (
            !testData.interactionId
        ) {

            console.log(
                "⚠️ interactionId no disponible."
            );

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
            const item
            of items
        ) {

            if (
                item?.request
            ) {

                const endpoint =
                    this.getEndpoint(
                        item.request
                    );


                const method =
                    String(
                        item.request.method ??
                        ""
                    ).toUpperCase();


                if (
                    this.isExcludedRequest(
                        method,
                        endpoint
                    )
                ) {

                    console.log(
                        `⏭️ Omitiendo ${method} ${endpoint}`
                    );

                }
                else {

                    this.prepareRequest(
                        item,
                        testData
                    );

                }

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


        const method =
            String(
                request.method ??
                ""
            ).toUpperCase();


        const endpoint =
            this.getEndpoint(
                request
            );


        console.log(
            `🔧 ${method} ${item.name ?? endpoint}`
        );


        // ======================================================
        // DELETE
        // ======================================================

        if (
            method ===
            "DELETE"
        ) {

            const prepared =
                this.prepareDeleteRequest(
                    request,
                    endpoint,
                    testData
                );


            if (!prepared) {

                console.log(
                    `   ⚠️ DELETE no preparado: ${endpoint}`
                );

            }


            this.prepareAuthentication(
                request,
                endpoint
            );


            return;

        }


        // ======================================================
        // URL
        // ======================================================

        if (
            request.url
        ) {

            request.url =
                this.prepareUrl(
                    request.url,
                    endpoint,
                    testData
                );

        }


        // ======================================================
        // BODY
        // ======================================================

        this.prepareRequestBody(
            item,
            endpoint,
            testData
        );


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
        // AUTH
        // ======================================================

        this.prepareAuthentication(
            request,
            endpoint
        );


        // ======================================================
        // MOSTRAR PUT / PATCH
        // ======================================================

        if (
            method === "PUT" ||
            method === "PATCH"
        ) {

            this.printModification(
                item,
                endpoint,
                testData
            );

        }

    }


    // ==========================================================
    // MOSTRAR MODIFICACIÓN
    // ==========================================================

    printModification(
        item,
        endpoint,
        testData
    ) {

        const request =
            item?.request;


        if (!request) {

            return;

        }


        const method =
            String(
                request.method ??
                ""
            ).toUpperCase();


        if (
            method !== "PUT" &&
            method !== "PATCH"
        ) {

            return;

        }


        const resource =
            this.resolveResource(
                endpoint
            );


        const id =
            this.resolveResourceId(
                resource,
                testData
            );


        console.log("");

        console.log(
            `🔄 ${method} ${item.name ?? endpoint}`
        );

        console.log(
            `   RECURSO : ${resource}`
        );

        console.log(
            `   ID      : ${id}`
        );


        let body =
            request.body?.raw ??
            "";


        body =
            this.replaceVariables(
                body,
                testData
            );


        try {

            const parsed =
                JSON.parse(
                    body
                );


            console.log(
                "   CAMPO(S) QUE SE INTENTA CAMBIAR:"
            );


            Object.entries(
                parsed
            ).forEach(
                (
                    [
                        field,
                        value
                    ]
                ) => {

                    console.log(
                        `      ${field} = ${value}`
                    );

                }
            );


            console.log(
                "   BODY:"
            );

            console.log(
                JSON.stringify(
                    parsed,
                    null,
                    2
                )
            );

        }
        catch {

            console.log(
                "   BODY:"
            );

            console.log(
                body ||
                "SIN BODY"
            );

        }


        console.log("");

    }


    // ==========================================================
    // RESOLVER RECURSO
    // ==========================================================

    resolveResource(
        endpoint
    ) {

        const normalized =
            String(
                endpoint ??
                ""
            ).toLowerCase();


        if (
            normalized.includes(
                "/api/users"
            )
        ) {

            return "USER";

        }


        if (
            normalized.includes(
                "/api/stores"
            )
        ) {

            return "STORE";

        }


        if (
            normalized.includes(
                "/api/publications"
            )
        ) {

            return "PUBLICATION";

        }


        if (
            normalized.includes(
                "/api/interactions"
            )
        ) {

            return "INTERACTION";

        }


        return "RESOURCE";

    }


    // ==========================================================
    // RESOLVER ID
    // ==========================================================

    resolveResourceId(
        resource,
        testData
    ) {

        switch (
            resource
        ) {

            case "USER":
                return testData.userId ?? "N/A";

            case "STORE":
                return testData.storeId ?? "N/A";

            case "PUBLICATION":
                return testData.publicationId ?? "N/A";

            case "INTERACTION":
                return testData.interactionId ?? "N/A";

            default:
                return "N/A";

        }

    }


    // ==========================================================
    // PREPARAR DELETE
    // ==========================================================

    prepareDeleteRequest(
        request,
        endpoint,
        testData = {}
    ) {

        const path =
            String(
                endpoint ?? ""
            ).toLowerCase();


        let resourceName =
            null;

        let createdVariable =
            null;

        let discoveryId =
            null;


        if (
            path.includes(
                "/api/interactions"
            )
        ) {

            resourceName =
                "Interaction";

            createdVariable =
                "createdInteractionId";

            discoveryId =
                testData.interactionId;

        }

        else if (
            path.includes(
                "/api/publications"
            )
        ) {

            resourceName =
                "Publication";

            createdVariable =
                "createdPublicationId";

            discoveryId =
                testData.publicationId;

        }

        else if (
            path.includes(
                "/api/stores"
            )
        ) {

            resourceName =
                "Store";

            createdVariable =
                "createdStoreId";

            discoveryId =
                testData.storeId;

        }

        else if (
            path.includes(
                "/api/users"
            )
        ) {

            resourceName =
                "User";

            createdVariable =
                "createdUserId";

            discoveryId =
                testData.userId;

        }

        else {

            return false;

        }


        const id =
            discoveryId ??
            "";


        if (!id) {

            console.log(
                `   ❌ DELETE ${resourceName}: no existe ID`
            );

            return false;

        }


        this.forceDeleteId(
            request,
            id
        );


        console.log(
            `   🗑️ DELETE ${resourceName}`
        );

        console.log(
            `      ID: ${id}`
        );

        console.log(
            `      Variable: {{${createdVariable}}}`
        );


        return true;

    }


    // ==========================================================
    // FORZAR ID DELETE
    // ==========================================================

    forceDeleteId(
        request,
        id
    ) {

        if (
            !request?.url
        ) {

            return false;

        }


        if (
            typeof request.url ===
            "string"
        ) {

            let url =
                request.url;


            const uuidRegex =
                /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;


            if (
                uuidRegex.test(
                    url
                )
            ) {

                request.url =
                    url.replace(
                        uuidRegex,
                        id
                    );

                return true;

            }


            if (
                /\/:id\/?$/i.test(
                    url
                )
            ) {

                request.url =
                    url.replace(
                        /\/:id\/?$/i,
                        `/${id}`
                    );

                return true;

            }


            if (
                /\/<uuid>\/?$/i.test(
                    url
                )
            ) {

                request.url =
                    url.replace(
                        /\/<uuid>\/?$/i,
                        `/${id}`
                    );

                return true;

            }


            if (
                url.endsWith("/")
            ) {

                request.url =
                    `${url}${id}`;

                return true;

            }


            request.url =
                `${url}/${id}`;

            return true;

        }


        if (
            Array.isArray(
                request.url?.path
            )
        ) {

            const path =
                request.url.path;


            const uuidIndex =
                path.findIndex(
                    segment =>
                        this.isUuid(
                            segment
                        )
                );


            if (
                uuidIndex !== -1
            ) {

                path[uuidIndex] =
                    id;

                return true;

            }


            const idIndex =
                path.findIndex(
                    segment =>
                        segment === ":id" ||
                        segment === "<uuid>"
                );


            if (
                idIndex !== -1
            ) {

                path[idIndex] =
                    id;

                return true;

            }


            path.push(
                id
            );

            return true;

        }


        return false;

    }


    // ==========================================================
    // BODY
    // ==========================================================

    prepareRequestBody(
        item,
        endpoint,
        testData
    ) {

        const request =
            item?.request;


        if (!request) {

            return;

        }


        const method =
            String(
                request.method ??
                ""
            ).toUpperCase();


        // ======================================================
        // REGISTER CUSTOMER
        // ======================================================

        if (
            endpoint ===
            "/api/auth/register/customer"
        ) {

            request.body = {

                mode: "raw",

                raw:
                    JSON.stringify(
                        this.createCustomerBody(),
                        null,
                        2
                    ),

                options: {

                    raw: {

                        language:
                            "json"

                    }

                }

            };

            console.log(
                "   ✓ Body REGISTER CUSTOMER"
            );

            return;

        }


        // ======================================================
        // REGISTER ENTREPRENEUR
        // ======================================================

        if (
            endpoint ===
            "/api/auth/register/entrepreneur"
        ) {

            request.body = {

                mode: "raw",

                raw:
                    JSON.stringify(
                        this.createEntrepreneurBody(),
                        null,
                        2
                    ),

                options: {

                    raw: {

                        language:
                            "json"

                    }

                }

            };

            console.log(
                "   ✓ Body REGISTER ENTREPRENEUR"
            );

            return;

        }


        // ======================================================
        // REGISTER ADMIN
        // ======================================================

        if (
            endpoint ===
            "/api/auth/register/admin"
        ) {

            request.body = {

                mode: "raw",

                raw:
                    JSON.stringify(
                        this.createAdminBody(),
                        null,
                        2
                    ),

                options: {

                    raw: {

                        language:
                            "json"

                    }

                }

            };

            console.log(
                "   ✓ Body REGISTER ADMIN"
            );

            return;

        }


        // ======================================================
        // LOGIN
        // ======================================================

        if (
            endpoint ===
            "/api/auth/login"
        ) {

            request.body = {

                mode: "raw",

                raw:
                    JSON.stringify(
                        {

                            email:
                                testData.email,

                            password:
                                testData.password ??
                                process.env.TEST_USER_PASSWORD ??
                                "12345678"

                        },
                        null,
                        2
                    ),

                options: {

                    raw: {

                        language:
                            "json"

                    }

                }

            };

            console.log(
                "   ✓ Body LOGIN"
            );

            return;

        }


        // ======================================================
        // PUT / PATCH
        // ======================================================

        if (
            method === "PUT" ||
            method === "PATCH"
        ) {

            const modification =
                this.createModificationBody(
                    endpoint,
                    method
                );


            if (
                modification
            ) {

                request.body = {

                    mode: "raw",

                    raw:
                        JSON.stringify(
                            modification.body,
                            null,
                            2
                        ),

                    options: {

                        raw: {

                            language:
                                "json"

                        }

                    }

                };


                console.log(
                    `   ✓ Body ${method} preparado`
                );


                console.log(
                    `     Campo: ${modification.field}`
                );

                console.log(
                    `     Valor: ${modification.value}`
                );


                return;

            }

        }


        // ======================================================
        // BODY GENÉRICO
        // ======================================================

        if (
            request.body?.raw
        ) {

            request.body.raw =
                this.replaceBody(
                    request.body.raw,
                    endpoint,
                    testData
                );

        }

    }


    // ==========================================================
    // CREAR BODY PUT/PATCH
    // ==========================================================

    createModificationBody(
        endpoint,
        method
    ) {

        const normalized =
            String(
                endpoint ??
                ""
            ).toLowerCase();


        // ======================================================
        // USER
        // ======================================================

        if (
            normalized.includes(
                "/api/users"
            )
        ) {

            if (
                method === "PATCH"
            ) {

                return {

                    field:
                        "status",

                    value:
                        "INACTIVE",

                    body: {

                        status:
                            "INACTIVE"

                    }

                };

            }


            return {

                field:
                    "nombre",

                value:
                    "Usuario Actualizado",

                body: {

                    nombre:
                        "Usuario Actualizado"

                }

            };

        }


        // ======================================================
        // STORE
        // ======================================================

        if (
            normalized.includes(
                "/api/stores"
            )
        ) {

            if (
                method === "PATCH"
            ) {

                return {

                    field:
                        "status",

                    value:
                        "INACTIVE",

                    body: {

                        status:
                            "INACTIVE"

                    }

                };

            }


            return {

                field:
                    "nombre",

                value:
                    "Tienda Actualizada",

                body: {

                    nombre:
                        "Tienda Actualizada"

                }

            };

        }


        // ======================================================
        // PUBLICATION
        // ======================================================

        if (
            normalized.includes(
                "/api/publications"
            )
        ) {

            if (
                method === "PATCH"
            ) {

                return {

                    field:
                        "status",

                    value:
                        "INACTIVE",

                    body: {

                        status:
                            "INACTIVE"

                    }

                };

            }


            return {

                field:
                    "nombre",

                value:
                    "Publicacion Actualizada",

                body: {

                    nombre:
                        "Publicacion Actualizada"

                }

            };

        }


        // ======================================================
        // INTERACTION
        // ======================================================

        if (
            normalized.includes(
                "/api/interactions"
            )
        ) {

            if (
                method === "PATCH"
            ) {

                return {

                    field:
                        "metadata",

                    value:
                        "Interaccion actualizada",

                    body: {

                        metadata:
                            "Interaccion actualizada"

                    }

                };

            }


            return {

                field:
                    "metadata",

                value:
                    "Interaccion modificada",

                body: {

                    metadata:
                        "Interaccion modificada"

                }

            };

        }


        return null;

    }


    // ==========================================================
    // CUSTOMER
    // ==========================================================

    createCustomerBody() {

        const unique =
            this.uniqueSuffix();


        return {

            ru:
                `2026${unique}`,

            nombre:
                "Cliente",

            apellidoPaterno:
                "Testing",

            apellidoMaterno:
                "UMSS",

            email:
                `customer.testing.${unique}@umss.edu.bo`,

            celular:
                this.randomPhone(),

            facultad:
                "Ciencias y Tecnologia",

            password:
                "12345678"

        };

    }


    // ==========================================================
    // ENTREPRENEUR
    // ==========================================================

    createEntrepreneurBody() {

        const unique =
            this.uniqueSuffix();


        return {

            ru:
                `2026${unique}`,

            nombre:
                "Emprendedor",

            apellidoPaterno:
                "Testing",

            apellidoMaterno:
                "UMSS",

            email:
                `entrepreneur.testing.${unique}@umss.edu.bo`,

            celular:
                this.randomPhone(),

            facultad:
                "Ciencias y Tecnologia",

            password:
                "12345678",

            nombreTienda:
                `Tienda Testing ${unique}`

        };

    }


    // ==========================================================
    // ADMIN
    // ==========================================================

    createAdminBody() {

        const unique =
            this.uniqueSuffix();


        return {

            ru:
                `2026${unique}`,

            nombre:
                "Administrador",

            apellidoPaterno:
                "Testing",

            apellidoMaterno:
                "UMSS",

            email:
                `admin.testing.${unique}@umss.edu.bo`,

            celular:
                this.randomPhone(),

            facultad:
                "Ciencias y Tecnologia",

            password:
                "12345678"

        };

    }


    // ==========================================================
    // UNIQUE
    // ==========================================================

    uniqueSuffix() {

        const timestamp =
            Date.now()
                .toString()
                .slice(-6);


        const random =
            Math.floor(
                100 +
                Math.random() *
                900
            );


        return (
            `${timestamp}${random}`
        );

    }


    // ==========================================================
    // PHONE
    // ==========================================================

    randomPhone() {

        return String(

            70000000 +
            Math.floor(
                Math.random() *
                999999
            )

        ).slice(
            0,
            8
        );

    }


    // ==========================================================
    // AUTH
    // ==========================================================

    prepareAuthentication(
        request,
        endpoint
    ) {

        if (
            endpoint.startsWith(
                "/api/auth/register/"
            )
        ) {

            this.removeAuthorization(
                request
            );

            return;

        }


        if (
            endpoint ===
            "/api/auth/login"
        ) {

            this.removeAuthorization(
                request
            );

            return;

        }


        this.setAuthorizationVariable(
            request,
            "{{testToken}}"
        );

    }


    // ==========================================================
    // AUTH HEADER
    // ==========================================================

    setAuthorizationVariable(
        request,
        variable
    ) {

        request.header =
            Array.isArray(
                request.header
            )
                ? request.header
                : [];


        const existing =
            request.header.find(
                header =>
                    String(
                        header?.key ??
                        ""
                    ).toLowerCase() ===
                    "authorization"
            );


        const value =
            `Bearer ${variable}`;


        if (
            existing
        ) {

            existing.value =
                value;

        }
        else {

            request.header.push({

                key:
                    "Authorization",

                value,

                type:
                    "text"

            });

        }

    }


    // ==========================================================
    // REMOVE AUTH
    // ==========================================================

    removeAuthorization(
        request
    ) {

        request.header =
            Array.isArray(
                request.header
            )
                ? request.header
                : [];


        request.header =
            request.header.filter(

                header =>

                    String(
                        header?.key ??
                        ""
                    ).toLowerCase() !==
                    "authorization"

            );

    }


    // ==========================================================
    // URL
    // ==========================================================

    prepareUrl(
        url,
        endpoint,
        testData
    ) {

        if (
            typeof url ===
            "string"
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
            typeof url !==
            "object"
        ) {

            return url;

        }


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

                    segment =>

                        this.replacePathSegment(

                            segment,

                            completePath,

                            testData

                        )

                );

        }


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
                                this.replaceQueryValue(

                                    parameter.key,

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
    // PATH
    // ==========================================================

    replacePathSegment(
        segment,
        completePath,
        testData
    ) {

        const value =
            String(
                segment ??
                ""
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

            return (
                testData.interactionId ??
                ""
            );

        }


        if (
            value.includes(
                "{{createdUserId}}"
            )
        ) {

            return (
                testData.userId ??
                ""
            );

        }


        if (
            value.includes(
                "{{createdStoreId}}"
            )
        ) {

            return (
                testData.storeId ??
                ""
            );

        }


        if (
            value.includes(
                "{{createdPublicationId}}"
            )
        ) {

            return (
                testData.publicationId ??
                ""
            );

        }


        if (
            value.includes(
                "{{createdInteractionId}}"
            )
        ) {

            return (
                testData.interactionId ??
                ""
            );

        }


        if (
            value ===
            "<uuid>"
        ) {

            return this.resolveUuidByPath(
                completePath,
                testData
            );

        }


        if (
            value ===
            ":id"
        ) {

            return this.resolveUuidByPath(
                completePath,
                testData
            );

        }


        if (
            this.isUuid(
                value
            )
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
    // UUID RESOLVER
    // ==========================================================

    resolveUuidByPath(
        completePath,
        testData
    ) {

        const pathValue =
            String(
                completePath ??
                ""
            ).toLowerCase();


        if (
            pathValue.includes(
                "interactions"
            )
        ) {

            return (
                testData.interactionId ??
                ""
            );

        }


        if (
            pathValue.includes(
                "publications"
            )
        ) {

            return (
                testData.publicationId ??
                ""
            );

        }


        if (
            pathValue.includes(
                "stores"
            )
        ) {

            return (
                testData.storeId ??
                ""
            );

        }


        if (
            pathValue.includes(
                "users"
            )
        ) {

            return (
                testData.userId ??
                ""
            );

        }


        return "";

    }


    // ==========================================================
    // EXCLUSIONES
    // ==========================================================

    isExcludedRequest(
        method,
        endpoint
    ) {

        const normalizedMethod =
            String(
                method ?? ""
            ).toUpperCase();


        const normalizedEndpoint =
            this.normalizeEndpoint(
                endpoint
            );


        if (
            normalizedMethod ===
                "POST" &&
            normalizedEndpoint ===
                "/api/stores"
        ) {

            return true;

        }


        return false;

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
                testData.interactionId ??
                ""
            );

        }


        return url;

    }


    // ==========================================================
    // QUERY
    // ==========================================================

    replaceQueryValue(
        key,
        value,
        testData
    ) {

        const parameter =
            String(
                key ??
                ""
            ).toLowerCase();


        const current =
            String(
                value ??
                ""
            );


        if (
            parameter ===
            "storeid"
        ) {

            return testData.storeId;

        }


        if (
            parameter ===
            "texto"
        ) {

            return "producto";

        }


        if (
            parameter ===
            "tipo"
        ) {

            return "PRODUCTO";

        }


        if (
            parameter ===
            "preciomin"
        ) {

            return "0";

        }


        if (
            parameter ===
            "preciomax"
        ) {

            return "10000";

        }


        if (
            parameter ===
            "query"
        ) {

            return "producto UMSS";

        }


        if (
            parameter ===
            "topk"
        ) {

            return "5";

        }


        return this.replaceVariables(
            current,
            testData
        );

    }


    // ==========================================================
    // BODY GENÉRICO
    // ==========================================================

    replaceBody(
        body,
        endpoint,
        testData
    ) {

        let result =
            this.replaceVariables(
                body,
                testData
            );


        result =
            result.replace(
                /<uuid>/gi,
                testData.publicationId ??
                testData.storeId ??
                testData.userId ??
                ""
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
                /{{createdUserId}}/gi,
                testData.userId ?? ""
            )

            .replace(
                /{{createdStoreId}}/gi,
                testData.storeId ?? ""
            )

            .replace(
                /{{createdPublicationId}}/gi,
                testData.publicationId ?? ""
            )

            .replace(
                /{{createdInteractionId}}/gi,
                testData.interactionId ?? ""
            )

            .replace(
                /{{discoveryToken}}/gi,
                testData.token ?? ""
            )

            .replace(
                /{{testEmail}}/gi,
                testData.email ?? ""
            )

            .replace(
                /{{testPassword}}/gi,
                testData.password ??
                process.env.TEST_USER_PASSWORD ??
                "12345678"
            );

    }


    // ==========================================================
    // AUTH SCRIPTS
    // ==========================================================

    ensureAuthenticationScripts(
        items = []
    ) {

        for (
            const item
            of items
        ) {

            if (
                item?.request
            ) {

                const endpoint =
                    this.getEndpoint(
                        item.request
                    );


                const method =
                    String(
                        item.request.method ??
                        ""
                    ).toUpperCase();


                if (
                    method ===
                        "POST" &&
                    endpoint ===
                        "/api/auth/login"
                ) {

                    this.addLoginCapture(
                        item
                    );

                }


                if (
                    method ===
                        "GET" &&
                    endpoint ===
                        "/api/auth/me"
                ) {

                    this.addMeValidation(
                        item
                    );

                }


                if (
                    endpoint ===
                    "/api/auth/logout"
                ) {

                    this.addLogoutValidation(
                        item
                    );

                }


                if (
                    method ===
                        "POST" &&
                    endpoint.startsWith(
                        "/api/auth/register/"
                    )
                ) {

                    this.addCreatedUserCapture(
                        item
                    );

                }


                if (
                    method ===
                        "POST" &&
                    endpoint ===
                        "/api/auth/register/entrepreneur"
                ) {

                    this.addCreatedStoreCapture(
                        item
                    );

                }


                if (
                    method ===
                        "POST" &&
                    endpoint ===
                        "/api/publications"
                ) {

                    this.addCreatedPublicationCapture(
                        item
                    );

                }


                if (
                    method ===
                        "POST" &&
                    endpoint ===
                        "/api/interactions"
                ) {

                    this.addInteractionCapture(
                        item
                    );

                }

            }


            if (
                Array.isArray(
                    item?.item
                )
            ) {

                this.ensureAuthenticationScripts(
                    item.item
                );

            }

        }

    }


    // ==========================================================
    // LOGIN CAPTURE
    // ==========================================================

    addLoginCapture(
        item
    ) {

        const script = [

            "pm.test('POST /login - Login exitoso', function () {",

            "    pm.expect(pm.response.code).to.be.within(200, 299);",

            "});",

            "",

            "if (pm.response.code >= 200 && pm.response.code < 300) {",

            "    const data = pm.response.json();",

            "",

            "    const jwt =",

            "        data?.token ||",

            "        data?.accessToken ||",

            "        data?.jwt ||",

            "        data?.data?.token ||",

            "        data?.data?.accessToken ||",

            "        null;",

            "",

            "    if (!jwt) {",

            "        throw new Error('LOGIN OK pero no se encontró JWT.');",

            "    }",

            "",

            "    pm.collectionVariables.set('testToken', jwt);",

            "    pm.collectionVariables.set('authToken', jwt);",

            "    pm.collectionVariables.set('token', jwt);",

            "",

            "    console.log('✓ JWT DEL LOGIN CAPTURADO');",

            "}"

        ];


        this.setTestScript(
            item,
            script
        );

    }


    // ==========================================================
    // USER ID
    // ==========================================================

    addCreatedUserCapture(
        item
    ) {

        const script = [

            "if (pm.response.code >= 200 && pm.response.code < 300) {",

            "    let data = {};",

            "",

            "    try {",

            "        data = pm.response.json();",

            "    } catch (e) {",

            "        console.log('⚠️ REGISTER USER no devolvió JSON');",

            "    }",

            "",

            "    const id =",

            "        data?.id ||",

            "        data?.data?.id ||",

            "        data?.user?.id ||",

            "        data?.data?.user?.id ||",

            "        data?.result?.id ||",

            "        null;",

            "",

            "    if (id) {",

            "        pm.collectionVariables.set('createdUserId', id);",

            "        console.log('🆔 createdUserId:', id);",

            "    }",

            "}"

        ];


        this.appendTestScript(
            item,
            script
        );

    }


    // ==========================================================
    // STORE ID
    // ==========================================================

    addCreatedStoreCapture(
        item
    ) {

        const script = [

            "if (pm.response.code >= 200 && pm.response.code < 300) {",

            "    let data = {};",

            "",

            "    try {",

            "        data = pm.response.json();",

            "    } catch (e) {",

            "        console.log('⚠️ REGISTER ENTREPRENEUR no devolvió JSON');",

            "    }",

            "",

            "    const storeId =",

            "        data?.store?.id ||",

            "        data?.data?.store?.id ||",

            "        data?.entrepreneur?.store?.id ||",

            "        data?.data?.entrepreneur?.store?.id ||",

            "        data?.storeId ||",

            "        data?.data?.storeId ||",

            "        null;",

            "",

            "    if (storeId) {",

            "        pm.collectionVariables.set('createdStoreId', storeId);",

            "        console.log('🆔 createdStoreId:', storeId);",

            "    }",

            "}"

        ];


        this.appendTestScript(
            item,
            script
        );

    }


    // ==========================================================
    // PUBLICATION ID
    // ==========================================================

    addCreatedPublicationCapture(
        item
    ) {

        const script = [

            "if (pm.response.code >= 200 && pm.response.code < 300) {",

            "    let data = {};",

            "",

            "    try {",

            "        data = pm.response.json();",

            "    } catch (e) {",

            "        console.log('⚠️ POST publication no devolvió JSON');",

            "    }",

            "",

            "    const id =",

            "        data?.id ||",

            "        data?.data?.id ||",

            "        data?.publication?.id ||",

            "        data?.data?.publication?.id ||",

            "        data?.result?.id ||",

            "        null;",

            "",

            "    if (id) {",

            "        pm.collectionVariables.set('createdPublicationId', id);",

            "        console.log('🆔 createdPublicationId:', id);",

            "    }",

            "}"

        ];


        this.appendTestScript(
            item,
            script
        );

    }


    // ==========================================================
    // INTERACTION ID
    // ==========================================================

    addInteractionCapture(
        item
    ) {

        const script = [

            "if (pm.response.code >= 200 && pm.response.code < 300) {",

            "    let data = {};",

            "",

            "    try {",

            "        data = pm.response.json();",

            "    } catch (e) {",

            "        console.log('⚠️ POST interaction no devolvió JSON');",

            "    }",

            "",

            "    const interactionId =",

            "        data?.id ||",

            "        data?.data?.id ||",

            "        data?.interaction?.id ||",

            "        data?.data?.interaction?.id ||",

            "        data?.result?.id ||",

            "        null;",

            "",

            "    if (interactionId) {",

            "        pm.collectionVariables.set('createdInteractionId', interactionId);",

            "        console.log('🆔 createdInteractionId:', interactionId);",

            "    }",

            "}"

        ];


        this.appendTestScript(
            item,
            script
        );

    }


    // ==========================================================
    // ME
    // ==========================================================

    addMeValidation(
        item
    ) {

        const script = [

            "pm.test('GET /me - Usuario autenticado', function () {",

            "    pm.expect(pm.response.code).to.be.within(200, 299);",

            "});"

        ];


        this.setTestScript(
            item,
            script
        );

    }


    // ==========================================================
    // LOGOUT
    // ==========================================================

    addLogoutValidation(
        item
    ) {

        const script = [

            "pm.test('POST /logout - Logout exitoso', function () {",

            "    pm.expect(pm.response.code).to.be.within(200, 299);",

            "});"

        ];


        this.setTestScript(
            item,
            script
        );

    }


    // ==========================================================
    // TEST SCRIPT
    // ==========================================================

    setTestScript(
        item,
        script
    ) {

        item.event =
            Array.isArray(
                item.event
            )
                ? item.event
                : [];


        const existing =
            item.event.find(
                event =>
                    event.listen ===
                    "test"
            );


        if (
            existing
        ) {

            existing.script = {

                type:
                    "text/javascript",

                exec:
                    script

            };

        }
        else {

            item.event.push({

                listen:
                    "test",

                script: {

                    type:
                        "text/javascript",

                    exec:
                        script

                }

            });

        }

    }


    // ==========================================================
    // APPEND TEST SCRIPT
    // ==========================================================

    appendTestScript(
        item,
        script
    ) {

        item.event =
            Array.isArray(
                item.event
            )
                ? item.event
                : [];


        const existing =
            item.event.find(
                event =>
                    event.listen ===
                    "test"
            );


        if (
            existing
        ) {

            existing.script = {

                type:
                    "text/javascript",

                exec:
                    [

                        ...(existing.script?.exec ?? []),

                        "",

                        ...script

                    ]

            };

        }
        else {

            item.event.push({

                listen:
                    "test",

                script: {

                    type:
                        "text/javascript",

                    exec:
                        script

                }

            });

        }

    }


    // ==========================================================
    // ORGANIZAR
    // ==========================================================

    organizeCollection(
        items = []
    ) {

        const requests = [];


        this.flattenRequests(
            items,
            requests
        );


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


        return ordered.map(
            request =>
                request.item
        );

    }


    // ==========================================================
    // PRIORIDADES
    // ==========================================================

    getRequestPriority(
        request
    ) {

        const method =
            String(
                request.method ??
                ""
            ).toUpperCase();


        const url =
            String(
                request.url ??
                ""
            ).toLowerCase();


        if (
            url.includes(
                "/api/auth/register/customer"
            )
        ) {

            return 1;

        }


        if (
            url.includes(
                "/api/auth/register/entrepreneur"
            )
        ) {

            return 2;

        }


        if (
            url.includes(
                "/api/auth/register/admin"
            )
        ) {

            return 3;

        }


        if (
            url.includes(
                "/api/auth/login"
            )
        ) {

            return 10;

        }


        if (
            url.includes(
                "/api/auth/me"
            )
        ) {

            return 11;

        }


        if (
            url.includes(
                "/api/users"
            ) &&
            method !== "DELETE"
        ) {

            return 20;

        }


        if (
            url.includes(
                "/api/stores"
            ) &&
            method !== "DELETE"
        ) {

            return 30;

        }


        if (
            url.includes(
                "/api/publications"
            ) &&
            method !== "DELETE"
        ) {

            return 40;

        }


        if (
            url.includes(
                "/api/interactions"
            ) &&
            method !== "DELETE"
        ) {

            return 50;

        }


        if (
            url.includes(
                "/api/ai/"
            )
        ) {

            return 60;

        }


        if (
            url.includes(
                "/api/admin/embeddings/"
            )
        ) {

            return 70;

        }


        // ======================================================
        // DELETE
        // ======================================================

        if (
            method === "DELETE" &&
            url.includes(
                "/api/interactions"
            )
        ) {

            return 90;

        }


        if (
            method === "DELETE" &&
            url.includes(
                "/api/publications"
            )
        ) {

            return 91;

        }


        if (
            method === "DELETE" &&
            url.includes(
                "/api/stores"
            )
        ) {

            return 92;

        }


        if (
            method === "DELETE" &&
            url.includes(
                "/api/users"
            )
        ) {

            return 93;

        }


        // ======================================================
        // LOGOUT SIEMPRE AL FINAL
        // ======================================================

        if (
            url.includes(
                "/api/auth/logout"
            )
        ) {

            return 100;

        }


        return 80;

    }


    // ==========================================================
    // FLATTEN
    // ==========================================================

    flattenRequests(
        items = [],
        result = [],
        parentFolder = ""
    ) {

        for (
            const item
            of items
        ) {

            if (
                item?.request
            ) {

                const endpoint =
                    this.getEndpoint(
                        item.request
                    );


                const method =
                    String(
                        item.request.method ??
                        ""
                    ).toUpperCase();


                if (
                    this.isExcludedRequest(
                        method,
                        endpoint
                    )
                ) {

                    console.log(
                        `⏭️ Request excluida: ${method} ${endpoint}`
                    );

                }
                else {

                    result.push({

                        item,

                        name:
                            item.name ??
                            "Unnamed",

                        method,

                        url:
                            this.getItemUrl(
                                item
                            ),

                        folder:
                            parentFolder,

                        originalIndex:
                            result.length

                    });

                }

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
    // MOSTRAR ORDEN
    // ==========================================================

    printFinalOrder(
        items = []
    ) {

        const requests = [];


        this.flattenRequests(
            items,
            requests
        );


        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "📋 ORDEN FINAL DE EJECUCIÓN"
        );

        console.log(
            "=================================================="
        );


        requests.forEach(
            (
                request,
                index
            ) => {

                const priority =
                    this.getRequestPriority(
                        request
                    );


                console.log(

                    `${String(
                        index + 1
                    ).padStart(
                        2,
                        "0"
                    )}. ` +

                    `${request.method} ` +

                    `${request.name} ` +

                    `(P${priority})`

                );

            }
        );


        console.log(
            "=================================================="
        );

    }


    // ==========================================================
    // COLLECT
    // ==========================================================

    collectRequests(
        items = [],
        result = []
    ) {

        for (
            const item
            of items
        ) {

            if (
                item?.request
            ) {

                result.push({

                    name:
                        item.name ??
                        "Unnamed",

                    method:
                        String(
                            item.request.method ??
                            "UNKNOWN"
                        ).toUpperCase()

                });

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
    // COUNT
    // ==========================================================

    countRequests(
        items = []
    ) {

        let count =
            0;


        for (
            const item
            of items
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
    // SET VARIABLE
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

            collection.variable.push({

                key,

                value

            });

        }

    }


    // ==========================================================
    // GET URL
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
            Array.isArray(
                url?.path
            )
        ) {

            return (
                "/" +
                url.path.join("/")
            );

        }


        if (
            url?.raw
        ) {

            return url.raw;

        }


        return "";

    }


    // ==========================================================
    // GET ENDPOINT
    // ==========================================================

    getEndpoint(
        request
    ) {

        const url =
            request?.url;


        if (
            typeof url ===
            "string"
        ) {

            return this.normalizeEndpoint(
                url
            );

        }


        if (
            Array.isArray(
                url?.path
            )
        ) {

            return this.normalizeEndpoint(

                "/" +
                url.path.join("/")

            );

        }


        if (
            url?.raw
        ) {

            return this.normalizeEndpoint(
                url.raw
            );

        }


        return "";

    }


    // ==========================================================
    // NORMALIZE
    // ==========================================================

    normalizeEndpoint(
        value
    ) {

        let endpoint =
            String(
                value ??
                ""
            );


        endpoint =
            endpoint.replace(
                /^https?:\/\/[^/]+/i,
                ""
            );


        endpoint =
            endpoint.replace(
                /\{\{baseUrl\}\}/gi,
                ""
            );


        if (
            !endpoint.startsWith("/")
        ) {

            endpoint =
                "/" +
                endpoint;

        }


        return endpoint.replace(
            /\/+/g,
            "/"
        );

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
                    value ??
                    ""
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