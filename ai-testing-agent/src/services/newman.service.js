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
        // VALIDAR TEST DATA
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
            testData.interactionId ?? ""
        );


        // ======================================================
        // JWT DISCOVERY
        // ======================================================

        this.setVariable(
            collection,
            "discoveryToken",
            testData.token
        );


        // ======================================================
        // JWT LOGIN
        // ======================================================

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
        // SCRIPTS LOGIN / ME / LOGOUT
        // ======================================================

        this.ensureAuthenticationScripts(
            collection.item
        );


        // ======================================================
        // ORGANIZAR COLLECTION
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
            `✓ Requests después de exclusiones: ${
                preparedRequests
            }`
        );


        // ======================================================
        // GUARDAR COLLECTION PREPARADA
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


                // ==================================================
                // EXCLUIR POST /api/stores
                // ==================================================

                if (
                    this.isExcludedRequest(
                        method,
                        endpoint
                    )
                ) {

                    console.log(
                        `⏭️ Omitiendo ${method} ${endpoint} — prueba excluida`
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

    }


    // ==========================================================
    // PREPARAR BODY
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


        // ======================================================
        // REGISTER CUSTOMER
        // ======================================================

        if (
            endpoint ===
            "/api/auth/register/customer"
        ) {

            request.body = {

                mode:
                    "raw",

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
                "   ✓ Body generado para REGISTER CUSTOMER"
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

                mode:
                    "raw",

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
                "   ✓ Body generado para REGISTER ENTREPRENEUR"
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

                mode:
                    "raw",

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
                "   ✓ Body generado para REGISTER ADMIN"
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

                mode:
                    "raw",

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
                "   ✓ Body generado para LOGIN"
            );

            console.log(
                `     Email: ${testData.email}`
            );


            return;

        }


        // ======================================================
        // OTROS REQUESTS
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
    // CUSTOMER BODY
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
    // ENTREPRENEUR BODY
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
                "12345678"

        };

    }


    // ==========================================================
    // ADMIN BODY
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
    // AUTHENTICATION
    // ==========================================================

    prepareAuthentication(
        request,
        endpoint
    ) {

        // ------------------------------------------------------
        // REGISTER
        // ------------------------------------------------------

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


        // ------------------------------------------------------
        // LOGIN
        // ------------------------------------------------------

        if (
            endpoint ===
            "/api/auth/login"
        ) {

            this.removeAuthorization(
                request
            );

            return;

        }


        // ------------------------------------------------------
        // RESTO
        // ------------------------------------------------------

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
    // PREPARAR URL
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

                    segment =>

                        this.replacePathSegment(

                            segment,

                            completePath,

                            testData

                        )

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
    // PATH SEGMENT
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

            return testData.interactionId ?? "";

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
    // RESOLVER UUID SEGÚN ENDPOINT
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


        // ======================================================
        // INTERACTIONS
        // ======================================================

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


        // ======================================================
        // PUBLICATIONS
        // ======================================================

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


        // ======================================================
        // STORES
        // ======================================================

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


        // ======================================================
        // USERS
        // ======================================================

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
    // REQUESTS EXCLUIDAS
    // ==========================================================

    isExcludedRequest(
        method,
        endpoint
    ) {

        return (

            String(
                method ??
                ""
            ).toUpperCase() ===
            "POST"

            &&

            this.normalizeEndpoint(
                endpoint
            ) ===
            "/api/stores"

        );

    }


    // ==========================================================
    // REEMPLAZAR UUID ESTÁTICO
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

            if (
                !testData.interactionId
            ) {

                return url;

            }


            return url.replace(
                uuidRegex,
                testData.interactionId
            );

        }


        return url;

    }


    // ==========================================================
    // QUERY VALUES
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
    // AUTHENTICATION SCRIPTS
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
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/login"
                ) {

                    this.addLoginCapture(
                        item
                    );

                }


                if (
                    method === "GET" &&
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

        item.event =
            Array.isArray(
                item.event
            )
                ? item.event
                : [];


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
    // ME VALIDATION
    // ==========================================================

    addMeValidation(
        item
    ) {

        item.event =
            Array.isArray(
                item.event
            )
                ? item.event
                : [];


        const script = [

            "pm.test('GET /me - Usuario autenticado', function () {",

            "    pm.expect(pm.response.code).to.be.within(200, 299);",

            "});"

        ];


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
    // LOGOUT VALIDATION
    // ==========================================================

    addLogoutValidation(
        item
    ) {

        item.event =
            Array.isArray(
                item.event
            )
                ? item.event
                : [];


        const script = [

            "pm.test('POST /logout - Logout exitoso', function () {",

            "    pm.expect(pm.response.code).to.be.within(200, 299);",

            "});"

        ];


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
    // ORGANIZAR COLLECTION
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


        console.log(
            `✓ Requests detectados: ${ordered.length}`
        );


        return ordered.map(
            request =>
                request.item
        );

    }


    // ==========================================================
    // PRIORIDAD
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
            method !==
            "DELETE"
        ) {

            return 20;

        }


        if (
            url.includes(
                "/api/stores"
            ) &&
            method !==
            "DELETE"
        ) {

            return 30;

        }


        if (
            url.includes(
                "/api/publications"
            ) &&
            method !==
            "DELETE"
        ) {

            return 40;

        }


        if (
            url.includes(
                "/api/interactions"
            ) &&
            method !==
            "DELETE"
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


        if (
            method ===
            "DELETE"
        ) {

            return 90;

        }


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
    // FLATTEN REQUESTS
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


                // ==================================================
                // EXCLUIR POST /api/stores
                // ==================================================

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

                        method:
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
    // COLLECT REQUESTS
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
    // COUNT REQUESTS
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
    // NORMALIZE ENDPOINT
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