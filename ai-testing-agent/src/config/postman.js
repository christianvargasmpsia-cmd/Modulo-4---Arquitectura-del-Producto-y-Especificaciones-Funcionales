import dotenv from "dotenv";

dotenv.config();

const postmanConfig = {
    apiKey: process.env.POSTMAN_API_KEY,
    baseUrl: "https://api.getpostman.com"
};

if (!postmanConfig.apiKey) {
    throw new Error(
        "No se encontró la variable POSTMAN_API_KEY en el archivo .env"
    );
}

export default postmanConfig;