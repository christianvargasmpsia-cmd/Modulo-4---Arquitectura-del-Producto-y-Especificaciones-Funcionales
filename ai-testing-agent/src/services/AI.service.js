import OllamaService from "./Ollama.service.js";

class AIService {

    async generate(prompt) {

        return OllamaService.generate(prompt);

    }

}

export default new AIService();