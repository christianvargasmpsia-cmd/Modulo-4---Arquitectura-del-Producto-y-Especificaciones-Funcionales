import axios from "axios";
import authService from "./auth.service.js";
import dotenv from "dotenv";

dotenv.config();


class DataDiscoveryService {

    constructor() {

        this.client = axios.create({

            baseURL:
                process.env.PLAYWRIGHT_API_BASE_URL ||
                process.env.API_BASE_URL ||
                "http://localhost:8080",

            headers: {

                "Content-Type":
                    "application/json"

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


        return this.normalizeList(
            response.data
        );

    }


    // ==========================================================
    // STORES
    // ==========================================================

    async getStores() {

        const response =
            await this.client.get(
                "/api/stores"
            );


        return this.normalizeList(
            response.data
        );

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


        return this.normalizeList(
            response.data
        );

    }


    // ==========================================================
    // INTERACTIONS
    // ==========================================================

    async getInteractions(
        token
    ) {

        if (!token) {

            throw new Error(
                "JWT obligatorio para GET /api/interactions."
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


        return this.normalizeList(
            response.data
        );

    }


    // ==========================================================
    // INTERACTION BY ID
    // ==========================================================

    async getInteractionById(
        interactionId,
        token
    ) {

        if (!interactionId) {

            throw new Error(
                "interactionId obligatorio."
            );

        }


        if (!token) {

            throw new Error(
                "JWT obligatorio."
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


        return response.data ?? null;

    }


    // ==========================================================
    // NORMALIZAR LISTAS
    // ==========================================================

    normalizeList(
        data
    ) {

        if (
            Array.isArray(data)
        ) {

            return data;

        }


        if (
            Array.isArray(data?.data)
        ) {

            return data.data;

        }


        if (
            Array.isArray(data?.content)
        ) {

            return data.content;

        }


        if (
            Array.isArray(data?.items)
        ) {

            return data.items;

        }


        if (
            Array.isArray(data?.users)
        ) {

            return data.users;

        }


        if (
            Array.isArray(data?.stores)
        ) {

            return data.stores;

        }


        if (
            Array.isArray(data?.publications)
        ) {

            return data.publications;

        }


        if (
            Array.isArray(data?.interactions)
        ) {

            return data.interactions;

        }


        return [];

    }


    // ==========================================================
    // OBTENER ROL NORMALIZADO
    // ==========================================================

    getUserRole(
        user
    ) {

        const role =
            user?.role ??
            user?.rol ??
            user?.roleName ??
            user?.rolNombre ??
            user?.roles?.[0]?.name ??
            user?.roles?.[0]?.nombre ??
            "";


        return String(
            role
        )
            .trim()
            .toUpperCase();

    }


    // ==========================================================
    // OBTENER USER ID
    // ==========================================================

    getUserId(
        user
    ) {

        return (

            user?.id ??
            user?.userId ??
            user?.usuarioId ??
            null

        );

    }


    // ==========================================================
    // OBTENER INTERACTION USER ID
    // ==========================================================

    getInteractionUserId(
        interaction
    ) {

        return (

            interaction?.userId ??
            interaction?.usuarioId ??
            interaction?.user?.id ??
            interaction?.usuario?.id ??
            null

        );

    }


    // ==========================================================
    // OBTENER PUBLICATION ID
    // ==========================================================

    getInteractionPublicationId(
        interaction
    ) {

        return (

            interaction?.publicationId ??
            interaction?.publicacionId ??
            interaction?.publication?.id ??
            interaction?.publicacion?.id ??
            null

        );

    }


    // ==========================================================
    // LOGIN DE USUARIO
    // ==========================================================

    async loginUser(
        email,
        password
    ) {

        console.log("");

        console.log(
            `🔐 Intentando login: ${email}`
        );


        try {

            const auth =
                await authService.login(
                    email,
                    password
                );


            if (!auth?.token) {

                console.log(
                    "   ⚠️ Login sin JWT."
                );

                return null;

            }


            const role =
                String(
                    auth.role ?? ""
                )
                    .trim()
                    .toUpperCase();


            if (
                role !== "COMPRADOR"
            ) {

                console.log(
                    `   ⚠️ Rol rechazado: ${role || "N/A"}`
                );

                return null;

            }


            console.log(
                "   ✓ Login exitoso"
            );

            console.log(
                `   User ID: ${auth.userId}`
            );

            console.log(
                `   Role   : ${auth.role}`
            );

            console.log(
                "   JWT    : OK"
            );


            return auth;

        }
        catch (error) {

            const message =
                error?.response?.data?.message ??
                error?.message ??
                "Error desconocido";


            console.log(
                "   ⚠️ Login fallido"
            );

            console.log(
                `   ${message}`
            );


            return null;

        }

    }


    // ==========================================================
    // BUSCAR COMPRADOR CON INTERACTION
    //
    // ESTA ES LA CORRECCIÓN PRINCIPAL.
    //
    // NO seleccionamos simplemente el primer comprador.
    //
    // Probamos:
    //
    // comprador
    //   ↓
    // login
    //   ↓
    // GET interactions
    //   ↓
    // ¿tiene interaction?
    //
    // ==========================================================

    async discoverBuyerWithInteraction(
        users
    ) {

        const password =
            process.env.TEST_USER_PASSWORD ||
            "12345678";


        const buyers =
            users.filter(
                user =>
                    this.getUserRole(
                        user
                    ) === "COMPRADOR"
            );


        if (
            buyers.length === 0
        ) {

            throw new Error(
                "No existen usuarios con rol COMPRADOR."
            );

        }


        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "🔎 BUSCANDO COMPRADOR CON INTERACTION"
        );

        console.log(
            "=================================================="
        );


        console.log(
            `Compradores disponibles: ${buyers.length}`
        );


        let fallback = null;


        for (
            let index = 0;
            index < buyers.length;
            index++
        ) {

            const user =
                buyers[index];


            const email =
                user?.email;


            const userId =
                this.getUserId(
                    user
                );


            if (!email) {

                console.log(
                    `\n[${index + 1}/${buyers.length}] Usuario sin email. Saltando...`
                );

                continue;

            }


            console.log("");

            console.log(
                `--- Comprador ${index + 1}/${buyers.length} ---`
            );

            console.log(
                `Email: ${email}`
            );

            console.log(
                `User ID: ${userId ?? "N/A"}`
            );


            // ==================================================
            // LOGIN
            // ==================================================

            const auth =
                await this.loginUser(
                    email,
                    password
                );


            if (!auth) {

                console.log(
                    "   → Se prueba el siguiente comprador."
                );

                continue;

            }


            // ==================================================
            // GUARDAR FALLBACK
            //
            // Si nadie tiene interactions,
            // al menos tendremos un comprador
            // correctamente autenticado.
            // ==================================================

            if (!fallback) {

                fallback = {

                    user,

                    auth,

                    interactions: []

                };

            }


            // ==================================================
            // CONSULTAR INTERACTIONS
            // ==================================================

            console.log(
                "   🔎 Consultando interactions..."
            );


            let interactions = [];


            try {

                interactions =
                    await this.getInteractions(
                        auth.token
                    );


            }
            catch (error) {

                console.log(
                    "   ⚠️ No se pudieron consultar interactions."
                );

                console.log(
                    `   ${error.message}`
                );

                continue;

            }


            console.log(
                `   ✓ Interactions encontradas: ${interactions.length}`
            );


            // ==================================================
            // BUSCAR INTERACTION DEL USUARIO
            // ==================================================

            const ownInteraction =
                interactions.find(
                    interaction => {

                        const interactionUserId =
                            this.getInteractionUserId(
                                interaction
                            );


                        return (

                            interactionUserId &&
                            String(
                                interactionUserId
                            ) ===
                            String(
                                auth.userId
                            )

                        );

                    }
                )
                ?? null;


            // ==================================================
            // SI TIENE INTERACTION
            // ==================================================

            if (
                ownInteraction
            ) {

                console.log("");

                console.log(
                    "🎯 COMPRADOR IDEAL ENCONTRADO"
                );

                console.log(
                    `   Email          : ${auth.email}`
                );

                console.log(
                    `   Role           : ${auth.role}`
                );

                console.log(
                    `   User ID        : ${auth.userId}`
                );

                console.log(
                    `   Interaction ID : ${ownInteraction.id}`
                );


                return {

                    user,

                    auth,

                    interactions,

                    interaction:
                        ownInteraction

                };

            }


            console.log(
                "   ⚠️ Este comprador no tiene interactions."
            );

            console.log(
                "   → Probando siguiente comprador..."

            );

        }


        // ======================================================
        // NINGÚN COMPRADOR TIENE INTERACTION
        //
        // PERO TENEMOS LOGIN VÁLIDO.
        //
        // NO FALLAMOS DISCOVERY.
        // ======================================================

        if (
            fallback
        ) {

            console.log("");

            console.log(
                "⚠️ NINGÚN COMPRADOR TIENE INTERACTIONS"
            );

            console.log(
                "   Se utilizará el primer comprador autenticado."
            );

            console.log(
                "   interactionId = null"
            );

            console.log(
                "   La Collection podrá crear una interaction."
            );


            return {

                user:
                    fallback.user,

                auth:
                    fallback.auth,

                interactions:
                    [],

                interaction:
                    null

            };

        }


        throw new Error(
            "No fue posible autenticar ningún usuario COMPRADOR."
        );

    }


    // ==========================================================
    // SELECCIONAR STORE
    // ==========================================================

    selectStore(
        stores,
        publication = null
    ) {

        if (
            !Array.isArray(stores) ||
            stores.length === 0
        ) {

            return null;

        }


        // ======================================================
        // INTENTAR STORE RELACIONADO CON PUBLICATION
        // ======================================================

        const publicationStoreId =

            publication?.storeId ??
            publication?.store?.id ??
            publication?.tiendaId ??
            publication?.store?.storeId ??
            null;


        if (
            publicationStoreId
        ) {

            const relatedStore =
                stores.find(
                    store => {

                        const storeId =
                            store?.id ??
                            store?.storeId ??
                            null;


                        return (

                            String(
                                storeId
                            ) ===
                            String(
                                publicationStoreId
                            )

                        );

                    }
                );


            if (
                relatedStore
            ) {

                return relatedStore;

            }

        }


        // ======================================================
        // STORE ACTIVO
        // ======================================================

        const activeStore =
            stores.find(
                store => {

                    const status =
                        String(
                            store?.status ??
                            ""
                        )
                            .trim()
                            .toUpperCase();


                    return (

                        status ===
                        "ACTIVO" ||

                        status ===
                        "ACTIVE"

                    );

                }
            );


        return (

            activeStore ??
            stores[0]

        );

    }


    // ==========================================================
    // SELECCIONAR PUBLICATION
    // ==========================================================

    selectPublication(
        publications,
        interaction = null
    ) {

        if (
            !Array.isArray(
                publications
            ) ||
            publications.length === 0
        ) {

            return null;

        }


        // ======================================================
        // 1. PUBLICATION DE INTERACTION
        // ======================================================

        const interactionPublicationId =
            this.getInteractionPublicationId(
                interaction
            );


        if (
            interactionPublicationId
        ) {

            const relatedPublication =
                publications.find(
                    publication => {

                        const id =
                            publication?.id ??
                            publication?.publicationId ??
                            null;


                        return (

                            String(id) ===
                            String(
                                interactionPublicationId
                            )

                        );

                    }
                );


            if (
                relatedPublication
            ) {

                return relatedPublication;

            }

        }


        // ======================================================
        // 2. PUBLICATION ACTIVA
        // ======================================================

        const activePublication =
            publications.find(
                publication => {

                    if (
                        publication?.activa ===
                        true
                    ) {

                        return true;

                    }


                    const status =
                        String(
                            publication?.status ??
                            ""
                        )
                            .trim()
                            .toUpperCase();


                    return (

                        status ===
                        "ACTIVO" ||

                        status ===
                        "ACTIVE"

                    );

                }
            );


        return (

            activePublication ??
            publications[0]

        );

    }


    // ==========================================================
    // DISCOVERY COMPLETO
    // ==========================================================

    async discover() {

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "🔍 DATA DISCOVERY"
        );

        console.log(
            "=================================================="
        );


        // ======================================================
        // 1. USERS
        // ======================================================

        console.log("");

        console.log(
            "[1/5] Descubriendo Users..."
        );


        const users =
            await this.getUsers();


        console.log(
            `      ✓ Users encontrados: ${users.length}`
        );


        if (
            users.length === 0
        ) {

            throw new Error(
                "No existen usuarios en el backend."
            );

        }


        // ======================================================
        // 2. STORES
        // ======================================================

        console.log("");

        console.log(
            "[2/5] Descubriendo Stores..."
        );


        const stores =
            await this.getStores();


        console.log(
            `      ✓ Stores encontrados: ${stores.length}`
        );


        if (
            stores.length === 0
        ) {

            throw new Error(
                "No existen stores en el backend."
            );

        }


        // ======================================================
        // 3. PUBLICATIONS
        // ======================================================

        console.log("");

        console.log(
            "[3/5] Descubriendo Publications..."
        );


        const publications =
            await this.getPublications();


        console.log(
            `      ✓ Publications encontrados: ${publications.length}`
        );


        if (
            publications.length === 0
        ) {

            throw new Error(
                "No existen publications en el backend."
            );

        }


        // ======================================================
        // 4. AUTENTICACIÓN + INTERACTION
        // ======================================================

        console.log("");

        console.log(
            "[4/5] Buscando comprador con datos válidos..."
        );


        const discovered =
            await this.discoverBuyerWithInteraction(
                users
            );


        const auth =
            discovered.auth;


        const selectedUser =
            discovered.user;


        const interactions =
            discovered.interactions;


        const selectedInteraction =
            discovered.interaction;


        // ======================================================
        // 5. DATOS RELACIONADOS
        // ======================================================

        console.log("");

        console.log(
            "[5/5] Seleccionando Store y Publication..."
        );


        const selectedPublication =
            this.selectPublication(

                publications,

                selectedInteraction

            );


        if (
            !selectedPublication
        ) {

            throw new Error(
                "No se pudo seleccionar una publication."
            );

        }


        const selectedStore =
            this.selectStore(

                stores,

                selectedPublication

            );


        if (
            !selectedStore
        ) {

            throw new Error(
                "No se pudo seleccionar un store."
            );

        }


        // ======================================================
        // IDS
        // ======================================================

        const userId =
            auth.userId ??
            this.getUserId(
                selectedUser
            );


        const storeId =
            selectedStore?.id ??
            selectedStore?.storeId ??
            null;


        const publicationId =
            selectedPublication?.id ??
            selectedPublication?.publicationId ??
            null;


        const interactionId =
            selectedInteraction?.id ??
            selectedInteraction?.interactionId ??
            null;


        // ======================================================
        // DATOS DESCUBIERTOS
        // ======================================================

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "✅ DATOS DESCUBIERTOS"
        );

        console.log(
            "=================================================="
        );


        console.log(
            `USER_ID        : ${userId ?? "N/A"}`
        );

        console.log(
            `STORE_ID       : ${storeId ?? "N/A"}`
        );

        console.log(
            `PUBLICATION_ID : ${publicationId ?? "N/A"}`
        );

        console.log(
            `INTERACTION_ID : ${interactionId ?? "N/A"}`
        );

        console.log(
            `EMAIL          : ${auth.email ?? "N/A"}`
        );

        console.log(
            `ROLE           : ${auth.role ?? "N/A"}`
        );

        console.log(
            `JWT            : ${auth.token ? "OK" : "NO"}`
        );


        // ======================================================
        // DATOS SELECCIONADOS
        // ======================================================

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "DATOS SELECCIONADOS"
        );

        console.log(
            "=================================================="
        );


        console.log(
            `USER: ${
                selectedUser?.email ??
                auth.email ??
                "N/A"
            }`
        );


        console.log(
            `STORE: ${
                selectedStore?.nombre ??
                selectedStore?.name ??
                storeId ??
                "N/A"
            }`
        );


        console.log(
            `PUBLICATION: ${
                selectedPublication?.nombre ??
                selectedPublication?.name ??
                publicationId ??
                "N/A"
            }`
        );


        console.log(
            `INTERACTION: ${
                interactionId ??
                "N/A"
            }`
        );


        // ======================================================
        // AVISO SI NO HAY INTERACTION
        // ======================================================

        if (
            !interactionId
        ) {

            console.log("");

            console.log(
                "⚠️ No existe interaction disponible."
            );

            console.log(
                "   Esto NO detiene Discovery."
            );

            console.log(
                "   POST /api/interactions deberá crearla."
            );

        }


        // ======================================================
        // CONTEXTO FINAL
        // ======================================================

        const context = {

            auth: {

                token:
                    auth.token,

                userId:
                    userId,

                email:
                    auth.email,

                role:
                    auth.role

            },


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
                    selectedInteraction

            },


            ids: {

                userId,

                storeId,

                publicationId,

                interactionId

            }

        };


        // ======================================================
        // VALIDACIONES OBLIGATORIAS
        // ======================================================

        if (
            !context.ids.userId
        ) {

            throw new Error(
                "Discovery no obtuvo userId."
            );

        }


        if (
            !context.ids.storeId
        ) {

            throw new Error(
                "Discovery no obtuvo storeId."
            );

        }


        if (
            !context.ids.publicationId
        ) {

            throw new Error(
                "Discovery no obtuvo publicationId."
            );

        }


        if (
            !context.auth.token
        ) {

            throw new Error(
                "Discovery no obtuvo JWT."
            );

        }


        // ======================================================
        // INTERACTION NO OBLIGATORIA
        // ======================================================

        if (
            !context.ids.interactionId
        ) {

            console.log("");

            console.log(
                "ℹ️ interactionId = null"
            );

            console.log(
                "ℹ️ Se permitirá que Newman cree una interaction."
            );

        }


        // ======================================================
        // FINAL
        // ======================================================

        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "🎯 DISCOVERY COMPLETADO"
        );

        console.log(
            "=================================================="
        );


        return context;

    }

}


export default new DataDiscoveryService();