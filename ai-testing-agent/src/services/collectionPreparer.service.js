import fs from "fs";
import testDataService from "./testData.service.js";


class CollectionPreparer {

    async prepare(collectionPath) {

        console.log("=================================");
        console.log("Preparando Collection para Newman");
        console.log("=================================\n");


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
                ).replace(/^\uFEFF/, "")
            );


        // ======================================================
        // OBTENER DATOS REALES
        // ======================================================

        await testDataService.initialize();

        const values =
            testDataService.get();


        console.log("\nDatos utilizados por las pruebas:");

        console.log(
            `  userId        : ${values.userId}`
        );

        console.log(
            `  storeId       : ${values.storeId}`
        );

        console.log(
            `  publicationId : ${values.publicationId}`
        );

        console.log(
            `  token         : ${values.token ? "OK" : "NO"}`
        );


        // ======================================================
        // VARIABLES DE COLLECTION
        // ======================================================

        collection.variable =
            collection.variable || [];


        this.setVariable(
            collection,
            "baseUrl",
            "http://localhost:8080"
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
            values.email
        );


        this.setVariable(
            collection,
            "testPassword",
            values.password
        );


        // ======================================================
        // RECORRER TODA LA COLLECTION
        // ======================================================

        this.walk(
            collection.item,
            values
        );


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


        console.log(
            "\n✓ Collection preparada para Newman"
        );


        return collectionPath;

    }


    // ==========================================================
    // VARIABLES
    // ==========================================================

    setVariable(
        collection,
        key,
        value
    ) {

        const variable =
            collection.variable.find(
                item =>
                    item.key === key
            );


        if (variable) {

            variable.value = value;

        } else {

            collection.variable.push({
                key,
                value
            });

        }

    }


    // ==========================================================
    // WALK
    // ==========================================================

    walk(
        items,
        values
    ) {

        if (!Array.isArray(items)) {

            return;

        }


        for (const item of items) {


            if (item.request) {

                this.prepareRequest(
                    item,
                    values
                );

            }


            if (item.item) {

                this.walk(
                    item.item,
                    values
                );

            }

        }

    }


    // ==========================================================
    // REQUEST
    // ==========================================================

    prepareRequest(
        item,
        values
    ) {

        const request =
            item.request;


        const endpoint =
            this.getEndpoint(
                request
            );


        // ======================================================
        // AUTHORIZATION
        // ======================================================

        if (
            values.token &&
            !this.isAuthEndpoint(endpoint)
        ) {

            request.header =
                request.header || [];


            const authorization =
                request.header.find(
                    header =>
                        header.key
                            ?.toLowerCase() ===
                        "authorization"
                );


            if (authorization) {

                authorization.value =
                    "Bearer {{token}}";

            } else {

                request.header.push({

                    key:
                        "Authorization",

                    value:
                        "Bearer {{token}}",

                    type:
                        "text"

                });

            }

        }


        // ======================================================
        // CONTENT TYPE
        // ======================================================

        if (request.body) {

            request.header =
                request.header || [];


            const contentType =
                request.header.find(
                    header =>
                        header.key
                            ?.toLowerCase() ===
                        "content-type"
                );


            if (!contentType) {

                request.header.push({

                    key:
                        "Content-Type",

                    value:
                        "application/json",

                    type:
                        "text"

                });

            }

        }


        // ======================================================
        // URL
        // ======================================================

        this.prepareUrl(
            request,
            endpoint
        );


        // ======================================================
        // BODY
        // ======================================================

        this.prepareBody(
            request,
            endpoint,
            values
        );

    }


    // ==========================================================
    // URL
    // ==========================================================

    prepareUrl(
        request,
        endpoint
    ) {

        if (
            !request.url ||
            typeof request.url === "string"
        ) {

            return;

        }


        // ======================================================
        // PATH PARAMETERS
        // ======================================================

        if (
            Array.isArray(
                request.url.path
            )
        ) {

            request.url.path =
                request.url.path.map(
                    segment => {

                        if (
                            segment !== ":id" &&
                            segment !== "<uuid>"
                        ) {

                            return segment;

                        }


                        // -------------------------------
                        // USER
                        // -------------------------------

                        if (
                            endpoint.includes(
                                "/users/"
                            )
                        ) {

                            return "{{userId}}";

                        }


                        // -------------------------------
                        // STORE
                        // -------------------------------

                        if (
                            endpoint.includes(
                                "/stores/"
                            )
                        ) {

                            return "{{storeId}}";

                        }


                        // -------------------------------
                        // PUBLICATION
                        // -------------------------------

                        if (
                            endpoint.includes(
                                "/publications/"
                            )
                        ) {

                            return "{{publicationId}}";

                        }


                        // -------------------------------
                        // INTERACTION
                        // -------------------------------

                        if (
                            endpoint.includes(
                                "/interactions/"
                            )
                        ) {

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
        values
    ) {

        if (
            !request.body ||
            request.body.mode !== "raw"
        ) {

            return;

        }


        let body = null;


        // ======================================================
        // LOGIN
        // ======================================================

        if (
            endpoint.includes(
                "/auth/login"
            )
        ) {

            body = {

                email:
                    "{{testEmail}}",

                password:
                    "{{testPassword}}"

            };

        }


        // ======================================================
        // AI CHAT
        // ======================================================

        else if (
            endpoint.includes(
                "/ai/chat"
            )
        ) {

            body = {

                message:
                    "¿Qué productos existen disponibles?"

            };

        }


        // ======================================================
        // PRODUCT DESCRIPTION
        // ======================================================

        else if (
            endpoint.includes(
                "/ai/product-description"
            )
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
        // INTERACTIONS
        // ======================================================

        else if (
            endpoint.includes(
                "/interactions"
            )
        ) {

            body = {

                publicationId:
                    "{{publicationId}}",

                type:
                    "VIEW",

                metadata:
                    "Prueba automática MCP"

            };

        }


        // ======================================================
        // STORES
        // ======================================================

        else if (
            endpoint.includes(
                "/stores"
            )
        ) {

            body = {

                nombre:
                    "Tienda MCP Test",

                descripcion:
                    "Tienda temporal para pruebas automatizadas",

                categoria:
                    "TECNOLOGIA",

                telefonoContacto:
                    "70000000",

                emailContacto:
                    "{{testEmail}}"

            };

        }


        // ======================================================
        // PUBLICATIONS
        // ======================================================

        else if (
            endpoint.includes(
                "/publications"
            )
        ) {

            body = {

                storeId:
                    "{{storeId}}",

                nombre:
                    "Producto MCP Test",

                descripcion:
                    "Producto generado para pruebas automatizadas",

                precio:
                    100,

                tipo:
                    "PRODUCTO",

                stock:
                    10,

                modalidadCobro:
                    "COMPLETO",

                activa:
                    true

            };

        }


        // ======================================================
        // USERS
        // ======================================================

        else if (
            endpoint.includes(
                "/users"
            )
        ) {

            body = {

                nombre:
                    "Usuario MCP",

                apellidoPaterno:
                    "Test",

                apellidoMaterno:
                    "Automated",

                celular:
                    "70000000",

                facultad:
                    "Ingenieria"

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
    // OBTENER ENDPOINT
    // ==========================================================

    getEndpoint(
        request
    ) {

        if (
            typeof request.url ===
            "string"
        ) {

            return request.url;

        }


        if (
            request.url?.path
        ) {

            return (
                "/" +
                request.url.path.join("/")
            );

        }


        return "";

    }


    // ==========================================================
    // AUTH ENDPOINT
    // ==========================================================

    isAuthEndpoint(
        endpoint
    ) {

        return (

            endpoint.includes(
                "/auth/login"
            ) ||

            endpoint.includes(
                "/auth/register"
            ) ||

            endpoint.includes(
                "/auth/logout"
            )

        );

    }

}


export default new CollectionPreparer();