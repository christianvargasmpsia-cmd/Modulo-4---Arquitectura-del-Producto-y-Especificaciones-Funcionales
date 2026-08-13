package bo.umss.market.umss_market_api.infrastructure.adapters;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import bo.umss.market.umss_market_api.application.dto.ToolDecision;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.infrastructure.dto.request.OllamaRequest;
import bo.umss.market.umss_market_api.infrastructure.dto.response.OllamaResponse;

@Component
public class OllamaAdapter implements AIProviderPort {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GENERATE_URL =
            "http://localhost:11434/api/generate";

    private static final String EMBEDDING_URL =
            "http://localhost:11434/api/embed";

    private static final String GENERATION_MODEL =
            "llama3.2:3b";

    private static final String EMBEDDING_MODEL =
            "nomic-embed-text";

    public OllamaAdapter(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String generate(String prompt) {

        OllamaRequest request =
                new OllamaRequest(
                        GENERATION_MODEL,
                        prompt,
                        false
                );

        OllamaResponse response =
                restTemplate.postForObject(
                        GENERATE_URL,
                        request,
                        OllamaResponse.class
                );

        if (response == null) {
            return "";
        }

        return response.getResponse();
    }

    @Override
public ToolDecision selectTool(String question) {

    String prompt = """
            Eres un router de herramientas para UMSS Market.

            Debes decidir qué herramienta utilizar y extraer únicamente los parámetros necesarios.

            Herramientas disponibles:

            1. SEARCH_CATALOG
               - Buscar productos en el catálogo general
               - Ejemplos: "Busco laptop", "¿Qué computadoras tienen?", "Quiero una impresora"

            2. PUBLICATION_DETAIL
               - Obtener detalles específicos de una publicación
               - Ejemplos: "¿Cuáles son las características de la laptop?", "¿Cuánto cuesta y cuánto stock?"

            3. SEARCH_STORES
               - Buscar tiendas y emprendedores
               - Ejemplos: "¿Qué tienda vende programación?", "Busco un emprendimiento que venda computadoras"

            4. USER_INTERACTIONS
               - Consultar historial de interacciones del usuario
               - Ejemplos: "¿Qué productos me interesaron?", "Muéstrame mis interacciones recientes"

            5. RECOMMENDATIONS
               - Obtener recomendaciones personalizadas
               - Ejemplos: "¿Qué me recomiendas para estudiar?", "Recomiéndame productos similares"

            Responde EXCLUSIVAMENTE con un JSON válido.

            Formato:

            {
              "tool":"SEARCH_CATALOG",
              "query":"laptop"
            }

            Reglas:

            - Analiza la intención del usuario
            - Si es búsqueda general → SEARCH_CATALOG
            - Si es pregunta sobre un producto específico → PUBLICATION_DETAIL
            - Si es sobre tiendas/emprendimientos → SEARCH_STORES
            - Si es sobre sus interacciones previas → USER_INTERACTIONS
            - Si es pedirte que recomiende basándose en su perfil → RECOMMENDATIONS
            - Si no corresponde a marketplace → NO_TOOL

            Ejemplos de mapeo:

            "Necesito algo para programar" → {"tool":"SEARCH_CATALOG", "query":"programación"}
            "¿Qué características tiene la laptop que viste?" → {"tool":"PUBLICATION_DETAIL", "query":"características laptop"}
            "¿Qué tienda vende computadoras?" → {"tool":"SEARCH_STORES", "query":"tienda computadoras"}
            "¿Con qué productos interactué?" → {"tool":"USER_INTERACTIONS", "query":""}
            "¿Qué me recomiendas para estudiar?" → {"tool":"RECOMMENDATIONS", "query":"estudiar"}
            "¿Cuál es tu comida favorita?" → {"tool":"NO_TOOL", "query":""}

            NO escribas explicaciones.
            NO uses markdown.
            NO uses ```json.
            Devuelve únicamente el JSON.

            Pregunta:

            %s
            """.formatted(question);

    OllamaRequest request =
            new OllamaRequest(
                    GENERATION_MODEL,
                    prompt,
                    false
            );

    OllamaResponse response =
            restTemplate.postForObject(
                    GENERATE_URL,
                    request,
                    OllamaResponse.class
            );

    if (response == null || response.getResponse() == null) {
        return createNoToolDecision();
    }

    String json = response.getResponse().trim();

    System.out.println("=================================");
    System.out.println("PREGUNTA:");
    System.out.println(question);
    System.out.println("---------------------------------");
    System.out.println("RESPUESTA DEL LLM:");
    System.out.println(json);
    System.out.println("=================================");

    try {
        return objectMapper.readValue(
                json,
                ToolDecision.class
        );

    } catch (Exception ex) {
        // Fallback: intentar extraer la herramienta del texto
        return parseFallback(question, json);
    }
}

private ToolDecision createNoToolDecision() {
    ToolDecision decision = new ToolDecision();
    decision.setTool("NO_TOOL");
    decision.setQuery("");
    return decision;
}

private ToolDecision parseFallback(String question, String json) {
    
    ToolDecision decision = new ToolDecision();
    String upperJson = json.toUpperCase();

    // Mapeo de fallback: palabras clave → tool
    if (upperJson.contains("SEARCH_CATALOG")) {
        decision.setTool("SEARCH_CATALOG");
        decision.setQuery(extractQueryFromQuestion(question));
    } else if (upperJson.contains("PUBLICATION_DETAIL") || 
               upperJson.contains("DETALLE") ||
               upperJson.contains("CARACTERÍSTICAS")) {
        decision.setTool("PUBLICATION_DETAIL");
        decision.setQuery(extractQueryFromQuestion(question));
    } else if (upperJson.contains("SEARCH_STORES") || 
               upperJson.contains("TIENDA") ||
               upperJson.contains("EMPRENDIMIENTO")) {
        decision.setTool("SEARCH_STORES");
        decision.setQuery(extractQueryFromQuestion(question));
    } else if (upperJson.contains("USER_INTERACTIONS") || 
               upperJson.contains("INTERACTUÉ") ||
               upperJson.contains("INTERESARON")) {
        decision.setTool("USER_INTERACTIONS");
        decision.setQuery("");
    } else if (upperJson.contains("RECOMMENDATIONS") || 
               upperJson.contains("RECOMIENDA") ||
               upperJson.contains("RECOMIEND")) {
        decision.setTool("RECOMMENDATIONS");
        decision.setQuery(extractQueryFromQuestion(question));
    } else {
        decision.setTool("NO_TOOL");
        decision.setQuery("");
    }

    return decision;
}

private String extractQueryFromQuestion(String question) {
    return question
            .replaceAll("(?i)quiero comprar", "")
            .replaceAll("(?i)quiero", "")
            .replaceAll("(?i)comprar", "")
            .replaceAll("(?i)busco", "")
            .replaceAll("(?i)buscar", "")
            .replaceAll("(?i)necesito", "")
            .replaceAll("(?i)muéstrame", "")
            .replaceAll("(?i)mostrar", "")
            .replaceAll("(?i)qué", "")
            .replaceAll("(?i)cuáles", "")
            .replaceAll("(?i)dime", "")
            .replaceAll("(?i)cuéntame", "")
            .replaceAll("(?i)tienen", "")
            .replaceAll("(?i)una", "")
            .replaceAll("(?i)un", "")
            .replaceAll("[¿?]", "")
            .replaceAll("\\s+", " ")
            .trim();
}

    @Override
    public List<Double> generateEmbedding(String text) {

        if (text == null || text.isBlank()) {
            return List.of();
        }

        try {

            String requestBody = """
                    {
                      "model": "%s",
                      "input": %s
                    }
                    """.formatted(
                    EMBEDDING_MODEL,
                    objectMapper.writeValueAsString(text)
            );

            String response =
                    restTemplate.postForObject(
                            EMBEDDING_URL,
                            requestBody,
                            String.class
                    );

            if (response == null || response.isBlank()) {
                return List.of();
            }

            JsonNode root =
                    objectMapper.readTree(response);

            JsonNode embeddings =
                    root.path("embeddings");

            if (!embeddings.isArray()
                    || embeddings.isEmpty()) {

                return List.of();
            }

            JsonNode firstEmbedding =
                    embeddings.get(0);

            return objectMapper.convertValue(
                    firstEmbedding,
                    objectMapper.getTypeFactory()
                            .constructCollectionType(
                                    List.class,
                                    Double.class
                            )
            );

        } catch (Exception ex) {

            throw new IllegalStateException(
                    "No fue posible generar el embedding con Ollama",
                    ex
            );
        }
    }
}