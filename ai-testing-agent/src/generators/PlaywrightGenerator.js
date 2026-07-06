import AIService from "../services/AI.service.js";
import PlaywrightPrompt from "../prompts/playwright.prompt.js";
import SpecWriter from "./SpecWriter.js";
import { Logger } from "../utils/Logger.js";

class PlaywrightGenerator {

    async generate(feature) {

        try {

            Logger.info("Generating Playwright test...");

            // Construir el prompt
            const prompt = PlaywrightPrompt.build(feature);

            // Obtener código generado (MockAI u OpenAI)
            const code = await AIService.generate(prompt);

            // Guardar el archivo .spec.js
            const filePath = await SpecWriter.save(feature, code);

            Logger.success("Playwright test generated successfully.");

            return filePath;

        }
        catch (error) {

            Logger.error(`PlaywrightGenerator: ${error.message}`);

            throw error;

        }

    }

}

export default new PlaywrightGenerator();