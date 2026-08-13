package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.domain.model.Interaction;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.InteractionRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetUserInteractionsSemanticUseCase {

    private final InteractionRepositoryPort interactionRepository;
    private final PublicationRepositoryPort publicationRepository;
    private final AIProviderPort aiProvider;

    public String executeUserHistory(UUID userId, String question) {
        
        List<Interaction> interactions = 
            interactionRepository.findRecentByUserId(userId, 20);
        
        if (interactions.isEmpty()) {
            return "No tienes historial de interacciones aún.";
        }
        
        StringBuilder historial = new StringBuilder();
        historial.append("Historial de interacciones:\n\n");
        
        for (Interaction interaction : interactions) {
            Publication pub = publicationRepository
                .findById(interaction.getPublicationId())
                .orElse(null);
            
            if (pub != null) {
                historial.append(String.format("""
                    • %s [%s]
                      Precio: Bs. %s
                      Fecha: %s
                    
                    """,
                    pub.getNombre(),
                    interaction.getType(),
                    pub.getPrecio(),
                    interaction.getCreatedAt()
                ));
            }
        }
        
        String prompt = """
            Eres asistente de UMSS Market.
            
            Aquí está el historial de interacciones del usuario:
            
            %s
            
            El usuario preguntó: "%s"
            
            Basándote en sus interacciones previas,
            responde de forma útil y conversacional.
            """.formatted(historial, question);
        
        return aiProvider.generate(prompt);
    }
}