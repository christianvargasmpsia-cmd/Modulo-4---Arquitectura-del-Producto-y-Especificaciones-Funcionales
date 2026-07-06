import MockAIService from "./MockAI.service.js";
// import OpenAIService from "./OpenAI.service.js";

class AIService {

    async generate(prompt) {

        return MockAIService.generate(prompt);

        // Cuando tengas créditos simplemente cambias por:
        // return OpenAIService.generate(prompt);

    }

}

export default new AIService();