package bo.umss.market.umss_market_api.infrastructure.controllers;

import bo.umss.market.umss_market_api.application.services.AIService;
import bo.umss.market.umss_market_api.infrastructure.dto.request.ChatRequest;
import bo.umss.market.umss_market_api.infrastructure.dto.request.ProductDescriptionRequest;
import bo.umss.market.umss_market_api.infrastructure.dto.response.ProductDescriptionResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/product-description")
    public ProductDescriptionResponse generateProductDescription(
            @RequestBody ProductDescriptionRequest request) {

        String prompt = """
            Eres un asistente de UMSS Market.
            Genera una descripción atractiva para el siguiente producto.

            Nombre: %s
            Categoría: %s
            Precio: %s

            Responde solo con la descripción, en máximo 2 frases.
            """.formatted(
                request.getNombre(),
                request.getCategoria(),
                request.getPrecio());

        String description = aiService.generate(prompt);

        if (description == null || description.isBlank()) {
            description = "No se pudo generar la descripción en este momento.";
        }

        return new ProductDescriptionResponse(description);
    }

    @PostMapping("/chat")
    public String chat(@RequestBody ChatRequest request) {
        return aiService.chat(request.getMessage());
    }

}