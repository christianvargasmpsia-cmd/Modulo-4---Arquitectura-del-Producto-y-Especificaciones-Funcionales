import axios from "axios";
import crypto from "crypto";


class TestDataService {

    constructor() {

        this.baseUrl =
            process.env.PLAYWRIGHT_API_BASE_URL ||
            "http://localhost:8080";

        this.api =
            axios.create({
                baseURL: this.baseUrl,
                headers: {
                    "Content-Type":
                        "application/json"
                }
            });

        this.data = {
            token: null,
            userId: null,
            storeId: null,
            publicationId: null,
            interactionId: null
        };

    }


    // ==========================================================
    // INICIALIZAR DATOS
    // ==========================================================

    async initialize() {

        console.log(
            "\n================================="
        );

        console.log(
            "Preparando datos de prueba"
        );

        console.log(
            "=================================\n"
        );


        await this.loadUsers();

        await this.loadStores();

        await this.loadPublications();

        await this.login();


        console.log(
            "\n✓ Datos de prueba preparados"
        );

        console.log(
            `  userId        : ${this.data.userId}`
        );

        console.log(
            `  storeId       : ${this.data.storeId}`
        );

        console.log(
            `  publicationId : ${this.data.publicationId}`
        );

        console.log(
            `  token         : ${this.data.token ? "OK" : "NO"}`
        );


        return this.data;

    }


    // ==========================================================
    // USUARIOS
    // ==========================================================

    async loadUsers() {

        try {

            const response =
                await this.api.get(
                    "/api/users"
                );

            const users =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.content ||
                      response.data?.users ||
                      [];

            if (users.length > 0) {

                this.data.userId =
                    users[0].id;

                console.log(
                    `✓ Usuario real encontrado: ${this.data.userId}`
                );

            }

        } catch (error) {

            console.log(
                "⚠ No se pudieron obtener usuarios:",
                error.response?.status ||
                error.message
            );

        }

    }


    // ==========================================================
    // STORES
    // ==========================================================

    async loadStores() {

        try {

            const response =
                await this.api.get(
                    "/api/stores"
                );

            const stores =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.content ||
                      response.data?.stores ||
                      [];

            if (stores.length > 0) {

                this.data.storeId =
                    stores[0].id;

                if (!this.data.userId) {

                    this.data.userId =
                        stores[0].userId;

                }

                console.log(
                    `✓ Tienda real encontrada: ${this.data.storeId}`
                );

            }

        } catch (error) {

            console.log(
                "⚠ No se pudieron obtener tiendas:",
                error.response?.status ||
                error.message
            );

        }

    }


    // ==========================================================
    // PUBLICACIONES
    // ==========================================================

    async loadPublications() {

        try {

            const response =
                await this.api.get(
                    "/api/publications"
                );

            const publications =
                Array.isArray(response.data)
                    ? response.data
                    : response.data?.content ||
                      response.data?.publications ||
                      [];

            if (publications.length > 0) {

                this.data.publicationId =
                    publications[0].id;

                if (!this.data.storeId) {

                    this.data.storeId =
                        publications[0].storeId;

                }

                console.log(
                    `✓ Publicación real encontrada: ${this.data.publicationId}`
                );

            }

        } catch (error) {

            console.log(
                "⚠ No se pudieron obtener publicaciones:",
                error.response?.status ||
                error.message
            );

        }

    }


    // ==========================================================
    // LOGIN
    // ==========================================================

    async login() {

        const email =
            process.env.TEST_USER_EMAIL ||
            "daniela.fernandez.test@umss.edu.bo";

        const password =
            process.env.TEST_USER_PASSWORD ||
            "12345678";


        try {

            const response =
                await this.api.post(
                    "/api/auth/login",
                    {
                        email,
                        password
                    }
                );


            const token =
                response.data?.token ||
                response.data?.accessToken ||
                response.data?.jwt;


            if (token) {

                this.data.token =
                    token;

                console.log(
                    "✓ Login de prueba exitoso"
                );

            } else {

                console.log(
                    "⚠ Login respondió pero no devolvió token"
                );

            }

        } catch (error) {

            console.log(
                "⚠ Login de prueba falló:",
                error.response?.status ||
                error.message
            );

        }

    }


    // ==========================================================
    // VALORES
    // ==========================================================

    get() {

        return {

            token:
                this.data.token ||
                "",

            userId:
                this.data.userId ||
                crypto.randomUUID(),

            storeId:
                this.data.storeId ||
                crypto.randomUUID(),

            publicationId:
                this.data.publicationId ||
                crypto.randomUUID(),

            interactionId:
                this.data.interactionId ||
                crypto.randomUUID(),

            email:
                process.env.TEST_USER_EMAIL ||
                "daniela.fernandez.test@umss.edu.bo",

            password:
                process.env.TEST_USER_PASSWORD ||
                "12345678"

        };

    }

}


export default new TestDataService();