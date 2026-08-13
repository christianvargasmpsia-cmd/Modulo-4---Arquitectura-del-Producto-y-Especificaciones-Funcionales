package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
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

    public String executeSemanticSearch(String query) {
        
        List<Double> queryEmbedding = aiProvider.generateEmbedding(query);
        
        if (queryEmbedding.isEmpty()) {
            return "No pude procesar tu consulta.";
        }
        
        List<Store> stores = storeRepository.findAll();
        
        List<Store> relevantStores = stores.stream()
            .limit(3)
            .toList();
        
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
            Sé amable y destaca los productos relevantes.
            """.formatted(query, contexto);
        
        return aiProvider.generate(prompt);
    }
}