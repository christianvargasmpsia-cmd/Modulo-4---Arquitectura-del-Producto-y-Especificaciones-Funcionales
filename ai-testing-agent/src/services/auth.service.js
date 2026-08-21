import "dotenv/config";
import axios from "axios";

class AuthService {

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
    // LOGIN
    // ==========================================================

    async login(email, password) {

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


        if (!data?.token) {

            throw new Error(
                "El backend no devolvió un token JWT."
            );

        }


        return {

            token:
                data.token,

            userId:
                data.userId,

            email:
                data.email,

            role:
                data.role

        };

    }


    // ==========================================================
    // LOGIN USUARIO DE PRUEBAS
    // ==========================================================

    async loginTestUser(
        email = process.env.TEST_USER_EMAIL
    ) {

        const password =
            process.env.TEST_USER_PASSWORD;


        if (!email) {

            throw new Error(
                "No se encontró TEST_USER_EMAIL en el archivo .env."
            );

        }


        if (!password) {

            throw new Error(
                "No se encontró TEST_USER_PASSWORD en el archivo .env."
            );

        }


        const auth =
            await this.login(
                email,
                password
            );


        console.log(
            "✓ Login exitoso"
        );

        console.log(
            "  User ID:",
            auth.userId
        );

        console.log(
            "  Role:",
            auth.role
        );


        return auth;

    }

}


export default new AuthService();