package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.domain.model.Interaction;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.InteractionRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetRecommendationsUseCase {

    private final InteractionRepositoryPort interactionRepository;
    private final PublicationRepositoryPort publicationRepository;
    private final StoreRepositoryPort storeRepository;
    private final AIProviderPort aiProvider;

    public String getRecommendations(UUID userId, String userQuery) {
        
        List<Interaction> userInteractions = 
            interactionRepository.findRecentByUserId(userId, 30);
        
        List<UUID> interactedPublications = userInteractions.stream()
            .map(Interaction::getPublicationId)
            .toList();
        
        List<Publication> viewed = publicationRepository.findAll()
            .stream()
            .filter(p -> interactedPublications.contains(p.getId()))
            .toList();
        
        double avgPrice = viewed.stream()
            .mapToDouble(p -> p.getPrecio().doubleValue())
            .average()
            .orElse(100);
        
        String userProfile = String.format("""
            Perfil del usuario:
            - Ha interactuado con %d productos
            - Precio promedio de interés: Bs. %.2f
            - Intereses recientes: %s
            """,
            viewed.size(),
            avgPrice,
            extractRecentInterests(viewed)
        );
        
        List<Double> queryEmbedding = aiProvider.generateEmbedding(userQuery);
        
        List<Publication> recommendations = publicationRepository.findAll()
            .stream()
            .filter(p -> !interactedPublications.contains(p.getId()))
            .limit(10)
            .toList();
        
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
    
    private String extractRecentInterests(List<Publication> publications) {
        return publications.stream()
            .map(Publication::getNombre)
            .limit(3)
            .reduce((a, b) -> a + ", " + b)
            .orElse("varios productos");
    }
}