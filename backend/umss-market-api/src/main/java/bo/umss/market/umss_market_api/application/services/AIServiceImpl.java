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

        // TOOL: Búsqueda de publicaciones
        if (texto.contains("buscar")
                || texto.contains("producto")
                || texto.contains("publicación")
                || texto.contains("catalogo")
                || texto.contains("catálogo")) {

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
                        ✅ Tool ejecutado correctamente.

                        No se encontraron publicaciones en el catálogo.

                        Esto puede deberse a que la base de datos aún no contiene publicaciones registradas.
                        """;
            }

            StringBuilder respuesta = new StringBuilder();

            respuesta.append("Se encontraron las siguientes publicaciones:\n\n");

            for (PublicationSummaryResponse p : publicaciones) {

                respuesta.append("• ")
                        .append(p.getNombre());

                if (p.getPrecio() != null) {
                    respuesta.append(" - Bs. ")
                            .append(p.getPrecio());
                }

                if (p.getNombreTienda() != null) {
                    respuesta.append(" (")
                            .append(p.getNombreTienda())
                            .append(")");
                }

                respuesta.append("\n");
            }

            return respuesta.toString();
        }

        // Si no requiere un Tool, responde usando la IA
        return provider.generate(message);
    }
}