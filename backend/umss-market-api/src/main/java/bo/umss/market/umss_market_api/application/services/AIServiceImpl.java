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

    @Override
    public String chat(String message) {
        String texto = message == null ? "" : message.trim();

        if (texto.isBlank()) {
            return """
                    No puedo responder esa consulta.

                    Puedo ayudarte con:
                    - Buscar publicaciones
                    - Buscar productos
                    - Buscar servicios
                    """;
        }

        // Escenario 1: búsqueda controlada por palabras clave
        if (isCatalogSearchRequest(texto)) {
            return executeCatalogSearch(texto, "KEYWORD", !iaEnabled);
        }

        // Escenario 4: IA deshabilitada
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

        // Escenario 2: LLM decide usar la herramienta
        ToolDecision decision = provider.selectTool(texto);

        if (decision != null
                && "SEARCH_CATALOG".equalsIgnoreCase(decision.getTool())
                && decision.getQuery() != null
                && !decision.getQuery().isBlank()) {

            return executeCatalogSearch(decision.getQuery(), "LLM", false);
        }

        // Escenario 3: fuera de alcance
        return """
                No puedo responder esa consulta.

                Puedo ayudarte con:
                - Buscar publicaciones
                - Buscar productos
                - Buscar servicios
                """;
    }

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

    private String executeCatalogSearch(String message, String camino, boolean showDisabledBanner) {
        CatalogFilterRequest request = new CatalogFilterRequest();

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

        StringBuilder respuesta = new StringBuilder();

        if (showDisabledBanner) {
            respuesta.append("Estado IA: DESHABILITADA\n\n");
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
            respuesta.append("La consulta se resuelve directamente mediante palabras clave.\n\n");
        }

        if (publicaciones.isEmpty()) {
            respuesta.append("No encontré publicaciones que coincidan con tu búsqueda.");
            return respuesta.toString();
        }

        respuesta.append("Encontré las siguientes publicaciones:\n\n");

        for (PublicationSummaryResponse p : publicaciones) {
            respuesta.append("📦 Producto: ").append(p.getNombre()).append("\n");

            if (p.getDescripcion() != null && !p.getDescripcion().isBlank()) {
                respuesta.append("📝 Descripción: ").append(p.getDescripcion()).append("\n");
            }

            if (p.getPrecio() != null) {
                respuesta.append("💰 Precio: Bs. ").append(p.getPrecio()).append("\n");
            }

            if (p.getNombreTienda() != null) {
                respuesta.append("🏪 Tienda: ").append(p.getNombreTienda()).append("\n");
            }

            if (p.getStock() != null) {
                respuesta.append("📦 Stock disponible: ").append(p.getStock()).append("\n");
            }

            respuesta.append("\n────────────────────────────────────\n\n");
        }

        return respuesta.toString();
    }
}