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

    private final ObjectMapper objectMapper =
            new ObjectMapper();

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

    // ============================================================
    // GENERACIÓN GENERAL
    // ============================================================

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

    // ============================================================
    // TOOL SELECTION
    // ============================================================

    @Override
    public ToolDecision selectTool(String question) {

        if (question == null ||
                question.isBlank()) {

            return createNoToolDecision();
        }

        String prompt = """
                Eres un router de herramientas para UMSS Market.

                Tu única tarea es identificar la INTENCIÓN principal
                de la pregunta del usuario y seleccionar UNA herramienta.

                ========================================================
                HERRAMIENTAS
                ========================================================

                1. SEARCH_CATALOG

                Busca productos en el catálogo general.

                USA SEARCH_CATALOG cuando el usuario:

                - pregunta qué productos existen
                - pregunta qué productos tienen
                - pregunta qué productos venden
                - busca un tipo de producto
                - busca productos por categoría
                - expresa que quiere comprar algo
                - busca productos para una necesidad

                EJEMPLOS:

                "¿Qué computadoras tienen?"
                "¿Qué laptops tienen?"
                "¿Qué impresoras venden?"
                "Busco una computadora"
                "Necesito una laptop"
                "Quiero comprar un mouse"
                "¿Tienen teclados?"
                "¿Qué productos tienen para estudiantes?"

                IMPORTANTE:

                Una pregunta sobre una CATEGORÍA o TIPO DE PRODUCTO
                es una búsqueda general.

                "Necesito algo para programar"

                ES:

                SEARCH_CATALOG

                NO ES:

                RECOMMENDATIONS


                ========================================================

                2. PUBLICATION_DETAIL

                Obtiene detalles de UNA publicación o producto específico.

                USA PUBLICATION_DETAIL cuando el usuario quiere:

                - características
                - precio
                - stock
                - descripción
                - detalles
                - información específica
                - información de una publicación concreta

                EJEMPLOS:

                "¿Qué características tiene la laptop?"
                "¿Cuánto cuesta la laptop?"
                "¿Cuánto stock tiene esa computadora?"
                "Dame los detalles de esa publicación"
                "¿Cuál es la descripción de la laptop?"
                "¿Qué especificaciones tiene esa computadora?"

                ========================================================

                3. SEARCH_STORES

                Busca tiendas o emprendimientos.

                USA SEARCH_STORES cuando el objetivo principal
                sea encontrar tiendas o emprendimientos.

                EJEMPLOS:

                "¿Qué tienda vende computadoras?"
                "Busco un emprendimiento que venda ropa"
                "¿Qué tiendas tienen laptops?"
                "Muéstrame tiendas de tecnología"

                ========================================================

                4. USER_INTERACTIONS

                Consulta las interacciones anteriores del usuario.

                USA USER_INTERACTIONS cuando el usuario pregunta
                sobre su historial o comportamiento anterior.

                EJEMPLOS:

                "¿Con qué productos interactué?"
                "¿Qué productos me interesaron?"
                "Muéstrame mis interacciones"
                "¿Qué publicaciones vi?"

                ========================================================

                5. RECOMMENDATIONS

                Obtiene recomendaciones personalizadas.

                USA RECOMMENDATIONS SOLAMENTE cuando el usuario
                EXPLÍCITAMENTE pide una recomendación.

                EJEMPLOS:

                "¿Qué me recomiendas?"
                "Recomiéndame productos para estudiar"
                "¿Qué producto me recomiendas para programar?"
                "Dame recomendaciones"

                IMPORTANTE:

                "Necesito algo para programar"

                NO es una recomendación.

                Es:

                SEARCH_CATALOG


                ========================================================

                6. NO_TOOL

                Usa NO_TOOL cuando la pregunta no corresponde
                al marketplace UMSS Market.

                EJEMPLOS:

                "¿Cuál es tu comida favorita?"
                "Cuéntame un chiste"
                "¿Quién descubrió América?"
                "¿Qué tiempo hace?"

                ========================================================
                REGLAS PRIORITARIAS
                ========================================================

                REGLA 1:

                Si el usuario busca productos EN GENERAL:

                SEARCH_CATALOG


                REGLA 2:

                Si el usuario pregunta por características,
                precio, stock o detalles de UN producto:

                PUBLICATION_DETAIL


                REGLA 3:

                Si busca tiendas o emprendimientos:

                SEARCH_STORES


                REGLA 4:

                Si pregunta por sus interacciones:

                USER_INTERACTIONS


                REGLA 5:

                Si pide explícitamente recomendaciones:

                RECOMMENDATIONS


                REGLA 6:

                Si no pertenece al marketplace:

                NO_TOOL


                ========================================================
                EJEMPLOS OBLIGATORIOS
                ========================================================

                "Necesito algo para programar"

                {
                  "tool":"SEARCH_CATALOG",
                  "query":"programación"
                }


                "¿Qué computadoras tienen?"

                {
                  "tool":"SEARCH_CATALOG",
                  "query":"computadoras"
                }


                "¿Qué laptops tienen?"

                {
                  "tool":"SEARCH_CATALOG",
                  "query":"laptops"
                }


                "Busco mouse gamer"

                {
                  "tool":"SEARCH_CATALOG",
                  "query":"mouse gamer"
                }


                "¿Qué características tiene la laptop?"

                {
                  "tool":"PUBLICATION_DETAIL",
                  "query":"características laptop"
                }


                "¿Cuánto cuesta la laptop?"

                {
                  "tool":"PUBLICATION_DETAIL",
                  "query":"precio laptop"
                }


                "¿Cuánto stock tiene esa computadora?"

                {
                  "tool":"PUBLICATION_DETAIL",
                  "query":"stock computadora"
                }


                "¿Qué tienda vende computadoras?"

                {
                  "tool":"SEARCH_STORES",
                  "query":"computadoras"
                }


                "Busco un emprendimiento que venda computadoras"

                {
                  "tool":"SEARCH_STORES",
                  "query":"computadoras"
                }


                "¿Con qué productos interactué?"

                {
                  "tool":"USER_INTERACTIONS",
                  "query":""
                }


                "¿Qué productos me interesaron?"

                {
                  "tool":"USER_INTERACTIONS",
                  "query":""
                }


                "¿Qué me recomiendas para estudiar?"

                {
                  "tool":"RECOMMENDATIONS",
                  "query":"estudiar"
                }


                "¿Cuál es tu comida favorita?"

                {
                  "tool":"NO_TOOL",
                  "query":""
                }


                ========================================================
                FORMATO DE RESPUESTA
                ========================================================

                Responde EXCLUSIVAMENTE con JSON válido.

                Formato:

                {
                  "tool":"SEARCH_CATALOG",
                  "query":"computadoras"
                }

                NO escribas explicaciones.

                NO uses markdown.

                NO uses ```json.

                NO agregues texto antes o después del JSON.

                ========================================================

                PREGUNTA DEL USUARIO
                ========================================================

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

        if (response == null ||
                response.getResponse() == null) {

            return createNoToolDecision();
        }

        String json =
                response.getResponse().trim();

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

            System.out.println(
                    "No se pudo interpretar el JSON del LLM."
            );

            return parseFallback(
                    question,
                    json
            );
        }
    }

    // ============================================================
    // NO TOOL
    // ============================================================

    private ToolDecision createNoToolDecision() {

        ToolDecision decision =
                new ToolDecision();

        decision.setTool("NO_TOOL");
        decision.setQuery("");

        return decision;
    }

    // ============================================================
    // FALLBACK
    // ============================================================

    private ToolDecision parseFallback(
            String question,
            String json) {

        ToolDecision decision =
                new ToolDecision();

        String upperJson =
                json == null
                        ? ""
                        : json.toUpperCase();

        String normalizedQuestion =
                question == null
                        ? ""
                        : question
                                .toLowerCase()
                                .trim();

        // ========================================================
        // 1. PUBLICATION_DETAIL
        // ========================================================

        if (normalizedQuestion.contains("característica")
                || normalizedQuestion.contains("caracteristicas")
                || normalizedQuestion.contains("precio")
                || normalizedQuestion.contains("cuánto cuesta")
                || normalizedQuestion.contains("cuanto cuesta")
                || normalizedQuestion.contains("stock")
                || normalizedQuestion.contains("existencia")) {

            decision.setTool(
                    "PUBLICATION_DETAIL"
            );

            decision.setQuery(
                    extractQueryFromQuestion(question)
            );

            return decision;
        }

        // ========================================================
        // 2. SEARCH_STORES
        // ========================================================

        if (normalizedQuestion.contains("tienda")
                || normalizedQuestion.contains("tiendas")
                || normalizedQuestion.contains("emprendimiento")
                || normalizedQuestion.contains("emprendimientos")) {

            decision.setTool(
                    "SEARCH_STORES"
            );

            decision.setQuery(
                    extractQueryFromQuestion(question)
            );

            return decision;
        }

        // ========================================================
        // 3. USER_INTERACTIONS
        // ========================================================

        if (normalizedQuestion.contains("interactué")
                || normalizedQuestion.contains("interactue")
                || normalizedQuestion.contains("interacciones")
                || normalizedQuestion.contains("me interesaron")
                || normalizedQuestion.contains("productos de interés")
                || normalizedQuestion.contains("productos de interes")) {

            decision.setTool(
                    "USER_INTERACTIONS"
            );

            decision.setQuery("");

            return decision;
        }

        // ========================================================
        // 4. RECOMMENDATIONS
        // ========================================================

        /*
         * MUY IMPORTANTE:
         *
         * No basta con que Ollama diga:
         *
         * RECOMMENDATIONS
         *
         * También verificamos la intención real de la pregunta.
         *
         * Así:
         *
         * "Necesito algo para programar"
         *
         * aunque Ollama responda:
         *
         * RECOMMENDATIONS
         *
         * será SEARCH_CATALOG.
         */

        boolean explicitRecommendation =
                normalizedQuestion.contains("recomiéndame")
                || normalizedQuestion.contains("recomiendame")
                || normalizedQuestion.contains("qué me recomiendas")
                || normalizedQuestion.contains("que me recomiendas")
                || normalizedQuestion.contains("qué recomiendas")
                || normalizedQuestion.contains("que recomiendas")
                || normalizedQuestion.contains("recomienda")
                || normalizedQuestion.contains("recomendación")
                || normalizedQuestion.contains("recomendacion")
                || normalizedQuestion.contains("recomendaciones")
                || normalizedQuestion.contains("productos similares")
                || normalizedQuestion.contains("producto similar");

        if (explicitRecommendation) {

            decision.setTool(
                    "RECOMMENDATIONS"
            );

            decision.setQuery(
                    extractQueryFromQuestion(question)
            );

            return decision;
        }

        // ========================================================
        // 5. SEARCH_CATALOG POR INTENCIÓN
        // ========================================================

        /*
         * Estas palabras indican búsqueda general.
         */

        boolean catalogSearch =
                normalizedQuestion.contains("busco")
                || normalizedQuestion.contains("buscar")
                || normalizedQuestion.contains("necesito")
                || normalizedQuestion.contains("quiero")
                || normalizedQuestion.contains("comprar")
                || normalizedQuestion.contains("tienen")
                || normalizedQuestion.contains("tiene")
                || normalizedQuestion.contains("venden")
                || normalizedQuestion.contains("vende")
                || normalizedQuestion.contains("qué productos")
                || normalizedQuestion.contains("que productos")
                || normalizedQuestion.contains("qué computadoras")
                || normalizedQuestion.contains("que computadoras")
                || normalizedQuestion.contains("qué laptops")
                || normalizedQuestion.contains("que laptops")
                || normalizedQuestion.contains("qué impresoras")
                || normalizedQuestion.contains("que impresoras");

        if (catalogSearch) {

            decision.setTool(
                    "SEARCH_CATALOG"
            );

            decision.setQuery(
                    extractQueryFromQuestion(question)
            );

            return decision;
        }

        // ========================================================
        // 6. RESPUESTA DEL LLM: SEARCH_CATALOG
        // ========================================================

        if (upperJson.contains("SEARCH_CATALOG")) {

            decision.setTool(
                    "SEARCH_CATALOG"
            );

            decision.setQuery(
                    extractQueryFromQuestion(question)
            );

            return decision;
        }

        // ========================================================
        // 7. RESPUESTA DEL LLM: PUBLICATION_DETAIL
        // ========================================================

        if (upperJson.contains("PUBLICATION_DETAIL")) {

            decision.setTool(
                    "PUBLICATION_DETAIL"
            );

            decision.setQuery(
                    extractQueryFromQuestion(question)
            );

            return decision;
        }

        // ========================================================
        // 8. RESPUESTA DEL LLM: SEARCH_STORES
        // ========================================================

        if (upperJson.contains("SEARCH_STORES")) {

            decision.setTool(
                    "SEARCH_STORES"
            );

            decision.setQuery(
                    extractQueryFromQuestion(question)
            );

            return decision;
        }

        // ========================================================
        // 9. RESPUESTA DEL LLM: USER_INTERACTIONS
        // ========================================================

        if (upperJson.contains("USER_INTERACTIONS")) {

            decision.setTool(
                    "USER_INTERACTIONS"
            );

            decision.setQuery("");

            return decision;
        }

        // ========================================================
        // 10. RESPUESTA DEL LLM: RECOMMENDATIONS
        // ========================================================

        /*
         * Solo se acepta si la pregunta tiene intención
         * explícita de recomendación.
         *
         * Si Ollama devuelve:
         *
         * "RECOMMENDATIONS"
         *
         * para:
         *
         * "Necesito algo para programar"
         *
         * NO entra aquí.
         */

        if (upperJson.contains("RECOMMENDATIONS")
                && explicitRecommendation) {

            decision.setTool(
                    "RECOMMENDATIONS"
            );

            decision.setQuery(
                    extractQueryFromQuestion(question)
            );

            return decision;
        }

        // ========================================================
        // 11. FALLBACK PARA PRODUCTOS
        // ========================================================

        /*
         * Si el LLM respondió algo extraño pero la pregunta
         * claramente está relacionada con productos,
         * usamos SEARCH_CATALOG.
         */

        boolean productQuestion =
                normalizedQuestion.contains("producto")
                || normalizedQuestion.contains("productos")
                || normalizedQuestion.contains("laptop")
                || normalizedQuestion.contains("laptops")
                || normalizedQuestion.contains("computadora")
                || normalizedQuestion.contains("computadoras")
                || normalizedQuestion.contains("mouse")
                || normalizedQuestion.contains("teclado")
                || normalizedQuestion.contains("mochila")
                || normalizedQuestion.contains("programar")
                || normalizedQuestion.contains("estudiar")
                || normalizedQuestion.contains("impresora")
                || normalizedQuestion.contains("impresoras");

        if (productQuestion) {

            decision.setTool(
                    "SEARCH_CATALOG"
            );

            decision.setQuery(
                    extractQueryFromQuestion(question)
            );

            return decision;
        }

        // ========================================================
        // 12. NO TOOL
        // ========================================================

        decision.setTool(
                "NO_TOOL"
        );

        decision.setQuery("");

        return decision;
    }

    // ============================================================
    // QUERY EXTRACTION
    // ============================================================

    private String extractQueryFromQuestion(
            String question) {

        if (question == null ||
                question.isBlank()) {

            return "";
        }

        return question

                .replaceAll(
                        "(?i)quiero comprar",
                        ""
                )

                .replaceAll(
                        "(?i)quiero",
                        ""
                )

                .replaceAll(
                        "(?i)comprar",
                        ""
                )

                .replaceAll(
                        "(?i)busco",
                        ""
                )

                .replaceAll(
                        "(?i)buscar",
                        ""
                )

                .replaceAll(
                        "(?i)necesito",
                        ""
                )

                .replaceAll(
                        "(?i)muéstrame",
                        ""
                )

                .replaceAll(
                        "(?i)muestrame",
                        ""
                )

                .replaceAll(
                        "(?i)mostrar",
                        ""
                )

                .replaceAll(
                        "(?i)qué",
                        ""
                )

                .replaceAll(
                        "(?i)que",
                        ""
                )

                .replaceAll(
                        "(?i)cuáles",
                        ""
                )

                .replaceAll(
                        "(?i)cuales",
                        ""
                )

                .replaceAll(
                        "(?i)dime",
                        ""
                )

                .replaceAll(
                        "(?i)cuéntame",
                        ""
                )

                .replaceAll(
                        "(?i)cuentame",
                        ""
                )

                .replaceAll(
                        "(?i)tienen",
                        ""
                )

                .replaceAll(
                        "(?i)tiene",
                        ""
                )

                .replaceAll(
                        "(?i)venden",
                        ""
                )

                .replaceAll(
                        "(?i)vende",
                        ""
                )

                .replaceAll(
                        "(?i)una",
                        ""
                )

                .replaceAll(
                        "(?i)un",
                        ""
                )

                .replaceAll(
                        "(?i)por favor",
                        ""
                )

                .replaceAll(
                        "[¿?]",
                        ""
                )

                .replaceAll(
                        "\\s+",
                        " "
                )

                .trim();
    }

    // ============================================================
    // EMBEDDINGS
    // ============================================================

    @Override
    public List<Double> generateEmbedding(
            String text) {

        if (text == null ||
                text.isBlank()) {

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

            if (response == null ||
                    response.isBlank()) {

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