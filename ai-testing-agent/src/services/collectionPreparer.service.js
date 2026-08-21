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

        console.log(
            "================================="
        );

        console.log(
            "PREPARANDO COLLECTION PARA NEWMAN"
        );

        console.log(
            "=================================\n"
        );


        if (!collectionPath) {

            throw new Error(
                "No se recibió la ruta de la Collection."
            );

        }


        if (!fs.existsSync(collectionPath)) {

            throw new Error(
                `No existe la Collection: ${collectionPath}`
            );

        }


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
        // DATOS DE PRUEBA
        // ======================================================

        /*
         * IMPORTANTE:
         *
         * Si RunCollectionSkill ya descubrió los datos,
         * utilizamos esos datos directamente.
         *
         * Solo usamos testDataService como fallback.
         */

        let values =
            providedTestData;


        if (
            !values ||
            typeof values !== "object" ||
            !values.userId
        ) {

            await testDataService.initialize();

            values =
                testDataService.get();

        }


        // ======================================================
        // VALIDACIONES
        // ======================================================

        if (!values?.userId) {

            throw new Error(
                "CollectionPreparer: falta userId."
            );

        }


        if (!values?.storeId) {

            throw new Error(
                "CollectionPreparer: falta storeId."
            );

        }


        if (!values?.publicationId) {

            throw new Error(
                "CollectionPreparer: falta publicationId."
            );

        }


        if (!values?.interactionId) {

            throw new Error(
                "CollectionPreparer: falta interactionId."
            );

        }


        if (!values?.token) {

            throw new Error(
                "CollectionPreparer: falta JWT."
            );

        }


        // ======================================================
        // MOSTRAR DATOS
        // ======================================================

        console.log(
            "DATOS PARA LAS PRUEBAS"
        );

        console.log(
            "---------------------------------"
        );

        console.log(
            "USER_ID        :",
            values.userId
        );

        console.log(
            "STORE_ID       :",
            values.storeId
        );

        console.log(
            "PUBLICATION_ID :",
            values.publicationId
        );

        console.log(
            "INTERACTION_ID :",
            values.interactionId
        );

        console.log(
            "EMAIL          :",
            values.email ?? "N/A"
        );

        console.log(
            "ROLE           :",
            values.role ?? "N/A"
        );

        console.log(
            "JWT            :",
            values.token
                ? "OK"
                : "NO"
        );


        // ======================================================
        // VARIABLES DE COLLECTION
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


        this.setVariable(
            collection,
            "token",
            values.token
        );


        this.setVariable(
            collection,
            "userId",
            values.userId
        );


        this.setVariable(
            collection,
            "storeId",
            values.storeId
        );


        this.setVariable(
            collection,
            "publicationId",
            values.publicationId
        );


        this.setVariable(
            collection,
            "interactionId",
            values.interactionId
        );


        this.setVariable(
            collection,
            "testEmail",
            values.email ?? ""
        );


        this.setVariable(
            collection,
            "testPassword",
            values.password ??
            "12345678"
        );


        // ======================================================
        // IDS DE RECURSOS CREADOS DURANTE LA PRUEBA
        // ======================================================

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
        // DATOS ÚNICOS PARA REGISTROS
        // ======================================================

        const stamp =
            Date.now();


        this.setVariable(
            collection,
            "registerAdminEmail",
            `admin.testing.${stamp}@umss.edu.bo`
        );


        this.setVariable(
            collection,
            "registerCustomerEmail",
            `customer.testing.${stamp}@umss.edu.bo`
        );


        this.setVariable(
            collection,
            "registerEntrepreneurEmail",
            `entrepreneur.testing.${stamp}@umss.edu.bo`
        );


        this.setVariable(
            collection,
            "registerAdminRu",
            `20${String(stamp).slice(-7)}`
        );


        this.setVariable(
            collection,
            "registerCustomerRu",
            `21${String(stamp + 1).slice(-7)}`
        );


        this.setVariable(
            collection,
            "registerEntrepreneurRu",
            `22${String(stamp + 2).slice(-7)}`
        );


        // ======================================================
        // APLANAR COLLECTION
        // ======================================================

        const requests =
            this.flattenRequests(
                collection.item
            );


        console.log(
            `Requests originales: ${requests.length}`
        );


        // ======================================================
        // FILTRAR REQUESTS
        // ======================================================

        const filtered = [];


        for (
            const item
            of requests
        ) {

            const endpoint =
                this.getEndpoint(
                    item.request
                );


            const method =
                this.getMethod(
                    item.request
                );


            /*
             * NO probar POST /api/stores.
             *
             * El registro entrepreneur ya crea
             * automáticamente la tienda.
             */

            if (
                method === "POST" &&
                endpoint === "/api/stores"
            ) {

                console.log(
                    "✓ Eliminado POST /api/stores."
                );

                console.log(
                    "  Entrepreneur ya crea la tienda."
                );

                continue;

            }


            /*
             * NO eliminar usuarios reales.
             */

            if (
                method === "DELETE" &&
                endpoint.startsWith(
                    "/api/users/"
                )
            ) {

                console.log(
                    "✓ Eliminado DELETE /api/users/:id."
                );

                continue;

            }


            filtered.push(
                item
            );

        }


        // ======================================================
        // ORDENAR
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

            const endpoint =
                this.getEndpoint(
                    item.request
                );


            const method =
                this.getMethod(
                    item.request
                );


            this.prepareRequest(
                item,
                values,
                collection
            );


            this.addAssertionsAndCaptures(
                item,
                endpoint,
                method
            );

        }


        // ======================================================
        // GUARDAR COLLECTION
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
        // MOSTRAR ORDEN FINAL
        // ======================================================

        console.log("");

        console.log(
            "================================="
        );

        console.log(
            "✓ COLLECTION PREPARADA"
        );

        console.log(
            "================================="
        );


        console.log(
            `Requests finales: ${collection.item.length}`
        );


        console.log("");


        collection.item.forEach(
            (item, index) => {

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
    // ORDEN DE EJECUCIÓN
    // ==========================================================

    orderRequests(
        items
    ) {

        const priority =
            item => {

                const method =
                    this.getMethod(
                        item.request
                    );


                const endpoint =
                    this.getEndpoint(
                        item.request
                    );


                // ==================================================
                // AUTH
                // ==================================================

                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/register/entrepreneur"
                ) {

                    return 10;

                }


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/register/customer"
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


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/login"
                ) {

                    return 20;

                }


                if (
                    method === "GET" &&
                    endpoint ===
                    "/api/auth/me"
                ) {

                    return 21;

                }


                // ==================================================
                // USERS
                // ==================================================

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


                // ==================================================
                // STORES
                // ==================================================

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


                // ==================================================
                // PUBLICATIONS
                // ==================================================

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
                    method === "GET" &&
                    endpoint.startsWith(
                        "/api/stores/"
                    ) &&
                    endpoint.endsWith(
                        "/publications"
                    )
                ) {

                    return 52;

                }


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/publications"
                ) {

                    return 53;

                }


                if (
                    method === "PUT" &&
                    endpoint.startsWith(
                        "/api/publications/"
                    )
                ) {

                    return 54;

                }


                if (
                    method === "PATCH" &&
                    endpoint.startsWith(
                        "/api/publications/"
                    )
                ) {

                    return 55;

                }


                if (
                    method === "GET" &&
                    endpoint ===
                    "/api/publications/semantic"
                ) {

                    return 56;

                }


                // ==================================================
                // INTERACTIONS
                // ==================================================

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


                // ==================================================
                // AI
                // ==================================================

                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/ai/chat"
                ) {

                    return 70;

                }


                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/ai/product-description"
                ) {

                    return 71;

                }


                // ==================================================
                // EMBEDDINGS
                // ==================================================

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


                // ==================================================
                // LOGOUT
                // ==================================================

                if (
                    method === "POST" &&
                    endpoint ===
                    "/api/auth/logout"
                ) {

                    return 900;

                }


                // ==================================================
                // DELETE
                // ==================================================

                if (
                    method === "DELETE"
                ) {

                    return (
                        1000 +
                        this.getDeletePriority(
                            endpoint
                        )
                    );

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
                        priority(item)

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
                x =>
                    x.item
            );

    }


    // ==========================================================
    // DELETE PRIORITY
    // ==========================================================

    getDeletePriority(
        endpoint
    ) {

        if (
            endpoint.startsWith(
                "/api/interactions/"
            )
        ) {

            return 10;

        }


        if (
            endpoint.startsWith(
                "/api/publications/"
            )
        ) {

            return 20;

        }


        if (
            endpoint.startsWith(
                "/api/stores/"
            )
        ) {

            return 30;

        }


        if (
            endpoint.startsWith(
                "/api/users/"
            )
        ) {

            return 40;

        }


        return 50;

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
        // JWT
        // ======================================================

        if (
            values.token &&
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
                "Bearer {{token}}"
            );

        }


        if (
            request.body
        ) {

            this.setHeader(
                request,
                "Content-Type",
                "application/json"
            );

        }


        this.prepareUrl(
            request,
            endpoint,
            method
        );


        this.prepareBody(
            request,
            endpoint,
            method,
            collection
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
            !request.url ||
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


                        if (
                            endpoint.startsWith(
                                "/api/users/"
                            ) &&
                            this.isDynamicId(
                                value
                            )
                        ) {

                            return "{{userId}}";

                        }


                        if (
                            endpoint.startsWith(
                                "/api/stores/"
                            ) &&
                            this.isDynamicId(
                                value
                            )
                        ) {

                            if (
                                method ===
                                "DELETE"
                            ) {

                                return "{{testEntrepreneurStoreId}}";

                            }

                            return "{{storeId}}";

                        }


                        if (
                            endpoint.startsWith(
                                "/api/publications/"
                            ) &&
                            this.isDynamicId(
                                value
                            )
                        ) {

                            if (
                                method ===
                                "DELETE"
                            ) {

                                return "{{testPublicationId}}";

                            }

                            return "{{publicationId}}";

                        }


                        if (
                            endpoint.startsWith(
                                "/api/interactions/"
                            ) &&
                            this.isDynamicId(
                                value
                            )
                        ) {

                            if (
                                method ===
                                "DELETE"
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
        // QUERY PARAMETERS
        // ======================================================

        if (
            Array.isArray(
                request.url.query
            )
        ) {

            request.url.query =
                request.url.query.map(
                    query => {

                        if (!query) {

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
        method,
        collection
    ) {

        if (
            !request.body ||
            request.body.mode !==
            "raw"
        ) {

            return;

        }


        let body =
            null;


        // ======================================================
        // REGISTER ENTREPRENEUR
        // ======================================================

        if (
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
                    "73345678",

                facultad:
                    "Ciencias y Tecnologia",

                password:
                    "12345678",

                nombreTienda:
                    "Innovacion Digital MCP"

            };

        }


        // ======================================================
        // REGISTER CUSTOMER
        // ======================================================

        else if (
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
                    "72234567",

                facultad:
                    "Ciencias y Tecnologia",

                password:
                    "12345678"

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
                    "71123456",

                facultad:
                    "Ciencias Economicas",

                password:
                    "12345678"

            };

        }


        // ======================================================
        // LOGIN
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
        // USER UPDATE
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
        // STORE UPDATE
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
        // STORE PATCH
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

            body = {

                publicationId:
                    "{{publicationId}}",

                type:
                    "VIEW",

                metadata:
                    "Prueba automatica MCP"

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


        if (!body) {

            return;

        }


        request.body.raw =
            JSON.stringify(
                body,
                null,
                2
            );

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
        // ASSERTION HTTP
        // ======================================================

        scripts.push(

            "pm.test('HTTP status exitoso', function () {",

            "    pm.expect(pm.response.code).to.be.within(200, 299);",

            "});"

        );


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

                "    const data = pm.response.json();",

                "    pm.expect(data).to.have.property('token');",

                "    pm.expect(data.token).to.be.a('string').and.not.empty;",

                "    pm.collectionVariables.set('token', data.token);",

                "    if (data.userId) pm.collectionVariables.set('userId', data.userId);",

                "});"

            );

        }


        // ======================================================
        // ENTREPRENEUR
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/auth/register/entrepreneur"
        ) {

            scripts.push(

                "",

                "pm.test('Entrepreneur registrado', function () {",

                "    const data = pm.response.json();",

                "    pm.expect(pm.response.code).to.be.within(200, 299);",

                "    console.log('✓ Entrepreneur registrado correctamente');",

                "    if (data?.store?.id) pm.collectionVariables.set('testEntrepreneurStoreId', data.store.id);",

                "    if (data?.storeId) pm.collectionVariables.set('testEntrepreneurStoreId', data.storeId);",

                "});"

            );

        }


        // ======================================================
        // PUBLICATION CREATE
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/publications"
        ) {

            scripts.push(

                "",

                "pm.test('Publication creada', function () {",

                "    const data = pm.response.json();",

                "    if (data?.id) pm.collectionVariables.set('testPublicationId', data.id);",

                "    console.log('✓ Publication creada correctamente');",

                "});"

            );

        }


        // ======================================================
        // INTERACTION CREATE
        // ======================================================

        if (
            method === "POST" &&
            endpoint ===
            "/api/interactions"
        ) {

            scripts.push(

                "",

                "pm.test('Interaction creada', function () {",

                "    const data = pm.response.json();",

                "    if (data?.id) pm.collectionVariables.set('testInteractionId', data.id);",

                "    console.log('✓ Interaction creada correctamente');",

                "});"

            );

        }


        this.ensureTestEvent(
            item,
            scripts
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


        if (existing) {

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


        if (existing) {

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


        if (existing) {

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

}


export default new CollectionPreparer();