package bo.umss.market.umss_market_api.application.usecases;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

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
public class SearchStoresBySemanticUseCase {

    private final StoreRepositoryPort storeRepository;
    private final PublicationRepositoryPort publicationRepository;
    private final AIProviderPort aiProvider;

    /**
     * Búsqueda semántica de tiendas.
     *
     * La consulta del usuario se transforma en un embedding.
     * Cada tienda se representa mediante:
     *
     * - Nombre
     * - Descripción
     * - Categoría
     * - Productos publicados
     *
     * Luego se calcula la similitud coseno entre la consulta
     * y cada tienda para seleccionar las tiendas más relevantes.
     */
    public String executeSemanticSearch(String query) {

        if (query == null || query.isBlank()) {
            return "No pude procesar tu consulta.";
        }

        String normalizedQuery = query.trim();

        /*
         * ============================================================
         * 1. EMBEDDING DE LA CONSULTA
         * ============================================================
         */

        List<Double> queryEmbedding =
                aiProvider.generateEmbedding(normalizedQuery);

        if (queryEmbedding == null || queryEmbedding.isEmpty()) {
            return "No pude procesar tu consulta.";
        }

        /*
         * ============================================================
         * 2. OBTENER TIENDAS
         * ============================================================
         */

        List<Store> stores = storeRepository.findAll();

        if (stores == null || stores.isEmpty()) {
            return "No hay tiendas disponibles en UMSS Market.";
        }

        /*
         * ============================================================
         * 3. CONSTRUIR REPRESENTACIÓN SEMÁNTICA DE CADA TIENDA
         * ============================================================
         */

        List<SemanticStoreResult> results =
                new ArrayList<>();

        for (Store store : stores) {

            if (store == null) {
                continue;
            }

            /*
             * --------------------------------------------------------
             * Obtener publicaciones de la tienda
             * --------------------------------------------------------
             */

            CatalogFilter filter =
                    CatalogFilter.builder()
                            .storeId(store.getId())
                            .build();

            List<Publication> publications =
                    publicationRepository.findByFilters(filter);

            /*
             * --------------------------------------------------------
             * Construir texto semántico
             * --------------------------------------------------------
             */

            String storeText =
                    buildStoreText(
                            store,
                            publications
                    );

            if (storeText.isBlank()) {
                continue;
            }

            /*
             * --------------------------------------------------------
             * Generar embedding de la tienda
             * --------------------------------------------------------
             */

            List<Double> storeEmbedding =
                    aiProvider.generateEmbedding(storeText);

            if (storeEmbedding == null
                    || storeEmbedding.isEmpty()) {

                continue;
            }

            /*
             * --------------------------------------------------------
             * Calcular similitud
             * --------------------------------------------------------
             */

            double similarity =
                    cosineSimilarity(
                            queryEmbedding,
                            storeEmbedding
                    );

            results.add(
                    new SemanticStoreResult(
                            store,
                            publications,
                            similarity
                    )
            );
        }

        /*
         * ============================================================
         * 4. ORDENAR POR RELEVANCIA
         * ============================================================
         */

        List<SemanticStoreResult> relevantStores =
                results.stream()
                        .sorted(
                                Comparator.comparingDouble(
                                        SemanticStoreResult::similarity
                                ).reversed()
                        )
                        .limit(3)
                        .toList();

        if (relevantStores.isEmpty()) {
            return "No encontré tiendas relevantes para tu consulta.";
        }

        /*
         * ============================================================
         * 5. CONSTRUIR CONTEXTO PARA EL LLM
         * ============================================================
         */

        StringBuilder contexto =
                new StringBuilder();

        contexto.append(
                "Tiendas relevantes encontradas:\n\n"
        );

        for (SemanticStoreResult result :
                relevantStores) {

            Store store =
                    result.store();

            contexto.append(
                    String.format(
                            """
                            TIENDA
                            Nombre: %s
                            Descripción: %s
                            Categoría: %s
                            Contacto: %s
                            Relevancia: %.4f

                            PRODUCTOS:
                            """,
                            safe(store.getNombre()),
                            safe(store.getDescripcion()),
                            safe(store.getCategoria()),
                            safe(store.getEmailContacto()),
                            result.similarity()
                    )
            );

            /*
             * --------------------------------------------------------
             * Agregar productos
             * --------------------------------------------------------
             */

            result.publications()
                    .stream()
                    .filter(pub ->
                            pub != null
                            && !Boolean.FALSE.equals(
                                    pub.getActiva()
                            )
                    )
                    .limit(10)
                    .forEach(pub ->
                            contexto.append(
                                    String.format(
                                            """
                                              - %s
                                                Descripción: %s
                                                Tipo: %s
                                                Precio: Bs. %s
                                                Stock: %d
                                            """,
                                            safe(pub.getNombre()),
                                            safe(pub.getDescripcion()),
                                            pub.getTipo(),
                                            pub.getPrecio(),
                                            pub.getStock()
                                    )
                            )
                    );

            contexto.append("\n");
        }

        /*
         * ============================================================
         * 6. PROMPT DEL RAG
         * ============================================================
         */

        String prompt = """
                Eres el asistente de UMSS Market.

                El usuario realizó la siguiente consulta:

                "%s"

                Utiliza ÚNICAMENTE la información de las tiendas
                y productos proporcionados en el contexto.

                CONTEXTO:

                %s

                INSTRUCCIONES:

                1. Identifica la tienda o tiendas que mejor responden
                   a la consulta del usuario.

                2. Utiliza los productos publicados como evidencia.

                3. Si una tienda tiene productos relacionados con
                   tecnología, informática, computación o dispositivos,
                   considérala relevante para consultas sobre tecnología.

                4. No afirmes que no existe una tienda si el contexto
                   contiene productos relacionados.

                5. No inventes productos, precios, stock, categorías
                   ni tiendas.

                6. Menciona primero la tienda más relevante.

                7. Destaca los productos que justifican la recomendación.

                8. Si ninguna tienda es realmente relevante, dilo
                   claramente.

                Responde de forma breve, clara y natural.
                """.formatted(
                normalizedQuery,
                contexto
        );

        /*
         * ============================================================
         * 7. GENERAR RESPUESTA
         * ============================================================
         */

        return aiProvider.generate(prompt);
    }

    /**
     * Construye el texto utilizado para representar semánticamente
     * una tienda.
     */
    private String buildStoreText(
            Store store,
            List<Publication> publications) {

        StringBuilder text =
                new StringBuilder();

        text.append("Tienda: ");

        if (store.getNombre() != null) {
            text.append(store.getNombre());
        }

        text.append(". ");

        text.append("Descripción: ");

        if (store.getDescripcion() != null) {
            text.append(store.getDescripcion());
        }

        text.append(". ");

        text.append("Categoría: ");

        if (store.getCategoria() != null) {
            text.append(store.getCategoria());
        }

        text.append(". ");

        /*
         * Agregar productos al texto semántico.
         *
         * Esto es importante porque una tienda puede no tener
         * una categoría llamada "tecnología", pero sí vender
         * productos tecnológicos.
         */

        if (publications != null
                && !publications.isEmpty()) {

            text.append("Productos disponibles: ");

            publications.stream()
                    .filter(pub ->
                            pub != null
                            && !Boolean.FALSE.equals(
                                    pub.getActiva()
                            )
                    )
                    .limit(20)
                    .forEach(pub -> {

                        if (pub.getNombre() != null) {
                            text.append(
                                    pub.getNombre()
                            ).append(". ");
                        }

                        if (pub.getDescripcion() != null) {
                            text.append(
                                    pub.getDescripcion()
                            ).append(". ");
                        }

                        if (pub.getTipo() != null) {
                            text.append(
                                    "Tipo: "
                            ).append(
                                    pub.getTipo()
                            ).append(". ");
                        }
                    });
        }

        return text.toString().trim();
    }

    /**
     * Similitud coseno entre dos embeddings.
     *
     * 1.0  = muy similares
     * 0.0  = sin similitud
     * -1.0 = opuestos
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

            Double valueA = vectorA.get(i);
            Double valueB = vectorB.get(i);

            if (valueA == null || valueB == null) {
                continue;
            }

            double a = valueA;
            double b = valueB;

            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct /
                (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Evita que valores null terminen dentro del prompt.
     */
    private String safe(String value) {

        return value == null || value.isBlank()
                ? "No especificado"
                : value;
    }

    /**
     * Resultado interno de la búsqueda semántica.
     */
    private record SemanticStoreResult(
            Store store,
            List<Publication> publications,
            double similarity) {
    }
}