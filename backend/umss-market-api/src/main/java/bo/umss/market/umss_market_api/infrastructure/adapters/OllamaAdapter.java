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

                Debes decidir qué herramienta utilizar y extraer únicamente el término de búsqueda.

                Herramienta disponible:

                SEARCH_CATALOG

                Responde EXCLUSIVAMENTE con un JSON válido.

                Formato:

                {
                  "tool":"SEARCH_CATALOG",
                  "query":"laptop"
                }

                Reglas:

                - "Quiero comprar una laptop" -> "laptop"
                - "¿Qué computadoras tienen?" -> "computadoras"
                - "Busco mouse gamer" -> "mouse gamer"
                - "Necesito una impresora HP" -> "impresora HP"

                Si la consulta NO corresponde al marketplace responde:

                {
                  "tool":"NO_TOOL",
                  "query":""
                }

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

            ToolDecision decision = new ToolDecision();

            decision.setTool("NO_TOOL");
            decision.setQuery("");

            return decision;
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

            ToolDecision decision = new ToolDecision();

            if (json.toUpperCase().contains("SEARCH_CATALOG")) {

                decision.setTool("SEARCH_CATALOG");

                String query = question
                        .replaceAll("(?i)quiero comprar", "")
                        .replaceAll("(?i)quiero", "")
                        .replaceAll("(?i)comprar", "")
                        .replaceAll("(?i)busco", "")
                        .replaceAll("(?i)buscar", "")
                        .replaceAll("(?i)necesito", "")
                        .replaceAll("(?i)muéstrame", "")
                        .replaceAll("(?i)mostrar", "")
                        .replaceAll("(?i)qué", "")
                        .replaceAll("(?i)tienen", "")
                        .replaceAll("(?i)una", "")
                        .replaceAll("(?i)un", "")
                        .replaceAll("[¿?]", "")
                        .trim();

                decision.setQuery(query);

            } else {

                decision.setTool("NO_TOOL");
                decision.setQuery("");
            }

            return decision;
        }
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