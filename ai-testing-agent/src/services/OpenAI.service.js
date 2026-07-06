import OpenAI from "openai";
import dotenv from "dotenv";

import { Models } from "../constants/Models.js";
import { Logger } from "../utils/Logger.js";

dotenv.config();

class OpenAIService {

    constructor() {

        if (!process.env.OPENAI_API_KEY) {

            throw new Error(
                "OPENAI_API_KEY no está configurada en el archivo .env"
            );

        }

        this.client = new OpenAI({

            apiKey: process.env.OPENAI_API_KEY,

            baseURL: process.env.OPENAI_BASE_URL

        });

    }

    async generate(prompt) {

        try {

            Logger.info("Consultando OpenAI...");

            const response = await this.client.responses.create({

                model: Models.MODEL,

                input: prompt,

                max_output_tokens: Models.MAX_OUTPUT_TOKENS

            });

            Logger.success("Respuesta recibida correctamente.");

            return response.output_text;

        }

        catch (error) {

            Logger.error("Error al consultar OpenAI.");

            if (error.status) {

                Logger.error(`Status: ${error.status}`);

            }

            if (error.message) {

                Logger.error(error.message);

            }

            if (error.response) {

                console.log(error.response);

            }

            throw error;

        }

    }

}

export default new OpenAIService();