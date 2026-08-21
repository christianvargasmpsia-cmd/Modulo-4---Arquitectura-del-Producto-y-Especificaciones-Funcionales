import axios from "axios";
import dotenv from "dotenv";

dotenv.config();


class AuthService {

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
    // GET USERS
    // ==========================================================

    async getUsers() {

        try {

            const response =
                await this.client.get(
                    "/api/users"
                );


            const data =
                response.data;


            // --------------------------------------------------
            // Soportar diferentes respuestas del backend
            // --------------------------------------------------

            if (
                Array.isArray(data)
            ) {

                return data;

            }


            if (
                Array.isArray(
                    data?.data
                )
            ) {

                return data.data;

            }


            if (
                Array.isArray(
                    data?.content
                )
            ) {

                return data.content;

            }


            if (
                Array.isArray(
                    data?.users
                )
            ) {

                return data.users;

            }


            throw new Error(
                "GET /api/users no devolvió una lista de usuarios."
            );

        }
        catch (error) {

            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message;


            throw new Error(
                `Error obteniendo usuarios: ${message}`
            );

        }

    }


    // ==========================================================
    // OBTENER ROLE DEL USUARIO
    // ==========================================================

    getUserRole(
        user
    ) {

        if (!user) {

            return "";

        }


        /*
         * El backend podría devolver el rol
         * directamente o dentro de otro objeto.
         */

        const role =
            user.role ??
            user.rol ??
            user.userRole ??
            user.roleName ??
            user.user?.role ??
            user.user?.rol ??
            null;


        if (
            typeof role === "string"
        ) {

            return role
                .trim()
                .toUpperCase();

        }


        /*
         * Algunos backends devuelven:
         *
         * roles: ["COMPRADOR"]
         *
         * o:
         *
         * roles: [{ name: "COMPRADOR" }]
         */

        if (
            Array.isArray(
                user.roles
            )
        ) {

            const firstRole =
                user.roles[0];


            if (
                typeof firstRole ===
                "string"
            ) {

                return firstRole
                    .trim()
                    .toUpperCase();

            }


            if (
                typeof firstRole ===
                "object"
            ) {

                return String(
                    firstRole?.name ??
                    firstRole?.role ??
                    firstRole?.rol ??
                    ""
                )
                    .trim()
                    .toUpperCase();

            }

        }


        return "";

    }


    // ==========================================================
    // SELECCIONAR COMPRADOR
    // ==========================================================

    selectTestUser(
        users
    ) {

        if (
            !Array.isArray(users)
        ) {

            throw new Error(
                "La lista de usuarios no es válida."
            );

        }


        if (
            users.length === 0
        ) {

            throw new Error(
                "No existen usuarios disponibles para testing."
            );

        }


        console.log(
            `🔎 Analizando ${users.length} usuarios...`
        );


        // ======================================================
        // BUSCAR COMPRADORES
        // ======================================================

        const buyers =
            users.filter(
                user => {

                    const email =
                        typeof user?.email ===
                        "string"
                            ? user.email.trim()
                            : "";


                    const role =
                        this.getUserRole(
                            user
                        );


                    return (
                        email.length > 0 &&
                        role === "COMPRADOR"
                    );

                }
            );


        console.log(
            `✓ Compradores encontrados: ${buyers.length}`
        );


        if (
            buyers.length === 0
        ) {

            /*
             * NO hacemos fallback a ADMIN
             * ni EMPRENDEDOR.
             *
             * El requisito del agente es:
             *
             * LOGIN = COMPRADOR
             */

            throw new Error(
                "No existe ningún usuario COMPRADOR con email válido para testing."
            );

        }


        // ======================================================
        // SELECCIONAR CUALQUIER COMPRADOR
        // ======================================================

        const selectedUser =
            buyers[0];


        return selectedUser;

    }


    // ==========================================================
    // LOGIN NORMAL
    // ==========================================================

    async login(
        email,
        password
    ) {

        if (!email) {

            throw new Error(
                "Email obligatorio para login."
            );

        }


        if (!password) {

            throw new Error(
                "Password obligatorio para login."
            );

        }


        console.log(
            `🔐 Autenticando: ${email}`
        );


        try {

            const response =
                await this.client.post(

                    "/api/auth/login",

                    {

                        email,

                        password

                    }

                );


            const data =
                response.data;


            /*
             * El backend puede responder:
             *
             * {
             *   token,
             *   userId,
             *   email,
             *   role
             * }
             *
             * o:
             *
             * {
             *   data: {
             *      token,
             *      ...
             *   }
             * }
             */

            const result =
                data?.data &&
                typeof data.data ===
                "object"

                    ? data.data

                    : data;


            // ==================================================
            // TOKEN
            // ==================================================

            const token =
                result?.token ??
                result?.accessToken ??
                result?.jwt ??
                null;


            if (!token) {

                throw new Error(
                    "El login no devolvió un JWT."
                );

            }


            // ==================================================
            // USER ID
            // ==================================================

            const userId =
                result?.userId ??
                result?.id ??
                result?.user?.id ??
                null;


            // ==================================================
            // EMAIL
            // ==================================================

            const resultEmail =
                result?.email ??
                result?.user?.email ??
                email;


            // ==================================================
            // ROLE
            // ==================================================

            let role =
                result?.role ??
                result?.rol ??
                result?.user?.role ??
                result?.user?.rol ??
                null;


            if (
                !role &&
                Array.isArray(
                    result?.roles
                )
            ) {

                role =
                    typeof result.roles[0] ===
                    "string"

                        ? result.roles[0]

                        : result.roles[0]?.name ??
                          result.roles[0]?.role ??
                          null;

            }


            if (
                typeof role ===
                "string"
            ) {

                role =
                    role
                        .trim()
                        .toUpperCase();

            }


            // ==================================================
            // RESULTADO
            // ==================================================

            console.log(
                "✓ Login exitoso"
            );

            console.log(
                `  User ID: ${userId ?? "N/A"}`
            );

            console.log(
                `  Role: ${role ?? "N/A"}`
            );


            return {

                success: true,

                userId,

                email:
                    resultEmail,

                role,

                token

            };

        }
        catch (error) {

            const status =
                error.response?.status;


            const backendMessage =
                error.response?.data?.message ??
                error.response?.data?.error ??
                null;


            console.error(
                "❌ Login fallido"
            );


            if (
                status
            ) {

                console.error(
                    `  HTTP Status: ${status}`
                );

            }


            if (
                backendMessage
            ) {

                console.error(
                    `  Backend: ${backendMessage}`
                );

            }


            throw new Error(
                backendMessage ??
                error.message ??
                "Error realizando login."
            );

        }

    }


    // ==========================================================
    // LOGIN AUTOMÁTICO PARA TESTING
    // ==========================================================

    async loginTestUser() {

        /*
         * ======================================================
         * REGLA DEFINITIVA DEL TESTING
         * ======================================================
         *
         * 1. Buscar usuarios
         * 2. Filtrar COMPRADOR
         * 3. Tomar cualquier email
         * 4. Password = 12345678
         * 5. Login
         * 6. Obtener JWT
         *
         * NO:
         *
         * - TEST_USER_EMAIL
         * - usuario fijo
         * - ADMIN
         * - EMPRENDEDOR
         * - buscar interactions
         */

        const password =
            "12345678";


        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "🔐 AUTENTICACIÓN DE TESTING"
        );

        console.log(
            "=================================================="
        );


        // ======================================================
        // 1. OBTENER USUARIOS
        // ======================================================

        console.log(
            "\n[AUTH 1/3] Obteniendo usuarios..."
        );


        const users =
            await this.getUsers();


        console.log(
            `✓ Usuarios encontrados: ${users.length}`
        );


        // ======================================================
        // 2. SELECCIONAR COMPRADOR
        // ======================================================

        console.log(
            "\n[AUTH 2/3] Buscando usuario COMPRADOR..."
        );


        const selectedUser =
            this.selectTestUser(
                users
            );


        const selectedUserId =
            selectedUser.id ??
            selectedUser.userId ??
            null;


        console.log(
            `✓ Comprador seleccionado: ${selectedUser.email}`
        );


        console.log(
            `✓ User ID: ${selectedUserId ?? "N/A"}`
        );


        console.log(
            "✓ Password: 12345678"
        );


        // ======================================================
        // 3. LOGIN
        // ======================================================

        console.log(
            "\n[AUTH 3/3] Ejecutando login..."
        );


        const result =
            await this.login(
                selectedUser.email,
                password
            );


        // ======================================================
        // VALIDAR ROLE
        // ======================================================

        if (
            result.role &&
            result.role !== "COMPRADOR"
        ) {

            throw new Error(
                `El login devolvió un rol inesperado: ${result.role}. ` +
                `Se esperaba COMPRADOR.`
            );

        }


        // ======================================================
        // VALIDAR USER ID
        // ======================================================

        if (
            selectedUserId &&
            result.userId &&
            selectedUserId !==
            result.userId
        ) {

            throw new Error(

                "El User ID del login no coincide con " +
                "el usuario seleccionado. " +

                `Esperado: ${selectedUserId}. ` +

                `Recibido: ${result.userId}.`

            );

        }


        // ======================================================
        // VALIDAR JWT
        // ======================================================

        if (
            !result.token
        ) {

            throw new Error(
                "El login no devolvió JWT."
            );

        }


        console.log("");

        console.log(
            "=================================================="
        );

        console.log(
            "✅ AUTENTICACIÓN COMPLETADA"
        );

        console.log(
            "=================================================="
        );

        console.log(
            `EMAIL : ${result.email}`
        );

        console.log(
            `ROLE  : ${result.role}`
        );

        console.log(
            `USER  : ${result.userId}`
        );

        console.log(
            "JWT   : OK"
        );


        // ======================================================
        // DEVOLVER DATOS
        // ======================================================

        return {

            success: true,

            userId:
                result.userId ??
                selectedUserId,

            email:
                result.email ??
                selectedUser.email,

            role:
                result.role ??
                "COMPRADOR",

            token:
                result.token,

            password

        };

    }

}


// ==========================================================
// EXPORT
// ==========================================================

export default new AuthService();