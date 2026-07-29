package bo.umss.market.umss_market_api.infrastructure.controllers;

import bo.umss.market.umss_market_api.application.services.AIService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/api/ai/hello")
    public String hello() {
        return aiService.generate("Hola mundo");
    }
}