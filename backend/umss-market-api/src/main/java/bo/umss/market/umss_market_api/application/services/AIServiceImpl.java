package bo.umss.market.umss_market_api.application.services;

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.application.dto.ToolDecision;
import bo.umss.market.umss_market_api.application.usecases.SearchCatalogUseCase;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class AIServiceImpl implements AIService {

    @Value("${ia.enabled:${IA_HABILITADA:false}}")
    private boolean iaEnabled;

    private final AIProviderPort provider;
    private final SearchCatalogUseCase searchCatalogUseCase;

    public AIServiceImpl(
            AIProviderPort provider,
            SearchCatalogUseCase searchCatalogUseCase
    ) {
        this.provider = provider;
        this.searchCatalogUseCase = searchCatalogUseCase;
    }

    @Override
    public String generate(String prompt) {

        if (!iaEnabled) {
            return "La IA está deshabilitada. Solo puedo ayudarte con búsquedas del catálogo.";
        }

        return provider.generate(prompt);
    }

    @Autowired
    private GetPublicationDetailSemanticUseCase publicationDetailUseCase;
    
    @Autowired
    private SearchStoresBySemanticUseCase storesUseCase;
    
    @Autowired
    private GetUserInteractionsSemanticUseCase interactionsUseCase;
    
    @Autowired
    private GetRecommendationsUseCase recommendationsUseCase;
    

    @Override
    public String chat(String message) {

        String texto = message == null
                ? ""
                : message.trim();

        if (texto.isBlank()) {
            return """
                    No puedo responder esa consulta.

                    Puedo ayudarte con:
                    - Buscar publicaciones
                    - Buscar productos
                    - Buscar servicios
                    """;
        }

        // =====================================================
        // ESCENARIO 1
        // BÚSQUEDA DIRECTA POR PALABRAS CLAVE
        // =====================================================

        if (isCatalogSearchRequest(texto)) {

            return executeCatalogSearch(
                    texto,
                    "KEYWORD",
                    !iaEnabled
            );
        }

        // =====================================================
        // ESCENARIO 2
        // IA DESHABILITADA
        // =====================================================

        if (!iaEnabled) {

            return """
                    Estado IA: DESHABILITADA

                    La IA está deshabilitada.

                    Puedo ayudarte con:
                    - Buscar publicaciones
                    - Buscar productos
                    - Buscar servicios
                    """;
        }

        // =====================================================
        // ESCENARIO 3
        // EL LLM DECIDE UTILIZAR SEARCH_CATALOG
        // =====================================================

        ToolDecision decision = provider.selectTool(texto);
        
        if (decision != null) {
            switch (decision.getTool().toUpperCase()) {
                case "SEARCH_CATALOG" -> {
                    return executeSemanticCatalogSearch(texto, "RAG_SEMANTICO", false);
                }
                case "PUBLICATION_DETAIL" -> {
                    // Extraer ID de publicación del contexto
                    UUID pubId = extractPublicationId(decision);
                    return publicationDetailUseCase.executeWithContext(pubId, texto);
                }
                case "SEARCH_STORES" -> {
                    return storesUseCase.executeSemanticSearch(texto);
                }
                case "USER_INTERACTIONS" -> {
                    UUID userId = getCurrentUserId(); // Del contexto de auth
                    return interactionsUseCase.executeUserHistory(userId, texto);
                }
                case "RECOMMENDATIONS" -> {
                    UUID userId = getCurrentUserId();
                    return recommendationsUseCase.getRecommendations(userId, texto);
                }
                default -> {
                    return "No puedo responder esa consulta.";
                }
            }
        }
        
        return "No puedo responder esa consulta.";
    }
}

        // if (decision != null
        //         && "SEARCH_CATALOG".equalsIgnoreCase(
        //                 decision.getTool())) {

        //     /*
        //      * IMPORTANTE:
        //      *
        //      * Para RAG usamos la pregunta original completa.
        //      *
        //      * Ejemplo:
        //      *
        //      * "Necesito algo para programar"
        //      *
        //      * y no solamente:
        //      *
        //      * "programar"
        //      *
        //      * Esto permite generar un embedding
        //      * representativo de la intención completa.
        //      */

        //     return executeSemanticCatalogSearch(
        //             texto,
        //             "RAG_SEMANTICO",
        //             false
        //     );
        // }

        // =====================================================
        // ESCENARIO 4
        // FUERA DE ALCANCE
        // =====================================================

//         return """
//                 No puedo responder esa consulta.

//                 Puedo ayudarte con:
//                 - Buscar publicaciones
//                 - Buscar productos
//                 - Buscar servicios
//                 """;
//     }

    /**
     * Detecta consultas que corresponden directamente
     * al catálogo.
     *
     * Estas consultas mantienen el flujo tradicional
     * mediante palabras clave.
     */
    private boolean isCatalogSearchRequest(String message) {

        String texto =
                message.toLowerCase(Locale.ROOT);

        return texto.contains("buscar")
                || texto.contains("producto")
                || texto.contains("productos")
                || texto.contains("publicación")
                || texto.contains("publicaciones")
                || texto.contains("catálogo")
                || texto.contains("catalogo")
                || texto.contains("servicio")
                || texto.contains("servicios");
    }

    /**
     * Búsqueda tradicional mediante palabras clave.
     *
     * Este flujo existente se mantiene.
     */
    private String executeCatalogSearch(
            String message,
            String camino,
            boolean showDisabledBanner) {

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        String busqueda = message
                .replaceAll("(?i)buscar", "")
                .replaceAll("(?i)producto", "")
                .replaceAll("(?i)productos", "")
                .replaceAll("(?i)publicación", "")
                .replaceAll("(?i)publicaciones", "")
                .replaceAll("(?i)catálogo", "")
                .replaceAll("(?i)catalogo", "")
                .trim();

        request.setTexto(busqueda);

        List<PublicationSummaryResponse> publicaciones =
                searchCatalogUseCase.execute(request);

        StringBuilder respuesta =
                new StringBuilder();

        if (showDisabledBanner) {
            respuesta.append(
                    "Estado IA: DESHABILITADA\n\n"
            );
        }

        respuesta.append("""
                Herramienta:
                SEARCH_CATALOG

                Fuente:
                publications

                Camino:
                """)
                .append(camino)
                .append("\n\n");

        if (camino.equals("KEYWORD")) {

            respuesta.append(
                    "La consulta se resuelve directamente mediante palabras clave.\n\n"
            );
        }

        if (publicaciones.isEmpty()) {

            respuesta.append(
                    "No encontré publicaciones que coincidan con tu búsqueda."
            );

            return respuesta.toString();
        }

        respuesta.append(
                "Encontré las siguientes publicaciones:\n\n"
        );

        appendPublications(
                respuesta,
                publicaciones
        );

        return respuesta.toString();
    }

    /**
     * Retrieval semántico mediante embeddings.
     *
     * Este es el nuevo flujo RAG.
     */
    private String executeSemanticCatalogSearch(
        String query,
        String camino,
        boolean showDisabledBanner) {

    List<PublicationSummaryResponse> publicaciones =
            searchCatalogUseCase.executeSemanticSearch(
                    query,
                    3
            );

    StringBuilder respuesta =
            new StringBuilder();

    if (showDisabledBanner) {

        respuesta.append(
                "Estado IA: DESHABILITADA\n\n"
        );
    }

    respuesta.append("""
            Herramienta:
            SEARCH_CATALOG

            Fuente:
            publications

            Camino:
            """)
            .append(camino)
            .append("\n\n");

    respuesta.append(
            "Consulta semántica:\n"
    );

    respuesta.append(query)
            .append("\n\n");

    if (publicaciones.isEmpty()) {

        respuesta.append(
                "No encontré publicaciones relacionadas semánticamente con tu consulta."
        );

        return respuesta.toString();
    }

    // =====================================================
    // CONSTRUIR CONTEXTO PARA EL LLM
    // =====================================================

    StringBuilder contexto =
            new StringBuilder();

    for (PublicationSummaryResponse p : publicaciones) {

        contexto.append("Producto: ")
                .append(p.getNombre())
                .append("\n");

        if (p.getDescripcion() != null
                && !p.getDescripcion().isBlank()) {

            contexto.append("Descripción: ")
                    .append(p.getDescripcion())
                    .append("\n");
        }

        if (p.getPrecio() != null) {

            contexto.append("Precio: Bs. ")
                    .append(p.getPrecio())
                    .append("\n");
        }

        if (p.getNombreTienda() != null) {

            contexto.append("Tienda: ")
                    .append(p.getNombreTienda())
                    .append("\n");
        }

        if (p.getStock() != null) {

            contexto.append("Stock: ")
                    .append(p.getStock())
                    .append("\n");
        }

        contexto.append("\n");
    }

    // =====================================================
    // GENERACIÓN RAG
    // =====================================================

    String prompt = """
            Eres el asistente de UMSS Market.

            Debes responder la pregunta del usuario
            utilizando EXCLUSIVAMENTE la información
            proporcionada en el contexto recuperado.

            No inventes productos, precios, tiendas ni stock.

            Si la información del contexto no permite
            responder la pregunta, indícalo claramente.

            Responde de forma natural, clara y breve.

            PREGUNTA DEL USUARIO:
            %s

            CONTEXTO RECUPERADO:
            %s
            """.formatted(
                    query,
                    contexto
            );

    String respuestaGenerada =
            provider.generate(prompt);

    if (respuestaGenerada == null
            || respuestaGenerada.isBlank()) {

        respuesta.append(
                "Encontré publicaciones relacionadas:\n\n"
        );

        appendPublications(
                respuesta,
                publicaciones
        );

        return respuesta.toString();
    }

    // =====================================================
    // RESPUESTA FINAL
    // =====================================================

    respuesta.append(
            "Respuesta generada con contexto recuperado:\n\n"
    );

    respuesta.append(
            respuestaGenerada.trim()
    );

    return respuesta.toString();
}

    /**
     * Construye la respuesta de publicaciones.
     */
    private void appendPublications(
            StringBuilder respuesta,
            List<PublicationSummaryResponse> publicaciones) {

        for (PublicationSummaryResponse p : publicaciones) {

            respuesta.append(
                    "📦 Producto: "
            )
            .append(p.getNombre())
            .append("\n");

            if (p.getDescripcion() != null
                    && !p.getDescripcion().isBlank()) {

                respuesta.append(
                        "📝 Descripción: "
                )
                .append(p.getDescripcion())
                .append("\n");
            }

            if (p.getPrecio() != null) {

                respuesta.append(
                        "💰 Precio: Bs. "
                )
                .append(p.getPrecio())
                .append("\n");
            }

            if (p.getNombreTienda() != null) {

                respuesta.append(
                        "🏪 Tienda: "
                )
                .append(p.getNombreTienda())
                .append("\n");
            }

            if (p.getStock() != null) {

                respuesta.append(
                        "📦 Stock disponible: "
                )
                .append(p.getStock())
                .append("\n");
            }

            respuesta.append(
                    "\n────────────────────────────────────\n\n"
            );
        }
    }
}