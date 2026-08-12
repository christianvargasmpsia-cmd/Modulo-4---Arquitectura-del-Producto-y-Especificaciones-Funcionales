@Service
@RequiredArgsConstructor
public class GetRecommendationsUseCase {

    private final InteractionRepositoryPort interactionRepository;
    private final PublicationRepositoryPort publicationRepository;
    private final StoreRepositoryPort storeRepository;
    private final AIProviderPort aiProvider;

    /**
     * Genera recomendaciones personalizadas.
     * 
     * Combina:
     * 1. Historial de interacciones del usuario
     * 2. Preferencias inferidas
     * 3. Productos similares
     * 4. Tiendas relevantes
     * 
     * Ejemplo: "¿Qué me recomiendas para estudiar programación?"
     * → Busca interacciones relacionadas con programación
     * → Identifica patrones de precio, tiendas favoritas
     * → Busca productos similares a lo que vio antes
     * → LLM genera recomendación personalizada
     */
    public String getRecommendations(UUID userId, String userQuery) {
        
        // 1. Obtener historial de usuario
        List<Interaction> userInteractions = 
            interactionRepository.findRecentByUserId(userId, 30);
        
        // 2. Extraer publicaciones que vio/favoritó
        List<UUID> interactedPublications = userInteractions.stream()
            .map(Interaction::getPublicationId)
            .toList();
        
        List<Publication> viewed = publicationRepository.findAll()
            .stream()
            .filter(p -> interactedPublications.contains(p.getId()))
            .toList();
        
        // 3. Calcular preferencias: precio promedio, categorías
        double avgPrice = viewed.stream()
            .mapToDouble(p -> p.getPrecio().doubleValue())
            .average()
            .orElse(100);
        
        // 4. Obtener contexto de todas las tiendas
        List<Store> allStores = storeRepository.findAll();
        
        // 5. Construir perfil del usuario y contexto de recomendación
        String userProfile = String.format("""
            Perfil del usuario:
            - Ha interactuado con %d productos
            - Precio promedio de interés: Bs. %.2f
            - Tipos de productos: %s
            - Intereses recientes: %s
            """,
            viewed.size(),
            avgPrice,
            extractCategories(viewed),
            extractRecentInterests(viewed)
        );
        
        // 6. Buscar publicaciones similares usando embeddings
        List<Double> queryEmbedding = aiProvider.generateEmbedding(userQuery);
        
        List<Publication> recommendations = publicationRepository.findAll()
            .stream()
            .filter(p -> !interactedPublications.contains(p.getId()))
            .filter(p -> p.getEmbedding() != null)
            .sorted((p1, p2) -> {
                Double sim1 = cosineSimilarity(
                    queryEmbedding,
                    parseEmbedding(p1.getEmbedding())
                );
                Double sim2 = cosineSimilarity(
                    queryEmbedding,
                    parseEmbedding(p2.getEmbedding())
                );
                return sim2.compareTo(sim1);
            })
            .limit(10)
            .toList();
        
        // 7. Construir contexto de recomendaciones
        StringBuilder recomendations = new StringBuilder();
        recomendations.append("Productos recomendados:\n\n");
        
        for (Publication pub : recommendations) {
            Store store = storeRepository.findById(pub.getStoreId())
                .orElse(null);
            
            recomendations.append(String.format("""
                • %s
                  Precio: Bs. %s | Stock: %d
                  Tienda: %s
                  Descripción: %s
                
                """,
                pub.getNombre(),
                pub.getPrecio(),
                pub.getStock(),
                store != null ? store.getNombre() : "Desconocida",
                pub.getDescripcion()
            ));
        }
        
        // 8. Prompt final que combina todo
        String prompt = """
            Eres un asistente de recomendaciones en UMSS Market.
            
            %s
            
            El usuario preguntó: "%s"
            
            Aquí están los productos recomendados según su perfil:
            
            %s
            
            Genera una recomendación personalizada y convincente.
            Explica por qué estos productos podrían interesarle.
            Destaca las mejores opciones (máximo 3).
            """.formatted(userProfile, userQuery, recomendations);
        
        return aiProvider.generate(prompt);
    }
    
    private String extractCategories(List<Publication> publications) {
        return publications.stream()
            .map(p -> p.getTipo().toString())
            .distinct()
            .limit(3)
            .reduce((a, b) -> a + ", " + b)
            .orElse("varias");
    }
    
    private String extractRecentInterests(List<Publication> publications) {
        return publications.stream()
            .map(Publication::getNombre)
            .limit(3)
            .reduce((a, b) -> a + ", " + b)
            .orElse("varios productos");
    }
}