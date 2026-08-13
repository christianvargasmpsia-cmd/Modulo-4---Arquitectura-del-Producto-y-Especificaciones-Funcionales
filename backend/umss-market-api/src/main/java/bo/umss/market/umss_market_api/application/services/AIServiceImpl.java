package bo.umss.market.umss_market_api.application.services;

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.application.dto.ToolDecision;
import bo.umss.market.umss_market_api.application.usecases.SearchCatalogUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetPublicationDetailSemanticUseCase;
import bo.umss.market.umss_market_api.application.usecases.SearchStoresBySemanticUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetUserInteractionsSemanticUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetRecommendationsUseCase;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AIServiceImpl implements AIService {

    @Value("${ia.enabled:${IA_HABILITADA:false}}")
    private boolean iaEnabled;

    private final AIProviderPort provider;
    private final SearchCatalogUseCase searchCatalogUseCase;
    
    @Autowired(required = false)
    private GetPublicationDetailSemanticUseCase publicationDetailUseCase;
    
    @Autowired(required = false)
    private SearchStoresBySemanticUseCase searchStoresUseCase;
    
    @Autowired(required = false)
    private GetUserInteractionsSemanticUseCase userInteractionsUseCase;
    
    @Autowired(required = false)
    private GetRecommendationsUseCase recommendationsUseCase;

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
        // IA DESHABILITADA - SOLO BÚSQUEDA POR PALABRAS CLAVE
        // =====================================================

        if (!iaEnabled) {

            if (isCatalogSearchRequest(texto)) {
                return executeCatalogSearch(texto, "KEYWORD", true);
            }

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
        // ESCENARIO 2
        // IA HABILITADA - USAR selectTool() PARA DECIDIR
        // =====================================================

        ToolDecision decision = provider.selectTool(texto);

        if (decision == null || decision.getTool() == null) {
            return """
                    No puedo responder esa consulta.

                    Puedo ayudarte con:
                    - Buscar publicaciones
                    - Buscar productos
                    - Buscar servicios
                    """;
        }

        String tool = decision.getTool().toUpperCase();

        switch (tool) {
            case "SEARCH_CATALOG":
                return executeSemanticCatalogSearch(
                        texto,
                        "RAG_SEMANTICO_CATALOGO"
                );

            case "PUBLICATION_DETAIL":
                if (publicationDetailUseCase != null) {
                    UUID pubId = extractPublicationId(decision);
                    if (pubId != null) {
                        return publicationDetailUseCase.executeWithContext(pubId, texto);
                    }
                }
                return "No pude obtener detalles de esa publicación.";

            case "SEARCH_STORES":
                if (searchStoresUseCase != null) {
                    return searchStoresUseCase.executeSemanticSearch(texto);
                }
                return "No pude buscar tiendas en este momento.";

            case "USER_INTERACTIONS":
                if (userInteractionsUseCase != null) {
                    UUID userId = getCurrentUserId();
                    if (userId != null) {
                        return userInteractionsUseCase.executeUserHistory(userId, texto);
                    }
                }
                return "No pude acceder a tu historial de interacciones.";

            case "RECOMMENDATIONS":
                if (recommendationsUseCase != null) {
                    UUID userId = getCurrentUserId();
                    if (userId != null) {
                        return recommendationsUseCase.getRecommendations(userId, texto);
                    }
                }
                return "No pude generar recomendaciones en este momento.";

            default:
                return """
                        No puedo responder esa consulta.

                        Puedo ayudarte con:
                        - Buscar publicaciones
                        - Buscar productos
                        - Buscar servicios
                        """;
        }
    }

    /**
     * Detecta consultas que corresponden directamente
     * al catálogo por palabras clave.
     */
    private boolean isCatalogSearchRequest(String message) {

        String texto = message.toLowerCase(Locale.ROOT);

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

        respuesta.append("Camino: ")
                .append(camino)
                .append("\n\n");

        if (publicaciones == null || publicaciones.isEmpty()) {
            respuesta.append(
                    "No encontré publicaciones con esa búsqueda.\n"
            );
        } else {

            respuesta.append(
                    "Encontré "
            )
                    .append(publicaciones.size())
                    .append(" publicaciones:\n\n");

            for (PublicationSummaryResponse p
                    : publicaciones) {

                respuesta.append("📌 ")
                        .append(p.getNombre())
                        .append("\n");

                respuesta.append(
                        "   Precio: Bs. "
                )
                        .append(p.getPrecio())
                        .append("\n");

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

        return respuesta.toString();
    }

    /**
     * Búsqueda semántica mediante RAG.
     */
    private String executeSemanticCatalogSearch(
            String message,
            String camino) {

        List<PublicationSummaryResponse> publicaciones =
                searchCatalogUseCase.executeSemanticSearch(
                        message,
                        5
                );

        StringBuilder respuesta =
                new StringBuilder();

        respuesta.append("Camino: ")
                .append(camino)
                .append("\n\n");

        if (publicaciones == null || publicaciones.isEmpty()) {
            respuesta.append(
                    "No encontré publicaciones que coincidan con tu búsqueda.\n"
            );
        } else {

            respuesta.append(
                    "Encontré "
            )
                    .append(publicaciones.size())
                    .append(" publicaciones relevantes:\n\n");

            for (PublicationSummaryResponse p
                    : publicaciones) {

                respuesta.append("📌 ")
                        .append(p.getNombre())
                        .append("\n");

                respuesta.append(
                        "   Precio: Bs. "
                )
                        .append(p.getPrecio())
                        .append("\n");

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

        return respuesta.toString();
    }

    /**
     * Extrae el ID de publicación desde la decisión del LLM.
     */
    private UUID extractPublicationId(ToolDecision decision) {
        if (decision == null || decision.getQuery() == null) {
                return null;
        }
        
        try {
                // Intenta parsear la query como UUID
                return UUID.fromString(decision.getQuery());
        } catch (Exception e) {
                return null;
        }
        }

    /**
     * Obtiene el ID del usuario actual desde el contexto de seguridad.
     */
    private UUID getCurrentUserId() {
        // TODO: Implementar extracción de userId desde SecurityContext o JWT
        // Por ahora retorna null
        return null;
    }
}