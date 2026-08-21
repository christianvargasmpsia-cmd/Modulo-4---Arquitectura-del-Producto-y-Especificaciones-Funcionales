import axios from "axios";
import authService from "./auth.service.js";

class DataDiscoveryService {

    constructor() {

        this.client = axios.create({
            baseURL: "http://localhost:8080",
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 15000
        });

    }


    // ==========================================================
    // USERS
    // ==========================================================

    async getUsers() {

        const response =
            await this.client.get(
                "/api/users"
            );

        return response.data ?? [];

    }


    // ==========================================================
    // STORES
    // ==========================================================

    async getStores() {

        const response =
            await this.client.get(
                "/api/stores"
            );

        return response.data ?? [];

    }


    // ==========================================================
    // PUBLICATIONS
    // ==========================================================

    async getPublications(
        params = {}
    ) {

        const response =
            await this.client.get(
                "/api/publications",
                {
                    params
                }
            );

        return response.data ?? [];

    }


    // ==========================================================
    // INTERACTIONS AUTENTICADAS
    // ==========================================================

    async getInteractions(token) {

        if (!token) {

            throw new Error(
                "No existe JWT para consultar las interacciones."
            );

        }

        const response =
            await this.client.get(
                "/api/interactions",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data ?? [];

    }


    // ==========================================================
    // CREAR INTERACTION
    // ==========================================================

    async createInteraction(
        token,
        publicationId,
        type = "VIEW",
        metadata = "AI Testing Agent"
    ) {

        if (!token) {

            throw new Error(
                "No existe JWT para crear la interacción."
            );

        }

        if (!publicationId) {

            throw new Error(
                "publicationId es obligatorio para crear una interacción."
            );

        }

        const response =
            await this.client.post(
                "/api/interactions",
                {
                    publicationId,
                    type,
                    metadata
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;

    }


    // ==========================================================
    // OBTENER INTERACTION POR ID
    // ==========================================================

    async getInteractionById(
        token,
        interactionId
    ) {

        if (!token) {

            throw new Error(
                "No existe JWT para consultar la interacción."
            );

        }

        if (!interactionId) {

            throw new Error(
                "interactionId es obligatorio."
            );

        }

        const response =
            await this.client.get(
                `/api/interactions/${interactionId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;

    }


    // ==========================================================
    // DESCUBRIMIENTO COMPLETO
    // ==========================================================

    async discover() {

        console.log(
            "\n================================="
        );

        console.log(
            "DISCOVERY - TEST DATA"
        );

        console.log(
            "=================================\n"
        );


        // ======================================================
        // USERS
        // ======================================================

        console.log(
            "Descubriendo Users..."
        );

        const users =
            await this.getUsers();

        console.log(
            `✓ Users encontrados: ${users.length}`
        );


        // ======================================================
        // STORES
        // ======================================================

        console.log(
            "Descubriendo Stores..."
        );

        const stores =
            await this.getStores();

        console.log(
            `✓ Stores encontrados: ${stores.length}`
        );


        // ======================================================
        // PUBLICATIONS
        // ======================================================

        console.log(
            "Descubriendo Publications..."
        );

        const publications =
            await this.getPublications();

        console.log(
            `✓ Publications encontrados: ${publications.length}`
        );


        // ======================================================
        // SELECCIONAR USER
        // ======================================================

        const selectedUser =
            users.find(
                user =>
                    user.email ===
                    "daniela.fernandez.test@umss.edu.bo"
            )
            ??
            users.find(
                user =>
                    user.email?.includes(
                        "test@umss.edu.bo"
                    )
            )
            ??
            users[0];


        if (!selectedUser) {

            throw new Error(
                "No se encontró ningún usuario para ejecutar las pruebas."
            );

        }


        // ======================================================
        // SELECCIONAR STORE
        // ======================================================

        const selectedStore =
            stores[0] ?? null;


        // ======================================================
        // SELECCIONAR PUBLICATION
        // ======================================================

        const selectedPublication =
            publications[0] ?? null;


        if (!selectedPublication) {

            throw new Error(
                "No se encontró ninguna publicación para ejecutar las pruebas."
            );

        }


        console.log(
            "\n================================="
        );

        console.log(
            "DATOS SELECCIONADOS"
        );

        console.log(
            "=================================\n"
        );


        console.log(
            "USER:",
            selectedUser.email
        );

        console.log(
            "STORE:",
            selectedStore?.nombre ??
            "N/A"
        );

        console.log(
            "PUBLICATION:",
            selectedPublication.nombre
        );


        // ======================================================
        // LOGIN
        // ======================================================

        console.log(
            "\n================================="
        );

        console.log(
            "AUTENTICACIÓN"
        );

        console.log(
            "=================================\n"
        );


        /*
         * IMPORTANTE:
         *
         * La contraseña NO debe estar escrita aquí.
         *
         * authService debe obtenerla desde configuración
         * segura (.env).
         */

        const auth =
            await authService.loginTestUser(
                selectedUser.email
            );


        if (!auth?.token) {

            throw new Error(
                "El login no devolvió un JWT."
            );

        }


        console.log(
            "✓ Login exitoso"
        );

        console.log(
            "  Usuario:",
            auth.email
        );

        console.log(
            "  Role:",
            auth.role
        );

        console.log(
            "  User ID:",
            auth.userId
        );


        // ======================================================
        // GET INTERACTIONS AUTENTICADO
        // ======================================================

        console.log(
            "\nDescubriendo Interactions..."
        );

        let interactions = [];

        try {

            interactions =
                await this.getInteractions(
                    auth.token
                );

            console.log(
                `✓ Interactions encontrados: ${interactions.length}`
            );

        }
        catch (error) {

            console.log(
                "⚠ No fue posible obtener las interacciones."
            );

            console.log(
                `  HTTP: ${
                    error.response?.status ??
                    "N/A"
                }`
            );

            console.log(
                `  ${
                    error.response?.data
                        ? JSON.stringify(
                            error.response.data
                        )
                        : error.message
                }`
            );

        }


        // ======================================================
        // BUSCAR INTERACTION EXISTENTE
        // ======================================================

        let selectedInteraction =
            interactions.find(
                interaction =>
                    interaction.publicationId ===
                    selectedPublication.id
            )
            ??
            null;


        // ======================================================
        // CREAR INTERACTION SI NO EXISTE
        // ======================================================

        if (!selectedInteraction) {

            console.log(
                "\nNo existe una interacción para la publicación seleccionada."
            );

            console.log(
                "Creando Interaction VIEW..."
            );


            selectedInteraction =
                await this.createInteraction(
                    auth.token,
                    selectedPublication.id,
                    "VIEW",
                    `AI Testing Agent - ${selectedPublication.nombre}`
                );


            console.log(
                "✓ Interaction creada:",
                selectedInteraction.id
            );

        }
        else {

            console.log(
                "\n✓ Interaction existente encontrada:",
                selectedInteraction.id
            );

        }


        // ======================================================
        // VERIFICAR INTERACTION
        // ======================================================

        let verifiedInteraction = null;

        try {

            verifiedInteraction =
                await this.getInteractionById(
                    auth.token,
                    selectedInteraction.id
                );

            console.log(
                "✓ Interaction verificada:",
                verifiedInteraction.id
            );

        }
        catch (error) {

            console.log(
                "⚠ No se pudo verificar la Interaction."
            );

            console.log(
                `  HTTP: ${
                    error.response?.status ??
                    "N/A"
                }`
            );

        }


        // ======================================================
        // CONTEXTO FINAL
        // ======================================================

        const context = {

            users,

            stores,

            publications,

            interactions,

            selected: {

                user:
                    selectedUser,

                store:
                    selectedStore,

                publication:
                    selectedPublication,

                interaction:
                    verifiedInteraction ??
                    selectedInteraction

            },

            auth: {

                token:
                    auth.token,

                userId:
                    auth.userId,

                email:
                    auth.email,

                role:
                    auth.role

            },

            ids: {

                userId:
                    auth.userId ??
                    selectedUser.id ??
                    null,

                storeId:
                    selectedStore?.id ??
                    null,

                publicationId:
                    selectedPublication.id ??
                    null,

                interactionId:
                    (
                        verifiedInteraction ??
                        selectedInteraction
                    )?.id ??
                    null

            }

        };


        // ======================================================
        // RESULTADO
        // ======================================================

        console.log(
            "\n================================="
        );

        console.log(
            "DATOS DESCUBIERTOS"
        );

        console.log(
            "=================================\n"
        );


        console.log(
            "USER_ID       :",
            context.ids.userId
        );

        console.log(
            "STORE_ID      :",
            context.ids.storeId
        );

        console.log(
            "PUBLICATION_ID:",
            context.ids.publicationId
        );

        console.log(
            "INTERACTION_ID:",
            context.ids.interactionId
        );


        console.log(
            "\n================================="
        );

        console.log(
            "DATOS SELECCIONADOS"
        );

        console.log(
            "=================================\n"
        );


        console.log(
            "USER:",
            selectedUser.email
        );

        console.log(
            "STORE:",
            selectedStore?.nombre ??
            "N/A"
        );

        console.log(
            "PUBLICATION:",
            selectedPublication.nombre
        );

        console.log(
            "INTERACTION:",
            context.ids.interactionId
        );


        return context;

    }

}


export default new DataDiscoveryService();