@Service
@RequiredArgsConstructor
public class GetPublicationDetailSemanticUseCase {

    private final PublicationRepositoryPort publicationRepository;
    private final StoreRepositoryPort storeRepository;
    private final AIProviderPort aiProvider;

    /**
     * Obtiene detalles de una publicación y genera
     * un contexto enriquecido para responder preguntas.
     * 
     * Ejemplo:
     * "¿Cuáles son las características de la laptop?"
     * → Encuentra la publicación
     * → Crea contexto con nombre, descripción, precio, stock
     * → LLM genera respuesta en lenguaje natural
     */
    public String executeWithContext(UUID publicationId, String question) {
        
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new PublicationNotFoundException(
                        "Publicación no encontrada"));
        
        Store store = storeRepository.findById(pub.getStoreId())
                .orElseThrow();
        
        // Construir contexto enriquecido
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
    
    /**
     * Búsqueda semántica de publicaciones por descripción
     * (cuando no sabemos el ID exacto)
     */
    public String executeSemanticSearch(String query) {
        // Similar a SearchCatalogUseCase pero enfocado en descripciones
        List<Double> queryEmbedding = aiProvider.generateEmbedding(query);
        
        // Buscar publicaciones y calcular similitud con descripciones
        List<Publication> publications = publicationRepository.findAll();
        
        List<Publication> relevant = publications.stream()
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
            .limit(1)
            .toList();
        
        if (relevant.isEmpty()) {
            return "No encontré publicaciones con esa descripción.";
        }
        
        Publication pub = relevant.get(0);
        Store store = storeRepository.findById(pub.getStoreId()).orElseThrow();
        
        String contexto = String.format("""
            Encontré: %s
            Precio: Bs. %s
            Stock: %d unidades
            Tienda: %s
            Descripción: %s
            """,
            pub.getNombre(),
            pub.getPrecio(),
            pub.getStock(),
            store.getNombre(),
            pub.getDescripcion()
        );
        
        String prompt = """
            El usuario preguntó: "%s"
            
            Encontré esta publicación que podría interesar:
            %s
            
            Describe esta publicación de forma atractiva y útil.
            """.formatted(query, contexto);
        
        return aiProvider.generate(prompt);
    }
}