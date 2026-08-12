@Service
@RequiredArgsConstructor
public class SearchStoresBySemanticUseCase {

    private final StoreRepositoryPort storeRepository;
    private final PublicationRepositoryPort publicationRepository;
    private final AIProviderPort aiProvider;

    /**
     * Busca tiendas por consultas semánticas.
     * 
     * Ejemplo: "Busco una tienda que venda computadoras"
     * → Genera embedding de la consulta
     * → Compara con descripciones de tiendas
     * → Retorna tiendas + sus productos
     * → LLM genera respuesta
     */
    public String executeSemanticSearch(String query) {
        
        List<Double> queryEmbedding = aiProvider.generateEmbedding(query);
        
        List<Store> stores = storeRepository.findAll();
        
        // Buscar tienda más similar (simplificado)
        // En producción, almacenarías embeddings de tiendas también
        List<Store> relevantStores = stores.stream()
            .limit(3)  // Top 3 tiendas para contexto
            .toList();
        
        // Construir contexto con tiendas + publicaciones
        StringBuilder contexto = new StringBuilder();
        contexto.append("Tiendas disponibles:\n\n");
        
        for (Store store : relevantStores) {
            contexto.append(String.format("""
                🏪 %s
                Descripción: %s
                Categoría: %s
                Contacto: %s
                
                Productos:
                """,
                store.getNombre(),
                store.getDescripcion(),
                store.getCategoria(),
                store.getEmailContacto()
            ));
            
            // Listar primeros 5 productos de la tienda
            CatalogFilter filter = CatalogFilter.builder()
                .storeId(store.getId())
                .build();
            
            publicationRepository.findByFilters(filter)
                .stream()
                .limit(5)
                .forEach(pub -> contexto.append(String.format(
                    "  • %s (Bs. %s) - %d en stock\n",
                    pub.getNombre(),
                    pub.getPrecio(),
                    pub.getStock()
                )));
            
            contexto.append("\n");
        }
        
        String prompt = """
            Eres asistente de UMSS Market.
            
            El usuario preguntó: "%s"
            
            Aquí están las tiendas disponibles:
            
            %s
            
            Recomienda la tienda que mejor se ajuste a lo que busca.
            Sé amable y destacar los productos relevantes.
            """.formatted(query, contexto);
        
        return aiProvider.generate(prompt);
    }
}