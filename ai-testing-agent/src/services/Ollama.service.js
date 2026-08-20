import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OllamaService {

    constructor() {

        this.baseURL =
            process.env.OLLAMA_BASE_URL ||
            "http://localhost:11434/v1";

        this.model =
            process.env.OLLAMA_MODEL ||
            "qwen2.5-coder:7b";

        this.client =
            new OpenAI({
                baseURL: this.baseURL,
                apiKey: "ollama"
            });

        console.log(
            `🤖 Ollama configurado: ${this.model}`
        );

        console.log(
            `🔗 Ollama URL: ${this.baseURL}`
        );
    }


    /*
     * ==========================================================
     * LIMPIAR CÓDIGO GENERADO
     * ==========================================================
     *
     * Qwen puede responder:
     *
     * ```javascript
     * import { test, expect } from "@playwright/test";
     * ```
     *
     * El archivo .spec.js necesita únicamente
     * el código JavaScript.
     */
    cleanGeneratedCode(content) {

        if (!content) {

            return "";
        }

        let cleaned =
            content.trim();


        /*
         * Eliminar ```javascript
         */
        cleaned =
            cleaned.replace(
                /^```(?:javascript|js|typescript|ts)?\s*/i,
                ""
            );


        /*
         * Eliminar ```
         */
        cleaned =
            cleaned.replace(
                /\s*```$/i,
                ""
            );


        /*
         * En caso de que Qwen agregue una explicación
         * antes del código, intentamos localizar el inicio
         * de un archivo Playwright.
         */
        const playwrightImportIndex =
            cleaned.indexOf(
                "import { test"
            );


        if (
            playwrightImportIndex > 0
        ) {

            cleaned =
                cleaned.substring(
                    playwrightImportIndex
                );
        }


        return cleaned.trim();
    }


    /*
     * ==========================================================
     * GENERAR CONTENIDO CON QWEN
     * ==========================================================
     */

    async generate(prompt) {

        try {

            const response =
                await this.client
                    .chat
                    .completions
                    .create({

                        model:
                            this.model,

                        messages: [

                            {
                                role:
                                    "system",

                                content:
                                    "You are an expert software engineer " +
                                    "specialized in Playwright and JavaScript. " +
                                    "When asked to generate code, return only " +
                                    "valid executable JavaScript code. " +
                                    "Do not use Markdown fences. " +
                                    "Do not explain the code."

                            },

                            {
                                role:
                                    "user",

                                content:
                                    prompt
                            }

                        ],

                        temperature:
                            0.2

                    });


            const content =
                response
                    ?.choices?.[0]
                    ?.message
                    ?.content;


            /*
             * Validar respuesta.
             */
            if (
                !content ||
                typeof content !== "string"
            ) {

                throw new Error(
                    "Ollama no devolvió contenido en la respuesta."
                );
            }


            /*
             * Limpiar código.
             */
            const cleanedContent =
                this.cleanGeneratedCode(
                    content
                );


            /*
             * Validar después de limpiar.
             */
            if (
                !cleanedContent
            ) {

                throw new Error(
                    "Ollama devolvió una respuesta vacía " +
                    "después de limpiarla."
                );
            }


            return cleanedContent;

        } catch (error) {

            console.error(
                "\n❌ Error comunicando con Ollama/Qwen:"
            );

            console.error(
                error.message
            );


            throw new Error(
                `Error en Ollama/Qwen: ${error.message}`
            );
        }
    }
}


export default new OllamaService();