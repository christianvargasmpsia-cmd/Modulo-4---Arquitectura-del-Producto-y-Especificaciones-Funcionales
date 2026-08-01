package bo.umss.market.umss_market_api.application.services;

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.application.usecases.SearchCatalogUseCase;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIServiceImpl implements AIService {

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
        return provider.generate(prompt);
    }

    @Override
    public String chat(String message) {

        String texto = message.toLowerCase();

        // TOOL: Búsqueda de publicaciones del catálogo
        if (texto.contains("buscar")
                || texto.contains("producto")
                || texto.contains("productos")
                || texto.contains("publicación")
                || texto.contains("publicaciones")
                || texto.contains("catálogo")
                || texto.contains("catalogo")) {

            CatalogFilterRequest request = new CatalogFilterRequest();

            // Limpia palabras comunes para mejorar la búsqueda
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

            if (publicaciones.isEmpty()) {
                return """
                        🤖 UMSS Market AI

                        No encontré publicaciones que coincidan con tu búsqueda.

                        Puedes intentar con otros términos o agregar nuevas publicaciones al catálogo.
                        """;
            }

            StringBuilder respuesta = new StringBuilder();

            respuesta.append("""
                    🤖 UMSS Market AI
                    
                    Encontré las siguientes publicaciones para ti:
                    
                    """);

            for (PublicationSummaryResponse p : publicaciones) {

                respuesta.append("📦 Producto: ")
                        .append(p.getNombre())
                        .append("\n");

                if (p.getDescripcion() != null && !p.getDescripcion().isBlank()) {
                    respuesta.append("📝 Descripción: ")
                            .append(p.getDescripcion())
                            .append("\n");
                }

                if (p.getPrecio() != null) {
                    respuesta.append("💰 Precio: Bs. ")
                            .append(p.getPrecio())
                            .append("\n");
                }

                if (p.getNombreTienda() != null) {
                    respuesta.append("🏪 Tienda: ")
                            .append(p.getNombreTienda())
                            .append("\n");
                }

                if (p.getStock() != null) {
                    respuesta.append("📦 Stock disponible: ")
                            .append(p.getStock())
                            .append("\n");
                }

                respuesta.append("\n────────────────────────────────────\n\n");
            }

            respuesta.append("""
                    ✅ Consulta realizada mediante la herramienta de búsqueda del catálogo.

                    💡 Puedes pedirme otra búsqueda escribiendo, por ejemplo:
                    • Buscar celulares
                    • Buscar servicios de diseño
                    • Buscar productos tecnológicos
                    """);

            return respuesta.toString();
        }

        // Si no requiere un Tool, responde usando la IA
        return provider.generate(message);
    }
}