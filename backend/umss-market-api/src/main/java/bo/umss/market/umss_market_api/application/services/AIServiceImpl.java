package bo.umss.market.umss_market_api.application.services;

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.application.usecases.SearchCatalogUseCase;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class AIServiceImpl implements AIService {

    @Value("${ia.enabled:true}")
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
        if (isCatalogSearchRequest(message)) {
            return executeCatalogSearch(message);
        }

        if (!iaEnabled) {
            return """
                    La IA está deshabilitada.

                    Solo puedo ayudarte con:
                    - Buscar publicaciones
                    - Buscar productos
                    - Buscar servicios
                    """;
        }

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

    private String executeCatalogSearch(String message) {
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

        respuesta.append("""
                Herramienta:
                SEARCH_CATALOG

                Fuente:
                publications

                Camino:
                KEYWORD

                """);

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