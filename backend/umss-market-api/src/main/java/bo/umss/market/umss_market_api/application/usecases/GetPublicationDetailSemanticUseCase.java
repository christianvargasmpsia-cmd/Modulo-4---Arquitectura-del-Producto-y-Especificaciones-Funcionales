package bo.umss.market.umss_market_api.application.usecases;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
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
    // RAG #2 - DETALLE DIRECTO POR UUID
    // ============================================================

    public String executeWithContext(
            UUID publicationId,
            String question) {

        Publication pub = publicationRepository.findById(publicationId)
                .orElse(null);

        if (pub == null) {
            return "No encontré la publicación solicitada.";
        }

        Store store = storeRepository.findById(pub.getStoreId())
                .orElse(null);

        String nombreTienda =
                store != null
                        ? store.getNombre()
                        : "Tienda no disponible";

        String descripcionTienda =
                store != null
                        ? store.getDescripcion()
                        : "";

        String contexto = String.format("""
                Publicación:
                Nombre: %s
                Descripción: %s
                Precio: Bs. %s
                Stock disponible: %d
                Tipo: %s
                Modalidad de pago: %s

                Tienda:
                Nombre: %s
                Descripción: %s

                Pregunta del usuario:
                %s
                """,
                safe(pub.getNombre()),
                safe(pub.getDescripcion()),
                pub.getPrecio(),
                pub.getStock(),
                pub.getTipo(),
                pub.getModalidadCobro(),
                nombreTienda,
                descripcionTienda,
                safe(question)
        );

        String prompt = """
                Eres el asistente de UMSS Market.

                Responde la pregunta utilizando únicamente
                la información proporcionada en el contexto.

                CONTEXTO:
                %s

                REGLAS:
                - Si preguntan por el precio, indica el precio.
                - Si preguntan por el stock, indica el stock.
                - Si preguntan por características, utiliza únicamente
                  la descripción disponible.
                - Si preguntan por la tienda, indica el nombre.
                - No inventes características.
                - No inventes precios.
                - No inventes stock.
                - Sé claro y conciso.

                Respuesta:
                """.formatted(contexto);

        return aiProvider.generate(prompt);
    }

    // ============================================================
    // RAG #2 - BÚSQUEDA SEMÁNTICA / TEXTUAL
    // ============================================================

    public String executeSemanticSearch(String query) {

        if (query == null || query.isBlank()) {
            return "No recibí una consulta válida.";
        }

        String cleanQuery = query.trim();

        // ========================================================
        // PASO 1
        // INTENTAR ENCONTRAR LA PUBLICACIÓN POR TEXTO
        // ========================================================

        Publication publication =
                findPublicationByText(cleanQuery);

        if (publication != null) {

            System.out.println(
                    "RAG #2 -> publicación encontrada por texto: "
                            + publication.getNombre()
            );

            return generatePublicationAnswer(
                    publication,
                    cleanQuery
            );
        }

        // ========================================================
        // PASO 2
        // SI NO HAY MATCH TEXTUAL -> BÚSQUEDA SEMÁNTICA
        // ========================================================

        System.out.println(
                "RAG #2 -> no hubo match textual."
        );

        System.out.println(
                "RAG #2 -> intentando búsqueda semántica."
        );

        return executeEmbeddingSearch(cleanQuery);
    }

    // ============================================================
    // BÚSQUEDA TEXTUAL
    // ============================================================

    private Publication findPublicationByText(
            String query) {

        /*
         * Primero intentamos extraer el nombre del producto
         * desde la pregunta.
         *
         * Ejemplo:
         *
         * "¿Cuánto cuesta el Mouse Inalambrico?"
         *
         * se transforma en:
         *
         * "Mouse Inalambrico"
         */

        String normalizedQuery =
                normalize(query);

        List<Publication> publications =
                publicationRepository.findAll();

        if (publications == null || publications.isEmpty()) {
            return null;
        }

        // --------------------------------------------------------
        // 1. MATCH EXACTO DEL NOMBRE
        // --------------------------------------------------------

        for (Publication publication : publications) {

            if (!Boolean.TRUE.equals(publication.getActiva())) {
                continue;
            }

            String nombre =
                    normalize(publication.getNombre());

            if (nombre.isBlank()) {
                continue;
            }

            if (normalizedQuery.contains(nombre)) {

                return publication;
            }
        }

        // --------------------------------------------------------
        // 2. MATCH POR PALABRAS DEL NOMBRE
        // --------------------------------------------------------

        List<String> words =
                extractMeaningfulWords(normalizedQuery);

        if (words.isEmpty()) {
            return null;
        }

        Publication bestPublication = null;
        int bestScore = 0;

        for (Publication publication : publications) {

            if (!Boolean.TRUE.equals(publication.getActiva())) {
                continue;
            }

            String nombre =
                    normalize(publication.getNombre());

            if (nombre.isBlank()) {
                continue;
            }

            int score = 0;

            for (String word : words) {

                if (word.length() < 3) {
                    continue;
                }

                if (nombre.contains(word)) {
                    score++;
                }
            }

            if (score > bestScore) {

                bestScore = score;
                bestPublication = publication;
            }
        }

        /*
         * Exigimos al menos una coincidencia.
         */
        return bestScore > 0
                ? bestPublication
                : null;
    }

    // ============================================================
    // BÚSQUEDA POR EMBEDDINGS
    // ============================================================

    private String executeEmbeddingSearch(
            String query) {

        List<Double> queryEmbedding =
                aiProvider.generateEmbedding(query);

        if (queryEmbedding == null
                || queryEmbedding.isEmpty()) {

            return """
                    No pude procesar semánticamente tu consulta.
                    """;
        }

        List<Publication> publications =
                publicationRepository.findAll();

        if (publications == null
                || publications.isEmpty()) {

            return "No encontré publicaciones disponibles.";
        }

        List<SemanticResult> results =
                new ArrayList<>();

        for (Publication publication : publications) {

            if (!Boolean.TRUE.equals(publication.getActiva())) {
                continue;
            }

            String embedding =
                    publication.getEmbedding();

            if (embedding == null
                    || embedding.isBlank()) {

                continue;
            }

            try {

                List<Double> publicationEmbedding =
                        parseEmbedding(embedding);

                if (publicationEmbedding.isEmpty()) {
                    continue;
                }

                double similarity =
                        cosineSimilarity(
                                queryEmbedding,
                                publicationEmbedding
                        );

                results.add(
                        new SemanticResult(
                                publication,
                                similarity
                        )
                );

            } catch (Exception e) {

                System.out.println(
                        "RAG #2 -> Error procesando embedding de "
                                + publication.getId()
                );

                System.out.println(
                        "Error: " + e.getMessage()
                );
            }
        }

        if (results.isEmpty()) {

            return """
                    No encontré publicaciones con información
                    suficiente para responder tu consulta.
                    """;
        }

        /*
         * Ordenar por similitud.
         */
        results.sort(
                Comparator.comparingDouble(
                        SemanticResult::similarity
                ).reversed()
        );

        SemanticResult best =
                results.get(0);

        /*
         * Umbral mínimo.
         *
         * Evita devolver una publicación completamente
         * irrelevante para una pregunta de detalle.
         */
        if (best.similarity() < 0.25) {

            return """
                    No encontré una publicación suficientemente
                    relacionada con tu consulta.
                    """;
        }

        System.out.println(
                "RAG #2 -> publicación semántica: "
                        + best.publication().getNombre()
        );

        System.out.println(
                "RAG #2 -> similitud: "
                        + best.similarity()
        );

        return generatePublicationAnswer(
                best.publication(),
                query
        );
    }

    // ============================================================
    // GENERAR RESPUESTA DEL DETALLE
    // ============================================================

    private String generatePublicationAnswer(
            Publication publication,
            String question) {

        Store store =
                storeRepository.findById(
                        publication.getStoreId()
                ).orElse(null);

        String nombreTienda =
                store != null
                        ? store.getNombre()
                        : "Tienda no disponible";

        String descripcionTienda =
                store != null
                        ? store.getDescripcion()
                        : "";

        String contexto = String.format("""
                PUBLICACIÓN

                Nombre:
                %s

                Descripción:
                %s

                Precio:
                Bs. %s

                Stock:
                %d unidades

                Tipo:
                %s

                Modalidad de pago:
                %s

                TIENDA

                Nombre:
                %s

                Descripción:
                %s
                """,
                safe(publication.getNombre()),
                safe(publication.getDescripcion()),
                publication.getPrecio(),
                publication.getStock(),
                publication.getTipo(),
                publication.getModalidadCobro(),
                nombreTienda,
                descripcionTienda
        );

        String prompt = """
                Eres el asistente de UMSS Market.

                El usuario pregunta:

                "%s"

                La información recuperada del catálogo es:

                %s

                Responde utilizando ÚNICAMENTE la información
                recuperada.

                Reglas:

                1. Si pregunta por el precio:
                   responde únicamente con el precio disponible.

                2. Si pregunta por stock:
                   responde con la cantidad disponible.

                3. Si pregunta por características:
                   utiliza la descripción de la publicación.

                4. Si pregunta por la tienda:
                   indica el nombre de la tienda.

                5. Si pregunta por modalidad de pago:
                   indica la modalidad registrada.

                6. No inventes información.

                7. Si la información solicitada no está disponible,
                   dilo claramente.

                8. Responde en español.

                9. Sé claro y conciso.

                Respuesta:
                """.formatted(
                question,
                contexto
        );

        return aiProvider.generate(prompt);
    }

    // ============================================================
    // PARSEAR EMBEDDING
    // ============================================================

    private List<Double> parseEmbedding(
            String embedding) {

        if (embedding == null
                || embedding.isBlank()) {

            return List.of();
        }

        String normalized =
                embedding.trim();

        /*
         * Formato:
         *
         * [0.123,0.456,0.789]
         */
        if (normalized.startsWith("[")
                && normalized.endsWith("]")) {

            normalized =
                    normalized.substring(
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
            List<Double> vectorB) {

        if (vectorA == null
                || vectorB == null
                || vectorA.isEmpty()
                || vectorB.isEmpty()) {

            return 0.0;
        }

        if (vectorA.size()
                != vectorB.size()) {

            System.out.println(
                    "RAG #2 -> embeddings con dimensiones diferentes: "
                            + vectorA.size()
                            + " vs "
                            + vectorB.size()
            );

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

    // ============================================================
    // NORMALIZACIÓN
    // ============================================================

    private String normalize(String text) {

        if (text == null) {
            return "";
        }

        return text
                .toLowerCase(Locale.ROOT)
                .replaceAll("[¿?¡!.,;:()\\[\\]\"']", " ")
                .replaceAll(
                        "\\b(cuanto|cuesta|precio|vale|valor|caracteristicas|características|del|de|la|el|un|una|que|qué|tiene|tienen|como|cómo|es|son)\\b",
                        " "
                )
                .replaceAll("\\s+", " ")
                .trim();
    }

    // ============================================================
    // EXTRAER PALABRAS SIGNIFICATIVAS
    // ============================================================

    private List<String> extractMeaningfulWords(
            String text) {

        if (text == null || text.isBlank()) {
            return List.of();
        }

        return List.of(text.split("\\s+"))
                .stream()
                .filter(word -> word.length() >= 3)
                .toList();
    }

    // ============================================================
    // SAFE
    // ============================================================

    private String safe(String value) {

        return value == null
                ? "No disponible"
                : value;
    }

    // ============================================================
    // RESULTADO SEMÁNTICO
    // ============================================================

    private record SemanticResult(
            Publication publication,
            double similarity) {
    }
}