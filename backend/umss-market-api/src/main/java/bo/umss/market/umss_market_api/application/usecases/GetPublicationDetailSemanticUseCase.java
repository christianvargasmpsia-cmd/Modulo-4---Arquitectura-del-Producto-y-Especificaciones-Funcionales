package bo.umss.market.umss_market_api.application.usecases;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetPublicationDetailSemanticUseCase {

    private final PublicationRepositoryPort publicationRepository;
    private final StoreRepositoryPort storeRepository;
    private final AIProviderPort aiProvider;

    // ============================================================
    // RAG #2 - DETALLE DIRECTO DE PUBLICACIÓN
    // ============================================================

    public String executeWithContext(
            UUID publicationId,
            String question
    ) {

        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Publicación no encontrada"
                        )
                );

        Store store = storeRepository.findById(pub.getStoreId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tienda no encontrada"
                        )
                );

        String contexto = String.format("""
                Publicación: %s

                Descripción: %s
                Precio: Bs. %s
                Stock disponible: %d
                Tipo: %s
                Modalidad de pago: %s
                Tienda: %s (%s)

                Pregunta del usuario: %s
                """,
                pub.getNombre(),
                pub.getDescripcion(),
                pub.getPrecio(),
                pub.getStock(),
                pub.getTipo(),
                pub.getModalidadCobro(),
                store.getNombre(),
                store.getDescripcion(),
                question
        );

        String prompt = """
                Eres asistente de UMSS Market.

                Tienes la siguiente información de una publicación:

                %s

                Responde la pregunta del usuario de forma clara y concisa,
                basándote únicamente en la información proporcionada.
                """.formatted(contexto);

        return aiProvider.generate(prompt);
    }

    // ============================================================
    // RAG #2 - BÚSQUEDA SEMÁNTICA
    // ============================================================

    public String executeSemanticSearch(String query) {

        // --------------------------------------------------------
        // 1. GENERAR EMBEDDING DE LA CONSULTA
        // --------------------------------------------------------

        List<Double> queryEmbedding =
                aiProvider.generateEmbedding(query);

        if (queryEmbedding == null
                || queryEmbedding.isEmpty()) {

            return "No pude generar el embedding de tu consulta.";
        }

        // --------------------------------------------------------
        // 2. OBTENER PUBLICACIONES
        // --------------------------------------------------------

        List<Publication> publications =
                publicationRepository.findAll();

        if (publications == null
                || publications.isEmpty()) {

            return "No encontré publicaciones con esa descripción.";
        }

        // --------------------------------------------------------
        // 3. BUSCAR LA PUBLICACIÓN MÁS RELEVANTE
        // --------------------------------------------------------

        Publication bestPublication = null;
        double bestSimilarity = -1.0;

        for (Publication publication : publications) {

            if (publication.getEmbedding() == null
                    || publication.getEmbedding().isBlank()) {

                continue;
            }

            try {

                List<Double> publicationEmbedding =
                        parseEmbedding(
                                publication.getEmbedding()
                        );

                if (publicationEmbedding.isEmpty()) {
                    continue;
                }

                double similarity =
                        cosineSimilarity(
                                queryEmbedding,
                                publicationEmbedding
                        );

                if (similarity > bestSimilarity) {

                    bestSimilarity = similarity;
                    bestPublication = publication;
                }

            } catch (Exception e) {

                System.out.println(
                        "⚠ No se pudo procesar embedding "
                                + "de publicación "
                                + publication.getId()
                );

                System.out.println(
                        "   Error: "
                                + e.getMessage()
                );
            }
        }

        // --------------------------------------------------------
        // 4. VALIDAR RESULTADO
        // --------------------------------------------------------

        if (bestPublication == null) {

            return """
                    No encontré publicaciones con esa descripción.

                    No existen publicaciones con embeddings
                    válidos para realizar la búsqueda semántica.
                    """;
        }

        // --------------------------------------------------------
        // 5. OBTENER TIENDA
        // --------------------------------------------------------

        Store store = storeRepository
                .findById(bestPublication.getStoreId())
                .orElse(null);

        String nombreTienda =
                store != null
                        ? store.getNombre()
                        : "Tienda no disponible";

        // --------------------------------------------------------
        // 6. CONSTRUIR CONTEXTO RAG
        // --------------------------------------------------------

        String contexto = String.format("""
                Publicación encontrada:
                
                Nombre: %s
                Precio: Bs. %s
                Stock: %d unidades
                Tipo: %s
                Modalidad de pago: %s
                Tienda: %s
                Descripción: %s

                Similitud semántica: %.4f
                """,
                bestPublication.getNombre(),
                bestPublication.getPrecio(),
                bestPublication.getStock(),
                bestPublication.getTipo(),
                bestPublication.getModalidadCobro(),
                nombreTienda,
                bestPublication.getDescripcion(),
                bestSimilarity
        );

        // --------------------------------------------------------
        // 7. GENERAR RESPUESTA CON IA
        // --------------------------------------------------------

        String prompt = """
                Eres asistente de UMSS Market.

                El usuario realizó la siguiente consulta:

                "%s"

                Mediante búsqueda semántica se encontró
                la siguiente publicación:

                %s

                Responde de forma clara, útil y concisa.

                Utiliza únicamente la información de la
                publicación proporcionada.

                Si preguntó por características, explica
                la descripción disponible.

                Si preguntó por precio, proporciona el precio.

                Si preguntó por stock, proporciona el stock.

                Si preguntó por la tienda, proporciona
                el nombre de la tienda.

                No inventes información que no esté
                presente en el contexto.
                """.formatted(
                query,
                contexto
        );

        return aiProvider.generate(prompt);
    }

    // ============================================================
    // PARSEAR EMBEDDING JSON
    // ============================================================

    private List<Double> parseEmbedding(String embedding) {

        if (embedding == null
                || embedding.isBlank()) {

            return List.of();
        }

        String normalized =
                embedding.trim();

        // Eliminar corchetes
        if (normalized.startsWith("[")
                && normalized.endsWith("]")) {

            normalized = normalized.substring(
                    1,
                    normalized.length() - 1
            );
        }

        if (normalized.isBlank()) {
            return List.of();
        }

        String[] values =
                normalized.split(",");

        List<Double> result =
                new ArrayList<>();

        for (String value : values) {

            String cleanValue =
                    value.trim();

            if (cleanValue.isBlank()) {
                continue;
            }

            result.add(
                    Double.parseDouble(cleanValue)
            );
        }

        return result;
    }

    // ============================================================
    // COSINE SIMILARITY
    // ============================================================

    private double cosineSimilarity(
            List<Double> vectorA,
            List<Double> vectorB
    ) {

        if (vectorA == null
                || vectorB == null
                || vectorA.isEmpty()
                || vectorB.isEmpty()) {

            return 0.0;
        }

        if (vectorA.size() != vectorB.size()) {

            return 0.0;
        }

        double dotProduct = 0.0;
        double magnitudeA = 0.0;
        double magnitudeB = 0.0;

        for (int i = 0;
             i < vectorA.size();
             i++) {

            double a = vectorA.get(i);
            double b = vectorB.get(i);

            dotProduct += a * b;

            magnitudeA += a * a;
            magnitudeB += b * b;
        }

        if (magnitudeA == 0.0
                || magnitudeB == 0.0) {

            return 0.0;
        }

        return dotProduct /
                (
                        Math.sqrt(magnitudeA)
                                * Math.sqrt(magnitudeB)
                );
    }
}