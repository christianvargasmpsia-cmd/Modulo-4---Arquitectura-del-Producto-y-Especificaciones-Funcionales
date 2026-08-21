import fs from "fs";
import testDataService from "./testData.service.js";


class CollectionPreparer {

    constructor() {

        this.baseUrl =
            process.env.PLAYWRIGHT_API_BASE_URL ||
            "http://localhost:8080";

    }


    // ==========================================================
    // PREPARAR COLLECTION
    // ==========================================================

    async prepare(
        collectionPath,
        providedTestData = null
    ) {

        console.log("");
        console.log("==================================================");
        console.log("🛠️ PREPARANDO COLLECTION PARA NEWMAN");
        console.log("==================================================");
        console.log("");


        if (!collectionPath) {

            throw new Error(
                "CollectionPreparer: no se recibió collectionPath."
            );

        }


        if (!fs.existsSync(collectionPath)) {

            throw new Error(
                `Collection no encontrada: ${collectionPath}`
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


        // ======================================================
        // OBTENER DATOS DE DISCOVERY
        // ======================================================

        let values =
            providedTestData;


        if (
            !values ||
            typeof values !== "object" ||
            !values.userId
        ) {

            console.log(
                "⚠️ No se recibieron datos completos."
            );

            console.log(
                "🔎 Recuperando datos desde TestDataService..."
            );


            await testDataService.initialize();


            values =
                testDataService.get();

        }


        // ======================================================
        // VALIDAR DATOS BASE
        // ======================================================

        if (!values?.userId) {

            throw new Error(
                "CollectionPreparer: falta userId."
            );

        }


        if (!values?.token) {

            throw new Error(
                "CollectionPreparer: falta JWT de Discovery."
            );

        }


        if (
            String(
                values.role ?? ""
            ).toUpperCase() !== "COMPRADOR"
        ) {

            throw new Error(
                `CollectionPreparer: el usuario debe ser COMPRADOR. Role recibido: ${values.role}`
            );

        }


        // ======================================================
        // STORE Y PUBLICATION
        //
        // No detenemos toda la colección si alguno no existe.
        // Las pruebas que dependan de ellos podrán omitirse.
        // ======================================================

        if (!values.storeId) {

            console.log(
                "⚠️ No existe storeId en Discovery."
            );

            console.log(
                "   Las pruebas dependientes de Store serán omitidas."
            );

        }


        if (!values.publicationId) {

            console.log(
                "⚠️ No existe publicationId en Discovery."
            );

            console.log(
                "   Las pruebas dependientes de Publication serán omitidas."
            );

        }


        // ======================================================
        // MOSTRAR CONTEXTO
        // ======================================================

        console.log("");
        console.log("==================================================");
        console.log("📦 DATOS DE DISCOVERY");
        console.log("==================================================");


        console.log(
            `USER_ID        : ${values.userId}`
        );


        console.log(
            `STORE_ID       : ${values.storeId ?? "N/A"}`
        );


        console.log(
            `PUBLICATION_ID : ${values.publicationId ?? "N/A"}`
        );


        console.log(
            `INTERACTION_ID : ${values.interactionId ?? "N/A"}`
        );


        console.log(
            `EMAIL          : ${values.email ?? "N/A"}`
        );


        console.log(
            `ROLE           : ${values.role ?? "N/A"}`
        );


        console.log(
            `DISCOVERY JWT  : ${values.token ? "OK" : "NO"}`
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
            this.baseUrl
        );


        // ======================================================
        // JWT DE DISCOVERY
        // ======================================================

        this.setVariable(
            collection,
            "discoveryToken",
            values.token ?? ""
        );


        // ======================================================
        // IDS REALES
        // ======================================================

        this.setVariable(
            collection,
            "userId",
            values.userId
        );


        this.setVariable(
            collection,
            "storeId",
            values.storeId ?? ""
        );


        this.setVariable(
            collection,
            "publicationId",
            values.publicationId ?? ""
        );


        this.setVariable(
            collection,
            "interactionId",
            values.interactionId ?? ""
        );


        // ======================================================
        // CREDENCIALES DEL COMPRADOR
        // ======================================================

        this.setVariable(
            collection,
            "testEmail",
            values.email ?? ""
        );


        this.setVariable(
            collection,
            "testPassword",
            values.password ??
            process.env.TEST_USER_PASSWORD ??
            "12345678"
        );


        // ======================================================
        // JWT DEL LOGIN DE NEWMAN
        // ======================================================

        this.setVariable(
            collection,
            "testToken",
            ""
        );


        // ======================================================
        // IDS GENERADOS DURANTE NEWMAN
        // ======================================================

        this.setVariable(
            collection,
            "testUserId",
            ""
        );


        this.setVariable(
            collection,
            "testAdminUserId",
            ""
        );


        this.setVariable(
            collection,
            "testCustomerUserId",
            ""
        );


        this.setVariable(
            collection,
            "testEntrepreneurUserId",
            ""
        );


        this.setVariable(
            collection,
            "testAdminEmail",
            ""
        );


        this.setVariable(
            collection,
            "testCustomerEmail",
            ""
        );


        this.setVariable(
            collection,
            "testEntrepreneurEmail",
            ""
        );


        this.setVariable(
            collection,
            "testEntrepreneurStoreId",
            ""
        );


        this.setVariable(
            collection,
            "testPublicationId",
            ""
        );


        this.setVariable(
            collection,
            "testInteractionId",
            ""
        );


        // ======================================================
        // DATOS ÚNICOS PARA REGISTER
        // ======================================================

        const timestamp =
            Date.now();


        const registerAdminEmail =
            `admin.testing.${timestamp}@umss.edu.bo`;


        const registerCustomerEmail =
            `customer.testing.${timestamp}@umss.edu.bo`;


        const registerEntrepreneurEmail =
            `entrepreneur.testing.${timestamp}@umss.edu.bo`;


        this.setVariable(
            collection,
            "registerAdminEmail",
            registerAdminEmail
        );


        this.setVariable(
            collection,
            "registerCustomerEmail",
            registerCustomerEmail
        );


        this.setVariable(
            collection,
            "registerEntrepreneurEmail",
            registerEntrepreneurEmail
        );


        // ======================================================
        // RU
        // ======================================================

        const registerAdminRu =
            `20${String(timestamp).slice(-7)}`;


        const registerCustomerRu =
            `21${String(timestamp + 1).slice(-7)}`;


        const registerEntrepreneurRu =
            `22${String(timestamp + 2).slice(-7)}`;


        this.setVariable(
            collection,
            "registerAdminRu",
            registerAdminRu
        );


        this.setVariable(
            collection,
            "registerCustomerRu",
            registerCustomerRu
        );


        this.setVariable(
            collection,
            "registerEntrepreneurRu",
            registerEntrepreneurRu
        );


        // ======================================================
        // TELEFONOS
        // ======================================================

        this.setVariable(
            collection,
            "registerCustomerPhone",
            `7${String(timestamp).slice(-7)}`
        );


        this.setVariable(
            collection,
            "registerEntrepreneurPhone",
            `8${String(timestamp + 1).slice(-7)}`
        );


        this.setVariable(
            collection,
            "registerAdminPhone",
            `9${String(timestamp + 2).slice(-7)}`
        );


        // ======================================================
        // FLATTEN
        // ======================================================

        const requests =
            this.flattenRequests(
                collection.item
            );


        console.log("");

        console.log(
            `📋 Requests originales: ${requests.length}`
        );


        // ======================================================
        // FILTRAR REQUESTS
        // ======================================================

        const filtered = [];


        for (
            const item
            of requests
        ) {

            const method =
                this.getMethod(
                    item.request
                );


            const endpoint =
                this.getEndpoint(
                    item.request
                );


            // --------------------------------------------------
            // CREATE STORE
            //
            // El entrepreneur ya crea la tienda.
            // --------------------------------------------------

            if (
                method === "POST" &&
                endpoint === "/api/stores"
            ) {

                console.log(
                    "⏭️ ELIMINANDO POST /api/stores"
                );

                console.log(
                    "   La tienda se crea mediante REGISTER ENTREPRENEUR."
                );

                continue;

            }


            // --------------------------------------------------
            // DELETE USER
            // --------------------------------------------------

            if (
                method === "DELETE" &&
                endpoint.startsWith(
                    "/api/users/"
                )
            ) {

                console.log(
                    "⏭️ ELIMINANDO DELETE /api/users/:id"
                );

                console.log(
                    "   No se eliminarán usuarios reales."
                );

                continue;

            }


            filtered.push(
                item
            );

        }


        // ======================================================
        // ORDEN
        // ======================================================

        const ordered =
            this.orderRequests(
                filtered
            );


        collection.item =
            ordered;


        // ======================================================
        // PREPARAR REQUESTS
        // ======================================================

        for (
            const item
            of collection.item
        ) {

            const method =
                this.getMethod(
                    item.request
                );


            const endpoint =
                this.getEndpoint(
                    item.request
                );


            // --------------------------------------------------
            // SI REQUIERE STORE
            // --------------------------------------------------

            if (
                this.requiresStoreId(
                    endpoint
                ) &&
                !values.storeId
            ) {

                this.addPreRequestSkip(
                    item,
                    "No existe storeId disponible."
                );

                continue;

            }


            // --------------------------------------------------
            // SI REQUIERE PUBLICATION
            // --------------------------------------------------

            if (
                this.requiresPublicationId(
                    endpoint,
                    method
                ) &&
                !values.publicationId
            ) {

                this.addPreRequestSkip(
                    item,
                    "No existe publicationId disponible."
                );

                continue;

            }


            // --------------------------------------------------
            // INTERACTION
            //
            // Si ya existe una interaction:
            //
            //     {{interactionId}}
            //
            // Si NO existe:
            //
            //     {{testInteractionId}}
            //
            // Este último será creado por POST /interactions.
            // --------------------------------------------------

            if (
                this.requiresInteractionId(
                    endpoint
                )
            ) {

                this.prepareInteractionRequest(
                    item,
                    endpoint,
                    values
                );

            }


            // --------------------------------------------------
            // PREPARAR REQUEST
            // --------------------------------------------------

            this.prepareRequest(
                item,
                values,
                collection
            );


            // --------------------------------------------------
            // ASSERTIONS
            // --------------------------------------------------

            this.addAssertionsAndCaptures(
                item,
                endpoint,
                method
            );

        }


        // ======================================================
        // GUARDAR
        // ======================================================

        fs.writeFileSync(

            collectionPath,

            JSON.stringify(
                collection,
                null,
                2
            ),

            "utf8"

        );


        // ======================================================
        // RESUMEN
        // ======================================================

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "✅ COLLECTION PREPARADA"
        );

        console.log(
            "=================================================="
        );


        console.log(
            `Requests finales: ${collection.item.length}`
        );


        console.log("");

        console.log(
            "🔐 FLUJO DE AUTENTICACIÓN:"
        );


        console.log(
            "   1. Register Customer"
        );


        console.log(
            "   2. Register Entrepreneur"
        );


        console.log(
            "   3. Register Admin"
        );


        console.log(
            "   4. Login comprador REAL"
        );


        console.log(
            "   5. GET /me con JWT generado por login"
        );


        console.log(
            "   6. Logout"
        );


        console.log("");

        collection.item.forEach(
            (
                item,
                index
            ) => {

                console.log(

                    `[${String(index + 1).padStart(2, "0")}] ` +
                    `${this.getMethod(item.request)} ` +
                    `${this.getEndpoint(item.request)}`

                );

            }
        );


        return collectionPath;

    }


    // ==========================================================
    // FLATTEN
    // ==========================================================

    flattenRequests(
        items,
        result = []
    ) {

        if (
            !Array.isArray(items)
        ) {

            return result;

        }


        for (
            const item
            of items
        ) {

            if (
                item?.request
            ) {

                result.push(
                    item
                );

            }


            if (
                Array.isArray(
                    item?.item
                )
            ) {

                this.flattenRequests(
                    item.item,
                    result
                );

            }

        }


        return result;

    }


    // ==========================================================
    // ORDEN
    // ==========================================================

    orderRequests(
        items
    ) {

        const getPriority =
            item => {

                const method =
                    this.getMethod(
                        item.request
                    );


                const endpoint =
                    this.getEndpoint(
                        item.request
                    );


                // REGISTER

                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/register/customer"
                ) {

                    return 10;

                }


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/register/entrepreneur"
                ) {

                    return 11;

                }


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/register/admin"
                ) {

                    return 12;

                }


                // LOGIN

                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/login"
                ) {

                    return 20;

                }


                // ME

                if (
                    method === "GET" &&
                    endpoint ===
                    "/api/auth/me"
                ) {

                    return 21;

                }


                // USERS

                if (
                    method === "GET" &&
                    endpoint ===
                    "/api/users"
                ) {

                    return 30;

                }


                if (
                    method === "GET" &&
                    endpoint.startsWith(
                        "/api/users/"
                    )
                ) {

                    return 31;

                }


                if (
                    method === "PUT" &&
                    endpoint.startsWith(
                        "/api/users/"
                    )
                ) {

                    return 32;

                }


                if (
                    method === "PATCH" &&
                    endpoint.startsWith(
                        "/api/users/"
                    )
                ) {

                    return 33;

                }


                // STORES

                if (
                    method === "GET" &&
                    endpoint ===
                    "/api/stores"
                ) {

                    return 40;

                }


                if (
                    method === "GET" &&
                    endpoint.startsWith(
                        "/api/stores/"
                    )
                ) {

                    return 41;

                }


                if (
                    method === "PUT" &&
                    endpoint.startsWith(
                        "/api/stores/"
                    )
                ) {

                    return 42;

                }


                if (
                    method === "PATCH" &&
                    endpoint.startsWith(
                        "/api/stores/"
                    )
                ) {

                    return 43;

                }


                // PUBLICATIONS

                if (
                    method === "GET" &&
                    endpoint ===
                    "/api/publications"
                ) {

                    return 50;

                }


                if (
                    method === "GET" &&
                    endpoint.startsWith(
                        "/api/publications/"
                    ) &&
                    !endpoint.includes(
                        "/semantic"
                    )
                ) {

                    return 51;

                }


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/publications"
                ) {

                    return 52;

                }


                if (
                    method === "PUT" &&
                    endpoint.startsWith(
                        "/api/publications/"
                    )
                ) {

                    return 53;

                }


                if (
                    method === "PATCH" &&
                    endpoint.startsWith(
                        "/api/publications/"
                    )
                ) {

                    return 54;

                }


                if (
                    method === "GET" &&
                    endpoint ===
                    "/api/publications/semantic"
                ) {

                    return 55;

                }


                // INTERACTIONS
                //
                // IMPORTANTE:
                // POST primero para poder generar
                // testInteractionId.

                if (
                    method === "GET" &&
                    endpoint ===
                    "/api/interactions"
                ) {

                    return 60;

                }


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/interactions"
                ) {

                    return 61;

                }


                if (
                    method === "GET" &&
                    endpoint.startsWith(
                        "/api/interactions/"
                    )
                ) {

                    return 62;

                }


                if (
                    method === "DELETE" &&
                    endpoint.startsWith(
                        "/api/interactions/"
                    )
                ) {

                    return 63;

                }


                // AI

                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/ai/product-description"
                ) {

                    return 70;

                }


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/ai/chat"
                ) {

                    return 71;

                }


                // EMBEDDINGS

                if (
                    method === "GET" &&
                    endpoint ===
                    "/api/admin/embeddings/status"
                ) {

                    return 80;

                }


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/admin/embeddings/reindex"
                ) {

                    return 81;

                }


                // DELETE

                if (
                    method === "DELETE"
                ) {

                    return 900;

                }


                // LOGOUT SIEMPRE AL FINAL

                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/logout"
                ) {

                    return 1000;

                }


                return 500;

            };


        return items

            .map(
                (
                    item,
                    index
                ) => ({

                    item,

                    index,

                    priority:
                        getPriority(item)

                })
            )

            .sort(
                (
                    a,
                    b
                ) => {

                    if (
                        a.priority !==
                        b.priority
                    ) {

                        return (
                            a.priority -
                            b.priority
                        );

                    }


                    return (
                        a.index -
                        b.index
                    );

                }
            )

            .map(
                entry =>
                    entry.item
            );

    }


    // ==========================================================
    // PREPARAR INTERACTION
    // ==========================================================

    prepareInteractionRequest(
        item,
        endpoint,
        values
    ) {

        const request =
            item.request;


        if (
            !request?.url ||
            typeof request.url === "string"
        ) {

            return;

        }


        if (
            !Array.isArray(
                request.url.path
            )
        ) {

            return;

        }


        request.url.path =
            request.url.path.map(
                segment => {

                    const value =
                        String(
                            segment ?? ""
                        );


                    if (
                        endpoint.startsWith(
                            "/api/interactions/"
                        ) &&
                        this.isDynamicId(value)
                    ) {

                        if (
                            values.interactionId
                        ) {

                            return "{{interactionId}}";

                        }


                        return "{{testInteractionId}}";

                    }


                    return segment;

                }
            );

    }


    // ==========================================================
    // PREPARAR REQUEST
    // ==========================================================

    prepareRequest(
        item,
        values,
        collection
    ) {

        const request =
            item.request;


        const endpoint =
            this.getEndpoint(
                request
            );


        const method =
            this.getMethod(
                request
            );


        request.header =
            Array.isArray(
                request.header
            )
                ? request.header
                : [];


        // ======================================================
        // AUTHORIZATION
        // ======================================================

        if (
            !endpoint.startsWith(
                "/api/auth/login"
            ) &&
            !endpoint.startsWith(
                "/api/auth/register/"
            )
        ) {

            this.setHeader(
                request,
                "Authorization",
                "Bearer {{testToken}}"
            );

        }


        // ======================================================
        // CONTENT TYPE
        // ======================================================

        if (
            request.body
        ) {

            this.setHeader(
                request,
                "Content-Type",
                "application/json"
            );

        }


        // ======================================================
        // URL
        // ======================================================

        this.prepareUrl(
            request,
            endpoint,
            method
        );


        // ======================================================
        // BODY
        // ======================================================

        this.prepareBody(
            request,
            endpoint,
            method
        );

    }


    // ==========================================================
    // URL
    // ==========================================================

    prepareUrl(
        request,
        endpoint,
        method
    ) {

        if (
            !request?.url ||
            typeof request.url === "string"
        ) {

            return;

        }


        if (
            Array.isArray(
                request.url.path
            )
        ) {

            request.url.path =
                request.url.path.map(
                    segment => {

                        const value =
                            String(
                                segment ?? ""
                            );


                        // USERS

                        if (
                            endpoint.startsWith(
                                "/api/users/"
                            ) &&
                            this.isDynamicId(value)
                        ) {

                            return "{{userId}}";

                        }


                        // STORES

                        if (
                            endpoint.startsWith(
                                "/api/stores/"
                            ) &&
                            this.isDynamicId(value)
                        ) {

                            return "{{storeId}}";

                        }


                        // PUBLICATIONS

                        if (
                            endpoint.startsWith(
                                "/api/publications/"
                            ) &&
                            this.isDynamicId(value)
                        ) {

                            return "{{publicationId}}";

                        }


                        // INTERACTIONS

                        if (
                            endpoint.startsWith(
                                "/api/interactions/"
                            ) &&
                            this.isDynamicId(value)
                        ) {

                            if (
                                endpoint.includes(
                                    "{{testInteractionId}}"
                                )
                            ) {

                                return "{{testInteractionId}}";

                            }


                            return "{{interactionId}}";

                        }


                        return segment;

                    }
                );

        }


        // ======================================================
        // QUERY
        // ======================================================

        if (
            Array.isArray(
                request.url.query
            )
        ) {

            request.url.query =
                request.url.query.map(
                    query => {

                        if (
                            !query
                        ) {

                            return query;

                        }


                        switch (
                            query.key
                        ) {

                            case "texto":

                                query.value =
                                    "laptop";

                                break;


                            case "tipo":

                                query.value =
                                    "PRODUCTO";

                                break;


                            case "precioMin":

                                query.value =
                                    "0";

                                break;


                            case "precioMax":

                                query.value =
                                    "10000";

                                break;


                            case "storeId":

                                query.value =
                                    "{{storeId}}";

                                break;


                            case "query":

                                query.value =
                                    "laptop";

                                break;


                            case "topK":

                                query.value =
                                    "5";

                                break;

                        }


                        return query;

                    }
                );

        }

    }


    // ==========================================================
    // BODY
    // ==========================================================

    prepareBody(
        request,
        endpoint,
        method
    ) {

        if (
            !request?.body ||
            request.body.mode !== "raw"
        ) {

            return;

        }


        let body =
            null;


        // ======================================================
        // REGISTER CUSTOMER
        // ======================================================

        if (
            endpoint ===
            "/api/auth/register/customer"
        ) {

            body = {

                ru:
                    "{{registerCustomerRu}}",

                nombre:
                    "Camila",

                apellidoPaterno:
                    "Mendoza",

                apellidoMaterno:
                    "Flores",

                email:
                    "{{registerCustomerEmail}}",

                celular:
                    "{{registerCustomerPhone}}",

                facultad:
                    "Ciencias y Tecnologia",

                password:
                    "12345678"

            };

        }


        // ======================================================
        // REGISTER ENTREPRENEUR
        // ======================================================

        else if (
            endpoint ===
            "/api/auth/register/entrepreneur"
        ) {

            body = {

                ru:
                    "{{registerEntrepreneurRu}}",

                nombre:
                    "Luciana",

                apellidoPaterno:
                    "Rojas",

                apellidoMaterno:
                    "Cabrera",

                email:
                    "{{registerEntrepreneurEmail}}",

                celular:
                    "{{registerEntrepreneurPhone}}",

                facultad:
                    "Ciencias y Tecnologia",

                password:
                    "12345678",

                nombreTienda:
                    "Innovacion Digital MCP"

            };

        }


        // ======================================================
        // REGISTER ADMIN
        // ======================================================

        else if (
            endpoint ===
            "/api/auth/register/admin"
        ) {

            body = {

                ru:
                    "{{registerAdminRu}}",

                nombre:
                    "Mateo",

                apellidoPaterno:
                    "Quispe",

                apellidoMaterno:
                    "Vargas",

                email:
                    "{{registerAdminEmail}}",

                celular:
                    "{{registerAdminPhone}}",

                facultad:
                    "Ciencias Economicas",

                password:
                    "12345678"

            };

        }


        // ======================================================
        // LOGIN COMPRADOR
        // ======================================================

        else if (
            endpoint ===
            "/api/auth/login"
        ) {

            body = {

                email:
                    "{{testEmail}}",

                password:
                    "{{testPassword}}"

            };

        }


        // ======================================================
        // UPDATE USER
        // ======================================================

        else if (
            method === "PUT" &&
            endpoint.startsWith(
                "/api/users/"
            )
        ) {

            body = {

                apellidoPaterno:
                    "MamaniTest",

                celular:
                    "70011111",

                email:
                    "{{testEmail}}",

                facultad:
                    "Ciencias y Tecnologia",

                nombre:
                    "UsuarioTest",

                ru:
                    "202499991",

                apellidoMaterno:
                    "Testing"

            };

        }


        // ======================================================
        // USER STATUS
        // ======================================================

        else if (
            method === "PATCH" &&
            endpoint.startsWith(
                "/api/users/"
            )
        ) {

            body = {

                status:
                    "ACTIVO"

            };

        }


        // ======================================================
        // UPDATE STORE
        // ======================================================

        else if (
            method === "PUT" &&
            endpoint.startsWith(
                "/api/stores/"
            )
        ) {

            body = {

                nombre:
                    "Tienda Actualizada MCP",

                telefonoContacto:
                    "70022222",

                descripcion:
                    "Tienda actualizada por AI Testing Agent",

                categoria:
                    "TECNOLOGIA",

                emailContacto:
                    "{{testEmail}}",

                status:
                    "ACTIVO"

            };

        }


        // ======================================================
        // PATCH STORE
        // ======================================================

        else if (
            method === "PATCH" &&
            endpoint.startsWith(
                "/api/stores/"
            )
        ) {

            body = {

                nombre:
                    "Tienda MCP Patch",

                descripcion:
                    "Actualizacion parcial automatizada",

                categoria:
                    "TECNOLOGIA",

                telefonoContacto:
                    "70033333",

                emailContacto:
                    "{{testEmail}}",

                status:
                    "ACTIVO"

            };

        }


        // ======================================================
        // CREATE PUBLICATION
        // ======================================================

        else if (
            method === "POST" &&
            endpoint ===
            "/api/publications"
        ) {

            body = {

                storeId:
                    "{{storeId}}",

                nombre:
                    "Producto MCP Test",

                descripcion:
                    "Producto creado para pruebas automatizadas",

                precio:
                    100,

                tipo:
                    "PRODUCTO",

                stock:
                    10,

                modalidadCobro:
                    "COMPLETO"

            };

        }


        // ======================================================
        // UPDATE PUBLICATION
        // ======================================================

        else if (
            method === "PUT" &&
            endpoint.startsWith(
                "/api/publications/"
            )
        ) {

            body = {

                nombre:
                    "Producto MCP Actualizado",

                descripcion:
                    "Producto actualizado por AI Testing Agent",

                precio:
                    150,

                tipo:
                    "PRODUCTO",

                stock:
                    20,

                modalidadCobro:
                    "COMPLETO"

            };

        }


        // ======================================================
        // PUBLICATION STATUS
        // ======================================================

        else if (
            method === "PATCH" &&
            endpoint.startsWith(
                "/api/publications/"
            )
        ) {

            body = {

                activa:
                    true

            };

        }


        // ======================================================
        // CREATE INTERACTION
        // ======================================================

        else if (
            method === "POST" &&
            endpoint ===
            "/api/interactions"
        ) {

            if (!this.currentPublicationAvailable) {

                body = null;

            }
            else {

                body = {

                    publicationId:
                        "{{publicationId}}",

                    type:
                        "VIEW",

                    metadata:
                        "Prueba automatica MCP"

                };

            }

        }


        // ======================================================
        // AI PRODUCT DESCRIPTION
        // ======================================================

        else if (
            endpoint ===
            "/api/ai/product-description"
        ) {

            body = {

                nombre:
                    "Laptop Universitaria",

                tipo:
                    "PRODUCTO",

                precio:
                    3500

            };

        }


        // ======================================================
        // AI CHAT
        // ======================================================

        else if (
            endpoint ===
            "/api/ai/chat"
        ) {

            body = {

                message:
                    "¿Qué productos existen disponibles?"

            };

        }


        // ======================================================
        // ESCRIBIR BODY
        // ======================================================

        if (
            body
        ) {

            request.body.raw =
                JSON.stringify(
                    body,
                    null,
                    2
                );

        }

    }


    // ==========================================================
    // ASSERTIONS + CAPTURAS
    // ==========================================================

    addAssertionsAndCaptures(
        item,
        endpoint,
        method
    ) {

        const scripts = [];


        // ======================================================
        // HTTP
        // ======================================================

        scripts.push(

            "pm.test('HTTP status exitoso', function () {",

            "    pm.expect(pm.response.code).to.be.within(200, 299);",

            "});"

        );


        // ======================================================
        // REGISTER CUSTOMER
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/auth/register/customer"
        ) {

            scripts.push(

                "",

                "pm.test('Customer registrado correctamente', function () {",

                "    pm.expect(pm.response.code).to.be.within(200, 299);",

                "    const data = pm.response.json();",

                "    console.log('✓ Customer registrado correctamente');",

                "    if (data?.id) pm.collectionVariables.set('testCustomerUserId', data.id);",

                "    if (data?.userId) pm.collectionVariables.set('testCustomerUserId', data.userId);",

                "});"

            );

        }


        // ======================================================
        // REGISTER ENTREPRENEUR
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/auth/register/entrepreneur"
        ) {

            scripts.push(

                "",

                "pm.test('Entrepreneur registrado correctamente', function () {",

                "    pm.expect(pm.response.code).to.be.within(200, 299);",

                "    const data = pm.response.json();",

                "    console.log('✓ Entrepreneur registrado correctamente');",

                "    if (data?.id) pm.collectionVariables.set('testEntrepreneurUserId', data.id);",

                "    if (data?.userId) pm.collectionVariables.set('testEntrepreneurUserId', data.userId);",

                "    if (data?.store?.id) pm.collectionVariables.set('testEntrepreneurStoreId', data.store.id);",

                "    if (data?.storeId) pm.collectionVariables.set('testEntrepreneurStoreId', data.storeId);",

                "});"

            );

        }


        // ======================================================
        // REGISTER ADMIN
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/auth/register/admin"
        ) {

            scripts.push(

                "",

                "pm.test('Admin registrado correctamente', function () {",

                "    pm.expect(pm.response.code).to.be.within(200, 299);",

                "    const data = pm.response.json();",

                "    console.log('✓ Admin registrado correctamente');",

                "    if (data?.id) pm.collectionVariables.set('testAdminUserId', data.id);",

                "    if (data?.userId) pm.collectionVariables.set('testAdminUserId', data.userId);",

                "});"

            );

        }


        // ======================================================
        // LOGIN
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/auth/login"
        ) {

            scripts.push(

                "",

                "pm.test('Login devuelve JWT', function () {",

                "    pm.expect(pm.response.code).to.be.within(200, 299);",

                "    const data = pm.response.json();",

                "    const token = data?.token || data?.accessToken || data?.jwt;",

                "    pm.expect(token).to.be.a('string').and.not.empty;",

                "    pm.collectionVariables.set('testToken', token);",

                "    if (data?.userId) pm.collectionVariables.set('testUserId', data.userId);",

                "    console.log('✓ JWT_TEST obtenido mediante POST /login');",

                "});"

            );

        }


        // ======================================================
        // GET ME
        // ======================================================

        if (
            method === "GET" &&
            endpoint ===
            "/api/auth/me"
        ) {

            scripts.push(

                "",

                "pm.test('GET /me exitoso', function () {",

                "    pm.expect(pm.response.code).to.be.within(200, 299);",

                "    const data = pm.response.json();",

                "    console.log('✓ GET /me ejecutado con JWT_TEST');",

                "    console.log('✓ Usuario autenticado:', data?.email || data?.user?.email || 'OK');",

                "});"

            );

        }


        // ======================================================
        // CREATE PUBLICATION
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/publications"
        ) {

            scripts.push(

                "",

                "pm.test('Publication creada correctamente', function () {",

                "    pm.expect(pm.response.code).to.be.within(200, 299);",

                "    const data = pm.response.json();",

                "    console.log('✓ Publication creada');",

                "    if (data?.id) pm.collectionVariables.set('testPublicationId', data.id);",

                "    if (data?.publicationId) pm.collectionVariables.set('testPublicationId', data.publicationId);",

                "});"

            );

        }


        // ======================================================
        // CREATE INTERACTION
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/interactions"
        ) {

            scripts.push(

                "",

                "pm.test('Interaction creada correctamente', function () {",

                "    pm.expect(pm.response.code).to.be.within(200, 299);",

                "    const data = pm.response.json();",

                "    console.log('✓ Interaction creada');",

                "    if (data?.id) pm.collectionVariables.set('testInteractionId', data.id);",

                "    if (data?.interactionId) pm.collectionVariables.set('testInteractionId', data.interactionId);",

                "});"

            );

        }


        // ======================================================
        // LOGOUT
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/auth/logout"
        ) {

            scripts.push(

                "",

                "pm.test('Logout ejecutado correctamente', function () {",

                "    pm.expect(pm.response.code).to.be.within(200, 299);",

                "    console.log('✓ Logout ejecutado con JWT_TEST');",

                "});"

            );

        }


        this.ensureTestEvent(
            item,
            scripts
        );

    }


    // ==========================================================
    // SKIP REAL MEDIANTE PRE-REQUEST
    //
    // ESTA ES LA CORRECCIÓN IMPORTANTE.
    //
    // pm.execution.skipRequest()
    // evita que Newman envíe el HTTP request.
    // ==========================================================

    addPreRequestSkip(
        item,
        reason
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
                    "prerequest"
            );


        const script = {

            type:
                "text/javascript",

            exec: [

                `console.log('⏭️ SKIPPED REQUEST: ${this.escapeScriptString(reason)}');`,

                "pm.execution.skipRequest();"

            ]

        };


        if (
            existing
        ) {

            existing.script =
                script;

        }
        else {

            item.event.push({

                listen:
                    "prerequest",

                script

            });

        }


        item.__skipReason =
            reason;


        console.log(
            `⏭️ SKIP REAL ${this.getMethod(item.request)} ${this.getEndpoint(item.request)}`
        );


        console.log(
            `   Motivo: ${reason}`
        );

    }


    // ==========================================================
    // PREPARAR INTERACTION DEPENDIENTE
    // ==========================================================

    prepareInteractionDependentRequest(
        item,
        endpoint,
        values
    ) {

        if (
            values.interactionId
        ) {

            return;

        }


        // Si no existe interaction de Discovery,
        // usamos la interaction que pueda crear
        // POST /api/interactions.

        this.addPreRequestSkipIfVariableEmpty(
            item,
            "testInteractionId",
            "No existe interactionId y no se pudo crear una interaction."
        );

    }


    // ==========================================================
    // SKIP SI VARIABLE VACÍA
    // ==========================================================

    addPreRequestSkipIfVariableEmpty(
        item,
        variable,
        reason
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
                    "prerequest"
            );


        const lines = [

            `const value = pm.collectionVariables.get('${variable}');`,

            "if (!value) {",

            `    console.log('⏭️ SKIPPED: ${this.escapeScriptString(reason)}');`,

            "    pm.execution.skipRequest();",

            "}"

        ];


        if (
            existing
        ) {

            const previous =
                Array.isArray(
                    existing.script?.exec
                )
                    ? existing.script.exec
                    : [];


            existing.script = {

                type:
                    "text/javascript",

                exec: [

                    ...previous,

                    ...lines

                ]

            };

        }
        else {

            item.event.push({

                listen:
                    "prerequest",

                script: {

                    type:
                        "text/javascript",

                    exec:
                        lines

                }

            });

        }

    }


    // ==========================================================
    // REQUIERE INTERACTION
    // ==========================================================

    requiresInteractionId(
        endpoint
    ) {

        return (
            endpoint.startsWith(
                "/api/interactions/"
            )
        );

    }


    // ==========================================================
    // REQUIERE STORE
    // ==========================================================

    requiresStoreId(
        endpoint
    ) {

        return (

            endpoint.startsWith(
                "/api/stores/"
            )

        );

    }


    // ==========================================================
    // REQUIERE PUBLICATION
    // ==========================================================

    requiresPublicationId(
        endpoint,
        method
    ) {

        return (

            (
                endpoint.startsWith(
                    "/api/publications/"
                )
            )

        );

    }


    // ==========================================================
    // TEST EVENT
    // ==========================================================

    ensureTestEvent(
        item,
        exec
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


        const event = {

            listen:
                "test",

            script: {

                type:
                    "text/javascript",

                exec

            }

        };


        if (
            existing
        ) {

            Object.assign(
                existing,
                event
            );

        }
        else {

            item.event.push(
                event
            );

        }

    }


    // ==========================================================
    // VARIABLE
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
    // HEADER
    // ==========================================================

    setHeader(
        request,
        key,
        value
    ) {

        const existing =
            request.header.find(
                header =>
                    header.key
                        ?.toLowerCase() ===
                    key.toLowerCase()
            );


        if (
            existing
        ) {

            existing.value =
                value;

        }
        else {

            request.header.push({

                key,

                value,

                type:
                    "text"

            });

        }

    }


    // ==========================================================
    // METHOD
    // ==========================================================

    getMethod(
        request
    ) {

        return String(
            request?.method ??
            ""
        ).toUpperCase();

    }


    // ==========================================================
    // ENDPOINT
    // ==========================================================

    getEndpoint(
        request
    ) {

        if (
            !request?.url
        ) {

            return "";

        }


        if (
            typeof request.url ===
            "string"
        ) {

            return this.normalizeEndpoint(
                request.url
            );

        }


        if (
            Array.isArray(
                request.url.path
            )
        ) {

            return this.normalizeEndpoint(

                "/" +
                request.url.path.join("/")

            );

        }


        if (
            request.url.raw
        ) {

            return this.normalizeEndpoint(
                request.url.raw
            );

        }


        return "";

    }


    // ==========================================================
    // NORMALIZAR ENDPOINT
    // ==========================================================

    normalizeEndpoint(
        value
    ) {

        let endpoint =
            String(
                value ?? ""
            );


        endpoint =
            endpoint

                .replace(
                    /^https?:\/\/[^/]+/i,
                    ""
                )

                .replace(
                    /\{\{baseUrl\}\}/gi,
                    ""
                )

                .replace(
                    /:id\b/gi,
                    ":id"
                )

                .replace(
                    /\{\{[^}]+\}\}/g,
                    ":id"
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
    // ID DINÁMICO
    // ==========================================================

    isDynamicId(
        value
    ) {

        const text =
            String(
                value ?? ""
            );


        return (

            text === ":id" ||

            text === "{id}" ||

            text === "<uuid>" ||

            text === "<string>" ||

            text === "<number>" ||

            this.isUuid(text)

        );

    }


    // ==========================================================
    // UUID
    // ==========================================================

    isUuid(
        value
    ) {

        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(

            String(
                value ?? ""
            )

        );

    }


    // ==========================================================
    // ESCAPAR TEXTO PARA SCRIPT
    // ==========================================================

    escapeScriptString(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /\\/g,
                "\\\\"
            )
            .replace(
                /'/g,
                "\\'"
            )
            .replace(
                /\r?\n/g,
                "\\n"
            );

    }

}


export default new CollectionPreparer();