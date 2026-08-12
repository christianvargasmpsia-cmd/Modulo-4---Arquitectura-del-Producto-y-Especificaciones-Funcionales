@Service
@RequiredArgsConstructor
public class GetUserInteractionsSemanticUseCase {

    private final InteractionRepositoryPort interactionRepository;
    private final PublicationRepositoryPort publicationRepository;
    private final AIProviderPort aiProvider;

    /**
     * Consulta el historial de interacciones del usuario
     * 
     * Ejemplo: "¿Qué productos me interesaron?"
     * → Busca interacciones del usuario (VIEW, FAVORITE)
     * → Obtiene los productos asociados
     * → LLM resume el patrón de intereses
     */
    public String executeUserHistory(UUID userId, String question) {
        
        // Obtener últimas 20 interacciones
        List<Interaction> interactions = 
            interactionRepository.findRecentByUserId(userId, 20);
        
        if (interactions.isEmpty()) {
            return "No tienes historial de interacciones aún.";
        }
        
        // Enriquecer con detalles de publicaciones
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