public interface InteractionRepositoryPort {
    
    /**
     * Guarda una nueva interacción
     */
    Interaction save(Interaction interaction);
    
    /**
     * Obtiene las interacciones de un usuario
     */
    List<Interaction> findByUserId(UUID userId);
    
    /**
     * Obtiene interacciones recientes de un usuario
     */
    List<Interaction> findRecentByUserId(UUID userId, int limit);
    
    /**
     * Obtiene qué publicaciones vio/interactuó un usuario
     */
    List<Interaction> findByUserIdAndType(UUID userId, InteractionType type);
}