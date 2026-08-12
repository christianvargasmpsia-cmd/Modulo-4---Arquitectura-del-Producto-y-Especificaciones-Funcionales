package bo.umss.market.umss_market_api.application.usecases;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.domain.exceptions.InvalidPriceRangeException;
import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SearchCatalogUseCase {

    private final PublicationRepositoryPort publicationRepository;
    private final StoreRepositoryPort storeRepository;
    private final AIProviderPort aiProvider;

    /**
     * Búsqueda tradicional del catálogo.
     *
     * Este método se mantiene para no romper
     * el funcionamiento actual del sistema.
     */
    public List<PublicationSummaryResponse> execute(
            CatalogFilterRequest request) {

        if (request.getPrecioMin() != null
                && request.getPrecioMax() != null
                && request.getPrecioMin()
                        .compareTo(request.getPrecioMax()) > 0) {

            throw new InvalidPriceRangeException(
                    "precioMin no puede ser mayor que precioMax");
        }

        String textoNormalizado = request.getTexto() != null
                ? request.getTexto().trim()
                : null;

        CatalogFilter filter = CatalogFilter.builder()
                .textoBusqueda(textoNormalizado)
                .tipo(request.getTipo())
                .precioMin(request.getPrecioMin())
                .precioMax(request.getPrecioMax())
                .storeId(request.getStoreId())
                .build();

        return publicationRepository.findByFilters(filter)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    /**
     * Búsqueda semántica utilizada por RAG.
     *
     * El texto de la consulta se transforma en un embedding
     * y se compara con los embeddings de las publicaciones.
     *
     * @param query texto escrito por el usuario
     * @param topK cantidad máxima de resultados relevantes
     * @return publicaciones ordenadas por similitud semántica
     */
    public List<PublicationSummaryResponse> executeSemanticSearch(
            String query,
            int topK) {

        if (query == null || query.isBlank()) {
            return List.of();
        }

        if (topK <= 0) {
            return List.of();
        }

        /*
         * 1. Convertimos la pregunta del usuario
         *    en un embedding.
         */
        List<Double> queryEmbedding =
                aiProvider.generateEmbedding(query.trim());

        if (queryEmbedding.isEmpty()) {
            return List.of();
        }

        /*
         * 2. Obtenemos las publicaciones existentes.
         *
         * No modificamos PostgreSQL.
         * Utilizamos el repositorio que ya existe.
         */
        List<Publication> publications =
                publicationRepository.findAll();

        /*
         * 3. Calculamos la similitud entre la pregunta
         *    y cada publicación.
         */
        List<SemanticResult> results =
                new ArrayList<>();

        for (Publication publication : publications) {

            /*
             * Solo consideramos publicaciones activas.
             */
            if (Boolean.FALSE.equals(publication.getActiva())) {
                continue;
            }

            String publicationText =
                    buildPublicationText(publication);

            if (publicationText.isBlank()) {
                continue;
            }

            List<Double> publicationEmbedding =
                    aiProvider.generateEmbedding(
                            publicationText);

            if (publicationEmbedding.isEmpty()) {
                continue;
            }

            double similarity =
                    cosineSimilarity(
                            queryEmbedding,
                            publicationEmbedding);

            results.add(
                    new SemanticResult(
                            publication,
                            similarity));
        }

        /*
         * 4. Ordenamos de mayor a menor similitud.
         */
        return results.stream()
                .sorted(
                        Comparator.comparingDouble(
                                SemanticResult::similarity)
                                .reversed())
                .limit(topK)
                .map(result ->
                        toSummaryResponse(
                                result.publication()))
                .toList();
    }

    /**
     * Construye el texto que representa semánticamente
     * una publicación.
     *
     * Este texto será enviado al modelo de embeddings.
     */
    private String buildPublicationText(
            Publication publication) {

        StringBuilder text =
                new StringBuilder();

        if (publication.getNombre() != null) {
            text.append("Nombre: ")
                    .append(publication.getNombre())
                    .append(". ");
        }

        if (publication.getDescripcion() != null) {
            text.append("Descripción: ")
                    .append(publication.getDescripcion())
                    .append(". ");
        }

        if (publication.getTipo() != null) {
            text.append("Tipo: ")
                    .append(publication.getTipo())
                    .append(". ");
        }

        if (publication.getPrecio() != null) {
            text.append("Precio: ")
                    .append(publication.getPrecio())
                    .append(" bolivianos. ");
        }

        return text.toString().trim();
    }

    /**
     * Calcula la similitud coseno entre dos embeddings.
     *
     * Resultado:
     *
     * 1.0  -> muy similares
     * 0.0  -> sin similitud
     * -1.0 -> opuestos
     */
    private double cosineSimilarity(
            List<Double> vectorA,
            List<Double> vectorB) {

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
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.size(); i++) {

            double a = vectorA.get(i);
            double b = vectorB.get(i);

            dotProduct += a * b;

            normA += a * a;
            normB += b * b;
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct
                / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Convierte Publication del dominio
     * en la respuesta que ya utiliza el proyecto.
     */
    private PublicationSummaryResponse toSummaryResponse(
            Publication publication) {

        Optional<Store> store =
                storeRepository.findById(
                        publication.getStoreId());

        String nombreTienda =
                store.map(Store::getNombre)
                        .orElse(null);

        return PublicationSummaryResponse.builder()
                .id(publication.getId())
                .nombre(publication.getNombre())
                .descripcion(publication.getDescripcion())
                .precio(publication.getPrecio())
                .tipo(publication.getTipo())
                .stock(publication.getStock())
                .modalidadCobro(
                        publication.getModalidadCobro())
                .storeId(publication.getStoreId())
                .nombreTienda(nombreTienda)
                .activa(publication.getActiva())
                .build();
    }

    /**
     * Resultado interno de la búsqueda semántica.
     */
    private record SemanticResult(
            Publication publication,
            double similarity) {
    }
}