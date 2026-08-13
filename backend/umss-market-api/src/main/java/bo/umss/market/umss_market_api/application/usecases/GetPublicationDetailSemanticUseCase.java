package bo.umss.market.umss_market_api.application.usecases;

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

    public String executeWithContext(UUID publicationId, String question) {
        
        Publication pub = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new RuntimeException("Publicación no encontrada"));
        
        Store store = storeRepository.findById(pub.getStoreId())
                .orElseThrow(() -> new RuntimeException("Tienda no encontrada"));
        
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

    public String executeSemanticSearch(String query) {
        List<Double> queryEmbedding = aiProvider.generateEmbedding(query);
        
        if (queryEmbedding.isEmpty()) {
            return "No pude generar el embedding de tu consulta.";
        }
        
        List<Publication> publications = publicationRepository.findAll();
        
        List<Publication> relevant = publications.stream()
            .filter(p -> p.getEmbedding() != null)
            .limit(1)
            .toList();
        
        if (relevant.isEmpty()) {
            return "No encontré publicaciones con esa descripción.";
        }
        
        Publication pub = relevant.get(0);
        Store store = storeRepository.findById(pub.getStoreId())
                .orElseThrow();
        
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